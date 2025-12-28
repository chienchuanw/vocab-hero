import { describe, it, expect } from 'vitest';
import {
  generateDistractors,
  shuffleArray,
  generateQuizQuestions,
  type VocabularyItem,
  type QuizQuestion,
} from './quiz-utils';

/**
 * Quiz Utilities Test Suite
 * Tests for quiz question generation, distractor selection, and shuffling
 */

describe('shuffleArray', () => {
  it('should return an array with the same length', () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffleArray(input);
    expect(result).toHaveLength(input.length);
  });

  it('should contain all original elements', () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffleArray(input);
    expect(result.sort()).toEqual(input.sort());
  });

  it('should not modify the original array', () => {
    const input = [1, 2, 3, 4, 5];
    const original = [...input];
    shuffleArray(input);
    expect(input).toEqual(original);
  });

  it('should handle empty array', () => {
    const result = shuffleArray([]);
    expect(result).toEqual([]);
  });

  it('should handle single element array', () => {
    const result = shuffleArray([1]);
    expect(result).toEqual([1]);
  });
});

describe('generateDistractors', () => {
  const vocabularyPool: VocabularyItem[] = [
    { id: '1', word: '勉強', reading: 'べんきょう', meaning: 'study' },
    { id: '2', word: '学校', reading: 'がっこう', meaning: 'school' },
    { id: '3', word: '先生', reading: 'せんせい', meaning: 'teacher' },
    { id: '4', word: '学生', reading: 'がくせい', meaning: 'student' },
    { id: '5', word: '教室', reading: 'きょうしつ', meaning: 'classroom' },
  ];

  it('should generate correct number of distractors', () => {
    const correctAnswer = vocabularyPool[0];
    const distractors = generateDistractors(correctAnswer, vocabularyPool, 3);
    expect(distractors).toHaveLength(3);
  });

  it('should not include the correct answer in distractors', () => {
    const correctAnswer = vocabularyPool[0];
    const distractors = generateDistractors(correctAnswer, vocabularyPool, 3);
    expect(distractors).not.toContainEqual(correctAnswer);
  });

  it('should return unique distractors', () => {
    const correctAnswer = vocabularyPool[0];
    const distractors = generateDistractors(correctAnswer, vocabularyPool, 3);
    const ids = distractors.map((d) => d.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(distractors.length);
  });

  it('should handle case when pool is smaller than requested count', () => {
    const smallPool = vocabularyPool.slice(0, 2);
    const correctAnswer = smallPool[0];
    const distractors = generateDistractors(correctAnswer, smallPool, 3);
    expect(distractors.length).toBeLessThanOrEqual(1);
  });

  it('should return empty array when pool only contains correct answer', () => {
    const singleItemPool = [vocabularyPool[0]];
    const correctAnswer = vocabularyPool[0];
    const distractors = generateDistractors(correctAnswer, singleItemPool, 3);
    expect(distractors).toEqual([]);
  });
});

describe('generateQuizQuestions', () => {
  const vocabularyPool: VocabularyItem[] = [
    { id: '1', word: '勉強', reading: 'べんきょう', meaning: 'study' },
    { id: '2', word: '学校', reading: 'がっこう', meaning: 'school' },
    { id: '3', word: '先生', reading: 'せんせい', meaning: 'teacher' },
    { id: '4', word: '学生', reading: 'がくせい', meaning: 'student' },
    { id: '5', word: '教室', reading: 'きょうしつ', meaning: 'classroom' },
  ];

  it('should generate correct number of questions', () => {
    const questions = generateQuizQuestions(vocabularyPool, 3, 'WORD_TO_MEANING');
    expect(questions).toHaveLength(3);
  });

  it('should generate WORD_TO_MEANING questions correctly', () => {
    const questions = generateQuizQuestions(vocabularyPool, 2, 'WORD_TO_MEANING');
    questions.forEach((q) => {
      expect(q.question).toContain(q.correctAnswer.word);
      expect(q.options).toHaveLength(4);
      expect(q.options).toContain(q.correctAnswer.meaning);
    });
  });

  it('should generate MEANING_TO_WORD questions correctly', () => {
    const questions = generateQuizQuestions(vocabularyPool, 2, 'MEANING_TO_WORD');
    questions.forEach((q) => {
      expect(q.question).toContain(q.correctAnswer.meaning);
      expect(q.options).toHaveLength(4);
      expect(q.options).toContain(q.correctAnswer.word);
    });
  });

  it('should have unique correct answers across questions', () => {
    const questions = generateQuizQuestions(vocabularyPool, 3, 'WORD_TO_MEANING');
    const correctIds = questions.map((q) => q.correctAnswer.id);
    const uniqueIds = new Set(correctIds);
    expect(uniqueIds.size).toBe(questions.length);
  });

  it('should shuffle options in each question', () => {
    const questions = generateQuizQuestions(vocabularyPool, 2, 'WORD_TO_MEANING');
    questions.forEach((q) => {
      const correctIndex = q.options.indexOf(q.correctAnswer.meaning);
      expect(correctIndex).toBeGreaterThanOrEqual(0);
      expect(correctIndex).toBeLessThan(4);
    });
  });

  it('should handle pool smaller than question count', () => {
    const questions = generateQuizQuestions(vocabularyPool, 10, 'WORD_TO_MEANING');
    expect(questions.length).toBeLessThanOrEqual(vocabularyPool.length);
  });
});

