import { NextRequest } from 'next/server';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { POST } from './route';
import { prisma } from '@/lib/db/prisma';
import { DuplicateStrategy } from '@/lib/validations/import';

describe('POST /api/import/execute', () => {
  const mockUserId = 'cltest1234567890abcdef';
  const mockGroupId = 'clgroup1234567890abcdef';

  beforeEach(async () => {
    await prisma.vocabularyItem.deleteMany();
    await prisma.vocabularyGroup.deleteMany();
    await prisma.user.deleteMany();

    await prisma.user.create({
      data: { id: mockUserId, email: 'test@example.com' },
    });

    await prisma.vocabularyGroup.create({
      data: { id: mockGroupId, name: 'Test Group', userId: mockUserId },
    });
  });

  afterEach(async () => {
    await prisma.vocabularyItem.deleteMany();
    await prisma.vocabularyGroup.deleteMany();
    await prisma.user.deleteMany();
  });

  describe('creating new items', () => {
    it('should import new vocabulary items from JSON', async () => {
      const importData = {
        version: '1.0',
        exportDate: '2026-01-06',
        itemCount: 2,
        items: [
          { word: 'word1', reading: 'reading1', meaning: 'meaning1' },
          { word: 'word2', reading: 'reading2', meaning: 'meaning2' },
        ],
      };

      const request = new NextRequest('http://localhost:3000/api/import/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format: 'json',
          content: JSON.stringify(importData),
          strategy: DuplicateStrategy.SKIP,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.created).toBe(2);
      expect(data.data.updated).toBe(0);
      expect(data.data.skipped).toBe(0);

      const items = await prisma.vocabularyItem.findMany();
      expect(items).toHaveLength(2);
    });

    it('should import new vocabulary items from CSV', async () => {
      const csvContent = 'word,reading,meaning\ntest1,tesuto1,meaning1\ntest2,tesuto2,meaning2';

      const request = new NextRequest('http://localhost:3000/api/import/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format: 'csv',
          content: csvContent,
          strategy: DuplicateStrategy.SKIP,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.created).toBe(2);

      const items = await prisma.vocabularyItem.findMany();
      expect(items).toHaveLength(2);
    });

    it('should create groups referenced in import', async () => {
      const importData = {
        version: '1.0',
        exportDate: '2026-01-06',
        itemCount: 1,
        items: [
          {
            word: 'test',
            reading: 'tesuto',
            meaning: 'test',
            groups: [{ name: 'New Group' }],
          },
        ],
      };

      const request = new NextRequest('http://localhost:3000/api/import/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format: 'json',
          content: JSON.stringify(importData),
          strategy: DuplicateStrategy.SKIP,
        }),
      });

      const response = await POST(request);
      await response.json();

      expect(response.status).toBe(200);

      const groups = await prisma.vocabularyGroup.findMany({
        where: { name: 'New Group' },
      });
      expect(groups).toHaveLength(1);
    });
  });

  describe('SKIP strategy', () => {
    it('should skip duplicates and only create new items', async () => {
      await prisma.vocabularyItem.create({
        data: {
          word: 'existing',
          reading: 'sonzai',
          meaning: 'Original meaning',
        },
      });

      const importData = {
        version: '1.0',
        exportDate: '2026-01-06',
        itemCount: 2,
        items: [
          { word: 'existing', reading: 'sonzai', meaning: 'Updated meaning' },
          { word: 'new', reading: 'atarashii', meaning: 'New word' },
        ],
      };

      const request = new NextRequest('http://localhost:3000/api/import/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format: 'json',
          content: JSON.stringify(importData),
          strategy: DuplicateStrategy.SKIP,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.created).toBe(1);
      expect(data.data.skipped).toBe(1);
      expect(data.data.updated).toBe(0);

      const existingItem = await prisma.vocabularyItem.findFirst({
        where: { word: 'existing' },
      });
      expect(existingItem?.meaning).toBe('Original meaning');
    });
  });

  describe('OVERWRITE strategy', () => {
    it('should update existing items with import data', async () => {
      await prisma.vocabularyItem.create({
        data: {
          word: 'existing',
          reading: 'sonzai',
          meaning: 'Original meaning',
          notes: 'Original notes',
        },
      });

      const importData = {
        version: '1.0',
        exportDate: '2026-01-06',
        itemCount: 1,
        items: [
          {
            word: 'existing',
            reading: 'sonzai',
            meaning: 'Updated meaning',
            notes: 'Updated notes',
          },
        ],
      };

      const request = new NextRequest('http://localhost:3000/api/import/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format: 'json',
          content: JSON.stringify(importData),
          strategy: DuplicateStrategy.OVERWRITE,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.updated).toBe(1);
      expect(data.data.created).toBe(0);

      const updatedItem = await prisma.vocabularyItem.findFirst({
        where: { word: 'existing' },
      });
      expect(updatedItem?.meaning).toBe('Updated meaning');
      expect(updatedItem?.notes).toBe('Updated notes');
    });
  });

  describe('MERGE strategy', () => {
    it('should keep existing data and add new data from import', async () => {
      await prisma.vocabularyItem.create({
        data: {
          word: 'existing',
          reading: 'sonzai',
          meaning: 'Original meaning',
          notes: null,
        },
      });

      const importData = {
        version: '1.0',
        exportDate: '2026-01-06',
        itemCount: 1,
        items: [
          {
            word: 'existing',
            reading: 'sonzai',
            meaning: 'Import meaning',
            notes: 'New notes from import',
          },
        ],
      };

      const request = new NextRequest('http://localhost:3000/api/import/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format: 'json',
          content: JSON.stringify(importData),
          strategy: DuplicateStrategy.MERGE,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.updated).toBe(1);

      const mergedItem = await prisma.vocabularyItem.findFirst({
        where: { word: 'existing' },
      });
      expect(mergedItem?.meaning).toBe('Original meaning');
      expect(mergedItem?.notes).toBe('New notes from import');
    });
  });

  describe('validation errors', () => {
    it('should return error for invalid JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/import/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format: 'json',
          content: '{ invalid json }',
          strategy: DuplicateStrategy.SKIP,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('BAD_REQUEST');
    });

    it('should return error for missing strategy', async () => {
      const importData = {
        version: '1.0',
        exportDate: '2026-01-06',
        itemCount: 1,
        items: [{ word: 'test', reading: 'tesuto', meaning: 'test' }],
      };

      const request = new NextRequest('http://localhost:3000/api/import/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format: 'json',
          content: JSON.stringify(importData),
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return error for invalid strategy', async () => {
      const importData = {
        version: '1.0',
        exportDate: '2026-01-06',
        itemCount: 1,
        items: [{ word: 'test', reading: 'tesuto', meaning: 'test' }],
      };

      const request = new NextRequest('http://localhost:3000/api/import/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format: 'json',
          content: JSON.stringify(importData),
          strategy: 'invalid_strategy',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });
  });
});
