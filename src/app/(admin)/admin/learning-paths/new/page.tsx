'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { CEFRLevel } from '@/types/admin';
import { validateLearningPathForm, type LearningPathFormErrors } from '@/lib/validators/learning-path';

// ─── Types ───────────────────────────────────────────────────────────────────

interface LearningPathFormData {
  title: string;
  description: string;
  targetLevel: CEFRLevel | '';
  estimatedDuration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | '';
  xpReward: string;
}

type FormErrors = LearningPathFormErrors;

// ─── Constants ───────────────────────────────────────────────────────────────

const CEFR_LEVELS: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const DIFFICULTY_OPTIONS = ['Beginner', 'Intermediate', 'Advanced'] as const;

// ─── Create Learning Path Page ───────────────────────────────────────────────

export default function NewLearningPathPage() {
  const router = useRouter();

  const [formData, setFormData] = useState<LearningPathFormData>({
    title: '',
    description: '',
    targetLevel: '',
    estimatedDuration: '',
    difficulty: '',
    xpReward: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Update a single field
  const updateField = useCallback(<K extends keyof LearningPathFormData>(
    field: K,
    value: LearningPathFormData[K]
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
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const validationErrors = validateLearningPathForm(formData);

      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      setIsSubmitting(true);

      try {
        const res = await fetch('/api/admin/learning-paths', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: formData.title,
            description: formData.description,
            targetLevel: formData.targetLevel,
            estimatedDuration: Number(formData.estimatedDuration),
            difficulty: formData.difficulty,
            xpReward: Number(formData.xpReward),
            status: 'draft',
          }),
        });

        if (!res.ok) {
          const json = await res.json();
          setErrors({ title: json.error || 'Failed to save learning path' });
          setIsSubmitting(false);
          return;
        }

        setIsSubmitting(false);
        setSubmitSuccess(true);

        setTimeout(() => {
          router.push('/admin/learning-paths');
        }, 1500);
      } catch (error) {
        setErrors({ title: 'Failed to save learning path. Please try again.' });
        setIsSubmitting(false);
      }
    },
    [formData, router]
  );

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Page Header */}
      <div>
        <nav className="mb-3 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link
            href="/admin/learning-paths"
            className="transition-colors hover:text-foreground"
          >
            Learning Paths
          </Link>
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
          <span className="text-foreground">Create New</span>
        </nav>
        <h1 className="text-2xl font-bold text-foreground">
          Create Learning Path
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Define a structured curriculum targeting a specific CEFR proficiency level.
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
              Learning path saved as draft. Redirecting...
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
                htmlFor="lp-title"
                className="block text-sm font-medium text-foreground"
              >
                Title <span className="text-destructive">*</span>
              </label>
              <input
                id="lp-title"
                type="text"
                maxLength={150}
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="e.g., Intermediate Grammar Mastery"
                aria-describedby={errors.title ? 'lp-title-error' : undefined}
                aria-invalid={!!errors.title}
                className={`mt-1.5 block w-full rounded-[12px] border px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring ${
                  errors.title
                    ? 'border-destructive bg-destructive/5'
                    : 'border-input bg-background'
                }`}
              />
              <div className="mt-1 flex items-center justify-between">
                {errors.title && (
                  <p id="lp-title-error" className="text-xs text-destructive" role="alert">
                    {errors.title}
                  </p>
                )}
                <span className="ml-auto text-xs text-muted-foreground">
                  {formData.title.length}/150
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="lp-description"
                className="block text-sm font-medium text-foreground"
              >
                Description
              </label>
              <textarea
                id="lp-description"
                maxLength={500}
                rows={3}
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Describe the learning objectives and target audience..."
                aria-describedby={errors.description ? 'lp-description-error' : undefined}
                aria-invalid={!!errors.description}
                className={`mt-1.5 block w-full resize-none rounded-[12px] border px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring ${
                  errors.description
                    ? 'border-destructive bg-destructive/5'
                    : 'border-input bg-background'
                }`}
              />
              <div className="mt-1 flex items-center justify-between">
                {errors.description && (
                  <p id="lp-description-error" className="text-xs text-destructive" role="alert">
                    {errors.description}
                  </p>
                )}
                <span className="ml-auto text-xs text-muted-foreground">
                  {formData.description.length}/500
                </span>
              </div>
            </div>

            {/* Target CEFR Level */}
            <div>
              <label
                htmlFor="lp-target-level"
                className="block text-sm font-medium text-foreground"
              >
                Target CEFR Level <span className="text-destructive">*</span>
              </label>
              <select
                id="lp-target-level"
                value={formData.targetLevel}
                onChange={(e) => updateField('targetLevel', e.target.value as CEFRLevel | '')}
                aria-describedby={errors.targetLevel ? 'lp-target-level-error' : undefined}
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
                <p id="lp-target-level-error" className="mt-1 text-xs text-destructive" role="alert">
                  {errors.targetLevel}
                </p>
              )}
            </div>

            {/* Estimated Duration + XP Reward (side by side) */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {/* Estimated Duration */}
              <div>
                <label
                  htmlFor="lp-duration"
                  className="block text-sm font-medium text-foreground"
                >
                  Estimated Duration (min) <span className="text-destructive">*</span>
                </label>
                <input
                  id="lp-duration"
                  type="number"
                  min={1}
                  max={9999}
                  step={1}
                  value={formData.estimatedDuration}
                  onChange={(e) => updateField('estimatedDuration', e.target.value)}
                  placeholder="e.g., 1200"
                  aria-describedby={errors.estimatedDuration ? 'lp-duration-error' : undefined}
                  aria-invalid={!!errors.estimatedDuration}
                  className={`mt-1.5 block w-full rounded-[12px] border px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring ${
                    errors.estimatedDuration
                      ? 'border-destructive bg-destructive/5'
                      : 'border-input bg-background'
                  }`}
                />
                {errors.estimatedDuration && (
                  <p id="lp-duration-error" className="mt-1 text-xs text-destructive" role="alert">
                    {errors.estimatedDuration}
                  </p>
                )}
              </div>

              {/* XP Reward */}
              <div>
                <label
                  htmlFor="lp-xp-reward"
                  className="block text-sm font-medium text-foreground"
                >
                  XP Reward <span className="text-destructive">*</span>
                </label>
                <input
                  id="lp-xp-reward"
                  type="number"
                  min={1}
                  max={10000}
                  step={1}
                  value={formData.xpReward}
                  onChange={(e) => updateField('xpReward', e.target.value)}
                  placeholder="e.g., 1500"
                  aria-describedby={errors.xpReward ? 'lp-xp-reward-error' : undefined}
                  aria-invalid={!!errors.xpReward}
                  className={`mt-1.5 block w-full rounded-[12px] border px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring ${
                    errors.xpReward
                      ? 'border-destructive bg-destructive/5'
                      : 'border-input bg-background'
                  }`}
                />
                {errors.xpReward && (
                  <p id="lp-xp-reward-error" className="mt-1 text-xs text-destructive" role="alert">
                    {errors.xpReward}
                  </p>
                )}
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <label
                htmlFor="lp-difficulty"
                className="block text-sm font-medium text-foreground"
              >
                Difficulty <span className="text-destructive">*</span>
              </label>
              <select
                id="lp-difficulty"
                value={formData.difficulty}
                onChange={(e) => updateField('difficulty', e.target.value as typeof formData.difficulty)}
                aria-describedby={errors.difficulty ? 'lp-difficulty-error' : undefined}
                aria-invalid={!!errors.difficulty}
                className={`mt-1.5 block w-full rounded-[12px] border px-3.5 py-2.5 text-sm text-foreground transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring ${
                  errors.difficulty
                    ? 'border-destructive bg-destructive/5'
                    : 'border-input bg-background'
                }`}
              >
                <option value="">Select difficulty...</option>
                {DIFFICULTY_OPTIONS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              {errors.difficulty && (
                <p id="lp-difficulty-error" className="mt-1 text-xs text-destructive" role="alert">
                  {errors.difficulty}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3">
          <Link
            href="/admin/learning-paths"
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
