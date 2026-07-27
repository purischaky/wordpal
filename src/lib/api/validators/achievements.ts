import type { ValidationResult } from './index';

const VALID_TRIGGER_CRITERIA = [
  'lessons_completed',
  'streak_days',
  'grammar_score',
  'challenge_passed',
  'exercises_completed',
] as const;

/**
 * Validates an achievement creation request body.
 * Required fields: title, triggerCriteria
 * Constraints: title max 100, description max 300
 */
export function validateAchievementCreate(body: unknown): ValidationResult {
  const errors: string[] = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be a JSON object'] };
  }

  const data = body as Record<string, unknown>;

  // title — required, max 100 chars
  if (!data.title || typeof data.title !== 'string') {
    errors.push('title is required and must be a string');
  } else if (data.title.length > 100) {
    errors.push('title must not exceed 100 characters');
  }

  // description — optional, max 300 chars
  if (data.description !== undefined) {
    if (typeof data.description !== 'string') {
      errors.push('description must be a string');
    } else if (data.description.length > 300) {
      errors.push('description must not exceed 300 characters');
    }
  }

  // triggerCriteria — required, must be a valid value
  if (!data.triggerCriteria || typeof data.triggerCriteria !== 'string') {
    errors.push('triggerCriteria is required and must be a string');
  } else if (!VALID_TRIGGER_CRITERIA.includes(data.triggerCriteria as typeof VALID_TRIGGER_CRITERIA[number])) {
    errors.push(`triggerCriteria must be one of: ${VALID_TRIGGER_CRITERIA.join(', ')}`);
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validates an achievement update request body.
 * Same constraints as create but no fields are required (partial update).
 */
export function validateAchievementUpdate(body: unknown): ValidationResult {
  const errors: string[] = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be a JSON object'] };
  }

  const data = body as Record<string, unknown>;

  // title — if present, non-empty, max 100 chars
  if (data.title !== undefined) {
    if (typeof data.title !== 'string') {
      errors.push('title must be a string');
    } else if (data.title.length === 0) {
      errors.push('title must not be empty');
    } else if (data.title.length > 100) {
      errors.push('title must not exceed 100 characters');
    }
  }

  // description — if present, max 300 chars
  if (data.description !== undefined) {
    if (typeof data.description !== 'string') {
      errors.push('description must be a string');
    } else if (data.description.length > 300) {
      errors.push('description must not exceed 300 characters');
    }
  }

  // triggerCriteria — if present, must be valid
  if (data.triggerCriteria !== undefined) {
    if (typeof data.triggerCriteria !== 'string') {
      errors.push('triggerCriteria must be a string');
    } else if (!VALID_TRIGGER_CRITERIA.includes(data.triggerCriteria as typeof VALID_TRIGGER_CRITERIA[number])) {
      errors.push(`triggerCriteria must be one of: ${VALID_TRIGGER_CRITERIA.join(', ')}`);
    }
  }

  return { valid: errors.length === 0, errors };
}
