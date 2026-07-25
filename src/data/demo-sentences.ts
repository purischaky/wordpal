import type { GrammarBlock } from '@/types'

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced'

export interface DemoSentence {
  id: string
  targetSentence: string
  level: DifficultyLevel
  levelLabel: string
  hint: string
  blocks: GrammarBlock[]
}

/**
 * Beginner: Focus on basic syntax (Subject + Verb + Object + Time/Place)
 */
const beginnerSentences: DemoSentence[] = [
  {
    id: 'b1',
    targetSentence: 'The cat sleeps on the sofa',
    level: 'beginner',
    levelLabel: 'Beginner — Syntax',
    hint: 'Basic Subject + Verb + Place structure',
    blocks: [
      { id: 'b1-1', label: 'The cat', category: 'subject', isDistractor: false, sourceOrder: 1 },
      { id: 'b1-2', label: 'sleeps', category: 'verb', isDistractor: false, sourceOrder: 2 },
      { id: 'b1-3', label: 'on the sofa', category: 'place', isDistractor: false, sourceOrder: 3 },
      { id: 'b1-4', label: 'runs', category: 'verb', isDistractor: true, sourceOrder: 4 },
      { id: 'b1-5', label: 'yesterday', category: 'time', isDistractor: true, sourceOrder: 5 },
    ],
  },
  {
    id: 'b2',
    targetSentence: 'She reads books every morning',
    level: 'beginner',
    levelLabel: 'Beginner — Syntax',
    hint: 'Subject + Verb + Object + Time',
    blocks: [
      { id: 'b2-1', label: 'She', category: 'subject', isDistractor: false, sourceOrder: 1 },
      { id: 'b2-2', label: 'reads', category: 'verb', isDistractor: false, sourceOrder: 2 },
      { id: 'b2-3', label: 'books', category: 'object', isDistractor: false, sourceOrder: 3 },
      { id: 'b2-4', label: 'every morning', category: 'time', isDistractor: false, sourceOrder: 4 },
      { id: 'b2-5', label: 'He', category: 'subject', isDistractor: true, sourceOrder: 5 },
      { id: 'b2-6', label: 'at school', category: 'place', isDistractor: true, sourceOrder: 6 },
    ],
  },
  {
    id: 'b3',
    targetSentence: 'They play soccer in the park',
    level: 'beginner',
    levelLabel: 'Beginner — Syntax',
    hint: 'Subject + Verb + Object + Place',
    blocks: [
      { id: 'b3-1', label: 'They', category: 'subject', isDistractor: false, sourceOrder: 1 },
      { id: 'b3-2', label: 'play', category: 'verb', isDistractor: false, sourceOrder: 2 },
      { id: 'b3-3', label: 'soccer', category: 'object', isDistractor: false, sourceOrder: 3 },
      { id: 'b3-4', label: 'in the park', category: 'place', isDistractor: false, sourceOrder: 4 },
      { id: 'b3-5', label: 'watches', category: 'verb', isDistractor: true, sourceOrder: 5 },
      { id: 'b3-6', label: 'always', category: 'time', isDistractor: true, sourceOrder: 6 },
    ],
  },
  {
    id: 'b4',
    targetSentence: 'My brother eats breakfast at home',
    level: 'beginner',
    levelLabel: 'Beginner — Syntax',
    hint: 'Subject + Verb + Object + Place',
    blocks: [
      { id: 'b4-1', label: 'My brother', category: 'subject', isDistractor: false, sourceOrder: 1 },
      { id: 'b4-2', label: 'eats', category: 'verb', isDistractor: false, sourceOrder: 2 },
      { id: 'b4-3', label: 'breakfast', category: 'object', isDistractor: false, sourceOrder: 3 },
      { id: 'b4-4', label: 'at home', category: 'place', isDistractor: false, sourceOrder: 4 },
      { id: 'b4-5', label: 'drinks', category: 'verb', isDistractor: true, sourceOrder: 5 },
      { id: 'b4-6', label: 'last night', category: 'time', isDistractor: true, sourceOrder: 6 },
    ],
  },
  {
    id: 'b5',
    targetSentence: 'The dog runs fast every day',
    level: 'beginner',
    levelLabel: 'Beginner — Syntax',
    hint: 'Subject + Verb + Modifier + Time',
    blocks: [
      { id: 'b5-1', label: 'The dog', category: 'subject', isDistractor: false, sourceOrder: 1 },
      { id: 'b5-2', label: 'runs', category: 'verb', isDistractor: false, sourceOrder: 2 },
      { id: 'b5-3', label: 'fast', category: 'modifier', isDistractor: false, sourceOrder: 3 },
      { id: 'b5-4', label: 'every day', category: 'time', isDistractor: false, sourceOrder: 4 },
      { id: 'b5-5', label: 'slowly', category: 'modifier', isDistractor: true, sourceOrder: 5 },
      { id: 'b5-6', label: 'at night', category: 'time', isDistractor: true, sourceOrder: 6 },
    ],
  },
]

