import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GroupDistributionPieChart } from './GroupDistributionPieChart';

/**
 * GroupDistributionPieChart Component Tests
 * Tests for pie chart displaying vocabulary group distribution
 */

describe('GroupDistributionPieChart', () => {
  const mockData = [
    { name: 'JLPT N5', value: 150, color: '#3b82f6' },
    { name: 'JLPT N4', value: 100, color: '#10b981' },
    { name: 'JLPT N3', value: 75, color: '#f59e0b' },
    { name: 'Daily Conversation', value: 50, color: '#ef4444' },
  ];

  it('should render chart title', () => {
    render(<GroupDistributionPieChart data={mockData} title="Vocabulary Groups" />);

    expect(screen.getByText('Vocabulary Groups')).toBeInTheDocument();
  });

  it('should render with empty data', () => {
    render(<GroupDistributionPieChart data={[]} title="Vocabulary Groups" />);

    expect(screen.getByText('Vocabulary Groups')).toBeInTheDocument();
    expect(screen.getByText(/no data/i)).toBeInTheDocument();
  });

  it('should display chart container', () => {
    const { container } = render(
      <GroupDistributionPieChart data={mockData} title="Vocabulary Groups" />
    );

    // Check that the component renders (Recharts may not render in test environment)
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should render with custom height', () => {
    const { container } = render(
      <GroupDistributionPieChart data={mockData} title="Vocabulary Groups" height={400} />
    );

    const responsiveContainer = container.querySelector('.recharts-responsive-container');
    expect(responsiveContainer).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <GroupDistributionPieChart
        data={mockData}
        title="Vocabulary Groups"
        className="custom-class"
      />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should handle single data point', () => {
    const singleData = [{ name: 'JLPT N5', value: 150, color: '#3b82f6' }];

    const { container } = render(
      <GroupDistributionPieChart data={singleData} title="Vocabulary Groups" />
    );

    // Check that the component renders (Recharts may not render in test environment)
    expect(container.firstChild).toBeInTheDocument();
  });
});
