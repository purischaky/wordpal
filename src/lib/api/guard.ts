import type { AdminSection, UserRole } from '@/types/admin';
import { errorResponse } from '@/lib/api/response';
import { createSupabaseServerClient } from '@/lib/services/supabase-server';
import { hasPermission, isValidRole, getRoleFromClaims } from '@/lib/services/role-service';

export interface AdminSession {
  userId: string;
  email: string;
  role: UserRole;
}

export interface UserSession {
  userId: string;
  email: string;
}

export type GuardResult =
  | { ok: true; session: AdminSession }
  | { ok: false; response: Response };

export type UserGuardResult =
  | { ok: true; session: UserSession }
  | { ok: false; response: Response };

/**
 * Authenticates the current request without any role check — for
 * learner-facing routes (e.g. /api/learn/**) where any signed-in user,
 * regardless of role, may act on their own progress.
 */
export async function requireUser(): Promise<UserGuardResult> {
  const claimsResult = await getClaimsOrError();
  if (!claimsResult.ok) return claimsResult;
  return { ok: true, session: { userId: claimsResult.userId, email: claimsResult.email } };
}

/**
 * Authenticates the current request and verifies the caller's role has
 * access to `section`. Every /api/admin/** route handler must call this
 * (or requireAdmin) as its first line — proxy.ts already blocks
 * unauthenticated/unauthorized requests to these paths, but route
 * handlers cannot rely solely on that: this is the "secure" check the
 * Next.js auth guide calls for alongside the proxy's "optimistic" one,
 * and it's what actually enforces access if a handler is ever reached
 * some other way (direct server-to-server call, test, future refactor).
 */
export async function requireAdminSection(section: AdminSection): Promise<GuardResult> {
  const claimsResult = await getClaimsOrError();
  if (!claimsResult.ok) return claimsResult;
  const { userId, email, role } = claimsResult;

  if (!isValidRole(role) || role === 'student' || !hasPermission(role, section)) {
    return { ok: false, response: errorResponse('Insufficient permissions', 403) };
  }

  return { ok: true, session: { userId, email, role } };
}

/** Same as requireAdminSection, but requires the 'admin' role specifically. */
export async function requireAdmin(): Promise<GuardResult> {
  const claimsResult = await getClaimsOrError();
  if (!claimsResult.ok) return claimsResult;
  const { userId, email, role } = claimsResult;

  if (role !== 'admin') {
    return { ok: false, response: errorResponse('Insufficient permissions', 403) };
  }

  return { ok: true, session: { userId, email, role } };
}

type ClaimsResult =
  | { ok: true; userId: string; email: string; role: string | null }
  | { ok: false; response: Response };

async function getClaimsOrError(): Promise<ClaimsResult> {
  let claims: { sub?: string; email?: string; app_metadata?: Record<string, unknown> } | null;
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.getClaims();
    if (error) return { ok: false, response: errorResponse('Authentication service unavailable', 503) };
    claims = data?.claims ?? null;
  } catch {
    return { ok: false, response: errorResponse('Authentication service unavailable', 503) };
  }

  if (!claims?.sub) {
    return { ok: false, response: errorResponse('Authentication required', 401) };
  }

  return {
    ok: true,
    userId: claims.sub,
    email: String(claims.email ?? ''),
    role: getRoleFromClaims(claims),
  };
}
