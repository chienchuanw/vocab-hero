import { z } from 'zod';

/**
 * Vocabulary Item Validation Schema
 * Defines validation rules for vocabulary items
 */
export const vocabularySchema = z.object({
  word: z.string().min(1, 'Word cannot be empty').max(100, 'Word cannot exceed 100 characters'),
  reading: z
    .string()
    .min(1, 'Reading cannot be empty')
    .max(200, 'Reading cannot exceed 200 characters'),
  meaning: z
    .string()
    .min(1, 'Meaning cannot be empty')
    .max(500, 'Meaning cannot exceed 500 characters'),
  notes: z.string().max(1000, 'Notes cannot exceed 1000 characters').optional().nullable(),
});

/**
 * Vocabulary Item Creation Schema
 * Used for creating new vocabulary items with optional example sentences and group associations
 */
export const createVocabularySchema = vocabularySchema.extend({
  exampleSentences: z
    .array(
      z.object({
        sentence: z.string().min(1, 'Example sentence cannot be empty').max(500),
        reading: z.string().max(500).optional().nullable(),
        meaning: z.string().min(1, 'Example sentence meaning cannot be empty').max(500),
        order: z.number().int().min(0).default(0),
      })
    )
    .optional(),
  groupIds: z.array(z.string().cuid()).optional(),
});

/**
 * Vocabulary Item Update Schema
 * Used for updating vocabulary items, all fields are optional (partial update)
 */
export const updateVocabularySchema = vocabularySchema.partial();

/**
 * Type definitions derived from schemas
 */
export type VocabularyInput = z.infer<typeof vocabularySchema>;
export type CreateVocabularyInput = z.infer<typeof createVocabularySchema>;
export type UpdateVocabularyInput = z.infer<typeof updateVocabularySchema>;
