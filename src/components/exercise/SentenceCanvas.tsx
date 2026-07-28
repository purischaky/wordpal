'use client'

import { useDroppable } from '@dnd-kit/core'
import {
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '@/lib/utils'
import type { GrammarBlock, BlockCategory } from '@/types'

/** Props for the SentenceCanvas component */
export interface SentenceCanvasProps {
  blocks: GrammarBlock[]
  incorrectBlockIds: string[]
  onRemoveBlock: (blockId: string) => void
  maxBlocks?: number
}

/** Returns Tailwind color classes for a given block category */
function getColorClass(category: BlockCategory): string {
  switch (category) {
    case 'subject':
      return 'bg-block-subject border-block-subject-dark text-white'
    case 'verb':
      return 'bg-block-verb border-block-verb-dark text-white'
    case 'object':
      return 'bg-block-object border-block-object-dark text-white'
    case 'modifier':
      return 'bg-block-modifier border-block-modifier-dark text-white'
    case 'time':
      return 'bg-block-time border-block-time-dark text-white'
    case 'place':
      return 'bg-block-place border-block-place-dark text-white'
    case 'connector':
      return 'bg-block-connector border-block-connector-dark text-white'
    case 'contrast':
      return 'bg-block-contrast border-block-contrast-dark text-white'
  }
}

/** A sortable block inside the canvas that supports reordering and click-to-remove */
function SortableBlock({
  block,
  isIncorrect,
  onRemove,
}: {
  block: GrammarBlock
  isIncorrect: boolean
  onRemove: () => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const colorClass = getColorClass(block.category)

  return (
    <button
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        // Only trigger remove on click, not at the end of a drag
        if (!isDragging) {
          e.stopPropagation()
          onRemove()
        }
      }}
      aria-label={`Remove ${block.label} from sentence`}
      className={cn(
        'px-4 py-2 min-w-[44px] min-h-[44px] flex items-center justify-center',
        'rounded-lg border-2 font-semibold text-sm cursor-grab active:cursor-grabbing',
        'select-none transition-all duration-150',
        'shadow-[var(--shadow-block)]',
        'hover:opacity-80',
        colorClass,
        isDragging && 'opacity-90 scale-105 shadow-[var(--shadow-block-dragging)] z-50',
        isIncorrect && 'animate-shake-error',
      )}
    >
      {block.label}
    </button>
  )
}

/**
 * SentenceCanvas — the drop zone where learners arrange grammar blocks to build sentences.
 *
 * Supports:
 * - Accepting new blocks dropped from the available area (useDroppable)
 * - Reordering blocks within the canvas (SortableContext)
 * - Click-to-remove blocks back to the available area
 * - 15-block maximum limit enforcement
 */
export function SentenceCanvas({
  blocks,
  incorrectBlockIds,
  onRemoveBlock,
  maxBlocks = 15,
}: SentenceCanvasProps) {
  const { isOver, setNodeRef } = useDroppable({ id: 'canvas' })

  const blockIds = blocks.map((b) => b.id)
  const isFull = blocks.length >= maxBlocks

  return (
    <div className="space-y-2">
      <SortableContext items={blockIds} strategy={horizontalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={cn(
            'min-h-[120px] flex flex-wrap gap-2 items-center p-4 rounded-xl transition-colors duration-200',
            blocks.length === 0
              ? 'border-2 border-dashed border-muted-foreground/30'
              : 'border-2 border-solid border-border',
            isOver && 'border-wp-primary bg-block-subject-light/30',
          )}
        >
          {blocks.length === 0 ? (
            <p className="text-muted-foreground text-sm w-full text-center">
              Drag blocks here to build your sentence
            </p>
          ) : (
            blocks.map((block) => (
              <SortableBlock
                key={block.id}
                block={block}
                isIncorrect={incorrectBlockIds.includes(block.id)}
                onRemove={() => onRemoveBlock(block.id)}
              />
            ))
          )}
        </div>
      </SortableContext>

      {isFull && (
        <p className="text-sm text-feedback-warning font-medium" role="alert">
          Maximum blocks reached. Remove one to add another.
        </p>
      )}
    </div>
  )
}
