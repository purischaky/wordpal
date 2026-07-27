'use client';

import { useState, useMemo } from 'react';
import type {
  ExerciseType,
  DragDropContent,
  MultipleChoiceContent,
  SentenceOrderingContent,
  FillInBlankContent,
  RewriteSentenceContent,
  FreeWritingContent,
} from '@/types/admin';

type ExerciseContent =
  | DragDropContent
  | MultipleChoiceContent
  | SentenceOrderingContent
  | FillInBlankContent
  | RewriteSentenceContent
  | FreeWritingContent;

export interface ExercisePreviewProps {
  type: ExerciseType;
  content: ExerciseContent;
  open: boolean;
  onClose: () => void;
}

export default function ExercisePreview({ type, content, open, onClose }: ExercisePreviewProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Exercise Preview"
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 m-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Student Preview
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close preview"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Exercise Type Label */}
        <div className="mb-4">
          <span className="inline-block px-3 py-1 text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 rounded-full">
            {getTypeLabel(type)}
          </span>
        </div>

        {/* Render type-specific preview */}
        <div className="space-y-4">
          {type === 'drag-and-drop' && <DragAndDropPreview content={content as DragDropContent} />}
          {type === 'multiple-choice' && <MultipleChoicePreview content={content as MultipleChoiceContent} />}
          {type === 'fill-in-blank' && <FillInBlankPreview content={content as FillInBlankContent} />}
          {type === 'sentence-ordering' && <SentenceOrderingPreview content={content as SentenceOrderingContent} />}
          {type === 'rewrite-sentence' && <RewriteSentencePreview content={content as RewriteSentenceContent} />}
          {type === 'free-writing' && <FreeWritingPreview content={content as FreeWritingContent} />}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}

function getTypeLabel(type: ExerciseType): string {
  const labels: Record<ExerciseType, string> = {
    'drag-and-drop': 'Drag and Drop',
    'multiple-choice': 'Multiple Choice',
    'sentence-ordering': 'Sentence Ordering',
    'fill-in-blank': 'Fill in the Blank',
    'rewrite-sentence': 'Rewrite Sentence',
    'free-writing': 'Free Writing',
  };
  return labels[type] || type;
}

// ─── Drag and Drop Preview ───────────────────────────────────────────────────

