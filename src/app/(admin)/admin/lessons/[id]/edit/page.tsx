'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import type { CEFRLevel, ExerciseType, LessonStatus } from '@/types/admin';
import { validateLessonForm, type LessonFormErrors } from '@/lib/validators/lesson';

// ─── Types ───────────────────────────────────────────────────────────────────

interface LessonFormData {
  title: string;
  description: string;
  grammarFocus: string;
  cefrLevel: CEFRLevel | '';
  difficulty: string;
  estimatedDuration: string;
  learningObjectives: string[];
}

interface ExerciseItem {
  id: string;
  type: ExerciseType;
  content: string;
  status: LessonStatus;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const CEFR_LEVELS: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const DIFFICULTY_OPTIONS = [1, 2, 3, 4, 5] as const;

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_EXERCISES: ExerciseItem[] = [
  {
    id: 'ex-1',
    type: 'drag-and-drop',
    content: 'Build a present perfect sentence using the correct form of have/has and the past participle of the verb given.',
    status: 'published',
  },
  {
    id: 'ex-2',
    type: 'multiple-choice',
    content: 'Choose the correct present perfect form: She ___ (visit) Paris three times.',
    status: 'published',
  },
  {
    id: 'ex-3',
    type: 'fill-in-blank',
    content: 'I ___ never ___ sushi before. (eat)',
    status: 'draft',
  },
  {
    id: 'ex-4',
    type: 'rewrite-sentence',
    content: 'Rewrite using present perfect: I started learning English five years ago and I still learn it.',
    status: 'incomplete',
  },
];

// ─── Preview Modal ───────────────────────────────────────────────────────────

function PreviewModal({
  formData,
  exercises,
  onClose,
}: {
  formData: LessonFormData;
  exercises: ExerciseItem[];
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-border bg-card p-6 shadow-lg">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label="Close preview"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {formData.cefrLevel || '—'}
            </span>
            <span className="text-xs text-muted-foreground">
              Difficulty {formData.difficulty || '—'}/5
            </span>
            <span className="text-xs text-muted-foreground">
              {formData.estimatedDuration ? `${formData.estimatedDuration} min` : '— min'}
            </span>
          </div>

          <h2 className="text-xl font-bold text-foreground">
            {formData.title || 'Untitled Lesson'}
          </h2>

          {formData.description && (
            <p className="text-sm text-muted-foreground">{formData.description}</p>
          )}

          {formData.grammarFocus && (
            <div className="rounded-lg bg-accent/50 p-3">
              <p className="text-xs font-medium text-muted-foreground">Grammar Focus</p>
              <p className="text-sm text-foreground">{formData.grammarFocus}</p>
            </div>
          )}

          {formData.learningObjectives.filter((o) => o.trim()).length > 0 && (
            <div>
              <p className="text-sm font-medium text-foreground">Learning Objectives</p>
              <ul className="mt-1 list-inside list-disc space-y-1 text-sm text-muted-foreground">
                {formData.learningObjectives
                  .filter((o) => o.trim())
                  .map((obj, i) => (
                    <li key={i}>{obj}</li>
                  ))}
              </ul>
            </div>
          )}

          {exercises.length > 0 && (
            <div>
              <p className="text-sm font-medium text-foreground">Exercises ({exercises.length})</p>
              <div className="mt-2 space-y-2">
                {exercises.map((ex) => (
                  <div key={ex.id} className="rounded-lg border border-border p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-primary">{ex.type}</span>
                      <span className="text-xs text-muted-foreground">{ex.status}</span>
                    </div>
                    <p className="mt-1 text-sm text-foreground">
                      {ex.content.length > 60 ? ex.content.slice(0, 60) + '…' : ex.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {exercises.length === 0 && (
            <p className="text-sm italic text-muted-foreground">No exercises assigned yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Exercises Section ───────────────────────────────────────────────────────

function ExercisesSection({ exercises }: { exercises: ExerciseItem[] }) {
  const truncate = (text: string, max: number) =>
    text.length > max ? text.slice(0, max) + '…' : text;

  const statusColor = (status: LessonStatus) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'incomplete':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    }
  };

  if (exercises.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-6 text-center">
        <p className="text-sm text-muted-foreground">
          No exercises assigned to this lesson yet.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Exercises can be added after saving the lesson.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead className="border-b border-border bg-accent/30">
          <tr>
            <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Type</th>
            <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Content</th>
            <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {exercises.map((ex) => (
            <tr key={ex.id} className="transition-colors hover:bg-accent/20">
              <td className="px-4 py-2.5 font-medium text-foreground capitalize">
                {ex.type.replace(/-/g, ' ')}
              </td>
              <td className="px-4 py-2.5 text-muted-foreground">
                {truncate(ex.content, 60)}
              </td>
              <td className="px-4 py-2.5">
                <span className={`inline-block rounded-md px-2 py-0.5 text-xs font-medium capitalize ${statusColor(ex.status)}`}>
                  {ex.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function EditLessonPage() {
  const router = useRouter();
  const params = useParams();
  const lessonId = params.id as string;

  const [formData, setFormData] = useState<LessonFormData>({
    title: '',
    description: '',
    grammarFocus: '',
    cefrLevel: '',
    difficulty: '',
    estimatedDuration: '',
    learningObjectives: [''],
  });

  const [errors, setErrors] = useState<LessonFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const exercises: ExerciseItem[] = MOCK_EXERCISES;

  // Load lesson data from API
  useEffect(() => {
    async function fetchLesson() {
      try {
        const res = await fetch('/api/admin/lessons');
        const json = await res.json();
        if (json.data) {
          const found = json.data.find((l: { id: string }) => l.id === lessonId);
          if (found) {
            setFormData({
              title: found.title || '',
              description: found.description || '',
              grammarFocus: found.grammarFocus || '',
              cefrLevel: found.cefrLevel || '',
              difficulty: found.difficulty ? String(found.difficulty) : '',
              estimatedDuration: found.estimatedDuration ? String(found.estimatedDuration) : '',
              learningObjectives: found.learningObjectives?.length ? found.learningObjectives : [''],
            });
          }
        }
      } catch (error) {
        console.error('Failed to fetch lesson:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchLesson();
  }, [lessonId]);

  // Update a single field
  const updateField = useCallback(<K extends keyof LessonFormData>(
    field: K,
    value: LessonFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (prev[field as keyof LessonFormErrors]) {
        const next = { ...prev };
        delete next[field as keyof LessonFormErrors];
        return next;
      }
      return prev;
    });
  }, []);

  // Learning objectives management
  const addObjective = useCallback(() => {
    setFormData((prev) => {
      if (prev.learningObjectives.length >= 10) return prev;
      return { ...prev, learningObjectives: [...prev.learningObjectives, ''] };
    });
  }, []);

  const removeObjective = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      learningObjectives: prev.learningObjectives.filter((_, i) => i !== index),
    }));
    setErrors((prev) => {
      const next = { ...prev };
      if (next.learningObjectiveItems) {
        delete next.learningObjectiveItems[index];
        if (Object.keys(next.learningObjectiveItems).length === 0) {
          delete next.learningObjectiveItems;
        }
      }
      return next;
    });
  }, []);

  const updateObjective = useCallback((index: number, value: string) => {
    setFormData((prev) => {
      const updated = [...prev.learningObjectives];
      updated[index] = value;
      return { ...prev, learningObjectives: updated };
    });
    setErrors((prev) => {
      if (prev.learningObjectiveItems?.[index]) {
        const next = { ...prev };
        const items = { ...next.learningObjectiveItems };
        delete items[index];
        next.learningObjectiveItems = Object.keys(items).length > 0 ? items : undefined;
        return next;
      }
      return prev;
    });
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const validationErrors = validateLessonForm({
        title: formData.title,
        description: formData.description,
        grammarFocus: formData.grammarFocus,
        cefrLevel: formData.cefrLevel,
        difficulty: formData.difficulty,
        estimatedDuration: formData.estimatedDuration,
        learningObjectives: formData.learningObjectives,
      });

      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      setIsSubmitting(true);

      try {
        const res = await fetch(`/api/admin/lessons/${lessonId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: formData.title,
            description: formData.description,
            grammarFocus: formData.grammarFocus,
            cefrLevel: formData.cefrLevel,
            difficulty: Number(formData.difficulty),
            estimatedDuration: Number(formData.estimatedDuration),
            learningObjectives: formData.learningObjectives.filter((o) => o.trim()),
          }),
        });

        if (!res.ok) {
          const json = await res.json();
          setErrors({ title: json.error || 'Failed to update lesson' });
          setIsSubmitting(false);
          return;
        }

        setIsSubmitting(false);
        setSubmitSuccess(true);
        setTimeout(() => {
          router.push('/admin/lessons');
        }, 1500);
      } catch (error) {
        setErrors({ title: 'Failed to update lesson. Please try again.' });
        setIsSubmitting(false);
      }
    },
    [formData, router, lessonId]
  );

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 animate-pulse">
        <div className="h-8 w-48 rounded bg-accent/50" />
        <div className="h-4 w-64 rounded bg-accent/50" />
        <div className="rounded-xl border border-border bg-card p-6 space-y-5">
          <div className="h-10 rounded-[12px] bg-accent/50" />
          <div className="h-24 rounded-[12px] bg-accent/50" />
          <div className="h-10 rounded-[12px] bg-accent/50" />
          <div className="grid grid-cols-2 gap-5">
            <div className="h-10 rounded-[12px] bg-accent/50" />
            <div className="h-10 rounded-[12px] bg-accent/50" />
          </div>
          <div className="h-10 rounded-[12px] bg-accent/50" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Page Header */}
      <div>
        <nav className="mb-3 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link href="/admin/lessons" className="transition-colors hover:text-foreground">
            Lessons
          </Link>
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
          <span className="text-foreground">Edit</span>
        </nav>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Edit Lesson</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Editing lesson ID: {lessonId}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className="inline-flex items-center gap-2 rounded-[12px] border border-input bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors duration-200 hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Preview
          </button>
        </div>
      </div>

      {/* Success Message */}
      {submitSuccess && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-medium text-green-800 dark:text-green-200">
              Lesson updated successfully. Redirecting...
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
              <label htmlFor="lesson-title" className="block text-sm font-medium text-foreground">
                Title <span className="text-destructive">*</span>
              </label>
              <input
                id="lesson-title"
                type="text"
                maxLength={150}
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="e.g., Present Perfect Tense"
                aria-describedby={errors.title ? 'lesson-title-error' : undefined}
                aria-invalid={!!errors.title}
                className={`mt-1.5 block w-full rounded-[12px] border px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring ${
                  errors.title ? 'border-destructive bg-destructive/5' : 'border-input bg-background'
                }`}
              />
              <div className="mt-1 flex items-center justify-between">
                {errors.title && (
                  <p id="lesson-title-error" className="text-xs text-destructive" role="alert">{errors.title}</p>
                )}
                <span className="ml-auto text-xs text-muted-foreground">{formData.title.length}/150</span>
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="lesson-description" className="block text-sm font-medium text-foreground">
                Description
              </label>
              <textarea
                id="lesson-description"
                maxLength={500}
                rows={3}
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Describe what students will learn in this lesson..."
                aria-describedby={errors.description ? 'lesson-description-error' : undefined}
                aria-invalid={!!errors.description}
                className={`mt-1.5 block w-full resize-none rounded-[12px] border px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring ${
                  errors.description ? 'border-destructive bg-destructive/5' : 'border-input bg-background'
                }`}
              />
              <div className="mt-1 flex items-center justify-between">
                {errors.description && (
                  <p id="lesson-description-error" className="text-xs text-destructive" role="alert">{errors.description}</p>
                )}
                <span className="ml-auto text-xs text-muted-foreground">{formData.description.length}/500</span>
              </div>
            </div>

            {/* Grammar Focus */}
            <div>
              <label htmlFor="lesson-grammar-focus" className="block text-sm font-medium text-foreground">
                Grammar Focus
              </label>
              <input
                id="lesson-grammar-focus"
                type="text"
                maxLength={100}
                value={formData.grammarFocus}
                onChange={(e) => updateField('grammarFocus', e.target.value)}
                placeholder="e.g., Past Simple vs Present Perfect"
                aria-describedby={errors.grammarFocus ? 'lesson-grammar-focus-error' : undefined}
                aria-invalid={!!errors.grammarFocus}
                className={`mt-1.5 block w-full rounded-[12px] border px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring ${
                  errors.grammarFocus ? 'border-destructive bg-destructive/5' : 'border-input bg-background'
                }`}
              />
              <div className="mt-1 flex items-center justify-between">
                {errors.grammarFocus && (
                  <p id="lesson-grammar-focus-error" className="text-xs text-destructive" role="alert">{errors.grammarFocus}</p>
                )}
                <span className="ml-auto text-xs text-muted-foreground">{formData.grammarFocus.length}/100</span>
              </div>
            </div>

            {/* CEFR Level + Difficulty (side by side) */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {/* CEFR Level */}
              <div>
                <label htmlFor="lesson-cefr" className="block text-sm font-medium text-foreground">
                  CEFR Level <span className="text-destructive">*</span>
                </label>
                <select
                  id="lesson-cefr"
                  value={formData.cefrLevel}
                  onChange={(e) => updateField('cefrLevel', e.target.value as CEFRLevel | '')}
                  aria-describedby={errors.cefrLevel ? 'lesson-cefr-error' : undefined}
                  aria-invalid={!!errors.cefrLevel}
                  className={`mt-1.5 block w-full rounded-[12px] border px-3.5 py-2.5 text-sm text-foreground transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring ${
                    errors.cefrLevel ? 'border-destructive bg-destructive/5' : 'border-input bg-background'
                  }`}
                >
                  <option value="">Select level...</option>
                  {CEFR_LEVELS.map((level) => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
                {errors.cefrLevel && (
                  <p id="lesson-cefr-error" className="mt-1 text-xs text-destructive" role="alert">{errors.cefrLevel}</p>
                )}
              </div>

              {/* Difficulty */}
              <div>
                <label htmlFor="lesson-difficulty" className="block text-sm font-medium text-foreground">
                  Difficulty <span className="text-destructive">*</span>
                </label>
                <select
                  id="lesson-difficulty"
                  value={formData.difficulty}
                  onChange={(e) => updateField('difficulty', e.target.value)}
                  aria-describedby={errors.difficulty ? 'lesson-difficulty-error' : undefined}
                  aria-invalid={!!errors.difficulty}
                  className={`mt-1.5 block w-full rounded-[12px] border px-3.5 py-2.5 text-sm text-foreground transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring ${
                    errors.difficulty ? 'border-destructive bg-destructive/5' : 'border-input bg-background'
                  }`}
                >
                  <option value="">Select difficulty...</option>
                  {DIFFICULTY_OPTIONS.map((d) => (
                    <option key={d} value={d}>{d} - {['Beginner', 'Elementary', 'Intermediate', 'Upper-Int.', 'Advanced'][d - 1]}</option>
                  ))}
                </select>
                {errors.difficulty && (
                  <p id="lesson-difficulty-error" className="mt-1 text-xs text-destructive" role="alert">{errors.difficulty}</p>
                )}
              </div>
            </div>

            {/* Estimated Duration */}
            <div>
              <label htmlFor="lesson-duration" className="block text-sm font-medium text-foreground">
                Estimated Duration (min) <span className="text-destructive">*</span>
              </label>
              <input
                id="lesson-duration"
                type="number"
                min={1}
                max={180}
                step={1}
                value={formData.estimatedDuration}
                onChange={(e) => updateField('estimatedDuration', e.target.value)}
                placeholder="e.g., 45"
                aria-describedby={errors.estimatedDuration ? 'lesson-duration-error' : undefined}
                aria-invalid={!!errors.estimatedDuration}
                className={`mt-1.5 block w-full rounded-[12px] border px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring ${
                  errors.estimatedDuration ? 'border-destructive bg-destructive/5' : 'border-input bg-background'
                }`}
              />
              {errors.estimatedDuration && (
                <p id="lesson-duration-error" className="mt-1 text-xs text-destructive" role="alert">{errors.estimatedDuration}</p>
              )}
            </div>
          </div>
        </div>

        {/* Learning Objectives Section */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.15)]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-medium text-foreground">Learning Objectives</h2>
              <p className="text-xs text-muted-foreground">Up to 10 objectives, each max 200 characters.</p>
            </div>
            <button
              type="button"
              onClick={addObjective}
              disabled={formData.learningObjectives.length >= 10}
              className="inline-flex items-center gap-1 rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add
            </button>
          </div>
          {errors.learningObjectives && (
            <p className="mt-2 text-xs text-destructive" role="alert">{errors.learningObjectives}</p>
          )}

          <div className="mt-3 space-y-2">
            {formData.learningObjectives.map((obj, index) => (
              <div key={index} className="flex items-start gap-2">
                <span className="mt-2.5 text-xs font-medium text-muted-foreground w-5 shrink-0">
                  {index + 1}.
                </span>
                <div className="flex-1">
                  <input
                    type="text"
                    maxLength={200}
                    value={obj}
                    onChange={(e) => updateObjective(index, e.target.value)}
                    placeholder={`Objective ${index + 1}`}
                    aria-label={`Learning objective ${index + 1}`}
                    aria-describedby={errors.learningObjectiveItems?.[index] ? `obj-${index}-error` : undefined}
                    aria-invalid={!!errors.learningObjectiveItems?.[index]}
                    className={`block w-full rounded-[12px] border px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring ${
                      errors.learningObjectiveItems?.[index]
                        ? 'border-destructive bg-destructive/5'
                        : 'border-input bg-background'
                    }`}
                  />
                  <div className="mt-0.5 flex items-center justify-between">
                    {errors.learningObjectiveItems?.[index] && (
                      <p id={`obj-${index}-error`} className="text-xs text-destructive" role="alert">
                        {errors.learningObjectiveItems[index]}
                      </p>
                    )}
                    <span className="ml-auto text-xs text-muted-foreground">{obj.length}/200</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeObjective(index)}
                  disabled={formData.learningObjectives.length <= 1}
                  className="mt-2 rounded-lg p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label={`Remove objective ${index + 1}`}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {formData.learningObjectives.length}/10 objectives
          </p>
        </div>

        {/* Exercises Section */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.15)]">
          <h2 className="text-sm font-medium text-foreground">Exercises</h2>
          <p className="mb-4 text-xs text-muted-foreground">
            Exercises assigned to this lesson.
          </p>
          <ExercisesSection exercises={exercises} />
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3">
          <Link
            href="/admin/lessons"
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
              'Save Changes'
            )}
          </button>
        </div>
      </form>

      {/* Preview Modal */}
      {showPreview && (
        <PreviewModal
          formData={formData}
          exercises={exercises}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}
