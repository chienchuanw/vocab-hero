/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import { useUserSettings, useUpdateUserSettings } from './useUserSettings';

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

describe('useUserSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch user settings', async () => {
    const mockSettings = {
      id: 'settings-1',
      userId: 'user-1',
      theme: 'DARK',
      ttsSpeed: 1.25,
      ttsVolume: 0.8,
      ttsPitch: 1.0,
      ttsVoice: null,
      cardsPerSession: 30,
      defaultStudyMode: 'FLASHCARD',
      autoAdvance: false,
      showReading: true,
      language: 'en',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockSettings }),
    });

    const { result } = renderHook(() => useUserSettings('user-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockSettings);
  });

  it('should handle fetch error', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ success: false, error: { message: 'Not found' } }),
    });

    const { result } = renderHook(() => useUserSettings('user-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });

  it('should not fetch when userId is undefined', () => {
    const { result } = renderHook(() => useUserSettings(undefined), {
      wrapper: createWrapper(),
    });

    expect(result.current.isPending).toBe(true);
    expect(global.fetch).not.toHaveBeenCalled();
  });
});

describe('useUpdateUserSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should update user settings', async () => {
    const mockUpdatedSettings = {
      id: 'settings-1',
      userId: 'user-1',
      theme: 'LIGHT',
      ttsSpeed: 1.5,
      ttsVolume: 0.7,
      ttsPitch: 1.2,
      ttsVoice: 'Google Japanese',
      cardsPerSession: 40,
      defaultStudyMode: 'SPELLING',
      autoAdvance: true,
      showReading: false,
      language: 'zh-TW',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockUpdatedSettings }),
    });

    const { result } = renderHook(() => useUpdateUserSettings(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      userId: 'user-1',
      theme: 'LIGHT',
      ttsSpeed: 1.5,
      cardsPerSession: 40,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual({ success: true, data: mockUpdatedSettings });
  });

  it('should handle update error', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        success: false,
        error: { message: 'Validation failed' },
      }),
    });

    const { result } = renderHook(() => useUpdateUserSettings(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      userId: 'user-1',
      ttsSpeed: 100,
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });

  it('should update partial settings', async () => {
    const mockUpdatedSettings = {
      id: 'settings-1',
      userId: 'user-1',
      theme: 'SYSTEM',
      ttsSpeed: 1.0,
      ttsVolume: 1.0,
      ttsPitch: 1.0,
      ttsVoice: null,
      cardsPerSession: 25,
      defaultStudyMode: 'FLASHCARD',
      autoAdvance: false,
      showReading: true,
      language: 'en',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockUpdatedSettings }),
    });

    const { result } = renderHook(() => useUpdateUserSettings(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      userId: 'user-1',
      cardsPerSession: 25,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'user-1', cardsPerSession: 25 }),
    });
  });
});
