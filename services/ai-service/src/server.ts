import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { errorHandler, notFound } from "./middlewares/error-handler.js";
import { aiRoutes } from "./routes/ai.routes.js";

const app = express();

app.use(cors({ origin: env.WEB_URL, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use("/api/ai", aiRoutes);
app.get("/health", (_req, res) =>
  res.json({
    ok: true,
    service: "ai-service",
    model: env.GEMINI_MODEL,
    geminiConfigured: Boolean(env.GEMINI_API_KEY),
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  })
);
app.use(notFound);
app.use(errorHandler);

const server = app.listen(env.PORT, () => console.info(`ai-service listening on :${env.PORT} using ${env.GEMINI_MODEL}`));

process.on("SIGTERM", () => {
  server.close(() => process.exit(0));
});
