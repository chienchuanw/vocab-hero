import { prisma } from '@/lib/db/prisma';
import type { UserStreakData, StreakCalculationResult } from './streak.types';
import { STREAK_FREEZE_CONFIG } from './streak.types';

/**
 * Calculate day difference between two dates
 * Returns the number of days between lastDate and currentDate
 */
function getDayDifference(lastDate: Date, currentDate: Date): number {
  const normalizedLast = new Date(lastDate);
  normalizedLast.setHours(0, 0, 0, 0);

  const normalizedCurrent = new Date(currentDate);
  normalizedCurrent.setHours(0, 0, 0, 0);

  const diffTime = normalizedCurrent.getTime() - normalizedLast.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Check if freeze should be used automatically
 * Freeze is used automatically only for 1-day gaps
 */
export function shouldUseFreezeAutomatically(dayGap: number, freezesRemaining: number): boolean {
  return dayGap === 1 && freezesRemaining > 0;
}

/**
 * Calculate streak based on last study date and current date
 * Handles freeze usage automatically for 1-day gaps
 */
export function calculateStreak(
  lastStudyDate: Date | null,
  currentDate: Date,
  currentStreak: number = 0,
  longestStreak: number = 0,
  freezesRemaining: number = 0
): StreakCalculationResult {
  const normalizedCurrent = new Date(currentDate);
  normalizedCurrent.setHours(0, 0, 0, 0);

  if (!lastStudyDate) {
    return {
      currentStreak: 1,
      longestStreak: Math.max(1, longestStreak),
      lastStudyDate: normalizedCurrent,
      freezeUsed: false,
    };
  }

  const dayGap = getDayDifference(lastStudyDate, normalizedCurrent);

  if (dayGap === 0) {
    return {
      currentStreak,
      longestStreak,
      lastStudyDate: normalizedCurrent,
      freezeUsed: false,
    };
  }

  if (dayGap === 1) {
    const newStreak = currentStreak + 1;
    return {
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, longestStreak),
      lastStudyDate: normalizedCurrent,
      freezeUsed: false,
    };
  }

  if (shouldUseFreezeAutomatically(dayGap - 1, freezesRemaining)) {
    const newStreak = currentStreak + 1;
    return {
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, longestStreak),
      lastStudyDate: normalizedCurrent,
      freezeUsed: true,
    };
  }

  return {
    currentStreak: 1,
    longestStreak,
    lastStudyDate: normalizedCurrent,
    freezeUsed: false,
  };
}

/**
 * Get or create user streak record
 */
export async function getOrCreateUserStreak(userId: string): Promise<UserStreakData> {
  let streak = await prisma.userStreak.findUnique({
    where: { userId },
  });

  if (!streak) {
    streak = await prisma.userStreak.create({
      data: {
        userId,
        currentStreak: 0,
        longestStreak: 0,
        freezesRemaining: 0,
      },
    });
  }

  return streak as UserStreakData;
}

/**
 * Update streak when user studies
 */
export async function updateStreakOnStudy(
  userId: string,
  studyDate: Date
): Promise<UserStreakData> {
  const streak = await getOrCreateUserStreak(userId);

  const calculation = calculateStreak(
    streak.lastStudyDate,
    studyDate,
    streak.currentStreak,
    streak.longestStreak,
    streak.freezesRemaining
  );

  const updateData: any = {
    currentStreak: calculation.currentStreak,
    longestStreak: calculation.longestStreak,
    lastStudyDate: calculation.lastStudyDate,
  };

  if (calculation.freezeUsed) {
    updateData.freezesRemaining = Math.max(0, streak.freezesRemaining - 1);
    updateData.freezeUsedAt = new Date();
  }

  const updatedStreak = await prisma.userStreak.update({
    where: { userId },
    data: updateData,
  });

  return updatedStreak as UserStreakData;
}

/**
 * Reset monthly freezes if needed
 * Adds MONTHLY_FREEZES to current freezes, capped at MAX_FREEZES
 */
export async function resetMonthlyFreezes(userId: string): Promise<UserStreakData> {
  const streak = await getOrCreateUserStreak(userId);

  const now = new Date();
  const lastReset = streak.freezeUsedAt;

  let shouldReset = false;

  if (!lastReset) {
    shouldReset = true;
  } else {
    const lastResetMonth = lastReset.getMonth();
    const lastResetYear = lastReset.getFullYear();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    shouldReset =
      currentYear > lastResetYear ||
      (currentYear === lastResetYear && currentMonth > lastResetMonth);
  }

  if (!shouldReset) {
    return streak;
  }

  const newFreezes = Math.min(
    streak.freezesRemaining + STREAK_FREEZE_CONFIG.MONTHLY_FREEZES,
    STREAK_FREEZE_CONFIG.MAX_FREEZES
  );

  const updatedStreak = await prisma.userStreak.update({
    where: { userId },
    data: {
      freezesRemaining: newFreezes,
      freezeUsedAt: now,
    },
  });

  return updatedStreak as UserStreakData;
}
