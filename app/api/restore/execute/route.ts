import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { ExportFormat } from '@/lib/validations/export';
import { DuplicateStrategy, type ImportVocabularyItem } from '@/lib/validations/import';
import {
  parseJsonImport,
  parseCsvImport,
  findDuplicates,
  applyDuplicateStrategy,
  type ExistingVocabularyItem,
} from '@/lib/import/import-parser';
import { successResponse, ApiErrors } from '@/lib/api/response';
import { getOrCreateDefaultUser } from '@/lib/db/default-user';
import { DEFAULT_SM2_DATA } from '@/lib/srs/sm2.types';

const restoreExecuteSchema = z.object({
  format: z.nativeEnum(ExportFormat),
  content: z.string().min(1, 'Content is required'),
  strategy: z.nativeEnum(DuplicateStrategy),
  confirm: z.string().refine((val) => val.trim() === 'RESTORE', {
    message: 'Confirmation phrase must be exactly "RESTORE"',
  }),
});

async function getOrCreateGroup(groupName: string, userId: string): Promise<string> {
  let group = await prisma.vocabularyGroup.findFirst({
    where: { name: groupName, userId },
  });

  if (!group) {
    group = await prisma.vocabularyGroup.create({
      data: { name: groupName, userId },
    });
  }

  return group.id;
}

async function createVocabularyItem(item: ImportVocabularyItem, userId: string): Promise<void> {
  const groupIds: string[] = [];
  if (item.groups && item.groups.length > 0) {
    for (const group of item.groups) {
      const groupId = await getOrCreateGroup(group.name, userId);
      groupIds.push(groupId);
    }
  }

  await prisma.vocabularyItem.create({
    data: {
      word: item.word,
      reading: item.reading,
      meaning: item.meaning,
      notes: item.notes ?? null,
      groups: groupIds.length > 0 ? { connect: groupIds.map((id) => ({ id })) } : undefined,
      exampleSentences:
        item.exampleSentences && item.exampleSentences.length > 0
          ? {
              create: item.exampleSentences.map((s) => ({
                sentence: s.sentence,
                reading: s.reading ?? null,
                meaning: s.meaning,
                order: s.order,
              })),
            }
          : undefined,
      reviewSchedule: {
        create: {
          easinessFactor: DEFAULT_SM2_DATA.easinessFactor,
          interval: DEFAULT_SM2_DATA.interval,
          repetitions: DEFAULT_SM2_DATA.repetitions,
          nextReviewDate: new Date(),
          lastReviewDate: null,
        },
      },
    },
  });
}

async function updateVocabularyItem(
  id: string,
  data: Partial<ImportVocabularyItem>,
  userId: string,
  strategy: DuplicateStrategy
): Promise<void> {
  const groupIds: string[] = [];
  if (data.groups && data.groups.length > 0) {
    for (const group of data.groups) {
      const groupId = await getOrCreateGroup(group.name, userId);
      groupIds.push(groupId);
    }
  }

  if (strategy === DuplicateStrategy.OVERWRITE) {
    await prisma.vocabularyItem.update({
      where: { id },
      data: {
        word: data.word,
        reading: data.reading,
        meaning: data.meaning,
        notes: data.notes ?? null,
        groups: groupIds.length > 0 ? { set: groupIds.map((gid) => ({ id: gid })) } : undefined,
      },
    });
  } else if (strategy === DuplicateStrategy.MERGE) {
    const existing = await prisma.vocabularyItem.findUnique({
      where: { id },
      include: { groups: true },
    });

    const existingGroupIds = existing?.groups.map((g) => g.id) ?? [];
    const allGroupIds = [...new Set([...existingGroupIds, ...groupIds])];

    await prisma.vocabularyItem.update({
      where: { id },
      data: {
        meaning: data.meaning ?? existing?.meaning,
        notes: data.notes ?? existing?.notes,
        groups:
          allGroupIds.length > 0 ? { set: allGroupIds.map((gid) => ({ id: gid })) } : undefined,
      },
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = restoreExecuteSchema.safeParse(body);

    if (!validationResult.success) {
      return ApiErrors.VALIDATION_ERROR(
        validationResult.error.issues[0]?.message ?? 'Validation failed',
        validationResult.error.issues
      );
    }

    const { format, content, strategy } = validationResult.data;

    const parseResult =
      format === ExportFormat.JSON ? parseJsonImport(content) : parseCsvImport(content);

    if (!parseResult.success) {
      return ApiErrors.BAD_REQUEST(
        parseResult.errors[0]?.message ?? 'Parse failed',
        parseResult.errors
      );
    }

    const existingItems = await prisma.vocabularyItem.findMany({
      select: {
        id: true,
        word: true,
        reading: true,
        meaning: true,
        notes: true,
        groups: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const existingForDuplicateCheck: ExistingVocabularyItem[] = existingItems.map((item) => ({
      id: item.id,
      word: item.word,
      reading: item.reading,
      meaning: item.meaning,
      notes: item.notes,
      groups: item.groups,
    }));

    const duplicates = findDuplicates(parseResult.data, existingForDuplicateCheck);
    const { itemsToCreate, itemsToUpdate } = applyDuplicateStrategy(
      parseResult.data,
      duplicates,
      strategy
    );

    const user = await getOrCreateDefaultUser();
    const userId = user.id;

    let created = 0;
    let updated = 0;
    const skipped = duplicates.length - itemsToUpdate.length;

    for (const item of itemsToCreate) {
      await createVocabularyItem(item, userId);
      created++;
    }

    for (const updateItem of itemsToUpdate) {
      await updateVocabularyItem(updateItem.id, updateItem.data, userId, strategy);
      updated++;
    }

    return successResponse({
      created,
      updated,
      skipped,
      total: parseResult.data.length,
    });
  } catch (error) {
    console.error('Restore execute error:', error);
    return ApiErrors.INTERNAL_ERROR('An unexpected error occurred');
  }
}
