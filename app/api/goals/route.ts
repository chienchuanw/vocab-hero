import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { successResponse, ApiErrors } from '@/lib/api/response';
import { updateDailyGoalSchema } from '@/lib/validations/daily-goal';
import { z } from 'zod';

/**
 * GET /api/goals
 *
 * Retrieves the daily goal for a specific user.
 *
 * Query parameters:
 * - userId: User ID (required)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return ApiErrors.BAD_REQUEST('User ID is required');
    }

    const dailyGoal = await prisma.dailyGoal.findUnique({
      where: { userId },
    });

    if (!dailyGoal) {
      return ApiErrors.NOT_FOUND('Daily goal not found for this user');
    }

    return successResponse(dailyGoal);
  } catch (error) {
    console.error('Error fetching daily goal:', error);
    return ApiErrors.INTERNAL_ERROR('Failed to fetch daily goal');
  }
}

/**
 * PUT /api/goals
 *
 * Creates or updates the daily goal for a user.
 *
 * Request body:
 * - userId: User ID (required)
 * - wordsPerDay: Number of words per day (optional, 1-100)
 * - minutesPerDay: Number of minutes per day (optional, 5-120)
 * - reminderTime: Reminder time in HH:mm format (optional)
 * - pushEnabled: Whether push notifications are enabled (optional)
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate userId
    if (!body.userId) {
      return ApiErrors.BAD_REQUEST('User ID is required');
    }

    const userId = body.userId;

    // Validate update data
    const validationResult = updateDailyGoalSchema.safeParse(body);

    if (!validationResult.success) {
      return ApiErrors.VALIDATION_ERROR(
        'Invalid daily goal data',
        validationResult.error.errors
      );
    }

    const updateData = validationResult.data;

    // Upsert daily goal
    const dailyGoal = await prisma.dailyGoal.upsert({
      where: { userId },
      update: updateData,
      create: {
        userId,
        wordsPerDay: updateData.wordsPerDay ?? 10,
        minutesPerDay: updateData.minutesPerDay ?? 30,
        reminderTime: updateData.reminderTime ?? '10:00',
        pushEnabled: updateData.pushEnabled ?? false,
      },
    });

    return successResponse(dailyGoal);
  } catch (error) {
    console.error('Error updating daily goal:', error);

    if (error instanceof z.ZodError) {
      return ApiErrors.VALIDATION_ERROR('Invalid request data', error.errors);
    }

    return ApiErrors.INTERNAL_ERROR('Failed to update daily goal');
  }
}

