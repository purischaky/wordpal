import type { NextRequest } from 'next/server';
import { readJsonFile, writeJsonFile } from '@/lib/api/file-service';
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
} from '@/lib/api/response';
import { generateId } from '@/lib/api/id-generator';
import { validateAchievementCreate } from '@/lib/api/validators/achievements';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const achievements = await readJsonFile<Record<string, unknown>[]>(
      'achievements.json'
    );
    return successResponse(achievements);
  } catch (error) {
    return errorResponse('Failed to read achievements data');
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = validateAchievementCreate(body);
    if (!validation.valid) {
      return validationErrorResponse('Validation failed', validation.errors);
    }

    const achievements = await readJsonFile<Record<string, unknown>[]>(
      'achievements.json'
    );

    const newAchievement = {
      id: generateId('ach'),
      ...body,
      createdAt: new Date().toISOString(),
    };

    achievements.push(newAchievement);
    await writeJsonFile('achievements.json', achievements);

    return successResponse(newAchievement, 201);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return errorResponse('Invalid JSON in request body', 400);
    }
    return errorResponse('Failed to create achievement');
  }
}
