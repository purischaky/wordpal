'use client';

import { Suspense, useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import type { Achievement } from '@/types/admin';

// ─── Types ───────────────────────────────────────────────────────────────────

type TriggerCriteria = Achievement['triggerCriteria'];

interface AchievementFormData {
  title: string;
  description: string;
  badgeIcon: string;
  xpReward: string;
  triggerCriteria: TriggerCriteria | '';
  thresholdValue: string;
}

interface FormErrors {
  title?: string;
  description?: string;
  badgeIcon?: string;
  xpReward?: string;
  triggerCriteria?: string;
  thresholdValue?: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const TRIGGER_OPTIONS: { value: TriggerCriteria; label: string; description: string }[] = [
  { value: 'lessons_completed', label: 'Lessons Completed', description: 'Triggered when student completes N lessons' },
  { value: 'streak_days', label: 'Streak Days', description: 'Triggered when student maintains N-day streak' },
  { value: 'grammar_score', label: 'Grammar Score', description: 'Triggered when student reaches score threshold' },
  { value: 'challenge_passed', label: 'Challenge Passed', description: 'Triggered when student passes N challenges' },
  { value: 'exercises_completed', label: 'Exercises Completed', description: 'Triggered when student completes N exercises' },
];

const EMOJI_SUGGESTIONS = ['🎯', '🔥', '⭐', '🏆', '💪', '📝', '🎓', '🌟', '💎', '🚀', '🎖️', '👑'];

// ─── Validation ──────────────────────────────────────────────────────────────

export function validateAchievementForm(data: AchievementFormData): FormErrors {
  const errors: FormErrors = {};

  // Title: required, max 100 chars
  if (!data.title.trim()) {
    errors.title = 'Title is required.';
  } else if (data.title.length > 100) {
    errors.title = 'Title must be 100 characters or fewer.';
  }

  // Description: optional but max 300 chars
  if (data.description.length > 300) {
    errors.description = 'Description must be 300 characters or fewer.';
  }

  // Badge Icon: optional (emoji or text)
  if (data.badgeIcon && data.badgeIcon.length > 50) {
    errors.badgeIcon = 'Badge icon must be 50 characters or fewer.';
  }

  // XP Reward: required, positive integer, max 10000
  const xp = parseInt(data.xpReward, 10);
  if (!data.xpReward.trim()) {
    errors.xpReward = 'XP reward is required.';
  } else if (isNaN(xp) || !Number.isInteger(xp)) {
    errors.xpReward = 'Must be a whole number.';
  } else if (xp < 1) {
    errors.xpReward = 'Minimum XP reward is 1.';
  } else if (xp > 10000) {
    errors.xpReward = 'Maximum XP reward is 10,000.';
  }

  // Trigger Criteria: required
  if (!data.triggerCriteria) {
    errors.triggerCriteria = 'Trigger criteria is required.';
  }

  // Threshold Value: required, positive integer
  const threshold = parseInt(data.thresholdValue, 10);
  if (!data.thresholdValue.trim()) {
    errors.thresholdValue = 'Threshold value is required.';
  } else if (isNaN(threshold) || !Number.isInteger(threshold)) {
    errors.thresholdValue = 'Must be a whole number.';
  } else if (threshold < 1) {
    errors.thresholdValue = 'Threshold must be a positive integer.';
  }

  return errors;
}

// ─── Badge Preview Component ─────────────────────────────────────────────────

function BadgePreview({ icon, title, isLocked }: { icon: string; title: string; isLocked: boolean }) {
  return (
    <div className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-all duration-200 ${
      isLocked
        ? 'border-border bg-muted/50 opacity-60 grayscale'
        : 'border-amber-200 bg-gradient-to-b from-amber-50 to-yellow-50 dark:border-amber-800 dark:from-amber-900/20 dark:to-yellow-900/20'
    }`}>
      <div className={`flex h-14 w-14 items-center justify-center rounded-full text-3xl ${
        isLocked
          ? 'bg-muted'
          : 'bg-white shadow-md dark:bg-card'
      }`}>
        {icon || '🏅'}
      </div>
      <span className={`text-xs font-medium text-center ${
        isLocked ? 'text-muted-foreground' : 'text-foreground'
      }`}>
        {title || 'Achievement'}
      </span>
      <span className={`text-[10px] font-medium uppercase tracking-wide ${
        isLocked
          ? 'text-muted-foreground'
          : 'text-amber-600 dark:text-amber-400'
      }`}>
        {isLocked ? '🔒 Locked' : '🔓 Unlocked'}
      </span>
    </div>
  );
}

// ─── Create/Edit Achievement Page ────────────────────────────────────────────

function NewAchievementPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const isEditing = !!editId;

  // Fetch achievement data for editing from the API
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
  const [isFetchingEdit, setIsFetchingEdit] = useState(!!editId);

  useEffect(() => {
    if (!editId) return;
    async function fetchAchievement() {
      try {
        const res = await fetch('/api/admin/achievements');
        const json = await res.json();
        if (json.data) {
          const found = (json.data as Achievement[]).find((a) => a.id === editId) ?? null;
          setEditingAchievement(found);
        }
      } catch {
        // Silently fail — form will show empty state
      } finally {
        setIsFetchingEdit(false);
      }
    }
    fetchAchievement();
  }, [editId]);

  const initialFormData: AchievementFormData = useMemo(() => {
    if (editingAchievement) {
      return {
        title: editingAchievement.title,
        description: editingAchievement.description,
        badgeIcon: editingAchievement.badgeIcon,
        xpReward: String(editingAchievement.xpReward),
        triggerCriteria: editingAchievement.triggerCriteria,
        thresholdValue: String(editingAchievement.thresholdValue),
      };
    }
    return {
      title: '',
      description: '',
      badgeIcon: '',
      xpReward: '',
      triggerCriteria: '' as const,
      thresholdValue: '',
    };
  }, [editingAchievement]);

  const [formData, setFormData] = useState<AchievementFormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const existingUnlockCount = editingAchievement?.unlockCount ?? null;

  // Update a single field
  const updateField = useCallback(<K extends keyof AchievementFormData>(
    field: K,
    value: AchievementFormData[K]
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

  // Handle form submission
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const validationErrors = validateAchievementForm(formData);

      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      setIsSubmitting(true);

      try {
        const payload = {
          title: formData.title.trim(),
          description: formData.description.trim(),
          badgeIcon: formData.badgeIcon || '🏅',
          xpReward: parseInt(formData.xpReward, 10),
          triggerCriteria: formData.triggerCriteria,
          thresholdValue: parseInt(formData.thresholdValue, 10),
        };

        let res: Response;
        if (isEditing && editId) {
          res = await fetch(`/api/admin/achievements/${editId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
        } else {
          res = await fetch('/api/admin/achievements', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
        }

        const json = await res.json();
        if (json.error) {
          setErrors({ title: json.error });
          setIsSubmitting(false);
          return;
        }

        setIsSubmitting(false);
        setSubmitSuccess(true);

        // Redirect after short delay
        setTimeout(() => {
          router.push('/admin/achievements');
        }, 1500);
      } catch {
        setErrors({ title: 'An unexpected error occurred.' });
        setIsSubmitting(false);
      }
    },
    [formData, router, isEditing, editId]
  );

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Loading state for edit mode */}
      {isFetchingEdit && (
        <div className="flex items-center justify-center py-12">
          <div className="text-sm text-muted-foreground">Loading achievement...</div>
        </div>
      )}

      {!isFetchingEdit && (
      <>
      {/* Page Header */}
      <div>
        <nav className="mb-3 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link
            href="/admin/achievements"
            className="transition-colors hover:text-foreground"
          >
            Achievements
          </Link>
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
          <span className="text-foreground">{isEditing ? 'Edit' : 'Create New'}</span>
        </nav>
        <h1 className="text-2xl font-bold text-foreground">
          {isEditing ? 'Edit Achievement' : 'Create Achievement'}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isEditing
            ? 'Update this achievement. Unlock count will be preserved.'
            : 'Configure a new achievement badge to motivate students.'}
        </p>
      </div>

      {/* Editing notice with unlock count */}
      {isEditing && existingUnlockCount !== null && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              This achievement has been unlocked by <span className="font-semibold">{existingUnlockCount}</span> student{existingUnlockCount !== 1 ? 's' : ''}. The unlock count will be preserved.
            </p>
          </div>
        </div>
      )}

      {/* Success Message */}
      {submitSuccess && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-medium text-green-800 dark:text-green-200">
              Achievement {isEditing ? 'updated' : 'created'} successfully. Redirecting...
            </p>
          </div>
        </div>
      )}

      {/* Form + Badge Preview layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6" noValidate>
          <div className="rounded-xl border border-border bg-card p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.15)]">
            <div className="space-y-5">
              {/* Title */}
              <div>
                <label
                  htmlFor="ach-title"
                  className="block text-sm font-medium text-foreground"
                >
                  Title <span className="text-destructive">*</span>
                </label>
                <input
                  id="ach-title"
                  type="text"
                  maxLength={100}
                  value={formData.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="e.g., Grammar Master"
                  aria-describedby={errors.title ? 'ach-title-error' : undefined}
                  aria-invalid={!!errors.title}
                  className={`mt-1.5 block w-full rounded-[12px] border px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring ${
                    errors.title
                      ? 'border-destructive bg-destructive/5'
                      : 'border-input bg-background'
                  }`}
                />
                <div className="mt-1 flex items-center justify-between">
                  {errors.title && (
                    <p id="ach-title-error" className="text-xs text-destructive" role="alert">
                      {errors.title}
                    </p>
                  )}
                  <span className="ml-auto text-xs text-muted-foreground">
                    {formData.title.length}/100
                  </span>
                </div>
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="ach-description"
                  className="block text-sm font-medium text-foreground"
                >
                  Description
                </label>
                <textarea
                  id="ach-description"
                  maxLength={300}
                  rows={3}
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Describe what the student needs to achieve..."
                  aria-describedby={errors.description ? 'ach-description-error' : undefined}
                  aria-invalid={!!errors.description}
                  className={`mt-1.5 block w-full rounded-[12px] border px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground transition-colors duration-200 resize-none focus:outline-none focus:ring-2 focus:ring-ring ${
                    errors.description
                      ? 'border-destructive bg-destructive/5'
                      : 'border-input bg-background'
                  }`}
                />
                <div className="mt-1 flex items-center justify-between">
                  {errors.description && (
                    <p id="ach-description-error" className="text-xs text-destructive" role="alert">
                      {errors.description}
                    </p>
                  )}
                  <span className="ml-auto text-xs text-muted-foreground">
                    {formData.description.length}/300
                  </span>
                </div>
              </div>

              {/* Badge Icon */}
              <div>
                <label
                  htmlFor="ach-badge-icon"
                  className="block text-sm font-medium text-foreground"
                >
                  Badge Icon
                </label>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Enter an emoji or short text for the badge icon.
                </p>
                <input
                  id="ach-badge-icon"
                  type="text"
                  maxLength={50}
                  value={formData.badgeIcon}
                  onChange={(e) => updateField('badgeIcon', e.target.value)}
                  placeholder="🏆"
                  aria-describedby={errors.badgeIcon ? 'ach-badge-icon-error' : undefined}
                  aria-invalid={!!errors.badgeIcon}
                  className={`mt-1.5 block w-full rounded-[12px] border px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring ${
                    errors.badgeIcon
                      ? 'border-destructive bg-destructive/5'
                      : 'border-input bg-background'
                  }`}
                />
                {errors.badgeIcon && (
                  <p id="ach-badge-icon-error" className="mt-1 text-xs text-destructive" role="alert">
                    {errors.badgeIcon}
                  </p>
                )}
                {/* Emoji quick suggestions */}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {EMOJI_SUGGESTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => updateField('badgeIcon', emoji)}
                      className={`flex h-8 w-8 items-center justify-center rounded-lg border text-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring ${
                        formData.badgeIcon === emoji
                          ? 'border-primary bg-primary/10 dark:bg-primary/20'
                          : 'border-input bg-background hover:bg-accent dark:bg-card'
                      }`}
                      aria-label={`Select ${emoji} as badge icon`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* XP Reward + Trigger Criteria (side by side) */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {/* XP Reward */}
                <div>
                  <label
                    htmlFor="ach-xp-reward"
                    className="block text-sm font-medium text-foreground"
                  >
                    XP Reward <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="ach-xp-reward"
                    type="number"
                    min={1}
                    max={10000}
                    step={1}
                    value={formData.xpReward}
                    onChange={(e) => updateField('xpReward', e.target.value)}
                    placeholder="1–10,000"
                    aria-describedby={errors.xpReward ? 'ach-xp-error' : undefined}
                    aria-invalid={!!errors.xpReward}
                    className={`mt-1.5 block w-full rounded-[12px] border px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring ${
                      errors.xpReward
                        ? 'border-destructive bg-destructive/5'
                        : 'border-input bg-background'
                    }`}
                  />
                  {errors.xpReward && (
                    <p id="ach-xp-error" className="mt-1 text-xs text-destructive" role="alert">
                      {errors.xpReward}
                    </p>
                  )}
                </div>

                {/* Threshold Value */}
                <div>
                  <label
                    htmlFor="ach-threshold"
                    className="block text-sm font-medium text-foreground"
                  >
                    Threshold Value <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="ach-threshold"
                    type="number"
                    min={1}
                    step={1}
                    value={formData.thresholdValue}
                    onChange={(e) => updateField('thresholdValue', e.target.value)}
                    placeholder="Positive integer"
                    aria-describedby={errors.thresholdValue ? 'ach-threshold-error' : undefined}
                    aria-invalid={!!errors.thresholdValue}
                    className={`mt-1.5 block w-full rounded-[12px] border px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring ${
                      errors.thresholdValue
                        ? 'border-destructive bg-destructive/5'
                        : 'border-input bg-background'
                    }`}
                  />
                  {errors.thresholdValue && (
                    <p id="ach-threshold-error" className="mt-1 text-xs text-destructive" role="alert">
                      {errors.thresholdValue}
                    </p>
                  )}
                </div>
              </div>

              {/* Trigger Criteria */}
              <div>
                <fieldset>
                  <legend className="block text-sm font-medium text-foreground">
                    Trigger Criteria <span className="text-destructive">*</span>
                  </legend>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Choose what action triggers this achievement.
                  </p>
                  <div
                    className="mt-2 space-y-2"
                    role="radiogroup"
                    aria-describedby={errors.triggerCriteria ? 'ach-trigger-error' : undefined}
                  >
                    {TRIGGER_OPTIONS.map(({ value, label, description }) => {
                      const isSelected = formData.triggerCriteria === value;
                      return (
                        <button
                          key={value}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          onClick={() => updateField('triggerCriteria', value)}
                          className={`flex w-full items-center gap-3 rounded-[12px] border px-3.5 py-3 text-left text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring ${
                            isSelected
                              ? 'border-primary bg-primary/5 dark:bg-primary/10'
                              : 'border-input bg-background hover:bg-accent dark:bg-card'
                          }`}
                        >
                          <span
                            className={`flex h-4 w-4 items-center justify-center rounded-full border-2 transition-colors ${
                              isSelected
                                ? 'border-primary'
                                : 'border-muted-foreground/40'
                            }`}
                          >
                            {isSelected && (
                              <span className="h-2 w-2 rounded-full bg-primary" />
                            )}
                          </span>
                          <div className="flex-1">
                            <span className="font-medium text-foreground">{label}</span>
                            <p className="text-xs text-muted-foreground">{description}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {errors.triggerCriteria && (
                    <p id="ach-trigger-error" className="mt-1.5 text-xs text-destructive" role="alert">
                      {errors.triggerCriteria}
                    </p>
                  )}
                </fieldset>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3">
            <Link
              href="/admin/achievements"
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
                isEditing ? 'Update Achievement' : 'Create Achievement'
              )}
            </button>
          </div>
        </form>

        {/* Badge Preview Panel */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.15)]">
            <h3 className="text-sm font-semibold text-foreground mb-4">Badge Preview</h3>
            <div className="grid grid-cols-2 gap-3">
              <BadgePreview
                icon={formData.badgeIcon}
                title={formData.title}
                isLocked={false}
              />
              <BadgePreview
                icon={formData.badgeIcon}
                title={formData.title}
                isLocked={true}
              />
            </div>
            <p className="mt-3 text-xs text-muted-foreground text-center">
              How the badge appears to students
            </p>
          </div>

          {/* Achievement Summary */}
          {(formData.triggerCriteria || formData.thresholdValue || formData.xpReward) && (
            <div className="rounded-xl border border-border bg-card p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.15)]">
              <h3 className="text-sm font-semibold text-foreground mb-3">Summary</h3>
              <div className="space-y-2 text-xs text-muted-foreground">
                {formData.triggerCriteria && (
                  <p>
                    <span className="font-medium text-foreground">Trigger:</span>{' '}
                    {TRIGGER_OPTIONS.find((t) => t.value === formData.triggerCriteria)?.label}
                  </p>
                )}
                {formData.thresholdValue && (
                  <p>
                    <span className="font-medium text-foreground">Target:</span>{' '}
                    {formData.thresholdValue}
                  </p>
                )}
                {formData.xpReward && (
                  <p>
                    <span className="font-medium text-foreground">Reward:</span>{' '}
                    {parseInt(formData.xpReward, 10).toLocaleString()} XP
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      </>
      )}
    </div>
  );
}

export default function NewAchievementPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-3xl p-6 text-muted-foreground">Loading...</div>}>
      <NewAchievementPageContent />
    </Suspense>
  );
}
