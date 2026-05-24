"use client";

import type { RealtimeUser, SystemDesignBlock, SystemDesignCanvasState } from "@interview-battlefield/types";
import { Button } from "@interview-battlefield/ui/components/button";
import { Input } from "@interview-battlefield/ui/components/input";
import { cn } from "@interview-battlefield/ui/lib/utils";
import { Bot, Boxes, Cable, ChevronDown, Database, HardDrive, Link2, Network, Play, Plus, RotateCcw, Send, Server, ShieldCheck, Siren, Sparkles, Trash2, Zap } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { MarkdownContent } from "@/components/ai/markdown-content";
import { usePressurePrompt } from "@/hooks/use-adaptive";
import { useInterviewSocket } from "@/hooks/use-interview-socket";
import { usePracticeCatalog, useSubmitAttempt } from "@/hooks/use-practice";
import { aiStreamApi } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

const blockStyle: Record<SystemDesignBlock["type"], string> = {
  client: "border-sky-400/50 bg-sky-400/10",
  gateway: "border-primary/50 bg-primary/10",
  service: "border-accent/50 bg-accent/10",
  database: "border-violet-400/50 bg-violet-400/10",
  cache: "border-rose-400/50 bg-rose-400/10",
  queue: "border-cyan-400/50 bg-cyan-400/10",
  storage: "border-emerald-400/50 bg-emerald-400/10"
};

const blockPalette: Array<{ type: SystemDesignBlock["type"]; label: string }> = [
  { type: "client", label: "Mobile app" },
  { type: "client", label: "Web app" },
  { type: "gateway", label: "API gateway" },
  { type: "gateway", label: "Load balancer" },
  { type: "service", label: "Auth service" },
  { type: "service", label: "Interview service" },
  { type: "service", label: "AI evaluator" },
  { type: "database", label: "Postgres primary" },
  { type: "database", label: "Read replica" },
  { type: "cache", label: "Redis cache" },
  { type: "queue", label: "Kafka topic" },
  { type: "queue", label: "Job queue" },
  { type: "storage", label: "Object storage" },
  { type: "storage", label: "CDN" }
];

const blockIcons: Record<SystemDesignBlock["type"], typeof Server> = {
  client: Send,
  gateway: Network,
  service: Server,
  database: Database,
  cache: Zap,
  queue: Cable,
  storage: HardDrive
};

const emptyCanvas = (roomId: string): SystemDesignCanvasState => ({
  roomId,
  blocks: [],
  connections: [],
  updatedAt: new Date().toISOString()
});

