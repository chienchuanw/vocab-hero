/**
 * @vitest-environment happy-dom
 */

import '@testing-library/jest-dom/vitest';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@/tests/test-utils';
import { ExampleSentence } from './ExampleSentence';

describe('ExampleSentence', () => {
  const mockSentence = {
    id: '1',
    sentence: '毎日日本語を勉強します。',
    reading: 'まいにちにほんごをべんきょうします。',
    meaning: 'I study Japanese every day.',
    order: 1,
  };

  it('should render Japanese sentence', () => {
    render(<ExampleSentence sentence={mockSentence} />);
    expect(screen.getByText('毎日日本語を勉強します。')).toBeInTheDocument();
  });

  it('should render reading when provided', () => {
    render(<ExampleSentence sentence={mockSentence} />);
    expect(screen.getByText('まいにちにほんごをべんきょうします。')).toBeInTheDocument();
  });

  it('should render meaning', () => {
    render(<ExampleSentence sentence={mockSentence} />);
    expect(screen.getByText('I study Japanese every day.')).toBeInTheDocument();
  });

  it('should not render reading when not provided', () => {
    const sentenceWithoutReading = { ...mockSentence, reading: null };
    render(<ExampleSentence sentence={sentenceWithoutReading} />);
    expect(screen.queryByText('まいにちにほんごをべんきょうします。')).not.toBeInTheDocument();
  });

  it('should render with custom className', () => {
    const { container } = render(
      <ExampleSentence sentence={mockSentence} className="custom-class" />
    );
    const element = container.querySelector('.custom-class');
    expect(element).toBeInTheDocument();
  });
});

describe('ExampleSentence - Empty State', () => {
  it('should render empty state message when no sentences provided', () => {
    render(<ExampleSentence sentence={null} />);
    expect(screen.getByText('No example sentences')).toBeInTheDocument();
  });

  it('should render empty state with custom message', () => {
    render(<ExampleSentence sentence={null} emptyMessage="No examples available" />);
    expect(screen.getByText('No examples available')).toBeInTheDocument();
  });
});
