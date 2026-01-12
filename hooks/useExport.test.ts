import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ExportFormat } from '@/lib/validations/export';
import { createElement } from 'react';
import type { ReactNode } from 'react';

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import { useExportVocabulary } from './useExport';
import { toast } from 'sonner';

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

function createWrapper() {
  const queryClient = createQueryClient();
  const TestWrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
  TestWrapper.displayName = 'TestWrapper';
  return TestWrapper;
}

global.fetch = vi.fn();
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = vi.fn();

describe('useExportVocabulary', () => {
  let mockLink: HTMLAnchorElement;

  beforeEach(() => {
    vi.clearAllMocks();

    mockLink = document.createElement('a');
    vi.spyOn(document, 'createElement').mockReturnValue(mockLink);
    vi.spyOn(mockLink, 'click');
    vi.spyOn(document.body, 'appendChild');
    vi.spyOn(document.body, 'removeChild');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('JSON export', () => {
    it('should export vocabulary as JSON successfully', async () => {
      const mockJsonData = {
        success: true,
        data: {
          version: '1.0',
          exportDate: '2026-01-06',
          itemCount: 2,
          items: [],
        },
      };

      (global.fetch as unknown).mockResolvedValueOnce({
        ok: true,
        json: async () => mockJsonData,
      });

      const { result } = renderHook(() => useExportVocabulary(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ format: ExportFormat.JSON });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(global.fetch).toHaveBeenCalledWith('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format: ExportFormat.JSON }),
      });

      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(mockLink.download).toContain('vocab-hero-export');
      expect(mockLink.download).toContain('.json');
      expect(mockLink.click).toHaveBeenCalled();
      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
      expect(toast.success).toHaveBeenCalledWith('Export successful!');
    });

    it('should include filters in JSON export request', async () => {
      (global.fetch as unknown).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: {} }),
      });

      const { result } = renderHook(() => useExportVocabulary(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        format: ExportFormat.JSON,
        groupIds: ['group1', 'group2'],
        dateFrom: '2026-01-01',
        dateTo: '2026-12-31',
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(global.fetch).toHaveBeenCalledWith('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format: ExportFormat.JSON,
          groupIds: ['group1', 'group2'],
          dateFrom: '2026-01-01',
          dateTo: '2026-12-31',
        }),
      });
    });
  });

  describe('CSV export', () => {
    it('should export vocabulary as CSV successfully', async () => {
      const csvText = '\uFEFFword,reading,meaning\nこんにちは,konnichiwa,Hello';

      (global.fetch as unknown).mockResolvedValueOnce({
        ok: true,
        text: async () => csvText,
        headers: {
          get: (header: string) => {
            if (header === 'Content-Type') return 'text/csv';
            return null;
          },
        },
      });

      const { result } = renderHook(() => useExportVocabulary(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ format: ExportFormat.CSV });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockLink.download).toContain('.csv');
      expect(toast.success).toHaveBeenCalledWith('Export successful!');
    });

    it('should include filters in CSV export request', async () => {
      (global.fetch as unknown).mockResolvedValueOnce({
        ok: true,
        text: async () => 'csv data',
        headers: {
          get: () => 'text/csv',
        },
      });

      const { result } = renderHook(() => useExportVocabulary(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        format: ExportFormat.CSV,
        groupIds: ['group1'],
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(global.fetch).toHaveBeenCalledWith('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format: ExportFormat.CSV,
          groupIds: ['group1'],
        }),
      });
    });
  });

  describe('error handling', () => {
    it('should handle network errors', async () => {
      (global.fetch as unknown).mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useExportVocabulary(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ format: ExportFormat.JSON });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(toast.error).toHaveBeenCalledWith('Network error');
    });

    it('should handle API errors', async () => {
      (global.fetch as unknown).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
          error: { message: 'Validation error' },
        }),
      });

      const { result } = renderHook(() => useExportVocabulary(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ format: ExportFormat.JSON });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(toast.error).toHaveBeenCalledWith('Validation error');
    });
  });

  describe('loading states', () => {
    it('should track loading state during export', async () => {
      (global.fetch as unknown).mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({ success: true, data: {} }),
                }),
              100
            )
          )
      );

      const { result } = renderHook(() => useExportVocabulary(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isPending).toBe(false);

      result.current.mutate({ format: ExportFormat.JSON });

      await waitFor(() => {
        expect(result.current.isPending).toBe(true);
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.isPending).toBe(false);
    });
  });

  describe('cleanup', () => {
    it('should cleanup blob URL after download', async () => {
      (global.fetch as unknown).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: {} }),
      });

      const { result } = renderHook(() => useExportVocabulary(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ format: ExportFormat.JSON });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });
  });
});
