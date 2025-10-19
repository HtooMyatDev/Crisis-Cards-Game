-- DropForeignKey
ALTER TABLE "public"."game_sessions" DROP CONSTRAINT "game_sessions_categoryId_fkey";

-- CreateTable
CREATE TABLE "GameSessionCategory" (
    "id" TEXT NOT NULL,
    "gameSessionId" TEXT NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GameSessionCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GameSessionCategory_gameSessionId_idx" ON "GameSessionCategory"("gameSessionId");

-- CreateIndex
CREATE INDEX "GameSessionCategory_categoryId_idx" ON "GameSessionCategory"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "GameSessionCategory_gameSessionId_categoryId_key" ON "GameSessionCategory"("gameSessionId", "categoryId");

-- AddForeignKey
ALTER TABLE "GameSessionCategory" ADD CONSTRAINT "GameSessionCategory_gameSessionId_fkey" FOREIGN KEY ("gameSessionId") REFERENCES "game_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameSessionCategory" ADD CONSTRAINT "GameSessionCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
