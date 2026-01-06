import { describe, it, expect, beforeEach } from 'vitest';
import { GET, PUT } from './route';
import { prisma } from '@/lib/db/prisma';
import { cleanDatabase } from '@/tests/setup-db';

describe('GET /api/settings', () => {
  let testUserId: string;

  beforeEach(async () => {
    await cleanDatabase();

    const user = await prisma.user.create({
      data: {
        email: 'test-settings@example.com',
        name: 'Test Settings User',
      },
    });
    testUserId = user.id;
  });

  it('should return 404 when no settings exist for user', async () => {
    const request = new Request(`http://localhost:3000/api/settings?userId=${testUserId}`);
    const response = await GET(request as never);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
  });

  it('should return settings when they exist', async () => {
    await prisma.userSettings.create({
      data: {
        userId: testUserId,
        theme: 'DARK',
        ttsSpeed: 1.25,
        ttsVolume: 0.8,
        ttsPitch: 1.0,
        cardsPerSession: 30,
        defaultStudyMode: 'MULTIPLE_CHOICE',
        autoAdvance: true,
        showReading: false,
        language: 'en',
      },
    });

    const request = new Request(`http://localhost:3000/api/settings?userId=${testUserId}`);
    const response = await GET(request as never);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.theme).toBe('DARK');
    expect(data.data.ttsSpeed).toBe(1.25);
    expect(data.data.ttsVolume).toBe(0.8);
    expect(data.data.cardsPerSession).toBe(30);
    expect(data.data.defaultStudyMode).toBe('MULTIPLE_CHOICE');
    expect(data.data.autoAdvance).toBe(true);
    expect(data.data.showReading).toBe(false);
  });

  it('should return 400 when userId is missing', async () => {
    const request = new Request('http://localhost:3000/api/settings');
    const response = await GET(request as never);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });
});

describe('PUT /api/settings', () => {
  let testUserId: string;

  beforeEach(async () => {
    await cleanDatabase();

    const user = await prisma.user.create({
      data: {
        email: 'test-settings@example.com',
        name: 'Test Settings User',
      },
    });
    testUserId = user.id;
  });

  it('should create settings when they do not exist', async () => {
    const request = new Request('http://localhost:3000/api/settings', {
      method: 'PUT',
      body: JSON.stringify({
        userId: testUserId,
        theme: 'LIGHT',
        cardsPerSession: 25,
      }),
    });

    const response = await PUT(request as never);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.theme).toBe('LIGHT');
    expect(data.data.cardsPerSession).toBe(25);
    expect(data.data.ttsSpeed).toBe(1.0);
    expect(data.data.defaultStudyMode).toBe('FLASHCARD');
  });

  it('should update existing settings', async () => {
    await prisma.userSettings.create({
      data: {
        userId: testUserId,
        theme: 'SYSTEM',
        ttsSpeed: 1.0,
        cardsPerSession: 20,
        defaultStudyMode: 'FLASHCARD',
      },
    });

    const request = new Request('http://localhost:3000/api/settings', {
      method: 'PUT',
      body: JSON.stringify({
        userId: testUserId,
        theme: 'DARK',
        ttsSpeed: 1.5,
        ttsVolume: 0.5,
        cardsPerSession: 40,
        defaultStudyMode: 'SPELLING',
        autoAdvance: true,
      }),
    });

    const response = await PUT(request as never);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.theme).toBe('DARK');
    expect(data.data.ttsSpeed).toBe(1.5);
    expect(data.data.ttsVolume).toBe(0.5);
    expect(data.data.cardsPerSession).toBe(40);
    expect(data.data.defaultStudyMode).toBe('SPELLING');
    expect(data.data.autoAdvance).toBe(true);
  });

  it('should return 400 for invalid theme value', async () => {
    const request = new Request('http://localhost:3000/api/settings', {
      method: 'PUT',
      body: JSON.stringify({
        userId: testUserId,
        theme: 'INVALID',
      }),
    });

    const response = await PUT(request as never);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });

  it('should return 400 for ttsSpeed out of range', async () => {
    const request = new Request('http://localhost:3000/api/settings', {
      method: 'PUT',
      body: JSON.stringify({
        userId: testUserId,
        ttsSpeed: 15,
      }),
    });

    const response = await PUT(request as never);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });

  it('should return 400 for cardsPerSession out of range', async () => {
    const request = new Request('http://localhost:3000/api/settings', {
      method: 'PUT',
      body: JSON.stringify({
        userId: testUserId,
        cardsPerSession: 200,
      }),
    });

    const response = await PUT(request as never);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });

  it('should return 400 for invalid defaultStudyMode', async () => {
    const request = new Request('http://localhost:3000/api/settings', {
      method: 'PUT',
      body: JSON.stringify({
        userId: testUserId,
        defaultStudyMode: 'INVALID_MODE',
      }),
    });

    const response = await PUT(request as never);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });

  it('should return 400 when userId is missing', async () => {
    const request = new Request('http://localhost:3000/api/settings', {
      method: 'PUT',
      body: JSON.stringify({
        theme: 'DARK',
      }),
    });

    const response = await PUT(request as never);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });

  it('should update ttsVoice to null', async () => {
    await prisma.userSettings.create({
      data: {
        userId: testUserId,
        ttsVoice: 'Google Japanese',
      },
    });

    const request = new Request('http://localhost:3000/api/settings', {
      method: 'PUT',
      body: JSON.stringify({
        userId: testUserId,
        ttsVoice: null,
      }),
    });

    const response = await PUT(request as never);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.ttsVoice).toBeNull();
  });

  it('should update language setting', async () => {
    await prisma.userSettings.create({
      data: {
        userId: testUserId,
        language: 'en',
      },
    });

    const request = new Request('http://localhost:3000/api/settings', {
      method: 'PUT',
      body: JSON.stringify({
        userId: testUserId,
        language: 'zh-TW',
      }),
    });

    const response = await PUT(request as never);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.language).toBe('zh-TW');
  });
});
