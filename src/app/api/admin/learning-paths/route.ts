import type { NextRequest } from 'next/server';
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/api/response';
import { validateLearningPathCreate } from '@/lib/api/validators/learning-paths';
import { requireAdminSection } from '@/lib/api/guard';
import { createSupabaseServerClient } from '@/lib/services/supabase-server';
import type { Database } from '@/types/database';

type LearningPathInsert = Database['public']['Tables']['learning_paths']['Insert'];

export const dynamic = 'force-dynamic';

export async function GET() {
  const guard = await requireAdminSection('learning-paths');
  if (!guard.ok) return guard.response;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('admin_learning_path_rows')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return errorResponse('Failed to read learning paths data');

  return successResponse(data);
}

export async function POST(request: NextRequest) {
  const guard = await requireAdminSection('learning-paths');
  if (!guard.ok) return guard.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON in request body', 400);
  }

  const validation = validateLearningPathCreate(body);
  if (!validation.valid) {
    return validationErrorResponse('Validation failed', validation.errors);
  }
  const data = body as Record<string, unknown>;

  const insert: LearningPathInsert = {
    title: data.title as string,
    description: (data.description as string) ?? '',
    target_level: data.targetLevel as string,
    difficulty: (data.difficulty as LearningPathInsert['difficulty']) ?? 'Beginner',
    estimated_duration: (data.estimatedDuration as number) ?? 0,
    xp_reward: (data.xpReward as number) ?? 0,
    status: (data.status as LearningPathInsert['status']) ?? 'draft',
    created_by: guard.session.userId,
  };

  const supabase = await createSupabaseServerClient();
  const { data: created, error } = await supabase
    .from('learning_paths')
    .insert(insert)
    .select()
    .single();

  if (error) return errorResponse('Failed to create learning path');
  return successResponse(created, 201);
}
