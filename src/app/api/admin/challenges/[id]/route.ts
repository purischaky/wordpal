import type { NextRequest } from 'next/server';
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/api/response';
import { validateChallengeUpdate } from '@/lib/api/validators/challenges';
import { requireAdminSection } from '@/lib/api/guard';
import { createSupabaseServerClient } from '@/lib/services/supabase-server';
import type { Database } from '@/types/database';

export const dynamic = 'force-dynamic';

type ChallengeUpdate = Database['public']['Tables']['placement_challenges']['Update'];

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminSection('challenges');
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  // admin_placement_challenge_rows (not the base table) so questionCount
  // is populated the same way it is on the list page.
  const { data, error } = await supabase
    .from('admin_placement_challenge_rows')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) return errorResponse('Failed to read challenge');
  if (!data) return errorResponse('Challenge not found', 404);
  return successResponse(data);
}

function toChallengeUpdate(data: Record<string, unknown>): ChallengeUpdate {
  const update: ChallengeUpdate = {};
  if (data.title !== undefined) update.title = data.title as string;
  if (data.description !== undefined) update.description = data.description as string;
  if (data.targetLevel !== undefined) update.target_level = data.targetLevel as string;
  if (data.fromLevel !== undefined) update.from_level = data.fromLevel as ChallengeUpdate['from_level'];
  if (data.toLevel !== undefined) update.to_level = data.toLevel as ChallengeUpdate['to_level'];
  if (data.grammarTopics !== undefined) update.grammar_topics = data.grammarTopics as string[];
  if (data.difficulty !== undefined) update.difficulty = data.difficulty as number;
  if (data.requiredCorrect !== undefined) update.required_correct = data.requiredCorrect as number;
  return update;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminSection('challenges');
  if (!guard.ok) return guard.response;

  const { id } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON in request body', 400);
  }

  const validation = validateChallengeUpdate(body);
  if (!validation.valid) {
    return validationErrorResponse('Validation failed', validation.errors);
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('placement_challenges')
    .update(toChallengeUpdate(body as Record<string, unknown>))
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) return errorResponse('Failed to update challenge');
  if (!data) return errorResponse('Challenge not found', 404);
  return successResponse(data);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminSection('challenges');
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('placement_challenges')
    .delete()
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) return errorResponse('Failed to delete challenge');
  if (!data) return errorResponse('Challenge not found', 404);
  return successResponse({ deleted: id });
}
