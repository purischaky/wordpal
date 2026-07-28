import type { NextRequest } from 'next/server';
import { successResponse, errorResponse, validationErrorResponse, renameKey } from '@/lib/api/response';
import { validateExerciseUpdate } from '@/lib/api/validators/exercises';
import { requireAdminSection } from '@/lib/api/guard';
import { createSupabaseServerClient } from '@/lib/services/supabase-server';
import type { Database, Json } from '@/types/database';

export const dynamic = 'force-dynamic';

type ExerciseUpdate = Database['public']['Tables']['exercises']['Update'];

function toExerciseUpdate(data: Record<string, unknown>): ExerciseUpdate {
  const update: ExerciseUpdate = {};
  if (data.type !== undefined) update.type = data.type as ExerciseUpdate['type'];
  if (data.position !== undefined) update.position = data.position as number;
  if (data.status !== undefined) update.status = data.status as ExerciseUpdate['status'];
  if (data.hint !== undefined) update.hint = data.hint as string;
  if (data.tutorExplanation !== undefined) update.tutor_explanation = data.tutorExplanation as string;
  if (data.content !== undefined) update.content = data.content as Json;
  return update;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminSection('exercises');
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from('exercises').select('*').eq('id', id).maybeSingle();

  if (error) return errorResponse('Failed to read exercise data');
  if (!data) return errorResponse('Exercise not found', 404);
  return successResponse(renameKey(data, 'position', 'order'));
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminSection('exercises');
  if (!guard.ok) return guard.response;

  const { id } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON in request body', 400);
  }

  const validation = validateExerciseUpdate(body);
  if (!validation.valid) {
    return validationErrorResponse('Validation failed', validation.errors);
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('exercises')
    .update(toExerciseUpdate(body as Record<string, unknown>))
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) {
    if (error.code === '23514') return errorResponse('Exercise content failed shape validation', 400);
    return errorResponse('Failed to update exercise');
  }
  if (!data) return errorResponse('Exercise not found', 404);
  return successResponse(data);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminSection('exercises');
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from('exercises').delete().eq('id', id).select().maybeSingle();

  if (error) return errorResponse('Failed to delete exercise');
  if (!data) return errorResponse('Exercise not found', 404);
  return successResponse({ message: 'Exercise deleted' });
}
