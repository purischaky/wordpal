import type { NextRequest } from 'next/server';
import { readJsonFile, writeJsonFile } from '@/lib/api/file-service';
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/api/response';
import { validateExerciseCreate } from '@/lib/api/validators/exercises';
import { generateId } from '@/lib/api/id-generator';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const exercises = await readJsonFile<Record<string, unknown>>('exercises.json');
    return successResponse(exercises);
  } catch (error) {
    return errorResponse('Failed to read exercises data');
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = validateExerciseCreate(body);
    if (!validation.valid) {
      return validationErrorResponse('Validation failed', validation.errors);
    }

    const exercises = await readJsonFile<Record<string, unknown>>('exercises.json');

    const id = generateId('ex');
    const newExercise = { ...body };

    exercises[id] = newExercise;
    await writeJsonFile('exercises.json', exercises);

    return successResponse({ id, ...newExercise }, 201);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return errorResponse('Invalid JSON in request body', 400);
    }
    return errorResponse('Failed to create exercise');
  }
}
