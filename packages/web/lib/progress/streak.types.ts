/**
 * Streak tracking type definitions
 */

/**
 * User streak data
 */
export interface UserStreakData {
  id: string;
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: Date | null;
  freezesRemaining: number;
  freezeUsedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Streak calculation result
 */
export interface StreakCalculationResult {
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: Date;
  freezeUsed: boolean;
}

/**
 * Streak milestone levels
 */
export const STREAK_MILESTONES = [7, 30, 100, 365] as const;

export type StreakMilestone = (typeof STREAK_MILESTONES)[number];

/**
 * Streak freeze configuration
 */
export const STREAK_FREEZE_CONFIG = {
  MAX_FREEZES: 5,
  MONTHLY_FREEZES: 2,
} as const;

