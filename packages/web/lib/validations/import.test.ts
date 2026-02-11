import { describe, it, expect } from 'vitest';
import { importVocabularyItemSchema, importBatchSchema, DuplicateStrategy } from './import';

describe('importVocabularyItemSchema', () => {
  describe('valid import data', () => {
    it('should validate minimal vocabulary item', () => {
      const result = importVocabularyItemSchema.safeParse({
        word: 'こんにちは',
        reading: 'konnichiwa',
        meaning: 'Hello',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.word).toBe('こんにちは');
        expect(result.data.reading).toBe('konnichiwa');
        expect(result.data.meaning).toBe('Hello');
      }
    });

    it('should validate vocabulary with all optional fields', () => {
      const result = importVocabularyItemSchema.safeParse({
        word: 'こんにちは',
        reading: 'konnichiwa',
        meaning: 'Hello',
        notes: 'Common greeting',
        groups: [{ id: 'group1', name: 'JLPT N5' }],
        exampleSentences: [
          {
            sentence: 'こんにちは、元気ですか？',
            reading: 'konnichiwa, genki desu ka?',
            meaning: 'Hello, how are you?',
            order: 0,
          },
        ],
        reviewSchedule: {
          easinessFactor: 2.5,
          interval: 3,
          repetitions: 2,
          nextReviewDate: '2026-01-10T00:00:00.000Z',
          lastReviewDate: '2026-01-07T00:00:00.000Z',
        },
      });

      expect(result.success).toBe(true);
    });

    it('should accept null notes', () => {
      const result = importVocabularyItemSchema.safeParse({
        word: 'test',
        reading: 'tesuto',
        meaning: 'test',
        notes: null,
      });

      expect(result.success).toBe(true);
    });

    it('should accept empty groups array', () => {
      const result = importVocabularyItemSchema.safeParse({
        word: 'test',
        reading: 'tesuto',
        meaning: 'test',
        groups: [],
      });

      expect(result.success).toBe(true);
    });

    it('should accept null reading in example sentences', () => {
      const result = importVocabularyItemSchema.safeParse({
        word: 'test',
        reading: 'tesuto',
        meaning: 'test',
        exampleSentences: [
          {
            sentence: 'Test sentence',
            reading: null,
            meaning: 'Test meaning',
            order: 0,
          },
        ],
      });

      expect(result.success).toBe(true);
    });
  });

  describe('invalid import data', () => {
    it('should reject missing required fields', () => {
      const result = importVocabularyItemSchema.safeParse({
        word: 'こんにちは',
      });

      expect(result.success).toBe(false);
    });

    it('should reject empty word', () => {
      const result = importVocabularyItemSchema.safeParse({
        word: '',
        reading: 'konnichiwa',
        meaning: 'Hello',
      });

      expect(result.success).toBe(false);
    });

    it('should reject invalid easinessFactor range', () => {
      const result = importVocabularyItemSchema.safeParse({
        word: 'test',
        reading: 'tesuto',
        meaning: 'test',
        reviewSchedule: {
          easinessFactor: 0.5,
          interval: 1,
          repetitions: 0,
          nextReviewDate: '2026-01-10',
        },
      });

      expect(result.success).toBe(false);
    });

    it('should reject negative interval', () => {
      const result = importVocabularyItemSchema.safeParse({
        word: 'test',
        reading: 'tesuto',
        meaning: 'test',
        reviewSchedule: {
          easinessFactor: 2.5,
          interval: -1,
          repetitions: 0,
          nextReviewDate: '2026-01-10',
        },
      });

      expect(result.success).toBe(false);
    });
  });
});

describe('importBatchSchema', () => {
  it('should validate array of vocabulary items', () => {
    const result = importBatchSchema.safeParse([
      { word: 'test1', reading: 'tesuto1', meaning: 'test1' },
      { word: 'test2', reading: 'tesuto2', meaning: 'test2' },
    ]);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(2);
    }
  });

  it('should reject non-array', () => {
    const result = importBatchSchema.safeParse({
      word: 'test',
      reading: 'tesuto',
      meaning: 'test',
    });

    expect(result.success).toBe(false);
  });

  it('should reject empty array', () => {
    const result = importBatchSchema.safeParse([]);

    expect(result.success).toBe(false);
  });

  it('should reject if any item is invalid', () => {
    const result = importBatchSchema.safeParse([
      { word: 'test1', reading: 'tesuto1', meaning: 'test1' },
      { word: '', reading: 'tesuto2', meaning: 'test2' },
    ]);

    expect(result.success).toBe(false);
  });
});

describe('DuplicateStrategy enum', () => {
  it('should have SKIP strategy', () => {
    expect(DuplicateStrategy.SKIP).toBe('skip');
  });

  it('should have OVERWRITE strategy', () => {
    expect(DuplicateStrategy.OVERWRITE).toBe('overwrite');
  });

  it('should have MERGE strategy', () => {
    expect(DuplicateStrategy.MERGE).toBe('merge');
  });
});
