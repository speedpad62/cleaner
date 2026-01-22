import { snippets, type InsertSnippet, type Snippet } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  createSnippet(snippet: InsertSnippet): Promise<Snippet>;
  getSnippets(): Promise<Snippet[]>;
  getSnippet(id: number): Promise<Snippet | undefined>;
}

export class DatabaseStorage implements IStorage {
  async createSnippet(insertSnippet: InsertSnippet): Promise<Snippet> {
    const [snippet] = await db
      .insert(snippets)
      .values(insertSnippet)
      .returning();
    return snippet;
  }

  async getSnippets(): Promise<Snippet[]> {
    return await db
      .select()
      .from(snippets)
      .orderBy(desc(snippets.createdAt));
  }

  async getSnippet(id: number): Promise<Snippet | undefined> {
    const [snippet] = await db
      .select()
      .from(snippets)
      .where(eq(snippets.id, id));
    return snippet;
  }
}

export const storage = new DatabaseStorage();
