import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ListeningQuestion } from './ListeningQuestion';
import type { ListeningQuestion as ListeningQuestionType } from '@/lib/listening';

/**
 * ListeningQuestion Component Test Suite
 * Tests for listening question component with audio playback
 */

// Mock TTS engine
vi.mock('@/lib/tts', () => ({
  TTSEngine: vi.fn().mockImplementation(() => ({
    speak: vi.fn().mockResolvedValue(undefined),
    stop: vi.fn(),
    isSupported: vi.fn().mockReturnValue(true),
  })),
}));

describe('ListeningQuestion', () => {
  const mockMultipleChoiceQuestion: ListeningQuestionType = {
    id: 'q1',
    vocabularyId: 'v1',
    word: 'benkyou',
    reading: 'benkyou',
    correctAnswer: 'study',
    type: 'multiple-choice',
    options: ['study', 'work', 'play', 'sleep'],
    replaysUsed: 0,
  };

  const mockTypingQuestion: ListeningQuestionType = {
    id: 'q2',
    vocabularyId: 'v2',
    word: 'shigoto',
    reading: 'shigoto',
    correctAnswer: 'work',
    type: 'typing',
    replaysUsed: 0,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Multiple Choice Mode', () => {
    it('should render question with options', () => {
      render(
        <ListeningQuestion
          question={mockMultipleChoiceQuestion}
          onAnswer={vi.fn()}
          maxReplays={3}
        />
      );

      expect(screen.getByText(/study/i)).toBeInTheDocument();
      expect(screen.getByText(/work/i)).toBeInTheDocument();
      expect(screen.getByText(/play/i)).toBeInTheDocument();
      expect(screen.getByText(/sleep/i)).toBeInTheDocument();
    });

    it('should call onAnswer when option is selected', async () => {
      const user = userEvent.setup();
      const handleAnswer = vi.fn();

      render(
        <ListeningQuestion
          question={mockMultipleChoiceQuestion}
          onAnswer={handleAnswer}
          maxReplays={3}
        />
      );

      const studyButton = screen.getByRole('button', { name: /study/i });
      await user.click(studyButton);

      expect(handleAnswer).toHaveBeenCalledWith('study');
    });

    it('should highlight selected option', async () => {
      const user = userEvent.setup();

      render(
        <ListeningQuestion
          question={mockMultipleChoiceQuestion}
          onAnswer={vi.fn()}
          maxReplays={3}
        />
      );

      const studyButton = screen.getByRole('button', { name: /study/i });
      await user.click(studyButton);

      expect(studyButton).toHaveClass('bg-primary');
    });
  });

  describe('Typing Mode', () => {
    it('should render input field for typing', () => {
      render(
        <ListeningQuestion
          question={mockTypingQuestion}
          onAnswer={vi.fn()}
          maxReplays={3}
        />
      );

      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    it('should call onAnswer when form is submitted', async () => {
      const user = userEvent.setup();
      const handleAnswer = vi.fn();

      render(
        <ListeningQuestion
          question={mockTypingQuestion}
          onAnswer={handleAnswer}
          maxReplays={3}
        />
      );

      const input = screen.getByRole('textbox');
      await user.type(input, 'work');

      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      expect(handleAnswer).toHaveBeenCalledWith('work');
    });

    it('should not submit empty answer', async () => {
      const user = userEvent.setup();
      const handleAnswer = vi.fn();

      render(
        <ListeningQuestion
          question={mockTypingQuestion}
          onAnswer={handleAnswer}
          maxReplays={3}
        />
      );

      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      expect(handleAnswer).not.toHaveBeenCalled();
    });
  });

  describe('Audio Replay', () => {
    it('should show replay button', () => {
      render(
        <ListeningQuestion
          question={mockMultipleChoiceQuestion}
          onAnswer={vi.fn()}
          maxReplays={3}
        />
      );

      const replayButton = screen.getByRole('button', { name: /replay/i });
      expect(replayButton).toBeInTheDocument();
    });

    it('should disable replay when limit reached', () => {
      const questionAtLimit = { ...mockMultipleChoiceQuestion, replaysUsed: 3 };

      render(
        <ListeningQuestion
          question={questionAtLimit}
          onAnswer={vi.fn()}
          maxReplays={3}
        />
      );

      const replayButton = screen.getByRole('button', { name: /replay/i });
      expect(replayButton).toBeDisabled();
    });

    it('should show replay count', () => {
      const questionWithReplays = { ...mockMultipleChoiceQuestion, replaysUsed: 2 };

      render(
        <ListeningQuestion
          question={questionWithReplays}
          onAnswer={vi.fn()}
          maxReplays={3}
        />
      );

      expect(screen.getByText(/2.*3/)).toBeInTheDocument();
    });
  });
});

