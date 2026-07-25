'use client'

import {
  createContext,
  useCallback,
  useMemo,
  useReducer,
} from 'react'
import type { ReactNode } from 'react'
import type {
  Exercise,
  ExerciseAction,
  ExerciseState,
  GrammarBlock,
} from '@/types/exercise'
import type { FeedbackResponse } from '@/types/feedback'
import { buildSentencePreview, validateSentenceLength } from '@/lib/utils/sentence'
import { getIncorrectBlockIds, sortBlocksBySourceOrder } from '@/lib/utils/exercise'

// ---------------------------------------------------------------------------
// Context value interface
// ---------------------------------------------------------------------------

export interface ExerciseContextValue {
  state: ExerciseState;
  dispatch: React.Dispatch<ExerciseAction>;
  submitSentence: () => Promise<void>;
  requestHint: () => Promise<void>;
  resetExercise: () => void;
}

export const ExerciseContext = createContext<ExerciseContextValue | undefined>(
  undefined
)

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

function createInitialState(
  exercise: Exercise,
  blocks: GrammarBlock[]
): ExerciseState {
  return {
    exercise,
    canvas: [],
    available: sortBlocksBySourceOrder(blocks),
    feedback: null,
    feedbackStatus: 'idle',
    hintsUsed: 0,
    attempts: 0,
    incorrectBlockIds: [],
  }
}

export function exerciseReducer(
  state: ExerciseState,
  action: ExerciseAction
): ExerciseState {
  switch (action.type) {
    case 'PLACE_BLOCK': {
      // Enforce max 15 blocks on canvas
      if (state.canvas.length >= 15) {
        return state
      }

      const block = state.available.find((b) => b.id === action.blockId)
      if (!block) return state

      const newAvailable = state.available.filter((b) => b.id !== action.blockId)
      const newCanvas = [...state.canvas]
      // Clamp index to valid range
      const insertIndex = Math.max(0, Math.min(action.index, newCanvas.length))
      newCanvas.splice(insertIndex, 0, block)

      return {
        ...state,
        canvas: newCanvas,
        available: newAvailable,
      }
    }

    case 'REMOVE_BLOCK': {
      const block = state.canvas.find((b) => b.id === action.blockId)
      if (!block) return state

      const newCanvas = state.canvas.filter((b) => b.id !== action.blockId)
      const newAvailable = sortBlocksBySourceOrder([...state.available, block])

      return {
        ...state,
        canvas: newCanvas,
        available: newAvailable,
      }
    }

    case 'REORDER_BLOCKS': {
      const { fromIndex, toIndex } = action
      if (
        fromIndex < 0 ||
        fromIndex >= state.canvas.length ||
        toIndex < 0 ||
        toIndex >= state.canvas.length
      ) {
        return state
      }

      const newCanvas = [...state.canvas]
      const [moved] = newCanvas.splice(fromIndex, 1)
      newCanvas.splice(toIndex, 0, moved)

      return {
        ...state,
        canvas: newCanvas,
      }
    }

    case 'SUBMIT_START': {
      return {
        ...state,
        feedbackStatus: 'loading',
        feedback: null,
        incorrectBlockIds: [],
      }
    }

    case 'SUBMIT_SUCCESS': {
      const { feedback } = action
      const feedbackStatus = feedback.correct ? 'success' : 'error'
      const incorrectBlockIds = feedback.correct
        ? []
        : getIncorrectBlockIds(state.canvas, state.exercise.targetSentence)

      return {
        ...state,
        feedback,
        feedbackStatus,
        incorrectBlockIds,
        attempts: state.attempts + 1,
      }
    }

    case 'SUBMIT_ERROR': {
      return {
        ...state,
        feedbackStatus: 'unavailable',
      }
    }

    case 'USE_HINT': {
      return {
        ...state,
        hintsUsed: state.hintsUsed + 1,
      }
    }

    case 'RESET': {
      return createInitialState(state.exercise, [
        ...state.canvas,
        ...state.available,
      ])
    }

    default:
      return state
  }
}

// ---------------------------------------------------------------------------
// Provider component
// ---------------------------------------------------------------------------

interface ExerciseProviderProps {
  exercise: Exercise;
  blocks: GrammarBlock[];
  children: ReactNode;
}

export function ExerciseProvider({
  exercise,
  blocks,
  children,
}: ExerciseProviderProps) {
  const [state, dispatch] = useReducer(
    exerciseReducer,
    { exercise, blocks },
    ({ exercise: ex, blocks: bl }) => createInitialState(ex, bl)
  )

  const submitSentence = useCallback(async () => {
    const sentence = buildSentencePreview(state.canvas)

    const validation = validateSentenceLength(sentence)
    if (!validation.valid) {
      // Don't submit invalid sentences
      return
    }

    dispatch({ type: 'SUBMIT_START' })

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sentence,
          exerciseId: state.exercise.id,
        }),
      })

      if (!response.ok) {
        dispatch({ type: 'SUBMIT_ERROR' })
        return
      }

      const feedback: FeedbackResponse = await response.json()
      dispatch({ type: 'SUBMIT_SUCCESS', feedback })
    } catch {
      dispatch({ type: 'SUBMIT_ERROR' })
    }
  }, [state.canvas, state.exercise.id])

  const requestHint = useCallback(async () => {
    if (state.hintsUsed >= 2) {
      return
    }

    try {
      const response = await fetch('/api/hints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exerciseId: state.exercise.id,
          placedBlocks: state.canvas.map((b) => b.id),
          hintNumber: (state.hintsUsed + 1) as 1 | 2,
        }),
      })

      if (!response.ok) {
        // On failure, do NOT decrement hint count
        return
      }

      const data = await response.json()
      dispatch({ type: 'USE_HINT', hint: data.hint })
    } catch {
      // On failure, do NOT decrement hint count
    }
  }, [state.exercise.id, state.canvas, state.hintsUsed])

  const resetExercise = useCallback(() => {
    dispatch({ type: 'RESET' })
  }, [])

  const value = useMemo<ExerciseContextValue>(
    () => ({
      state,
      dispatch,
      submitSentence,
      requestHint,
      resetExercise,
    }),
    [state, dispatch, submitSentence, requestHint, resetExercise]
  )

  return (
    <ExerciseContext.Provider value={value}>
      {children}
    </ExerciseContext.Provider>
  )
}
