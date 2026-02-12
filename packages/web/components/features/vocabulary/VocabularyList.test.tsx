/**
 * @vitest-environment happy-dom
 */

import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/tests/test-utils';
import userEvent from '@testing-library/user-event';
import { VocabularyList } from './VocabularyList';
import type { VocabularyItem } from '@/hooks/useVocabulary';
import type { UseInfiniteQueryResult, InfiniteData } from '@tanstack/react-query';

vi.mock('@dnd-kit/core', () => ({
  useDraggable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    isDragging: false,
  }),
}));

vi.mock('@/lib/tts', () => ({
  ttsEngine: {
    isSupported: vi.fn(() => true),
    speak: vi.fn(() => Promise.resolve()),
    stop: vi.fn(),
    getState: vi.fn(() => 'idle'),
  },
}));

interface VocabularyPageData {
  items: VocabularyItem[];
  nextCursor: string | null;
  hasNextPage: boolean;
}

const mockVocabulary: VocabularyItem = {
  id: '1',
  word: '勉強',
  reading: 'べんきょう',
  meaning: 'study',
  notes: null,
  mastery: 0,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  reviewSchedule: null,
};

const createMockQuery = (overrides = {}) =>
  ({
    data: {
      pages: [{ items: [], nextCursor: null, hasNextPage: false }],
      pageParams: [undefined],
    },
    fetchNextPage: vi.fn(),
    hasNextPage: false,
    isFetchingNextPage: false,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
    status: 'success' as const,
    fetchStatus: 'idle' as const,
    isSuccess: true,
    isPending: false,
    isRefetching: false,
    dataUpdatedAt: Date.now(),
    errorUpdatedAt: 0,
    failureCount: 0,
    failureReason: null,
    errorUpdateCount: 0,
    isFetched: true,
    isFetchedAfterMount: true,
    isFetching: false,
    isInitialLoading: false,
    isPaused: false,
    isPlaceholderData: false,
    isStale: false,
    isLoadingError: false,
    isRefetchError: false,
    hasPreviousPage: false,
    fetchPreviousPage: vi.fn(),
    isFetchingPreviousPage: false,
    ...overrides,
  }) as unknown as UseInfiniteQueryResult<InfiniteData<VocabularyPageData, unknown>, Error>;

describe('VocabularyList', () => {
  it('should render skeleton loading when isLoading is true', () => {
    const query = createMockQuery({
      isLoading: true,
      isPending: true,
      status: 'pending',
      isSuccess: false,
      isFetched: false,
      data: undefined,
    });
    render(<VocabularyList query={query} />);
    expect(screen.getByTestId('vocabulary-list-loading')).toBeInTheDocument();
  });

  it('should render empty state when no vocabulary items', () => {
    const query = createMockQuery();
    render(<VocabularyList query={query} />);
    expect(screen.getByTestId('vocabulary-list-empty')).toBeInTheDocument();
    expect(screen.getByText(/Add Word/i)).toBeInTheDocument();
  });

  it('should render error state when isError is true', () => {
    const query = createMockQuery({
      isError: true,
      status: 'error',
      isSuccess: false,
      error: new Error('Network error'),
      data: undefined,
    });
    render(<VocabularyList query={query} />);
    expect(screen.getByTestId('vocabulary-list-error')).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('should call refetch when retry button is clicked', async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();
    const query = createMockQuery({
      isError: true,
      status: 'error',
      isSuccess: false,
      error: new Error('Network error'),
      data: undefined,
      refetch,
    });
    render(<VocabularyList query={query} />);
    await user.click(screen.getByText('Retry'));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('should render vocabulary cards when data exists', () => {
    const query = createMockQuery({
      data: {
        pages: [{ items: [mockVocabulary], nextCursor: null, hasNextPage: false }],
        pageParams: [undefined],
      },
    });
    render(<VocabularyList query={query} />);
    expect(screen.getByTestId('vocabulary-card')).toBeInTheDocument();
  });
});
