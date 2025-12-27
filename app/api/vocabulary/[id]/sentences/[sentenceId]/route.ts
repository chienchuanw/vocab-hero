import { NextRequest } from 'next/server';
import { successResponse, ApiErrors } from '@/lib/api';
import { prisma } from '@/lib/db/prisma';

/**
 * PUT /api/vocabulary/:id/sentences/:sentenceId
 * 更新例句
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sentenceId: string }> }
) {
  try {
    const { id, sentenceId } = await params;
    const body = await request.json();

    // 驗證輸入
    const { updateExampleSentenceSchema } = await import('@/lib/validations');
    const validationResult = updateExampleSentenceSchema.safeParse(body);

    if (!validationResult.success) {
      return ApiErrors.VALIDATION_ERROR(
        'Invalid input data',
        validationResult.error.flatten()
      );
    }

    // 檢查例句是否存在且屬於指定單字
    const existingSentence = await prisma.exampleSentence.findFirst({
      where: {
        id: sentenceId,
        vocabularyItemId: id,
      },
    });

    if (!existingSentence) {
      return ApiErrors.NOT_FOUND('Example sentence not found');
    }

    // 更新例句
    const updatedSentence = await prisma.exampleSentence.update({
      where: { id: sentenceId },
      data: validationResult.data,
    });

    return successResponse(updatedSentence);
  } catch (error) {
    console.error('Error updating example sentence:', error);
    return ApiErrors.INTERNAL_ERROR('Failed to update example sentence');
  }
}

/**
 * DELETE /api/vocabulary/:id/sentences/:sentenceId
 * 刪除例句
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sentenceId: string }> }
) {
  try {
    const { id, sentenceId } = await params;

    // 檢查例句是否存在且屬於指定單字
    const existingSentence = await prisma.exampleSentence.findFirst({
      where: {
        id: sentenceId,
        vocabularyItemId: id,
      },
    });

    if (!existingSentence) {
      return ApiErrors.NOT_FOUND('Example sentence not found');
    }

    // 刪除例句
    await prisma.exampleSentence.delete({
      where: { id: sentenceId },
    });

    return successResponse({ id: sentenceId, message: 'Example sentence deleted successfully' });
  } catch (error) {
    console.error('Error deleting example sentence:', error);
    return ApiErrors.INTERNAL_ERROR('Failed to delete example sentence');
  }
}

