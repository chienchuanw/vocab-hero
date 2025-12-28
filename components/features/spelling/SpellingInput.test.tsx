import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SpellingInput } from './SpellingInput';

describe('SpellingInput', () => {
  it('should render input field', () => {
    const onSubmit = vi.fn();
    render(<SpellingInput word="勉強" meaning="study" onSubmit={onSubmit} />);

    expect(screen.getByRole('textbox')).toBeDefined();
  });

  it('should display the word and meaning', () => {
    const onSubmit = vi.fn();
    render(<SpellingInput word="勉強" meaning="study" onSubmit={onSubmit} />);

    expect(screen.getByText('勉強')).toBeDefined();
    expect(screen.getByText('study')).toBeDefined();
  });

  it('should have placeholder text', () => {
    const onSubmit = vi.fn();
    render(<SpellingInput word="勉強" meaning="study" onSubmit={onSubmit} />);

    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.placeholder).toContain('reading');
  });

  it('should allow typing in input', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<SpellingInput word="勉強" meaning="study" onSubmit={onSubmit} />);

    const input = screen.getByRole('textbox') as HTMLInputElement;
    await user.type(input, 'べんきょう');

    expect(input.value).toBe('べんきょう');
  });

  it('should call onSubmit when form is submitted', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<SpellingInput word="勉強" meaning="study" onSubmit={onSubmit} />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'べんきょう');

    const submitButton = screen.getByRole('button', { name: /submit|check/i });
    await user.click(submitButton);

    expect(onSubmit).toHaveBeenCalledWith('べんきょう');
  });

  it('should clear input after submission', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<SpellingInput word="勉強" meaning="study" onSubmit={onSubmit} />);

    const input = screen.getByRole('textbox') as HTMLInputElement;
    await user.type(input, 'べんきょう');

    const submitButton = screen.getByRole('button', { name: /submit|check/i });
    await user.click(submitButton);

    expect(input.value).toBe('');
  });

  it('should show hint when hint button is clicked', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<SpellingInput word="勉強" meaning="study" correctReading="べんきょう" onSubmit={onSubmit} />);

    const hintButton = screen.getByRole('button', { name: /hint/i });
    await user.click(hintButton);

    // Should show first character as hint
    expect(screen.getByText(/べ/)).toBeDefined();
  });

  it('should disable submit when input is empty', () => {
    const onSubmit = vi.fn();
    render(<SpellingInput word="勉強" meaning="study" onSubmit={onSubmit} />);

    const submitButton = screen.getByRole('button', { name: /submit|check/i });
    expect(submitButton.hasAttribute('disabled')).toBe(true);
  });

  it('should enable submit when input has value', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<SpellingInput word="勉強" meaning="study" onSubmit={onSubmit} />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'test');

    const submitButton = screen.getByRole('button', { name: /submit|check/i });
    expect(submitButton.hasAttribute('disabled')).toBe(false);
  });

  it('should show feedback when answer is provided', () => {
    const onSubmit = vi.fn();
    render(
      <SpellingInput
        word="勉強"
        meaning="study"
        onSubmit={onSubmit}
        userAnswer="べんきょう"
        isCorrect={true}
      />
    );

    expect(screen.getByText(/correct/i)).toBeDefined();
  });

  it('should show correct answer when incorrect', () => {
    const onSubmit = vi.fn();
    render(
      <SpellingInput
        word="勉強"
        meaning="study"
        correctReading="べんきょう"
        onSubmit={onSubmit}
        userAnswer="べんきよう"
        isCorrect={false}
      />
    );

    expect(screen.getByText(/incorrect/i)).toBeDefined();
    expect(screen.getByText(/べんきょう/)).toBeDefined();
  });
});

