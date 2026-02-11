import { describe, it, expect, beforeEach } from 'vitest';
import { prisma } from './prisma';
import { cleanDatabase } from '@/tests/setup-db';
import { getOrCreateDefaultUser, recreateDefaultUserData } from './default-user';

describe('Default User Utilities', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  describe('getOrCreateDefaultUser', () => {
    it('should create default user if none exists', async () => {
      const user = await getOrCreateDefaultUser();

      expect(user).toBeDefined();
      expect(user.email).toBe('default@vocab-hero.local');
      expect(user.name).toBe('Default User');
    });

    it('should return existing default user if already exists', async () => {
      const firstUser = await getOrCreateDefaultUser();
      const secondUser = await getOrCreateDefaultUser();

      expect(firstUser.id).toBe(secondUser.id);
      expect(firstUser.email).toBe(secondUser.email);
    });

    it('should be idempotent - multiple calls return same user', async () => {
      const users = await Promise.all([
        getOrCreateDefaultUser(),
        getOrCreateDefaultUser(),
        getOrCreateDefaultUser(),
      ]);

      const firstId = users[0].id;
      expect(users.every((u: { id: string }) => u.id === firstId)).toBe(true);
    });
  });

  describe('recreateDefaultUserData', () => {
    it('should create default user with all related data', async () => {
      const userId = await recreateDefaultUserData();

      const user = await prisma.user.findUnique({ where: { id: userId } });
      expect(user).toBeDefined();
      expect(user?.email).toBe('default@vocab-hero.local');

      const settings = await prisma.userSettings.findUnique({ where: { userId } });
      expect(settings).toBeDefined();
      expect(settings?.theme).toBe('SYSTEM');
      expect(settings?.ttsSpeed).toBe(1.0);
      expect(settings?.cardsPerSession).toBe(20);
      expect(settings?.defaultStudyMode).toBe('FLASHCARD');

      const goal = await prisma.dailyGoal.findUnique({ where: { userId } });
      expect(goal).toBeDefined();
      expect(goal?.wordsPerDay).toBe(10);
      expect(goal?.minutesPerDay).toBe(30);
      expect(goal?.reminderTime).toBe('10:00');
      expect(goal?.pushEnabled).toBe(false);

      const prefs = await prisma.notificationPreference.findUnique({ where: { userId } });
      expect(prefs).toBeDefined();
      expect(prefs?.goalAchievementEnabled).toBe(true);
      expect(prefs?.streakWarningEnabled).toBe(true);
      expect(prefs?.studyReminderEnabled).toBe(true);
      expect(prefs?.milestoneEnabled).toBe(true);
      expect(prefs?.pushEnabled).toBe(false);
    });

    it('should return same userId if called multiple times', async () => {
      const userId1 = await recreateDefaultUserData();
      const userId2 = await recreateDefaultUserData();

      expect(userId1).toBe(userId2);

      const users = await prisma.user.findMany();
      expect(users).toHaveLength(1);
    });

    it('should recreate data even if user already exists', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'default@vocab-hero.local',
          name: 'Existing User',
        },
      });

      const userId = await recreateDefaultUserData();

      expect(userId).toBe(user.id);

      const settings = await prisma.userSettings.findUnique({ where: { userId } });
      const goal = await prisma.dailyGoal.findUnique({ where: { userId } });
      const prefs = await prisma.notificationPreference.findUnique({ where: { userId } });

      expect(settings).toBeDefined();
      expect(goal).toBeDefined();
      expect(prefs).toBeDefined();
    });
  });
});
