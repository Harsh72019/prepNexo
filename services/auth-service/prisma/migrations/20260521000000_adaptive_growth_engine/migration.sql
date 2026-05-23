CREATE TABLE "SkillNode" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "domain" TEXT NOT NULL,
  "score" INTEGER NOT NULL DEFAULT 45,
  "confidence" INTEGER NOT NULL DEFAULT 45,
  "volatility" INTEGER NOT NULL DEFAULT 50,
  "exposure" INTEGER NOT NULL DEFAULT 0,
  "mastery" INTEGER NOT NULL DEFAULT 0,
  "trend" INTEGER NOT NULL DEFAULT 0,
  "weakRecurrence" INTEGER NOT NULL DEFAULT 0,
  "lastPracticedAt" TIMESTAMP(3),
  "nextReviewAt" TIMESTAMP(3),
  "evidence" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "SkillNode_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "GrowthEvent" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "source" TEXT NOT NULL,
  "skillKey" TEXT,
  "value" INTEGER NOT NULL,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "GrowthEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AdaptiveSession" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PLANNED',
  "difficulty" TEXT NOT NULL,
  "focusSkills" JSONB NOT NULL,
  "pressureLevel" INTEGER NOT NULL DEFAULT 40,
  "estimatedMinutes" INTEGER NOT NULL DEFAULT 45,
  "rationale" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "completedAt" TIMESTAMP(3),

  CONSTRAINT "AdaptiveSession_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SessionTask" (
  "id" TEXT NOT NULL,
  "sessionId" TEXT NOT NULL,
  "kind" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "skillKey" TEXT NOT NULL,
  "difficulty" TEXT NOT NULL,
  "prompt" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'TODO',
  "order" INTEGER NOT NULL,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "SessionTask_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CoachMemory" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "summary" TEXT NOT NULL,
  "evidence" JSONB,
  "priority" INTEGER NOT NULL DEFAULT 50,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "CoachMemory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UserRating" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "rating" INTEGER NOT NULL DEFAULT 1000,
  "league" TEXT NOT NULL DEFAULT 'Bronze',
  "rankTitle" TEXT NOT NULL DEFAULT 'Apprentice Engineer',
  "seasonPoints" INTEGER NOT NULL DEFAULT 0,
  "pressureScore" INTEGER NOT NULL DEFAULT 45,
  "communicationScore" INTEGER NOT NULL DEFAULT 45,
  "systemThinkingScore" INTEGER NOT NULL DEFAULT 45,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "UserRating_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PressureEvent" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "sessionId" TEXT,
  "type" TEXT NOT NULL,
  "prompt" TEXT NOT NULL,
  "severity" INTEGER NOT NULL DEFAULT 50,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "resolvedAt" TIMESTAMP(3),

  CONSTRAINT "PressureEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SkillNode_userId_key_key" ON "SkillNode"("userId", "key");
CREATE INDEX "SkillNode_userId_domain_score_idx" ON "SkillNode"("userId", "domain", "score");
CREATE INDEX "SkillNode_userId_nextReviewAt_idx" ON "SkillNode"("userId", "nextReviewAt");
CREATE INDEX "GrowthEvent_userId_createdAt_idx" ON "GrowthEvent"("userId", "createdAt");
CREATE INDEX "GrowthEvent_userId_skillKey_idx" ON "GrowthEvent"("userId", "skillKey");
CREATE INDEX "AdaptiveSession_userId_status_idx" ON "AdaptiveSession"("userId", "status");
CREATE INDEX "AdaptiveSession_userId_createdAt_idx" ON "AdaptiveSession"("userId", "createdAt");
CREATE INDEX "SessionTask_sessionId_order_idx" ON "SessionTask"("sessionId", "order");
CREATE UNIQUE INDEX "CoachMemory_userId_key_key" ON "CoachMemory"("userId", "key");
CREATE INDEX "CoachMemory_userId_priority_idx" ON "CoachMemory"("userId", "priority");
CREATE UNIQUE INDEX "UserRating_userId_key" ON "UserRating"("userId");
CREATE INDEX "PressureEvent_userId_createdAt_idx" ON "PressureEvent"("userId", "createdAt");
CREATE INDEX "PressureEvent_userId_sessionId_idx" ON "PressureEvent"("userId", "sessionId");

ALTER TABLE "SkillNode" ADD CONSTRAINT "SkillNode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GrowthEvent" ADD CONSTRAINT "GrowthEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AdaptiveSession" ADD CONSTRAINT "AdaptiveSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SessionTask" ADD CONSTRAINT "SessionTask_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AdaptiveSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CoachMemory" ADD CONSTRAINT "CoachMemory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserRating" ADD CONSTRAINT "UserRating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PressureEvent" ADD CONSTRAINT "PressureEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
