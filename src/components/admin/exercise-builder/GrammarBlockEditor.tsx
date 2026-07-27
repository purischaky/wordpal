'use client';

import { useState, useCallback } from 'react';
import type { GrammarBlock, BlockCategory } from '@/types/admin';

export interface GrammarBlockEditorProps {
  blocks: GrammarBlock[];
  onChange: (blocks: GrammarBlock[]) => void;
  minBlocks?: number;
  maxBlocks?: number;
}

/** Color mapping for each block category */
const CATEGORY_COLORS: Record<BlockCategory, { bg: string; border: string; text: string; badge: string }> = {
  subject: { bg: 'bg-blue-100 dark:bg-blue-900/30', border: 'border-blue-300 dark:border-blue-700', text: 'text-blue-800 dark:text-blue-200', badge: 'bg-blue-500' },
  verb: { bg: 'bg-green-100 dark:bg-green-900/30', border: 'border-green-300 dark:border-green-700', text: 'text-green-800 dark:text-green-200', badge: 'bg-green-500' },
  object: { bg: 'bg-orange-100 dark:bg-orange-900/30', border: 'border-orange-300 dark:border-orange-700', text: 'text-orange-800 dark:text-orange-200', badge: 'bg-orange-500' },
  time: { bg: 'bg-purple-100 dark:bg-purple-900/30', border: 'border-purple-300 dark:border-purple-700', text: 'text-purple-800 dark:text-purple-200', badge: 'bg-purple-500' },
  place: { bg: 'bg-pink-100 dark:bg-pink-900/30', border: 'border-pink-300 dark:border-pink-700', text: 'text-pink-800 dark:text-pink-200', badge: 'bg-pink-500' },
  connector: { bg: 'bg-teal-100 dark:bg-teal-900/30', border: 'border-teal-300 dark:border-teal-700', text: 'text-teal-800 dark:text-teal-200', badge: 'bg-teal-500' },
  modifier: { bg: 'bg-amber-100 dark:bg-amber-900/30', border: 'border-amber-300 dark:border-amber-700', text: 'text-amber-800 dark:text-amber-200', badge: 'bg-amber-500' },
};

const CATEGORY_LABELS: Record<BlockCategory, string> = {
  subject: 'Subject',
  verb: 'Verb',
  object: 'Object',
  time: 'Time',
  place: 'Place',
  connector: 'Connector',
  modifier: 'Modifier',
};

const ALL_CATEGORIES: BlockCategory[] = ['subject', 'verb', 'object', 'time', 'place', 'connector', 'modifier'];

