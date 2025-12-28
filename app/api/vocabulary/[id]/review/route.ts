import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { successResponse, ApiErrors } from '@/lib/api';
import { calculateSM2 } from '@/lib/srs/sm2';
import { DEFAULT_SM2_DATA, type QualityRating } from '@/lib/srs/sm2.types';

/**
 * POST /api/vocabulary/:id/review
 * 
 * Records a review result for a vocabulary item and updates its review schedule
 * using the SM-2 algorithm.
 * 
 * Request body:
 * - quality: Quality rating (0-5)
 * 
 * Response:
 * - Updated vocabulary item with review schedule
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { quality } = body;

    if (quality === undefined || quality === null) {
      return ApiErrors.BAD_REQUEST('Quality rating is required');
    }

    if (!Number.isInteger(quality) || quality < 0 || quality > 5) {
      return ApiErrors.BAD_REQUEST('Quality rating must be an integer between 0 and 5');
    }

    const vocabularyItem = await prisma.vocabularyItem.findUnique({
      where: { id },
      include: { reviewSchedule: true },
    });

    if (!vocabularyItem) {
      return ApiErrors.NOT_FOUND('Vocabulary item not found');
    }

    const currentData = vocabularyItem.reviewSchedule
      ? {
          easinessFactor: vocabularyItem.reviewSchedule.easinessFactor,
          interval: vocabularyItem.reviewSchedule.interval,
          repetitions: vocabularyItem.reviewSchedule.repetitions,
        }
      : DEFAULT_SM2_DATA;

    const reviewResult = calculateSM2({
      currentData,
      quality: quality as QualityRating,
    });

    const updatedSchedule = await prisma.reviewSchedule.upsert({
      where: { vocabularyItemId: id },
      create: {
        vocabularyItemId: id,
        easinessFactor: reviewResult.sm2Data.easinessFactor,
        interval: reviewResult.sm2Data.interval,
        repetitions: reviewResult.sm2Data.repetitions,
        nextReviewDate: reviewResult.nextReviewDate,
        lastReviewDate: new Date(),
      },
      update: {
        easinessFactor: reviewResult.sm2Data.easinessFactor,
        interval: reviewResult.sm2Data.interval,
        repetitions: reviewResult.sm2Data.repetitions,
        nextReviewDate: reviewResult.nextReviewDate,
        lastReviewDate: new Date(),
      },
    });

    const updatedVocabulary = await prisma.vocabularyItem.findUnique({
      where: { id },
      include: {
        reviewSchedule: true,
        exampleSentences: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    return successResponse(updatedVocabulary);
  } catch (error) {
    console.error('Error recording review:', error);
    return ApiErrors.INTERNAL_ERROR('Failed to record review');
  }
}

