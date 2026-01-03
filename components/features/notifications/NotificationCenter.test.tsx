import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificationCenter } from './NotificationCenter';

/**
 * NotificationCenter Component Tests
 * Tests for notification center UI component
 */

const mockNotifications = [
  {
    id: 'notif-1',
    userId: 'user-1',
    type: 'GOAL_ACHIEVED' as const,
    title: 'Goal Achieved!',
    message: 'You completed your daily goal',
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
    message: 'Study today to maintain your streak',
    priority: 'MEDIUM' as const,
    isRead: true,
    createdAt: new Date('2024-01-01T09:00:00Z'),
    updatedAt: new Date('2024-01-01T09:00:00Z'),
  },
];

describe('NotificationCenter', () => {
  it('should render notification center', () => {
    render(<NotificationCenter notifications={mockNotifications} onMarkAsRead={vi.fn()} />);

    expect(screen.getByText('Notifications')).toBeInTheDocument();
  });

  it('should display unread count badge', () => {
    render(<NotificationCenter notifications={mockNotifications} onMarkAsRead={vi.fn()} />);

    expect(screen.getByText('1')).toBeInTheDocument(); // 1 unread notification
  });

  it('should display all notifications', () => {
    render(<NotificationCenter notifications={mockNotifications} onMarkAsRead={vi.fn()} />);

    expect(screen.getByText('Goal Achieved!')).toBeInTheDocument();
    expect(screen.getByText('Streak Warning')).toBeInTheDocument();
  });

  it('should show empty state when no notifications', () => {
    render(<NotificationCenter notifications={[]} onMarkAsRead={vi.fn()} />);

    expect(screen.getByText(/no notifications/i)).toBeInTheDocument();
  });

  it('should call onMarkAsRead when clicking unread notification', async () => {
    const user = userEvent.setup();
    const handleMarkAsRead = vi.fn();

    render(
      <NotificationCenter notifications={mockNotifications} onMarkAsRead={handleMarkAsRead} />
    );

    const unreadNotification = screen.getByText('Goal Achieved!').closest('div');
    await user.click(unreadNotification!);

    expect(handleMarkAsRead).toHaveBeenCalledWith('notif-1');
  });

  it('should display notification priority with correct styling', () => {
    render(<NotificationCenter notifications={mockNotifications} onMarkAsRead={vi.fn()} />);

    const highPriorityNotif = screen.getByText('Goal Achieved!').closest('article');
    expect(highPriorityNotif).toHaveClass('border-red-500');
  });

  it('should display notification type icon', () => {
    render(<NotificationCenter notifications={mockNotifications} onMarkAsRead={vi.fn()} />);

    // Check for goal achievement icon
    const goalIcon = screen.getByLabelText(/goal achieved/i);
    expect(goalIcon).toBeInTheDocument();
  });

  it('should format notification time correctly', () => {
    render(<NotificationCenter notifications={mockNotifications} onMarkAsRead={vi.fn()} />);

    // Should show relative time in Chinese (大約 X 年前)
    const timeElements = screen.getAllByText(/大約/i);
    expect(timeElements.length).toBeGreaterThan(0);
  });

  it('should distinguish read and unread notifications visually', () => {
    render(<NotificationCenter notifications={mockNotifications} onMarkAsRead={vi.fn()} />);

    const unreadNotif = screen.getByText('Goal Achieved!').closest('article');
    const readNotif = screen.getByText('Streak Warning').closest('article');

    expect(unreadNotif).toHaveClass('bg-blue-50');
    expect(readNotif).not.toHaveClass('bg-blue-50');
  });

  it('should have proper accessibility attributes', () => {
    render(<NotificationCenter notifications={mockNotifications} onMarkAsRead={vi.fn()} />);

    expect(screen.getByRole('region', { name: /notifications/i })).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(2);
  });
});
