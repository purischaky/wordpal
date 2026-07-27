import type { NextRequest } from 'next/server';
import { readJsonFile, writeJsonFile } from '@/lib/api/file-service';
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/api/response';
import { validateLessonPublish } from '@/lib/api/validators/lessons';

export const dynamic = 'force-dynamic';

export async function PATCH(
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

    const lesson = lessons[index];
    const validation = validateLessonPublish(lesson);

    if (!validation.valid) {
      return validationErrorResponse('Validation failed', validation.errors);
    }

    lessons[index] = { ...lesson, status: 'published', updatedAt: new Date().toISOString() };
    await writeJsonFile('lessons.json', lessons);

    return successResponse(lessons[index]);
  } catch (error) {
    return errorResponse('Failed to publish lesson');
  }
}
