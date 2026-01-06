import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { ExportFormat } from '@/lib/validations/export';
import {
  parseJsonImport,
  parseCsvImport,
  findDuplicates,
  type ExistingVocabularyItem,
} from '@/lib/import/import-parser';

const importPreviewSchema = z.object({
  format: z.nativeEnum(ExportFormat),
  content: z.string().min(1, 'Content is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = importPreviewSchema.safeParse(body);

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

    const { format, content } = validationResult.data;

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
    const duplicateIndices = new Set(duplicates.map((d) => d.importIndex));
    const newItems = parseResult.data.filter((_, index) => !duplicateIndices.has(index));

    return NextResponse.json({
      success: true,
      data: {
        totalItems: parseResult.data.length,
        duplicateCount: duplicates.length,
        newItems,
        duplicates: duplicates.map((d) => ({
          importItem: d.importItem,
          existingItem: d.existingItem,
        })),
        metadata: parseResult.metadata,
      },
    });
  } catch (error) {
    console.error('Import preview error:', error);
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
