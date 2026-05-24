-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "company" TEXT,
    "companyTags" JSONB,
    "heading" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "acceptanceText" TEXT,
    "starterCode" TEXT,
    "testCases" JSONB,
    "examples" JSONB,
    "constraints" JSONB,
    "skillKeys" JSONB,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserQuestionProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "solvedCount" INTEGER NOT NULL DEFAULT 0,
    "bestScore" INTEGER NOT NULL DEFAULT 0,
    "lastStatus" TEXT,
    "lastAttemptAt" TIMESTAMP(3),
    "nextReviewAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserQuestionProgress_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "InterviewAttempt" ADD COLUMN "questionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Question_slug_key" ON "Question"("slug");
CREATE INDEX "Question_type_status_idx" ON "Question"("type", "status");
CREATE INDEX "Question_topic_idx" ON "Question"("topic");
CREATE INDEX "Question_difficulty_idx" ON "Question"("difficulty");
CREATE INDEX "Question_company_idx" ON "Question"("company");
CREATE UNIQUE INDEX "UserQuestionProgress_userId_questionId_key" ON "UserQuestionProgress"("userId", "questionId");
CREATE INDEX "UserQuestionProgress_userId_nextReviewAt_idx" ON "UserQuestionProgress"("userId", "nextReviewAt");
CREATE INDEX "UserQuestionProgress_userId_lastAttemptAt_idx" ON "UserQuestionProgress"("userId", "lastAttemptAt");
CREATE INDEX "InterviewAttempt_questionId_idx" ON "InterviewAttempt"("questionId");

-- AddForeignKey
ALTER TABLE "InterviewAttempt" ADD CONSTRAINT "InterviewAttempt_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "UserQuestionProgress" ADD CONSTRAINT "UserQuestionProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserQuestionProgress" ADD CONSTRAINT "UserQuestionProgress_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
