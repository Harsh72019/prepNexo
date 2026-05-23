import type { GrowthProfile, PressurePrompt, SubmitAttemptInput } from "@interview-battlefield/types";
import type { InterviewAttempt, SkillNode } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { getSkillDefinition, skillDefinitions, skillKeysForTopic } from "./adaptive-taxonomy.js";

const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, Math.round(value)));

function addDays(days: number) {
  const next = new Date();
  next.setDate(next.getDate() + days);
  return next;
}

function toSkillDto(skill: SkillNode) {
  return {
    key: skill.key,
    label: skill.label,
    domain: skill.domain as "DSA" | "SYSTEM_DESIGN" | "SOFT_SKILL",
    score: skill.score,
    confidence: skill.confidence,
    volatility: skill.volatility,
    exposure: skill.exposure,
    mastery: skill.mastery,
    trend: skill.trend,
    weakRecurrence: skill.weakRecurrence,
    lastPracticedAt: skill.lastPracticedAt?.toISOString() ?? null,
    nextReviewAt: skill.nextReviewAt?.toISOString() ?? null
  };
}

function leagueForRating(rating: number) {
  if (rating >= 1900) return { league: "Legend", rankTitle: "Staff Interviewer Ready" };
  if (rating >= 1650) return { league: "Diamond", rankTitle: "Senior Signal Strong" };
  if (rating >= 1400) return { league: "Platinum", rankTitle: "Interview Closer" };
  if (rating >= 1200) return { league: "Gold", rankTitle: "Consistent Builder" };
  if (rating >= 1050) return { league: "Silver", rankTitle: "Growing Engineer" };
  return { league: "Bronze", rankTitle: "Apprentice Engineer" };
}

export class AdaptiveService {
  async ensureSkillGraph(userId: string) {
    const existing = await prisma.skillNode.findMany({
      where: { userId },
      select: { key: true }
    });
    const existingKeys = new Set(existing.map((skill) => skill.key));
    const missing = skillDefinitions.filter((skill) => !existingKeys.has(skill.key));

    if (missing.length > 0) {
      await prisma.skillNode.createMany({
        data: missing.map((skill) => ({
            userId,
            key: skill.key,
            label: skill.label,
            domain: skill.domain,
            score: skill.domain === "SOFT_SKILL" ? 52 : 45,
            confidence: 45,
            nextReviewAt: new Date()
          }))
      });
    }

    await prisma.userRating.upsert({
      where: { userId },
      create: { userId },
      update: {}
    });
  }

