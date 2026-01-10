import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OfflineBanner } from './OfflineBanner';
import * as useOnlineStatusModule from '@/hooks/useOnlineStatus';

vi.mock('@/hooks/useOnlineStatus');

describe('OfflineBanner', () => {
  it('should not render when online', () => {
    vi.spyOn(useOnlineStatusModule, 'useOnlineStatus').mockReturnValue(true);

    render(<OfflineBanner />);

    expect(screen.queryByText(/you are currently offline/i)).not.toBeInTheDocument();
  });

  it('should render banner when offline', () => {
    vi.spyOn(useOnlineStatusModule, 'useOnlineStatus').mockReturnValue(false);

    render(<OfflineBanner />);

    expect(screen.getByText(/you are currently offline/i)).toBeInTheDocument();
  });

  it('should display offline icon when offline', () => {
    vi.spyOn(useOnlineStatusModule, 'useOnlineStatus').mockReturnValue(false);

    render(<OfflineBanner />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});
