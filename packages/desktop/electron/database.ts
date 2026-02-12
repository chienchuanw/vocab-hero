import { app } from 'electron';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

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
 * Get the root directory of the desktop package.
 * In compiled output, __dirname = packages/desktop/dist/electron
 * So we resolve two levels up to get packages/desktop.
 */
function getDesktopDir(): string {
  return path.resolve(__dirname, '..', '..');
}

/**
 * Initialize the database on first run.
 *
 * 1. Sets process.env.DATABASE_URL so the Next.js server inherits it.
 * 2. On first run: runs `prisma db push` to create tables, then seeds the DB.
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

  console.log('[database] Running prisma db push...');
  try {
    execSync('npx prisma db push --skip-generate', execOptions);
    console.log('[database] Schema push complete');
  } catch (err) {
    console.error('[database] Failed to push schema:', err);
    throw err;
  }

  console.log('[database] Running seed script...');
  try {
    execSync('npx tsx prisma/seed.ts', execOptions);
    console.log('[database] Seed complete');
  } catch (err) {
    console.error('[database] Failed to run seed:', err);
    throw err;
  }

  console.log('[database] Database initialization complete');
}
