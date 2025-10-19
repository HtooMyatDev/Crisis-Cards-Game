/*
  Warnings:

  - You are about to drop the column `categoryId` on the `game_sessions` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."game_sessions_categoryId_idx";

-- AlterTable
ALTER TABLE "game_sessions" DROP COLUMN "categoryId";
