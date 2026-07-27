import type { ValidationResult } from './index';

const VALID_EXERCISE_TYPES = [
  'drag-and-drop',
  'multiple-choice',
  'sentence-ordering',
  'fill-in-blank',
  'rewrite-sentence',
  'free-writing',
] as const;

/**
 * Validates an exercise creation request body.
 * Required fields: type (must be a valid ExerciseType)
 */
export function validateExerciseCreate(body: unknown): ValidationResult {
  const errors: string[] = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be a JSON object'] };
  }

  const data = body as Record<string, unknown>;

  // type — required, must be a valid ExerciseType
  if (!data.type || typeof data.type !== 'string') {
    errors.push('type is required and must be a string');
  } else if (!VALID_EXERCISE_TYPES.includes(data.type as typeof VALID_EXERCISE_TYPES[number])) {
    errors.push(`type must be one of: ${VALID_EXERCISE_TYPES.join(', ')}`);
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validates an exercise update request body.
 * If type is provided, must be a valid ExerciseType.
 */
export function validateExerciseUpdate(body: unknown): ValidationResult {
  const errors: string[] = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be a JSON object'] };
  }

  const data = body as Record<string, unknown>;

  // type — if present, must be a valid ExerciseType
  if (data.type !== undefined) {
    if (typeof data.type !== 'string') {
      errors.push('type must be a string');
    } else if (!VALID_EXERCISE_TYPES.includes(data.type as typeof VALID_EXERCISE_TYPES[number])) {
      errors.push(`type must be one of: ${VALID_EXERCISE_TYPES.join(', ')}`);
    }
  }

  return { valid: errors.length === 0, errors };
}
