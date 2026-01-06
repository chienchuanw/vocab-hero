import { describe, it, expect } from 'vitest';
import {
  parseJsonImport,
  parseCsvImport,
  findDuplicates,
  applyDuplicateStrategy,
  type ExistingVocabularyItem,
} from './import-parser';
import { DuplicateStrategy, type ImportVocabularyItem } from '@/lib/validations/import';

describe('parseJsonImport', () => {
  describe('valid JSON imports', () => {
    it('should parse valid JSON export format', () => {
      const jsonString = JSON.stringify({
        version: '1.0',
        exportDate: '2026-01-06T00:00:00.000Z',
        itemCount: 1,
        items: [
          {
            word: 'こんにちは',
            reading: 'konnichiwa',
            meaning: 'Hello',
            notes: null,
            groups: [],
            exampleSentences: [],
            reviewSchedule: null,
          },
        ],
      });

      const result = parseJsonImport(jsonString);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveLength(1);
        expect(result.data[0].word).toBe('こんにちは');
      }
    });

    it('should parse JSON with multiple items', () => {
      const jsonString = JSON.stringify({
        version: '1.0',
        exportDate: '2026-01-06',
        itemCount: 2,
        items: [
          { word: 'test1', reading: 'tesuto1', meaning: 'test1' },
          { word: 'test2', reading: 'tesuto2', meaning: 'test2' },
        ],
      });

      const result = parseJsonImport(jsonString);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveLength(2);
      }
    });

    it('should extract items from export wrapper', () => {
      const jsonString = JSON.stringify({
        version: '1.0',
        exportDate: '2026-01-06',
        itemCount: 1,
        items: [{ word: 'test', reading: 'tesuto', meaning: 'test' }],
      });

      const result = parseJsonImport(jsonString);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.metadata).toEqual({
          version: '1.0',
          exportDate: '2026-01-06',
          itemCount: 1,
        });
      }
    });
  });

  describe('invalid JSON imports', () => {
    it('should reject malformed JSON', () => {
      const jsonString = '{ invalid json }';

      const result = parseJsonImport(jsonString);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].message).toContain('JSON');
      }
    });

    it('should reject non-object JSON', () => {
      const jsonString = JSON.stringify('not an object');

      const result = parseJsonImport(jsonString);

      expect(result.success).toBe(false);
    });

    it('should reject JSON without items array', () => {
      const jsonString = JSON.stringify({
        version: '1.0',
        exportDate: '2026-01-06',
      });

      const result = parseJsonImport(jsonString);

      expect(result.success).toBe(false);
    });

    it('should reject empty items array', () => {
      const jsonString = JSON.stringify({
        version: '1.0',
        exportDate: '2026-01-06',
        itemCount: 0,
        items: [],
      });

      const result = parseJsonImport(jsonString);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors[0].message).toContain('At least one item required');
      }
    });

    it('should reject items with validation errors', () => {
      const jsonString = JSON.stringify({
        version: '1.0',
        exportDate: '2026-01-06',
        itemCount: 1,
        items: [{ word: '', reading: 'test', meaning: 'test' }],
      });

      const result = parseJsonImport(jsonString);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].message).toContain('Word cannot be empty');
      }
    });

    it('should collect multiple validation errors', () => {
      const jsonString = JSON.stringify({
        version: '1.0',
        exportDate: '2026-01-06',
        itemCount: 2,
        items: [
          { word: '', reading: 'test1', meaning: 'test1' },
          { word: 'test2', reading: '', meaning: 'test2' },
        ],
      });

      const result = parseJsonImport(jsonString);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.length).toBeGreaterThan(0);
      }
    });
  });
});

