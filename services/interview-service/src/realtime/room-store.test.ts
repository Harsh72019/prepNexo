import { describe, expect, it } from "vitest";
import {
  getCodingRoom,
  getLeaderboard,
  joinRoom,
  leaveRoom,
  updateCodingRoom,
  updateCanvasBlock,
  updateCanvasConnection,
  upsertLeaderboardEntry
} from "./room-store.js";

describe("room-store", () => {
  it("tracks participants and coding room state", () => {
    const roomId = "test-room-participants";
    const user = { id: "u1", name: "Ada", role: "candidate" as const };

    expect(joinRoom(roomId, user)).toEqual([user]);
    expect(getCodingRoom(roomId).participants).toEqual([user]);

    const updated = updateCodingRoom({ roomId, code: "export function solve() {}", language: "typescript" });
    expect(updated.code).toContain("solve");
    expect(updated.participants).toEqual([user]);

    expect(leaveRoom(roomId, user.id)).toEqual([]);
  });

  it("sorts leaderboard entries by score, solved count, then penalty", () => {
    const contestId = "test-contest";
    upsertLeaderboardEntry(contestId, { userId: "a", name: "Ada", score: 900, solved: 3, penalty: 20 });
    upsertLeaderboardEntry(contestId, { userId: "b", name: "Grace", score: 900, solved: 4, penalty: 40 });
    upsertLeaderboardEntry(contestId, { userId: "c", name: "Linus", score: 900, solved: 4, penalty: 10 });

    expect(getLeaderboard(contestId).map((entry) => entry.userId)).toEqual(["c", "b", "a"]);
  });

  it("upserts system design blocks", () => {
    const canvas = updateCanvasBlock("test-canvas", {
      id: "queue",
      type: "queue",
      label: "Jobs",
      x: 120,
      y: 220
    });

    expect(canvas.blocks.some((block) => block.id === "queue" && block.label === "Jobs")).toBe(true);
  });

  it("upserts system design connections", () => {
    const canvas = updateCanvasConnection("test-canvas-connections", {
      id: "client-api",
      from: "client",
      to: "gateway"
    });

    expect(canvas.connections).toContainEqual({ id: "client-api", from: "client", to: "gateway" });
  });
});
