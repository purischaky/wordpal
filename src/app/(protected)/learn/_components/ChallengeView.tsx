'use client'

import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core'
import { SentenceCanvas } from '@/components/exercise/SentenceCanvas'
import { AvailableBlocks } from '@/components/exercise/AvailableBlocks'
import { SentencePreview } from '@/components/exercise/SentencePreview'
import { DraggableBlock } from '@/components/exercise/DraggableBlock'
import type { LearnChallenge } from '@/lib/dal/learn'
import { useSentenceBuilder } from './useSentenceBuilder'

export function ChallengeView({
  challenge,
  exerciseIndex,
  score,
  onExerciseComplete,
  onBack,
}: {
  challenge: LearnChallenge
  exerciseIndex: number
  score: { correct: number; total: number }
  onExerciseComplete: (correct: boolean) => void
  onBack: () => void
}) {
  const exercise = challenge.exercises[exerciseIndex]
  const {
    canvas, available, activeBlock, incorrectIds, result,
    sensors, handleDragStart, handleDragEnd, handleTapBlock, handleRemoveBlock, handleCheck,
  } = useSentenceBuilder(exercise)

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Exit Challenge
        </button>
        <div className="text-right">
          <p className="text-sm font-bold text-foreground">🧠 Placement Challenge</p>
          <p className="text-xs text-muted-foreground">{challenge.title}</p>
        </div>
      </div>

      {/* Score & Progress */}
      <div className="flex items-center justify-between bg-surface-card border border-border rounded-lg px-4 py-3">
        <div className="flex gap-2">
          {challenge.exercises.map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-all ${
                i < exerciseIndex ? 'bg-block-object' :
                i === exerciseIndex ? 'bg-wp-primary scale-125' :
                'bg-border'
              }`}
            />
          ))}
        </div>
        <div className="text-sm font-medium">
          <span className="text-block-object">{score.correct}</span>
          <span className="text-muted-foreground">/{challenge.requiredCorrect} needed</span>
        </div>
      </div>

      {/* Hint */}
      <div className="text-center px-4 py-2 rounded-lg bg-block-time-light border border-block-time/20">
        <p className="text-sm text-muted-foreground">
          💡 <span className="font-medium text-foreground">{exercise.hint}</span>
        </p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SentencePreview blocks={canvas} />

        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Sentence Canvas</h3>
          <SentenceCanvas
            blocks={canvas}
            incorrectBlockIds={incorrectIds}
            onRemoveBlock={handleRemoveBlock}
          />
        </div>

        <AvailableBlocks blocks={available} onTapBlock={handleTapBlock} />

        <DragOverlay>
          {activeBlock && (
            <DraggableBlock
              block={activeBlock}
              isDragging={true}
              isIncorrect={false}
              onTap={() => {}}
              showTooltip={false}
            />
          )}
        </DragOverlay>
      </DndContext>

      {/* Result */}
      {result && (
        <div
          className={`p-4 rounded-xl text-center font-medium animate-feedback-fade-in ${
            result === 'correct'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          {result === 'correct' ? '🎉 Correct!' : '❌ Not quite.'}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-center gap-3 pt-2">
        {result !== null ? (
          <button
            onClick={() => onExerciseComplete(result === 'correct')}
            className="px-6 py-3 rounded-lg bg-wp-primary hover:bg-wp-primary-hover text-white font-semibold transition-colors"
          >
            {exerciseIndex + 1 < challenge.exercises.length ? '→ Next Question' : '📊 See Results'}
          </button>
        ) : (
          <button
            onClick={handleCheck}
            disabled={canvas.length === 0}
            className="px-6 py-3 rounded-lg bg-wp-primary hover:bg-wp-primary-hover text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ✓ Check Sentence
          </button>
        )}
      </div>
    </div>
  )
}
