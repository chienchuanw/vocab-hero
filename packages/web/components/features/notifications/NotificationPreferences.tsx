'use client';

import { useTranslations } from 'next-intl';
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
  const t = useTranslations('notifications.preferences');

  // 處理偏好設定變更
  const handleToggle = (key: keyof typeof preferences, value: boolean) => {
    onUpdate({ [key]: value });
  };

  return (
    <fieldset className="space-y-6" aria-label={t('title')}>
      <div>
        <h2 className="text-2xl font-bold mb-2">{t('title')}</h2>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>

      <div className="space-y-4">
        {/* Goal Achievement Notifications */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex-1">
            <Label htmlFor="goal-achievement" className="text-base font-medium">
              {t('goalAchievement')}
            </Label>
            <p className="text-sm text-muted-foreground mt-1">{t('goalAchievementDesc')}</p>
          </div>
          <Switch
            id="goal-achievement"
            checked={preferences.goalAchievementEnabled}
            onCheckedChange={(checked) => handleToggle('goalAchievementEnabled', checked)}
            disabled={isLoading}
            aria-label={t('goalAchievement')}
          />
        </div>

        {/* Streak Warning Notifications */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex-1">
            <Label htmlFor="streak-warning" className="text-base font-medium">
              {t('streakWarning')}
            </Label>
            <p className="text-sm text-muted-foreground mt-1">{t('streakWarningDesc')}</p>
          </div>
          <Switch
            id="streak-warning"
            checked={preferences.streakWarningEnabled}
            onCheckedChange={(checked) => handleToggle('streakWarningEnabled', checked)}
            disabled={isLoading}
            aria-label={t('streakWarning')}
          />
        </div>

        {/* Study Reminder Notifications */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex-1">
            <Label htmlFor="study-reminder" className="text-base font-medium">
              {t('studyReminder')}
            </Label>
            <p className="text-sm text-muted-foreground mt-1">{t('studyReminderDesc')}</p>
          </div>
          <Switch
            id="study-reminder"
            checked={preferences.studyReminderEnabled}
            onCheckedChange={(checked) => handleToggle('studyReminderEnabled', checked)}
            disabled={isLoading}
            aria-label={t('studyReminder')}
          />
        </div>

        {/* Milestone Notifications */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex-1">
            <Label htmlFor="milestone" className="text-base font-medium">
              {t('milestone')}
            </Label>
            <p className="text-sm text-muted-foreground mt-1">{t('milestoneDesc')}</p>
          </div>
          <Switch
            id="milestone"
            checked={preferences.milestoneEnabled}
            onCheckedChange={(checked) => handleToggle('milestoneEnabled', checked)}
            disabled={isLoading}
            aria-label={t('milestone')}
          />
        </div>

        {/* Push Notifications */}
        <div className="flex items-center justify-between p-4 border rounded-lg bg-primary/5">
          <div className="flex-1">
            <Label htmlFor="push-notifications" className="text-base font-medium">
              {t('pushNotifications')}
            </Label>
            <p className="text-sm text-muted-foreground mt-1">{t('pushNotificationsDesc')}</p>
          </div>
          <Switch
            id="push-notifications"
            checked={preferences.pushEnabled}
            onCheckedChange={(checked) => handleToggle('pushEnabled', checked)}
            disabled={isLoading}
            aria-label={t('pushNotifications')}
          />
        </div>
      </div>
    </fieldset>
  );
}
