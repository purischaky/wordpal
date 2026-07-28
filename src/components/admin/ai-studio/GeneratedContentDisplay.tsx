'use client';

import { useState, useCallback } from 'react';
import type { GrammarBlock, BlockCategory } from '@/types/admin';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface GeneratedExercise {
  id: string;
  sentence: string;
  blocks: GrammarBlock[];
}

export interface GeneratedContent {
  lessonExplanation: string;
  examples: string[];
  exercises: GeneratedExercise[];
  grammarTips: string[];
  commonMistakes: string[];
  assessmentQuestions: string[];
  placementChallenge: string;
}

interface GeneratedContentDisplayProps {
  content: GeneratedContent;
  onSaveToLesson: (content: GeneratedContent) => Promise<void>;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

export function createMockGeneratedContent(): GeneratedContent {
  return {
    lessonExplanation:
      'The Present Perfect Continuous is used to describe actions that started in the past and continue to the present, or recently finished actions with visible results. It is formed with have/has + been + verb-ing.',
    examples: [
      'She has been studying English for three years.',
      'They have been waiting for the bus since 8 AM.',
      'I have been working on this project all week.',
      'He has been living in London since 2019.',
      'We have been discussing the issue for an hour.',
    ],
    exercises: [
      {
        id: 'ex-1',
        sentence: 'She has been reading a book all afternoon.',
        blocks: [
          { id: 'b1', label: 'She', category: 'subject' as BlockCategory, isDistractor: false, sourceOrder: 0 },
          { id: 'b2', label: 'has been', category: 'verb' as BlockCategory, isDistractor: false, sourceOrder: 1 },
          { id: 'b3', label: 'reading', category: 'verb' as BlockCategory, isDistractor: false, sourceOrder: 2 },
          { id: 'b4', label: 'a book', category: 'object' as BlockCategory, isDistractor: false, sourceOrder: 3 },
          { id: 'b5', label: 'all afternoon', category: 'time' as BlockCategory, isDistractor: false, sourceOrder: 4 },
        ],
      },
      {
        id: 'ex-2',
        sentence: 'They have been playing football since morning.',
        blocks: [
          { id: 'b6', label: 'They', category: 'subject' as BlockCategory, isDistractor: false, sourceOrder: 0 },
          { id: 'b7', label: 'have been', category: 'verb' as BlockCategory, isDistractor: false, sourceOrder: 1 },
          { id: 'b8', label: 'playing', category: 'verb' as BlockCategory, isDistractor: false, sourceOrder: 2 },
          { id: 'b9', label: 'football', category: 'object' as BlockCategory, isDistractor: false, sourceOrder: 3 },
          { id: 'b10', label: 'since morning', category: 'time' as BlockCategory, isDistractor: false, sourceOrder: 4 },
        ],
      },
      {
        id: 'ex-3',
        sentence: 'I have been learning Spanish at the community center.',
        blocks: [
          { id: 'b11', label: 'I', category: 'subject' as BlockCategory, isDistractor: false, sourceOrder: 0 },
          { id: 'b12', label: 'have been', category: 'verb' as BlockCategory, isDistractor: false, sourceOrder: 1 },
          { id: 'b13', label: 'learning', category: 'verb' as BlockCategory, isDistractor: false, sourceOrder: 2 },
          { id: 'b14', label: 'Spanish', category: 'object' as BlockCategory, isDistractor: false, sourceOrder: 3 },
          { id: 'b15', label: 'at the community center', category: 'place' as BlockCategory, isDistractor: false, sourceOrder: 4 },
        ],
      },
    ],
    grammarTips: [
      'Use "for" with durations (for three hours) and "since" with specific points in time (since Monday).',
      'The present perfect continuous emphasizes the duration or ongoing nature of an activity.',
      'Some verbs (know, believe, like) are not typically used in continuous forms — use present perfect simple instead.',
    ],
    commonMistakes: [
      'Confusing "since" and "for": "I have been waiting since two hours" ✗ → "I have been waiting for two hours" ✓',
      'Using simple past instead: "I worked here for 5 years" (implies you stopped) vs. "I have been working here for 5 years" (still working).',
      'Omitting "been": "She has working all day" ✗ → "She has been working all day" ✓',
    ],
    assessmentQuestions: [
      'Complete: "They ___ (wait) for the train for 20 minutes."',
      'Choose the correct form: "She has been knowing / has known him since childhood."',
      'Rewrite using present perfect continuous: "He started studying at 6 AM. It is now 10 AM."',
      'Identify the error: "We have been living here since five years."',
      'Fill in: "How long ___ you ___ (learn) to drive?"',
    ],
    placementChallenge:
      'Write 3 sentences describing activities you have been doing recently. Use "for" in at least one sentence and "since" in another. Include at least one question form.',
  };
}

// ─── Category Colors (matching GrammarBlockEditor) ───────────────────────────

const CATEGORY_COLORS: Record<BlockCategory, { bg: string; text: string; badge: string }> = {
  subject: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-800 dark:text-blue-200', badge: 'bg-blue-500' },
  verb: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-200', badge: 'bg-green-500' },
  object: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-800 dark:text-orange-200', badge: 'bg-orange-500' },
  time: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-800 dark:text-purple-200', badge: 'bg-purple-500' },
  place: { bg: 'bg-pink-100 dark:bg-pink-900/30', text: 'text-pink-800 dark:text-pink-200', badge: 'bg-pink-500' },
  connector: { bg: 'bg-teal-100 dark:bg-teal-900/30', text: 'text-teal-800 dark:text-teal-200', badge: 'bg-teal-500' },
  modifier: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-800 dark:text-amber-200', badge: 'bg-amber-500' },
  contrast: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-200', badge: 'bg-red-500' },
};

// ─── Section Header Component ────────────────────────────────────────────────

function SectionHeader({ title, count, min, max }: { title: string; count?: number; min?: number; max?: number }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {count !== undefined && min !== undefined && max !== undefined && (
        <span className="text-xs text-muted-foreground">
          {count} items (min {min}, max {max})
        </span>
      )}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function GeneratedContentDisplay({
  content: initialContent,
  onSaveToLesson,
}: GeneratedContentDisplayProps) {
  const [content, setContent] = useState<GeneratedContent>(initialContent);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // ─── Update Handlers ────────────────────────────────────────────────────────

  const updateLessonExplanation = useCallback((value: string) => {
    setContent((prev) => ({ ...prev, lessonExplanation: value }));
  }, []);

  const updatePlacementChallenge = useCallback((value: string) => {
    setContent((prev) => ({ ...prev, placementChallenge: value }));
  }, []);

  const updateListItem = useCallback((
    field: 'examples' | 'grammarTips' | 'commonMistakes' | 'assessmentQuestions',
    index: number,
    value: string
  ) => {
    setContent((prev) => {
      const updated = [...prev[field]];
      updated[index] = value;
      return { ...prev, [field]: updated };
    });
  }, []);

  const addListItem = useCallback((
    field: 'examples' | 'grammarTips' | 'commonMistakes' | 'assessmentQuestions',
    maxItems: number
  ) => {
    setContent((prev) => {
      if (prev[field].length >= maxItems) return prev;
      return { ...prev, [field]: [...prev[field], ''] };
    });
  }, []);

  const removeListItem = useCallback((
    field: 'examples' | 'grammarTips' | 'commonMistakes' | 'assessmentQuestions',
    index: number,
    minItems: number
  ) => {
    setContent((prev) => {
      if (prev[field].length <= minItems) return prev;
      const updated = prev[field].filter((_, i) => i !== index);
      return { ...prev, [field]: updated };
    });
  }, []);

  const moveListItem = useCallback((
    field: 'examples' | 'grammarTips' | 'commonMistakes' | 'assessmentQuestions',
    index: number,
    direction: 'up' | 'down'
  ) => {
    setContent((prev) => {
      const items = [...prev[field]];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= items.length) return prev;
      [items[index], items[targetIndex]] = [items[targetIndex], items[index]];
      return { ...prev, [field]: items };
    });
  }, []);

  const updateExerciseSentence = useCallback((index: number, value: string) => {
    setContent((prev) => {
      const exercises = [...prev.exercises];
      exercises[index] = { ...exercises[index], sentence: value };
      return { ...prev, exercises };
    });
  }, []);

  const updateExerciseBlock = useCallback((exerciseIndex: number, blockIndex: number, label: string) => {
    setContent((prev) => {
      const exercises = [...prev.exercises];
      const blocks = [...exercises[exerciseIndex].blocks];
      blocks[blockIndex] = { ...blocks[blockIndex], label };
      exercises[exerciseIndex] = { ...exercises[exerciseIndex], blocks };
      return { ...prev, exercises };
    });
  }, []);

  const removeExercise = useCallback((index: number) => {
    setContent((prev) => {
      if (prev.exercises.length <= 3) return prev;
      const exercises = prev.exercises.filter((_, i) => i !== index);
      return { ...prev, exercises };
    });
  }, []);

  const addExercise = useCallback(() => {
    setContent((prev) => {
      if (prev.exercises.length >= 10) return prev;
      const newExercise: GeneratedExercise = {
        id: `ex-new-${Date.now()}`,
        sentence: '',
        blocks: [
          { id: `b-new-${Date.now()}-1`, label: '', category: 'subject', isDistractor: false, sourceOrder: 0 },
          { id: `b-new-${Date.now()}-2`, label: '', category: 'verb', isDistractor: false, sourceOrder: 1 },
        ],
      };
      return { ...prev, exercises: [...prev.exercises, newExercise] };
    });
  }, []);

  const moveExercise = useCallback((index: number, direction: 'up' | 'down') => {
    setContent((prev) => {
      const exercises = [...prev.exercises];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= exercises.length) return prev;
      [exercises[index], exercises[targetIndex]] = [exercises[targetIndex], exercises[index]];
      return { ...prev, exercises };
    });
  }, []);

