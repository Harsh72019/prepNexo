import type { SubmitAttemptInput } from "@interview-battlefield/types";
import { AttemptKind, AttemptStatus, Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { AdaptiveService } from "./adaptive.service.js";
import { codingProblems, designScenarios, dsaProblems } from "./practice-catalog.js";
import { skillKeysForTopic } from "./adaptive-taxonomy.js";

type QuestionInput = {
  slug: string;
  type: string;
  topic: string;
  difficulty: string;
  company?: string | null;
  companyTags?: string[];
  heading: string;
  description: string;
  acceptanceText?: string | null;
  starterCode?: string | null;
  testCases?: unknown[];
  examples?: unknown[];
  constraints?: unknown[];
  skillKeys?: string[];
  status?: string;
};

export class PracticeService {
  private adaptiveService = new AdaptiveService();

  async catalog(userId: string) {
    await this.adaptiveService.ensureSkillGraph(userId);
    const topics = await prisma.topicProgress.findMany({
      where: { userId },
      orderBy: [{ proficiency: "asc" }, { attempts: "desc" }]
    });

    const questions = await prisma.question.findMany({
      where: { status: "ACTIVE" },
      include: { progress: { where: { userId }, take: 1 } },
      orderBy: [{ updatedAt: "desc" }]
    });
    const mappedQuestions = this.adaptiveOrder(questions.map((question) => this.toPracticeProblem(question)), topics);
    const codingQuestionBank = mappedQuestions.filter((question) => question.type !== "SYSTEM_DESIGN" && question.type !== "BEHAVIORAL");
    const dsaQuestionBank = mappedQuestions.filter((question) => question.type === "DSA");

    return {
      topics: topics.map((topic) => ({
        topic: topic.topic,
        proficiency: topic.proficiency,
        attempts: topic.attempts,
        targetScore: topic.targetScore,
        gap: Math.max(topic.targetScore - topic.proficiency, 0)
      })),
      codingProblems: codingQuestionBank.length ? codingQuestionBank : codingProblems,
      dsaProblems: dsaQuestionBank.length ? dsaQuestionBank : dsaProblems,
      designScenarios
    };
  }

  async listQuestions() {
    return prisma.question.findMany({ orderBy: [{ updatedAt: "desc" }] });
  }

  async upsertQuestion(adminId: string, input: QuestionInput) {
    const payload = this.questionCreatePayload(input, adminId);
    return prisma.question.upsert({
      where: { slug: input.slug },
      create: payload,
      update: this.questionUpdatePayload(input)
    });
  }

  async updateQuestion(id: string, input: Partial<QuestionInput>) {
    return prisma.question.update({
      where: { id },
      data: this.questionUpdatePayload(input)
    });
  }

  async submitAttempt(userId: string, input: SubmitAttemptInput) {
    const completedAt = new Date();
    const attempt = await prisma.interviewAttempt.create({
      data: {
        userId,
        questionId: input.questionId,
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
    if (input.questionId) {
      await this.recordQuestionProgress(userId, input.questionId, input.score, input.status, completedAt);
    }

    return attempt;
  }

  private toPracticeProblem(question: Awaited<ReturnType<typeof prisma.question.findMany>>[number] & { progress?: Array<{ solvedCount: number; lastAttemptAt: Date | null; nextReviewAt: Date | null }> }) {
    const progress = question.progress?.[0];
    const dueForReview = progress?.nextReviewAt ? progress.nextReviewAt <= new Date() : false;
    return {
      id: question.id,
      slug: question.slug,
      type: question.type as "DSA" | "FRONTEND" | "BACKEND" | "SYSTEM_DESIGN" | "BEHAVIORAL",
      title: question.heading,
      topic: question.topic,
      difficulty: question.difficulty as "EASY" | "MEDIUM" | "HARD",
      company: question.company,
      companyTags: Array.isArray(question.companyTags) ? question.companyTags as Array<"STARTUP" | "BIG_TECH" | "PRODUCT_BASED" | "MNC" | "SERVICE_BASED"> : [],
      prompt: question.description,
      acceptanceText: question.acceptanceText,
      starterCode: question.starterCode ?? "export function solve(nums: number[]) {\n  return nums.length;\n}",
      testCases: Array.isArray(question.testCases) ? question.testCases as Array<{ input: number[]; expected: number }> : [],
      examples: Array.isArray(question.examples) ? question.examples as unknown[] : [],
      skillKeys: Array.isArray(question.skillKeys) ? question.skillKeys as string[] : skillKeysForTopic(question.topic),
      solvedCount: progress?.solvedCount ?? 0,
      lastSolvedAt: progress?.lastAttemptAt?.toISOString() ?? null,
      nextReviewAt: progress?.nextReviewAt?.toISOString() ?? null,
      recommendedReason: dueForReview ? "Due for revision" : progress?.solvedCount ? "Previously solved" : "New adaptive question"
    };
  }

  private adaptiveOrder<T extends { topic: string; solvedCount?: number; nextReviewAt?: string | null }>(questions: T[], topics: Array<{ topic: string; proficiency: number; targetScore: number }>) {
    const weakTopics = new Map(topics.map((topic) => [topic.topic.toLowerCase(), Math.max(topic.targetScore - topic.proficiency, 0)]));
    const now = Date.now();
    return [...questions].sort((a, b) => {
      const aReview = a.nextReviewAt ? new Date(a.nextReviewAt).getTime() <= now : false;
      const bReview = b.nextReviewAt ? new Date(b.nextReviewAt).getTime() <= now : false;
      const aScore = (aReview ? 100 : 0) + (weakTopics.get(a.topic.toLowerCase()) ?? 0) - (a.solvedCount ?? 0) * 8;
      const bScore = (bReview ? 100 : 0) + (weakTopics.get(b.topic.toLowerCase()) ?? 0) - (b.solvedCount ?? 0) * 8;
      return bScore - aScore;
    });
  }

  private questionCreatePayload(input: QuestionInput, adminId: string): Prisma.QuestionCreateInput {
    return {
      slug: input.slug,
      type: input.type,
      topic: input.topic,
      difficulty: input.difficulty,
      heading: input.heading,
      description: input.description,
      acceptanceText: input.acceptanceText,
      starterCode: input.starterCode,
      status: input.status ?? "DRAFT",
      company: input.company || null,
      companyTags: (input.companyTags ?? []) as Prisma.InputJsonValue,
      testCases: (input.testCases ?? []) as Prisma.InputJsonValue,
      examples: (input.examples ?? []) as Prisma.InputJsonValue,
      constraints: (input.constraints ?? []) as Prisma.InputJsonValue,
      skillKeys: (input.skillKeys ?? skillKeysForTopic(input.topic)) as Prisma.InputJsonValue,
      createdById: adminId
    };
  }

  private questionUpdatePayload(input: Partial<QuestionInput>): Prisma.QuestionUpdateInput {
    const data: Prisma.QuestionUpdateInput = {};
    if (input.slug !== undefined) data.slug = input.slug;
    if (input.type !== undefined) data.type = input.type;
    if (input.topic !== undefined) data.topic = input.topic;
    if (input.difficulty !== undefined) data.difficulty = input.difficulty;
    if (input.heading !== undefined) data.heading = input.heading;
    if (input.description !== undefined) data.description = input.description;
    if (input.acceptanceText !== undefined) data.acceptanceText = input.acceptanceText;
    if (input.starterCode !== undefined) data.starterCode = input.starterCode;
    if (input.status !== undefined) data.status = input.status;
    if (input.company !== undefined) data.company = input.company || null;
    if (input.companyTags !== undefined) data.companyTags = input.companyTags as Prisma.InputJsonValue;
    if (input.testCases !== undefined) data.testCases = input.testCases as Prisma.InputJsonValue;
    if (input.examples !== undefined) data.examples = input.examples as Prisma.InputJsonValue;
    if (input.constraints !== undefined) data.constraints = input.constraints as Prisma.InputJsonValue;
    if (input.skillKeys !== undefined) data.skillKeys = input.skillKeys as Prisma.InputJsonValue;
    return data;
  }

  private async recordQuestionProgress(userId: string, questionId: string, score: number, status: SubmitAttemptInput["status"], completedAt: Date) {
    const solved = status === "PASSED";
    const nextReviewAt = new Date(completedAt);
    nextReviewAt.setDate(nextReviewAt.getDate() + (solved ? 7 : 2));
    const existing = await prisma.userQuestionProgress.findUnique({ where: { userId_questionId: { userId, questionId } } });
    await prisma.userQuestionProgress.upsert({
      where: { userId_questionId: { userId, questionId } },
      create: {
        userId,
        questionId,
        attempts: 1,
        solvedCount: solved ? 1 : 0,
        bestScore: score,
        lastStatus: status,
        lastAttemptAt: completedAt,
        nextReviewAt
      },
      update: {
        attempts: { increment: 1 },
        solvedCount: solved ? { increment: 1 } : undefined,
        bestScore: Math.max(existing?.bestScore ?? 0, score),
        lastStatus: status,
        lastAttemptAt: completedAt,
        nextReviewAt
      }
    });
  }
}
