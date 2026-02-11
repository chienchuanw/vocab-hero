import { z } from 'zod';

/**
 * Notification Type Enum
 * Matches Prisma NotificationType enum
 */
export const NotificationTypeEnum = z.enum([
  'GOAL_ACHIEVED',
  'STREAK_WARNING',
  'STUDY_REMINDER',
  'MILESTONE_REACHED',
  'FREEZE_USED',
]);

/**
 * Notification Priority Enum
 * Matches Prisma NotificationPriority enum
 */
export const NotificationPriorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH']);

/**
 * Create Notification Schema
 * Validates data for creating a new notification
 */
export const createNotificationSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  type: NotificationTypeEnum,
  title: z.string().min(1, 'Title is required'),
  message: z.string().min(1, 'Message is required'),
  priority: NotificationPriorityEnum.default('MEDIUM'),
});

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;

/**
 * Update Notification Schema
 * Validates data for updating a notification (mark as read/unread)
 */
export const updateNotificationSchema = z.object({
  isRead: z.boolean(),
});

export type UpdateNotificationInput = z.infer<typeof updateNotificationSchema>;

/**
 * Notification Query Schema
 * Validates query parameters for fetching notifications
 */
export const notificationQuerySchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  isRead: z.enum(['true', 'false']).optional(),
  type: NotificationTypeEnum.optional(),
});

export type NotificationQueryInput = z.infer<typeof notificationQuerySchema>;

