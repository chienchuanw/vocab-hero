import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { successResponse, ApiErrors } from '@/lib/api/response';
import { createStudySessionSchema } from '@/lib/validations';

/**
 * POST /api/study/sessions
 * 建立新的學習 session
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 驗證輸入
    const validationResult = createStudySessionSchema.safeParse(body);

    if (!validationResult.success) {
      return ApiErrors.VALIDATION_ERROR('Invalid input data', validationResult.error.flatten());
    }

    const { userId, mode } = validationResult.data;

    // 檢查使用者是否存在
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return ApiErrors.NOT_FOUND('User not found');
    }

    // 建立 study session
    const session = await prisma.studySession.create({
      data: {
        userId,
        mode,
      },
    });

    return successResponse(session, 201);
  } catch (error) {
    console.error('Error creating study session:', error);
    return ApiErrors.INTERNAL_ERROR('Failed to create study session');
  }
}

/**
 * GET /api/study/sessions
 * 取得所有學習 sessions
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    // 建立查詢條件
    const where = userId ? { userId } : {};

    // 查詢 sessions
    const sessions = await prisma.studySession.findMany({
      where,
      orderBy: {
        startedAt: 'desc',
      },
      take: limit,
    });

    return successResponse(sessions);
  } catch (error) {
    console.error('Error fetching study sessions:', error);
    return ApiErrors.INTERNAL_ERROR('Failed to fetch study sessions');
  }
}
