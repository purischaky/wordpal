import type { NextRequest } from 'next/server';
import { successResponse, errorResponse, validationErrorResponse, renameKey } from '@/lib/api/response';
import { validateLessonUpdate } from '@/lib/api/validators/lessons';
import { requireAdminSection } from '@/lib/api/guard';
import { createSupabaseServerClient } from '@/lib/services/supabase-server';
import type { Database } from '@/types/database';

export const dynamic = 'force-dynamic';

type LessonUpdate = Database['public']['Tables']['lessons']['Update'];

/** Explicit allowlist — replaces the old {...existing, ...body} mass-assignment. */
function toLessonUpdate(data: Record<string, unknown>): LessonUpdate {
  const update: LessonUpdate = {};
  if (data.title !== undefined) update.title = data.title as string;
  if (data.description !== undefined) update.description = data.description as string;
  if (data.grammarFocus !== undefined) update.grammar_focus = data.grammarFocus as string;
  if (data.cefrLevel !== undefined) update.cefr_level = data.cefrLevel as string;
  if (data.pathLevel !== undefined) update.path_level = data.pathLevel as LessonUpdate['path_level'];
  if (data.icon !== undefined) update.icon = data.icon as string;
  if (data.difficulty !== undefined) update.difficulty = data.difficulty as number;
  if (data.estimatedDuration !== undefined) update.estimated_duration = data.estimatedDuration as number;
  if (data.learningObjectives !== undefined) update.learning_objectives = data.learningObjectives as string[];
  if (data.position !== undefined) update.position = data.position as number;
  if (data.unitId !== undefined) update.unit_id = data.unitId as string;
  // status is intentionally excluded: publish/unpublish goes through the
  // dedicated /publish route, which re-validates readiness first.
  return update;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminSection('lessons');
  if (!guard.ok) return guard.response;

  const { id } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON in request body', 400);
  }

  const validation = validateLessonUpdate(body);
  if (!validation.valid) {
    return validationErrorResponse('Validation failed', validation.errors);
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('lessons')
    .update(toLessonUpdate(body as Record<string, unknown>))
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) return errorResponse('Failed to update lesson');
  if (!data) return errorResponse('Lesson not found', 404);
  return successResponse(renameKey(data, 'position', 'order'));
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminSection('lessons');
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from('lessons').delete().eq('id', id).select().maybeSingle();

  if (error) return errorResponse('Failed to delete lesson');
  if (!data) return errorResponse('Lesson not found', 404);
  return successResponse({ message: 'Lesson deleted' });
}
