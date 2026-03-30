import { z } from 'zod';

/**
 * Sentence Card Validation Schema
 * Defines validation rules for sentence cards
 */
export const sentenceSchema = z.object({
  japanese: z.string().min(1, 'Japanese text cannot be empty').max(1000),
  english: z.string().min(1, 'English text cannot be empty').max(1000),
  notes: z.string().max(2000).optional().nullable(),
  imageUrl: z
    .string()
    .max(500)
    .regex(/^\/uploads\/sentences\//, 'Image URL must start with /uploads/sentences/')
    .optional()
    .nullable(),
});

/**
 * Sentence Card Creation Schema
 * Used for creating new sentence cards
 */
export const createSentenceSchema = sentenceSchema;

/**
 * Sentence Card Update Schema
 * Used for updating sentence cards, all fields are optional (partial update)
 */
export const updateSentenceSchema = sentenceSchema.partial();

/**
 * Type definitions derived from schemas
 */
export type SentenceInput = z.infer<typeof sentenceSchema>;
export type CreateSentenceInput = z.infer<typeof createSentenceSchema>;
export type UpdateSentenceInput = z.infer<typeof updateSentenceSchema>;
