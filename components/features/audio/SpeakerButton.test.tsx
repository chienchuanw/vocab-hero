import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SpeakerButton } from './SpeakerButton';
import * as ttsModule from '@/lib/tts';

/**
 * SpeakerButton Component Test Suite
 * Tests for TTS speaker button functionality
 */

vi.mock('@/lib/tts', () => ({
  ttsEngine: {
    isSupported: vi.fn(() => true),
    speak: vi.fn(() => Promise.resolve()),
    stop: vi.fn(),
    getState: vi.fn(() => 'idle'),
  },
}));

describe('SpeakerButton', () => {
  const mockTTSEngine = ttsModule.ttsEngine;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render speaker button', () => {
      render(<SpeakerButton text="こんにちは" />);
      
      const button = screen.getByRole('button', { name: /play pronunciation/i });
      expect(button).toBeInTheDocument();
    });

    it('should not render when TTS is not supported', () => {
      vi.mocked(mockTTSEngine.isSupported).mockReturnValue(false);
      
      const { container } = render(<SpeakerButton text="こんにちは" />);
      
      expect(container.firstChild).toBeNull();
    });

    it('should render with custom aria label', () => {
      render(<SpeakerButton text="こんにちは" ariaLabel="Custom label" />);
      
      const button = screen.getByRole('button', { name: /custom label/i });
      expect(button).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(<SpeakerButton text="こんにちは" className="custom-class" />);
      
      const button = screen.getByRole('button', { name: /play pronunciation/i });
      expect(button).toHaveClass('custom-class');
    });
  });

  describe('TTS Playback', () => {
    it('should call ttsEngine.speak when clicked', async () => {
      const user = userEvent.setup();
      render(<SpeakerButton text="こんにちは" />);
      
      const button = screen.getByRole('button', { name: /play pronunciation/i });
      await user.click(button);
      
      expect(mockTTSEngine.speak).toHaveBeenCalledWith('こんにちは', undefined);
    });

    it('should pass custom TTS config', async () => {
      const user = userEvent.setup();
      const config = { speed: 0.8, volume: 0.9 };
      
      render(<SpeakerButton text="こんにちは" config={config} />);
      
      const button = screen.getByRole('button', { name: /play pronunciation/i });
      await user.click(button);
      
      expect(mockTTSEngine.speak).toHaveBeenCalledWith('こんにちは', config);
    });

    it('should stop current speech before starting new one', async () => {
      const user = userEvent.setup();
      render(<SpeakerButton text="こんにちは" />);
      
      const button = screen.getByRole('button', { name: /play pronunciation/i });
      await user.click(button);
      
      expect(mockTTSEngine.stop).toHaveBeenCalled();
      expect(mockTTSEngine.speak).toHaveBeenCalled();
    });

    it('should handle TTS errors gracefully', async () => {
      const user = userEvent.setup();
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      vi.mocked(mockTTSEngine.speak).mockRejectedValue(new Error('TTS error'));
      
      render(<SpeakerButton text="こんにちは" />);
      
      const button = screen.getByRole('button', { name: /play pronunciation/i });
      await user.click(button);
      
      expect(consoleError).toHaveBeenCalled();
      consoleError.mockRestore();
    });
  });

  describe('Button States', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<SpeakerButton text="こんにちは" disabled />);
      
      const button = screen.getByRole('button', { name: /play pronunciation/i });
      expect(button).toBeDisabled();
    });

    it('should not call TTS when disabled', async () => {
      const user = userEvent.setup();
      render(<SpeakerButton text="こんにちは" disabled />);
      
      const button = screen.getByRole('button', { name: /play pronunciation/i });
      await user.click(button);
      
      expect(mockTTSEngine.speak).not.toHaveBeenCalled();
    });

    it('should show loading state while speaking', async () => {
      const user = userEvent.setup();
      let resolveSpeech: () => void;
      const speakPromise = new Promise<void>((resolve) => {
        resolveSpeech = resolve;
      });
      
      vi.mocked(mockTTSEngine.speak).mockReturnValue(speakPromise);
      vi.mocked(mockTTSEngine.getState).mockReturnValue('speaking');
      
      render(<SpeakerButton text="こんにちは" />);
      
      const button = screen.getByRole('button', { name: /play pronunciation/i });
      await user.click(button);
      
      expect(button).toBeDisabled();
      
      resolveSpeech!();
      await speakPromise;
    });
  });

  describe('Variants', () => {
    it('should render with default variant', () => {
      render(<SpeakerButton text="こんにちは" />);
      
      const button = screen.getByRole('button', { name: /play pronunciation/i });
      expect(button).toBeInTheDocument();
    });

    it('should render with ghost variant', () => {
      render(<SpeakerButton text="こんにちは" variant="ghost" />);
      
      const button = screen.getByRole('button', { name: /play pronunciation/i });
      expect(button).toBeInTheDocument();
    });
  });
});

