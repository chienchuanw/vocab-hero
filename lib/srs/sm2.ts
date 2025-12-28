/**
 * SM-2 Algorithm Implementation
 * 
 * This file implements the SM-2 (SuperMemo 2) spaced repetition algorithm
 * for calculating optimal review intervals based on user performance.
 * 
 * Reference: https://www.supermemo.com/en/archives1990-2015/english/ol/sm2
 */

import {
  type SM2Input,
  type ReviewResult,
  type SM2Data,
  type QualityRating,
  type DifficultyRating,
  MIN_EASINESS_FACTOR,
  MAX_EASINESS_FACTOR,
} from './sm2.types';

/**
 * Calculate next review schedule using SM-2 algorithm
 * 
 * The SM-2 algorithm calculates the next review interval based on:
 * - Current easiness factor (EF)
 * - Number of consecutive successful reviews (repetitions)
 * - User's quality rating (0-5)
 * 
 * @param input - SM-2 calculation input parameters
 * @returns Review result with updated SM-2 data and next review date
 */
export function calculateSM2(input: SM2Input): ReviewResult {
  const { currentData, quality, currentDate = new Date() } = input;
  const { easinessFactor, interval, repetitions } = currentData;

  // Calculate new easiness factor
  // Formula: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  const newEF = calculateEasinessFactor(easinessFactor, quality);

  // Determine if review was successful (quality >= 3)
  const wasSuccessful = quality >= 3;

  let newInterval: number;
  let newRepetitions: number;

  if (!wasSuccessful) {
    // Failed review: reset to beginning
    newInterval = 0;
    newRepetitions = 0;
  } else {
    // Successful review: calculate next interval
    newRepetitions = repetitions + 1;

    if (newRepetitions === 1) {
      // First successful review: 1 day
      newInterval = 1;
    } else if (newRepetitions === 2) {
      // Second successful review: 6 days
      newInterval = 6;
    } else {
      // Subsequent reviews: multiply previous interval by EF
      newInterval = Math.round(interval * newEF);
    }
  }

  // Calculate next review date
  const nextReviewDate = new Date(currentDate);
  nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

  return {
    sm2Data: {
      easinessFactor: newEF,
      interval: newInterval,
      repetitions: newRepetitions,
    },
    nextReviewDate,
    wasSuccessful,
  };
}

/**
 * Calculate new easiness factor based on quality rating
 * 
 * Formula: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
 * 
 * The result is clamped between MIN_EASINESS_FACTOR and MAX_EASINESS_FACTOR
 * 
 * @param currentEF - Current easiness factor
 * @param quality - Quality rating (0-5)
 * @returns New easiness factor
 */
function calculateEasinessFactor(
  currentEF: number,
  quality: QualityRating
): number {
  const newEF =
    currentEF + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

  // Clamp EF between minimum and maximum values
  return Math.max(MIN_EASINESS_FACTOR, Math.min(MAX_EASINESS_FACTOR, newEF));
}

/**
 * Convert simplified difficulty rating to SM-2 quality rating
 * 
 * Maps 3-button interface to SM-2's 0-5 scale:
 * - HARD: 3 (correct with difficulty)
 * - GOOD: 4 (correct with some hesitation)
 * - EASY: 5 (perfect response)
 * 
 * @param difficulty - User's difficulty rating
 * @returns Corresponding quality rating
 */
export function convertDifficultyToQuality(
  difficulty: DifficultyRating
): QualityRating {
  const mapping: Record<DifficultyRating, QualityRating> = {
    HARD: 3,
    GOOD: 4,
    EASY: 5,
  };

  return mapping[difficulty];
}

