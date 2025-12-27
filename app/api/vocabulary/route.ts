import { NextRequest } from 'next/server';
import { successResponse, ApiErrors } from '@/lib/api';
import { prisma } from '@/lib/db/prisma';
import { Prisma } from '@prisma/client';

/**
 * GET /api/vocabulary
 * 取得單字列表，支援搜尋、排序、篩選、cursor-based 分頁
 *
 * Query Parameters:
 * - search: 搜尋關鍵字（搜尋 word, reading, meaning）
 * - sortBy: 排序欄位（createdAt, word, updatedAt）
 * - sortOrder: 排序方向（asc, desc）
 * - groupId: 依群組篩選
 * - limit: 每頁筆數（預設 20）
 * - cursor: 分頁游標（上一頁的最後一筆 ID）
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // 取得查詢參數
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const groupId = searchParams.get('groupId');
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const cursor = searchParams.get('cursor');

    // 驗證參數
    if (limit > 100) {
      return ApiErrors.BAD_REQUEST('Limit cannot exceed 100');
    }

    if (!['createdAt', 'word', 'updatedAt'].includes(sortBy)) {
      return ApiErrors.BAD_REQUEST('Invalid sortBy parameter');
    }

    if (!['asc', 'desc'].includes(sortOrder)) {
      return ApiErrors.BAD_REQUEST('Invalid sortOrder parameter');
    }

    // 建立查詢條件
    const where: Prisma.VocabularyItemWhereInput = {};

    // 搜尋條件：搜尋 word, reading, meaning
    if (search) {
      where.OR = [
        { word: { contains: search, mode: 'insensitive' } },
        { reading: { contains: search, mode: 'insensitive' } },
        { meaning: { contains: search, mode: 'insensitive' } },
      ];
    }

    // 群組篩選
    if (groupId) {
      where.groups = {
        some: {
          id: groupId,
        },
      };
    }

    // Cursor-based 分頁
    const queryOptions: Prisma.VocabularyItemFindManyArgs = {
      where,
      take: limit + 1, // 多取一筆來判斷是否有下一頁
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: {
        groups: {
          select: {
            id: true,
            name: true,
          },
        },
        reviewSchedule: {
          select: {
            easinessFactor: true,
            interval: true,
            repetitions: true,
            nextReviewDate: true,
          },
        },
        _count: {
          select: {
            exampleSentences: true,
          },
        },
      },
    };

    // 如果有 cursor，加入 cursor 條件
    if (cursor) {
      queryOptions.cursor = {
        id: cursor,
      };
      queryOptions.skip = 1; // 跳過 cursor 本身
    }

    // 執行查詢
    const items = await prisma.vocabularyItem.findMany(queryOptions);

    // 判斷是否有下一頁
    const hasNextPage = items.length > limit;
    const vocabularyItems = hasNextPage ? items.slice(0, limit) : items;
    const nextCursor =
      hasNextPage && vocabularyItems.length > 0
        ? (vocabularyItems[vocabularyItems.length - 1]?.id ?? null)
        : null;

    return successResponse({
      items: vocabularyItems,
      nextCursor,
      hasNextPage,
    });
  } catch (error) {
    console.error('Error fetching vocabulary:', error);
    return ApiErrors.INTERNAL_ERROR('Failed to fetch vocabulary');
  }
}

/**
 * POST /api/vocabulary
 * 新增單字
 * 支援同時新增 exampleSentences 和關聯 groups
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 使用 Zod 驗證輸入
    const { createVocabularySchema } = await import('@/lib/validations');
    const validationResult = createVocabularySchema.safeParse(body);

    if (!validationResult.success) {
      return ApiErrors.VALIDATION_ERROR('Invalid input data', validationResult.error.flatten());
    }

    const { exampleSentences, groupIds, ...vocabularyData } = validationResult.data;

    // 建立單字資料，包含關聯的 exampleSentences 和 groups
    const vocabularyItem = await prisma.vocabularyItem.create({
      data: {
        ...vocabularyData,
        exampleSentences: exampleSentences
          ? {
              create: exampleSentences,
            }
          : undefined,
        groups: groupIds
          ? {
              connect: groupIds.map((id) => ({ id })),
            }
          : undefined,
      },
      include: {
        exampleSentences: true,
        groups: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return successResponse(vocabularyItem, 201);
  } catch (error) {
    console.error('Error creating vocabulary:', error);

    // 處理 Prisma 錯誤
    if (error instanceof Error && error.message.includes('Foreign key constraint')) {
      return ApiErrors.BAD_REQUEST('Invalid group ID provided');
    }

    return ApiErrors.INTERNAL_ERROR('Failed to create vocabulary');
  }
}
