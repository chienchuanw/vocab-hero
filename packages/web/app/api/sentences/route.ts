import { NextRequest } from 'next/server';
import { successResponse, ApiErrors } from '@/lib/api';
import { prisma } from '@/lib/db/prisma';

/**
 * GET /api/sentences
 * 取得句子卡片列表，按建立時間倒序排列
 */
export async function GET(_request: NextRequest) {
  try {
    // 查詢所有句子卡片，按建立時間倒序排列
    const sentenceCards = await prisma.sentenceCard.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return successResponse(sentenceCards);
  } catch (error) {
    console.error('Error fetching sentence cards:', error);
    return ApiErrors.INTERNAL_ERROR('Failed to fetch sentence cards');
  }
}

/**
 * POST /api/sentences
 * 新增句子卡片
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 使用 Zod 驗證輸入
    const { createSentenceSchema } = await import('@/lib/validations/sentence');
    const validationResult = createSentenceSchema.safeParse(body);

    if (!validationResult.success) {
      return ApiErrors.VALIDATION_ERROR('Invalid input data', validationResult.error.flatten());
    }

    // 建立句子卡片
    const sentenceCard = await prisma.sentenceCard.create({
      data: validationResult.data,
    });

    return successResponse(sentenceCard, 201);
  } catch (error) {
    console.error('Error creating sentence card:', error);
    return ApiErrors.INTERNAL_ERROR('Failed to create sentence card');
  }
}
