'use client'

import { useState, useCallback, useEffect } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { SentenceCanvas } from '@/components/exercise/SentenceCanvas'
import { AvailableBlocks } from '@/components/exercise/AvailableBlocks'
import { SentencePreview } from '@/components/exercise/SentencePreview'
import { DraggableBlock } from '@/components/exercise/DraggableBlock'
import type { GrammarBlock } from '@/types'
import { LEARNING_PATH, type PathLesson, type PathExercise } from '@/data/learning-path'
import { shuffleBlocks } from '@/data/demo-sentences'
import { getChallengeForLevel, type PlacementChallenge } from '@/data/placement-challenges'

// ─── Learning Path View ───────────────────────────────────────────────────────

function LearningPathView({
  progress,
  challengesPassed,
  isLessonUnlocked,
  isLevelComplete,
  isChallengePassedFor,
  onStartLesson,
  onStartChallenge,
}: {
  progress: Record<string, number>
  challengesPassed: string[]
  isLessonUnlocked: (index: number) => boolean
  isLevelComplete: (level: 'beginner' | 'intermediate' | 'advanced') => boolean
  isChallengePassedFor: (fromLevel: 'beginner' | 'intermediate') => boolean
  onStartLesson: (lessonIndex: number) => void
  onStartChallenge: (level: 'beginner' | 'intermediate') => void
}) {
  return (
    <div className="mx-auto max-w-md space-y-4">
      {/* Header */}
      <div className="text-center space-y-2 mb-8">
        <div className="flex items-center justify-center gap-3">
          <img src="/logo.png" alt="WordPal" className="w-12 h-12" />
          <h1 className="text-3xl font-bold" style={{ color: '#FE669A' }}>WordPal</h1>
        </div>
        <p className="text-muted-foreground">Your learning journey</p>
      </div>

      {/* Path Nodes */}
      <div className="relative">
        {/* Connecting line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border" />

        {LEARNING_PATH.map((lesson, index) => {
          const completed = (progress[lesson.id] || 0) >= lesson.exercises.length
          const exercisesDone = progress[lesson.id] || 0
          const isUnlocked = isLessonUnlocked(index)
          const isCurrent = isUnlocked && !completed
          const progressPercent = Math.round((exercisesDone / lesson.exercises.length) * 100)

          const levelColor = lesson.level === 'beginner'
            ? 'border-block-object bg-block-object-light'
            : lesson.level === 'intermediate'
              ? 'border-block-time bg-block-time-light'
              : 'border-rose-500 bg-red-50'

          return (
            <div key={lesson.id} className="relative flex items-start gap-4 pb-6">
              {/* Node circle */}
              <div
                className={`relative z-10 flex items-center justify-center w-16 h-16 rounded-full border-[3px] text-2xl shrink-0 transition-all ${
                  completed
                    ? 'border-block-object bg-block-object-light'
                    : isCurrent
                      ? `${levelColor} shadow-lg scale-110`
                      : 'border-border bg-surface-muted opacity-50'
                }`}
              >
                {completed ? '✅' : lesson.icon}
              </div>

              {/* Content */}
              <div className="flex-1 pt-2">
                <div className="flex items-center gap-2">
                  <h3 className={`font-bold ${isUnlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {lesson.title}
                  </h3>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                    lesson.level === 'beginner' ? 'bg-block-object/20 text-block-object-dark' :
                    lesson.level === 'intermediate' ? 'bg-block-time/20 text-block-time-dark' :
                    'bg-rose-100 text-rose-700'
                  }`}>
                    {lesson.level}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{lesson.description}</p>

                {/* Progress bar */}
                {isUnlocked && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          completed ? 'bg-block-object' : 'bg-wp-primary'
                        }`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">
                      {exercisesDone}/{lesson.exercises.length}
                    </span>
                  </div>
                )}

                {/* Button */}
                {isUnlocked && !completed && (
                  <button
                    onClick={() => onStartLesson(index)}
                    className="mt-3 px-4 py-2 rounded-lg bg-wp-primary hover:bg-wp-primary-hover text-white text-sm font-semibold transition-colors"
                  >
                    {exercisesDone > 0 ? 'Continue' : 'Start'}
                  </button>
                )}
                {completed && (
                  <button
                    onClick={() => onStartLesson(index)}
                    className="mt-3 px-4 py-2 rounded-lg border border-border text-muted-foreground text-sm font-medium hover:bg-surface-muted transition-colors"
                  >
                    Practice Again
                  </button>
                )}
                {!isUnlocked && (
                  <p className="mt-2 text-xs text-muted-foreground">🔒 Complete previous lesson to unlock</p>
                )}
              </div>
            </div>
          )
        })}

        {/* Challenge nodes between levels */}
        {(['beginner', 'intermediate'] as const).map(level => {
          const levelComplete = isLevelComplete(level)
          const challengePassed = isChallengePassedFor(level)
          const nextLevel = level === 'beginner' ? 'Intermediate' : 'Advanced'

          if (!levelComplete) return null

          // Find the index after the last lesson of this level
          const lastLessonOfLevel = LEARNING_PATH.filter(l => l.level === level).slice(-1)[0]
          const lastIndex = LEARNING_PATH.indexOf(lastLessonOfLevel)
          const firstNextLesson = LEARNING_PATH[lastIndex + 1]
          if (!firstNextLesson) return null

          return (
            <div key={`challenge-${level}`} className="relative flex items-start gap-4 pb-6" style={{ order: lastIndex + 1 }}>
              <div className={`relative z-10 flex items-center justify-center w-16 h-16 rounded-full border-[3px] text-2xl shrink-0 ${
                challengePassed ? 'border-block-object bg-block-object-light' : 'border-block-time bg-block-time-light shadow-lg animate-pulse'
              }`}>
                {challengePassed ? '✅' : '🧠'}
              </div>
              <div className="flex-1 pt-2">
                <h3 className="font-bold text-foreground">AI Placement Challenge</h3>
                <p className="text-sm text-muted-foreground">
                  {challengePassed
                    ? `Passed! ${nextLevel} unlocked.`
                    : `Pass to unlock ${nextLevel} level`
                  }
                </p>
                {!challengePassed && (
                  <button
                    onClick={() => onStartChallenge(level)}
                    className="mt-3 px-4 py-2 rounded-lg bg-block-time hover:bg-block-time-dark text-white text-sm font-semibold transition-colors"
                  >
                    🚀 Take Challenge
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Exercise View ────────────────────────────────────────────────────────────

function ExerciseView({
  lesson,
  exerciseIndex,
  onComplete,
  onBack,
}: {
  lesson: PathLesson
  exerciseIndex: number
  onComplete: () => void
  onBack: () => void
}) {
  const exercise = lesson.exercises[exerciseIndex]
  const [canvas, setCanvas] = useState<GrammarBlock[]>([])
  const [available, setAvailable] = useState<GrammarBlock[]>([])
  const [activeBlock, setActiveBlock] = useState<GrammarBlock | null>(null)
  const [incorrectIds, setIncorrectIds] = useState<string[]>([])
  const [result, setResult] = useState<'correct' | 'incorrect' | null>(null)

  useEffect(() => {
    setCanvas([])
    setAvailable(shuffleBlocks(exercise.blocks))
    setIncorrectIds([])
    setResult(null)
  }, [exercise])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const block = event.active.data.current as GrammarBlock | undefined
    if (block) setActiveBlock(block)
  }, [])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveBlock(null)
    const { active, over } = event
    if (!over) return
    const draggedBlock = active.data.current as GrammarBlock | undefined
    if (!draggedBlock) return

    const isFromAvailable = available.some(b => b.id === active.id)
    const isOnCanvas = over.id === 'canvas' || canvas.some(b => b.id === over.id)

    if (isFromAvailable && isOnCanvas) {
      if (canvas.length >= 15) return
      setAvailable(prev => prev.filter(b => b.id !== active.id))
      setCanvas(prev => [...prev, draggedBlock])
      setIncorrectIds([])
      setResult(null)
      return
    }

    const isReorder = canvas.some(b => b.id === active.id) && canvas.some(b => b.id === over.id)
    if (isReorder) {
      const oldIndex = canvas.findIndex(b => b.id === active.id)
      const newIndex = canvas.findIndex(b => b.id === over.id)
      setCanvas(prev => arrayMove(prev, oldIndex, newIndex))
      setIncorrectIds([])
      setResult(null)
    }
  }, [available, canvas])

  const handleTapBlock = useCallback((blockId: string) => {
    if (canvas.length >= 15) return
    const block = available.find(b => b.id === blockId)
    if (!block) return
    setAvailable(prev => prev.filter(b => b.id !== blockId))
    setCanvas(prev => [...prev, block])
    setIncorrectIds([])
    setResult(null)
  }, [available, canvas])

  const handleRemoveBlock = useCallback((blockId: string) => {
    const block = canvas.find(b => b.id === blockId)
    if (!block) return
    setCanvas(prev => prev.filter(b => b.id !== blockId))
    setAvailable(prev => [...prev, block].sort((a, b) => a.sourceOrder - b.sourceOrder))
    setIncorrectIds([])
    setResult(null)
  }, [canvas])

  const handleCheck = useCallback(() => {
    const current = canvas.map(b => b.label).join(' ')
    if (current === exercise.targetSentence) {
      setIncorrectIds([])
      setResult('correct')
    } else {
      const targetWords = exercise.targetSentence.split(' ')
      const wrong: string[] = []
      let pos = 0
      for (const block of canvas) {
        const words = block.label.split(' ')
        const expected = targetWords.slice(pos, pos + words.length).join(' ')
        if (block.label !== expected) wrong.push(block.id)
        pos += words.length
      }
      setIncorrectIds(wrong)
      setResult('incorrect')
    }
  }, [canvas, exercise])

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to Path
        </button>
        <div className="text-right">
          <p className="text-sm font-bold text-foreground">{lesson.icon} {lesson.title}</p>
          <p className="text-xs text-muted-foreground">
            Exercise {exerciseIndex + 1} of {lesson.exercises.length}
          </p>
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-2">
        {lesson.exercises.map((_, i) => (
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

      {/* Hint */}
      <div className="text-center px-4 py-2 rounded-lg bg-block-subject-light border border-block-subject/20">
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
          className={`p-4 rounded-xl font-medium animate-[feedback-fade-in_300ms_ease-out] ${
            result === 'correct'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          {result === 'correct' ? (
            <p className="text-lg text-center">🎉 Correct!</p>
          ) : (
            <div className="space-y-3">
              <p className="text-lg text-center">
                {lesson.level === 'beginner' ? '❌ Incorrecto - te explico:' : '❌ Not quite — let me explain:'}
              </p>
              <div className="bg-white/60 rounded-lg p-3 text-sm leading-relaxed text-red-900">
                <div className="flex items-start gap-2">
                  <span className="text-lg shrink-0">🎓</span>
                  <p>{exercise.tutorExplanation}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-center gap-3 pt-2">
        {result === 'correct' ? (
          <button
            onClick={onComplete}
            className="px-6 py-3 rounded-lg bg-wp-primary hover:bg-wp-primary-hover text-white font-semibold transition-colors"
          >
            {exerciseIndex + 1 < lesson.exercises.length ? '→ Next Exercise' : '🏆 Complete Lesson'}
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

// ─── Celebration View ─────────────────────────────────────────────────────────

function CelebrationView({
  level,
  onStartChallenge,
  onBack,
}: {
  level: 'beginner' | 'intermediate'
  onStartChallenge: () => void
  onBack: () => void
}) {
  const levelName = level === 'beginner' ? 'Beginner' : 'Intermediate'
  const nextLevel = level === 'beginner' ? 'Intermediate' : 'Advanced'
  const challenge = getChallengeForLevel(level)

  return (
    <div className="mx-auto max-w-lg text-center space-y-8 py-12">
      {/* Celebration animation */}
      <div className="text-7xl animate-[feedback-fade-in_500ms_ease-out]">🎉</div>

      <div className="space-y-3 animate-[feedback-fade-in_600ms_ease-out]">
        <h1 className="text-3xl font-bold text-foreground">
          Congratulations!
        </h1>
        <p className="text-lg text-muted-foreground">
          You completed the <span className="font-bold text-foreground">{levelName} Path</span>!
        </p>
      </div>

      <div className="bg-surface-card border border-border rounded-xl p-6 space-y-4 animate-[feedback-fade-in_700ms_ease-out]">
        <div className="text-4xl">🧠</div>
        <h2 className="text-xl font-bold text-foreground">
          AI Placement Challenge
        </h2>
        <p className="text-muted-foreground">
          Now it&apos;s time for your <span className="font-semibold">AI Placement Challenge</span>.
          This challenge will evaluate whether you have mastered the concepts required for the{' '}
          <span className="font-bold">{nextLevel}</span> level.
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground bg-surface-muted rounded-lg px-4 py-2">
          <span>📋</span>
          <span>{challenge.exercises.length} questions • Pass {challenge.requiredCorrect}/{challenge.exercises.length} to unlock {nextLevel}</span>
        </div>
      </div>

      <div className="flex flex-col gap-3 items-center animate-[feedback-fade-in_800ms_ease-out]">
        <button
          onClick={onStartChallenge}
          className="px-8 py-4 rounded-lg bg-wp-primary hover:bg-wp-primary-hover text-white font-bold text-lg transition-colors shadow-lg"
        >
          🚀 Take the Challenge
        </button>
        <button
          onClick={onBack}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Later — back to path
        </button>
      </div>
    </div>
  )
}

// ─── Challenge View ───────────────────────────────────────────────────────────

function ChallengeView({
  challenge,
  exerciseIndex,
  score,
  onExerciseComplete,
  onBack,
}: {
  challenge: PlacementChallenge
  exerciseIndex: number
  score: { correct: number; total: number }
  onExerciseComplete: (correct: boolean) => void
  onBack: () => void
}) {
  const exercise = challenge.exercises[exerciseIndex]
  const [canvas, setCanvas] = useState<GrammarBlock[]>([])
  const [available, setAvailable] = useState<GrammarBlock[]>([])
  const [activeBlock, setActiveBlock] = useState<GrammarBlock | null>(null)
  const [incorrectIds, setIncorrectIds] = useState<string[]>([])
  const [result, setResult] = useState<'correct' | 'incorrect' | null>(null)

  useEffect(() => {
    setCanvas([])
    setAvailable(shuffleBlocks(exercise.blocks))
    setIncorrectIds([])
    setResult(null)
  }, [exercise])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const block = event.active.data.current as GrammarBlock | undefined
    if (block) setActiveBlock(block)
  }, [])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveBlock(null)
    const { active, over } = event
    if (!over) return
    const draggedBlock = active.data.current as GrammarBlock | undefined
    if (!draggedBlock) return

    const isFromAvailable = available.some(b => b.id === active.id)
    const isOnCanvas = over.id === 'canvas' || canvas.some(b => b.id === over.id)

    if (isFromAvailable && isOnCanvas) {
      if (canvas.length >= 15) return
      setAvailable(prev => prev.filter(b => b.id !== active.id))
      setCanvas(prev => [...prev, draggedBlock])
      setIncorrectIds([])
      setResult(null)
      return
    }

    const isReorder = canvas.some(b => b.id === active.id) && canvas.some(b => b.id === over.id)
    if (isReorder) {
      const oldIndex = canvas.findIndex(b => b.id === active.id)
      const newIndex = canvas.findIndex(b => b.id === over.id)
      setCanvas(prev => arrayMove(prev, oldIndex, newIndex))
      setIncorrectIds([])
      setResult(null)
    }
  }, [available, canvas])

  const handleTapBlock = useCallback((blockId: string) => {
    if (canvas.length >= 15) return
    const block = available.find(b => b.id === blockId)
    if (!block) return
    setAvailable(prev => prev.filter(b => b.id !== blockId))
    setCanvas(prev => [...prev, block])
    setIncorrectIds([])
    setResult(null)
  }, [available, canvas])

  const handleRemoveBlock = useCallback((blockId: string) => {
    const block = canvas.find(b => b.id === blockId)
    if (!block) return
    setCanvas(prev => prev.filter(b => b.id !== blockId))
    setAvailable(prev => [...prev, block].sort((a, b) => a.sourceOrder - b.sourceOrder))
    setIncorrectIds([])
    setResult(null)
  }, [canvas])

  const handleCheck = useCallback(() => {
    const current = canvas.map(b => b.label).join(' ')
    if (current === exercise.targetSentence) {
      setIncorrectIds([])
      setResult('correct')
    } else {
      const targetWords = exercise.targetSentence.split(' ')
      const wrong: string[] = []
      let pos = 0
      for (const block of canvas) {
        const words = block.label.split(' ')
        const expected = targetWords.slice(pos, pos + words.length).join(' ')
        if (block.label !== expected) wrong.push(block.id)
        pos += words.length
      }
      setIncorrectIds(wrong)
      setResult('incorrect')
    }
  }, [canvas, exercise])

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
                i < exerciseIndex ? (i < score.correct + (score.total - score.correct - (exerciseIndex - score.total)) ? 'bg-block-object' : 'bg-feedback-error') :
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
          className={`p-4 rounded-xl text-center font-medium animate-[feedback-fade-in_300ms_ease-out] ${
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

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DemoPage() {
  const [view, setView] = useState<'path' | 'exercise' | 'celebration' | 'challenge'>('path')
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0)
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [progress, setProgress] = useState<Record<string, number>>({})
  const [challengesPassed, setChallengesPassed] = useState<string[]>([])
  const [pendingChallenge, setPendingChallenge] = useState<'beginner' | 'intermediate' | null>(null)
  const [challengeScore, setChallengeScore] = useState({ correct: 0, total: 0 })
  const [challengeExerciseIndex, setChallengeExerciseIndex] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('wordpal-progress')
    if (saved) {
      const data = JSON.parse(saved)
      setProgress(data.lessons || {})
      setChallengesPassed(data.challengesPassed || [])
    }
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('wordpal-progress', JSON.stringify({
        lessons: progress,
        challengesPassed,
      }))
    }
  }, [progress, challengesPassed, mounted])

  // Determine if a level's lessons are all complete
  const isLevelComplete = useCallback((level: 'beginner' | 'intermediate' | 'advanced') => {
    return LEARNING_PATH
      .filter(l => l.level === level)
      .every(l => (progress[l.id] || 0) >= l.exercises.length)
  }, [progress])

  // Check if a challenge is passed
  const isChallengePassedFor = useCallback((fromLevel: 'beginner' | 'intermediate') => {
    return challengesPassed.includes(`challenge-${fromLevel}-passed`)
  }, [challengesPassed])

  // Updated unlock logic: lessons within a level unlock sequentially,
  // but crossing levels requires passing the challenge
  const isLessonUnlocked = useCallback((index: number) => {
    if (index === 0) return true
    const lesson = LEARNING_PATH[index]
    const prevLesson = LEARNING_PATH[index - 1]

    // Previous lesson must be complete
    const prevComplete = (progress[prevLesson.id] || 0) >= prevLesson.exercises.length
    if (!prevComplete) return false

    // If crossing level boundary, check challenge
    if (prevLesson.level !== lesson.level) {
      if (prevLesson.level === 'beginner') return isChallengePassedFor('beginner')
      if (prevLesson.level === 'intermediate') return isChallengePassedFor('intermediate')
    }

    return true
  }, [progress, isChallengePassedFor])

  const handleStartLesson = useCallback((lessonIndex: number) => {
    const lesson = LEARNING_PATH[lessonIndex]
    const done = progress[lesson.id] || 0
    setCurrentLessonIndex(lessonIndex)
    setCurrentExerciseIndex(done >= lesson.exercises.length ? 0 : done)
    setView('exercise')
  }, [progress])

  const handleExerciseComplete = useCallback(() => {
    const lesson = LEARNING_PATH[currentLessonIndex]
    const nextExercise = currentExerciseIndex + 1

    if (nextExercise < lesson.exercises.length) {
      setCurrentExerciseIndex(nextExercise)
      setProgress(prev => ({
        ...prev,
        [lesson.id]: Math.max(prev[lesson.id] || 0, nextExercise),
      }))
    } else {
      // Lesson complete
      setProgress(prev => ({
        ...prev,
        [lesson.id]: lesson.exercises.length,
      }))

      // Check if this completes a level and needs a challenge
      const level = lesson.level
      const allLevelLessons = LEARNING_PATH.filter(l => l.level === level)
      const allComplete = allLevelLessons.every(l => {
        const lid = l.id
        const count = lid === lesson.id ? lesson.exercises.length : (progress[lid] || 0)
        return count >= l.exercises.length
      })

      if (allComplete && (level === 'beginner' || level === 'intermediate')) {
        const alreadyPassed = challengesPassed.includes(`challenge-${level}-passed`)
        if (!alreadyPassed) {
          setPendingChallenge(level)
          setView('celebration')
          return
        }
      }

      setView('path')
    }
  }, [currentLessonIndex, currentExerciseIndex, progress, challengesPassed])

  const handleStartChallenge = useCallback(() => {
    setChallengeScore({ correct: 0, total: 0 })
    setChallengeExerciseIndex(0)
    setView('challenge')
  }, [])

  const handleChallengeExerciseComplete = useCallback((correct: boolean) => {
    const newScore = {
      correct: challengeScore.correct + (correct ? 1 : 0),
      total: challengeScore.total + 1,
    }
    setChallengeScore(newScore)

    if (!pendingChallenge) return

    const challenge = getChallengeForLevel(pendingChallenge)
    const nextIndex = challengeExerciseIndex + 1

    if (nextIndex < challenge.exercises.length) {
      setChallengeExerciseIndex(nextIndex)
    } else {
      // Challenge complete — check if passed
      if (newScore.correct >= challenge.requiredCorrect) {
        setChallengesPassed(prev => [...prev, `challenge-${pendingChallenge}-passed`])
      }
      setView('path')
      setPendingChallenge(null)
    }
  }, [challengeScore, challengeExerciseIndex, pendingChallenge])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-surface p-4 md:p-8">
        <div className="mx-auto max-w-md space-y-6 animate-pulse">
          <div className="h-12 bg-surface-muted rounded w-48 mx-auto" />
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-4">
                <div className="w-16 h-16 bg-surface-muted rounded-full shrink-0" />
                <div className="flex-1 space-y-2 pt-2">
                  <div className="h-5 bg-surface-muted rounded w-32" />
                  <div className="h-4 bg-surface-muted rounded w-48" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface p-4 md:p-8">
      {view === 'path' && (
        <LearningPathView
          progress={progress}
          challengesPassed={challengesPassed}
          isLessonUnlocked={isLessonUnlocked}
          isLevelComplete={isLevelComplete}
          isChallengePassedFor={isChallengePassedFor}
          onStartLesson={handleStartLesson}
          onStartChallenge={(level) => { setPendingChallenge(level); setView('celebration') }}
        />
      )}
      {view === 'exercise' && (
        <ExerciseView
          lesson={LEARNING_PATH[currentLessonIndex]}
          exerciseIndex={currentExerciseIndex}
          onComplete={handleExerciseComplete}
          onBack={() => setView('path')}
        />
      )}
      {view === 'celebration' && pendingChallenge && (
        <CelebrationView
          level={pendingChallenge}
          onStartChallenge={handleStartChallenge}
          onBack={() => { setView('path'); setPendingChallenge(null) }}
        />
      )}
      {view === 'challenge' && pendingChallenge && (
        <ChallengeView
          challenge={getChallengeForLevel(pendingChallenge)}
          exerciseIndex={challengeExerciseIndex}
          score={challengeScore}
          onExerciseComplete={handleChallengeExerciseComplete}
          onBack={() => { setView('path'); setPendingChallenge(null) }}
        />
      )}
    </div>
  )
}
