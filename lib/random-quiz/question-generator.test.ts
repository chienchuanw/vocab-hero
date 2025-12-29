import { describe, it, expect } from 'vitest';
import {
  generateMixedQuestions,
  type VocabularyItem,
  type QuizQuestion,
} from './question-generator';

describe('question-generator', () => {
  const mockVocabulary: VocabularyItem[] = [
    { id: '1', word: '勉強', meaning: 'study', reading: 'べんきょう', groupId: 'g1' },
    { id: '2', word: '学校', meaning: 'school', reading: 'がっこう', groupId: 'g1' },
    { id: '3', word: '先生', meaning: 'teacher', reading: 'せんせい', groupId: 'g2' },
    { id: '4', word: '学生', meaning: 'student', reading: 'がくせい', groupId: 'g2' },
    { id: '5', word: '本', meaning: 'book', reading: 'ほん', groupId: 'g3' },
    { id: '6', word: '友達', meaning: 'friend', reading: 'ともだち', groupId: 'g3' },
    { id: '7', word: '家', meaning: 'house', reading: 'いえ', groupId: 'g3' },
    { id: '8', word: '食べる', meaning: 'to eat', reading: 'たべる', groupId: 'g4' },
    { id: '9', word: '飲む', meaning: 'to drink', reading: 'のむ', groupId: 'g4' },
    { id: '10', word: '見る', meaning: 'to see', reading: 'みる', groupId: 'g4' },
    { id: '11', word: '聞く', meaning: 'to listen', reading: 'きく', groupId: 'g5' },
    { id: '12', word: '話す', meaning: 'to speak', reading: 'はなす', groupId: 'g5' },
  ];

  describe('generateMixedQuestions', () => {
    it('should generate specified number of questions', () => {
      const questions = generateMixedQuestions(mockVocabulary, 5);

      expect(questions).toHaveLength(5);
    });

    it('should generate mix of multiple choice and spelling questions', () => {
      const questions = generateMixedQuestions(mockVocabulary, 10);

      const multipleChoice = questions.filter((q) => q.type === 'multiple-choice');
      const spelling = questions.filter((q) => q.type === 'spelling');

      // 應該有兩種題型
      expect(multipleChoice.length).toBeGreaterThan(0);
      expect(spelling.length).toBeGreaterThan(0);
    });

    it('should assign unique IDs to each question', () => {
      const questions = generateMixedQuestions(mockVocabulary, 5);

      const ids = questions.map((q) => q.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(questions.length);
    });

    it('should include vocabulary item in each question', () => {
      const questions = generateMixedQuestions(mockVocabulary, 5);

      questions.forEach((question) => {
        expect(question.vocabularyId).toBeTruthy();
        expect(mockVocabulary.some((v) => v.id === question.vocabularyId)).toBe(true);
      });
    });

    it('should include correct answer for each question', () => {
      const questions = generateMixedQuestions(mockVocabulary, 5);

      questions.forEach((question) => {
        expect(question.correctAnswer).toBeTruthy();
      });
    });

    it('should include options for multiple choice questions', () => {
      const questions = generateMixedQuestions(mockVocabulary, 10);

      const multipleChoice = questions.filter((q) => q.type === 'multiple-choice');

      multipleChoice.forEach((question) => {
        expect(question.options).toBeDefined();
        expect(question.options).toHaveLength(4);
        expect(question.options).toContain(question.correctAnswer);
      });
    });

    it('should not include options for spelling questions', () => {
      const questions = generateMixedQuestions(mockVocabulary, 10);

      const spelling = questions.filter((q) => q.type === 'spelling');

      spelling.forEach((question) => {
        expect(question.options).toBeUndefined();
      });
    });

    it('should throw error if not enough vocabulary', () => {
      expect(() => generateMixedQuestions(mockVocabulary, 20)).toThrow();
    });

    it('should include question text', () => {
      const questions = generateMixedQuestions(mockVocabulary, 5);

      questions.forEach((question) => {
        expect(question.question).toBeTruthy();
      });
    });

    it('should shuffle questions', () => {
      const questions1 = generateMixedQuestions(mockVocabulary, 5);
      const questions2 = generateMixedQuestions(mockVocabulary, 5);

      // 由於是隨機洗牌，兩次結果可能不同
      expect(questions1).toHaveLength(5);
      expect(questions2).toHaveLength(5);
    });

    it('should have balanced question types', () => {
      const questions = generateMixedQuestions(mockVocabulary, 10);

      const multipleChoice = questions.filter((q) => q.type === 'multiple-choice');
      const spelling = questions.filter((q) => q.type === 'spelling');

      // 應該大致平衡（允許 ±2 的差異）
      const diff = Math.abs(multipleChoice.length - spelling.length);
      expect(diff).toBeLessThanOrEqual(2);
    });

    it('should not use same vocabulary twice', () => {
      const questions = generateMixedQuestions(mockVocabulary, 5);

      const vocabularyIds = questions.map((q) => q.vocabularyId);
      const uniqueIds = new Set(vocabularyIds);

      expect(uniqueIds.size).toBe(questions.length);
    });
  });
});
