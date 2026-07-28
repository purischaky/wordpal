import type { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api/response';
import { requireAdminSection } from '@/lib/api/guard';
import { createSupabaseServerClient } from '@/lib/services/supabase-server';

export const dynamic = 'force-dynamic';

interface UnitLessons {
  unitId: string;
  lessonIds: string[];
}

/**
 * Reorders lessons within a unit, and/or moves a lesson to a different
 * unit — both are the same operation (assign unit_id + position from the
 * given array order). The caller sends only the unit(s) that actually
 * changed (one for a same-unit reorder, two for a cross-unit move).
 */
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

  const { units } = body as { units?: unknown };
  if (!Array.isArray(units) || units.length === 0) {
    return errorResponse('units must be a non-empty array', 400);
  }
  const parsedUnits: UnitLessons[] = [];
  for (const u of units) {
    if (
      typeof u !== 'object' || u === null ||
      typeof (u as UnitLessons).unitId !== 'string' ||
      !Array.isArray((u as UnitLessons).lessonIds) ||
      !(u as UnitLessons).lessonIds.every((l) => typeof l === 'string')
    ) {
      return errorResponse('Each unit must have unitId and lessonIds', 400);
    }
    parsedUnits.push(u as UnitLessons);
  }

  const supabase = await createSupabaseServerClient();

  // Confirm every referenced unit actually belongs to this learning path.
  const { data: validUnits, error: unitsReadError } = await supabase
    .from('units')
    .select('id')
    .eq('learning_path_id', id)
    .in('id', parsedUnits.map((u) => u.unitId));
  if (unitsReadError) return errorResponse('Failed to read units');
  const validUnitIds = new Set((validUnits ?? []).map((u) => u.id));
  if (parsedUnits.some((u) => !validUnitIds.has(u.unitId))) {
    return errorResponse('One or more units do not belong to this learning path', 400);
  }

  // Two passes per unit avoid transient collisions with the
  // (unit_id, position) unique constraint while reassigning in place.
  for (const unit of parsedUnits) {
    for (let i = 0; i < unit.lessonIds.length; i++) {
      await supabase.from('lessons').update({ position: -(i + 1) }).eq('id', unit.lessonIds[i]);
    }
    for (let i = 0; i < unit.lessonIds.length; i++) {
      await supabase
        .from('lessons')
        .update({ unit_id: unit.unitId, position: i + 1 })
        .eq('id', unit.lessonIds[i]);
    }
  }

  return successResponse({ reordered: true });
}
