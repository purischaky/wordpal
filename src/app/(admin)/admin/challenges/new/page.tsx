'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { CEFRLevel, ExerciseType } from '@/types/admin';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ChallengeFormData {
  title: string;
  targetLevel: CEFRLevel | '';
  grammarTopics: string[];
  difficulty: '' | '1' | '2' | '3' | '4' | '5';
  exerciseTypes: ExerciseType[];
  questionCount: string;
}

interface FormErrors {
  title?: string;
  targetLevel?: string;
  grammarTopics?: string;
  difficulty?: string;
  exerciseTypes?: string;
  questionCount?: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const CEFR_LEVELS: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const GRAMMAR_TOPICS = [
  'Present Tense',
  'Past Tense',
  'Future Tense',
  'Conditionals',
  'Passive Voice',
  'Reported Speech',
  'Modal Verbs',
  'Relative Clauses',
  'Articles',
  'Prepositions',
] as const;

const EXERCISE_TYPES: { value: ExerciseType; label: string }[] = [
  { value: 'drag-and-drop', label: 'Drag & Drop' },
  { value: 'multiple-choice', label: 'Multiple Choice' },
  { value: 'sentence-ordering', label: 'Sentence Ordering' },
  { value: 'fill-in-blank', label: 'Fill in the Blank' },
  { value: 'rewrite-sentence', label: 'Rewrite Sentence' },
  { value: 'free-writing', label: 'Free Writing' },
];

const DIFFICULTY_OPTIONS = [
  { value: '1', label: '1 - Very Easy' },
  { value: '2', label: '2 - Easy' },
  { value: '3', label: '3 - Moderate' },
  { value: '4', label: '4 - Hard' },
  { value: '5', label: '5 - Very Hard' },
];

// ─── Validation ──────────────────────────────────────────────────────────────

function validateChallengeForm(data: ChallengeFormData): FormErrors {
  const errors: FormErrors = {};

  // Title: required, max 150 chars
  if (!data.title.trim()) {
    errors.title = 'Title is required.';
  } else if (data.title.length > 150) {
    errors.title = 'Title must be 150 characters or fewer.';
  }

  // Target Level: required
  if (!data.targetLevel) {
    errors.targetLevel = 'Target CEFR level is required.';
  }

  // Grammar Topics: at least one
  if (data.grammarTopics.length === 0) {
    errors.grammarTopics = 'Select at least one grammar topic.';
  }

  // Difficulty: required
  if (!data.difficulty) {
    errors.difficulty = 'Difficulty is required.';
  }

  // Exercise Types: at least one
  if (data.exerciseTypes.length === 0) {
    errors.exerciseTypes = 'Select at least one exercise type.';
  }

  // Number of Questions: required, integer 5-50
  const qCount = parseInt(data.questionCount, 10);
  if (!data.questionCount.trim()) {
    errors.questionCount = 'Number of questions is required.';
  } else if (isNaN(qCount) || !Number.isInteger(qCount)) {
    errors.questionCount = 'Must be a whole number.';
  } else if (qCount < 5) {
    errors.questionCount = 'Minimum is 5 questions.';
  } else if (qCount > 50) {
    errors.questionCount = 'Maximum is 50 questions.';
  }

  return errors;
}

// ─── Create Placement Challenge Page ─────────────────────────────────────────

export default function NewChallengePage() {
  const router = useRouter();

  const [formData, setFormData] = useState<ChallengeFormData>({
    title: '',
    targetLevel: '',
    grammarTopics: [],
    difficulty: '',
    exerciseTypes: [],
    questionCount: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Update a single field
  const updateField = useCallback(<K extends keyof ChallengeFormData>(
    field: K,
    value: ChallengeFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field on change
    setErrors((prev) => {
      if (prev[field as keyof FormErrors]) {
        const next = { ...prev };
        delete next[field as keyof FormErrors];
        return next;
      }
      return prev;
    });
  }, []);

  // Toggle grammar topic selection
  const toggleGrammarTopic = useCallback((topic: string) => {
    setFormData((prev) => {
      const isSelected = prev.grammarTopics.includes(topic);
      const updated = isSelected
        ? prev.grammarTopics.filter((t) => t !== topic)
        : [...prev.grammarTopics, topic];
      return { ...prev, grammarTopics: updated };
    });
    setErrors((prev) => {
      if (prev.grammarTopics) {
        const next = { ...prev };
        delete next.grammarTopics;
        return next;
      }
      return prev;
    });
  }, []);

  // Toggle exercise type selection
  const toggleExerciseType = useCallback((type: ExerciseType) => {
    setFormData((prev) => {
      const isSelected = prev.exerciseTypes.includes(type);
      const updated = isSelected
        ? prev.exerciseTypes.filter((t) => t !== type)
        : [...prev.exerciseTypes, type];
      return { ...prev, exerciseTypes: updated };
    });
    setErrors((prev) => {
      if (prev.exerciseTypes) {
        const next = { ...prev };
        delete next.exerciseTypes;
        return next;
      }
      return prev;
    });
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      const validationErrors = validateChallengeForm(formData);

      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      setIsSubmitting(true);

      // Simulate save (mock async operation)
      setTimeout(() => {
        setIsSubmitting(false);
        setSubmitSuccess(true);

        // Redirect to list page after short delay
        setTimeout(() => {
          router.push('/admin/challenges');
        }, 1500);
      }, 800);
    },
    [formData, router]
  );

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Page Header */}
      <div>
        <nav className="mb-3 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link
            href="/admin/challenges"
            className="transition-colors hover:text-foreground"
          >
            Placement Challenges
          </Link>
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
          <span className="text-foreground">Create New</span>
        </nav>
        <h1 className="text-2xl font-bold text-foreground">
          Create Placement Challenge
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure an adaptive placement assessment to determine student CEFR level.
        </p>
      </div>

      {/* Success Message */}
      {submitSuccess && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-medium text-green-800 dark:text-green-200">
              Placement challenge created as draft. Redirecting...
            </p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div className="rounded-xl border border-border bg-card p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.15)]">
          <div className="space-y-5">
            {/* Title */}
            <div>
              <label
                htmlFor="ch-title"
                className="block text-sm font-medium text-foreground"
              >
                Title <span className="text-destructive">*</span>
              </label>
              <input
                id="ch-title"
                type="text"
                maxLength={150}
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="e.g., Intermediate Grammar Placement Test"
                aria-describedby={errors.title ? 'ch-title-error' : undefined}
                aria-invalid={!!errors.title}
                className={`mt-1.5 block w-full rounded-[12px] border px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring ${
                  errors.title
                    ? 'border-destructive bg-destructive/5'
                    : 'border-input bg-background'
                }`}
              />
              <div className="mt-1 flex items-center justify-between">
                {errors.title && (
                  <p id="ch-title-error" className="text-xs text-destructive" role="alert">
                    {errors.title}
                  </p>
                )}
                <span className="ml-auto text-xs text-muted-foreground">
                  {formData.title.length}/150
                </span>
              </div>
            </div>

            {/* Target Level */}
            <div>
              <label
                htmlFor="ch-target-level"
                className="block text-sm font-medium text-foreground"
              >
                Target CEFR Level <span className="text-destructive">*</span>
              </label>
              <select
                id="ch-target-level"
                value={formData.targetLevel}
                onChange={(e) => updateField('targetLevel', e.target.value as CEFRLevel | '')}
                aria-describedby={errors.targetLevel ? 'ch-target-level-error' : undefined}
                aria-invalid={!!errors.targetLevel}
                className={`mt-1.5 block w-full rounded-[12px] border px-3.5 py-2.5 text-sm text-foreground transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring ${
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
                <p id="ch-target-level-error" className="mt-1 text-xs text-destructive" role="alert">
                  {errors.targetLevel}
                </p>
              )}
            </div>

            {/* Grammar Topics (multi-select) */}
            <div>
              <fieldset>
                <legend className="block text-sm font-medium text-foreground">
                  Grammar Topics <span className="text-destructive">*</span>
                </legend>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Select the grammar topics this challenge will assess.
                </p>
                <div
                  className="mt-2 flex flex-wrap gap-2"
                  role="group"
                  aria-describedby={errors.grammarTopics ? 'ch-topics-error' : undefined}
                >
                  {GRAMMAR_TOPICS.map((topic) => {
                    const isSelected = formData.grammarTopics.includes(topic);
                    return (
                      <button
                        key={topic}
                        type="button"
                        onClick={() => toggleGrammarTopic(topic)}
                        aria-pressed={isSelected}
                        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring ${
                          isSelected
                            ? 'border-primary bg-primary/10 text-primary dark:bg-primary/20'
                            : 'border-input bg-background text-foreground hover:bg-accent dark:bg-card'
                        }`}
                      >
                        {isSelected && (
                          <svg className="mr-1 inline h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        )}
                        {topic}
                      </button>
                    );
                  })}
                </div>
                {errors.grammarTopics && (
                  <p id="ch-topics-error" className="mt-1.5 text-xs text-destructive" role="alert">
                    {errors.grammarTopics}
                  </p>
                )}
              </fieldset>
            </div>

            {/* Difficulty + Number of Questions (side by side) */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {/* Difficulty */}
              <div>
                <label
                  htmlFor="ch-difficulty"
                  className="block text-sm font-medium text-foreground"
                >
                  Difficulty <span className="text-destructive">*</span>
                </label>
                <select
                  id="ch-difficulty"
                  value={formData.difficulty}
                  onChange={(e) => updateField('difficulty', e.target.value as ChallengeFormData['difficulty'])}
                  aria-describedby={errors.difficulty ? 'ch-difficulty-error' : undefined}
                  aria-invalid={!!errors.difficulty}
                  className={`mt-1.5 block w-full rounded-[12px] border px-3.5 py-2.5 text-sm text-foreground transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring ${
                    errors.difficulty
                      ? 'border-destructive bg-destructive/5'
                      : 'border-input bg-background'
                  }`}
                >
                  <option value="">Select difficulty...</option>
                  {DIFFICULTY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {errors.difficulty && (
                  <p id="ch-difficulty-error" className="mt-1 text-xs text-destructive" role="alert">
                    {errors.difficulty}
                  </p>
                )}
              </div>

              {/* Number of Questions */}
              <div>
                <label
                  htmlFor="ch-question-count"
                  className="block text-sm font-medium text-foreground"
                >
                  Number of Questions <span className="text-destructive">*</span>
                </label>
                <input
                  id="ch-question-count"
                  type="number"
                  min={5}
                  max={50}
                  step={1}
                  value={formData.questionCount}
                  onChange={(e) => updateField('questionCount', e.target.value)}
                  placeholder="5–50"
                  aria-describedby={errors.questionCount ? 'ch-question-count-error' : undefined}
                  aria-invalid={!!errors.questionCount}
                  className={`mt-1.5 block w-full rounded-[12px] border px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring ${
                    errors.questionCount
                      ? 'border-destructive bg-destructive/5'
                      : 'border-input bg-background'
                  }`}
                />
                {errors.questionCount && (
                  <p id="ch-question-count-error" className="mt-1 text-xs text-destructive" role="alert">
                    {errors.questionCount}
                  </p>
                )}
              </div>
            </div>

            {/* Exercise Types (multi-select) */}
            <div>
              <fieldset>
                <legend className="block text-sm font-medium text-foreground">
                  Exercise Types <span className="text-destructive">*</span>
                </legend>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Choose which exercise formats to include in the challenge.
                </p>
                <div
                  className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2"
                  role="group"
                  aria-describedby={errors.exerciseTypes ? 'ch-exercise-types-error' : undefined}
                >
                  {EXERCISE_TYPES.map(({ value, label }) => {
                    const isSelected = formData.exerciseTypes.includes(value);
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => toggleExerciseType(value)}
                        aria-pressed={isSelected}
                        className={`flex items-center gap-2 rounded-[12px] border px-3.5 py-2.5 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring ${
                          isSelected
                            ? 'border-primary bg-primary/10 text-primary dark:bg-primary/20'
                            : 'border-input bg-background text-foreground hover:bg-accent dark:bg-card'
                        }`}
                      >
                        <span
                          className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${
                            isSelected
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-muted-foreground/40'
                          }`}
                        >
                          {isSelected && (
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          )}
                        </span>
                        {label}
                      </button>
                    );
                  })}
                </div>
                {errors.exerciseTypes && (
                  <p id="ch-exercise-types-error" className="mt-1.5 text-xs text-destructive" role="alert">
                    {errors.exerciseTypes}
                  </p>
                )}
              </fieldset>
            </div>
          </div>
        </div>

        {/* Generate with AI button placement (functional in task 12.2) */}
        <div className="rounded-xl border border-dashed border-border bg-muted/30 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-sm">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Generate with AI
                </p>
                <p className="text-xs text-muted-foreground">
                  Auto-generate questions based on your configuration
                </p>
              </div>
            </div>
            <button
              type="button"
              disabled
              className="inline-flex items-center gap-2 rounded-[12px] bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-opacity duration-200 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Generate with AI (available after saving)"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
              </svg>
              Generate
            </button>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3">
          <Link
            href="/admin/challenges"
            className="rounded-[12px] border border-input bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors duration-200 hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting || submitSuccess}
            className="inline-flex items-center gap-2 rounded-[12px] bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors duration-200 hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Saving...
              </>
            ) : (
              'Save as Draft'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
