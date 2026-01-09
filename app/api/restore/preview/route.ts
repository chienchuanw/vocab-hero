import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { ExportFormat } from '@/lib/validations/export';
import {
  parseJsonImport,
  parseCsvImport,
  findDuplicates,
  type ExistingVocabularyItem,
} from '@/lib/import/import-parser';
import { successResponse, ApiErrors } from '@/lib/api/response';

const restorePreviewSchema = z.object({
  format: z.nativeEnum(ExportFormat),
  content: z.string().min(1, 'Content is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = restorePreviewSchema.safeParse(body);

    if (!validationResult.success) {
      return ApiErrors.VALIDATION_ERROR(
        validationResult.error.issues[0]?.message ?? 'Validation failed',
        validationResult.error.issues
      );
    }

    const { format, content } = validationResult.data;

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
    const duplicateIndices = new Set(duplicates.map((d) => d.importIndex));
    const newItems = parseResult.data.filter((_, index) => !duplicateIndices.has(index));

    return successResponse({
      totalItems: parseResult.data.length,
      duplicateCount: duplicates.length,
      newItems,
      duplicates: duplicates.map((d) => ({
        importItem: d.importItem,
        existingItem: d.existingItem,
      })),
      metadata: parseResult.metadata,
    });
  } catch (error) {
    console.error('Restore preview error:', error);
    return ApiErrors.INTERNAL_ERROR('An unexpected error occurred');
  }
}
