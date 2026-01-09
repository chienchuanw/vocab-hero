import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { exportOptionsSchema } from '@/lib/validations/export';
import { successResponse, ApiErrors } from '@/lib/api/response';
import type { Prisma } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validationResult = exportOptionsSchema.safeParse(body);

    if (!validationResult.success) {
      return ApiErrors.VALIDATION_ERROR('Invalid backup options', validationResult.error.issues);
    }

    const { groupIds, dateFrom, dateTo } = validationResult.data;

    const where: Prisma.VocabularyItemWhereInput = {};

    if (groupIds && groupIds.length > 0) {
      where.groups = {
        some: {
          id: {
            in: groupIds,
          },
        },
      };
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo + 'T23:59:59.999Z');
      }
    }

    const vocabularyItems = await prisma.vocabularyItem.findMany({
      where,
      include: {
        groups: {
          select: {
            id: true,
            name: true,
          },
        },
        exampleSentences: {
          orderBy: {
            order: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const backupData = {
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
      })),
    };

    return successResponse(backupData);
  } catch (error) {
    console.error('Error creating backup:', error);
    return ApiErrors.INTERNAL_ERROR('Failed to create backup');
  }
}
