import type { NextRequest } from 'next/server';
import { readJsonFile, writeJsonFile } from '@/lib/api/file-service';
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/api/response';
import { validateExerciseUpdate } from '@/lib/api/validators/exercises';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const exercises = await readJsonFile<Record<string, unknown>>('exercises.json');
    const exercise = exercises[id];

    if (!exercise) {
      return errorResponse('Exercise not found', 404);
    }

    return successResponse(exercise);
  } catch (error) {
    return errorResponse('Failed to read exercise data');
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const validation = validateExerciseUpdate(body);
    if (!validation.valid) {
      return validationErrorResponse('Validation failed', validation.errors);
    }

    const exercises = await readJsonFile<Record<string, unknown>>('exercises.json');

    if (!exercises[id]) {
      return errorResponse('Exercise not found', 404);
    }

    exercises[id] = { ...(exercises[id] as object), ...body };
    await writeJsonFile('exercises.json', exercises);

    return successResponse(exercises[id]);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return errorResponse('Invalid JSON in request body', 400);
    }
    return errorResponse('Failed to update exercise');
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const exercises = await readJsonFile<Record<string, unknown>>('exercises.json');

    if (!exercises[id]) {
      return errorResponse('Exercise not found', 404);
    }

    delete exercises[id];
    await writeJsonFile('exercises.json', exercises);

    return successResponse({ message: 'Exercise deleted' });
  } catch (error) {
    return errorResponse('Failed to delete exercise');
  }
}
