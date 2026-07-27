/**
 * Lesson operation utilities: duplicate and publish validation.
 * Extracted to pure functions for testability via property-based tests.
 */

/**
 * Generates a duplicated lesson title by prepending "Copy of " to the original.
 * Truncates the total to 150 characters if the result would exceed that limit.
 *
 * @param title - The original lesson title
 * @returns The new title for the duplicated lesson
 *
 * Validates: Requirements 7.4
 */
export function duplicateLessonTitle(title: string): string {
  const prefix = 'Copy of ';
  const combined = prefix + title;
  if (combined.length > 150) {
    return combined.slice(0, 150);
  }
  return combined;
}

/**
 * Data required for lesson publish validation.
 */
export interface LessonPublishData {
  title: string;
  cefrLevel: string;
  difficulty: string;
  estimatedDuration: string;
  exerciseCount: number;
}

/**
 * Result of lesson publish validation.
 */
export interface LessonPublishResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validates whether a lesson can be published.
 *
 * Rules:
 * - The lesson must have at least 1 exercise.
 * - Title must be non-empty.
 * - CEFR Level must be non-empty.
 * - Difficulty must be non-empty.
 * - Estimated Duration must be non-empty.
 *
 * @returns A result with valid=true if publishable, or valid=false with error messages.
 *
 * Validates: Requirements 7.5
 */
export function validateLessonPublish(data: LessonPublishData): LessonPublishResult {
  const errors: string[] = [];

  if (!data.title || !data.title.trim()) {
    errors.push('Title is required.');
  }

  if (!data.cefrLevel || !data.cefrLevel.trim()) {
    errors.push('CEFR Level is required.');
  }

  if (!data.difficulty || !data.difficulty.trim()) {
    errors.push('Difficulty is required.');
  }

  if (!data.estimatedDuration || !data.estimatedDuration.trim()) {
    errors.push('Estimated Duration is required.');
  }

  if (data.exerciseCount < 1) {
    errors.push('Lesson must have at least one exercise.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
