/*
  Warnings:

  - The values [FINISHED] on the enum `GameStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `efEffect` on the `card_responses` table. All the data in the column will be lost.
  - You are about to drop the column `grEffect` on the `card_responses` table. All the data in the column will be lost.
  - You are about to drop the column `psEffect` on the `card_responses` table. All the data in the column will be lost.
  - You are about to drop the column `pwEffect` on the `card_responses` table. All the data in the column will be lost.
  - You are about to drop the column `efValue` on the `cards` table. All the data in the column will be lost.
  - You are about to drop the column `grValue` on the `cards` table. All the data in the column will be lost.
  - You are about to drop the column `psValue` on the `cards` table. All the data in the column will be lost.
  - You are about to drop the column `pwValue` on the `cards` table. All the data in the column will be lost.
  - You are about to drop the column `responseOptions` on the `cards` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "GameStatus_new" AS ENUM ('WAITING', 'IN_PROGRESS', 'PAUSED', 'COMPLETED');
ALTER TABLE "public"."game_sessions" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "game_sessions" ALTER COLUMN "status" TYPE "GameStatus_new" USING ("status"::text::"GameStatus_new");
ALTER TYPE "GameStatus" RENAME TO "GameStatus_old";
ALTER TYPE "GameStatus_new" RENAME TO "GameStatus";
DROP TYPE "public"."GameStatus_old";
ALTER TABLE "game_sessions" ALTER COLUMN "status" SET DEFAULT 'WAITING';
COMMIT;

-- AlterTable
ALTER TABLE "card_responses" DROP COLUMN "efEffect",
DROP COLUMN "grEffect",
DROP COLUMN "psEffect",
DROP COLUMN "pwEffect",
ADD COLUMN     "cost" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "economicEffect" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "environmentEffect" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "infrastructureEffect" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "politicalEffect" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "score" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "societyEffect" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "cards" DROP COLUMN "efValue",
DROP COLUMN "grValue",
DROP COLUMN "psValue",
DROP COLUMN "pwValue",
DROP COLUMN "responseOptions",
ALTER COLUMN "status" SET DEFAULT 'OPEN';

-- AlterTable
ALTER TABLE "comments" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "game_sessions" ADD COLUMN     "cardsPerRound" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "currentRound" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "initialBudget" INTEGER NOT NULL DEFAULT 5000,
ADD COLUMN     "lastCardStartedAt" TIMESTAMP(3),
ADD COLUMN     "numberOfTeams" INTEGER NOT NULL DEFAULT 2,
ADD COLUMN     "shuffledCardIds" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
ADD COLUMN     "totalRounds" INTEGER;

-- AlterTable
ALTER TABLE "players" ADD COLUMN     "isLeader" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "teamId" TEXT,
ADD COLUMN     "userId" INTEGER,
ADD COLUMN     "votedForId" INTEGER,
ADD COLUMN     "votesReceived" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "templates" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "username" TEXT;

-- DropEnum
DROP TYPE "CardStatus";

-- DropEnum
DROP TYPE "CategoryStatus";

-- CreateTable
CREATE TABLE "achievements" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT 'Trophy',
    "condition" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 10,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_achievements" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "achievementId" INTEGER NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_settings" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "pushNotifications" BOOLEAN NOT NULL DEFAULT false,
    "soundEffects" BOOLEAN NOT NULL DEFAULT true,
    "autoSave" BOOLEAN NOT NULL DEFAULT true,
    "difficulty" TEXT NOT NULL DEFAULT 'medium',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "player_responses" (
    "id" TEXT NOT NULL,
    "playerId" INTEGER NOT NULL,
    "cardId" INTEGER NOT NULL,
    "responseId" INTEGER NOT NULL,
    "respondedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "player_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teams" (
    "id" TEXT NOT NULL,
    "gameSessionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "budget" INTEGER NOT NULL DEFAULT 5000,
    "baseValue" INTEGER NOT NULL DEFAULT 5,
    "color" TEXT NOT NULL DEFAULT '#3B82F6',
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leader_votes" (
    "id" TEXT NOT NULL,
    "gameSessionId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "round" INTEGER NOT NULL,
    "voterId" INTEGER NOT NULL,
    "candidateId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "leader_votes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "achievements_name_key" ON "achievements"("name");

-- CreateIndex
CREATE UNIQUE INDEX "user_achievements_userId_achievementId_key" ON "user_achievements"("userId", "achievementId");

-- CreateIndex
CREATE UNIQUE INDEX "user_settings_userId_key" ON "user_settings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "player_responses_playerId_cardId_key" ON "player_responses"("playerId", "cardId");

-- CreateIndex
CREATE INDEX "teams_gameSessionId_idx" ON "teams"("gameSessionId");

-- CreateIndex
CREATE INDEX "leader_votes_gameSessionId_round_idx" ON "leader_votes"("gameSessionId", "round");

-- CreateIndex
CREATE INDEX "leader_votes_teamId_round_idx" ON "leader_votes"("teamId", "round");

-- CreateIndex
CREATE UNIQUE INDEX "leader_votes_gameSessionId_voterId_round_key" ON "leader_votes"("gameSessionId", "voterId", "round");

-- CreateIndex
CREATE INDEX "cards_status_idx" ON "cards"("status");

-- CreateIndex
CREATE INDEX "cards_categoryId_idx" ON "cards"("categoryId");

-- CreateIndex
CREATE INDEX "cards_isArchived_idx" ON "cards"("isArchived");

-- CreateIndex
CREATE INDEX "cards_title_idx" ON "cards"("title");

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "achievements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "players" ADD CONSTRAINT "players_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "players" ADD CONSTRAINT "players_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_responses" ADD CONSTRAINT "player_responses_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_responses" ADD CONSTRAINT "player_responses_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_responses" ADD CONSTRAINT "player_responses_responseId_fkey" FOREIGN KEY ("responseId") REFERENCES "card_responses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_gameSessionId_fkey" FOREIGN KEY ("gameSessionId") REFERENCES "game_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leader_votes" ADD CONSTRAINT "leader_votes_gameSessionId_fkey" FOREIGN KEY ("gameSessionId") REFERENCES "game_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leader_votes" ADD CONSTRAINT "leader_votes_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leader_votes" ADD CONSTRAINT "leader_votes_voterId_fkey" FOREIGN KEY ("voterId") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leader_votes" ADD CONSTRAINT "leader_votes_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;
