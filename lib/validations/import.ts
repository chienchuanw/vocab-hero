import { z } from 'zod';

export enum DuplicateStrategy {
  SKIP = 'skip',
  OVERWRITE = 'overwrite',
  MERGE = 'merge',
}

export const importVocabularyItemSchema = z.object({
  word: z.string().min(1, 'Word cannot be empty').max(100),
  reading: z.string().min(1, 'Reading cannot be empty').max(200),
  meaning: z.string().min(1, 'Meaning cannot be empty').max(500),
  notes: z.string().max(1000).nullable().optional(),
  groups: z
    .array(
      z.object({
        id: z.string().optional(),
        name: z.string().min(1),
      })
    )
    .optional(),
  exampleSentences: z
    .array(
      z.object({
        sentence: z.string().min(1).max(500),
        reading: z.string().max(500).nullable().optional(),
        meaning: z.string().min(1).max(500),
        order: z.number().int().min(0),
      })
    )
    .optional(),
  reviewSchedule: z
    .object({
      easinessFactor: z.number().min(1.3).max(2.5),
      interval: z.number().int().min(0),
      repetitions: z.number().int().min(0),
      nextReviewDate: z.string().datetime(),
      lastReviewDate: z.string().datetime().nullable().optional(),
    })
    .nullable()
    .optional(),
});

export const importBatchSchema = z
  .array(importVocabularyItemSchema)
  .min(1, 'At least one item required');

export type ImportVocabularyItem = z.infer<typeof importVocabularyItemSchema>;
export type ImportBatch = z.infer<typeof importBatchSchema>;
