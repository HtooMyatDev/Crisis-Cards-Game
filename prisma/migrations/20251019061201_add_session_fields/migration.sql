/*
  Warnings:

  - Added the required column `name` to the `game_sessions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "game_sessions" ADD COLUMN     "gameMode" TEXT NOT NULL DEFAULT 'Standard',
ADD COLUMN     "name" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "game_sessions_hostId_idx" ON "game_sessions"("hostId");

-- CreateIndex
CREATE INDEX "game_sessions_categoryId_idx" ON "game_sessions"("categoryId");
