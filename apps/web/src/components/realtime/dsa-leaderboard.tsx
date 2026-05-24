"use client";

import type { ConsoleEntry, LeaderboardEntry, PracticeProblem, RealtimeUser } from "@interview-battlefield/types";
import { Button } from "@interview-battlefield/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@interview-battlefield/ui/components/card";
import { cn } from "@interview-battlefield/ui/lib/utils";
import Editor, { type OnMount } from "@monaco-editor/react";
import { CheckCircle2, Clock, Loader2, Play, Radio, Send, ShieldAlert, Sparkles, Swords, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useBillingStatus } from "@/hooks/use-billing";
import { useSubmitArenaScore, useTodayArena } from "@/hooks/use-arena";
import { useInterviewSocket } from "@/hooks/use-interview-socket";
import { usePracticeCatalog, useRunCode, useSubmitAttempt } from "@/hooks/use-practice";
import { type CodeLanguage, languageOptions, monacoLanguage, starterForLanguage } from "@/lib/code-templates";
import { useAuthStore } from "@/stores/auth-store";
import { ProblemStatement } from "./problem-statement";

const botNames = ["Ada Chen", "Karan Heap", "Maya BFS", "Nikhil DP", "Grace Lambda", "Tara Trie", "Rohan Stack", "Ishika Queue"];
const lobbyMessages = [
  "Finding players in your rating band...",
  "Creating a fair room...",
  "Checking today’s arena queue...",
  "Balancing speed and accuracy signals...",
  "Filling empty seats with human-like bots..."
];

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function arenaProblems(source: PracticeProblem[]) {
  const easy = source.find((problem) => problem.difficulty === "EASY") ?? source[0];
  const mediums = source.filter((problem) => problem.difficulty === "MEDIUM");
  const medium = mediums[0] ?? source[1] ?? easy;
  const mediumHard = mediums[1] ?? source.find((problem) => problem.topic !== medium?.topic && problem.difficulty !== "EASY") ?? medium;
  const hard = source.find((problem) => problem.difficulty === "HARD") ?? source[source.length - 1] ?? mediumHard;
  return [easy, medium, mediumHard, hard].filter(Boolean) as PracticeProblem[];
}

