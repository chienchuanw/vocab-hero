import type { VocabularyItem, VocabularyGroup, ReviewSchedule } from '@prisma/client';

interface VocabularyItemOverrides {
  word?: string;
  reading?: string;
  meaning?: string;
  notes?: string;
  index?: number;
}

interface GroupOverrides {
  name?: string;
  description?: string | null;
  userId?: string;
}

interface ReviewScheduleOverrides {
  easinessFactor?: number;
  interval?: number;
  repetitions?: number;
  nextReviewDate?: Date;
  isDue?: boolean;
}

const JAPANESE_WORDS = [
  { word: '勉強', reading: 'べんきょう', meaning: 'study' },
  { word: '学校', reading: 'がっこう', meaning: 'school' },
  { word: '先生', reading: 'せんせい', meaning: 'teacher' },
  { word: '学生', reading: 'がくせい', meaning: 'student' },
  { word: '日本語', reading: 'にほんご', meaning: 'Japanese language' },
  { word: '英語', reading: 'えいご', meaning: 'English language' },
  { word: '中国語', reading: 'ちゅうごくご', meaning: 'Chinese language' },
  { word: '本', reading: 'ほん', meaning: 'book' },
  { word: '新聞', reading: 'しんぶん', meaning: 'newspaper' },
  { word: '雑誌', reading: 'ざっし', meaning: 'magazine' },
  { word: '辞書', reading: 'じしょ', meaning: 'dictionary' },
  { word: '鉛筆', reading: 'えんぴつ', meaning: 'pencil' },
  { word: 'ノート', reading: 'ノート', meaning: 'notebook' },
  { word: '机', reading: 'つくえ', meaning: 'desk' },
  { word: '椅子', reading: 'いす', meaning: 'chair' },
];

export function generateVocabularyItem(
  overrides: VocabularyItemOverrides = {}
): Omit<VocabularyItem, 'id'> {
  const index = overrides.index ?? Math.floor(Math.random() * 10000);
  const baseWord = JAPANESE_WORDS[index % JAPANESE_WORDS.length]!;

  const now = new Date();

  return {
    word: overrides.word ?? `${baseWord.word}-${index}`,
    reading: overrides.reading ?? `${baseWord.reading}`,
    meaning: overrides.meaning ?? `${baseWord.meaning} ${index}`,
    notes: overrides.notes ?? null,
    createdAt: now,
    updatedAt: now,
  };
}

export function generateVocabularyItems(
  count: number,
  commonOverrides: Omit<VocabularyItemOverrides, 'index'> = {}
): Omit<VocabularyItem, 'id'>[] {
  return Array.from({ length: count }, (_, index) =>
    generateVocabularyItem({
      ...commonOverrides,
      index: index + 1,
    })
  );
}

export function generateGroup(overrides: GroupOverrides = {}): Omit<VocabularyGroup, 'id'> {
  const index = Math.floor(Math.random() * 1000);
  const now = new Date();

  return {
    name: overrides.name ?? `Test Group ${index}`,
    description: overrides.description ?? null,
    userId: overrides.userId ?? 'default-user',
    createdAt: now,
    updatedAt: now,
  };
}

export function generateReviewSchedule(
  vocabularyId: string,
  overrides: ReviewScheduleOverrides = {}
): Omit<ReviewSchedule, 'id'> {
  const now = new Date();

  let nextReviewDate = overrides.nextReviewDate;

  if (overrides.isDue && !nextReviewDate) {
    nextReviewDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  } else if (!nextReviewDate) {
    nextReviewDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  }

  return {
    vocabularyItemId: vocabularyId,
    easinessFactor: overrides.easinessFactor ?? 2.5,
    interval: overrides.interval ?? 1,
    repetitions: overrides.repetitions ?? 0,
    nextReviewDate,
    lastReviewDate: null,
    createdAt: now,
    updatedAt: now,
  };
}
