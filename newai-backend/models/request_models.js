import { z } from "zod";

export const MatchRequestSchema = z.object({
  resume_text: z.string().trim().min(1, { message: "Resume text is required" }),

  jd_text: z.string().trim().min(1, { message: "Job description is required" }),
});
