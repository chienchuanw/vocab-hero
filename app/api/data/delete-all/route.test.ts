import { describe, it, expect, beforeEach } from 'vitest';
import { POST } from './route';
import { prisma } from '@/lib/db/prisma';
import { cleanDatabase } from '@/tests/setup-db';

describe('POST /api/data/delete-all', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should delete all data and recreate default user with settings', async () => {
    const user = await prisma.user.create({
      data: { email: 'test@example.com', name: 'Test User' },
    });

    await prisma.vocabularyGroup.create({
      data: { name: 'Test Group', userId: user.id },
    });

    await prisma.vocabularyItem.create({
      data: {
        word: 'テスト',
        reading: 'てすと',
        meaning: 'test',
      },
    });

    await prisma.studySession.create({
      data: {
        userId: user.id,
        mode: 'FLASHCARD',
        studyMode: 'FLASHCARD',
      },
    });

    await prisma.progressLog.create({
      data: {
        userId: user.id,
        date: new Date(),
        wordsStudied: 10,
      },
    });

    const request = new Request('http://localhost:3000/api/data/delete-all', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirm: 'DELETE ALL' }),
    });

    const response = await POST(request as never);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.userId).toBeDefined();

    const allUsers = await prisma.user.findMany();
    expect(allUsers).toHaveLength(1);
    expect(allUsers[0]!.email).toBe('default@vocab-hero.local');

    const userId = allUsers[0]!.id;

    const settings = await prisma.userSettings.findUnique({ where: { userId } });
    expect(settings).toBeDefined();
    expect(settings?.theme).toBe('SYSTEM');

    const goal = await prisma.dailyGoal.findUnique({ where: { userId } });
    expect(goal).toBeDefined();
    expect(goal?.wordsPerDay).toBe(10);

    const prefs = await prisma.notificationPreference.findUnique({ where: { userId } });
    expect(prefs).toBeDefined();
    expect(prefs?.pushEnabled).toBe(false);

    const groups = await prisma.vocabularyGroup.findMany();
    expect(groups).toHaveLength(0);

    const items = await prisma.vocabularyItem.findMany();
    expect(items).toHaveLength(0);

    const sessions = await prisma.studySession.findMany();
    expect(sessions).toHaveLength(0);

    const logs = await prisma.progressLog.findMany();
    expect(logs).toHaveLength(0);
  });

  it('should return error if confirm phrase is incorrect', async () => {
    const request = new Request('http://localhost:3000/api/data/delete-all', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirm: 'wrong phrase' }),
    });

    const response = await POST(request as never);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return error if confirm phrase is missing', async () => {
    const request = new Request('http://localhost:3000/api/data/delete-all', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    const response = await POST(request as never);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });
});
