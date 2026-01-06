import type {
  VocabularyItem,
  VocabularyGroup,
  ExampleSentence,
  ReviewSchedule,
} from '@prisma/client';
import Papa from 'papaparse';

export type VocabularyWithRelations = VocabularyItem & {
  groups: Pick<VocabularyGroup, 'id' | 'name'>[];
  exampleSentences: ExampleSentence[];
  reviewSchedule: ReviewSchedule | null;
};

export interface ExportMetadata {
  version: string;
  exportDate: string;
  itemCount: number;
}

export interface JsonExportData extends ExportMetadata {
  items: ExportVocabularyItem[];
}

export interface ExportVocabularyItem {
  word: string;
  reading: string;
  meaning: string;
  notes: string | null;
  groups: Array<{ id: string; name: string }>;
  exampleSentences: Array<{
    sentence: string;
    reading: string | null;
    meaning: string;
    order: number;
  }>;
  reviewSchedule: {
    easinessFactor: number;
    interval: number;
    repetitions: number;
    nextReviewDate: string;
    lastReviewDate: string | null;
  } | null;
}

export interface FlattenedVocabularyItem {
  word: string;
  reading: string;
  meaning: string;
  notes: string;
  groups: string;
  exampleSentences: string;
  easinessFactor: string;
  interval: string;
  repetitions: string;
  nextReviewDate: string;
  lastReviewDate: string;
}

export function flattenVocabularyItem(item: VocabularyWithRelations): FlattenedVocabularyItem {
  const groupNames = item.groups.map((group) => group.name).join(';');

  const exampleSentencesStr = item.exampleSentences
    .map((sentence) => {
      const reading = sentence.reading ?? '';
      return `${sentence.sentence}|${reading}|${sentence.meaning}`;
    })
    .join('##');

  return {
    word: item.word,
    reading: item.reading,
    meaning: item.meaning,
    notes: item.notes ?? '',
    groups: groupNames,
    exampleSentences: exampleSentencesStr,
    easinessFactor: item.reviewSchedule?.easinessFactor.toString() ?? '',
    interval: item.reviewSchedule?.interval.toString() ?? '',
    repetitions: item.reviewSchedule?.repetitions.toString() ?? '',
    nextReviewDate: item.reviewSchedule?.nextReviewDate.toISOString() ?? '',
    lastReviewDate: item.reviewSchedule?.lastReviewDate?.toISOString() ?? '',
  };
}

export function generateCsvExport(vocabularyItems: VocabularyWithRelations[]): string {
  const flattenedItems = vocabularyItems.map((item) => flattenVocabularyItem(item));

  const csv = Papa.unparse(flattenedItems, {
    header: true,
    columns: [
      'word',
      'reading',
      'meaning',
      'notes',
      'groups',
      'exampleSentences',
      'easinessFactor',
      'interval',
      'repetitions',
      'nextReviewDate',
      'lastReviewDate',
    ],
  });

  return '\uFEFF' + csv;
}

export function generateJsonExport(vocabularyItems: VocabularyWithRelations[]): JsonExportData {
  return {
    version: '1.0',
    exportDate: new Date().toISOString(),
    itemCount: vocabularyItems.length,
    items: vocabularyItems.map((item) => ({
      word: item.word,
      reading: item.reading,
      meaning: item.meaning,
      notes: item.notes,
      groups: item.groups.map((group) => ({
        id: group.id,
        name: group.name,
      })),
      exampleSentences: item.exampleSentences.map((sentence) => ({
        sentence: sentence.sentence,
        reading: sentence.reading,
        meaning: sentence.meaning,
        order: sentence.order,
      })),
      reviewSchedule: item.reviewSchedule
        ? {
            easinessFactor: item.reviewSchedule.easinessFactor,
            interval: item.reviewSchedule.interval,
            repetitions: item.reviewSchedule.repetitions,
            nextReviewDate: item.reviewSchedule.nextReviewDate.toISOString(),
            lastReviewDate: item.reviewSchedule.lastReviewDate?.toISOString() ?? null,
          }
        : null,
    })),
  };
}
