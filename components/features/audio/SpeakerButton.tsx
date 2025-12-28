'use client';

import { useState } from 'react';
import { Volume2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ttsEngine } from '@/lib/tts';
import type { TTSConfig } from '@/lib/tts';
import type { ButtonProps } from '@/components/ui/button';

/**
 * SpeakerButton component props
 */
export interface SpeakerButtonProps {
  /**
   * Text to speak when button is clicked
   */
  text: string;

  /**
   * Optional TTS configuration
   */
  config?: TTSConfig;

  /**
   * Button variant
   */
  variant?: ButtonProps['variant'];

  /**
   * Button size
   */
  size?: ButtonProps['size'];

  /**
   * Whether the button is disabled
   */
  disabled?: boolean;

  /**
   * Custom CSS class name
   */
  className?: string;

  /**
   * Custom aria label
   */
  ariaLabel?: string;

  /**
   * Callback when speech starts
   */
  onSpeakStart?: () => void;

  /**
   * Callback when speech ends
   */
  onSpeakEnd?: () => void;

  /**
   * Callback when speech errors
   */
  onSpeakError?: (error: unknown) => void;
}

/**
 * SpeakerButton Component
 * 
 * A button component that plays text-to-speech pronunciation using Web Speech API.
 * Automatically hides when TTS is not supported in the browser.
 * 
 * Features:
 * - Japanese voice support
 * - Loading state during playback
 * - Error handling
 * - Customizable appearance
 */
export function SpeakerButton({
  text,
  config,
  variant = 'ghost',
  size = 'sm',
  disabled = false,
  className,
  ariaLabel = 'Play pronunciation',
  onSpeakStart,
  onSpeakEnd,
  onSpeakError,
}: SpeakerButtonProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Hide button if TTS is not supported
  if (!ttsEngine.isSupported()) {
    return null;
  }

  /**
   * Handle button click to play TTS
   */
  const handleClick = async () => {
    if (disabled || isSpeaking) {
      return;
    }

    try {
      setIsSpeaking(true);
      onSpeakStart?.();

      // Stop any ongoing speech before starting new one
      ttsEngine.stop();

      // Speak the text
      await ttsEngine.speak(text, config);

      onSpeakEnd?.();
    } catch (error) {
      console.error('TTS playback error:', error);
      onSpeakError?.(error);
    } finally {
      setIsSpeaking(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={disabled || isSpeaking}
      className={className}
      aria-label={ariaLabel}
      type="button"
    >
      {isSpeaking ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Volume2 className="h-4 w-4" />
      )}
    </Button>
  );
}

