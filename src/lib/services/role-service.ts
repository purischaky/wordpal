import type { UserRole, AdminSection } from '@/types/admin';
import { ROLE_PERMISSIONS } from '@/types/admin';

/**
 * Role Verification Service (Role_Manager)
 *
 * Provides functions for role checking, permission resolution per admin section,
 * and timeout handling for the admin dashboard access control.
 *
 * Requirements: 2.1, 2.2, 2.3, 2.7, 2.8, 2.9, 2.10
 */

/** Default timeout for role verification operations (5 seconds) */
const ROLE_VERIFICATION_TIMEOUT_MS = 5000;

/** Valid roles recognized by the system */
const VALID_ROLES: readonly UserRole[] = ['admin', 'instructor', 'content_creator', 'student'];

/**
 * Checks whether the given string is a valid UserRole.
 */
export function isValidRole(role: string | null | undefined): role is UserRole {
  if (!role) return false;
  return VALID_ROLES.includes(role as UserRole);
}

/**
 * Returns the full set of permitted AdminSection values for a given role.
 * If the role is invalid or unrecognized, returns an empty array.
 */
export function getPermittedSections(role: UserRole): readonly AdminSection[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

/**
 * Checks whether a specific role has permission to access a given admin section.
 */
export function hasPermission(role: UserRole, section: AdminSection): boolean {
  const permitted = ROLE_PERMISSIONS[role];
  if (!permitted) return false;
  return permitted.includes(section);
}

/**
 * Maps a URL pathname segment to an AdminSection value.
 * Returns null if the path doesn't correspond to a known admin section.
 *
 * Examples:
 *   /admin -> 'dashboard'
 *   /admin/students -> 'students'
 *   /admin/learning-paths/new -> 'learning-paths'
 *   /admin/challenges -> 'challenges'
 */
export function pathToAdminSection(pathname: string): AdminSection | null {
  // Remove trailing slash and normalize
  const normalized = pathname.replace(/\/$/, '');

  // The base /admin route maps to 'dashboard'
  if (normalized === '/admin') {
    return 'dashboard';
  }

  // Extract the first segment after /admin/
  const match = normalized.match(/^\/admin\/([^/]+)/);
  if (!match) return null;

  const segment = match[1];

  // Map URL segments to AdminSection values
  const sectionMap: Record<string, AdminSection> = {
    'students': 'students',
    'learning-paths': 'learning-paths',
    'units': 'units',
    'lessons': 'lessons',
    'exercises': 'exercises',
    'challenges': 'challenges',
    'analytics': 'analytics',
    'achievements': 'achievements',
    'settings': 'settings',
    'profile': 'profile',
  };

  return sectionMap[segment] ?? null;
}

/**
 * Result of a role verification check.
 */
export type RoleCheckResult =
  | { authorized: true; role: UserRole }
  | { authorized: false; reason: 'no_role' | 'invalid_role' | 'student' | 'insufficient_permissions' | 'timeout' };

/**
 * Verifies whether a user's role has access to a specific admin section.
 * Returns a structured result indicating authorization status.
 *
 * Requirements:
 * - 2.1: Supports four distinct roles
 * - 2.3: Student role denied access to all /admin routes
 * - 2.10: No role or unrecognized role denied access
 */
export function checkRoleAccess(
  role: string | null | undefined,
  section: AdminSection | null,
): RoleCheckResult {
  // No role assigned -> deny access (Req 2.10)
  if (!role) {
    return { authorized: false, reason: 'no_role' };
  }

  // Unrecognized role -> deny access (Req 2.10)
  if (!isValidRole(role)) {
    return { authorized: false, reason: 'invalid_role' };
  }

  // Student role -> deny access to all admin routes (Req 2.3)
  if (role === 'student') {
    return { authorized: false, reason: 'student' };
  }

  // Unmapped section (e.g. an unknown /admin/<segment>) -> deny access.
  // The old behavior of allowing these through was a hole: any admin
  // path the sectionMap didn't recognize was reachable by any non-student
  // role, bypassing ROLE_PERMISSIONS entirely. /admin/denied is exempted
  // by the caller (proxy.ts) before this function is ever invoked.
  if (section === null) {
    return { authorized: false, reason: 'insufficient_permissions' };
  }

  // Check section-level permissions
  if (!hasPermission(role, section)) {
    return { authorized: false, reason: 'insufficient_permissions' };
  }

  return { authorized: true, role };
}

/**
 * Wraps an async operation with a 5-second timeout.
 * If the operation takes longer than the timeout, rejects with a timeout error.
 * Used for role verification operations that depend on external services.
 *
 * Requirement 2.8: If role verification service doesn't respond within 5 seconds,
 * deny access and return 503.
 */
export async function withRoleVerificationTimeout<T>(
  operation: Promise<T>,
): Promise<T> {
  return Promise.race([
    operation,
    new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new RoleVerificationTimeoutError());
      }, ROLE_VERIFICATION_TIMEOUT_MS);
    }),
  ]);
}

/**
 * Custom error class for role verification timeout.
 */
export class RoleVerificationTimeoutError extends Error {
  constructor() {
    super('Role verification service did not respond within 5 seconds');
    this.name = 'RoleVerificationTimeoutError';
  }
}

/**
 * Reads the app role from a decoded Supabase JWT's claims.
 *
 * Deliberately reads `app_metadata.role`, NOT `user_metadata.role`:
 * `user_metadata` is writable by the signed-in user via the client SDK
 * (`supabase.auth.updateUser`), so trusting it there would let any
 * student grant themselves 'admin' in one request. `app_metadata` can
 * only be written by service_role — here, exclusively by the
 * `sync_role_to_app_metadata` trigger in supabase/migrations/0001_roles.sql,
 * driven by the `user_roles` table.
 */
export function getRoleFromClaims(
  claims: { app_metadata?: Record<string, unknown> } | null | undefined,
): string | null {
  if (!claims?.app_metadata) return null;
  const role = claims.app_metadata.role as string | undefined;
  return role ?? null;
}

/**
 * Same lookup as getRoleFromClaims, but for callers that already have a
 * plain `app_metadata` object in hand (e.g. `session.user.app_metadata`
 * from supabase-js on the client) rather than a full decoded JWT.
 */
export function getRoleFromAppMetadata(
  appMetadata: Record<string, unknown> | null | undefined,
): string | null {
  if (!appMetadata) return null;
  const role = appMetadata.role as string | undefined;
  return role ?? null;
}
