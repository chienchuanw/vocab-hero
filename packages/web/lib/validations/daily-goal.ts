import { z } from 'zod';

/**
 * Time format validation regex (HH:mm)
 * Validates 24-hour format time strings
 */
const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

/**
 * Update Daily Goal Schema
 * Validates data for updating user's daily study goals
 */
export const updateDailyGoalSchema = z.object({
  wordsPerDay: z
    .number()
    .int()
    .min(1, 'Words per day must be at least 1')
    .max(100, 'Words per day cannot exceed 100')
    .optional(),
  minutesPerDay: z
    .number()
    .int()
    .min(5, 'Minutes per day must be at least 5')
    .max(120, 'Minutes per day cannot exceed 120')
    .optional(),
  reminderTime: z
    .string()
    .regex(TIME_REGEX, 'Reminder time must be in HH:mm format (00:00 to 23:59)')
    .optional(),
  pushEnabled: z.boolean().optional(),
});

/**
 * Daily Goal Response Schema
 * Validates the complete daily goal object returned from API
 */
export const dailyGoalResponseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  wordsPerDay: z.number().int(),
  minutesPerDay: z.number().int(),
  reminderTime: z.string(),
  pushEnabled: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * Type definitions derived from schemas
 */
export type UpdateDailyGoalInput = z.infer<typeof updateDailyGoalSchema>;
export type DailyGoalResponse = z.infer<typeof dailyGoalResponseSchema>;

