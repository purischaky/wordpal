'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import type { ExerciseType, BlockCategory } from '@/types/admin';

// ─── Types ───────────────────────────────────────────────────────────────────

interface GrammarBlockItem {
  id: string;
  label: string;
  category: BlockCategory;
  isDistractor: boolean;
}

interface ChallengeQuestion {
  id: string;
  type: ExerciseType;
  text: string;
  options?: string[];
  correctAnswerIndex?: number;
  grammarBlocks?: GrammarBlockItem[];
}

interface ChallengeConfig {
  title: string;
  targetLevel: string;
  grammarTopics: string[];
  difficulty: number;
  exerciseTypes: ExerciseType[];
  questionCount: number;
}

type GenerationStatus = 'idle' | 'generating' | 'success' | 'error' | 'timeout';

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_CHALLENGES: Record<string, ChallengeConfig & { questions: ChallengeQuestion[] }> = {
  'ch-1': {
    title: 'Beginner Grammar Placement',
    targetLevel: 'A1',
    grammarTopics: ['Present Tense', 'Articles', 'Subject Pronouns'],
    difficulty: 1,
    exerciseTypes: ['multiple-choice', 'fill-in-blank'],
    questionCount: 15,
    questions: [
      {
        id: 'q-1',
        type: 'multiple-choice',
        text: 'She ___ to school every day.',
        options: ['go', 'goes', 'going', 'gone'],
        correctAnswerIndex: 1,
      },
      {
        id: 'q-2',
        type: 'multiple-choice',
        text: 'They ___ playing in the park.',
        options: ['is', 'am', 'are', 'be'],
        correctAnswerIndex: 2,
      },
      {
        id: 'q-3',
        type: 'fill-in-blank',
        text: 'I have ___ apple and ___ banana.',
        options: ['an, a'],
        correctAnswerIndex: 0,
      },
    ],
  },
  'ch-2': {
    title: 'Elementary Level Assessment',
    targetLevel: 'A2',
    grammarTopics: ['Past Tense', 'Comparatives', 'Prepositions'],
    difficulty: 2,
    exerciseTypes: ['multiple-choice', 'sentence-ordering', 'fill-in-blank'],
    questionCount: 20,
    questions: [],
  },
};

// Mock AI-generated questions
function generateMockQuestions(config: ChallengeConfig): ChallengeQuestion[] {
  const questions: ChallengeQuestion[] = [];
  const count = Math.min(config.questionCount, 15);

  const mcTemplates = [
    { text: 'The cat ___ on the mat.', options: ['sit', 'sits', 'sitting', 'sat'], correct: 1 },
    { text: 'We ___ to the store yesterday.', options: ['go', 'goes', 'went', 'gone'], correct: 2 },
    { text: '___ you like coffee?', options: ['Do', 'Does', 'Is', 'Are'], correct: 0 },
    { text: 'He has ___ finished his homework.', options: ['yet', 'already', 'still', 'since'], correct: 1 },
    { text: 'She is ___ than her sister.', options: ['tall', 'taller', 'tallest', 'more tall'], correct: 1 },
    { text: 'They ___ been waiting for hours.', options: ['has', 'have', 'had', 'having'], correct: 1 },
    { text: 'I wish I ___ fly.', options: ['can', 'could', 'will', 'would'], correct: 1 },
    { text: 'The book ___ written by a famous author.', options: ['is', 'was', 'were', 'be'], correct: 1 },
  ];

  const dndTemplates = [
    {
      text: 'Build: "The cat sits on the mat"',
      blocks: [
        { label: 'The cat', category: 'subject' as BlockCategory, isDistractor: false },
        { label: 'sits', category: 'verb' as BlockCategory, isDistractor: false },
        { label: 'on the mat', category: 'place' as BlockCategory, isDistractor: false },
        { label: 'quickly', category: 'modifier' as BlockCategory, isDistractor: true },
      ],
    },
    {
      text: 'Build: "She always studies in the library"',
      blocks: [
        { label: 'She', category: 'subject' as BlockCategory, isDistractor: false },
        { label: 'always studies', category: 'verb' as BlockCategory, isDistractor: false },
        { label: 'in the library', category: 'place' as BlockCategory, isDistractor: false },
        { label: 'never', category: 'modifier' as BlockCategory, isDistractor: true },
      ],
    },
  ];

  for (let i = 0; i < count; i++) {
    const useType = config.exerciseTypes[i % config.exerciseTypes.length];

    if (useType === 'drag-and-drop' && dndTemplates.length > 0) {
      const tpl = dndTemplates[i % dndTemplates.length];
      questions.push({
        id: `gen-${i + 1}`,
        type: 'drag-and-drop',
        text: tpl.text,
        grammarBlocks: tpl.blocks.map((b, idx) => ({ ...b, id: `blk-${i}-${idx}` })),
      });
    } else {
      const tpl = mcTemplates[i % mcTemplates.length];
      questions.push({
        id: `gen-${i + 1}`,
        type: 'multiple-choice',
        text: tpl.text,
        options: [...tpl.options],
        correctAnswerIndex: tpl.correct,
      });
    }
  }

  return questions;
}

