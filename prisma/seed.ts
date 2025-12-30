import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

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

  // Create vocabulary groups
  const group1 = await prisma.vocabularyGroup.create({
    data: {
      name: 'JLPT N5 Basics',
      description: 'Basic Japanese vocabulary for JLPT N5 level',
      userId: user.id,
    },
  });

  const group2 = await prisma.vocabularyGroup.create({
    data: {
      name: 'Daily Conversation',
      description: 'Common phrases for daily conversation',
      userId: user.id,
    },
  });

  console.log('Created vocabulary groups:', group1.id, group2.id);

  // Create vocabulary items with example sentences
  const vocab1 = await prisma.vocabularyItem.create({
    data: {
      word: '勉強',
      reading: 'べんきょう',
      meaning: 'study',
      notes: 'Common verb for studying',
      groups: {
        connect: [{ id: group1.id }],
      },
      exampleSentences: {
        create: [
          {
            sentence: '毎日日本語を勉強します。',
            reading: 'まいにちにほんごをべんきょうします。',
            meaning: 'I study Japanese every day.',
            order: 1,
          },
          {
            sentence: '図書館で勉強しています。',
            reading: 'としょかんでべんきょうしています。',
            meaning: 'I am studying at the library.',
            order: 2,
          },
        ],
      },
    },
  });

  const vocab2 = await prisma.vocabularyItem.create({
    data: {
      word: '食べる',
      reading: 'たべる',
      meaning: 'to eat',
      notes: 'Ichidan verb',
      groups: {
        connect: [{ id: group1.id }, { id: group2.id }],
      },
      exampleSentences: {
        create: [
          {
            sentence: '朝ごはんを食べます。',
            reading: 'あさごはんをたべます。',
            meaning: 'I eat breakfast.',
            order: 1,
          },
        ],
      },
    },
  });

  const vocab3 = await prisma.vocabularyItem.create({
    data: {
      word: 'こんにちは',
      reading: 'こんにちは',
      meaning: 'hello, good afternoon',
      notes: 'Common greeting',
      groups: {
        connect: [{ id: group2.id }],
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

  console.log('Created vocabulary items:', vocab1.id, vocab2.id, vocab3.id);

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

  // Create or update daily goal for user
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

  console.log('Created/updated daily goal');

  // Create or update notification preferences for user
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

  console.log('Created/updated notification preferences');

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
