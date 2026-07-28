import { successResponse, errorResponse } from '@/lib/api/response';
import { requireAdminSection } from '@/lib/api/guard';
import { createSupabaseServerClient } from '@/lib/services/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const guard = await requireAdminSection('students');
  if (!guard.ok) return guard.response;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('admin_student_rows')
    .select('*')
    .order('name');
  if (error) return errorResponse('Failed to read students data');

  return successResponse(data);
}
