import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { successResponse, errorResponse } from '@/lib/api/response';

/**
 * GET /api/vocabulary/due
 *
 * Retrieves vocabulary items that are due for review today.
 * This includes:
 * - Items with review schedule where nextReviewDate <= today
 * - Items without review schedule (new items)
 *
 * Query parameters:
 * - limit: Maximum number of items to return (default: 20)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const dueVocabulary = await prisma.vocabularyItem.findMany({
      where: {
        OR: [
          {
            reviewSchedule: {
              nextReviewDate: {
                lte: today,
              },
            },
          },
          {
            reviewSchedule: null,
          },
        ],
      },
      include: {
        reviewSchedule: true,
        exampleSentences: {
          orderBy: {
            order: 'asc',
          },
        },
      },
      take: limit,
      orderBy: [
        {
          reviewSchedule: {
            nextReviewDate: 'asc',
          },
        },
        {
          createdAt: 'asc',
        },
      ],
    });

    return successResponse(dueVocabulary);
  } catch (error) {
    console.error('Error fetching due vocabulary:', error);
    return errorResponse('INTERNAL_ERROR', 'Failed to fetch due vocabulary', 500);
  }
}
