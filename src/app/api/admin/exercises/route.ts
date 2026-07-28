import type { NextRequest } from 'next/server';
import { successResponse, errorResponse, validationErrorResponse, renameKey } from '@/lib/api/response';
import { validateExerciseCreate } from '@/lib/api/validators/exercises';
import { requireAdminSection } from '@/lib/api/guard';
import { createSupabaseServerClient } from '@/lib/services/supabase-server';
import type { Database, Json } from '@/types/database';

type ExerciseInsert = Database['public']['Tables']['exercises']['Insert'];

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const guard = await requireAdminSection('exercises');
  if (!guard.ok) return guard.response;

  const lessonId = request.nextUrl.searchParams.get('lessonId');
  const challengeId = request.nextUrl.searchParams.get('challengeId');

  const supabase = await createSupabaseServerClient();
  let query = supabase.from('exercises').select('*');
  if (lessonId) query = query.eq('lesson_id', lessonId);
  if (challengeId) query = query.eq('challenge_id', challengeId);
  const { data, error } = await query.order('lesson_id').order('position');
  if (error) return errorResponse('Failed to read exercises data');

  return successResponse(renameKey(data, 'position', 'order'));
}

export async function POST(request: NextRequest) {
  const guard = await requireAdminSection('exercises');
  if (!guard.ok) return guard.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON in request body', 400);
  }

  const validation = validateExerciseCreate(body);
  if (!validation.valid) {
    return validationErrorResponse('Validation failed', validation.errors);
  }
  const data = body as Record<string, unknown>;

  const insert: ExerciseInsert = {
    lesson_id: (data.lessonId as string) ?? null,
    challenge_id: (data.challengeId as string) ?? null,
    type: data.type as ExerciseInsert['type'],
    position: data.position as number,
    status: (data.status as ExerciseInsert['status']) ?? 'draft',
    hint: (data.hint as string) ?? '',
    tutor_explanation: (data.tutorExplanation as string) ?? '',
    content: data.content as Json,
  };

  const supabase = await createSupabaseServerClient();
  const { data: created, error } = await supabase
    .from('exercises')
    .insert(insert)
    .select()
    .single();

  if (error) {
    // The DB CHECK constraint (exercise_content_is_valid) rejects malformed content.
    if (error.code === '23514') return errorResponse('Exercise content failed shape validation', 400);
    return errorResponse('Failed to create exercise');
  }
  return successResponse(created, 201);
}
