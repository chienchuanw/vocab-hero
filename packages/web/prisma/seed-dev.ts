/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client';
import type {
  StudyMode,
  QuizType,
  NotificationType,
  NotificationPriority,
} from '@vocab-hero/shared';

const prisma = new PrismaClient();

const c = {
  red: (s: string) => `\x1b[31m${s}\x1b[0m`,
  green: (s: string) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
  blue: (s: string) => `\x1b[34m${s}\x1b[0m`,
  magenta: (s: string) => `\x1b[35m${s}\x1b[0m`,
  cyan: (s: string) => `\x1b[36m${s}\x1b[0m`,
  gray: (s: string) => `\x1b[2m${s}\x1b[0m`,
  bold: (s: string) => `\x1b[1m${s}\x1b[0m`,
};

const log = {
  success: (msg: string) => console.log(c.green(`[SUCCESS] ${msg}`)),
  info: (msg: string) => console.log(c.cyan(`[INFO] ${msg}`)),
  warning: (msg: string) => console.log(c.yellow(`[WARNING] ${msg}`)),
  error: (msg: string) => console.log(c.red(`[ERROR] ${msg}`)),
  section: (msg: string) => console.log(`\n${c.bold(c.blue(`[${msg}]`))}`),
  data: (msg: string) => console.log(c.gray(`  ${msg}`)),
};

