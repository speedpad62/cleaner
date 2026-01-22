import type { Handler } from "@netlify/functions";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { snippets } from "../../shared/schema";
import { eq } from "drizzle-orm";

const { Pool } = pg;

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: "Method not allowed" }),
    };
  }

  try {
    const id = event.path.split("/").pop();
    if (!id || isNaN(Number(id))) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Invalid snippet ID" }),
      };
    }

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(pool, { schema: { snippets } });

    const [snippet] = await db
      .select()
      .from(snippets)
      .where(eq(snippets.id, Number(id)));

    await pool.end();

    if (!snippet) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Snippet not found" }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(snippet),
    };
  } catch (err) {
    console.error("Error fetching snippet:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to fetch snippet" }),
    };
  }
};
