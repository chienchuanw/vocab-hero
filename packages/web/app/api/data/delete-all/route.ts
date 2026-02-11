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
      await tx.$executeRaw`TRUNCATE TABLE "example_sentences" RESTART IDENTITY CASCADE`;
      await tx.$executeRaw`TRUNCATE TABLE "review_schedules" RESTART IDENTITY CASCADE`;
      await tx.$executeRaw`TRUNCATE TABLE "_VocabularyGroupToVocabularyItem" RESTART IDENTITY CASCADE`;
      await tx.$executeRaw`TRUNCATE TABLE "vocabulary_items" RESTART IDENTITY CASCADE`;
      await tx.$executeRaw`TRUNCATE TABLE "vocabulary_groups" RESTART IDENTITY CASCADE`;
      await tx.$executeRaw`TRUNCATE TABLE "study_sessions" RESTART IDENTITY CASCADE`;
      await tx.$executeRaw`TRUNCATE TABLE "progress_logs" RESTART IDENTITY CASCADE`;
      await tx.$executeRaw`TRUNCATE TABLE "user_streaks" RESTART IDENTITY CASCADE`;
      await tx.$executeRaw`TRUNCATE TABLE "notifications" RESTART IDENTITY CASCADE`;
      await tx.$executeRaw`TRUNCATE TABLE "notification_preferences" RESTART IDENTITY CASCADE`;
      await tx.$executeRaw`TRUNCATE TABLE "user_settings" RESTART IDENTITY CASCADE`;
      await tx.$executeRaw`TRUNCATE TABLE "daily_goals" RESTART IDENTITY CASCADE`;
      await tx.$executeRaw`TRUNCATE TABLE "users" RESTART IDENTITY CASCADE`;
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