// ─── Helper Functions ────────────────────────────────────────────────────────

function getTypeLabel(type: ExerciseType): string {
  switch (type) {
    case 'drag-and-drop': return 'Drag & Drop';
    case 'multiple-choice': return 'Multiple Choice';
    case 'sentence-ordering': return 'Sentence Ordering';
    case 'fill-in-blank': return 'Fill in the Blank';
    case 'rewrite-sentence': return 'Rewrite Sentence';
    case 'free-writing': return 'Free Writing';
    default: return type;
  }
}

function getTypeColor(type: ExerciseType): string {
  switch (type) {
    case 'drag-and-drop': return 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300';
    case 'multiple-choice': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
    case 'sentence-ordering': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
    case 'fill-in-blank': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
    case 'rewrite-sentence': return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300';
    case 'free-writing': return 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300';
    default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
  }
}

function getBlockCategoryColor(category: BlockCategory): string {
  switch (category) {
    case 'subject': return 'bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200';
    case 'verb': return 'bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200';
    case 'object': return 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200';
    case 'time': return 'bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200';
    case 'place': return 'bg-purple-200 text-purple-800 dark:bg-purple-800 dark:text-purple-200';
    case 'connector': return 'bg-orange-200 text-orange-800 dark:bg-orange-800 dark:text-orange-200';
    case 'modifier': return 'bg-pink-200 text-pink-800 dark:bg-pink-800 dark:text-pink-200';
    default: return 'bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
  }
}

// ─── Preview Modal Component ─────────────────────────────────────────────────

