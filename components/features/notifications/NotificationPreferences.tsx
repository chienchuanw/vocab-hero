'use client';

import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import type { NotificationPreferencesProps } from './NotificationPreferences.types';

/**
 * NotificationPreferences Component
 * 顯示通知偏好設定，允許使用者自訂通知類型和頻率
 */
export function NotificationPreferences({
  preferences,
  onUpdate,
  isLoading = false,
}: NotificationPreferencesProps) {
  // 處理偏好設定變更
  const handleToggle = (key: keyof typeof preferences, value: boolean) => {
    onUpdate({ [key]: value });
  };

  return (
    <div className="space-y-6" role="group" aria-label="Notification preferences">
      <div>
        <h2 className="text-2xl font-bold mb-2">Notification Preferences</h2>
        <p className="text-gray-600">Customize which notifications you want to receive</p>
      </div>

      <div className="space-y-4">
        {/* Goal Achievement Notifications */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex-1">
            <Label htmlFor="goal-achievement" className="text-base font-medium">
              Goal Achievement Notifications
            </Label>
            <p className="text-sm text-gray-600 mt-1">
              Get notified when you complete your daily goal
            </p>
          </div>
          <Switch
            id="goal-achievement"
            checked={preferences.goalAchievementEnabled}
            onCheckedChange={(checked) => handleToggle('goalAchievementEnabled', checked)}
            disabled={isLoading}
            aria-label="Goal achievement notifications"
          />
        </div>

        {/* Streak Warning Notifications */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex-1">
            <Label htmlFor="streak-warning" className="text-base font-medium">
              Streak Warning Notifications
            </Label>
            <p className="text-sm text-gray-600 mt-1">
              Get notified when your streak is at risk
            </p>
          </div>
          <Switch
            id="streak-warning"
            checked={preferences.streakWarningEnabled}
            onCheckedChange={(checked) => handleToggle('streakWarningEnabled', checked)}
            disabled={isLoading}
            aria-label="Streak warning notifications"
          />
        </div>

        {/* Study Reminder Notifications */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex-1">
            <Label htmlFor="study-reminder" className="text-base font-medium">
              Study Reminder Notifications
            </Label>
            <p className="text-sm text-gray-600 mt-1">
              Receive daily reminders to study
            </p>
          </div>
          <Switch
            id="study-reminder"
            checked={preferences.studyReminderEnabled}
            onCheckedChange={(checked) => handleToggle('studyReminderEnabled', checked)}
            disabled={isLoading}
            aria-label="Study reminder notifications"
          />
        </div>

        {/* Milestone Notifications */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex-1">
            <Label htmlFor="milestone" className="text-base font-medium">
              Milestone Notifications
            </Label>
            <p className="text-sm text-gray-600 mt-1">
              Get notified when you reach important milestones
            </p>
          </div>
          <Switch
            id="milestone"
            checked={preferences.milestoneEnabled}
            onCheckedChange={(checked) => handleToggle('milestoneEnabled', checked)}
            disabled={isLoading}
            aria-label="Milestone notifications"
          />
        </div>

        {/* Push Notifications */}
        <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50">
          <div className="flex-1">
            <Label htmlFor="push-notifications" className="text-base font-medium">
              Push Notifications
            </Label>
            <p className="text-sm text-gray-600 mt-1">
              Enable browser push notifications for all alerts
            </p>
          </div>
          <Switch
            id="push-notifications"
            checked={preferences.pushEnabled}
            onCheckedChange={(checked) => handleToggle('pushEnabled', checked)}
            disabled={isLoading}
            aria-label="Push notifications"
          />
        </div>
      </div>
    </div>
  );
}

