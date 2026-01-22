import type { Handler } from "@netlify/functions";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { snippets } from "../../shared/schema";
import AdmZip from "adm-zip";
import OpenAI from "openai";
import { v4 as uuidv4 } from "uuid";

const { Pool } = pg;

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: "Method not allowed" }),
    };
  }

  try {
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "No file uploaded" }),
      };
    }

    // Parse multipart form data
    const boundary = event.headers["content-type"]?.split("boundary=")[1];
    if (!boundary) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Invalid multipart data" }),
      };
    }

    // Extract file data from base64
    const buffer = Buffer.from(event.body, event.isBase64Encoded ? "base64" : "utf8");

    // Simple multipart parsing to extract the file
    const parts = buffer.toString("binary").split(`--${boundary}`);
    let fileBuffer: Buffer | null = null;

    for (const part of parts) {
      if (part.includes('filename=')) {
        const dataStart = part.indexOf('\r\n\r\n') + 4;
        const dataEnd = part.lastIndexOf('\r\n');
        if (dataStart > 3 && dataEnd > dataStart) {
          fileBuffer = Buffer.from(part.substring(dataStart, dataEnd), "binary");
          break;
        }
      }
    }

    if (!fileBuffer) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Could not extract file from upload" }),
      };
    }

    const zip = new AdmZip(fileBuffer);
    const zipEntries = zip.getEntries();
    const batchId = uuidv4();
    const results = [];

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(pool, { schema: { snippets } });

    for (const entry of zipEntries) {
      if (!entry.isDirectory && entry.entryName.endsWith(".lua")) {
        const originalCode = entry.getData().toString("utf8");

        const response = await openai.chat.completions.create({
          model: "gpt-5.1",
          messages: [
            {
              role: "system",
              content: "You are an expert Lua deobfuscator. Clean the provided code. Output ONLY the code."
            },
            { role: "user", content: originalCode }
          ],
        });

        const cleanedCode = response.choices[0]?.message?.content || "-- Failed";

        await db.insert(snippets).values({
          originalCode,
          cleanedCode,
          filename: entry.entryName,
          batchId
        });

        results.push({ filename: entry.entryName, cleanedCode });
      }
    }

    await pool.end();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ batchId, results }),
    };
  } catch (err) {
    console.error("Zip processing error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to process zip" }),
    };
  }
};
