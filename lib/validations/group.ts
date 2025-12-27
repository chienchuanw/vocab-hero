import { z } from 'zod';

/**
 * Vocabulary Group Validation Schema
 * Defines validation rules for vocabulary groups
 */
export const groupSchema = z.object({
  name: z
    .string()
    .min(1, 'Group name cannot be empty')
    .max(100, 'Group name cannot exceed 100 characters'),
  description: z
    .string()
    .max(500, 'Group description cannot exceed 500 characters')
    .optional()
    .nullable(),
});

/**
 * Group Creation Schema
 * Used for creating new groups
 */
export const createGroupSchema = groupSchema;

/**
 * Group Update Schema
 * Used for updating groups, all fields are optional (partial update)
 */
export const updateGroupSchema = groupSchema.partial();

/**
 * Group Vocabulary Management Schema
 * Used for managing vocabularies in a group (add/remove)
 */
export const manageGroupVocabularySchema = z.object({
  action: z.enum(['add', 'remove']),
  vocabularyIds: z
    .array(z.string().cuid())
    .min(1, 'At least one vocabulary ID is required')
    .max(100, 'Cannot operate on more than 100 vocabularies at once'),
});

/**
 * Type definitions derived from schemas
 */
export type GroupInput = z.infer<typeof groupSchema>;
export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type UpdateGroupInput = z.infer<typeof updateGroupSchema>;
export type ManageGroupVocabularyInput = z.infer<typeof manageGroupVocabularySchema>;
