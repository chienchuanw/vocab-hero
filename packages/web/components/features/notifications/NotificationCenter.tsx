'use client';

import { Bell, Target, AlertTriangle, Clock, Award, Snowflake } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { enUS, zhTW } from 'date-fns/locale';
import { useLocale, useTranslations } from 'next-intl';
import type { NotificationCenterProps, Notification } from './NotificationCenter.types';
import { cn } from '@/lib/utils';

/**
 * NotificationCenter Component
 * 顯示通知中心，包含通知清單、未讀數量、標記已讀功能
 */
export function NotificationCenter({ notifications, onMarkAsRead }: NotificationCenterProps) {
  const t = useTranslations('notifications.center');
  const locale = useLocale();

  // 計算未讀通知數量
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // 根據通知類型返回對應的圖示
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'GOAL_ACHIEVED':
        return <Target className="h-5 w-5 text-success" aria-label={t('goalAchievedAria')} />;
      case 'STREAK_WARNING':
        return <AlertTriangle className="h-5 w-5 text-warning" aria-label={t('streakWarningAria')} />;
      case 'STUDY_REMINDER':
        return <Clock className="h-5 w-5 text-info" aria-label={t('studyReminderAria')} />;
      case 'MILESTONE_REACHED':
        return <Award className="h-5 w-5 text-accent-foreground" aria-label={t('milestoneReachedAria')} />;
      case 'FREEZE_USED':
        return <Snowflake className="h-5 w-5 text-info" aria-label={t('freezeUsedAria')} />;
      default:
        return <Bell className="h-5 w-5 text-muted-foreground" aria-label={t('notificationAria')} />;
    }
  };

  // 根據優先級返回對應的邊框樣式
  const getPriorityBorderClass = (priority: Notification['priority']) => {
    switch (priority) {
      case 'HIGH':
        return 'border-destructive';
      case 'MEDIUM':
        return 'border-warning';
      case 'LOW':
        return 'border-border';
      default:
        return 'border-border';
    }
  };

  // 格式化通知時間
  const formatNotificationTime = (date: Date) => {
    const dateLocale = locale === 'zh-TW' ? zhTW : enUS;
    return formatDistanceToNow(date, { addSuffix: true, locale: dateLocale });
  };

  // 處理通知點擊
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
  };

  return (
    <section className="w-full max-w-2xl mx-auto" aria-label={t('title')}>
      {/* 標題和未讀數量 */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">{t('title')}</h2>
        {unreadCount > 0 && (
          <span
            className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-destructive-foreground bg-destructive rounded-full"
            aria-live="polite"
          >
            {unreadCount}
          </span>
        )}
      </div>

      {/* 通知清單 */}
      {notifications.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p>{t('empty')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <button
              type="button"
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  handleNotificationClick(notification);
                }
              }}
              className={cn(
                'w-full text-left p-4 rounded-lg border-l-4 cursor-pointer transition-colors',
                getPriorityBorderClass(notification.priority),
                notification.isRead ? 'bg-card' : 'bg-primary/5',
                'hover:shadow-md'
              )}
            >
              <div className="flex items-start gap-3">
                {/* 通知圖示 */}
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>

                {/* 通知內容 */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground">
                    {notification.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {formatNotificationTime(notification.createdAt)}
                  </p>
                </div>

                {/* 未讀指示器 */}
                {!notification.isRead && (
                  <div className="flex-shrink-0">
                    <span
                      className="h-2 w-2 bg-primary rounded-full block"
                      role="img"
                      aria-label={t('unreadAria')}
                    />
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
