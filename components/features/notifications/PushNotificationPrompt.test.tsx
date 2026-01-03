import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PushNotificationPrompt } from './PushNotificationPrompt';

/**
 * PushNotificationPrompt Component Tests
 * Tests for push notification permission request UI
 */

describe('PushNotificationPrompt', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render permission prompt', () => {
    render(<PushNotificationPrompt onPermissionGranted={vi.fn()} onPermissionDenied={vi.fn()} />);

    expect(screen.getByText(/enable push notifications/i)).toBeInTheDocument();
  });

  it('should display benefits of enabling notifications', () => {
    render(<PushNotificationPrompt onPermissionGranted={vi.fn()} onPermissionDenied={vi.fn()} />);

    expect(screen.getByText(/daily study reminders/i)).toBeInTheDocument();
    expect(screen.getByText(/goal achievement alerts/i)).toBeInTheDocument();
    expect(screen.getByText(/streak warnings/i)).toBeInTheDocument();
  });

  it('should have enable and maybe later buttons', () => {
    render(<PushNotificationPrompt onPermissionGranted={vi.fn()} onPermissionDenied={vi.fn()} />);

    expect(screen.getByRole('button', { name: /enable/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /maybe later/i })).toBeInTheDocument();
  });

  it('should call onPermissionGranted when user clicks enable', async () => {
    const user = userEvent.setup();
    const handlePermissionGranted = vi.fn();

    render(
      <PushNotificationPrompt
        onPermissionGranted={handlePermissionGranted}
        onPermissionDenied={vi.fn()}
      />
    );

    const enableButton = screen.getByRole('button', { name: /enable/i });
    await user.click(enableButton);

    expect(handlePermissionGranted).toHaveBeenCalled();
  });

  it('should call onPermissionDenied when user clicks maybe later', async () => {
    const user = userEvent.setup();
    const handlePermissionDenied = vi.fn();

    render(
      <PushNotificationPrompt
        onPermissionGranted={vi.fn()}
        onPermissionDenied={handlePermissionDenied}
      />
    );

    const maybeLaterButton = screen.getByRole('button', { name: /maybe later/i });
    await user.click(maybeLaterButton);

    expect(handlePermissionDenied).toHaveBeenCalled();
  });

  it('should show loading state when requesting permission', async () => {
    render(
      <PushNotificationPrompt
        onPermissionGranted={vi.fn()}
        onPermissionDenied={vi.fn()}
        isLoading={true}
      />
    );

    const enableButton = screen.getByRole('button', { name: /requesting/i });
    expect(enableButton).toBeDisabled();
    expect(enableButton).toHaveTextContent('Requesting...');
  });

  it('should display icon for each benefit', () => {
    render(<PushNotificationPrompt onPermissionGranted={vi.fn()} onPermissionDenied={vi.fn()} />);

    // Check for icons (using aria-hidden or role)
    const icons = screen.getAllByRole('img', { hidden: true });
    expect(icons.length).toBeGreaterThan(0);
  });

  it('should have proper accessibility attributes', () => {
    render(<PushNotificationPrompt onPermissionGranted={vi.fn()} onPermissionDenied={vi.fn()} />);

    const dialog = screen.getByRole('dialog', { name: /push notifications/i });
    expect(dialog).toBeInTheDocument();
  });

  it('should not show prompt if already dismissed', () => {
    render(
      <PushNotificationPrompt
        onPermissionGranted={vi.fn()}
        onPermissionDenied={vi.fn()}
        isDismissed={true}
      />
    );

    expect(screen.queryByText(/enable push notifications/i)).not.toBeInTheDocument();
  });
});
