import type { SubmitAttemptInput } from "@interview-battlefield/types";
import { AttemptKind, AttemptStatus } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { AdaptiveService } from "./adaptive.service.js";
import { codingProblems, designScenarios, dsaProblems } from "./practice-catalog.js";

export class PracticeService {
  private adaptiveService = new AdaptiveService();

  async catalog(userId: string) {
    await this.adaptiveService.ensureSkillGraph(userId);
    const topics = await prisma.topicProgress.findMany({
      where: { userId },
      orderBy: [{ proficiency: "asc" }, { attempts: "desc" }]
    });

    return {
      topics: topics.map((topic) => ({
        topic: topic.topic,
        proficiency: topic.proficiency,
        attempts: topic.attempts,
        targetScore: topic.targetScore,
        gap: Math.max(topic.targetScore - topic.proficiency, 0)
      })),
      codingProblems,
      dsaProblems,
      designScenarios
    };
  }

  async submitAttempt(userId: string, input: SubmitAttemptInput) {
    const completedAt = new Date();
    const attempt = await prisma.interviewAttempt.create({
      data: {
        userId,
        kind: input.kind as AttemptKind,
        title: input.title,
        topic: input.topic,
        score: input.score,
        durationMinutes: input.durationMinutes,
        status: input.status as AttemptStatus,
        feedbackSummary: input.feedbackSummary,
        completedAt
      }
    });

    const existingTopic = await prisma.topicProgress.findUnique({
      where: { userId_topic: { userId, topic: input.topic } }
    });
    const nextAttempts = (existingTopic?.attempts ?? 0) + 1;
    const nextProficiency = Math.round((((existingTopic?.proficiency ?? input.score) * (nextAttempts - 1)) + input.score) / nextAttempts);

    await prisma.topicProgress.upsert({
      where: { userId_topic: { userId, topic: input.topic } },
      create: {
        userId,
        topic: input.topic,
        proficiency: input.score,
        attempts: 1,
        targetScore: 82,
        lastPracticedAt: completedAt
      },
      update: {
        proficiency: nextProficiency,
        attempts: nextAttempts,
        lastPracticedAt: completedAt
      }
    });

    const day = new Date(completedAt.getFullYear(), completedAt.getMonth(), completedAt.getDate());
    await prisma.dailyActivity.upsert({
      where: { userId_date: { userId, date: day } },
      create: {
        userId,
        date: day,
        sessions: 1,
        minutes: input.durationMinutes,
        problemsSolved: input.problemsSolved ?? (input.status === "PASSED" ? 1 : 0)
      },
      update: {
        sessions: { increment: 1 },
        minutes: { increment: input.durationMinutes },
        problemsSolved: { increment: input.problemsSolved ?? (input.status === "PASSED" ? 1 : 0) }
      }
    });

    const recent = await prisma.interviewAttempt.findMany({
      where: { userId },
      orderBy: { completedAt: "desc" },
      take: 8
    });
    const readinessScore = Math.round(recent.reduce((sum, item) => sum + item.score, 0) / Math.max(recent.length, 1));
    await prisma.userProfile.upsert({
      where: { userId },
      create: { userId, readinessScore, currentStreak: 1, bestStreak: 1 },
      update: { readinessScore, currentStreak: { increment: 1 } }
    });

    await this.adaptiveService.recordAttemptSignals(userId, input, attempt);

    return attempt;
  }
}
