import type { NextRequest } from 'next/server';
import { readJsonFile } from '@/lib/api/file-service';
import { successResponse, errorResponse } from '@/lib/api/response';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const students = await readJsonFile<unknown[]>('students.json');
    return successResponse(students);
  } catch (error) {
    return errorResponse('Failed to read students data');
  }
}
