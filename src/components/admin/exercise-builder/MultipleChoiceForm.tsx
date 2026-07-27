'use client';

import { useState, useCallback, useEffect } from 'react';
import type { MultipleChoiceContent } from '@/types/admin';

export interface MultipleChoiceFormProps {
  initialData?: Partial<MultipleChoiceContent>;
  onChange: (data: MultipleChoiceContent) => void;
}

const DEFAULT_OPTIONS = ['', '', '', ''];

export default function MultipleChoiceForm({ initialData, onChange }: MultipleChoiceFormProps) {
  const [question, setQuestion] = useState(initialData?.question ?? '');
  const [options, setOptions] = useState<string[]>(
    initialData?.options?.length === 4 ? initialData.options : DEFAULT_OPTIONS
  );
  const [correctIndex, setCorrectIndex] = useState<number>(initialData?.correctIndex ?? -1);
  const [explanation, setExplanation] = useState(initialData?.explanation ?? '');

  const emitChange = useCallback(
    (q: string, opts: string[], correct: number, expl: string) => {
      onChange({
        question: q,
        options: opts,
        correctIndex: correct,
        explanation: expl || undefined,
      });
    },
    [onChange]
  );

  useEffect(() => {
    emitChange(question, options, correctIndex, explanation);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleQuestionChange = (value: string) => {
    const trimmed = value.slice(0, 300);
    setQuestion(trimmed);
    emitChange(trimmed, options, correctIndex, explanation);
  };

  const handleOptionChange = (index: number, value: string) => {
    const trimmed = value.slice(0, 200);
    const updated = [...options];
    updated[index] = trimmed;
    setOptions(updated);
    emitChange(question, updated, correctIndex, explanation);
  };

  const handleCorrectChange = (index: number) => {
    setCorrectIndex(index);
    emitChange(question, options, index, explanation);
  };

  const handleExplanationChange = (value: string) => {
    const trimmed = value.slice(0, 500);
    setExplanation(trimmed);
    emitChange(question, options, correctIndex, trimmed);
  };

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Multiple Choice</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Write a question and provide four answer options. Select the correct answer.
      </p>

      {/* Question */}
      <div>
        <label htmlFor="mc-question" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Question <span className="text-red-500">*</span>
        </label>
        <textarea
          id="mc-question"
          value={question}
          onChange={(e) => handleQuestionChange(e.target.value)}
          maxLength={300}
          rows={3}
          placeholder="Enter the question..."
          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none"
        />
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{question.length}/300</p>
      </div>

      {/* Options */}
      <fieldset>
        <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Options <span className="text-red-500">*</span>
        </legend>
        <div className="space-y-3">
          {options.map((option, index) => (
            <div key={index} className="flex items-center gap-3">
              <input
                type="radio"
                id={`mc-correct-${index}`}
                name="mc-correct-answer"
                checked={correctIndex === index}
                onChange={() => handleCorrectChange(index)}
                className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 focus:ring-blue-500"
                aria-label={`Mark option ${index + 1} as correct`}
              />
              <label htmlFor={`mc-correct-${index}`} className="sr-only">
                Mark option {index + 1} as correct answer
              </label>
              <input
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                maxLength={200}
                placeholder={`Option ${index + 1}`}
                aria-label={`Option ${index + 1}`}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              />
              <span className="text-xs text-gray-400 dark:text-gray-500 w-12 text-right">
                {option.length}/200
              </span>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Select the radio button next to the correct answer.
        </p>
      </fieldset>

      {/* Explanation */}
      <div>
        <label htmlFor="mc-explanation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Explanation <span className="text-gray-400">(optional)</span>
        </label>
        <textarea
          id="mc-explanation"
          value={explanation}
          onChange={(e) => handleExplanationChange(e.target.value)}
          maxLength={500}
          rows={3}
          placeholder="Explain why the correct answer is right..."
          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none"
        />
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{explanation.length}/500</p>
      </div>
    </div>
  );
}
