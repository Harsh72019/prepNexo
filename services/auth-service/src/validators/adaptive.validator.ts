import { z } from "zod";

export const pressurePromptSchema = z.object({
  body: z.object({
    sessionId: z.string().optional(),
    surface: z.string().max(80).optional(),
    topic: z.string().max(80).optional()
  })
});
