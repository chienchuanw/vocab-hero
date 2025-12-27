import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GET, PUT, DELETE } from './route';
import { prisma } from '@/lib/db/prisma';

/**
 * API Route Tests for /api/vocabulary/:id
 * Tests for single vocabulary item operations (GET, PUT, DELETE)
 */

describe('GET /api/vocabulary/:id', () => {
  beforeEach(async () => {
    // Clean up database before each test - order matters due to foreign keys
    await prisma.exampleSentence.deleteMany();
    await prisma.reviewSchedule.deleteMany();
    await prisma.$executeRaw`DELETE FROM "_VocabularyGroupToVocabularyItem"`;
    await prisma.vocabularyItem.deleteMany();
    await prisma.vocabularyGroup.deleteMany();
    await prisma.user.deleteMany();
  });

  afterEach(async () => {
    // Clean up after each test - order matters due to foreign keys
    await prisma.exampleSentence.deleteMany();
    await prisma.reviewSchedule.deleteMany();
    await prisma.$executeRaw`DELETE FROM "_VocabularyGroupToVocabularyItem"`;
    await prisma.vocabularyItem.deleteMany();
    await prisma.vocabularyGroup.deleteMany();
    await prisma.user.deleteMany();
  });

  it('should return vocabulary item with all related data', async () => {
    // Create test data
    const user = await prisma.user.create({
      data: { email: 'test@example.com', name: 'Test User' },
    });

    const group = await prisma.vocabularyGroup.create({
      data: { name: 'Test Group', userId: user.id },
    });

    const vocabulary = await prisma.vocabularyItem.create({
      data: {
        word: 'hello',
        reading: 'hɛˈloʊ',
        meaning: 'greeting',
        notes: 'Common greeting',
        groups: { connect: [{ id: group.id }] },
        exampleSentences: {
          create: [
            {
              sentence: 'Hello, world!',
              meaning: '你好，世界！',
              order: 0,
            },
          ],
        },
      },
    });

    const request = new Request(`http://localhost:3000/api/vocabulary/${vocabulary.id}`);
    const response = await GET(request as any, { params: Promise.resolve({ id: vocabulary.id }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.word).toBe('hello');
    expect(data.data.reading).toBe('hɛˈloʊ');
    expect(data.data.meaning).toBe('greeting');
    expect(data.data.notes).toBe('Common greeting');
    expect(data.data.groups).toHaveLength(1);
    expect(data.data.groups[0].name).toBe('Test Group');
    expect(data.data.exampleSentences).toHaveLength(1);
    expect(data.data.exampleSentences[0].sentence).toBe('Hello, world!');
  });

  it('should return 404 for non-existent vocabulary item', async () => {
    const fakeId = 'clxyz1234567890abcdefgh';
    const request = new Request(`http://localhost:3000/api/vocabulary/${fakeId}`);
    const response = await GET(request as any, { params: Promise.resolve({ id: fakeId }) });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.error.message).toBe('Vocabulary item not found');
  });

  it('should include review schedule if exists', async () => {
    const vocabulary = await prisma.vocabularyItem.create({
      data: {
        word: 'test',
        reading: 'tɛst',
        meaning: 'examination',
        reviewSchedule: {
          create: {
            easinessFactor: 2.5,
            interval: 1,
            repetitions: 0,
            nextReviewDate: new Date(),
          },
        },
      },
    });

    const request = new Request(`http://localhost:3000/api/vocabulary/${vocabulary.id}`);
    const response = await GET(request as any, { params: Promise.resolve({ id: vocabulary.id }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.reviewSchedule).toBeDefined();
    expect(data.data.reviewSchedule.easinessFactor).toBe(2.5);
    expect(data.data.reviewSchedule.interval).toBe(1);
  });

  it('should order example sentences by order field', async () => {
    const vocabulary = await prisma.vocabularyItem.create({
      data: {
        word: 'test',
        reading: 'tɛst',
        meaning: 'examination',
        exampleSentences: {
          create: [
            { sentence: 'Third sentence', meaning: '第三句', order: 2 },
            { sentence: 'First sentence', meaning: '第一句', order: 0 },
            { sentence: 'Second sentence', meaning: '第二句', order: 1 },
          ],
        },
      },
    });

    const request = new Request(`http://localhost:3000/api/vocabulary/${vocabulary.id}`);
    const response = await GET(request as any, { params: Promise.resolve({ id: vocabulary.id }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.exampleSentences).toHaveLength(3);
    expect(data.data.exampleSentences[0].sentence).toBe('First sentence');
    expect(data.data.exampleSentences[1].sentence).toBe('Second sentence');
    expect(data.data.exampleSentences[2].sentence).toBe('Third sentence');
  });
});

describe('PUT /api/vocabulary/:id', () => {
  beforeEach(async () => {
    await prisma.exampleSentence.deleteMany();
    await prisma.reviewSchedule.deleteMany();
    await prisma.$executeRaw`DELETE FROM "_VocabularyGroupToVocabularyItem"`;
    await prisma.vocabularyItem.deleteMany();
    await prisma.vocabularyGroup.deleteMany();
    await prisma.user.deleteMany();
  });

  afterEach(async () => {
    await prisma.exampleSentence.deleteMany();
    await prisma.reviewSchedule.deleteMany();
    await prisma.$executeRaw`DELETE FROM "_VocabularyGroupToVocabularyItem"`;
    await prisma.vocabularyItem.deleteMany();
    await prisma.vocabularyGroup.deleteMany();
    await prisma.user.deleteMany();
  });

  it('should update vocabulary item successfully', async () => {
    const vocabulary = await prisma.vocabularyItem.create({
      data: {
        word: 'hello',
        reading: 'hɛˈloʊ',
        meaning: 'greeting',
      },
    });

    const updateData = {
      word: 'hi',
      meaning: 'informal greeting',
    };

    const request = new Request(`http://localhost:3000/api/vocabulary/${vocabulary.id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });

    const response = await PUT(request as any, { params: Promise.resolve({ id: vocabulary.id }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.word).toBe('hi');
    expect(data.data.meaning).toBe('informal greeting');
    expect(data.data.reading).toBe('hɛˈloʊ'); // Should remain unchanged
  });

  it('should return 404 when updating non-existent vocabulary', async () => {
    const fakeId = 'clxyz1234567890abcdefgh';
    const request = new Request(`http://localhost:3000/api/vocabulary/${fakeId}`, {
      method: 'PUT',
      body: JSON.stringify({ word: 'test' }),
    });

    const response = await PUT(request as any, { params: Promise.resolve({ id: fakeId }) });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
  });

  it('should return 400 for invalid update data', async () => {
    const vocabulary = await prisma.vocabularyItem.create({
      data: {
        word: 'hello',
        reading: 'hɛˈloʊ',
        meaning: 'greeting',
      },
    });

    const invalidData = {
      word: '', // Empty word should fail validation
    };

    const request = new Request(`http://localhost:3000/api/vocabulary/${vocabulary.id}`, {
      method: 'PUT',
      body: JSON.stringify(invalidData),
    });

    const response = await PUT(request as any, { params: Promise.resolve({ id: vocabulary.id }) });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });

  it('should support partial updates', async () => {
    const vocabulary = await prisma.vocabularyItem.create({
      data: {
        word: 'hello',
        reading: 'hɛˈloʊ',
        meaning: 'greeting',
        notes: 'Original notes',
      },
    });

    const partialUpdate = {
      notes: 'Updated notes',
    };

    const request = new Request(`http://localhost:3000/api/vocabulary/${vocabulary.id}`, {
      method: 'PUT',
      body: JSON.stringify(partialUpdate),
    });

    const response = await PUT(request as any, { params: Promise.resolve({ id: vocabulary.id }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.word).toBe('hello'); // Unchanged
    expect(data.data.reading).toBe('hɛˈloʊ'); // Unchanged
    expect(data.data.meaning).toBe('greeting'); // Unchanged
    expect(data.data.notes).toBe('Updated notes'); // Updated
  });
});

describe('DELETE /api/vocabulary/:id', () => {
  beforeEach(async () => {
    await prisma.exampleSentence.deleteMany();
    await prisma.reviewSchedule.deleteMany();
    await prisma.$executeRaw`DELETE FROM "_VocabularyGroupToVocabularyItem"`;
    await prisma.vocabularyItem.deleteMany();
    await prisma.vocabularyGroup.deleteMany();
    await prisma.user.deleteMany();
  });

  afterEach(async () => {
    await prisma.exampleSentence.deleteMany();
    await prisma.reviewSchedule.deleteMany();
    await prisma.$executeRaw`DELETE FROM "_VocabularyGroupToVocabularyItem"`;
    await prisma.vocabularyItem.deleteMany();
    await prisma.vocabularyGroup.deleteMany();
    await prisma.user.deleteMany();
  });

  it('should delete vocabulary item successfully', async () => {
    const vocabulary = await prisma.vocabularyItem.create({
      data: {
        word: 'hello',
        reading: 'hɛˈloʊ',
        meaning: 'greeting',
      },
    });

    const request = new Request(`http://localhost:3000/api/vocabulary/${vocabulary.id}`, {
      method: 'DELETE',
    });

    const response = await DELETE(request as any, {
      params: Promise.resolve({ id: vocabulary.id }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.message).toBe('Vocabulary item deleted successfully');

    // Verify item is actually deleted
    const deletedItem = await prisma.vocabularyItem.findUnique({
      where: { id: vocabulary.id },
    });
    expect(deletedItem).toBeNull();
  });

  it('should return 404 when deleting non-existent vocabulary', async () => {
    const fakeId = 'clxyz1234567890abcdefgh';
    const request = new Request(`http://localhost:3000/api/vocabulary/${fakeId}`, {
      method: 'DELETE',
    });

    const response = await DELETE(request as any, { params: Promise.resolve({ id: fakeId }) });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
  });

  it('should cascade delete example sentences', async () => {
    const vocabulary = await prisma.vocabularyItem.create({
      data: {
        word: 'test',
        reading: 'tɛst',
        meaning: 'examination',
        exampleSentences: {
          create: [
            { sentence: 'Test sentence', meaning: '測試句子', order: 0 },
            { sentence: 'Another test', meaning: '另一個測試', order: 1 },
          ],
        },
      },
    });

    const request = new Request(`http://localhost:3000/api/vocabulary/${vocabulary.id}`, {
      method: 'DELETE',
    });

    await DELETE(request as any, { params: Promise.resolve({ id: vocabulary.id }) });

    // Verify example sentences are also deleted
    const sentences = await prisma.exampleSentence.findMany({
      where: { vocabularyItemId: vocabulary.id },
    });
    expect(sentences).toHaveLength(0);
  });

  it('should cascade delete review schedule', async () => {
    const vocabulary = await prisma.vocabularyItem.create({
      data: {
        word: 'test',
        reading: 'tɛst',
        meaning: 'examination',
        reviewSchedule: {
          create: {
            easinessFactor: 2.5,
            interval: 1,
            repetitions: 0,
            nextReviewDate: new Date(),
          },
        },
      },
    });

    const request = new Request(`http://localhost:3000/api/vocabulary/${vocabulary.id}`, {
      method: 'DELETE',
    });

    await DELETE(request as any, { params: Promise.resolve({ id: vocabulary.id }) });

    // Verify review schedule is also deleted
    const schedule = await prisma.reviewSchedule.findUnique({
      where: { vocabularyItemId: vocabulary.id },
    });
    expect(schedule).toBeNull();
  });
});
