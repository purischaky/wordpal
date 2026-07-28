import { successResponse, errorResponse } from '@/lib/api/response';
import { requireAdminSection } from '@/lib/api/guard';
import { createSupabaseServerClient } from '@/lib/services/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const guard = await requireAdminSection('dashboard');
  if (!guard.ok) return guard.response;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc('get_kpi_metrics');

  if (error) {
    if (error.code === '42501') return errorResponse('Insufficient permissions', 403);
    return errorResponse('Failed to read KPI metrics data');
  }
  return successResponse(data);
}
