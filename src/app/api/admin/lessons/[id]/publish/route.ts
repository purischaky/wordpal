import type { NextRequest } from 'next/server';
import { successResponse, errorResponse, validationErrorResponse, renameKey } from '@/lib/api/response';
import { validateLessonPublish } from '@/lib/api/validators/lessons';
import { requireAdminSection } from '@/lib/api/guard';
import { createSupabaseServerClient } from '@/lib/services/supabase-server';

export const dynamic = 'force-dynamic';

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminSection('lessons');
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: lesson, error: readError } = await supabase
    .from('admin_lesson_rows')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (readError) return errorResponse('Failed to read lesson');
  if (!lesson) return errorResponse('Lesson not found', 404);

  const validation = validateLessonPublish({
    title: lesson.title,
    description: lesson.description,
    grammarFocus: lesson.grammar_focus,
    cefrLevel: lesson.cefr_level,
    exerciseCount: lesson.exercise_count,
  });
  if (!validation.valid) {
    return validationErrorResponse('Validation failed', validation.errors);
  }

  const { data: updated, error } = await supabase
    .from('lessons')
    .update({ status: 'published' })
    .eq('id', id)
    .select()
    .single();

  if (error) return errorResponse('Failed to publish lesson');
  return successResponse(renameKey(updated, 'position', 'order'));
}
