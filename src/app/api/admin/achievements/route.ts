import type { NextRequest } from 'next/server';
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/api/response';
import { validateAchievementCreate } from '@/lib/api/validators/achievements';
import { requireAdminSection } from '@/lib/api/guard';
import { createSupabaseServerClient } from '@/lib/services/supabase-server';
import type { Database } from '@/types/database';

type AchievementInsert = Database['public']['Tables']['achievements']['Insert'];

export const dynamic = 'force-dynamic';

export async function GET() {
  const guard = await requireAdminSection('achievements');
  if (!guard.ok) return guard.response;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return errorResponse('Failed to read achievements data');

  return successResponse(data);
}

export async function POST(request: NextRequest) {
  const guard = await requireAdminSection('achievements');
  if (!guard.ok) return guard.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON in request body', 400);
  }

  const validation = validateAchievementCreate(body);
  if (!validation.valid) {
    return validationErrorResponse('Validation failed', validation.errors);
  }
  const data = body as Record<string, unknown>;

  const insert: AchievementInsert = {
    title: data.title as string,
    description: (data.description as string) ?? '',
    badge_icon: (data.badgeIcon as string) ?? '🏅',
    xp_reward: (data.xpReward as number) ?? 0,
    trigger_criteria: data.triggerCriteria as AchievementInsert['trigger_criteria'],
    threshold_value: data.thresholdValue as number,
  };

  const supabase = await createSupabaseServerClient();
  const { data: created, error } = await supabase
    .from('achievements')
    .insert(insert)
    .select()
    .single();

  if (error) return errorResponse('Failed to create achievement');
  return successResponse(created, 201);
}
