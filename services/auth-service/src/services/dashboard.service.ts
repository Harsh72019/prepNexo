import type { DashboardMetric, DashboardSummary } from "@interview-battlefield/types";
import { DashboardRepository } from "../repositories/dashboard.repository.js";

const dashboard = new DashboardRepository();

export class DashboardService {
  async getSummary(userId: string): Promise<DashboardSummary> {
    const since = new Date();
    since.setDate(since.getDate() - 21);

    const [profile, recentActivity, recentAttempts, topics, heatmap, roadmap] = await Promise.all([
      dashboard.getProfile(userId),
      dashboard.getRecentAttempts(userId),
      dashboard.getAttemptsSince(userId, since),
      dashboard.getTopicProgress(userId),
      dashboard.getDailyActivity(userId, since),
      dashboard.getRoadmap(userId)
    ]);

    const readinessScore = profile?.readinessScore ?? this.average(recentAttempts.map((attempt) => attempt.score));
    const sessions = heatmap.reduce((sum, day) => sum + day.sessions, 0);
    const minutes = heatmap.reduce((sum, day) => sum + day.minutes, 0);
    const passed = recentAttempts.filter((attempt) => attempt.status === "PASSED").length;
    const weakTopic = topics[0];

    const metrics: DashboardMetric[] = [
      {
        label: "Readiness score",
        value: `${readinessScore}%`,
        delta: this.deltaLabel(recentAttempts),
        tone: readinessScore >= 75 ? "success" : readinessScore >= 60 ? "warning" : "neutral"
      },
      {
        label: "Current streak",
        value: `${profile?.currentStreak ?? 0} days`,
        delta: `Best ${profile?.bestStreak ?? 0}`,
        tone: "success"
      },
      {
        label: "Practice time",
        value: `${Math.round(minutes / 60)}h`,
        delta: `${sessions} sessions`,
        tone: "info"
      },
      {
        label: "Pass rate",
        value: `${recentAttempts.length ? Math.round((passed / recentAttempts.length) * 100) : 0}%`,
        delta: weakTopic ? `Focus ${weakTopic.topic}` : "No weak topic",
        tone: passed >= recentAttempts.length / 2 ? "success" : "warning"
      }
    ];

    return {
      profile: {
        readinessScore,
        currentStreak: profile?.currentStreak ?? 0,
        bestStreak: profile?.bestStreak ?? 0,
        targetRole: profile?.targetRole,
        headline: profile?.headline,
        onboardingCompleted: profile?.onboardingCompleted ?? false,
        onboardingSummary: profile?.onboardingSummary,
        targetCompanies: Array.isArray(profile?.targetCompanies) ? profile.targetCompanies as string[] : [],
        weakestTopics: Array.isArray(profile?.weakestTopics) ? profile.weakestTopics as string[] : [],
        learningStyle: profile?.learningStyle,
        targetTimeline: profile?.targetTimeline
      },
      metrics,
      recentActivity: recentActivity.map((attempt) => ({
        id: attempt.id,
        title: attempt.title,
        topic: attempt.topic,
        kind: attempt.kind,
        score: attempt.score,
        status: attempt.status,
        feedbackSummary: attempt.feedbackSummary,
        completedAt: attempt.completedAt.toISOString()
      })),
      topics: topics.map((topic) => ({
        topic: topic.topic,
        proficiency: topic.proficiency,
        attempts: topic.attempts,
        targetScore: topic.targetScore,
        gap: Math.max(topic.targetScore - topic.proficiency, 0)
      })),
      heatmap: heatmap.map((day) => ({
        date: day.date.toISOString(),
        sessions: day.sessions,
        minutes: day.minutes,
        problemsSolved: day.problemsSolved
      })),
      roadmap: roadmap.map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        topic: item.topic,
        priority: item.priority,
        dueDate: item.dueDate?.toISOString() ?? null,
        completedAt: item.completedAt?.toISOString() ?? null
      })),
      readinessTrend: this.toTrend(recentAttempts)
    };
  }

  private average(values: number[]) {
    if (!values.length) return 42;
    return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
  }

  private deltaLabel(attempts: Array<{ score: number }>) {
    if (attempts.length < 2) return "New baseline";
    const midpoint = Math.ceil(attempts.length / 2);
    const older = this.average(attempts.slice(0, midpoint).map((attempt) => attempt.score));
    const newer = this.average(attempts.slice(midpoint).map((attempt) => attempt.score));
    const delta = newer - older;
    return `${delta >= 0 ? "+" : ""}${delta} recent`;
  }

  private toTrend(attempts: Array<{ completedAt: Date; score: number }>) {
    return attempts.slice(-8).map((attempt) => ({
      label: attempt.completedAt.toLocaleDateString("en", { month: "short", day: "numeric" }),
      score: attempt.score
    }));
  }
}
