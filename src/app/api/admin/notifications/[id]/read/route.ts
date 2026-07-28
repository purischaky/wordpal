import type { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api/response';
import { requireAdminSection } from '@/lib/api/guard';
import { createSupabaseServerClient } from '@/lib/services/supabase-server';

export const dynamic = 'force-dynamic';

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminSection('dashboard');
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from('notification_reads')
    .upsert({ notification_id: id, user_id: guard.session.userId }, { onConflict: 'notification_id,user_id' });
  if (error) return errorResponse('Failed to update notification');

  return successResponse({ id, isRead: true });
}
