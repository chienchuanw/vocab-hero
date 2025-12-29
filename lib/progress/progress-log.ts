import { prisma } from '@/lib/db/prisma';
import type {
  DailyProgressLog,
  UpdateProgressInput,
  ProgressDateRange,
} from './progress.types';

/**
 * Normalize date to start of day (00:00:00.000)
 * This ensures consistent date comparison across timezones
 */
function normalizeDate(date: Date): Date {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

/**
 * Get or create a daily progress log for a specific user and date
 * If the log exists, return it; otherwise create a new one with default values
 *
 * @param userId - User ID
 * @param date - Date for the log (will be normalized to start of day)
 * @returns Daily progress log
 */
export async function getOrCreateDailyLog(
  userId: string,
  date: Date
): Promise<DailyProgressLog> {
  const normalizedDate = normalizeDate(date);

  // Try to find existing log
  let log = await prisma.progressLog.findUnique({
    where: {
      userId_date: {
        userId,
        date: normalizedDate,
      },
    },
  });

  // Create new log if it doesn't exist
  if (!log) {
    log = await prisma.progressLog.create({
      data: {
        userId,
        date: normalizedDate,
        wordsStudied: 0,
        newWords: 0,
        reviewWords: 0,
        timeSpentMinutes: 0,
        sessionsCompleted: 0,
        correctAnswers: 0,
        totalAnswers: 0,
      },
    });
  }

  return log as DailyProgressLog;
}

/**
 * Update daily progress log with incremental values
 * If the log doesn't exist, it will be created first
 *
 * @param input - Update progress input data
 * @returns Updated daily progress log
 */
export async function updateDailyLog(
  input: UpdateProgressInput
): Promise<DailyProgressLog> {
  const normalizedDate = normalizeDate(input.date);

  // Get or create the log first
  await getOrCreateDailyLog(input.userId, normalizedDate);

  // Update with incremental values
  const log = await prisma.progressLog.update({
    where: {
      userId_date: {
        userId: input.userId,
        date: normalizedDate,
      },
    },
    data: {
      wordsStudied: {
        increment: input.wordsStudied ?? 0,
      },
      newWords: {
        increment: input.newWords ?? 0,
      },
      reviewWords: {
        increment: input.reviewWords ?? 0,
      },
      timeSpentMinutes: {
        increment: input.timeSpentMinutes ?? 0,
      },
      sessionsCompleted: {
        increment: input.sessionsCompleted ?? 0,
      },
      correctAnswers: {
        increment: input.correctAnswers ?? 0,
      },
      totalAnswers: {
        increment: input.totalAnswers ?? 0,
      },
    },
  });

  return log as DailyProgressLog;
}

/**
 * Get daily logs for a user, ordered by date descending (most recent first)
 *
 * @param userId - User ID
 * @param limit - Maximum number of logs to return (optional)
 * @returns Array of daily progress logs
 */
export async function getDailyLogs(
  userId: string,
  limit?: number
): Promise<DailyProgressLog[]> {
  const logs = await prisma.progressLog.findMany({
    where: {
      userId,
    },
    orderBy: {
      date: 'desc',
    },
    take: limit,
  });

  return logs as DailyProgressLog[];
}

/**
 * Get progress logs within a date range
 *
 * @param userId - User ID
 * @param range - Date range (startDate and endDate, both inclusive)
 * @returns Array of daily progress logs within the range
 */
export async function getProgressRange(
  userId: string,
  range: ProgressDateRange
): Promise<DailyProgressLog[]> {
  const normalizedStartDate = normalizeDate(range.startDate);
  const normalizedEndDate = normalizeDate(range.endDate);

  const logs = await prisma.progressLog.findMany({
    where: {
      userId,
      date: {
        gte: normalizedStartDate,
        lte: normalizedEndDate,
      },
    },
    orderBy: {
      date: 'desc',
    },
  });

  return logs as DailyProgressLog[];
}

