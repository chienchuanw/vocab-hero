/*
  Warnings:

  - A unique constraint covering the columns `[user_id,date]` on the table `progress_logs` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "progress_logs_date_key";

-- AlterTable
ALTER TABLE "progress_logs" ADD COLUMN     "correct_answers" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "total_answers" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "user_streaks" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "current_streak" INTEGER NOT NULL DEFAULT 0,
    "longest_streak" INTEGER NOT NULL DEFAULT 0,
    "last_study_date" TIMESTAMP(3),
    "freezes_remaining" INTEGER NOT NULL DEFAULT 0,
    "freeze_used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_streaks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_streaks_user_id_key" ON "user_streaks"("user_id");

-- CreateIndex
CREATE INDEX "progress_logs_date_idx" ON "progress_logs"("date");

-- CreateIndex
CREATE UNIQUE INDEX "progress_logs_user_id_date_key" ON "progress_logs"("user_id", "date");

-- AddForeignKey
ALTER TABLE "user_streaks" ADD CONSTRAINT "user_streaks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
