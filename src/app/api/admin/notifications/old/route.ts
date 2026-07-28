import type { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api/response';
import { requireAdmin } from '@/lib/api/guard';
import { createSupabaseServerClient } from '@/lib/services/supabase-server';

export const dynamic = 'force-dynamic';

export async function DELETE(request: NextRequest) {
  // Bulk-delete is destructive and irreversible, so it's restricted to
  // 'admin' specifically rather than any staff role with dashboard access.
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const cutoff = request.nextUrl.searchParams.get('cutoff');
  if (!cutoff) {
    return errorResponse('cutoff query parameter is required', 400);
  }

  const cutoffDate = new Date(cutoff);
  if (isNaN(cutoffDate.getTime())) {
    return errorResponse('cutoff must be a valid ISO date string', 400);
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('notifications')
    .delete()
    .lt('created_at', cutoffDate.toISOString())
    .select('id');

  if (error) return errorResponse('Failed to delete old notifications');
  return successResponse({ deletedCount: data?.length ?? 0 });
}
