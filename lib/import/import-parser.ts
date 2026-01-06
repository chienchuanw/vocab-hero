import Papa from 'papaparse';
import {
  importVocabularyItemSchema,
  importBatchSchema,
  DuplicateStrategy,
  type ImportVocabularyItem,
} from '@/lib/validations/import';

export interface ParseError {
  message: string;
  line?: number;
}

export interface ParseMetadata {
  version: string;
  exportDate: string;
  itemCount: number;
}

export type ParseResult<T> =
  | {
      success: true;
      data: T;
      metadata?: ParseMetadata;
    }
  | {
      success: false;
      errors: ParseError[];
    };

interface JsonExportFormat {
  version?: string;
  exportDate?: string;
  itemCount?: number;
  items?: unknown[];
}

const REQUIRED_CSV_COLUMNS = ['word', 'reading', 'meaning'];

export function parseJsonImport(jsonString: string): ParseResult<ImportVocabularyItem[]> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch {
    return {
      success: false,
      errors: [{ message: 'Invalid JSON format: failed to parse' }],
    };
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return {
      success: false,
      errors: [{ message: 'Invalid format: expected an object' }],
    };
  }

  const exportData = parsed as JsonExportFormat;

  if (!exportData.items || !Array.isArray(exportData.items)) {
    return {
      success: false,
      errors: [{ message: 'Invalid format: missing items array' }],
    };
  }

  const errors: ParseError[] = [];
  const validItems: ImportVocabularyItem[] = [];

  for (let i = 0; i < exportData.items.length; i++) {
    const item = exportData.items[i];
    const result = importVocabularyItemSchema.safeParse(item);

    if (result.success) {
      validItems.push(result.data);
    } else {
      for (const issue of result.error.issues) {
        errors.push({
          message: issue.message,
          line: i + 1,
        });
      }
    }
  }

  if (errors.length > 0) {
    return {
      success: false,
      errors,
    };
  }

  const batchResult = importBatchSchema.safeParse(validItems);
  if (!batchResult.success) {
    return {
      success: false,
      errors: batchResult.error.issues.map((issue) => ({
        message: issue.message,
      })),
    };
  }

  return {
    success: true,
    data: batchResult.data,
    metadata: {
      version: exportData.version ?? '1.0',
      exportDate: exportData.exportDate ?? new Date().toISOString(),
      itemCount: exportData.itemCount ?? batchResult.data.length,
    },
  };
}

function unflattenCsvRow(row: Record<string, string>): Partial<ImportVocabularyItem> {
  const item: Partial<ImportVocabularyItem> = {
    word: row.word || '',
    reading: row.reading || '',
    meaning: row.meaning || '',
    notes: row.notes || null,
  };

  if (row.groups && row.groups.trim()) {
    item.groups = row.groups.split(';').map((name) => ({ name: name.trim() }));
  } else {
    item.groups = [];
  }

  if (row.exampleSentences && row.exampleSentences.trim()) {
    const sentences = row.exampleSentences.split('##');
    item.exampleSentences = sentences.map((sentenceStr, index) => {
      const parts = sentenceStr.split('|');
      return {
        sentence: parts[0] || '',
        reading: parts[1] || null,
        meaning: parts[2] || '',
        order: index,
      };
    });
  } else {
    item.exampleSentences = [];
  }

  if (row.easinessFactor && row.interval && row.repetitions && row.nextReviewDate) {
    item.reviewSchedule = {
      easinessFactor: parseFloat(row.easinessFactor),
      interval: parseInt(row.interval, 10),
      repetitions: parseInt(row.repetitions, 10),
      nextReviewDate: row.nextReviewDate,
      lastReviewDate: row.lastReviewDate || null,
    };
  } else {
    item.reviewSchedule = null;
  }

  return item;
}

function isEmptyRow(row: Record<string, string>): boolean {
  return Object.values(row).every((value) => !value || value.trim() === '');
}

