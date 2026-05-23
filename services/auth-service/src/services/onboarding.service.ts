import type { OnboardingInput, OnboardingStatus } from "@interview-battlefield/types";
import { prisma } from "../config/prisma.js";
import { AdaptiveService } from "./adaptive.service.js";
import { skillDefinitions, skillKeysForTopic } from "./adaptive-taxonomy.js";

const adaptive = new AdaptiveService();
const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

export class OnboardingService {
  async status(userId: string): Promise<OnboardingStatus> {
    const profile = await prisma.userProfile.findUnique({ where: { userId } });
    return {
      completed: Boolean(profile?.onboardingCompleted),
      profile: profile ? {
        targetCompanies: Array.isArray(profile.targetCompanies) ? profile.targetCompanies as string[] : [],
        experienceLevel: profile.experienceLevel,
        preferredRole: profile.preferredRole,
        confidenceLevel: profile.confidenceLevel,
        strongestTopics: Array.isArray(profile.strongestTopics) ? profile.strongestTopics as string[] : [],
        weakestTopics: Array.isArray(profile.weakestTopics) ? profile.weakestTopics as string[] : [],
        dailyPrepTime: profile.dailyPrepTime,
        learningStyle: profile.learningStyle,
        targetTimeline: profile.targetTimeline,
        onboardingSummary: profile.onboardingSummary
      } : undefined
    };
  }

  async complete(userId: string, input: OnboardingInput) {
    const targetRole = `${input.preferredRole} interview track`;
    const primaryWeakness = input.weakestTopics[0] ?? "Problem breakdown";
    const primaryCompany = input.targetCompanies[0] ?? "target company";
    const readinessScore = this.initialReadiness(input);
    const summary = `Targeting ${primaryCompany} ${input.preferredRole}. Initial focus: ${input.weakestTopics.slice(0, 3).join(", ")}. Learning style: ${input.learningStyle}.`;

    await prisma.userProfile.upsert({
      where: { userId },
      create: {
        userId,
        headline: `Personalized ${input.targetTimeline} growth plan`,
        targetRole,
        readinessScore,
        onboardingCompleted: true,
        targetCompanies: input.targetCompanies,
        experienceLevel: input.experienceLevel,
        preferredRole: input.preferredRole,
        confidenceLevel: input.confidenceLevel,
        strongestTopics: input.strongestTopics,
        weakestTopics: input.weakestTopics,
        dailyPrepTime: input.dailyPrepTime,
        learningStyle: input.learningStyle,
        targetTimeline: input.targetTimeline,
        onboardingSummary: summary
      },
      update: {
        headline: `Personalized ${input.targetTimeline} growth plan`,
        targetRole,
        readinessScore,
        onboardingCompleted: true,
        targetCompanies: input.targetCompanies,
        experienceLevel: input.experienceLevel,
        preferredRole: input.preferredRole,
        confidenceLevel: input.confidenceLevel,
        strongestTopics: input.strongestTopics,
        weakestTopics: input.weakestTopics,
        dailyPrepTime: input.dailyPrepTime,
        learningStyle: input.learningStyle,
        targetTimeline: input.targetTimeline,
        onboardingSummary: summary
      }
    });

    void this.initializeGrowthPlan(userId, input, summary).catch((error) => {
      console.error("Onboarding growth-plan initialization failed", error);
    });

    return this.status(userId);
  }

  private async initializeGrowthPlan(userId: string, input: OnboardingInput, summary: string) {
    await adaptive.ensureSkillGraph(userId);
    await this.initializeSkillGraph(userId, input);
    await this.createInitialRoadmap(userId, input);
    await this.createInitialCoachMemory(userId, input, summary);
    await prisma.adaptiveSession.deleteMany({ where: { userId, status: "PLANNED" } });
    await adaptive.getOrCreateDailySession(userId);
  }

