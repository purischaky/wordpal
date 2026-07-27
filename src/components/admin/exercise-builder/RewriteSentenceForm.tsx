'use client';

import { useState, useCallback, useEffect } from 'react';
import type { RewriteSentenceContent } from '@/types/admin';

export interface RewriteSentenceFormProps {
  initialData?: Partial<RewriteSentenceContent>;
  onChange: (data: RewriteSentenceContent) => void;
}

const MIN_ANSWERS = 1;
const MAX_ANSWERS = 5;

export default function RewriteSentenceForm({ initialData, onChange }: RewriteSentenceFormProps) {
  const [originalSentence, setOriginalSentence] = useState(initialData?.originalSentence ?? '');
  const [instruction, setInstruction] = useState(initialData?.instruction ?? '');
  const [acceptableAnswers, setAcceptableAnswers] = useState<string[]>(
    initialData?.acceptableAnswers?.length ? initialData.acceptableAnswers : ['']
  );

  const emitChange = useCallback(
    (orig: string, instr: string, answers: string[]) => {
      onChange({ originalSentence: orig, instruction: instr, acceptableAnswers: answers });
    },
    [onChange]
  );

  useEffect(() => {
    emitChange(originalSentence, instruction, acceptableAnswers);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOriginalChange = (value: string) => {
    const trimmed = value.slice(0, 300);
    setOriginalSentence(trimmed);
    emitChange(trimmed, instruction, acceptableAnswers);
  };

  const handleInstructionChange = (value: string) => {
    const trimmed = value.slice(0, 300);
    setInstruction(trimmed);
    emitChange(originalSentence, trimmed, acceptableAnswers);
  };

  const handleAnswerChange = (index: number, value: string) => {
    const trimmed = value.slice(0, 300);
    const updated = [...acceptableAnswers];
    updated[index] = trimmed;
    setAcceptableAnswers(updated);
    emitChange(originalSentence, instruction, updated);
  };

  const addAnswer = () => {
    if (acceptableAnswers.length >= MAX_ANSWERS) return;
    const updated = [...acceptableAnswers, ''];
    setAcceptableAnswers(updated);
    emitChange(originalSentence, instruction, updated);
  };

  const removeAnswer = (index: number) => {
    if (acceptableAnswers.length <= MIN_ANSWERS) return;
    const updated = acceptableAnswers.filter((_, i) => i !== index);
    setAcceptableAnswers(updated);
    emitChange(originalSentence, instruction, updated);
  };

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Rewrite Sentence</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Provide the original sentence, an instruction for how to rewrite it, and acceptable answers.
      </p>

      {/* Original Sentence */}
      <div>
        <label htmlFor="rw-original" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Original Sentence <span className="text-red-500">*</span>
        </label>
        <textarea
          id="rw-original"
          value={originalSentence}
          onChange={(e) => handleOriginalChange(e.target.value)}
          maxLength={300}
          rows={2}
          placeholder="She goes to the market every day."
          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none"
        />
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{originalSentence.length}/300</p>
      </div>

      {/* Instruction */}
      <div>
        <label htmlFor="rw-instruction" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Instruction <span className="text-red-500">*</span>
        </label>
        <textarea
          id="rw-instruction"
          value={instruction}
          onChange={(e) => handleInstructionChange(e.target.value)}
          maxLength={300}
          rows={2}
          placeholder="Rewrite in the past simple tense."
          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none"
        />
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{instruction.length}/300</p>
      </div>

      {/* Acceptable Answers */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Acceptable Answers <span className="text-red-500">*</span>
          </p>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {acceptableAnswers.length}/{MAX_ANSWERS}
          </span>
        </div>
        <div className="space-y-3">
          {acceptableAnswers.map((answer, index) => (
            <div key={index} className="flex items-center gap-3">
              <span className="text-xs font-medium text-gray-400 dark:text-gray-500 w-6 text-center shrink-0">
                {index + 1}
              </span>
              <input
                type="text"
                value={answer}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
                maxLength={300}
                placeholder={`Acceptable answer ${index + 1}`}
                aria-label={`Acceptable answer ${index + 1}`}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              />
              <span className="text-xs text-gray-400 dark:text-gray-500 w-12 text-right shrink-0">
                {answer.length}/300
              </span>
              <button
                type="button"
                onClick={() => removeAnswer(index)}
                disabled={acceptableAnswers.length <= MIN_ANSWERS}
                aria-label={`Remove answer ${index + 1}`}
                className="p-1.5 text-red-400 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Add Answer Button */}
      <button
        type="button"
        onClick={addAnswer}
        disabled={acceptableAnswers.length >= MAX_ANSWERS}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-600 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Answer
      </button>

      <p className="text-xs text-gray-500 dark:text-gray-400">
        Provide {MIN_ANSWERS}–{MAX_ANSWERS} acceptable rewritten versions. Multiple correct answers allow for natural variation.
      </p>
    </div>
  );
}
