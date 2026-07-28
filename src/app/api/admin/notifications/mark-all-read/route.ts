import { successResponse, errorResponse } from '@/lib/api/response';
import { requireAdminSection } from '@/lib/api/guard';
import { createSupabaseServerClient } from '@/lib/services/supabase-server';

export const dynamic = 'force-dynamic';

export async function POST() {
  const guard = await requireAdminSection('dashboard');
  if (!guard.ok) return guard.response;

  const supabase = await createSupabaseServerClient();

  const { data: notifications, error: readError } = await supabase
    .from('notifications')
    .select('id');
  if (readError) return errorResponse('Failed to mark notifications as read');

  const rows = (notifications ?? []).map((n) => ({
    notification_id: n.id,
    user_id: guard.session.userId,
  }));
  if (rows.length > 0) {
    const { error } = await supabase
      .from('notification_reads')
      .upsert(rows, { onConflict: 'notification_id,user_id' });
    if (error) return errorResponse('Failed to mark notifications as read');
  }

  return successResponse({ markedCount: rows.length });
}
