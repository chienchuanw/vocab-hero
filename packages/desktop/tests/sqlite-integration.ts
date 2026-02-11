import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
let passed = 0;
let failed = 0;
const results: { name: string; status: 'PASS' | 'FAIL'; error?: string }[] = [];

async function test(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    console.log(`  PASS  ${name}`);
    passed++;
    results.push({ name, status: 'PASS' });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`  FAIL  ${name}: ${msg}`);
    failed++;
    results.push({ name, status: 'FAIL', error: msg });
  }
}

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

async function cleanDatabase() {
  await prisma.notification.deleteMany();
  await prisma.notificationPreference.deleteMany();
  await prisma.userSettings.deleteMany();
  await prisma.userStreak.deleteMany();
  await prisma.dailyGoal.deleteMany();
  await prisma.progressLog.deleteMany();
  await prisma.studySession.deleteMany();
  await prisma.reviewSchedule.deleteMany();
  await prisma.exampleSentence.deleteMany();
  await prisma.sentenceCard.deleteMany();
  await prisma.vocabularyGroup.deleteMany();
  await prisma.vocabularyItem.deleteMany();
  await prisma.user.deleteMany();
}

let userId: string;
let vocabItemId: string;
let vocabItem2Id: string;
let groupId: string;

async function main() {
  console.log('=== SQLite Integration Tests ===\n');

  await cleanDatabase();

  // ─── 1. User CRUD ───
  await test('User CRUD', async () => {
    const user = await prisma.user.create({
      data: { name: 'Test User', email: 'test@vocab.hero' },
    });
    assert(!!user.id, 'User should have an id');
    assert(user.name === 'Test User', 'User name mismatch');

    const found = await prisma.user.findUnique({ where: { id: user.id } });
    assert(!!found, 'User not found by id');

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { name: 'Updated User' },
    });
    assert(updated.name === 'Updated User', 'User name not updated');

    userId = user.id;
  });

  // ─── 2. VocabularyItem CRUD ───
  await test('VocabularyItem CRUD', async () => {
    const item = await prisma.vocabularyItem.create({
      data: { word: 'hello', reading: 'konnichiwa', meaning: 'greeting' },
    });
    assert(!!item.id, 'VocabularyItem should have an id');

    const found = await prisma.vocabularyItem.findUnique({
      where: { id: item.id },
    });
    assert(!!found, 'VocabularyItem not found');

    const updated = await prisma.vocabularyItem.update({
      where: { id: item.id },
      data: { notes: 'common greeting' },
    });
    assert(updated.notes === 'common greeting', 'Notes not updated');

    vocabItemId = item.id;

    const item2 = await prisma.vocabularyItem.create({
      data: { word: 'goodbye', reading: 'sayounara', meaning: 'farewell' },
    });
    vocabItem2Id = item2.id;
  });

  // ─── 3. ExampleSentence CRUD ───
  await test('ExampleSentence CRUD', async () => {
    const sentence = await prisma.exampleSentence.create({
      data: {
        vocabularyItemId: vocabItemId,
        sentence: 'Hello world',
        meaning: 'Greeting the world',
        order: 1,
      },
    });
    assert(!!sentence.id, 'ExampleSentence should have an id');

    const found = await prisma.exampleSentence.findUnique({
      where: { id: sentence.id },
    });
    assert(!!found, 'ExampleSentence not found');

    const updated = await prisma.exampleSentence.update({
      where: { id: sentence.id },
      data: { reading: 'hello world reading' },
    });
    assert(updated.reading === 'hello world reading', 'Reading not updated');

    await prisma.exampleSentence.create({
      data: {
        vocabularyItemId: vocabItemId,
        sentence: 'Hello again',
        meaning: 'Another greeting',
        order: 2,
      },
    });
  });

  // ─── 4. SentenceCard CRUD ───
  await test('SentenceCard CRUD', async () => {
    const card = await prisma.sentenceCard.create({
      data: {
        japanese: 'hello japanese text',
        english: 'hello english text',
        notes: 'from screenshot',
      },
    });
    assert(!!card.id, 'SentenceCard should have an id');

    const found = await prisma.sentenceCard.findUnique({
      where: { id: card.id },
    });
    assert(!!found, 'SentenceCard not found');

    const updated = await prisma.sentenceCard.update({
      where: { id: card.id },
      data: { notes: 'updated notes' },
    });
    assert(updated.notes === 'updated notes', 'Notes not updated');

    await prisma.sentenceCard.delete({ where: { id: card.id } });
    const deleted = await prisma.sentenceCard.findUnique({
      where: { id: card.id },
    });
    assert(!deleted, 'SentenceCard should be deleted');
  });

  // ─── 5. VocabularyGroup CRUD ───
  await test('VocabularyGroup CRUD', async () => {
    const group = await prisma.vocabularyGroup.create({
      data: {
        name: 'JLPT N5',
        description: 'Basic vocabulary',
        userId: userId,
      },
    });
    assert(!!group.id, 'VocabularyGroup should have an id');

    const found = await prisma.vocabularyGroup.findUnique({
      where: { id: group.id },
    });
    assert(!!found, 'VocabularyGroup not found');

    const updated = await prisma.vocabularyGroup.update({
      where: { id: group.id },
      data: { description: 'Updated description' },
    });
    assert(updated.description === 'Updated description', 'Description not updated');

    groupId = group.id;
  });

  // ─── 6. ReviewSchedule CRUD ───
  await test('ReviewSchedule CRUD', async () => {
    const schedule = await prisma.reviewSchedule.create({
      data: {
        vocabularyItemId: vocabItemId,
        nextReviewDate: new Date('2026-03-01'),
        easinessFactor: 2.5,
        interval: 1,
        repetitions: 1,
      },
    });
    assert(!!schedule.id, 'ReviewSchedule should have an id');

    const found = await prisma.reviewSchedule.findUnique({
      where: { id: schedule.id },
    });
    assert(!!found, 'ReviewSchedule not found');

    const updated = await prisma.reviewSchedule.update({
      where: { id: schedule.id },
      data: {
        easinessFactor: 2.6,
        lastReviewDate: new Date('2026-02-10'),
      },
    });
    assert(updated.easinessFactor === 2.6, 'EasinessFactor not updated');
    assert(!!updated.lastReviewDate, 'lastReviewDate should be set');
  });

  // ─── 7. StudySession CRUD with string enum ───
  await test('StudySession CRUD (string enum studyMode)', async () => {
    const session = await prisma.studySession.create({
      data: {
        userId: userId,
        mode: 'study',
        studyMode: 'FLASHCARD',
        cardsReviewed: 10,
        correctAnswers: 8,
        timeSpentMinutes: 15,
        quizType: 'WORD_TO_MEANING',
        questionCount: 10,
      },
    });
    assert(!!session.id, 'StudySession should have an id');
    assert(session.studyMode === 'FLASHCARD', 'studyMode mismatch');
    assert(session.quizType === 'WORD_TO_MEANING', 'quizType mismatch');

    const updated = await prisma.studySession.update({
      where: { id: session.id },
      data: { completedAt: new Date(), studyMode: 'MULTIPLE_CHOICE' },
    });
    assert(updated.studyMode === 'MULTIPLE_CHOICE', 'studyMode not updated');
  });

  // ─── 8. ProgressLog CRUD ───
  await test('ProgressLog CRUD', async () => {
    const log = await prisma.progressLog.create({
      data: {
        userId: userId,
        date: new Date('2026-02-11'),
        wordsStudied: 20,
        newWords: 5,
        reviewWords: 15,
        timeSpentMinutes: 30,
        sessionsCompleted: 2,
        correctAnswers: 18,
        totalAnswers: 20,
      },
    });
    assert(!!log.id, 'ProgressLog should have an id');

    const found = await prisma.progressLog.findUnique({
      where: { id: log.id },
    });
    assert(!!found, 'ProgressLog not found');

    const updated = await prisma.progressLog.update({
      where: { id: log.id },
      data: { wordsStudied: 25 },
    });
    assert(updated.wordsStudied === 25, 'wordsStudied not updated');
  });

  // ─── 9. DailyGoal CRUD ───
  await test('DailyGoal CRUD', async () => {
    const goal = await prisma.dailyGoal.create({
      data: {
        userId: userId,
        wordsPerDay: 15,
        minutesPerDay: 45,
        reminderTime: '09:00',
        pushEnabled: true,
      },
    });
    assert(!!goal.id, 'DailyGoal should have an id');

    const updated = await prisma.dailyGoal.update({
      where: { id: goal.id },
      data: { wordsPerDay: 20 },
    });
    assert(updated.wordsPerDay === 20, 'wordsPerDay not updated');
  });

  // ─── 10. UserStreak CRUD ───
  await test('UserStreak CRUD', async () => {
    const streak = await prisma.userStreak.create({
      data: {
        userId: userId,
        currentStreak: 5,
        longestStreak: 10,
        lastStudyDate: new Date('2026-02-10'),
        freezesRemaining: 2,
      },
    });
    assert(!!streak.id, 'UserStreak should have an id');

    const updated = await prisma.userStreak.update({
      where: { id: streak.id },
      data: {
        currentStreak: 6,
        lastStudyDate: new Date('2026-02-11'),
      },
    });
    assert(updated.currentStreak === 6, 'currentStreak not updated');
  });

  // ─── 11. Notification CRUD with string enum ───
  await test('Notification CRUD (string enum type)', async () => {
    const notification = await prisma.notification.create({
      data: {
        userId: userId,
        type: 'GOAL_ACHIEVED',
        title: 'Daily goal reached!',
        message: 'You studied 20 words today.',
        priority: 'HIGH',
      },
    });
    assert(!!notification.id, 'Notification should have an id');
    assert(notification.type === 'GOAL_ACHIEVED', 'type mismatch');
    assert(notification.priority === 'HIGH', 'priority mismatch');

    const updated = await prisma.notification.update({
      where: { id: notification.id },
      data: { isRead: true },
    });
    assert(updated.isRead === true, 'isRead not updated');
  });

  // ─── 12. NotificationPreference CRUD ───
  await test('NotificationPreference CRUD', async () => {
    const pref = await prisma.notificationPreference.create({
      data: {
        userId: userId,
        goalAchievementEnabled: true,
        streakWarningEnabled: false,
        pushEnabled: true,
      },
    });
    assert(!!pref.id, 'NotificationPreference should have an id');

    const updated = await prisma.notificationPreference.update({
      where: { id: pref.id },
      data: { streakWarningEnabled: true },
    });
    assert(updated.streakWarningEnabled === true, 'streakWarningEnabled not updated');
  });

  // ─── 13. UserSettings CRUD ───
  await test('UserSettings CRUD', async () => {
    const settings = await prisma.userSettings.create({
      data: {
        userId: userId,
        theme: 'DARK',
        ttsSpeed: 1.2,
        cardsPerSession: 25,
        defaultStudyMode: 'FLASHCARD',
        autoAdvance: true,
        showReading: false,
        language: 'zh-TW',
      },
    });
    assert(!!settings.id, 'UserSettings should have an id');
    assert(settings.theme === 'DARK', 'theme mismatch');
    assert(settings.defaultStudyMode === 'FLASHCARD', 'defaultStudyMode mismatch');

    const updated = await prisma.userSettings.update({
      where: { id: settings.id },
      data: { theme: 'LIGHT', cardsPerSession: 30 },
    });
    assert(updated.theme === 'LIGHT', 'theme not updated');
    assert(updated.cardsPerSession === 30, 'cardsPerSession not updated');
  });

  // ─── SPECIAL CASE: DateTime ordering and filtering ───
  await test('DateTime ordering and filtering', async () => {
    const item1 = await prisma.sentenceCard.create({
      data: { japanese: 'first', english: 'first' },
    });
    await new Promise((r) => setTimeout(r, 50));
    const item2 = await prisma.sentenceCard.create({
      data: { japanese: 'second', english: 'second' },
    });

    const ordered = await prisma.sentenceCard.findMany({
      orderBy: { createdAt: 'desc' },
    });
    assert(ordered.length >= 2, 'Should have at least 2 sentence cards');
    assert(ordered[0].createdAt >= ordered[1].createdAt, 'Should be ordered desc by createdAt');

    const filtered = await prisma.sentenceCard.findMany({
      where: {
        createdAt: {
          gte: item1.createdAt,
          lte: item2.createdAt,
        },
      },
    });
    assert(filtered.length >= 2, 'Should find items in date range');

    await prisma.sentenceCard.deleteMany();
  });

  // ─── SPECIAL CASE: Many-to-Many (VocabularyGroup <-> VocabularyItem) ───
  await test('M:N connect VocabularyGroup <-> VocabularyItem', async () => {
    await prisma.vocabularyGroup.update({
      where: { id: groupId },
      data: {
        vocabularyItems: {
          connect: [{ id: vocabItemId }, { id: vocabItem2Id }],
        },
      },
    });

    const groupWithItems = await prisma.vocabularyGroup.findUnique({
      where: { id: groupId },
      include: { vocabularyItems: true },
    });
    assert(!!groupWithItems, 'Group not found');
    assert(
      groupWithItems!.vocabularyItems.length === 2,
      `Expected 2 items in group, got ${groupWithItems!.vocabularyItems.length}`
    );
  });

  await test('M:N disconnect VocabularyGroup <-> VocabularyItem', async () => {
    await prisma.vocabularyGroup.update({
      where: { id: groupId },
      data: {
        vocabularyItems: {
          disconnect: [{ id: vocabItem2Id }],
        },
      },
    });

    const groupWithItems = await prisma.vocabularyGroup.findUnique({
      where: { id: groupId },
      include: { vocabularyItems: true },
    });
    assert(
      groupWithItems!.vocabularyItems.length === 1,
      `Expected 1 item after disconnect, got ${groupWithItems!.vocabularyItems.length}`
    );
  });

  await test('M:N query from VocabularyItem side', async () => {
    const itemWithGroups = await prisma.vocabularyItem.findUnique({
      where: { id: vocabItemId },
      include: { groups: true },
    });
    assert(!!itemWithGroups, 'Item not found');
    assert(
      itemWithGroups!.groups.length === 1,
      `Expected 1 group for item, got ${itemWithGroups!.groups.length}`
    );
  });

  // ─── SPECIAL CASE: Cascade delete ───
  await test('Cascade delete: VocabularyItem -> ExampleSentence', async () => {
    const sentencesBefore = await prisma.exampleSentence.findMany({
      where: { vocabularyItemId: vocabItemId },
    });
    assert(
      sentencesBefore.length >= 2,
      `Expected >= 2 sentences before cascade, got ${sentencesBefore.length}`
    );

    const scheduleBefore = await prisma.reviewSchedule.findUnique({
      where: { vocabularyItemId: vocabItemId },
    });
    assert(!!scheduleBefore, 'ReviewSchedule should exist before cascade');

    await prisma.vocabularyItem.delete({ where: { id: vocabItemId } });

    const sentencesAfter = await prisma.exampleSentence.findMany({
      where: { vocabularyItemId: vocabItemId },
    });
    assert(
      sentencesAfter.length === 0,
      `ExampleSentences should be cascade deleted, got ${sentencesAfter.length}`
    );

    const scheduleAfter = await prisma.reviewSchedule.findUnique({
      where: { vocabularyItemId: vocabItemId },
    });
    assert(!scheduleAfter, 'ReviewSchedule should be cascade deleted');
  });

  // ─── SPECIAL CASE: Unique constraints ───
  await test('Unique constraint: ReviewSchedule.vocabularyItemId', async () => {
    const item = await prisma.vocabularyItem.create({
      data: { word: 'unique-test', reading: 'test', meaning: 'test' },
    });

    await prisma.reviewSchedule.create({
      data: {
        vocabularyItemId: item.id,
        nextReviewDate: new Date(),
      },
    });

    let duplicateError = false;
    try {
      await prisma.reviewSchedule.create({
        data: {
          vocabularyItemId: item.id,
          nextReviewDate: new Date(),
        },
      });
    } catch {
      duplicateError = true;
    }
    assert(duplicateError, 'Should throw on duplicate ReviewSchedule.vocabularyItemId');

    await prisma.vocabularyItem.delete({ where: { id: item.id } });
  });

  await test('Compound unique: ProgressLog(userId, date)', async () => {
    const date = new Date('2026-06-15');

    await prisma.progressLog.upsert({
      where: { userId_date: { userId, date } },
      create: {
        userId,
        date,
        wordsStudied: 5,
      },
      update: {},
    });

    let duplicateError = false;
    try {
      await prisma.progressLog.create({
        data: { userId, date, wordsStudied: 10 },
      });
    } catch {
      duplicateError = true;
    }
    assert(duplicateError, 'Should throw on duplicate ProgressLog(userId, date)');
  });

  // ─── SPECIAL CASE: Additional string enum values ───
  await test('String enum: StudySession modes', async () => {
    const modes = ['FLASHCARD', 'MULTIPLE_CHOICE', 'SPELLING', 'MATCHING', 'LISTENING'];
    for (const mode of modes) {
      const session = await prisma.studySession.create({
        data: {
          userId,
          mode: 'study',
          studyMode: mode,
        },
      });
      assert(session.studyMode === mode, `studyMode should be ${mode}, got ${session.studyMode}`);
    }
  });

  await test('String enum: Notification types and priorities', async () => {
    const types = [
      'GOAL_ACHIEVED',
      'STREAK_WARNING',
      'STUDY_REMINDER',
      'MILESTONE_REACHED',
      'FREEZE_USED',
    ];
    const priorities = ['LOW', 'MEDIUM', 'HIGH'];

    for (const type of types) {
      const n = await prisma.notification.create({
        data: {
          userId,
          type,
          title: `Test ${type}`,
          message: 'Test message',
          priority: priorities[Math.floor(Math.random() * priorities.length)],
        },
      });
      assert(n.type === type, `type should be ${type}`);
    }
  });

  await test('String enum: Theme preferences', async () => {
    const themes = ['LIGHT', 'DARK', 'SYSTEM'];
    for (const theme of themes) {
      await prisma.userSettings.update({
        where: { userId },
        data: { theme },
      });
      const s = await prisma.userSettings.findUnique({ where: { userId } });
      assert(s!.theme === theme, `theme should be ${theme}, got ${s!.theme}`);
    }
  });

  // ─── SPECIAL CASE: Cascade delete User -> all children ───
  await test('Cascade delete: User -> all children', async () => {
    const sessionsBefore = await prisma.studySession.count({
      where: { userId },
    });
    assert(sessionsBefore > 0, 'Should have sessions before cascade');

    const notifsBefore = await prisma.notification.count({
      where: { userId },
    });
    assert(notifsBefore > 0, 'Should have notifications before cascade');

    await prisma.user.delete({ where: { id: userId } });

    const sessionsAfter = await prisma.studySession.count({
      where: { userId },
    });
    assert(sessionsAfter === 0, 'StudySessions should be cascade deleted');

    const notifsAfter = await prisma.notification.count({
      where: { userId },
    });
    assert(notifsAfter === 0, 'Notifications should be cascade deleted');

    const streakAfter = await prisma.userStreak.findUnique({
      where: { userId },
    });
    assert(!streakAfter, 'UserStreak should be cascade deleted');

    const goalAfter = await prisma.dailyGoal.findUnique({
      where: { userId },
    });
    assert(!goalAfter, 'DailyGoal should be cascade deleted');

    const settingsAfter = await prisma.userSettings.findUnique({
      where: { userId },
    });
    assert(!settingsAfter, 'UserSettings should be cascade deleted');

    const prefAfter = await prisma.notificationPreference.findUnique({
      where: { userId },
    });
    assert(!prefAfter, 'NotificationPreference should be cascade deleted');

    const groupsAfter = await prisma.vocabularyGroup.count({
      where: { userId },
    });
    assert(groupsAfter === 0, 'VocabularyGroups should be cascade deleted');

    const logsAfter = await prisma.progressLog.count({
      where: { userId },
    });
    assert(logsAfter === 0, 'ProgressLogs should be cascade deleted');
  });

  // ─── Final cleanup ───
  await cleanDatabase();

  // ─── Summary ───
  console.log('\n=== Results ===');
  console.log(`Total: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
  console.log(`Verdict: ${failed === 0 ? 'ALL TESTS PASSED' : `${failed} TEST(S) FAILED`}`);

  if (failed > 0) {
    console.log('\nFailed tests:');
    results
      .filter((r) => r.status === 'FAIL')
      .forEach((r) => console.log(`  - ${r.name}: ${r.error}`));
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error('Fatal error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
