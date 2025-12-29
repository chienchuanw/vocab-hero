import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressLineChart } from './ProgressLineChart';

/**
 * ProgressLineChart Component Tests
 * Tests for line chart displaying progress over time
 */

describe('ProgressLineChart', () => {
  const mockData = [
    { date: '2024-01-01', wordsStudied: 10, timeSpent: 30 },
    { date: '2024-01-02', wordsStudied: 15, timeSpent: 45 },
    { date: '2024-01-03', wordsStudied: 8, timeSpent: 25 },
    { date: '2024-01-04', wordsStudied: 20, timeSpent: 60 },
    { date: '2024-01-05', wordsStudied: 12, timeSpent: 35 },
  ];

  it('should render chart title', () => {
    render(<ProgressLineChart data={mockData} title="Learning Progress" />);

    expect(screen.getByText('Learning Progress')).toBeInTheDocument();
  });

  it('should render with empty data', () => {
    render(<ProgressLineChart data={[]} title="Learning Progress" />);

    expect(screen.getByText('Learning Progress')).toBeInTheDocument();
    expect(screen.getByText(/no data/i)).toBeInTheDocument();
  });

  it('should display chart container', () => {
    const { container } = render(
      <ProgressLineChart data={mockData} title="Learning Progress" />
    );

    const chartContainer = container.querySelector('.recharts-wrapper');
    expect(chartContainer).toBeInTheDocument();
  });

  it('should render with custom height', () => {
    const { container } = render(
      <ProgressLineChart data={mockData} title="Learning Progress" height={400} />
    );

    const responsiveContainer = container.querySelector('.recharts-responsive-container');
    expect(responsiveContainer).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <ProgressLineChart
        data={mockData}
        title="Learning Progress"
        className="custom-class"
      />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});

