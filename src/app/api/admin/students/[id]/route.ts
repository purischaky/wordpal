import type { NextRequest } from 'next/server';
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/api/response';
import { validateStudentUpdate } from '@/lib/api/validators/students';
import { requireAdminSection } from '@/lib/api/guard';
import { createSupabaseServerClient } from '@/lib/services/supabase-server';
import type { AppRole } from '@/types/database';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminSection('students');
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc('get_student_profile', { p_user: id });

  if (error) {
    if (error.code === 'P0002') return errorResponse('Student not found', 404);
    if (error.code === '42501') return errorResponse('Insufficient permissions', 403);
    return errorResponse('Failed to read student data');
  }
  return successResponse(data);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminSection('students');
  if (!guard.ok) return guard.response;

  const { id } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON in request body', 400);
  }

  const validation = validateStudentUpdate(body);
  if (!validation.valid) {
    return validationErrorResponse('Validation failed', validation.errors);
  }
  const data = body as Record<string, unknown>;

  // Only admins may pass `role` — the RPC also enforces this, but rejecting
  // early avoids a confusing 500 error code translation for a 403 case.
  if (data.role !== undefined && guard.session.role !== 'admin') {
    return errorResponse('Only administrators can change roles', 403);
  }

  const supabase = await createSupabaseServerClient();
  const { data: updated, error } = await supabase.rpc('admin_update_student', {
    p_user: id,
    p_status: (data.status as string) ?? null,
    p_cefr_level: (data.cefrLevel as string) ?? null,
    p_display_name: (data.displayName as string) ?? null,
    p_role: (data.role as AppRole) ?? null,
  });

  if (error) {
    if (error.code === 'P0002') return errorResponse('Student not found', 404);
    if (error.code === '42501') return errorResponse('Insufficient permissions', 403);
    return errorResponse('Failed to update student data');
  }

  // Note on role-change latency: @supabase/auth-js's admin API has no
  // "revoke all sessions for this user id" call (only signOut(ownJwt) for
  // the caller's own session, or deleteUser). So a role change here is
  // authoritative in user_roles/app_metadata immediately, but the affected
  // user's *existing* access token keeps their old role's claims until it
  // naturally expires (Supabase default: 1 hour) or they sign in again.
  // This is a UX delay, not a security gap: every RLS policy and RPC
  // re-checks the role against user_roles, never trusting the JWT alone.

  return successResponse(updated);
}
