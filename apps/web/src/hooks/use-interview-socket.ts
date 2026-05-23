"use client";

import type {
  ClientToServerEvents,
  ServerToClientEvents
} from "@interview-battlefield/types";
import { useEffect, useMemo, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { env } from "@/lib/env";

export type InterviewSocketClient = Socket<ServerToClientEvents, ClientToServerEvents>;

export function useInterviewSocket() {
  const [connected, setConnected] = useState(false);
  const socket = useMemo<InterviewSocketClient>(() => {
    return io(env.interviewServiceUrl, {
      autoConnect: false,
      transports: ["websocket", "polling"]
    });
  }, []);

  useEffect(() => {
    socket.connect();
    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, [socket]);

  return { socket, connected };
}
