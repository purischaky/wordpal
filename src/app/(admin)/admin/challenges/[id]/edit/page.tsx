'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import type { AdminPlacementChallenge, AdminExercise, DragDropContent, MultipleChoiceContent, SentenceOrderingContent, FillInBlankContent, RewriteSentenceContent, FreeWritingContent } from '@/types/admin';
import ExercisePreview from '@/components/admin/exercise-builder/ExercisePreview';

// ─── Helper Functions ────────────────────────────────────────────────────────

function getTypeLabel(type: string): string {
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

function getTypeColor(type: string): string {
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

/** Extracts a short human-readable preview of a question's type-specific content. */
function getQuestionPreview(ex: AdminExercise): string {
  switch (ex.type) {
    case 'drag-and-drop':
      return (ex.content as DragDropContent).targetSentence || '(no target sentence)';
    case 'multiple-choice':
      return (ex.content as MultipleChoiceContent).question;
    case 'sentence-ordering':
      return (ex.content as SentenceOrderingContent).fragments.join(' / ');
    case 'fill-in-blank':
      return (ex.content as FillInBlankContent).sentence;
    case 'rewrite-sentence':
      return (ex.content as RewriteSentenceContent).originalSentence;
    case 'free-writing':
      return (ex.content as FreeWritingContent).prompt;
    default:
      return '';
  }
}

// ─── Main Edit Page Component ────────────────────────────────────────────────

export default function EditChallengePage() {
  const params = useParams();
  const id = params.id as string;

  const [challenge, setChallenge] = useState<AdminPlacementChallenge | null>(null);
  const [questions, setQuestions] = useState<AdminExercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [publishErrors, setPublishErrors] = useState<string[]>([]);
  const [publishing, setPublishing] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [previewExercise, setPreviewExercise] = useState<AdminExercise | null>(null);

  const fetchQuestions = useCallback(async () => {
    const res = await fetch(`/api/admin/exercises?challengeId=${id}`);
    const json = await res.json();
    if (json.data) setQuestions(json.data);
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [challengeRes] = await Promise.all([
          fetch(`/api/admin/challenges/${id}`),
          fetchQuestions(),
        ]);
        const challengeJson = await challengeRes.json();
        if (cancelled) return;
        if (challengeJson.error) {
          setLoadError(challengeJson.error);
        } else {
          setChallenge(challengeJson.data);
        }
      } catch {
        if (!cancelled) setLoadError('Failed to load challenge');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [id, fetchQuestions]);

  const handleDeleteQuestion = useCallback(async (questionId: string) => {
    if (!window.confirm('Delete this question? This cannot be undone.')) return;
    const res = await fetch(`/api/admin/exercises/${questionId}`, { method: 'DELETE' });
    if (res.ok) {
      setQuestions((prev) => prev.filter((q) => q.id !== questionId));
    }
  }, []);

  const handlePublish = useCallback(async () => {
    setPublishing(true);
    setPublishErrors([]);
    try {
      const res = await fetch(`/api/admin/challenges/${id}/publish`, { method: 'PATCH' });
      const json = await res.json();
      if (!res.ok) {
        setPublishErrors(json.details ?? [json.error ?? 'Failed to publish challenge']);
        setNotification({ type: 'error', message: json.error || 'Cannot publish: validation failed.' });
        return;
      }
      setChallenge(json.data);
      setNotification({ type: 'success', message: 'Challenge published.' });
    } catch {
      setNotification({ type: 'error', message: 'Failed to publish challenge. Please try again.' });
    } finally {
      setPublishing(false);
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
      </div>
    );
  }

  if (loadError || !challenge) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Placement Challenge</h1>
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
          <p className="text-sm text-destructive">{loadError || 'Challenge not found'}</p>
        </div>
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
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{challenge.title}</h1>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  challenge.status === 'published'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                }`}
              >
                {challenge.status === 'published' ? 'Published' : 'Draft'}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {challenge.targetLevel} · Difficulty {challenge.difficulty} · {questions.length} question{questions.length !== 1 ? 's' : ''} added
            </p>
          </div>
          {challenge.status !== 'published' && (
            <button
              type="button"
              onClick={handlePublish}
              disabled={publishing}
              className="inline-flex items-center gap-2 rounded-[12px] bg-green-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors duration-200 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {publishing ? 'Publishing...' : 'Publish'}
            </button>
          )}
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div
          role="alert"
          className={`flex items-center justify-between rounded-lg border p-4 ${
            notification.type === 'success'
              ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
              : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
          }`}
        >
          <p className={`text-sm font-medium ${notification.type === 'success' ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}`}>
            {notification.message}
          </p>
          <button onClick={() => setNotification(null)} className="text-sm underline opacity-70 hover:opacity-100" aria-label="Dismiss">
            Dismiss
          </button>
        </div>
      )}

      {/* Publish validation errors */}
      {publishErrors.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          {publishErrors.map((err, i) => (
            <p key={i} className="text-sm text-red-700 dark:text-red-300">• {err}</p>
          ))}
        </div>
      )}

      {/* Grammar Topics */}
      {challenge.grammarTopics.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {challenge.grammarTopics.map((topic) => (
            <span key={topic} className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              {topic}
            </span>
          ))}
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            Questions ({questions.length})
          </h2>
          <Link
            href={`/admin/exercises/new?challengeId=${id}`}
            className="inline-flex items-center gap-1.5 rounded-[12px] border border-input bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors duration-200 hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Question
          </Link>
        </div>

        {questions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/20 p-12 text-center">
            <p className="text-sm font-medium text-foreground">No questions yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Click &quot;Add Question&quot; to create the first one.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-accent/30">
                <tr>
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Type</th>
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Content</th>
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {questions.map((q, idx) => {
                  const preview = getQuestionPreview(q);
                  return (
                    <tr key={q.id} className="transition-colors hover:bg-accent/20">
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
                            {idx + 1}
                          </span>
                          <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${getTypeColor(q.type)}`}>
                            {getTypeLabel(q.type)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">
                        {preview.length > 60 ? preview.slice(0, 60) + '…' : preview}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="inline-block rounded-md bg-muted px-2 py-0.5 text-xs font-medium capitalize text-muted-foreground">
                          {q.status}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => setPreviewExercise(q)}
                            className="text-xs font-medium text-muted-foreground hover:underline"
                          >
                            Preview
                          </button>
                          <Link
                            href={`/admin/exercises/${q.id}/edit?challengeId=${id}`}
                            className="text-xs font-medium text-primary hover:underline"
                          >
                            Edit
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDeleteQuestion(q.id)}
                            className="text-xs font-medium text-destructive hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {previewExercise && (
        <ExercisePreview
          type={previewExercise.type}
          content={previewExercise.content}
          open={!!previewExercise}
          onClose={() => setPreviewExercise(null)}
        />
      )}
    </div>
  );
}
