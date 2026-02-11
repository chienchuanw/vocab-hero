import { NextRequest } from 'next/server';
import { successResponse, ApiErrors } from '@/lib/api';
import { prisma } from '@/lib/db/prisma';

/**
 * POST /api/vocabulary/:id/sentences
 * 新增例句到指定單字
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // 驗證輸入
    const { exampleSentenceSchema } = await import('@/lib/validations');
    const validationResult = exampleSentenceSchema.safeParse(body);

    if (!validationResult.success) {
      return ApiErrors.VALIDATION_ERROR(
        'Invalid input data',
        validationResult.error.flatten()
      );
    }

    // 檢查單字是否存在
    const vocabularyItem = await prisma.vocabularyItem.findUnique({
      where: { id },
    });

    if (!vocabularyItem) {
      return ApiErrors.NOT_FOUND('Vocabulary item not found');
    }

    // 建立例句
    const exampleSentence = await prisma.exampleSentence.create({
      data: {
        ...validationResult.data,
        vocabularyItemId: id,
      },
    });

    return successResponse(exampleSentence, 201);
  } catch (error) {
    console.error('Error creating example sentence:', error);
    return ApiErrors.INTERNAL_ERROR('Failed to create example sentence');
  }
}

