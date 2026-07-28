import type { NextRequest } from 'next/server';
import { successResponse, errorResponse, validationErrorResponse, renameKey } from '@/lib/api/response';
import { validateLessonCreate } from '@/lib/api/validators/lessons';
import { requireAdminSection } from '@/lib/api/guard';
import { createSupabaseServerClient } from '@/lib/services/supabase-server';
import type { Database } from '@/types/database';

type LessonInsert = Database['public']['Tables']['lessons']['Insert'];

export const dynamic = 'force-dynamic';

export async function GET() {
  const guard = await requireAdminSection('lessons');
  if (!guard.ok) return guard.response;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('admin_lesson_rows')
    .select('*')
    .order('unit_id')
    .order('position');
  if (error) return errorResponse('Failed to read lessons data');

  return successResponse(renameKey(data, 'position', 'order'));
}

export async function POST(request: NextRequest) {
  const guard = await requireAdminSection('lessons');
  if (!guard.ok) return guard.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON in request body', 400);
  }

  const validation = validateLessonCreate(body);
  if (!validation.valid) {
    return validationErrorResponse('Validation failed', validation.errors);
  }
  const data = body as Record<string, unknown>;

  const insert: LessonInsert = {
    unit_id: data.unitId as string,
    title: data.title as string,
    description: (data.description as string) ?? '',
    grammar_focus: (data.grammarFocus as string) ?? '',
    cefr_level: (data.cefrLevel as string) ?? 'A1',
    path_level: (data.pathLevel as LessonInsert['path_level']) ?? 'beginner',
    icon: (data.icon as string) ?? '📘',
    difficulty: (data.difficulty as number) ?? 1,
    estimated_duration: (data.estimatedDuration as number) ?? 0,
    learning_objectives: (data.learningObjectives as string[]) ?? [],
    status: (data.status as LessonInsert['status']) ?? 'draft',
    position: data.position as number,
  };

  const supabase = await createSupabaseServerClient();
  const { data: created, error } = await supabase
    .from('lessons')
    .insert(insert)
    .select()
    .single();

  if (error) return errorResponse('Failed to create lesson');
  return successResponse(created, 201);
}
