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
});

