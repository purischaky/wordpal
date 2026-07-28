import type { NextRequest } from 'next/server';
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/api/response';
import { validateAchievementUpdate } from '@/lib/api/validators/achievements';
import { requireAdminSection } from '@/lib/api/guard';
import { createSupabaseServerClient } from '@/lib/services/supabase-server';
import type { Database } from '@/types/database';

export const dynamic = 'force-dynamic';

type AchievementUpdate = Database['public']['Tables']['achievements']['Update'];

function toAchievementUpdate(data: Record<string, unknown>): AchievementUpdate {
  const update: AchievementUpdate = {};
  if (data.title !== undefined) update.title = data.title as string;
  if (data.description !== undefined) update.description = data.description as string;
  if (data.badgeIcon !== undefined) update.badge_icon = data.badgeIcon as string;
  if (data.xpReward !== undefined) update.xp_reward = data.xpReward as number;
  if (data.triggerCriteria !== undefined) update.trigger_criteria = data.triggerCriteria as AchievementUpdate['trigger_criteria'];
  if (data.thresholdValue !== undefined) update.threshold_value = data.thresholdValue as number;
  if (data.isActive !== undefined) update.is_active = data.isActive as boolean;
  return update;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminSection('achievements');
  if (!guard.ok) return guard.response;

  const { id } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON in request body', 400);
  }

  const validation = validateAchievementUpdate(body);
  if (!validation.valid) {
    return validationErrorResponse('Validation failed', validation.errors);
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('achievements')
    .update(toAchievementUpdate(body as Record<string, unknown>))
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) return errorResponse('Failed to update achievement');
  if (!data) return errorResponse('Achievement not found', 404);
  return successResponse(data);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminSection('achievements');
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('achievements')
    .delete()
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) return errorResponse('Failed to delete achievement');
  if (!data) return errorResponse('Achievement not found', 404);
  return successResponse({ deleted: id });
}
