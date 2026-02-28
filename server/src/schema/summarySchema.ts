import { z } from "zod";

export const SummarySchema = z.object({
  summary: z.object({
    bullets: z.array(z.string().max(140)).length(3),
    post: z.string().max(220),
    analogy: z.string().max(240),
  }),
  signal: z.object({
    confidence: z.enum(["high", "medium", "low"]),
    caveat: z.string().max(160).optional()
  }),
  meta: z.object({
    topicsUsed: z.array(z.string()),
    missingRatings: z.array(z.string())
  })
});

export type Summary = z.infer<typeof SummarySchema>;