  // ─── Save Handler ────────────────────────────────────────────────────────────

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      await onSaveToLesson(content);
      setSaveSuccess(true);
      // Auto-dismiss success after 5s
      setTimeout(() => setSaveSuccess(false), 5000);
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : 'Failed to save. Please try again.'
      );
    } finally {
      setIsSaving(false);
    }
  }, [content, onSaveToLesson]);

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Section: Lesson Explanation */}
      <section className="rounded-xl border border-border bg-card p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.15)]">
        <SectionHeader title="Lesson Explanation" />
        <textarea
          value={content.lessonExplanation}
          onChange={(e) => updateLessonExplanation(e.target.value)}
          rows={4}
          className="w-full resize-y rounded-[12px] border border-input bg-background px-3.5 py-2.5 text-sm text-foreground transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label="Lesson explanation text"
        />
      </section>

      {/* Section: Examples */}
      <section className="rounded-xl border border-border bg-card p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.15)]">
        <SectionHeader title="Examples" count={content.examples.length} min={3} max={10} />
        <div className="space-y-2">
          {content.examples.map((example, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="flex-shrink-0 text-xs font-medium text-muted-foreground w-5">{index + 1}.</span>
              <input
                type="text"
                value={example}
                onChange={(e) => updateListItem('examples', index, e.target.value)}
                className="flex-1 rounded-[12px] border border-input bg-background px-3 py-2 text-sm text-foreground transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring"
                aria-label={`Example ${index + 1}`}
              />
              <button
                type="button"
                onClick={() => moveListItem('examples', index, 'up')}
                disabled={index === 0}
                className="p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                aria-label="Move up"
              >↑</button>
              <button
                type="button"
                onClick={() => moveListItem('examples', index, 'down')}
                disabled={index === content.examples.length - 1}
                className="p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                aria-label="Move down"
              >↓</button>
              <button
                type="button"
                onClick={() => removeListItem('examples', index, 3)}
                disabled={content.examples.length <= 3}
                className="p-1.5 text-muted-foreground hover:text-destructive disabled:opacity-30 transition-colors"
                aria-label="Remove example"
              >✕</button>
            </div>
          ))}
        </div>
        {content.examples.length < 10 && (
          <button
            type="button"
            onClick={() => addListItem('examples', 10)}
            className="mt-2 inline-flex items-center gap-1 rounded-[12px] border border-dashed border-input px-3 py-1.5 text-xs font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors duration-200"
          >
            + Add Example
          </button>
        )}
      </section>

      {/* Section: Exercises with Grammar Blocks */}
      <section className="rounded-xl border border-border bg-card p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.15)]">
        <SectionHeader title="Exercises with Grammar Blocks" count={content.exercises.length} min={3} max={10} />
        <div className="space-y-4">
          {content.exercises.map((exercise, exIndex) => (
            <div key={exercise.id} className="rounded-lg border border-border bg-background p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-foreground">Exercise {exIndex + 1}</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveExercise(exIndex, 'up')}
                    disabled={exIndex === 0}
                    className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                    aria-label="Move exercise up"
                  >↑</button>
                  <button
                    type="button"
                    onClick={() => moveExercise(exIndex, 'down')}
                    disabled={exIndex === content.exercises.length - 1}
                    className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                    aria-label="Move exercise down"
                  >↓</button>
                  <button
                    type="button"
                    onClick={() => removeExercise(exIndex)}
                    disabled={content.exercises.length <= 3}
                    className="p-1 text-muted-foreground hover:text-destructive disabled:opacity-30 transition-colors"
                    aria-label="Remove exercise"
                  >✕</button>
                </div>
              </div>
              {/* Sentence */}
              <div className="mb-3">
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Target Sentence
                </label>
                <input
                  type="text"
                  value={exercise.sentence}
                  onChange={(e) => updateExerciseSentence(exIndex, e.target.value)}
                  className="w-full rounded-[12px] border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  aria-label={`Exercise ${exIndex + 1} target sentence`}
                />
              </div>

              {/* Blocks */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-2">
                  Grammar Blocks
                </label>
                <div className="flex flex-wrap gap-2">
                  {exercise.blocks.map((block, bIndex) => {
                    const colors = CATEGORY_COLORS[block.category];
                    return (
                      <div key={block.id} className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg ${colors.bg}`}>
                        <span className={`w-2 h-2 rounded-full ${colors.badge}`} />
                        <input
                          type="text"
                          value={block.label}
                          onChange={(e) => updateExerciseBlock(exIndex, bIndex, e.target.value)}
                          className={`bg-transparent border-none text-sm font-medium w-20 focus:outline-none focus:ring-0 ${colors.text}`}
                          aria-label={`Block ${bIndex + 1} label`}
                        />
                        <span className={`text-[10px] font-medium ${colors.text} opacity-70`}>
                          {block.category}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
        {content.exercises.length < 10 && (
          <button
            type="button"
            onClick={addExercise}
            className="mt-3 inline-flex items-center gap-1 rounded-[12px] border border-dashed border-input px-3 py-1.5 text-xs font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors duration-200"
          >
            + Add Exercise
          </button>
        )}
      </section>

      {/* Section: Grammar Tips */}
      <section className="rounded-xl border border-border bg-card p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.15)]">
        <SectionHeader title="Grammar Tips" count={content.grammarTips.length} min={2} max={5} />
        <div className="space-y-2">
          {content.grammarTips.map((tip, index) => (
            <div key={index} className="flex items-start gap-2">
              <span className="mt-2.5 flex-shrink-0 text-xs font-medium text-muted-foreground w-5">💡</span>
              <textarea
                value={tip}
                onChange={(e) => updateListItem('grammarTips', index, e.target.value)}
                rows={2}
                className="flex-1 resize-y rounded-[12px] border border-input bg-background px-3 py-2 text-sm text-foreground transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring"
                aria-label={`Grammar tip ${index + 1}`}
              />
              <div className="flex flex-col gap-0.5 mt-1">
                <button
                  type="button"
                  onClick={() => moveListItem('grammarTips', index, 'up')}
                  disabled={index === 0}
                  className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                  aria-label="Move up"
                >↑</button>
                <button
                  type="button"
                  onClick={() => moveListItem('grammarTips', index, 'down')}
                  disabled={index === content.grammarTips.length - 1}
                  className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                  aria-label="Move down"
                >↓</button>
                <button
                  type="button"
                  onClick={() => removeListItem('grammarTips', index, 2)}
                  disabled={content.grammarTips.length <= 2}
                  className="p-1 text-muted-foreground hover:text-destructive disabled:opacity-30 transition-colors"
                  aria-label="Remove tip"
                >✕</button>
              </div>
            </div>
          ))}
        </div>
        {content.grammarTips.length < 5 && (
          <button
            type="button"
            onClick={() => addListItem('grammarTips', 5)}
            className="mt-2 inline-flex items-center gap-1 rounded-[12px] border border-dashed border-input px-3 py-1.5 text-xs font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors duration-200"
          >
            + Add Tip
          </button>
        )}
      </section>

      {/* Section: Common Mistakes */}
      <section className="rounded-xl border border-border bg-card p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.15)]">
        <SectionHeader title="Common Mistakes" count={content.commonMistakes.length} min={2} max={5} />
        <div className="space-y-2">
          {content.commonMistakes.map((mistake, index) => (
            <div key={index} className="flex items-start gap-2">
              <span className="mt-2.5 flex-shrink-0 text-xs font-medium text-muted-foreground w-5">⚠️</span>
              <textarea
                value={mistake}
                onChange={(e) => updateListItem('commonMistakes', index, e.target.value)}
                rows={2}
                className="flex-1 resize-y rounded-[12px] border border-input bg-background px-3 py-2 text-sm text-foreground transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring"
                aria-label={`Common mistake ${index + 1}`}
              />
              <div className="flex flex-col gap-0.5 mt-1">
                <button
                  type="button"
                  onClick={() => moveListItem('commonMistakes', index, 'up')}
                  disabled={index === 0}
                  className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                  aria-label="Move up"
                >↑</button>
                <button
                  type="button"
                  onClick={() => moveListItem('commonMistakes', index, 'down')}
                  disabled={index === content.commonMistakes.length - 1}
                  className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                  aria-label="Move down"
                >↓</button>
                <button
                  type="button"
                  onClick={() => removeListItem('commonMistakes', index, 2)}
                  disabled={content.commonMistakes.length <= 2}
                  className="p-1 text-muted-foreground hover:text-destructive disabled:opacity-30 transition-colors"
                  aria-label="Remove mistake"
                >✕</button>
              </div>
            </div>
          ))}
        </div>
        {content.commonMistakes.length < 5 && (
          <button
            type="button"
            onClick={() => addListItem('commonMistakes', 5)}
            className="mt-2 inline-flex items-center gap-1 rounded-[12px] border border-dashed border-input px-3 py-1.5 text-xs font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors duration-200"
          >
            + Add Mistake
          </button>
        )}
      </section>

      {/* Section: Assessment Questions */}
      <section className="rounded-xl border border-border bg-card p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.15)]">
        <SectionHeader title="Assessment Questions" count={content.assessmentQuestions.length} min={3} max={10} />
        <div className="space-y-2">
          {content.assessmentQuestions.map((question, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="flex-shrink-0 text-xs font-medium text-muted-foreground w-5">Q{index + 1}</span>
              <input
                type="text"
                value={question}
                onChange={(e) => updateListItem('assessmentQuestions', index, e.target.value)}
                className="flex-1 rounded-[12px] border border-input bg-background px-3 py-2 text-sm text-foreground transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring"
                aria-label={`Assessment question ${index + 1}`}
              />
              <button
                type="button"
                onClick={() => moveListItem('assessmentQuestions', index, 'up')}
                disabled={index === 0}
                className="p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                aria-label="Move up"
              >↑</button>
              <button
                type="button"
                onClick={() => moveListItem('assessmentQuestions', index, 'down')}
                disabled={index === content.assessmentQuestions.length - 1}
                className="p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                aria-label="Move down"
              >↓</button>
              <button
                type="button"
                onClick={() => removeListItem('assessmentQuestions', index, 3)}
                disabled={content.assessmentQuestions.length <= 3}
                className="p-1.5 text-muted-foreground hover:text-destructive disabled:opacity-30 transition-colors"
                aria-label="Remove question"
              >✕</button>
            </div>
          ))}
        </div>
        {content.assessmentQuestions.length < 10 && (
          <button
            type="button"
            onClick={() => addListItem('assessmentQuestions', 10)}
            className="mt-2 inline-flex items-center gap-1 rounded-[12px] border border-dashed border-input px-3 py-1.5 text-xs font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors duration-200"
          >
            + Add Question
          </button>
        )}
      </section>

      {/* Section: Placement Challenge */}
      <section className="rounded-xl border border-border bg-card p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.15)]">
        <SectionHeader title="Placement Challenge" />
        <textarea
          value={content.placementChallenge}
          onChange={(e) => updatePlacementChallenge(e.target.value)}
          rows={3}
          className="w-full resize-y rounded-[12px] border border-input bg-background px-3.5 py-2.5 text-sm text-foreground transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label="Placement challenge text"
        />
      </section>

      {/* Save Section */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.15)]">
        {/* Success Confirmation */}
        {saveSuccess && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20">
            <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-medium text-green-800 dark:text-green-200">
              Content saved as a new lesson successfully!
            </p>
          </div>
        )}

        {/* Save Error */}
        {saveError && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3 dark:border-destructive/50 dark:bg-destructive/10">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-destructive" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <p className="text-sm font-medium text-destructive">{saveError}</p>
            </div>
            <button
              type="button"
              onClick={handleSave}
              className="shrink-0 rounded-[12px] border border-destructive/30 bg-background px-3 py-1.5 text-sm font-medium text-destructive transition-colors duration-200 hover:bg-destructive/10"
            >
              Retry
            </button>
          </div>
        )}

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Save the generated content as a new lesson with exercises and grammar blocks.
          </p>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-[12px] bg-gradient-to-r from-primary to-primary/80 px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-all duration-200 hover:from-primary/90 hover:to-primary/70 focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Saving...
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                </svg>
                Save to Lesson
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
