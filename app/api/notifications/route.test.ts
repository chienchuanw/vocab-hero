import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GET, POST } from './route';
import { prisma } from '@/lib/db/prisma';

/**
 * Notifications API Route Tests
 * Tests for notification CRUD endpoints
 */

// Mock Prisma
vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    notification: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}));

describe('GET /api/notifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return notifications for a user', async () => {
    const mockNotifications = [
      {
        id: 'notif-1',
        userId: 'user-1',
        type: 'GOAL_ACHIEVED',
        title: 'Goal Achieved!',
        message: 'You completed your daily goal',
        priority: 'HIGH',
        isRead: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    (prisma.notification.findMany as any).mockResolvedValue(mockNotifications);

    const request = new Request('http://localhost:3000/api/notifications?userId=user-1');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(1);
    expect(data.data[0].id).toBe('notif-1');
  });

  it('should filter notifications by isRead status', async () => {
    const mockNotifications = [
      {
        id: 'notif-1',
        userId: 'user-1',
        type: 'GOAL_ACHIEVED',
        title: 'Goal Achieved!',
        message: 'You completed your daily goal',
        priority: 'HIGH',
        isRead: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    (prisma.notification.findMany as any).mockResolvedValue(mockNotifications);

    const request = new Request('http://localhost:3000/api/notifications?userId=user-1&isRead=false');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(prisma.notification.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          isRead: false,
        }),
      })
    );
  });

  it('should return 400 if userId is missing', async () => {
    const request = new Request('http://localhost:3000/api/notifications');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });

  it('should handle database errors', async () => {
    (prisma.notification.findMany as any).mockRejectedValue(new Error('Database error'));

    const request = new Request('http://localhost:3000/api/notifications?userId=user-1');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
  });
});

describe('POST /api/notifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create a new notification', async () => {
    const mockNotification = {
      id: 'notif-1',
      userId: 'user-1',
      type: 'GOAL_ACHIEVED',
      title: 'Goal Achieved!',
      message: 'You completed your daily goal',
      priority: 'HIGH',
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (prisma.notification.create as any).mockResolvedValue(mockNotification);

    const request = new Request('http://localhost:3000/api/notifications', {
      method: 'POST',
      body: JSON.stringify({
        userId: 'user-1',
        type: 'GOAL_ACHIEVED',
        title: 'Goal Achieved!',
        message: 'You completed your daily goal',
        priority: 'HIGH',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.id).toBe('notif-1');
  });

  it('should return 400 for invalid data', async () => {
    const request = new Request('http://localhost:3000/api/notifications', {
      method: 'POST',
      body: JSON.stringify({
        userId: 'user-1',
        type: 'INVALID_TYPE',
        title: '',
        message: '',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });
});

