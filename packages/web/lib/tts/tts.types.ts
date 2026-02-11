/**
 * Text-to-Speech (TTS) Type Definitions
 * 
 * This file contains TypeScript type definitions for the TTS functionality
 * using the Web Speech API for Japanese pronunciation.
 */

/**
 * TTS playback speed options
 * Range: 0.1 to 10 (1.0 is normal speed)
 */
export type TTSSpeed = number;

/**
 * TTS volume options
 * Range: 0 to 1 (1.0 is maximum volume)
 */
export type TTSVolume = number;

/**
 * TTS pitch options
 * Range: 0 to 2 (1.0 is normal pitch)
 */
export type TTSPitch = number;

/**
 * TTS configuration options
 */
export interface TTSConfig {
  /**
   * Playback speed (0.1 to 10, default: 1.0)
   */
  speed?: TTSSpeed;

  /**
   * Volume level (0 to 1, default: 1.0)
   */
  volume?: TTSVolume;

  /**
   * Voice pitch (0 to 2, default: 1.0)
   */
  pitch?: TTSPitch;

  /**
   * Language code (default: 'ja-JP' for Japanese)
   */
  lang?: string;

  /**
   * Preferred voice name (optional)
   * If not specified, browser will use default Japanese voice
   */
  voiceName?: string;
}

/**
 * TTS playback state
 */
export type TTSState = 'idle' | 'speaking' | 'paused' | 'error';

/**
 * TTS error types
 */
export type TTSErrorType = 
  | 'NOT_SUPPORTED'      // Web Speech API not supported
  | 'NO_VOICES'          // No voices available
  | 'NO_JAPANESE_VOICE'  // No Japanese voice found
  | 'PLAYBACK_ERROR'     // Error during playback
  | 'CANCELLED';         // Playback was cancelled

/**
 * TTS error information
 */
export interface TTSError {
  type: TTSErrorType;
  message: string;
  originalError?: Error;
}

/**
 * TTS voice information
 */
export interface TTSVoice {
  /**
   * Voice name
   */
  name: string;

  /**
   * Language code (e.g., 'ja-JP')
   */
  lang: string;

  /**
   * Whether this is the default voice
   */
  default: boolean;

  /**
   * Whether this voice is local (offline) or remote (online)
   */
  localService: boolean;

  /**
   * Voice URI (unique identifier)
   */
  voiceURI: string;
}

/**
 * TTS engine interface
 * Defines the contract for TTS functionality
 */
export interface TTSEngine {
  /**
   * Check if TTS is supported in the current browser
   */
  isSupported(): boolean;

  /**
   * Get available voices
   */
  getVoices(): TTSVoice[];

  /**
   * Get Japanese voices only
   */
  getJapaneseVoices(): TTSVoice[];

  /**
   * Speak the given text
   * @param text - Text to speak
   * @param config - Optional TTS configuration
   * @returns Promise that resolves when speech completes or rejects on error
   */
  speak(text: string, config?: TTSConfig): Promise<void>;

  /**
   * Stop current speech
   */
  stop(): void;

  /**
   * Pause current speech
   */
  pause(): void;

  /**
   * Resume paused speech
   */
  resume(): void;

  /**
   * Get current playback state
   */
  getState(): TTSState;
}

/**
 * Default TTS configuration
 */
export const DEFAULT_TTS_CONFIG: Required<TTSConfig> = {
  speed: 1.0,
  volume: 1.0,
  pitch: 1.0,
  lang: 'ja-JP',
  voiceName: '',
};

/**
 * TTS speed presets
 */
export const TTS_SPEED_PRESETS = {
  VERY_SLOW: 0.5,
  SLOW: 0.75,
  NORMAL: 1.0,
  FAST: 1.25,
  VERY_FAST: 1.5,
} as const;

/**
 * Minimum and maximum values for TTS parameters
 */
export const TTS_LIMITS = {
  SPEED: { MIN: 0.1, MAX: 10 },
  VOLUME: { MIN: 0, MAX: 1 },
  PITCH: { MIN: 0, MAX: 2 },
} as const;

