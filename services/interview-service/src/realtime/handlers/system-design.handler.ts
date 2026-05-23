import type { InterviewServer, InterviewSocket } from "../types.js";
import { clearCanvasConnections, deleteCanvasBlock, getCanvas, resetCanvas, updateCanvasBlock, updateCanvasConnection } from "../room-store.js";

export function registerSystemDesignHandlers(io: InterviewServer, socket: InterviewSocket) {
  socket.on("system-design:join", ({ roomId, user }) => {
    socket.data.user = user;
    socket.join(`canvas:${roomId}`);
    socket.emit("system-design:state", getCanvas(roomId));
  });

  socket.on("system-design:block-update", ({ roomId, block, user }) => {
    const canvas = updateCanvasBlock(roomId, block);
    socket.to(`canvas:${roomId}`).emit("system-design:block-updated", {
      roomId,
      block,
      user,
      updatedAt: canvas.updatedAt
    });
  });

  socket.on("system-design:connection-update", ({ roomId, connection, user }) => {
    const canvas = updateCanvasConnection(roomId, connection);
    socket.to(`canvas:${roomId}`).emit("system-design:connection-updated", {
      roomId,
      connection,
      user,
      updatedAt: canvas.updatedAt
    });
  });

  socket.on("system-design:connections-clear", ({ roomId, user }) => {
    const canvas = clearCanvasConnections(roomId);
    io.to(`canvas:${roomId}`).emit("system-design:connections-cleared", {
      roomId,
      user,
      updatedAt: canvas.updatedAt
    });
  });

  socket.on("system-design:block-delete", ({ roomId, blockId, user }) => {
    const canvas = deleteCanvasBlock(roomId, blockId);
    io.to(`canvas:${roomId}`).emit("system-design:block-deleted", {
      roomId,
      blockId,
      user,
      updatedAt: canvas.updatedAt
    });
  });

  socket.on("system-design:canvas-reset", ({ roomId, user }) => {
    const state = resetCanvas(roomId);
    io.to(`canvas:${roomId}`).emit("system-design:canvas-reset", { roomId, state, user });
  });
}
