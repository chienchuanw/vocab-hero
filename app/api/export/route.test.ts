import { NextRequest } from "next/server";
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { POST } from './route';
import { prisma } from '@/lib/db/prisma';
import type {
  VocabularyItem,
  VocabularyGroup,
  ExampleSentence,
  ReviewSchedule,
} from '@prisma/client';

describe('POST /api/export', () => {
  const mockUserId = 'cltest1234567890abcdef';
  const mockGroupId1 = 'clgroup1234567890abcdef';
  const mockGroupId2 = 'clgroup0987654321fedcba';

  beforeEach(async () => {
    await prisma.vocabularyItem.deleteMany();
    await prisma.vocabularyGroup.deleteMany();
    await prisma.user.deleteMany();

    await prisma.user.create({
      data: { id: mockUserId, email: 'test@example.com' },
    });

    await prisma.vocabularyGroup.createMany({
      data: [
        { id: mockGroupId1, name: 'JLPT N5', userId: mockUserId },
        { id: mockGroupId2, name: 'Daily Phrases', userId: mockUserId },
      ],
    });
  });

  afterEach(async () => {
    await prisma.vocabularyItem.deleteMany();
    await prisma.vocabularyGroup.deleteMany();
    await prisma.user.deleteMany();
  });

  describe('JSON format export', () => {
    it('should export all vocabulary as JSON', async () => {
      const vocab = await prisma.vocabularyItem.create({
        data: {
          word: 'こんにちは',
          reading: 'konnichiwa',
          meaning: 'Hello',
          notes: 'Common greeting',
          groups: { connect: [{ id: mockGroupId1 }] },
        },
      });

      const request = new NextRequest('http://localhost:3000/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format: 'json' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('version', '1.0');
      expect(data.data).toHaveProperty('exportDate');
      expect(data.data).toHaveProperty('itemCount', 1);
      expect(data.data.items).toHaveLength(1);
      expect(data.data.items[0]).toMatchObject({
        word: 'こんにちは',
        reading: 'konnichiwa',
        meaning: 'Hello',
      });
    });

    it('should include all relations in JSON export', async () => {
      const vocab = await prisma.vocabularyItem.create({
        data: {
          word: 'こんにちは',
          reading: 'konnichiwa',
          meaning: 'Hello',
          groups: { connect: [{ id: mockGroupId1 }] },
          exampleSentences: {
            create: {
              sentence: 'こんにちは、元気ですか？',
              reading: 'konnichiwa, genki desu ka?',
              meaning: 'Hello, how are you?',
              order: 0,
            },
          },
          reviewSchedule: {
            create: {
              easinessFactor: 2.5,
              interval: 3,
              repetitions: 2,
              nextReviewDate: new Date('2026-01-10'),
              lastReviewDate: new Date('2026-01-07'),
            },
          },
        },
      });

      const request = new NextRequest('http://localhost:3000/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format: 'json' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.data.items[0]).toHaveProperty('groups');
      expect(data.data.items[0].groups).toHaveLength(1);
      expect(data.data.items[0]).toHaveProperty('exampleSentences');
      expect(data.data.items[0].exampleSentences).toHaveLength(1);
      expect(data.data.items[0]).toHaveProperty('reviewSchedule');
      expect(data.data.items[0].reviewSchedule).toMatchObject({
        easinessFactor: 2.5,
        interval: 3,
        repetitions: 2,
      });
    });
  });

  describe('CSV format export', () => {
    it('should export all vocabulary as CSV', async () => {
      await prisma.vocabularyItem.create({
        data: {
          word: 'こんにちは',
          reading: 'konnichiwa',
          meaning: 'Hello',
        },
      });

      const request = new NextRequest('http://localhost:3000/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format: 'csv' }),
      });

      const response = await POST(request);
      const csvText = await response.text();

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('text/csv; charset=utf-8');
      expect(response.headers.get('Content-Disposition')).toContain('attachment');
      expect(response.headers.get('Content-Disposition')).toContain('.csv');
      expect(csvText).toContain('word');
      expect(csvText).toContain('reading');
      expect(csvText).toContain('こんにちは');
    });

    it('should include proper filename in Content-Disposition header', async () => {
      const request = new NextRequest('http://localhost:3000/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format: 'csv' }),
      });

      const response = await POST(request);
      const disposition = response.headers.get('Content-Disposition');

      expect(disposition).toMatch(/vocab-hero-export-\d{4}-\d{2}-\d{2}\.csv/);
    });
  });

  describe('filter by groupIds', () => {
    it('should filter by single group', async () => {
      await prisma.vocabularyItem.createMany({
        data: [
          { word: 'こんにちは', reading: 'konnichiwa', meaning: 'Hello' },
          { word: 'ありがとう', reading: 'arigatou', meaning: 'Thank you' },
        ],
      });

      const vocab1 = await prisma.vocabularyItem.findFirst({ where: { word: 'こんにちは' } });
      await prisma.vocabularyItem.update({
        where: { id: vocab1!.id },
        data: { groups: { connect: [{ id: mockGroupId1 }] } },
      });

      const request = new NextRequest('http://localhost:3000/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format: 'json',
          groupIds: [mockGroupId1],
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.data.itemCount).toBe(1);
      expect(data.data.items[0].word).toBe('こんにちは');
    });

    it('should filter by multiple groups', async () => {
      await prisma.vocabularyItem.createMany({
        data: [
          { word: 'こんにちは', reading: 'konnichiwa', meaning: 'Hello' },
          { word: 'ありがとう', reading: 'arigatou', meaning: 'Thank you' },
          { word: 'さようなら', reading: 'sayounara', meaning: 'Goodbye' },
        ],
      });

      const vocab1 = await prisma.vocabularyItem.findFirst({ where: { word: 'こんにちは' } });
      const vocab2 = await prisma.vocabularyItem.findFirst({ where: { word: 'ありがとう' } });

      await prisma.vocabularyItem.update({
        where: { id: vocab1!.id },
        data: { groups: { connect: [{ id: mockGroupId1 }] } },
      });
      await prisma.vocabularyItem.update({
        where: { id: vocab2!.id },
        data: { groups: { connect: [{ id: mockGroupId2 }] } },
      });

      const request = new NextRequest('http://localhost:3000/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format: 'json',
          groupIds: [mockGroupId1, mockGroupId2],
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.data.itemCount).toBe(2);
    });
  });

  describe('filter by date range', () => {
    it('should filter by dateFrom', async () => {
      await prisma.vocabularyItem.create({
        data: {
          word: 'こんにちは',
          reading: 'konnichiwa',
          meaning: 'Hello',
          createdAt: new Date('2026-01-05'),
        },
      });

      await prisma.vocabularyItem.create({
        data: {
          word: 'ありがとう',
          reading: 'arigatou',
          meaning: 'Thank you',
          createdAt: new Date('2026-01-15'),
        },
      });

      const request = new NextRequest('http://localhost:3000/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format: 'json',
          dateFrom: '2026-01-10',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.data.itemCount).toBe(1);
      expect(data.data.items[0].word).toBe('ありがとう');
    });

    it('should filter by dateTo', async () => {
      await prisma.vocabularyItem.create({
        data: {
          word: 'こんにちは',
          reading: 'konnichiwa',
          meaning: 'Hello',
          createdAt: new Date('2026-01-05'),
        },
      });

      await prisma.vocabularyItem.create({
        data: {
          word: 'ありがとう',
          reading: 'arigatou',
          meaning: 'Thank you',
          createdAt: new Date('2026-01-15'),
        },
      });

      const request = new NextRequest('http://localhost:3000/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format: 'json',
          dateTo: '2026-01-10',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.data.itemCount).toBe(1);
      expect(data.data.items[0].word).toBe('こんにちは');
    });

    it('should filter by date range (dateFrom and dateTo)', async () => {
      await prisma.vocabularyItem.createMany({
        data: [
          {
            word: 'test1',
            reading: 'tesuto1',
            meaning: 'test1',
            createdAt: new Date('2026-01-01'),
          },
          {
            word: 'test2',
            reading: 'tesuto2',
            meaning: 'test2',
            createdAt: new Date('2026-01-05'),
          },
          {
            word: 'test3',
            reading: 'tesuto3',
            meaning: 'test3',
            createdAt: new Date('2026-01-15'),
          },
        ],
      });

      const request = new NextRequest('http://localhost:3000/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format: 'json',
          dateFrom: '2026-01-03',
          dateTo: '2026-01-10',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.data.itemCount).toBe(1);
      expect(data.data.items[0].word).toBe('test2');
    });
  });

  describe('validation errors', () => {
    it('should reject missing format field', async () => {
      const request = new NextRequest('http://localhost:3000/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject invalid format value', async () => {
      const request = new NextRequest('http://localhost:3000/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format: 'xml' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should reject invalid date format', async () => {
      const request = new NextRequest('http://localhost:3000/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format: 'json',
          dateFrom: '01/01/2026',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle empty vocabulary database', async () => {
      const request = new NextRequest('http://localhost:3000/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format: 'json' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.itemCount).toBe(0);
      expect(data.data.items).toEqual([]);
    });

    it('should handle export with all filters combined', async () => {
      await prisma.vocabularyItem.create({
        data: {
          word: 'こんにちは',
          reading: 'konnichiwa',
          meaning: 'Hello',
          createdAt: new Date('2026-01-05'),
          groups: { connect: [{ id: mockGroupId1 }] },
        },
      });

      const request = new NextRequest('http://localhost:3000/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format: 'csv',
          groupIds: [mockGroupId1],
          dateFrom: '2026-01-01',
          dateTo: '2026-12-31',
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('text/csv; charset=utf-8');
    });
  });
});
