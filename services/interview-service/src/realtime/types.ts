import type {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData
} from "@interview-battlefield/types";
import type { Server, Socket } from "socket.io";

export type InterviewServer = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
export type InterviewSocket = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
