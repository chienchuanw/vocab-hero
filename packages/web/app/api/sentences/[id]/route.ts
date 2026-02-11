import { NextRequest } from 'next/server';
import { successResponse, ApiErrors } from '@/lib/api';
import { prisma } from '@/lib/db/prisma';

/**
 * GET /api/sentences/:id
 * 取得單一句子卡片的詳細資訊
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const sentenceCard = await prisma.sentenceCard.findUnique({
      where: { id },
    });

    if (!sentenceCard) {
      return ApiErrors.NOT_FOUND('Sentence card not found');
    }

    return successResponse(sentenceCard);
  } catch (error) {
    console.error('Error fetching sentence card:', error);
    return ApiErrors.INTERNAL_ERROR('Failed to fetch sentence card');
  }
}

/**
 * PUT /api/sentences/:id
 * 更新句子卡片資料
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { updateSentenceSchema } = await import('@/lib/validations/sentence');
    const validationResult = updateSentenceSchema.safeParse(body);

    if (!validationResult.success) {
      return ApiErrors.VALIDATION_ERROR('Invalid input data', validationResult.error.flatten());
    }

    const existingCard = await prisma.sentenceCard.findUnique({
      where: { id },
    });

    if (!existingCard) {
      return ApiErrors.NOT_FOUND('Sentence card not found');
    }

    const updatedCard = await prisma.sentenceCard.update({
      where: { id },
      data: validationResult.data,
    });

    return successResponse(updatedCard);
  } catch (error) {
    console.error('Error updating sentence card:', error);
    return ApiErrors.INTERNAL_ERROR('Failed to update sentence card');
  }
}

/**
 * DELETE /api/sentences/:id
 * 刪除句子卡片
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existingCard = await prisma.sentenceCard.findUnique({
      where: { id },
    });

    if (!existingCard) {
      return ApiErrors.NOT_FOUND('Sentence card not found');
    }

    await prisma.sentenceCard.delete({
      where: { id },
    });

    return successResponse({ id, message: 'Sentence card deleted successfully' });
  } catch (error) {
    console.error('Error deleting sentence card:', error);
    return ApiErrors.INTERNAL_ERROR('Failed to delete sentence card');
  }
}
