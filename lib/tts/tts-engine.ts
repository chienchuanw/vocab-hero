/**
 * Text-to-Speech Engine Implementation
 *
 * This file implements a wrapper around the Web Speech API for Japanese pronunciation.
 * Provides a clean interface for TTS functionality with error handling and configuration.
 */

import type { TTSConfig, TTSState, TTSVoice, TTSError, TTSEngine as ITTSEngine } from './tts.types';
import { DEFAULT_TTS_CONFIG } from './tts.types';

/**
 * TTSEngine class
 * Implements the TTS functionality using Web Speech API
 */
export class TTSEngine implements ITTSEngine {
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private state: TTSState = 'idle';

  /**
   * Check if Web Speech API is supported in the current browser
   */
  isSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      'speechSynthesis' in window &&
      window.speechSynthesis !== undefined
    );
  }

  /**
   * Get all available voices
   */
  getVoices(): TTSVoice[] {
    if (!this.isSupported()) {
      return [];
    }

    const voices = window.speechSynthesis.getVoices();
    return voices.map((voice) => ({
      name: voice.name,
      lang: voice.lang,
      default: voice.default,
      localService: voice.localService,
      voiceURI: voice.voiceURI,
    }));
  }

  /**
   * Get Japanese voices only
   */
  getJapaneseVoices(): TTSVoice[] {
    return this.getVoices().filter((voice) => voice.lang.startsWith('ja'));
  }

  /**
   * Speak the given text with optional configuration
   *
   * @param text - Text to speak
   * @param config - Optional TTS configuration
   * @returns Promise that resolves when speech completes
   */
  async speak(text: string, config?: TTSConfig): Promise<void> {
    if (!this.isSupported()) {
      throw this.createError('NOT_SUPPORTED', 'Web Speech API is not supported in this browser');
    }

    // Cancel any ongoing speech
    this.stop();

    // Merge config with defaults
    const finalConfig = { ...DEFAULT_TTS_CONFIG, ...config };

    // Create utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = finalConfig.lang;
    utterance.rate = finalConfig.speed;
    utterance.volume = finalConfig.volume;
    utterance.pitch = finalConfig.pitch;

    // Set voice if specified
    if (finalConfig.voiceName) {
      const voices = window.speechSynthesis.getVoices();
      const selectedVoice = voices.find((v) => v.name === finalConfig.voiceName);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    } else {
      // Auto-select Japanese voice if available
      const japaneseVoices = this.getJapaneseVoices();
      if (japaneseVoices.length > 0) {
        const voices = window.speechSynthesis.getVoices();
        const selectedVoice = voices.find((v) => v.lang.startsWith('ja'));
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      }
    }

    this.currentUtterance = utterance;

    // Return promise that resolves when speech completes
    return new Promise((resolve, reject) => {
      utterance.onstart = () => {
        this.state = 'speaking';
      };

      utterance.onend = () => {
        this.state = 'idle';
        this.currentUtterance = null;
        resolve();
      };

      utterance.onerror = (event) => {
        this.state = 'error';
        this.currentUtterance = null;
        reject(this.createError('PLAYBACK_ERROR', `Speech synthesis error: ${event.error}`));
      };

      try {
        window.speechSynthesis.speak(utterance);
      } catch (error) {
        this.state = 'error';
        this.currentUtterance = null;
        reject(
          this.createError('PLAYBACK_ERROR', 'Failed to start speech synthesis', error as Error)
        );
      }
    });
  }

  /**
   * Stop current speech
   */
  stop(): void {
    if (this.isSupported()) {
      window.speechSynthesis.cancel();
      this.state = 'idle';
      this.currentUtterance = null;
    }
  }

  /**
   * Pause current speech
   */
  pause(): void {
    if (this.isSupported() && this.state === 'speaking') {
      window.speechSynthesis.pause();
      this.state = 'paused';
    }
  }

  /**
   * Resume paused speech
   */
  resume(): void {
    if (this.isSupported() && this.state === 'paused') {
      window.speechSynthesis.resume();
      this.state = 'speaking';
    }
  }

  /**
   * Get current playback state
   */
  getState(): TTSState {
    return this.state;
  }

  /**
   * Create a TTS error object
   */
  private createError(type: TTSError['type'], message: string, originalError?: Error): TTSError {
    return {
      type,
      message,
      originalError,
    };
  }
}

/**
 * Create a singleton instance of TTSEngine
 */
export const ttsEngine = new TTSEngine();
