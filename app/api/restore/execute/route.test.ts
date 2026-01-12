import { NextRequest } from 'next/server';
import { describe, it, expect, beforeEach } from 'vitest';
import { POST } from './route';
import { prisma } from '@/lib/db/prisma';
import { cleanDatabase } from '@/tests/setup-db';

describe('POST /api/restore/execute', () => {
  let userId: string;

  beforeEach(async () => {
    await cleanDatabase();
    const user = await prisma.user.create({
      data: { email: 'default@vocab-hero.local' },
    });
    userId = user.id;
  });

  it('should restore vocabulary with SKIP strategy', async () => {
    await prisma.vocabularyItem.create({
      data: {
        word: '勉強',
        reading: 'べんきょう',
        meaning: 'study (existing)',
      },
    });

    const backupData = {
      version: '1.0',
      exportDate: '2026-01-09T00:00:00.000Z',
      itemCount: 2,
      items: [
        {
          word: '勉強',
          reading: 'べんきょう',
          meaning: 'study (from backup)',
          notes: null,
          groups: [],
          exampleSentences: [],
        },
        {
          word: '図書館',
          reading: 'としょかん',
          meaning: 'library',
          notes: null,
          groups: [],
          exampleSentences: [],
        },
      ],
    };

    const request = new NextRequest('http://localhost:3000/api/restore/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        format: 'json',
        content: JSON.stringify(backupData),
        strategy: 'skip',
        confirm: 'RESTORE',
      }),
    });

    const response = await POST(request as never);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.created).toBe(1);
    expect(data.data.updated).toBe(0);
    expect(data.data.skipped).toBe(1);
    expect(data.data.total).toBe(2);

    const items = await prisma.vocabularyItem.findMany();
    expect(items).toHaveLength(2);
    const existingItem = items.find((i: (typeof items)[number]) => i.word === '勉強');
    expect(existingItem?.meaning).toBe('study (existing)');
  });

  it('should restore vocabulary with OVERWRITE strategy', async () => {
    await prisma.vocabularyItem.create({
      data: {
        word: '勉強',
        reading: 'べんきょう',
        meaning: 'study (existing)',
        notes: 'old note',
      },
    });

    const backupData = {
      version: '1.0',
      exportDate: '2026-01-09T00:00:00.000Z',
      itemCount: 1,
      items: [
        {
          word: '勉強',
          reading: 'べんきょう',
          meaning: 'study (from backup)',
          notes: 'new note',
          groups: [],
          exampleSentences: [],
        },
      ],
    };

    const request = new NextRequest('http://localhost:3000/api/restore/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        format: 'json',
        content: JSON.stringify(backupData),
        strategy: 'overwrite',
        confirm: 'RESTORE',
      }),
    });

    const response = await POST(request as never);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.created).toBe(0);
    expect(data.data.updated).toBe(1);
    expect(data.data.skipped).toBe(0);

    const item = await prisma.vocabularyItem.findFirst({
      where: { word: '勉強' },
    });
    expect(item?.meaning).toBe('study (from backup)');
    expect(item?.notes).toBe('new note');
  });

  it('should restore vocabulary with MERGE strategy', async () => {
    const group = await prisma.vocabularyGroup.create({
      data: { name: 'JLPT N5', userId },
    });

    await prisma.vocabularyItem.create({
      data: {
        word: '勉強',
        reading: 'べんきょう',
        meaning: 'study (existing)',
        notes: 'existing note',
        groups: { connect: [{ id: group.id }] },
      },
    });

    const backupData = {
      version: '1.0',
      exportDate: '2026-01-09T00:00:00.000Z',
      itemCount: 1,
      items: [
        {
          word: '勉強',
          reading: 'べんきょう',
          meaning: 'study (from backup)',
          notes: null,
          groups: [{ name: 'JLPT N4' }],
          exampleSentences: [],
        },
      ],
    };

    const request = new NextRequest('http://localhost:3000/api/restore/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        format: 'json',
        content: JSON.stringify(backupData),
        strategy: 'merge',
        confirm: 'RESTORE',
      }),
    });

    const response = await POST(request as never);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.updated).toBe(1);

    const item = await prisma.vocabularyItem.findFirst({
      where: { word: '勉強' },
      include: { groups: true },
    });
    expect(item?.groups).toHaveLength(2);
    expect(item?.groups.map((g: (typeof item.groups)[number]) => g.name)).toContain('JLPT N5');
    expect(item?.groups.map((g: (typeof item.groups)[number]) => g.name)).toContain('JLPT N4');
  });

  it('should require confirmation phrase "RESTORE"', async () => {
    const backupData = {
      version: '1.0',
      exportDate: '2026-01-09T00:00:00.000Z',
      itemCount: 1,
      items: [
        {
          word: '勉強',
          reading: 'べんきょう',
          meaning: 'study',
          notes: null,
          groups: [],
          exampleSentences: [],
        },
      ],
    };

    const request = new NextRequest('http://localhost:3000/api/restore/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        format: 'json',
        content: JSON.stringify(backupData),
        strategy: 'SKIP',
        confirm: 'wrong phrase',
      }),
    });

    const response = await POST(request as never);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('VALIDATION_ERROR');

    const count = await prisma.vocabularyItem.count();
    expect(count).toBe(0);
  });

  it('should auto-create default reviewSchedule for new items', async () => {
    const backupData = {
      version: '1.0',
      exportDate: '2026-01-09T00:00:00.000Z',
      itemCount: 1,
      items: [
        {
          word: '勉強',
          reading: 'べんきょう',
          meaning: 'study',
          notes: null,
          groups: [],
          exampleSentences: [],
        },
      ],
    };

    const request = new NextRequest('http://localhost:3000/api/restore/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        format: 'json',
        content: JSON.stringify(backupData),
        strategy: 'skip',
        confirm: 'RESTORE',
      }),
    });

    const response = await POST(request as never);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.created).toBe(1);

    const item = await prisma.vocabularyItem.findFirst({
      where: { word: '勉強' },
      include: { reviewSchedule: true },
    });

    expect(item?.reviewSchedule).toBeDefined();
    expect(item?.reviewSchedule?.easinessFactor).toBe(2.5);
    expect(item?.reviewSchedule?.interval).toBe(0);
    expect(item?.reviewSchedule?.repetitions).toBe(0);
    expect(item?.reviewSchedule?.nextReviewDate).toBeDefined();
    expect(item?.reviewSchedule?.lastReviewDate).toBeNull();
  });
});
