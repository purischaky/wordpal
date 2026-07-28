'use client'

import { useState, useCallback, useEffect } from 'react'
import {
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import type { GrammarBlock } from '@/types'
import { shuffleBlocks } from '@/data/demo-sentences'
import type { LearnExercise } from '@/lib/dal/learn'

/**
 * Shared drag-and-drop + check logic for both lesson exercises and
 * placement challenge exercises — identical behavior, only the caller's
 * completion handling differs.
 */
export function useSentenceBuilder(exercise: LearnExercise) {
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
      return true
    }
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
    return false
  }, [canvas, exercise])

  return {
    canvas,
    available,
    activeBlock,
    incorrectIds,
    result,
    sensors,
    handleDragStart,
    handleDragEnd,
    handleTapBlock,
    handleRemoveBlock,
    handleCheck,
  }
}
