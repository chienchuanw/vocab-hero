import { describe, it, expect } from 'vitest';
import { render, screen } from '@/tests/test-utils';
import { MasteryIndicator } from './MasteryIndicator';
import { MasteryLevel } from '@/lib/srs/mastery';

/**
 * Unit tests for MasteryIndicator component
 */

describe('MasteryIndicator', () => {
  it('should render NEW level correctly', () => {
    render(<MasteryIndicator level={MasteryLevel.NEW} />);
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('should render LEARNING level correctly', () => {
    render(<MasteryIndicator level={MasteryLevel.LEARNING} />);
    expect(screen.getByText('Learning')).toBeInTheDocument();
  });

  it('should render FAMILIAR level correctly', () => {
    render(<MasteryIndicator level={MasteryLevel.FAMILIAR} />);
    expect(screen.getByText('Familiar')).toBeInTheDocument();
  });

  it('should render LEARNED level correctly', () => {
    render(<MasteryIndicator level={MasteryLevel.LEARNED} />);
    expect(screen.getByText('Learned')).toBeInTheDocument();
  });

  it('should render MASTERED level correctly', () => {
    render(<MasteryIndicator level={MasteryLevel.MASTERED} />);
    expect(screen.getByText('Mastered')).toBeInTheDocument();
  });

  it('should apply correct color classes for NEW level', () => {
    const { container } = render(<MasteryIndicator level={MasteryLevel.NEW} />);
    const badge = container.querySelector('.bg-gray-100');
    expect(badge).toBeInTheDocument();
  });

  it('should apply correct color classes for LEARNING level', () => {
    const { container } = render(<MasteryIndicator level={MasteryLevel.LEARNING} />);
    const badge = container.querySelector('.bg-red-100');
    expect(badge).toBeInTheDocument();
  });

  it('should apply correct color classes for FAMILIAR level', () => {
    const { container } = render(<MasteryIndicator level={MasteryLevel.FAMILIAR} />);
    const badge = container.querySelector('.bg-orange-100');
    expect(badge).toBeInTheDocument();
  });

  it('should apply correct color classes for LEARNED level', () => {
    const { container } = render(<MasteryIndicator level={MasteryLevel.LEARNED} />);
    const badge = container.querySelector('.bg-yellow-100');
    expect(badge).toBeInTheDocument();
  });

  it('should apply correct color classes for MASTERED level', () => {
    const { container } = render(<MasteryIndicator level={MasteryLevel.MASTERED} />);
    const badge = container.querySelector('.bg-green-100');
    expect(badge).toBeInTheDocument();
  });

  it('should show description on hover when showDescription is true', () => {
    render(<MasteryIndicator level={MasteryLevel.NEW} showDescription />);
    const badge = screen.getByText('New');
    expect(badge).toHaveAttribute('title', 'Not yet reviewed');
  });

  it('should not show description when showDescription is false', () => {
    render(<MasteryIndicator level={MasteryLevel.NEW} showDescription={false} />);
    const badge = screen.getByText('New');
    expect(badge).not.toHaveAttribute('title');
  });

  it('should apply custom className when provided', () => {
    const { container } = render(
      <MasteryIndicator level={MasteryLevel.NEW} className="custom-class" />
    );
    const badge = container.querySelector('.custom-class');
    expect(badge).toBeInTheDocument();
  });

  it('should render in compact mode when size is sm', () => {
    const { container } = render(<MasteryIndicator level={MasteryLevel.NEW} size="sm" />);
    const badge = container.querySelector('.text-xs');
    expect(badge).toBeInTheDocument();
  });

  it('should render in normal mode when size is md', () => {
    const { container } = render(<MasteryIndicator level={MasteryLevel.NEW} size="md" />);
    const badge = container.querySelector('.text-sm');
    expect(badge).toBeInTheDocument();
  });
});

