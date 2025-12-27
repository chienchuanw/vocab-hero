import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GET, POST } from './route';
import { prisma } from '@/lib/db/prisma';

/**
 * API Route Tests for /api/vocabulary
 * Tests for vocabulary CRUD operations
 */

describe('GET /api/vocabulary', () => {
  beforeEach(async () => {
    // Clean up database before each test
    await prisma.vocabularyItem.deleteMany();
    await prisma.vocabularyGroup.deleteMany();
    await prisma.user.deleteMany();
  });

  afterEach(async () => {
    // Clean up after each test
    await prisma.vocabularyItem.deleteMany();
    await prisma.vocabularyGroup.deleteMany();
    await prisma.user.deleteMany();
  });

  it('should return empty array when no vocabulary items exist', async () => {
    const request = new Request('http://localhost:3000/api/vocabulary');
    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.items).toEqual([]);
    expect(data.data.hasNextPage).toBe(false);
    expect(data.data.nextCursor).toBeNull();
  });

  it('should return vocabulary items with default pagination', async () => {
    // Create test vocabulary items
    await prisma.vocabularyItem.createMany({
      data: [
        { word: 'hello', reading: 'hɛˈloʊ', meaning: 'greeting' },
        { word: 'world', reading: 'wɜːrld', meaning: 'earth' },
        { word: 'test', reading: 'tɛst', meaning: 'examination' },
      ],
    });

    const request = new Request('http://localhost:3000/api/vocabulary');
    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.items).toHaveLength(3);
    expect(data.data.hasNextPage).toBe(false);
  });

  it('should filter vocabulary by search query', async () => {
    await prisma.vocabularyItem.createMany({
      data: [
        { word: 'hello', reading: 'hɛˈloʊ', meaning: 'greeting' },
        { word: 'world', reading: 'wɜːrld', meaning: 'earth' },
        { word: 'test', reading: 'tɛst', meaning: 'examination' },
      ],
    });

    const request = new Request('http://localhost:3000/api/vocabulary?search=hello');
    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.items).toHaveLength(1);
    expect(data.data.items[0].word).toBe('hello');
  });

  it('should search across word, reading, and meaning fields', async () => {
    await prisma.vocabularyItem.createMany({
      data: [
        { word: 'hello', reading: 'hɛˈloʊ', meaning: 'greeting' },
        { word: 'world', reading: 'wɜːrld', meaning: 'earth' },
        { word: 'test', reading: 'tɛst', meaning: 'examination' },
      ],
    });

    const request = new Request('http://localhost:3000/api/vocabulary?search=greeting');
    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.items).toHaveLength(1);
    expect(data.data.items[0].meaning).toBe('greeting');
  });

  it('should sort vocabulary by word in ascending order', async () => {
    await prisma.vocabularyItem.createMany({
      data: [
        { word: 'zebra', reading: 'ziːbrə', meaning: 'animal' },
        { word: 'apple', reading: 'æpl', meaning: 'fruit' },
        { word: 'mango', reading: 'mæŋɡoʊ', meaning: 'fruit' },
      ],
    });

    const request = new Request('http://localhost:3000/api/vocabulary?sortBy=word&sortOrder=asc');
    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.items[0].word).toBe('apple');
    expect(data.data.items[1].word).toBe('mango');
    expect(data.data.items[2].word).toBe('zebra');
  });

  it('should respect limit parameter', async () => {
    await prisma.vocabularyItem.createMany({
      data: Array.from({ length: 10 }, (_, i) => ({
        word: `word${i}`,
        reading: `reading${i}`,
        meaning: `meaning${i}`,
      })),
    });

    const request = new Request('http://localhost:3000/api/vocabulary?limit=5');
    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.items).toHaveLength(5);
    expect(data.data.hasNextPage).toBe(true);
    expect(data.data.nextCursor).toBeTruthy();
  });

  it('should return 400 for invalid limit parameter', async () => {
    const request = new Request('http://localhost:3000/api/vocabulary?limit=150');
    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });

  it('should return 400 for invalid sortBy parameter', async () => {
    const request = new Request('http://localhost:3000/api/vocabulary?sortBy=invalid');
    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });

  it('should filter vocabulary by group', async () => {
    // Create user first
    const user = await prisma.user.create({
      data: { email: 'test@example.com', name: 'Test User' },
    });

    // Create groups
    const group1 = await prisma.vocabularyGroup.create({
      data: { name: 'JLPT N5', userId: user.id },
    });

    const group2 = await prisma.vocabularyGroup.create({
      data: { name: 'JLPT N4', userId: user.id },
    });

    // Create vocabulary items with group associations
    await prisma.vocabularyItem.create({
      data: {
        word: 'hello',
        reading: 'hɛˈloʊ',
        meaning: 'greeting',
        groups: { connect: [{ id: group1.id }] },
      },
    });

    await prisma.vocabularyItem.create({
      data: {
        word: 'world',
        reading: 'wɜːrld',
        meaning: 'earth',
        groups: { connect: [{ id: group2.id }] },
      },
    });

    const request = new Request(`http://localhost:3000/api/vocabulary?groupId=${group1.id}`);
    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.items).toHaveLength(1);
    expect(data.data.items[0].word).toBe('hello');
  });

  it('should support cursor-based pagination', async () => {
    // Create vocabulary items
    const items = await Promise.all(
      Array.from({ length: 5 }, (_, i) =>
        prisma.vocabularyItem.create({
          data: {
            word: `word${i}`,
            reading: `reading${i}`,
            meaning: `meaning${i}`,
          },
        })
      )
    );

    // First page
    const request1 = new Request(
      'http://localhost:3000/api/vocabulary?limit=2&sortBy=createdAt&sortOrder=asc'
    );
    const response1 = await GET(request1 as any);
    const data1 = await response1.json();

    expect(data1.data.items).toHaveLength(2);
    expect(data1.data.hasNextPage).toBe(true);
    expect(data1.data.nextCursor).toBeTruthy();

    // Second page using cursor
    const cursor = data1.data.nextCursor;
    const request2 = new Request(
      `http://localhost:3000/api/vocabulary?limit=2&cursor=${cursor}&sortBy=createdAt&sortOrder=asc`
    );
    const response2 = await GET(request2 as any);
    const data2 = await response2.json();

    expect(data2.data.items.length).toBeGreaterThan(0);
    expect(data2.data.items[0].id).not.toBe(data1.data.items[0].id);
    expect(data2.data.items[0].id).not.toBe(data1.data.items[1].id);
  });

  it('should include related data in response', async () => {
    const user = await prisma.user.create({
      data: { email: 'test@example.com', name: 'Test User' },
    });

    const group = await prisma.vocabularyGroup.create({
      data: { name: 'Test Group', userId: user.id },
    });

    await prisma.vocabularyItem.create({
      data: {
        word: 'test',
        reading: 'tɛst',
        meaning: 'examination',
        groups: { connect: [{ id: group.id }] },
      },
    });

    const request = new Request('http://localhost:3000/api/vocabulary');
    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.items[0]).toHaveProperty('groups');
    expect(data.data.items[0].groups).toHaveLength(1);
    expect(data.data.items[0].groups[0].name).toBe('Test Group');
  });
});
