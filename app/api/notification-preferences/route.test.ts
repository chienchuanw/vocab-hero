import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GET, PUT } from './route';
import { prisma } from '@/lib/db/prisma';

/**
 * Notification Preferences API Route Tests
 * Tests for notification preference endpoints
 */

// Mock Prisma
vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    notificationPreference: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
  },
}));

describe('GET /api/notification-preferences', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return notification preferences for a user', async () => {
    const mockPreferences = {
      id: 'pref-1',
      userId: 'user-1',
      goalAchievementEnabled: true,
      streakWarningEnabled: true,
      studyReminderEnabled: false,
      milestoneEnabled: true,
      pushEnabled: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (prisma.notificationPreference.findUnique as any).mockResolvedValue(mockPreferences);

    const request = new Request('http://localhost:3000/api/notification-preferences?userId=user-1');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.userId).toBe('user-1');
  });

  it('should return 400 if userId is missing', async () => {
    const request = new Request('http://localhost:3000/api/notification-preferences');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });

  it('should handle database errors', async () => {
    (prisma.notificationPreference.findUnique as any).mockRejectedValue(new Error('Database error'));

    const request = new Request('http://localhost:3000/api/notification-preferences?userId=user-1');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
  });
});

describe('PUT /api/notification-preferences', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should update notification preferences', async () => {
    const mockPreferences = {
      id: 'pref-1',
      userId: 'user-1',
      goalAchievementEnabled: false,
      streakWarningEnabled: true,
      studyReminderEnabled: true,
      milestoneEnabled: true,
      pushEnabled: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (prisma.notificationPreference.upsert as any).mockResolvedValue(mockPreferences);

    const request = new Request('http://localhost:3000/api/notification-preferences', {
      method: 'PUT',
      body: JSON.stringify({
        userId: 'user-1',
        goalAchievementEnabled: false,
        pushEnabled: true,
      }),
    });

    const response = await PUT(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.userId).toBe('user-1');
  });

  it('should return 400 for invalid data', async () => {
    const request = new Request('http://localhost:3000/api/notification-preferences', {
      method: 'PUT',
      body: JSON.stringify({
        userId: 'user-1',
        goalAchievementEnabled: 'invalid',
      }),
    });

    const response = await PUT(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });

  it('should return 400 if userId is missing', async () => {
    const request = new Request('http://localhost:3000/api/notification-preferences', {
      method: 'PUT',
      body: JSON.stringify({
        goalAchievementEnabled: true,
      }),
    });

    const response = await PUT(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });
});

