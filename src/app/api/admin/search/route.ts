import type { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api/response';
import { requireAdminSection } from '@/lib/api/guard';
import { createSupabaseServerClient } from '@/lib/services/supabase-server';
import type { SearchResult } from '@/lib/api/search-filter';

export const dynamic = 'force-dynamic';

const RESULTS_PER_CATEGORY = 5;

export async function GET(request: NextRequest) {
  const guard = await requireAdminSection('dashboard');
  if (!guard.ok) return guard.response;

  const q = request.nextUrl.searchParams.get('q') ?? '';
  if (q.length < 2) {
    return successResponse([]);
  }

  const supabase = await createSupabaseServerClient();
  const like = `%${q}%`;

  const [paths, lessons, challenges] = await Promise.all([
    supabase.from('learning_paths').select('id, title, target_level').ilike('title', like).limit(RESULTS_PER_CATEGORY),
    supabase.from('lessons').select('id, title, grammar_focus').ilike('title', like).limit(RESULTS_PER_CATEGORY),
    supabase.from('placement_challenges').select('id, title, target_level').ilike('title', like).limit(RESULTS_PER_CATEGORY),
  ]);

  if (paths.error || lessons.error || challenges.error) {
    return errorResponse('Failed to read search data');
  }

  const results: SearchResult[] = [
    ...(paths.data ?? []).map((p) => ({
      id: p.id, title: p.title, subtitle: p.target_level, category: 'learning-paths',
      href: `/admin/learning-paths/${p.id}/edit`,
    })),
    ...(lessons.data ?? []).map((l) => ({
      id: l.id, title: l.title, subtitle: l.grammar_focus, category: 'lessons',
      href: `/admin/lessons/${l.id}/edit`,
    })),
    ...(challenges.data ?? []).map((c) => ({
      id: c.id, title: c.title, subtitle: c.target_level, category: 'challenges',
      href: `/admin/challenges/${c.id}/edit`,
    })),
  ];

  return successResponse(results);
}
