import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { prisma } from '@/lib/db/prisma';
import {
  getOrCreateDailyLog,
  updateDailyLog,
  getDailyLogs,
  getProgressRange,
} from './progress-log';
import type { UpdateProgressInput } from './progress.types';

describe('ProgressLog Database Operations', () => {
  let testUserId: string;

  beforeEach(async () => {
    // Clean up any existing test user first
    await prisma.user.deleteMany({
      where: { email: 'test-progress@example.com' },
    });

    // Create test user
    const user = await prisma.user.create({
      data: {
        email: 'test-progress@example.com',
        name: 'Test Progress User',
      },
    });
    testUserId = user.id;
  });

  afterEach(async () => {
    // Clean up test data
    if (testUserId) {
      await prisma.progressLog.deleteMany({
        where: { userId: testUserId },
      });
      await prisma.user
        .delete({
          where: { id: testUserId },
        })
        .catch(() => {
          // Ignore error if user already deleted
        });
    }
  });

  describe('getOrCreateDailyLog', () => {
    it('should create a new daily log if it does not exist', async () => {
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);

      const log = await getOrCreateDailyLog(testUserId, today);

      expect(log).toBeDefined();
      expect(log.userId).toBe(testUserId);
      expect(log.date.getTime()).toBe(today.getTime());
      expect(log.wordsStudied).toBe(0);
      expect(log.newWords).toBe(0);
      expect(log.reviewWords).toBe(0);
      expect(log.timeSpentMinutes).toBe(0);
      expect(log.sessionsCompleted).toBe(0);
      expect(log.correctAnswers).toBe(0);
      expect(log.totalAnswers).toBe(0);
    });

    it('should return existing daily log if it already exists', async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Create first log
      const firstLog = await getOrCreateDailyLog(testUserId, today);

      // Try to get the same log again
      const secondLog = await getOrCreateDailyLog(testUserId, today);

      expect(firstLog.id).toBe(secondLog.id);
      expect(secondLog.userId).toBe(testUserId);
    });

    it('should normalize date to start of day', async () => {
      const dateWithTime = new Date('2024-01-15T14:30:00Z');
      const expectedDate = new Date('2024-01-15T00:00:00Z');

      const log = await getOrCreateDailyLog(testUserId, dateWithTime);

      expect(log.date.getTime()).toBe(expectedDate.getTime());
    });
  });

  describe('updateDailyLog', () => {
    it('should update existing daily log with new values', async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Create initial log
      await getOrCreateDailyLog(testUserId, today);

      // Update the log
      const updateData: UpdateProgressInput = {
        userId: testUserId,
        date: today,
        wordsStudied: 10,
        newWords: 5,
        reviewWords: 5,
        timeSpentMinutes: 30,
        sessionsCompleted: 1,
        correctAnswers: 8,
        totalAnswers: 10,
      };

      const updatedLog = await updateDailyLog(updateData);

      expect(updatedLog.wordsStudied).toBe(10);
      expect(updatedLog.newWords).toBe(5);
      expect(updatedLog.reviewWords).toBe(5);
      expect(updatedLog.timeSpentMinutes).toBe(30);
      expect(updatedLog.sessionsCompleted).toBe(1);
      expect(updatedLog.correctAnswers).toBe(8);
      expect(updatedLog.totalAnswers).toBe(10);
    });

    it('should increment values when updating multiple times', async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Create initial log
      await getOrCreateDailyLog(testUserId, today);

      // First update
      await updateDailyLog({
        userId: testUserId,
        date: today,
        wordsStudied: 5,
        timeSpentMinutes: 15,
        sessionsCompleted: 1,
      });

      // Second update
      const finalLog = await updateDailyLog({
        userId: testUserId,
        date: today,
        wordsStudied: 3,
        timeSpentMinutes: 10,
        sessionsCompleted: 1,
      });

      expect(finalLog.wordsStudied).toBe(8);
      expect(finalLog.timeSpentMinutes).toBe(25);
      expect(finalLog.sessionsCompleted).toBe(2);
    });

    it('should create log if it does not exist when updating', async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const updateData: UpdateProgressInput = {
        userId: testUserId,
        date: today,
        wordsStudied: 5,
        newWords: 3,
        reviewWords: 2,
      };

      const log = await updateDailyLog(updateData);

      expect(log).toBeDefined();
      expect(log.wordsStudied).toBe(5);
      expect(log.newWords).toBe(3);
      expect(log.reviewWords).toBe(2);
    });
  });

  describe('getDailyLogs', () => {
    it('should return logs for a specific user', async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Create logs for multiple days
      await updateDailyLog({
        userId: testUserId,
        date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000),
        wordsStudied: 5,
      });
      await updateDailyLog({
        userId: testUserId,
        date: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000),
        wordsStudied: 10,
      });
      await updateDailyLog({
        userId: testUserId,
        date: today,
        wordsStudied: 15,
      });

      const logs = await getDailyLogs(testUserId);

      expect(logs).toHaveLength(3);
      expect(logs[0]?.wordsStudied).toBe(15); // Most recent first
      expect(logs[1]?.wordsStudied).toBe(10);
      expect(logs[2]?.wordsStudied).toBe(5);
    });

    it('should return empty array if no logs exist', async () => {
      const logs = await getDailyLogs(testUserId);
      expect(logs).toEqual([]);
    });

    it('should limit results when limit parameter is provided', async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Create 5 logs
      for (let i = 0; i < 5; i++) {
        await updateDailyLog({
          userId: testUserId,
          date: new Date(today.getTime() - i * 24 * 60 * 60 * 1000),
          wordsStudied: i + 1,
        });
      }

      const logs = await getDailyLogs(testUserId, 3);

      expect(logs).toHaveLength(3);
    });
  });

  describe('getProgressRange', () => {
    it('should return logs within date range', async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Create logs for 7 days
      for (let i = 0; i < 7; i++) {
        await updateDailyLog({
          userId: testUserId,
          date: new Date(today.getTime() - i * 24 * 60 * 60 * 1000),
          wordsStudied: i + 1,
        });
      }

      const startDate = new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000);
      const endDate = today;

      const logs = await getProgressRange(testUserId, { startDate, endDate });

      expect(logs).toHaveLength(4); // Today + 3 days back
    });

    it('should return empty array if no logs in range', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-07');

      const logs = await getProgressRange(testUserId, { startDate, endDate });

      expect(logs).toEqual([]);
    });

    it('should include boundary dates', async () => {
      const startDate = new Date('2024-01-15');
      startDate.setUTCHours(0, 0, 0, 0);
      const endDate = new Date('2024-01-17');
      endDate.setUTCHours(0, 0, 0, 0);

      await updateDailyLog({
        userId: testUserId,
        date: startDate,
        wordsStudied: 5,
      });
      await updateDailyLog({
        userId: testUserId,
        date: endDate,
        wordsStudied: 10,
      });

      const logs = await getProgressRange(testUserId, { startDate, endDate });

      expect(logs).toHaveLength(2);
      expect(logs.some((log) => log.date.getTime() === startDate.getTime())).toBe(true);
      expect(logs.some((log) => log.date.getTime() === endDate.getTime())).toBe(true);
    });
  });
});
