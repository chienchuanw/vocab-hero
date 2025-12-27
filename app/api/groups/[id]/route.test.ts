import { describe, it, expect, beforeEach } from 'vitest';
import { GET, PUT, DELETE } from './route';
import { prisma } from '@/lib/db/prisma';
import { cleanDatabase } from '@/tests/setup-db';

/**
 * API Route Tests for /api/groups/:id
 * Tests for single group operations (GET, PUT, DELETE)
 */

describe('GET /api/groups/:id', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should return group with vocabulary items', async () => {
    const user = await prisma.user.create({
      data: { email: 'test@example.com', name: 'Test User' },
    });

    const group = await prisma.vocabularyGroup.create({
      data: {
        name: 'JLPT N5',
        description: 'Beginner level',
        userId: user.id,
      },
    });

    await prisma.vocabularyItem.create({
      data: {
        word: 'hello',
        reading: 'hɛˈloʊ',
        meaning: 'greeting',
        groups: { connect: [{ id: group.id }] },
      },
    });

    const request = new Request(`http://localhost:3000/api/groups/${group.id}`);
    const response = await GET(request as any, { params: Promise.resolve({ id: group.id }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.name).toBe('JLPT N5');
    expect(data.data.description).toBe('Beginner level');
    expect(data.data.vocabularyItems).toHaveLength(1);
    expect(data.data.vocabularyItems[0].word).toBe('hello');
    expect(data.data.vocabularyCount).toBe(1);
  });

  it('should return 404 for non-existent group', async () => {
    const request = new Request('http://localhost:3000/api/groups/non-existent-id');
    const response = await GET(request as any, {
      params: Promise.resolve({ id: 'non-existent-id' }),
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('NOT_FOUND');
  });

  it('should return vocabulary items ordered by creation date', async () => {
    const user = await prisma.user.create({
      data: { email: 'test@example.com', name: 'Test User' },
    });

    const group = await prisma.vocabularyGroup.create({
      data: { name: 'Test Group', userId: user.id },
    });

    const item1 = await prisma.vocabularyItem.create({
      data: {
        word: 'first',
        reading: 'first',
        meaning: 'first',
        groups: { connect: [{ id: group.id }] },
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 10));

    const item2 = await prisma.vocabularyItem.create({
      data: {
        word: 'second',
        reading: 'second',
        meaning: 'second',
        groups: { connect: [{ id: group.id }] },
      },
    });

    const request = new Request(`http://localhost:3000/api/groups/${group.id}`);
    const response = await GET(request as any, { params: Promise.resolve({ id: group.id }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.vocabularyItems[0].word).toBe('second');
    expect(data.data.vocabularyItems[1].word).toBe('first');
  });
});

describe('PUT /api/groups/:id', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should update group name', async () => {
    const user = await prisma.user.create({
      data: { email: 'test@example.com', name: 'Test User' },
    });

    const group = await prisma.vocabularyGroup.create({
      data: { name: 'Old Name', userId: user.id },
    });

    const request = new Request(`http://localhost:3000/api/groups/${group.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: 'New Name',
      }),
    });

    const response = await PUT(request as any, { params: Promise.resolve({ id: group.id }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.name).toBe('New Name');
  });

  it('should update group description', async () => {
    const user = await prisma.user.create({
      data: { email: 'test@example.com', name: 'Test User' },
    });

    const group = await prisma.vocabularyGroup.create({
      data: { name: 'Test Group', userId: user.id },
    });

    const request = new Request(`http://localhost:3000/api/groups/${group.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        description: 'Updated description',
      }),
    });

    const response = await PUT(request as any, { params: Promise.resolve({ id: group.id }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.description).toBe('Updated description');
  });

  it('should return 404 when updating non-existent group', async () => {
    const request = new Request('http://localhost:3000/api/groups/non-existent-id', {
      method: 'PUT',
      body: JSON.stringify({
        name: 'New Name',
      }),
    });

    const response = await PUT(request as any, {
      params: Promise.resolve({ id: 'non-existent-id' }),
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
  });

  it('should return 400 for invalid update data', async () => {
    const user = await prisma.user.create({
      data: { email: 'test@example.com', name: 'Test User' },
    });

    const group = await prisma.vocabularyGroup.create({
      data: { name: 'Test Group', userId: user.id },
    });

    const request = new Request(`http://localhost:3000/api/groups/${group.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: 123, // should be string
      }),
    });

    const response = await PUT(request as any, { params: Promise.resolve({ id: group.id }) });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });
});

describe('DELETE /api/groups/:id', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  it('should delete group successfully', async () => {
    const user = await prisma.user.create({
      data: { email: 'test@example.com', name: 'Test User' },
    });

    const group = await prisma.vocabularyGroup.create({
      data: { name: 'Test Group', userId: user.id },
    });

    const request = new Request(`http://localhost:3000/api/groups/${group.id}`, {
      method: 'DELETE',
    });

    const response = await DELETE(request as any, { params: Promise.resolve({ id: group.id }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.id).toBe(group.id);

    const deletedGroup = await prisma.vocabularyGroup.findUnique({
      where: { id: group.id },
    });
    expect(deletedGroup).toBeNull();
  });

  it('should return 404 when deleting non-existent group', async () => {
    const request = new Request('http://localhost:3000/api/groups/non-existent-id', {
      method: 'DELETE',
    });

    const response = await DELETE(request as any, {
      params: Promise.resolve({ id: 'non-existent-id' }),
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
  });

  it('should not delete vocabulary items when deleting group', async () => {
    const user = await prisma.user.create({
      data: { email: 'test@example.com', name: 'Test User' },
    });

    const group = await prisma.vocabularyGroup.create({
      data: { name: 'Test Group', userId: user.id },
    });

    const item = await prisma.vocabularyItem.create({
      data: {
        word: 'test',
        reading: 'test',
        meaning: 'test',
        groups: { connect: [{ id: group.id }] },
      },
    });

    const request = new Request(`http://localhost:3000/api/groups/${group.id}`, {
      method: 'DELETE',
    });

    await DELETE(request as any, { params: Promise.resolve({ id: group.id }) });

    const vocabularyItem = await prisma.vocabularyItem.findUnique({
      where: { id: item.id },
    });
    expect(vocabularyItem).not.toBeNull();
  });
});
