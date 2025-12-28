/**
 * @vitest-environment happy-dom
 */

import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/tests/test-utils';
import userEvent from '@testing-library/user-event';
import { AddVocabularyForm } from './AddVocabularyForm';

describe('AddVocabularyForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  it('should render all form fields', () => {
    render(<AddVocabularyForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    expect(screen.getByLabelText(/word/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/reading/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/meaning/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/notes/i)).toBeInTheDocument();
    expect(screen.getAllByText(/example sentences/i)[0]).toBeInTheDocument();
  });

  it('should submit form with basic vocabulary data', async () => {
    const user = userEvent.setup();
    render(<AddVocabularyForm onSubmit={mockOnSubmit} />);

    await user.type(screen.getByLabelText(/word/i), '勉強');
    await user.type(screen.getByLabelText(/reading/i), 'べんきょう');
    await user.type(screen.getByLabelText(/meaning/i), 'study');

    await user.click(screen.getByRole('button', { name: /add word/i }));

    expect(mockOnSubmit).toHaveBeenCalledWith({
      word: '勉強',
      reading: 'べんきょう',
      meaning: 'study',
      notes: '',
    });
  });

  it('should submit form with example sentences', async () => {
    const user = userEvent.setup();
    render(<AddVocabularyForm onSubmit={mockOnSubmit} />);

    await user.type(screen.getByLabelText(/word/i), '勉強');
    await user.type(screen.getByLabelText(/reading/i), 'べんきょう');
    await user.type(screen.getByLabelText(/meaning/i), 'study');

    // Add example sentence
    await user.click(screen.getByRole('button', { name: /add example sentence/i }));

    const sentenceInputs = screen.getAllByPlaceholderText(/私は毎日勉強します/i);
    await user.type(sentenceInputs[0], '私は毎日勉強します');

    const readingInputs = screen.getAllByPlaceholderText(/わたしはまいにちべんきょうします/i);
    await user.type(readingInputs[0], 'わたしはまいにちべんきょうします');

    const meaningInputs = screen.getAllByPlaceholderText(/I study every day/i);
    await user.type(meaningInputs[0], 'I study every day');

    await user.click(screen.getByRole('button', { name: /add word/i }));

    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        word: '勉強',
        reading: 'べんきょう',
        meaning: 'study',
        exampleSentences: [
          {
            sentence: '私は毎日勉強します',
            reading: 'わたしはまいにちべんきょうします',
            meaning: 'I study every day',
            order: 0,
          },
        ],
      })
    );
  });

  it('should show validation errors for empty required fields', async () => {
    const user = userEvent.setup();
    const freshMockOnSubmit = vi.fn();
    render(<AddVocabularyForm onSubmit={freshMockOnSubmit} />);

    await user.click(screen.getByRole('button', { name: /add word/i }));

    expect(screen.getByText(/please enter word/i)).toBeInTheDocument();
    expect(screen.getByText(/please enter reading/i)).toBeInTheDocument();
    expect(screen.getByText(/please enter meaning/i)).toBeInTheDocument();
    expect(freshMockOnSubmit).not.toHaveBeenCalled();
  });

  it('should filter out empty example sentences on submit', async () => {
    const user = userEvent.setup();
    render(<AddVocabularyForm onSubmit={mockOnSubmit} />);

    await user.type(screen.getByLabelText(/word/i), '勉強');
    await user.type(screen.getByLabelText(/reading/i), 'べんきょう');
    await user.type(screen.getByLabelText(/meaning/i), 'study');

    // Add empty example sentence
    await user.click(screen.getByRole('button', { name: /add example sentence/i }));

    await user.click(screen.getByRole('button', { name: /add word/i }));

    expect(mockOnSubmit).toHaveBeenCalledWith({
      word: '勉強',
      reading: 'べんきょう',
      meaning: 'study',
      notes: '',
    });
  });

  it('should call onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<AddVocabularyForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('should disable buttons when loading', () => {
    render(<AddVocabularyForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isLoading={true} />);

    expect(screen.getByRole('button', { name: /adding/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled();
  });
});