const VOCABULARY_DATA = {
  'JLPT N5 - Basic Verbs': [
    { word: '行く', reading: 'いく', meaning: 'to go', notes: 'Godan verb' },
    { word: '来る', reading: 'くる', meaning: 'to come', notes: 'Irregular verb' },
    { word: '食べる', reading: 'たべる', meaning: 'to eat', notes: 'Ichidan verb' },
    { word: '飲む', reading: 'のむ', meaning: 'to drink', notes: 'Godan verb' },
    { word: '見る', reading: 'みる', meaning: 'to see, to watch', notes: 'Ichidan verb' },
    { word: '聞く', reading: 'きく', meaning: 'to listen, to hear', notes: 'Godan verb' },
    { word: '話す', reading: 'はなす', meaning: 'to speak, to talk', notes: 'Godan verb' },
    { word: '読む', reading: 'よむ', meaning: 'to read', notes: 'Godan verb' },
    { word: '書く', reading: 'かく', meaning: 'to write', notes: 'Godan verb' },
    { word: '勉強する', reading: 'べんきょうする', meaning: 'to study', notes: 'Suru verb' },
  ],
  'JLPT N5 - Basic Nouns': [
    { word: '学生', reading: 'がくせい', meaning: 'student', notes: 'Common noun' },
    { word: '先生', reading: 'せんせい', meaning: 'teacher', notes: 'Common noun' },
    { word: '学校', reading: 'がっこう', meaning: 'school', notes: 'Common noun' },
    { word: '家', reading: 'いえ', meaning: 'house, home', notes: 'Common noun' },
    { word: '本', reading: 'ほん', meaning: 'book', notes: 'Common noun' },
    { word: '時間', reading: 'じかん', meaning: 'time', notes: 'Common noun' },
    { word: '友達', reading: 'ともだち', meaning: 'friend', notes: 'Common noun' },
    { word: '今日', reading: 'きょう', meaning: 'today', notes: 'Time word' },
    { word: '明日', reading: 'あした', meaning: 'tomorrow', notes: 'Time word' },
    { word: '昨日', reading: 'きのう', meaning: 'yesterday', notes: 'Time word' },
  ],
  'JLPT N5 - Adjectives': [
    { word: '大きい', reading: 'おおきい', meaning: 'big, large', notes: 'I-adjective' },
    { word: '小さい', reading: 'ちいさい', meaning: 'small, little', notes: 'I-adjective' },
    { word: '新しい', reading: 'あたらしい', meaning: 'new', notes: 'I-adjective' },
    { word: '古い', reading: 'ふるい', meaning: 'old', notes: 'I-adjective' },
    { word: '良い', reading: 'いい/よい', meaning: 'good', notes: 'I-adjective' },
    { word: '悪い', reading: 'わるい', meaning: 'bad', notes: 'I-adjective' },
    { word: '高い', reading: 'たかい', meaning: 'expensive, tall', notes: 'I-adjective' },
    { word: '安い', reading: 'やすい', meaning: 'cheap', notes: 'I-adjective' },
    { word: '静か', reading: 'しずか', meaning: 'quiet', notes: 'Na-adjective' },
    { word: '便利', reading: 'べんり', meaning: 'convenient', notes: 'Na-adjective' },
  ],
  'JLPT N4 - Verbs': [
    {
      word: '始まる',
      reading: 'はじまる',
      meaning: 'to begin (intransitive)',
      notes: 'Godan verb',
    },
    { word: '終わる', reading: 'おわる', meaning: 'to finish (intransitive)', notes: 'Godan verb' },
    { word: '開ける', reading: 'あける', meaning: 'to open (transitive)', notes: 'Ichidan verb' },
    { word: '閉める', reading: 'しめる', meaning: 'to close (transitive)', notes: 'Ichidan verb' },
    { word: '考える', reading: 'かんがえる', meaning: 'to think', notes: 'Ichidan verb' },
    { word: '忘れる', reading: 'わすれる', meaning: 'to forget', notes: 'Ichidan verb' },
    {
      word: '覚える',
      reading: 'おぼえる',
      meaning: 'to remember, to memorize',
      notes: 'Ichidan verb',
    },
    { word: '教える', reading: 'おしえる', meaning: 'to teach', notes: 'Ichidan verb' },
    { word: '入れる', reading: 'いれる', meaning: 'to put in, to insert', notes: 'Ichidan verb' },
    { word: '出す', reading: 'だす', meaning: 'to take out, to submit', notes: 'Godan verb' },
  ],
  'JLPT N4 - Nouns': [
    { word: '会社', reading: 'かいしゃ', meaning: 'company', notes: 'Common noun' },
    { word: '仕事', reading: 'しごと', meaning: 'work, job', notes: 'Common noun' },
    { word: '試験', reading: 'しけん', meaning: 'exam, test', notes: 'Common noun' },
    { word: '授業', reading: 'じゅぎょう', meaning: 'class, lesson', notes: 'Common noun' },
    { word: '質問', reading: 'しつもん', meaning: 'question', notes: 'Common noun' },
    { word: '答え', reading: 'こたえ', meaning: 'answer', notes: 'Common noun' },
    { word: '意味', reading: 'いみ', meaning: 'meaning', notes: 'Common noun' },
    { word: '文化', reading: 'ぶんか', meaning: 'culture', notes: 'Common noun' },
    { word: '社会', reading: 'しゃかい', meaning: 'society', notes: 'Common noun' },
    { word: '歴史', reading: 'れきし', meaning: 'history', notes: 'Common noun' },
  ],
  'Daily Conversation': [
    { word: 'おはよう', reading: 'おはよう', meaning: 'good morning (casual)', notes: 'Greeting' },
    {
      word: 'こんにちは',
      reading: 'こんにちは',
      meaning: 'hello, good afternoon',
      notes: 'Greeting',
    },
    { word: 'こんばんは', reading: 'こんばんは', meaning: 'good evening', notes: 'Greeting' },
    { word: 'ありがとう', reading: 'ありがとう', meaning: 'thank you', notes: 'Phrase' },
    { word: 'すみません', reading: 'すみません', meaning: 'excuse me, sorry', notes: 'Phrase' },
    { word: 'ごめんなさい', reading: 'ごめんなさい', meaning: 'I am sorry', notes: 'Phrase' },
    {
      word: 'いただきます',
      reading: 'いただきます',
      meaning: 'expression before eating',
      notes: 'Phrase',
    },
    {
      word: 'ごちそうさま',
      reading: 'ごちそうさま',
      meaning: 'expression after eating',
      notes: 'Phrase',
    },
    { word: 'お願いします', reading: 'おねがいします', meaning: 'please', notes: 'Phrase' },
    {
      word: 'どういたしまして',
      reading: 'どういたしまして',
      meaning: 'you are welcome',
      notes: 'Phrase',
    },
  ],
  'Food & Drinks': [
    { word: 'ご飯', reading: 'ごはん', meaning: 'rice, meal', notes: 'Common noun' },
    { word: 'パン', reading: 'パン', meaning: 'bread', notes: 'Katakana word' },
    { word: '肉', reading: 'にく', meaning: 'meat', notes: 'Common noun' },
    { word: '魚', reading: 'さかな', meaning: 'fish', notes: 'Common noun' },
    { word: '野菜', reading: 'やさい', meaning: 'vegetable', notes: 'Common noun' },
    { word: '果物', reading: 'くだもの', meaning: 'fruit', notes: 'Common noun' },
    { word: '水', reading: 'みず', meaning: 'water', notes: 'Common noun' },
    { word: 'お茶', reading: 'おちゃ', meaning: 'tea', notes: 'Common noun' },
    { word: 'コーヒー', reading: 'コーヒー', meaning: 'coffee', notes: 'Katakana word' },
    { word: 'ビール', reading: 'ビール', meaning: 'beer', notes: 'Katakana word' },
  ],
  'Numbers & Time': [
    { word: '一', reading: 'いち', meaning: 'one', notes: 'Number' },
    { word: '二', reading: 'に', meaning: 'two', notes: 'Number' },
    { word: '三', reading: 'さん', meaning: 'three', notes: 'Number' },
    { word: '四', reading: 'し/よん', meaning: 'four', notes: 'Number' },
    { word: '五', reading: 'ご', meaning: 'five', notes: 'Number' },
    { word: '六', reading: 'ろく', meaning: 'six', notes: 'Number' },
    { word: '七', reading: 'しち/なな', meaning: 'seven', notes: 'Number' },
    { word: '八', reading: 'はち', meaning: 'eight', notes: 'Number' },
    { word: '九', reading: 'きゅう/く', meaning: 'nine', notes: 'Number' },
    { word: '十', reading: 'じゅう', meaning: 'ten', notes: 'Number' },
  ],
};

