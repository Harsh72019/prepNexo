import { prisma } from "../config/prisma.js";

export class DashboardRepository {
  getProfile(userId: string) {
    return prisma.userProfile.findUnique({ where: { userId } });
  }

  getRecentAttempts(userId: string, take = 6) {
    return prisma.interviewAttempt.findMany({
      where: { userId },
      orderBy: { completedAt: "desc" },
      take
    });
  }

  getAttemptsSince(userId: string, since: Date) {
    return prisma.interviewAttempt.findMany({
      where: {
        userId,
        completedAt: { gte: since }
      },
      orderBy: { completedAt: "asc" }
    });
  }

  getTopicProgress(userId: string) {
    return prisma.topicProgress.findMany({
      where: { userId },
      orderBy: [{ proficiency: "asc" }, { attempts: "desc" }]
    });
  }

  getDailyActivity(userId: string, since: Date) {
    return prisma.dailyActivity.findMany({
      where: {
        userId,
        date: { gte: since }
      },
      orderBy: { date: "asc" }
    });
  }

  getRoadmap(userId: string) {
    return prisma.roadmapItem.findMany({
      where: {
        userId,
        completedAt: null
      },
      orderBy: [{ priority: "desc" }, { dueDate: "asc" }],
      take: 5
    });
  }
}
