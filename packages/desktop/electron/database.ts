import { app } from 'electron';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

function getPrismaClient(): typeof import('@prisma/client').PrismaClient {
  if (app.isPackaged) {
    const unpackedPath = path.join(
      process.resourcesPath,
      'app.asar.unpacked',
      'node_modules',
      '@prisma',
      'client'
    );
    return require(unpackedPath).PrismaClient;
  }
  return require('@prisma/client').PrismaClient;
}

const DB_FILENAME = 'vocab-hero.db';

/**
 * Get the absolute path to the SQLite database file in the user data directory.
 * On macOS: ~/Library/Application Support/@vocab-hero/desktop/vocab-hero.db
 */
export function getDatabasePath(): string {
  return path.join(app.getPath('userData'), DB_FILENAME);
}

/**
 * Build the Prisma-compatible DATABASE_URL for the SQLite database.
 * Includes journal_mode=WAL query parameter for better concurrent performance.
 */
export function getDatabaseUrl(): string {
  return `file:${getDatabasePath()}?journal_mode=WAL`;
}

/**
 * Check whether the SQLite database file already exists on disk.
 */
export function isDatabaseInitialized(): boolean {
  return fs.existsSync(getDatabasePath());
}

/**
 * Get the directory containing Prisma schema files.
 *
 * In development: __dirname = packages/desktop/dist/electron, resolve
 * two levels up to packages/desktop (which contains prisma/).
 *
 * In production: Prisma files are in extraResources at
 * process.resourcesPath/prisma/.
 */
function getDesktopDir(): string {
  if (app.isPackaged) {
    return process.resourcesPath;
  }
  return path.resolve(__dirname, '..', '..');
}

/**
 * Create all database tables and indexes using raw SQL via PrismaClient.
 * Used in production where child processes cannot read from asar archives.
 * All statements use IF NOT EXISTS for idempotency.
 */
