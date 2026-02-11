import { describe, it, expect } from 'vitest';
import {
  updateUserSettingsSchema,
  userSettingsResponseSchema,
  themePreferenceSchema,
  ttsSettingsSchema,
  studySettingsSchema,
  TTS_LIMITS,
  CARDS_PER_SESSION_LIMITS,
} from './user-settings';

describe('UserSettings Validation Schemas', () => {
  describe('themePreferenceSchema', () => {
    it('should accept valid theme values', () => {
      expect(themePreferenceSchema.safeParse('LIGHT').success).toBe(true);
      expect(themePreferenceSchema.safeParse('DARK').success).toBe(true);
      expect(themePreferenceSchema.safeParse('SYSTEM').success).toBe(true);
    });

    it('should reject invalid theme values', () => {
      expect(themePreferenceSchema.safeParse('invalid').success).toBe(false);
      expect(themePreferenceSchema.safeParse('light').success).toBe(false);
      expect(themePreferenceSchema.safeParse('').success).toBe(false);
    });
  });

  describe('ttsSettingsSchema', () => {
    it('should accept valid TTS speed values', () => {
      expect(ttsSettingsSchema.safeParse({ ttsSpeed: 1.0 }).success).toBe(true);
      expect(ttsSettingsSchema.safeParse({ ttsSpeed: TTS_LIMITS.SPEED.MIN }).success).toBe(true);
      expect(ttsSettingsSchema.safeParse({ ttsSpeed: TTS_LIMITS.SPEED.MAX }).success).toBe(true);
    });

    it('should reject TTS speed outside valid range', () => {
      expect(ttsSettingsSchema.safeParse({ ttsSpeed: 0 }).success).toBe(false);
      expect(ttsSettingsSchema.safeParse({ ttsSpeed: 11 }).success).toBe(false);
    });

    it('should accept valid TTS volume values', () => {
      expect(ttsSettingsSchema.safeParse({ ttsVolume: 0.5 }).success).toBe(true);
      expect(ttsSettingsSchema.safeParse({ ttsVolume: TTS_LIMITS.VOLUME.MIN }).success).toBe(true);
      expect(ttsSettingsSchema.safeParse({ ttsVolume: TTS_LIMITS.VOLUME.MAX }).success).toBe(true);
    });

    it('should reject TTS volume outside valid range', () => {
      expect(ttsSettingsSchema.safeParse({ ttsVolume: -0.1 }).success).toBe(false);
      expect(ttsSettingsSchema.safeParse({ ttsVolume: 1.1 }).success).toBe(false);
    });

    it('should accept valid TTS pitch values', () => {
      expect(ttsSettingsSchema.safeParse({ ttsPitch: 1.0 }).success).toBe(true);
      expect(ttsSettingsSchema.safeParse({ ttsPitch: TTS_LIMITS.PITCH.MIN }).success).toBe(true);
      expect(ttsSettingsSchema.safeParse({ ttsPitch: TTS_LIMITS.PITCH.MAX }).success).toBe(true);
    });

    it('should reject TTS pitch outside valid range', () => {
      expect(ttsSettingsSchema.safeParse({ ttsPitch: -0.1 }).success).toBe(false);
      expect(ttsSettingsSchema.safeParse({ ttsPitch: 2.1 }).success).toBe(false);
    });

    it('should accept optional ttsVoice as string or null', () => {
      expect(ttsSettingsSchema.safeParse({ ttsVoice: 'Google Japanese' }).success).toBe(true);
      expect(ttsSettingsSchema.safeParse({ ttsVoice: null }).success).toBe(true);
      expect(ttsSettingsSchema.safeParse({}).success).toBe(true);
    });
  });

  describe('studySettingsSchema', () => {
    it('should accept valid cardsPerSession values', () => {
      expect(studySettingsSchema.safeParse({ cardsPerSession: 20 }).success).toBe(true);
      expect(
        studySettingsSchema.safeParse({ cardsPerSession: CARDS_PER_SESSION_LIMITS.MIN }).success
      ).toBe(true);
      expect(
        studySettingsSchema.safeParse({ cardsPerSession: CARDS_PER_SESSION_LIMITS.MAX }).success
      ).toBe(true);
    });

    it('should reject cardsPerSession outside valid range', () => {
      expect(studySettingsSchema.safeParse({ cardsPerSession: 4 }).success).toBe(false);
      expect(studySettingsSchema.safeParse({ cardsPerSession: 101 }).success).toBe(false);
    });

    it('should reject non-integer cardsPerSession', () => {
      expect(studySettingsSchema.safeParse({ cardsPerSession: 10.5 }).success).toBe(false);
    });

    it('should accept valid defaultStudyMode values', () => {
      expect(studySettingsSchema.safeParse({ defaultStudyMode: 'FLASHCARD' }).success).toBe(true);
      expect(studySettingsSchema.safeParse({ defaultStudyMode: 'MULTIPLE_CHOICE' }).success).toBe(
        true
      );
      expect(studySettingsSchema.safeParse({ defaultStudyMode: 'SPELLING' }).success).toBe(true);
      expect(studySettingsSchema.safeParse({ defaultStudyMode: 'MATCHING' }).success).toBe(true);
      expect(studySettingsSchema.safeParse({ defaultStudyMode: 'RANDOM' }).success).toBe(true);
      expect(studySettingsSchema.safeParse({ defaultStudyMode: 'LISTENING' }).success).toBe(true);
    });

    it('should reject invalid defaultStudyMode values', () => {
      expect(studySettingsSchema.safeParse({ defaultStudyMode: 'INVALID' }).success).toBe(false);
      expect(studySettingsSchema.safeParse({ defaultStudyMode: 'flashcard' }).success).toBe(false);
    });

    it('should accept boolean autoAdvance values', () => {
      expect(studySettingsSchema.safeParse({ autoAdvance: true }).success).toBe(true);
      expect(studySettingsSchema.safeParse({ autoAdvance: false }).success).toBe(true);
    });

    it('should accept boolean showReading values', () => {
      expect(studySettingsSchema.safeParse({ showReading: true }).success).toBe(true);
      expect(studySettingsSchema.safeParse({ showReading: false }).success).toBe(true);
    });
  });

  describe('updateUserSettingsSchema', () => {
    it('should validate complete settings update', () => {
      const validData = {
        theme: 'DARK',
        ttsSpeed: 1.25,
        ttsVolume: 0.8,
        ttsPitch: 1.0,
        ttsVoice: 'Google Japanese',
        cardsPerSession: 30,
        defaultStudyMode: 'MULTIPLE_CHOICE',
        autoAdvance: true,
        showReading: false,
        language: 'en',
      };

      const result = updateUserSettingsSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should make all fields optional', () => {
      const result = updateUserSettingsSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should allow partial updates', () => {
      const partialData = {
        theme: 'LIGHT',
        ttsSpeed: 0.75,
      };

      const result = updateUserSettingsSchema.safeParse(partialData);
      expect(result.success).toBe(true);
    });

    it('should validate language field', () => {
      expect(updateUserSettingsSchema.safeParse({ language: 'en' }).success).toBe(true);
      expect(updateUserSettingsSchema.safeParse({ language: 'zh-TW' }).success).toBe(true);
    });

    it('should reject invalid language values', () => {
      expect(updateUserSettingsSchema.safeParse({ language: 'invalid' }).success).toBe(false);
      expect(updateUserSettingsSchema.safeParse({ language: 'EN' }).success).toBe(false);
    });
  });

  describe('userSettingsResponseSchema', () => {
    it('should validate complete user settings response', () => {
      const validResponse = {
        id: 'settings123',
        userId: 'user123',
        theme: 'SYSTEM',
        ttsSpeed: 1.0,
        ttsVolume: 1.0,
        ttsPitch: 1.0,
        ttsVoice: null,
        cardsPerSession: 20,
        defaultStudyMode: 'FLASHCARD',
        autoAdvance: false,
        showReading: true,
        language: 'en',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = userSettingsResponseSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });

    it('should require all fields in response', () => {
      const incompleteResponse = {
        id: 'settings123',
        userId: 'user123',
        theme: 'SYSTEM',
      };

      const result = userSettingsResponseSchema.safeParse(incompleteResponse);
      expect(result.success).toBe(false);
    });

    it('should validate ttsVoice as string or null', () => {
      const withVoice = {
        id: 'settings123',
        userId: 'user123',
        theme: 'SYSTEM',
        ttsSpeed: 1.0,
        ttsVolume: 1.0,
        ttsPitch: 1.0,
        ttsVoice: 'Google Japanese',
        cardsPerSession: 20,
        defaultStudyMode: 'FLASHCARD',
        autoAdvance: false,
        showReading: true,
        language: 'en',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const withNullVoice = {
        ...withVoice,
        ttsVoice: null,
      };

      expect(userSettingsResponseSchema.safeParse(withVoice).success).toBe(true);
      expect(userSettingsResponseSchema.safeParse(withNullVoice).success).toBe(true);
    });
  });
});
