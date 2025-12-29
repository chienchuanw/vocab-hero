import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { prisma } from '@/lib/db/prisma';
import {
  calculateStreak,
  getOrCreateUserStreak,
  updateStreakOnStudy,
  shouldUseFreezeAutomatically,
  resetMonthlyFreezes,
} from './streak';

describe('Streak Calculation', () => {
  let testUserId: string;

  beforeEach(async () => {
    const user = await prisma.user.create({
      data: {
        email: 'test-streak@example.com',
        name: 'Test Streak User',
      },
    });
    testUserId = user.id;
  });

  afterEach(async () => {
    await prisma.userStreak.deleteMany({
      where: { userId: testUserId },
    });
    await prisma.progressLog.deleteMany({
      where: { userId: testUserId },
    });
    await prisma.user.delete({
      where: { id: testUserId },
    });
  });

  describe('calculateStreak', () => {
    it('should return 1 for first study day', () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const result = calculateStreak(null, today);

      expect(result.currentStreak).toBe(1);
      expect(result.longestStreak).toBe(1);
      expect(result.lastStudyDate.getTime()).toBe(today.getTime());
      expect(result.freezeUsed).toBe(false);
    });

    it('should increment streak for consecutive days', () => {
      const yesterday = new Date();
      yesterday.setHours(0, 0, 0, 0);
      yesterday.setDate(yesterday.getDate() - 1);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const result = calculateStreak(yesterday, today, 5);

      expect(result.currentStreak).toBe(6);
      expect(result.longestStreak).toBe(6);
      expect(result.freezeUsed).toBe(false);
    });

    it('should maintain streak for same day study', () => {
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);

      const result = calculateStreak(today, today, 5, 5);

      expect(result.currentStreak).toBe(5);
      expect(result.longestStreak).toBe(5);
      expect(result.freezeUsed).toBe(false);
    });

    it('should reset streak if gap is more than 1 day without freeze', () => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setUTCHours(0, 0, 0, 0);
      threeDaysAgo.setUTCDate(threeDaysAgo.getUTCDate() - 3);

      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);

      const result = calculateStreak(threeDaysAgo, today, 10, 10);

      expect(result.currentStreak).toBe(1);
      expect(result.longestStreak).toBe(10);
      expect(result.freezeUsed).toBe(false);
    });

    it('should use freeze automatically for 1-day gap', () => {
      const twoDaysAgo = new Date();
      twoDaysAgo.setHours(0, 0, 0, 0);
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const result = calculateStreak(twoDaysAgo, today, 10, 10, 2);

      expect(result.currentStreak).toBe(11);
      expect(result.longestStreak).toBe(11);
      expect(result.freezeUsed).toBe(true);
    });

    it('should not use freeze if none available', () => {
      const twoDaysAgo = new Date();
      twoDaysAgo.setHours(0, 0, 0, 0);
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const result = calculateStreak(twoDaysAgo, today, 10, 10, 0);

      expect(result.currentStreak).toBe(1);
      expect(result.longestStreak).toBe(10);
      expect(result.freezeUsed).toBe(false);
    });
  });

  describe('getOrCreateUserStreak', () => {
    it('should create new streak record if not exists', async () => {
      const streak = await getOrCreateUserStreak(testUserId);

      expect(streak).toBeDefined();
      expect(streak.userId).toBe(testUserId);
      expect(streak.currentStreak).toBe(0);
      expect(streak.longestStreak).toBe(0);
      expect(streak.freezesRemaining).toBe(0);
    });

    it('should return existing streak record', async () => {
      const firstStreak = await getOrCreateUserStreak(testUserId);
      const secondStreak = await getOrCreateUserStreak(testUserId);

      expect(firstStreak.id).toBe(secondStreak.id);
    });
  });

  describe('updateStreakOnStudy', () => {
    it('should update streak when user studies', async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const streak = await updateStreakOnStudy(testUserId, today);

      expect(streak.currentStreak).toBe(1);
      expect(streak.longestStreak).toBe(1);
      expect(streak.lastStudyDate?.getTime()).toBe(today.getTime());
    });

    it('should increment streak for consecutive days', async () => {
      const yesterday = new Date();
      yesterday.setHours(0, 0, 0, 0);
      yesterday.setDate(yesterday.getDate() - 1);

      await updateStreakOnStudy(testUserId, yesterday);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const streak = await updateStreakOnStudy(testUserId, today);

      expect(streak.currentStreak).toBe(2);
      expect(streak.longestStreak).toBe(2);
    });

    it('should not change streak for same day multiple studies', async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      await updateStreakOnStudy(testUserId, today);
      const streak = await updateStreakOnStudy(testUserId, today);

      expect(streak.currentStreak).toBe(1);
      expect(streak.longestStreak).toBe(1);
    });
  });

  describe('shouldUseFreezeAutomatically', () => {
    it('should return true for 1-day gap with freezes available', () => {
      const result = shouldUseFreezeAutomatically(1, 2);
      expect(result).toBe(true);
    });

    it('should return false for 1-day gap without freezes', () => {
      const result = shouldUseFreezeAutomatically(1, 0);
      expect(result).toBe(false);
    });

    it('should return false for gaps larger than 1 day', () => {
      const result = shouldUseFreezeAutomatically(2, 5);
      expect(result).toBe(false);
    });

    it('should return false for no gap', () => {
      const result = shouldUseFreezeAutomatically(0, 5);
      expect(result).toBe(false);
    });
  });

  describe('resetMonthlyFreezes', () => {
    it('should reset freezes to monthly amount if last reset was last month', async () => {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);

      await prisma.userStreak.create({
        data: {
          userId: testUserId,
          currentStreak: 10,
          longestStreak: 10,
          freezesRemaining: 0,
          freezeUsedAt: lastMonth,
        },
      });

      const streak = await resetMonthlyFreezes(testUserId);

      expect(streak.freezesRemaining).toBe(2);
    });

    it('should not reset if already reset this month', async () => {
      const today = new Date();

      await prisma.userStreak.create({
        data: {
          userId: testUserId,
          currentStreak: 10,
          longestStreak: 10,
          freezesRemaining: 1,
          freezeUsedAt: today,
        },
      });

      const streak = await resetMonthlyFreezes(testUserId);

      expect(streak.freezesRemaining).toBe(1);
    });

    it('should cap freezes at maximum allowed', async () => {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);

      await prisma.userStreak.create({
        data: {
          userId: testUserId,
          currentStreak: 10,
          longestStreak: 10,
          freezesRemaining: 4,
          freezeUsedAt: lastMonth,
        },
      });

      const streak = await resetMonthlyFreezes(testUserId);

      expect(streak.freezesRemaining).toBeLessThanOrEqual(5);
    });
  });
});
