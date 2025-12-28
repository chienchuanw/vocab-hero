/**
 * @vitest-environment happy-dom
 */

import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/tests/test-utils';
import userEvent from '@testing-library/user-event';
import { Flashcard } from './Flashcard';
import type { VocabularyItem } from '@/hooks/useVocabulary';

describe('Flashcard', () => {
  const mockVocabulary: VocabularyItem = {
    id: '1',
    word: '勉強',
    reading: 'べんきょう',
    meaning: 'study',
    notes: 'Common verb',
    mastery: 3,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    exampleSentences: [
      {
        id: '1',
        sentence: '私は毎日勉強します',
        reading: 'わたしはまいにちべんきょうします',
        meaning: 'I study every day',
        order: 0,
      },
    ],
  };

  it('should render front side by default', () => {
    const { container } = render(<Flashcard vocabulary={mockVocabulary} />);

    expect(screen.getByText('勉強')).toBeInTheDocument();
    expect(screen.getByText('べんきょう')).toBeInTheDocument();

    // Both sides are in DOM for flip animation, check transform state
    const cardInner = container.querySelector('.flashcard-inner');
    expect(cardInner).toHaveStyle({ transform: 'rotateY(0deg)' });
  });

  it('should flip to back side when clicked', async () => {
    const user = userEvent.setup();
    const { container } = render(<Flashcard vocabulary={mockVocabulary} />);

    const card = screen.getByRole('button', { name: /flip card/i });
    await user.click(card);

    // Check transform state after flip
    const cardInner = container.querySelector('.flashcard-inner');
    expect(cardInner).toHaveStyle({ transform: 'rotateY(180deg)' });

    // Both sides are in DOM, verify content exists
    expect(screen.getByText('study')).toBeInTheDocument();
    expect(screen.getByText('私は毎日勉強します')).toBeInTheDocument();
  });

  it('should flip back to front when clicked again', async () => {
    const user = userEvent.setup();
    const { container } = render(<Flashcard vocabulary={mockVocabulary} />);

    const card = screen.getByRole('button', { name: /flip card/i });
    await user.click(card);
    await user.click(card);

    // Check transform state after flipping back
    const cardInner = container.querySelector('.flashcard-inner');
    expect(cardInner).toHaveStyle({ transform: 'rotateY(0deg)' });
    expect(screen.getByText('勉強')).toBeInTheDocument();
  });

  it('should flip when spacebar is pressed', async () => {
    const user = userEvent.setup();
    render(<Flashcard vocabulary={mockVocabulary} />);

    await user.keyboard(' ');

    expect(screen.getByText('study')).toBeInTheDocument();
  });

  it('should show no example sentences message when none provided', async () => {
    const user = userEvent.setup();
    const vocabWithoutExamples = { ...mockVocabulary, exampleSentences: [] };
    render(<Flashcard vocabulary={vocabWithoutExamples} />);

    const card = screen.getByRole('button', { name: /flip card/i });
    await user.click(card);

    expect(screen.getByText(/no example sentences/i)).toBeInTheDocument();
  });

  it('should call onFlip callback when flipped', async () => {
    const user = userEvent.setup();
    const handleFlip = vi.fn();
    render(<Flashcard vocabulary={mockVocabulary} onFlip={handleFlip} />);

    const card = screen.getByRole('button', { name: /flip card/i });
    await user.click(card);

    expect(handleFlip).toHaveBeenCalledWith(true);
  });

  it('should have flip animation class', () => {
    const { container } = render(<Flashcard vocabulary={mockVocabulary} />);

    const cardInner = container.querySelector('.flashcard-inner');
    expect(cardInner).toBeInTheDocument();
  });

  it('should be accessible with keyboard', async () => {
    const user = userEvent.setup();
    render(<Flashcard vocabulary={mockVocabulary} />);

    const card = screen.getByRole('button', { name: /flip card/i });
    await user.tab();

    expect(card).toHaveFocus();
  });
});
