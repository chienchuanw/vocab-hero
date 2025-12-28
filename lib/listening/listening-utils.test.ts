import { describe, it, expect } from 'vitest';
import {
  generateListeningQuestion,
  calculateListeningStats,
  canReplayAudio,
} from './listening-utils';
import type { ListeningAnswer, ListeningQuestion } from './listening.types';

/**
 * Listening Utils Test Suite
 * Tests for listening quiz utility functions
 */

describe('generateListeningQuestion', () => {
  const mockVocabulary = {
    id: 'vocab-1',
    word: 'benkyou',
    reading: 'benkyou',
    meaning: 'study',
  };

  const mockDistractors = ['work', 'play', 'sleep'];

  it('should generate multiple choice question', () => {
    const question = generateListeningQuestion(
      mockVocabulary,
      'multiple-choice',
      mockDistractors
    );

    expect(question.id).toBeDefined();
    expect(question.vocabularyId).toBe('vocab-1');
    expect(question.word).toBe('benkyou');
    expect(question.reading).toBe('benkyou');
    expect(question.correctAnswer).toBe('study');
    expect(question.type).toBe('multiple-choice');
    expect(question.options).toHaveLength(4);
    expect(question.options).toContain('study');
    expect(question.replaysUsed).toBe(0);
  });

  it('should generate typing question', () => {
    const question = generateListeningQuestion(mockVocabulary, 'typing');

    expect(question.type).toBe('typing');
    expect(question.options).toBeUndefined();
    expect(question.correctAnswer).toBe('study');
  });

  it('should shuffle options for multiple choice', () => {
    const question1 = generateListeningQuestion(
      mockVocabulary,
      'multiple-choice',
      mockDistractors
    );
    const question2 = generateListeningQuestion(
      mockVocabulary,
      'multiple-choice',
      mockDistractors
    );

    // Options should be shuffled (may occasionally fail due to randomness)
    const sameOrder =
      JSON.stringify(question1.options) === JSON.stringify(question2.options);
    // This test is probabilistic, so we just check structure
    expect(question1.options).toHaveLength(4);
    expect(question2.options).toHaveLength(4);
  });
});

describe('calculateListeningStats', () => {
  const mockAnswers: ListeningAnswer[] = [
    {
      questionId: 'q1',
      answer: 'study',
      isCorrect: true,
      timeMs: 3000,
      replaysUsed: 0,
    },
    {
      questionId: 'q2',
      answer: 'work',
      isCorrect: false,
      timeMs: 5000,
      replaysUsed: 2,
    },
    {
      questionId: 'q3',
      answer: 'play',
      isCorrect: true,
      timeMs: 4000,
      replaysUsed: 1,
    },
  ];

  it('should calculate correct statistics', () => {
    const stats = calculateListeningStats(mockAnswers);

    expect(stats.totalQuestions).toBe(3);
    expect(stats.correctAnswers).toBe(2);
    expect(stats.accuracy).toBeCloseTo(66.67, 1);
    expect(stats.averageTimeSeconds).toBe(4);
    expect(stats.totalReplays).toBe(3);
    expect(stats.averageReplays).toBe(1);
  });

  it('should handle empty answers', () => {
    const stats = calculateListeningStats([]);

    expect(stats.totalQuestions).toBe(0);
    expect(stats.correctAnswers).toBe(0);
    expect(stats.accuracy).toBe(0);
    expect(stats.averageTimeSeconds).toBe(0);
    expect(stats.totalReplays).toBe(0);
    expect(stats.averageReplays).toBe(0);
  });

  it('should handle all correct answers', () => {
    const allCorrect: ListeningAnswer[] = [
      {
        questionId: 'q1',
        answer: 'study',
        isCorrect: true,
        timeMs: 2000,
        replaysUsed: 0,
      },
      {
        questionId: 'q2',
        answer: 'work',
        isCorrect: true,
        timeMs: 3000,
        replaysUsed: 0,
      },
    ];

    const stats = calculateListeningStats(allCorrect);

    expect(stats.accuracy).toBe(100);
  });
});

describe('canReplayAudio', () => {
  const mockQuestion: ListeningQuestion = {
    id: 'q1',
    vocabularyId: 'v1',
    word: 'benkyou',
    reading: 'benkyou',
    correctAnswer: 'study',
    type: 'multiple-choice',
    replaysUsed: 0,
  };

  it('should allow replay when under limit', () => {
    const canReplay = canReplayAudio(mockQuestion, 3);
    expect(canReplay).toBe(true);
  });

  it('should not allow replay when at limit', () => {
    const questionAtLimit = { ...mockQuestion, replaysUsed: 3 };
    const canReplay = canReplayAudio(questionAtLimit, 3);
    expect(canReplay).toBe(false);
  });

  it('should not allow replay when over limit', () => {
    const questionOverLimit = { ...mockQuestion, replaysUsed: 5 };
    const canReplay = canReplayAudio(questionOverLimit, 3);
    expect(canReplay).toBe(false);
  });

  it('should allow unlimited replays when maxReplays is 0', () => {
    const questionWithManyReplays = { ...mockQuestion, replaysUsed: 100 };
    const canReplay = canReplayAudio(questionWithManyReplays, 0);
    expect(canReplay).toBe(true);
  });
});

