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
 * Create a new vocabulary group
 */
export async function POST(request: NextRequest) {
  try {
    // TODO: Implement group creation logic
    const body = await request.json();
    return successResponse({ id: 'placeholder' }, 201);
  } catch (error) {
    console.error('Error creating group:', error);
    return ApiErrors.INTERNAL_ERROR('Failed to create group');
  }
}
