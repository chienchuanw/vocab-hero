/**
 * SM-2 Algorithm Type Definitions
 * 
 * This file contains TypeScript type definitions for the SM-2 (SuperMemo 2) 
 * spaced repetition algorithm implementation.
 */

/**
 * Quality rating from user response (0-5 scale)
 * 
 * Original SM-2 scale:
 * - 0: Complete blackout
 * - 1: Incorrect response, but correct one seemed familiar
 * - 2: Incorrect response, but correct one remembered
 * - 3: Correct response, but with difficulty
 * - 4: Correct response, with some hesitation
 * - 5: Perfect response
 */
export type QualityRating = 0 | 1 | 2 | 3 | 4 | 5;

/**
 * Simplified user difficulty rating (3-button interface)
 * 
 * Maps to QualityRating:
 * - HARD: User found it difficult (maps to 3)
 * - GOOD: User remembered with normal effort (maps to 4)
 * - EASY: User remembered easily (maps to 5)
 */
export type DifficultyRating = 'HARD' | 'GOOD' | 'EASY';

/**
 * SM-2 algorithm data structure
 * 
 * Contains all necessary data for calculating next review schedule
 */
export interface SM2Data {
  /**
   * Easiness Factor (EF)
   * Range: 1.3 to 2.5 (default: 2.5)
   * Determines how quickly intervals increase
   */
  easinessFactor: number;

  /**
   * Current interval in days
   * - 0: Not yet reviewed
   * - 1: First review (after 1 day)
   * - 6: Second review (after 6 days)
   * - Then calculated based on EF
   */
  interval: number;

  /**
   * Number of consecutive successful reviews
   * Resets to 0 when quality < 3
   */
  repetitions: number;
}

/**
 * Result of SM-2 calculation
 * 
 * Contains updated SM-2 data and next review date
 */
export interface ReviewResult {
  /**
   * Updated SM-2 data after review
   */
  sm2Data: SM2Data;

  /**
   * Next review date (calculated from current date + interval)
   */
  nextReviewDate: Date;

  /**
   * Whether the review was successful (quality >= 3)
   */
  wasSuccessful: boolean;
}

/**
 * Input parameters for SM-2 calculation
 */
export interface SM2Input {
  /**
   * Current SM-2 data
   */
  currentData: SM2Data;

  /**
   * User's quality rating (0-5)
   */
  quality: QualityRating;

  /**
   * Current date (defaults to now if not provided)
   */
  currentDate?: Date;
}

/**
 * Default SM-2 data for new vocabulary items
 */
export const DEFAULT_SM2_DATA: SM2Data = {
  easinessFactor: 2.5,
  interval: 0,
  repetitions: 0,
};

/**
 * Minimum allowed easiness factor
 */
export const MIN_EASINESS_FACTOR = 1.3;

/**
 * Maximum allowed easiness factor
 */
export const MAX_EASINESS_FACTOR = 2.5;

