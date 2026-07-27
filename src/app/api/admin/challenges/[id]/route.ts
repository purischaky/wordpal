import type { NextRequest } from 'next/server';
import { readJsonFile, writeJsonFile } from '@/lib/api/file-service';
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
} from '@/lib/api/response';
import { validateChallengeUpdate } from '@/lib/api/validators/challenges';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const validation = validateChallengeUpdate(body);
    if (!validation.valid) {
      return validationErrorResponse('Validation failed', validation.errors);
    }

    const challenges = await readJsonFile<Record<string, unknown>[]>(
      'challenges.json'
    );
    const index = challenges.findIndex((c) => c.id === id);

    if (index === -1) {
      return errorResponse('Challenge not found', 404);
    }

    challenges[index] = {
      ...challenges[index],
      ...body,
      updatedAt: new Date().toISOString(),
    };
    await writeJsonFile('challenges.json', challenges);

    return successResponse(challenges[index]);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return errorResponse('Invalid JSON in request body', 400);
    }
    return errorResponse('Failed to update challenge');
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const challenges = await readJsonFile<Record<string, unknown>[]>(
      'challenges.json'
    );
    const index = challenges.findIndex((c) => c.id === id);

    if (index === -1) {
      return errorResponse('Challenge not found', 404);
    }

    challenges.splice(index, 1);
    await writeJsonFile('challenges.json', challenges);

    return successResponse({ deleted: id });
  } catch (error) {
    return errorResponse('Failed to delete challenge');
  }
}
