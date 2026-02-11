/**
 * @vitest-environment happy-dom
 */

import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/tests/test-utils';
import userEvent from '@testing-library/user-event';
import { ExampleSentenceInput } from './ExampleSentenceInput';
import type { ExampleSentenceData } from './ExampleSentence.types';

describe('ExampleSentenceInput', () => {
  const mockSentences: ExampleSentenceData[] = [
    {
      id: '1',
      sentence: '私は毎日勉強します',
      reading: 'わたしはまいにちべんきょうします',
      meaning: 'I study every day',
      order: 0,
    },
  ];

  it('should render add sentence button when no sentences', () => {
    const handleChange = vi.fn();
    render(<ExampleSentenceInput sentences={[]} onChange={handleChange} />);

    expect(screen.getByRole('button', { name: /add example sentence/i })).toBeInTheDocument();
  });

  it('should display existing sentences', () => {
    const handleChange = vi.fn();
    render(<ExampleSentenceInput sentences={mockSentences} onChange={handleChange} />);

    expect(screen.getByDisplayValue('私は毎日勉強します')).toBeInTheDocument();
    expect(screen.getByDisplayValue('わたしはまいにちべんきょうします')).toBeInTheDocument();
    expect(screen.getByDisplayValue('I study every day')).toBeInTheDocument();
  });

  it('should add new sentence when clicking add button', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<ExampleSentenceInput sentences={[]} onChange={handleChange} />);

    await user.click(screen.getByRole('button', { name: /add example sentence/i }));

    expect(handleChange).toHaveBeenCalledWith([
      expect.objectContaining({
        sentence: '',
        reading: '',
        meaning: '',
        order: 0,
      }),
    ]);
  });

  it('should update sentence when typing', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<ExampleSentenceInput sentences={mockSentences} onChange={handleChange} />);

    const sentenceInput = screen.getByDisplayValue('私は毎日勉強します');
    await user.type(sentenceInput, '文');

    expect(handleChange).toHaveBeenCalledWith([
      expect.objectContaining({
        id: '1',
        sentence: '私は毎日勉強します文',
        reading: 'わたしはまいにちべんきょうします',
        meaning: 'I study every day',
        order: 0,
      }),
    ]);
  });

  it('should delete sentence when clicking delete button', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<ExampleSentenceInput sentences={mockSentences} onChange={handleChange} />);

    await user.click(screen.getByRole('button', { name: /delete/i }));

    expect(handleChange).toHaveBeenCalledWith([]);
  });

  it('should reorder sentences correctly', () => {
    const sentences: ExampleSentenceData[] = [
      {
        id: '1',
        sentence: '最初の文',
        reading: 'さいしょのぶん',
        meaning: 'First sentence',
        order: 0,
      },
      {
        id: '2',
        sentence: '二番目の文',
        reading: 'にばんめのぶん',
        meaning: 'Second sentence',
        order: 1,
      },
    ];
    const handleChange = vi.fn();
    render(<ExampleSentenceInput sentences={sentences} onChange={handleChange} />);

    expect(screen.getByDisplayValue('最初の文')).toBeInTheDocument();
    expect(screen.getByDisplayValue('二番目の文')).toBeInTheDocument();
  });

  it('should render empty sentence fields', () => {
    const handleChange = vi.fn();
    const sentences: ExampleSentenceData[] = [
      { id: '1', sentence: '', reading: '', meaning: '', order: 0 },
    ];
    render(<ExampleSentenceInput sentences={sentences} onChange={handleChange} />);

    const sentenceInput = screen.getByPlaceholderText(/私は毎日勉強します/i);
    expect(sentenceInput).toBeInTheDocument();
    expect(sentenceInput).toHaveValue('');
  });
});
