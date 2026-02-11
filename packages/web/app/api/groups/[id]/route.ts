import { NextRequest } from 'next/server';
import { successResponse, ApiErrors } from '@/lib/api';
import { prisma } from '@/lib/db/prisma';

/**
 * GET /api/groups/:id
 * 取得單一群組的詳細資訊
 * 包含關聯的 vocabularyItems
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const group = await prisma.vocabularyGroup.findUnique({
      where: { id },
      include: {
        vocabularyItems: {
          select: {
            id: true,
            word: true,
            reading: true,
            meaning: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            vocabularyItems: true,
          },
        },
      },
    });

    if (!group) {
      return ApiErrors.NOT_FOUND('Group not found');
    }

    return successResponse({
      ...group,
      vocabularyCount: group._count.vocabularyItems,
    });
  } catch (error) {
    console.error('Error fetching group:', error);
    return ApiErrors.INTERNAL_ERROR('Failed to fetch group');
  }
}

/**
 * PUT /api/groups/:id
 * 更新群組資料
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { updateGroupSchema } = await import('@/lib/validations');
    const validationResult = updateGroupSchema.safeParse(body);

    if (!validationResult.success) {
      return ApiErrors.VALIDATION_ERROR(
        'Invalid input data',
        validationResult.error.flatten()
      );
    }

    const existingGroup = await prisma.vocabularyGroup.findUnique({
      where: { id },
    });

    if (!existingGroup) {
      return ApiErrors.NOT_FOUND('Group not found');
    }

    const updatedGroup = await prisma.vocabularyGroup.update({
      where: { id },
      data: validationResult.data,
      include: {
        _count: {
          select: {
            vocabularyItems: true,
          },
        },
      },
    });

    return successResponse({
      ...updatedGroup,
      vocabularyCount: updatedGroup._count.vocabularyItems,
    });
  } catch (error) {
    console.error('Error updating group:', error);
    return ApiErrors.INTERNAL_ERROR('Failed to update group');
  }
}

/**
 * DELETE /api/groups/:id
 * 刪除群組
 * 單字不會被刪除，只會解除關聯
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existingGroup = await prisma.vocabularyGroup.findUnique({
      where: { id },
    });

    if (!existingGroup) {
      return ApiErrors.NOT_FOUND('Group not found');
    }

    await prisma.vocabularyGroup.delete({
      where: { id },
    });

    return successResponse({ id, message: 'Group deleted successfully' });
  } catch (error) {
    console.error('Error deleting group:', error);
    return ApiErrors.INTERNAL_ERROR('Failed to delete group');
  }
}

