import type { ValidationResult } from './index';

/**
 * Validates a settings update request body.
 * Scoring constraints:
 * - xpPerExercise: 1–1000
 * - xpPerLesson: 1–10000
 * - weightByExerciseType values sum to 100
 * - passingThreshold: 50–100
 */
export function validateSettingsUpdate(body: unknown): ValidationResult {
  const errors: string[] = [];

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { valid: false, errors: ['Request body must be a JSON object'] };
  }

  const data = body as Record<string, unknown>;

  // Validate scoring section if present
  if (data.scoring !== undefined) {
    if (!data.scoring || typeof data.scoring !== 'object') {
      errors.push('scoring must be an object');
      return { valid: false, errors };
    }

    const scoring = data.scoring as Record<string, unknown>;

    // xpPerExercise: 1–1000
    if (scoring.xpPerExercise !== undefined) {
      if (typeof scoring.xpPerExercise !== 'number' || !Number.isFinite(scoring.xpPerExercise)) {
        errors.push('xpPerExercise must be a number');
      } else if (scoring.xpPerExercise < 1 || scoring.xpPerExercise > 1000) {
        errors.push('xpPerExercise must be between 1 and 1000');
      }
    }

    // xpPerLesson: 1–10000
    if (scoring.xpPerLesson !== undefined) {
      if (typeof scoring.xpPerLesson !== 'number' || !Number.isFinite(scoring.xpPerLesson)) {
        errors.push('xpPerLesson must be a number');
      } else if (scoring.xpPerLesson < 1 || scoring.xpPerLesson > 10000) {
        errors.push('xpPerLesson must be between 1 and 10000');
      }
    }

    // weightByExerciseType: values must sum to 100
    if (scoring.weightByExerciseType !== undefined) {
      if (!scoring.weightByExerciseType || typeof scoring.weightByExerciseType !== 'object') {
        errors.push('weightByExerciseType must be an object');
      } else {
        const weights = scoring.weightByExerciseType as Record<string, unknown>;
        const values = Object.values(weights);

        const allNumbers = values.every((v) => typeof v === 'number' && Number.isFinite(v as number));
        if (!allNumbers) {
          errors.push('all weightByExerciseType values must be numbers');
        } else {
          const sum = values.reduce((acc: number, v) => acc + (v as number), 0);
          if (Math.round(sum) !== 100) {
            errors.push('weightByExerciseType values must sum to 100');
          }
        }
      }
    }

    // passingThreshold: 50–100
    if (scoring.passingThreshold !== undefined) {
      if (typeof scoring.passingThreshold !== 'number' || !Number.isFinite(scoring.passingThreshold)) {
        errors.push('passingThreshold must be a number');
      } else if (scoring.passingThreshold < 50 || scoring.passingThreshold > 100) {
        errors.push('passingThreshold must be between 50 and 100');
      }
    }
  }

  return { valid: errors.length === 0, errors };
}
