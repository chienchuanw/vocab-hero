import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import {
  updateNotificationPreferenceSchema,
  notificationPreferenceQuerySchema,
} from '@/lib/validations/notification-preference';

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
      const firstError = validation.error.errors?.[0];
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: firstError?.message || 'Invalid query parameters',
          },
        },
        { status: 400 }
      );
    }

    const { userId: validatedUserId } = validation.data;

    // Fetch notification preferences
    const preferences = await prisma.notificationPreference.findUnique({
      where: { userId: validatedUserId },
    });

    return NextResponse.json({
      success: true,
      data: preferences,
    });
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch notification preferences',
        },
      },
      { status: 500 }
    );
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
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'User ID is required',
          },
        },
        { status: 400 }
      );
    }

    // Validate preferences
    const validation = updateNotificationPreferenceSchema.safeParse(preferences);

    if (!validation.success) {
      const firstError = validation.error.errors?.[0];
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: firstError?.message || 'Invalid preference data',
          },
        },
        { status: 400 }
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

    return NextResponse.json({
      success: true,
      data: updatedPreferences,
    });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update notification preferences',
        },
      },
      { status: 500 }
    );
  }
}

