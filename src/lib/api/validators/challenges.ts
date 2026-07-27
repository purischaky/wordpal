import type { ValidationResult } from './index';

/**
 * Validates a challenge creation request body.
 * Required fields: title
 * Constraints: title max 150
 */
export function validateChallengeCreate(body: unknown): ValidationResult {
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

  return { valid: errors.length === 0, errors };
}

/**
 * Validates a challenge update request body.
 * Same constraints as create but no fields are required (partial update).
 */
export function validateChallengeUpdate(body: unknown): ValidationResult {
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

  return { valid: errors.length === 0, errors };
}

/**
 * Validates that a challenge is ready to be published.
 * Requires minimum number of questions and all questions must have a correct answer.
 * The minimum question count defaults to 5 (matching AdminPlacementChallenge.questionCount range 5-50).
 */
export function validateChallengePublish(challenge: unknown): ValidationResult {
  const errors: string[] = [];
  const MIN_QUESTIONS = 5;

  if (!challenge || typeof challenge !== 'object') {
    return { valid: false, errors: ['Challenge data must be a valid object'] };
  }

  const data = challenge as Record<string, unknown>;

  // Must have a questions array
  if (!Array.isArray(data.questions)) {
    errors.push('challenge must have a questions array');
    return { valid: false, errors };
  }

  // Must have minimum number of questions
  if (data.questions.length < MIN_QUESTIONS) {
    errors.push(`challenge must have at least ${MIN_QUESTIONS} questions`);
  }

  // Every question must have a correct answer (check content for correctIndex or acceptableAnswers)
  for (let i = 0; i < data.questions.length; i++) {
    const question = data.questions[i] as Record<string, unknown>;
    if (!question || typeof question !== 'object') {
      errors.push(`question at index ${i} is invalid`);
      continue;
    }

    const content = question.content as Record<string, unknown> | undefined;
    if (!content || typeof content !== 'object') {
      errors.push(`question at index ${i} is missing content`);
      continue;
    }

    // Check for a correct answer based on exercise type
    const hasCorrectIndex = typeof content.correctIndex === 'number';
    const hasAcceptableAnswers = Array.isArray(content.acceptableAnswers) && content.acceptableAnswers.length > 0;
    const hasAnswers = Array.isArray(content.answers) && content.answers.length > 0;
    const hasTargetSentence = typeof content.targetSentence === 'string' && content.targetSentence.length > 0;
    const hasFragments = Array.isArray(content.fragments) && content.fragments.length > 0;

    if (!hasCorrectIndex && !hasAcceptableAnswers && !hasAnswers && !hasTargetSentence && !hasFragments) {
      errors.push(`question at index ${i} must have a correct answer`);
    }
  }

  return { valid: errors.length === 0, errors };
}
