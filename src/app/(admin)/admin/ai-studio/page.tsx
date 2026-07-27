'use client';

import { useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import type { CEFRLevel } from '@/types/admin';
import {
  validateAIGenerationForm,
  type AIGenerationFormData,
  type AIGenerationFormErrors,
} from '@/lib/validators/ai-generation';
import GeneratedContentDisplay, {
  createMockGeneratedContent,
  type GeneratedContent,
} from '@/components/admin/ai-studio/GeneratedContentDisplay';

// ─── Constants ───────────────────────────────────────────────────────────────

const CEFR_LEVELS: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const DIFFICULTY_OPTIONS = [1, 2, 3, 4, 5] as const;
const CONTEXT_OPTIONS = ['Business', 'Travel', 'Daily Life', 'Interview'] as const;

const GENERATION_TIMEOUT_MS = 30_000;
const MOCK_GENERATION_DELAY_MS = 2500; // 2-3 second mock delay

// ─── AI Content Studio Page ──────────────────────────────────────────────────

export default function AIStudioPage() {
  const [formData, setFormData] = useState<AIGenerationFormData>({
    grammarTopic: '',
    targetLevel: '',
    difficulty: '',
    learningGoal: '',
    context: '',
  });

  const [errors, setErrors] = useState<AIGenerationFormErrors>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generationSuccess, setGenerationSuccess] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const generationRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Update a single field
  const updateField = useCallback(<K extends keyof AIGenerationFormData>(
    field: K,
    value: AIGenerationFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field on change
    setErrors((prev) => {
      if (prev[field]) {
        const next = { ...prev };
        delete next[field];
        return next;
      }
      return prev;
    });
    // Clear generation error when user modifies form
    setGenerationError(null);
  }, []);

  // Cleanup timers
  const clearTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (generationRef.current) {
      clearTimeout(generationRef.current);
      generationRef.current = null;
    }
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      // Clear previous states
      setGenerationError(null);
      setGenerationSuccess(false);

      // Validate
      const validationErrors = validateAIGenerationForm(formData);

      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      // Start generation - show loading state immediately
      setIsGenerating(true);

      // Set up timeout (30 seconds)
      timeoutRef.current = setTimeout(() => {
        // Timeout triggered - cancel the mock generation
        if (generationRef.current) {
          clearTimeout(generationRef.current);
          generationRef.current = null;
        }
        setIsGenerating(false);
        setGenerationError(
          'Generation timed out after 30 seconds. Please try again.'
        );
      }, GENERATION_TIMEOUT_MS);

      // Simulate AI generation with 2-3 second delay
      generationRef.current = setTimeout(() => {
        // Clear the timeout since generation completed
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        setIsGenerating(false);
        setGenerationSuccess(true);
        setGeneratedContent(createMockGeneratedContent());
      }, MOCK_GENERATION_DELAY_MS);
    },
    [formData]
  );

  // Handle retry - resubmit with same form values
  const handleRetry = useCallback(() => {
    setGenerationError(null);
    setGenerationSuccess(false);
    setGeneratedContent(null);
    setIsGenerating(true);

    // Set up timeout (30 seconds)
    timeoutRef.current = setTimeout(() => {
      if (generationRef.current) {
        clearTimeout(generationRef.current);
        generationRef.current = null;
      }
      setIsGenerating(false);
      setGenerationError(
        'Generation timed out after 30 seconds. Please try again.'
      );
    }, GENERATION_TIMEOUT_MS);

    // Simulate AI generation
    generationRef.current = setTimeout(() => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setIsGenerating(false);
      setGenerationSuccess(true);
      setGeneratedContent(createMockGeneratedContent());
    }, MOCK_GENERATION_DELAY_MS);
  }, []);

  // Handle save to lesson (simulates persistence)
  const handleSaveToLesson = useCallback(async (editedContent: GeneratedContent) => {
    // Simulate save operation with a small delay
    await new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        // Simulate ~90% success rate for demo purposes
        if (Math.random() > 0.1) {
          resolve();
        } else {
          reject(new Error('Network error: Unable to save lesson. Please check your connection and try again.'));
        }
      }, 1500);
    });
    // Update local state with the saved content
    setGeneratedContent(editedContent);
  }, []);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Page Header */}
      <div>
        <nav className="mb-3 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link
            href="/admin"
            className="transition-colors hover:text-foreground"
          >
            Dashboard
          </Link>
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
          <span className="text-foreground">AI Content Studio</span>
        </nav>
        <h1 className="text-2xl font-bold text-foreground">
          AI Content Studio
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Generate AI-powered lesson content by specifying grammar parameters and learning goals.
        </p>
      </div>

      {/* Success Message */}
      {generationSuccess && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-medium text-green-800 dark:text-green-200">
              Content generated successfully! You can now review and edit the generated content.
            </p>
          </div>
        </div>
      )}

      {/* Generation Error */}
      {generationError && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 dark:border-destructive/50 dark:bg-destructive/10">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-destructive" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <p className="text-sm font-medium text-destructive">
                {generationError}
              </p>
            </div>
            <button
              type="button"
              onClick={handleRetry}
              className="shrink-0 rounded-[12px] border border-destructive/30 bg-background px-3 py-1.5 text-sm font-medium text-destructive transition-colors duration-200 hover:bg-destructive/10 focus:outline-none focus:ring-2 focus:ring-ring"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isGenerating && (
        <div className="rounded-xl border border-border bg-card p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.15)]">
          <div className="flex flex-col items-center gap-4 py-4">
            {/* Spinning Progress Indicator */}
            <div className="relative">
              <svg className="h-12 w-12 animate-spin text-primary" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">
                Generating content...
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                AI is crafting your lesson materials. This may take a moment.
              </p>
            </div>
            {/* Progress bar animation */}
            <div className="w-full max-w-xs overflow-hidden rounded-full bg-muted">
              <div className="h-1.5 animate-pulse rounded-full bg-gradient-to-r from-primary to-primary/60" style={{ width: '60%' }} />
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div className="rounded-xl border border-border bg-card p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.15)]">
          <div className="space-y-5">
            {/* Grammar Topic */}
            <div>
              <label
                htmlFor="ai-grammar-topic"
                className="block text-sm font-medium text-foreground"
              >
                Grammar Topic <span className="text-destructive">*</span>
              </label>
              <input
                id="ai-grammar-topic"
                type="text"
                maxLength={100}
                value={formData.grammarTopic}
                onChange={(e) => updateField('grammarTopic', e.target.value)}
                placeholder="e.g., Present Perfect Continuous"
                aria-describedby={errors.grammarTopic ? 'ai-grammar-topic-error' : undefined}
                aria-invalid={!!errors.grammarTopic}
                disabled={isGenerating}
                className={`mt-1.5 block w-full rounded-[12px] border px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${
                  errors.grammarTopic
                    ? 'border-destructive bg-destructive/5'
                    : 'border-input bg-background'
                }`}
              />
              <div className="mt-1 flex items-center justify-between">
                {errors.grammarTopic && (
                  <p id="ai-grammar-topic-error" className="text-xs text-destructive" role="alert">
                    {errors.grammarTopic}
                  </p>
                )}
                <span className="ml-auto text-xs text-muted-foreground">
                  {formData.grammarTopic.length}/100
                </span>
              </div>
            </div>

            {/* Target CEFR Level + Difficulty (side by side) */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {/* Target CEFR Level */}
              <div>
                <label
                  htmlFor="ai-target-level"
                  className="block text-sm font-medium text-foreground"
                >
                  Target CEFR Level <span className="text-destructive">*</span>
                </label>
                <select
                  id="ai-target-level"
                  value={formData.targetLevel}
                  onChange={(e) => updateField('targetLevel', e.target.value as CEFRLevel | '')}
                  aria-describedby={errors.targetLevel ? 'ai-target-level-error' : undefined}
                  aria-invalid={!!errors.targetLevel}
                  disabled={isGenerating}
                  className={`mt-1.5 block w-full rounded-[12px] border px-3.5 py-2.5 text-sm text-foreground transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${
                    errors.targetLevel
                      ? 'border-destructive bg-destructive/5'
                      : 'border-input bg-background'
                  }`}
                >
                  <option value="">Select a level...</option>
                  {CEFR_LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
                {errors.targetLevel && (
                  <p id="ai-target-level-error" className="mt-1 text-xs text-destructive" role="alert">
                    {errors.targetLevel}
                  </p>
                )}
              </div>

              {/* Difficulty */}
              <div>
                <label
                  htmlFor="ai-difficulty"
                  className="block text-sm font-medium text-foreground"
                >
                  Difficulty <span className="text-destructive">*</span>
                </label>
                <select
                  id="ai-difficulty"
                  value={formData.difficulty}
                  onChange={(e) => {
                    const val = e.target.value;
                    updateField('difficulty', val === '' ? '' : (Number(val) as 1 | 2 | 3 | 4 | 5));
                  }}
                  aria-describedby={errors.difficulty ? 'ai-difficulty-error' : undefined}
                  aria-invalid={!!errors.difficulty}
                  disabled={isGenerating}
                  className={`mt-1.5 block w-full rounded-[12px] border px-3.5 py-2.5 text-sm text-foreground transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${
                    errors.difficulty
                      ? 'border-destructive bg-destructive/5'
                      : 'border-input bg-background'
                  }`}
                >
                  <option value="">Select difficulty...</option>
                  {DIFFICULTY_OPTIONS.map((d) => (
                    <option key={d} value={d}>
                      {d} {d === 1 ? '(Easiest)' : d === 5 ? '(Hardest)' : ''}
                    </option>
                  ))}
                </select>
                {errors.difficulty && (
                  <p id="ai-difficulty-error" className="mt-1 text-xs text-destructive" role="alert">
                    {errors.difficulty}
                  </p>
                )}
              </div>
            </div>

            {/* Learning Goal */}
            <div>
              <label
                htmlFor="ai-learning-goal"
                className="block text-sm font-medium text-foreground"
              >
                Learning Goal <span className="text-destructive">*</span>
              </label>
              <textarea
                id="ai-learning-goal"
                maxLength={300}
                rows={3}
                value={formData.learningGoal}
                onChange={(e) => updateField('learningGoal', e.target.value)}
                placeholder="Describe what the student should learn, e.g., 'Understand when to use present perfect vs. past simple in business emails'"
                aria-describedby={errors.learningGoal ? 'ai-learning-goal-error' : undefined}
                aria-invalid={!!errors.learningGoal}
                disabled={isGenerating}
                className={`mt-1.5 block w-full resize-none rounded-[12px] border px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${
                  errors.learningGoal
                    ? 'border-destructive bg-destructive/5'
                    : 'border-input bg-background'
                }`}
              />
              <div className="mt-1 flex items-center justify-between">
                {errors.learningGoal && (
                  <p id="ai-learning-goal-error" className="text-xs text-destructive" role="alert">
                    {errors.learningGoal}
                  </p>
                )}
                <span className="ml-auto text-xs text-muted-foreground">
                  {formData.learningGoal.length}/300
                </span>
              </div>
            </div>

            {/* Context */}
            <div>
              <label
                htmlFor="ai-context"
                className="block text-sm font-medium text-foreground"
              >
                Context <span className="text-destructive">*</span>
              </label>
              <select
                id="ai-context"
                value={formData.context}
                onChange={(e) => updateField('context', e.target.value as typeof formData.context)}
                aria-describedby={errors.context ? 'ai-context-error' : undefined}
                aria-invalid={!!errors.context}
                disabled={isGenerating}
                className={`mt-1.5 block w-full rounded-[12px] border px-3.5 py-2.5 text-sm text-foreground transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${
                  errors.context
                    ? 'border-destructive bg-destructive/5'
                    : 'border-input bg-background'
                }`}
              >
                <option value="">Select context...</option>
                {CONTEXT_OPTIONS.map((ctx) => (
                  <option key={ctx} value={ctx}>
                    {ctx}
                  </option>
                ))}
              </select>
              {errors.context && (
                <p id="ai-context-error" className="mt-1 text-xs text-destructive" role="alert">
                  {errors.context}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3">
          <Link
            href="/admin"
            className="rounded-[12px] border border-input bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors duration-200 hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isGenerating || generationSuccess}
            className="inline-flex items-center gap-2 rounded-[12px] bg-gradient-to-r from-primary to-primary/80 px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-all duration-200 hover:from-primary/90 hover:to-primary/70 focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isGenerating ? (
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
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                </svg>
                Generate Content
              </>
            )}
          </button>
        </div>
      </form>

      {/* Generated Content Display (shown after successful generation) */}
      {generationSuccess && generatedContent && (
        <div className="mt-8">
          <h2 className="mb-4 text-xl font-bold text-foreground">Generated Content</h2>
          <GeneratedContentDisplay
            content={generatedContent}
            onSaveToLesson={handleSaveToLesson}
          />
        </div>
      )}
    </div>
  );
}