function PreviewModal({
  questions,
  onClose,
}: {
  questions: ChallengeQuestion[];
  onClose: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentQuestion = questions[currentIndex];
  const total = questions.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-2xl rounded-xl border border-border bg-card p-6 shadow-2xl">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label="Close preview"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Progress indicator */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">Preview Mode</span>
            <span className="text-muted-foreground">
              Question {currentIndex + 1} of {total}
            </span>
          </div>
          <div className="mt-2 h-2 w-full rounded-full bg-muted">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
            />
          </div>
        </div>

        {/* Question content */}
        {currentQuestion && (
          <div className="min-h-[200px] space-y-4">
            <div className="flex items-center gap-2">
              <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${getTypeColor(currentQuestion.type)}`}>
                {getTypeLabel(currentQuestion.type)}
              </span>
            </div>
            <p className="text-lg font-medium text-foreground">{currentQuestion.text}</p>

            {/* Multiple choice options */}
            {currentQuestion.type === 'multiple-choice' && currentQuestion.options && (
              <div className="space-y-2">
                {currentQuestion.options.map((opt, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-sm transition-colors ${
                      idx === currentQuestion.correctAnswerIndex
                        ? 'border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/20'
                        : 'border-border bg-background'
                    }`}
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full border border-muted-foreground/30 text-xs font-medium text-muted-foreground">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="text-foreground">{opt}</span>
                    {idx === currentQuestion.correctAnswerIndex && (
                      <svg className="ml-auto h-4 w-4 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Drag and drop blocks */}
            {currentQuestion.type === 'drag-and-drop' && currentQuestion.grammarBlocks && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Arrange blocks to form the sentence:</p>
                <div className="flex flex-wrap gap-2">
                  {currentQuestion.grammarBlocks.map((block) => (
                    <span
                      key={block.id}
                      className={`rounded-lg px-3 py-1.5 text-sm font-medium ${getBlockCategoryColor(block.category)} ${
                        block.isDistractor ? 'opacity-60 line-through' : ''
                      }`}
                    >
                      {block.label}
                      {block.isDistractor && ' (distractor)'}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Fill in blank */}
            {currentQuestion.type === 'fill-in-blank' && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Fill in the blanks:</p>
                <div className="rounded-lg border border-border bg-background p-4">
                  <p className="text-foreground">{currentQuestion.text}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation buttons */}
        <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
          <button
            type="button"
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="inline-flex items-center gap-2 rounded-[12px] border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors duration-200 hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Previous
          </button>
          <button
            type="button"
            onClick={() => setCurrentIndex((prev) => Math.min(total - 1, prev + 1))}
            disabled={currentIndex === total - 1}
            className="inline-flex items-center gap-2 rounded-[12px] border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors duration-200 hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Edit Page Component ────────────────────────────────────────────────

export default function EditChallengePage() {
  const params = useParams();
  const id = params.id as string;

  // Challenge config (loaded from mock)
  const [config, setConfig] = useState<ChallengeConfig | null>(null);
  const [questions, setQuestions] = useState<ChallengeQuestion[]>([]);
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus>('idle');
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<NodeJS.Timeout | null>(null);

  // Load mock challenge data
  useEffect(() => {
    const mockData = MOCK_CHALLENGES[id] || MOCK_CHALLENGES['ch-1'];
    if (mockData) {
      setConfig({
        title: mockData.title,
        targetLevel: mockData.targetLevel,
        grammarTopics: mockData.grammarTopics,
        difficulty: mockData.difficulty,
        exerciseTypes: mockData.exerciseTypes,
        questionCount: mockData.questionCount,
      });
      setQuestions(mockData.questions);
    }
  }, [id]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, []);

  // ─── AI Generation Handler ─────────────────────────────────────────────────

  const handleGenerateWithAI = useCallback(() => {
    if (!config) return;

    setGenerationStatus('generating');
    setGenerationProgress(0);
    setGenerationError(null);

    // Progress animation (increments over ~2s)
    let progress = 0;
    progressRef.current = setInterval(() => {
      progress += 5;
      if (progress >= 95) {
        progress = 95; // Hold at 95% until complete
        if (progressRef.current) clearInterval(progressRef.current);
      }
      setGenerationProgress(progress);
    }, 100);

    // 30s timeout guard
    timeoutRef.current = setTimeout(() => {
      if (progressRef.current) clearInterval(progressRef.current);
      setGenerationStatus('timeout');
      setGenerationError('Generation timed out after 30 seconds. Your configuration has been preserved.');
      setGenerationProgress(0);
    }, 30000);

    // Simulate 2s AI generation
    setTimeout(() => {
      // Clear the 30s timeout since we completed
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (progressRef.current) clearInterval(progressRef.current);

      setGenerationProgress(100);

      // Short delay to show 100% then transition
      setTimeout(() => {
        const generated = generateMockQuestions(config);
        setQuestions(generated);
        setGenerationStatus('success');
        setGenerationProgress(0);
      }, 200);
    }, 2000);
  }, [config]);

  // ─── Question Editing Handlers ─────────────────────────────────────────────

  const updateQuestionText = useCallback((questionId: string, text: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, text } : q))
    );
  }, []);

  const updateCorrectAnswer = useCallback((questionId: string, index: number) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, correctAnswerIndex: index } : q))
    );
  }, []);

  const updateOption = useCallback((questionId: string, optionIndex: number, value: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId || !q.options) return q;
        const newOptions = [...q.options];
        newOptions[optionIndex] = value;
        return { ...q, options: newOptions };
      })
    );
  }, []);

  const removeQuestion = useCallback((questionId: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== questionId));
  }, []);

  const addQuestion = useCallback(() => {
    const newQ: ChallengeQuestion = {
      id: `new-${Date.now()}`,
      type: 'multiple-choice',
      text: '',
      options: ['', '', '', ''],
      correctAnswerIndex: 0,
    };
    setQuestions((prev) => [...prev, newQ]);
  }, []);

  const toggleBlockDistractor = useCallback((questionId: string, blockId: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId || !q.grammarBlocks) return q;
        return {
          ...q,
          grammarBlocks: q.grammarBlocks.map((b) =>
            b.id === blockId ? { ...b, isDistractor: !b.isDistractor } : b
          ),
        };
      })
    );
  }, []);

  // ─── Render ────────────────────────────────────────────────────────────────

  if (!config) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <nav className="mb-3 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link href="/admin/challenges" className="transition-colors hover:text-foreground">
            Placement Challenges
          </Link>
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
          <span className="text-foreground">Edit</span>
        </nav>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{config.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {config.targetLevel} · Difficulty {config.difficulty} · {config.questionCount} questions configured
            </p>
          </div>
          {questions.length > 0 && (
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="inline-flex items-center gap-2 rounded-[12px] border border-input bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors duration-200 hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Preview
            </button>
          )}
        </div>
      </div>

      {/* Generate with AI Section */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.15)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-sm">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Generate with AI</p>
              <p className="text-xs text-muted-foreground">
                Auto-generate {config.questionCount} questions based on your configuration
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleGenerateWithAI}
            disabled={generationStatus === 'generating'}
            className="inline-flex items-center gap-2 rounded-[12px] bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-opacity duration-200 hover:from-violet-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            {generationStatus === 'generating' ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
                Generate
              </>
            )}
          </button>
        </div>

        {/* Progress bar during generation */}
        {generationStatus === 'generating' && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Generating questions...</span>
              <span>{generationProgress}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 transition-all duration-200"
                style={{ width: `${generationProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Success message */}
        {generationStatus === 'success' && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 dark:border-green-800 dark:bg-green-900/20">
            <svg className="h-4 w-4 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-green-700 dark:text-green-300">
              {questions.length} questions generated successfully. Review and edit below.
            </span>
          </div>
        )}

        {/* Error / Timeout message */}
        {(generationStatus === 'error' || generationStatus === 'timeout') && (
          <div className="mt-4 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-3 py-2 dark:border-red-800 dark:bg-red-900/20">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <span className="text-sm text-red-700 dark:text-red-300">
                {generationError || 'Generation failed. Your configuration has been preserved.'}
              </span>
            </div>
            <button
              type="button"
              onClick={handleGenerateWithAI}
              className="rounded-md px-3 py-1 text-xs font-medium text-red-700 transition-colors hover:bg-red-100 dark:text-red-300 dark:hover:bg-red-900/30"
            >
              Retry
            </button>
          </div>
        )}
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            Questions ({questions.length})
          </h2>
          <button
            type="button"
            onClick={addQuestion}
            className="inline-flex items-center gap-1.5 rounded-[12px] border border-input bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors duration-200 hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Question
          </button>
        </div>

        {questions.length === 0 && (
          <div className="rounded-xl border border-dashed border-border bg-muted/20 p-12 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <svg className="h-6 w-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-foreground">No questions yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Click &quot;Generate with AI&quot; to auto-generate questions or add them manually.
            </p>
          </div>
        )}

        {/* Editable question cards */}
        {questions.map((question, qIdx) => (
          <div
            key={question.id}
            className="rounded-xl border border-border bg-card p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.15)]"
          >
            {/* Question header */}
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                  {qIdx + 1}
                </span>
                <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${getTypeColor(question.type)}`}>
                  {getTypeLabel(question.type)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => removeQuestion(question.id)}
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-ring"
                aria-label={`Remove question ${qIdx + 1}`}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </button>
            </div>

            {/* Question text input */}
            <div className="mb-3">
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Question Text
              </label>
              <input
                type="text"
                value={question.text}
                onChange={(e) => updateQuestionText(question.id, e.target.value)}
                placeholder="Enter question text..."
                className="block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Multiple choice options */}
            {question.type === 'multiple-choice' && question.options && (
              <div className="space-y-2">
                <label className="block text-xs font-medium text-muted-foreground">
                  Options (select correct answer)
                </label>
                {question.options.map((opt, optIdx) => (
                  <div key={optIdx} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateCorrectAnswer(question.id, optIdx)}
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                        optIdx === question.correctAnswerIndex
                          ? 'border-green-500 bg-green-500 text-white'
                          : 'border-muted-foreground/30 hover:border-green-400'
                      }`}
                      aria-label={`Mark option ${String.fromCharCode(65 + optIdx)} as correct`}
                    >
                      {optIdx === question.correctAnswerIndex && (
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      )}
                    </button>
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => updateOption(question.id, optIdx, e.target.value)}
                      placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                      className="block w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Drag-and-drop grammar blocks */}
            {question.type === 'drag-and-drop' && question.grammarBlocks && (
              <div className="space-y-2">
                <label className="block text-xs font-medium text-muted-foreground">
                  Grammar Blocks (click to toggle distractor)
                </label>
                <div className="flex flex-wrap gap-2">
                  {question.grammarBlocks.map((block) => (
                    <button
                      key={block.id}
                      type="button"
                      onClick={() => toggleBlockDistractor(question.id, block.id)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${getBlockCategoryColor(block.category)} ${
                        block.isDistractor ? 'opacity-50 line-through border-dashed' : 'border-transparent'
                      }`}
                      title={`${block.category} - ${block.isDistractor ? 'Distractor (click to make valid)' : 'Valid block (click to make distractor)'}`}
                    >
                      {block.label}
                      <span className="ml-1 text-[10px] opacity-70">({block.category})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Fill-in-blank display */}
            {question.type === 'fill-in-blank' && (
              <div className="text-xs text-muted-foreground mt-1">
                Students will fill in the blanks marked with &quot;___&quot; in the sentence above.
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {showPreview && questions.length > 0 && (
        <PreviewModal questions={questions} onClose={() => setShowPreview(false)} />
      )}
    </div>
  );
}
