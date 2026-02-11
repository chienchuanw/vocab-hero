import { z } from 'zod';

/**
 * Validation schema for updating progress log
 */
export const updateProgressSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  date: z.string().datetime('Invalid date format'),
  wordsStudied: z.number().int().min(0).optional(),
  newWords: z.number().int().min(0).optional(),
  reviewWords: z.number().int().min(0).optional(),
  timeSpentMinutes: z.number().int().min(0).optional(),
  sessionsCompleted: z.number().int().min(0).optional(),
  correctAnswers: z.number().int().min(0).optional(),
  totalAnswers: z.number().int().min(0).optional(),
});

export type UpdateProgressInput = z.infer<typeof updateProgressSchema>;

