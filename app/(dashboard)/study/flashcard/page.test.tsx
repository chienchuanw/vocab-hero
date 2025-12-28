/**
 * @vitest-environment happy-dom
 */

import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/tests/test-utils';
import userEvent from '@testing-library/user-event';
import FlashcardStudyPage from './page';
import * as useVocabularyModule from '@/hooks/useVocabulary';

// Mock the hooks
vi.mock('@/hooks/useVocabulary');

const mockVocabulary = [
  {
    id: '1',
    word: '勉強',
    reading: 'べんきょう',
    meaning: 'study',
    notes: 'Common verb',
    mastery: 3,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    exampleSentences: [],
  },
  {
    id: '2',
    word: '食べる',
    reading: 'たべる',
    meaning: 'to eat',
    notes: null,
    mastery: 2,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    exampleSentences: [],
  },
];

describe('FlashcardStudyPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show loading state while fetching vocabulary', () => {
    vi.mocked(useVocabularyModule.useDueVocabulary).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any);

    render(<FlashcardStudyPage />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should show error message when fetch fails', () => {
    vi.mocked(useVocabularyModule.useDueVocabulary).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed to fetch'),
    } as any);

    render(<FlashcardStudyPage />);

    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });

  it('should show message when no vocabulary items are due', () => {
    vi.mocked(useVocabularyModule.useDueVocabulary).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as any);

    render(<FlashcardStudyPage />);

    expect(screen.getByText(/no vocabulary items due/i)).toBeInTheDocument();
  });

  it('should display first flashcard when vocabulary is loaded', () => {
    vi.mocked(useVocabularyModule.useDueVocabulary).mockReturnValue({
      data: mockVocabulary,
      isLoading: false,
      error: null,
    } as any);

    render(<FlashcardStudyPage />);

    expect(screen.getByText('勉強')).toBeInTheDocument();
    expect(screen.getByText('べんきょう')).toBeInTheDocument();
  });

  it('should show progress indicator', () => {
    vi.mocked(useVocabularyModule.useDueVocabulary).mockReturnValue({
      data: mockVocabulary,
      isLoading: false,
      error: null,
    } as any);

    render(<FlashcardStudyPage />);

    expect(screen.getByText(/1 \/ 2/i)).toBeInTheDocument();
  });

  it('should show rating buttons after flipping card', async () => {
    const user = userEvent.setup();
    vi.mocked(useVocabularyModule.useDueVocabulary).mockReturnValue({
      data: mockVocabulary,
      isLoading: false,
      error: null,
    } as any);

    render(<FlashcardStudyPage />);

    const flipButton = screen.getByRole('button', { name: /flip card/i });
    await user.click(flipButton);

    await waitFor(() => {
      expect(screen.getByText(/how well did you know this/i)).toBeInTheDocument();
    });
  });

  it('should move to next card after rating', async () => {
    const user = userEvent.setup();
    vi.mocked(useVocabularyModule.useDueVocabulary).mockReturnValue({
      data: mockVocabulary,
      isLoading: false,
      error: null,
    } as any);

    render(<FlashcardStudyPage />);

    // Flip card
    const flipButton = screen.getByRole('button', { name: /flip card/i });
    await user.click(flipButton);

    // Rate card
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /還可以/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /還可以/i }));

    // Should show next card
    await waitFor(() => {
      expect(screen.getByText('食べる')).toBeInTheDocument();
    });
  });
});
