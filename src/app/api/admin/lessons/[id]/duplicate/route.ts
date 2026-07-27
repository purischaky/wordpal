import type { NextRequest } from 'next/server';
import { readJsonFile, writeJsonFile } from '@/lib/api/file-service';
import { successResponse, errorResponse } from '@/lib/api/response';
import { generateId } from '@/lib/api/id-generator';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const lessons = await readJsonFile<Record<string, unknown>[]>('lessons.json');
    const original = lessons.find((l) => l.id === id);

    if (!original) {
      return errorResponse('Lesson not found', 404);
    }

    const duplicated = {
      ...original,
      id: generateId('les'),
      title: `Copy of ${original.title}`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    lessons.push(duplicated);
    await writeJsonFile('lessons.json', lessons);

    return successResponse(duplicated, 201);
  } catch (error) {
    return errorResponse('Failed to duplicate lesson');
  }
}
