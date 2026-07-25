/**
 * Sentence construction helpers for WordPal exercises.
 */

import type { GrammarBlock } from '@/types/exercise';

/**
 * Builds a sentence preview by joining block labels with spaces.
 * Returns an empty string if no blocks are provided.
 */
export function buildSentencePreview(blocks: GrammarBlock[]): string {
  return blocks.map((block) => block.label).join(' ');
}

/**
 * Validates that a sentence string is within the acceptable length range (1–200 characters).
 * Returns an object indicating validity and an optional error message.
 */
export function validateSentenceLength(sentence: string): {
  valid: boolean;
  error?: string;
} {
  if (sentence.length === 0) {
    return { valid: false, error: 'Sentences must be between 1 and 200 characters.' };
  }
  if (sentence.length > 200) {
    return { valid: false, error: 'Sentences must be between 1 and 200 characters.' };
  }
  return { valid: true };
}