  async recordAttemptSignals(userId: string, input: SubmitAttemptInput, attempt: InterviewAttempt) {
    await this.ensureSkillGraph(userId);
    const keys = skillKeysForTopic(input.topic, input.skillKeys);
    const skillKeys = keys.length > 0 ? keys : ["soft.problem_breakdown"];
    const confidence = input.confidence ?? (input.score >= 80 ? 78 : input.score >= 65 ? 62 : 42);
    const hintPenalty = (input.hintCount ?? 0) * 3;
    const retryPenalty = (input.retryCount ?? 0) * 4;
    const speedSignal = input.timeToFirstApproachSec ? clamp(12 - input.timeToFirstApproachSec / 45, -12, 12) : 0;
    const rawDelta = (input.score - 60) / 4 + speedSignal - hintPenalty - retryPenalty;
    const delta = clamp(rawDelta, -16, 16);
    const weak = input.score < 65 || input.status !== "PASSED";
    const now = new Date();

    for (const key of skillKeys) {
      const skill = await prisma.skillNode.findUnique({ where: { userId_key: { userId, key } } });
      if (!skill) continue;
      const nextScore = clamp(skill.score + delta);
      const nextConfidence = clamp(skill.confidence * 0.72 + confidence * 0.28);
      const nextMastery = clamp(nextScore * 0.65 + nextConfidence * 0.35);
      const reviewDays = nextMastery >= 80 ? 14 : nextMastery >= 65 ? 7 : nextMastery >= 50 ? 3 : 1;

      await prisma.skillNode.update({
        where: { userId_key: { userId, key } },
        data: {
          score: nextScore,
          confidence: nextConfidence,
          volatility: clamp(skill.volatility + (weak ? 6 : -4), 10, 95),
          exposure: { increment: 1 },
          mastery: nextMastery,
          trend: delta,
          weakRecurrence: weak ? { increment: 1 } : Math.max(skill.weakRecurrence - 1, 0),
          lastPracticedAt: now,
          nextReviewAt: addDays(reviewDays),
          evidence: {
            attemptId: attempt.id,
            title: attempt.title,
            score: input.score,
            durationMinutes: input.durationMinutes,
            hintCount: input.hintCount ?? 0,
            retryCount: input.retryCount ?? 0
          }
        }
      });

      await prisma.growthEvent.create({
        data: {
          userId,
          type: weak ? "WEAK_PATTERN_DETECTED" : "SKILL_SIGNAL_IMPROVED",
          source: input.kind,
          skillKey: key,
          value: delta,
          metadata: {
            attemptId: attempt.id,
            topic: input.topic,
            score: input.score,
            confidence,
            timeToFirstApproachSec: input.timeToFirstApproachSec ?? null
          }
        }
      });

      if (weak) {
        const definition = getSkillDefinition(key);
        await prisma.coachMemory.upsert({
          where: { userId_key: { userId, key: `weak.${key}` } },
          create: {
            userId,
            key: `weak.${key}`,
            summary: `${definition?.label ?? key} keeps showing up as a limiting pattern. Revisit fundamentals, then do one timed drill.`,
            priority: clamp(100 - nextMastery),
            evidence: { attemptId: attempt.id, score: input.score, topic: input.topic }
          },
          update: {
            priority: clamp(100 - nextMastery),
            summary: `${definition?.label ?? key} remains a recurring gap. Use guided drills before another full simulation.`,
            evidence: { attemptId: attempt.id, score: input.score, topic: input.topic }
          }
        });
      }
    }

    const rating = await prisma.userRating.findUnique({ where: { userId } });
    const ratingDelta = clamp((input.score - 60) * 0.9 - hintPenalty - retryPenalty + (input.status === "PASSED" ? 12 : -8), -35, 45);
    const nextRating = Math.max(500, (rating?.rating ?? 1000) + ratingDelta);
    const rank = leagueForRating(nextRating);
    await prisma.userRating.upsert({
      where: { userId },
      create: {
        userId,
        rating: nextRating,
        league: rank.league,
        rankTitle: rank.rankTitle,
        seasonPoints: Math.max(ratingDelta, 0),
        pressureScore: clamp(input.pressureScore ?? input.score),
        communicationScore: clamp(input.communicationScore ?? confidence),
        systemThinkingScore: input.kind === "SYSTEM_DESIGN" ? clamp(input.score) : 45
      },
      update: {
        rating: nextRating,
        league: rank.league,
        rankTitle: rank.rankTitle,
        seasonPoints: { increment: Math.max(ratingDelta, 0) },
        pressureScore: clamp(((rating?.pressureScore ?? 45) * 0.8) + ((input.pressureScore ?? input.score) * 0.2)),
        communicationScore: clamp(((rating?.communicationScore ?? 45) * 0.8) + ((input.communicationScore ?? confidence) * 0.2)),
        systemThinkingScore:
          input.kind === "SYSTEM_DESIGN"
            ? clamp(((rating?.systemThinkingScore ?? 45) * 0.75) + (input.score * 0.25))
            : rating?.systemThinkingScore ?? 45
      }
    });
  }

