import { z } from 'zod';

/**
 * Study Session 建立驗證 Schema
 */
export const createStudySessionSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  mode: z.string().min(1, 'Study mode is required'),
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

