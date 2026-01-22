import { z } from "zod";
import { insertSnippetSchema, snippets, cleanCodeRequestSchema } from "./schema";

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  snippets: {
    clean: {
      method: "POST" as const,
      path: "/api/clean",
      input: cleanCodeRequestSchema,
      responses: {
        200: z.object({
          cleanedCode: z.string(),
          snippetId: z.number().optional()
        }),
        400: errorSchemas.validation,
        500: errorSchemas.internal,
      },
    },
    uploadZip: {
      method: "POST" as const,
      path: "/api/upload-zip",
      responses: {
        200: z.object({
          batchId: z.string(),
          results: z.array(z.object({
            filename: z.string(),
            cleanedCode: z.string(),
          }))
        }),
        400: errorSchemas.validation,
        500: errorSchemas.internal,
      }
    },
    list: {
      method: "GET" as const,
      path: "/api/history",
      responses: {
        200: z.array(z.custom<typeof snippets.$inferSelect>()),
      },
    },
    get: {
      method: "GET" as const,
      path: "/api/history/:id",
      responses: {
        200: z.custom<typeof snippets.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
