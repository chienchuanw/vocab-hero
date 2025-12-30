import { NextRequest } from 'next/server';
import { successResponse, ApiErrors } from '@/lib/api';
import { updateProgressSchema } from '@/lib/validations';
import { getDailyLogs, getProgressRange, updateDailyLog } from '@/lib/progress/progress-log';

/**
 * GET /api/progress
 * Get user progress data with optional date range filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = searchParams.get('limit');

    if (!userId) {
      return ApiErrors.BAD_REQUEST('User ID is required');
    }

    let logs;

    if (startDate && endDate) {
      logs = await getProgressRange(userId, {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      });
    } else {
      logs = await getDailyLogs(userId, limit ? parseInt(limit, 10) : undefined);
    }

    return successResponse(logs);
  } catch (error) {
    console.error('Error fetching progress:', error);
    return ApiErrors.INTERNAL_ERROR('Failed to fetch progress');
  }
}

/**
 * POST /api/progress
 * Update or create daily progress log
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validationResult = updateProgressSchema.safeParse(body);

    if (!validationResult.success) {
      return ApiErrors.VALIDATION_ERROR('Invalid progress data', validationResult.error.issues);
    }

    const { userId, date, ...progressData } = validationResult.data;

    const log = await updateDailyLog({
      userId,
      date: new Date(date),
      ...progressData,
    });

    return successResponse(log);
  } catch (error) {
    console.error('Error updating progress:', error);
    return ApiErrors.INTERNAL_ERROR('Failed to update progress');
  }
}
