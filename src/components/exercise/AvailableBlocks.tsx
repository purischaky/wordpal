'use client'

import { DraggableBlock } from './DraggableBlock'
import type { GrammarBlock } from '@/types'

interface AvailableBlocksProps {
  blocks: GrammarBlock[];
  incorrectBlockIds?: string[];
  onTapBlock: (blockId: string) => void;
}

export function AvailableBlocks({ blocks, onTapBlock }: AvailableBlocksProps) {
  const sortedBlocks = [...blocks].sort((a, b) => (a.sourceOrder ?? 0) - (b.sourceOrder ?? 0))

  return (
    <div>
      <h3 className="text-sm font-medium text-muted-foreground mb-3">Available Blocks</h3>
      <div className="flex flex-wrap gap-2 min-h-[60px] p-4 rounded-xl bg-surface-muted border border-border">
        {sortedBlocks.length > 0 ? (
          sortedBlocks.map((block) => (
            <DraggableBlock
              key={block.id}
              block={block}
              isDragging={false}
              isIncorrect={false}
              onTap={() => onTapBlock(block.id)}
            />
          ))
        ) : (
          <p className="text-sm text-muted-foreground italic">All blocks placed</p>
        )}
      </div>
    </div>
  )
}
