import { describe, it, expect, beforeEach } from 'vitest';
import { GET } from './route';
import { prisma } from '@/lib/db/prisma';
import { cleanDatabase } from '@/tests/setup-db';

/**
 * API Route Tests for GET /api/vocabulary/due
 * Tests for retrieving vocabulary items due for review
 */

describe('GET /api/vocabulary/due', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should return empty array when no vocabulary items are due', async () => {
    const request = new Request('http://localhost:3000/api/vocabulary/due');
    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual([]);
  });

  it('should return vocabulary items due today', async () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const vocab = await prisma.vocabularyItem.create({
      data: {
        word: 'test',
        reading: 'tesuto',
        meaning: 'test',
      },
    });

    await prisma.reviewSchedule.create({
      data: {
        vocabularyItemId: vocab.id,
        nextReviewDate: yesterday,
        easinessFactor: 2.5,
        interval: 1,
        repetitions: 1,
      },
    });

    const request = new Request('http://localhost:3000/api/vocabulary/due');
    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(1);
    expect(data.data[0].word).toBe('test');
  });

  it('should not return vocabulary items due in the future', async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const vocab = await prisma.vocabularyItem.create({
      data: {
        word: 'future',
        reading: 'mirai',
        meaning: 'future',
      },
    });

    await prisma.reviewSchedule.create({
      data: {
        vocabularyItemId: vocab.id,
        nextReviewDate: tomorrow,
        easinessFactor: 2.5,
        interval: 1,
        repetitions: 1,
      },
    });

    const request = new Request('http://localhost:3000/api/vocabulary/due');
    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual([]);
  });

  it('should return vocabulary items without review schedule', async () => {
    await prisma.vocabularyItem.create({
      data: {
        word: 'new',
        reading: 'atarashii',
        meaning: 'new',
      },
    });

    const request = new Request('http://localhost:3000/api/vocabulary/due');
    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(1);
    expect(data.data[0].word).toBe('new');
  });

  it('should include review schedule data in response', async () => {
    const vocab = await prisma.vocabularyItem.create({
      data: {
        word: 'test',
        reading: 'tesuto',
        meaning: 'test',
      },
    });

    await prisma.reviewSchedule.create({
      data: {
        vocabularyItemId: vocab.id,
        nextReviewDate: new Date(),
        easinessFactor: 2.5,
        interval: 1,
        repetitions: 1,
      },
    });

    const request = new Request('http://localhost:3000/api/vocabulary/due');
    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data[0].reviewSchedule).toBeDefined();
    expect(data.data[0].reviewSchedule.easinessFactor).toBe(2.5);
    expect(data.data[0].reviewSchedule.interval).toBe(1);
    expect(data.data[0].reviewSchedule.repetitions).toBe(1);
  });

  it('should limit results when limit parameter is provided', async () => {
    for (let i = 0; i < 5; i++) {
      await prisma.vocabularyItem.create({
        data: {
          word: `word${i}`,
          reading: `reading${i}`,
          meaning: `meaning${i}`,
        },
      });
    }

    const request = new Request('http://localhost:3000/api/vocabulary/due?limit=3');
    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toHaveLength(3);
  });
});