export default function GrammarBlockEditor({
  blocks,
  onChange,
  minBlocks = 2,
  maxBlocks = 15,
}: GrammarBlockEditorProps) {
  const [newBlockLabel, setNewBlockLabel] = useState('');
  const [newBlockCategory, setNewBlockCategory] = useState<BlockCategory>('subject');
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const canAdd = blocks.length < maxBlocks;
  const canRemove = blocks.length > minBlocks;

  const handleAddBlock = useCallback(() => {
    if (!newBlockLabel.trim() || !canAdd) return;

    const newBlock: GrammarBlock = {
      id: `block-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      label: newBlockLabel.trim(),
      category: newBlockCategory,
      isDistractor: false,
      sourceOrder: blocks.length,
    };

    onChange([...blocks, newBlock]);
    setNewBlockLabel('');
  }, [newBlockLabel, newBlockCategory, canAdd, blocks, onChange]);

  const handleRemoveBlock = useCallback((blockId: string) => {
    if (!canRemove) return;
    onChange(blocks.filter((b) => b.id !== blockId));
  }, [canRemove, blocks, onChange]);

  const handleToggleDistractor = useCallback((blockId: string) => {
    onChange(
      blocks.map((b) =>
        b.id === blockId ? { ...b, isDistractor: !b.isDistractor } : b
      )
    );
  }, [blocks, onChange]);

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

    const reordered = [...blocks];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(dropIndex, 0, moved);

    // Update sourceOrder to reflect new positions
    const updated = reordered.map((block, idx) => ({
      ...block,
      sourceOrder: idx,
    }));

    onChange(updated);
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleAddFromPalette = (category: BlockCategory) => {
    if (!canAdd) return;
    const label = CATEGORY_LABELS[category];
    const newBlock: GrammarBlock = {
      id: `block-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      label,
      category,
      isDistractor: false,
      sourceOrder: blocks.length,
    };
    onChange([...blocks, newBlock]);
  };

  return (
    <div className="space-y-6">
      {/* Block Palette */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Block Palette
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          Click a category to add a block quickly, or use the form below for custom labels.
        </p>
        <div className="flex flex-wrap gap-2">
          {ALL_CATEGORIES.map((category) => {
            const colors = CATEGORY_COLORS[category];
            return (
              <button
                key={category}
                type="button"
                disabled={!canAdd}
                onClick={() => handleAddFromPalette(category)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all duration-200 ${colors.bg} ${colors.border} ${colors.text} ${
                  canAdd
                    ? 'hover:shadow-md cursor-pointer'
                    : 'opacity-50 cursor-not-allowed'
                }`}
                aria-label={`Add ${CATEGORY_LABELS[category]} block`}
              >
                <span className={`w-2.5 h-2.5 rounded-full ${colors.badge}`} />
                {CATEGORY_LABELS[category]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Block Input */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-gray-50 dark:bg-gray-800/50">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Add Custom Block
        </h4>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[160px]">
            <label htmlFor="block-label" className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Label
            </label>
            <input
              id="block-label"
              type="text"
              value={newBlockLabel}
              onChange={(e) => setNewBlockLabel(e.target.value)}
              placeholder="e.g., The cat"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={100}
            />
          </div>
          <div className="min-w-[140px]">
            <label htmlFor="block-category" className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Category
            </label>
            <select
              id="block-category"
              value={newBlockCategory}
              onChange={(e) => setNewBlockCategory(e.target.value as BlockCategory)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {ALL_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {CATEGORY_LABELS[cat]}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={handleAddBlock}
            disabled={!canAdd || !newBlockLabel.trim()}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Add custom block"
          >
            Add Block
          </button>
        </div>
      </div>

      {/* Block Count Indicator */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Blocks: <span className="font-semibold">{blocks.length}</span> / {maxBlocks}
          <span className="ml-2 text-xs">(minimum {minBlocks})</span>
        </p>
        {blocks.length >= maxBlocks && (
          <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
            Maximum blocks reached
          </p>
        )}
        {blocks.length <= minBlocks && blocks.length > 0 && (
          <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
            Minimum blocks reached
          </p>
        )}
      </div>

      {/* Block List */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Exercise Blocks
        </h3>
        {blocks.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              No blocks added yet. Use the palette above to add grammar blocks.
            </p>
          </div>
        ) : (
          <div className="space-y-1.5" role="list" aria-label="Grammar blocks">
            {blocks.map((block, index) => {
              const colors = CATEGORY_COLORS[block.category];
              const isDragging = dragIndex === index;
              const isDragOver = dragOverIndex === index;

              return (
                <div
                  key={block.id}
                  role="listitem"
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all duration-200 ${colors.bg} ${colors.border} ${
                    isDragging ? 'opacity-50 scale-95' : ''
                  } ${isDragOver ? 'ring-2 ring-blue-400' : ''} ${
                    block.isDistractor ? 'ring-1 ring-red-400 dark:ring-red-600' : ''
                  }`}
                >
                  {/* Drag Handle */}
                  <span
                    className="cursor-grab active:cursor-grabbing text-gray-400 dark:text-gray-500 select-none"
                    aria-label={`Drag to reorder block: ${block.label}`}
                  >
                    ⠿
                  </span>

                  {/* Color Indicator */}
                  <span className={`w-3 h-3 rounded-full flex-shrink-0 ${colors.badge}`} />

                  {/* Label */}
                  <span className={`flex-1 text-sm font-medium ${colors.text}`}>
                    {block.label}
                  </span>

                  {/* Category Badge */}
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${colors.bg} ${colors.text} border ${colors.border}`}>
                    {CATEGORY_LABELS[block.category]}
                  </span>

                  {/* Distractor Toggle */}
                  <button
                    type="button"
                    onClick={() => handleToggleDistractor(block.id)}
                    className={`px-2 py-0.5 text-xs font-medium rounded-full border transition-colors ${
                      block.isDistractor
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                    }`}
                    aria-label={block.isDistractor ? 'Mark as answer block' : 'Mark as distractor'}
                  >
                    {block.isDistractor ? 'Distractor' : 'Answer'}
                  </button>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveBlock(block.id)}
                    disabled={!canRemove}
                    className="p-1 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label={`Remove block: ${block.label}`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
