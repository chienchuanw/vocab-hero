import { NextRequest } from 'next/server';
import { successResponse, ApiErrors } from '@/lib/api';
import { prisma } from '@/lib/db/prisma';

/**
 * GET /api/groups
 * 取得所有群組列表
 * 包含每個群組的單字數量統計
 */
export async function GET(request: NextRequest) {
  try {
    // 查詢所有群組，包含單字數量統計
    const groups = await prisma.vocabularyGroup.findMany({
      include: {
        _count: {
          select: {
            vocabularyItems: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // 轉換資料格式，將 _count 轉換為 vocabularyCount
    const groupsWithCount = groups.map((group) => ({
      id: group.id,
      name: group.name,
      description: group.description,
      userId: group.userId,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
      vocabularyCount: group._count.vocabularyItems,
    }));

    return successResponse(groupsWithCount);
  } catch (error) {
    console.error('Error fetching groups:', error);
    return ApiErrors.INTERNAL_ERROR('Failed to fetch groups');
  }
}

/**
 * POST /api/groups
 * 新增群組
 * 需要提供 userId（目前為單一使用者應用，可使用固定值或從 session 取得）
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { groupSchema } = await import('@/lib/validations');
    const validationResult = groupSchema.safeParse(body);

    if (!validationResult.success) {
      return ApiErrors.VALIDATION_ERROR('Invalid input data', validationResult.error.flatten());
    }

    // 取得或建立預設使用者
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: 'default@vocab-hero.local',
          name: 'Default User',
        },
      });
    }

    const group = await prisma.vocabularyGroup.create({
      data: {
        ...validationResult.data,
        userId: user.id,
      },
      include: {
        _count: {
          select: {
            vocabularyItems: true,
          },
        },
      },
    });

    return successResponse(
      {
        ...group,
        vocabularyCount: group._count.vocabularyItems,
      },
      201
    );
  } catch (error) {
    console.error('Error creating group:', error);
    return ApiErrors.INTERNAL_ERROR('Failed to create group');
  }
}
