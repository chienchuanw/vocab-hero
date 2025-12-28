import { describe, it, expect, beforeEach } from 'vitest';
import { POST } from './route';
import { prisma } from '@/lib/db/prisma';
import { cleanDatabase } from '@/tests/setup-db';

/**
 * API Route Tests for POST /api/vocabulary/:id/review
 * Tests for recording vocabulary review results
 */

describe('POST /api/vocabulary/:id/review', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should return 404 when vocabulary item does not exist', async () => {
    const request = new Request('http://localhost:3000/api/vocabulary/invalid-id/review', {
      method: 'POST',
      body: JSON.stringify({ quality: 4 }),
    });

    const response = await POST(request as any, {
      params: Promise.resolve({ id: 'invalid-id' }),
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
  });

  it('should return 400 when quality is missing', async () => {
    const vocab = await prisma.vocabularyItem.create({
      data: {
        word: 'test',
        reading: 'tesuto',
        meaning: 'test',
      },
    });

    const request = new Request(`http://localhost:3000/api/vocabulary/${vocab.id}/review`, {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request as any, {
      params: Promise.resolve({ id: vocab.id }),
    });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });

  it('should return 400 when quality is invalid', async () => {
    const vocab = await prisma.vocabularyItem.create({
      data: {
        word: 'test',
        reading: 'tesuto',
        meaning: 'test',
      },
    });

    const request = new Request(`http://localhost:3000/api/vocabulary/${vocab.id}/review`, {
      method: 'POST',
      body: JSON.stringify({ quality: 6 }),
    });

    const response = await POST(request as any, {
      params: Promise.resolve({ id: vocab.id }),
    });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });

  it('should create review schedule for new vocabulary item', async () => {
    const vocab = await prisma.vocabularyItem.create({
      data: {
        word: 'new',
        reading: 'atarashii',
        meaning: 'new',
      },
    });

    const request = new Request(`http://localhost:3000/api/vocabulary/${vocab.id}/review`, {
      method: 'POST',
      body: JSON.stringify({ quality: 4 }),
    });

    const response = await POST(request as any, {
      params: Promise.resolve({ id: vocab.id }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.reviewSchedule).toBeDefined();
    expect(data.data.reviewSchedule.interval).toBe(1);
    expect(data.data.reviewSchedule.repetitions).toBe(1);

    const schedule = await prisma.reviewSchedule.findUnique({
      where: { vocabularyItemId: vocab.id },
    });
    expect(schedule).toBeDefined();
  });

  it('should update existing review schedule', async () => {
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

    const request = new Request(`http://localhost:3000/api/vocabulary/${vocab.id}/review`, {
      method: 'POST',
      body: JSON.stringify({ quality: 4 }),
    });

    const response = await POST(request as any, {
      params: Promise.resolve({ id: vocab.id }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.reviewSchedule.interval).toBe(6);
    expect(data.data.reviewSchedule.repetitions).toBe(2);
  });

  it('should reset schedule on failed review (quality < 3)', async () => {
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
        interval: 6,
        repetitions: 2,
      },
    });

    const request = new Request(`http://localhost:3000/api/vocabulary/${vocab.id}/review`, {
      method: 'POST',
      body: JSON.stringify({ quality: 2 }),
    });

    const response = await POST(request as any, {
      params: Promise.resolve({ id: vocab.id }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.reviewSchedule.interval).toBe(0);
    expect(data.data.reviewSchedule.repetitions).toBe(0);
  });
});

