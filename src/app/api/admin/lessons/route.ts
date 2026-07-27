import type { NextRequest } from 'next/server';
import { readJsonFile, writeJsonFile } from '@/lib/api/file-service';
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/api/response';
import { validateLessonCreate } from '@/lib/api/validators/lessons';
import { generateId } from '@/lib/api/id-generator';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const lessons = await readJsonFile<Record<string, unknown>[]>('lessons.json');
    return successResponse(lessons);
  } catch (error) {
    return errorResponse('Failed to read lessons data');
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = validateLessonCreate(body);
    if (!validation.valid) {
      return validationErrorResponse('Validation failed', validation.errors);
    }

    const lessons = await readJsonFile<Record<string, unknown>[]>('lessons.json');

    const newLesson = {
      id: generateId('les'),
      ...body,
      status: body.status || 'draft',
      exerciseCount: body.exerciseCount || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    lessons.push(newLesson);
    await writeJsonFile('lessons.json', lessons);

    return successResponse(newLesson, 201);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return errorResponse('Invalid JSON in request body', 400);
    }
    return errorResponse('Failed to create lesson');
  }
}
