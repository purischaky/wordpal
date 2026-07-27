/**
 * Learning Path form validation logic.
 * Extracted to a pure function for testability via property-based tests.
 */

// ─── Publish Validation Types ────────────────────────────────────────────────

export interface LearningPathPublishUnit {
  id: string;
  title: string;
  lessons: { id: string; title: string }[];
}

export interface LearningPathPublishData {
  id: string;
  title: string;
  units: LearningPathPublishUnit[];
}

export interface LearningPathPublishResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validates whether a Learning Path can be published.
 *
 * Rules:
 * - The path must contain at least one Unit.
 * - At least one Unit must contain at least one Lesson.
 *
 * @returns A result with valid=true if publishable, or valid=false with error messages.
 */
export function validateLearningPathPublish(path: LearningPathPublishData): LearningPathPublishResult {
  const errors: string[] = [];

  if (!path.units || path.units.length === 0) {
    errors.push('Learning path must contain at least one Unit.');
    return { valid: false, errors };
  }

  const unitsWithoutLessons = path.units.filter(
    (unit) => !unit.lessons || unit.lessons.length === 0
  );

  if (unitsWithoutLessons.length === path.units.length) {
    errors.push('At least one Unit must contain at least one Lesson.');
    return { valid: false, errors };
  }

  if (unitsWithoutLessons.length > 0) {
    for (const unit of unitsWithoutLessons) {
      errors.push(`Unit "${unit.title}" has no Lessons.`);
    }
  }

  // If there are warnings but at least one unit has lessons, it's still valid
  // The requirement says: "at least one Unit with at least one Lesson"
  return { valid: true, errors };
}

// ─── Form Validation Types ───────────────────────────────────────────────────

export interface LearningPathFormData {
  title: string;
  description: string;
  targetLevel: string;
  estimatedDuration: string;
  difficulty: string;
  xpReward: string;
}

export interface LearningPathFormErrors {
  title?: string;
  description?: string;
  targetLevel?: string;
  estimatedDuration?: string;
  difficulty?: string;
  xpReward?: string;
}

/**
 * Validates Learning Path form data.
 *
 * Rules:
 * - Title: required, max 150 characters
 * - Description: optional, max 500 characters
 * - Target CEFR Level: required (non-empty)
 * - Estimated Duration: required, positive integer 1-9999
 * - Difficulty: required (non-empty)
 * - XP Reward: required, positive integer 1-10000
 *
 * @returns An object with field-level error messages. Empty object means valid.
 */
export function validateLearningPathForm(data: LearningPathFormData): LearningPathFormErrors {
  const errors: LearningPathFormErrors = {};

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

  // Target CEFR Level: required
  if (!data.targetLevel) {
    errors.targetLevel = 'Please select a target CEFR level.';
  }

  // Estimated Duration: required, positive integer 1-9999
  if (!data.estimatedDuration.trim()) {
    errors.estimatedDuration = 'Estimated duration is required.';
  } else {
    const duration = Number(data.estimatedDuration);
    if (!Number.isInteger(duration) || duration < 1 || duration > 9999) {
      errors.estimatedDuration = 'Duration must be a whole number between 1 and 9999.';
    }
  }

  // Difficulty: required
  if (!data.difficulty) {
    errors.difficulty = 'Please select a difficulty level.';
  }

  // XP Reward: required, positive integer 1-10000
  if (!data.xpReward.trim()) {
    errors.xpReward = 'XP Reward is required.';
  } else {
    const xp = Number(data.xpReward);
    if (!Number.isInteger(xp) || xp < 1 || xp > 10000) {
      errors.xpReward = 'XP Reward must be a whole number between 1 and 10000.';
    }
  }

  return errors;
}
