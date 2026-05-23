import type { InterviewServer, InterviewSocket } from "../types.js";
import { createConsoleEntry, getCodingRoom, joinRoom, leaveRoom, updateCodingRoom } from "../room-store.js";
import { runCode } from "../runner.js";

export function registerCodingHandlers(io: InterviewServer, socket: InterviewSocket) {
  socket.on("room:join", ({ roomId, user }) => {
    socket.data.user = user;
    socket.data.rooms.add(roomId);
    socket.join(roomId);

    const participants = joinRoom(roomId, user);
    io.to(roomId).emit("room:presence", participants);
    socket.emit("room:state", getCodingRoom(roomId));
  });

  socket.on("room:leave", ({ roomId }) => {
    socket.leave(roomId);
    socket.data.rooms.delete(roomId);
    const participants = leaveRoom(roomId, socket.data.user?.id);
    io.to(roomId).emit("room:presence", participants);
  });

  socket.on("coding:patch", ({ roomId, code, language, user }) => {
    const state = updateCodingRoom({ roomId, code, language });
    socket.to(roomId).emit("coding:patch", {
      roomId,
      code: state.code,
      user,
      updatedAt: state.updatedAt
    });
  });

  socket.on("console:run", async ({ roomId, code, language, testCases }) => {
    const result = await runCode(code, testCases, language);
    const entry = createConsoleEntry(result.ok ? "success" : "error", `${language} runner: ${result.message}`);
    io.to(roomId).emit("console:event", entry);
  });
}
