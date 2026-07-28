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
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

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

  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === dropIndex) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }

    const updated = [...fragments];
    const [moved] = updated.splice(dragIndex, 1);
    updated.splice(dropIndex, 0, moved);

    setFragments(updated);
    emitChange(updated);
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Sentence Ordering</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Enter sentence fragments in the correct order, then drag to rearrange. Students will see them shuffled and must rearrange them.
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
        <div className="space-y-2" role="list" aria-label="Sentence fragments">
          {fragments.map((fragment, index) => {
            const isDragging = dragIndex === index;
            const isDragOver = dragOverIndex === index;
            return (
              <div
                key={index}
                role="listitem"
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                className={`flex items-center gap-2 rounded-xl border p-1 transition-all duration-200 ${
                  isDragging ? 'opacity-50 scale-95' : ''
                } ${isDragOver ? 'ring-2 ring-blue-400' : 'border-transparent'}`}
              >
                {/* Drag handle */}
                <span
                  className="cursor-grab active:cursor-grabbing px-1 text-gray-400 dark:text-gray-500 select-none"
                  aria-label={`Drag to reorder fragment ${index + 1}`}
                >
                  ⠿
                </span>
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
            );
          })}
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