const EXAMPLE_SENTENCES: Record<
  string,
  Array<{ sentence: string; reading: string; meaning: string }>
> = {
  行く: [
    { sentence: '学校に行きます。', reading: 'がっこうにいきます。', meaning: 'I go to school.' },
    {
      sentence: '明日、東京に行きます。',
      reading: 'あした、とうきょうにいきます。',
      meaning: 'I will go to Tokyo tomorrow.',
    },
  ],
  来る: [
    { sentence: '友達が来ます。', reading: 'ともだちがきます。', meaning: 'My friend is coming.' },
    {
      sentence: '駅に来てください。',
      reading: 'えきにきてください。',
      meaning: 'Please come to the station.',
    },
  ],
  食べる: [
    {
      sentence: '朝ごはんを食べます。',
      reading: 'あさごはんをたべます。',
      meaning: 'I eat breakfast.',
    },
    {
      sentence: '寿司を食べたいです。',
      reading: 'すしをたべたいです。',
      meaning: 'I want to eat sushi.',
    },
  ],
  こんにちは: [
    {
      sentence: 'こんにちは、元気ですか。',
      reading: 'こんにちは、げんきですか。',
      meaning: 'Hello, how are you?',
    },
  ],
  勉強する: [
    {
      sentence: '毎日日本語を勉強します。',
      reading: 'まいにちにほんごをべんきょうします。',
      meaning: 'I study Japanese every day.',
    },
    {
      sentence: '図書館で勉強しています。',
      reading: 'としょかんでべんきょうしています。',
      meaning: 'I am studying at the library.',
    },
  ],
};

function randomPastDate(daysAgo: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), 0, 0);
  return date;
}

function randomFutureDate(daysAhead: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + Math.floor(Math.random() * daysAhead));
  date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), 0, 0);
  return date;
}