/**
 * Intermediate: Focus on tone and nuance (adverbs, conditionals, contrast)
 */
const intermediateSentences: DemoSentence[] = [
  {
    id: 'i1',
    targetSentence: 'She quietly finished her work before the deadline',
    level: 'intermediate',
    levelLabel: 'Intermediate — Tone',
    hint: 'Subject + Modifier + Verb + Object + Time',
    blocks: [
      { id: 'i1-1', label: 'She', category: 'subject', isDistractor: false, sourceOrder: 1 },
      { id: 'i1-2', label: 'quietly', category: 'modifier', isDistractor: false, sourceOrder: 2 },
      { id: 'i1-3', label: 'finished', category: 'verb', isDistractor: false, sourceOrder: 3 },
      { id: 'i1-4', label: 'her work', category: 'object', isDistractor: false, sourceOrder: 4 },
      { id: 'i1-5', label: 'before the deadline', category: 'time', isDistractor: false, sourceOrder: 5 },
      { id: 'i1-6', label: 'loudly', category: 'modifier', isDistractor: true, sourceOrder: 6 },
      { id: 'i1-7', label: 'started', category: 'verb', isDistractor: true, sourceOrder: 7 },
    ],
  },
  {
    id: 'i2',
    targetSentence: 'The students carefully prepared their presentation at the library',
    level: 'intermediate',
    levelLabel: 'Intermediate — Tone',
    hint: 'Subject + Modifier + Verb + Object + Place',
    blocks: [
      { id: 'i2-1', label: 'The students', category: 'subject', isDistractor: false, sourceOrder: 1 },
      { id: 'i2-2', label: 'carefully', category: 'modifier', isDistractor: false, sourceOrder: 2 },
      { id: 'i2-3', label: 'prepared', category: 'verb', isDistractor: false, sourceOrder: 3 },
      { id: 'i2-4', label: 'their presentation', category: 'object', isDistractor: false, sourceOrder: 4 },
      { id: 'i2-5', label: 'at the library', category: 'place', isDistractor: false, sourceOrder: 5 },
      { id: 'i2-6', label: 'quickly', category: 'modifier', isDistractor: true, sourceOrder: 6 },
      { id: 'i2-7', label: 'yesterday', category: 'time', isDistractor: true, sourceOrder: 7 },
    ],
  },
  {
    id: 'i3',
    targetSentence: 'He nervously waited for the results all afternoon',
    level: 'intermediate',
    levelLabel: 'Intermediate — Tone',
    hint: 'Subject + Modifier + Verb + Object + Time',
    blocks: [
      { id: 'i3-1', label: 'He', category: 'subject', isDistractor: false, sourceOrder: 1 },
      { id: 'i3-2', label: 'nervously', category: 'modifier', isDistractor: false, sourceOrder: 2 },
      { id: 'i3-3', label: 'waited for', category: 'verb', isDistractor: false, sourceOrder: 3 },
      { id: 'i3-4', label: 'the results', category: 'object', isDistractor: false, sourceOrder: 4 },
      { id: 'i3-5', label: 'all afternoon', category: 'time', isDistractor: false, sourceOrder: 5 },
      { id: 'i3-6', label: 'confidently', category: 'modifier', isDistractor: true, sourceOrder: 6 },
      { id: 'i3-7', label: 'at the office', category: 'place', isDistractor: true, sourceOrder: 7 },
    ],
  },
  {
    id: 'i4',
    targetSentence: 'The team enthusiastically celebrated their victory at the stadium',
    level: 'intermediate',
    levelLabel: 'Intermediate — Tone',
    hint: 'Subject + Modifier + Verb + Object + Place',
    blocks: [
      { id: 'i4-1', label: 'The team', category: 'subject', isDistractor: false, sourceOrder: 1 },
      { id: 'i4-2', label: 'enthusiastically', category: 'modifier', isDistractor: false, sourceOrder: 2 },
      { id: 'i4-3', label: 'celebrated', category: 'verb', isDistractor: false, sourceOrder: 3 },
      { id: 'i4-4', label: 'their victory', category: 'object', isDistractor: false, sourceOrder: 4 },
      { id: 'i4-5', label: 'at the stadium', category: 'place', isDistractor: false, sourceOrder: 5 },
      { id: 'i4-6', label: 'reluctantly', category: 'modifier', isDistractor: true, sourceOrder: 6 },
      { id: 'i4-7', label: 'last week', category: 'time', isDistractor: true, sourceOrder: 7 },
    ],
  },
]

