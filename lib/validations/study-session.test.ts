import { describe, it, expect } from 'vitest';
import {
  createStudySessionSchema,
  updateStudySessionSchema,
  createQuizSessionSchema,
} from './study-session';

/**
 * Study Session Validation Schema Tests
 */

describe('createStudySessionSchema', () => {
  it('should validate valid flashcard session data', () => {
    const validData = {
      userId: 'user-123',
      mode: 'flashcard',
    };

    const result = createStudySessionSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject missing userId', () => {
    const invalidData = {
      mode: 'flashcard',
    };

    const result = createStudySessionSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject empty userId', () => {
    const invalidData = {
      userId: '',
      mode: 'flashcard',
    };

    const result = createStudySessionSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject missing mode', () => {
    const invalidData = {
      userId: 'user-123',
    };

    const result = createStudySessionSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});

describe('updateStudySessionSchema', () => {
  it('should validate valid update data', () => {
    const validData = {
      cardsReviewed: 10,
      correctAnswers: 8,
      timeSpentMinutes: 15,
    };

    const result = updateStudySessionSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should allow partial updates', () => {
    const validData = {
      cardsReviewed: 5,
    };

    const result = updateStudySessionSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject negative values', () => {
    const invalidData = {
      cardsReviewed: -1,
    };

    const result = updateStudySessionSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should validate completedAt datetime string', () => {
    const validData = {
      completedAt: new Date().toISOString(),
    };

    const result = updateStudySessionSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });
});

describe('createQuizSessionSchema', () => {
  it('should validate valid quiz session data', () => {
    const validData = {
      userId: 'user-123',
      mode: 'quiz',
      studyMode: 'MULTIPLE_CHOICE',
      quizType: 'WORD_TO_MEANING',
      questionCount: 10,
      groupId: 'group-123',
    };

    const result = createQuizSessionSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should validate all StudyMode enum values', () => {
    const modes = ['FLASHCARD', 'MULTIPLE_CHOICE', 'SPELLING', 'MATCHING', 'RANDOM'];

    modes.forEach((studyMode) => {
      const data = {
        userId: 'user-123',
        mode: 'quiz',
        studyMode,
        quizType: 'WORD_TO_MEANING',
        questionCount: 10,
      };

      const result = createQuizSessionSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  it('should validate all QuizType enum values', () => {
    const types = ['WORD_TO_MEANING', 'MEANING_TO_WORD', 'MIXED'];

    types.forEach((quizType) => {
      const data = {
        userId: 'user-123',
        mode: 'quiz',
        studyMode: 'MULTIPLE_CHOICE',
        quizType,
        questionCount: 10,
      };

      const result = createQuizSessionSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  it('should reject invalid StudyMode', () => {
    const invalidData = {
      userId: 'user-123',
      mode: 'quiz',
      studyMode: 'INVALID_MODE',
      quizType: 'WORD_TO_MEANING',
      questionCount: 10,
    };

    const result = createQuizSessionSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});