  async getGrowthProfile(userId: string): Promise<GrowthProfile> {
    await this.ensureSkillGraph(userId);
    const [skills, rating, memories, events, profile] = await Promise.all([
      prisma.skillNode.findMany({ where: { userId }, orderBy: [{ domain: "asc" }, { score: "asc" }] }),
      prisma.userRating.findUniqueOrThrow({ where: { userId } }),
      prisma.coachMemory.findMany({ where: { userId }, orderBy: { priority: "desc" }, take: 6 }),
      prisma.growthEvent.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 24 }),
      prisma.userProfile.findUnique({ where: { userId } })
    ]);
    const nextSession = await this.getOrCreateDailySession(userId, skills);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const weeklyGrowth = events.filter((event) => event.createdAt >= sevenDaysAgo).reduce((sum, event) => sum + event.value, 0);

    return {
      readinessScore: profile?.readinessScore ?? Math.round(skills.reduce((sum, skill) => sum + skill.mastery, 0) / Math.max(skills.length, 1)),
      weeklyGrowth,
      strengths: skills.filter((skill) => skill.mastery >= 72).sort((a, b) => b.mastery - a.mastery).slice(0, 5).map(toSkillDto),
      weakPatterns: skills
        .filter((skill) => skill.mastery < 65 || skill.weakRecurrence > 1)
        .slice(0, 7)
        .map((skill) => ({
          skillKey: skill.key,
          label: skill.label,
          domain: skill.domain as "DSA" | "SYSTEM_DESIGN" | "SOFT_SKILL",
          score: skill.mastery,
          recurrence: skill.weakRecurrence,
          recommendation: `Schedule a focused ${skill.label} drill with a timed explanation checkpoint.`
        })),
      skillGraph: skills.map(toSkillDto),
      rating: {
        rating: rating.rating,
        league: rating.league,
        rankTitle: rating.rankTitle,
        seasonPoints: rating.seasonPoints,
        pressureScore: rating.pressureScore,
        communicationScore: rating.communicationScore,
        systemThinkingScore: rating.systemThinkingScore
      },
      coachMemories: memories.map((memory) => ({
        key: memory.key,
        summary: memory.summary,
        priority: memory.priority,
        evidence: memory.evidence as Record<string, unknown> | null,
        updatedAt: memory.updatedAt.toISOString()
      })),
      recentEvents: events.map((event) => ({
        id: event.id,
        type: event.type,
        source: event.source,
        skillKey: event.skillKey,
        value: event.value,
        metadata: event.metadata as Record<string, unknown> | null,
        createdAt: event.createdAt.toISOString()
      })),
      nextSession
    };
  }

  async getOrCreateDailySession(userId: string, hydratedSkills?: SkillNode[]) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const existing = await prisma.adaptiveSession.findFirst({
      where: { userId, createdAt: { gte: today }, status: { in: ["PLANNED", "ACTIVE"] } },
      include: { tasks: { orderBy: { order: "asc" } } },
      orderBy: { createdAt: "desc" }
    });
    if (existing) return this.toSessionDto(existing);

    const skills = hydratedSkills ?? (await prisma.skillNode.findMany({ where: { userId } }));
    const focus = [...skills]
      .sort((a, b) => a.mastery + a.confidence - (b.mastery + b.confidence))
      .slice(0, 4);
    const average = focus.reduce((sum, skill) => sum + skill.mastery, 0) / Math.max(focus.length, 1);
    const difficulty = average > 70 ? "HARD" : average > 55 ? "MEDIUM" : "FOUNDATION";
    const pressureLevel = clamp(35 + focus.reduce((sum, skill) => sum + skill.volatility, 0) / Math.max(focus.length, 1) / 2);

    const session = await prisma.adaptiveSession.create({
      data: {
        userId,
        title: "Today’s adaptive growth block",
        difficulty,
        pressureLevel,
        estimatedMinutes: 55,
        focusSkills: focus.map((skill) => skill.key),
        rationale: `Built from your weakest recurring patterns: ${focus.map((skill) => skill.label).join(", ")}.`,
        tasks: {
          create: [
            {
              kind: "DRILL",
              title: `${focus[0]?.label ?? "Core skill"} repair drill`,
              skillKey: focus[0]?.key ?? "soft.problem_breakdown",
              difficulty,
              prompt: "Solve one focused prompt and write the invariant before coding.",
              order: 1
            },
            {
              kind: "INTERVIEW",
              title: "Pressure simulation",
              skillKey: focus[1]?.key ?? focus[0]?.key ?? "soft.interview_confidence",
              difficulty,
              prompt: "Run a timed mock interview with interruptions and edge-case questioning.",
              order: 2
            },
            {
              kind: "REVISION",
              title: "Spaced repetition checkpoint",
              skillKey: focus[2]?.key ?? focus[0]?.key ?? "soft.problem_breakdown",
              difficulty: "REVIEW",
              prompt: "Redo a previously weak pattern without hints and explain the optimization tradeoff.",
              order: 3
            },
            {
              kind: "COMMUNICATION",
              title: "Explanation quality rep",
              skillKey: "soft.explanation_quality",
              difficulty: "MEDIUM",
              prompt: "Record a two-minute approach explanation before implementation.",
              order: 4
            }
          ]
        }
      },
      include: { tasks: { orderBy: { order: "asc" } } }
    });

    return this.toSessionDto(session);
  }

  async createPressurePrompt(userId: string, context?: { sessionId?: string; surface?: string; topic?: string }): Promise<PressurePrompt> {
    const prompts = [
      {
        type: "INTERRUPTION",
        prompt: "Pause coding. Explain your current invariant and the failure mode if the input contains duplicates.",
        severity: 55
      },
      {
        type: "COMPLEXITY_CHALLENGE",
        prompt: "The interviewer asks for a tighter time or space bound. Justify the current complexity, then propose one optimization.",
        severity: 68
      },
      {
        type: "REQUIREMENT_CHANGE",
        prompt: "Requirement changed: support streaming updates without recomputing from scratch.",
        severity: 72
      },
      {
        type: "EDGE_CASE",
        prompt: "A hidden edge case appears: empty input, extreme bounds, and repeated values must all pass.",
        severity: 60
      },
      {
        type: "FAILURE_INJECTION",
        prompt: "System event: Redis is unavailable and traffic doubled for 10 minutes. Explain how your design degrades and recovers.",
        severity: 78
      }
    ] as const;
    const index = Math.abs((context?.topic ?? context?.surface ?? userId).split("").reduce((sum, char) => sum + char.charCodeAt(0), 0)) % prompts.length;
    const selected = prompts[index] ?? prompts[0];
    const event = await prisma.pressureEvent.create({
      data: {
        userId,
        sessionId: context?.sessionId,
        type: selected.type,
        prompt: selected.prompt,
        severity: selected.severity,
        metadata: context ?? {}
      }
    });

    return {
      id: event.id,
      type: event.type as PressurePrompt["type"],
      prompt: event.prompt,
      severity: event.severity,
      createdAt: event.createdAt.toISOString()
    };
  }

  private toSessionDto(session: {
    id: string;
    title: string;
    status: string;
    difficulty: string;
    focusSkills: unknown;
    pressureLevel: number;
    estimatedMinutes: number;
    rationale: string;
    createdAt: Date;
    completedAt: Date | null;
    tasks: Array<{
      id: string;
      kind: string;
      title: string;
      skillKey: string;
      difficulty: string;
      prompt: string;
      status: string;
      order: number;
      metadata: unknown;
    }>;
  }) {
    return {
      id: session.id,
      title: session.title,
      status: session.status as "PLANNED" | "ACTIVE" | "COMPLETED",
      difficulty: session.difficulty,
      focusSkills: Array.isArray(session.focusSkills) ? (session.focusSkills as string[]) : [],
      pressureLevel: session.pressureLevel,
      estimatedMinutes: session.estimatedMinutes,
      rationale: session.rationale,
      tasks: session.tasks.map((task) => ({
        id: task.id,
        kind: task.kind as "DRILL" | "INTERVIEW" | "REVISION" | "COMMUNICATION" | "SYSTEM_DESIGN",
        title: task.title,
        skillKey: task.skillKey,
        difficulty: task.difficulty,
        prompt: task.prompt,
        status: task.status as "TODO" | "DONE" | "SKIPPED",
        order: task.order,
        metadata: task.metadata as Record<string, unknown> | null
      })),
      createdAt: session.createdAt.toISOString(),
      completedAt: session.completedAt?.toISOString() ?? null
    };
  }
}
