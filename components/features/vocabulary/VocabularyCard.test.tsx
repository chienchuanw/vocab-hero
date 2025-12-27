import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/tests/test-utils';
import userEvent from '@testing-library/user-event';
import { VocabularyCard } from './VocabularyCard';
import type { VocabularyItem } from '@/hooks/useVocabulary';

describe('VocabularyCard', () => {
  const mockVocabulary: VocabularyItem = {
    id: '1',
    word: '勉強',
    reading: 'べんきょう',
    meaning: 'study',
    notes: 'Common verb for studying',
    mastery: 3,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
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

  it('should display mastery badge', () => {
    render(<VocabularyCard vocabulary={mockVocabulary} />);
    expect(screen.getByText('Learning')).toBeInTheDocument();
  });

  it('should display correct mastery level for beginner', () => {
    const beginnerVocab = { ...mockVocabulary, mastery: 1 };
    render(<VocabularyCard vocabulary={beginnerVocab} />);
    expect(screen.getByText('Beginner')).toBeInTheDocument();
  });

  it('should display correct mastery level for proficient', () => {
    const proficientVocab = { ...mockVocabulary, mastery: 4 };
    render(<VocabularyCard vocabulary={proficientVocab} />);
    expect(screen.getByText('Proficient')).toBeInTheDocument();
  });

  it('should display correct mastery level for mastered', () => {
    const masteredVocab = { ...mockVocabulary, mastery: 5 };
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
});
