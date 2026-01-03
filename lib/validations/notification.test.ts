import { describe, it, expect } from 'vitest';
import {
  createNotificationSchema,
  updateNotificationSchema,
  notificationQuerySchema,
} from './notification';

/**
 * Notification Validation Tests
 * Tests for notification data validation schemas
 */

describe('Notification Validation Schemas', () => {
  describe('createNotificationSchema', () => {
    it('should validate valid notification creation data', () => {
      const validData = {
        userId: 'user-123',
        type: 'GOAL_ACHIEVED',
        title: 'Goal Achieved!',
        message: 'You have completed your daily goal',
        priority: 'HIGH',
      };

      const result = createNotificationSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject missing userId', () => {
      const invalidData = {
        type: 'GOAL_ACHIEVED',
        title: 'Goal Achieved!',
        message: 'You have completed your daily goal',
      };

      const result = createNotificationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid notification type', () => {
      const invalidData = {
        userId: 'user-123',
        type: 'INVALID_TYPE',
        title: 'Goal Achieved!',
        message: 'You have completed your daily goal',
      };

      const result = createNotificationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject empty title', () => {
      const invalidData = {
        userId: 'user-123',
        type: 'GOAL_ACHIEVED',
        title: '',
        message: 'You have completed your daily goal',
      };

      const result = createNotificationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject empty message', () => {
      const invalidData = {
        userId: 'user-123',
        type: 'GOAL_ACHIEVED',
        title: 'Goal Achieved!',
        message: '',
      };

      const result = createNotificationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should use default priority if not provided', () => {
      const validData = {
        userId: 'user-123',
        type: 'GOAL_ACHIEVED',
        title: 'Goal Achieved!',
        message: 'You have completed your daily goal',
      };

      const result = createNotificationSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.priority).toBe('MEDIUM');
      }
    });
  });

  describe('updateNotificationSchema', () => {
    it('should validate marking notification as read', () => {
      const validData = {
        isRead: true,
      };

      const result = updateNotificationSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate marking notification as unread', () => {
      const validData = {
        isRead: false,
      };

      const result = updateNotificationSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject non-boolean isRead value', () => {
      const invalidData = {
        isRead: 'true',
      };

      const result = updateNotificationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('notificationQuerySchema', () => {
    it('should validate query with userId', () => {
      const validQuery = {
        userId: 'user-123',
      };

      const result = notificationQuerySchema.safeParse(validQuery);
      expect(result.success).toBe(true);
    });

    it('should validate query with isRead filter', () => {
      const validQuery = {
        userId: 'user-123',
        isRead: 'false',
      };

      const result = notificationQuerySchema.safeParse(validQuery);
      expect(result.success).toBe(true);
    });

    it('should validate query with type filter', () => {
      const validQuery = {
        userId: 'user-123',
        type: 'GOAL_ACHIEVED',
      };

      const result = notificationQuerySchema.safeParse(validQuery);
      expect(result.success).toBe(true);
    });

    it('should reject missing userId', () => {
      const invalidQuery = {
        isRead: 'false',
      };

      const result = notificationQuerySchema.safeParse(invalidQuery);
      expect(result.success).toBe(false);
    });
  });
});

