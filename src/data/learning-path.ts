import type { GrammarBlock } from '@/types'

export interface PathLesson {
  id: string
  title: string
  description: string
  level: 'beginner' | 'intermediate' | 'advanced'
  icon: string
  exercises: PathExercise[]
}

export interface PathExercise {
  id: string
  targetSentence: string
  hint: string
  tutorExplanation: string
  blocks: GrammarBlock[]
}

export const LEARNING_PATH: PathLesson[] = [
  // === BEGINNER: Syntax Foundations ===
  {
    id: 'lesson-1',
    title: 'Simple Sentences',
    description: 'Subject + Verb + Object basics',
    level: 'beginner',
    icon: '🌱',
    exercises: [
      {
        id: 'l1-e1',
        targetSentence: 'The cat sleeps',
        hint: 'Subject + Verb (the simplest sentence)',
        tutorExplanation: 'En inglés, el orden básico es Sujeto → Verbo. - "The cat" es el sujeto (quién). - "sleeps" es el verbo (qué hace). - "The cat sleep" sería incorrecto porque "cat" es singular - en inglés se agrega -s al verbo para sujetos singulares (he/she/it): The cat sleepS. - The dogs sleep (sin -s para plural).',
        blocks: [
          { id: 'l1-e1-1', label: 'The cat', category: 'subject', isDistractor: false, sourceOrder: 1 },
          { id: 'l1-e1-2', label: 'sleeps', category: 'verb', isDistractor: false, sourceOrder: 2 },
          { id: 'l1-e1-3', label: 'runs', category: 'verb', isDistractor: true, sourceOrder: 3 },
        ],
      },
      {
        id: 'l1-e2',
        targetSentence: 'She reads books',
        hint: 'Subject + Verb + Object',
        tutorExplanation: 'Sujeto → Verbo → Objeto es el patrón básico del inglés. - "She" (sujeto) hace la acción. - "reads" (verbo) es lo que hace. - "books" (objeto) es lo que lee. - El verbo lleva -s porque "she" es tercera persona singular. - "swims" no tiene sentido con "books" - no puedes nadar libros.',
        blocks: [
          { id: 'l1-e2-1', label: 'She', category: 'subject', isDistractor: false, sourceOrder: 1 },
          { id: 'l1-e2-2', label: 'reads', category: 'verb', isDistractor: false, sourceOrder: 2 },
          { id: 'l1-e2-3', label: 'books', category: 'object', isDistractor: false, sourceOrder: 3 },
          { id: 'l1-e2-4', label: 'swims', category: 'verb', isDistractor: true, sourceOrder: 4 },
        ],
      },
      {
        id: 'l1-e3',
        targetSentence: 'They play soccer',
        hint: 'Subject + Verb + Object',
        tutorExplanation: '"They" es plural, así que el verbo queda como "play" (sin -s). - "playing" no funciona aquí porque necesitas la forma base del verbo, no el gerundio. - El orden importa: primero Sujeto, luego Verbo, luego Objeto. - "Soccer play they" sería incorrecto en inglés (¡aunque en otros idiomas sí funciona!).',
        blocks: [
          { id: 'l1-e3-1', label: 'They', category: 'subject', isDistractor: false, sourceOrder: 1 },
          { id: 'l1-e3-2', label: 'play', category: 'verb', isDistractor: false, sourceOrder: 2 },
          { id: 'l1-e3-3', label: 'soccer', category: 'object', isDistractor: false, sourceOrder: 3 },
          { id: 'l1-e3-4', label: 'playing', category: 'verb', isDistractor: true, sourceOrder: 4 },
        ],
      },
    ],
  },
  {
    id: 'lesson-2',
    title: 'Adding Places',
    description: 'Where things happen',
    level: 'beginner',
    icon: '📍',
    exercises: [
      {
        id: 'l2-e1',
        targetSentence: 'The cat sleeps on the sofa',
        hint: 'Subject + Verb + Place',
        tutorExplanation: 'Las expresiones de lugar van DESPUÉS del verbo en inglés. - "On the sofa" nos dice DÓNDE duerme el gato. - Patrón: Sujeto + Verbo + Lugar. - No se puede decir "On the sofa the cat sleeps" en inglés estándar - sonaría poético o anticuado.',
        blocks: [
          { id: 'l2-e1-1', label: 'The cat', category: 'subject', isDistractor: false, sourceOrder: 1 },
          { id: 'l2-e1-2', label: 'sleeps', category: 'verb', isDistractor: false, sourceOrder: 2 },
          { id: 'l2-e1-3', label: 'on the sofa', category: 'place', isDistractor: false, sourceOrder: 3 },
          { id: 'l2-e1-4', label: 'yesterday', category: 'time', isDistractor: true, sourceOrder: 4 },
        ],
      },
      {
        id: 'l2-e2',
        targetSentence: 'They play soccer in the park',
        hint: 'Subject + Verb + Object + Place',
        tutorExplanation: 'Cuando tienes Objeto y Lugar, el orden es: Sujeto + Verbo + Objeto + Lugar. - El Objeto ("soccer") va justo después del verbo. - El Lugar ("in the park") dice dónde. - "swimming" es un gerundio y no funciona como verbo principal aquí.',
        blocks: [
          { id: 'l2-e2-1', label: 'They', category: 'subject', isDistractor: false, sourceOrder: 1 },
          { id: 'l2-e2-2', label: 'play', category: 'verb', isDistractor: false, sourceOrder: 2 },
          { id: 'l2-e2-3', label: 'soccer', category: 'object', isDistractor: false, sourceOrder: 3 },
          { id: 'l2-e2-4', label: 'in the park', category: 'place', isDistractor: false, sourceOrder: 4 },
          { id: 'l2-e2-5', label: 'swimming', category: 'verb', isDistractor: true, sourceOrder: 5 },
        ],
      },
      {
        id: 'l2-e3',
        targetSentence: 'My brother eats breakfast at home',
        hint: 'Subject + Verb + Object + Place',
        tutorExplanation: 'Mismo patrón: Sujeto ("My brother") + Verbo ("eats") + Objeto ("breakfast") + Lugar ("at home"). - "sleeping" no funciona aquí porque es un gerundio (-ing), y necesitamos la forma simple del verbo. - La -s en "eats" es porque "my brother" = he (singular).',
        blocks: [
          { id: 'l2-e3-1', label: 'My brother', category: 'subject', isDistractor: false, sourceOrder: 1 },
          { id: 'l2-e3-2', label: 'eats', category: 'verb', isDistractor: false, sourceOrder: 2 },
          { id: 'l2-e3-3', label: 'breakfast', category: 'object', isDistractor: false, sourceOrder: 3 },
          { id: 'l2-e3-4', label: 'at home', category: 'place', isDistractor: false, sourceOrder: 4 },
          { id: 'l2-e3-5', label: 'sleeping', category: 'verb', isDistractor: true, sourceOrder: 5 },
        ],
      },
    ],
  },
  {
    id: 'lesson-3',
    title: 'Adding Time',
    description: 'When things happen',
    level: 'beginner',
    icon: '⏰',
    exercises: [
      {
        id: 'l3-e1',
        targetSentence: 'She reads books every morning',
        hint: 'Subject + Verb + Object + Time',
        tutorExplanation: 'Las expresiones de tiempo generalmente van al FINAL de la oración en inglés. - "Every morning" nos dice CUÁNDO lee. - Patrón: Sujeto + Verbo + Objeto + Tiempo. - Poner el tiempo al inicio ("Every morning she reads books") también es posible para dar énfasis, pero la posición final es lo normal.',
        blocks: [
          { id: 'l3-e1-1', label: 'She', category: 'subject', isDistractor: false, sourceOrder: 1 },
          { id: 'l3-e1-2', label: 'reads', category: 'verb', isDistractor: false, sourceOrder: 2 },
          { id: 'l3-e1-3', label: 'books', category: 'object', isDistractor: false, sourceOrder: 3 },
          { id: 'l3-e1-4', label: 'every morning', category: 'time', isDistractor: false, sourceOrder: 4 },
          { id: 'l3-e1-5', label: 'never', category: 'time', isDistractor: true, sourceOrder: 5 },
        ],
      },
      {
        id: 'l3-e2',
        targetSentence: 'The dog runs fast every day',
        hint: 'Subject + Verb + Modifier + Time',
        tutorExplanation: 'Los adverbios de manera (CÓMO: "fast") van justo después del verbo, antes del tiempo. - "The dog runs fast every day" = QUIÉN + QUÉ HACE + CÓMO + CUÁNDO. - "Slowly" es un distractor - cambia el significado por completo.',
        blocks: [
          { id: 'l3-e2-1', label: 'The dog', category: 'subject', isDistractor: false, sourceOrder: 1 },
          { id: 'l3-e2-2', label: 'runs', category: 'verb', isDistractor: false, sourceOrder: 2 },
          { id: 'l3-e2-3', label: 'fast', category: 'modifier', isDistractor: false, sourceOrder: 3 },
          { id: 'l3-e2-4', label: 'every day', category: 'time', isDistractor: false, sourceOrder: 4 },
          { id: 'l3-e2-5', label: 'slowly', category: 'modifier', isDistractor: true, sourceOrder: 5 },
        ],
      },
      {
        id: 'l3-e3',
        targetSentence: 'We watched a movie yesterday',
        hint: 'Subject + Verb + Object + Time',
        tutorExplanation: '"Watched" es pasado - nos dice que esto ya sucedió. - "Yesterday" confirma el tiempo. - En pasado, el verbo cambia de forma (watch → watched) pero NO agrega -s para singular. - "Today" es un distractor porque entra en conflicto con el verbo en pasado.',
        blocks: [
          { id: 'l3-e3-1', label: 'We', category: 'subject', isDistractor: false, sourceOrder: 1 },
          { id: 'l3-e3-2', label: 'watched', category: 'verb', isDistractor: false, sourceOrder: 2 },
          { id: 'l3-e3-3', label: 'a movie', category: 'object', isDistractor: false, sourceOrder: 3 },
          { id: 'l3-e3-4', label: 'yesterday', category: 'time', isDistractor: false, sourceOrder: 4 },
          { id: 'l3-e3-5', label: 'today', category: 'time', isDistractor: true, sourceOrder: 5 },
        ],
      },
    ],
  },
  // === INTERMEDIATE: Tone & Nuance ===
  {
    id: 'lesson-4',
    title: 'Tone with Adverbs',
    description: 'How adverbs change meaning',
    level: 'intermediate',
    icon: '🎨',
    exercises: [
      {
        id: 'l4-e1',
        targetSentence: 'She quietly finished her work',
        hint: 'Subject + Modifier + Verb + Object (adverb changes tone)',
        tutorExplanation: 'Adverbs of manner can go BEFORE the verb to emphasize HOW the action was done. "She QUIETLY finished" tells us about her demeanor — she was calm and discreet. Compare: "She LOUDLY finished" — completely different tone! The adverb position before the verb creates a specific rhetorical effect: it colors the entire action.',
        blocks: [
          { id: 'l4-e1-1', label: 'She', category: 'subject', isDistractor: false, sourceOrder: 1 },
          { id: 'l4-e1-2', label: 'quietly', category: 'modifier', isDistractor: false, sourceOrder: 2 },
          { id: 'l4-e1-3', label: 'finished', category: 'verb', isDistractor: false, sourceOrder: 3 },
          { id: 'l4-e1-4', label: 'her work', category: 'object', isDistractor: false, sourceOrder: 4 },
          { id: 'l4-e1-5', label: 'loudly', category: 'modifier', isDistractor: true, sourceOrder: 5 },
          { id: 'l4-e1-6', label: 'started', category: 'verb', isDistractor: true, sourceOrder: 6 },
        ],
      },
      {
        id: 'l4-e2',
        targetSentence: 'He nervously waited for the results',
        hint: 'Subject + Modifier + Verb + Object',
        tutorExplanation: '"Nervously" before the verb creates tension — we feel his anxiety before we even know what he was doing. This adverb placement is used to SET THE EMOTIONAL TONE of the sentence. "He waited nervously for the results" is also correct, but puts less emphasis on the nervousness.',
        blocks: [
          { id: 'l4-e2-1', label: 'He', category: 'subject', isDistractor: false, sourceOrder: 1 },
          { id: 'l4-e2-2', label: 'nervously', category: 'modifier', isDistractor: false, sourceOrder: 2 },
          { id: 'l4-e2-3', label: 'waited for', category: 'verb', isDistractor: false, sourceOrder: 3 },
          { id: 'l4-e2-4', label: 'the results', category: 'object', isDistractor: false, sourceOrder: 4 },
          { id: 'l4-e2-5', label: 'confidently', category: 'modifier', isDistractor: true, sourceOrder: 5 },
        ],
      },
      {
        id: 'l4-e3',
        targetSentence: 'The team enthusiastically celebrated their victory',
        hint: 'Subject + Modifier + Verb + Object',
        tutorExplanation: '"Enthusiastically" sets a joyful, energetic tone before we even hear "celebrated." The long adverb before the verb builds anticipation. "Reluctantly celebrated" would mean the opposite — they didn\'t want to celebrate. Word choice in adverbs completely changes the emotional meaning while keeping the same grammatical structure.',
        blocks: [
          { id: 'l4-e3-1', label: 'The team', category: 'subject', isDistractor: false, sourceOrder: 1 },
          { id: 'l4-e3-2', label: 'enthusiastically', category: 'modifier', isDistractor: false, sourceOrder: 2 },
          { id: 'l4-e3-3', label: 'celebrated', category: 'verb', isDistractor: false, sourceOrder: 3 },
          { id: 'l4-e3-4', label: 'their victory', category: 'object', isDistractor: false, sourceOrder: 4 },
          { id: 'l4-e3-5', label: 'reluctantly', category: 'modifier', isDistractor: true, sourceOrder: 5 },
          { id: 'l4-e3-6', label: 'ignored', category: 'verb', isDistractor: true, sourceOrder: 6 },
        ],
      },
    ],
  },
  {
    id: 'lesson-5',
    title: 'Tone in Context',
    description: 'Adverbs with time and place',
    level: 'intermediate',
    icon: '🗣️',
    exercises: [
      {
        id: 'l5-e1',
        targetSentence: 'She quietly finished her work before the deadline',
        hint: 'Subject + Modifier + Verb + Object + Time',
        tutorExplanation: 'This combines tone (adverb) with time. The order is: WHO + HOW + DID WHAT + WHAT + WHEN. "Before the deadline" adds context — she wasn\'t just quiet, she was efficient too. The adverb "quietly" modifies the verb, while "before the deadline" modifies the entire action.',
        blocks: [
          { id: 'l5-e1-1', label: 'She', category: 'subject', isDistractor: false, sourceOrder: 1 },
          { id: 'l5-e1-2', label: 'quietly', category: 'modifier', isDistractor: false, sourceOrder: 2 },
          { id: 'l5-e1-3', label: 'finished', category: 'verb', isDistractor: false, sourceOrder: 3 },
          { id: 'l5-e1-4', label: 'her work', category: 'object', isDistractor: false, sourceOrder: 4 },
          { id: 'l5-e1-5', label: 'before the deadline', category: 'time', isDistractor: false, sourceOrder: 5 },
          { id: 'l5-e1-6', label: 'loudly', category: 'modifier', isDistractor: true, sourceOrder: 6 },
          { id: 'l5-e1-7', label: 'at the office', category: 'place', isDistractor: true, sourceOrder: 7 },
        ],
      },
      {
        id: 'l5-e2',
        targetSentence: 'The students carefully prepared their presentation at the library',
        hint: 'Subject + Modifier + Verb + Object + Place',
        tutorExplanation: '"Carefully" before "prepared" emphasizes their diligence. The place ("at the library") goes at the end. Full pattern: WHO + HOW + DID WHAT + WHAT + WHERE. "Quickly" would change the tone entirely — suggesting they rushed rather than being thorough.',
        blocks: [
          { id: 'l5-e2-1', label: 'The students', category: 'subject', isDistractor: false, sourceOrder: 1 },
          { id: 'l5-e2-2', label: 'carefully', category: 'modifier', isDistractor: false, sourceOrder: 2 },
          { id: 'l5-e2-3', label: 'prepared', category: 'verb', isDistractor: false, sourceOrder: 3 },
          { id: 'l5-e2-4', label: 'their presentation', category: 'object', isDistractor: false, sourceOrder: 4 },
          { id: 'l5-e2-5', label: 'at the library', category: 'place', isDistractor: false, sourceOrder: 5 },
          { id: 'l5-e2-6', label: 'quickly', category: 'modifier', isDistractor: true, sourceOrder: 6 },
          { id: 'l5-e2-7', label: 'yesterday', category: 'time', isDistractor: true, sourceOrder: 7 },
        ],
      },
    ],
  },
  // === ADVANCED: Rhetorical Structure ===
  {
    id: 'lesson-6',
    title: 'Contrast & Concession',
    description: 'Despite, although — unexpected outcomes',
    level: 'advanced',
    icon: '⚡',
    exercises: [
      {
        id: 'l6-e1',
        targetSentence: 'Despite the rain the athletes completed the marathon',
        hint: 'Contrast clause + Subject + Verb + Object (fronting for emphasis)',
        tutorExplanation: '"Despite" introduces a CONCESSION — something that makes the main action surprising. By putting "Despite the rain" FIRST (fronting), we create dramatic tension: the reader expects failure, then gets success. This rhetorical device is called "fronted adverbial for contrast." "Because of" would change the logic entirely — it would mean the rain CAUSED the action.',
        blocks: [
          { id: 'l6-e1-1', label: 'Despite the rain', category: 'contrast', isDistractor: false, sourceOrder: 1 },
          { id: 'l6-e1-2', label: 'the athletes', category: 'subject', isDistractor: false, sourceOrder: 2 },
          { id: 'l6-e1-3', label: 'completed', category: 'verb', isDistractor: false, sourceOrder: 3 },
          { id: 'l6-e1-4', label: 'the marathon', category: 'object', isDistractor: false, sourceOrder: 4 },
          { id: 'l6-e1-5', label: 'Because of', category: 'contrast', isDistractor: true, sourceOrder: 5 },
          { id: 'l6-e1-6', label: 'abandoned', category: 'verb', isDistractor: true, sourceOrder: 6 },
        ],
      },
      {
        id: 'l6-e2',
        targetSentence: 'Although she was tired she finished the project on time',
        hint: 'Contrast clause + Subject + Verb + Object + Time',
        tutorExplanation: '"Although" is a subordinating conjunction that introduces a concession clause. It signals: "this thing is true, BUT the main action happened anyway." The contrast clause MUST come before the main clause to create the surprise effect. "Because she rested" would imply a cause-and-effect relationship instead of contrast.',
        blocks: [
          { id: 'l6-e2-1', label: 'Although she was tired', category: 'contrast', isDistractor: false, sourceOrder: 1 },
          { id: 'l6-e2-2', label: 'she', category: 'subject', isDistractor: false, sourceOrder: 2 },
          { id: 'l6-e2-3', label: 'finished', category: 'verb', isDistractor: false, sourceOrder: 3 },
          { id: 'l6-e2-4', label: 'the project', category: 'object', isDistractor: false, sourceOrder: 4 },
          { id: 'l6-e2-5', label: 'on time', category: 'time', isDistractor: false, sourceOrder: 5 },
          { id: 'l6-e2-6', label: 'Because she rested', category: 'contrast', isDistractor: true, sourceOrder: 6 },
          { id: 'l6-e2-7', label: 'started', category: 'verb', isDistractor: true, sourceOrder: 7 },
        ],
      },
    ],
  },
  {
    id: 'lesson-7',
    title: 'Complex Structures',
    description: 'Participial phrases & parallel construction',
    level: 'advanced',
    icon: '🏗️',
    exercises: [
      {
        id: 'l7-e1',
        targetSentence: 'Having studied abroad she confidently presented her research',
        hint: 'Participial phrase + Subject + Modifier + Verb + Object',
        tutorExplanation: '"Having studied abroad" is a PARTICIPIAL PHRASE — it provides background information before the main clause. It tells us WHY she was confident without using "because." This is an advanced sentence-opening technique. The participial phrase must share the same subject as the main clause (she studied abroad AND she presented). A "dangling participle" error would occur if the subjects didn\'t match.',
        blocks: [
          { id: 'l7-e1-1', label: 'Having studied abroad', category: 'modifier', isDistractor: false, sourceOrder: 1 },
          { id: 'l7-e1-2', label: 'she', category: 'subject', isDistractor: false, sourceOrder: 2 },
          { id: 'l7-e1-3', label: 'confidently', category: 'modifier', isDistractor: false, sourceOrder: 3 },
          { id: 'l7-e1-4', label: 'presented', category: 'verb', isDistractor: false, sourceOrder: 4 },
          { id: 'l7-e1-5', label: 'her research', category: 'object', isDistractor: false, sourceOrder: 5 },
          { id: 'l7-e1-6', label: 'nervously', category: 'modifier', isDistractor: true, sourceOrder: 6 },
          { id: 'l7-e1-7', label: 'ignored', category: 'verb', isDistractor: true, sourceOrder: 7 },
        ],
      },
      {
        id: 'l7-e2',
        targetSentence: 'Not only did she excel academically but she also led the team',
        hint: 'Correlative conjunction: Not only... but also (parallel structure)',
        tutorExplanation: '"Not only... but also" is a CORRELATIVE CONJUNCTION that creates parallel structure. The two parts must be grammatically balanced: "did she excel" parallels "she also led." This structure emphasizes BOTH achievements equally. Note the subject-verb inversion after "Not only" — "did she" instead of "she did" — this is required for dramatic effect.',
        blocks: [
          { id: 'l7-e2-1', label: 'Not only did she', category: 'subject', isDistractor: false, sourceOrder: 1 },
          { id: 'l7-e2-2', label: 'excel', category: 'verb', isDistractor: false, sourceOrder: 2 },
          { id: 'l7-e2-3', label: 'academically', category: 'modifier', isDistractor: false, sourceOrder: 3 },
          { id: 'l7-e2-4', label: 'but she also', category: 'subject', isDistractor: false, sourceOrder: 4 },
          { id: 'l7-e2-5', label: 'led', category: 'verb', isDistractor: false, sourceOrder: 5 },
          { id: 'l7-e2-6', label: 'the team', category: 'object', isDistractor: false, sourceOrder: 6 },
          { id: 'l7-e2-7', label: 'failed', category: 'verb', isDistractor: true, sourceOrder: 7 },
          { id: 'l7-e2-8', label: 'last year', category: 'time', isDistractor: true, sourceOrder: 8 },
        ],
      },
    ],
  },
]
