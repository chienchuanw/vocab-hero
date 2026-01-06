-- CreateEnum
CREATE TYPE "ThemePreference" AS ENUM ('LIGHT', 'DARK', 'SYSTEM');

-- CreateTable
CREATE TABLE "user_settings" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "theme" "ThemePreference" NOT NULL DEFAULT 'SYSTEM',
    "tts_speed" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "tts_volume" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "tts_pitch" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "tts_voice" TEXT,
    "cards_per_session" INTEGER NOT NULL DEFAULT 20,
    "default_study_mode" "StudyMode" NOT NULL DEFAULT 'FLASHCARD',
    "auto_advance" BOOLEAN NOT NULL DEFAULT false,
    "show_reading" BOOLEAN NOT NULL DEFAULT true,
    "language" TEXT NOT NULL DEFAULT 'en',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_settings_user_id_key" ON "user_settings"("user_id");

-- AddForeignKey
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
