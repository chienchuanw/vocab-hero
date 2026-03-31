'use client';

import { Bell, Target, AlertTriangle, Clock } from 'lucide-react';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('notifications.prompt');

  // 如果已經關閉提示，不顯示
  if (isDismissed) {
    return null;
  }

  return (
    <Card
      className="p-6 border-2 border-primary/20 bg-primary/5"
      role="dialog"
      aria-label={t('title')}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
            <Bell className="h-6 w-6 text-primary-foreground" aria-hidden="true" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <h2 className="text-xl font-bold text-foreground mb-2">{t('title')}</h2>
          <p className="text-foreground mb-4">{t('description')}</p>

          {/* Benefits List */}
          <ul className="space-y-3 mb-6">
            <li className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary flex-shrink-0" role="img" aria-hidden="true" />
              <span className="text-sm text-foreground">{t('benefitReminder')}</span>
            </li>
            <li className="flex items-center gap-3">
              <Target className="h-5 w-5 text-success flex-shrink-0" role="img" aria-hidden="true" />
              <span className="text-sm text-foreground">{t('benefitGoal')}</span>
            </li>
            <li className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0" role="img" aria-hidden="true" />
              <span className="text-sm text-foreground">{t('benefitStreak')}</span>
            </li>
          </ul>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={onPermissionGranted}
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isLoading ? t('requesting') : t('enable')}
            </Button>
            <Button
              onClick={onPermissionDenied}
              disabled={isLoading}
              variant="outline"
            >
              {t('maybeLater')}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
