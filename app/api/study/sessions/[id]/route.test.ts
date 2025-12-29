import { describe, it, expect, beforeEach } from 'vitest';
import { GET, PUT } from './route';
import { prisma } from '@/lib/db/prisma';
import { cleanDatabase } from '@/tests/setup-db';

/**
 * API Route Tests for Individual Study Session
 * GET /api/study/sessions/:id - Get session by ID
 * PUT /api/study/sessions/:id - Update session
 */

describe('GET /api/study/sessions/:id', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should return session by ID', async () => {
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
      },
    });

    const session = await prisma.studySession.create({
      data: {
        userId: user.id,
        mode: 'flashcard',
        cardsReviewed: 5,
        correctAnswers: 4,
      },
    });

    const request = new Request(`http://localhost:3000/api/study/sessions/${session.id}`);
    const response = await GET(request, { params: Promise.resolve({ id: session.id }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.id).toBe(session.id);
    expect(data.data.cardsReviewed).toBe(5);
  });

  it('should return 404 if session not found', async () => {
    const request = new Request('http://localhost:3000/api/study/sessions/non-existent-id');
    const response = await GET(request, { params: Promise.resolve({ id: 'non-existent-id' }) });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
  });
});

describe('PUT /api/study/sessions/:id', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should update session progress', async () => {
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
      },
    });

    const session = await prisma.studySession.create({
      data: {
        userId: user.id,
        mode: 'flashcard',
      },
    });

    const request = new Request(`http://localhost:3000/api/study/sessions/${session.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        cardsReviewed: 10,
        correctAnswers: 8,
        timeSpentMinutes: 15,
      }),
    });

    const response = await PUT(request, { params: Promise.resolve({ id: session.id }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.cardsReviewed).toBe(10);
    expect(data.data.correctAnswers).toBe(8);
    expect(data.data.timeSpentMinutes).toBe(15);
    expect(data.data.completedAt).toBeNull();
  });

  it('should complete session when completedAt is provided', async () => {
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
      },
    });

    const session = await prisma.studySession.create({
      data: {
        userId: user.id,
        mode: 'flashcard',
      },
    });

    const completedAt = new Date();
    const request = new Request(`http://localhost:3000/api/study/sessions/${session.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        cardsReviewed: 20,
        correctAnswers: 18,
        timeSpentMinutes: 30,
        completedAt: completedAt.toISOString(),
      }),
    });

    const response = await PUT(request, { params: Promise.resolve({ id: session.id }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.completedAt).toBeDefined();
    expect(new Date(data.data.completedAt).getTime()).toBeCloseTo(completedAt.getTime(), -2);
  });

  it('should return 404 if session not found', async () => {
    const request = new Request('http://localhost:3000/api/study/sessions/non-existent-id', {
      method: 'PUT',
      body: JSON.stringify({
        cardsReviewed: 10,
      }),
    });

    const response = await PUT(request, { params: Promise.resolve({ id: 'non-existent-id' }) });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
  });

  it('should automatically create progress log when session is completed', async () => {
    const user = await prisma.user.create({
      data: {
        email: 'test-progress@example.com',
        name: 'Test Progress User',
      },
    });

    const session = await prisma.studySession.create({
      data: {
        userId: user.id,
        mode: 'flashcard',
        cardsReviewed: 0,
        correctAnswers: 0,
        timeSpentMinutes: 0,
      },
    });

    const completedAt = new Date().toISOString();

    const request = new Request(`http://localhost:3000/api/study/sessions/${session.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cardsReviewed: 10,
        correctAnswers: 8,
        timeSpentMinutes: 30,
        completedAt,
      }),
    });

    const response = await PUT(request, { params: Promise.resolve({ id: session.id }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const progressLog = await prisma.progressLog.findUnique({
      where: {
        userId_date: {
          userId: user.id,
          date: today,
        },
      },
    });

    expect(progressLog).toBeDefined();
    expect(progressLog?.wordsStudied).toBe(10);
    expect(progressLog?.correctAnswers).toBe(8);
    expect(progressLog?.totalAnswers).toBe(10);
    expect(progressLog?.timeSpentMinutes).toBe(30);
    expect(progressLog?.sessionsCompleted).toBe(1);
  });
});