describe('parseCsvImport', () => {
  describe('valid CSV imports', () => {
    it('should parse simple CSV with header', () => {
      const csvString =
        'word,reading,meaning,notes,groups,exampleSentences,easinessFactor,interval,repetitions,nextReviewDate,lastReviewDate\nこんにちは,konnichiwa,Hello,,,,,,,';

      const result = parseCsvImport(csvString);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveLength(1);
        expect(result.data[0].word).toBe('こんにちは');
      }
    });

    it('should handle UTF-8 BOM', () => {
      const csvString =
        '\uFEFFword,reading,meaning\nこんにちは,konnichiwa,Hello\nありがとう,arigatou,Thank you';

      const result = parseCsvImport(csvString);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveLength(2);
      }
    });

    it('should parse multiple rows', () => {
      const csvString =
        'word,reading,meaning\ntest1,tesuto1,test1\ntest2,tesuto2,test2\ntest3,tesuto3,test3';

      const result = parseCsvImport(csvString);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveLength(3);
      }
    });

    it('should handle quoted fields with commas', () => {
      const csvString = 'word,reading,meaning\n"test,word",tesuto,"test, meaning"';

      const result = parseCsvImport(csvString);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data[0].word).toBe('test,word');
        expect(result.data[0].meaning).toBe('test, meaning');
      }
    });

    it('should skip empty rows', () => {
      const csvString = 'word,reading,meaning\ntest1,tesuto1,test1\n\n\ntest2,tesuto2,test2';

      const result = parseCsvImport(csvString);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveLength(2);
      }
    });
  });

  describe('invalid CSV imports', () => {
    it('should reject CSV without headers', () => {
      const csvString = 'こんにちは,konnichiwa,Hello';

      const result = parseCsvImport(csvString);

      expect(result.success).toBe(false);
    });

    it('should reject CSV with missing required columns', () => {
      const csvString = 'word,reading\ntest,tesuto';

      const result = parseCsvImport(csvString);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors[0].message).toContain('required');
      }
    });

    it('should reject empty CSV', () => {
      const csvString = '';

      const result = parseCsvImport(csvString);

      expect(result.success).toBe(false);
    });

    it('should reject header-only CSV', () => {
      const csvString = 'word,reading,meaning';

      const result = parseCsvImport(csvString);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors[0].message).toContain('At least one item required');
      }
    });

    it('should collect row-level validation errors with line numbers', () => {
      const csvString = 'word,reading,meaning\n,tesuto1,test1\ntest2,,test2';

      const result = parseCsvImport(csvString);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors).toHaveLength(2);
        expect(result.errors[0]).toHaveProperty('line', 2);
        expect(result.errors[1]).toHaveProperty('line', 3);
      }
    });

    it('should handle malformed CSV gracefully', () => {
      const csvString = 'word,reading,meaning\ntest1,tesuto1\ntest2,tesuto2,test2,extra';

      const result = parseCsvImport(csvString);

      expect(result.success).toBe(false);
    });
  });
});

describe('findDuplicates', () => {
  const createImportItem = (word: string, reading: string): ImportVocabularyItem => ({
    word,
    reading,
    meaning: 'test meaning',
  });

  const createExistingItem = (
    id: string,
    word: string,
    reading: string
  ): ExistingVocabularyItem => ({
    id,
    word,
    reading,
    meaning: 'existing meaning',
  });

  describe('duplicate matching', () => {
    it('should find exact word+reading matches', () => {
      const importItems = [createImportItem('test', 'tesuto')];
      const existingItems = [createExistingItem('1', 'test', 'tesuto')];

      const result = findDuplicates(importItems, existingItems);

      expect(result).toHaveLength(1);
      expect(result[0].importItem.word).toBe('test');
      expect(result[0].existingItem.id).toBe('1');
    });

    it('should return empty array when no duplicates exist', () => {
      const importItems = [createImportItem('new', 'atarashii')];
      const existingItems = [createExistingItem('1', 'old', 'furui')];

      const result = findDuplicates(importItems, existingItems);

      expect(result).toHaveLength(0);
    });

    it('should not match when only word matches', () => {
      const importItems = [createImportItem('test', 'tesuto1')];
      const existingItems = [createExistingItem('1', 'test', 'tesuto2')];

      const result = findDuplicates(importItems, existingItems);

      expect(result).toHaveLength(0);
    });

    it('should not match when only reading matches', () => {
      const importItems = [createImportItem('test1', 'tesuto')];
      const existingItems = [createExistingItem('1', 'test2', 'tesuto')];

      const result = findDuplicates(importItems, existingItems);

      expect(result).toHaveLength(0);
    });

    it('should find multiple duplicates', () => {
      const importItems = [
        createImportItem('word1', 'reading1'),
        createImportItem('word2', 'reading2'),
        createImportItem('word3', 'reading3'),
      ];
      const existingItems = [
        createExistingItem('1', 'word1', 'reading1'),
        createExistingItem('2', 'word2', 'reading2'),
      ];

      const result = findDuplicates(importItems, existingItems);

      expect(result).toHaveLength(2);
    });

    it('should handle empty import items', () => {
      const importItems: ImportVocabularyItem[] = [];
      const existingItems = [createExistingItem('1', 'test', 'tesuto')];

      const result = findDuplicates(importItems, existingItems);

      expect(result).toHaveLength(0);
    });

    it('should handle empty existing items', () => {
      const importItems = [createImportItem('test', 'tesuto')];
      const existingItems: ExistingVocabularyItem[] = [];

      const result = findDuplicates(importItems, existingItems);

      expect(result).toHaveLength(0);
    });

    it('should include import item index in result', () => {
      const importItems = [
        createImportItem('word1', 'reading1'),
        createImportItem('word2', 'reading2'),
      ];
      const existingItems = [createExistingItem('1', 'word2', 'reading2')];

      const result = findDuplicates(importItems, existingItems);

      expect(result).toHaveLength(1);
      expect(result[0].importIndex).toBe(1);
    });
  });
});

