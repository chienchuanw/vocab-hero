/**
 * @vitest-environment happy-dom
 */

import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/tests/test-utils';
import userEvent from '@testing-library/user-event';
import { VocabularyCard } from './VocabularyCard';
import type { VocabularyItem } from '@/hooks/useVocabulary';
import * as ttsModule from '@/lib/tts';

vi.mock('@/lib/tts', () => ({
  ttsEngine: {
    isSupported: vi.fn(() => true),
    speak: vi.fn(() => Promise.resolve()),
    stop: vi.fn(),
    getState: vi.fn(() => 'idle'),
  },
}));

describe('VocabularyCard', () => {
  const mockTTSEngine = ttsModule.ttsEngine;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockVocabulary: VocabularyItem = {
    id: '1',
    word: '勉強',
    reading: 'べんきょう',
    meaning: 'study',
    notes: 'Common verb for studying',
    mastery: 3,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    reviewSchedule: {
      easinessFactor: 2.5,
      interval: 6,
      repetitions: 3,
      nextReviewDate: '2024-01-07T00:00:00.000Z',
    },
  };

  it('should render vocabulary word', () => {
    render(<VocabularyCard vocabulary={mockVocabulary} />);
    expect(screen.getByText('勉強')).toBeInTheDocument();
  });

  it('should render reading', () => {
    render(<VocabularyCard vocabulary={mockVocabulary} />);
    expect(screen.getByText('べんきょう')).toBeInTheDocument();
  });

  it('should render meaning', () => {
    render(<VocabularyCard vocabulary={mockVocabulary} />);
    expect(screen.getByText('study')).toBeInTheDocument();
  });

  it('should render notes when provided', () => {
    render(<VocabularyCard vocabulary={mockVocabulary} />);
    expect(screen.getByText('Common verb for studying')).toBeInTheDocument();
  });

  it('should not render notes section when notes is null', () => {
    const vocabWithoutNotes = { ...mockVocabulary, notes: null };
    render(<VocabularyCard vocabulary={vocabWithoutNotes} />);
    expect(screen.queryByText('Common verb for studying')).not.toBeInTheDocument();
  });

  it('should display mastery indicator', () => {
    render(<VocabularyCard vocabulary={mockVocabulary} />);
    expect(screen.getByText('Familiar')).toBeInTheDocument();
  });

  it('should display NEW level for vocabulary without review schedule', () => {
    const newVocab = { ...mockVocabulary, reviewSchedule: null };
    render(<VocabularyCard vocabulary={newVocab} />);
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('should display LEARNING level for low repetitions', () => {
    const learningVocab = {
      ...mockVocabulary,
      reviewSchedule: {
        easinessFactor: 2.5,
        interval: 1,
        repetitions: 1,
        nextReviewDate: '2024-01-02T00:00:00.000Z',
      },
    };
    render(<VocabularyCard vocabulary={learningVocab} />);
    expect(screen.getByText('Learning')).toBeInTheDocument();
  });

  it('should display MASTERED level for high repetitions and interval', () => {
    const masteredVocab = {
      ...mockVocabulary,
      reviewSchedule: {
        easinessFactor: 2.5,
        interval: 30,
        repetitions: 10,
        nextReviewDate: '2024-02-01T00:00:00.000Z',
      },
    };
    render(<VocabularyCard vocabulary={masteredVocab} />);
    expect(screen.getByText('Mastered')).toBeInTheDocument();
  });

  it('should call onEdit when edit button is clicked', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    render(<VocabularyCard vocabulary={mockVocabulary} onEdit={onEdit} />);

    const editButton = screen.getByLabelText('Edit word');
    await user.click(editButton);

    expect(onEdit).toHaveBeenCalledWith(mockVocabulary);
    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it('should call onDelete when delete button is clicked', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(<VocabularyCard vocabulary={mockVocabulary} onDelete={onDelete} />);

    const deleteButton = screen.getByLabelText('Delete word');
    await user.click(deleteButton);

    expect(onDelete).toHaveBeenCalledWith(mockVocabulary);
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('should not render edit button when onEdit is not provided', () => {
    render(<VocabularyCard vocabulary={mockVocabulary} />);
    expect(screen.queryByLabelText('Edit word')).not.toBeInTheDocument();
  });

  it('should not render delete button when onDelete is not provided', () => {
    render(<VocabularyCard vocabulary={mockVocabulary} />);
    expect(screen.queryByLabelText('Delete word')).not.toBeInTheDocument();
  });

  it('should display formatted creation date', () => {
    render(<VocabularyCard vocabulary={mockVocabulary} />);
    // Date format is locale-dependent, just check it exists
    const dateElement = screen.getByText(/1\/1\/2024/);
    expect(dateElement).toBeInTheDocument();
  });

  describe('TTS Integration', () => {
    it('should render speaker button for pronunciation', () => {
      render(<VocabularyCard vocabulary={mockVocabulary} />);
      const speakerButton = screen.getByRole('button', { name: /play pronunciation/i });
      expect(speakerButton).toBeInTheDocument();
    });

    it('should call TTS engine when speaker button is clicked', async () => {
      const user = userEvent.setup();
      render(<VocabularyCard vocabulary={mockVocabulary} />);

      const speakerButton = screen.getByRole('button', { name: /play pronunciation/i });
      await user.click(speakerButton);

      expect(mockTTSEngine.speak).toHaveBeenCalledWith('勉強', undefined);
    });

    it('should not render speaker button when TTS is not supported', () => {
      vi.mocked(mockTTSEngine.isSupported).mockReturnValue(false);
      render(<VocabularyCard vocabulary={mockVocabulary} />);

      const speakerButton = screen.queryByRole('button', { name: /play pronunciation/i });
      expect(speakerButton).not.toBeInTheDocument();
    });
  });
});
