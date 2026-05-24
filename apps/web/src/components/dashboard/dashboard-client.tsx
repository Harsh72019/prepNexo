"use client";

import { Button } from "@interview-battlefield/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@interview-battlefield/ui/components/card";
import { cn } from "@interview-battlefield/ui/lib/utils";
import { ArrowRight, Building2, CalendarDays, CheckCircle2, Clock, Flame, GraduationCap, Target } from "lucide-react";
import Link from "next/link";
import { useDashboardSummary } from "@/hooks/use-dashboard";
import { DashboardSkeleton } from "./dashboard-skeleton";

function readableKind(kind: string) {
  return kind.replaceAll("_", " ").toLowerCase();
}

function readinessLabel(score: number) {
  if (score >= 80) return "Interview ready";
  if (score >= 65) return "Close, needs focused reps";
  if (score >= 50) return "Building foundation";
  return "Needs guided practice";
}

export function DashboardClient() {
  const dashboard = useDashboardSummary();

  if (dashboard.isLoading || dashboard.isPending) return <DashboardSkeleton />;

  if (dashboard.isError) {
    return (
      <section className="rounded-lg border bg-card p-6 shadow-sm">
        <p className="text-sm font-medium text-destructive">Dashboard unavailable</p>
        <h2 className="mt-2 text-2xl font-semibold">Could not load your prep data.</h2>
        <p className="mt-2 text-sm text-muted-foreground">{dashboard.error.message}</p>
        <Button className="mt-5" onClick={() => dashboard.refetch()}>Retry</Button>
      </section>
    );
  }

  const data = dashboard.data;
  if (!data) return <DashboardSkeleton />;

  const weakTopics = data.profile.weakestTopics?.length
    ? data.profile.weakestTopics
    : [...data.topics].sort((a, b) => b.gap - a.gap).slice(0, 3).map((topic) => topic.topic);
  const weakTopicNames = new Set(weakTopics.map((topic) => topic.toLowerCase()));
  const bestTopics = [...data.topics]
    .filter((topic) => topic.proficiency >= 70 && topic.attempts >= 2 && !weakTopicNames.has(topic.topic.toLowerCase()))
    .sort((a, b) => b.proficiency - a.proficiency)
    .slice(0, 3);
  const nextTasks = data.roadmap.filter((item) => !item.completedAt).slice(0, 3);
  const recent = data.recentActivity.slice(0, 5);
  const sessions = data.heatmap.reduce((sum, day) => sum + day.sessions, 0);
  const solved = data.heatmap.reduce((sum, day) => sum + day.problemsSolved, 0);
  const minutes = data.heatmap.reduce((sum, day) => sum + day.minutes, 0);

  return (
    <div className="grid gap-6">
      <section className="arena-surface rounded-lg border p-5 shadow-[0_18px_60px_rgb(0_0_0/0.22)] md:p-6">
        <div className="grid gap-5 lg:grid-cols-[1fr_320px] lg:items-center">
          <div>
            <p className="text-sm font-medium text-primary">Your prep dashboard</p>
            <h2 className="mt-2 text-3xl font-black tracking-normal md:text-4xl">
              {data.profile.headline ?? data.profile.targetRole ?? "Interview preparation"}
            </h2>
            <p className="mt-3 max-w-3xl text-sm text-muted-foreground">
              {data.profile.onboardingSummary ?? "This page shows your target, weak areas, next tasks, and recent attempts in plain language."}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {data.profile.targetRole ? (
                <span className="inline-flex items-center gap-1 rounded-md border bg-background/70 px-3 py-1 text-sm">
                  <GraduationCap className="size-4 text-primary" />
                  {data.profile.targetRole}
                </span>
              ) : null}
              {(data.profile.targetCompanies ?? []).slice(0, 4).map((company) => (
                <span key={company} className="inline-flex items-center gap-1 rounded-md border bg-background/70 px-3 py-1 text-sm">
                  <Building2 className="size-4 text-primary" />
                  {company}
                </span>
              ))}
              {data.profile.targetTimeline ? (
                <span className="inline-flex items-center gap-1 rounded-md border bg-background/70 px-3 py-1 text-sm">
                  <CalendarDays className="size-4 text-primary" />
                  {data.profile.targetTimeline}
                </span>
              ) : null}
            </div>
          </div>

          <div className="rounded-lg border bg-background/75 p-5">
            <p className="text-xs font-semibold uppercase text-muted-foreground">Readiness</p>
            <div className="mt-2 flex items-end gap-2">
              <span className="text-5xl font-black">{data.profile.readinessScore}%</span>
            </div>
            <p className="mt-2 font-semibold">{readinessLabel(data.profile.readinessScore)}</p>
            <p className="mt-1 text-sm text-muted-foreground">Calculated from recent attempts, scores, streak, and practice volume.</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base"><Target className="size-4 text-primary" /> Focus now</CardTitle>
            <CardDescription>Your weakest prep areas.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            {weakTopics.slice(0, 4).map((topic) => (
              <div key={topic} className="rounded-md border bg-background/60 p-3 text-sm font-medium">{topic}</div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base"><CheckCircle2 className="size-4 text-primary" /> Strong areas</CardTitle>
            <CardDescription>Topics you can lean on.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            {bestTopics.length ? bestTopics.map((topic) => (
              <div key={topic.topic} className="rounded-md border bg-background/60 p-3">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium">{topic.topic}</span>
                  <span className="text-muted-foreground">{topic.proficiency}%</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${topic.proficiency}%` }} />
                </div>
              </div>
            )) : (
              <div className="rounded-md border border-dashed bg-background/60 p-3 text-sm text-muted-foreground">
                No proven strong area yet. Pass a few attempts and this will update.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base"><Flame className="size-4 text-primary" /> Last 21 days</CardTitle>
            <CardDescription>Simple practice totals.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-md border bg-background/60 p-3">
              <p className="text-2xl font-black">{sessions}</p>
              <p className="text-xs text-muted-foreground">sessions</p>
            </div>
            <div className="rounded-md border bg-background/60 p-3">
              <p className="text-2xl font-black">{solved}</p>
              <p className="text-xs text-muted-foreground">solved</p>
            </div>
            <div className="rounded-md border bg-background/60 p-3">
              <p className="text-2xl font-black">{Math.round(minutes / 60)}h</p>
              <p className="text-xs text-muted-foreground">time</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>What to do next</CardTitle>
            <CardDescription>Clear tasks based on your prep profile.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {nextTasks.length ? nextTasks.map((item, index) => (
              <div key={item.id} className="rounded-md border bg-background/60 p-3">
                <div className="flex items-start gap-3">
                  <span className="grid size-7 shrink-0 place-items-center rounded-md bg-primary text-sm font-black text-primary-foreground">{index + 1}</span>
                  <div>
                    <p className="font-semibold">{item.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                    <p className="mt-2 text-xs uppercase text-muted-foreground">{item.topic} · {item.priority} priority</p>
                  </div>
                </div>
              </div>
            )) : (
              <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">No tasks yet. Complete onboarding or submit practice attempts.</div>
            )}
            <div className="flex flex-wrap gap-2 pt-1">
              <Button asChild>
                <Link href="/coding">Do mock interview <ArrowRight className="size-4" /></Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/dsa-arena">Practice DSA arena</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/system-design">Practice system design</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Topic progress</CardTitle>
            <CardDescription>Where you stand against your target score.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {data.topics.slice(0, 7).map((topic) => (
              <div key={topic.topic} className="rounded-md border bg-background/60 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <p className="font-semibold">{topic.topic}</p>
                  <p className={cn("font-medium", topic.gap > 15 ? "text-accent" : "text-primary")}>
                    {topic.proficiency}% now · target {topic.targetScore}%
                  </p>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${topic.proficiency}%` }} />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {topic.attempts} attempts · {topic.gap > 0 ? `${topic.gap}% gap left` : "target reached"}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Clock className="size-4 text-primary" /> Recent attempts</CardTitle>
          <CardDescription>Your actual practice history, newest first.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {recent.length ? recent.map((activity) => (
            <div key={activity.id} className="grid gap-3 rounded-md border bg-background/60 p-3 md:grid-cols-[1fr_90px] md:items-center">
              <div>
                <p className="font-semibold">{activity.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {activity.topic} · {readableKind(activity.kind)} · {new Date(activity.completedAt).toLocaleDateString()}
                </p>
                {activity.feedbackSummary ? <p className="mt-2 text-sm text-muted-foreground">{activity.feedbackSummary}</p> : null}
              </div>
              <div className="rounded-md border bg-background/70 p-3 text-center">
                <p className="text-2xl font-black">{activity.score}%</p>
                <p className="text-xs text-muted-foreground">{activity.status.replace("_", " ").toLowerCase()}</p>
              </div>
            </div>
          )) : (
            <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">No attempts yet. Start with a mock interview or DSA arena.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
