/**
 * Lesson form validation logic.
 * Extracted to a pure function for testability via property-based tests.
 */

export interface LessonFormData {
  title: string;
  description: string;
  grammarFocus: string;
  cefrLevel: string;
  difficulty: string;
  estimatedDuration: string;
  learningObjectives: string[];
}

export interface LessonFormErrors {
  title?: string;
  description?: string;
  grammarFocus?: string;
  cefrLevel?: string;
  difficulty?: string;
  estimatedDuration?: string;
  learningObjectives?: string;
  learningObjectiveItems?: Record<number, string>;
}

/**
 * Validates Lesson form data.
 *
 * Rules:
 * - Title: required, max 150 characters
 * - Description: optional, max 500 characters
 * - Grammar Focus: optional, max 100 characters
 * - CEFR Level: required (non-empty, one of A1-C2)
 * - Difficulty: required (1-5)
 * - Estimated Duration: required, positive integer, max 180
 * - Learning Objectives: max 10 items, each max 200 characters
 *
 * @returns An object with field-level error messages. Empty object means valid.
 */
export function validateLessonForm(data: LessonFormData): LessonFormErrors {
  const errors: LessonFormErrors = {};

  // Title: required, max 150 chars
  if (!data.title.trim()) {
    errors.title = 'Title is required.';
  } else if (data.title.length > 150) {
    errors.title = 'Title must be 150 characters or fewer.';
  }

  // Description: optional, max 500 chars
  if (data.description.length > 500) {
    errors.description = 'Description must be 500 characters or fewer.';
  }

  // Grammar Focus: optional, max 100 chars
  if (data.grammarFocus.length > 100) {
    errors.grammarFocus = 'Grammar Focus must be 100 characters or fewer.';
  }

  // CEFR Level: required
  const validLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  if (!data.cefrLevel) {
    errors.cefrLevel = 'Please select a CEFR level.';
  } else if (!validLevels.includes(data.cefrLevel)) {
    errors.cefrLevel = 'Invalid CEFR level selected.';
  }

  // Difficulty: required, integer 1-5
  if (!data.difficulty) {
    errors.difficulty = 'Please select a difficulty level.';
  } else {
    const diff = Number(data.difficulty);
    if (!Number.isInteger(diff) || diff < 1 || diff > 5) {
      errors.difficulty = 'Difficulty must be between 1 and 5.';
    }
  }

  // Estimated Duration: required, positive integer, max 180
  if (!data.estimatedDuration.trim()) {
    errors.estimatedDuration = 'Estimated duration is required.';
  } else {
    const duration = Number(data.estimatedDuration);
    if (!Number.isInteger(duration) || duration < 1 || duration > 180) {
      errors.estimatedDuration = 'Duration must be a whole number between 1 and 180.';
    }
  }

  // Learning Objectives: max 10 items, each max 200 chars
  if (data.learningObjectives.length > 10) {
    errors.learningObjectives = 'Maximum 10 learning objectives allowed.';
  }

  const itemErrors: Record<number, string> = {};
  data.learningObjectives.forEach((obj, index) => {
    if (obj.length > 200) {
      itemErrors[index] = 'Each objective must be 200 characters or fewer.';
    }
  });
  if (Object.keys(itemErrors).length > 0) {
    errors.learningObjectiveItems = itemErrors;
  }

  return errors;
}
