"use client";

import type { ConsoleEntry, PracticeProblem } from "@interview-battlefield/types";
import { Button } from "@interview-battlefield/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@interview-battlefield/ui/components/card";
import { cn } from "@interview-battlefield/ui/lib/utils";
import Editor, { type OnMount } from "@monaco-editor/react";
import { Bot, Brain, CheckCircle2, Clock, Code2, HelpCircle, Play, Send, ShieldAlert, Sparkles, Target, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { MarkdownContent } from "@/components/ai/markdown-content";
import { useBillingStatus } from "@/hooks/use-billing";
import { usePracticeCatalog, useRunCode, useSubmitAttempt } from "@/hooks/use-practice";
import { aiStreamApi } from "@/lib/api";
import { type CodeLanguage, languageOptions, monacoLanguage, starterForLanguage } from "@/lib/code-templates";
import { ProblemStatement } from "./problem-statement";

const roundDurations: Record<string, number> = {
  "DSA Round": 45 * 60,
  "Backend Round": 50 * 60,
  "Machine Coding": 90 * 60,
  "Debugging Round": 35 * 60,
  "Low-Level Design": 60 * 60
};

const interviewTypes = Object.keys(roundDurations) as Array<keyof typeof roundDurations>;

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const rest = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${rest}`;
}

function adaptiveProblems(source: PracticeProblem[]) {
  const picked: PracticeProblem[] = [];
  const pick = (difficulty: PracticeProblem["difficulty"]) => {
    const candidates = source.filter((problem) => problem.difficulty === difficulty);
    return candidates.find((problem) => isDiverse(problem, picked))
      ?? candidates.find((problem) => !picked.some((item) => item.id === problem.id))
      ?? source.find((problem) => isDiverse(problem, picked))
      ?? source.find((problem) => !picked.some((item) => item.id === problem.id));
  };

  for (const difficulty of ["EASY", "MEDIUM", "HARD"] as const) {
    const next = pick(difficulty);
    if (next) picked.push(next);
  }
  return picked;
}

function problemFamily(problem: PracticeProblem) {
  const slug = problem.slug ?? "";
  const family = slug.match(/^prepnexo-dsa-(.+)-\d+$/)?.[1] ?? null;
  return family ?? (problem.title.split(":")[0] ?? problem.title).trim().toLowerCase();
}

function isDiverse(problem: PracticeProblem, selected: PracticeProblem[]) {
  return !selected.some((item) => item.topic === problem.topic || problemFamily(item) === problemFamily(problem));
}

function draftKey(problemId: string, language: CodeLanguage) {
  return `prepnexo-ai-draft:${problemId}:${language}`;
}

export function LiveCodingRoom() {
  const router = useRouter();
  const catalog = usePracticeCatalog();
  const billing = useBillingStatus();
  const runCode = useRunCode();
  const submitAttempt = useSubmitAttempt();
  const [screen, setScreen] = useState<"home" | "setup" | "round">("home");
  const [company, setCompany] = useState("Google");
  const [interviewType, setInterviewType] = useState<keyof typeof roundDurations>("DSA Round");
  const [started, setStarted] = useState(false);
  const [startedAt, setStartedAt] = useState(Date.now());
  const [remainingSeconds, setRemainingSeconds] = useState<number>(roundDurations["DSA Round"] ?? 45 * 60);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [followUpIndex, setFollowUpIndex] = useState(0);
  const [followUps, setFollowUps] = useState<string[]>([]);
  const [language, setLanguage] = useState<CodeLanguage>("typescript");
  const [code, setCode] = useState("");
  const [consoleEntries, setConsoleEntries] = useState<ConsoleEntry[]>([]);
  const [interviewerText, setInterviewerText] = useState<string | null>(null);
  const [aiStreaming, setAiStreaming] = useState(false);
  const [pasteBlocked, setPasteBlocked] = useState(false);

  const questions = useMemo(() => {
    const source = [...(catalog.data?.dsaProblems ?? []), ...(catalog.data?.codingProblems ?? [])];
    const unique = source.filter((problem, index, array) => array.findIndex((item) => item.id === problem.id) === index);
    return adaptiveProblems(unique);
  }, [catalog.data?.codingProblems, catalog.data?.dsaProblems]);

  const currentProblem = questions[questionIndex];
  const maxFollowUps = remainingSeconds > 12 * 60 ? 2 : 1;
  const aiInterviewLimitReached = billing.data?.dailyLimits.aiInterviews !== "UNLIMITED"
    && billing.data?.dailyUsage.aiInterviews !== undefined
    && billing.data.dailyUsage.aiInterviews >= billing.data.dailyLimits.aiInterviews;

  useEffect(() => {
    if (!started) return;
    const timer = window.setInterval(() => {
      setRemainingSeconds((current) => Math.max(0, (current ?? 0) - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [started]);

  useEffect(() => {
    if (!started || !currentProblem) return;
    const savedDraft = window.localStorage.getItem(draftKey(currentProblem.id, language));
    setCode(savedDraft ?? starterForLanguage(currentProblem, language));
    setFollowUps([]);
    setFollowUpIndex(0);
    setInterviewerText(null);
    setConsoleEntries([]);
  }, [currentProblem, language, started]);

  useEffect(() => {
    if (!started || !currentProblem || !code.trim()) return;
    const timeout = window.setTimeout(() => {
      window.localStorage.setItem(draftKey(currentProblem.id, language), code);
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [code, currentProblem, language, started]);

  const handleEditorMount: OnMount = (editor, monaco) => {
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyV, () => {
      setPasteBlocked(true);
      setConsoleEntries((entries) => [{
        id: crypto.randomUUID(),
        level: "info" as ConsoleEntry["level"],
        message: "Paste is disabled in live interviews. Type the solution yourself so the practice signal stays honest.",
        createdAt: new Date().toISOString()
      }, ...entries].slice(0, 6));
    });
    editor.getDomNode()?.addEventListener("paste", (event) => {
      event.preventDefault();
      setPasteBlocked(true);
    });
  };

  function startRound() {
    if (aiInterviewLimitReached) {
      toast.error("Free plan includes 1 AI interview per day. Upgrade to Pro for unlimited rounds.");
      router.push("/billing");
      return;
    }
    const duration = roundDurations[interviewType] ?? 45 * 60;
    setScreen("round");
    setStarted(true);
    setStartedAt(Date.now());
    setRemainingSeconds(duration);
    setQuestionIndex(0);
    if (questions[0]) setCode(starterForLanguage(questions[0], language));
  }

  async function submitSolution() {
    if (!currentProblem) return;
    const payload = await runCode.mutateAsync({ code, testCases: currentProblem.testCases, language });
    setConsoleEntries((entries) => [{
      id: crypto.randomUUID(),
      level: (payload.data.ok ? "success" : "error") as ConsoleEntry["level"],
      message: payload.data.message,
      createdAt: new Date().toISOString()
    }, ...entries].slice(0, 6));

    await submitAttempt.mutateAsync({
      kind: "LIVE_CODING",
      questionId: currentProblem.slug ? currentProblem.id : undefined,
      title: currentProblem.title,
      topic: currentProblem.topic,
      score: payload.data.ok ? 88 : 45,
      durationMinutes: Math.max(1, Math.round((Date.now() - startedAt) / 60000)),
      status: payload.data.ok ? "PASSED" : "NEEDS_REVIEW",
      feedbackSummary: payload.data.message,
      problemsSolved: payload.data.ok ? 1 : 0,
      retryCount: consoleEntries.length,
      confidence: payload.data.ok ? 76 : 38,
      communicationScore: 60,
      skillKeys: currentProblem.skillKeys
    });

    if (payload.data.ok) {
      window.localStorage.removeItem(draftKey(currentProblem.id, language));
    }
    await askFollowUp(payload.data.ok);
  }

  async function askFollowUp(solved: boolean) {
    if (!currentProblem) return;
    if (followUpIndex >= maxFollowUps) {
      moveNextQuestion();
      return;
    }
    let streamedText = "";
    setInterviewerText("");
    setAiStreaming(true);
    try {
      await aiStreamApi.interviewer(
        {
          role: `${company} ${interviewType} interviewer`,
          topic: currentProblem.topic,
          message: [
            `Problem: ${currentProblem.title}`,
            `Prompt:\n${currentProblem.prompt}`,
            `Visible test cases:\n${JSON.stringify(currentProblem.testCases?.slice(0, 4) ?? [], null, 2)}`,
            `Expected interview signal:\n${currentProblem.acceptanceText ?? "Explain approach, edge cases, and complexity."}`,
            `Candidate ${solved ? "submitted a passing-looking solution" : "could not pass all tests"}.`,
            `Current code:\n${code}`,
            [
              "Respond in this exact structure:",
              "1. Verdict: one short sentence.",
              "2. Why/how: explain the intended approach and why it works, without giving a full copy-paste solution.",
              "3. Complexity: time and space.",
              "4. Follow-up: ask exactly one realistic adaptive follow-up question."
            ].join("\n")
          ].join("\n")
        },
        (token) => {
          streamedText += token;
          setInterviewerText((current) => `${current ?? ""}${token}`);
        }
      );
      setFollowUps((items) => [...items, streamedText || "Follow-up asked by interviewer."]);
      setFollowUpIndex((index) => index + 1);
    } catch (error) {
      const fallback = solved
        ? [
            "Verdict: Your submission passed the runner checks.",
            "Why/how: The intended solution should transform the prompt into a clear invariant, process the array once where possible, and prove that each update preserves the needed answer.",
            "Complexity: Aim for linear or n log n time depending on the data structure, with minimal extra space.",
            "Follow-up: What edge case would break this approach, and how would you test it?"
          ].join("\n\n")
        : [
            "Verdict: The submission did not pass all checks.",
            "Why/how: Start by matching the encoded input shape, then test the smallest case that proves your invariant before expanding to the full example set.",
            "Complexity: After correctness, reduce brute force loops only if they exceed the expected scale.",
            "Follow-up: Explain the bug you suspect first and the smallest test case that exposes it."
          ].join("\n\n");
      setInterviewerText(error instanceof Error ? `${fallback}\n\nAI stream failed: ${error.message}` : fallback);
      setFollowUps((items) => [...items, fallback]);
      setFollowUpIndex((index) => index + 1);
    } finally {
      setAiStreaming(false);
    }
  }

  function moveNextQuestion() {
    setQuestionIndex((index) => Math.min(index + 1, questions.length - 1));
    if (questionIndex >= questions.length - 1) {
      setInterviewerText("Round complete. Your attempts were saved to the dashboard.");
    }
  }

  function unableToSolve() {
    setConsoleEntries((entries) => [{
      id: crypto.randomUUID(),
      level: "info" as ConsoleEntry["level"],
      message: "Marked unable to solve. Moving to an adaptive follow-up or next question.",
      createdAt: new Date().toISOString()
    }, ...entries].slice(0, 6));
    void askFollowUp(false);
  }

  if (screen === "home") {
    return (
      <div className="grid gap-6">
        <section className="arena-surface min-h-[70vh] rounded-lg border p-6 shadow-[0_24px_90px_rgb(0_0_0/0.28)] md:p-10">
          <div className="mx-auto flex max-w-5xl flex-col items-center justify-center py-10 text-center md:py-20">
            <div className="mb-5 flex items-center gap-2 rounded-full border bg-background/70 px-4 py-2 text-sm font-semibold text-primary">
              <Sparkles className="size-4" />
              AI mock interview
            </div>
            <h2 className="max-w-3xl text-4xl font-black tracking-normal md:text-6xl">
              Practice like the real round is already booked.
            </h2>
            <p className="mt-5 max-w-2xl text-base text-muted-foreground md:text-lg">
              Choose a company and interview type, then enter a timed adaptive round with real coding prompts, follow-ups, no-paste discipline, and saved performance signals.
            </p>
            <div className="mt-8 grid w-full max-w-4xl gap-3 md:grid-cols-3">
              <div className="rounded-lg border bg-background/70 p-4">
                <Brain className="mx-auto size-6 text-primary" />
                <p className="mt-3 font-bold">Adaptive interviewer</p>
                <p className="mt-1 text-sm text-muted-foreground">Follow-ups react to your answer and time left.</p>
              </div>
              <div className="rounded-lg border bg-background/70 p-4">
                <Clock className="mx-auto size-6 text-primary" />
                <p className="mt-3 font-bold">Timed pressure</p>
                <p className="mt-1 text-sm text-muted-foreground">45 to 90 minute rounds based on type.</p>
              </div>
              <div className="rounded-lg border bg-background/70 p-4">
                <Target className="mx-auto size-6 text-primary" />
                <p className="mt-3 font-bold">Growth signals</p>
                <p className="mt-1 text-sm text-muted-foreground">Attempts update dashboard and weak topics.</p>
              </div>
            </div>
            <Button className="mt-8" size="lg" onClick={() => setScreen("setup")}>
              <Play className="size-5" />
              Set up interview
            </Button>
          </div>
        </section>
      </div>
    );
  }

  if (screen === "setup" && !started) {
    return (
      <div className="grid gap-6">
        <section className="arena-surface rounded-lg border p-5 shadow-[0_18px_60px_rgb(0_0_0/0.22)]">
          <p className="text-sm font-medium text-primary">Live interview</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-normal">Start a real round</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Pick the company and interview type. Difficulty is adaptive: the round moves through easy, medium, and hard based on your answers and remaining time.
          </p>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Company</CardTitle>
              <CardDescription>Used for interviewer style and follow-up tone.</CardDescription>
            </CardHeader>
            <CardContent>
              <input
                value={company}
                onChange={(event) => setCompany(event.target.value)}
                className="h-11 w-full rounded-md border bg-background px-3 text-sm outline-none"
                placeholder="Google, Amazon, Meta, TCS..."
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Interview type</CardTitle>
              <CardDescription>Sets the timer automatically.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
              {interviewTypes.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setInterviewType(item)}
                  className={cn("flex items-center justify-between rounded-md border p-3 text-left text-sm hover:bg-muted", interviewType === item && "border-primary bg-primary/10 text-primary")}
                >
                  <span>{item}</span>
                  <span className="text-xs text-muted-foreground">{Math.round((roundDurations[item] ?? 45 * 60) / 60)} min</span>
                </button>
              ))}
            </CardContent>
          </Card>
        </section>

        <Card>
          <CardContent className="flex flex-col justify-between gap-4 p-5 md:flex-row md:items-center">
            <div>
              <p className="font-medium">{company} · {interviewType}</p>
              <p className="mt-1 text-sm text-muted-foreground">Three adaptive questions: easy, medium, hard. Paste is blocked inside the editor.</p>
            </div>
            <Button onClick={startRound} disabled={!questions.length || aiInterviewLimitReached}>
              <Play className="size-4" />
              {aiInterviewLimitReached ? "Daily limit reached" : "Start round"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <section className="arena-surface flex flex-col justify-between gap-4 rounded-lg border p-4 shadow-[0_18px_60px_rgb(0_0_0/0.22)] md:flex-row md:items-center">
        <div>
          <p className="text-sm font-medium text-primary">{company} · {interviewType}</p>
          <h2 className="mt-1 text-xl font-semibold tracking-normal">Question {questionIndex + 1} of {questions.length}</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex h-10 items-center gap-2 rounded-md border bg-background/70 px-3 text-sm font-semibold">
            <Clock className="size-4 text-primary" />
            {formatTime(remainingSeconds ?? 0)}
          </div>
          {pasteBlocked ? (
            <div className="flex h-10 items-center gap-2 rounded-md border border-accent/50 bg-accent/10 px-3 text-sm text-accent">
              <ShieldAlert className="size-4" />
              Paste blocked
            </div>
          ) : null}
        </div>
      </section>

      <Card>
        <CardContent className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="max-w-4xl flex-1">
              <ProblemStatement problem={currentProblem} />
            </div>
            <select value={language} onChange={(event) => setLanguage(event.target.value as CodeLanguage)} className="h-10 rounded-md border bg-background px-3 text-sm">
              {languageOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
            </select>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="border-b">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2"><Code2 className="size-4 text-primary" /> Write your solution</CardTitle>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={unableToSolve} disabled={aiStreaming}>
                <XCircle className="size-4" />
                Unable to solve
              </Button>
              <Button variant="outline" onClick={moveNextQuestion} disabled={aiStreaming}>
                <HelpCircle className="size-4" />
                No follow-up
              </Button>
              <Button onClick={submitSolution} loading={runCode.isPending || submitAttempt.isPending || aiStreaming}>
                <Send className="size-4" />
                Submit
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Editor
            height="500px"
            language={monacoLanguage(language)}
            theme="vs-dark"
            value={code}
            onMount={handleEditorMount}
            onChange={(value) => setCode(value ?? "")}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineHeight: 22,
              padding: { top: 16 },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              contextmenu: false
            }}
          />
        </CardContent>
      </Card>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Bot className="size-4 text-primary" /> Feedback and follow-up</CardTitle>
            <CardDescription>{followUpIndex}/{maxFollowUps} follow-ups for this question.</CardDescription>
          </CardHeader>
          <CardContent>
            {interviewerText ? <MarkdownContent text={interviewerText} /> : <p className="text-sm text-muted-foreground">Submit to get verdict, approach explanation, complexity, and one adaptive follow-up.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><CheckCircle2 className="size-4 text-primary" /> Console</CardTitle>
            <CardDescription>Submission verdicts and anti-paste signals.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            {consoleEntries.length ? consoleEntries.map((entry) => (
              <div key={entry.id} className={cn("rounded-md border p-3 text-sm", entry.level === "success" && "border-primary/40 text-primary", entry.level === "error" && "border-destructive/40 text-destructive")}>{entry.message}</div>
            )) : <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">No submissions yet.</p>}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
