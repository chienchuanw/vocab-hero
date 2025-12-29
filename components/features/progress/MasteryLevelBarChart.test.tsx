import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MasteryLevelBarChart } from './MasteryLevelBarChart';

/**
 * MasteryLevelBarChart Component Tests
 * Tests for bar chart displaying vocabulary mastery level distribution
 */

describe('MasteryLevelBarChart', () => {
  const mockData = [
    { level: 'NEW', count: 50 },
    { level: 'LEARNING', count: 30 },
    { level: 'FAMILIAR', count: 20 },
    { level: 'LEARNED', count: 15 },
    { level: 'MASTERED', count: 10 },
  ];

  it('should render chart title', () => {
    render(<MasteryLevelBarChart data={mockData} title="Mastery Levels" />);

    expect(screen.getByText('Mastery Levels')).toBeInTheDocument();
  });

  it('should render with empty data', () => {
    render(<MasteryLevelBarChart data={[]} title="Mastery Levels" />);

    expect(screen.getByText('Mastery Levels')).toBeInTheDocument();
    expect(screen.getByText(/no data/i)).toBeInTheDocument();
  });

  it('should display chart container', () => {
    const { container } = render(
      <MasteryLevelBarChart data={mockData} title="Mastery Levels" />
    );

    const chartContainer = container.querySelector('.recharts-wrapper');
    expect(chartContainer).toBeInTheDocument();
  });

  it('should render with custom height', () => {
    const { container } = render(
      <MasteryLevelBarChart data={mockData} title="Mastery Levels" height={400} />
    );

    const responsiveContainer = container.querySelector('.recharts-responsive-container');
    expect(responsiveContainer).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <MasteryLevelBarChart
        data={mockData}
        title="Mastery Levels"
        className="custom-class"
      />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should handle single data point', () => {
    const singleData = [{ level: 'NEW', count: 50 }];

    const { container } = render(
      <MasteryLevelBarChart data={singleData} title="Mastery Levels" />
    );

    const chartContainer = container.querySelector('.recharts-wrapper');
    expect(chartContainer).toBeInTheDocument();
  });
});

