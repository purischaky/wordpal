'use client';

import { useState, useRef } from 'react';
import type {
  ExerciseType,
  GrammarBlock,
  MultipleChoiceContent,
  FillInBlankContent,
  SentenceOrderingContent,
  RewriteSentenceContent,
  FreeWritingContent,
} from '@/types/admin';
import GrammarBlockEditor from './GrammarBlockEditor';
import MultipleChoiceForm from './MultipleChoiceForm';
import FillInBlankForm from './FillInBlankForm';
import SentenceOrderingForm from './SentenceOrderingForm';
import RewriteSentenceForm from './RewriteSentenceForm';
import FreeWritingForm from './FreeWritingForm';

type ExerciseFormContent =
  | MultipleChoiceContent
  | FillInBlankContent
  | SentenceOrderingContent
  | RewriteSentenceContent
  | FreeWritingContent;

export interface ExerciseBuilderData {
  type: ExerciseType;
  blocks?: GrammarBlock[];
  content?: ExerciseFormContent;
}

export interface ExerciseBuilderProps {
  initialType?: ExerciseType;
  initialBlocks?: GrammarBlock[];
  onSave?: (data: ExerciseBuilderData) => Promise<void>;
  onPreview?: (data: ExerciseBuilderData) => void;
}

const EXERCISE_TYPES: { value: ExerciseType; label: string; description: string }[] = [
  { value: 'drag-and-drop', label: 'Drag and Drop Sentence', description: 'Students arrange grammar blocks to build correct sentences.' },
  { value: 'multiple-choice', label: 'Multiple Choice', description: 'Students select the correct answer from four options.' },
  { value: 'sentence-ordering', label: 'Sentence Ordering', description: 'Students arrange sentence fragments in the correct order.' },
  { value: 'fill-in-blank', label: 'Fill in the Blank', description: 'Students fill in missing words in a sentence.' },
  { value: 'rewrite-sentence', label: 'Rewrite Sentence', description: 'Students rewrite a sentence following given instructions.' },
  { value: 'free-writing', label: 'Free Writing', description: 'Students write freely based on a prompt.' },
];

export default function ExerciseBuilder({
  initialType = 'drag-and-drop',
  initialBlocks = [],
  onSave,
  onPreview,
}: ExerciseBuilderProps) {
  const [exerciseType, setExerciseType] = useState<ExerciseType>(initialType);
  const [blocks, setBlocks] = useState<GrammarBlock[]>(initialBlocks);
  const formContentRef = useRef<ExerciseFormContent | null>(null);

  const selectedTypeInfo = EXERCISE_TYPES.find((t) => t.value === exerciseType);

  const handleFormChange = (data: ExerciseFormContent) => {
    formContentRef.current = data;
  };

  const currentData = (): ExerciseBuilderData => ({
    type: exerciseType,
    blocks: exerciseType === 'drag-and-drop' ? blocks : undefined,
    content: exerciseType !== 'drag-and-drop' ? formContentRef.current ?? undefined : undefined,
  });

  return (
    <div className="space-y-6">
      {/* Type Selector */}
      <div>
        <label htmlFor="exercise-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Exercise Type
        </label>
        <select
          id="exercise-type"
          value={exerciseType}
          onChange={(e) => setExerciseType(e.target.value as ExerciseType)}
          className="w-full max-w-md px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        >
          {EXERCISE_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
        {selectedTypeInfo && (
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {selectedTypeInfo.description}
          </p>
        )}
      </div>

      {/* Type-Specific Editor Area */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 p-6">
        {exerciseType === 'drag-and-drop' ? (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              Drag and Drop Sentence Builder
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Add grammar blocks from the palette. Students will arrange these blocks to form a correct sentence.
            </p>
            <GrammarBlockEditor
              blocks={blocks}
              onChange={setBlocks}
              minBlocks={2}
              maxBlocks={15}
            />
          </div>
        ) : exerciseType === 'multiple-choice' ? (
          <MultipleChoiceForm onChange={handleFormChange} />
        ) : exerciseType === 'fill-in-blank' ? (
          <FillInBlankForm onChange={handleFormChange} />
        ) : exerciseType === 'sentence-ordering' ? (
          <SentenceOrderingForm onChange={handleFormChange} />
        ) : exerciseType === 'rewrite-sentence' ? (
          <RewriteSentenceForm onChange={handleFormChange} />
        ) : exerciseType === 'free-writing' ? (
          <FreeWritingForm onChange={handleFormChange} />
        ) : null}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pt-2">
        {onPreview && (
          <button
            type="button"
            onClick={() => onPreview(currentData())}
            className="px-5 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Preview
          </button>
        )}
        {onSave && (
          <button
            type="button"
            onClick={() => onSave(currentData())}
            className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
          >
            Save Exercise
          </button>
        )}
      </div>
    </div>
  );
}
