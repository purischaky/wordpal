import type { ValidationResult } from './index';

/**
 * Validates a student update request body.
 * Students can update status and limited profile fields.
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

  if (data.name !== undefined) {
    if (typeof data.name !== 'string') {
      errors.push('name must be a string');
    } else if (data.name.length === 0) {
      errors.push('name must not be empty');
    } else if (data.name.length > 100) {
      errors.push('name must not exceed 100 characters');
    }
  }

  if (data.email !== undefined) {
    if (typeof data.email !== 'string') {
      errors.push('email must be a string');
    } else if (data.email.length === 0) {
      errors.push('email must not be empty');
    }
  }

  return { valid: errors.length === 0, errors };
}
