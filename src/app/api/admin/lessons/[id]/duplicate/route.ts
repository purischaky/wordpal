import type { NextRequest } from 'next/server';
import { successResponse, errorResponse, renameKey } from '@/lib/api/response';
import { requireAdminSection } from '@/lib/api/guard';
import { createSupabaseServerClient } from '@/lib/services/supabase-server';

export const dynamic = 'force-dynamic';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminSection('lessons');
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: original, error: readError } = await supabase
    .from('lessons')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (readError) return errorResponse('Failed to read lesson');
  if (!original) return errorResponse('Lesson not found', 404);

  const { data: maxPositionRow } = await supabase
    .from('lessons')
    .select('position')
    .eq('unit_id', original.unit_id)
    .order('position', { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: duplicated, error } = await supabase
    .from('lessons')
    .insert({
      unit_id: original.unit_id,
      title: `Copy of ${original.title}`,
      description: original.description,
      grammar_focus: original.grammar_focus,
      cefr_level: original.cefr_level,
      path_level: original.path_level,
      icon: original.icon,
      difficulty: original.difficulty,
      estimated_duration: original.estimated_duration,
      learning_objectives: original.learning_objectives,
      status: 'draft',
      position: (maxPositionRow?.position ?? 0) + 1,
    })
    .select()
    .single();

  if (error) return errorResponse('Failed to duplicate lesson');
  return successResponse(renameKey(duplicated, 'position', 'order'), 201);
}
