import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/tests/test-utils';
import { SentenceFlashcard, SentenceCardData } from './SentenceFlashcard';

vi.mock('@/hooks/useSwipeGesture', () => ({
  useSwipeGesture: vi.fn(),
}));

const mockSentences: SentenceCardData[] = [
  {
    id: '1',
    japanese: 'これはペンです',
    english: 'This is a pen',
    notes: 'Basic sentence',
  },
  {
    id: '2',
    japanese: 'こんにちは',
    english: 'Hello',
    notes: null,
  },
  {
    id: '3',
    japanese: 'さようなら',
    english: 'Goodbye',
  },
];

describe('SentenceFlashcard', () => {
  it('renders Japanese text on front', () => {
    render(<SentenceFlashcard sentences={mockSentences} />);
    
    expect(screen.getByTestId('sentence-flashcard')).toBeInTheDocument();
    expect(screen.getByTestId('flashcard-front')).toBeInTheDocument();
    expect(screen.getByText('これはペンです')).toBeInTheDocument();
    expect(screen.getByText('This is a pen')).toBeInTheDocument();
  });

  it('flips to show English on click', async () => {
    render(<SentenceFlashcard sentences={mockSentences} />);
    
    const card = screen.getByTestId('flashcard-front').parentElement;
    expect(card).not.toHaveClass('rotate-y-180');
    
    fireEvent.click(card!);
    
    await waitFor(() => {
      expect(card).toHaveClass('rotate-y-180');
    });
  });

  it('space key triggers flip', async () => {
    render(<SentenceFlashcard sentences={mockSentences} />);
    
    const card = screen.getByTestId('flashcard-front').parentElement;
    expect(card).not.toHaveClass('rotate-y-180');
    
    fireEvent.keyDown(window, { key: ' ' });
    
    await waitFor(() => {
      expect(card).toHaveClass('rotate-y-180');
    });
    
    fireEvent.keyDown(window, { key: 'Spacebar' });
    
    await waitFor(() => {
      expect(card).not.toHaveClass('rotate-y-180');
    });
  });

  it('arrow keys navigate between cards', async () => {
    render(<SentenceFlashcard sentences={mockSentences} />);
    
    expect(screen.getByText('これはペンです')).toBeInTheDocument();
    
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    await waitFor(() => {
      expect(screen.getByText('こんにちは')).toBeInTheDocument();
    });
    
    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    await waitFor(() => {
      expect(screen.getByText('これはペンです')).toBeInTheDocument();
    });
  });

  it('shows card counter', async () => {
    render(<SentenceFlashcard sentences={mockSentences} />);
    
    expect(screen.getByTestId('flashcard-counter')).toHaveTextContent('1 / 3');
    
    fireEvent.click(screen.getByTestId('flashcard-next'));
    
    await waitFor(() => {
      expect(screen.getByTestId('flashcard-counter')).toHaveTextContent('2 / 3');
    });
  });

  it('previous/next buttons navigate', async () => {
    render(<SentenceFlashcard sentences={mockSentences} />);
    
    const nextBtn = screen.getByTestId('flashcard-next');
    const prevBtn = screen.getByTestId('flashcard-prev');
    
    expect(prevBtn).toBeDisabled();
    
    fireEvent.click(nextBtn);
    await waitFor(() => {
      expect(screen.getByText('こんにちは')).toBeInTheDocument();
    });
    
    expect(prevBtn).not.toBeDisabled();
    
    fireEvent.click(prevBtn);
    await waitFor(() => {
      expect(screen.getByText('これはペンです')).toBeInTheDocument();
    });
  });

  it('close button calls onClose', () => {
    const onClose = vi.fn();
    render(<SentenceFlashcard sentences={mockSentences} onClose={onClose} />);
    
    fireEvent.click(screen.getByTestId('flashcard-close'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('escape key calls onClose', () => {
    const onClose = vi.fn();
    render(<SentenceFlashcard sentences={mockSentences} onClose={onClose} />);
    
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('shows notes on back if available', async () => {
    render(<SentenceFlashcard sentences={mockSentences} />);
    
    expect(screen.getByText('Basic sentence')).toBeInTheDocument();
    
    fireEvent.click(screen.getByTestId('flashcard-next'));
    
    await waitFor(() => {
      expect(screen.queryByText('Basic sentence')).not.toBeInTheDocument();
    });
  });
  
  it('renders empty state when no sentences provided', () => {
    render(<SentenceFlashcard sentences={[]} />);
    expect(screen.getByText('No sentences to review')).toBeInTheDocument();
  });
});
