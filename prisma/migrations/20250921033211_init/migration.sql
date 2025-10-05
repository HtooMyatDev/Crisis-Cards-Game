/*
  Warnings:

  - You are about to drop the column `color` on the `categories` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."categories" DROP COLUMN "color",
ADD COLUMN     "backgroundColor" VARCHAR(7) NOT NULL DEFAULT '#F0F9FF',
ADD COLUMN     "textBoxColor" VARCHAR(7) NOT NULL DEFAULT '#FFFFFF',
ADD COLUMN     "textColor" VARCHAR(7) NOT NULL DEFAULT '#1F2937';

-- CreateTable
CREATE TABLE "public"."color_presets" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "backgroundColor" VARCHAR(7) NOT NULL,
    "textColor" VARCHAR(7) NOT NULL,
    "textBoxColor" VARCHAR(7) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" INTEGER,

    CONSTRAINT "color_presets_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."color_presets" ADD CONSTRAINT "color_presets_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
