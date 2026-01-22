import type { Handler } from "@netlify/functions";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { snippets } from "../../shared/schema";
import { desc } from "drizzle-orm";

const { Pool } = pg;

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: "Method not allowed" }),
    };
  }

  try {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(pool, { schema: { snippets } });

    const allSnippets = await db
      .select()
      .from(snippets)
      .orderBy(desc(snippets.createdAt));

    await pool.end();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(allSnippets),
    };
  } catch (err) {
    console.error("Error fetching history:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to fetch history" }),
    };
  }
};
