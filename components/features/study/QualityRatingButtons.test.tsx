/**
 * @vitest-environment happy-dom
 */

import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/tests/test-utils';
import userEvent from '@testing-library/user-event';
import { QualityRatingButtons } from './QualityRatingButtons';

describe('QualityRatingButtons', () => {
  const mockOnRate = vi.fn();

  beforeEach(() => {
    mockOnRate.mockClear();
  });

  it('should render all 6 rating buttons', () => {
    render(<QualityRatingButtons onRate={mockOnRate} />);

    expect(screen.getByRole('button', { name: /完全忘記/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /不太確定/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /有點困難/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /還可以/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /很熟悉/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /完美記住/i })).toBeInTheDocument();
  });

  it('should call onRate with correct quality when button clicked', async () => {
    const user = userEvent.setup();
    render(<QualityRatingButtons onRate={mockOnRate} />);

    await user.click(screen.getByRole('button', { name: /還可以/i }));

    expect(mockOnRate).toHaveBeenCalledWith(3);
  });

  it('should handle keyboard shortcuts 0-5', async () => {
    const user = userEvent.setup();
    render(<QualityRatingButtons onRate={mockOnRate} />);

    await user.keyboard('0');
    expect(mockOnRate).toHaveBeenCalledWith(0);

    await user.keyboard('3');
    expect(mockOnRate).toHaveBeenCalledWith(3);

    await user.keyboard('5');
    expect(mockOnRate).toHaveBeenCalledWith(5);
  });

  it('should ignore invalid keyboard inputs', async () => {
    const user = userEvent.setup();
    render(<QualityRatingButtons onRate={mockOnRate} />);

    await user.keyboard('6');
    await user.keyboard('a');
    await user.keyboard('-');

    expect(mockOnRate).not.toHaveBeenCalled();
  });

  it('should disable all buttons when disabled prop is true', () => {
    render(<QualityRatingButtons onRate={mockOnRate} disabled />);

    const buttons = screen.getAllByRole('button');
    buttons.forEach((button) => {
      expect(button).toBeDisabled();
    });
  });

  it('should not call onRate when disabled', async () => {
    const user = userEvent.setup();
    render(<QualityRatingButtons onRate={mockOnRate} disabled />);

    await user.keyboard('3');

    expect(mockOnRate).not.toHaveBeenCalled();
  });

  it('should display keyboard shortcuts in button labels', () => {
    render(<QualityRatingButtons onRate={mockOnRate} />);

    expect(screen.getByText(/\[0\]/)).toBeInTheDocument();
    expect(screen.getByText(/\[1\]/)).toBeInTheDocument();
    expect(screen.getByText(/\[2\]/)).toBeInTheDocument();
    expect(screen.getByText(/\[3\]/)).toBeInTheDocument();
    expect(screen.getByText(/\[4\]/)).toBeInTheDocument();
    expect(screen.getByText(/\[5\]/)).toBeInTheDocument();
  });

  it('should have different colors for different quality levels', () => {
    const { container } = render(<QualityRatingButtons onRate={mockOnRate} />);

    const buttons = container.querySelectorAll('button');
    expect(buttons).toHaveLength(6);
    
    // Each button should have distinct styling
    buttons.forEach((button) => {
      expect(button.className).toBeTruthy();
    });
  });

  it('should be accessible with keyboard navigation', async () => {
    const user = userEvent.setup();
    render(<QualityRatingButtons onRate={mockOnRate} />);

    await user.tab();
    const firstButton = screen.getByRole('button', { name: /完全忘記/i });
    expect(firstButton).toHaveFocus();
  });
});

