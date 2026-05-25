import type {
  CompanyTag,
  DesignScenario,
  PracticeProblem,
  QuestionLibraryResult,
  QuestionType,
  SubmitAttemptInput,
} from "@interview-battlefield/types";
import { AttemptKind, AttemptStatus, Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { AdaptiveService } from "./adaptive.service.js";
import { BillingService } from "./billing.service.js";
import {
  codingProblems,
  designScenarios,
  dsaProblems,
} from "./practice-catalog.js";
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

type CatalogQuestion = Prisma.QuestionGetPayload<{
  include: { progress: { take: 1 } };
}>;

type TopicSignal = {
  topic: string;
  proficiency: number;
  targetScore: number;
};

type PersonalizationContext = {
  weakTopics: Set<string>;
  targetCompanies: Set<string>;
  dueSkillKeys: Set<string>;
  readinessScore: number;
  topics: TopicSignal[];
};

type QuestionLibraryInput = {
  page?: number;
  pageSize?: number;
  q?: string;
  type?: string;
  difficulty?: string;
  topic?: string;
  company?: string;
  companyTag?: string;
  progress?: string;
};

const questionTypes: QuestionType[] = [
  "DSA",
  "FRONTEND",
  "BACKEND",
  "SYSTEM_DESIGN",
  "BEHAVIORAL",
];
const questionDifficulties: Array<PracticeProblem["difficulty"]> = [
  "EASY",
  "MEDIUM",
  "HARD",
];
const questionCompanyTags: CompanyTag[] = [
  "STARTUP",
  "BIG_TECH",
  "PRODUCT_BASED",
  "MNC",
  "SERVICE_BASED",
];

export class PracticeService {
  private adaptiveService = new AdaptiveService();
  private billingService = new BillingService();

  async catalog(userId: string) {
    await this.adaptiveService.ensureSkillGraph(userId);
    const [topics, profile, skillNodes, questions] = await Promise.all([
      prisma.topicProgress.findMany({
        where: { userId },
        orderBy: [{ proficiency: "asc" }, { attempts: "desc" }],
      }),
      prisma.userProfile.findUnique({ where: { userId } }),
      prisma.skillNode.findMany({
        where: { userId },
        orderBy: [{ mastery: "asc" }, { nextReviewAt: "asc" }],
      }),
      prisma.question.findMany({
        where: { status: "ACTIVE" },
        include: { progress: { where: { userId }, take: 1 } },
        orderBy: [{ createdAt: "desc" }, { updatedAt: "desc" }],
      }),
    ]);

    const context = this.buildPersonalizationContext(
      profile,
      topics,
      skillNodes,
    );
    const mappedQuestions = questions.map((question) =>
      this.toPracticeProblem(question),
    );
    const codingQuestionBank = this.personalizePracticeProblems(
      mappedQuestions.filter(
        (question) =>
          question.type !== "SYSTEM_DESIGN" && question.type !== "BEHAVIORAL",
      ),
      context,
      80,
    );
    const dsaQuestionBank = this.personalizePracticeProblems(
      mappedQuestions.filter((question) => question.type === "DSA"),
      context,
      120,
    );
    const systemDesignBank = this.personalizeSystemDesign(
      questions.filter((question) => question.type === "SYSTEM_DESIGN"),
      context,
    );

    return {
      topics: topics.map((topic) => ({
        topic: topic.topic,
        proficiency: topic.proficiency,
        attempts: topic.attempts,
        targetScore: topic.targetScore,
        gap: Math.max(topic.targetScore - topic.proficiency, 0),
      })),
      codingProblems: codingQuestionBank.length
        ? codingQuestionBank
        : codingProblems,
      dsaProblems: dsaQuestionBank.length ? dsaQuestionBank : dsaProblems,
      designScenarios: systemDesignBank.length
        ? systemDesignBank
        : designScenarios,
    };
  }

  async listQuestions() {
    return prisma.question.findMany({ orderBy: [{ updatedAt: "desc" }] });
  }

  async questionLibrary(
    userId: string,
    input: QuestionLibraryInput,
  ): Promise<QuestionLibraryResult> {
    const page = Math.max(Number(input.page) || 1, 1);
    const pageSize = Math.min(Math.max(Number(input.pageSize) || 12, 6), 48);
    const where: Prisma.QuestionWhereInput = { status: "ACTIVE" };
    const query = input.q?.trim();

    if (query) {
      where.OR = [
        { heading: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { topic: { contains: query, mode: "insensitive" } },
        { company: { contains: query, mode: "insensitive" } },
      ];
    }
    if (input.type && questionTypes.includes(input.type as QuestionType)) {
      where.type = input.type;
    }
    if (
      input.difficulty &&
      questionDifficulties.includes(
        input.difficulty as PracticeProblem["difficulty"],
      )
    ) {
      where.difficulty = input.difficulty;
    }
    if (input.topic) {
      where.topic = { equals: input.topic, mode: "insensitive" };
    }
    if (input.company) {
      where.company = { equals: input.company, mode: "insensitive" };
    }
    if (
      input.companyTag &&
      questionCompanyTags.includes(input.companyTag as CompanyTag)
    ) {
      where.companyTags = {
        array_contains: input.companyTag,
      } as Prisma.JsonFilter<"Question">;
    }
    if (input.progress === "unsolved") {
      where.progress = {
        none: {
          userId,
          solvedCount: { gt: 0 },
        },
      };
    }
    if (input.progress === "solved") {
      where.progress = {
        some: {
          userId,
          solvedCount: { gt: 0 },
        },
      };
    }
    if (input.progress === "attempted") {
      where.progress = {
        some: {
          userId,
          attempts: { gt: 0 },
        },
      };
    }

    const [questions, total, filterSource] = await Promise.all([
      prisma.question.findMany({
        where,
        include: { progress: { where: { userId }, take: 1 } },
        orderBy: [{ createdAt: "desc" }, { updatedAt: "desc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.question.count({ where }),
      prisma.question.findMany({
        where: { status: "ACTIVE" },
        select: { topic: true, company: true },
        orderBy: [{ topic: "asc" }, { company: "asc" }],
      }),
    ]);

    return {
      questions: questions.map((question) => this.toPracticeProblem(question)),
      page,
      pageSize,
      total,
      totalPages: Math.max(Math.ceil(total / pageSize), 1),
      filters: {
        types: questionTypes,
        difficulties: questionDifficulties,
        topics: [...new Set(filterSource.map((item) => item.topic))]
          .filter(Boolean)
          .sort((a, b) => a.localeCompare(b)),
        companies: [
          ...new Set(
            filterSource
              .map((item) => item.company)
              .filter((company): company is string => Boolean(company)),
          ),
        ].sort((a, b) => a.localeCompare(b)),
        companyTags: questionCompanyTags,
      },
    };
  }

  async upsertQuestion(adminId: string, input: QuestionInput) {
    const payload = this.questionCreatePayload(input, adminId);
    return prisma.question.upsert({
      where: { slug: input.slug },
      create: payload,
      update: this.questionUpdatePayload(input),
    });
  }

  async updateQuestion(id: string, input: Partial<QuestionInput>) {
    return prisma.question.update({
      where: { id },
      data: this.questionUpdatePayload(input),
    });
  }

  async submitAttempt(userId: string, input: SubmitAttemptInput) {
    if (input.kind === "LIVE_CODING") {
      await this.billingService.assertAiInterviewAvailable(userId);
    }

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
        completedAt,
      },
    });

    const existingTopic = await prisma.topicProgress.findUnique({
      where: { userId_topic: { userId, topic: input.topic } },
    });
    const nextAttempts = (existingTopic?.attempts ?? 0) + 1;
    const nextProficiency = Math.round(
      ((existingTopic?.proficiency ?? input.score) * (nextAttempts - 1) +
        input.score) /
        nextAttempts,
    );

    await prisma.topicProgress.upsert({
      where: { userId_topic: { userId, topic: input.topic } },
      create: {
        userId,
        topic: input.topic,
        proficiency: input.score,
        attempts: 1,
        targetScore: 82,
        lastPracticedAt: completedAt,
      },
      update: {
        proficiency: nextProficiency,
        attempts: nextAttempts,
        lastPracticedAt: completedAt,
      },
    });

    const day = new Date(
      completedAt.getFullYear(),
      completedAt.getMonth(),
      completedAt.getDate(),
    );
    await prisma.dailyActivity.upsert({
      where: { userId_date: { userId, date: day } },
      create: {
        userId,
        date: day,
        sessions: 1,
        minutes: input.durationMinutes,
        problemsSolved:
          input.problemsSolved ?? (input.status === "PASSED" ? 1 : 0),
      },
      update: {
        sessions: { increment: 1 },
        minutes: { increment: input.durationMinutes },
        problemsSolved: {
          increment:
            input.problemsSolved ?? (input.status === "PASSED" ? 1 : 0),
        },
      },
    });

    const recent = await prisma.interviewAttempt.findMany({
      where: { userId },
      orderBy: { completedAt: "desc" },
      take: 8,
    });
    const readinessScore = Math.round(
      recent.reduce((sum, item) => sum + item.score, 0) /
        Math.max(recent.length, 1),
    );
    await prisma.userProfile.upsert({
      where: { userId },
      create: { userId, readinessScore, currentStreak: 1, bestStreak: 1 },
      update: { readinessScore, currentStreak: { increment: 1 } },
    });

    await this.adaptiveService.recordAttemptSignals(userId, input, attempt);
    if (input.questionId) {
      await this.recordQuestionProgress(
        userId,
        input.questionId,
        input.score,
        input.status,
        completedAt,
      );
    }

    return attempt;
  }

  private toPracticeProblem(question: CatalogQuestion): PracticeProblem {
    const progress = question.progress?.[0];
    const dueForReview = progress?.nextReviewAt
      ? progress.nextReviewAt <= new Date()
      : false;
    return {
      id: question.id,
      slug: question.slug,
      type: question.type as
        | "DSA"
        | "FRONTEND"
        | "BACKEND"
        | "SYSTEM_DESIGN"
        | "BEHAVIORAL",
      title: question.heading,
      topic: question.topic,
      difficulty: question.difficulty as "EASY" | "MEDIUM" | "HARD",
      company: question.company,
      companyTags: this.jsonArray<CompanyTag>(question.companyTags),
      prompt: question.description,
      acceptanceText: question.acceptanceText,
      starterCode:
        question.starterCode ??
        "export function solve(nums: number[]) {\n  return nums.length;\n}",
      testCases: this.jsonArray<{ input: number[]; expected: number }>(
        question.testCases,
      ),
      examples: this.jsonArray<unknown>(question.examples),
      skillKeys: this.jsonArray<string>(question.skillKeys).length
        ? this.jsonArray<string>(question.skillKeys)
        : skillKeysForTopic(question.topic),
      attemptedCount: progress?.attempts ?? 0,
      solvedCount: progress?.solvedCount ?? 0,
      lastAttemptAt: progress?.lastAttemptAt?.toISOString() ?? null,
      lastSolvedAt: progress?.lastAttemptAt?.toISOString() ?? null,
      lastStatus:
        (progress?.lastStatus as "PASSED" | "NEEDS_REVIEW" | "FAILED") ?? null,
      nextReviewAt: progress?.nextReviewAt?.toISOString() ?? null,
      recommendedReason: dueForReview
        ? "Due for revision"
        : progress?.solvedCount
          ? "Previously solved"
          : "New adaptive question",
    };
  }

  private buildPersonalizationContext(
    profile: Awaited<ReturnType<typeof prisma.userProfile.findUnique>>,
    topics: TopicSignal[],
    skillNodes: Array<{
      key: string;
      mastery: number;
      nextReviewAt: Date | null;
    }>,
  ): PersonalizationContext {
    const profileWeakTopics = this.jsonArray<string>(
      profile?.weakestTopics,
    ).map((topic) => topic.toLowerCase());
    const topicWeakness = topics
      .filter(
        (topic) =>
          topic.proficiency < topic.targetScore || topic.proficiency < 70,
      )
      .sort(
        (a, b) =>
          b.targetScore - b.proficiency - (a.targetScore - a.proficiency),
      )
      .slice(0, 8)
      .map((topic) => topic.topic.toLowerCase());
    const targetCompanies = this.jsonArray<string>(
      profile?.targetCompanies,
    ).map((company) => company.toLowerCase());
    const now = new Date();

    return {
      weakTopics: new Set([...profileWeakTopics, ...topicWeakness]),
      targetCompanies: new Set(targetCompanies),
      dueSkillKeys: new Set(
        skillNodes
          .filter(
            (skill) =>
              skill.mastery < 65 ||
              (skill.nextReviewAt && skill.nextReviewAt <= now),
          )
          .slice(0, 12)
          .map((skill) => skill.key),
      ),
      readinessScore: profile?.readinessScore ?? 42,
      topics,
    };
  }

  private personalizePracticeProblems(
    questions: PracticeProblem[],
    context: PersonalizationContext,
    minimumUnsolvedBeforeRepeats: number,
  ) {
    const attemptedFamilies = new Set(
      questions
        .filter((question) => question.attemptedCount)
        .map((question) => this.problemFamily(question)),
    );
    const freshNewFamily = questions.filter(
      (question) =>
        !question.attemptedCount &&
        !attemptedFamilies.has(this.problemFamily(question)),
    );
    const fresh = questions.filter((question) => !question.attemptedCount);
    const attempted = questions.filter((question) => question.attemptedCount);
    const dueAttempted = attempted.filter(
      (question) =>
        question.nextReviewAt && new Date(question.nextReviewAt) <= new Date(),
    );
    const pool =
      freshNewFamily.length >= minimumUnsolvedBeforeRepeats
        ? freshNewFamily
        : fresh.length >= minimumUnsolvedBeforeRepeats
          ? fresh
          : [
              ...fresh,
              ...dueAttempted,
              ...attempted.filter(
                (question) => !dueAttempted.includes(question),
              ),
            ];

    return this.adaptiveOrder(pool, context).map((question) => ({
      ...question,
      recommendedReason: this.recommendationReason(question, context),
    }));
  }

  private personalizeSystemDesign(
    questions: CatalogQuestion[],
    context: PersonalizationContext,
  ): DesignScenario[] {
    const mapped = questions.map((question) => this.toDesignScenario(question));
    const unsolved = mapped.filter((scenario) => {
      const source = questions.find((question) => question.id === scenario.id);
      return !source?.progress?.[0]?.solvedCount;
    });
    const pool = unsolved.length >= 12 ? unsolved : mapped;
    return [...pool].sort(
      (a, b) =>
        this.scenarioScore(b, questions, context) -
        this.scenarioScore(a, questions, context),
    );
  }

  private toDesignScenario(question: CatalogQuestion): DesignScenario {
    return {
      id: question.id,
      title: question.heading,
      difficulty: question.difficulty === "HARD" ? "SENIOR" : "MID",
      prompt: question.description,
      requirements: [
        "Clarify requirements and scale assumptions",
        "Define APIs and core entities",
        "Explain storage, caching, reliability, and observability",
      ],
      constraints: this.jsonArray<string>(question.constraints),
    };
  }

  private adaptiveOrder<T extends PracticeProblem>(
    questions: T[],
    context: PersonalizationContext,
  ) {
    const weakTopics = new Map(
      context.topics.map((topic) => [
        topic.topic.toLowerCase(),
        Math.max(topic.targetScore - topic.proficiency, 0),
      ]),
    );
    const now = Date.now();
    return [...questions].sort((a, b) => {
      const aScore = this.problemScore(a, context, weakTopics, now);
      const bScore = this.problemScore(b, context, weakTopics, now);
      return bScore - aScore || a.title.localeCompare(b.title);
    });
  }

  private problemScore(
    question: PracticeProblem,
    context: PersonalizationContext,
    weakTopics: Map<string, number>,
    now: number,
  ) {
    const reviewDue = question.nextReviewAt
      ? new Date(question.nextReviewAt).getTime() <= now
      : false;
    const skillHit = (question.skillKeys ?? []).some((key) =>
      context.dueSkillKeys.has(key),
    );
    const targetCompanyHit = question.company
      ? context.targetCompanies.has(question.company.toLowerCase())
      : false;
    const weakTopicHit = [...context.weakTopics].some(
      (topic) =>
        question.topic.toLowerCase().includes(topic) ||
        topic.includes(question.topic.toLowerCase()),
    );
    return (
      (reviewDue ? 35 : 0) +
      (weakTopics.get(question.topic.toLowerCase()) ?? 0) +
      (weakTopicHit ? 30 : 0) +
      (skillHit ? 24 : 0) +
      (targetCompanyHit ? 18 : 0) +
      this.difficultyFitScore(question.difficulty, context.readinessScore) -
      (question.attemptedCount ? (reviewDue ? 80 : 520) : 0) -
      (question.solvedCount ?? 0) * 18
    );
  }

  private problemFamily(question: Pick<PracticeProblem, "slug" | "title">) {
    const slug = question.slug ?? "";
    return (
      slug.match(/^prepnexo-dsa-(.+)-\d+$/)?.[1] ??
      (question.title.split(":")[0] ?? question.title).trim().toLowerCase()
    );
  }

  private scenarioScore(
    scenario: DesignScenario,
    source: CatalogQuestion[],
    context: PersonalizationContext,
  ) {
    const question = source.find((item) => item.id === scenario.id);
    const solved = question?.progress?.[0]?.solvedCount ?? 0;
    const companyHit = question?.company
      ? context.targetCompanies.has(question.company.toLowerCase())
      : false;
    const systemWeak =
      context.weakTopics.has("system design") ||
      [...context.dueSkillKeys].some((key) => key.startsWith("system."));
    return (
      (systemWeak ? 40 : 0) +
      (companyHit ? 18 : 0) +
      this.difficultyFitScore(
        (question?.difficulty as PracticeProblem["difficulty"]) ?? "MEDIUM",
        context.readinessScore,
      ) -
      solved * 500
    );
  }

  private difficultyFitScore(
    difficulty: PracticeProblem["difficulty"],
    readinessScore: number,
  ) {
    if (readinessScore < 52)
      return difficulty === "EASY" ? 28 : difficulty === "MEDIUM" ? 10 : -18;
    if (readinessScore < 76)
      return difficulty === "MEDIUM" ? 28 : difficulty === "EASY" ? 12 : 16;
    return difficulty === "HARD" ? 30 : difficulty === "MEDIUM" ? 18 : 2;
  }

  private recommendationReason(
    question: PracticeProblem,
    context: PersonalizationContext,
  ) {
    if (question.nextReviewAt && new Date(question.nextReviewAt) <= new Date())
      return "Due for revision";
    if (
      question.company &&
      context.targetCompanies.has(question.company.toLowerCase())
    )
      return `Matches your ${question.company} prep`;
    if (
      [...context.weakTopics].some(
        (topic) =>
          question.topic.toLowerCase().includes(topic) ||
          topic.includes(question.topic.toLowerCase()),
      )
    )
      return `Targets weak area: ${question.topic}`;
    if ((question.skillKeys ?? []).some((key) => context.dueSkillKeys.has(key)))
      return "Matches your adaptive skill graph";
    if (question.attemptedCount) return "Fallback revision question";
    return "New personalized question";
  }

  private jsonArray<T>(value: Prisma.JsonValue | null | undefined): T[] {
    return Array.isArray(value) ? (value as T[]) : [];
  }

  private questionCreatePayload(
    input: QuestionInput,
    adminId: string,
  ): Prisma.QuestionCreateInput {
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
      skillKeys: (input.skillKeys ??
        skillKeysForTopic(input.topic)) as Prisma.InputJsonValue,
      createdById: adminId,
    };
  }

  private questionUpdatePayload(
    input: Partial<QuestionInput>,
  ): Prisma.QuestionUpdateInput {
    const data: Prisma.QuestionUpdateInput = {};
    if (input.slug !== undefined) data.slug = input.slug;
    if (input.type !== undefined) data.type = input.type;
    if (input.topic !== undefined) data.topic = input.topic;
    if (input.difficulty !== undefined) data.difficulty = input.difficulty;
    if (input.heading !== undefined) data.heading = input.heading;
    if (input.description !== undefined) data.description = input.description;
    if (input.acceptanceText !== undefined)
      data.acceptanceText = input.acceptanceText;
    if (input.starterCode !== undefined) data.starterCode = input.starterCode;
    if (input.status !== undefined) data.status = input.status;
    if (input.company !== undefined) data.company = input.company || null;
    if (input.companyTags !== undefined)
      data.companyTags = input.companyTags as Prisma.InputJsonValue;
    if (input.testCases !== undefined)
      data.testCases = input.testCases as Prisma.InputJsonValue;
    if (input.examples !== undefined)
      data.examples = input.examples as Prisma.InputJsonValue;
    if (input.constraints !== undefined)
      data.constraints = input.constraints as Prisma.InputJsonValue;
    if (input.skillKeys !== undefined)
      data.skillKeys = input.skillKeys as Prisma.InputJsonValue;
    return data;
  }

  private async recordQuestionProgress(
    userId: string,
    questionId: string,
    score: number,
    status: SubmitAttemptInput["status"],
    completedAt: Date,
  ) {
    const solved = status === "PASSED";
    const nextReviewAt = new Date(completedAt);
    nextReviewAt.setDate(nextReviewAt.getDate() + (solved ? 7 : 2));
    const existing = await prisma.userQuestionProgress.findUnique({
      where: { userId_questionId: { userId, questionId } },
    });
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
        nextReviewAt,
      },
      update: {
        attempts: { increment: 1 },
        solvedCount: solved ? { increment: 1 } : undefined,
        bestScore: Math.max(existing?.bestScore ?? 0, score),
        lastStatus: status,
        lastAttemptAt: completedAt,
        nextReviewAt,
      },
    });
  }
}
