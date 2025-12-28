import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TTSEngine } from './tts-engine';
import type { TTSConfig } from './tts.types';

/**
 * TTS Engine Test Suite
 * Tests for Web Speech API wrapper functionality
 */

describe('TTSEngine', () => {
  let ttsEngine: TTSEngine;
  let mockSpeechSynthesis: SpeechSynthesis;
  let mockUtterance: SpeechSynthesisUtterance;

  beforeEach(() => {
    // Mock SpeechSynthesisUtterance
    mockUtterance = {
      text: '',
      lang: '',
      voice: null,
      volume: 1,
      rate: 1,
      pitch: 1,
      onend: null,
      onerror: null,
      onstart: null,
      onpause: null,
      onresume: null,
      onmark: null,
      onboundary: null,
    } as unknown as SpeechSynthesisUtterance;

    // Mock SpeechSynthesis
    mockSpeechSynthesis = {
      speaking: false,
      pending: false,
      paused: false,
      speak: vi.fn(),
      cancel: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
      getVoices: vi.fn(() => []),
      onvoiceschanged: null,
    } as unknown as SpeechSynthesis;

    // Mock global objects
    global.speechSynthesis = mockSpeechSynthesis;
    global.SpeechSynthesisUtterance = vi.fn(() => mockUtterance) as unknown as typeof SpeechSynthesisUtterance;

    ttsEngine = new TTSEngine();
  });

  describe('isSupported', () => {
    it('should return true when Web Speech API is available', () => {
      expect(ttsEngine.isSupported()).toBe(true);
    });

    it('should return false when Web Speech API is not available', () => {
      global.speechSynthesis = undefined as unknown as SpeechSynthesis;
      const engine = new TTSEngine();
      expect(engine.isSupported()).toBe(false);
    });
  });

  describe('getVoices', () => {
    it('should return empty array when no voices available', () => {
      const voices = ttsEngine.getVoices();
      expect(voices).toEqual([]);
    });

    it('should return available voices', () => {
      const mockVoices = [
        { name: 'Voice 1', lang: 'en-US', default: true, localService: true, voiceURI: 'voice1' },
        { name: 'Voice 2', lang: 'ja-JP', default: false, localService: true, voiceURI: 'voice2' },
      ] as SpeechSynthesisVoice[];

      vi.mocked(mockSpeechSynthesis.getVoices).mockReturnValue(mockVoices);

      const voices = ttsEngine.getVoices();
      expect(voices).toHaveLength(2);
      expect(voices[0]?.name).toBe('Voice 1');
      expect(voices[1]?.name).toBe('Voice 2');
    });
  });

  describe('getJapaneseVoices', () => {
    it('should return only Japanese voices', () => {
      const mockVoices = [
        { name: 'English Voice', lang: 'en-US', default: true, localService: true, voiceURI: 'en' },
        { name: 'Japanese Voice 1', lang: 'ja-JP', default: false, localService: true, voiceURI: 'ja1' },
        { name: 'Japanese Voice 2', lang: 'ja-JP', default: false, localService: true, voiceURI: 'ja2' },
      ] as SpeechSynthesisVoice[];

      vi.mocked(mockSpeechSynthesis.getVoices).mockReturnValue(mockVoices);

      const japaneseVoices = ttsEngine.getJapaneseVoices();
      expect(japaneseVoices).toHaveLength(2);
      expect(japaneseVoices.every(v => v.lang === 'ja-JP')).toBe(true);
    });

    it('should return empty array when no Japanese voices available', () => {
      const mockVoices = [
        { name: 'English Voice', lang: 'en-US', default: true, localService: true, voiceURI: 'en' },
      ] as SpeechSynthesisVoice[];

      vi.mocked(mockSpeechSynthesis.getVoices).mockReturnValue(mockVoices);

      const japaneseVoices = ttsEngine.getJapaneseVoices();
      expect(japaneseVoices).toEqual([]);
    });
  });

  describe('speak', () => {
    it('should throw error when TTS is not supported', async () => {
      global.speechSynthesis = undefined as unknown as SpeechSynthesis;
      const engine = new TTSEngine();

      await expect(engine.speak('test')).rejects.toThrow('NOT_SUPPORTED');
    });

    it('should call speechSynthesis.speak with correct text', async () => {
      const speakPromise = ttsEngine.speak('こんにちは');
      
      // Simulate successful speech
      if (mockUtterance.onend) {
        mockUtterance.onend(new Event('end') as SpeechSynthesisEvent);
      }

      await speakPromise;

      expect(mockSpeechSynthesis.speak).toHaveBeenCalled();
      expect(mockUtterance.text).toBe('こんにちは');
    });

    it('should apply custom configuration', async () => {
      const config: TTSConfig = {
        speed: 1.5,
        volume: 0.8,
        pitch: 1.2,
        lang: 'ja-JP',
      };

      const speakPromise = ttsEngine.speak('test', config);
      
      if (mockUtterance.onend) {
        mockUtterance.onend(new Event('end') as SpeechSynthesisEvent);
      }

      await speakPromise;

      expect(mockUtterance.rate).toBe(1.5);
      expect(mockUtterance.volume).toBe(0.8);
      expect(mockUtterance.pitch).toBe(1.2);
      expect(mockUtterance.lang).toBe('ja-JP');
    });
  });
});

