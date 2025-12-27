import { z } from 'zod';

/**
 * Vocabulary Group Validation Schema
 * 定義單字群組的驗證規則
 */
export const groupSchema = z.object({
  name: z.string().min(1, '群組名稱不能為空').max(100, '群組名稱長度不能超過 100 字元'),
  description: z.string().max(500, '群組描述長度不能超過 500 字元').optional().nullable(),
});

/**
 * Group Update Schema
 * 用於更新群組時的驗證，所有欄位都是可選的（partial update）
 */
export const updateGroupSchema = groupSchema.partial();

/**
 * Group Vocabulary Management Schema
 * 用於管理群組中的單字（新增/移除）
 */
export const manageGroupVocabularySchema = z.object({
  action: z.enum(['add', 'remove']),
  vocabularyIds: z
    .array(z.string().cuid())
    .min(1, '至少需要一個單字 ID')
    .max(100, '一次最多操作 100 個單字'),
});

/**
 * Type definitions derived from schemas
 */
export type GroupInput = z.infer<typeof groupSchema>;
export type UpdateGroupInput = z.infer<typeof updateGroupSchema>;
export type ManageGroupVocabularyInput = z.infer<typeof manageGroupVocabularySchema>;
