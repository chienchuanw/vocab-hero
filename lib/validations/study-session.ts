import { z } from 'zod';

/**
 * StudyMode Enum Schema
 * Defines available study modes
 */
export const studyModeSchema = z.enum([
  'FLASHCARD',
  'MULTIPLE_CHOICE',
  'SPELLING',
  'MATCHING',
  'RANDOM',
]);

/**
 * QuizType Enum Schema
 * Defines quiz question types
 */
export const quizTypeSchema = z.enum(['WORD_TO_MEANING', 'MEANING_TO_WORD', 'MIXED']);

/**
 * Study Session 建立驗證 Schema
 * For basic study sessions (flashcard mode)
 */
export const createStudySessionSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  mode: z.string().min(1, 'Study mode is required'),
});

/**
 * Quiz Session 建立驗證 Schema
 * For quiz-based study sessions with additional quiz-specific fields
 */
export const createQuizSessionSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  mode: z.string().min(1, 'Study mode is required'),
  studyMode: studyModeSchema,
  quizType: quizTypeSchema.optional(),
  questionCount: z.number().int().min(1).optional(),
  groupId: z.string().optional(),
});

/**
 * Study Session 更新驗證 Schema
 */
export const updateStudySessionSchema = z.object({
  cardsReviewed: z.number().int().min(0).optional(),
  correctAnswers: z.number().int().min(0).optional(),
  timeSpentMinutes: z.number().int().min(0).optional(),
  completedAt: z.string().datetime().optional(),
});
