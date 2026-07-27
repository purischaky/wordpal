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
 *   /admin/ai-studio -> 'ai-studio'
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
    'ai-studio': 'ai-studio',
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

  // If we couldn't determine the section (e.g., /admin/denied), allow through
  // so that denied page and notifications can render
  if (section === null) {
    return { authorized: true, role };
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
 * Fetches the user's role from a Supabase user metadata object.
 * New users default to 'student' role (Req 2.9).
 */
export function getUserRoleFromMetadata(
  userMetadata: Record<string, unknown> | null | undefined,
): string | null {
  if (!userMetadata) return null;
  const role = userMetadata.role as string | undefined;
  return role ?? null;
}
