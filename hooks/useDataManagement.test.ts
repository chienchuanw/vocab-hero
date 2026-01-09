import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useDeleteAllData,
  useBackup,
  useRestorePreview,
  useRestoreExecute,
} from './useDataManagement';
import { ExportFormat } from '@/lib/validations/export';
import { createElement, type ReactNode } from 'react';

global.fetch = vi.fn();
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = vi.fn();

const mockFetch = fetch as ReturnType<typeof vi.fn>;

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('useDeleteAllData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should delete all data with confirmation', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { message: 'All data deleted successfully' },
      }),
    } as Response);

    const { result } = renderHook(() => useDeleteAllData(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ confirm: 'DELETE ALL' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockFetch).toHaveBeenCalledWith('/api/data/delete-all', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirm: 'DELETE ALL' }),
    });
  });

  it('should handle delete error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        success: false,
        error: { message: 'Invalid confirmation phrase' },
      }),
    } as Response);

    const { result } = renderHook(() => useDeleteAllData(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ confirm: 'wrong phrase' });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe('Invalid confirmation phrase');
  });
});

describe('useBackup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = '';
  });

  it('should create and download backup file', async () => {
    const mockBackupData = {
      success: true,
      data: {
        version: '1.0',
        exportDate: '2026-01-09T00:00:00.000Z',
        itemCount: 2,
        items: [{ word: 'test', reading: 'test', meaning: 'test' }],
      },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockBackupData,
    } as Response);

    const { result } = renderHook(() => useBackup(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ format: ExportFormat.JSON });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockFetch).toHaveBeenCalledWith('/api/backup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ format: ExportFormat.JSON }),
    });
  });

  it('should handle backup error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        success: false,
        error: { message: 'Backup failed' },
      }),
    } as Response);

    const { result } = renderHook(() => useBackup(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ format: ExportFormat.JSON });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe('Backup failed');
  });
});

describe('useRestorePreview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should preview restore without writing to database', async () => {
    const mockPreview = {
      success: true,
      data: {
        totalItems: 2,
        duplicateCount: 0,
        newItems: [],
        duplicates: [],
      },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPreview,
    } as Response);

    const { result } = renderHook(() => useRestorePreview(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      format: ExportFormat.JSON,
      content: JSON.stringify({ items: [] }),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockPreview.data);
  });

  it('should handle preview error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        success: false,
        error: { message: 'Invalid JSON format' },
      }),
    } as Response);

    const { result } = renderHook(() => useRestorePreview(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ format: ExportFormat.JSON, content: 'invalid' });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe('Invalid JSON format');
  });
});

describe('useRestoreExecute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should execute restore with confirmation', async () => {
    const mockResult = {
      success: true,
      data: {
        created: 2,
        updated: 0,
        skipped: 0,
        total: 2,
      },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResult,
    } as Response);

    const { result } = renderHook(() => useRestoreExecute(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      format: ExportFormat.JSON,
      content: JSON.stringify({ items: [] }),
      strategy: 'skip',
      confirm: 'RESTORE',
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockResult.data);
  });

  it('should handle restore error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        success: false,
        error: { message: 'Invalid confirmation phrase' },
      }),
    } as Response);

    const { result } = renderHook(() => useRestoreExecute(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      format: ExportFormat.JSON,
      content: '{}',
      strategy: 'skip',
      confirm: 'wrong',
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe('Invalid confirmation phrase');
  });
});
