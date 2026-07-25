/**
 * Exercise and Grammar Block type definitions for WordPal.
 */

/** Grammatical category for a block */
export type BlockCategory = 'subject' | 'verb' | 'object' | 'modifier' | 'time' | 'place' | 'contrast';

/** A draggable grammar block representing a word or phrase */
export interface GrammarBlock {
  id: string;
  label: string;
  category: BlockCategory;
  isDistractor: boolean;
  sourceOrder: number;
}

/** A single sentence-building exercise */
export interface Exercise {
  id: string;
  lessonId: string;
  order: number;
  targetSentence: string;
  blocks: GrammarBlock[];
  maxBlocks: number;
}

/** A lesson grouping exercises by grammar concept */
export interface Lesson {
  id: string;
  title: string;
  description: string;
  order: number;
  grammarConcept: string;
}

/** State of the sentence canvas */
export interface CanvasState {
  placedBlocks: GrammarBlock[];
  availableBlocks: GrammarBlock[];
  sentencePreview: string;
}

/** Status of AI feedback processing */
export type FeedbackStatus = 'idle' | 'loading' | 'success' | 'error' | 'unavailable';

/** Full exercise state managed by the reducer */
export interface ExerciseState {
  exercise: Exercise;
  canvas: GrammarBlock[];
  available: GrammarBlock[];
  feedback: import('./feedback').FeedbackResponse | null;
  feedbackStatus: FeedbackStatus;
  hintsUsed: number;
  attempts: number;
  incorrectBlockIds: string[];
}

/** All possible actions dispatched to the exercise reducer */
export type ExerciseAction =
  | { type: 'PLACE_BLOCK'; blockId: string; index: number }
  | { type: 'REMOVE_BLOCK'; blockId: string }
  | { type: 'REORDER_BLOCKS'; fromIndex: number; toIndex: number }
  | { type: 'SUBMIT_START' }
  | { type: 'SUBMIT_SUCCESS'; feedback: import('./feedback').FeedbackResponse }
  | { type: 'SUBMIT_ERROR' }
  | { type: 'USE_HINT'; hint: string }
  | { type: 'RESET' };

/** Grammar explanation mapping for tooltips */
export const GRAMMAR_EXPLANATIONS: Record<BlockCategory, string> = {
  subject: 'The person or thing performing the action',
  verb: 'The action or state of being',
  object: 'The person or thing receiving the action',
  modifier: 'A word that describes or limits another word',
  time: 'When the action takes place (e.g. yesterday, always)',
  place: 'Where the action takes place (e.g. home, at school)',
  contrast: 'A clause that introduces opposition or unexpected outcome (e.g. despite, although)',
};

/** Props for the DraggableBlock component */
export interface DraggableBlockProps {
  block: GrammarBlock;
  isDragging: boolean;
  isIncorrect: boolean;
  onTap: () => void;
  disabled?: boolean;
  showTooltip?: boolean;
}
