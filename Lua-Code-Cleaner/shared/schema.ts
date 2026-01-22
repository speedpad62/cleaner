import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const snippets = pgTable("snippets", {
  id: serial("id").primaryKey(),
  originalCode: text("original_code").notNull(),
  cleanedCode: text("cleaned_code").notNull(),
  filename: text("filename"),
  batchId: text("batch_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSnippetSchema = createInsertSchema(snippets).omit({ 
  id: true, 
  createdAt: true 
});

export type Snippet = typeof snippets.$inferSelect;
export type InsertSnippet = z.infer<typeof insertSnippetSchema>;

export const cleanCodeRequestSchema = z.object({
  code: z.string().min(1, "Code is required"),
});

export type CleanCodeRequest = z.infer<typeof cleanCodeRequestSchema>;
