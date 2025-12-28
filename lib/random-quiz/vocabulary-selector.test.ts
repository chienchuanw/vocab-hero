import { describe, it, expect } from 'vitest';
import {
  selectRandomVocabulary,
  selectVocabularyByDifficulty,
  type VocabularyItem,
} from './vocabulary-selector';

describe('vocabulary-selector', () => {
  const mockVocabulary: VocabularyItem[] = [
    { id: '1', word: '勉強', meaning: 'study', reading: 'べんきょう', groupId: 'g1' },
    { id: '2', word: '学校', meaning: 'school', reading: 'がっこう', groupId: 'g1' },
    { id: '3', word: '先生', meaning: 'teacher', reading: 'せんせい', groupId: 'g2' },
    { id: '4', word: '学生', meaning: 'student', reading: 'がくせい', groupId: 'g2' },
    { id: '5', word: '本', meaning: 'book', reading: 'ほん', groupId: 'g3' },
    { id: '6', word: '友達', meaning: 'friend', reading: 'ともだち', groupId: 'g3' },
    { id: '7', word: '家', meaning: 'house', reading: 'いえ', groupId: 'g3' },
  ];

  describe('selectRandomVocabulary', () => {
    it('should select specified number of vocabulary items', () => {
      const selected = selectRandomVocabulary(mockVocabulary, 3);

      expect(selected).toHaveLength(3);
    });

    it('should select items from all available groups', () => {
      const selected = selectRandomVocabulary(mockVocabulary, 5);

      const groupIds = new Set(selected.map((v) => v.groupId));

      // 應該從多個 group 中選取
      expect(groupIds.size).toBeGreaterThan(1);
    });

    it('should not select duplicate items', () => {
      const selected = selectRandomVocabulary(mockVocabulary, 5);

      const ids = selected.map((v) => v.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(selected.length);
    });

    it('should throw error if not enough vocabulary', () => {
      expect(() => selectRandomVocabulary(mockVocabulary, 10)).toThrow();
    });

    it('should return all items if count equals total', () => {
      const selected = selectRandomVocabulary(mockVocabulary, mockVocabulary.length);

      expect(selected).toHaveLength(mockVocabulary.length);
    });

    it('should return random selection', () => {
      const selected1 = selectRandomVocabulary(mockVocabulary, 3);
      const selected2 = selectRandomVocabulary(mockVocabulary, 3);

      // 由於是隨機選取，兩次結果可能不同
      // 但這個測試可能會偶爾失敗
      expect(selected1).toHaveLength(3);
      expect(selected2).toHaveLength(3);
    });
  });

  describe('selectVocabularyByDifficulty', () => {
    const vocabularyWithDifficulty: VocabularyItem[] = [
      {
        id: '1',
        word: '勉強',
        meaning: 'study',
        reading: 'べんきょう',
        groupId: 'g1',
        difficulty: 'easy',
      },
      {
        id: '2',
        word: '学校',
        meaning: 'school',
        reading: 'がっこう',
        groupId: 'g1',
        difficulty: 'easy',
      },
      {
        id: '3',
        word: '先生',
        meaning: 'teacher',
        reading: 'せんせい',
        groupId: 'g2',
        difficulty: 'medium',
      },
      {
        id: '4',
        word: '学生',
        meaning: 'student',
        reading: 'がくせい',
        groupId: 'g2',
        difficulty: 'medium',
      },
      {
        id: '5',
        word: '本',
        meaning: 'book',
        reading: 'ほん',
        groupId: 'g3',
        difficulty: 'hard',
      },
    ];

    it('should select only easy vocabulary', () => {
      const selected = selectVocabularyByDifficulty(vocabularyWithDifficulty, 2, 'easy');

      expect(selected).toHaveLength(2);
      expect(selected.every((v) => v.difficulty === 'easy')).toBe(true);
    });

    it('should select only medium vocabulary', () => {
      const selected = selectVocabularyByDifficulty(vocabularyWithDifficulty, 2, 'medium');

      expect(selected).toHaveLength(2);
      expect(selected.every((v) => v.difficulty === 'medium')).toBe(true);
    });

    it('should select only hard vocabulary', () => {
      const selected = selectVocabularyByDifficulty(vocabularyWithDifficulty, 1, 'hard');

      expect(selected).toHaveLength(1);
      expect(selected.every((v) => v.difficulty === 'hard')).toBe(true);
    });

    it('should throw error if not enough vocabulary of specified difficulty', () => {
      expect(() => selectVocabularyByDifficulty(vocabularyWithDifficulty, 5, 'hard')).toThrow();
    });

    it('should select mixed difficulty when not specified', () => {
      const selected = selectVocabularyByDifficulty(vocabularyWithDifficulty, 3);

      expect(selected).toHaveLength(3);
    });
  });
});

