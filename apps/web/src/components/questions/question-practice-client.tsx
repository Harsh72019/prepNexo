"use client";

import type { ConsoleEntry } from "@interview-battlefield/types";
import { Button } from "@interview-battlefield/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@interview-battlefield/ui/components/card";
import { cn } from "@interview-battlefield/ui/lib/utils";
import Editor, { type OnMount } from "@monaco-editor/react";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Play,
  Save,
  Send,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  usePracticeQuestion,
  useRunCode,
  useSubmitAttempt,
} from "@/hooks/use-practice";
import {
  type CodeLanguage,
  languageOptions,
  monacoLanguage,
  starterForLanguage,
} from "@/lib/code-templates";
import { ProblemStatement } from "@/components/realtime/problem-statement";

function draftKey(questionId: string, language: CodeLanguage) {
  return `prepnexo-question-draft:${questionId}:${language}`;
}

function scoreForRun(ok: boolean, attempts: number, minutes: number) {
  if (!ok) return Math.max(20, 48 - attempts * 4);
  return Math.max(62, Math.min(100, 96 - Math.max(0, attempts - 1) * 6 - Math.max(0, minutes - 12)));
}

export function QuestionPracticeClient({ questionId }: { questionId: string }) {
  const question = usePracticeQuestion(questionId);
  const runCode = useRunCode();
  const submitAttempt = useSubmitAttempt();
  const [language, setLanguage] = useState<CodeLanguage>("typescript");
  const [code, setCode] = useState("");
  const [consoleEntries, setConsoleEntries] = useState<ConsoleEntry[]>([]);
  const [startedAt] = useState(Date.now());
  const [runCount, setRunCount] = useState(0);
  const [pasteBlocked, setPasteBlocked] = useState(false);
  const [saved, setSaved] = useState(false);

  const problem = question.data;
  const elapsedMinutes = useMemo(
    () => Math.max(1, Math.round((Date.now() - startedAt) / 60000)),
    [startedAt, consoleEntries.length],
  );

  useEffect(() => {
    if (!problem) return;
    const savedDraft = window.localStorage.getItem(draftKey(problem.id, language));
    setCode(savedDraft ?? starterForLanguage(problem, language));
    setConsoleEntries([]);
    setSaved(false);
  }, [language, problem]);

  useEffect(() => {
    if (!problem || !code.trim()) return;
    const timeout = window.setTimeout(() => {
      window.localStorage.setItem(draftKey(problem.id, language), code);
      setSaved(true);
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [code, language, problem]);

  const handleEditorMount: OnMount = (editor, monaco) => {
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyV, () => {
      setPasteBlocked(true);
      setConsoleEntries((entries) =>
        [
          {
            id: crypto.randomUUID(),
            level: "info" as ConsoleEntry["level"],
            message:
              "Paste is disabled in solo practice too. Type it out so your progress signal stays useful.",
            createdAt: new Date().toISOString(),
          },
          ...entries,
        ].slice(0, 8),
      );
    });
    editor.getDomNode()?.addEventListener("paste", (event) => {
      event.preventDefault();
      setPasteBlocked(true);
    });
  };

  async function runCurrentQuestion() {
    if (!problem) return null;
    const payload = await runCode.mutateAsync({
      code,
      testCases: problem.testCases,
      language,
    });
    setRunCount((count) => count + 1);
    setConsoleEntries((entries) =>
      [
        {
          id: crypto.randomUUID(),
          level: (payload.data.ok ? "success" : "error") as ConsoleEntry["level"],
          message: payload.data.message,
          createdAt: new Date().toISOString(),
        },
        ...entries,
      ].slice(0, 8),
    );
    return payload.data.ok;
  }

  async function submitCurrentQuestion() {
    if (!problem) return;
    const ok = await runCurrentQuestion();
    if (ok === null) return;
    const score = scoreForRun(ok, runCount + 1, elapsedMinutes);
    await submitAttempt.mutateAsync({
      kind: "DSA_CONTEST",
      questionId: problem.id,
      title: problem.title,
      topic: problem.topic,
      score,
      durationMinutes: elapsedMinutes,
      status: ok ? "PASSED" : "NEEDS_REVIEW",
      feedbackSummary: ok
        ? `Solved ${problem.title} in solo practice.`
        : `Attempted ${problem.title}; needs review.`,
      problemsSolved: ok ? 1 : 0,
      skillKeys: problem.skillKeys,
    });
    if (ok) {
      window.localStorage.removeItem(draftKey(problem.id, language));
      toast.success("Solved. Progress saved to your dashboard.");
    } else {
      toast.info("Attempt saved. Revisit it from your question library.");
    }
  }

  if (question.isLoading) {
    return (
      <div className="grid min-h-[60vh] place-items-center rounded-lg border bg-card/70">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!problem) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">Question not found.</p>
          <Button asChild className="mt-4">
            <Link href="/questions">Back to questions</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-5">
      <section className="arena-surface rounded-lg border p-5 shadow-[0_24px_90px_rgb(0_0_0/0.24)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Button asChild variant="ghost" className="-ml-3">
              <Link href="/questions">
                <ArrowLeft className="size-4" />
                Questions
              </Link>
            </Button>
            <h1 className="mt-3 text-3xl font-black tracking-normal md:text-5xl">
              Solo practice
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Practice one question without arena pressure. Your draft is saved locally and your submission updates dashboard progress.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-md border bg-background/70 px-3 py-2 text-sm font-semibold">
              {problem.topic}
            </span>
            <span
              className={cn(
                "rounded-md border px-3 py-2 text-sm font-semibold",
                problem.difficulty === "EASY" && "border-emerald-400/40 text-emerald-400",
                problem.difficulty === "MEDIUM" && "border-amber-400/40 text-amber-400",
                problem.difficulty === "HARD" && "border-rose-400/40 text-rose-400",
              )}
            >
              {problem.difficulty}
            </span>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>{problem.title}</CardTitle>
            <CardDescription>
              {problem.company ? `${problem.company} style · ` : ""}
              {problem.solvedCount ? "Solved before" : problem.attemptedCount ? "Attempted" : "New question"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProblemStatement problem={problem} />
          </CardContent>
        </Card>

        <div className="grid gap-5">
          <Card className="overflow-hidden">
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle>Editor</CardTitle>
                  <CardDescription>
                    {saved ? "Draft saved locally." : "Start typing your solution."}
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <select
                    value={language}
                    onChange={(event) => setLanguage(event.target.value as CodeLanguage)}
                    className="h-10 rounded-md border bg-background px-3 text-sm"
                  >
                    {languageOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <Button
                    variant="outline"
                    onClick={runCurrentQuestion}
                    loading={runCode.isPending}
                  >
                    <Play className="size-4" />
                    Run
                  </Button>
                  <Button
                    onClick={submitCurrentQuestion}
                    loading={runCode.isPending || submitAttempt.isPending}
                  >
                    <Send className="size-4" />
                    Submit
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {pasteBlocked ? (
                <div className="flex items-center gap-2 border-y border-amber-400/30 bg-amber-400/10 px-4 py-2 text-sm text-amber-200">
                  <ShieldAlert className="size-4" />
                  Paste was blocked for this question.
                </div>
              ) : null}
              <Editor
                height="520px"
                language={monacoLanguage(language)}
                theme="vs-dark"
                value={code}
                onChange={(value) => {
                  setSaved(false);
                  setCode(value ?? "");
                }}
                onMount={handleEditorMount}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  scrollBeyondLastLine: false,
                  wordWrap: "on",
                  automaticLayout: true,
                }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-primary" />
                Console
              </CardTitle>
              <CardDescription>Run output, verdicts, and saved attempt status.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
              {consoleEntries.length ? (
                consoleEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className={cn(
                      "rounded-md border p-3 text-sm",
                      entry.level === "success" && "border-primary/50 text-primary",
                      entry.level === "error" && "border-destructive/50 text-destructive",
                      entry.level === "info" && "border-amber-400/40 text-amber-200",
                    )}
                  >
                    {entry.message}
                  </div>
                ))
              ) : (
                <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                  No runs yet.
                </div>
              )}
              <div className="flex items-center gap-2 rounded-md border bg-background/60 p-3 text-xs text-muted-foreground">
                <Save className="size-3" />
                Drafts are stored only in this browser until you submit successfully.
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
