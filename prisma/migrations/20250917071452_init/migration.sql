-- AlterTable
ALTER TABLE "public"."cards" ADD COLUMN     "efValue" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "grValue" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "psValue" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "pwValue" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "public"."card_responses" (
    "id" SERIAL NOT NULL,
    "cardId" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "pwEffect" INTEGER NOT NULL DEFAULT 0,
    "efEffect" INTEGER NOT NULL DEFAULT 0,
    "psEffect" INTEGER NOT NULL DEFAULT 0,
    "grEffect" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "card_responses_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."card_responses" ADD CONSTRAINT "card_responses_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "public"."cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;
