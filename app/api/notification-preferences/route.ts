import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import {
  updateNotificationPreferenceSchema,
  notificationPreferenceQuerySchema,
} from '@/lib/validations/notification-preference';
import { successResponse, ApiErrors } from '@/lib/api/response';

/**
 * GET /api/notification-preferences
 * Fetch notification preferences for a user
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || undefined;

    // Validate query parameters
    const validation = notificationPreferenceQuerySchema.safeParse({ userId });

    if (!validation.success) {
      return ApiErrors.VALIDATION_ERROR(
        validation.error.issues[0]?.message ?? 'Invalid query parameters',
        validation.error.issues
      );
    }

    const { userId: validatedUserId } = validation.data;

    // Fetch notification preferences
    const preferences = await prisma.notificationPreference.findUnique({
      where: { userId: validatedUserId },
    });

    return successResponse(preferences);
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    return ApiErrors.INTERNAL_ERROR('Failed to fetch notification preferences');
  }
}

/**
 * PUT /api/notification-preferences
 * Update notification preferences for a user (upsert)
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // Extract userId and preferences
    const { userId, ...preferences } = body;

    // Validate userId
    if (!userId || typeof userId !== 'string') {
      return ApiErrors.VALIDATION_ERROR('User ID is required');
    }

    // Validate preferences
    const validation = updateNotificationPreferenceSchema.safeParse(preferences);

    if (!validation.success) {
      return ApiErrors.VALIDATION_ERROR(
        validation.error.issues[0]?.message ?? 'Invalid preference data',
        validation.error.issues
      );
    }

    // Upsert notification preferences
    const updatedPreferences = await prisma.notificationPreference.upsert({
      where: { userId },
      update: validation.data,
      create: {
        userId,
        ...validation.data,
      },
    });

    return successResponse(updatedPreferences);
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return ApiErrors.INTERNAL_ERROR('Failed to update notification preferences');
  }
}
