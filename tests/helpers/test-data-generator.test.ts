import { describe, it, expect } from 'vitest';
import {
  generateVocabularyItem,
  generateVocabularyItems,
  generateGroup,
  generateReviewSchedule,
} from './test-data-generator';

describe('Test Data Generator', () => {
  describe('generateVocabularyItem', () => {
    it('should generate a vocabulary item with required fields', () => {
      const item = generateVocabularyItem();

      expect(item).toHaveProperty('word');
      expect(item).toHaveProperty('reading');
      expect(item).toHaveProperty('meaning');
      expect(item).toHaveProperty('createdAt');
      expect(item).toHaveProperty('updatedAt');
      expect(item.notes).toBeNull();
    });

    it('should generate unique words for different items with different indices', () => {
      const item1 = generateVocabularyItem({ index: 1 });
      const item2 = generateVocabularyItem({ index: 2 });

      expect(item1.word).not.toBe(item2.word);
    });

    it('should allow overriding default values', () => {
      const customWord = '勉強';
      const item = generateVocabularyItem({ word: customWord });

      expect(item.word).toBe(customWord);
    });

    it('should generate items with sequential index when provided', () => {
      const item1 = generateVocabularyItem({ index: 1 });
      const item2 = generateVocabularyItem({ index: 2 });

      expect(item1.word).toContain('1');
      expect(item2.word).toContain('2');
    });

    it('should include notes when provided', () => {
      const item = generateVocabularyItem({
        notes: 'Test note',
      });

      expect(item.notes).toBe('Test note');
    });
  });

  describe('generateVocabularyItems', () => {
    it('should generate specified number of items', () => {
      const items = generateVocabularyItems(10);

      expect(items).toHaveLength(10);
    });

    it('should generate 1000 items for large dataset testing', () => {
      const items = generateVocabularyItems(1000);

      expect(items).toHaveLength(1000);
      expect(items[0]?.word).toBeDefined();
      expect(items[999]?.word).toBeDefined();
    });

    it('should generate unique items', () => {
      const items = generateVocabularyItems(100);
      const words = items.map((item) => item.word);
      const uniqueWords = new Set(words);

      expect(uniqueWords.size).toBe(100);
    });

    it('should assign sequential indices to items', () => {
      const items = generateVocabularyItems(5);

      items.forEach((item, index) => {
        expect(item.word).toContain(String(index + 1));
      });
    });

    it('should complete generation within reasonable time for 1000 items', () => {
      const startTime = performance.now();
      const items = generateVocabularyItems(1000);
      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(items).toHaveLength(1000);
      expect(duration).toBeLessThan(1000);
    });

    it('should allow applying common overrides to all items', () => {
      const notes = 'Common note';
      const items = generateVocabularyItems(10, { notes });

      items.forEach((item) => {
        expect(item.notes).toBe(notes);
      });
    });
  });

  describe('generateGroup', () => {
    it('should generate a group with required fields', () => {
      const group = generateGroup();

      expect(group).toHaveProperty('name');
      expect(group).toHaveProperty('userId');
      expect(group).toHaveProperty('createdAt');
      expect(group).toHaveProperty('updatedAt');
    });

    it('should allow overriding group name', () => {
      const group = generateGroup({ name: 'JLPT N5' });

      expect(group.name).toBe('JLPT N5');
    });

    it('should include description when provided', () => {
      const group = generateGroup({ description: 'Test description' });

      expect(group.description).toBe('Test description');
    });
  });

  describe('generateReviewSchedule', () => {
    it('should generate a review schedule with SM-2 data', () => {
      const schedule = generateReviewSchedule('vocab-1');

      expect(schedule).toHaveProperty('vocabularyItemId');
      expect(schedule.vocabularyItemId).toBe('vocab-1');
      expect(schedule).toHaveProperty('easinessFactor');
      expect(schedule).toHaveProperty('interval');
      expect(schedule).toHaveProperty('repetitions');
      expect(schedule).toHaveProperty('nextReviewDate');
    });

    it('should allow setting due status', () => {
      const schedule = generateReviewSchedule('vocab-1', { isDue: true });
      const now = new Date();

      expect(schedule.nextReviewDate.getTime()).toBeLessThanOrEqual(now.getTime());
    });

    it('should allow custom SM-2 values', () => {
      const schedule = generateReviewSchedule('vocab-1', {
        easinessFactor: 2.5,
        interval: 7,
        repetitions: 3,
      });

      expect(schedule.easinessFactor).toBe(2.5);
      expect(schedule.interval).toBe(7);
      expect(schedule.repetitions).toBe(3);
    });
  });
});
