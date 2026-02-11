-- CreateEnum
CREATE TYPE "StudyMode" AS ENUM ('FLASHCARD', 'MULTIPLE_CHOICE', 'SPELLING', 'MATCHING', 'RANDOM');

-- CreateEnum
CREATE TYPE "QuizType" AS ENUM ('WORD_TO_MEANING', 'MEANING_TO_WORD', 'MIXED');

-- AlterTable
ALTER TABLE "study_sessions" ADD COLUMN     "group_id" TEXT,
ADD COLUMN     "question_count" INTEGER,
ADD COLUMN     "quiz_type" "QuizType",
ADD COLUMN     "study_mode" "StudyMode";

-- CreateIndex
CREATE INDEX "study_sessions_study_mode_idx" ON "study_sessions"("study_mode");

-- CreateIndex
CREATE INDEX "study_sessions_group_id_idx" ON "study_sessions"("group_id");
