import type { NextRequest } from 'next/server';
import { successResponse, errorResponse, renameKey } from '@/lib/api/response';
import { requireAdminSection } from '@/lib/api/guard';
import { createSupabaseServerClient } from '@/lib/services/supabase-server';

export const dynamic = 'force-dynamic';

export async function PATCH(
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

  const { unitIds } = body as { unitIds?: unknown };
  if (!Array.isArray(unitIds) || !unitIds.every((u) => typeof u === 'string')) {
    return errorResponse('unitIds must be an array of strings', 400);
  }

  const supabase = await createSupabaseServerClient();

  const { data: units, error: readError } = await supabase
    .from('units')
    .select('id')
    .eq('learning_path_id', id);
  if (readError) return errorResponse('Failed to read units');

  const validIds = new Set((units ?? []).map((u) => u.id));
  const orderedIds = unitIds.filter((unitId) => validIds.has(unitId));

  // Two passes avoid transient collisions with the (learning_path_id, position)
  // unique constraint while reassigning positions in place.
  for (let i = 0; i < orderedIds.length; i++) {
    await supabase
      .from('units')
      .update({ position: -(i + 1) })
      .eq('id', orderedIds[i]);
  }
  for (let i = 0; i < orderedIds.length; i++) {
    await supabase
      .from('units')
      .update({ position: i + 1 })
      .eq('id', orderedIds[i]);
  }

  const { data: reordered, error } = await supabase
    .from('units')
    .select('*')
    .eq('learning_path_id', id)
    .order('position');
  if (error) return errorResponse('Failed to reorder learning path units');

  return successResponse(renameKey(reordered, 'position', 'order'));
}
