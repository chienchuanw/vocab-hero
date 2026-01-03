import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GET, POST } from '@/app/api/notifications/route';
import { PATCH } from '@/app/api/notifications/[id]/route';
import { prisma } from '@/lib/db/prisma';

/**
 * Notification API Integration Tests
 * 測試通知 API 端點的完整功能，包含 CRUD 操作
 */

vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    notification: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

describe('Notification API Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /api/notifications - Query and filtering', () => {
    it('should fetch all notifications for a user', async () => {
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
        {
          id: 'notif-2',
          userId: 'user-1',
          type: 'STREAK_WARNING',
          title: 'Streak Warning',
          message: 'Your streak is at risk',
          priority: 'MEDIUM',
          isRead: true,
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
      expect(data.data).toHaveLength(2);
      expect(prisma.notification.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should filter notifications by read status', async () => {
      const mockUnreadNotifications = [
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

      (prisma.notification.findMany as any).mockResolvedValue(mockUnreadNotifications);

      const request = new Request(
        'http://localhost:3000/api/notifications?userId=user-1&isRead=false'
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(1);
      expect(data.data[0].isRead).toBe(false);
    });

    it('should filter notifications by type', async () => {
      const mockGoalNotifications = [
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

      (prisma.notification.findMany as any).mockResolvedValue(mockGoalNotifications);

      const request = new Request(
        'http://localhost:3000/api/notifications?userId=user-1&type=GOAL_ACHIEVED'
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(1);
      expect(data.data[0].type).toBe('GOAL_ACHIEVED');
    });

    it('should return 400 for missing userId', async () => {
      const request = new Request('http://localhost:3000/api/notifications');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      (prisma.notification.findMany as any).mockRejectedValue(new Error('Database error'));

      const request = new Request('http://localhost:3000/api/notifications?userId=user-1');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('POST /api/notifications - Create notifications', () => {
    it('should create a new notification', async () => {
      const mockNotification = {
        id: 'notif-new',
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
      expect(data.data.id).toBe('notif-new');
      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          type: 'GOAL_ACHIEVED',
          title: 'Goal Achieved!',
          message: 'You completed your daily goal',
          priority: 'HIGH',
        },
      });
    });

    it('should create notification with default priority', async () => {
      const mockNotification = {
        id: 'notif-new',
        userId: 'user-1',
        type: 'STUDY_REMINDER',
        title: 'Study Reminder',
        message: 'Time to study',
        priority: 'LOW',
        isRead: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.notification.create as any).mockResolvedValue(mockNotification);

      const request = new Request('http://localhost:3000/api/notifications', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user-1',
          type: 'STUDY_REMINDER',
          title: 'Study Reminder',
          message: 'Time to study',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
    });

    it('should return 400 for invalid notification type', async () => {
      const request = new Request('http://localhost:3000/api/notifications', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user-1',
          type: 'INVALID_TYPE',
          title: 'Test',
          message: 'Test message',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing required fields', async () => {
      const request = new Request('http://localhost:3000/api/notifications', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user-1',
          type: 'GOAL_ACHIEVED',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should handle database errors during creation', async () => {
      (prisma.notification.create as any).mockRejectedValue(new Error('Database error'));

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

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('PATCH /api/notifications/[id] - Mark as read', () => {
    it('should mark notification as read', async () => {
      const mockNotification = {
        id: 'notif-1',
        userId: 'user-1',
        type: 'GOAL_ACHIEVED',
        title: 'Goal Achieved!',
        message: 'You completed your daily goal',
        priority: 'HIGH',
        isRead: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.notification.update as any).mockResolvedValue(mockNotification);

      const request = new Request('http://localhost:3000/api/notifications/notif-1', {
        method: 'PATCH',
        body: JSON.stringify({ isRead: true }),
      });

      const response = await PATCH(request, { params: Promise.resolve({ id: 'notif-1' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.isRead).toBe(true);
      expect(prisma.notification.update).toHaveBeenCalledWith({
        where: { id: 'notif-1' },
        data: { isRead: true },
      });
    });

    it('should return 400 for invalid data', async () => {
      const request = new Request('http://localhost:3000/api/notifications/notif-1', {
        method: 'PATCH',
        body: JSON.stringify({ isRead: 'invalid' }),
      });

      const response = await PATCH(request, { params: Promise.resolve({ id: 'notif-1' }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors during update', async () => {
      (prisma.notification.update as any).mockRejectedValue(new Error('Database error'));

      const request = new Request('http://localhost:3000/api/notifications/notif-1', {
        method: 'PATCH',
        body: JSON.stringify({ isRead: true }),
      });

      const response = await PATCH(request, { params: Promise.resolve({ id: 'notif-1' }) });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INTERNAL_ERROR');
    });
  });
});
