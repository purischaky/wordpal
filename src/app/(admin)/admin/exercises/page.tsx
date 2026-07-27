'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import type { ExerciseType } from '@/types/admin';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ExerciseEntry {
  id: string;
  type: ExerciseType;
  blocks: unknown[];
}

// ─── Helper Functions ────────────────────────────────────────────────────────

function getTypeLabel(type: ExerciseType): string {
  switch (type) {
    case 'drag-and-drop': return 'Drag & Drop';
    case 'multiple-choice': return 'Multiple Choice';
    case 'fill-in-blank': return 'Fill in the Blank';
    case 'sentence-ordering': return 'Sentence Ordering';
    case 'rewrite-sentence': return 'Rewrite Sentence';
    case 'free-writing': return 'Free Writing';
    default: return type;
  }
}

function getTypeColor(type: ExerciseType): string {
  switch (type) {
    case 'drag-and-drop': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
    case 'multiple-choice': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
    case 'fill-in-blank': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
    case 'sentence-ordering': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
    case 'rewrite-sentence': return 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300';
    case 'free-writing': return 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300';
    default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
  }
}

// ─── Exercises List Page ─────────────────────────────────────────────────────

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<ExerciseEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<'all' | ExerciseType>('all');
  const [deleteTarget, setDeleteTarget] = useState<ExerciseEntry | null>(null);

  useEffect(() => {
    async function fetchExercises() {
      try {
        const res = await fetch('/api/admin/exercises');
        const json = await res.json();
        if (json.error) {
          setError(json.error);
          return;
        }
        // exercises.json is a Record<string, ExerciseData>, convert to array
        const data = json.data as Record<string, { type: ExerciseType; blocks: unknown[] }>;
        const entries: ExerciseEntry[] = Object.entries(data).map(([id, value]) => ({
          id,
          type: value.type,
          blocks: value.blocks,
        }));
        setExercises(entries);
      } catch {
        setError('Failed to load exercises');
      } finally {
        setIsLoading(false);
      }
    }
    fetchExercises();
  }, []);

  const filteredExercises = useMemo(() => {
    if (typeFilter === 'all') return exercises;
    return exercises.filter((e) => e.type === typeFilter);
  }, [typeFilter, exercises]);

  async function handleDelete(exercise: ExerciseEntry) {
    setDeleteTarget(exercise);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/admin/exercises/${deleteTarget.id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.error) {
        setError(json.error);
      } else {
        setExercises((prev) => prev.filter((e) => e.id !== deleteTarget.id));
      }
    } catch {
      setError('Failed to delete exercise');
    }
    setDeleteTarget(null);
  }

  function cancelDelete() {
    setDeleteTarget(null);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-sm text-muted-foreground">Loading exercises...</div>
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
          <h1 className="text-2xl font-bold text-foreground">Exercises</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage grammar exercises with type, status, and content preview.
          </p>
        </div>
        <Link
          href="/admin/exercises/new"
          className="inline-flex items-center gap-2 rounded-[12px] bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors duration-200 hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Create Exercise
        </Link>
      </div>

      {/* Type Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {(['all', 'drag-and-drop', 'multiple-choice', 'fill-in-blank', 'sentence-ordering', 'rewrite-sentence', 'free-writing'] as const).map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setTypeFilter(filter)}
            className={`rounded-[12px] border px-3 py-1.5 text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring ${
              typeFilter === filter
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-input bg-background text-foreground hover:bg-accent dark:bg-card'
            }`}
            aria-label={`Filter by ${filter === 'all' ? 'all types' : getTypeLabel(filter)}`}
          >
            {filter === 'all' ? 'All' : getTypeLabel(filter)}
            <span className="ml-1.5 text-xs opacity-70">
              ({filter === 'all'
                ? exercises.length
                : exercises.filter((e) => e.type === filter).length})
            </span>
          </button>
        ))}
      </div>

      {/* Exercises Table */}
      {filteredExercises.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.15)]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">ID</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground">Blocks</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredExercises.map((exercise) => (
                  <tr key={exercise.id} className="transition-colors duration-150 hover:bg-muted/30">
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-xs text-foreground">{exercise.id}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getTypeColor(exercise.type)}`}>
                        {getTypeLabel(exercise.type)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className="text-sm font-medium text-foreground">
                        {Array.isArray(exercise.blocks) ? exercise.blocks.length : 0}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/exercises/${exercise.id}/edit`}
                          className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium text-primary transition-colors duration-200 hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-ring"
                          aria-label={`Edit exercise ${exercise.id}`}
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(exercise)}
                          className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium text-destructive transition-colors duration-200 hover:bg-destructive/10 focus:outline-none focus:ring-2 focus:ring-destructive"
                          aria-label={`Delete exercise ${exercise.id}`}
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <svg className="h-6 w-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-foreground">No exercises found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {typeFilter === 'all' ? 'Create your first exercise to get started.' : 'No exercises match the current filter.'}
          </p>
          {typeFilter !== 'all' && (
            <button
              type="button"
              onClick={() => setTypeFilter('all')}
              className="mt-4 rounded-[12px] border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors duration-200 hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring"
            >
              Show all exercises
            </button>
          )}
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
                  Delete Exercise
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Are you sure you want to delete exercise <span className="font-mono font-medium text-foreground">{deleteTarget.id}</span>? This action cannot be undone.
                </p>
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
                Delete Exercise
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
