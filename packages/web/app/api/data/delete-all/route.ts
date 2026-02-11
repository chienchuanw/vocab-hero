import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { successResponse, ApiErrors } from '@/lib/api/response';
import { recreateDefaultUserData } from '@/lib/db/default-user';
import type { Prisma } from '@prisma/client';

const deleteAllSchema = z.object({
  confirm: z.string().refine((val) => val.trim() === 'DELETE ALL', {
    message: 'Confirmation phrase must be exactly "DELETE ALL"',
  }),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validationResult = deleteAllSchema.safeParse(body);

    if (!validationResult.success) {
      return ApiErrors.VALIDATION_ERROR(
        'Invalid confirmation phrase',
        validationResult.error.issues
      );
    }

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.exampleSentence.deleteMany();
      await tx.reviewSchedule.deleteMany();
      await tx.notification.deleteMany();
      await tx.notificationPreference.deleteMany();
      await tx.userSettings.deleteMany();
      await tx.studySession.deleteMany();
      await tx.progressLog.deleteMany();
      await tx.userStreak.deleteMany();
      await tx.dailyGoal.deleteMany();
      await tx.vocabularyGroup.deleteMany();
      await tx.vocabularyItem.deleteMany();
      await tx.sentenceCard.deleteMany();
      await tx.user.deleteMany();
    });

    const userId = await recreateDefaultUserData();

    return successResponse({ userId });
  } catch (error) {
    console.error('Error deleting all data:', error);

    if (error instanceof z.ZodError) {
      return ApiErrors.VALIDATION_ERROR('Invalid request data', error.issues);
    }

    return ApiErrors.INTERNAL_ERROR('Failed to delete all data');
  }
}
