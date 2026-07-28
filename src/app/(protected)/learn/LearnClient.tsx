'use client'

import { useState, useCallback } from 'react'
import type { LearnLesson, LearnChallenge, LearnProgress } from '@/lib/dal/learn'
import { LearningPathView } from './_components/LearningPathView'
import { ExerciseView } from './_components/ExerciseView'
import { CelebrationView } from './_components/CelebrationView'
import { ChallengeView } from './_components/ChallengeView'

type Level = 'beginner' | 'intermediate'

export function LearnClient({
  lessons,
  challenges,
  initialProgress,
}: {
  lessons: LearnLesson[]
  challenges: LearnChallenge[]
  initialProgress: LearnProgress
}) {
  const [view, setView] = useState<'path' | 'exercise' | 'celebration' | 'challenge'>('path')
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0)
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [progress, setProgress] = useState<Record<string, number>>(initialProgress.lessons)
  const [challengesPassed, setChallengesPassed] = useState<string[]>(initialProgress.challengesPassed)
  const [pendingChallenge, setPendingChallenge] = useState<Level | null>(null)
  const [challengeScore, setChallengeScore] = useState({ correct: 0, total: 0 })
  const [challengeExerciseIndex, setChallengeExerciseIndex] = useState(0)

  const getChallengeForLevel = useCallback(
    (level: Level) => challenges.find((c) => c.fromLevel === level),
    [challenges]
  )

  const isLevelComplete = useCallback((level: 'beginner' | 'intermediate' | 'advanced') => {
    const levelLessons = lessons.filter((l) => l.level === level)
    if (levelLessons.length === 0) return false
    return levelLessons.every((l) => (progress[l.id] || 0) >= l.exercises.length)
  }, [lessons, progress])

  const isChallengePassedFor = useCallback((fromLevel: Level) => {
    return challengesPassed.includes(`challenge-${fromLevel}-passed`)
  }, [challengesPassed])

  const isLessonUnlocked = useCallback((index: number) => {
    if (index === 0) return true
    const lesson = lessons[index]
    const prevLesson = lessons[index - 1]

    const prevComplete = (progress[prevLesson.id] || 0) >= prevLesson.exercises.length
    if (!prevComplete) return false

    if (prevLesson.level !== lesson.level) {
      if (prevLesson.level === 'beginner') return isChallengePassedFor('beginner')
      if (prevLesson.level === 'intermediate') return isChallengePassedFor('intermediate')
    }

    return true
  }, [lessons, progress, isChallengePassedFor])

  const handleStartLesson = useCallback((lessonIndex: number) => {
    const lesson = lessons[lessonIndex]
    const done = progress[lesson.id] || 0
    setCurrentLessonIndex(lessonIndex)
    setCurrentExerciseIndex(done >= lesson.exercises.length ? 0 : done)
    setView('exercise')
  }, [lessons, progress])

  const handleExerciseComplete = useCallback(async (correct: boolean) => {
    const lesson = lessons[currentLessonIndex]
    const exercise = lesson.exercises[currentExerciseIndex]
    const nextExercise = currentExerciseIndex + 1

    try {
      await fetch('/api/learn/exercise-attempt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exerciseId: exercise.id, isCorrect: correct }),
      })
    } catch {
      // Best-effort: the UI already reflects local progress optimistically;
      // a failed write here just means this exercise isn't durably recorded.
    }

    if (nextExercise < lesson.exercises.length) {
      setCurrentExerciseIndex(nextExercise)
      setProgress(prev => ({
        ...prev,
        [lesson.id]: Math.max(prev[lesson.id] || 0, nextExercise),
      }))
      return
    }

    setProgress(prev => ({
      ...prev,
      [lesson.id]: lesson.exercises.length,
    }))

    const level = lesson.level
    const allLevelLessons = lessons.filter(l => l.level === level)
    const allComplete = allLevelLessons.every(l => {
      const count = l.id === lesson.id ? lesson.exercises.length : (progress[l.id] || 0)
      return count >= l.exercises.length
    })

    if (allComplete && (level === 'beginner' || level === 'intermediate') && getChallengeForLevel(level)) {
      const alreadyPassed = challengesPassed.includes(`challenge-${level}-passed`)
      if (!alreadyPassed) {
        setPendingChallenge(level)
        setView('celebration')
        return
      }
    }

    setView('path')
  }, [lessons, currentLessonIndex, currentExerciseIndex, progress, challengesPassed, getChallengeForLevel])

  const handleStartChallenge = useCallback(() => {
    setChallengeScore({ correct: 0, total: 0 })
    setChallengeExerciseIndex(0)
    setView('challenge')
  }, [])

  const handleChallengeExerciseComplete = useCallback(async (correct: boolean) => {
    if (!pendingChallenge) return
    const challenge = getChallengeForLevel(pendingChallenge)
    if (!challenge) return

    const newScore = {
      correct: challengeScore.correct + (correct ? 1 : 0),
      total: challengeScore.total + 1,
    }
    setChallengeScore(newScore)

    const nextIndex = challengeExerciseIndex + 1

    if (nextIndex < challenge.exercises.length) {
      setChallengeExerciseIndex(nextIndex)
      return
    }

    try {
      const res = await fetch('/api/learn/challenge-attempt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeId: challenge.id,
          correctCount: newScore.correct,
          totalCount: newScore.total,
        }),
      })
      const json = await res.json()
      if (json.data?.passed) {
        setChallengesPassed(prev => [...prev, `challenge-${pendingChallenge}-passed`])
      }
    } catch {
      // Best-effort — see handleExerciseComplete.
    }

    setView('path')
    setPendingChallenge(null)
  }, [challengeScore, challengeExerciseIndex, pendingChallenge, getChallengeForLevel])

  return (
    <div className="min-h-screen bg-surface p-4 md:p-8">
      {view === 'path' && (
        <LearningPathView
          lessons={lessons}
          progress={progress}
          isLessonUnlocked={isLessonUnlocked}
          isLevelComplete={isLevelComplete}
          isChallengePassedFor={isChallengePassedFor}
          onStartLesson={handleStartLesson}
          onStartChallenge={(level) => { setPendingChallenge(level); setView('celebration') }}
        />
      )}
      {view === 'exercise' && (
        <ExerciseView
          lesson={lessons[currentLessonIndex]}
          exerciseIndex={currentExerciseIndex}
          onComplete={handleExerciseComplete}
          onBack={() => setView('path')}
        />
      )}
      {view === 'celebration' && pendingChallenge && getChallengeForLevel(pendingChallenge) && (
        <CelebrationView
          level={pendingChallenge}
          challenge={getChallengeForLevel(pendingChallenge)!}
          onStartChallenge={handleStartChallenge}
          onBack={() => { setView('path'); setPendingChallenge(null) }}
        />
      )}
      {view === 'challenge' && pendingChallenge && getChallengeForLevel(pendingChallenge) && (
        <ChallengeView
          challenge={getChallengeForLevel(pendingChallenge)!}
          exerciseIndex={challengeExerciseIndex}
          score={challengeScore}
          onExerciseComplete={handleChallengeExerciseComplete}
          onBack={() => { setView('path'); setPendingChallenge(null) }}
        />
      )}
    </div>
  )
}
