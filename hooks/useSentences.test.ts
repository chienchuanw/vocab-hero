import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  useSentences,
  useCreateSentence,
  useDeleteSentence,
  useUpdateSentence,
} from './useSentences';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, ReactNode } from 'react';

// Mock fetch
global.fetch = vi.fn();

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const TestWrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);

  TestWrapper.displayName = 'TestWrapper';
  return TestWrapper;
};

describe('useSentences Hooks', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('useSentences', () => {
    it('should fetch and return sentences', async () => {
      const mockData = [
        { id: '1', japanese: 'こんにちは', english: 'Hello', createdAt: '2023-01-01' },
      ];

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockData }),
      });

      const { result } = renderHook(() => useSentences(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith('/api/sentences');
    });
  });

  describe('useCreateSentence', () => {
    it('should call POST endpoint', async () => {
      const newSentence = { japanese: '猫', english: 'Cat' };
      const mockResponse = { id: '2', ...newSentence };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockResponse }),
      });

      const { result } = renderHook(() => useCreateSentence(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync(newSentence);

      expect(global.fetch).toHaveBeenCalledWith('/api/sentences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSentence),
      });
    });
  });

  describe('useUpdateSentence', () => {
    it('should call PUT endpoint', async () => {
      const updateData = { id: '1', data: { english: 'Good afternoon' } };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const { result } = renderHook(() => useUpdateSentence(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync(updateData);

      expect(global.fetch).toHaveBeenCalledWith('/api/sentences/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData.data),
      });
    });
  });

  describe('useDeleteSentence', () => {
    it('should call DELETE endpoint', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const { result } = renderHook(() => useDeleteSentence(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync('1');

      expect(global.fetch).toHaveBeenCalledWith('/api/sentences/1', {
        method: 'DELETE',
      });
    });
  });
});
