import type { GrammarBlock } from '@/types'

interface SentencePreviewProps {
  blocks: GrammarBlock[]
}

export function SentencePreview({ blocks }: SentencePreviewProps) {
  const sentence = blocks.map(b => b.label).join(' ')

  return (
    <div className="w-full">
      <h3 className="text-sm font-medium text-muted-foreground mb-2">📝 Sentence Preview</h3>
      <div className="px-4 py-3 rounded-lg bg-surface-card border border-border min-h-[48px] flex items-center">
        {sentence ? (
          <p className="text-lg font-medium text-foreground">&ldquo;{sentence}&rdquo;</p>
        ) : (
          <p className="text-muted-foreground italic">Your sentence will appear here...</p>
        )}
      </div>
    </div>
  )
}
