import type { ValidationResult } from './index';

/**
 * Validates a lesson creation request body.
 * Required fields: title
 * Constraints: title max 150, description max 500, grammarFocus max 100
 */
export function validateLessonCreate(body: unknown): ValidationResult {
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

  // unitId — required, the lesson's parent unit
  if (!data.unitId || typeof data.unitId !== 'string') {
    errors.push('unitId is required and must be a string');
  }

  // position — required, must be a positive integer
  if (typeof data.position !== 'number' || data.position <= 0) {
    errors.push('position is required and must be a positive number');
  }

  // description — optional, max 500 chars
  if (data.description !== undefined) {
    if (typeof data.description !== 'string') {
      errors.push('description must be a string');
    } else if (data.description.length > 500) {
      errors.push('description must not exceed 500 characters');
    }
  }

  // grammarFocus — optional, max 100 chars
  if (data.grammarFocus !== undefined) {
    if (typeof data.grammarFocus !== 'string') {
      errors.push('grammarFocus must be a string');
    } else if (data.grammarFocus.length > 100) {
      errors.push('grammarFocus must not exceed 100 characters');
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validates a lesson update request body.
 * Same constraints as create but no fields are strictly required (partial update).
 */
export function validateLessonUpdate(body: unknown): ValidationResult {
  const errors: string[] = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be a JSON object'] };
  }

  const data = body as Record<string, unknown>;

  // title — if present, non-empty, max 150 chars
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

  // grammarFocus — if present, max 100 chars
  if (data.grammarFocus !== undefined) {
    if (typeof data.grammarFocus !== 'string') {
      errors.push('grammarFocus must be a string');
    } else if (data.grammarFocus.length > 100) {
      errors.push('grammarFocus must not exceed 100 characters');
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validates that a lesson is ready to be published.
 * Requires at least one exercise and all required fields populated.
 */
export function validateLessonPublish(lesson: unknown): ValidationResult {
  const errors: string[] = [];

  if (!lesson || typeof lesson !== 'object') {
    return { valid: false, errors: ['Lesson data must be a valid object'] };
  }

  const data = lesson as Record<string, unknown>;

  // Required fields must be populated
  if (!data.title || typeof data.title !== 'string' || data.title.length === 0) {
    errors.push('title is required for publishing');
  }

  if (!data.description || typeof data.description !== 'string' || data.description.length === 0) {
    errors.push('description is required for publishing');
  }

  if (!data.grammarFocus || typeof data.grammarFocus !== 'string' || data.grammarFocus.length === 0) {
    errors.push('grammarFocus is required for publishing');
  }

  if (!data.cefrLevel || typeof data.cefrLevel !== 'string' || data.cefrLevel.length === 0) {
    errors.push('cefrLevel is required for publishing');
  }

  // Must have at least one exercise
  if (typeof data.exerciseCount !== 'number' || data.exerciseCount < 1) {
    errors.push('lesson must have at least one exercise to be published');
  }

  return { valid: errors.length === 0, errors };
}
