'use client'

import { useContext } from 'react'
import { ExerciseContext } from '@/contexts/ExerciseContext'
import type { ExerciseContextValue } from '@/contexts/ExerciseContext'

/**
 * Hook to access the exercise context value.
 * Must be used within an ExerciseProvider — throws if used outside one.
 */
export function useExercise(): ExerciseContextValue {
  const context = useContext(ExerciseContext)
  if (context === undefined) {
    throw new Error('useExercise must be used within an ExerciseProvider')
  }
  return context
}
