import type { NextRequest } from 'next/server';
import { readJsonFile } from '@/lib/api/file-service';
import { successResponse, errorResponse } from '@/lib/api/response';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const insights = await readJsonFile<unknown[]>('ai-insights.json');
    return successResponse(insights);
  } catch (error) {
    return errorResponse('Failed to read AI insights data');
  }
}
