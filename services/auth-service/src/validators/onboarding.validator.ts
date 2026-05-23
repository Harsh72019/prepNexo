import { z } from "zod";

export const onboardingSchema = z.object({
  body: z.object({
    targetCompanies: z.array(z.string().min(2).max(40)).min(1).max(12),
    experienceLevel: z.enum(["Beginner", "Intermediate", "Advanced", "Working professional"]),
    preferredRole: z.enum(["Backend", "Frontend", "Full Stack", "SDE-1", "SDE-2", "System Design focused"]),
    confidenceLevel: z.number().int().min(0).max(100),
    strongestTopics: z.array(z.string().min(2).max(40)).max(16),
    weakestTopics: z.array(z.string().min(2).max(40)).min(1).max(16),
    dailyPrepTime: z.enum(["30 mins", "1 hour", "2+ hours"]),
    learningStyle: z.enum(["Competitive", "Guided", "Interview simulation", "Concept-first", "Fast-paced"]),
    targetTimeline: z.enum(["1 month", "3 months", "6 months"]),
    diagnostic: z.object({
      codingScore: z.number().int().min(0).max(100).optional(),
      communicationScore: z.number().int().min(0).max(100).optional(),
      systemDesignScore: z.number().int().min(0).max(100).optional(),
      notes: z.string().max(600).optional()
    }).optional()
  })
});
