'use client'

import type { LearnChallenge } from '@/lib/dal/learn'

export function CelebrationView({
  level,
  challenge,
  onStartChallenge,
  onBack,
}: {
  level: 'beginner' | 'intermediate'
  challenge: LearnChallenge
  onStartChallenge: () => void
  onBack: () => void
}) {
  const levelName = level === 'beginner' ? 'Beginner' : 'Intermediate'
  const nextLevel = level === 'beginner' ? 'Intermediate' : 'Advanced'

  return (
    <div className="mx-auto max-w-lg text-center space-y-8 py-12">
      {/* Celebration animation */}
      <div className="text-7xl animate-feedback-fade-in">🎉</div>

      <div className="space-y-3 animate-feedback-fade-in">
        <h1 className="text-3xl font-bold text-foreground">
          Congratulations!
        </h1>
        <p className="text-lg text-muted-foreground">
          You completed the <span className="font-bold text-foreground">{levelName} Path</span>!
        </p>
      </div>

      <div className="bg-surface-card border border-border rounded-xl p-6 space-y-4 animate-feedback-fade-in">
        <div className="text-4xl">🧠</div>
        <h2 className="text-xl font-bold text-foreground">
          Placement Challenge
        </h2>
        <p className="text-muted-foreground">
          Now it&apos;s time for your <span className="font-semibold">Placement Challenge</span>.
          This challenge will evaluate whether you have mastered the concepts required for the{' '}
          <span className="font-bold">{nextLevel}</span> level.
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground bg-surface-muted rounded-lg px-4 py-2">
          <span>📋</span>
          <span>{challenge.exercises.length} questions • Pass {challenge.requiredCorrect}/{challenge.exercises.length} to unlock {nextLevel}</span>
        </div>
      </div>

      <div className="flex flex-col gap-3 items-center animate-feedback-fade-in">
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
