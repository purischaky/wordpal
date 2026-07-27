import type { NextRequest } from 'next/server';
import { readJsonFile } from '@/lib/api/file-service';
import { successResponse, errorResponse } from '@/lib/api/response';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const notifications = await readJsonFile<unknown[]>('notifications.json');
    return successResponse(notifications);
  } catch (error) {
    return errorResponse('Failed to read notifications data');
  }
}
