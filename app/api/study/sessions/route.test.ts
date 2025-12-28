import { describe, it, expect, beforeEach } from 'vitest';
import { POST, GET } from './route';
import { prisma } from '@/lib/db/prisma';
import { cleanDatabase } from '@/tests/setup-db';

/**
 * API Route Tests for Study Sessions
 * POST /api/study/sessions - Create new study session
 * GET /api/study/sessions - Get all study sessions
 */

describe('POST /api/study/sessions', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should create a new study session', async () => {
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
      },
    });

    const request = new Request('http://localhost:3000/api/study/sessions', {
      method: 'POST',
      body: JSON.stringify({
        userId: user.id,
        mode: 'flashcard',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty('id');
    expect(data.data.userId).toBe(user.id);
    expect(data.data.mode).toBe('flashcard');
    expect(data.data.cardsReviewed).toBe(0);
    expect(data.data.correctAnswers).toBe(0);
    expect(data.data.timeSpentMinutes).toBe(0);
    expect(data.data.startedAt).toBeDefined();
    expect(data.data.completedAt).toBeNull();
  });

  it('should return 400 if userId is missing', async () => {
    const request = new Request('http://localhost:3000/api/study/sessions', {
      method: 'POST',
      body: JSON.stringify({
        mode: 'flashcard',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });

  it('should return 400 if mode is missing', async () => {
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
      },
    });

    const request = new Request('http://localhost:3000/api/study/sessions', {
      method: 'POST',
      body: JSON.stringify({
        userId: user.id,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });

  it('should return 404 if user does not exist', async () => {
    const request = new Request('http://localhost:3000/api/study/sessions', {
      method: 'POST',
      body: JSON.stringify({
        userId: 'non-existent-user-id',
        mode: 'flashcard',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
  });
});

describe('GET /api/study/sessions', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should return empty array when no sessions exist', async () => {
    const request = new Request('http://localhost:3000/api/study/sessions');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual([]);
  });

  it('should return all study sessions', async () => {
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
      },
    });

    await prisma.studySession.create({
      data: {
        userId: user.id,
        mode: 'flashcard',
        cardsReviewed: 10,
        correctAnswers: 8,
      },
    });

    const request = new Request('http://localhost:3000/api/study/sessions');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(1);
    expect(data.data[0].mode).toBe('flashcard');
    expect(data.data[0].cardsReviewed).toBe(10);
  });
});

describe('POST /api/study/sessions - Quiz Sessions', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should create a quiz session with quiz-specific fields', async () => {
    const user = await prisma.user.create({
      data: {
        email: 'quiz@example.com',
        name: 'Quiz User',
      },
    });

    const group = await prisma.vocabularyGroup.create({
      data: {
        name: 'Test Group',
        userId: user.id,
      },
    });

    const request = new Request('http://localhost:3000/api/study/sessions', {
      method: 'POST',
      body: JSON.stringify({
        userId: user.id,
        mode: 'quiz',
        studyMode: 'MULTIPLE_CHOICE',
        quizType: 'WORD_TO_MEANING',
        questionCount: 10,
        groupId: group.id,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.studyMode).toBe('MULTIPLE_CHOICE');
    expect(data.data.quizType).toBe('WORD_TO_MEANING');
    expect(data.data.questionCount).toBe(10);
    expect(data.data.groupId).toBe(group.id);
  });

  it('should create a spelling quiz session', async () => {
    const user = await prisma.user.create({
      data: {
        email: 'spelling@example.com',
        name: 'Spelling User',
      },
    });

    const request = new Request('http://localhost:3000/api/study/sessions', {
      method: 'POST',
      body: JSON.stringify({
        userId: user.id,
        mode: 'quiz',
        studyMode: 'SPELLING',
        questionCount: 5,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.studyMode).toBe('SPELLING');
    expect(data.data.questionCount).toBe(5);
  });

  it('should create a matching game session', async () => {
    const user = await prisma.user.create({
      data: {
        email: 'matching@example.com',
        name: 'Matching User',
      },
    });

    const request = new Request('http://localhost:3000/api/study/sessions', {
      method: 'POST',
      body: JSON.stringify({
        userId: user.id,
        mode: 'quiz',
        studyMode: 'MATCHING',
        questionCount: 5,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.studyMode).toBe('MATCHING');
  });
});
