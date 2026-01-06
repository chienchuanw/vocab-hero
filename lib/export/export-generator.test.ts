import { describe, it, expect, beforeEach, vi } from 'vitest';
import { generateJsonExport, flattenVocabularyItem, generateCsvExport } from './export-generator';
import type {
  VocabularyItem,
  VocabularyGroup,
  ExampleSentence,
  ReviewSchedule,
} from '@prisma/client';

type VocabularyWithRelations = VocabularyItem & {
  groups: Pick<VocabularyGroup, 'id' | 'name'>[];
  exampleSentences: ExampleSentence[];
  reviewSchedule: ReviewSchedule | null;
};

describe('generateJsonExport', () => {
  let mockVocabularyData: VocabularyWithRelations[];

  beforeEach(() => {
    mockVocabularyData = [
      {
        id: 'vocab1',
        word: 'こんにちは',
        reading: 'konnichiwa',
        meaning: 'Hello',
        notes: 'Common greeting',
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-05'),
        groups: [
          { id: 'group1', name: 'JLPT N5' },
          { id: 'group2', name: 'Daily Phrases' },
        ],
        exampleSentences: [
          {
            id: 'ex1',
            vocabularyItemId: 'vocab1',
            sentence: 'こんにちは、元気ですか？',
            reading: 'konnichiwa, genki desu ka?',
            meaning: 'Hello, how are you?',
            order: 0,
            createdAt: new Date('2026-01-01'),
            updatedAt: new Date('2026-01-01'),
          },
        ],
        reviewSchedule: {
          id: 'review1',
          vocabularyItemId: 'vocab1',
          easinessFactor: 2.5,
          interval: 3,
          repetitions: 2,
          nextReviewDate: new Date('2026-01-10'),
          lastReviewDate: new Date('2026-01-07'),
          createdAt: new Date('2026-01-01'),
          updatedAt: new Date('2026-01-07'),
        },
      },
      {
        id: 'vocab2',
        word: 'ありがとう',
        reading: 'arigatou',
        meaning: 'Thank you',
        notes: null,
        createdAt: new Date('2026-01-02'),
        updatedAt: new Date('2026-01-02'),
        groups: [],
        exampleSentences: [],
        reviewSchedule: null,
      },
    ];
  });

  describe('JSON export structure', () => {
    it('should generate valid JSON export with all required fields', () => {
      const result = generateJsonExport(mockVocabularyData);

      expect(result).toHaveProperty('version');
      expect(result).toHaveProperty('exportDate');
      expect(result).toHaveProperty('itemCount');
      expect(result).toHaveProperty('items');
      expect(Array.isArray(result.items)).toBe(true);
    });

    it('should include correct metadata', () => {
      const result = generateJsonExport(mockVocabularyData);

      expect(result.version).toBe('1.0');
      expect(result.itemCount).toBe(2);
      expect(typeof result.exportDate).toBe('string');
      expect(new Date(result.exportDate)).toBeInstanceOf(Date);
    });

    it('should include all vocabulary items', () => {
      const result = generateJsonExport(mockVocabularyData);

      expect(result.items).toHaveLength(2);
      expect(result.items[0]!.word).toBe('こんにちは');
      expect(result.items[1]!.word).toBe('ありがとう');
    });
  });

  describe('vocabulary item fields', () => {
    it('should include all core vocabulary fields', () => {
      const result = generateJsonExport(mockVocabularyData);
      const item = result.items[0]!;

      expect(item).toHaveProperty('word', 'こんにちは');
      expect(item).toHaveProperty('reading', 'konnichiwa');
      expect(item).toHaveProperty('meaning', 'Hello');
      expect(item).toHaveProperty('notes', 'Common greeting');
    });

    it('should handle null notes field', () => {
      const result = generateJsonExport(mockVocabularyData);
      const item = result.items[1]!;

      expect(item.notes).toBeNull();
    });

    it('should include groups array', () => {
      const result = generateJsonExport(mockVocabularyData);
      const item = result.items[0]!;

      expect(item).toHaveProperty('groups');
      expect(Array.isArray(item.groups)).toBe(true);
      expect(item.groups).toHaveLength(2);
      expect(item.groups[0]!).toEqual({ id: 'group1', name: 'JLPT N5' });
      expect(item.groups[1]!).toEqual({ id: 'group2', name: 'Daily Phrases' });
    });

    it('should handle empty groups array', () => {
      const result = generateJsonExport(mockVocabularyData);
      const item = result.items[1]!;

      expect(item.groups).toEqual([]);
    });

    it('should include exampleSentences array', () => {
      const result = generateJsonExport(mockVocabularyData);
      const item = result.items[0]!;

      expect(item).toHaveProperty('exampleSentences');
      expect(Array.isArray(item.exampleSentences)).toBe(true);
      expect(item.exampleSentences).toHaveLength(1);
      expect(item.exampleSentences[0]!).toMatchObject({
        sentence: 'こんにちは、元気ですか？',
        reading: 'konnichiwa, genki desu ka?',
        meaning: 'Hello, how are you?',
        order: 0,
      });
    });

    it('should handle empty exampleSentences array', () => {
      const result = generateJsonExport(mockVocabularyData);
      const item = result.items[1]!;

      expect(item.exampleSentences).toEqual([]);
    });
  });

  describe('review schedule (SRS) data', () => {
    it('should include reviewSchedule when present', () => {
      const result = generateJsonExport(mockVocabularyData);
      const item = result.items[0]!;

      expect(item).toHaveProperty('reviewSchedule');
      expect(item.reviewSchedule).toMatchObject({
        easinessFactor: 2.5,
        interval: 3,
        repetitions: 2,
      });
      expect(typeof item.reviewSchedule?.nextReviewDate).toBe('string');
      expect(typeof item.reviewSchedule?.lastReviewDate).toBe('string');
    });

    it('should handle null reviewSchedule', () => {
      const result = generateJsonExport(mockVocabularyData);
      const item = result.items[1]!;

      expect(item.reviewSchedule).toBeNull();
    });

    it('should serialize dates as ISO strings in reviewSchedule', () => {
      const result = generateJsonExport(mockVocabularyData);
      const item = result.items[0]!;

      expect(item.reviewSchedule?.nextReviewDate).toBe('2026-01-10T00:00:00.000Z');
      expect(item.reviewSchedule?.lastReviewDate).toBe('2026-01-07T00:00:00.000Z');
    });
  });

  describe('edge cases', () => {
    it('should handle empty vocabulary array', () => {
      const result = generateJsonExport([]);

      expect(result.itemCount).toBe(0);
      expect(result.items).toEqual([]);
    });

    it('should handle vocabulary with all optional fields null/empty', () => {
      const minimalVocab: VocabularyWithRelations[] = [
        {
          id: 'vocab3',
          word: 'test',
          reading: 'tesuto',
          meaning: 'test',
          notes: null,
          createdAt: new Date('2026-01-01'),
          updatedAt: new Date('2026-01-01'),
          groups: [],
          exampleSentences: [],
          reviewSchedule: null,
        },
      ];

      const result = generateJsonExport(minimalVocab);

      expect(result.items).toHaveLength(1);
      expect(result.items[0]!).toMatchObject({
        word: 'test',
        reading: 'tesuto',
        meaning: 'test',
        notes: null,
        groups: [],
        exampleSentences: [],
        reviewSchedule: null,
      });
    });

    it('should be compatible with import schema (round-trip safe)', () => {
      const result = generateJsonExport(mockVocabularyData);

      const jsonString = JSON.stringify(result);
      const parsed = JSON.parse(jsonString);

      expect(parsed).toEqual(result);
      expect(parsed.version).toBe('1.0');
      expect(parsed.items).toHaveLength(2);
    });
  });

  describe('flattenVocabularyItem', () => {
    it('should flatten vocabulary with single group', () => {
      const vocab: VocabularyWithRelations = {
        id: 'vocab1',
        word: 'こんにちは',
        reading: 'konnichiwa',
        meaning: 'Hello',
        notes: 'Common greeting',
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-05'),
        groups: [{ id: 'group1', name: 'JLPT N5' }],
        exampleSentences: [],
        reviewSchedule: null,
      };

      const result = flattenVocabularyItem(vocab);

      expect(result.word).toBe('こんにちは');
      expect(result.reading).toBe('konnichiwa');
      expect(result.meaning).toBe('Hello');
      expect(result.notes).toBe('Common greeting');
      expect(result.groups).toBe('JLPT N5');
      expect(result.exampleSentences).toBe('');
    });

    it('should flatten multiple groups with semicolon delimiter', () => {
      const vocab: VocabularyWithRelations = {
        id: 'vocab1',
        word: 'こんにちは',
        reading: 'konnichiwa',
        meaning: 'Hello',
        notes: null,
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
        groups: [
          { id: 'group1', name: 'JLPT N5' },
          { id: 'group2', name: 'Daily Phrases' },
          { id: 'group3', name: 'Greetings' },
        ],
        exampleSentences: [],
        reviewSchedule: null,
      };

      const result = flattenVocabularyItem(vocab);

      expect(result.groups).toBe('JLPT N5;Daily Phrases;Greetings');
    });

    it('should flatten multiple example sentences with pipe delimiter', () => {
      const vocab: VocabularyWithRelations = {
        id: 'vocab1',
        word: 'こんにちは',
        reading: 'konnichiwa',
        meaning: 'Hello',
        notes: null,
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
        groups: [],
        exampleSentences: [
          {
            id: 'ex1',
            vocabularyItemId: 'vocab1',
            sentence: 'こんにちは、元気ですか？',
            reading: 'konnichiwa, genki desu ka?',
            meaning: 'Hello, how are you?',
            order: 0,
            createdAt: new Date('2026-01-01'),
            updatedAt: new Date('2026-01-01'),
          },
          {
            id: 'ex2',
            vocabularyItemId: 'vocab1',
            sentence: 'こんにちは、田中さん',
            reading: 'konnichiwa, Tanaka-san',
            meaning: 'Hello, Mr. Tanaka',
            order: 1,
            createdAt: new Date('2026-01-01'),
            updatedAt: new Date('2026-01-01'),
          },
        ],
        reviewSchedule: null,
      };

      const result = flattenVocabularyItem(vocab);

      expect(result.exampleSentences).toBe(
        'こんにちは、元気ですか？|konnichiwa, genki desu ka?|Hello, how are you?##こんにちは、田中さん|konnichiwa, Tanaka-san|Hello, Mr. Tanaka'
      );
    });

    it('should handle example sentences with null reading', () => {
      const vocab: VocabularyWithRelations = {
        id: 'vocab1',
        word: 'test',
        reading: 'tesuto',
        meaning: 'test',
        notes: null,
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
        groups: [],
        exampleSentences: [
          {
            id: 'ex1',
            vocabularyItemId: 'vocab1',
            sentence: 'Test sentence',
            reading: null,
            meaning: 'Test meaning',
            order: 0,
            createdAt: new Date('2026-01-01'),
            updatedAt: new Date('2026-01-01'),
          },
        ],
        reviewSchedule: null,
      };

      const result = flattenVocabularyItem(vocab);

      expect(result.exampleSentences).toBe('Test sentence||Test meaning');
    });

    it('should escape special characters in fields', () => {
      const vocab: VocabularyWithRelations = {
        id: 'vocab1',
        word: 'test,word',
        reading: 'test"reading',
        meaning: 'test\nmeaning',
        notes: 'test;note|with#special',
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
        groups: [],
        exampleSentences: [],
        reviewSchedule: null,
      };

      const result = flattenVocabularyItem(vocab);

      expect(result.word).toBe('test,word');
      expect(result.reading).toBe('test"reading');
      expect(result.meaning).toBe('test\nmeaning');
      expect(result.notes).toBe('test;note|with#special');
    });

    it('should handle null notes field', () => {
      const vocab: VocabularyWithRelations = {
        id: 'vocab1',
        word: 'test',
        reading: 'tesuto',
        meaning: 'test',
        notes: null,
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
        groups: [],
        exampleSentences: [],
        reviewSchedule: null,
      };

      const result = flattenVocabularyItem(vocab);

      expect(result.notes).toBe('');
    });

    it('should map ReviewSchedule fields to flat structure', () => {
      const vocab: VocabularyWithRelations = {
        id: 'vocab1',
        word: 'test',
        reading: 'tesuto',
        meaning: 'test',
        notes: null,
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
        groups: [],
        exampleSentences: [],
        reviewSchedule: {
          id: 'review1',
          vocabularyItemId: 'vocab1',
          easinessFactor: 2.5,
          interval: 3,
          repetitions: 2,
          nextReviewDate: new Date('2026-01-10T00:00:00.000Z'),
          lastReviewDate: new Date('2026-01-07T00:00:00.000Z'),
          createdAt: new Date('2026-01-01'),
          updatedAt: new Date('2026-01-07'),
        },
      };

      const result = flattenVocabularyItem(vocab);

      expect(result.easinessFactor).toBe('2.5');
      expect(result.interval).toBe('3');
      expect(result.repetitions).toBe('2');
      expect(result.nextReviewDate).toBe('2026-01-10T00:00:00.000Z');
      expect(result.lastReviewDate).toBe('2026-01-07T00:00:00.000Z');
    });

    it('should handle null ReviewSchedule', () => {
      const vocab: VocabularyWithRelations = {
        id: 'vocab1',
        word: 'test',
        reading: 'tesuto',
        meaning: 'test',
        notes: null,
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
        groups: [],
        exampleSentences: [],
        reviewSchedule: null,
      };

      const result = flattenVocabularyItem(vocab);

      expect(result.easinessFactor).toBe('');
      expect(result.interval).toBe('');
      expect(result.repetitions).toBe('');
      expect(result.nextReviewDate).toBe('');
      expect(result.lastReviewDate).toBe('');
    });

    it('should handle empty groups array', () => {
      const vocab: VocabularyWithRelations = {
        id: 'vocab1',
        word: 'test',
        reading: 'tesuto',
        meaning: 'test',
        notes: null,
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
        groups: [],
        exampleSentences: [],
        reviewSchedule: null,
      };

      const result = flattenVocabularyItem(vocab);

      expect(result.groups).toBe('');
    });

    it('should handle empty exampleSentences array', () => {
      const vocab: VocabularyWithRelations = {
        id: 'vocab1',
        word: 'test',
        reading: 'tesuto',
        meaning: 'test',
        notes: null,
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
        groups: [],
        exampleSentences: [],
        reviewSchedule: null,
      };

      const result = flattenVocabularyItem(vocab);

      expect(result.exampleSentences).toBe('');
    });
  });

  describe('generateCsvExport', () => {
    it('should generate valid CSV string', () => {
      const result = generateCsvExport(mockVocabularyData);

      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should start with UTF-8 BOM for Excel compatibility', () => {
      const result = generateCsvExport(mockVocabularyData);

      expect(result.charCodeAt(0)).toBe(0xfeff);
    });

    it('should include CSV header row', () => {
      const result = generateCsvExport(mockVocabularyData);
      const lines = result.split('\n');

      expect(lines[0]).toContain('word');
      expect(lines[0]).toContain('reading');
      expect(lines[0]).toContain('meaning');
      expect(lines[0]).toContain('notes');
      expect(lines[0]).toContain('groups');
      expect(lines[0]).toContain('exampleSentences');
      expect(lines[0]).toContain('easinessFactor');
      expect(lines[0]).toContain('interval');
      expect(lines[0]).toContain('repetitions');
      expect(lines[0]).toContain('nextReviewDate');
      expect(lines[0]).toContain('lastReviewDate');
    });

    it('should include all vocabulary items as rows', () => {
      const result = generateCsvExport(mockVocabularyData);
      const lines = result.split('\n').filter((line: string) => line.trim());

      expect(lines.length).toBe(3);
      expect(lines[1]).toContain('こんにちは');
      expect(lines[2]).toContain('ありがとう');
    });

    it('should properly quote fields containing commas', () => {
      const vocabWithComma: VocabularyWithRelations[] = [
        {
          id: 'vocab1',
          word: 'test,word',
          reading: 'tesuto',
          meaning: 'test, meaning',
          notes: null,
          createdAt: new Date('2026-01-01'),
          updatedAt: new Date('2026-01-01'),
          groups: [],
          exampleSentences: [],
          reviewSchedule: null,
        },
      ];

      const result = generateCsvExport(vocabWithComma);

      expect(result).toContain('"test,word"');
      expect(result).toContain('"test, meaning"');
    });

    it('should handle empty vocabulary array', () => {
      const result = generateCsvExport([]);

      expect(result).toBeTruthy();
      expect(result.charCodeAt(0)).toBe(0xfeff);
    });

    it('should be round-trip compatible (can be parsed back)', () => {
      const result = generateCsvExport(mockVocabularyData);

      const lines = result.split('\n').filter((line: string) => line.trim());
      expect(lines.length).toBeGreaterThan(1);
      expect(lines[0]).toContain('word,reading,meaning');
    });
  });
});
