import { z } from "zod";

export const arenaSubmitSchema = z.object({
  body: z.object({
    mode: z.enum(["ranked", "practice"]),
    score: z.number().int().min(0).max(10000),
    solved: z.number().int().min(0).max(3),
    penalty: z.number().int().min(0).max(10000)
  })
});
