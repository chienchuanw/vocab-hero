/**
 * PushNotificationPrompt Component Types
 * Type definitions for push notification permission prompt component
 */

export interface PushNotificationPromptProps {
  onPermissionGranted: () => void;
  onPermissionDenied: () => void;
  isLoading?: boolean;
  isDismissed?: boolean;
}

