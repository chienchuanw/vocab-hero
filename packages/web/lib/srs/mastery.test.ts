import { describe, it, expect } from 'vitest';
import { calculateMasteryLevel, MasteryLevel, getMasteryLevelConfig } from './mastery';
import type { SM2Data } from './sm2.types';

/**
 * Unit tests for mastery level calculation
 */

describe('calculateMasteryLevel', () => {
  it('should return NEW for null review schedule', () => {
    const level = calculateMasteryLevel(null);
    expect(level).toBe(MasteryLevel.NEW);
  });

  it('should return LEARNING for repetitions < 3', () => {
    const schedule: SM2Data = {
      easinessFactor: 2.5,
      interval: 1,
      repetitions: 0,
    };
    expect(calculateMasteryLevel(schedule)).toBe(MasteryLevel.LEARNING);

    schedule.repetitions = 1;
    expect(calculateMasteryLevel(schedule)).toBe(MasteryLevel.LEARNING);

    schedule.repetitions = 2;
    expect(calculateMasteryLevel(schedule)).toBe(MasteryLevel.LEARNING);
  });

  it('should return FAMILIAR for repetitions 3-5', () => {
    const schedule: SM2Data = {
      easinessFactor: 2.5,
      interval: 6,
      repetitions: 3,
    };
    expect(calculateMasteryLevel(schedule)).toBe(MasteryLevel.FAMILIAR);

    schedule.repetitions = 4;
    expect(calculateMasteryLevel(schedule)).toBe(MasteryLevel.FAMILIAR);

    schedule.repetitions = 5;
    expect(calculateMasteryLevel(schedule)).toBe(MasteryLevel.FAMILIAR);
  });

  it('should return LEARNED for repetitions 6-8', () => {
    const schedule: SM2Data = {
      easinessFactor: 2.5,
      interval: 15,
      repetitions: 6,
    };
    expect(calculateMasteryLevel(schedule)).toBe(MasteryLevel.LEARNED);

    schedule.repetitions = 7;
    expect(calculateMasteryLevel(schedule)).toBe(MasteryLevel.LEARNED);

    schedule.repetitions = 8;
    expect(calculateMasteryLevel(schedule)).toBe(MasteryLevel.LEARNED);
  });

  it('should return MASTERED for repetitions > 8 and interval > 21', () => {
    const schedule: SM2Data = {
      easinessFactor: 2.5,
      interval: 30,
      repetitions: 10,
    };
    expect(calculateMasteryLevel(schedule)).toBe(MasteryLevel.MASTERED);
  });

  it('should not return MASTERED if repetitions > 8 but interval <= 21', () => {
    const schedule: SM2Data = {
      easinessFactor: 2.5,
      interval: 20,
      repetitions: 10,
    };
    expect(calculateMasteryLevel(schedule)).toBe(MasteryLevel.LEARNED);
  });

  it('should not return MASTERED if interval > 21 but repetitions <= 8', () => {
    const schedule: SM2Data = {
      easinessFactor: 2.5,
      interval: 30,
      repetitions: 8,
    };
    expect(calculateMasteryLevel(schedule)).toBe(MasteryLevel.LEARNED);
  });
});

describe('getMasteryLevelConfig', () => {
  it('should return correct config for NEW level', () => {
    const config = getMasteryLevelConfig(MasteryLevel.NEW);
    expect(config.level).toBe(MasteryLevel.NEW);
    expect(config.label).toBe('New');
    expect(config.color).toBe('text-gray-700');
    expect(config.bgColor).toBe('bg-gray-100');
  });

  it('should return correct config for LEARNING level', () => {
    const config = getMasteryLevelConfig(MasteryLevel.LEARNING);
    expect(config.level).toBe(MasteryLevel.LEARNING);
    expect(config.label).toBe('Learning');
    expect(config.color).toBe('text-red-700');
    expect(config.bgColor).toBe('bg-red-100');
  });

  it('should return correct config for FAMILIAR level', () => {
    const config = getMasteryLevelConfig(MasteryLevel.FAMILIAR);
    expect(config.level).toBe(MasteryLevel.FAMILIAR);
    expect(config.label).toBe('Familiar');
    expect(config.color).toBe('text-orange-700');
    expect(config.bgColor).toBe('bg-orange-100');
  });

  it('should return correct config for LEARNED level', () => {
    const config = getMasteryLevelConfig(MasteryLevel.LEARNED);
    expect(config.level).toBe(MasteryLevel.LEARNED);
    expect(config.label).toBe('Learned');
    expect(config.color).toBe('text-yellow-700');
    expect(config.bgColor).toBe('bg-yellow-100');
  });

  it('should return correct config for MASTERED level', () => {
    const config = getMasteryLevelConfig(MasteryLevel.MASTERED);
    expect(config.level).toBe(MasteryLevel.MASTERED);
    expect(config.label).toBe('Mastered');
    expect(config.color).toBe('text-green-700');
    expect(config.bgColor).toBe('bg-green-100');
  });
});

