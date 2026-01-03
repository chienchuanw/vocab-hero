'use client';

import { Bell, Target, AlertTriangle, Clock, Award, Snowflake } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import type { NotificationCenterProps, Notification } from './NotificationCenter.types';
import { cn } from '@/lib/utils';

/**
 * NotificationCenter Component
 * 顯示通知中心，包含通知清單、未讀數量、標記已讀功能
 */
export function NotificationCenter({ notifications, onMarkAsRead }: NotificationCenterProps) {
  // 計算未讀通知數量
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // 根據通知類型返回對應的圖示
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'GOAL_ACHIEVED':
        return <Target className="h-5 w-5 text-green-600" aria-label="Goal achieved notification" />;
      case 'STREAK_WARNING':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" aria-label="Streak warning notification" />;
      case 'STUDY_REMINDER':
        return <Clock className="h-5 w-5 text-blue-600" aria-label="Study reminder notification" />;
      case 'MILESTONE_REACHED':
        return <Award className="h-5 w-5 text-purple-600" aria-label="Milestone reached notification" />;
      case 'FREEZE_USED':
        return <Snowflake className="h-5 w-5 text-cyan-600" aria-label="Freeze used notification" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" aria-label="Notification" />;
    }
  };

  // 根據優先級返回對應的邊框樣式
  const getPriorityBorderClass = (priority: Notification['priority']) => {
    switch (priority) {
      case 'HIGH':
        return 'border-red-500';
      case 'MEDIUM':
        return 'border-yellow-500';
      case 'LOW':
        return 'border-gray-300';
      default:
        return 'border-gray-300';
    }
  };

  // 格式化通知時間
  const formatNotificationTime = (date: Date) => {
    return formatDistanceToNow(date, { addSuffix: true, locale: zhTW });
  };

  // 處理通知點擊
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto" role="region" aria-label="Notifications">
      {/* 標題和未讀數量 */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Notifications</h2>
        {unreadCount > 0 && (
          <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </div>

      {/* 通知清單 */}
      {notifications.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Bell className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p>No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <article
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={cn(
                'p-4 rounded-lg border-l-4 cursor-pointer transition-colors',
                getPriorityBorderClass(notification.priority),
                notification.isRead ? 'bg-white' : 'bg-blue-50',
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
                  <h3 className="text-sm font-semibold text-gray-900">
                    {notification.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {formatNotificationTime(notification.createdAt)}
                  </p>
                </div>

                {/* 未讀指示器 */}
                {!notification.isRead && (
                  <div className="flex-shrink-0">
                    <div className="h-2 w-2 bg-blue-600 rounded-full" aria-label="Unread" />
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

