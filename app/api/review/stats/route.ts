import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { successResponse, ApiErrors } from '@/lib/api';

/**
 * GET /api/review/stats
 * 
 * Retrieves review statistics including:
 * - Total vocabulary items
 * - Items due today
 * - New items (no review schedule)
 * - Learning items (repetitions < 3)
 * - Mastered items (repetitions > 8 and interval > 21)
 */
export async function GET(request: NextRequest) {
  try {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const total = await prisma.vocabularyItem.count();

    const dueToday = await prisma.vocabularyItem.count({
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
    });

    const newItems = await prisma.vocabularyItem.count({
      where: {
        reviewSchedule: null,
      },
    });

    const learning = await prisma.vocabularyItem.count({
      where: {
        reviewSchedule: {
          repetitions: {
            lt: 3,
          },
        },
      },
    });

    const mastered = await prisma.vocabularyItem.count({
      where: {
        reviewSchedule: {
          AND: [
            {
              repetitions: {
                gt: 8,
              },
            },
            {
              interval: {
                gt: 21,
              },
            },
          ],
        },
      },
    });

    return successResponse({
      total,
      dueToday,
      new: newItems,
      learning,
      mastered,
    });
  } catch (error) {
    console.error('Error fetching review stats:', error);
    return ApiErrors.INTERNAL_ERROR('Failed to fetch review stats');
  }
}

