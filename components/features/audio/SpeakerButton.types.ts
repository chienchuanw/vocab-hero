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

