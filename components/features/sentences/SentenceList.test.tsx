import { render, screen, fireEvent, waitFor } from '@/tests/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SentenceList } from './SentenceList';
import * as useSentencesHook from '@/hooks/useSentences';

vi.mock('@/hooks/useSentences', () => ({
  useSentences: vi.fn(),
  useDeleteSentence: vi.fn(),
}));

describe('SentenceList', () => {
  const mockOnEdit = vi.fn();
  const mockOnStudy = vi.fn();
  const mockDeleteMutate = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    (useSentencesHook.useDeleteSentence as any).mockReturnValue({
      mutateAsync: mockDeleteMutate,
    });
  });

  it('renders loading state', () => {
    (useSentencesHook.useSentences as any).mockReturnValue({
      isLoading: true,
      data: undefined,
    });

    render(<SentenceList />);
    expect(screen.getByTestId('sentence-list-loading')).toBeInTheDocument();
  });

  it('renders error state', () => {
    (useSentencesHook.useSentences as any).mockReturnValue({
      isLoading: false,
      isError: true,
      data: undefined,
      refetch: vi.fn(),
    });

    render(<SentenceList />);
    expect(screen.getByText('Failed to load sentences')).toBeInTheDocument();
  });

  it('renders empty state', () => {
    (useSentencesHook.useSentences as any).mockReturnValue({
      isLoading: false,
      isError: false,
      data: [],
    });

    render(<SentenceList />);
    expect(screen.getByTestId('sentence-empty')).toBeInTheDocument();
    expect(screen.getByText('No sentence cards yet')).toBeInTheDocument();
  });

  it('renders list of sentences', () => {
    const mockSentences = [
      {
        id: '1',
        japanese: 'こんにちは',
        english: 'Hello',
        notes: 'Greeting',
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01',
      },
      {
        id: '2',
        japanese: 'さようなら',
        english: 'Goodbye',
        createdAt: '2023-01-02',
        updatedAt: '2023-01-02',
      },
    ];

    (useSentencesHook.useSentences as any).mockReturnValue({
      isLoading: false,
      isError: false,
      data: mockSentences,
    });

    render(<SentenceList onEdit={mockOnEdit} onStudy={mockOnStudy} />);

    expect(screen.getByTestId('sentence-list')).toBeInTheDocument();
    expect(screen.getAllByTestId('sentence-item')).toHaveLength(2);
    expect(screen.getByText('こんにちは')).toBeInTheDocument();
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('Greeting')).toBeInTheDocument();
    expect(screen.getByText('さようなら')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    const mockSentence = {
      id: '1',
      japanese: 'テスト',
      english: 'Test',
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01',
    };

    (useSentencesHook.useSentences as any).mockReturnValue({
      isLoading: false,
      isError: false,
      data: [mockSentence],
    });

    render(<SentenceList onEdit={mockOnEdit} />);

    const editButton = screen.getByTestId('sentence-edit');
    fireEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith(mockSentence);
  });

  it('calls onStudy when study button is clicked', () => {
    (useSentencesHook.useSentences as any).mockReturnValue({
      isLoading: false,
      isError: false,
      data: [{ id: '1', japanese: 'A', english: 'B', createdAt: '2023-01-01' }],
    });

    render(<SentenceList onStudy={mockOnStudy} />);

    const studyButton = screen.getByTestId('sentence-study');
    fireEvent.click(studyButton);

    expect(mockOnStudy).toHaveBeenCalled();
  });

  it('handles delete action', async () => {
    const mockSentence = {
      id: '1',
      japanese: '削除テスト',
      english: 'Delete Test',
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01',
    };

    (useSentencesHook.useSentences as any).mockReturnValue({
      isLoading: false,
      isError: false,
      data: [mockSentence],
    });

    render(<SentenceList />);

    const deleteButton = screen.getByTestId('sentence-delete');
    fireEvent.click(deleteButton);

    const confirmButton = screen.getByText('Delete', { selector: 'button' });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockDeleteMutate).toHaveBeenCalledWith('1');
    });
  });
});
