import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { successResponse, ApiErrors } from '@/lib/api/response';
import { updateUserSettingsSchema } from '@/lib/validations/user-settings';
import { z } from 'zod';
import type { StudyMode, ThemePreference } from '@vocab-hero/shared';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return ApiErrors.BAD_REQUEST('User ID is required');
    }

    const userSettings = await prisma.userSettings.findUnique({
      where: { userId },
    });

    if (!userSettings) {
      return ApiErrors.NOT_FOUND('User settings not found');
    }

    return successResponse(userSettings);
  } catch (error) {
    console.error('Error fetching user settings:', error);
    return ApiErrors.INTERNAL_ERROR('Failed to fetch user settings');
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.userId) {
      return ApiErrors.BAD_REQUEST('User ID is required');
    }

    const userId = body.userId;

    const validationResult = updateUserSettingsSchema.safeParse(body);

    if (!validationResult.success) {
      return ApiErrors.VALIDATION_ERROR('Invalid settings data', validationResult.error.issues);
    }

    const updateData = validationResult.data;

    const userSettings = await prisma.userSettings.upsert({
      where: { userId },
      update: {
        ...(updateData.theme !== undefined && { theme: updateData.theme as ThemePreference }),
        ...(updateData.ttsSpeed !== undefined && { ttsSpeed: updateData.ttsSpeed }),
        ...(updateData.ttsVolume !== undefined && { ttsVolume: updateData.ttsVolume }),
        ...(updateData.ttsPitch !== undefined && { ttsPitch: updateData.ttsPitch }),
        ...(updateData.ttsVoice !== undefined && { ttsVoice: updateData.ttsVoice }),
        ...(updateData.cardsPerSession !== undefined && {
          cardsPerSession: updateData.cardsPerSession,
        }),
        ...(updateData.defaultStudyMode !== undefined && {
          defaultStudyMode: updateData.defaultStudyMode as StudyMode,
        }),
        ...(updateData.autoAdvance !== undefined && { autoAdvance: updateData.autoAdvance }),
        ...(updateData.showReading !== undefined && { showReading: updateData.showReading }),
        ...(updateData.language !== undefined && { language: updateData.language }),
      },
      create: {
        userId,
        theme: (updateData.theme as ThemePreference) ?? 'SYSTEM',
        ttsSpeed: updateData.ttsSpeed ?? 1.0,
        ttsVolume: updateData.ttsVolume ?? 1.0,
        ttsPitch: updateData.ttsPitch ?? 1.0,
        ttsVoice: updateData.ttsVoice ?? null,
        cardsPerSession: updateData.cardsPerSession ?? 20,
        defaultStudyMode: (updateData.defaultStudyMode as StudyMode) ?? 'FLASHCARD',
        autoAdvance: updateData.autoAdvance ?? false,
        showReading: updateData.showReading ?? true,
        language: updateData.language ?? 'en',
      },
    });

    return successResponse(userSettings);
  } catch (error) {
    console.error('Error updating user settings:', error);

    if (error instanceof z.ZodError) {
      return ApiErrors.VALIDATION_ERROR('Invalid request data', error.issues);
    }

    return ApiErrors.INTERNAL_ERROR('Failed to update user settings');
  }
}
