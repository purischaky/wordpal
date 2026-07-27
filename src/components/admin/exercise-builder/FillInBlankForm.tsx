'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import type { FillInBlankContent } from '@/types/admin';

export interface FillInBlankFormProps {
  initialData?: Partial<FillInBlankContent>;
  onChange: (data: FillInBlankContent) => void;
}

/** Count occurrences of `___` (three underscores) in a string */
function countBlanks(sentence: string): number {
  const matches = sentence.match(/___/g);
  return matches ? matches.length : 0;
}

export default function FillInBlankForm({ initialData, onChange }: FillInBlankFormProps) {
  const [sentence, setSentence] = useState(initialData?.sentence ?? '');
  const [answers, setAnswers] = useState<string[]>(initialData?.answers ?? ['']);

  const blankCount = useMemo(() => countBlanks(sentence), [sentence]);

  // Sync answer field count with detected blanks
  useEffect(() => {
    if (blankCount > 0 && blankCount <= 10) {
      setAnswers((prev) => {
        if (prev.length === blankCount) return prev;
        if (prev.length < blankCount) {
          return [...prev, ...Array(blankCount - prev.length).fill('')];
        }
        return prev.slice(0, blankCount);
      });
    }
  }, [blankCount]);

  const emitChange = useCallback(
    (s: string, a: string[]) => {
      onChange({ sentence: s, answers: a });
    },
    [onChange]
  );

  useEffect(() => {
    emitChange(sentence, answers);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSentenceChange = (value: string) => {
    const trimmed = value.slice(0, 500);
    setSentence(trimmed);
    const newBlanks = countBlanks(trimmed);
    const newAnswers = [...answers];
    if (newBlanks > newAnswers.length) {
      while (newAnswers.length < newBlanks) newAnswers.push('');
    } else if (newBlanks < newAnswers.length) {
      newAnswers.length = Math.max(newBlanks, 1);
    }
    setAnswers(newAnswers);
    emitChange(trimmed, newAnswers);
  };

  const handleAnswerChange = (index: number, value: string) => {
    const trimmed = value.slice(0, 200);
    const updated = [...answers];
    updated[index] = trimmed;
    setAnswers(updated);
    emitChange(sentence, updated);
  };

  const isValidBlankCount = blankCount >= 1 && blankCount <= 10;

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Fill in the Blank</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Write a sentence using <code className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-xs font-mono">___</code> (three underscores) to mark blanks. Provide the correct answer for each blank.
      </p>

      {/* Sentence */}
      <div>
        <label htmlFor="fib-sentence" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Sentence <span className="text-red-500">*</span>
        </label>
        <textarea
          id="fib-sentence"
          value={sentence}
          onChange={(e) => handleSentenceChange(e.target.value)}
          maxLength={500}
          rows={3}
          placeholder="She ___ to the store every ___ morning."
          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none"
        />
        <div className="mt-1 flex items-center justify-between">
          <p className="text-xs text-gray-400 dark:text-gray-500">{sentence.length}/500</p>
          <p className={`text-xs ${isValidBlankCount ? 'text-green-600 dark:text-green-400' : blankCount === 0 ? 'text-gray-400 dark:text-gray-500' : 'text-red-500'}`}>
            {blankCount} blank{blankCount !== 1 ? 's' : ''} detected
            {blankCount > 10 && ' (max 10)'}
          </p>
        </div>
      </div>

      {/* Answer Fields */}
      {blankCount > 0 && isValidBlankCount && (
        <div>
          <p className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Answers <span className="text-red-500">*</span>
          </p>
          <div className="space-y-3">
            {answers.map((answer, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-16 shrink-0">
                  Blank {index + 1}
                </span>
                <input
                  type="text"
                  value={answer}
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                  maxLength={200}
                  placeholder={`Answer for blank ${index + 1}`}
                  aria-label={`Answer for blank ${index + 1}`}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                />
                <span className="text-xs text-gray-400 dark:text-gray-500 w-12 text-right">
                  {answer.length}/200
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {blankCount === 0 && sentence.length > 0 && (
        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl">
          <p className="text-sm text-amber-700 dark:text-amber-300">
            No blanks detected. Use <code className="font-mono">___</code> (three underscores) to mark where students should fill in answers.
          </p>
        </div>
      )}
    </div>
  );
}
