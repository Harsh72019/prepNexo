import type { ArenaLeaderboardEntry, DailyArena, OverallLeaderboard } from "@interview-battlefield/types";
import { prisma } from "../config/prisma.js";

const botPool = [
  ["bot-ada", "Ada Chen", 1240],
  ["bot-maya", "Maya BFS", 1195],
  ["bot-nikhil", "Nikhil DP", 1320],
  ["bot-grace", "Grace Lambda", 1110],
  ["bot-karan", "Karan Heap", 1040],
  ["bot-tara", "Tara Trie", 1450],
  ["bot-rohan", "Rohan Stack", 980]
] as const;

function dayStart() {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function bandForRating(rating: number) {
  if (rating >= 1600) return "Diamond";
  if (rating >= 1350) return "Platinum";
  if (rating >= 1150) return "Gold";
  if (rating >= 950) return "Silver";
  return "Bronze";
}

function toEntry(row: {
  userId: string;
  score?: number;
  solved?: number;
  penalty?: number;
  rank?: number | null;
  user: { name: string; userRating: { rating: number; battlesPlayed: number; battlesWon: number } | null };
}, ratingBand: string): ArenaLeaderboardEntry {
  const rating = row.user.userRating?.rating ?? 1000;
  const battlesPlayed = row.user.userRating?.battlesPlayed ?? 0;
  const battlesWon = row.user.userRating?.battlesWon ?? 0;
  return {
    userId: row.userId,
    name: row.user.name,
    rating,
    ratingBand,
    battlesPlayed,
    battlesWon,
    winRate: battlesPlayed ? Math.round((battlesWon / battlesPlayed) * 100) : 0,
    score: row.score,
    solved: row.solved,
    penalty: row.penalty,
    rank: row.rank
  };
}

export class ArenaService {
  async today(userId: string, mode: "ranked" | "practice" = "ranked"): Promise<DailyArena> {
    const arenaDate = dayStart();
    const rating = await prisma.userRating.upsert({ where: { userId }, create: { userId }, update: {} });
    const ratingBand = bandForRating(rating.rating);
    const roomId = `${mode}-${ratingBand}-${arenaDate.toISOString().slice(0, 10)}`;
    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { name: true } });
    const existing = await prisma.arenaEntry.findUnique({ where: { userId_arenaDate_mode: { userId, arenaDate, mode } } });
    const usedRankedToday = Boolean(existing && mode === "ranked");

    if (!existing) {
      await prisma.arenaEntry.create({
        data: { userId, arenaDate, mode, ratingBand, roomId, metadata: { name: user.name } }
      });
    }

    const entries = await this.dailyEntries(arenaDate, mode, ratingBand);
    return { date: arenaDate.toISOString(), mode, ratingBand, roomId, usedRankedToday, entries };
  }

  async submit(userId: string, input: { mode: "ranked" | "practice"; score: number; solved: number; penalty: number }): Promise<DailyArena> {
    const arenaDate = dayStart();
    const rating = await prisma.userRating.upsert({ where: { userId }, create: { userId }, update: {} });
    const ratingBand = bandForRating(rating.rating);
    const roomId = `${input.mode}-${ratingBand}-${arenaDate.toISOString().slice(0, 10)}`;
    await prisma.arenaEntry.upsert({
      where: { userId_arenaDate_mode: { userId, arenaDate, mode: input.mode } },
      create: {
        userId,
        arenaDate,
        mode: input.mode,
        ratingBand,
        roomId,
        score: input.score,
        solved: input.solved,
        penalty: input.penalty,
        completed: input.solved >= 3
      },
      update: {
        score: input.score,
        solved: input.solved,
        penalty: input.penalty,
        completed: input.solved >= 3
      }
    });

    const rows = await prisma.arenaEntry.findMany({
      where: { arenaDate, mode: input.mode, ratingBand },
      orderBy: [{ score: "desc" }, { penalty: "asc" }]
    });
    await Promise.all(rows.map((row, index) => prisma.arenaEntry.update({ where: { id: row.id }, data: { rank: index + 1 } })));

    const rank = rows.findIndex((row) => row.userId === userId) + 1;
    const ratingDelta = input.mode === "ranked" ? Math.max(-24, 42 - rank * 8 + input.solved * 6) : 0;
    await prisma.userRating.update({
      where: { userId },
      data: {
        rating: { increment: ratingDelta },
        seasonPoints: { increment: Math.max(0, input.score) },
        battlesPlayed: input.mode === "ranked" ? { increment: input.solved >= 3 ? 1 : 0 } : undefined,
        battlesWon: input.mode === "ranked" && rank === 1 ? { increment: 1 } : undefined
      }
    });

    return this.today(userId, input.mode);
  }

  async overall(userId: string): Promise<OverallLeaderboard> {
    const rating = await prisma.userRating.upsert({ where: { userId }, create: { userId }, update: {} });
    const ratingBand = bandForRating(rating.rating);
    const users = await prisma.user.findMany({
      where: { userRating: { rating: { gte: this.bandMin(ratingBand), lt: this.bandMax(ratingBand) } } },
      include: { userRating: true },
      orderBy: { userRating: { rating: "desc" } },
      take: 25
    });

    const entries = users.map((user) => ({
      userId: user.id,
      name: user.name,
      rating: user.userRating?.rating ?? 1000,
      ratingBand,
      battlesPlayed: user.userRating?.battlesPlayed ?? 0,
      battlesWon: user.userRating?.battlesWon ?? 0,
      winRate: user.userRating?.battlesPlayed ? Math.round(((user.userRating?.battlesWon ?? 0) / user.userRating.battlesPlayed) * 100) : 0
    }));

    return { ratingBand, entries: entries.length ? entries : this.botOverall(ratingBand) };
  }

  private async dailyEntries(arenaDate: Date, mode: string, ratingBand: string) {
    const rows = await prisma.arenaEntry.findMany({
      where: { arenaDate, mode, ratingBand },
      include: { user: { select: { name: true, userRating: true } } },
      orderBy: [{ score: "desc" }, { penalty: "asc" }]
    });
    const realEntries = rows.map((row) => toEntry(row, ratingBand));
    const bots = botPool.slice(0, Math.max(0, 6 - realEntries.length)).map(([id, name, rating], index) => ({
      userId: id,
      name,
      rating,
      ratingBand,
      battlesPlayed: 12 + index * 3,
      battlesWon: 3 + index,
      winRate: 24 + index * 4,
      score: Math.max(0, 110 - index * 12),
      solved: index < 2 ? 1 : 0,
      penalty: 70 + index * 10,
      rank: null
    }));
    return [...realEntries, ...bots].sort((a, b) => (b.score ?? 0) - (a.score ?? 0) || (a.penalty ?? 0) - (b.penalty ?? 0));
  }

  private botOverall(ratingBand: string) {
    return botPool.map(([id, name, rating], index) => ({
      userId: id,
      name,
      rating,
      ratingBand,
      battlesPlayed: 18 + index * 4,
      battlesWon: 5 + index,
      winRate: 28 + index * 3
    }));
  }

  private bandMin(band: string) {
    return band === "Diamond" ? 1600 : band === "Platinum" ? 1350 : band === "Gold" ? 1150 : band === "Silver" ? 950 : 0;
  }

  private bandMax(band: string) {
    return band === "Diamond" ? 10000 : band === "Platinum" ? 1600 : band === "Gold" ? 1350 : band === "Silver" ? 1150 : 950;
  }
}
