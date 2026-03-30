import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { PUT } from './route';

vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    sentenceCard: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { prisma } from '@/lib/db/prisma';

const mockParams = Promise.resolve({ id: 'test-id-1' });

describe('PUT /api/sentences/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should update sentence with imageUrl', async () => {
    const existing = {
      id: 'test-id-1',
      japanese: 'old',
      english: 'old',
      notes: null,
      imageUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const updated = { ...existing, imageUrl: '/uploads/sentences/new.png' };

    (prisma.sentenceCard.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(existing);
    (prisma.sentenceCard.update as ReturnType<typeof vi.fn>).mockResolvedValue(updated);

    const request = new NextRequest('http://localhost:3000/api/sentences/test-id-1', {
      method: 'PUT',
      body: JSON.stringify({ imageUrl: '/uploads/sentences/new.png' }),
    });

    const response = await PUT(request, { params: mockParams });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.imageUrl).toBe('/uploads/sentences/new.png');
  });

  it('should update sentence without imageUrl', async () => {
    const existing = {
      id: 'test-id-1',
      japanese: 'old',
      english: 'old english',
      notes: null,
      imageUrl: '/uploads/sentences/existing.png',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const updated = { ...existing, japanese: 'updated' };

    (prisma.sentenceCard.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(existing);
    (prisma.sentenceCard.update as ReturnType<typeof vi.fn>).mockResolvedValue(updated);

    const request = new NextRequest('http://localhost:3000/api/sentences/test-id-1', {
      method: 'PUT',
      body: JSON.stringify({ japanese: 'updated' }),
    });

    const response = await PUT(request, { params: mockParams });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.japanese).toBe('updated');
  });
});
