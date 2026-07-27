'use client';

import { useState, useCallback, useEffect } from 'react';
import type { FreeWritingContent } from '@/types/admin';

export interface FreeWritingFormProps {
  initialData?: Partial<FreeWritingContent>;
  onChange: (data: FreeWritingContent) => void;
}

export default function FreeWritingForm({ initialData, onChange }: FreeWritingFormProps) {
  const [prompt, setPrompt] = useState(initialData?.prompt ?? '');
  const [minWords, setMinWords] = useState<number | undefined>(initialData?.minWords);
  const [maxWords, setMaxWords] = useState<number | undefined>(initialData?.maxWords);
  const [evaluationGuidelines, setEvaluationGuidelines] = useState(initialData?.evaluationGuidelines ?? '');

  const emitChange = useCallback(
    (p: string, min: number | undefined, max: number | undefined, guidelines: string) => {
      onChange({
        prompt: p,
        minWords: min,
        maxWords: max,
        evaluationGuidelines: guidelines || undefined,
      });
    },
    [onChange]
  );

  useEffect(() => {
    emitChange(prompt, minWords, maxWords, evaluationGuidelines);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePromptChange = (value: string) => {
    const trimmed = value.slice(0, 500);
    setPrompt(trimmed);
    emitChange(trimmed, minWords, maxWords, evaluationGuidelines);
  };

  const handleMinWordsChange = (value: string) => {
    const num = value === '' ? undefined : Math.max(1, Math.min(1000, parseInt(value, 10) || 0));
    setMinWords(num);
    emitChange(prompt, num, maxWords, evaluationGuidelines);
  };

  const handleMaxWordsChange = (value: string) => {
    const num = value === '' ? undefined : Math.max(1, Math.min(1000, parseInt(value, 10) || 0));
    setMaxWords(num);
    emitChange(prompt, minWords, num, evaluationGuidelines);
  };

  const handleGuidelinesChange = (value: string) => {
    const trimmed = value.slice(0, 500);
    setEvaluationGuidelines(trimmed);
    emitChange(prompt, minWords, maxWords, trimmed);
  };

  const wordCountError =
    minWords !== undefined && maxWords !== undefined && minWords > maxWords
      ? 'Minimum word count cannot exceed maximum.'
      : null;

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Free Writing</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Provide a writing prompt and optional constraints for word count and evaluation.
      </p>

      {/* Prompt */}
      <div>
        <label htmlFor="fw-prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Prompt <span className="text-red-500">*</span>
        </label>
        <textarea
          id="fw-prompt"
          value={prompt}
          onChange={(e) => handlePromptChange(e.target.value)}
          maxLength={500}
          rows={4}
          placeholder="Write a short paragraph about your daily routine using present simple tense..."
          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none"
        />
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{prompt.length}/500</p>
      </div>

      {/* Word Count Range */}
      <div>
        <p className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Word Count Range <span className="text-gray-400">(optional)</span>
        </p>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <label htmlFor="fw-min-words" className="sr-only">Minimum words</label>
            <input
              id="fw-min-words"
              type="number"
              value={minWords ?? ''}
              onChange={(e) => handleMinWordsChange(e.target.value)}
              min={1}
              max={1000}
              placeholder="Min"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            />
          </div>
          <span className="text-gray-400 dark:text-gray-500 text-sm">to</span>
          <div className="flex-1">
            <label htmlFor="fw-max-words" className="sr-only">Maximum words</label>
            <input
              id="fw-max-words"
              type="number"
              value={maxWords ?? ''}
              onChange={(e) => handleMaxWordsChange(e.target.value)}
              min={1}
              max={1000}
              placeholder="Max"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            />
          </div>
          <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">words</span>
        </div>
        {wordCountError && (
          <p className="mt-1 text-xs text-red-500">{wordCountError}</p>
        )}
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">Range: 1–1000 words</p>
      </div>

      {/* Evaluation Guidelines */}
      <div>
        <label htmlFor="fw-guidelines" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Evaluation Guidelines <span className="text-gray-400">(optional)</span>
        </label>
        <textarea
          id="fw-guidelines"
          value={evaluationGuidelines}
          onChange={(e) => handleGuidelinesChange(e.target.value)}
          maxLength={500}
          rows={3}
          placeholder="Look for correct use of present simple, subject-verb agreement, and proper sentence structure..."
          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none"
        />
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{evaluationGuidelines.length}/500</p>
      </div>
    </div>
  );
}
