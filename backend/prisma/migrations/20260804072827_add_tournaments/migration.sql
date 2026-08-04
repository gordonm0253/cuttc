-- CreateEnum
CREATE TYPE "TournamentFormat" AS ENUM ('single_elimination', 'double_elimination', 'round_robin');

-- CreateEnum
CREATE TYPE "TournamentStatus" AS ENUM ('draft', 'seeded', 'in_progress', 'completed');

-- CreateEnum
CREATE TYPE "BracketSide" AS ENUM ('winners', 'losers', 'grand_final');

-- CreateTable
CREATE TABLE "Tournament" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "format" "TournamentFormat" NOT NULL,
    "status" "TournamentStatus" NOT NULL DEFAULT 'draft',
    "createdByEmail" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tournament_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TournamentEntrant" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "seed" INTEGER NOT NULL,
    "eloAtSeed" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TournamentEntrant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TournamentMatch" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "bracketSide" "BracketSide",
    "round" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "entrantAId" TEXT,
    "entrantBId" TEXT,
    "isBye" BOOLEAN NOT NULL DEFAULT false,
    "conditional" BOOLEAN NOT NULL DEFAULT false,
    "skipped" BOOLEAN NOT NULL DEFAULT false,
    "matchId" TEXT,
    "winnerEntrantId" TEXT,
    "nextMatchId" TEXT,
    "nextMatchSlot" TEXT,
    "loserNextMatchId" TEXT,
    "loserNextMatchSlot" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TournamentMatch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Tournament_status_idx" ON "Tournament"("status");

-- CreateIndex
CREATE INDEX "TournamentEntrant_tournamentId_idx" ON "TournamentEntrant"("tournamentId");

-- CreateIndex
CREATE UNIQUE INDEX "TournamentEntrant_tournamentId_playerId_key" ON "TournamentEntrant"("tournamentId", "playerId");

-- CreateIndex
CREATE UNIQUE INDEX "TournamentEntrant_tournamentId_seed_key" ON "TournamentEntrant"("tournamentId", "seed");

-- CreateIndex
CREATE UNIQUE INDEX "TournamentMatch_matchId_key" ON "TournamentMatch"("matchId");

-- CreateIndex
CREATE INDEX "TournamentMatch_tournamentId_idx" ON "TournamentMatch"("tournamentId");

-- CreateIndex
CREATE INDEX "TournamentMatch_tournamentId_bracketSide_round_idx" ON "TournamentMatch"("tournamentId", "bracketSide", "round");

-- AddForeignKey
ALTER TABLE "TournamentEntrant" ADD CONSTRAINT "TournamentEntrant_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentEntrant" ADD CONSTRAINT "TournamentEntrant_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentMatch" ADD CONSTRAINT "TournamentMatch_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentMatch" ADD CONSTRAINT "TournamentMatch_entrantAId_fkey" FOREIGN KEY ("entrantAId") REFERENCES "TournamentEntrant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentMatch" ADD CONSTRAINT "TournamentMatch_entrantBId_fkey" FOREIGN KEY ("entrantBId") REFERENCES "TournamentEntrant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentMatch" ADD CONSTRAINT "TournamentMatch_winnerEntrantId_fkey" FOREIGN KEY ("winnerEntrantId") REFERENCES "TournamentEntrant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentMatch" ADD CONSTRAINT "TournamentMatch_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentMatch" ADD CONSTRAINT "TournamentMatch_nextMatchId_fkey" FOREIGN KEY ("nextMatchId") REFERENCES "TournamentMatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentMatch" ADD CONSTRAINT "TournamentMatch_loserNextMatchId_fkey" FOREIGN KEY ("loserNextMatchId") REFERENCES "TournamentMatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
