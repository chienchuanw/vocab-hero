import { describe, it, expect, beforeEach } from 'vitest';
import { GET, POST } from './route';
import { prisma } from '@/lib/db/prisma';
import { cleanDatabase } from '@/tests/setup-db';

/**
 * API Route Tests for /api/groups
 * Tests for groups CRUD operations
 */

describe('GET /api/groups', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should return empty array when no groups exist', async () => {
    const request = new Request('http://localhost:3000/api/groups');
    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual([]);
  });

  it('should return all groups with vocabulary count', async () => {
    const user = await prisma.user.create({
      data: { email: 'test@example.com', name: 'Test User' },
    });

    await prisma.vocabularyGroup.create({
      data: { name: 'JLPT N5', userId: user.id },
    });

    await prisma.vocabularyGroup.create({
      data: { name: 'JLPT N4', userId: user.id },
    });

    const request = new Request('http://localhost:3000/api/groups');
    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toHaveLength(2);
    expect(data.data[0]).toHaveProperty('vocabularyCount');
    expect(data.data[0].vocabularyCount).toBe(0);
  });

  it('should return groups ordered by creation date descending', async () => {
    const user = await prisma.user.create({
      data: { email: 'test@example.com', name: 'Test User' },
    });

    const group1 = await prisma.vocabularyGroup.create({
      data: { name: 'First Group', userId: user.id },
    });

    await new Promise((resolve) => setTimeout(resolve, 10));

    const group2 = await prisma.vocabularyGroup.create({
      data: { name: 'Second Group', userId: user.id },
    });

    const request = new Request('http://localhost:3000/api/groups');
    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data[0].name).toBe('Second Group');
    expect(data.data[1].name).toBe('First Group');
  });

  it('should include correct vocabulary count for groups with items', async () => {
    const user = await prisma.user.create({
      data: { email: 'test@example.com', name: 'Test User' },
    });

    const group = await prisma.vocabularyGroup.create({
      data: { name: 'Test Group', userId: user.id },
    });

    await prisma.vocabularyItem.createMany({
      data: [
        { word: 'hello', reading: 'hɛˈloʊ', meaning: 'greeting' },
        { word: 'world', reading: 'wɜːrld', meaning: 'earth' },
      ],
    });

    const items = await prisma.vocabularyItem.findMany();
    await prisma.vocabularyGroup.update({
      where: { id: group.id },
      data: {
        vocabularyItems: {
          connect: items.map((item) => ({ id: item.id })),
        },
      },
    });

    const request = new Request('http://localhost:3000/api/groups');
    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data[0].vocabularyCount).toBe(2);
  });
});

describe('POST /api/groups', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should create new group with required fields only', async () => {
    const request = new Request('http://localhost:3000/api/groups', {
      method: 'POST',
      body: JSON.stringify({
        name: 'JLPT N5',
      }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.name).toBe('JLPT N5');
    expect(data.data.id).toBeTruthy();
    expect(data.data.vocabularyCount).toBe(0);
  });

  it('should create group with description', async () => {
    const request = new Request('http://localhost:3000/api/groups', {
      method: 'POST',
      body: JSON.stringify({
        name: 'JLPT N4',
        description: 'Intermediate level vocabulary',
      }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.data.description).toBe('Intermediate level vocabulary');
  });

  it('should create default user if none exists', async () => {
    const usersBefore = await prisma.user.count();
    expect(usersBefore).toBe(0);

    const request = new Request('http://localhost:3000/api/groups', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test Group',
      }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.data.userId).toBeTruthy();

    const usersAfter = await prisma.user.count();
    expect(usersAfter).toBe(1);
  });

  it('should return 400 for missing required fields', async () => {
    const request = new Request('http://localhost:3000/api/groups', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 for invalid data types', async () => {
    const request = new Request('http://localhost:3000/api/groups', {
      method: 'POST',
      body: JSON.stringify({
        name: 123, // should be string
      }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });
});