describe('applyDuplicateStrategy', () => {
  const createImportItem = (
    word: string,
    reading: string,
    meaning: string
  ): ImportVocabularyItem => ({
    word,
    reading,
    meaning,
  });

  const createExistingItem = (
    id: string,
    word: string,
    reading: string,
    meaning: string
  ): ExistingVocabularyItem => ({
    id,
    word,
    reading,
    meaning,
  });

  describe('SKIP strategy', () => {
    it('should remove duplicates from import list', () => {
      const importItems = [
        createImportItem('word1', 'reading1', 'new meaning 1'),
        createImportItem('word2', 'reading2', 'new meaning 2'),
      ];
      const duplicates = [
        {
          importItem: importItems[0],
          existingItem: createExistingItem('1', 'word1', 'reading1', 'old meaning'),
          importIndex: 0,
        },
      ];

      const result = applyDuplicateStrategy(importItems, duplicates, DuplicateStrategy.SKIP);

      expect(result.itemsToCreate).toHaveLength(1);
      expect(result.itemsToCreate[0].word).toBe('word2');
      expect(result.itemsToUpdate).toHaveLength(0);
    });

    it('should skip all duplicates', () => {
      const importItems = [
        createImportItem('word1', 'reading1', 'meaning1'),
        createImportItem('word2', 'reading2', 'meaning2'),
      ];
      const existingItem1 = createExistingItem('1', 'word1', 'reading1', 'old1');
      const existingItem2 = createExistingItem('2', 'word2', 'reading2', 'old2');
      const duplicates = [
        { importItem: importItems[0], existingItem: existingItem1, importIndex: 0 },
        { importItem: importItems[1], existingItem: existingItem2, importIndex: 1 },
      ];

      const result = applyDuplicateStrategy(importItems, duplicates, DuplicateStrategy.SKIP);

      expect(result.itemsToCreate).toHaveLength(0);
      expect(result.itemsToUpdate).toHaveLength(0);
    });
  });

  describe('OVERWRITE strategy', () => {
    it('should mark duplicates for update', () => {
      const importItems = [
        createImportItem('word1', 'reading1', 'new meaning'),
        createImportItem('word2', 'reading2', 'meaning2'),
      ];
      const existingItem = createExistingItem('1', 'word1', 'reading1', 'old meaning');
      const duplicates = [{ importItem: importItems[0], existingItem, importIndex: 0 }];

      const result = applyDuplicateStrategy(importItems, duplicates, DuplicateStrategy.OVERWRITE);

      expect(result.itemsToCreate).toHaveLength(1);
      expect(result.itemsToUpdate).toHaveLength(1);
      expect(result.itemsToUpdate[0].id).toBe('1');
      expect(result.itemsToUpdate[0].data.meaning).toBe('new meaning');
    });
  });

  describe('MERGE strategy', () => {
    it('should merge notes when import has notes and existing does not', () => {
      const importItems = [
        { ...createImportItem('word1', 'reading1', 'meaning'), notes: 'new notes' },
      ];
      const existingItem = { ...createExistingItem('1', 'word1', 'reading1', 'meaning') };
      const duplicates = [{ importItem: importItems[0], existingItem, importIndex: 0 }];

      const result = applyDuplicateStrategy(importItems, duplicates, DuplicateStrategy.MERGE);

      expect(result.itemsToUpdate).toHaveLength(1);
      expect(result.itemsToUpdate[0].data.notes).toBe('new notes');
    });

    it('should keep existing meaning when not empty', () => {
      const importItems = [createImportItem('word1', 'reading1', 'new meaning')];
      const existingItem = createExistingItem('1', 'word1', 'reading1', 'existing meaning');
      const duplicates = [{ importItem: importItems[0], existingItem, importIndex: 0 }];

      const result = applyDuplicateStrategy(importItems, duplicates, DuplicateStrategy.MERGE);

      expect(result.itemsToUpdate).toHaveLength(1);
      expect(result.itemsToUpdate[0].data.meaning).toBe('existing meaning');
    });

    it('should merge groups from both sources', () => {
      const importItems = [
        {
          ...createImportItem('word1', 'reading1', 'meaning'),
          groups: [{ name: 'group2' }],
        },
      ];
      const existingItem = {
        ...createExistingItem('1', 'word1', 'reading1', 'meaning'),
        groups: [{ id: 'g1', name: 'group1' }],
      };
      const duplicates = [{ importItem: importItems[0], existingItem, importIndex: 0 }];

      const result = applyDuplicateStrategy(importItems, duplicates, DuplicateStrategy.MERGE);

      expect(result.itemsToUpdate).toHaveLength(1);
      expect(result.itemsToUpdate[0].data.groups).toHaveLength(2);
    });
  });

  describe('edge cases', () => {
    it('should handle empty duplicates array', () => {
      const importItems = [createImportItem('word1', 'reading1', 'meaning')];

      const result = applyDuplicateStrategy(importItems, [], DuplicateStrategy.SKIP);

      expect(result.itemsToCreate).toHaveLength(1);
      expect(result.itemsToUpdate).toHaveLength(0);
    });

    it('should handle all items being duplicates with SKIP', () => {
      const importItems = [createImportItem('word1', 'reading1', 'meaning')];
      const existingItem = createExistingItem('1', 'word1', 'reading1', 'old');
      const duplicates = [{ importItem: importItems[0], existingItem, importIndex: 0 }];

      const result = applyDuplicateStrategy(importItems, duplicates, DuplicateStrategy.SKIP);

      expect(result.itemsToCreate).toHaveLength(0);
    });
  });
});
