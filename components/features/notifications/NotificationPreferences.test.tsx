import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificationPreferences } from './NotificationPreferences';

/**
 * NotificationPreferences Component Tests
 * Tests for notification preferences settings component
 */

const mockPreferences = {
  id: 'pref-1',
  userId: 'user-1',
  goalAchievementEnabled: true,
  streakWarningEnabled: true,
  studyReminderEnabled: false,
  milestoneEnabled: true,
  pushEnabled: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('NotificationPreferences', () => {
  it('should render notification preferences form', () => {
    render(<NotificationPreferences preferences={mockPreferences} onUpdate={vi.fn()} />);

    expect(screen.getByText(/notification preferences/i)).toBeInTheDocument();
  });

  it('should display all preference toggles', () => {
    render(<NotificationPreferences preferences={mockPreferences} onUpdate={vi.fn()} />);

    expect(screen.getByLabelText(/goal achievement/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/streak warning/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/study reminder/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/milestone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/push notifications/i)).toBeInTheDocument();
  });

  it('should show correct initial toggle states', () => {
    render(<NotificationPreferences preferences={mockPreferences} onUpdate={vi.fn()} />);

    expect(screen.getByLabelText(/goal achievement/i)).toBeChecked();
    expect(screen.getByLabelText(/streak warning/i)).toBeChecked();
    expect(screen.getByLabelText(/study reminder/i)).not.toBeChecked();
    expect(screen.getByLabelText(/milestone/i)).toBeChecked();
    expect(screen.getByLabelText(/push notifications/i)).not.toBeChecked();
  });

  it('should call onUpdate when toggling a preference', async () => {
    const user = userEvent.setup();
    const handleUpdate = vi.fn();

    render(<NotificationPreferences preferences={mockPreferences} onUpdate={handleUpdate} />);

    const studyReminderToggle = screen.getByLabelText(/study reminder/i);
    await user.click(studyReminderToggle);

    expect(handleUpdate).toHaveBeenCalledWith({
      studyReminderEnabled: true,
    });
  });

  it('should display descriptions for each preference', () => {
    render(<NotificationPreferences preferences={mockPreferences} onUpdate={vi.fn()} />);

    expect(screen.getByText(/when you complete your daily goal/i)).toBeInTheDocument();
    expect(screen.getByText(/when your streak is at risk/i)).toBeInTheDocument();
    expect(screen.getByText(/daily reminders to study/i)).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    render(<NotificationPreferences preferences={mockPreferences} onUpdate={vi.fn()} />);

    const form = screen.getByRole('group', { name: /notification preferences/i });
    expect(form).toBeInTheDocument();

    const toggles = screen.getAllByRole('switch');
    expect(toggles).toHaveLength(5);
  });

  it('should show loading state when updating', () => {
    render(
      <NotificationPreferences preferences={mockPreferences} onUpdate={vi.fn()} isLoading={true} />
    );

    const toggles = screen.getAllByRole('switch');
    toggles.forEach((toggle) => {
      expect(toggle).toBeDisabled();
    });
  });
});