/**
 * Advanced: Focus on rhetorical structure (complex sentences, emphasis, clause order)
 */
const advancedSentences: DemoSentence[] = [
  {
    id: 'a1',
    targetSentence: 'Despite the rain the determined athletes completed the marathon in record time',
    level: 'advanced',
    levelLabel: 'Advanced — Rhetorical Structure',
    hint: 'Contrast clause + Subject + Verb + Object + Time (emphasis through fronting)',
    blocks: [
      { id: 'a1-1', label: 'Despite the rain', category: 'contrast', isDistractor: false, sourceOrder: 1 },
      { id: 'a1-2', label: 'the determined athletes', category: 'subject', isDistractor: false, sourceOrder: 2 },
      { id: 'a1-3', label: 'completed', category: 'verb', isDistractor: false, sourceOrder: 3 },
      { id: 'a1-4', label: 'the marathon', category: 'object', isDistractor: false, sourceOrder: 4 },
      { id: 'a1-5', label: 'in record time', category: 'time', isDistractor: false, sourceOrder: 5 },
      { id: 'a1-6', label: 'Because of', category: 'contrast', isDistractor: true, sourceOrder: 6 },
      { id: 'a1-7', label: 'abandoned', category: 'verb', isDistractor: true, sourceOrder: 7 },
      { id: 'a1-8', label: 'at the park', category: 'place', isDistractor: true, sourceOrder: 8 },
    ],
  },
  {
    id: 'a2',
    targetSentence: 'Not only did she excel academically but she also led the debate team to nationals',
    level: 'advanced',
    levelLabel: 'Advanced — Rhetorical Structure',
    hint: 'Correlative conjunction pattern: Not only... but also (parallel structure)',
    blocks: [
      { id: 'a2-1', label: 'Not only did she', category: 'subject', isDistractor: false, sourceOrder: 1 },
      { id: 'a2-2', label: 'excel', category: 'verb', isDistractor: false, sourceOrder: 2 },
      { id: 'a2-3', label: 'academically', category: 'modifier', isDistractor: false, sourceOrder: 3 },
      { id: 'a2-4', label: 'but she also', category: 'subject', isDistractor: false, sourceOrder: 4 },
      { id: 'a2-5', label: 'led', category: 'verb', isDistractor: false, sourceOrder: 5 },
      { id: 'a2-6', label: 'the debate team', category: 'object', isDistractor: false, sourceOrder: 6 },
      { id: 'a2-7', label: 'to nationals', category: 'place', isDistractor: false, sourceOrder: 7 },
      { id: 'a2-8', label: 'failed', category: 'verb', isDistractor: true, sourceOrder: 8 },
      { id: 'a2-9', label: 'last year', category: 'time', isDistractor: true, sourceOrder: 9 },
    ],
  },
  {
    id: 'a3',
    targetSentence: 'Having studied abroad for two years she confidently presented her research at the conference',
    level: 'advanced',
    levelLabel: 'Advanced — Rhetorical Structure',
    hint: 'Participial phrase (background) + Subject + Modifier + Verb + Object + Place',
    blocks: [
      { id: 'a3-1', label: 'Having studied abroad', category: 'modifier', isDistractor: false, sourceOrder: 1 },
      { id: 'a3-2', label: 'for two years', category: 'time', isDistractor: false, sourceOrder: 2 },
      { id: 'a3-3', label: 'she', category: 'subject', isDistractor: false, sourceOrder: 3 },
      { id: 'a3-4', label: 'confidently', category: 'modifier', isDistractor: false, sourceOrder: 4 },
      { id: 'a3-5', label: 'presented', category: 'verb', isDistractor: false, sourceOrder: 5 },
      { id: 'a3-6', label: 'her research', category: 'object', isDistractor: false, sourceOrder: 6 },
      { id: 'a3-7', label: 'at the conference', category: 'place', isDistractor: false, sourceOrder: 7 },
      { id: 'a3-8', label: 'nervously', category: 'modifier', isDistractor: true, sourceOrder: 8 },
      { id: 'a3-9', label: 'ignored', category: 'verb', isDistractor: true, sourceOrder: 9 },
    ],
  },
]

export const ALL_SENTENCES: Record<DifficultyLevel, DemoSentence[]> = {
  beginner: beginnerSentences,
  intermediate: intermediateSentences,
  advanced: advancedSentences,
}

/** Get a random sentence for the given level */
export function getRandomSentence(level: DifficultyLevel): DemoSentence {
  const sentences = ALL_SENTENCES[level]
  const index = Math.floor(Math.random() * sentences.length)
  return sentences[index]
}

/** Shuffle an array (Fisher-Yates) */
export function shuffleBlocks(blocks: GrammarBlock[]): GrammarBlock[] {
  const arr = [...blocks]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}
