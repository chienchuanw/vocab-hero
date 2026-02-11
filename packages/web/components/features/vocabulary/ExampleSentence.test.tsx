/**
 * @vitest-environment happy-dom
 */

import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/tests/test-utils';
import userEvent from '@testing-library/user-event';
import { ExampleSentence } from './ExampleSentence';
import * as ttsModule from '@/lib/tts';

vi.mock('@/lib/tts', () => ({
  ttsEngine: {
    isSupported: vi.fn(() => true),
    speak: vi.fn(() => Promise.resolve()),
    stop: vi.fn(),
    getState: vi.fn(() => 'idle'),
  },
}));

describe('ExampleSentence', () => {
  const mockTTSEngine = ttsModule.ttsEngine;

  beforeEach(() => {
    vi.clearAllMocks();
  });

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

  describe('TTS Integration', () => {
    it('should render speaker button for sentence pronunciation', () => {
      render(<ExampleSentence sentence={mockSentence} />);
      const speakerButton = screen.getByRole('button', { name: /play pronunciation/i });
      expect(speakerButton).toBeInTheDocument();
    });

    it('should call TTS engine when speaker button is clicked', async () => {
      const user = userEvent.setup();
      render(<ExampleSentence sentence={mockSentence} />);

      const speakerButton = screen.getByRole('button', { name: /play pronunciation/i });
      await user.click(speakerButton);

      expect(mockTTSEngine.speak).toHaveBeenCalledWith('毎日日本語を勉強します。', undefined);
    });

    it('should not render speaker button when TTS is not supported', () => {
      vi.mocked(mockTTSEngine.isSupported).mockReturnValue(false);
      render(<ExampleSentence sentence={mockSentence} />);

      const speakerButton = screen.queryByRole('button', { name: /play pronunciation/i });
      expect(speakerButton).not.toBeInTheDocument();
    });

    it('should not render speaker button in empty state', () => {
      render(<ExampleSentence sentence={null} />);
      const speakerButton = screen.queryByRole('button', { name: /play pronunciation/i });
      expect(speakerButton).not.toBeInTheDocument();
    });
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
