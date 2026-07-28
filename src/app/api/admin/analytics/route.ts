import type { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api/response';
import { requireAdminSection } from '@/lib/api/guard';
import { createSupabaseServerClient } from '@/lib/services/supabase-server';

export const dynamic = 'force-dynamic';

function parseDate(value: string | null, fallback: Date): Date {
  if (!value) return fallback;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
}

export async function GET(request: NextRequest) {
  const guard = await requireAdminSection('analytics');
  if (!guard.ok) return guard.response;

  const now = new Date();
  const defaultStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const start = parseDate(request.nextUrl.searchParams.get('start'), defaultStart);
  const end = parseDate(request.nextUrl.searchParams.get('end'), now);

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc('get_analytics_data', {
    p_start: start.toISOString(),
    p_end: end.toISOString(),
  });

  if (error) return errorResponse('Failed to read analytics data');
  return successResponse(data);
}
