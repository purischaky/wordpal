import type { NextRequest } from 'next/server';
import { readJsonFile, writeJsonFile } from '@/lib/api/file-service';
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/api/response';
import { validateLessonUpdate } from '@/lib/api/validators/lessons';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const validation = validateLessonUpdate(body);
    if (!validation.valid) {
      return validationErrorResponse('Validation failed', validation.errors);
    }

    const lessons = await readJsonFile<Record<string, unknown>[]>('lessons.json');
    const index = lessons.findIndex((l) => l.id === id);

    if (index === -1) {
      return errorResponse('Lesson not found', 404);
    }

    lessons[index] = { ...lessons[index], ...body, updatedAt: new Date().toISOString() };
    await writeJsonFile('lessons.json', lessons);

    return successResponse(lessons[index]);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return errorResponse('Invalid JSON in request body', 400);
    }
    return errorResponse('Failed to update lesson');
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const lessons = await readJsonFile<Record<string, unknown>[]>('lessons.json');
    const index = lessons.findIndex((l) => l.id === id);

    if (index === -1) {
      return errorResponse('Lesson not found', 404);
    }

    lessons.splice(index, 1);
    await writeJsonFile('lessons.json', lessons);

    return successResponse({ message: 'Lesson deleted' });
  } catch (error) {
    return errorResponse('Failed to delete lesson');
  }
}
