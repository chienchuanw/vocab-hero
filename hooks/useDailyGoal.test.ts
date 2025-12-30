/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import { useDailyGoal, useUpdateDailyGoal } from './useDailyGoal';

/**
 * useDailyGoal Hook Tests
 * Tests for daily goal data management hook
 */

// Mock fetch
global.fetch = vi.fn();

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('useDailyGoal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch daily goal for user', async () => {
    const mockGoal = {
      id: 'goal-1',
      userId: 'user-1',
      wordsPerDay: 10,
      minutesPerDay: 30,
      reminderTime: '10:00',
      pushEnabled: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockGoal }),
    });

    const { result } = renderHook(() => useDailyGoal('user-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockGoal);
  });

  it('should handle fetch error', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ success: false, error: { message: 'Not found' } }),
    });

    const { result } = renderHook(() => useDailyGoal('user-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });

  it('should not fetch when userId is undefined', () => {
    const { result } = renderHook(() => useDailyGoal(undefined), {
      wrapper: createWrapper(),
    });

    expect(result.current.isPending).toBe(true);
    expect(global.fetch).not.toHaveBeenCalled();
  });
});

describe('useUpdateDailyGoal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should update daily goal', async () => {
    const mockUpdatedGoal = {
      id: 'goal-1',
      userId: 'user-1',
      wordsPerDay: 20,
      minutesPerDay: 60,
      reminderTime: '14:00',
      pushEnabled: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockUpdatedGoal }),
    });

    const { result } = renderHook(() => useUpdateDailyGoal(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      userId: 'user-1',
      wordsPerDay: 20,
      minutesPerDay: 60,
      reminderTime: '14:00',
      pushEnabled: true,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual({ success: true, data: mockUpdatedGoal });
  });

  it('should handle update error', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        success: false,
        error: { message: 'Validation failed' },
      }),
    });

    const { result } = renderHook(() => useUpdateDailyGoal(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      userId: 'user-1',
      wordsPerDay: 0,
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});

