"use client";

import { Button } from "@interview-battlefield/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@interview-battlefield/ui/components/card";
import { ActivityHeatmap } from "@/components/dashboard/activity-heatmap";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { ReadinessRadar } from "@/components/dashboard/readiness-radar";
import { useGrowthProfile } from "@/hooks/use-adaptive";
import { useDashboardSummary } from "@/hooks/use-dashboard";

export function AnalyticsClient() {
  const dashboard = useDashboardSummary();
  const growth = useGrowthProfile();

  if (dashboard.isLoading || dashboard.isPending) return <DashboardSkeleton />;

  if (dashboard.isError) {
    return (
      <section className="rounded-lg border bg-card p-6 shadow-sm">
        <p className="text-sm font-medium text-destructive">Analytics unavailable</p>
        <h2 className="mt-2 text-2xl font-semibold">Could not load analytics.</h2>
        <p className="mt-2 text-sm text-muted-foreground">{dashboard.error.message}</p>
        <Button className="mt-5" onClick={() => dashboard.refetch()}>Retry</Button>
      </section>
    );
  }

  const data = dashboard.data;
  if (!data) return <DashboardSkeleton />;

  const totalMinutes = data.heatmap.reduce((sum, day) => sum + day.minutes, 0);
  const solved = data.heatmap.reduce((sum, day) => sum + day.problemsSolved, 0);
  const averageScore = Math.round(data.recentActivity.reduce((sum, item) => sum + item.score, 0) / Math.max(data.recentActivity.length, 1));

  return (
    <div className="grid gap-6">
      <section className="rounded-lg border bg-card p-5 shadow-sm">
        <p className="text-sm font-medium text-primary">Performance intelligence</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-normal">Analytics</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Topic tracking, practice heatmaps, readiness trend, and recent attempt scoring are backed by persisted interview activity.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Average score</CardTitle>
            <CardDescription>Recent scored attempts</CardDescription>
          </CardHeader>
          <CardContent className="text-4xl font-semibold">{averageScore}%</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Practice volume</CardTitle>
            <CardDescription>Last three weeks</CardDescription>
          </CardHeader>
          <CardContent className="text-4xl font-semibold">{Math.round(totalMinutes / 60)}h</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Problems solved</CardTitle>
            <CardDescription>Heatmap activity total</CardDescription>
          </CardHeader>
          <CardContent className="text-4xl font-semibold">{solved}</CardContent>
        </Card>
      </section>

      {growth.data ? (
        <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <Card>
            <CardHeader>
              <CardTitle>Skill graph mastery</CardTitle>
              <CardDescription>Adaptive scores across DSA, system design, and soft-skill nodes.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {growth.data.skillGraph.slice(0, 12).map((skill) => (
                <div key={skill.key} className="grid gap-2">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium">{skill.label}</span>
                    <span className="text-muted-foreground">{skill.mastery}% · {skill.domain.replace("_", " ")}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${skill.mastery}%` }} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Growth events</CardTitle>
              <CardDescription>Recent skill signal changes that drive adaptation.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {growth.data.recentEvents.slice(0, 8).map((event) => (
                <div key={event.id} className="rounded-md border p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium">{event.type.replaceAll("_", " ")}</p>
                    <span className={event.value >= 0 ? "text-sm font-semibold text-primary" : "text-sm font-semibold text-accent"}>
                      {event.value >= 0 ? "+" : ""}{event.value}
                    </span>
                  </div>
                  <p className="mt-1 text-xs uppercase text-muted-foreground">{event.skillKey ?? "general"} · {event.source}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Readiness trend</CardTitle>
            <CardDescription>Scores from recent attempts.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-72 items-end gap-3 rounded-md border bg-background/60 p-4">
              {data.readinessTrend.map((point, index) => (
                <div key={`${point.label}-${index}`} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                  <div className="w-full rounded-t-md bg-primary" style={{ height: `${Math.max(point.score, 8)}%` }} />
                  <span className="text-xs text-muted-foreground">{point.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Topic radar</CardTitle>
            <CardDescription>Relative strengths by topic.</CardDescription>
          </CardHeader>
          <CardContent>
            <ReadinessRadar topics={data.topics} />
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <CardHeader>
            <CardTitle>Activity heatmap</CardTitle>
            <CardDescription>Daily practice intensity.</CardDescription>
          </CardHeader>
          <CardContent>
            <ActivityHeatmap days={data.heatmap} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Topic gaps</CardTitle>
            <CardDescription>Distance to target score.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {data.topics.map((topic) => (
              <div key={topic.topic} className="rounded-md border p-3">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium">{topic.topic}</span>
                  <span className="text-muted-foreground">{topic.gap} point gap</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${topic.proficiency}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
