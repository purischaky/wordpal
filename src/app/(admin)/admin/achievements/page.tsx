'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import type { Achievement } from '@/types/admin';

// ─── Helper Functions ────────────────────────────────────────────────────────

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getTriggerLabel(trigger: Achievement['triggerCriteria']): string {
  switch (trigger) {
    case 'lessons_completed': return 'Lessons Completed';
    case 'streak_days': return 'Streak Days';
    case 'grammar_score': return 'Grammar Score';
    case 'challenge_passed': return 'Challenge Passed';
    case 'exercises_completed': return 'Exercises Completed';
    default: return trigger;
  }
}

function getTriggerColor(trigger: Achievement['triggerCriteria']): string {
  switch (trigger) {
    case 'lessons_completed': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
    case 'streak_days': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
    case 'grammar_score': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
    case 'challenge_passed': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
    case 'exercises_completed': return 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300';
    default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
  }
}

// ─── Achievements List Page ──────────────────────────────────────────────────

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [triggerFilter, setTriggerFilter] = useState<'all' | Achievement['triggerCriteria']>('all');
  const [deleteTarget, setDeleteTarget] = useState<Achievement | null>(null);

  useEffect(() => {
    async function fetchAchievements() {
      try {
        const res = await fetch('/api/admin/achievements');
        const json = await res.json();
        if (json.error) {
          setError(json.error);
          return;
        }
        setAchievements(json.data as Achievement[]);
      } catch {
        setError('Failed to load achievements');
      } finally {
        setIsLoading(false);
      }
    }
    fetchAchievements();
  }, []);

  const filteredAchievements = useMemo(() => {
    if (triggerFilter === 'all') return achievements;
    return achievements.filter((a) => a.triggerCriteria === triggerFilter);
  }, [triggerFilter, achievements]);

  function handleDelete(achievement: Achievement) {
    setDeleteTarget(achievement);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/admin/achievements/${deleteTarget.id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.error) {
        setError(json.error);
      } else {
        setAchievements((prev) => prev.filter((a) => a.id !== deleteTarget.id));
      }
    } catch {
      setError('Failed to delete achievement');
    }
    setDeleteTarget(null);
  }

  function cancelDelete() {
    setDeleteTarget(null);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-sm text-muted-foreground">Loading achievements...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/50 bg-destructive/5 p-6 text-center">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Achievements
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage badges and rewards to motivate students through gamification.
          </p>
        </div>
        <Link
          href="/admin/achievements/new"
          className="inline-flex items-center gap-2 rounded-[12px] bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors duration-200 hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Create Achievement
        </Link>
      </div>

      {/* Trigger Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {(['all', 'lessons_completed', 'streak_days', 'grammar_score', 'challenge_passed', 'exercises_completed'] as const).map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setTriggerFilter(filter)}
            className={`rounded-[12px] border px-3 py-1.5 text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring ${
              triggerFilter === filter
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-input bg-background text-foreground hover:bg-accent dark:bg-card'
            }`}
            aria-label={`Filter by ${filter === 'all' ? 'all triggers' : getTriggerLabel(filter)}`}
          >
            {filter === 'all' ? 'All' : getTriggerLabel(filter)}
            <span className="ml-1.5 text-xs opacity-70">
              ({filter === 'all'
                ? achievements.length
                : achievements.filter((a) => a.triggerCriteria === filter).length})
            </span>
          </button>
        ))}
      </div>

      {/* Achievements Card Grid */}
      {filteredAchievements.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAchievements.map((achievement) => (
            <div
              key={achievement.id}
              className="group relative rounded-xl border border-border bg-card p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-200 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_4px_16px_rgba(0,0,0,0.25)]"
            >
              {/* Badge Icon & Title */}
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-2xl" aria-hidden="true">
                  {achievement.badgeIcon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground truncate">
                    {achievement.title}
                  </h3>
                  <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                    {achievement.description}
                  </p>
                </div>
              </div>

              {/* Metadata */}
              <div className="mt-4 space-y-2">
                {/* Trigger Criteria */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Trigger</span>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getTriggerColor(achievement.triggerCriteria)}`}>
                    {getTriggerLabel(achievement.triggerCriteria)}
                  </span>
                </div>

                {/* Threshold */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Threshold</span>
                  <span className="text-xs font-medium text-foreground">
                    {achievement.thresholdValue}
                  </span>
                </div>

                {/* XP Reward */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">XP Reward</span>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                    <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" />
                    </svg>
                    {achievement.xpReward.toLocaleString()} XP
                  </span>
                </div>

                {/* Unlock Count */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Unlocked by</span>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-foreground">
                    <svg className="h-3.5 w-3.5 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-1.997m0 0A8.962 8.962 0 0112 13a8.962 8.962 0 01-2.212-.279M15 19.128" />
                    </svg>
                    {achievement.unlockCount} students
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                <span className="text-xs text-muted-foreground">
                  {formatDate(achievement.createdAt)}
                </span>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/achievements/new?edit=${achievement.id}`}
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-primary transition-colors duration-200 hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-ring"
                    aria-label={`Edit ${achievement.title}`}
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(achievement)}
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-destructive transition-colors duration-200 hover:bg-destructive/10 focus:outline-none focus:ring-2 focus:ring-destructive"
                    aria-label={`Delete ${achievement.title}`}
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <svg className="h-6 w-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.996.178-1.768-.767-1.768-1.768 0-1.006.776-1.822 1.768-1.768m0 3.536V2.7m0 0h13.5m-13.5 0C4.012.934 3.006-.006 4.012.004M18.75 4.236c.996.178 1.768-.767 1.768-1.768 0-1.006-.776-1.822-1.768-1.768m0 3.536V2.7" />
            </svg>
          </div>
          <p className="text-sm font-medium text-foreground">No achievements found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            No achievements match the current filter.
          </p>
          <button
            type="button"
            onClick={() => setTriggerFilter('all')}
            className="mt-4 rounded-[12px] border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors duration-200 hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring"
          >
            Show all achievements
          </button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="delete-dialog-title">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                <svg className="h-5 w-5 text-destructive" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 id="delete-dialog-title" className="text-base font-semibold text-foreground">
                  Delete Achievement
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Are you sure you want to delete <span className="font-medium text-foreground">&quot;{deleteTarget.title}&quot;</span>?
                </p>
                <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 p-3 dark:bg-amber-900/20 dark:border-amber-800">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    <span className="font-semibold">{deleteTarget.unlockCount}</span> student{deleteTarget.unlockCount !== 1 ? 's have' : ' has'} already unlocked this achievement. Their awarded XP will be preserved.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={cancelDelete}
                className="rounded-[12px] border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors duration-200 hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="rounded-[12px] bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition-colors duration-200 hover:bg-destructive/90 focus:outline-none focus:ring-2 focus:ring-destructive"
              >
                Delete Achievement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