export function SystemDesignCanvas({ roomId = "demo-system-design" }: { roomId?: string }) {
  const { socket, connected } = useInterviewSocket();
  const pressurePrompt = usePressurePrompt();
  const catalog = usePracticeCatalog();
  const submitAttempt = useSubmitAttempt();
  const authUser = useAuthStore((state) => state.user);
  const user = useMemo<RealtimeUser>(() => ({ id: authUser?.id ?? "guest-candidate", name: authUser?.name ?? "Guest Candidate" }), [authUser]);
  const [screen, setScreen] = useState<"home" | "canvas">("home");
  const [canvas, setCanvas] = useState<SystemDesignCanvasState | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackStreaming, setFeedbackStreaming] = useState(false);
  const [selectedScenarioId, setSelectedScenarioId] = useState("collab-interview-platform");
  const [scenarioPickerOpen, setScenarioPickerOpen] = useState(false);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [connectMode, setConnectMode] = useState(false);
  const [customLabel, setCustomLabel] = useState("New service");
  const [customType, setCustomType] = useState<SystemDesignBlock["type"]>("service");
  const [incidents, setIncidents] = useState<string[]>([]);
  const [startedAt, setStartedAt] = useState(Date.now());
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef({ moved: false });
  const selectedScenario = catalog.data?.designScenarios.find((scenario) => scenario.id === selectedScenarioId) ?? catalog.data?.designScenarios[0];
  const selectedBlock = canvas?.blocks.find((block) => block.id === selectedBlockId);

  useEffect(() => {
    if (!connected) return;
    socket.emit("system-design:join", { roomId, user });
    socket.on("system-design:state", (roomState) => {
      setCanvas((current) => current ?? roomState);
    });
    socket.on("system-design:block-updated", ({ block, updatedAt }) => {
      setCanvas((current) => {
        if (!current) return current;
        return {
          ...current,
          updatedAt,
          blocks: [...current.blocks.filter((item) => item.id !== block.id), block]
        };
      });
    });
    socket.on("system-design:connection-updated", ({ connection, updatedAt }) => {
      setCanvas((current) => current ? {
        ...current,
        updatedAt,
        connections: [...current.connections.filter((item) => item.id !== connection.id), connection]
      } : current);
    });
    socket.on("system-design:connections-cleared", ({ updatedAt }) => {
      setCanvas((current) => current ? { ...current, updatedAt, connections: [] } : current);
    });
    socket.on("system-design:block-deleted", ({ blockId, updatedAt }) => {
      setCanvas((current) => current ? {
        ...current,
        updatedAt,
        blocks: current.blocks.filter((block) => block.id !== blockId),
        connections: current.connections.filter((connection) => connection.from !== blockId && connection.to !== blockId)
      } : current);
      setSelectedBlockId((current) => current === blockId ? null : current);
    });
    socket.on("system-design:canvas-reset", ({ state }) => {
      setCanvas(state);
      setSelectedBlockId(null);
      setFeedback(null);
    });
    return () => {
      socket.off("system-design:state");
      socket.off("system-design:block-updated");
      socket.off("system-design:connection-updated");
      socket.off("system-design:connections-cleared");
      socket.off("system-design:block-deleted");
      socket.off("system-design:canvas-reset");
    };
  }, [connected, roomId, socket, user]);

  useEffect(() => {
    setCanvas((current) => current ?? emptyCanvas(roomId));
  }, [roomId]);

  function updateBlock(block: SystemDesignBlock) {
    if (dragStateRef.current.moved && !connectMode) {
      dragStateRef.current.moved = false;
      return;
    }
    dragStateRef.current.moved = false;
    if (!connectMode) {
      setSelectedBlockId(block.id);
      return;
    }
    if (selectedBlockId && selectedBlockId !== block.id) {
      const connection = {
        id: `${selectedBlockId}-${block.id}`,
        from: selectedBlockId,
        to: block.id
      };
      setCanvas((current) => {
        if (!current || current.connections.some((item) => item.id === connection.id)) return current;
        return {
          ...current,
          updatedAt: new Date().toISOString(),
          connections: [...current.connections, connection]
        };
      });
      socket.emit("system-design:connection-update", { roomId, connection, user });
      setSelectedBlockId(null);
      return;
    }
    setSelectedBlockId(block.id);
  }

  function moveBlock(block: SystemDesignBlock, x: number, y: number) {
    let next = block;
    setCanvas((current) => {
      if (!current) return current;
      next = {
        ...block,
        x: Math.max(8, Math.min(x, Math.max((canvasRef.current?.clientWidth ?? 960) - 160, 8))),
        y: Math.max(8, Math.min(y, Math.max((canvasRef.current?.clientHeight ?? 560) - 90, 8)))
      };
      return {
        ...current,
        updatedAt: new Date().toISOString(),
        blocks: current.blocks.map((item) => item.id === block.id ? next : item)
      };
    });
    socket.emit("system-design:block-update", { roomId, block: next, user });
  }

  function addBlock(type: SystemDesignBlock["type"], label = type.replace("-", " ")) {
    const index = canvas?.blocks.length ?? 0;
    const block: SystemDesignBlock = {
      id: `${type}-${Date.now()}`,
      type,
      label,
      x: 92 + ((index * 190) % 760),
      y: 92 + (Math.floor(index / 5) * 126)
    };
    setCanvas((current) => current ? { ...current, blocks: [...current.blocks, block] } : { roomId, blocks: [block], connections: [], updatedAt: new Date().toISOString() });
    socket.emit("system-design:block-update", { roomId, block, user });
  }

  function updateSelectedLabel(label: string) {
    setCanvas((current) => {
      if (!current || !selectedBlockId) return current;
      const block = current.blocks.find((item) => item.id === selectedBlockId);
      if (!block) return current;
      const next = { ...block, label };
      socket.emit("system-design:block-update", { roomId, block: next, user });
      return {
        ...current,
        updatedAt: new Date().toISOString(),
        blocks: current.blocks.map((item) => item.id === selectedBlockId ? next : item)
      };
    });
  }

  function deleteSelectedBlock() {
    if (!selectedBlockId) return;
    const blockId = selectedBlockId;
    setCanvas((current) => current ? {
      ...current,
      blocks: current.blocks.filter((block) => block.id !== blockId),
      connections: current.connections.filter((edge) => edge.from !== blockId && edge.to !== blockId),
      updatedAt: new Date().toISOString()
    } : current);
    setSelectedBlockId(null);
    socket.emit("system-design:block-delete", { roomId, blockId, user });
  }

  function resetCanvas() {
    setCanvas(emptyCanvas(roomId));
    setSelectedBlockId(null);
    setFeedback(null);
    socket.emit("system-design:canvas-reset", { roomId, user });
  }

  function clearConnections() {
    setCanvas((current) => current ? { ...current, connections: [], updatedAt: new Date().toISOString() } : current);
    socket.emit("system-design:connections-clear", { roomId, user });
  }

  function startCanvas() {
    setScreen("canvas");
    setStartedAt(Date.now());
  }

  async function requestCritique() {
    const blockNotes = (canvas?.blocks ?? [])
      .sort((a, b) => a.x - b.x)
      .map((block) => `${block.label} (${block.type}) at x=${block.x}, y=${block.y}`)
      .join("\n");
    const edgeNotes = (canvas?.connections ?? []).map((edge) => `${edge.from} -> ${edge.to}`).join("\n") || "No connections defined.";
    const incidentNotes = incidents.length > 0 ? incidents.join("\n") : "No injected failures yet.";
    setFeedback("");
    setFeedbackStreaming(true);
    try {
      await aiStreamApi.systemDesignFeedback(
        {
          scenario: selectedScenario?.prompt ?? "Design a scalable interview preparation platform.",
          designNotes: `Blocks:\n${blockNotes}\n\nConnections:\n${edgeNotes}\n\nInjected incidents:\n${incidentNotes}`
        },
        (token) => setFeedback((current) => `${current ?? ""}${token}`)
      );
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "AI critique failed");
    } finally {
      setFeedbackStreaming(false);
    }
  }

  async function injectIncident() {
    const response = await pressurePrompt.mutateAsync({ surface: "system-design", topic: selectedScenario?.title });
    setIncidents((current) => [response.prompt, ...current].slice(0, 5));
  }

  async function saveDesignAttempt() {
    await submitAttempt.mutateAsync({
      kind: "SYSTEM_DESIGN",
      title: selectedScenario?.title ?? "System design practice",
      topic: "System Design",
      score: (canvas?.connections.length ?? 0) >= 4 ? 82 : 62,
      durationMinutes: Math.max(1, Math.round((Date.now() - startedAt) / 60000)),
      status: (canvas?.connections.length ?? 0) >= 4 ? "PASSED" : "NEEDS_REVIEW",
      feedbackSummary: `${canvas?.blocks.length ?? 0} blocks and ${canvas?.connections.length ?? 0} connections modeled.`,
      problemsSolved: 1,
      skillKeys: ["system.scalability", "system.database_design", "system.fault_tolerance", "system.caching"],
      pressureScore: incidents.length > 0 ? 78 : 52,
      communicationScore: 66
    });
  }

  function connectionPath(from: SystemDesignBlock, to: SystemDesignBlock) {
    const blockWidth = 144;
    const blockHeight = 76;
    const start = {
      x: from.x + (to.x >= from.x ? blockWidth : 0),
      y: from.y + blockHeight / 2
    };
    const end = {
      x: to.x + (to.x >= from.x ? 0 : blockWidth),
      y: to.y + blockHeight / 2
    };
    const horizontalGap = Math.abs(end.x - start.x);
    const bendX = horizontalGap > 120 ? start.x + (end.x - start.x) / 2 : start.x + (to.x >= from.x ? 72 : -72);
    return `M ${start.x} ${start.y} C ${bendX} ${start.y}, ${bendX} ${end.y}, ${end.x} ${end.y}`;
  }

  if (screen === "home") {
    return (
      <div className="grid gap-6">
        <section className="arena-surface min-h-[70vh] rounded-lg border p-6 shadow-[0_24px_90px_rgb(0_0_0/0.28)] md:p-10">
          <div className="mx-auto flex max-w-5xl flex-col items-center justify-center py-10 text-center md:py-20">
            <div className="mb-5 flex items-center gap-2 rounded-full border bg-background/70 px-4 py-2 text-sm font-semibold text-primary">
              <Sparkles className="size-4" />
              System design lab
            </div>
            <h2 className="max-w-3xl text-4xl font-black tracking-normal md:text-6xl">
              Build architecture like a real interview whiteboard.
            </h2>
            <p className="mt-5 max-w-2xl text-base text-muted-foreground md:text-lg">
              Add services, databases, queues, caches, gateways, and clients. Connect them with live lines, inject failures, then ask AI for architecture feedback.
            </p>
            <div className="mt-8 grid w-full max-w-4xl gap-3 md:grid-cols-3">
              <div className="rounded-lg border bg-background/70 p-4">
                <Boxes className="mx-auto size-6 text-primary" />
                <p className="mt-3 font-bold">Drag blocks</p>
                <p className="mt-1 text-sm text-muted-foreground">Sketch the system from client to data layer.</p>
              </div>
              <div className="rounded-lg border bg-background/70 p-4">
                <Cable className="mx-auto size-6 text-primary" />
                <p className="mt-3 font-bold">Connect flows</p>
                <p className="mt-1 text-sm text-muted-foreground">Click source, then destination to draw lines.</p>
              </div>
              <div className="rounded-lg border bg-background/70 p-4">
                <ShieldCheck className="mx-auto size-6 text-primary" />
                <p className="mt-3 font-bold">Pressure-test</p>
                <p className="mt-1 text-sm text-muted-foreground">Inject incidents and get design critique.</p>
              </div>
            </div>
            <Button className="mt-8" size="lg" onClick={startCanvas}>
              <Play className="size-5" />
              Open canvas
            </Button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <section className="arena-surface rounded-lg border shadow-[0_18px_60px_rgb(0_0_0/0.22)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-background/45 px-4 py-3 backdrop-blur">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase text-primary">System design simulator</p>
            <h2 className="truncate text-xl font-semibold tracking-normal">{selectedScenario?.title ?? "Collaborative architecture"}</h2>
          </div>
          <div className="relative">
            <Button variant="outline" onClick={() => setScenarioPickerOpen((current) => !current)}>
              <Network className="size-4" />
              Scenario
              <ChevronDown className={cn("size-4 transition-transform", scenarioPickerOpen && "rotate-180")} />
            </Button>
            {scenarioPickerOpen ? (
              <div className="absolute right-0 top-12 z-50 grid max-h-[420px] w-[min(92vw,420px)] gap-2 overflow-auto rounded-lg border bg-background p-2 shadow-2xl">
                {(catalog.data?.designScenarios ?? []).map((scenario) => (
                  <button
                    key={scenario.id}
                    type="button"
                    onClick={() => {
                      setSelectedScenarioId(scenario.id);
                      setStartedAt(Date.now());
                      setScenarioPickerOpen(false);
                    }}
                    className={cn("rounded-md border p-3 text-left text-sm transition hover:bg-muted", scenario.id === selectedScenarioId && "border-primary bg-primary/10")}
                  >
                    <span className="block font-medium">{scenario.title}</span>
                    <span className="text-xs text-muted-foreground">{scenario.difficulty}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
        <div className="grid min-h-[720px] gap-0 xl:grid-cols-[260px_minmax(560px,1fr)_300px]">
          <aside className="border-b bg-background/35 p-3 xl:border-b-0 xl:border-r">
            <div className="grid gap-3">
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground">Block palette</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {blockPalette.map((item) => {
                    const Icon = blockIcons[item.type];
                    return (
                      <button
                        key={`${item.type}-${item.label}`}
                        type="button"
                        onClick={() => addBlock(item.type, item.label)}
                        className="flex min-h-16 flex-col items-start justify-between rounded-md border bg-background/70 p-2 text-left text-xs font-medium transition hover:border-primary hover:bg-primary/10"
                      >
                        <Icon className="size-4 text-primary" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="grid gap-2 rounded-md border bg-background/60 p-3">
                <p className="text-xs font-semibold uppercase text-muted-foreground">Custom block</p>
                <Input value={customLabel} onChange={(event) => setCustomLabel(event.target.value)} />
                <select
                  value={customType}
                  onChange={(event) => setCustomType(event.target.value as SystemDesignBlock["type"])}
                  className="h-10 rounded-md border bg-background px-3 text-sm"
                >
                  {(["client", "gateway", "service", "database", "cache", "queue", "storage"] as const).map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <Button size="sm" onClick={() => addBlock(customType, customLabel || customType)}>
                  <Plus className="size-4" />
                  Add block
                </Button>
              </div>
            </div>
          </aside>

          <main className="min-w-0 p-3">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <Button size="sm" variant={connectMode ? "default" : "outline"} onClick={() => setConnectMode((current) => !current)}>
                  <Link2 className="size-4" />
                  {connectMode ? selectedBlockId ? "Pick target" : "Pick source" : "Connect"}
                </Button>
                <Button size="sm" variant="outline" onClick={clearConnections}>Clear lines</Button>
                <Button size="sm" variant="outline" onClick={resetCanvas}>
                  <RotateCcw className="size-4" />
                  Reset
                </Button>
              </div>
              <div className="rounded-md border bg-background/70 px-3 py-2 text-xs text-muted-foreground">
                {canvas?.blocks.length ?? 0} blocks · {canvas?.connections.length ?? 0} lines · {connected ? "Live" : "Offline"}
              </div>
            </div>
          <div
            ref={canvasRef}
            onClick={(event) => {
              if (event.target === event.currentTarget) setSelectedBlockId(null);
            }}
            className="relative h-[640px] overflow-hidden rounded-lg border bg-background bg-[linear-gradient(hsl(var(--border))_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border))_1px,transparent_1px)] bg-[size:32px_32px] shadow-inner"
          >
            {connectMode ? (
              <div className="absolute left-4 top-4 z-20 rounded-lg border bg-background/85 px-3 py-2 text-sm font-medium shadow-sm backdrop-blur">
                <Zap className="mr-1 inline size-4 text-primary" />
                {selectedBlockId ? "Now click the destination block" : "Click the source block to start a line"}
              </div>
            ) : null}
            <svg className="pointer-events-none absolute inset-0 size-full">
              <defs>
                <marker id="system-design-arrow" markerHeight="8" markerWidth="8" orient="auto" refX="7" refY="4">
                  <path d="M0,0 L8,4 L0,8 z" fill="hsl(var(--primary))" />
                </marker>
              </defs>
              {canvas?.connections.map((edge) => {
                const from = canvas?.blocks.find((block) => block.id === edge.from);
                const to = canvas?.blocks.find((block) => block.id === edge.to);
                if (!from || !to) return null;
                return (
                  <path
                    key={`${edge.from}-${edge.to}`}
                    d={connectionPath(from, to)}
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    markerEnd="url(#system-design-arrow)"
                  />
                );
              })}
            </svg>
            {canvas?.blocks.map((block) => (
              <button
                key={block.id}
                type="button"
                onClick={() => {
                  if (!connectMode) updateBlock(block);
                }}
                onPointerDown={(event) => {
                  if (connectMode) {
                    event.preventDefault();
                    updateBlock(block);
                    return;
                  }
                  dragStateRef.current.moved = false;
                  const rect = canvasRef.current?.getBoundingClientRect();
                  if (!rect) return;
                  const offsetX = event.clientX - rect.left - block.x;
                  const offsetY = event.clientY - rect.top - block.y;
                  event.currentTarget.setPointerCapture(event.pointerId);
                  const onMove = (moveEvent: PointerEvent) => {
                    dragStateRef.current.moved = true;
                    moveBlock(block, moveEvent.clientX - rect.left - offsetX, moveEvent.clientY - rect.top - offsetY);
                  };
                  const onUp = () => {
                    window.removeEventListener("pointermove", onMove);
                    window.removeEventListener("pointerup", onUp);
                  };
                  window.addEventListener("pointermove", onMove);
                  window.addEventListener("pointerup", onUp);
                }}
                className={cn("absolute w-36 rounded-md border p-3 text-left text-sm shadow-sm transition-transform hover:scale-[1.02]", blockStyle[block.type], selectedBlockId === block.id && "ring-2 ring-primary")}
                style={{ left: block.x, top: block.y }}
              >
                <span className="block font-medium">{block.label}</span>
                <span className="text-xs text-muted-foreground">{block.type}</span>
              </button>
            ))}
            {(canvas?.blocks.length ?? 0) === 0 ? (
              <div className="absolute inset-0 grid place-items-center p-6 text-center">
                <div className="max-w-sm rounded-lg border border-dashed bg-background/80 p-6">
                  <p className="text-sm font-medium">Empty canvas</p>
                  <p className="mt-2 text-sm text-muted-foreground">Use the block palette to add clients, services, databases, queues, caches, and storage nodes.</p>
                </div>
              </div>
            ) : null}
          </div>
          </main>

          <aside className="grid content-start gap-3 border-t bg-background/35 p-3 xl:border-l xl:border-t-0">
            <div className="rounded-md border bg-background/60 p-3">
              <p className="text-xs font-semibold uppercase text-muted-foreground">Selected block</p>
              <Input
                className="mt-2"
                value={selectedBlock?.label ?? ""}
                onChange={(event) => updateSelectedLabel(event.target.value)}
                disabled={!selectedBlockId}
                placeholder="Select a block"
              />
              <Button className="mt-2 w-full" variant="outline" size="sm" onClick={deleteSelectedBlock} disabled={!selectedBlockId}>
                <Trash2 className="size-4" />
                Delete selected
              </Button>
            </div>
            <div className="grid gap-2 rounded-md border bg-background/60 p-3">
              <p className="text-xs font-semibold uppercase text-muted-foreground">Actions</p>
              <Button variant="outline" onClick={injectIncident} loading={pressurePrompt.isPending}>
                <Siren className="size-4" />
                Inject failure
              </Button>
              <Button variant="outline" onClick={requestCritique} loading={feedbackStreaming}>
                <Bot className="size-4" />
                AI critique
              </Button>
              <Button onClick={saveDesignAttempt} loading={submitAttempt.isPending}>Save attempt</Button>
            </div>
            <div className="rounded-md border bg-background/60 p-3">
              <p className="text-xs font-semibold uppercase text-muted-foreground">Scenario brief</p>
              <p className="mt-2 text-sm text-muted-foreground">{selectedScenario?.prompt ?? "Choose a scenario to start."}</p>
            </div>
            {incidents.length > 0 ? (
              <div className="grid max-h-40 gap-2 overflow-auto rounded-md border bg-background/60 p-3">
                <p className="text-xs font-semibold uppercase text-muted-foreground">Failures</p>
                {incidents.map((incident) => (
                  <div key={incident} className="rounded-md border border-accent/40 bg-accent/10 p-2 text-xs text-accent">{incident}</div>
                ))}
              </div>
            ) : null}
            <div className="rounded-md border bg-background/60 p-3">
              <p className="flex items-center gap-2 text-sm font-semibold"><Bot className="size-4 text-primary" /> Gemini critique</p>
              <div className="mt-2 max-h-64 overflow-auto rounded-md border bg-background/70 p-3 text-sm">
                {feedback !== null ? (
                  <MarkdownContent text={feedback || "Thinking..."} />
                ) : (
                  <p className="text-muted-foreground">Request a critique after arranging the blocks.</p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
