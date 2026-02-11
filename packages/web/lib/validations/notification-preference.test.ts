import { describe, it, expect } from 'vitest';
import {
  updateNotificationPreferenceSchema,
  notificationPreferenceQuerySchema,
} from './notification-preference';

/**
 * Notification Preference Validation Tests
 * Tests for notification preference validation schemas
 */

describe('Notification Preference Validation Schemas', () => {
  describe('updateNotificationPreferenceSchema', () => {
    it('should validate updating goal achievement preference', () => {
      const validData = {
        goalAchievementEnabled: true,
      };

      const result = updateNotificationPreferenceSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate updating multiple preferences', () => {
      const validData = {
        goalAchievementEnabled: true,
        streakWarningEnabled: false,
        studyReminderEnabled: true,
        milestoneEnabled: false,
        pushEnabled: true,
      };

      const result = updateNotificationPreferenceSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject non-boolean values', () => {
      const invalidData = {
        goalAchievementEnabled: 'true',
      };

      const result = updateNotificationPreferenceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should allow partial updates', () => {
      const validData = {
        pushEnabled: true,
      };

      const result = updateNotificationPreferenceSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject empty object', () => {
      const invalidData = {};

      const result = updateNotificationPreferenceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('notificationPreferenceQuerySchema', () => {
    it('should validate query with userId', () => {
      const validQuery = {
        userId: 'user-123',
      };

      const result = notificationPreferenceQuerySchema.safeParse(validQuery);
      expect(result.success).toBe(true);
    });

    it('should reject missing userId', () => {
      const invalidQuery = {};

      const result = notificationPreferenceQuerySchema.safeParse(invalidQuery);
      expect(result.success).toBe(false);
    });

    it('should reject empty userId', () => {
      const invalidQuery = {
        userId: '',
      };

      const result = notificationPreferenceQuerySchema.safeParse(invalidQuery);
      expect(result.success).toBe(false);
    });
  });
});

