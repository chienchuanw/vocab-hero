import { z } from 'zod';

/**
 * Vocabulary Item Validation Schema
 * 定義單字項目的驗證規則
 */
export const vocabularySchema = z.object({
  word: z
    .string()
    .min(1, '單字不能為空')
    .max(100, '單字長度不能超過 100 字元'),
  reading: z
    .string()
    .min(1, '讀音不能為空')
    .max(200, '讀音長度不能超過 200 字元'),
  meaning: z
    .string()
    .min(1, '意思不能為空')
    .max(500, '意思長度不能超過 500 字元'),
  notes: z
    .string()
    .max(1000, '備註長度不能超過 1000 字元')
    .optional()
    .nullable(),
});

/**
 * Vocabulary Item Creation Schema
 * 用於新增單字時的驗證，可包含例句和群組關聯
 */
export const createVocabularySchema = vocabularySchema.extend({
  exampleSentences: z
    .array(
      z.object({
        sentence: z.string().min(1, '例句不能為空').max(500),
        reading: z.string().max(500).optional().nullable(),
        meaning: z.string().min(1, '例句翻譯不能為空').max(500),
        order: z.number().int().min(0).default(0),
      })
    )
    .optional(),
  groupIds: z.array(z.string().cuid()).optional(),
});

/**
 * Vocabulary Item Update Schema
 * 用於更新單字時的驗證，所有欄位都是可選的（partial update）
 */
export const updateVocabularySchema = vocabularySchema.partial();

/**
 * Type definitions derived from schemas
 */
export type VocabularyInput = z.infer<typeof vocabularySchema>;
export type CreateVocabularyInput = z.infer<typeof createVocabularySchema>;
export type UpdateVocabularyInput = z.infer<typeof updateVocabularySchema>;

