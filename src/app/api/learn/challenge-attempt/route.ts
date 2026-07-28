import type { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api/response';
import { requireUser } from '@/lib/api/guard';
import { createSupabaseServerClient } from '@/lib/services/supabase-server';

export const dynamic = 'force-dynamic';

/**
 * Records the result of a completed placement challenge attempt. The
 * pass/fail decision, idempotency (only one passed attempt kept per user
 * per challenge), and required_correct comparison all happen inside
 * record_challenge_attempt() (0006_functions.sql) — this endpoint only
 * forwards the caller's own reported score under their authenticated id.
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

  const data = body as { challengeId?: string; correctCount?: number; totalCount?: number };
  if (
    typeof data.challengeId !== 'string' ||
    typeof data.correctCount !== 'number' ||
    typeof data.totalCount !== 'number'
  ) {
    return errorResponse('challengeId (string), correctCount and totalCount (numbers) are required', 400);
  }

  const supabase = await createSupabaseServerClient();
  const { data: result, error } = await supabase.rpc('record_challenge_attempt', {
    p_challenge_id: data.challengeId,
    p_correct_count: data.correctCount,
    p_total_count: data.totalCount,
  });

  if (error) {
    if (error.code === 'P0002') return errorResponse('Challenge not found', 404);
    if (error.code === '22023') return errorResponse('Invalid attempt counts', 400);
    return errorResponse('Failed to record challenge attempt');
  }
  return successResponse(result);
}