  private initialReadiness(input: OnboardingInput) {
    const diagnosticScores = [
      input.diagnostic?.codingScore,
      input.diagnostic?.communicationScore,
      input.diagnostic?.systemDesignScore
    ].filter((score): score is number => typeof score === "number");
    const diagnosticAverage = diagnosticScores.length
      ? diagnosticScores.reduce((sum, score) => sum + score, 0) / diagnosticScores.length
      : input.confidenceLevel;
    const experienceBoost = input.experienceLevel === "Advanced" ? 10 : input.experienceLevel === "Working professional" ? 8 : input.experienceLevel === "Intermediate" ? 4 : -4;
    const timelinePressure = input.targetTimeline === "1 month" ? -5 : input.targetTimeline === "6 months" ? 4 : 0;
    return clamp(diagnosticAverage * 0.55 + input.confidenceLevel * 0.35 + experienceBoost + timelinePressure);
  }

  private async initializeSkillGraph(userId: string, input: OnboardingInput) {
    const strongKeys = new Set(input.strongestTopics.flatMap((topic) => skillKeysForTopic(topic)));
    const weakKeys = new Set(input.weakestTopics.flatMap((topic) => skillKeysForTopic(topic)));

    await Promise.all(skillDefinitions.map((skill) => {
      const isStrong = strongKeys.has(skill.key);
      const isWeak = weakKeys.has(skill.key);
      const diagnosticScore =
        skill.domain === "SYSTEM_DESIGN" ? input.diagnostic?.systemDesignScore :
        skill.domain === "SOFT_SKILL" ? input.diagnostic?.communicationScore :
        input.diagnostic?.codingScore;
      const base = diagnosticScore ?? input.confidenceLevel;
      const score = clamp(base + (isStrong ? 16 : 0) - (isWeak ? 18 : 0));
      const confidence = clamp(input.confidenceLevel + (isStrong ? 10 : 0) - (isWeak ? 10 : 0));
      return prisma.skillNode.update({
        where: { userId_key: { userId, key: skill.key } },
        data: {
          score,
          confidence,
          mastery: clamp(score * 0.7 + confidence * 0.3),
          volatility: isWeak ? 76 : isStrong ? 34 : 52,
          weakRecurrence: isWeak ? 2 : 0,
          trend: 0,
          nextReviewAt: isWeak ? new Date() : undefined,
          evidence: {
            source: "onboarding",
            strongestTopics: input.strongestTopics,
            weakestTopics: input.weakestTopics,
            diagnostic: input.diagnostic ?? null
          }
        }
      });
    }));
  }

  private async createInitialRoadmap(userId: string, input: OnboardingInput) {
    await prisma.roadmapItem.deleteMany({ where: { userId } });
    await prisma.roadmapItem.createMany({
      data: [
        {
          userId,
          title: `Repair ${input.weakestTopics[0] ?? "weak pattern"} fundamentals`,
          description: `Start with guided drills because your ${input.learningStyle.toLowerCase()} plan is targeting ${input.targetCompanies.slice(0, 2).join(" + ")}.`,
          topic: input.weakestTopics[0] ?? "Foundations",
          priority: "HIGH"
        },
        {
          userId,
          title: "Run first AI interview simulation",
          description: `Use ${input.preferredRole} mode with ${input.targetCompanies[0] ?? "company"}-style follow-ups and pressure prompts.`,
          topic: "AI Interview Simulator",
          priority: "HIGH"
        },
        {
          userId,
          title: "Communication baseline",
          description: "Record a two-minute approach explanation and let the coach score clarity, structure, and confidence.",
          topic: "Communication clarity",
          priority: "MEDIUM"
        }
      ]
    });
  }

  private async createInitialCoachMemory(userId: string, input: OnboardingInput, summary: string) {
    await prisma.coachMemory.upsert({
      where: { userId_key: { userId, key: "onboarding.profile" } },
      create: {
        userId,
        key: "onboarding.profile",
        summary,
        priority: 95,
        evidence: input
      },
      update: {
        summary,
        priority: 95,
        evidence: input
      }
    });

    for (const topic of input.weakestTopics.slice(0, 4)) {
      await prisma.growthEvent.create({
        data: {
          userId,
          type: "ONBOARDING_WEAK_SIGNAL",
          source: "ONBOARDING",
          skillKey: skillKeysForTopic(topic)[0] ?? null,
          value: -8,
          metadata: { topic, targetCompanies: input.targetCompanies, timeline: input.targetTimeline }
        }
      });
    }
  }
}
