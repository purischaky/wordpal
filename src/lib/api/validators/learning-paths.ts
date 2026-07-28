import type { ValidationResult } from './index';

/**
 * Validates a learning path creation request body.
 * Required fields: title
 * Constraints: title max 150, description max 500, estimatedDuration 1–9999
 */
export function validateLearningPathCreate(body: unknown): ValidationResult {
  const errors: string[] = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be a JSON object'] };
  }

  const data = body as Record<string, unknown>;

  // title — required, max 150 chars
  if (!data.title || typeof data.title !== 'string') {
    errors.push('title is required and must be a string');
  } else if (data.title.length > 150) {
    errors.push('title must not exceed 150 characters');
  }

  // targetLevel — required CEFR level
  const cefrLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  if (!data.targetLevel || !cefrLevels.includes(data.targetLevel as string)) {
    errors.push('targetLevel is required and must be one of A1, A2, B1, B2, C1, C2');
  }

  // description — optional, max 500 chars
  if (data.description !== undefined) {
    if (typeof data.description !== 'string') {
      errors.push('description must be a string');
    } else if (data.description.length > 500) {
      errors.push('description must not exceed 500 characters');
    }
  }

  // estimatedDuration — optional on create, but if present must be 1–9999
  if (data.estimatedDuration !== undefined) {
    if (typeof data.estimatedDuration !== 'number' || !Number.isFinite(data.estimatedDuration)) {
      errors.push('estimatedDuration must be a number');
    } else if (data.estimatedDuration < 1 || data.estimatedDuration > 9999) {
      errors.push('estimatedDuration must be between 1 and 9999');
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validates a learning path update request body.
 * Same constraints as create but no fields are strictly required (partial update).
 */
export function validateLearningPathUpdate(body: unknown): ValidationResult {
  const errors: string[] = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be a JSON object'] };
  }

  const data = body as Record<string, unknown>;

  // title — if present, must be a non-empty string, max 150 chars
  if (data.title !== undefined) {
    if (typeof data.title !== 'string') {
      errors.push('title must be a string');
    } else if (data.title.length === 0) {
      errors.push('title must not be empty');
    } else if (data.title.length > 150) {
      errors.push('title must not exceed 150 characters');
    }
  }

  // description — if present, max 500 chars
  if (data.description !== undefined) {
    if (typeof data.description !== 'string') {
      errors.push('description must be a string');
    } else if (data.description.length > 500) {
      errors.push('description must not exceed 500 characters');
    }
  }

  // estimatedDuration — if present, 1–9999
  if (data.estimatedDuration !== undefined) {
    if (typeof data.estimatedDuration !== 'number' || !Number.isFinite(data.estimatedDuration)) {
      errors.push('estimatedDuration must be a number');
    } else if (data.estimatedDuration < 1 || data.estimatedDuration > 9999) {
      errors.push('estimatedDuration must be between 1 and 9999');
    }
  }

  return { valid: errors.length === 0, errors };
}
