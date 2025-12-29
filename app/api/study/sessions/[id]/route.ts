import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { successResponse, ApiErrors } from '@/lib/api/response';
import { updateStudySessionSchema } from '@/lib/validations';
import { updateDailyLog } from '@/lib/progress/progress-log';

/**
 * GET /api/study/sessions/:id
 * 取得單一學習 session
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const session = await prisma.studySession.findUnique({
      where: { id },
    });

    if (!session) {
      return ApiErrors.NOT_FOUND('Study session not found');
    }

    return successResponse(session);
  } catch (error) {
    console.error('Error fetching study session:', error);
    return ApiErrors.INTERNAL_ERROR('Failed to fetch study session');
  }
}

/**
 * PUT /api/study/sessions/:id
 * 更新學習 session（進度、完成狀態）
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    // 驗證輸入
    const validationResult = updateStudySessionSchema.safeParse(body);

    if (!validationResult.success) {
      return ApiErrors.VALIDATION_ERROR('Invalid input data', validationResult.error.flatten());
    }

    // 檢查 session 是否存在
    const existingSession = await prisma.studySession.findUnique({
      where: { id },
    });

    if (!existingSession) {
      return ApiErrors.NOT_FOUND('Study session not found');
    }

    // 準備更新資料
    const updateData: any = {};

    if (validationResult.data.cardsReviewed !== undefined) {
      updateData.cardsReviewed = validationResult.data.cardsReviewed;
    }

    if (validationResult.data.correctAnswers !== undefined) {
      updateData.correctAnswers = validationResult.data.correctAnswers;
    }

    if (validationResult.data.timeSpentMinutes !== undefined) {
      updateData.timeSpentMinutes = validationResult.data.timeSpentMinutes;
    }

    if (validationResult.data.completedAt !== undefined) {
      updateData.completedAt = new Date(validationResult.data.completedAt);
    }

    // 更新 session
    const updatedSession = await prisma.studySession.update({
      where: { id },
      data: updateData,
    });

    // 如果 session 被標記為完成，自動記錄進度
    if (validationResult.data.completedAt !== undefined) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      await updateDailyLog({
        userId: existingSession.userId,
        date: today,
        wordsStudied: updatedSession.cardsReviewed,
        timeSpentMinutes: updatedSession.timeSpentMinutes,
        sessionsCompleted: 1,
        correctAnswers: updatedSession.correctAnswers,
        totalAnswers: updatedSession.cardsReviewed,
      });
    }

    return successResponse(updatedSession);
  } catch (error) {
    console.error('Error updating study session:', error);
    return ApiErrors.INTERNAL_ERROR('Failed to update study session');
  }
}
