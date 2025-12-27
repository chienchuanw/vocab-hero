import { z } from 'zod';

/**
 * Example Sentence Validation Schema
 * 定義例句的驗證規則
 */
export const exampleSentenceSchema = z.object({
  sentence: z
    .string()
    .min(1, '例句不能為空')
    .max(500, '例句長度不能超過 500 字元'),
  reading: z
    .string()
    .max(500, '讀音長度不能超過 500 字元')
    .optional()
    .nullable(),
  meaning: z
    .string()
    .min(1, '例句翻譯不能為空')
    .max(500, '例句翻譯長度不能超過 500 字元'),
  order: z.number().int().min(0).default(0),
});

/**
 * Example Sentence Update Schema
 * 用於更新例句時的驗證，所有欄位都是可選的（partial update）
 */
export const updateExampleSentenceSchema = exampleSentenceSchema.partial();

/**
 * Type definitions derived from schemas
 */
export type ExampleSentenceInput = z.infer<typeof exampleSentenceSchema>;
export type UpdateExampleSentenceInput = z.infer<typeof updateExampleSentenceSchema>;