async function createSchema(dbUrl: string): Promise<void> {
  const prisma = new (getPrismaClient())({ datasources: { db: { url: dbUrl } } });
  try {
    const statements = [
      // -- Table: users --
      `CREATE TABLE IF NOT EXISTS "users" (
        "id" TEXT PRIMARY KEY,
        "email" TEXT UNIQUE,
        "name" TEXT,
        "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" DATETIME NOT NULL
      )`,

      // -- Table: vocabulary_items --
      `CREATE TABLE IF NOT EXISTS "vocabulary_items" (
        "id" TEXT PRIMARY KEY,
        "word" TEXT NOT NULL,
        "reading" TEXT NOT NULL,
        "meaning" TEXT NOT NULL,
        "notes" TEXT,
        "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" DATETIME NOT NULL
      )`,

      // -- Table: vocabulary_groups --
      `CREATE TABLE IF NOT EXISTS "vocabulary_groups" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "user_id" TEXT NOT NULL,
        "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" DATETIME NOT NULL,
        FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE
      )`,

      // -- Table: example_sentences --
      `CREATE TABLE IF NOT EXISTS "example_sentences" (
        "id" TEXT PRIMARY KEY,
        "vocabulary_item_id" TEXT NOT NULL,
        "sentence" TEXT NOT NULL,
        "reading" TEXT,
        "meaning" TEXT NOT NULL,
        "order" INTEGER NOT NULL DEFAULT 0,
        "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" DATETIME NOT NULL,
        FOREIGN KEY ("vocabulary_item_id") REFERENCES "vocabulary_items" ("id") ON DELETE CASCADE
      )`,

      // -- Table: review_schedules --
      `CREATE TABLE IF NOT EXISTS "review_schedules" (
        "id" TEXT PRIMARY KEY,
        "vocabulary_item_id" TEXT NOT NULL UNIQUE,
        "easiness_factor" REAL NOT NULL DEFAULT 2.5,
        "interval" INTEGER NOT NULL DEFAULT 0,
        "repetitions" INTEGER NOT NULL DEFAULT 0,
        "next_review_date" DATETIME NOT NULL,
        "last_review_date" DATETIME,
        "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" DATETIME NOT NULL,
        FOREIGN KEY ("vocabulary_item_id") REFERENCES "vocabulary_items" ("id") ON DELETE CASCADE
      )`,

      // -- Table: study_sessions --
      `CREATE TABLE IF NOT EXISTS "study_sessions" (
        "id" TEXT PRIMARY KEY,
        "user_id" TEXT NOT NULL,
        "mode" TEXT NOT NULL,
        "study_mode" TEXT,
        "cards_reviewed" INTEGER NOT NULL DEFAULT 0,
        "correct_answers" INTEGER NOT NULL DEFAULT 0,
        "time_spent_minutes" INTEGER NOT NULL DEFAULT 0,
        "started_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "completed_at" DATETIME,
        "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" DATETIME NOT NULL,
        "quiz_type" TEXT,
        "question_count" INTEGER,
        "group_id" TEXT,
        FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE
      )`,

      // -- Table: progress_logs --
      `CREATE TABLE IF NOT EXISTS "progress_logs" (
        "id" TEXT PRIMARY KEY,
        "user_id" TEXT NOT NULL,
        "date" DATETIME NOT NULL,
        "words_studied" INTEGER NOT NULL DEFAULT 0,
        "new_words" INTEGER NOT NULL DEFAULT 0,
        "review_words" INTEGER NOT NULL DEFAULT 0,
        "time_spent_minutes" INTEGER NOT NULL DEFAULT 0,
        "sessions_completed" INTEGER NOT NULL DEFAULT 0,
        "correct_answers" INTEGER NOT NULL DEFAULT 0,
        "total_answers" INTEGER NOT NULL DEFAULT 0,
        "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" DATETIME NOT NULL,
        FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE
      )`,

      // -- Table: daily_goals --
      `CREATE TABLE IF NOT EXISTS "daily_goals" (
        "id" TEXT PRIMARY KEY,
        "user_id" TEXT NOT NULL UNIQUE,
        "words_per_day" INTEGER NOT NULL DEFAULT 10,
        "minutes_per_day" INTEGER NOT NULL DEFAULT 30,
        "reminder_time" TEXT NOT NULL DEFAULT '10:00',
        "push_enabled" BOOLEAN NOT NULL DEFAULT 0,
        "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" DATETIME NOT NULL,
        FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE
      )`,

      // -- Table: user_settings --
      `CREATE TABLE IF NOT EXISTS "user_settings" (
        "id" TEXT PRIMARY KEY,
        "user_id" TEXT NOT NULL UNIQUE,
        "theme" TEXT NOT NULL DEFAULT 'SYSTEM',
        "tts_speed" REAL NOT NULL DEFAULT 1.0,
        "tts_volume" REAL NOT NULL DEFAULT 1.0,
        "tts_pitch" REAL NOT NULL DEFAULT 1.0,
        "tts_voice" TEXT,
        "cards_per_session" INTEGER NOT NULL DEFAULT 20,
        "default_study_mode" TEXT NOT NULL DEFAULT 'FLASHCARD',
        "auto_advance" BOOLEAN NOT NULL DEFAULT 0,
        "show_reading" BOOLEAN NOT NULL DEFAULT 1,
        "language" TEXT NOT NULL DEFAULT 'en',
        "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" DATETIME NOT NULL,
        FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE
      )`,

      // -- Table: notification_preferences --
      `CREATE TABLE IF NOT EXISTS "notification_preferences" (
        "id" TEXT PRIMARY KEY,
        "user_id" TEXT NOT NULL UNIQUE,
        "goal_achievement_enabled" BOOLEAN NOT NULL DEFAULT 1,
        "streak_warning_enabled" BOOLEAN NOT NULL DEFAULT 1,
        "study_reminder_enabled" BOOLEAN NOT NULL DEFAULT 1,
        "milestone_enabled" BOOLEAN NOT NULL DEFAULT 1,
        "push_enabled" BOOLEAN NOT NULL DEFAULT 0,
        "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" DATETIME NOT NULL,
        FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE
      )`,

      // -- Table: notifications --
      `CREATE TABLE IF NOT EXISTS "notifications" (
        "id" TEXT PRIMARY KEY,
        "user_id" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "message" TEXT NOT NULL,
        "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
        "is_read" BOOLEAN NOT NULL DEFAULT 0,
        "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" DATETIME NOT NULL,
        FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE
      )`,

      // -- Table: user_streaks --
      `CREATE TABLE IF NOT EXISTS "user_streaks" (
        "id" TEXT PRIMARY KEY,
        "user_id" TEXT NOT NULL UNIQUE,
        "current_streak" INTEGER NOT NULL DEFAULT 0,
        "longest_streak" INTEGER NOT NULL DEFAULT 0,
        "last_study_date" DATETIME,
        "freezes_remaining" INTEGER NOT NULL DEFAULT 0,
        "freeze_used_at" DATETIME,
        "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" DATETIME NOT NULL,
        FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE
      )`,

      // -- Table: sentence_cards --
      `CREATE TABLE IF NOT EXISTS "sentence_cards" (
        "id" TEXT PRIMARY KEY,
        "japanese" TEXT NOT NULL,
        "english" TEXT NOT NULL,
        "notes" TEXT,
        "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" DATETIME NOT NULL
      )`,

      // -- Table: _VocabularyGroupToVocabularyItem (implicit M:N junction) --
      `CREATE TABLE IF NOT EXISTS "_VocabularyGroupToVocabularyItem" (
        "A" TEXT NOT NULL,
        "B" TEXT NOT NULL,
        CONSTRAINT "_VocabularyGroupToVocabularyItem_A_fkey" FOREIGN KEY ("A") REFERENCES "vocabulary_groups" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "_VocabularyGroupToVocabularyItem_B_fkey" FOREIGN KEY ("B") REFERENCES "vocabulary_items" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      )`,

      // -- Indexes: vocabulary_items --
      `CREATE INDEX IF NOT EXISTS "vocabulary_items_word_idx" ON "vocabulary_items"("word")`,
      `CREATE INDEX IF NOT EXISTS "vocabulary_items_reading_idx" ON "vocabulary_items"("reading")`,
      `CREATE INDEX IF NOT EXISTS "vocabulary_items_created_at_idx" ON "vocabulary_items"("created_at")`,

      // -- Indexes: example_sentences --
      `CREATE INDEX IF NOT EXISTS "example_sentences_vocabulary_item_id_idx" ON "example_sentences"("vocabulary_item_id")`,
      `CREATE INDEX IF NOT EXISTS "example_sentences_order_idx" ON "example_sentences"("order")`,

      // -- Indexes: sentence_cards --
      `CREATE INDEX IF NOT EXISTS "sentence_cards_created_at_idx" ON "sentence_cards"("created_at")`,

      // -- Indexes: vocabulary_groups --
      `CREATE INDEX IF NOT EXISTS "vocabulary_groups_user_id_idx" ON "vocabulary_groups"("user_id")`,
      `CREATE INDEX IF NOT EXISTS "vocabulary_groups_name_idx" ON "vocabulary_groups"("name")`,
      `CREATE INDEX IF NOT EXISTS "vocabulary_groups_created_at_idx" ON "vocabulary_groups"("created_at")`,

      // -- Indexes: review_schedules --
      `CREATE INDEX IF NOT EXISTS "review_schedules_next_review_date_idx" ON "review_schedules"("next_review_date")`,

      // -- Indexes: study_sessions --
      `CREATE INDEX IF NOT EXISTS "study_sessions_user_id_idx" ON "study_sessions"("user_id")`,
      `CREATE INDEX IF NOT EXISTS "study_sessions_study_mode_idx" ON "study_sessions"("study_mode")`,
      `CREATE INDEX IF NOT EXISTS "study_sessions_group_id_idx" ON "study_sessions"("group_id")`,
      `CREATE INDEX IF NOT EXISTS "study_sessions_started_at_idx" ON "study_sessions"("started_at")`,
      `CREATE INDEX IF NOT EXISTS "study_sessions_completed_at_idx" ON "study_sessions"("completed_at")`,

      // -- Indexes: progress_logs --
      `CREATE UNIQUE INDEX IF NOT EXISTS "progress_logs_user_id_date_key" ON "progress_logs"("user_id", "date")`,
      `CREATE INDEX IF NOT EXISTS "progress_logs_user_id_idx" ON "progress_logs"("user_id")`,
      `CREATE INDEX IF NOT EXISTS "progress_logs_date_idx" ON "progress_logs"("date")`,

      // -- Indexes: notifications --
      `CREATE INDEX IF NOT EXISTS "notifications_user_id_idx" ON "notifications"("user_id")`,
      `CREATE INDEX IF NOT EXISTS "notifications_is_read_idx" ON "notifications"("is_read")`,
      `CREATE INDEX IF NOT EXISTS "notifications_created_at_idx" ON "notifications"("created_at")`,

      // -- Indexes: _VocabularyGroupToVocabularyItem --
      `CREATE UNIQUE INDEX IF NOT EXISTS "_VocabularyGroupToVocabularyItem_AB_unique" ON "_VocabularyGroupToVocabularyItem"("A", "B")`,
      `CREATE INDEX IF NOT EXISTS "_VocabularyGroupToVocabularyItem_B_index" ON "_VocabularyGroupToVocabularyItem"("B")`,
    ];

    for (const sql of statements) {
      await prisma.$executeRawUnsafe(sql);
    }
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Initialize the database on first run.
 *
 * 1. Sets process.env.DATABASE_URL so the Next.js server inherits it.
 * 2. On first run: creates tables via raw SQL (prod) or prisma db push (dev), then seeds.
 * 3. On subsequent runs: skips initialization.
 * 4. WAL mode is enabled via the ?journal_mode=WAL query parameter in the URL.
 */
export async function initializeDatabase(): Promise<void> {
  const dbUrl = getDatabaseUrl();

  process.env.DATABASE_URL = dbUrl;

  if (isDatabaseInitialized()) {
    console.log('[database] Database already exists, skipping initialization');
    return;
  }

  console.log('[database] First run detected, initializing database...');
  console.log(`[database] Database path: ${getDatabasePath()}`);

  const desktopDir = getDesktopDir();
  const execOptions = {
    cwd: desktopDir,
    env: { ...process.env, DATABASE_URL: dbUrl },
    stdio: 'pipe' as const,
  };

  console.log('[database] Creating database schema...');
  try {
    if (app.isPackaged) {
      // In production, child processes with ELECTRON_RUN_AS_NODE=1 cannot read
      // from asar archives, so prisma CLI fails. Use PrismaClient directly
      // which runs in the main process and can access asar contents.
      await createSchema(dbUrl);
    } else {
      execSync('npx prisma db push --skip-generate', execOptions);
    }
    console.log('[database] Schema push complete');
  } catch (err) {
    console.error('[database] Failed to push schema:', err);
    throw err;
  }

  console.log('[database] Running seed...');
  try {
    if (app.isPackaged) {
      await seedDatabase(dbUrl);
    } else {
      execSync('npx tsx prisma/seed.ts', execOptions);
    }
    console.log('[database] Seed complete');
  } catch (err) {
    console.error('[database] Failed to run seed:', err);
    throw err;
  }

  console.log('[database] Database initialization complete');
}

async function seedDatabase(dbUrl: string): Promise<void> {
  const prisma = new (getPrismaClient())({ datasources: { db: { url: dbUrl } } });
  try {
    const user = await prisma.user.upsert({
      where: { email: 'default@vocab-hero.local' },
      update: {},
      create: { email: 'default@vocab-hero.local', name: 'Default User' },
    });

    await prisma.userSettings.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        theme: 'SYSTEM',
        ttsSpeed: 1.0,
        ttsVolume: 1.0,
        ttsPitch: 1.0,
        ttsVoice: null,
        cardsPerSession: 20,
        defaultStudyMode: 'FLASHCARD',
        autoAdvance: false,
        showReading: true,
        language: 'en',
      },
    });

    await prisma.dailyGoal.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        wordsPerDay: 10,
        minutesPerDay: 30,
        reminderTime: '10:00',
        pushEnabled: false,
      },
    });

    await prisma.notificationPreference.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        goalAchievementEnabled: true,
        streakWarningEnabled: true,
        studyReminderEnabled: true,
        milestoneEnabled: true,
        pushEnabled: false,
      },
    });

    await prisma.userStreak.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        currentStreak: 0,
        longestStreak: 0,
        freezesRemaining: 0,
      },
    });

    const group = await prisma.vocabularyGroup.create({
      data: {
        name: 'Sample Vocabulary',
        description: 'Sample vocabulary for getting started',
        userId: user.id,
      },
    });

    const sampleWords = [
      { word: '\u3053\u3093\u306b\u3061\u306f', reading: '\u3053\u3093\u306b\u3061\u306f', meaning: 'hello, good afternoon', notes: 'Common greeting',
        sentence: '\u3053\u3093\u306b\u3061\u306f\u3001\u5143\u6c17\u3067\u3059\u304b\u3002', sReading: '\u3053\u3093\u306b\u3061\u306f\u3001\u3052\u3093\u304d\u3067\u3059\u304b\u3002', sMeaning: 'Hello, how are you?' },
      { word: '\u3042\u308a\u304c\u3068\u3046', reading: '\u3042\u308a\u304c\u3068\u3046', meaning: 'thank you', notes: 'Common expression of gratitude',
        sentence: '\u3042\u308a\u304c\u3068\u3046\u3054\u3056\u3044\u307e\u3059\u3002', sReading: '\u3042\u308a\u304c\u3068\u3046\u3054\u3056\u3044\u307e\u3059\u3002', sMeaning: 'Thank you very much.' },
      { word: '\u52c9\u5f37', reading: '\u3079\u3093\u304d\u3087\u3046', meaning: 'study', notes: 'Common noun/verb for studying',
        sentence: '\u6bce\u65e5\u65e5\u672c\u8a9e\u3092\u52c9\u5f37\u3057\u307e\u3059\u3002', sReading: '\u307e\u3044\u306b\u3061\u306b\u307b\u3093\u3054\u3092\u3079\u3093\u304d\u3087\u3046\u3057\u307e\u3059\u3002', sMeaning: 'I study Japanese every day.' },
    ];

    for (const v of sampleWords) {
      const item = await prisma.vocabularyItem.create({
        data: {
          word: v.word,
          reading: v.reading,
          meaning: v.meaning,
          notes: v.notes,
          groups: { connect: [{ id: group.id }] },
          exampleSentences: {
            create: [{ sentence: v.sentence, reading: v.sReading, meaning: v.sMeaning, order: 1 }],
          },
        },
      });

      await prisma.reviewSchedule.create({
        data: {
          vocabularyItemId: item.id,
          nextReviewDate: new Date(),
          easinessFactor: 2.5,
          interval: 0,
          repetitions: 0,
        },
      });
    }
  } finally {
    await prisma.$disconnect();
  }
}
