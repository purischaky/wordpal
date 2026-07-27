import type { NextRequest } from 'next/server';
import { readJsonFile, writeJsonFile } from '@/lib/api/file-service';
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
} from '@/lib/api/response';
import { generateId } from '@/lib/api/id-generator';
import { validateLearningPathCreate } from '@/lib/api/validators/learning-paths';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const learningPaths = await readJsonFile<Record<string, unknown>[]>(
      'learning-paths.json'
    );
    return successResponse(learningPaths);
  } catch (error) {
    return errorResponse('Failed to read learning paths data');
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = validateLearningPathCreate(body);
    if (!validation.valid) {
      return validationErrorResponse('Validation failed', validation.errors);
    }

    const learningPaths = await readJsonFile<Record<string, unknown>[]>(
      'learning-paths.json'
    );

    const newLearningPath = {
      id: generateId('lp'),
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    learningPaths.push(newLearningPath);
    await writeJsonFile('learning-paths.json', learningPaths);

    return successResponse(newLearningPath, 201);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return errorResponse('Invalid JSON in request body', 400);
    }
    return errorResponse('Failed to create learning path');
  }
}
