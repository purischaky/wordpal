'use client'

import { useState } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { cn } from '@/lib/utils'
import type { BlockCategory, DraggableBlockProps } from '@/types'
import { GRAMMAR_EXPLANATIONS } from '@/types/exercise'

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
    case 'contrast':
      return 'bg-rose-500 border-rose-700 text-white'
  }
}

/** Returns a human-readable category label */
function getCategoryLabel(category: BlockCategory): string {
  switch (category) {
    case 'subject': return 'Subject'
    case 'verb': return 'Verb'
    case 'object': return 'Object'
    case 'modifier': return 'Modifier'
    case 'time': return 'Time'
    case 'place': return 'Place'
    case 'contrast': return 'Contrast'
  }
}

export function DraggableBlock({ block, isIncorrect, onTap, disabled, showTooltip = true }: DraggableBlockProps) {
  const [tooltipVisible, setTooltipVisible] = useState(false)
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: block.id,
    data: block,
    disabled,
  })

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined

  const colorClass = getColorClass(block.category)
  const explanation = GRAMMAR_EXPLANATIONS[block.category]
  const categoryLabel = getCategoryLabel(block.category)

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => showTooltip && setTooltipVisible(true)}
      onMouseLeave={() => setTooltipVisible(false)}
      onFocus={() => showTooltip && setTooltipVisible(true)}
      onBlur={() => setTooltipVisible(false)}
    >
      <button
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        onClick={onTap}
        disabled={disabled}
        aria-describedby={tooltipVisible ? `tooltip-${block.id}` : undefined}
        className={cn(
          'px-4 py-2 min-w-[44px] min-h-[44px] flex flex-col items-center justify-center gap-0.5',
          'rounded-lg border-2 font-semibold text-sm cursor-grab active:cursor-grabbing',
          'select-none transition-all duration-150',
          'shadow-[var(--shadow-block)]',
          colorClass,
          isDragging && 'opacity-90 scale-105 shadow-[var(--shadow-block-dragging)] z-50',
          isIncorrect && 'animate-shake-error',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
      >
        <span className="text-sm font-bold leading-tight">{block.label}</span>
        <span className="text-[10px] font-normal opacity-75 leading-none uppercase tracking-wide">
          {categoryLabel}
        </span>
      </button>

      {/* Tooltip with grammar explanation */}
      {tooltipVisible && !isDragging && (
        <div
          id={`tooltip-${block.id}`}
          role="tooltip"
          className={cn(
            'absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-[100]',
            'px-3 py-2 rounded-lg shadow-lg',
            'bg-foreground text-background text-xs font-medium',
            'whitespace-nowrap pointer-events-none',
            'animate-[feedback-fade-in_150ms_ease-out]',
          )}
        >
          <div className="font-bold mb-0.5">{categoryLabel}</div>
          <div className="opacity-80">{explanation}</div>
          {/* Tooltip arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-foreground" />
        </div>
      )}
    </div>
  )
}
