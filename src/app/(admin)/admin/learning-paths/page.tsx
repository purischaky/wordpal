'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import type { LearningPath } from '@/types/admin';

// ─── Helper Functions ────────────────────────────────────────────────────────

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return remaining > 0 ? `${hours}h ${remaining}m` : `${hours}h`;
}

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getCEFRColor(level: string): string {
  switch (level) {
    case 'A1': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
    case 'A2': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    case 'B1': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    case 'B2': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300';
    case 'C1': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
    case 'C2': return 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
  }
}

// ─── Learning Paths List Page ────────────────────────────────────────────────

export default function LearningPathsPage() {
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

  useEffect(() => {
    async function fetchLearningPaths() {
      try {
        const res = await fetch('/api/admin/learning-paths');
        const json = await res.json();
        if (json.data) {
          setLearningPaths(json.data);
        }
      } catch (error) {
        console.error('Failed to fetch learning paths:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchLearningPaths();
  }, []);

  const filteredPaths = useMemo(() => {
    if (statusFilter === 'all') return learningPaths;
    return learningPaths.filter((path) => path.status === statusFilter);
  }, [statusFilter, learningPaths]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Learning Paths</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Create and manage structured curricula for different proficiency levels.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-xl border border-border bg-card p-5">
              <div className="h-4 w-16 rounded bg-accent/50" />
              <div className="mt-3 h-5 w-3/4 rounded bg-accent/50" />
              <div className="mt-2 h-4 w-full rounded bg-accent/50" />
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="h-3 rounded bg-accent/50" />
                <div className="h-3 rounded bg-accent/50" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Learning Paths
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create and manage structured curricula for different proficiency levels.
          </p>
        </div>
        <Link
          href="/admin/learning-paths/new"
          className="inline-flex items-center gap-2 rounded-[12px] bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors duration-200 hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Create Learning Path
        </Link>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2">
        {(['all', 'published', 'draft'] as const).map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setStatusFilter(status)}
            className={`rounded-[12px] border px-3 py-1.5 text-xs font-medium capitalize transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring ${
              statusFilter === status
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-input bg-background text-foreground hover:bg-accent dark:bg-card'
            }`}
            aria-label={`Filter by ${status} status`}
          >
            {status === 'all' ? 'All' : status}
            <span className="ml-1.5 text-xs opacity-70">
              ({status === 'all'
                ? learningPaths.length
                : learningPaths.filter((p) => p.status === status).length})
            </span>
          </button>
        ))}
      </div>

      {/* Learning Paths Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredPaths.map((path) => (
          <div
            key={path.id}
            className="group rounded-xl border border-border bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-200 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_4px_16px_rgba(0,0,0,0.25)]"
          >
            <div className="p-5">
              {/* Top Row: CEFR Badge + Status */}
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${getCEFRColor(path.targetLevel)}`}>
                  {path.targetLevel}
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    path.status === 'published'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                  }`}
                >
                  {path.status === 'published' ? 'Published' : 'Draft'}
                </span>
              </div>

              {/* Title */}
              <h3 className="mt-3 text-base font-semibold text-foreground group-hover:text-primary transition-colors duration-200">
                {path.title}
              </h3>

              {/* Description */}
              <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">
                {path.description}
              </p>

              {/* Stats Grid */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                  </svg>
                  <span>{path.unitCount} units</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                  </svg>
                  <span>{path.lessonCount} lessons</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{formatDuration(path.estimatedDuration)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                  <span>{formatDate(path.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Card Footer with Actions */}
            <div className="flex items-center justify-between border-t border-border px-5 py-3">
              <span className="text-xs font-medium text-muted-foreground">
                {path.difficulty} · {path.xpReward} XP
              </span>
              <Link
                href={`/admin/learning-paths/${path.id}/edit`}
                className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium text-primary transition-colors duration-200 hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
                Edit
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredPaths.length === 0 && (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <svg className="h-6 w-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
          <p className="text-sm font-medium text-foreground">No learning paths found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            No learning paths match the current filter.
          </p>
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className="mt-4 rounded-[12px] border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors duration-200 hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring"
          >
            Show all paths
          </button>
        </div>
      )}
    </div>
  );
}
