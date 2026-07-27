/**
 * AI Content Generation form validation logic.
 * Extracted to a pure function for testability via property-based tests.
 */

import type { CEFRLevel } from '@/types/admin';

// ─── Form Data Types ─────────────────────────────────────────────────────────

export interface AIGenerationFormData {
  grammarTopic: string;
  targetLevel: CEFRLevel | '';
  difficulty: 1 | 2 | 3 | 4 | 5 | '';
  learningGoal: string;
  context: 'Business' | 'Travel' | 'Daily Life' | 'Interview' | '';
}

export interface AIGenerationFormErrors {
  grammarTopic?: string;
  targetLevel?: string;
  difficulty?: string;
  learningGoal?: string;
  context?: string;
}

// ─── Validation Function ─────────────────────────────────────────────────────

/**
 * Validates AI content generation form data.
 *
 * Rules:
 * - Grammar Topic: required, max 100 characters
 * - Target CEFR Level: required (non-empty)
 * - Difficulty: required, integer 1-5
 * - Learning Goal: required, max 300 characters
 * - Context: required (non-empty)
 *
 * Important: This function only validates — it does NOT modify the input data.
 * Already-filled fields are preserved by the caller.
 *
 * @returns An object with field-level error messages. Empty object means valid.
 */
export function validateAIGenerationForm(data: AIGenerationFormData): AIGenerationFormErrors {
  const errors: AIGenerationFormErrors = {};

  // Grammar Topic: required, max 100 chars
  if (!data.grammarTopic.trim()) {
    errors.grammarTopic = 'Grammar topic is required.';
  } else if (data.grammarTopic.length > 100) {
    errors.grammarTopic = 'Grammar topic must be 100 characters or fewer.';
  }

  // Target CEFR Level: required
  if (!data.targetLevel) {
    errors.targetLevel = 'Please select a target CEFR level.';
  }

  // Difficulty: required, 1-5
  if (data.difficulty === '') {
    errors.difficulty = 'Please select a difficulty level.';
  }

  // Learning Goal: required, max 300 chars
  if (!data.learningGoal.trim()) {
    errors.learningGoal = 'Learning goal is required.';
  } else if (data.learningGoal.length > 300) {
    errors.learningGoal = 'Learning goal must be 300 characters or fewer.';
  }

  // Context: required
  if (!data.context) {
    errors.context = 'Please select a context.';
  }

  return errors;
}
