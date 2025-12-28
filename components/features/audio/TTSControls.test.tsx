import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TTSControls } from './TTSControls';

/**
 * TTSControls Component Test Suite
 * Tests for TTS playback controls (speed, repeat)
 */

describe('TTSControls', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Speed Control', () => {
    it('should render speed control slider', () => {
      render(<TTSControls />);
      
      const speedLabel = screen.getByText(/speed/i);
      expect(speedLabel).toBeInTheDocument();
    });

    it('should display current speed value', () => {
      render(<TTSControls speed={1.0} />);
      
      expect(screen.getByText(/1\.0x/i)).toBeInTheDocument();
    });

    it('should call onSpeedChange when speed is adjusted', async () => {
      const user = userEvent.setup();
      const handleSpeedChange = vi.fn();
      
      render(<TTSControls speed={1.0} onSpeedChange={handleSpeedChange} />);
      
      const slider = screen.getByRole('slider', { name: /speed/i });
      await user.click(slider);
      
      expect(handleSpeedChange).toHaveBeenCalled();
    });

    it('should show speed presets', () => {
      render(<TTSControls />);
      
      expect(screen.getByText(/0\.5x/i)).toBeInTheDocument();
      expect(screen.getByText(/0\.75x/i)).toBeInTheDocument();
      expect(screen.getByText(/1\.0x/i)).toBeInTheDocument();
      expect(screen.getByText(/1\.25x/i)).toBeInTheDocument();
      expect(screen.getByText(/1\.5x/i)).toBeInTheDocument();
    });

    it('should apply speed preset when clicked', async () => {
      const user = userEvent.setup();
      const handleSpeedChange = vi.fn();
      
      render(<TTSControls speed={1.0} onSpeedChange={handleSpeedChange} />);
      
      const slowButton = screen.getByRole('button', { name: /0\.5x/i });
      await user.click(slowButton);
      
      expect(handleSpeedChange).toHaveBeenCalledWith(0.5);
    });
  });

  describe('Repeat Control', () => {
    it('should render repeat button', () => {
      render(<TTSControls />);
      
      const repeatButton = screen.getByRole('button', { name: /repeat/i });
      expect(repeatButton).toBeInTheDocument();
    });

    it('should call onRepeat when repeat button is clicked', async () => {
      const user = userEvent.setup();
      const handleRepeat = vi.fn();
      
      render(<TTSControls onRepeat={handleRepeat} />);
      
      const repeatButton = screen.getByRole('button', { name: /repeat/i });
      await user.click(repeatButton);
      
      expect(handleRepeat).toHaveBeenCalled();
    });

    it('should show active state when repeating', () => {
      render(<TTSControls isRepeating />);
      
      const repeatButton = screen.getByRole('button', { name: /repeat/i });
      expect(repeatButton).toHaveClass('bg-primary');
    });
  });

  describe('Compact Mode', () => {
    it('should render in compact mode', () => {
      render(<TTSControls compact />);
      
      const speedLabel = screen.queryByText(/speed/i);
      expect(speedLabel).not.toBeInTheDocument();
    });

    it('should show only essential controls in compact mode', () => {
      render(<TTSControls compact />);
      
      const repeatButton = screen.getByRole('button', { name: /repeat/i });
      expect(repeatButton).toBeInTheDocument();
    });
  });

  describe('Disabled State', () => {
    it('should disable all controls when disabled', () => {
      render(<TTSControls disabled />);
      
      const slider = screen.getByRole('slider', { name: /speed/i });
      const repeatButton = screen.getByRole('button', { name: /repeat/i });
      
      expect(slider).toBeDisabled();
      expect(repeatButton).toBeDisabled();
    });
  });
});

