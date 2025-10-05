/*
  Warnings:

  - You are about to drop the column `backgroundColor` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `textBoxColor` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `textColor` on the `categories` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."categories" DROP COLUMN "backgroundColor",
DROP COLUMN "textBoxColor",
DROP COLUMN "textColor",
ADD COLUMN     "colorPresetId" INTEGER,
ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "public"."categories" ADD CONSTRAINT "categories_colorPresetId_fkey" FOREIGN KEY ("colorPresetId") REFERENCES "public"."color_presets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