export function DsaLeaderboard({ contestId = "daily-dsa-arena" }: { contestId?: string }) {
  const router = useRouter();
  const { socket, connected } = useInterviewSocket();
  const catalog = usePracticeCatalog();
  const billing = useBillingStatus();
  const runCode = useRunCode();
  const submitAttempt = useSubmitAttempt();
  const submitArenaScore = useSubmitArenaScore();
  const authUser = useAuthStore((state) => state.user);
  const user = useMemo<RealtimeUser>(() => ({ id: authUser?.id ?? "guest-candidate", name: authUser?.name ?? "Guest Candidate" }), [authUser]);
  const todayArena = useTodayArena("ranked");
  const [phase, setPhase] = useState<"idle" | "matching" | "playing" | "results">("idle");
  const [lobbyCountdown, setLobbyCountdown] = useState(12);
  const [lobbyMessageIndex, setLobbyMessageIndex] = useState(0);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [players, setPlayers] = useState<LeaderboardEntry[]>([]);
  const [feed, setFeed] = useState<string[]>([]);
  const [solvedProblems, setSolvedProblems] = useState<Set<string>>(new Set());
  const [selectedProblemId, setSelectedProblemId] = useState<string | null>(null);
  const [language, setLanguage] = useState<CodeLanguage>("typescript");
  const [code, setCode] = useState("");
  const [consoleEntries, setConsoleEntries] = useState<ConsoleEntry[]>([]);
  const [startedAt, setStartedAt] = useState(Date.now());
  const [pasteBlocked, setPasteBlocked] = useState(false);
  const [takenToday, setTakenToday] = useState(false);

  const problems = useMemo(() => arenaProblems(catalog.data?.dsaProblems ?? []), [catalog.data?.dsaProblems]);
  const currentProblem = problems.find((problem) => problem.id === selectedProblemId) ?? problems[0];
  const myEntry = entries.find((entry) => entry.userId === user.id);
  const joined = phase === "playing";
  const arenaLimitReached = billing.data?.dailyLimits.rankedArenas !== "UNLIMITED"
    && billing.data?.dailyUsage.rankedArenas !== undefined
    && billing.data.dailyUsage.rankedArenas >= billing.data.dailyLimits.rankedArenas;

  useEffect(() => {
    if (!selectedProblemId && problems[0]) setSelectedProblemId(problems[0].id);
  }, [problems, selectedProblemId]);

  useEffect(() => {
    if (currentProblem) setCode(starterForLanguage(currentProblem, language));
  }, [currentProblem, language]);

  useEffect(() => {
    const saved = localStorage.getItem(`ib-arena-ranking-${todayKey()}`);
    const localTaken = localStorage.getItem(`ib-arena-taken-${todayKey()}`) === "true";
    const backendTaken = Boolean(todayArena.data?.usedRankedToday);
    setTakenToday(localTaken || backendTaken);
    if (saved) {
      const parsed = JSON.parse(saved) as LeaderboardEntry[];
      setEntries(parsed);
      setPlayers(parsed);
    } else if (todayArena.data?.entries.length) {
      const backend = todayArena.data.entries.map((entry) => ({
        userId: entry.userId,
        name: entry.name,
        score: entry.score ?? 0,
        solved: entry.solved ?? 0,
        penalty: entry.penalty ?? 0
      }));
      setEntries(backend);
      setPlayers(backend);
    }
  }, [todayArena.data, user.id]);

  useEffect(() => {
    if (!connected || phase !== "playing") return;
    socket.emit("leaderboard:join", { contestId, user });
    socket.on("leaderboard:update", (payload) => {
      if (payload.contestId !== contestId) return;
      setEntries(payload.entries);
      setPlayers(payload.entries);
      localStorage.setItem(`ib-arena-ranking-${todayKey()}`, JSON.stringify(payload.entries));
    });
    return () => {
      socket.off("leaderboard:update");
    };
  }, [connected, contestId, phase, socket, user]);

  useEffect(() => {
    if (phase !== "playing") return;
    const interval = window.setInterval(() => {
      setEntries((current) => {
        const bots = current.filter((entry) => entry.userId.startsWith("bot-"));
        const bot = bots[Math.floor(Math.random() * bots.length)];
        if (!bot) return current;
        const nextSolved = Math.min(4, bot.solved + (Math.random() > 0.58 ? 1 : 0));
        const nextScore = bot.score + Math.floor(60 + Math.random() * 120);
        const updated = current.map((entry) => entry.userId === bot.userId ? { ...entry, solved: nextSolved, score: nextScore, penalty: entry.penalty + 8 } : entry)
          .sort((a, b) => b.score - a.score || a.penalty - b.penalty);
        setPlayers(updated);
        setFeed((items) => [`${bot.name} solved question ${nextSolved || 1} · ${nextScore} pts`, ...items].slice(0, 8));
        localStorage.setItem(`ib-arena-ranking-${todayKey()}`, JSON.stringify(updated));
        return updated;
      });
    }, 6000);
    return () => window.clearInterval(interval);
  }, [phase]);

  useEffect(() => {
    if (phase !== "matching") return;
    const messageTimer = window.setInterval(() => {
      setLobbyMessageIndex((index) => (index + 1) % lobbyMessages.length);
    }, 1800);
    const countdownTimer = window.setInterval(() => {
      setLobbyCountdown((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => {
      window.clearInterval(messageTimer);
      window.clearInterval(countdownTimer);
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "matching" || lobbyCountdown > 0) return;
    openArenaRoom();
  }, [lobbyCountdown, phase]);

  const handleEditorMount: OnMount = (editor, monaco) => {
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyV, () => {
      setPasteBlocked(true);
      setConsoleEntries((entries) => [{
        id: crypto.randomUUID(),
        level: "info" as ConsoleEntry["level"],
        message: "Paste is disabled in arena submissions.",
        createdAt: new Date().toISOString()
      }, ...entries].slice(0, 6));
    });
    editor.getDomNode()?.addEventListener("paste", (event) => {
      event.preventDefault();
      setPasteBlocked(true);
    });
  };

  function buildArenaRoom() {
    const bots = [...botNames].sort(() => Math.random() - 0.5).slice(0, 6).map((name, index) => ({
      userId: `bot-${index}`,
      name,
      score: Math.max(0, 90 - index * 10),
      solved: index === 0 ? 1 : 0,
      penalty: 40 + index * 9
    }));
    return [{ userId: user.id, name: user.name, score: 0, solved: 0, penalty: 0 }, ...bots];
  }

  function startMatchmaking() {
    if (arenaLimitReached) {
      toast.error("Free plan includes 1 ranked arena per day. Upgrade to Pro for more rooms.");
      router.push("/billing");
      return;
    }
    setPhase("matching");
    setLobbyCountdown(12);
    setLobbyMessageIndex(0);
    setFeed([`${user.name} entered matchmaking.`]);
  }

  function openArenaRoom() {
    const seeded = entries.length ? entries : buildArenaRoom();
    setPhase("playing");
    setStartedAt(Date.now());
    setEntries(seeded);
    setPlayers(seeded);
    setFeed([`${seeded.length - 1} similar-rating players joined.`, "Arena is live. Choose any question first.", ...feed].slice(0, 8));
    localStorage.setItem(`ib-arena-ranking-${todayKey()}`, JSON.stringify(seeded));
  }

  function showResults() {
    setPhase("results");
    if (!entries.length) {
      const backend = todayArena.data?.entries.map((entry) => ({
        userId: entry.userId,
        name: entry.name,
        score: entry.score ?? 0,
        solved: entry.solved ?? 0,
        penalty: entry.penalty ?? 0
      })) ?? [];
      setEntries(backend);
      setPlayers(backend);
    }
  }

  async function runCurrentProblem() {
    if (!currentProblem) return;
    const payload = await runCode.mutateAsync({ code, testCases: currentProblem.testCases, language });
    setConsoleEntries((entries) => [{
      id: crypto.randomUUID(),
      level: (payload.data.ok ? "success" : "error") as ConsoleEntry["level"],
      message: payload.data.message,
      createdAt: new Date().toISOString()
    }, ...entries].slice(0, 8));
  }

  async function submitCurrentProblem() {
    if (!currentProblem) return;
    const payload = await runCode.mutateAsync({ code, testCases: currentProblem.testCases, language });
    setConsoleEntries((entries) => [{
      id: crypto.randomUUID(),
      level: (payload.data.ok ? "success" : "error") as ConsoleEntry["level"],
      message: payload.data.message,
      createdAt: new Date().toISOString()
    }, ...entries].slice(0, 8));
    if (!payload.data.ok) return;

    const nextSolvedSet = new Set(solvedProblems);
    nextSolvedSet.add(currentProblem.id);
    setSolvedProblems(nextSolvedSet);
    const solved = nextSolvedSet.size;
    const elapsedMinutes = Math.max(1, Math.round((Date.now() - startedAt) / 60000));
    const score = solved * 250 + Math.max(0, 200 - elapsedMinutes * 8);
    const nextEntry = { userId: user.id, name: user.name, score, solved, penalty: elapsedMinutes * 10 };

    socket.emit("leaderboard:submit", { contestId, entry: nextEntry });
    const updated = [...entries.filter((entry) => entry.userId !== user.id), nextEntry].sort((a, b) => b.score - a.score || a.penalty - b.penalty);
    setEntries(updated);
    setPlayers(updated);
    setFeed((items) => [`${user.name} accepted ${currentProblem.title} · ${score} pts`, ...items].slice(0, 8));
    localStorage.setItem(`ib-arena-ranking-${todayKey()}`, JSON.stringify(updated));
    if (solved >= 4) {
      localStorage.setItem(`ib-arena-taken-${todayKey()}`, "true");
      setTakenToday(true);
      setPhase("results");
    }

    await submitAttempt.mutateAsync({
      kind: "DSA_CONTEST",
      questionId: currentProblem.slug ? currentProblem.id : undefined,
      title: currentProblem.title,
      topic: currentProblem.topic,
      score: Math.min(100, 62 + solved * 7),
      durationMinutes: elapsedMinutes,
      status: "PASSED",
      feedbackSummary: `Accepted ${currentProblem.title} in today's DSA arena.`,
      problemsSolved: 1,
      skillKeys: currentProblem.skillKeys ?? (currentProblem.topic === "Dynamic Programming" ? ["dsa.dynamic_programming"] : undefined)
    });
    await submitArenaScore.mutateAsync({ mode: "ranked", score, solved, penalty: elapsedMinutes * 10 });
  }

  return (
    <div className="grid gap-6">
      {phase === "idle" ? (
        <section className="arena-surface min-h-[70vh] rounded-lg border p-6 shadow-[0_24px_90px_rgb(0_0_0/0.28)] md:p-10">
          <div className="mx-auto flex max-w-5xl flex-col items-center justify-center py-10 text-center md:py-20">
            <div className="mb-5 flex items-center gap-2 rounded-full border bg-background/70 px-4 py-2 text-sm font-semibold text-primary">
              <Sparkles className="size-4" />
              Daily ranked DSA room
            </div>
            <h2 className="max-w-3xl text-4xl font-black tracking-normal md:text-6xl">
              Compete with your level. Grow faster than yesterday.
            </h2>
            <p className="mt-5 max-w-2xl text-base text-muted-foreground md:text-lg">
              We match you with similar-rating players. If the queue is quiet, smart bots join the room to simulate real contest pressure.
            </p>
            <div className="mt-8 grid w-full max-w-3xl gap-3 md:grid-cols-3">
              <div className="rounded-lg border bg-background/70 p-4">
                <p className="text-2xl font-black">4</p>
                <p className="text-sm text-muted-foreground">adaptive questions</p>
              </div>
              <div className="rounded-lg border bg-background/70 p-4">
                <p className="text-2xl font-black">1</p>
                <p className="text-sm text-muted-foreground">ranked shot today</p>
              </div>
              <div className="rounded-lg border bg-background/70 p-4">
                <p className="text-2xl font-black">Live</p>
                <p className="text-sm text-muted-foreground">room updates</p>
              </div>
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {takenToday || arenaLimitReached ? (
                <Button size="lg" onClick={showResults}>
                  <Trophy className="size-5" />
                  View today&apos;s results
                </Button>
              ) : (
                <Button size="lg" onClick={startMatchmaking}>
                  <Swords className="size-5" />
                  Join arena
                </Button>
              )}
            </div>
          </div>
        </section>
      ) : null}

      {phase === "matching" ? (
        <section className="arena-surface min-h-[72vh] overflow-hidden rounded-lg border p-6 shadow-[0_24px_90px_rgb(0_0_0/0.30)] md:p-10">
          <div className="mx-auto flex max-w-5xl flex-col items-center justify-center py-10 text-center md:py-20">
            <div className="relative grid size-44 place-items-center rounded-full border bg-background/70 shadow-[0_0_80px_hsl(var(--primary)/0.35)]">
              <div className="absolute inset-0 animate-ping rounded-full border border-primary/40" />
              <div className="absolute inset-5 animate-spin rounded-full border-2 border-transparent border-t-primary border-r-accent" />
              <span className="text-6xl font-black">{lobbyCountdown}</span>
            </div>
            <h2 className="mt-8 text-3xl font-black tracking-normal md:text-5xl">Joining arena</h2>
            <p className="mt-3 flex items-center justify-center gap-2 text-base text-muted-foreground">
              <Loader2 className="size-4 animate-spin text-primary" />
              {lobbyMessages[lobbyMessageIndex]}
            </p>
            <div className="mt-8 grid w-full max-w-4xl gap-3 md:grid-cols-4">
              {["You", "Rating band", "Queue", lobbyCountdown <= 5 ? "Bots ready" : "Players"].map((label, index) => (
                <div key={label} className={cn("rounded-lg border bg-background/70 p-4 text-left transition-all", index <= Math.floor((12 - lobbyCountdown) / 3) && "border-primary/50 bg-primary/10")}>
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className="mt-1 font-bold">{index === 0 ? user.name : index === 1 ? "Similar skill" : index === 2 ? "Searching" : "Simulated if needed"}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {phase === "results" ? (
        <section className="arena-surface rounded-lg border p-5 shadow-[0_18px_60px_rgb(0_0_0/0.22)]">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-medium text-primary">Today&apos;s results</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-normal">DSA Arena standings</h2>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Your ranked arena is locked for today. Come back tomorrow for a fresh room.</p>
            </div>
            <Button variant="outline" onClick={() => setPhase("idle")}>Back</Button>
          </div>
          <div className="mt-5 grid gap-2">
            {entries.length ? entries.map((entry, index) => (
              <div key={entry.userId} className={cn("grid grid-cols-[42px_1fr_72px] items-center gap-3 rounded-md border bg-background/70 p-3 text-sm", entry.userId === user.id && "border-primary/50 bg-primary/10")}>
                <span className="text-muted-foreground">#{index + 1}</span>
                <div className="min-w-0">
                  <p className="truncate font-medium">{entry.name}</p>
                  <p className="text-xs text-muted-foreground">{entry.solved}/4 solved · {entry.penalty} penalty</p>
                </div>
                <span className="font-semibold">{entry.score}</span>
              </div>
            )) : <div className="rounded-md border border-dashed bg-background/70 p-4 text-sm text-muted-foreground">No result found yet.</div>}
          </div>
        </section>
      ) : null}

      {phase === "playing" ? (
        <>
      <section className="arena-surface flex flex-col justify-between gap-4 rounded-lg border p-5 shadow-[0_18px_60px_rgb(0_0_0/0.22)] md:flex-row md:items-center">
        <div>
          <p className="text-sm font-medium text-primary">Live ranked room</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-normal">DSA Arena</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Similar-rating room is live. Solve in any order and watch the feed move.
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          <div className="rounded-md border bg-background/70 px-3 py-2 text-sm"><span className="text-muted-foreground">Rank</span><p className="font-semibold">{myEntry ? `#${entries.findIndex((entry) => entry.userId === user.id) + 1}` : "-"}</p></div>
          <div className="rounded-md border bg-background/70 px-3 py-2 text-sm"><span className="text-muted-foreground">Solved</span><p className="font-semibold">{myEntry?.solved ?? 0}/4</p></div>
          <div className="flex items-center gap-2 rounded-md border bg-background/70 px-3 py-2 text-sm"><Radio className="size-4 text-primary" /> {connected ? "Live" : "Offline"}</div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_340px]">
        <Card className="overflow-hidden">
          <CardHeader className="border-b">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle>{currentProblem?.title ?? "Arena problem"}</CardTitle>
                <CardDescription>{currentProblem ? `${currentProblem.topic} · ${currentProblem.difficulty}` : "Loading problem list."}</CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <select value={language} onChange={(event) => setLanguage(event.target.value as CodeLanguage)} className="h-10 rounded-md border bg-background px-3 text-sm">
                  {languageOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
                </select>
                <Button variant="outline" onClick={runCurrentProblem} disabled={!joined || !currentProblem} loading={runCode.isPending}>
                  <Play className="size-4" />
                  Run
                </Button>
                <Button onClick={submitCurrentProblem} disabled={!joined || !currentProblem || solvedProblems.has(currentProblem.id)} loading={submitAttempt.isPending || runCode.isPending}>
                  <Send className="size-4" />
                  Submit
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="border-b bg-background/70 p-5"><ProblemStatement problem={currentProblem} /></div>
            <Editor
              height="520px"
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

        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Question list</CardTitle>
              <CardDescription>Pick any order.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
              {problems.map((problem, index) => (
                <button
                  key={`${problem.id}-${index}`}
                  type="button"
                  onClick={() => setSelectedProblemId(problem.id)}
                  className={cn("rounded-md border p-3 text-left text-sm hover:bg-muted", currentProblem?.id === problem.id && "border-primary bg-primary/10", solvedProblems.has(problem.id) && "border-primary/40 text-primary")}
                >
                  <span className="block font-medium">{index + 1}. {problem.title}</span>
                  <span className="text-xs text-muted-foreground">{index === 2 ? "MEDIUM-HARD" : problem.difficulty} · {problem.topic}</span>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><CheckCircle2 className="size-4 text-primary" /> Console</CardTitle>
              <CardDescription>{pasteBlocked ? "Paste was blocked this session." : "Run output and verdicts."}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
              {consoleEntries.length ? consoleEntries.map((entry) => (
                <div key={entry.id} className={cn("rounded-md border p-3 text-sm", entry.level === "success" && "border-primary/50 text-primary", entry.level === "error" && "border-destructive/50 text-destructive")}>{entry.message}</div>
              )) : <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">No runs yet.</div>}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Clock className="size-4 text-primary" /> Today's ranking</CardTitle>
            <CardDescription>{todayKey()} room standings.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            {entries.length ? entries.map((entry, index) => (
              <div key={entry.userId} className={cn("grid grid-cols-[36px_1fr_64px] items-center gap-3 rounded-md border p-3 text-sm", entry.userId === user.id && "border-primary/50 bg-primary/10")}>
                <span className="text-muted-foreground">#{index + 1}</span>
                <div className="min-w-0">
                  <p className="truncate font-medium">{entry.name}</p>
                  <p className="text-xs text-muted-foreground">{entry.solved}/4 solved · {entry.penalty} penalty</p>
                </div>
                <span className="font-semibold">{entry.score}</span>
              </div>
            )) : <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">Join to enter today's ranking.</div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ShieldAlert className="size-4 text-primary" /> Joined players and live updates</CardTitle>
            <CardDescription>Who joined and what they solved.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              {players.map((player) => (
                <div key={player.userId} className="rounded-md border p-3 text-sm">
                  <p className="font-medium">{player.name}</p>
                  <p className="text-xs text-muted-foreground">{player.solved}/4 solved · {player.score} pts</p>
                </div>
              ))}
              {!players.length ? <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">No one has joined yet.</p> : null}
            </div>
            <div className="grid content-start gap-2">
              {feed.map((item) => <div key={item} className="rounded-md border bg-background/60 p-3 text-sm">{item}</div>)}
              {!feed.length ? <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">Live updates appear here after joining.</p> : null}
            </div>
          </CardContent>
        </Card>
      </section>
        </>
      ) : null}
    </div>
  );
}
