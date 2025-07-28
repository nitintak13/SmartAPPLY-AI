import { z } from "zod";

export const MatchResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  score: z.number(),
  advice: z.string(),
  missing_skills: z.array(z.string()),
  resume_suggestions: z.array(z.string()),
  resources: z.array(z.record(z.any())).optional().default([]),
  fit_analysis: z.record(z.any()).optional().default({}),
});
