import { describe, it, expect, beforeEach } from 'vitest';
import { GET } from './route';
import { prisma } from '@/lib/db/prisma';
import { cleanDatabase } from '@/tests/setup-db';

/**
 * API Route Tests for GET /api/review/stats
 * Tests for retrieving review statistics
 */

describe('GET /api/review/stats', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should return zero stats when no vocabulary items exist', async () => {
    const request = new Request('http://localhost:3000/api/review/stats');
    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.total).toBe(0);
    expect(data.data.dueToday).toBe(0);
    expect(data.data.new).toBe(0);
    expect(data.data.learning).toBe(0);
    expect(data.data.mastered).toBe(0);
  });

  it('should count total vocabulary items', async () => {
    await prisma.vocabularyItem.createMany({
      data: [
        { word: 'word1', reading: 'reading1', meaning: 'meaning1' },
        { word: 'word2', reading: 'reading2', meaning: 'meaning2' },
        { word: 'word3', reading: 'reading3', meaning: 'meaning3' },
      ],
    });

    const request = new Request('http://localhost:3000/api/review/stats');
    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.total).toBe(3);
  });

  it('should count items due today', async () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const vocab1 = await prisma.vocabularyItem.create({
      data: { word: 'due1', reading: 'reading1', meaning: 'meaning1' },
    });

    const vocab2 = await prisma.vocabularyItem.create({
      data: { word: 'due2', reading: 'reading2', meaning: 'meaning2' },
    });

    await prisma.reviewSchedule.createMany({
      data: [
        {
          vocabularyItemId: vocab1.id,
          nextReviewDate: yesterday,
          easinessFactor: 2.5,
          interval: 1,
          repetitions: 1,
        },
        {
          vocabularyItemId: vocab2.id,
          nextReviewDate: today,
          easinessFactor: 2.5,
          interval: 1,
          repetitions: 1,
        },
      ],
    });

    const request = new Request('http://localhost:3000/api/review/stats');
    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.dueToday).toBe(2);
  });

  it('should count new items (no review schedule)', async () => {
    await prisma.vocabularyItem.createMany({
      data: [
        { word: 'new1', reading: 'reading1', meaning: 'meaning1' },
        { word: 'new2', reading: 'reading2', meaning: 'meaning2' },
      ],
    });

    const vocab3 = await prisma.vocabularyItem.create({
      data: { word: 'reviewed', reading: 'reading3', meaning: 'meaning3' },
    });

    await prisma.reviewSchedule.create({
      data: {
        vocabularyItemId: vocab3.id,
        nextReviewDate: new Date(),
        easinessFactor: 2.5,
        interval: 1,
        repetitions: 1,
      },
    });

    const request = new Request('http://localhost:3000/api/review/stats');
    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.new).toBe(2);
  });

  it('should count learning items (repetitions < 3)', async () => {
    const vocab1 = await prisma.vocabularyItem.create({
      data: { word: 'learning1', reading: 'reading1', meaning: 'meaning1' },
    });

    const vocab2 = await prisma.vocabularyItem.create({
      data: { word: 'learning2', reading: 'reading2', meaning: 'meaning2' },
    });

    await prisma.reviewSchedule.createMany({
      data: [
        {
          vocabularyItemId: vocab1.id,
          nextReviewDate: new Date(),
          easinessFactor: 2.5,
          interval: 1,
          repetitions: 1,
        },
        {
          vocabularyItemId: vocab2.id,
          nextReviewDate: new Date(),
          easinessFactor: 2.5,
          interval: 6,
          repetitions: 2,
        },
      ],
    });

    const request = new Request('http://localhost:3000/api/review/stats');
    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.learning).toBe(2);
  });

  it('should count mastered items (repetitions > 8 and interval > 21)', async () => {
    const vocab = await prisma.vocabularyItem.create({
      data: { word: 'mastered', reading: 'reading', meaning: 'meaning' },
    });

    await prisma.reviewSchedule.create({
      data: {
        vocabularyItemId: vocab.id,
        nextReviewDate: new Date(),
        easinessFactor: 2.5,
        interval: 30,
        repetitions: 10,
      },
    });

    const request = new Request('http://localhost:3000/api/review/stats');
    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.mastered).toBe(1);
  });
});

