import type { NextRequest } from 'next/server';
import { readJsonFile, writeJsonFile } from '@/lib/api/file-service';
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
} from '@/lib/api/response';
import { generateId } from '@/lib/api/id-generator';
import { validateChallengeCreate } from '@/lib/api/validators/challenges';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const challenges = await readJsonFile<Record<string, unknown>[]>(
      'challenges.json'
    );
    return successResponse(challenges);
  } catch (error) {
    return errorResponse('Failed to read challenges data');
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = validateChallengeCreate(body);
    if (!validation.valid) {
      return validationErrorResponse('Validation failed', validation.errors);
    }

    const challenges = await readJsonFile<Record<string, unknown>[]>(
      'challenges.json'
    );

    const newChallenge = {
      id: generateId('ch'),
      ...body,
      status: 'draft',
      createdAt: new Date().toISOString(),
    };

    challenges.push(newChallenge);
    await writeJsonFile('challenges.json', challenges);

    return successResponse(newChallenge, 201);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return errorResponse('Invalid JSON in request body', 400);
    }
    return errorResponse('Failed to create challenge');
  }
}
