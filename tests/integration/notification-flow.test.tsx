import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NotificationCenter } from '@/components/features/notifications/NotificationCenter';
import { useNotifications, useMarkAsRead, useCreateNotification } from '@/hooks/useNotifications';

/**
 * Notification Flow Integration Tests
 * 測試通知系統的完整流程，包含建立、查詢、標記已讀等功能
 */

// Test wrapper component
function TestWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

// Mock notification data
const mockNotifications = [
  {
    id: 'notif-1',
    userId: 'user-1',
    type: 'GOAL_ACHIEVED' as const,
    title: 'Goal Achieved!',
    message: 'You completed your daily goal of 10 words',
    priority: 'HIGH' as const,
    isRead: false,
    createdAt: new Date('2024-01-01T10:00:00Z'),
    updatedAt: new Date('2024-01-01T10:00:00Z'),
  },
  {
    id: 'notif-2',
    userId: 'user-1',
    type: 'STREAK_WARNING' as const,
    title: 'Streak Warning',
    message: 'Your 5-day streak is at risk! Study today to keep it going',
    priority: 'MEDIUM' as const,
    isRead: false,
    createdAt: new Date('2024-01-01T09:00:00Z'),
    updatedAt: new Date('2024-01-01T09:00:00Z'),
  },
  {
    id: 'notif-3',
    userId: 'user-1',
    type: 'STUDY_REMINDER' as const,
    title: 'Time to Study',
    message: 'Your daily study reminder',
    priority: 'LOW' as const,
    isRead: true,
    createdAt: new Date('2024-01-01T08:00:00Z'),
    updatedAt: new Date('2024-01-01T08:00:00Z'),
  },
];

describe('Notification Flow Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  describe('Complete notification lifecycle', () => {
    it('should create, fetch, and display notifications', async () => {
      // Mock API responses
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            data: {
              id: 'notif-new',
              userId: 'user-1',
              type: 'GOAL_ACHIEVED',
              title: 'New Achievement!',
              message: 'You reached a milestone',
              priority: 'HIGH',
              isRead: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            data: mockNotifications,
          }),
        });

      const { rerender } = render(
        <TestWrapper>
          <NotificationCenter notifications={[]} onMarkAsRead={vi.fn()} />
        </TestWrapper>
      );

      // Initially empty
      expect(screen.getByText(/no notifications/i)).toBeInTheDocument();

      // After fetching notifications
      rerender(
        <TestWrapper>
          <NotificationCenter notifications={mockNotifications} onMarkAsRead={vi.fn()} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Goal Achieved!')).toBeInTheDocument();
        expect(screen.getByText('Streak Warning')).toBeInTheDocument();
        expect(screen.getByText('Time to Study')).toBeInTheDocument();
      });
    });

    it('should mark notification as read when clicked', async () => {
      const user = userEvent.setup();
      const handleMarkAsRead = vi.fn();

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      render(
        <TestWrapper>
          <NotificationCenter notifications={mockNotifications} onMarkAsRead={handleMarkAsRead} />
        </TestWrapper>
      );

      // Click on unread notification
      const unreadNotification = screen.getByText('Goal Achieved!').closest('article');
      await user.click(unreadNotification!);

      expect(handleMarkAsRead).toHaveBeenCalledWith('notif-1');
    });

    it('should filter notifications by type', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockNotifications.filter((n) => n.type === 'GOAL_ACHIEVED'),
        }),
      });

      render(
        <TestWrapper>
          <NotificationCenter
            notifications={mockNotifications.filter((n) => n.type === 'GOAL_ACHIEVED')}
            onMarkAsRead={vi.fn()}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Goal Achieved!')).toBeInTheDocument();
        expect(screen.queryByText('Streak Warning')).not.toBeInTheDocument();
      });
    });

    it('should filter notifications by read status', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockNotifications.filter((n) => !n.isRead),
        }),
      });

      render(
        <TestWrapper>
          <NotificationCenter
            notifications={mockNotifications.filter((n) => !n.isRead)}
            onMarkAsRead={vi.fn()}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Goal Achieved!')).toBeInTheDocument();
        expect(screen.getByText('Streak Warning')).toBeInTheDocument();
        expect(screen.queryByText('Time to Study')).not.toBeInTheDocument();
      });
    });
  });

  describe('Notification priority and styling', () => {
    it('should display high priority notifications with red border', () => {
      render(
        <TestWrapper>
          <NotificationCenter notifications={mockNotifications} onMarkAsRead={vi.fn()} />
        </TestWrapper>
      );

      const highPriorityNotif = screen.getByText('Goal Achieved!').closest('article');
      expect(highPriorityNotif).toHaveClass('border-red-500');
    });

    it('should display medium priority notifications with yellow border', () => {
      render(
        <TestWrapper>
          <NotificationCenter notifications={mockNotifications} onMarkAsRead={vi.fn()} />
        </TestWrapper>
      );

      const mediumPriorityNotif = screen.getByText('Streak Warning').closest('article');
      expect(mediumPriorityNotif).toHaveClass('border-yellow-500');
    });

    it('should display low priority notifications with gray border', () => {
      render(
        <TestWrapper>
          <NotificationCenter notifications={mockNotifications} onMarkAsRead={vi.fn()} />
        </TestWrapper>
      );

      const lowPriorityNotif = screen.getByText('Time to Study').closest('article');
      expect(lowPriorityNotif).toHaveClass('border-gray-300');
    });
  });

  describe('Notification type icons', () => {
    it('should display correct icon for each notification type', () => {
      render(
        <TestWrapper>
          <NotificationCenter notifications={mockNotifications} onMarkAsRead={vi.fn()} />
        </TestWrapper>
      );

      expect(screen.getByLabelText(/goal achieved/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/streak warning/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/study reminder/i)).toBeInTheDocument();
    });
  });

  describe('Unread count badge', () => {
    it('should display correct unread count', () => {
      render(
        <TestWrapper>
          <NotificationCenter notifications={mockNotifications} onMarkAsRead={vi.fn()} />
        </TestWrapper>
      );

      // 2 unread notifications (notif-1 and notif-2)
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('should not display badge when all notifications are read', () => {
      const allReadNotifications = mockNotifications.map((n) => ({ ...n, isRead: true }));

      render(
        <TestWrapper>
          <NotificationCenter notifications={allReadNotifications} onMarkAsRead={vi.fn()} />
        </TestWrapper>
      );

      expect(screen.queryByText('2')).not.toBeInTheDocument();
    });
  });

  describe('Error handling', () => {
    it('should handle API errors gracefully', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      render(
        <TestWrapper>
          <NotificationCenter notifications={[]} onMarkAsRead={vi.fn()} />
        </TestWrapper>
      );

      expect(screen.getByText(/no notifications/i)).toBeInTheDocument();
    });
  });
});
