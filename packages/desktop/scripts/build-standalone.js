#!/usr/bin/env node

// Build standalone Next.js output with SQLite-compatible Prisma client.
//
// The key insight: pnpm hoists @prisma/client to root node_modules.
// The LAST `prisma generate` wins. So we:
//   1. Generate SQLite Prisma client (desktop schema)
//   2. Build standalone (bundles the SQLite client)
//   3. Copy static assets
//   4. Copy SQLite Prisma client for Electron main process (before PostgreSQL restore)
//   5. Restore PostgreSQL Prisma client (web schema)
//
// This ensures the standalone output uses SQLite while web retains PostgreSQL.

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const desktopRoot = path.resolve(__dirname, '..');
const webRoot = path.resolve(desktopRoot, '..', 'web');
const tempDbPath = '/tmp/build-temp.db';

const execOpts = { stdio: 'inherit' };

console.log('=== Build Standalone with SQLite Prisma Client ===\n');

try {
  // Step 1: Generate SQLite Prisma client (desktop schema overwrites hoisted @prisma/client)
  console.log('[1/5] Generating SQLite Prisma client (desktop schema)...');
  execSync('pnpm prisma generate', {
    ...execOpts,
    cwd: desktopRoot,
    env: { ...process.env, DATABASE_URL: `file:${tempDbPath}` },
  });
  console.log('[1/5] Done.\n');

  // Step 2: Build Next.js standalone (bundles the SQLite Prisma client)
  console.log('[2/5] Building Next.js standalone...');
  execSync('STANDALONE=true pnpm build', {
    ...execOpts,
    cwd: webRoot,
  });
  console.log('[2/5] Done.\n');

  // Step 3: Copy static assets
  console.log('[3/5] Copying static assets...');
  execSync('node scripts/copy-static.js', {
    ...execOpts,
    cwd: desktopRoot,
  });
  console.log('[3/5] Done.\n');

  // Step 4: Copy SQLite Prisma client for Electron main process
  // Must run BEFORE PostgreSQL restore, since copy-prisma-client.js reads from hoisted location
  console.log('[4/5] Copying SQLite Prisma client for Electron main process...');
  execSync('node scripts/copy-prisma-client.js', {
    ...execOpts,
    cwd: desktopRoot,
  });
  console.log('[4/5] Done.\n');
} finally {
  // Step 5: ALWAYS restore PostgreSQL Prisma client (web schema)
  console.log('[5/5] Restoring PostgreSQL Prisma client (web schema)...');
  try {
    execSync('pnpm prisma generate', {
      ...execOpts,
      cwd: webRoot,
    });
    console.log('[5/5] Done.\n');
  } catch (restoreError) {
    console.error('[5/5] WARNING: Failed to restore PostgreSQL Prisma client!');
    console.error('Run `cd packages/web && pnpm prisma generate` manually.');
    console.error(restoreError.message);
  }

  // Cleanup: remove temp SQLite DB if it was created
  if (fs.existsSync(tempDbPath)) {
    fs.unlinkSync(tempDbPath);
    console.log(`Cleaned up temp DB: ${tempDbPath}`);
  }
  // Also clean up journal file if present
  const tempDbJournal = `${tempDbPath}-journal`;
  if (fs.existsSync(tempDbJournal)) {
    fs.unlinkSync(tempDbJournal);
  }
}

console.log('=== Build Standalone Complete ===');
