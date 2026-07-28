import { cache } from 'react';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/services/supabase-server';
import { getRoleFromClaims, isValidRole } from '@/lib/services/role-service';
import type { AdminUser, UserRole } from '@/types/admin';

export interface AppSession {
  userId: string;
  email: string;
  role: UserRole | null;
}

/**
 * Resolves the current session once per request (React `cache()` dedupes
 * repeated calls across server components in the same render pass).
 * Returns null when there's no authenticated user — callers decide
 * whether that's an error (redirect) or an expected state (render a
 * logged-out view).
 */
export const getSession = cache(async (): Promise<AppSession | null> => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims?.sub) return null;

  const { claims } = data;
  const role = getRoleFromClaims(claims);

  return {
    userId: claims.sub,
    email: String(claims.email ?? ''),
    role: isValidRole(role) ? role : null,
  };
});

/**
 * For server components under (admin)/admin/**: redirects to sign-in if
 * there's no session at all. Does NOT check section-level permissions —
 * proxy.ts already redirected unauthorized roles to /admin/denied before
 * this ever renders, so reaching here with a resolved session is enough
 * to build the admin shell (nav, avatar, etc).
 */
export const requireAdminUser = cache(async (): Promise<AdminUser> => {
  const session = await getSession();
  if (!session) redirect('/auth/signin?redirect=/admin');

  const supabase = await createSupabaseServerClient();
  const { data: row } = await supabase
    .from('admin_student_rows')
    .select('*')
    .eq('id', session.userId)
    .maybeSingle();

  return {
    id: session.userId,
    email: session.email,
    displayName: row?.name ?? session.email.split('@')[0],
    role: session.role ?? 'student',
    avatarUrl: row?.avatar_url ?? null,
    cefrLevel: (row?.cefr_level as AdminUser['cefrLevel']) ?? 'A1',
    status: row?.status ?? 'active',
    currentLessonId: null,
    currentLearningPathId: null,
    grammarScore: row?.grammar_score ?? 0,
    progressPercentage: row?.progress_percentage ?? 0,
    joinedAt: new Date().toISOString(),
    lastActiveAt: row?.last_active_at ?? new Date().toISOString(),
  };
});
