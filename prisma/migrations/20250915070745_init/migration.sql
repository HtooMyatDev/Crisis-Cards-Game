/*
  Warnings:

  - You are about to drop the column `affectedUsers` on the `cards` table. All the data in the column will be lost.
  - You are about to drop the column `dueDate` on the `cards` table. All the data in the column will be lost.
  - You are about to drop the column `estimatedImpact` on the `cards` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `cards` table. All the data in the column will be lost.
  - You are about to drop the column `priority` on the `cards` table. All the data in the column will be lost.
  - You are about to drop the column `resolvedAt` on the `cards` table. All the data in the column will be lost.
  - You are about to drop the column `severity` on the `cards` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `cards` table. All the data in the column will be lost.
  - Changed the type of `status` on the `cards` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "public"."cards" DROP COLUMN "affectedUsers",
DROP COLUMN "dueDate",
DROP COLUMN "estimatedImpact",
DROP COLUMN "metadata",
DROP COLUMN "priority",
DROP COLUMN "resolvedAt",
DROP COLUMN "severity",
DROP COLUMN "tags",
ADD COLUMN     "responseOptions" TEXT[],
ADD COLUMN     "timeLimit" INTEGER,
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL;
