import type { Handler } from "@netlify/functions";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { snippets } from "../../shared/schema";
import { z } from "zod";
import OpenAI from "openai";

const { Pool } = pg;

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const cleanCodeRequestSchema = z.object({
  code: z.string().min(1, "Code is required"),
});

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: "Method not allowed" }),
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const input = cleanCodeRequestSchema.parse(body);

    const response = await openai.chat.completions.create({
      model: "gpt-5.1",
      messages: [
        {
          role: "system",
          content: `You are an expert Lua deobfuscator for FiveM and QBCore scripts.
          Your task is to rewrite obfuscated Lua code into clean, readable, idiomatic Lua code.

          Specific Instructions:
          - Analyze the variable usage (e.g., L0_1, L1_1) to determine their real purpose.
          - Rename variables to meaningful names (e.g., L0_1 might be QBCore, L1_1 might be RegisterNetEvent).
          - Fix indentation and formatting to standard Lua style.
          - Remove redundant assignments and intermediate variables if they just clutter the code.
          - Restore the logic to how a human developer would write it.
          - If you see QBCore/ESX patterns, use the standard variable names for them (e.g., QBCore, ESX).
          - Output ONLY the cleaned Lua code. Do NOT wrap in markdown code blocks. Do NOT include explanations.`
        },
        {
          role: "user",
          content: input.code
        }
      ],
    });

    const cleanedCode = response.choices[0]?.message?.content || "-- Failed to deobfuscate";

    // Save to database
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(pool, { schema: { snippets } });

    const [snippet] = await db
      .insert(snippets)
      .values({
        originalCode: input.code,
        cleanedCode: cleanedCode,
      })
      .returning();

    await pool.end();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cleanedCode, snippetId: snippet.id }),
    };
  } catch (err) {
    console.error("Deobfuscation error:", err);

    if (err instanceof z.ZodError) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        }),
      };
    }

    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to process code" }),
    };
  }
};
