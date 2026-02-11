/**
 * Progress tracking type definitions
 */

/**
 * Daily progress log data
 */
export interface DailyProgressLog {
  id: string;
  userId: string;
  date: Date;
  wordsStudied: number;
  newWords: number;
  reviewWords: number;
  timeSpentMinutes: number;
  sessionsCompleted: number;
  correctAnswers: number;
  totalAnswers: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Input data for creating or updating daily progress
 */
export interface UpdateProgressInput {
  userId: string;
  date: Date;
  wordsStudied?: number;
  newWords?: number;
  reviewWords?: number;
  timeSpentMinutes?: number;
  sessionsCompleted?: number;
  correctAnswers?: number;
  totalAnswers?: number;
}

/**
 * Date range for querying progress logs
 */
export interface ProgressDateRange {
  startDate: Date;
  endDate: Date;
}

/**
 * Progress statistics aggregated over a period
 */
export interface ProgressStats {
  totalWordsStudied: number;
  totalNewWords: number;
  totalReviewWords: number;
  totalTimeSpentMinutes: number;
  totalSessionsCompleted: number;
  totalCorrectAnswers: number;
  totalAnswers: number;
  averageAccuracy: number;
  daysActive: number;
}

