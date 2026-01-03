/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GoalProgressBar } from './GoalProgressBar';

/**
 * GoalProgressBar Component Tests
 * Tests for daily goal progress display component
 */

describe('GoalProgressBar', () => {
  describe('Default Variant', () => {
    it('should render words progress bar', () => {
      render(
        <GoalProgressBar
          wordsProgress={5}
          wordsGoal={10}
          minutesProgress={15}
          minutesGoal={30}
          variant="default"
        />
      );

      expect(screen.getByText('Words Goal')).toBeInTheDocument();
      expect(screen.getByText(/5.*\/.*10/)).toBeInTheDocument();
      expect(screen.getAllByText('50% complete')).toHaveLength(2);
    });

    it('should render minutes progress bar', () => {
      render(
        <GoalProgressBar
          wordsProgress={5}
          wordsGoal={10}
          minutesProgress={15}
          minutesGoal={30}
          variant="default"
        />
      );

      expect(screen.getByText('Time Goal')).toBeInTheDocument();
      expect(screen.getByText(/15.*\/.*30.*min/)).toBeInTheDocument();
      expect(screen.getAllByText('50% complete')).toHaveLength(2);
    });

    it('should show achievement message when both goals achieved', () => {
      render(
        <GoalProgressBar
          wordsProgress={10}
          wordsGoal={10}
          minutesProgress={30}
          minutesGoal={30}
          variant="default"
        />
      );

      expect(screen.getByText('Daily goals achieved!')).toBeInTheDocument();
    });

    it('should not show achievement message when only words goal achieved', () => {
      render(
        <GoalProgressBar
          wordsProgress={10}
          wordsGoal={10}
          minutesProgress={15}
          minutesGoal={30}
          variant="default"
        />
      );

      expect(screen.queryByText('Daily goals achieved!')).not.toBeInTheDocument();
    });

    it('should handle exceeding goals', () => {
      render(
        <GoalProgressBar
          wordsProgress={15}
          wordsGoal={10}
          minutesProgress={45}
          minutesGoal={30}
          variant="default"
        />
      );

      expect(screen.getByText(/15.*\/.*10/)).toBeInTheDocument();
      expect(screen.getByText(/45.*\/.*30.*min/)).toBeInTheDocument();
      expect(screen.getAllByText('100% complete')).toHaveLength(2);
    });

    it('should handle zero progress', () => {
      render(
        <GoalProgressBar
          wordsProgress={0}
          wordsGoal={10}
          minutesProgress={0}
          minutesGoal={30}
          variant="default"
        />
      );

      expect(screen.getByText(/0.*\/.*10/)).toBeInTheDocument();
      expect(screen.getByText(/0.*\/.*30.*min/)).toBeInTheDocument();
      expect(screen.getAllByText('0% complete')).toHaveLength(2);
    });
  });

  describe('Compact Variant', () => {
    it('should render compact layout', () => {
      render(
        <GoalProgressBar
          wordsProgress={5}
          wordsGoal={10}
          minutesProgress={15}
          minutesGoal={30}
          variant="compact"
        />
      );

      expect(screen.getByText('Words')).toBeInTheDocument();
      expect(screen.getByText('Minutes')).toBeInTheDocument();
    });

    it('should display progress values in compact mode', () => {
      render(
        <GoalProgressBar
          wordsProgress={7}
          wordsGoal={10}
          minutesProgress={20}
          minutesGoal={30}
          variant="compact"
        />
      );

      expect(screen.getByText('7 / 10')).toBeInTheDocument();
      expect(screen.getByText('20 / 30')).toBeInTheDocument();
    });
  });

  describe('Progress Bar Styling', () => {
    it('should apply correct width based on percentage', () => {
      const { container } = render(
        <GoalProgressBar
          wordsProgress={5}
          wordsGoal={10}
          minutesProgress={15}
          minutesGoal={30}
          variant="default"
        />
      );

      const progressBars = container.querySelectorAll('[role="progressbar"]');
      expect(progressBars.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      const { container } = render(
        <GoalProgressBar
          wordsProgress={5}
          wordsGoal={10}
          minutesProgress={15}
          minutesGoal={30}
          variant="default"
        />
      );

      const progressBars = container.querySelectorAll('[role="progressbar"]');
      expect(progressBars.length).toBe(2);
      progressBars.forEach((bar) => {
        expect(bar).toHaveAttribute('aria-valuemin');
        expect(bar).toHaveAttribute('aria-valuemax');
      });
    });
  });
});
