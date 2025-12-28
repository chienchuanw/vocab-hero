import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { successResponse, ApiErrors } from '@/lib/api/response';
import { createStudySessionSchema, createQuizSessionSchema } from '@/lib/validations';

/**
 * POST /api/study/sessions
 * Create a new study session (flashcard or quiz)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Determine if this is a quiz session based on presence of studyMode field
    const isQuizSession = 'studyMode' in body;

    // Validate input using appropriate schema
    const validationResult = isQuizSession
      ? createQuizSessionSchema.safeParse(body)
      : createStudySessionSchema.safeParse(body);

    if (!validationResult.success) {
      return ApiErrors.VALIDATION_ERROR('Invalid input data', validationResult.error.flatten());
    }

    const { userId, mode } = validationResult.data;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return ApiErrors.NOT_FOUND('User not found');
    }

    // Prepare session data
    const sessionData: any = {
      userId,
      mode,
    };

    // Add quiz-specific fields if present
    if (isQuizSession) {
      const quizData = validationResult.data as any;
      if (quizData.studyMode) sessionData.studyMode = quizData.studyMode;
      if (quizData.quizType) sessionData.quizType = quizData.quizType;
      if (quizData.questionCount) sessionData.questionCount = quizData.questionCount;
      if (quizData.groupId) sessionData.groupId = quizData.groupId;
    }

    // Create study session
    const session = await prisma.studySession.create({
      data: sessionData,
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
