import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { updateNotificationSchema } from '@/lib/validations/notification';
import { successResponse, ApiErrors } from '@/lib/api/response';

/**
 * PATCH /api/notifications/[id]
 * Mark a notification as read or unread
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate request body
    const validation = updateNotificationSchema.safeParse(body);

    if (!validation.success) {
      return ApiErrors.VALIDATION_ERROR(
        validation.error.issues[0]?.message ?? 'Invalid notification data',
        validation.error.issues
      );
    }

    const { isRead } = validation.data;

    const notification = await prisma.notification.update({
      where: { id },
      data: { isRead },
    });

    return successResponse(notification);
  } catch (error) {
    console.error('Error updating notification:', error);
    return ApiErrors.INTERNAL_ERROR('Failed to update notification');
  }
}
