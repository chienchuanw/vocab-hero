import { describe, it, expect } from 'vitest';
import { exportOptionsSchema, ExportFormat } from './export';

describe('exportOptionsSchema', () => {
  describe('valid export options', () => {
    it('should validate JSON format', () => {
      const result = exportOptionsSchema.safeParse({
        format: 'json',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.format).toBe('json');
      }
    });

    it('should validate CSV format', () => {
      const result = exportOptionsSchema.safeParse({
        format: 'csv',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.format).toBe('csv');
      }
    });

    it('should accept optional groupIds filter', () => {
      const result = exportOptionsSchema.safeParse({
        format: 'json',
        groupIds: ['cltest1234567890abcdef', 'cltest0987654321fedcba'],
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.groupIds).toEqual(['cltest1234567890abcdef', 'cltest0987654321fedcba']);
      }
    });

    it('should accept optional dateFrom filter', () => {
      const result = exportOptionsSchema.safeParse({
        format: 'json',
        dateFrom: '2026-01-01',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.dateFrom).toBe('2026-01-01');
      }
    });

    it('should accept optional dateTo filter', () => {
      const result = exportOptionsSchema.safeParse({
        format: 'json',
        dateTo: '2026-12-31',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.dateTo).toBe('2026-12-31');
      }
    });

    it('should accept all filters together', () => {
      const result = exportOptionsSchema.safeParse({
        format: 'csv',
        groupIds: ['cltest1234567890abcdef', 'cltest0987654321fedcba', 'cltest1111111111111111'],
        dateFrom: '2026-01-01',
        dateTo: '2026-12-31',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.format).toBe('csv');
        expect(result.data.groupIds).toEqual([
          'cltest1234567890abcdef',
          'cltest0987654321fedcba',
          'cltest1111111111111111',
        ]);
        expect(result.data.dateFrom).toBe('2026-01-01');
        expect(result.data.dateTo).toBe('2026-12-31');
      }
    });

    it('should work with no optional filters', () => {
      const result = exportOptionsSchema.safeParse({
        format: 'json',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.groupIds).toBeUndefined();
        expect(result.data.dateFrom).toBeUndefined();
        expect(result.data.dateTo).toBeUndefined();
      }
    });
  });

  describe('invalid export options', () => {
    it('should reject missing format field', () => {
      const result = exportOptionsSchema.safeParse({});

      expect(result.success).toBe(false);
    });

    it('should reject invalid format value', () => {
      const result = exportOptionsSchema.safeParse({
        format: 'xml',
      });

      expect(result.success).toBe(false);
    });

    it('should reject invalid format type', () => {
      const result = exportOptionsSchema.safeParse({
        format: 123,
      });

      expect(result.success).toBe(false);
    });

    it('should reject invalid groupIds type', () => {
      const result = exportOptionsSchema.safeParse({
        format: 'json',
        groupIds: 'not-an-array',
      });

      expect(result.success).toBe(false);
    });

    it('should reject empty groupIds array', () => {
      const result = exportOptionsSchema.safeParse({
        format: 'json',
        groupIds: [],
      });

      expect(result.success).toBe(false);
    });

    it('should reject invalid date format in dateFrom', () => {
      const result = exportOptionsSchema.safeParse({
        format: 'json',
        dateFrom: 'not-a-date',
      });

      expect(result.success).toBe(false);
    });

    it('should reject invalid date format in dateTo', () => {
      const result = exportOptionsSchema.safeParse({
        format: 'json',
        dateTo: '01/01/2026',
      });

      expect(result.success).toBe(false);
    });
  });

  describe('ExportFormat enum', () => {
    it('should have JSON format', () => {
      expect(ExportFormat.JSON).toBe('json');
    });

    it('should have CSV format', () => {
      expect(ExportFormat.CSV).toBe('csv');
    });
  });
});
