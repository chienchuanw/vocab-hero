import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { createNotificationSchema, notificationQuerySchema } from '@/lib/validations/notification';

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

    return NextResponse.json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch notifications',
        },
      },
      { status: 500 }
    );
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

    const { userId, type, title, message, priority } = validation.data;

    // Create notification
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        priority,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: notification,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create notification',
        },
      },
      { status: 500 }
    );
  }
}
