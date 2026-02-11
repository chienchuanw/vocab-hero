import { z } from 'zod';

// StudyMode enum values: FLASHCARD, MULTIPLE_CHOICE, SPELLING, MATCHING, RANDOM, LISTENING
export const StudyModeSchema = z.enum([
  'FLASHCARD',
  'MULTIPLE_CHOICE',
  'SPELLING',
  'MATCHING',
  'RANDOM',
  'LISTENING',
]);
export type StudyMode = z.infer<typeof StudyModeSchema>;
export const STUDY_MODES = StudyModeSchema.options;

// QuizType enum values: WORD_TO_MEANING, MEANING_TO_WORD, MIXED
export const QuizTypeSchema = z.enum(['WORD_TO_MEANING', 'MEANING_TO_WORD', 'MIXED']);
export type QuizType = z.infer<typeof QuizTypeSchema>;
export const QUIZ_TYPES = QuizTypeSchema.options;

// NotificationType enum values: GOAL_ACHIEVED, STREAK_WARNING, STUDY_REMINDER, MILESTONE_REACHED, FREEZE_USED
export const NotificationTypeSchema = z.enum([
  'GOAL_ACHIEVED',
  'STREAK_WARNING',
  'STUDY_REMINDER',
  'MILESTONE_REACHED',
  'FREEZE_USED',
]);
export type NotificationType = z.infer<typeof NotificationTypeSchema>;
export const NOTIFICATION_TYPES = NotificationTypeSchema.options;

// NotificationPriority enum values: LOW, MEDIUM, HIGH
export const NotificationPrioritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH']);
export type NotificationPriority = z.infer<typeof NotificationPrioritySchema>;
export const NOTIFICATION_PRIORITIES = NotificationPrioritySchema.options;

// ThemePreference enum values: LIGHT, DARK, SYSTEM
export const ThemePreferenceSchema = z.enum(['LIGHT', 'DARK', 'SYSTEM']);
export type ThemePreference = z.infer<typeof ThemePreferenceSchema>;
export const THEME_PREFERENCES = ThemePreferenceSchema.options;
