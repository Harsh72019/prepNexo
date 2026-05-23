import type { InterviewServer, InterviewSocket } from "../types.js";
import { getLeaderboard, upsertLeaderboardEntry } from "../room-store.js";

export function registerLeaderboardHandlers(io: InterviewServer, socket: InterviewSocket) {
  socket.on("leaderboard:join", ({ contestId, user }) => {
    socket.data.user = user;
    socket.join(`contest:${contestId}`);
    socket.emit("leaderboard:update", { contestId, entries: getLeaderboard(contestId) });
  });

  socket.on("leaderboard:submit", ({ contestId, entry }) => {
    const entries = upsertLeaderboardEntry(contestId, entry);
    io.to(`contest:${contestId}`).emit("leaderboard:update", { contestId, entries });
  });
}
