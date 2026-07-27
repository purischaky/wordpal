import type { NextRequest } from 'next/server';
import { readJsonFile, writeJsonFile } from '@/lib/api/file-service';
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
} from '@/lib/api/response';
import { validateLearningPathUpdate } from '@/lib/api/validators/learning-paths';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const validation = validateLearningPathUpdate(body);
    if (!validation.valid) {
      return validationErrorResponse('Validation failed', validation.errors);
    }

    const learningPaths = await readJsonFile<Record<string, unknown>[]>(
      'learning-paths.json'
    );
    const index = learningPaths.findIndex((lp) => lp.id === id);

    if (index === -1) {
      return errorResponse('Learning path not found', 404);
    }

    learningPaths[index] = {
      ...learningPaths[index],
      ...body,
      updatedAt: new Date().toISOString(),
    };
    await writeJsonFile('learning-paths.json', learningPaths);

    return successResponse(learningPaths[index]);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return errorResponse('Invalid JSON in request body', 400);
    }
    return errorResponse('Failed to update learning path');
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const learningPaths = await readJsonFile<Record<string, unknown>[]>(
      'learning-paths.json'
    );
    const index = learningPaths.findIndex((lp) => lp.id === id);

    if (index === -1) {
      return errorResponse('Learning path not found', 404);
    }

    learningPaths.splice(index, 1);
    await writeJsonFile('learning-paths.json', learningPaths);

    return successResponse({ deleted: id });
  } catch (error) {
    return errorResponse('Failed to delete learning path');
  }
}
