import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { exportOptionsSchema, ExportFormat } from '@/lib/validations/export';
import { generateJsonExport, generateCsvExport } from '@/lib/export/export-generator';
import { ApiErrors, successResponse } from '@/lib/api';
import type { Prisma } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validationResult = exportOptionsSchema.safeParse(body);

    if (!validationResult.success) {
      return ApiErrors.VALIDATION_ERROR('Invalid export options', validationResult.error.flatten());
    }

    const { format, groupIds, dateFrom, dateTo } = validationResult.data;

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
        reviewSchedule: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    if (format === ExportFormat.JSON) {
      const jsonData = generateJsonExport(vocabularyItems);
      return successResponse(jsonData);
    } else {
      const csvData = generateCsvExport(vocabularyItems);
      const today = new Date().toISOString().split('T')[0];
      const filename = `vocab-hero-export-${today}.csv`;

      return new NextResponse(csvData, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }
  } catch (error) {
    console.error('Error exporting vocabulary:', error);
    return ApiErrors.INTERNAL_ERROR('Failed to export vocabulary');
  }
}
