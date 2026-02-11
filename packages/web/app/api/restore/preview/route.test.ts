import { NextRequest } from "next/server";
import { describe, it, expect, beforeEach } from 'vitest';
import { POST } from './route';
import { prisma } from '@/lib/db/prisma';
import { cleanDatabase } from '@/tests/setup-db';

describe('POST /api/restore/preview', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should parse and validate JSON backup content', async () => {
    const backupData = {
      version: '1.0',
      exportDate: '2026-01-09T00:00:00.000Z',
      itemCount: 2,
      items: [
        {
          word: '勉強',
          reading: 'べんきょう',
          meaning: 'study',
          notes: null,
          groups: [{ name: 'JLPT N5' }],
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

    const request = new NextRequest('http://localhost:3000/api/restore/preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        format: 'json',
        content: JSON.stringify(backupData),
      }),
    });

    const response = await POST(request as never);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();
    expect(data.data.totalItems).toBe(2);
    expect(data.data.duplicateCount).toBe(0);
    expect(data.data.newItems).toHaveLength(2);
    expect(data.data.duplicates).toHaveLength(0);
    expect(data.data.metadata).toBeDefined();
    expect(data.data.metadata.version).toBe('1.0');
  });

  it('should detect duplicates by word+reading', async () => {
    await prisma.vocabularyItem.create({
      data: {
        word: '勉強',
        reading: 'べんきょう',
        meaning: 'study (existing)',
        notes: 'existing note',
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

    const request = new NextRequest('http://localhost:3000/api/restore/preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        format: 'json',
        content: JSON.stringify(backupData),
      }),
    });

    const response = await POST(request as never);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.totalItems).toBe(2);
    expect(data.data.duplicateCount).toBe(1);
    expect(data.data.newItems).toHaveLength(1);
    expect(data.data.newItems[0].word).toBe('図書館');
    expect(data.data.duplicates).toHaveLength(1);
    expect(data.data.duplicates[0].importItem.word).toBe('勉強');
    expect(data.data.duplicates[0].existingItem.word).toBe('勉強');
  });

  it('should return summary without writing to database', async () => {
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

    const request = new NextRequest('http://localhost:3000/api/restore/preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        format: 'json',
        content: JSON.stringify(backupData),
      }),
    });

    const response = await POST(request as never);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);

    const count = await prisma.vocabularyItem.count();
    expect(count).toBe(0);
  });

  it('should handle CSV format', async () => {
    const csvContent = `word,reading,meaning,notes,groups,exampleSentences
勉強,べんきょう,study,,JLPT N5,
図書館,としょかん,library,,,`;

    const request = new NextRequest('http://localhost:3000/api/restore/preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        format: 'csv',
        content: csvContent,
      }),
    });

    const response = await POST(request as never);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.totalItems).toBe(2);
    expect(data.data.newItems).toHaveLength(2);
  });

  it('should return ApiErrors format on parse failure', async () => {
    const request = new NextRequest('http://localhost:3000/api/restore/preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        format: 'json',
        content: 'invalid json content',
      }),
    });

    const response = await POST(request as never);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBeDefined();
    expect(data.error.code).toBeDefined();
    expect(data.error.message).toBeDefined();
  });

  it('should return validation error for missing required fields', async () => {
    const request = new NextRequest('http://localhost:3000/api/restore/preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        format: 'json',
      }),
    });

    const response = await POST(request as never);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });
});
