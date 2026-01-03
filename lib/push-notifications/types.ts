/**
 * Push Notification Types
 * Type definitions for push notification functionality
 */

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface NotificationPermissionState {
  permission: NotificationPermission;
  isSupported: boolean;
  isSubscribed: boolean;
}

export interface PushNotificationPayload {
  title: string;
  message: string;
  type: 'GOAL_ACHIEVED' | 'STREAK_WARNING' | 'STUDY_REMINDER' | 'MILESTONE_REACHED' | 'FREEZE_USED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, any>;
}

