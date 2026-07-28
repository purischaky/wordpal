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

  // content — required, must be an object (shape is further enforced by a DB check)
  if (!data.content || typeof data.content !== 'object') {
    errors.push('content is required and must be an object');
  }

  // position — required, positive integer
  if (typeof data.position !== 'number' || data.position <= 0) {
    errors.push('position is required and must be a positive number');
  }

  // exactly one of lessonId / challengeId must be present
  const hasLesson = typeof data.lessonId === 'string' && data.lessonId.length > 0;
  const hasChallenge = typeof data.challengeId === 'string' && data.challengeId.length > 0;
  if (hasLesson === hasChallenge) {
    errors.push('exactly one of lessonId or challengeId is required');
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
