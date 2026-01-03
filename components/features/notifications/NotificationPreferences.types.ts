/**
 * NotificationPreferences Component Types
 * Type definitions for notification preferences component
 */

export interface NotificationPreference {
  id: string;
  userId: string;
  goalAchievementEnabled: boolean;
  streakWarningEnabled: boolean;
  studyReminderEnabled: boolean;
  milestoneEnabled: boolean;
  pushEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationPreferencesProps {
  preferences: NotificationPreference;
  onUpdate: (updates: Partial<Omit<NotificationPreference, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>) => void;
  isLoading?: boolean;
}

