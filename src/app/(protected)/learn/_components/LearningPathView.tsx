'use client'

import type { LearnLesson } from '@/lib/dal/learn'

export function LearningPathView({
  lessons,
  progress,
  isLessonUnlocked,
  isLevelComplete,
  isChallengePassedFor,
  onStartLesson,
  onStartChallenge,
}: {
  lessons: LearnLesson[]
  progress: Record<string, number>
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

        {lessons.map((lesson, index) => {
          const completed = (progress[lesson.id] || 0) >= lesson.exercises.length
          const exercisesDone = progress[lesson.id] || 0
          const isUnlocked = isLessonUnlocked(index)
          const isCurrent = isUnlocked && !completed
          const progressPercent = lesson.exercises.length > 0
            ? Math.round((exercisesDone / lesson.exercises.length) * 100)
            : 0

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
          const lastLessonOfLevel = lessons.filter(l => l.level === level).slice(-1)[0]
          const lastIndex = lessons.indexOf(lastLessonOfLevel)
          const firstNextLesson = lessons[lastIndex + 1]
          if (!firstNextLesson) return null

          return (
            <div key={`challenge-${level}`} className="relative flex items-start gap-4 pb-6" style={{ order: lastIndex + 1 }}>
              <div className={`relative z-10 flex items-center justify-center w-16 h-16 rounded-full border-[3px] text-2xl shrink-0 ${
                challengePassed ? 'border-block-object bg-block-object-light' : 'border-block-time bg-block-time-light shadow-lg animate-pulse'
              }`}>
                {challengePassed ? '✅' : '🧠'}
              </div>
              <div className="flex-1 pt-2">
                <h3 className="font-bold text-foreground">Placement Challenge</h3>
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
