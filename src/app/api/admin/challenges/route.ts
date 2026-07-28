import type { NextRequest } from 'next/server';
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/api/response';
import { validateChallengeCreate } from '@/lib/api/validators/challenges';
import { requireAdminSection } from '@/lib/api/guard';
import { createSupabaseServerClient } from '@/lib/services/supabase-server';
import type { Database } from '@/types/database';

type ChallengeInsert = Database['public']['Tables']['placement_challenges']['Insert'];

export const dynamic = 'force-dynamic';

export async function GET() {
  const guard = await requireAdminSection('challenges');
  if (!guard.ok) return guard.response;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('admin_placement_challenge_rows')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return errorResponse('Failed to read challenges data');

  return successResponse(data);
}

export async function POST(request: NextRequest) {
  const guard = await requireAdminSection('challenges');
  if (!guard.ok) return guard.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON in request body', 400);
  }

  const validation = validateChallengeCreate(body);
  if (!validation.valid) {
    return validationErrorResponse('Validation failed', validation.errors);
  }
  const data = body as Record<string, unknown>;

  const insert: ChallengeInsert = {
    title: data.title as string,
    description: (data.description as string) ?? '',
    target_level: data.targetLevel as string,
    from_level: (data.fromLevel as ChallengeInsert['from_level']) ?? null,
    to_level: (data.toLevel as ChallengeInsert['to_level']) ?? null,
    grammar_topics: (data.grammarTopics as string[]) ?? [],
    difficulty: (data.difficulty as number) ?? 1,
    required_correct: (data.requiredCorrect as number) ?? 3,
    status: 'draft',
  };

  const supabase = await createSupabaseServerClient();
  const { data: created, error } = await supabase
    .from('placement_challenges')
    .insert(insert)
    .select()
    .single();

  if (error) return errorResponse('Failed to create challenge');
  return successResponse(created, 201);
}
