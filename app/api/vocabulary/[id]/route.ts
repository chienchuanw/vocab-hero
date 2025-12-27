import { NextRequest } from 'next/server';
import { successResponse, ApiErrors } from '@/lib/api';
import { prisma } from '@/lib/db/prisma';

/**
 * GET /api/vocabulary/:id
 * 取得單一單字的詳細資訊
 * 包含關聯的 exampleSentences 和 reviewSchedule
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // 查詢單字資料
    const vocabularyItem = await prisma.vocabularyItem.findUnique({
      where: { id },
      include: {
        exampleSentences: {
          orderBy: {
            order: 'asc',
          },
        },
        reviewSchedule: true,
        groups: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    // 如果找不到資料，回傳 404
    if (!vocabularyItem) {
      return ApiErrors.NOT_FOUND('Vocabulary item not found');
    }

    return successResponse(vocabularyItem);
  } catch (error) {
    console.error('Error fetching vocabulary item:', error);
    return ApiErrors.INTERNAL_ERROR('Failed to fetch vocabulary item');
  }
}

/**
 * PUT /api/vocabulary/:id
 * 更新單字資料
 * 支援部分更新（partial update）
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    // 使用 Zod 驗證輸入（partial update）
    const { updateVocabularySchema } = await import('@/lib/validations');
    const validationResult = updateVocabularySchema.safeParse(body);

    if (!validationResult.success) {
      return ApiErrors.VALIDATION_ERROR('Invalid input data', validationResult.error.flatten());
    }

    // 檢查單字是否存在
    const existingItem = await prisma.vocabularyItem.findUnique({
      where: { id },
    });

    if (!existingItem) {
      return ApiErrors.NOT_FOUND('Vocabulary item not found');
    }

    // 更新單字資料
    const updatedItem = await prisma.vocabularyItem.update({
      where: { id },
      data: validationResult.data,
      include: {
        exampleSentences: {
          orderBy: {
            order: 'asc',
          },
        },
        reviewSchedule: true,
        groups: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return successResponse(updatedItem);
  } catch (error) {
    console.error('Error updating vocabulary item:', error);
    return ApiErrors.INTERNAL_ERROR('Failed to update vocabulary item');
  }
}

/**
 * DELETE /api/vocabulary/:id
 * 刪除單字
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // TODO: Implement delete logic
    return successResponse({ id });
  } catch (error) {
    console.error('Error deleting vocabulary item:', error);
    return ApiErrors.INTERNAL_ERROR('Failed to delete vocabulary item');
  }
}
