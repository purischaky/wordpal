import type { NextRequest } from 'next/server';
import { readJsonFile, writeJsonFile } from '@/lib/api/file-service';
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
} from '@/lib/api/response';
import { validateStudentUpdate } from '@/lib/api/validators/students';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const profiles = await readJsonFile<Record<string, unknown>>(
      'student-profiles.json'
    );
    const profile = profiles[id];

    if (!profile) {
      return errorResponse('Student not found', 404);
    }

    return successResponse(profile);
  } catch (error) {
    return errorResponse('Failed to read student data');
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    let body: unknown;
    try {
      body = await request.json();
    } catch (error) {
      if (error instanceof SyntaxError) {
        return errorResponse('Invalid JSON in request body', 400);
      }
      throw error;
    }

    const validation = validateStudentUpdate(body);
    if (!validation.valid) {
      return validationErrorResponse('Validation failed', validation.errors);
    }

    const students = await readJsonFile<Array<Record<string, unknown>>>(
      'students.json'
    );
    const index = students.findIndex((s) => s.id === id);

    if (index === -1) {
      return errorResponse('Student not found', 404);
    }

    students[index] = { ...students[index], ...body as Record<string, unknown> };
    await writeJsonFile('students.json', students);

    return successResponse(students[index]);
  } catch (error) {
    return errorResponse('Failed to update student data');
  }
}
