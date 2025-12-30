import { describe, it, expect, beforeEach } from 'vitest';
import { GET, PUT } from './route';
import { prisma } from '@/lib/db/prisma';
import { cleanDatabase } from '@/tests/setup-db';

/**
 * API Route Tests for /api/goals
 * Tests for daily goal CRUD operations
 */

describe('GET /api/goals', () => {
  let testUserId: string;

  beforeEach(async () => {
    await cleanDatabase();

    // Create test user
    const user = await prisma.user.create({
      data: {
        email: 'test-goals@example.com',
        name: 'Test Goals User',
      },
    });
    testUserId = user.id;
  });

  it('should return 404 when no daily goal exists for user', async () => {
    const request = new Request(
      `http://localhost:3000/api/goals?userId=${testUserId}`
    );
    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
  });

  it('should return daily goal when it exists', async () => {
    // Create daily goal
    await prisma.dailyGoal.create({
      data: {
        userId: testUserId,
        wordsPerDay: 10,
        minutesPerDay: 30,
        reminderTime: '10:00',
        pushEnabled: false,
      },
    });

    const request = new Request(
      `http://localhost:3000/api/goals?userId=${testUserId}`
    );
    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.wordsPerDay).toBe(10);
    expect(data.data.minutesPerDay).toBe(30);
    expect(data.data.reminderTime).toBe('10:00');
    expect(data.data.pushEnabled).toBe(false);
  });

  it('should return 400 when userId is missing', async () => {
    const request = new Request('http://localhost:3000/api/goals');
    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });
});

describe('PUT /api/goals', () => {
  let testUserId: string;

  beforeEach(async () => {
    await cleanDatabase();

    const user = await prisma.user.create({
      data: {
        email: 'test-goals@example.com',
        name: 'Test Goals User',
      },
    });
    testUserId = user.id;
  });

  it('should create daily goal when it does not exist', async () => {
    const request = new Request('http://localhost:3000/api/goals', {
      method: 'PUT',
      body: JSON.stringify({
        userId: testUserId,
        wordsPerDay: 15,
        minutesPerDay: 45,
      }),
    });

    const response = await PUT(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.wordsPerDay).toBe(15);
    expect(data.data.minutesPerDay).toBe(45);
  });

  it('should update existing daily goal', async () => {
    // Create initial goal
    await prisma.dailyGoal.create({
      data: {
        userId: testUserId,
        wordsPerDay: 10,
        minutesPerDay: 30,
      },
    });

    const request = new Request('http://localhost:3000/api/goals', {
      method: 'PUT',
      body: JSON.stringify({
        userId: testUserId,
        wordsPerDay: 20,
        minutesPerDay: 60,
        reminderTime: '14:00',
        pushEnabled: true,
      }),
    });

    const response = await PUT(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.wordsPerDay).toBe(20);
    expect(data.data.minutesPerDay).toBe(60);
    expect(data.data.reminderTime).toBe('14:00');
    expect(data.data.pushEnabled).toBe(true);
  });

  it('should return 400 for invalid wordsPerDay', async () => {
    const request = new Request('http://localhost:3000/api/goals', {
      method: 'PUT',
      body: JSON.stringify({
        userId: testUserId,
        wordsPerDay: 0,
      }),
    });

    const response = await PUT(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });
});

