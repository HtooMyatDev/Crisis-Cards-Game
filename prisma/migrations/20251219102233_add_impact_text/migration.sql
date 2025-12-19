-- AlterTable
ALTER TABLE "card_responses" ADD COLUMN     "impactDescription" TEXT;

-- AlterTable
ALTER TABLE "game_sessions" ADD COLUMN     "gameDurationMinutes" INTEGER NOT NULL DEFAULT 60,
ADD COLUMN     "lastTurnResult" JSONB,
ADD COLUMN     "leaderTermLength" INTEGER NOT NULL DEFAULT 4,
ADD COLUMN     "roundStatus" TEXT NOT NULL DEFAULT 'LEADER_ELECTION';

-- AlterTable
ALTER TABLE "teams" ADD COLUMN     "lastLeaderElectionRound" INTEGER NOT NULL DEFAULT 0;
