import type { NextRequest } from 'next/server';
import { readJsonFile, writeJsonFile } from '@/lib/api/file-service';
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
} from '@/lib/api/response';
import { validateSettingsUpdate } from '@/lib/api/validators/settings';

export const dynamic = 'force-dynamic';

interface PlatformSettings {
  scoring: {
    xpPerExercise: number;
    xpPerLesson: number;
    weightByExerciseType: Record<string, number>;
    passingThreshold: number;
  };
}

const DEFAULT_SETTINGS: PlatformSettings = {
  scoring: {
    xpPerExercise: 10,
    xpPerLesson: 50,
    weightByExerciseType: {
      'multiple-choice': 20,
      'fill-in-blank': 20,
      'drag-and-drop': 20,
      'sentence-ordering': 20,
      'rewrite-sentence': 10,
      'free-writing': 10,
    },
    passingThreshold: 70,
  },
};

export async function GET(request: NextRequest) {
  try {
    const settings = await readJsonFile<PlatformSettings>('settings.json');
    return successResponse(settings);
  } catch (error) {
    // If file doesn't exist, return defaults and write them
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      (error as NodeJS.ErrnoException).code === 'ENOENT'
    ) {
      await writeJsonFile('settings.json', DEFAULT_SETTINGS);
      return successResponse(DEFAULT_SETTINGS);
    }
    return errorResponse('Failed to read settings data');
  }
}

export async function PUT(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch (error) {
      if (error instanceof SyntaxError) {
        return errorResponse('Invalid JSON in request body', 400);
      }
      throw error;
    }

    const validation = validateSettingsUpdate(body);
    if (!validation.valid) {
      return validationErrorResponse('Validation failed', validation.errors);
    }

    await writeJsonFile('settings.json', body);
    return successResponse(body);
  } catch (error) {
    return errorResponse('Failed to update settings data');
  }
}
