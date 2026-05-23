CREATE TYPE "AttemptKind" AS ENUM ('LIVE_CODING', 'DSA_CONTEST', 'SYSTEM_DESIGN', 'BEHAVIORAL');
CREATE TYPE "AttemptStatus" AS ENUM ('PASSED', 'NEEDS_REVIEW', 'FAILED');
CREATE TYPE "RoadmapPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

CREATE TABLE "InterviewAttempt" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "kind" "AttemptKind" NOT NULL,
  "title" TEXT NOT NULL,
  "topic" TEXT NOT NULL,
  "score" INTEGER NOT NULL,
  "durationMinutes" INTEGER NOT NULL,
  "status" "AttemptStatus" NOT NULL,
  "feedbackSummary" TEXT,
  "completedAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "InterviewAttempt_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TopicProgress" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "topic" TEXT NOT NULL,
  "proficiency" INTEGER NOT NULL,
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "targetScore" INTEGER NOT NULL DEFAULT 80,
  "lastPracticedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "TopicProgress_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DailyActivity" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "sessions" INTEGER NOT NULL DEFAULT 0,
  "minutes" INTEGER NOT NULL DEFAULT 0,
  "problemsSolved" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "DailyActivity_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RoadmapItem" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "topic" TEXT NOT NULL,
  "priority" "RoadmapPriority" NOT NULL DEFAULT 'MEDIUM',
  "dueDate" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "RoadmapItem_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "InterviewAttempt_userId_completedAt_idx" ON "InterviewAttempt"("userId", "completedAt");
CREATE INDEX "InterviewAttempt_userId_kind_idx" ON "InterviewAttempt"("userId", "kind");
CREATE UNIQUE INDEX "TopicProgress_userId_topic_key" ON "TopicProgress"("userId", "topic");
CREATE INDEX "TopicProgress_userId_proficiency_idx" ON "TopicProgress"("userId", "proficiency");
CREATE UNIQUE INDEX "DailyActivity_userId_date_key" ON "DailyActivity"("userId", "date");
CREATE INDEX "DailyActivity_userId_date_idx" ON "DailyActivity"("userId", "date");
CREATE INDEX "RoadmapItem_userId_priority_idx" ON "RoadmapItem"("userId", "priority");
CREATE INDEX "RoadmapItem_userId_dueDate_idx" ON "RoadmapItem"("userId", "dueDate");

ALTER TABLE "InterviewAttempt" ADD CONSTRAINT "InterviewAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TopicProgress" ADD CONSTRAINT "TopicProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DailyActivity" ADD CONSTRAINT "DailyActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RoadmapItem" ADD CONSTRAINT "RoadmapItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
