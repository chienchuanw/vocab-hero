import { NextRequest } from 'next/server';
import { successResponse, ApiErrors } from '@/lib/api';
import { prisma } from '@/lib/db/prisma';

/**
 * PUT /api/groups/:id/vocabulary
 * 管理群組中的單字（新增/移除）
 * 用於 drag-and-drop 功能
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // 驗證輸入
    const { manageGroupVocabularySchema } = await import('@/lib/validations');
    const validationResult = manageGroupVocabularySchema.safeParse(body);

    if (!validationResult.success) {
      return ApiErrors.VALIDATION_ERROR(
        'Invalid input data',
        validationResult.error.flatten()
      );
    }

    const { action, vocabularyIds } = validationResult.data;

    // 檢查群組是否存在
    const existingGroup = await prisma.vocabularyGroup.findUnique({
      where: { id },
    });

    if (!existingGroup) {
      return ApiErrors.NOT_FOUND('Group not found');
    }

    // 根據 action 執行對應操作
    if (action === 'add') {
      // 新增單字到群組
      await prisma.vocabularyGroup.update({
        where: { id },
        data: {
          vocabularyItems: {
            connect: vocabularyIds.map((vocabId) => ({ id: vocabId })),
          },
        },
      });
    } else if (action === 'remove') {
      // 從群組移除單字
      await prisma.vocabularyGroup.update({
        where: { id },
        data: {
          vocabularyItems: {
            disconnect: vocabularyIds.map((vocabId) => ({ id: vocabId })),
          },
        },
      });
    }

    // 回傳更新後的群組資訊
    const updatedGroup = await prisma.vocabularyGroup.findUnique({
      where: { id },
      include: {
        vocabularyItems: {
          select: {
            id: true,
            word: true,
            reading: true,
            meaning: true,
          },
        },
        _count: {
          select: {
            vocabularyItems: true,
          },
        },
      },
    });

    return successResponse({
      ...updatedGroup,
      vocabularyCount: updatedGroup?._count.vocabularyItems ?? 0,
    });
  } catch (error) {
    console.error('Error managing group vocabulary:', error);

    // 處理 Prisma 錯誤
    if (error instanceof Error && error.message.includes('Foreign key constraint')) {
      return ApiErrors.BAD_REQUEST('Invalid vocabulary ID provided');
    }

    return ApiErrors.INTERNAL_ERROR('Failed to manage group vocabulary');
  }
}

