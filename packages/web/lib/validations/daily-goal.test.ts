import { describe, it, expect } from 'vitest';
import {
  updateDailyGoalSchema,
  dailyGoalResponseSchema,
} from './daily-goal';

describe('DailyGoal Validation Schemas', () => {
  describe('updateDailyGoalSchema', () => {
    it('should validate valid daily goal update data', () => {
      const validData = {
        wordsPerDay: 10,
        minutesPerDay: 30,
        reminderTime: '10:00',
        pushEnabled: false,
      };

      const result = updateDailyGoalSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept wordsPerDay between 1 and 100', () => {
      const data = {
        wordsPerDay: 50,
        minutesPerDay: 30,
      };

      const result = updateDailyGoalSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject wordsPerDay less than 1', () => {
      const data = {
        wordsPerDay: 0,
        minutesPerDay: 30,
      };

      const result = updateDailyGoalSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject wordsPerDay greater than 100', () => {
      const data = {
        wordsPerDay: 101,
        minutesPerDay: 30,
      };

      const result = updateDailyGoalSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should accept minutesPerDay between 5 and 120', () => {
      const data = {
        wordsPerDay: 10,
        minutesPerDay: 60,
      };

      const result = updateDailyGoalSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject minutesPerDay less than 5', () => {
      const data = {
        wordsPerDay: 10,
        minutesPerDay: 4,
      };

      const result = updateDailyGoalSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject minutesPerDay greater than 120', () => {
      const data = {
        wordsPerDay: 10,
        minutesPerDay: 121,
      };

      const result = updateDailyGoalSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should validate reminderTime in HH:mm format', () => {
      const data = {
        wordsPerDay: 10,
        minutesPerDay: 30,
        reminderTime: '14:30',
      };

      const result = updateDailyGoalSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject invalid reminderTime format', () => {
      const data = {
        wordsPerDay: 10,
        minutesPerDay: 30,
        reminderTime: '25:00',
      };

      const result = updateDailyGoalSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should accept pushEnabled as boolean', () => {
      const data = {
        wordsPerDay: 10,
        minutesPerDay: 30,
        pushEnabled: true,
      };

      const result = updateDailyGoalSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should make all fields optional', () => {
      const data = {};

      const result = updateDailyGoalSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('dailyGoalResponseSchema', () => {
    it('should validate complete daily goal response', () => {
      const validResponse = {
        id: 'goal123',
        userId: 'user123',
        wordsPerDay: 10,
        minutesPerDay: 30,
        reminderTime: '10:00',
        pushEnabled: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = dailyGoalResponseSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });
  });
});

