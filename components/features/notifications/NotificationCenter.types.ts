/**
 * NotificationCenter Component Types
 * Type definitions for notification center component
 */

export interface Notification {
  id: string;
  userId: string;
  type: 'GOAL_ACHIEVED' | 'STREAK_WARNING' | 'STUDY_REMINDER' | 'MILESTONE_REACHED' | 'FREEZE_USED';
  title: string;
  message: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead: (notificationId: string) => void;
}

