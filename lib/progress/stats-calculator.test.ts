import { describe, it, expect } from 'vitest';
import {
  calculateTotalWords,
  calculateMasteryRate,
  calculateTotalStudyTime,
  calculateMasteryDistribution,
  calculateGroupDistribution,
  calculateProgressTrend,
  type VocabularyWithMastery,
  type ProgressLog,
} from './stats-calculator';

/**
 * Statistics Calculator Test Suite
 * Tests for progress statistics calculation functions
 */

describe('calculateTotalWords', () => {
  it('should return total number of vocabulary items', () => {
    const vocabulary: VocabularyWithMastery[] = [
      { id: '1', masteryLevel: 'NEW' } as VocabularyWithMastery,
      { id: '2', masteryLevel: 'LEARNING' } as VocabularyWithMastery,
      { id: '3', masteryLevel: 'MASTERED' } as VocabularyWithMastery,
    ];

    expect(calculateTotalWords(vocabulary)).toBe(3);
  });

  it('should return 0 for empty array', () => {
    expect(calculateTotalWords([])).toBe(0);
  });
});

describe('calculateMasteryRate', () => {
  it('should calculate percentage of learned and mastered words', () => {
    const vocabulary: VocabularyWithMastery[] = [
      { id: '1', masteryLevel: 'NEW' } as VocabularyWithMastery,
      { id: '2', masteryLevel: 'LEARNING' } as VocabularyWithMastery,
      { id: '3', masteryLevel: 'FAMILIAR' } as VocabularyWithMastery,
      { id: '4', masteryLevel: 'LEARNED' } as VocabularyWithMastery,
      { id: '5', masteryLevel: 'MASTERED' } as VocabularyWithMastery,
    ];

    expect(calculateMasteryRate(vocabulary)).toBe(40);
  });

  it('should return 0 for empty array', () => {
    expect(calculateMasteryRate([])).toBe(0);
  });

  it('should return 100 when all words are mastered', () => {
    const vocabulary: VocabularyWithMastery[] = [
      { id: '1', masteryLevel: 'MASTERED' } as VocabularyWithMastery,
      { id: '2', masteryLevel: 'LEARNED' } as VocabularyWithMastery,
    ];

    expect(calculateMasteryRate(vocabulary)).toBe(100);
  });
});

describe('calculateTotalStudyTime', () => {
  it('should sum up all study time from progress logs', () => {
    const logs: ProgressLog[] = [
      { timeSpentMinutes: 30 } as ProgressLog,
      { timeSpentMinutes: 45 } as ProgressLog,
      { timeSpentMinutes: 25 } as ProgressLog,
    ];

    expect(calculateTotalStudyTime(logs)).toBe(100);
  });

  it('should return 0 for empty array', () => {
    expect(calculateTotalStudyTime([])).toBe(0);
  });
});

describe('calculateMasteryDistribution', () => {
  it('should count words by mastery level', () => {
    const vocabulary: VocabularyWithMastery[] = [
      { id: '1', masteryLevel: 'NEW' } as VocabularyWithMastery,
      { id: '2', masteryLevel: 'NEW' } as VocabularyWithMastery,
      { id: '3', masteryLevel: 'LEARNING' } as VocabularyWithMastery,
      { id: '4', masteryLevel: 'FAMILIAR' } as VocabularyWithMastery,
      { id: '5', masteryLevel: 'LEARNED' } as VocabularyWithMastery,
      { id: '6', masteryLevel: 'MASTERED' } as VocabularyWithMastery,
    ];

    const distribution = calculateMasteryDistribution(vocabulary);

    expect(distribution).toEqual([
      { level: 'NEW', count: 2 },
      { level: 'LEARNING', count: 1 },
      { level: 'FAMILIAR', count: 1 },
      { level: 'LEARNED', count: 1 },
      { level: 'MASTERED', count: 1 },
    ]);
  });

  it('should return zeros for empty array', () => {
    const distribution = calculateMasteryDistribution([]);

    expect(distribution).toEqual([
      { level: 'NEW', count: 0 },
      { level: 'LEARNING', count: 0 },
      { level: 'FAMILIAR', count: 0 },
      { level: 'LEARNED', count: 0 },
      { level: 'MASTERED', count: 0 },
    ]);
  });
});

describe('calculateGroupDistribution', () => {
  it('should count words by group', () => {
    const vocabulary = [
      { id: '1', groups: [{ id: 'g1', name: 'JLPT N5' }] },
      { id: '2', groups: [{ id: 'g1', name: 'JLPT N5' }] },
      { id: '3', groups: [{ id: 'g2', name: 'JLPT N4' }] },
      { id: '4', groups: [] },
    ];

    const distribution = calculateGroupDistribution(vocabulary as any);

    expect(distribution).toHaveLength(3);
    expect(distribution.find((d) => d.name === 'JLPT N5')?.value).toBe(2);
    expect(distribution.find((d) => d.name === 'JLPT N4')?.value).toBe(1);
    expect(distribution.find((d) => d.name === 'Ungrouped')?.value).toBe(1);
  });
});

describe('calculateProgressTrend', () => {
  it('should calculate trend between current and previous period', () => {
    const currentLogs: ProgressLog[] = [
      { wordsStudied: 10 } as ProgressLog,
      { wordsStudied: 15 } as ProgressLog,
    ];

    const previousLogs: ProgressLog[] = [
      { wordsStudied: 8 } as ProgressLog,
      { wordsStudied: 12 } as ProgressLog,
    ];

    expect(calculateProgressTrend(currentLogs, previousLogs)).toBe(5);
  });

  it('should return 0 when previous period has no data', () => {
    const currentLogs: ProgressLog[] = [{ wordsStudied: 10 } as ProgressLog];

    expect(calculateProgressTrend(currentLogs, [])).toBe(0);
  });
});

