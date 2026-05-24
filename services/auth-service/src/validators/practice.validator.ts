import { z } from "zod";

export const submitAttemptSchema = z.object({
  body: z.object({
    kind: z.enum(["LIVE_CODING", "DSA_CONTEST", "SYSTEM_DESIGN", "BEHAVIORAL"]),
    questionId: z.string().min(1).max(120).optional(),
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

const jsonArray = z.array(z.unknown()).default([]);

const questionBodySchema = z.object({
  slug: z.string().min(3).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase words separated by hyphens"),
  type: z.enum(["DSA", "FRONTEND", "BACKEND", "SYSTEM_DESIGN", "BEHAVIORAL"]),
  topic: z.string().min(2).max(80),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  company: z.string().max(80).optional().nullable(),
  companyTags: z.array(z.enum(["STARTUP", "BIG_TECH", "PRODUCT_BASED", "MNC", "SERVICE_BASED"])).max(8).default([]),
  heading: z.string().min(4).max(180),
  description: z.string().min(10).max(6000),
  acceptanceText: z.string().max(6000).optional().nullable(),
  starterCode: z.string().max(8000).optional().nullable(),
  testCases: z.array(z.object({
    input: z.array(z.number()),
    expected: z.union([z.number(), z.string(), z.boolean(), z.array(z.unknown()), z.record(z.string(), z.unknown())])
  })).max(30).default([]),
  examples: jsonArray,
  constraints: jsonArray,
  skillKeys: z.array(z.string().max(80)).max(12).default([]),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).default("DRAFT")
});

export const questionInputSchema = z.object({ body: questionBodySchema });
export const questionUpdateSchema = z.object({ body: questionBodySchema.partial() });