function randomChoice<T>(array: T[]): T {
  if (array.length === 0) {
    throw new Error('Cannot choose from empty array');
  }
  const index = Math.floor(Math.random() * array.length);
  return array[index]!;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  console.log(`\n${c.bold(c.magenta('Development Database Seeding'))}`);
  log.warning('This will create a large amount of test data!');

  log.section('Cleaning existing data');
  await prisma.notification.deleteMany();
  await prisma.progressLog.deleteMany();
  await prisma.studySession.deleteMany();
  await prisma.userStreak.deleteMany();
  await prisma.dailyGoal.deleteMany();
  await prisma.notificationPreference.deleteMany();
  await prisma.userSettings.deleteMany();
  await prisma.reviewSchedule.deleteMany();
  await prisma.exampleSentence.deleteMany();
  await prisma.vocabularyGroup.deleteMany();
  await prisma.vocabularyItem.deleteMany();
  await prisma.user.deleteMany();
  log.success('Cleaned existing data');

  log.section('Creating default user');
  const user = await prisma.user.create({
    data: {
      email: 'dev@vocab-hero.local',
      name: 'Development User',
    },
  });
  log.success(`Created user: ${user.email}`);
  log.data(`User ID: ${user.id}`);

  log.section('Creating vocabulary groups and items');
  const vocabularyItems: string[] = [];

  for (const [groupName, vocabList] of Object.entries(VOCABULARY_DATA)) {
    const group = await prisma.vocabularyGroup.create({
      data: {
        name: groupName,
        description: `A collection of ${groupName} vocabulary items for learning`,
        userId: user.id,
      },
    });

    log.data(`Created group: ${groupName} (${vocabList.length} items)`);

    for (const vocab of vocabList) {
      const item = await prisma.vocabularyItem.create({
        data: {
          word: vocab.word,
          reading: vocab.reading,
          meaning: vocab.meaning,
          notes: vocab.notes,
          groups: {
            connect: [{ id: group.id }],
          },
          exampleSentences: {
            create: (EXAMPLE_SENTENCES[vocab.word] || []).map((example, index) => ({
              sentence: example.sentence,
              reading: example.reading,
              meaning: example.meaning,
              order: index + 1,
            })),
          },
        },
      });

      vocabularyItems.push(item.id);
    }
  }

  log.success(
    `Created ${vocabularyItems.length} vocabulary items in ${Object.keys(VOCABULARY_DATA).length} groups`
  );

  log.section('Creating review schedules');
  for (const itemId of vocabularyItems) {
    const randomStage = Math.random();

    let easinessFactor: number;
    let interval: number;
    let repetitions: number;
    let nextReviewDate: Date;
    let lastReviewDate: Date | null;

    if (randomStage < 0.3) {
      easinessFactor = 2.5;
      interval = 0;
      repetitions = 0;
      nextReviewDate = new Date();
      lastReviewDate = null;
    } else if (randomStage < 0.6) {
      easinessFactor = randomInt(20, 28) / 10;
      interval = randomInt(1, 7);
      repetitions = randomInt(1, 3);
      nextReviewDate = randomFutureDate(7);
      lastReviewDate = randomPastDate(7);
    } else {
      easinessFactor = randomInt(25, 30) / 10;
      interval = randomInt(7, 30);
      repetitions = randomInt(4, 10);
      nextReviewDate = randomFutureDate(30);
      lastReviewDate = randomPastDate(30);
    }

    await prisma.reviewSchedule.create({
      data: {
        vocabularyItemId: itemId,
        easinessFactor,
        interval,
        repetitions,
        nextReviewDate,
        lastReviewDate,
      },
    });
  }
  log.success(`Created ${vocabularyItems.length} review schedules`);

  log.section('Creating study sessions');
  const studyModes: StudyMode[] = [
    'FLASHCARD',
    'MULTIPLE_CHOICE',
    'SPELLING',
    'MATCHING',
    'LISTENING',
    'RANDOM',
  ];

  const quizTypes: QuizType[] = ['WORD_TO_MEANING', 'MEANING_TO_WORD', 'MIXED'];

  for (let i = 0; i < 50; i++) {
    const mode = randomChoice(studyModes);
    const startedAt = randomPastDate(30);
    const timeSpent = randomInt(5, 45);
    const cardsReviewed = randomInt(10, 50);
    const correctAnswers = Math.floor(cardsReviewed * (0.6 + Math.random() * 0.35));

    const completedAt = new Date(startedAt);
    completedAt.setMinutes(completedAt.getMinutes() + timeSpent);

    await prisma.studySession.create({
      data: {
        userId: user.id,
        mode: mode,
        studyMode: mode,
        cardsReviewed,
        correctAnswers,
        timeSpentMinutes: timeSpent,
        startedAt,
        completedAt,
        quizType: mode === 'MULTIPLE_CHOICE' || mode === 'RANDOM' ? randomChoice(quizTypes) : null,
        questionCount: mode === 'MULTIPLE_CHOICE' || mode === 'RANDOM' ? cardsReviewed : null,
      },
    });
  }
  log.success('Created 50 study sessions');

  log.section('Creating progress logs');
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    if (Math.random() < 0.2) continue;

    const wordsStudied = randomInt(10, 50);
    const newWords = Math.floor(wordsStudied * 0.3);
    const reviewWords = wordsStudied - newWords;
    const timeSpent = randomInt(10, 60);
    const sessions = randomInt(1, 4);
    const totalAnswers = randomInt(20, 100);
    const correctAnswers = Math.floor(totalAnswers * (0.7 + Math.random() * 0.25));

    await prisma.progressLog.create({
      data: {
        userId: user.id,
        date,
        wordsStudied,
        newWords,
        reviewWords,
        timeSpentMinutes: timeSpent,
        sessionsCompleted: sessions,
        correctAnswers,
        totalAnswers,
      },
    });
  }
  log.success('Created progress logs for the past 30 days');

  log.section('Creating daily goal');
  await prisma.dailyGoal.create({
    data: {
      userId: user.id,
      wordsPerDay: 20,
      minutesPerDay: 30,
      reminderTime: '20:00',
      pushEnabled: true,
    },
  });
  log.success('Created daily goal');

  log.section('Creating user streak');
  const lastStudyDate = new Date();
  lastStudyDate.setDate(lastStudyDate.getDate() - 1);

  await prisma.userStreak.create({
    data: {
      userId: user.id,
      currentStreak: randomInt(5, 30),
      longestStreak: randomInt(30, 90),
      lastStudyDate,
      freezesRemaining: 2,
    },
  });
  log.success('Created user streak');

  log.section('Creating notification preferences');
  await prisma.notificationPreference.create({
    data: {
      userId: user.id,
      goalAchievementEnabled: true,
      streakWarningEnabled: true,
      studyReminderEnabled: true,
      milestoneEnabled: true,
      pushEnabled: false,
    },
  });
  log.success('Created notification preferences');

  log.section('Creating user settings');
  await prisma.userSettings.create({
    data: {
      userId: user.id,
      theme: 'SYSTEM',
      ttsSpeed: 1.0,
      ttsVolume: 0.8,
      ttsPitch: 1.0,
      ttsVoice: null,
      cardsPerSession: 25,
      defaultStudyMode: 'FLASHCARD',
      autoAdvance: false,
      showReading: true,
      language: 'en',
    },
  });
  log.success('Created user settings');

  log.section('Creating notifications');
  const notificationTypes: NotificationType[] = [
    'GOAL_ACHIEVED',
    'STREAK_WARNING',
    'STUDY_REMINDER',
    'MILESTONE_REACHED',
    'FREEZE_USED',
  ];

  const notificationMessages: Record<NotificationType, { title: string; message: string }> = {
    GOAL_ACHIEVED: {
      title: 'Daily Goal Achieved!',
      message: 'Congratulations! You have completed your daily goal.',
    },
    STREAK_WARNING: {
      title: 'Streak Warning',
      message: 'Your study streak is at risk! Study today to keep it alive.',
    },
    STUDY_REMINDER: {
      title: 'Time to Study',
      message: "Don't forget your daily study session!",
    },
    MILESTONE_REACHED: {
      title: 'Milestone Reached',
      message: 'You have reached a new learning milestone!',
    },
    FREEZE_USED: {
      title: 'Streak Freeze Used',
      message: 'A streak freeze has been used to protect your streak.',
    },
  };

  for (let i = 0; i < 20; i++) {
    const type = randomChoice(notificationTypes);
    const { title, message } = notificationMessages[type]!;

    await prisma.notification.create({
      data: {
        userId: user.id,
        type,
        title,
        message,
        priority: randomChoice<NotificationPriority>(['LOW', 'MEDIUM', 'HIGH']),
        isRead: Math.random() < 0.6,
        createdAt: randomPastDate(7),
      },
    });
  }
  log.success('Created 20 notifications');

  console.log(`\n${c.bold(c.green('Development database seeding completed!'))}\n`);
  console.log(c.bold('Summary:'));
  console.log(`  User: ${c.cyan(user.email!)}`);
  console.log(`  Vocabulary Groups: ${c.cyan(String(Object.keys(VOCABULARY_DATA).length))}`);
  console.log(`  Vocabulary Items: ${c.cyan(String(vocabularyItems.length))}`);
  console.log(`  Study Sessions: ${c.cyan('50')}`);
  console.log(`  Progress Logs: ${c.cyan('~24')} ${c.gray('(past 30 days with some gaps)')}`);
  console.log(`  Notifications: ${c.cyan('20')}`);
  console.log(`\n${c.green('Ready for development!')}\n`);
}

main()
  .catch((e) => {
    log.error('Error during seeding:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
