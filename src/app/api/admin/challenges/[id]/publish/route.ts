import type { NextRequest } from 'next/server';
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/api/response';
import { validateChallengePublish } from '@/lib/api/validators/challenges';
import { requireAdminSection } from '@/lib/api/guard';
import { createSupabaseServerClient } from '@/lib/services/supabase-server';

export const dynamic = 'force-dynamic';

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminSection('challenges');
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: challenge, error: readError } = await supabase
    .from('placement_challenges')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (readError) return errorResponse('Failed to read challenge');
  if (!challenge) return errorResponse('Challenge not found', 404);

  const { data: questions, error: questionsError } = await supabase
    .from('exercises')
    .select('content')
    .eq('challenge_id', id);
  if (questionsError) return errorResponse('Failed to read challenge questions');

  const validation = validateChallengePublish({ questions: questions ?? [] });
  if (!validation.valid) {
    return validationErrorResponse('Validation failed', validation.errors);
  }

  const { data: updated, error } = await supabase
    .from('placement_challenges')
    .update({ status: 'published' })
    .eq('id', id)
    .select()
    .single();

  if (error) return errorResponse('Failed to publish challenge');
  return successResponse(updated);
}
