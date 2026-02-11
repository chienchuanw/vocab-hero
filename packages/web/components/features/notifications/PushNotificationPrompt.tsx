'use client';

import { Bell, Target, AlertTriangle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { PushNotificationPromptProps } from './PushNotificationPrompt.types';

/**
 * PushNotificationPrompt Component
 * 顯示推送通知權限請求提示，說明啟用通知的好處
 */
export function PushNotificationPrompt({
  onPermissionGranted,
  onPermissionDenied,
  isLoading = false,
  isDismissed = false,
}: PushNotificationPromptProps) {
  // 如果已經關閉提示，不顯示
  if (isDismissed) {
    return null;
  }

  return (
    <Card
      className="p-6 border-2 border-blue-200 bg-blue-50"
      role="dialog"
      aria-label="Push notifications permission prompt"
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
            <Bell className="h-6 w-6 text-white" aria-hidden="true" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Enable Push Notifications
          </h2>
          <p className="text-gray-700 mb-4">
            Stay on track with your Japanese learning journey! Get timely reminders and
            celebrate your achievements.
          </p>

          {/* Benefits List */}
          <ul className="space-y-3 mb-6">
            <li className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-blue-600 flex-shrink-0" role="img" aria-hidden="true" />
              <span className="text-sm text-gray-700">
                Daily study reminders to maintain your streak
              </span>
            </li>
            <li className="flex items-center gap-3">
              <Target className="h-5 w-5 text-green-600 flex-shrink-0" role="img" aria-hidden="true" />
              <span className="text-sm text-gray-700">
                Goal achievement alerts when you complete your daily target
              </span>
            </li>
            <li className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0" role="img" aria-hidden="true" />
              <span className="text-sm text-gray-700">
                Streak warnings to help you stay consistent
              </span>
            </li>
          </ul>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={onPermissionGranted}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? 'Requesting...' : 'Enable Notifications'}
            </Button>
            <Button
              onClick={onPermissionDenied}
              disabled={isLoading}
              variant="outline"
            >
              Maybe Later
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

