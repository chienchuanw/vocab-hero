import { NextRequest, NextResponse } from 'next/server';
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

const importExecuteSchema = z.object({
  format: z.nativeEnum(ExportFormat),
  content: z.string().min(1, 'Content is required'),
  strategy: z.nativeEnum(DuplicateStrategy),
});

async function getDefaultUser(): Promise<string> {
  let user = await prisma.user.findFirst();
  if (!user) {
    user = await prisma.user.create({
      data: { email: 'default@vocab-hero.app' },
    });
  }
  return user.id;
}

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
      reviewSchedule: item.reviewSchedule
        ? {
            create: {
              easinessFactor: item.reviewSchedule.easinessFactor,
              interval: item.reviewSchedule.interval,
              repetitions: item.reviewSchedule.repetitions,
              nextReviewDate: new Date(item.reviewSchedule.nextReviewDate),
              lastReviewDate: item.reviewSchedule.lastReviewDate
                ? new Date(item.reviewSchedule.lastReviewDate)
                : null,
            },
          }
        : undefined,
    },
  });
}

async function updateVocabularyItem(
  id: string,
  data: Partial<ImportVocabularyItem>,
  userId: string
): Promise<void> {
  const groupIds: string[] = [];
  if (data.groups && data.groups.length > 0) {
    for (const group of data.groups) {
      const groupId = await getOrCreateGroup(group.name, userId);
      groupIds.push(groupId);
    }
  }

  await prisma.vocabularyItem.update({
    where: { id },
    data: {
      meaning: data.meaning,
      notes: data.notes ?? undefined,
      groups: groupIds.length > 0 ? { set: groupIds.map((gid) => ({ id: gid })) } : undefined,
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = importExecuteSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: validationResult.error.issues[0]?.message ?? 'Validation failed',
          },
        },
        { status: 400 }
      );
    }

    const { format, content, strategy } = validationResult.data;

    const parseResult =
      format === ExportFormat.JSON ? parseJsonImport(content) : parseCsvImport(content);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'PARSE_ERROR',
            message: parseResult.errors[0]?.message ?? 'Parse failed',
            details: parseResult.errors,
          },
        },
        { status: 400 }
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

    const userId = await getDefaultUser();

    let created = 0;
    let updated = 0;
    const skipped = duplicates.length - itemsToUpdate.length;

    for (const item of itemsToCreate) {
      await createVocabularyItem(item, userId);
      created++;
    }

    for (const updateItem of itemsToUpdate) {
      await updateVocabularyItem(updateItem.id, updateItem.data, userId);
      updated++;
    }

    return NextResponse.json({
      success: true,
      data: {
        created,
        updated,
        skipped,
        total: parseResult.data.length,
      },
    });
  } catch (error) {
    console.error('Import execute error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
        },
      },
      { status: 500 }
    );
  }
}
