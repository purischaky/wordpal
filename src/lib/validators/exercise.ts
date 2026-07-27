import type {
  ExerciseType,
  DragDropContent,
  MultipleChoiceContent,
  SentenceOrderingContent,
  FillInBlankContent,
  RewriteSentenceContent,
  FreeWritingContent,
} from '@/types/admin';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

type ExerciseContent =
  | DragDropContent
  | MultipleChoiceContent
  | SentenceOrderingContent
  | FillInBlankContent
  | RewriteSentenceContent
  | FreeWritingContent;

/**
 * Validates exercise content based on its type.
 * Returns a result object with validity status and any errors found.
 */
export function validateExercise(
  type: ExerciseType,
  content: ExerciseContent
): ValidationResult {
  switch (type) {
    case 'multiple-choice':
      return validateMultipleChoice(content as MultipleChoiceContent);
    case 'drag-and-drop':
      return validateDragAndDrop(content as DragDropContent);
    case 'fill-in-blank':
      return validateFillInBlank(content as FillInBlankContent);
    case 'sentence-ordering':
      return validateSentenceOrdering(content as SentenceOrderingContent);
    case 'rewrite-sentence':
      return validateRewriteSentence(content as RewriteSentenceContent);
    case 'free-writing':
      return validateFreeWriting(content as FreeWritingContent);
    default:
      return { valid: false, errors: [`Unknown exercise type: ${type}`] };
  }
}

function validateMultipleChoice(content: MultipleChoiceContent): ValidationResult {
  const errors: string[] = [];

  if (!content.options || content.options.length === 0) {
    errors.push('Multiple choice exercise must have at least one option.');
  }

  if (content.correctIndex === undefined || content.correctIndex === null) {
    errors.push('Multiple choice exercise must have a correct answer designated.');
  }

  return { valid: errors.length === 0, errors };
}

function validateDragAndDrop(content: DragDropContent): ValidationResult {
  const errors: string[] = [];

  const nonDistractorBlocks = (content.blocks || []).filter(
    (block) => !block.isDistractor
  );

  if (nonDistractorBlocks.length === 0) {
    errors.push('Drag-and-drop exercise must have at least one non-distractor block.');
  }

  return { valid: errors.length === 0, errors };
}

function validateFillInBlank(content: FillInBlankContent): ValidationResult {
  const errors: string[] = [];

  const blankCount = (content.sentence || '').split('___').length - 1;

  if (blankCount === 0) {
    errors.push('Fill in the blank exercise must contain at least one blank marker (___).');
  }

  return { valid: errors.length === 0, errors };
}

function validateSentenceOrdering(content: SentenceOrderingContent): ValidationResult {
  const errors: string[] = [];

  if (!content.fragments || content.fragments.length < 2) {
    errors.push('Sentence ordering exercise must have at least 2 fragments.');
  }

  return { valid: errors.length === 0, errors };
}

function validateRewriteSentence(content: RewriteSentenceContent): ValidationResult {
  const errors: string[] = [];

  if (!content.acceptableAnswers || content.acceptableAnswers.length === 0) {
    errors.push('Rewrite sentence exercise must have at least one acceptable answer.');
  }

  return { valid: errors.length === 0, errors };
}

function validateFreeWriting(content: FreeWritingContent): ValidationResult {
  const errors: string[] = [];

  if (!content.prompt || content.prompt.trim().length === 0) {
    errors.push('Free writing exercise must have a non-empty prompt.');
  }

  return { valid: errors.length === 0, errors };
}
