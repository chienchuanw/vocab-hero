import { describe, it, expect, beforeEach } from 'vitest';
import { POST } from './route';
import { prisma } from '@/lib/db/prisma';
import { cleanDatabase } from '@/tests/setup-db';

describe('POST /api/backup', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should export vocabulary content without progress data', async () => {
    const user = await prisma.user.create({
      data: { email: 'test@example.com', name: 'Test User' },
    });

    const group = await prisma.vocabularyGroup.create({
      data: { name: 'Test Group', userId: user.id },
    });

    const vocab = await prisma.vocabularyItem.create({
      data: {
        word: '勉強',
        reading: 'べんきょう',
        meaning: 'study',
        notes: 'Common verb',
        groups: { connect: [{ id: group.id }] },
        exampleSentences: {
          create: [
            {
              sentence: '毎日勉強します',
              reading: 'まいにちべんきょうします',
              meaning: 'I study every day',
              order: 1,
            },
          ],
        },
      },
    });

    await prisma.reviewSchedule.create({
      data: {
        vocabularyItemId: vocab.id,
        easinessFactor: 2.5,
        interval: 5,
        repetitions: 3,
        nextReviewDate: new Date('2026-01-15'),
      },
    });

    const request = new Request('http://localhost:3000/api/backup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ format: 'json' }),
    });

    const response = await POST(request as never);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();
    expect(data.data.version).toBe('1.0');
    expect(data.data.exportDate).toBeDefined();
    expect(data.data.itemCount).toBe(1);
    expect(data.data.items).toHaveLength(1);

    const item = data.data.items[0];
    expect(item.word).toBe('勉強');
    expect(item.reading).toBe('べんきょう');
    expect(item.meaning).toBe('study');
    expect(item.notes).toBe('Common verb');
    expect(item.groups).toHaveLength(1);
    expect(item.groups[0].name).toBe('Test Group');
    expect(item.exampleSentences).toHaveLength(1);
    expect(item.exampleSentences[0].sentence).toBe('毎日勉強します');

    expect(item.reviewSchedule).toBeUndefined();
  });

  it('should support filtering by groupIds', async () => {
    const user = await prisma.user.create({
      data: { email: 'test@example.com', name: 'Test User' },
    });

    const group1 = await prisma.vocabularyGroup.create({
      data: { name: 'Group 1', userId: user.id },
    });

    const group2 = await prisma.vocabularyGroup.create({
      data: { name: 'Group 2', userId: user.id },
    });

    await prisma.vocabularyItem.create({
      data: {
        word: 'Word 1',
        reading: 'reading1',
        meaning: 'meaning1',
        groups: { connect: [{ id: group1.id }] },
      },
    });

    await prisma.vocabularyItem.create({
      data: {
        word: 'Word 2',
        reading: 'reading2',
        meaning: 'meaning2',
        groups: { connect: [{ id: group2.id }] },
      },
    });

    const request = new Request('http://localhost:3000/api/backup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ format: 'json', groupIds: [group1.id] }),
    });

    const response = await POST(request as never);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.items).toHaveLength(1);
    expect(data.data.items[0].word).toBe('Word 1');
  });

  it('should return error for invalid format', async () => {
    const request = new Request('http://localhost:3000/api/backup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ format: 'invalid' }),
    });

    const response = await POST(request as never);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return empty backup if no vocabulary exists', async () => {
    const request = new Request('http://localhost:3000/api/backup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ format: 'json' }),
    });

    const response = await POST(request as never);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.items).toHaveLength(0);
    expect(data.data.itemCount).toBe(0);
  });
});
