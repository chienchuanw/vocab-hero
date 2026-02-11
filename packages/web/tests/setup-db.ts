import { execSync } from 'child_process';
import { prisma } from '@/lib/db/prisma';

/**
 * Test Database Setup
 * Handles test database initialization and cleanup
 */

/**
 * Clean all tables in the test database
 * Order matters due to foreign key constraints
 */
export async function cleanDatabase() {
  await prisma.exampleSentence.deleteMany();
  await prisma.reviewSchedule.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.notificationPreference.deleteMany();
  await prisma.userSettings.deleteMany();
  await prisma.studySession.deleteMany();
  await prisma.progressLog.deleteMany();
  await prisma.userStreak.deleteMany();
  await prisma.dailyGoal.deleteMany();
  await prisma.vocabularyGroup.deleteMany();
  await prisma.vocabularyItem.deleteMany();
  await prisma.sentenceCard.deleteMany();
  await prisma.user.deleteMany();
}

/**
 * Initialize test database
 * Run migrations if needed
 */
export async function initTestDatabase() {
  try {
    // Check if we're using test database
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl?.includes('_test')) {
      throw new Error(
        'Test database URL must contain "_test" to prevent accidental data loss in development database'
      );
    }

    // Run migrations
    execSync('pnpm prisma migrate deploy', {
      env: { ...process.env, DATABASE_URL: dbUrl },
      stdio: 'inherit',
    });

    // Test database initialized successfully
  } catch (error) {
    console.error('❌ Failed to initialize test database:', error);
    throw error;
  }
}

/**
 * Close database connection
 */
export async function closeDatabase() {
  await prisma.$disconnect();
}

// Initialize test database on module load
// This runs once when the test suite starts
initTestDatabase().catch((error) => {
  console.error('Failed to initialize test database:', error);
  process.exit(1);
});
