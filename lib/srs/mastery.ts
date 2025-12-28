/**
 * Mastery Level Calculation
 * 
 * This file defines mastery levels for vocabulary items based on
 * their review schedule data (repetitions and interval).
 */

import type { SM2Data } from './sm2.types';

/**
 * Mastery level enum
 * 
 * Represents the learning progress of a vocabulary item:
 * - NEW: Not yet reviewed
 * - LEARNING: Early stage (repetitions < 3)
 * - FAMILIAR: Getting familiar (repetitions 3-5)
 * - LEARNED: Well learned (repetitions 6-8)
 * - MASTERED: Fully mastered (repetitions > 8 and interval > 21 days)
 */
export enum MasteryLevel {
  NEW = 'NEW',
  LEARNING = 'LEARNING',
  FAMILIAR = 'FAMILIAR',
  LEARNED = 'LEARNED',
  MASTERED = 'MASTERED',
}

/**
 * Mastery level display configuration
 * 
 * Defines the color and label for each mastery level
 */
export interface MasteryLevelConfig {
  level: MasteryLevel;
  label: string;
  color: string;
  bgColor: string;
  description: string;
}

/**
 * Mastery level configurations
 */
export const MASTERY_LEVEL_CONFIGS: Record<MasteryLevel, MasteryLevelConfig> = {
  [MasteryLevel.NEW]: {
    level: MasteryLevel.NEW,
    label: 'New',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    description: 'Not yet reviewed',
  },
  [MasteryLevel.LEARNING]: {
    level: MasteryLevel.LEARNING,
    label: 'Learning',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    description: 'Early learning stage',
  },
  [MasteryLevel.FAMILIAR]: {
    level: MasteryLevel.FAMILIAR,
    label: 'Familiar',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
    description: 'Getting familiar',
  },
  [MasteryLevel.LEARNED]: {
    level: MasteryLevel.LEARNED,
    label: 'Learned',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
    description: 'Well learned',
  },
  [MasteryLevel.MASTERED]: {
    level: MasteryLevel.MASTERED,
    label: 'Mastered',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    description: 'Fully mastered',
  },
};

/**
 * Calculate mastery level based on review schedule data
 * 
 * @param reviewSchedule - Review schedule data (null for new items)
 * @returns Mastery level
 */
export function calculateMasteryLevel(
  reviewSchedule: SM2Data | null
): MasteryLevel {
  if (!reviewSchedule) {
    return MasteryLevel.NEW;
  }

  const { repetitions, interval } = reviewSchedule;

  if (repetitions > 8 && interval > 21) {
    return MasteryLevel.MASTERED;
  }

  if (repetitions >= 6) {
    return MasteryLevel.LEARNED;
  }

  if (repetitions >= 3) {
    return MasteryLevel.FAMILIAR;
  }

  return MasteryLevel.LEARNING;
}

/**
 * Get mastery level configuration
 * 
 * @param level - Mastery level
 * @returns Mastery level configuration
 */
export function getMasteryLevelConfig(
  level: MasteryLevel
): MasteryLevelConfig {
  return MASTERY_LEVEL_CONFIGS[level];
}

