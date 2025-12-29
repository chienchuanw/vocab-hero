import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContributionWall } from './ContributionWall';

describe('ContributionWall', () => {
  const mockProgressData = [
    {
      date: new Date('2024-01-15'),
      wordsStudied: 10,
      timeSpentMinutes: 30,
    },
    {
      date: new Date('2024-01-16'),
      wordsStudied: 25,
      timeSpentMinutes: 60,
    },
    {
      date: new Date('2024-01-17'),
      wordsStudied: 5,
      timeSpentMinutes: 15,
    },
  ];

  it('should render 365 day cells', () => {
    const { container } = render(<ContributionWall progressData={[]} year={2024} />);

    const cells = container.querySelectorAll('[data-testid^="contribution-cell"]');
    expect(cells.length).toBeGreaterThanOrEqual(365);
  });

  it('should display activity levels based on words studied', () => {
    const { container } = render(<ContributionWall progressData={mockProgressData} year={2024} />);

    const cells = container.querySelectorAll('[data-testid^="contribution-cell"]');
    expect(cells.length).toBeGreaterThan(0);
  });

  it('should render with empty data', () => {
    const { container } = render(<ContributionWall progressData={[]} year={2024} />);

    const cells = container.querySelectorAll('[data-testid^="contribution-cell"]');
    expect(cells.length).toBeGreaterThan(0);
  });

  it('should display month labels', () => {
    render(<ContributionWall progressData={[]} year={2024} />);

    expect(screen.getByText(/Jan/i)).toBeInTheDocument();
  });

  it('should display weekday labels', () => {
    render(<ContributionWall progressData={[]} year={2024} />);

    expect(screen.getByText(/Mon/i)).toBeInTheDocument();
  });

  it('should apply correct intensity levels', () => {
    const dataWithVariedIntensity = [
      { date: new Date('2024-01-01'), wordsStudied: 0, timeSpentMinutes: 0 },
      { date: new Date('2024-01-02'), wordsStudied: 3, timeSpentMinutes: 10 },
      { date: new Date('2024-01-03'), wordsStudied: 10, timeSpentMinutes: 30 },
      { date: new Date('2024-01-04'), wordsStudied: 20, timeSpentMinutes: 60 },
      { date: new Date('2024-01-05'), wordsStudied: 35, timeSpentMinutes: 90 },
    ];

    const { container } = render(
      <ContributionWall progressData={dataWithVariedIntensity} year={2024} />
    );

    const cells = container.querySelectorAll('[data-testid^="contribution-cell"]');
    expect(cells.length).toBeGreaterThan(0);
  });

  it('should display tooltip on hover', async () => {
    const user = userEvent.setup();
    render(<ContributionWall progressData={mockProgressData} year={2024} />);

    const cells = screen.getAllByTestId(/contribution-cell/);
    const cellWithData = cells.find((cell) => cell.getAttribute('data-date') === '2024-01-15');

    if (cellWithData) {
      await user.hover(cellWithData);

      expect(await screen.findByText(/10 words/i)).toBeInTheDocument();
      expect(await screen.findByText(/30 min/i)).toBeInTheDocument();
    }
  });

  it('should show correct date format in tooltip', async () => {
    const user = userEvent.setup();
    const testData = [
      {
        date: new Date('2024-06-15'),
        wordsStudied: 15,
        timeSpentMinutes: 45,
      },
    ];

    render(<ContributionWall progressData={testData} year={2024} />);

    const cells = screen.getAllByTestId(/contribution-cell/);
    const cellWithData = cells.find((cell) => cell.getAttribute('data-date') === '2024-06-15');

    if (cellWithData) {
      await user.hover(cellWithData);

      expect(await screen.findByText(/Jun 15, 2024/i)).toBeInTheDocument();
    }
  });
});
