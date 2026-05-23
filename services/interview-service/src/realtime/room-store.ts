import type {
  CodingRoomState,
  ConsoleEntry,
  LeaderboardEntry,
  RealtimeUser,
  SystemDesignConnection,
  SystemDesignCanvasState
} from "@interview-battlefield/types";
import { randomUUID } from "node:crypto";

const codingRooms = new Map<string, CodingRoomState>();
const participants = new Map<string, Map<string, RealtimeUser>>();
const leaderboards = new Map<string, LeaderboardEntry[]>();
const canvases = new Map<string, SystemDesignCanvasState>();

export function joinRoom(roomId: string, user: RealtimeUser) {
  const roomParticipants = participants.get(roomId) ?? new Map<string, RealtimeUser>();
  roomParticipants.set(user.id, user);
  participants.set(roomId, roomParticipants);
  return Array.from(roomParticipants.values());
}

export function leaveRoom(roomId: string, userId?: string) {
  if (!userId) return getParticipants(roomId);
  const roomParticipants = participants.get(roomId);
  roomParticipants?.delete(userId);
  return getParticipants(roomId);
}

export function getParticipants(roomId: string) {
  return Array.from(participants.get(roomId)?.values() ?? []);
}

export function getCodingRoom(roomId: string): CodingRoomState {
  const existing = codingRooms.get(roomId);
  if (existing) {
    return { ...existing, participants: getParticipants(roomId) };
  }

  const created: CodingRoomState = {
    roomId,
    language: "typescript",
    code: [
      "type TestCase = { input: number[]; expected: number };",
      "",
      "export function solve(nums: number[]) {",
      "  return nums.reduce((sum, value) => sum + value, 0);",
      "}"
    ].join("\n"),
    participants: getParticipants(roomId),
    updatedAt: new Date().toISOString()
  };
  codingRooms.set(roomId, created);
  return created;
}

export function updateCodingRoom(input: Pick<CodingRoomState, "roomId" | "code" | "language">) {
  const current = getCodingRoom(input.roomId);
  const next: CodingRoomState = {
    ...current,
    code: input.code,
    language: input.language,
    participants: getParticipants(input.roomId),
    updatedAt: new Date().toISOString()
  };
  codingRooms.set(input.roomId, next);
  return next;
}

export function createConsoleEntry(level: ConsoleEntry["level"], message: string): ConsoleEntry {
  return {
    id: randomUUID(),
    level,
    message,
    createdAt: new Date().toISOString()
  };
}

export function upsertLeaderboardEntry(contestId: string, entry: LeaderboardEntry) {
  const entries = leaderboards.get(contestId) ?? [];
  const next = [...entries.filter((item) => item.userId !== entry.userId), entry]
    .sort((a, b) => b.score - a.score || b.solved - a.solved || a.penalty - b.penalty)
    .slice(0, 50);
  leaderboards.set(contestId, next);
  return next;
}

export function getLeaderboard(contestId: string) {
  return leaderboards.get(contestId) ?? [];
}

export function getCanvas(roomId: string): SystemDesignCanvasState {
  const existing = canvases.get(roomId);
  if (existing) return { ...existing, connections: existing.connections ?? [] };

  const created: SystemDesignCanvasState = {
    roomId,
    blocks: [
      { id: "client", type: "client", label: "Client", x: 80, y: 120 },
      { id: "gateway", type: "gateway", label: "API Gateway", x: 260, y: 120 },
      { id: "service", type: "service", label: "Interview API", x: 460, y: 120 },
      { id: "cache", type: "cache", label: "Redis", x: 460, y: 260 },
      { id: "database", type: "database", label: "Postgres", x: 660, y: 120 }
    ],
    connections: [
      { id: "client-gateway", from: "client", to: "gateway" },
      { id: "gateway-service", from: "gateway", to: "service" },
      { id: "service-cache", from: "service", to: "cache" },
      { id: "service-database", from: "service", to: "database" }
    ],
    updatedAt: new Date().toISOString()
  };
  canvases.set(roomId, created);
  return created;
}

export function updateCanvasBlock(roomId: string, block: SystemDesignCanvasState["blocks"][number]) {
  const canvas = getCanvas(roomId);
  const blocks = [...canvas.blocks.filter((item) => item.id !== block.id), block];
  const next = { ...canvas, blocks, updatedAt: new Date().toISOString() };
  canvases.set(roomId, next);
  return next;
}

export function updateCanvasConnection(roomId: string, connection: SystemDesignConnection) {
  const canvas = getCanvas(roomId);
  const connections = [...canvas.connections.filter((item) => item.id !== connection.id), connection];
  const next = { ...canvas, connections, updatedAt: new Date().toISOString() };
  canvases.set(roomId, next);
  return next;
}

export function clearCanvasConnections(roomId: string) {
  const canvas = getCanvas(roomId);
  const next = { ...canvas, connections: [], updatedAt: new Date().toISOString() };
  canvases.set(roomId, next);
  return next;
}

export function deleteCanvasBlock(roomId: string, blockId: string) {
  const canvas = getCanvas(roomId);
  const next = {
    ...canvas,
    blocks: canvas.blocks.filter((block) => block.id !== blockId),
    connections: canvas.connections.filter((connection) => connection.from !== blockId && connection.to !== blockId),
    updatedAt: new Date().toISOString()
  };
  canvases.set(roomId, next);
  return next;
}

export function resetCanvas(roomId: string) {
  const next: SystemDesignCanvasState = {
    roomId,
    blocks: [],
    connections: [],
    updatedAt: new Date().toISOString()
  };
  canvases.set(roomId, next);
  return next;
}
