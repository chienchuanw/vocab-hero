import { prisma } from './prisma';

export const DEFAULT_USER_EMAIL = 'default@vocab-hero.local';
export const DEFAULT_USER_NAME = 'Default User';

export async function getOrCreateDefaultUser() {
  const user = await prisma.user.upsert({
    where: { email: DEFAULT_USER_EMAIL },
    update: {},
    create: {
      email: DEFAULT_USER_EMAIL,
      name: DEFAULT_USER_NAME,
    },
  });

  return user;
}

export async function getDefaultUserId(): Promise<string> {
  const user = await getOrCreateDefaultUser();
  return user.id;
}

export async function recreateDefaultUserData(): Promise<string> {
  const user = await getOrCreateDefaultUser();
  const userId = user.id;

  await prisma.userSettings.upsert({
    where: { userId },
    update: {
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
    },
    create: {
      userId,
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
    },
  });

  await prisma.dailyGoal.upsert({
    where: { userId },
    update: {
      wordsPerDay: 10,
      minutesPerDay: 30,
      reminderTime: '10:00',
      pushEnabled: false,
    },
    create: {
      userId,
      wordsPerDay: 10,
      minutesPerDay: 30,
      reminderTime: '10:00',
      pushEnabled: false,
    },
  });

  await prisma.notificationPreference.upsert({
    where: { userId },
    update: {
      goalAchievementEnabled: true,
      streakWarningEnabled: true,
      studyReminderEnabled: true,
      milestoneEnabled: true,
      pushEnabled: false,
    },
    create: {
      userId,
      goalAchievementEnabled: true,
      streakWarningEnabled: true,
      studyReminderEnabled: true,
      milestoneEnabled: true,
      pushEnabled: false,
    },
  });

  return userId;
}
