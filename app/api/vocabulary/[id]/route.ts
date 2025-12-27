import { NextRequest } from 'next/server';
import { successResponse, ApiErrors } from '@/lib/api';
import { prisma } from '@/lib/db/prisma';

/**
 * GET /api/vocabulary/:id
 * 取得單一單字的詳細資訊
 * 包含關聯的 exampleSentences 和 reviewSchedule
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // TODO: Implement update logic
    return successResponse({ id });
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

