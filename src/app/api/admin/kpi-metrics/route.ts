import type { NextRequest } from 'next/server';
import { readJsonFile } from '@/lib/api/file-service';
import { successResponse, errorResponse } from '@/lib/api/response';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const metrics = await readJsonFile<unknown[]>('kpi-metrics.json');
    return successResponse(metrics);
  } catch (error) {
    return errorResponse('Failed to read KPI metrics data');
  }
}
