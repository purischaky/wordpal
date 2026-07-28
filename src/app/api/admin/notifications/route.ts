import { successResponse, errorResponse } from '@/lib/api/response';
import { requireAdminSection } from '@/lib/api/guard';
import { createSupabaseServerClient } from '@/lib/services/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const guard = await requireAdminSection('dashboard');
  if (!guard.ok) return guard.response;

  const supabase = await createSupabaseServerClient();
  const { data: notifications, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) return errorResponse('Failed to read notifications data');

  const { data: reads, error: readsError } = await supabase
    .from('notification_reads')
    .select('notification_id')
    .eq('user_id', guard.session.userId);
  if (readsError) return errorResponse('Failed to read notification read state');

  const readIds = new Set((reads ?? []).map((r) => r.notification_id));
  const withReadState = (notifications ?? []).map((n) => ({
    ...n,
    isRead: readIds.has(n.id),
  }));

  return successResponse(withReadState);
}
