import { z } from "zod";

export const submitAttemptSchema = z.object({
  body: z.object({
    kind: z.enum(["LIVE_CODING", "DSA_CONTEST", "SYSTEM_DESIGN", "BEHAVIORAL"]),
    title: z.string().min(2).max(160),
    topic: z.string().min(2).max(80),
    score: z.number().int().min(0).max(100),
    durationMinutes: z.number().int().min(1).max(240),
    status: z.enum(["PASSED", "NEEDS_REVIEW", "FAILED"]),
    feedbackSummary: z.string().max(500).optional(),
    problemsSolved: z.number().int().min(0).max(100).optional(),
    skillKeys: z.array(z.string().max(80)).max(8).optional(),
    timeToFirstApproachSec: z.number().int().min(0).max(7200).optional(),
    hintCount: z.number().int().min(0).max(25).optional(),
    retryCount: z.number().int().min(0).max(25).optional(),
    confidence: z.number().int().min(0).max(100).optional(),
    communicationScore: z.number().int().min(0).max(100).optional(),
    pressureScore: z.number().int().min(0).max(100).optional()
  })
});
