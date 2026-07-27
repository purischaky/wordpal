import type { NextRequest } from 'next/server';
import { readJsonFile, writeJsonFile } from '@/lib/api/file-service';
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
} from '@/lib/api/response';
import { validateAchievementUpdate } from '@/lib/api/validators/achievements';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const validation = validateAchievementUpdate(body);
    if (!validation.valid) {
      return validationErrorResponse('Validation failed', validation.errors);
    }

    const achievements = await readJsonFile<Record<string, unknown>[]>(
      'achievements.json'
    );
    const index = achievements.findIndex((a) => a.id === id);

    if (index === -1) {
      return errorResponse('Achievement not found', 404);
    }

    achievements[index] = {
      ...achievements[index],
      ...body,
      updatedAt: new Date().toISOString(),
    };
    await writeJsonFile('achievements.json', achievements);

    return successResponse(achievements[index]);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return errorResponse('Invalid JSON in request body', 400);
    }
    return errorResponse('Failed to update achievement');
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const achievements = await readJsonFile<Record<string, unknown>[]>(
      'achievements.json'
    );
    const index = achievements.findIndex((a) => a.id === id);

    if (index === -1) {
      return errorResponse('Achievement not found', 404);
    }

    achievements.splice(index, 1);
    await writeJsonFile('achievements.json', achievements);

    return successResponse({ deleted: id });
  } catch (error) {
    return errorResponse('Failed to delete achievement');
  }
}
