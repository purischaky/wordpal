import type { NextRequest } from 'next/server';
import { successResponse, errorResponse, validationErrorResponse, renameKey } from '@/lib/api/response';
import { validateLearningPathUpdate } from '@/lib/api/validators/learning-paths';
import { requireAdminSection } from '@/lib/api/guard';
import { createSupabaseServerClient } from '@/lib/services/supabase-server';
import type { Database } from '@/types/database';

export const dynamic = 'force-dynamic';

type LearningPathUpdate = Database['public']['Tables']['learning_paths']['Update'];

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminSection('learning-paths');
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: path, error: pathError } = await supabase
    .from('learning_paths')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (pathError) return errorResponse('Failed to read learning path');
  if (!path) return errorResponse('Learning path not found', 404);

  const { data: units, error: unitsError } = await supabase
    .from('units')
    .select('id, title, description, position')
    .eq('learning_path_id', id)
    .order('position');
  if (unitsError) return errorResponse('Failed to read units');

  const unitIds = (units ?? []).map((u) => u.id);
  const { data: lessons, error: lessonsError } = unitIds.length
    ? await supabase
        .from('lessons')
        .select('id, unit_id, title, status, position')
        .in('unit_id', unitIds)
        .order('position')
    : { data: [], error: null };
  if (lessonsError) return errorResponse('Failed to read lessons');

  const lessonsByUnit = new Map<string, typeof lessons>();
  for (const lesson of lessons ?? []) {
    const list = lessonsByUnit.get(lesson.unit_id) ?? [];
    list.push(lesson);
    lessonsByUnit.set(lesson.unit_id, list);
  }

  const nested = {
    ...path,
    units: (units ?? []).map((unit) => ({
      ...unit,
      lessons: (lessonsByUnit.get(unit.id) ?? []).map(({ unit_id: _unitId, ...lesson }) => lesson),
    })),
  };

  return successResponse(renameKey(nested, 'position', 'order'));
}

function toLearningPathUpdate(data: Record<string, unknown>): LearningPathUpdate {
  const update: LearningPathUpdate = {};
  if (data.title !== undefined) update.title = data.title as string;
  if (data.description !== undefined) update.description = data.description as string;
  if (data.targetLevel !== undefined) update.target_level = data.targetLevel as string;
  if (data.difficulty !== undefined) update.difficulty = data.difficulty as LearningPathUpdate['difficulty'];
  if (data.estimatedDuration !== undefined) update.estimated_duration = data.estimatedDuration as number;
  if (data.xpReward !== undefined) update.xp_reward = data.xpReward as number;
  if (data.status !== undefined) update.status = data.status as LearningPathUpdate['status'];
  return update;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminSection('learning-paths');
  if (!guard.ok) return guard.response;

  const { id } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON in request body', 400);
  }

  const validation = validateLearningPathUpdate(body);
  if (!validation.valid) {
    return validationErrorResponse('Validation failed', validation.errors);
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('learning_paths')
    .update({ ...toLearningPathUpdate(body as Record<string, unknown>), updated_by: guard.session.userId })
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) return errorResponse('Failed to update learning path');
  if (!data) return errorResponse('Learning path not found', 404);
  return successResponse(data);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminSection('learning-paths');
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('learning_paths')
    .delete()
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) return errorResponse('Failed to delete learning path');
  if (!data) return errorResponse('Learning path not found', 404);
  return successResponse({ deleted: id });
}
