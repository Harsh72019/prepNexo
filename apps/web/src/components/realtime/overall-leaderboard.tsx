"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@interview-battlefield/ui/components/card";
import { cn } from "@interview-battlefield/ui/lib/utils";
import { Crown, Flame, Medal, Sparkles, Star, Trophy, Users, Zap } from "lucide-react";
import { useMemo } from "react";
import { useOverallLeaderboard } from "@/hooks/use-arena";
import { useAuthStore } from "@/stores/auth-store";

const rankStyles = [
  "border-yellow-300/60 bg-yellow-300/12 shadow-[0_18px_70px_rgb(250_204_21/0.18)]",
  "border-slate-300/50 bg-slate-300/12 shadow-[0_18px_70px_rgb(148_163_184/0.18)]",
  "border-orange-300/55 bg-orange-300/12 shadow-[0_18px_70px_rgb(251_146_60/0.18)]"
];

export function OverallLeaderboard() {
  const overall = useOverallLeaderboard();
  const user = useAuthStore((state) => state.user);
  const entries = overall.data?.entries ?? [];
  const topThree = entries.slice(0, 3);
  const rest = entries.slice(3);
  const myIndex = entries.findIndex((entry) => entry.userId === user?.id);
  const myEntry = myIndex >= 0 ? entries[myIndex] : undefined;
  const stats = useMemo(() => {
    const totalBattles = entries.reduce((sum, entry) => sum + entry.battlesPlayed, 0);
    const topRating = entries[0]?.rating ?? 0;
    const avgWinRate = entries.length ? Math.round(entries.reduce((sum, entry) => sum + entry.winRate, 0) / entries.length) : 0;
    return { totalBattles, topRating, avgWinRate };
  }, [entries]);

  return (
    <div className="grid gap-6">
      <section className="arena-surface rounded-lg border p-6 shadow-[0_24px_90px_rgb(0_0_0/0.24)] md:p-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border bg-background/70 px-4 py-2 text-sm font-semibold text-primary">
              <Sparkles className="size-4" />
              Global clout board
            </div>
            <h2 className="mt-5 max-w-3xl text-4xl font-black tracking-normal md:text-6xl">
              The arena never lies.
            </h2>
            <p className="mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">
              Long-term ranks across every DSA battle. Daily contests decide today; this board shows who keeps showing up.
            </p>
          </div>

          <div className="grid gap-3">
            <div className="rounded-lg border bg-background/72 p-4">
              <p className="text-xs font-semibold uppercase text-muted-foreground">Your rank</p>
              <p className="mt-1 text-3xl font-black">{myIndex >= 0 ? `#${myIndex + 1}` : "Unranked"}</p>
              <p className="text-sm text-muted-foreground">{myEntry ? `${myEntry.rating} rating · ${myEntry.ratingBand}` : "Join DSA Arena to enter."}</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-lg border bg-background/72 p-3">
                <Trophy className="size-4 text-primary" />
                <p className="mt-2 text-lg font-black">{stats.topRating}</p>
                <p className="text-xs text-muted-foreground">top rating</p>
              </div>
              <div className="rounded-lg border bg-background/72 p-3">
                <Users className="size-4 text-primary" />
                <p className="mt-2 text-lg font-black">{entries.length}</p>
                <p className="text-xs text-muted-foreground">players</p>
              </div>
              <div className="rounded-lg border bg-background/72 p-3">
                <Flame className="size-4 text-primary" />
                <p className="mt-2 text-lg font-black">{stats.avgWinRate}%</p>
                <p className="text-xs text-muted-foreground">avg WR</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {topThree.map((entry, index) => (
          <Card key={entry.userId} className={cn("overflow-hidden", rankStyles[index])}>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    {index === 0 ? <Crown className="size-5 text-yellow-400" /> : <Medal className="size-5 text-primary" />}
                    #{index + 1}
                  </CardTitle>
                  <CardDescription>{entry.ratingBand}</CardDescription>
                </div>
                <div className="rounded-full border bg-background/70 px-3 py-1 text-sm font-black">{entry.rating}</div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="grid size-14 place-items-center rounded-lg bg-foreground text-xl font-black text-background">
                  {entry.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-lg font-black">{entry.name}</p>
                  <p className="text-sm text-muted-foreground">{entry.battlesWon} wins · {entry.winRate}% win rate</p>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-md border bg-background/60 p-2">
                  <p className="font-black">{entry.battlesPlayed}</p>
                  <p className="text-xs text-muted-foreground">battles</p>
                </div>
                <div className="rounded-md border bg-background/60 p-2">
                  <p className="font-black">{entry.battlesWon}</p>
                  <p className="text-xs text-muted-foreground">wins</p>
                </div>
                <div className="rounded-md border bg-background/60 p-2">
                  <p className="font-black">{entry.winRate}%</p>
                  <p className="text-xs text-muted-foreground">WR</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Zap className="size-4 text-primary" /> Full rankings</CardTitle>
          <CardDescription>Rating band: {overall.data?.ratingBand ?? "loading"}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2">
          {rest.map((entry, index) => {
            const rank = index + 4;
            return (
              <div
                key={entry.userId}
                className={cn(
                  "grid grid-cols-[44px_1fr_86px_92px] items-center gap-3 rounded-lg border bg-background/58 p-3 text-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/8",
                  entry.userId === user?.id && "border-primary/60 bg-primary/12"
                )}
              >
                <span className="flex items-center gap-1 font-bold text-muted-foreground">
                  {rank <= 10 ? <Star className="size-3 text-primary" /> : null}
                  #{rank}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-bold">{entry.name}</p>
                  <p className="text-xs text-muted-foreground">{entry.battlesPlayed} battles · {entry.battlesWon} wins · {entry.winRate}% WR</p>
                </div>
                <span className="font-black">{entry.rating}</span>
                <span className="text-muted-foreground">{entry.ratingBand}</span>
              </div>
            );
          })}
          {overall.isLoading ? <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">Loading leaderboard...</div> : null}
          {!overall.isLoading && entries.length === 0 ? <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">No ranked players yet.</div> : null}
        </CardContent>
      </Card>
    </div>
  );
}
