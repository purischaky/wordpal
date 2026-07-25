import type { GrammarBlock } from '@/types'

export interface ChallengeExercise {
  id: string
  targetSentence: string
  hint: string
  blocks: GrammarBlock[]
}

export interface PlacementChallenge {
  id: string
  fromLevel: 'beginner' | 'intermediate'
  toLevel: 'intermediate' | 'advanced'
  title: string
  description: string
  requiredCorrect: number // out of total exercises
  exercises: ChallengeExercise[]
}

export const PLACEMENT_CHALLENGES: PlacementChallenge[] = [
  {
    id: 'challenge-beginner-to-intermediate',
    fromLevel: 'beginner',
    toLevel: 'intermediate',
    title: 'Beginner → Intermediate',
    description: 'Prove you\'ve mastered basic sentence structure. Get 3 out of 4 correct to unlock Intermediate.',
    requiredCorrect: 3,
    exercises: [
      {
        id: 'ch1-e1',
        targetSentence: 'My sister works at the hospital every day',
        hint: 'Subject + Verb + Place + Time — combine everything you learned!',
        blocks: [
          { id: 'ch1-e1-1', label: 'My sister', category: 'subject', isDistractor: false, sourceOrder: 1 },
          { id: 'ch1-e1-2', label: 'works', category: 'verb', isDistractor: false, sourceOrder: 2 },
          { id: 'ch1-e1-3', label: 'at the hospital', category: 'place', isDistractor: false, sourceOrder: 3 },
          { id: 'ch1-e1-4', label: 'every day', category: 'time', isDistractor: false, sourceOrder: 4 },
          { id: 'ch1-e1-5', label: 'My brother', category: 'subject', isDistractor: true, sourceOrder: 5 },
          { id: 'ch1-e1-6', label: 'last week', category: 'time', isDistractor: true, sourceOrder: 6 },
        ],
      },
      {
        id: 'ch1-e2',
        targetSentence: 'The children played games in the garden yesterday',
        hint: 'Subject + Verb + Object + Place + Time',
        blocks: [
          { id: 'ch1-e2-1', label: 'The children', category: 'subject', isDistractor: false, sourceOrder: 1 },
          { id: 'ch1-e2-2', label: 'played', category: 'verb', isDistractor: false, sourceOrder: 2 },
          { id: 'ch1-e2-3', label: 'games', category: 'object', isDistractor: false, sourceOrder: 3 },
          { id: 'ch1-e2-4', label: 'in the garden', category: 'place', isDistractor: false, sourceOrder: 4 },
          { id: 'ch1-e2-5', label: 'yesterday', category: 'time', isDistractor: false, sourceOrder: 5 },
          { id: 'ch1-e2-6', label: 'watches', category: 'verb', isDistractor: true, sourceOrder: 6 },
          { id: 'ch1-e2-7', label: 'tomorrow', category: 'time', isDistractor: true, sourceOrder: 7 },
        ],
      },
      {
        id: 'ch1-e3',
        targetSentence: 'He drinks coffee at the office every morning',
        hint: 'Subject + Verb + Object + Place + Time',
        blocks: [
          { id: 'ch1-e3-1', label: 'He', category: 'subject', isDistractor: false, sourceOrder: 1 },
          { id: 'ch1-e3-2', label: 'drinks', category: 'verb', isDistractor: false, sourceOrder: 2 },
          { id: 'ch1-e3-3', label: 'coffee', category: 'object', isDistractor: false, sourceOrder: 3 },
          { id: 'ch1-e3-4', label: 'at the office', category: 'place', isDistractor: false, sourceOrder: 4 },
          { id: 'ch1-e3-5', label: 'every morning', category: 'time', isDistractor: false, sourceOrder: 5 },
          { id: 'ch1-e3-6', label: 'eats', category: 'verb', isDistractor: true, sourceOrder: 6 },
        ],
      },
      {
        id: 'ch1-e4',
        targetSentence: 'The students study English at school every afternoon',
        hint: 'Subject + Verb + Object + Place + Time',
        blocks: [
          { id: 'ch1-e4-1', label: 'The students', category: 'subject', isDistractor: false, sourceOrder: 1 },
          { id: 'ch1-e4-2', label: 'study', category: 'verb', isDistractor: false, sourceOrder: 2 },
          { id: 'ch1-e4-3', label: 'English', category: 'object', isDistractor: false, sourceOrder: 3 },
          { id: 'ch1-e4-4', label: 'at school', category: 'place', isDistractor: false, sourceOrder: 4 },
          { id: 'ch1-e4-5', label: 'every afternoon', category: 'time', isDistractor: false, sourceOrder: 5 },
          { id: 'ch1-e4-6', label: 'teaches', category: 'verb', isDistractor: true, sourceOrder: 6 },
          { id: 'ch1-e4-7', label: 'at night', category: 'time', isDistractor: true, sourceOrder: 7 },
        ],
      },
    ],
  },
  {
    id: 'challenge-intermediate-to-advanced',
    fromLevel: 'intermediate',
    toLevel: 'advanced',
    title: 'Intermediate → Advanced',
    description: 'Show you understand tone and adverb placement. Get 3 out of 4 correct to unlock Advanced.',
    requiredCorrect: 3,
    exercises: [
      {
        id: 'ch2-e1',
        targetSentence: 'She patiently explained the concept to her students at the university',
        hint: 'Subject + Modifier + Verb + Object + Place',
        blocks: [
          { id: 'ch2-e1-1', label: 'She', category: 'subject', isDistractor: false, sourceOrder: 1 },
          { id: 'ch2-e1-2', label: 'patiently', category: 'modifier', isDistractor: false, sourceOrder: 2 },
          { id: 'ch2-e1-3', label: 'explained', category: 'verb', isDistractor: false, sourceOrder: 3 },
          { id: 'ch2-e1-4', label: 'the concept', category: 'object', isDistractor: false, sourceOrder: 4 },
          { id: 'ch2-e1-5', label: 'to her students', category: 'object', isDistractor: false, sourceOrder: 5 },
          { id: 'ch2-e1-6', label: 'at the university', category: 'place', isDistractor: false, sourceOrder: 6 },
          { id: 'ch2-e1-7', label: 'hastily', category: 'modifier', isDistractor: true, sourceOrder: 7 },
          { id: 'ch2-e1-8', label: 'ignored', category: 'verb', isDistractor: true, sourceOrder: 8 },
        ],
      },
      {
        id: 'ch2-e2',
        targetSentence: 'The manager carefully reviewed the reports before the meeting',
        hint: 'Subject + Modifier + Verb + Object + Time',
        blocks: [
          { id: 'ch2-e2-1', label: 'The manager', category: 'subject', isDistractor: false, sourceOrder: 1 },
          { id: 'ch2-e2-2', label: 'carefully', category: 'modifier', isDistractor: false, sourceOrder: 2 },
          { id: 'ch2-e2-3', label: 'reviewed', category: 'verb', isDistractor: false, sourceOrder: 3 },
          { id: 'ch2-e2-4', label: 'the reports', category: 'object', isDistractor: false, sourceOrder: 4 },
          { id: 'ch2-e2-5', label: 'before the meeting', category: 'time', isDistractor: false, sourceOrder: 5 },
          { id: 'ch2-e2-6', label: 'carelessly', category: 'modifier', isDistractor: true, sourceOrder: 6 },
          { id: 'ch2-e2-7', label: 'after lunch', category: 'time', isDistractor: true, sourceOrder: 7 },
        ],
      },
      {
        id: 'ch2-e3',
        targetSentence: 'They eagerly accepted the invitation to the conference',
        hint: 'Subject + Modifier + Verb + Object + Place',
        blocks: [
          { id: 'ch2-e3-1', label: 'They', category: 'subject', isDistractor: false, sourceOrder: 1 },
          { id: 'ch2-e3-2', label: 'eagerly', category: 'modifier', isDistractor: false, sourceOrder: 2 },
          { id: 'ch2-e3-3', label: 'accepted', category: 'verb', isDistractor: false, sourceOrder: 3 },
          { id: 'ch2-e3-4', label: 'the invitation', category: 'object', isDistractor: false, sourceOrder: 4 },
          { id: 'ch2-e3-5', label: 'to the conference', category: 'place', isDistractor: false, sourceOrder: 5 },
          { id: 'ch2-e3-6', label: 'reluctantly', category: 'modifier', isDistractor: true, sourceOrder: 6 },
        ],
      },
      {
        id: 'ch2-e4',
        targetSentence: 'He silently observed the situation from the corner all evening',
        hint: 'Subject + Modifier + Verb + Object + Place + Time',
        blocks: [
          { id: 'ch2-e4-1', label: 'He', category: 'subject', isDistractor: false, sourceOrder: 1 },
          { id: 'ch2-e4-2', label: 'silently', category: 'modifier', isDistractor: false, sourceOrder: 2 },
          { id: 'ch2-e4-3', label: 'observed', category: 'verb', isDistractor: false, sourceOrder: 3 },
          { id: 'ch2-e4-4', label: 'the situation', category: 'object', isDistractor: false, sourceOrder: 4 },
          { id: 'ch2-e4-5', label: 'from the corner', category: 'place', isDistractor: false, sourceOrder: 5 },
          { id: 'ch2-e4-6', label: 'all evening', category: 'time', isDistractor: false, sourceOrder: 6 },
          { id: 'ch2-e4-7', label: 'loudly', category: 'modifier', isDistractor: true, sourceOrder: 7 },
          { id: 'ch2-e4-8', label: 'created', category: 'verb', isDistractor: true, sourceOrder: 8 },
        ],
      },
    ],
  },
]

/** Get the challenge that gates a specific level transition */
export function getChallengeForLevel(fromLevel: 'beginner' | 'intermediate'): PlacementChallenge {
  return PLACEMENT_CHALLENGES.find(c => c.fromLevel === fromLevel)!
}
