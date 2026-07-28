import type { NextRequest } from 'next/server';
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/api/response';
import { validateSettingsUpdate } from '@/lib/api/validators/settings';
import { requireAdmin, requireAdminSection } from '@/lib/api/guard';
import { createSupabaseServerClient } from '@/lib/services/supabase-server';
import type { Database, Json } from '@/types/database';

type SettingsUpdate = Database['public']['Tables']['platform_settings']['Update'];

export const dynamic = 'force-dynamic';

export async function GET() {
  const guard = await requireAdminSection('settings');
  if (!guard.ok) return guard.response;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('platform_settings')
    .select('brand, scoring, notifications')
    .eq('id', 1)
    .single();

  if (error) return errorResponse('Failed to read settings data');
  return successResponse(data);
}

export async function PUT(request: NextRequest) {
  // Only 'admin' — settings is excluded from instructor/content_creator
  // permissions in ROLE_PERMISSIONS, so this mirrors that at the RPC layer.
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON in request body', 400);
  }

  const validation = validateSettingsUpdate(body);
  if (!validation.valid) {
    return validationErrorResponse('Validation failed', validation.errors);
  }
  const data = body as Record<string, unknown>;

  const update: SettingsUpdate = { updated_by: guard.session.userId };
  if (data.brand !== undefined) update.brand = data.brand as Json;
  if (data.scoring !== undefined) update.scoring = data.scoring as Json;
  if (data.notifications !== undefined) update.notifications = data.notifications as Json;

  const supabase = await createSupabaseServerClient();
  const { data: updated, error } = await supabase
    .from('platform_settings')
    .update(update)
    .eq('id', 1)
    .select('brand, scoring, notifications')
    .single();

  if (error) return errorResponse('Failed to update settings data');
  return successResponse(updated);
}
