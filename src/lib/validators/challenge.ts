/**
 * Placement Challenge publish validation.
 * Extracted to a pure function for testability via property-based tests.
 */

/**
 * Represents a question in the challenge for validation purposes.
 */
export interface ChallengeQuestion {
  id: string;
  text: string;
  hasCorrectAnswer: boolean;
}

/**
 * Data required for challenge publish validation.
 */
export interface ChallengePublishData {
  configuredQuestionCount: number;
  questions: ChallengeQuestion[];
}

/**
 * Result of challenge publish validation.
 */
export interface ChallengePublishResult {
  valid: boolean;
  errors: string[];
  questionsWithoutAnswers: string[]; // IDs of questions lacking correct answers
}

/**
 * Validates whether a placement challenge can be published.
 *
 * Rules:
 * - The challenge must have at least `configuredQuestionCount` questions.
 * - Every question must have `hasCorrectAnswer === true`.
 * - Returns IDs of questions lacking correct answers.
 * - Returns error messages for: insufficient count, specific questions without answers.
 *
 * @returns A result with valid=true if publishable, or valid=false with error messages.
 *
 * Validates: Requirements 10.6, 10.7
 */
export function validateChallengePublish(data: ChallengePublishData): ChallengePublishResult {
  const errors: string[] = [];
  const questionsWithoutAnswers: string[] = [];

  // Check minimum question count
  if (data.questions.length < data.configuredQuestionCount) {
    errors.push(
      `Challenge requires at least ${data.configuredQuestionCount} questions, but only has ${data.questions.length}.`
    );
  }

  // Check each question has a correct answer
  for (const question of data.questions) {
    if (!question.hasCorrectAnswer) {
      questionsWithoutAnswers.push(question.id);
    }
  }

  if (questionsWithoutAnswers.length > 0) {
    errors.push(
      `${questionsWithoutAnswers.length} question(s) do not have a correct answer designated.`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    questionsWithoutAnswers,
  };
}