function DragAndDropPreview({ content }: { content: DragDropContent }) {
  const shuffledBlocks = useMemo(() => {
    const blocks = [...content.blocks];
    for (let i = blocks.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [blocks[i], blocks[j]] = [blocks[j], blocks[i]];
    }
    return blocks;
  }, [content.blocks]);

  const [available, setAvailable] = useState(shuffledBlocks);
  const [placed, setPlaced] = useState<typeof shuffledBlocks>([]);

  const handlePlace = (blockId: string) => {
    const block = available.find((b) => b.id === blockId);
    if (block) {
      setPlaced([...placed, block]);
      setAvailable(available.filter((b) => b.id !== blockId));
    }
  };

  const handleRemove = (blockId: string) => {
    const block = placed.find((b) => b.id === blockId);
    if (block) {
      setAvailable([...available, block]);
      setPlaced(placed.filter((b) => b.id !== blockId));
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Arrange the blocks to form a correct sentence.
      </p>

      {/* Sentence building area */}
      <div className="min-h-[60px] p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-900/50">
        {placed.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center">
            Drag blocks here to build your sentence
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {placed.map((block) => (
              <button
                key={block.id}
                type="button"
                onClick={() => handleRemove(block.id)}
                className="px-3 py-1.5 text-sm font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 border border-blue-300 dark:border-blue-700 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800/40 transition-colors"
              >
                {block.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Available blocks */}
      <div>
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Available blocks:</p>
        <div className="flex flex-wrap gap-2">
          {available.map((block) => (
            <button
              key={block.id}
              type="button"
              onClick={() => handlePlace(block.id)}
              className="px-3 py-1.5 text-sm font-medium bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 shadow-sm transition-colors cursor-pointer"
            >
              {block.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Multiple Choice Preview ─────────────────────────────────────────────────

function MultipleChoicePreview({ content }: { content: MultipleChoiceContent }) {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      <p className="text-base font-medium text-gray-900 dark:text-white">
        {content.question}
      </p>

      <div className="space-y-2">
        {content.options.map((option, index) => (
          <label
            key={index}
            className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-colors ${
              selected === index
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-500'
                : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
            }`}
          >
            <input
              type="radio"
              name="mc-preview"
              value={index}
              checked={selected === index}
              onChange={() => setSelected(index)}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-800 dark:text-gray-200">{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

// ─── Fill in the Blank Preview ───────────────────────────────────────────────

function FillInBlankPreview({ content }: { content: FillInBlankContent }) {
  const parts = content.sentence.split('___');
  const blankCount = parts.length - 1;
  const [answers, setAnswers] = useState<string[]>(Array(blankCount).fill(''));

  const handleChange = (index: number, value: string) => {
    const updated = [...answers];
    updated[index] = value;
    setAnswers(updated);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Fill in the blanks to complete the sentence.
      </p>

      <div className="text-base text-gray-900 dark:text-white leading-relaxed flex flex-wrap items-center gap-1">
        {parts.map((part, index) => (
          <span key={index} className="inline-flex items-center gap-1">
            <span>{part}</span>
            {index < blankCount && (
              <input
                type="text"
                value={answers[index]}
                onChange={(e) => handleChange(index, e.target.value)}
                className="inline-block w-32 px-2 py-1 border-b-2 border-blue-400 dark:border-blue-500 bg-transparent text-blue-700 dark:text-blue-300 font-medium text-center focus:outline-none focus:border-blue-600"
                placeholder={`blank ${index + 1}`}
                aria-label={`Blank ${index + 1}`}
              />
            )}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Sentence Ordering Preview ───────────────────────────────────────────────

function SentenceOrderingPreview({ content }: { content: SentenceOrderingContent }) {
  const shuffledFragments = useMemo(() => {
    const fragments = content.fragments.map((f, i) => ({ id: `frag-${i}`, text: f }));
    for (let i = fragments.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [fragments[i], fragments[j]] = [fragments[j], fragments[i]];
    }
    return fragments;
  }, [content.fragments]);

  const [available, setAvailable] = useState(shuffledFragments);
  const [ordered, setOrdered] = useState<typeof shuffledFragments>([]);

  const handlePlace = (id: string) => {
    const frag = available.find((f) => f.id === id);
    if (frag) {
      setOrdered([...ordered, frag]);
      setAvailable(available.filter((f) => f.id !== id));
    }
  };

  const handleRemove = (id: string) => {
    const frag = ordered.find((f) => f.id === id);
    if (frag) {
      setAvailable([...available, frag]);
      setOrdered(ordered.filter((f) => f.id !== id));
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Arrange the sentence fragments in the correct order.
      </p>

      {/* Ordered area */}
      <div className="min-h-[60px] p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-900/50">
        {ordered.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center">
            Click fragments below to build the sentence in order
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {ordered.map((frag, index) => (
              <button
                key={frag.id}
                type="button"
                onClick={() => handleRemove(frag.id)}
                className="px-3 py-1.5 text-sm font-medium bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200 border border-green-300 dark:border-green-700 rounded-lg hover:bg-green-200 dark:hover:bg-green-800/40 transition-colors"
              >
                <span className="text-xs text-green-600 dark:text-green-400 mr-1">{index + 1}.</span>
                {frag.text}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Available fragments */}
      <div>
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Available fragments:</p>
        <div className="flex flex-wrap gap-2">
          {available.map((frag) => (
            <button
              key={frag.id}
              type="button"
              onClick={() => handlePlace(frag.id)}
              className="px-3 py-1.5 text-sm font-medium bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 shadow-sm transition-colors cursor-pointer"
            >
              {frag.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Rewrite Sentence Preview ────────────────────────────────────────────────

function RewriteSentencePreview({ content }: { content: RewriteSentenceContent }) {
  const [answer, setAnswer] = useState('');

  return (
    <div className="space-y-4">
      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
        <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">Original sentence:</p>
        <p className="text-base text-gray-900 dark:text-white">{content.originalSentence}</p>
      </div>

      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <span className="font-medium">Instruction:</span> {content.instruction}
        </p>
      </div>

      <div>
        <label htmlFor="rewrite-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Your rewritten sentence:
        </label>
        <input
          id="rewrite-input"
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          placeholder="Type your rewritten sentence here..."
        />
      </div>
    </div>
  );
}

// ─── Free Writing Preview ────────────────────────────────────────────────────

function FreeWritingPreview({ content }: { content: FreeWritingContent }) {
  const [text, setText] = useState('');
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <div className="space-y-4">
      <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl">
        <p className="text-sm font-medium text-purple-800 dark:text-purple-200 mb-1">Writing prompt:</p>
        <p className="text-base text-gray-900 dark:text-white">{content.prompt}</p>
      </div>

      {(content.minWords || content.maxWords) && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Word count:{' '}
          {content.minWords && `minimum ${content.minWords}`}
          {content.minWords && content.maxWords && ', '}
          {content.maxWords && `maximum ${content.maxWords}`}
        </p>
      )}

      <div>
        <label htmlFor="free-writing-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Your response:
        </label>
        <textarea
          id="free-writing-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-y"
          placeholder="Start writing here..."
        />
        <div className="mt-1 flex justify-end">
          <span className={`text-xs ${
            (content.minWords && wordCount < content.minWords) || (content.maxWords && wordCount > content.maxWords)
              ? 'text-red-500'
              : 'text-gray-400 dark:text-gray-500'
          }`}>
            {wordCount} words
          </span>
        </div>
      </div>
    </div>
  );
}
