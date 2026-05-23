import { createAdapter } from "@socket.io/redis-adapter";
import type { Server as HttpServer } from "node:http";
import { Redis } from "ioredis";
import { Server } from "socket.io";
import { env } from "../config/env.js";
import { registerCodingHandlers } from "./handlers/coding.handler.js";
import { registerLeaderboardHandlers } from "./handlers/leaderboard.handler.js";
import { registerSystemDesignHandlers } from "./handlers/system-design.handler.js";
import type { InterviewServer } from "./types.js";
import { leaveRoom } from "./room-store.js";

export async function createSocketServer(httpServer: HttpServer) {
  const io: InterviewServer = new Server(httpServer, {
    cors: {
      origin: env.webUrl,
      credentials: true
    },
    transports: ["websocket", "polling"]
  });

  await attachRedisAdapter(io);

  io.use((socket, next) => {
    socket.data.rooms = new Set<string>();
    next();
  });

  io.on("connection", (socket) => {
    registerCodingHandlers(io, socket);
    registerLeaderboardHandlers(io, socket);
    registerSystemDesignHandlers(io, socket);

    socket.on("disconnect", () => {
      for (const roomId of socket.data.rooms) {
        const participants = leaveRoom(roomId, socket.data.user?.id);
        io.to(roomId).emit("room:presence", participants);
      }
    });
  });

  return io;
}

async function attachRedisAdapter(io: InterviewServer) {
  try {
    const pubClient = new Redis(env.redisUrl, { lazyConnect: true, maxRetriesPerRequest: 1 });
    const subClient = pubClient.duplicate();
    await Promise.all([pubClient.connect(), subClient.connect()]);
    io.adapter(createAdapter(pubClient, subClient));
    console.info("Socket.IO Redis adapter connected");
  } catch (error) {
    console.warn("Socket.IO Redis adapter unavailable; using in-memory adapter", error);
  }
}
