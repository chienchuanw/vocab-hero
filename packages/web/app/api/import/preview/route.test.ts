import { NextRequest } from "next/server";
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { POST } from './route';
import { prisma } from '@/lib/db/prisma';

describe('POST /api/import/preview', () => {
  const mockUserId = 'cltest1234567890abcdef';

  beforeEach(async () => {
    await prisma.vocabularyItem.deleteMany();
    await prisma.vocabularyGroup.deleteMany();
    await prisma.user.deleteMany();

    await prisma.user.create({
      data: { id: mockUserId, email: 'test@example.com' },
    });
  });

  afterEach(async () => {
    await prisma.vocabularyItem.deleteMany();
    await prisma.vocabularyGroup.deleteMany();
    await prisma.user.deleteMany();
  });

  describe('JSON format preview', () => {
    it('should preview valid JSON import with no duplicates', async () => {
      const importData = {
        version: '1.0',
        exportDate: '2026-01-06',
        itemCount: 1,
        items: [{ word: 'test', reading: 'tesuto', meaning: 'test' }],
      };

      const request = new NextRequest('http://localhost:3000/api/import/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format: 'json', content: JSON.stringify(importData) }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.totalItems).toBe(1);
      expect(data.data.duplicateCount).toBe(0);
      expect(data.data.newItems).toHaveLength(1);
      expect(data.data.duplicates).toHaveLength(0);
    });

    it('should detect duplicates in JSON import', async () => {
      await prisma.vocabularyItem.create({
        data: {
          word: 'existing',
          reading: 'sonzai',
          meaning: 'Existing word',
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

      const request = new NextRequest('http://localhost:3000/api/import/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format: 'json', content: JSON.stringify(importData) }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.totalItems).toBe(2);
      expect(data.data.duplicateCount).toBe(1);
      expect(data.data.newItems).toHaveLength(1);
      expect(data.data.duplicates).toHaveLength(1);
      expect(data.data.duplicates[0].importItem.word).toBe('existing');
    });

    it('should include metadata from JSON import', async () => {
      const importData = {
        version: '1.0',
        exportDate: '2026-01-06T12:00:00.000Z',
        itemCount: 1,
        items: [{ word: 'test', reading: 'tesuto', meaning: 'test' }],
      };

      const request = new NextRequest('http://localhost:3000/api/import/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format: 'json', content: JSON.stringify(importData) }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.metadata).toEqual({
        version: '1.0',
        exportDate: '2026-01-06T12:00:00.000Z',
        itemCount: 1,
      });
    });
  });

  describe('CSV format preview', () => {
    it('should preview valid CSV import', async () => {
      const csvContent = 'word,reading,meaning\ntest,tesuto,test meaning';

      const request = new NextRequest('http://localhost:3000/api/import/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format: 'csv', content: csvContent }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.totalItems).toBe(1);
      expect(data.data.newItems[0].word).toBe('test');
    });

    it('should detect duplicates in CSV import', async () => {
      await prisma.vocabularyItem.create({
        data: {
          word: 'existing',
          reading: 'sonzai',
          meaning: 'Existing word',
        },
      });

      const csvContent = 'word,reading,meaning\nexisting,sonzai,Updated\nnew,atarashii,New word';

      const request = new NextRequest('http://localhost:3000/api/import/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format: 'csv', content: csvContent }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.duplicateCount).toBe(1);
      expect(data.data.newItems).toHaveLength(1);
    });
  });

  describe('validation errors', () => {
    it('should return error for invalid JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/import/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format: 'json', content: '{ invalid json }' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('BAD_REQUEST');
    });

    it('should return error for empty CSV', async () => {
      const request = new NextRequest('http://localhost:3000/api/import/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format: 'csv', content: '' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return error for missing content', async () => {
      const request = new NextRequest('http://localhost:3000/api/import/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format: 'json' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return error for invalid format', async () => {
      const request = new NextRequest('http://localhost:3000/api/import/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format: 'xml', content: '<data></data>' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return validation errors for invalid items', async () => {
      const importData = {
        version: '1.0',
        exportDate: '2026-01-06',
        itemCount: 1,
        items: [{ word: '', reading: 'tesuto', meaning: 'test' }],
      };

      const request = new NextRequest('http://localhost:3000/api/import/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format: 'json', content: JSON.stringify(importData) }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('BAD_REQUEST');
      expect(data.error.details).toBeDefined();
    });
  });
});
