import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MatchingCard } from './MatchingCard';

describe('MatchingCard', () => {
  const mockOnClick = vi.fn();

  afterEach(() => {
    mockOnClick.mockClear();
  });

  describe('rendering', () => {
    it('should render card with content', () => {
      render(<MatchingCard content="勉強" onClick={mockOnClick} />);

      expect(screen.getByText('勉強')).toBeInTheDocument();
    });

    it('should render as button', () => {
      render(<MatchingCard content="study" onClick={mockOnClick} />);

      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('interaction', () => {
    it('should call onClick when clicked', async () => {
      const user = userEvent.setup();
      render(<MatchingCard content="勉強" onClick={mockOnClick} />);

      await user.click(screen.getByRole('button'));

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick when disabled', async () => {
      const user = userEvent.setup();
      render(<MatchingCard content="勉強" onClick={mockOnClick} disabled />);

      await user.click(screen.getByRole('button'));

      expect(mockOnClick).not.toHaveBeenCalled();
    });
  });

  describe('states', () => {
    it('should show selected state', () => {
      const { container } = render(
        <MatchingCard content="勉強" onClick={mockOnClick} isSelected />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('ring-2');
    });

    it('should show matched state', () => {
      const { container } = render(
        <MatchingCard content="勉強" onClick={mockOnClick} isMatched />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-green-100');
    });

    it('should show disabled state', () => {
      render(<MatchingCard content="勉強" onClick={mockOnClick} disabled />);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should show error state', () => {
      render(<MatchingCard content="勉強" onClick={mockOnClick} isError />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-red-100');
    });
  });

  describe('card types', () => {
    it('should render word card', () => {
      render(<MatchingCard content="勉強" onClick={mockOnClick} type="word" />);

      expect(screen.getByText('勉強')).toBeInTheDocument();
    });

    it('should render meaning card', () => {
      render(<MatchingCard content="study" onClick={mockOnClick} type="meaning" />);

      expect(screen.getByText('study')).toBeInTheDocument();
    });
  });

  describe('animations', () => {
    it('should have transition classes', () => {
      render(<MatchingCard content="勉強" onClick={mockOnClick} />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('transition-all');
    });

    it('should scale on hover', () => {
      render(<MatchingCard content="勉強" onClick={mockOnClick} />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('hover:scale-105');
    });
  });

  describe('accessibility', () => {
    it('should have accessible button role', () => {
      render(<MatchingCard content="勉強" onClick={mockOnClick} />);

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();
      render(<MatchingCard content="勉強" onClick={mockOnClick} />);

      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard('{Enter}');

      expect(mockOnClick).toHaveBeenCalled();
    });
  });

  describe('matched state behavior', () => {
    it('should be disabled when matched', () => {
      render(<MatchingCard content="勉強" onClick={mockOnClick} isMatched />);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should not be clickable when matched', async () => {
      const user = userEvent.setup();
      render(<MatchingCard content="勉強" onClick={mockOnClick} isMatched />);

      await user.click(screen.getByRole('button'));

      expect(mockOnClick).not.toHaveBeenCalled();
    });
  });
});

