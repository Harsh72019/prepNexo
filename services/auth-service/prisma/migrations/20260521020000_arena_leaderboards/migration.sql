ALTER TABLE "UserRating"
ADD COLUMN "battlesPlayed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "battlesWon" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE "ArenaEntry" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "arenaDate" TIMESTAMP(3) NOT NULL,
  "mode" TEXT NOT NULL,
  "ratingBand" TEXT NOT NULL,
  "roomId" TEXT NOT NULL,
  "score" INTEGER NOT NULL DEFAULT 0,
  "solved" INTEGER NOT NULL DEFAULT 0,
  "penalty" INTEGER NOT NULL DEFAULT 0,
  "rank" INTEGER,
  "completed" BOOLEAN NOT NULL DEFAULT false,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ArenaEntry_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ArenaEntry_userId_arenaDate_mode_key" ON "ArenaEntry"("userId", "arenaDate", "mode");
CREATE INDEX "ArenaEntry_arenaDate_ratingBand_mode_idx" ON "ArenaEntry"("arenaDate", "ratingBand", "mode");
CREATE INDEX "ArenaEntry_userId_createdAt_idx" ON "ArenaEntry"("userId", "createdAt");

ALTER TABLE "ArenaEntry" ADD CONSTRAINT "ArenaEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
