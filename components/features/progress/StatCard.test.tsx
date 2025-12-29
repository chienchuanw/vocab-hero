import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatCard } from './StatCard';

/**
 * StatCard Component Tests
 * Tests for statistics card component displaying key metrics
 */

describe('StatCard', () => {
  it('should render title and value', () => {
    render(<StatCard title="Total Words" value={150} />);

    expect(screen.getByText('Total Words')).toBeInTheDocument();
    expect(screen.getByText('150')).toBeInTheDocument();
  });

  it('should render with icon when provided', () => {
    const TestIcon = () => <svg data-testid="test-icon" />;
    render(<StatCard title="Total Words" value={150} icon={<TestIcon />} />);

    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  it('should render description when provided', () => {
    render(
      <StatCard
        title="Total Words"
        value={150}
        description="Words learned this month"
      />
    );

    expect(screen.getByText('Words learned this month')).toBeInTheDocument();
  });

  it('should format large numbers correctly', () => {
    render(<StatCard title="Total Words" value={1500} />);

    expect(screen.getByText('1,500')).toBeInTheDocument();
  });

  it('should display percentage values with % symbol', () => {
    render(<StatCard title="Mastery Rate" value={85.5} unit="%" />);

    expect(screen.getByText('85.5%')).toBeInTheDocument();
  });

  it('should display time values with unit', () => {
    render(<StatCard title="Study Time" value={120} unit="min" />);

    expect(screen.getByText('120 min')).toBeInTheDocument();
  });

  it('should show trend indicator when provided', () => {
    render(<StatCard title="Total Words" value={150} trend={10} />);

    expect(screen.getByText(/\+10/)).toBeInTheDocument();
  });

  it('should show negative trend indicator', () => {
    render(<StatCard title="Total Words" value={150} trend={-5} />);

    expect(screen.getByText(/-5/)).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <StatCard title="Total Words" value={150} className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should render with zero value', () => {
    render(<StatCard title="Total Words" value={0} />);

    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('should render with decimal values', () => {
    render(<StatCard title="Average Score" value={87.65} />);

    expect(screen.getByText('87.65')).toBeInTheDocument();
  });
});

