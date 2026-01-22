import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import OpenAI from "openai";
import multer from "multer";
import AdmZip from "adm-zip";
import { v4 as uuidv4 } from "uuid";

const upload = multer({ storage: multer.memoryStorage() });

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.post(api.snippets.clean.path, async (req, res) => {
    try {
      const input = api.snippets.clean.input.parse(req.body);
      
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

      // Save to history
      const snippet = await storage.createSnippet({
        originalCode: input.code,
        cleanedCode: cleanedCode,
      });

      res.json({ cleanedCode, snippetId: snippet.id });

    } catch (err) {
      console.error("Deobfuscation error:", err);
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Failed to process code" });
    }
  });

  app.get(api.snippets.list.path, async (req, res) => {
    try {
      const snippets = await storage.getSnippets();
      res.json(snippets);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch history" });
    }
  });

  app.get(api.snippets.get.path, async (req, res) => {
    try {
      const snippet = await storage.getSnippet(Number(req.params.id));
      if (!snippet) {
        return res.status(404).json({ message: "Snippet not found" });
      }
      res.json(snippet);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch snippet" });
    }
  });

  app.post("/api/upload-zip", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const zip = new AdmZip(req.file.buffer);
      const zipEntries = zip.getEntries();
      const batchId = uuidv4();
      const results = [];

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
          
          await storage.createSnippet({
            originalCode,
            cleanedCode,
            filename: entry.entryName,
            batchId
          });

          results.push({ filename: entry.entryName, cleanedCode });
        }
      }

      res.json({ batchId, results });
    } catch (err) {
      console.error("Zip processing error:", err);
      res.status(500).json({ message: "Failed to process zip" });
    }
  });

  return httpServer;
}
