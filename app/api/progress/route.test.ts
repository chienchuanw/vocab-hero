import { describe, it, expect, beforeEach } from 'vitest';
import { GET, POST } from './route';
import { prisma } from '@/lib/db/prisma';
import { cleanDatabase } from '@/tests/setup-db';

describe('GET /api/progress', () => {
  let testUserId: string;

  beforeEach(async () => {
    await cleanDatabase();

    const user = await prisma.user.create({
      data: {
        email: 'test-progress-api@example.com',
        name: 'Test Progress API User',
      },
    });
    testUserId = user.id;
  });

  it('should return empty array when no progress logs exist', async () => {
    const request = new Request(`http://localhost:3000/api/progress?userId=${testUserId}`);
    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual([]);
  });

  it('should return progress logs for a user', async () => {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    await prisma.progressLog.create({
      data: {
        userId: testUserId,
        date: today,
        wordsStudied: 10,
        newWords: 5,
        reviewWords: 5,
        timeSpentMinutes: 30,
        sessionsCompleted: 1,
        correctAnswers: 8,
        totalAnswers: 10,
      },
    });

    const request = new Request(`http://localhost:3000/api/progress?userId=${testUserId}`);
    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(1);
    expect(data.data[0]?.wordsStudied).toBe(10);
  });

  it('should filter progress logs by date range', async () => {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
      await prisma.progressLog.create({
        data: {
          userId: testUserId,
          date: new Date(today.getTime() - i * 24 * 60 * 60 * 1000),
          wordsStudied: i + 1,
        },
      });
    }

    const startDate = new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000);
    const endDate = today;

    const request = new Request(
      `http://localhost:3000/api/progress?userId=${testUserId}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
    );
    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(4);
  });

  it('should limit results when limit parameter is provided', async () => {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    for (let i = 0; i < 10; i++) {
      await prisma.progressLog.create({
        data: {
          userId: testUserId,
          date: new Date(today.getTime() - i * 24 * 60 * 60 * 1000),
          wordsStudied: i + 1,
        },
      });
    }

    const request = new Request(`http://localhost:3000/api/progress?userId=${testUserId}&limit=5`);
    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(5);
  });

  it('should return 400 if userId is missing', async () => {
    const request = new Request('http://localhost:3000/api/progress');
    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });
});

describe('POST /api/progress', () => {
  let testUserId: string;

  beforeEach(async () => {
    await cleanDatabase();

    const user = await prisma.user.create({
      data: {
        email: 'test-progress-post@example.com',
        name: 'Test Progress POST User',
      },
    });
    testUserId = user.id;
  });

  it('should create a new progress log', async () => {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const request = new Request('http://localhost:3000/api/progress', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: testUserId,
        date: today.toISOString(),
        wordsStudied: 10,
        newWords: 5,
        reviewWords: 5,
        timeSpentMinutes: 30,
        sessionsCompleted: 1,
        correctAnswers: 8,
        totalAnswers: 10,
      }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.wordsStudied).toBe(10);
    expect(data.data.newWords).toBe(5);
  });

  it('should update existing progress log with incremental values', async () => {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    await prisma.progressLog.create({
      data: {
        userId: testUserId,
        date: today,
        wordsStudied: 5,
        timeSpentMinutes: 15,
        sessionsCompleted: 1,
      },
    });

    const request = new Request('http://localhost:3000/api/progress', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: testUserId,
        date: today.toISOString(),
        wordsStudied: 5,
        timeSpentMinutes: 15,
        sessionsCompleted: 1,
      }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.wordsStudied).toBe(10);
    expect(data.data.timeSpentMinutes).toBe(30);
    expect(data.data.sessionsCompleted).toBe(2);
  });

  it('should return 400 if userId is missing', async () => {
    const request = new Request('http://localhost:3000/api/progress', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        date: new Date().toISOString(),
        wordsStudied: 10,
      }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });

  it('should return 400 if date is missing', async () => {
    const request = new Request('http://localhost:3000/api/progress', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: testUserId,
        wordsStudied: 10,
      }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });
});
