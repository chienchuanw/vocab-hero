-- CreateTable
CREATE TABLE "sentence_cards" (
    "id" TEXT NOT NULL,
    "japanese" TEXT NOT NULL,
    "english" TEXT NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sentence_cards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sentence_cards_created_at_idx" ON "sentence_cards"("created_at");
