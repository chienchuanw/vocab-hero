import { describe, it, expect } from 'vitest';
import { calculateSM2, convertDifficultyToQuality } from './sm2';
import {
  DEFAULT_SM2_DATA,
  MIN_EASINESS_FACTOR,
  type SM2Data,
  type QualityRating,
  type DifficultyRating,
} from './sm2.types';

/**
 * Unit tests for SM-2 algorithm implementation
 * Tests cover various quality ratings and edge cases
 */

describe('calculateSM2', () => {
  describe('First review (repetitions = 0)', () => {
    it('should set interval to 1 day for quality >= 3', () => {
      const result = calculateSM2({
        currentData: DEFAULT_SM2_DATA,
        quality: 3,
      });

      expect(result.sm2Data.interval).toBe(1);
      expect(result.sm2Data.repetitions).toBe(1);
      expect(result.wasSuccessful).toBe(true);
    });

    it('should reset to interval 0 for quality < 3', () => {
      const result = calculateSM2({
        currentData: DEFAULT_SM2_DATA,
        quality: 2,
      });

      expect(result.sm2Data.interval).toBe(0);
      expect(result.sm2Data.repetitions).toBe(0);
      expect(result.wasSuccessful).toBe(false);
    });
  });

  describe('Second review (repetitions = 1)', () => {
    const firstReviewData: SM2Data = {
      easinessFactor: 2.5,
      interval: 1,
      repetitions: 1,
    };

    it('should set interval to 6 days for quality >= 3', () => {
      const result = calculateSM2({
        currentData: firstReviewData,
        quality: 4,
      });

      expect(result.sm2Data.interval).toBe(6);
      expect(result.sm2Data.repetitions).toBe(2);
      expect(result.wasSuccessful).toBe(true);
    });

    it('should reset to interval 0 for quality < 3', () => {
      const result = calculateSM2({
        currentData: firstReviewData,
        quality: 1,
      });

      expect(result.sm2Data.interval).toBe(0);
      expect(result.sm2Data.repetitions).toBe(0);
      expect(result.wasSuccessful).toBe(false);
    });
  });

  describe('Subsequent reviews (repetitions >= 2)', () => {
    const secondReviewData: SM2Data = {
      easinessFactor: 2.5,
      interval: 6,
      repetitions: 2,
    };

    it('should calculate interval based on EF for quality >= 3', () => {
      const result = calculateSM2({
        currentData: secondReviewData,
        quality: 5,
      });

      // interval = previous interval * EF
      // 6 * 2.5 = 15
      expect(result.sm2Data.interval).toBe(15);
      expect(result.sm2Data.repetitions).toBe(3);
      expect(result.wasSuccessful).toBe(true);
    });

    it('should reset to interval 0 for quality < 3', () => {
      const result = calculateSM2({
        currentData: secondReviewData,
        quality: 0,
      });

      expect(result.sm2Data.interval).toBe(0);
      expect(result.sm2Data.repetitions).toBe(0);
      expect(result.wasSuccessful).toBe(false);
    });
  });

  describe('Easiness Factor (EF) calculation', () => {
    it('should increase EF for quality 5', () => {
      const result = calculateSM2({
        currentData: DEFAULT_SM2_DATA,
        quality: 5,
      });

      // EF = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
      // EF = 2.5 + (0.1 - 0 * (0.08 + 0 * 0.02))
      // EF = 2.5 + 0.1 = 2.6, but capped at 2.5
      expect(result.sm2Data.easinessFactor).toBe(2.5);
    });

    it('should decrease EF for quality 3', () => {
      const result = calculateSM2({
        currentData: DEFAULT_SM2_DATA,
        quality: 3,
      });

      // EF = 2.5 + (0.1 - (5 - 3) * (0.08 + (5 - 3) * 0.02))
      // EF = 2.5 + (0.1 - 2 * (0.08 + 2 * 0.02))
      // EF = 2.5 + (0.1 - 2 * 0.12)
      // EF = 2.5 + (0.1 - 0.24) = 2.5 - 0.14 = 2.36
      expect(result.sm2Data.easinessFactor).toBe(2.36);
    });

    it('should not go below minimum EF', () => {
      const lowEFData: SM2Data = {
        easinessFactor: 1.4,
        interval: 6,
        repetitions: 2,
      };

      const result = calculateSM2({
        currentData: lowEFData,
        quality: 0,
      });

      expect(result.sm2Data.easinessFactor).toBeGreaterThanOrEqual(MIN_EASINESS_FACTOR);
    });
  });

  describe('Next review date calculation', () => {
    it('should calculate next review date based on interval', () => {
      const currentDate = new Date('2024-01-01T00:00:00Z');
      const result = calculateSM2({
        currentData: DEFAULT_SM2_DATA,
        quality: 4,
        currentDate,
      });

      const expectedDate = new Date('2024-01-02T00:00:00Z');
      expect(result.nextReviewDate.toISOString()).toBe(expectedDate.toISOString());
    });

    it('should use current date if not provided', () => {
      const beforeTest = new Date();
      const result = calculateSM2({
        currentData: DEFAULT_SM2_DATA,
        quality: 4,
      });
      const afterTest = new Date();

      const oneDayLater = new Date(beforeTest);
      oneDayLater.setDate(oneDayLater.getDate() + 1);

      expect(result.nextReviewDate.getTime()).toBeGreaterThanOrEqual(oneDayLater.getTime() - 1000);
      expect(result.nextReviewDate.getTime()).toBeLessThanOrEqual(
        new Date(afterTest).setDate(afterTest.getDate() + 1) + 1000
      );
    });
  });

  describe('Edge cases', () => {
    it('should handle quality rating of 0', () => {
      const result = calculateSM2({
        currentData: DEFAULT_SM2_DATA,
        quality: 0,
      });

      expect(result.sm2Data.interval).toBe(0);
      expect(result.sm2Data.repetitions).toBe(0);
      expect(result.wasSuccessful).toBe(false);
    });

    it('should handle quality rating of 5', () => {
      const result = calculateSM2({
        currentData: DEFAULT_SM2_DATA,
        quality: 5,
      });

      expect(result.sm2Data.interval).toBe(1);
      expect(result.sm2Data.repetitions).toBe(1);
      expect(result.wasSuccessful).toBe(true);
    });

    it('should handle very high repetition count', () => {
      const highRepData: SM2Data = {
        easinessFactor: 2.5,
        interval: 100,
        repetitions: 50,
      };

      const result = calculateSM2({
        currentData: highRepData,
        quality: 4,
      });

      expect(result.sm2Data.interval).toBe(250);
      expect(result.sm2Data.repetitions).toBe(51);
    });
  });
});

describe('convertDifficultyToQuality', () => {
  it('should convert HARD to quality 3', () => {
    const quality = convertDifficultyToQuality('HARD');
    expect(quality).toBe(3);
  });

  it('should convert GOOD to quality 4', () => {
    const quality = convertDifficultyToQuality('GOOD');
    expect(quality).toBe(4);
  });

  it('should convert EASY to quality 5', () => {
    const quality = convertDifficultyToQuality('EASY');
    expect(quality).toBe(5);
  });
});
