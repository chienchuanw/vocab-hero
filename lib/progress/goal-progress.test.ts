import { describe, it, expect } from 'vitest';
import {
  calculateGoalProgress,
  isGoalAchieved,
  getGoalProgressPercentage,
} from './goal-progress';

describe('Goal Progress Calculation', () => {
  describe('calculateGoalProgress', () => {
    it('should calculate progress for words goal', () => {
      const result = calculateGoalProgress({
        wordsStudied: 5,
        minutesStudied: 15,
        wordsGoal: 10,
        minutesGoal: 30,
      });

      expect(result.wordsProgress).toBe(5);
      expect(result.wordsPercentage).toBe(50);
      expect(result.minutesProgress).toBe(15);
      expect(result.minutesPercentage).toBe(50);
      expect(result.isWordsGoalAchieved).toBe(false);
      expect(result.isMinutesGoalAchieved).toBe(false);
      expect(result.isBothGoalsAchieved).toBe(false);
    });

    it('should handle goal achievement', () => {
      const result = calculateGoalProgress({
        wordsStudied: 10,
        minutesStudied: 30,
        wordsGoal: 10,
        minutesGoal: 30,
      });

      expect(result.isWordsGoalAchieved).toBe(true);
      expect(result.isMinutesGoalAchieved).toBe(true);
      expect(result.isBothGoalsAchieved).toBe(true);
    });

    it('should handle exceeding goals', () => {
      const result = calculateGoalProgress({
        wordsStudied: 15,
        minutesStudied: 45,
        wordsGoal: 10,
        minutesGoal: 30,
      });

      expect(result.wordsPercentage).toBe(150);
      expect(result.minutesPercentage).toBe(150);
      expect(result.isBothGoalsAchieved).toBe(true);
    });

    it('should handle zero progress', () => {
      const result = calculateGoalProgress({
        wordsStudied: 0,
        minutesStudied: 0,
        wordsGoal: 10,
        minutesGoal: 30,
      });

      expect(result.wordsPercentage).toBe(0);
      expect(result.minutesPercentage).toBe(0);
      expect(result.isBothGoalsAchieved).toBe(false);
    });
  });

  describe('isGoalAchieved', () => {
    it('should return true when progress meets goal', () => {
      expect(isGoalAchieved(10, 10)).toBe(true);
    });

    it('should return true when progress exceeds goal', () => {
      expect(isGoalAchieved(15, 10)).toBe(true);
    });

    it('should return false when progress is below goal', () => {
      expect(isGoalAchieved(5, 10)).toBe(false);
    });

    it('should return true when goal is zero', () => {
      expect(isGoalAchieved(0, 0)).toBe(true);
    });
  });

  describe('getGoalProgressPercentage', () => {
    it('should calculate percentage correctly', () => {
      expect(getGoalProgressPercentage(5, 10)).toBe(50);
    });

    it('should handle 100% completion', () => {
      expect(getGoalProgressPercentage(10, 10)).toBe(100);
    });

    it('should handle over 100% completion', () => {
      expect(getGoalProgressPercentage(15, 10)).toBe(150);
    });

    it('should handle zero progress', () => {
      expect(getGoalProgressPercentage(0, 10)).toBe(0);
    });

    it('should return 0 when goal is zero', () => {
      expect(getGoalProgressPercentage(5, 0)).toBe(0);
    });

    it('should round to nearest integer', () => {
      expect(getGoalProgressPercentage(1, 3)).toBe(33);
      expect(getGoalProgressPercentage(2, 3)).toBe(67);
    });
  });
});

