import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MultipleChoiceQuestion } from './MultipleChoiceQuestion';

describe('MultipleChoiceQuestion', () => {
  const mockQuestion = {
    id: 'q1',
    vocabularyId: 'v1',
    word: '勉強',
    reading: 'べんきょう',
    correctAnswer: 'study',
    options: ['study', 'work', 'play', 'sleep'],
    type: 'WORD_TO_MEANING' as const,
  };

  it('should render question with word and reading', () => {
    const onAnswer = vi.fn();
    render(
      <MultipleChoiceQuestion
        question={mockQuestion}
        onAnswer={onAnswer}
        currentQuestionNumber={1}
        totalQuestions={10}
      />
    );

    expect(screen.getByText('勉強')).toBeDefined();
    expect(screen.getByText('べんきょう')).toBeDefined();
  });

  it('should display question progress', () => {
    const onAnswer = vi.fn();
    render(
      <MultipleChoiceQuestion
        question={mockQuestion}
        onAnswer={onAnswer}
        currentQuestionNumber={3}
        totalQuestions={10}
      />
    );

    expect(screen.getByText(/question 3 of 10/i)).toBeDefined();
  });

  it('should render all answer options', () => {
    const onAnswer = vi.fn();
    render(
      <MultipleChoiceQuestion
        question={mockQuestion}
        onAnswer={onAnswer}
        currentQuestionNumber={1}
        totalQuestions={10}
      />
    );

    expect(screen.getByText('study')).toBeDefined();
    expect(screen.getByText('work')).toBeDefined();
    expect(screen.getByText('play')).toBeDefined();
    expect(screen.getByText('sleep')).toBeDefined();
  });

  it('should call onAnswer when option is clicked', async () => {
    const user = userEvent.setup();
    const onAnswer = vi.fn();
    render(
      <MultipleChoiceQuestion
        question={mockQuestion}
        onAnswer={onAnswer}
        currentQuestionNumber={1}
        totalQuestions={10}
      />
    );

    const option = screen.getByRole('button', { name: /study/i });
    await user.click(option);

    expect(onAnswer).toHaveBeenCalledWith('study', true);
  });

  it('should call onAnswer with correct isCorrect value', async () => {
    const user = userEvent.setup();
    const onAnswer = vi.fn();
    render(
      <MultipleChoiceQuestion
        question={mockQuestion}
        onAnswer={onAnswer}
        currentQuestionNumber={1}
        totalQuestions={10}
      />
    );

    // Click wrong answer
    const wrongOption = screen.getByRole('button', { name: /work/i });
    await user.click(wrongOption);

    expect(onAnswer).toHaveBeenCalledWith('work', false);
  });

  it('should disable all options after answer is selected', async () => {
    const user = userEvent.setup();
    const onAnswer = vi.fn();
    render(
      <MultipleChoiceQuestion
        question={mockQuestion}
        onAnswer={onAnswer}
        currentQuestionNumber={1}
        totalQuestions={10}
        selectedAnswer="study"
      />
    );

    const buttons = screen.getAllByRole('button');
    buttons.forEach((button) => {
      expect(button.hasAttribute('disabled')).toBe(true);
    });
  });

  it('should highlight correct answer in green when selected', () => {
    const onAnswer = vi.fn();
    render(
      <MultipleChoiceQuestion
        question={mockQuestion}
        onAnswer={onAnswer}
        currentQuestionNumber={1}
        totalQuestions={10}
        selectedAnswer="study"
        isCorrect={true}
      />
    );

    const correctButton = screen.getByRole('button', { name: /study/i });
    expect(correctButton.className).toContain('bg-green');
  });

  it('should highlight wrong answer in red and show correct answer', () => {
    const onAnswer = vi.fn();
    render(
      <MultipleChoiceQuestion
        question={mockQuestion}
        onAnswer={onAnswer}
        currentQuestionNumber={1}
        totalQuestions={10}
        selectedAnswer="work"
        isCorrect={false}
      />
    );

    const wrongButton = screen.getByRole('button', { name: /work/i });
    const correctButton = screen.getByRole('button', { name: /study/i });

    expect(wrongButton.className).toContain('bg-red');
    expect(correctButton.className).toContain('bg-green');
  });
});
