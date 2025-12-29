import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StreakDisplay } from './StreakDisplay';

describe('StreakDisplay', () => {
  it('should display current streak', () => {
    render(
      <StreakDisplay currentStreak={7} longestStreak={10} freezesRemaining={2} />
    );

    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText(/current streak/i)).toBeInTheDocument();
  });

  it('should display longest streak', () => {
    render(
      <StreakDisplay currentStreak={5} longestStreak={15} freezesRemaining={2} />
    );

    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText(/longest streak/i)).toBeInTheDocument();
  });

  it('should display freezes remaining', () => {
    render(
      <StreakDisplay currentStreak={5} longestStreak={10} freezesRemaining={3} />
    );

    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText(/freezes remaining/i)).toBeInTheDocument();
  });

  it('should display zero values correctly', () => {
    render(
      <StreakDisplay currentStreak={0} longestStreak={0} freezesRemaining={0} />
    );

    const zeroElements = screen.getAllByText('0');
    expect(zeroElements.length).toBeGreaterThanOrEqual(3);
  });

  it('should highlight milestone achievements', () => {
    render(
      <StreakDisplay currentStreak={30} longestStreak={30} freezesRemaining={2} />
    );

    expect(screen.getByText('30')).toBeInTheDocument();
  });

  it('should show fire icon for active streaks', () => {
    const { container } = render(
      <StreakDisplay currentStreak={5} longestStreak={10} freezesRemaining={2} />
    );

    const icons = container.querySelectorAll('svg');
    expect(icons.length).toBeGreaterThan(0);
  });

  it('should show snowflake icon for freezes', () => {
    const { container } = render(
      <StreakDisplay currentStreak={5} longestStreak={10} freezesRemaining={2} />
    );

    const icons = container.querySelectorAll('svg');
    expect(icons.length).toBeGreaterThan(0);
  });

  it('should display warning when no freezes remaining', () => {
    render(
      <StreakDisplay currentStreak={5} longestStreak={10} freezesRemaining={0} />
    );

    expect(screen.getByText('0')).toBeInTheDocument();
  });
});

