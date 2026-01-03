import { z } from 'zod';

/**
 * Update Notification Preference Schema
 * Validates data for updating notification preferences
 * At least one field must be provided
 */
export const updateNotificationPreferenceSchema = z
  .object({
    goalAchievementEnabled: z.boolean().optional(),
    streakWarningEnabled: z.boolean().optional(),
    studyReminderEnabled: z.boolean().optional(),
    milestoneEnabled: z.boolean().optional(),
    pushEnabled: z.boolean().optional(),
  })
  .refine(
    (data) => {
      // At least one field must be provided
      return Object.keys(data).length > 0;
    },
    {
      message: 'At least one preference field must be provided',
    }
  );

export type UpdateNotificationPreferenceInput = z.infer<
  typeof updateNotificationPreferenceSchema
>;

/**
 * Notification Preference Query Schema
 * Validates query parameters for fetching notification preferences
 */
export const notificationPreferenceQuerySchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
});

export type NotificationPreferenceQueryInput = z.infer<
  typeof notificationPreferenceQuerySchema
>;

