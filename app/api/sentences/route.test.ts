import { describe, it, expect } from 'vitest';
import { GET, POST } from './route';
import { NextRequest } from 'next/server';
import {
  sentenceSchema,
  createSentenceSchema,
  updateSentenceSchema,
} from '@/lib/validations/sentence';

describe('GET /api/sentences', () => {
  it('should return 501 Not Implemented', async () => {
    const request = new NextRequest('http://localhost:3000/api/sentences');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(501);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('NOT_IMPLEMENTED');
  });
});

describe('POST /api/sentences', () => {
  it('should return 501 Not Implemented', async () => {
    const request = new NextRequest('http://localhost:3000/api/sentences', {
      method: 'POST',
      body: JSON.stringify({
        japanese: 'これはテストです',
        english: 'This is a test',
      }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(501);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('NOT_IMPLEMENTED');
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
