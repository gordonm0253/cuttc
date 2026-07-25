-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('practice', 'tournament', 'social');

-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "elo" INTEGER NOT NULL DEFAULT 1200,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "time" TEXT,
    "location" TEXT NOT NULL,
    "type" "EventType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL,
    "playedAt" TIMESTAMP(3) NOT NULL,
    "playerAId" TEXT NOT NULL,
    "playerBId" TEXT NOT NULL,
    "winnerId" TEXT NOT NULL,
    "playerAElo" INTEGER NOT NULL,
    "playerBElo" INTEGER NOT NULL,
    "playerAEloAfter" INTEGER NOT NULL,
    "playerBEloAfter" INTEGER NOT NULL,
    "sets" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Player_email_key" ON "Player"("email");

-- CreateIndex
CREATE INDEX "Player_elo_idx" ON "Player"("elo");

-- CreateIndex
CREATE INDEX "Match_playedAt_idx" ON "Match"("playedAt");

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_playerAId_fkey" FOREIGN KEY ("playerAId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_playerBId_fkey" FOREIGN KEY ("playerBId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
