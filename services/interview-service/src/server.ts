import { createServer } from "node:http";
import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { runCode } from "./realtime/runner.js";
import { createSocketServer } from "./realtime/socket-server.js";

const app = express();
const server = createServer(app);

app.use(cors({ origin: env.webUrl, credentials: true }));
app.use(express.json());
app.post("/api/interview/run", async (req, res) => {
  const code = typeof req.body?.code === "string" ? req.body.code : "";
  const testCases = Array.isArray(req.body?.testCases) ? req.body.testCases : undefined;
  const language = typeof req.body?.language === "string" ? req.body.language : "typescript";
  res.json({ data: await runCode(code, testCases, language) });
});
app.get("/health", (_req, res) =>
  res.json({
    ok: true,
    service: "interview-service",
    realtime: true,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  })
);

const io = await createSocketServer(server);

server.listen(env.port, () => console.info(`interview-service listening on :${env.port}`));

process.on("SIGTERM", () => {
  io.close();
  server.close(() => process.exit(0));
});
