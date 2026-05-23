ALTER TABLE "UserProfile"
ADD COLUMN "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "targetCompanies" JSONB,
ADD COLUMN "experienceLevel" TEXT,
ADD COLUMN "preferredRole" TEXT,
ADD COLUMN "confidenceLevel" INTEGER,
ADD COLUMN "strongestTopics" JSONB,
ADD COLUMN "weakestTopics" JSONB,
ADD COLUMN "dailyPrepTime" TEXT,
ADD COLUMN "learningStyle" TEXT,
ADD COLUMN "targetTimeline" TEXT,
ADD COLUMN "onboardingSummary" TEXT;
