/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding desktop database...');

  // Create default user
  const user = await prisma.user.upsert({
    where: { email: 'default@vocab-hero.local' },
    update: {},
    create: {
      email: 'default@vocab-hero.local',
      name: 'Default User',
    },
  });

  console.log('Created default user:', user.id);

  // Create default UserSettings
  await prisma.userSettings.upsert({
    where: { userId: user.id },
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
      userId: user.id,
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

  console.log('Created user settings');

  // Create default DailyGoal
  await prisma.dailyGoal.upsert({
    where: { userId: user.id },
    update: {
      wordsPerDay: 10,
      minutesPerDay: 30,
      reminderTime: '10:00',
      pushEnabled: false,
    },
    create: {
      userId: user.id,
      wordsPerDay: 10,
      minutesPerDay: 30,
      reminderTime: '10:00',
      pushEnabled: false,
    },
  });

  console.log('Created daily goal');

  // Create default NotificationPreference
  await prisma.notificationPreference.upsert({
    where: { userId: user.id },
    update: {
      goalAchievementEnabled: true,
      streakWarningEnabled: true,
      studyReminderEnabled: true,
      milestoneEnabled: true,
      pushEnabled: false,
    },
    create: {
      userId: user.id,
      goalAchievementEnabled: true,
      streakWarningEnabled: true,
      studyReminderEnabled: true,
      milestoneEnabled: true,
      pushEnabled: false,
    },
  });

  console.log('Created notification preferences');

  // Create default UserStreak
  await prisma.userStreak.upsert({
    where: { userId: user.id },
    update: {
      currentStreak: 0,
      longestStreak: 0,
      freezesRemaining: 0,
    },
    create: {
      userId: user.id,
      currentStreak: 0,
      longestStreak: 0,
      freezesRemaining: 0,
    },
  });

  console.log('Created user streak');

  // Create sample VocabularyGroup
  const group = await prisma.vocabularyGroup.create({
    data: {
      name: 'Sample Vocabulary',
      description: 'Sample vocabulary for getting started',
      userId: user.id,
    },
  });

  console.log('Created sample vocabulary group:', group.id);

  // Create sample VocabularyItems
  const vocab1 = await prisma.vocabularyItem.create({
    data: {
      word: 'こんにちは',
      reading: 'こんにちは',
      meaning: 'hello, good afternoon',
      notes: 'Common greeting',
      groups: {
        connect: [{ id: group.id }],
      },
      exampleSentences: {
        create: [
          {
            sentence: 'こんにちは、元気ですか。',
            reading: 'こんにちは、げんきですか。',
            meaning: 'Hello, how are you?',
            order: 1,
          },
        ],
      },
    },
  });

  const vocab2 = await prisma.vocabularyItem.create({
    data: {
      word: 'ありがとう',
      reading: 'ありがとう',
      meaning: 'thank you',
      notes: 'Common expression of gratitude',
      groups: {
        connect: [{ id: group.id }],
      },
      exampleSentences: {
        create: [
          {
            sentence: 'ありがとうございます。',
            reading: 'ありがとうございます。',
            meaning: 'Thank you very much.',
            order: 1,
          },
        ],
      },
    },
  });

  const vocab3 = await prisma.vocabularyItem.create({
    data: {
      word: '勉強',
      reading: 'べんきょう',
      meaning: 'study',
      notes: 'Common noun/verb for studying',
      groups: {
        connect: [{ id: group.id }],
      },
      exampleSentences: {
        create: [
          {
            sentence: '毎日日本語を勉強します。',
            reading: 'まいにちにほんごをべんきょうします。',
            meaning: 'I study Japanese every day.',
            order: 1,
          },
        ],
      },
    },
  });

  console.log('Created sample vocabulary items:', vocab1.id, vocab2.id, vocab3.id);

  // Create review schedules for vocabulary items
  await prisma.reviewSchedule.create({
    data: {
      vocabularyItemId: vocab1.id,
      nextReviewDate: new Date(),
      easinessFactor: 2.5,
      interval: 0,
      repetitions: 0,
    },
  });

  await prisma.reviewSchedule.create({
    data: {
      vocabularyItemId: vocab2.id,
      nextReviewDate: new Date(),
      easinessFactor: 2.5,
      interval: 0,
      repetitions: 0,
    },
  });

  await prisma.reviewSchedule.create({
    data: {
      vocabularyItemId: vocab3.id,
      nextReviewDate: new Date(),
      easinessFactor: 2.5,
      interval: 0,
      repetitions: 0,
    },
  });

  console.log('Created review schedules');

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
