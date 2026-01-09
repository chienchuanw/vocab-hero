import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { createNotificationSchema, notificationQuerySchema } from '@/lib/validations/notification';
import { successResponse, ApiErrors } from '@/lib/api/response';

/**
 * GET /api/notifications
 * Fetch notifications for a user with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || undefined;
    const isRead = searchParams.get('isRead') || undefined;
    const type = searchParams.get('type') || undefined;

    // Validate query parameters
    const validation = notificationQuerySchema.safeParse({
      userId,
      isRead,
      type,
    });

    if (!validation.success) {
      return ApiErrors.VALIDATION_ERROR(
        validation.error.issues[0]?.message ?? 'Invalid query parameters',
        validation.error.issues
      );
    }

    const {
      userId: validatedUserId,
      isRead: validatedIsRead,
      type: validatedType,
    } = validation.data;

    // Build where clause
    const where: any = {
      userId: validatedUserId,
    };

    if (validatedIsRead !== undefined) {
      where.isRead = validatedIsRead === 'true';
    }

    if (validatedType) {
      where.type = validatedType;
    }

    // Fetch notifications
    const notifications = await prisma.notification.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return successResponse(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return ApiErrors.INTERNAL_ERROR('Failed to fetch notifications');
  }
}

/**
 * POST /api/notifications
 * Create a new notification
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validation = createNotificationSchema.safeParse(body);

    if (!validation.success) {
      return ApiErrors.VALIDATION_ERROR(
        validation.error.issues[0]?.message ?? 'Invalid notification data',
        validation.error.issues
      );
    }

    const { userId, type, title, message, priority } = validation.data;

    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        priority,
      },
    });

    return successResponse(notification, 201);
  } catch (error) {
    console.error('Error creating notification:', error);
    return ApiErrors.INTERNAL_ERROR('Failed to create notification');
  }
}
