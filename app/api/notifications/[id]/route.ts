import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { updateNotificationSchema } from '@/lib/validations/notification';

/**
 * PATCH /api/notifications/[id]
 * Mark a notification as read or unread
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate request body
    const validation = updateNotificationSchema.safeParse(body);

    if (!validation.success) {
      const firstError = validation.error.errors?.[0];
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: firstError?.message || 'Invalid notification data',
          },
        },
        { status: 400 }
      );
    }

    const { isRead } = validation.data;

    // Update notification
    const notification = await prisma.notification.update({
      where: { id },
      data: { isRead },
    });

    return NextResponse.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update notification',
        },
      },
      { status: 500 }
    );
  }
}

