/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { GoalCelebration } from './GoalCelebration';

/**
 * GoalCelebration Component Tests
 * Tests for goal achievement celebration animation
 */

// Mock canvas-confetti
vi.mock('canvas-confetti', () => ({
  default: vi.fn(() => Promise.resolve()),
}));

describe('GoalCelebration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render celebration message when both goals achieved', () => {
    render(
      <GoalCelebration
        isWordsGoalAchieved={true}
        isMinutesGoalAchieved={true}
        show={true}
      />
    );

    expect(screen.getByText(/congratulations/i)).toBeInTheDocument();
    expect(screen.getByText(/daily goal/i)).toBeInTheDocument();
  });

  it('should not render when show is false', () => {
    const { container } = render(
      <GoalCelebration
        isWordsGoalAchieved={true}
        isMinutesGoalAchieved={true}
        show={false}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should not render when only words goal achieved', () => {
    const { container } = render(
      <GoalCelebration
        isWordsGoalAchieved={true}
        isMinutesGoalAchieved={false}
        show={true}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should not render when only minutes goal achieved', () => {
    const { container } = render(
      <GoalCelebration
        isWordsGoalAchieved={false}
        isMinutesGoalAchieved={true}
        show={true}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should trigger confetti animation when both goals achieved', async () => {
    const confetti = await import('canvas-confetti');
    
    render(
      <GoalCelebration
        isWordsGoalAchieved={true}
        isMinutesGoalAchieved={true}
        show={true}
      />
    );

    await waitFor(() => {
      expect(confetti.default).toHaveBeenCalled();
    });
  });

  it('should display achievement icon', () => {
    render(
      <GoalCelebration
        isWordsGoalAchieved={true}
        isMinutesGoalAchieved={true}
        show={true}
      />
    );

    const icon = screen.getByRole('img', { hidden: true });
    expect(icon).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    render(
      <GoalCelebration
        isWordsGoalAchieved={true}
        isMinutesGoalAchieved={true}
        show={true}
      />
    );

    const celebration = screen.getByRole('alert');
    expect(celebration).toHaveAttribute('aria-live', 'polite');
  });

  it('should display custom message when provided', () => {
    render(
      <GoalCelebration
        isWordsGoalAchieved={true}
        isMinutesGoalAchieved={true}
        show={true}
        message="Great job today!"
      />
    );

    expect(screen.getByText('Great job today!')).toBeInTheDocument();
  });
});

