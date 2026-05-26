"use client";

import { Button } from "@interview-battlefield/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@interview-battlefield/ui/components/card";
import { Input } from "@interview-battlefield/ui/components/input";
import { cn } from "@interview-battlefield/ui/lib/utils";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useQuestionLibrary } from "@/hooks/use-practice";

const pageSize = 12;

function cleanText(value: string) {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function practiceHref(type?: string) {
  if (type === "SYSTEM_DESIGN") return "/system-design";
  if (type === "DSA") return "/dsa-arena";
  return "/coding";
}

function questionHref(question: { id: string; type?: string }) {
  if (question.type === "DSA") return `/questions/${question.id}`;
  return practiceHref(question.type);
}

export function QuestionLibraryClient() {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [topic, setTopic] = useState("");
  const [company, setCompany] = useState("");
  const [companyTag, setCompanyTag] = useState("");
  const [progress, setProgress] = useState("");

  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    setQ(search.get("q") ?? "");
    setType(search.get("type") ?? "");
    setDifficulty(search.get("difficulty") ?? "");
    setTopic(search.get("topic") ?? "");
    setCompany(search.get("company") ?? "");
    setCompanyTag(search.get("companyTag") ?? "");
    setProgress(search.get("progress") ?? "");
    setPage(Number(search.get("page")) || 1);
  }, []);
  const params = useMemo(
    () => ({
      page,
      pageSize,
      q,
      type,
      difficulty,
      topic,
      company,
      companyTag,
      progress,
    }),
    [company, companyTag, difficulty, page, progress, q, topic, type],
  );
  const library = useQuestionLibrary(params);
  const data = library.data;

  function resetFilters() {
    setPage(1);
    setQ("");
    setType("");
    setDifficulty("");
    setTopic("");
    setCompany("");
    setCompanyTag("");
    setProgress("");
  }

  function updateFilter(setter: (value: string) => void, value: string) {
    setter(value);
    setPage(1);
  }

  return (
    <div className="grid gap-5">
      <section className="arena-surface overflow-hidden rounded-lg border p-5 shadow-[0_22px_80px_rgb(0_0_0/0.24)] md:p-7">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            <div className="flex w-fit items-center gap-2 rounded-md border bg-background/70 px-3 py-2 text-sm font-semibold text-primary">
              <BookOpen className="size-4" />
              Question library
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-normal md:text-5xl">
              Browse every PrepNexo practice question.
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
              Filter by topic, company, difficulty, type, and your progress. Use
              this when you want targeted practice instead of waiting for the
              adaptive round to pick for you.
            </p>
          </div>
          <div className="rounded-lg border bg-background/70 p-4">
            <p className="text-sm font-semibold text-muted-foreground">
              Library coverage
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-md border bg-card/70 p-3">
                <p className="text-2xl font-black">{data?.total ?? "--"}</p>
                <p className="text-xs text-muted-foreground">matching</p>
              </div>
              <div className="rounded-md border bg-card/70 p-3">
                <p className="text-2xl font-black">
                  {data?.filters.topics.length ?? "--"}
                </p>
                <p className="text-xs text-muted-foreground">topics</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-lg border bg-card/76 p-4 shadow-sm">
        <div className="grid gap-3 xl:grid-cols-[minmax(220px,1.35fr)_repeat(6,minmax(130px,1fr))_auto]">
          <label className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(event) => updateFilter(setQ, event.target.value)}
              placeholder="Search title, topic, company"
              className="pl-9"
            />
          </label>
          <select
            value={type}
            onChange={(event) => updateFilter(setType, event.target.value)}
            className="h-10 rounded-md border bg-background px-3 text-sm"
          >
            <option value="">All types</option>
            {data?.filters.types.map((item) => (
              <option key={item} value={item}>
                {item.replace("_", " ")}
              </option>
            ))}
          </select>
          <select
            value={difficulty}
            onChange={(event) =>
              updateFilter(setDifficulty, event.target.value)
            }
            className="h-10 rounded-md border bg-background px-3 text-sm"
          >
            <option value="">All levels</option>
            {data?.filters.difficulties.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <select
            value={topic}
            onChange={(event) => updateFilter(setTopic, event.target.value)}
            className="h-10 rounded-md border bg-background px-3 text-sm"
          >
            <option value="">All topics</option>
            {data?.filters.topics.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <select
            value={company}
            onChange={(event) => updateFilter(setCompany, event.target.value)}
            className="h-10 rounded-md border bg-background px-3 text-sm"
          >
            <option value="">All companies</option>
            {data?.filters.companies.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <select
            value={companyTag}
            onChange={(event) =>
              updateFilter(setCompanyTag, event.target.value)
            }
            className="h-10 rounded-md border bg-background px-3 text-sm"
          >
            <option value="">All tags</option>
            {data?.filters.companyTags.map((item) => (
              <option key={item} value={item}>
                {item.replaceAll("_", " ")}
              </option>
            ))}
          </select>
          <select
            value={progress}
            onChange={(event) => updateFilter(setProgress, event.target.value)}
            className="h-10 rounded-md border bg-background px-3 text-sm"
          >
            <option value="">Any progress</option>
            <option value="unsolved">Unsolved</option>
            <option value="attempted">Attempted</option>
            <option value="solved">Solved</option>
          </select>
          <Button variant="outline" onClick={resetFilters}>
            <Filter className="size-4" />
            Reset
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {library.isLoading
          ? Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="min-h-64 animate-pulse" />
            ))
          : null}

        {data?.questions.map((question) => {
          const solved = Boolean(question.solvedCount);
          const attempted = Boolean(question.attemptedCount);
          return (
            <Card
              key={question.id}
              className={cn(
                "overflow-hidden",
                solved && "border-emerald-400/40",
                attempted && !solved && "border-amber-400/40",
              )}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <CardTitle className="line-clamp-2 text-lg">
                      {question.title}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {question.type?.replace("_", " ")} · {question.topic}
                    </CardDescription>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-md border px-2 py-1 text-xs font-semibold",
                      question.difficulty === "EASY" &&
                        "border-emerald-400/40 text-emerald-400",
                      question.difficulty === "MEDIUM" &&
                        "border-amber-400/40 text-amber-400",
                      question.difficulty === "HARD" &&
                        "border-rose-400/40 text-rose-400",
                    )}
                  >
                    {question.difficulty}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4">
                <p className="line-clamp-4 text-sm leading-6 text-muted-foreground">
                  {cleanText(question.prompt)}
                </p>
                <div className="flex flex-wrap gap-2">
                  {question.company ? (
                    <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                      {question.company}
                    </span>
                  ) : null}
                  {(question.companyTags ?? []).slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground"
                    >
                      {tag.replaceAll("_", " ")}
                    </span>
                  ))}
                  <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                    {solved ? "Solved" : attempted ? "Attempted" : "New"}
                  </span>
                </div>
                {question.recommendedReason ? (
                  <div className="rounded-md border bg-background/70 p-3 text-xs text-muted-foreground">
                    <Sparkles className="mr-1 inline size-3 text-primary" />
                    {question.recommendedReason}
                  </div>
                ) : null}
                <Button asChild>
                  <Link href={questionHref(question)}>Practice question</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </section>

      {!library.isLoading && data?.questions.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-sm text-muted-foreground">
            No questions match these filters.
          </CardContent>
        </Card>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card/76 p-3">
        <p className="text-sm text-muted-foreground">
          Page {data?.page ?? page} of {data?.totalPages ?? 1} ·{" "}
          {data?.total ?? 0} questions
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            disabled={page <= 1 || library.isFetching}
            onClick={() => setPage((current) => Math.max(current - 1, 1))}
          >
            <ChevronLeft className="size-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            disabled={
              library.isFetching || Boolean(data && page >= data.totalPages)
            }
            onClick={() =>
              setPage((current) =>
                Math.min(current + 1, data?.totalPages ?? current + 1),
              )
            }
          >
            Next
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
