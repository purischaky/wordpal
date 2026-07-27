'use client';

import { useState, useCallback, useEffect } from 'react';
import type { SentenceOrderingContent } from '@/types/admin';

export interface SentenceOrderingFormProps {
  initialData?: Partial<SentenceOrderingContent>;
  onChange: (data: SentenceOrderingContent) => void;
}

const MIN_FRAGMENTS = 2;
const MAX_FRAGMENTS = 12;

export default function SentenceOrderingForm({ initialData, onChange }: SentenceOrderingFormProps) {
  const [fragments, setFragments] = useState<string[]>(
    initialData?.fragments?.length ? initialData.fragments : ['', '']
  );

  const emitChange = useCallback(
    (frags: string[]) => {
      onChange({ fragments: frags });
    },
    [onChange]
  );

  useEffect(() => {
    emitChange(fragments);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFragmentChange = (index: number, value: string) => {
    const trimmed = value.slice(0, 200);
    const updated = [...fragments];
    updated[index] = trimmed;
    setFragments(updated);
    emitChange(updated);
  };

  const addFragment = () => {
    if (fragments.length >= MAX_FRAGMENTS) return;
    const updated = [...fragments, ''];
    setFragments(updated);
    emitChange(updated);
  };

  const removeFragment = (index: number) => {
    if (fragments.length <= MIN_FRAGMENTS) return;
    const updated = fragments.filter((_, i) => i !== index);
    setFragments(updated);
    emitChange(updated);
  };

  const moveFragment = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= fragments.length) return;
    const updated = [...fragments];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setFragments(updated);
    emitChange(updated);
  };

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Sentence Ordering</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Enter sentence fragments in the correct order. Students will see them shuffled and must rearrange them.
      </p>

      {/* Fragments */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Fragments <span className="text-red-500">*</span>
          </p>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {fragments.length}/{MAX_FRAGMENTS}
          </span>
        </div>
        <div className="space-y-2">
          {fragments.map((fragment, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-400 dark:text-gray-500 w-6 text-center shrink-0">
                {index + 1}
              </span>
              <input
                type="text"
                value={fragment}
                onChange={(e) => handleFragmentChange(index, e.target.value)}
                maxLength={200}
                placeholder={`Fragment ${index + 1}`}
                aria-label={`Fragment ${index + 1}`}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              />
              <span className="text-xs text-gray-400 dark:text-gray-500 w-12 text-right shrink-0">
                {fragment.length}/200
              </span>
              {/* Move up */}
              <button
                type="button"
                onClick={() => moveFragment(index, 'up')}
                disabled={index === 0}
                aria-label={`Move fragment ${index + 1} up`}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>
              {/* Move down */}
              <button
                type="button"
                onClick={() => moveFragment(index, 'down')}
                disabled={index === fragments.length - 1}
                aria-label={`Move fragment ${index + 1} down`}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {/* Remove */}
              <button
                type="button"
                onClick={() => removeFragment(index)}
                disabled={fragments.length <= MIN_FRAGMENTS}
                aria-label={`Remove fragment ${index + 1}`}
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

      {/* Add Fragment Button */}
      <button
        type="button"
        onClick={addFragment}
        disabled={fragments.length >= MAX_FRAGMENTS}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-600 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Fragment
      </button>

      <p className="text-xs text-gray-500 dark:text-gray-400">
        Minimum {MIN_FRAGMENTS} fragments, maximum {MAX_FRAGMENTS}. Enter them in the correct order — they will be shuffled for the student.
      </p>
    </div>
  );
}
