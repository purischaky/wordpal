import type { NextRequest } from 'next/server';
import { readJsonFile, writeJsonFile } from '@/lib/api/file-service';
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
} from '@/lib/api/response';
import { validateChallengePublish } from '@/lib/api/validators/challenges';

export const dynamic = 'force-dynamic';

export async function PATCH(
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

    const challenge = challenges[index];
    const validation = validateChallengePublish(challenge);

    if (!validation.valid) {
      return validationErrorResponse('Validation failed', validation.errors);
    }

    challenges[index] = {
      ...challenge,
      status: 'published',
      updatedAt: new Date().toISOString(),
    };
    await writeJsonFile('challenges.json', challenges);

    return successResponse(challenges[index]);
  } catch (error) {
    return errorResponse('Failed to publish challenge');
  }
}
