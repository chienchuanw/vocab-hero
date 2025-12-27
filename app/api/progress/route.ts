import { NextRequest } from 'next/server';
import { successResponse, ApiErrors } from '@/lib/api';

/**
 * GET /api/progress
 * Get user progress data
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Implement progress retrieval logic
    return successResponse({
      totalWords: 0,
      wordsMastered: 0,
      studySessions: 0,
      currentStreak: 0,
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    return ApiErrors.INTERNAL_ERROR('Failed to fetch progress');
  }
}

