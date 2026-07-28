import type { ValidationResult } from './index';

const VALID_ROLES = ['admin', 'instructor', 'content_creator', 'student'];
const VALID_CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

/**
 * Validates a student update request body. Mirrors the allowlist enforced
 * by the admin_update_student() RPC (supabase/migrations/0006_functions.sql):
 * status, cefrLevel, displayName, and (admin-only) role.
 */
export function validateStudentUpdate(body: unknown): ValidationResult {
  const errors: string[] = [];

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { valid: false, errors: ['Request body must be a JSON object'] };
  }

  const data = body as Record<string, unknown>;

  if (data.status !== undefined) {
    if (typeof data.status !== 'string' || !['active', 'inactive', 'suspended'].includes(data.status)) {
      errors.push('status must be one of: active, inactive, suspended');
    }
  }

  if (data.cefrLevel !== undefined) {
    if (typeof data.cefrLevel !== 'string' || !VALID_CEFR_LEVELS.includes(data.cefrLevel)) {
      errors.push(`cefrLevel must be one of: ${VALID_CEFR_LEVELS.join(', ')}`);
    }
  }

  if (data.displayName !== undefined) {
    if (typeof data.displayName !== 'string') {
      errors.push('displayName must be a string');
    } else if (data.displayName.length === 0) {
      errors.push('displayName must not be empty');
    } else if (data.displayName.length > 100) {
      errors.push('displayName must not exceed 100 characters');
    }
  }

  if (data.role !== undefined) {
    if (typeof data.role !== 'string' || !VALID_ROLES.includes(data.role)) {
      errors.push(`role must be one of: ${VALID_ROLES.join(', ')}`);
    }
  }

  return { valid: errors.length === 0, errors };
}
