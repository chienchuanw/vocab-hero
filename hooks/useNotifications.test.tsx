import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useNotifications, useMarkAsRead, useCreateNotification } from './useNotifications';

/**
 * useNotifications Hook Tests
 * Tests for notification management hooks
 */

// Mock fetch
global.fetch = vi.fn();

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch notifications successfully', async () => {
    const mockNotifications = [
      {
        id: 'notif-1',
        userId: 'user-1',
        type: 'GOAL_ACHIEVED',
        title: 'Goal Achieved!',
        message: 'You completed your daily goal',
        priority: 'HIGH',
        isRead: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockNotifications }),
    });

    const { result } = renderHook(() => useNotifications('user-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockNotifications);
  });

  it('should handle fetch error', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ success: false, error: { message: 'Failed to fetch' } }),
    });

    const { result } = renderHook(() => useNotifications('user-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});

describe('useMarkAsRead', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should mark notification as read', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    const { result } = renderHook(() => useMarkAsRead(), {
      wrapper: createWrapper(),
    });

    result.current.mutate('notif-1');

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/notifications/notif-1',
      expect.objectContaining({
        method: 'PATCH',
      })
    );
  });
});

describe('useCreateNotification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create notification successfully', async () => {
    const mockNotification = {
      id: 'notif-1',
      userId: 'user-1',
      type: 'GOAL_ACHIEVED',
      title: 'Goal Achieved!',
      message: 'You completed your daily goal',
      priority: 'HIGH',
      isRead: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockNotification }),
    });

    const { result } = renderHook(() => useCreateNotification(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      userId: 'user-1',
      type: 'GOAL_ACHIEVED',
      title: 'Goal Achieved!',
      message: 'You completed your daily goal',
      priority: 'HIGH',
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockNotification);
  });
});

