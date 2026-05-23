import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { env } from "./config/env.js";
import { errorHandler, notFound } from "./middlewares/error-handler.js";
import { adaptiveRoutes } from "./routes/adaptive.routes.js";
import { arenaRoutes } from "./routes/arena.routes.js";
import { authRoutes } from "./routes/auth.routes.js";
import { dashboardRoutes } from "./routes/dashboard.routes.js";
import { onboardingRoutes } from "./routes/onboarding.routes.js";
import { practiceRoutes } from "./routes/practice.routes.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.WEB_URL,
      credentials: true
    })
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());
  app.use(
    "/api/auth",
    rateLimit({
      windowMs: 60_000,
      limit: 120,
      standardHeaders: true,
      legacyHeaders: false
    }),
    authRoutes
  );
  app.use("/api/dashboard", dashboardRoutes);
  app.use("/api/practice", practiceRoutes);
  app.use("/api/adaptive", adaptiveRoutes);
  app.use("/api/onboarding", onboardingRoutes);
  app.use("/api/arena", arenaRoutes);
  app.get("/health", (_req, res) =>
    res.json({
      ok: true,
      service: "auth-service",
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    })
  );
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
