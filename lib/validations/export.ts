import { z } from 'zod';

/**
 * Export format enum
 * 匯出格式列舉：JSON 或 CSV
 */
export enum ExportFormat {
  JSON = 'json',
  CSV = 'csv',
}

/**
 * Export options validation schema
 * 匯出選項驗證 schema，用於驗證匯出 API 請求
 */
export const exportOptionsSchema = z.object({
  format: z.enum([ExportFormat.JSON, ExportFormat.CSV]),
  groupIds: z.array(z.string().cuid()).min(1, 'At least one group ID is required').optional(),
  dateFrom: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .optional(),
  dateTo: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .optional(),
});

/**
 * Type definitions derived from schemas
 */
export type ExportOptions = z.infer<typeof exportOptionsSchema>;
