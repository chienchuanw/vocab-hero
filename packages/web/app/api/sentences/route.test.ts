import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET, POST } from './route';
import { NextRequest } from 'next/server';
import {
  sentenceSchema,
  createSentenceSchema,
  updateSentenceSchema,
} from '@/lib/validations/sentence';

vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    sentenceCard: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}));

import { prisma } from '@/lib/db/prisma';

describe('GET /api/sentences', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return empty array when no sentences exist', async () => {
    (prisma.sentenceCard.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    const request = new NextRequest('http://localhost:3000/api/sentences');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual([]);
  });

  it('should return list of sentences with imageUrl field', async () => {
    const mockSentences = [
      {
        id: '1',
        japanese: 'これはテストです',
        english: 'This is a test',
        notes: null,
        imageUrl: '/uploads/sentences/abc.png',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        japanese: '日本語を勉強しています',
        english: 'I am studying Japanese',
        notes: 'Present continuous',
        imageUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    (prisma.sentenceCard.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(mockSentences);

    const request = new NextRequest('http://localhost:3000/api/sentences');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(2);
    expect(data.data[0].japanese).toBe('これはテストです');
    expect(data.data[0].imageUrl).toBe('/uploads/sentences/abc.png');
    expect(data.data[1].imageUrl).toBeNull();
  });
});

describe('POST /api/sentences', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create sentence with valid data', async () => {
    const mockSentence = {
      id: '1',
      japanese: 'これはテストです',
      english: 'This is a test',
      notes: null,
      imageUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    (prisma.sentenceCard.create as ReturnType<typeof vi.fn>).mockResolvedValue(mockSentence);

    const request = new NextRequest('http://localhost:3000/api/sentences', {
      method: 'POST',
      body: JSON.stringify({
        japanese: 'これはテストです',
        english: 'This is a test',
      }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.id).toBe('1');
    expect(data.data.japanese).toBe('これはテストです');
    expect(data.data.imageUrl).toBeNull();
  });

  it('should create sentence with imageUrl', async () => {
    const mockSentence = {
      id: '2',
      japanese: '日本語を勉強しています',
      english: 'I am studying Japanese',
      notes: null,
      imageUrl: '/uploads/sentences/abc123.png',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    (prisma.sentenceCard.create as ReturnType<typeof vi.fn>).mockResolvedValue(mockSentence);

    const request = new NextRequest('http://localhost:3000/api/sentences', {
      method: 'POST',
      body: JSON.stringify({
        japanese: '日本語を勉強しています',
        english: 'I am studying Japanese',
        imageUrl: '/uploads/sentences/abc123.png',
      }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.imageUrl).toBe('/uploads/sentences/abc123.png');
  });

  it('should return 400 for empty japanese', async () => {
    const request = new NextRequest('http://localhost:3000/api/sentences', {
      method: 'POST',
      body: JSON.stringify({
        japanese: '',
        english: 'This is a test',
      }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 for empty english', async () => {
    const request = new NextRequest('http://localhost:3000/api/sentences', {
      method: 'POST',
      body: JSON.stringify({
        japanese: 'これはテストです',
        english: '',
      }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('Sentence Validation Schemas', () => {
  describe('sentenceSchema', () => {
    it('should accept valid sentence data', () => {
      const validData = {
        japanese: 'これはテストです',
        english: 'This is a test',
        notes: 'Optional notes',
      };
      const result = sentenceSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject empty japanese', () => {
      const invalidData = {
        japanese: '',
        english: 'This is a test',
      };
      const result = sentenceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject empty english', () => {
      const invalidData = {
        japanese: 'これはテストです',
        english: '',
      };
      const result = sentenceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should accept optional notes', () => {
      const validData = {
        japanese: 'これはテストです',
        english: 'This is a test',
      };
      const result = sentenceSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept null notes', () => {
      const validData = {
        japanese: 'これはテストです',
        english: 'This is a test',
        notes: null,
      };
      const result = sentenceSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept valid imageUrl', () => {
      const validData = {
        japanese: 'これはテストです',
        english: 'This is a test',
        imageUrl: '/uploads/sentences/abc123.png',
      };
      const result = sentenceSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept null imageUrl', () => {
      const validData = {
        japanese: 'これはテストです',
        english: 'This is a test',
        imageUrl: null,
      };
      const result = sentenceSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept omitted imageUrl', () => {
      const validData = {
        japanese: 'これはテストです',
        english: 'This is a test',
      };
      const result = sentenceSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject imageUrl with invalid path prefix', () => {
      const invalidData = {
        japanese: 'これはテストです',
        english: 'This is a test',
        imageUrl: '/images/abc123.png',
      };
      const result = sentenceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('createSentenceSchema', () => {
    it('should accept valid create data', () => {
      const validData = {
        japanese: 'これはテストです',
        english: 'This is a test',
      };
      const result = createSentenceSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('updateSentenceSchema', () => {
    it('should accept partial updates', () => {
      const partialData = {
        japanese: 'Updated Japanese',
      };
      const result = updateSentenceSchema.safeParse(partialData);
      expect(result.success).toBe(true);
    });

    it('should accept empty object for update', () => {
      const emptyData = {};
      const result = updateSentenceSchema.safeParse(emptyData);
      expect(result.success).toBe(true);
    });
  });
});