export function parseCsvImport(csvString: string): ParseResult<ImportVocabularyItem[]> {
  if (!csvString || csvString.trim() === '') {
    return {
      success: false,
      errors: [{ message: 'Empty CSV file' }],
    };
  }

  const cleanCsv = csvString.replace(/^\uFEFF/, '');

  const parseResult = Papa.parse<Record<string, string>>(cleanCsv, {
    header: true,
    skipEmptyLines: false,
    transformHeader: (header) => header.trim(),
  });

  if (!parseResult.meta.fields || parseResult.meta.fields.length === 0) {
    return {
      success: false,
      errors: [{ message: 'Invalid CSV: missing headers' }],
    };
  }

  const headers = parseResult.meta.fields;
  const missingColumns = REQUIRED_CSV_COLUMNS.filter((col) => !headers.includes(col));
  if (missingColumns.length > 0) {
    return {
      success: false,
      errors: [{ message: `Missing required columns: ${missingColumns.join(', ')}` }],
    };
  }

  const errors: ParseError[] = [];
  const validItems: ImportVocabularyItem[] = [];
  let dataRowCount = 0;

  for (let i = 0; i < parseResult.data.length; i++) {
    const row = parseResult.data[i];
    const lineNumber = i + 2;

    if (!row || isEmptyRow(row)) {
      continue;
    }

    dataRowCount++;

    const unflattenedItem = unflattenCsvRow(row);
    const validationResult = importVocabularyItemSchema.safeParse(unflattenedItem);

    if (validationResult.success) {
      validItems.push(validationResult.data);
    } else {
      for (const issue of validationResult.error.issues) {
        errors.push({
          message: issue.message,
          line: lineNumber,
        });
      }
    }
  }

  if (dataRowCount === 0) {
    return {
      success: false,
      errors: [{ message: 'At least one item required' }],
    };
  }

  if (errors.length > 0) {
    return {
      success: false,
      errors,
    };
  }

  return {
    success: true,
    data: validItems,
  };
}

export interface ExistingVocabularyItem {
  id: string;
  word: string;
  reading: string;
  meaning: string;
  notes?: string | null;
  groups?: Array<{ id: string; name: string }>;
}

export interface DuplicateMatch {
  importItem: ImportVocabularyItem;
  existingItem: ExistingVocabularyItem;
  importIndex: number;
}

export interface DuplicateStrategyResult {
  itemsToCreate: ImportVocabularyItem[];
  itemsToUpdate: Array<{
    id: string;
    data: Partial<ImportVocabularyItem>;
  }>;
}

function createDuplicateKey(word: string, reading: string): string {
  return `${word}::${reading}`;
}

export function findDuplicates(
  importItems: ImportVocabularyItem[],
  existingItems: ExistingVocabularyItem[]
): DuplicateMatch[] {
  const existingMap = new Map<string, ExistingVocabularyItem>();
  for (const item of existingItems) {
    const key = createDuplicateKey(item.word, item.reading);
    existingMap.set(key, item);
  }

  const duplicates: DuplicateMatch[] = [];
  importItems.forEach((importItem, index) => {
    const key = createDuplicateKey(importItem.word, importItem.reading);
    const existingItem = existingMap.get(key);

    if (existingItem) {
      duplicates.push({
        importItem,
        existingItem,
        importIndex: index,
      });
    }
  });

  return duplicates;
}

export function applyDuplicateStrategy(
  importItems: ImportVocabularyItem[],
  duplicates: DuplicateMatch[],
  strategy: DuplicateStrategy
): DuplicateStrategyResult {
  const duplicateIndices = new Set(duplicates.map((d) => d.importIndex));
  const itemsToCreate = importItems.filter((_, index) => !duplicateIndices.has(index));
  const itemsToUpdate: DuplicateStrategyResult['itemsToUpdate'] = [];

  if (strategy === DuplicateStrategy.SKIP) {
    return { itemsToCreate, itemsToUpdate };
  }

  if (strategy === DuplicateStrategy.OVERWRITE) {
    for (const duplicate of duplicates) {
      itemsToUpdate.push({
        id: duplicate.existingItem.id,
        data: {
          word: duplicate.importItem.word,
          reading: duplicate.importItem.reading,
          meaning: duplicate.importItem.meaning,
          notes: duplicate.importItem.notes,
          groups: duplicate.importItem.groups,
          exampleSentences: duplicate.importItem.exampleSentences,
          reviewSchedule: duplicate.importItem.reviewSchedule,
        },
      });
    }
    return { itemsToCreate, itemsToUpdate };
  }

  if (strategy === DuplicateStrategy.MERGE) {
    for (const duplicate of duplicates) {
      const { importItem, existingItem } = duplicate;

      const existingGroups = existingItem.groups ?? [];
      const importGroups = importItem.groups ?? [];
      const existingGroupNames = new Set(existingGroups.map((g) => g.name));
      const newGroups = importGroups.filter((g) => !existingGroupNames.has(g.name));
      const mergedGroups = [...existingGroups.map((g) => ({ name: g.name })), ...newGroups];

      itemsToUpdate.push({
        id: existingItem.id,
        data: {
          meaning: existingItem.meaning || importItem.meaning,
          notes: existingItem.notes ?? importItem.notes,
          groups: mergedGroups.length > 0 ? mergedGroups : undefined,
        },
      });
    }
    return { itemsToCreate, itemsToUpdate };
  }

  return { itemsToCreate, itemsToUpdate };
}
