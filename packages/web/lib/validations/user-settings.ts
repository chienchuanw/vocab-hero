import { z } from 'zod';

export const TTS_LIMITS = {
  SPEED: { MIN: 0.1, MAX: 10 },
  VOLUME: { MIN: 0, MAX: 1 },
  PITCH: { MIN: 0, MAX: 2 },
} as const;

export const CARDS_PER_SESSION_LIMITS = {
  MIN: 5,
  MAX: 100,
} as const;

export const SUPPORTED_LANGUAGES = ['en', 'zh-TW'] as const;

export const STUDY_MODES = [
  'FLASHCARD',
  'MULTIPLE_CHOICE',
  'SPELLING',
  'MATCHING',
  'RANDOM',
  'LISTENING',
] as const;

export const THEME_PREFERENCES = ['LIGHT', 'DARK', 'SYSTEM'] as const;

export const themePreferenceSchema = z.enum(THEME_PREFERENCES);

export const studyModeSchema = z.enum(STUDY_MODES);

export const languageSchema = z.enum(SUPPORTED_LANGUAGES);

export const ttsSettingsSchema = z.object({
  ttsSpeed: z
    .number()
    .min(TTS_LIMITS.SPEED.MIN, `Speed must be at least ${TTS_LIMITS.SPEED.MIN}`)
    .max(TTS_LIMITS.SPEED.MAX, `Speed cannot exceed ${TTS_LIMITS.SPEED.MAX}`)
    .optional(),
  ttsVolume: z
    .number()
    .min(TTS_LIMITS.VOLUME.MIN, `Volume must be at least ${TTS_LIMITS.VOLUME.MIN}`)
    .max(TTS_LIMITS.VOLUME.MAX, `Volume cannot exceed ${TTS_LIMITS.VOLUME.MAX}`)
    .optional(),
  ttsPitch: z
    .number()
    .min(TTS_LIMITS.PITCH.MIN, `Pitch must be at least ${TTS_LIMITS.PITCH.MIN}`)
    .max(TTS_LIMITS.PITCH.MAX, `Pitch cannot exceed ${TTS_LIMITS.PITCH.MAX}`)
    .optional(),
  ttsVoice: z.string().nullable().optional(),
});

export const studySettingsSchema = z.object({
  cardsPerSession: z
    .number()
    .int('Cards per session must be a whole number')
    .min(
      CARDS_PER_SESSION_LIMITS.MIN,
      `Cards per session must be at least ${CARDS_PER_SESSION_LIMITS.MIN}`
    )
    .max(
      CARDS_PER_SESSION_LIMITS.MAX,
      `Cards per session cannot exceed ${CARDS_PER_SESSION_LIMITS.MAX}`
    )
    .optional(),
  defaultStudyMode: studyModeSchema.optional(),
  autoAdvance: z.boolean().optional(),
  showReading: z.boolean().optional(),
});

export const updateUserSettingsSchema = z.object({
  theme: themePreferenceSchema.optional(),
  ttsSpeed: z
    .number()
    .min(TTS_LIMITS.SPEED.MIN, `Speed must be at least ${TTS_LIMITS.SPEED.MIN}`)
    .max(TTS_LIMITS.SPEED.MAX, `Speed cannot exceed ${TTS_LIMITS.SPEED.MAX}`)
    .optional(),
  ttsVolume: z
    .number()
    .min(TTS_LIMITS.VOLUME.MIN, `Volume must be at least ${TTS_LIMITS.VOLUME.MIN}`)
    .max(TTS_LIMITS.VOLUME.MAX, `Volume cannot exceed ${TTS_LIMITS.VOLUME.MAX}`)
    .optional(),
  ttsPitch: z
    .number()
    .min(TTS_LIMITS.PITCH.MIN, `Pitch must be at least ${TTS_LIMITS.PITCH.MIN}`)
    .max(TTS_LIMITS.PITCH.MAX, `Pitch cannot exceed ${TTS_LIMITS.PITCH.MAX}`)
    .optional(),
  ttsVoice: z.string().nullable().optional(),
  cardsPerSession: z
    .number()
    .int('Cards per session must be a whole number')
    .min(
      CARDS_PER_SESSION_LIMITS.MIN,
      `Cards per session must be at least ${CARDS_PER_SESSION_LIMITS.MIN}`
    )
    .max(
      CARDS_PER_SESSION_LIMITS.MAX,
      `Cards per session cannot exceed ${CARDS_PER_SESSION_LIMITS.MAX}`
    )
    .optional(),
  defaultStudyMode: studyModeSchema.optional(),
  autoAdvance: z.boolean().optional(),
  showReading: z.boolean().optional(),
  language: languageSchema.optional(),
});

export const userSettingsResponseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  theme: themePreferenceSchema,
  ttsSpeed: z.number(),
  ttsVolume: z.number(),
  ttsPitch: z.number(),
  ttsVoice: z.string().nullable(),
  cardsPerSession: z.number().int(),
  defaultStudyMode: studyModeSchema,
  autoAdvance: z.boolean(),
  showReading: z.boolean(),
  language: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ThemePreference = z.infer<typeof themePreferenceSchema>;
export type StudyMode = z.infer<typeof studyModeSchema>;
export type Language = z.infer<typeof languageSchema>;
export type TTSSettings = z.infer<typeof ttsSettingsSchema>;
export type StudySettings = z.infer<typeof studySettingsSchema>;
export type UpdateUserSettingsInput = z.infer<typeof updateUserSettingsSchema>;
export type UserSettingsResponse = z.infer<typeof userSettingsResponseSchema>;
