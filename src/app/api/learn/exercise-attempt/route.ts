import type { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api/response';
import { requireUser } from '@/lib/api/guard';
import { createSupabaseServerClient } from '@/lib/services/supabase-server';

export const dynamic = 'force-dynamic';

/**
 * Records one attempt at a lesson exercise. This is the single write path
 * for student progress — all XP, streak, and achievement side effects
 * happen atomically inside the record_exercise_attempt() RPC
 * (supabase/migrations/0006_functions.sql), never in application code.
 */
export async function POST(request: NextRequest) {
  const guard = await requireUser();
  if (!guard.ok) return guard.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON in request body', 400);
  }

  const data = body as { exerciseId?: string; isCorrect?: boolean; incorrectCategories?: string[] };
  if (typeof data.exerciseId !== 'string' || typeof data.isCorrect !== 'boolean') {
    return errorResponse('exerciseId (string) and isCorrect (boolean) are required', 400);
  }

  const supabase = await createSupabaseServerClient();
  const { data: result, error } = await supabase.rpc('record_exercise_attempt', {
    p_exercise_id: data.exerciseId,
    p_is_correct: data.isCorrect,
    p_incorrect_categories: data.incorrectCategories ?? [],
  });

  if (error) {
    if (error.code === 'P0002') return errorResponse('Exercise not found', 404);
    return errorResponse('Failed to record exercise attempt');
  }
  return successResponse(result);
}
