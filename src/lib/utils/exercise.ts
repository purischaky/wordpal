/**
 * Exercise state helpers for WordPal.
 */

import type { Exercise, GrammarBlock } from '@/types/exercise';

/**
 * Compares canvas block labels against target sentence words by position.
 * Returns IDs of blocks that are in an incorrect position relative to the target.
 */
export function getIncorrectBlockIds(
  canvas: GrammarBlock[],
  targetSentence: string
): string[] {
  const targetWords = targetSentence.split(' ');
  const incorrectIds: string[] = [];

  for (let i = 0; i < canvas.length; i++) {
    const block = canvas[i];
    if (i >= targetWords.length || block.label !== targetWords[i]) {
      incorrectIds.push(block.id);
    }
  }

  return incorrectIds;
}

/**
 * Given a list of exercises in a lesson and the set of completed exercise IDs,
 * returns a map from exercise ID to its status: 'locked', 'available', or 'completed'.
 *
 * Rules:
 * - Completed exercises are those whose IDs appear in completedIds.
 * - The first incomplete exercise (by order) is 'available'.
 * - All exercises after the first incomplete one are 'locked'.
 */
export function getExerciseStatus(
  lessonExercises: Exercise[],
  completedIds: string[]
): Map<string, 'locked' | 'available' | 'completed'> {
  const statusMap = new Map<string, 'locked' | 'available' | 'completed'>();
  const sorted = [...lessonExercises].sort((a, b) => a.order - b.order);
  const completedSet = new Set(completedIds);

  let foundFirstIncomplete = false;

  for (const exercise of sorted) {
    if (completedSet.has(exercise.id)) {
      statusMap.set(exercise.id, 'completed');
    } else if (!foundFirstIncomplete) {
      statusMap.set(exercise.id, 'available');
      foundFirstIncomplete = true;
    } else {
      statusMap.set(exercise.id, 'locked');
    }
  }

  return statusMap;
}

/**
 * Sorts blocks by their original source order.
 */
export function sortBlocksBySourceOrder(blocks: GrammarBlock[]): GrammarBlock[] {
  return [...blocks].sort((a, b) => a.sourceOrder - b.sourceOrder);
}
