import { describe, expect, it } from "vitest";
import { onboardingSchema } from "./onboarding.validator.js";

describe("onboarding validator", () => {
  it("accepts all visible onboarding choices", () => {
    const result = onboardingSchema.safeParse({
      body: {
        targetCompanies: ["Google", "Microsoft", "Amazon", "Uber", "Atlassian", "Flipkart", "Meta", "Netflix", "Startups"],
        experienceLevel: "Intermediate",
        preferredRole: "Full Stack",
        confidenceLevel: 50,
        strongestTopics: [
          "Arrays",
          "Sliding Window",
          "Two Pointers",
          "Graphs",
          "Dynamic Programming",
          "Trees",
          "System Design",
          "OOP",
          "Caching",
          "Databases",
          "Communication",
          "Time Management"
        ],
        weakestTopics: ["Dynamic Programming", "System Design", "Communication"],
        dailyPrepTime: "1 hour",
        learningStyle: "Interview simulation",
        targetTimeline: "3 months",
        diagnostic: {
          codingScore: 55,
          communicationScore: 55,
          systemDesignScore: 50,
          notes: ""
        }
      }
    });

    expect(result.success).toBe(true);
  });
});
