'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { AdminLesson, CEFRLevel, LessonStatus } from '@/types/admin';

// ─── Status Badge Component ──────────────────────────────────────────────────

function StatusBadge({ status }: { status: LessonStatus }) {
  const styles: Record<LessonStatus, string> = {
    published: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    incomplete: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${styles[status]}`}>
      {status}
    </span>
  );
}

// ─── CEFR Badge Component ────────────────────────────────────────────────────

function CEFRBadge({ level }: { level: CEFRLevel }) {
  const colors: Record<CEFRLevel, string> = {
    A1: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400',
    A2: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    B1: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
    B2: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    C1: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
    C2: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400',
  };

  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${colors[level]}`}>
      {level}
    </span>
  );
}

// ─── Notification Component ──────────────────────────────────────────────────

interface Notification {
  id: string;
  type: 'success' | 'error';
  message: string;
  onRetry?: () => void;
}

function NotificationBanner({ notification, onDismiss }: { notification: Notification; onDismiss: () => void }) {
  const bgColor = notification.type === 'success'
    ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
    : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
  const textColor = notification.type === 'success'
    ? 'text-green-800 dark:text-green-300'
    : 'text-red-800 dark:text-red-300';

  return (
    <div className={`mb-4 flex items-center justify-between rounded-lg border p-4 ${bgColor}`} role="alert">
      <p className={`text-sm font-medium ${textColor}`}>{notification.message}</p>
      <div className="flex items-center gap-2">
        {notification.onRetry && (
          <button
            onClick={notification.onRetry}
            className="rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        )}
        <button
          onClick={onDismiss}
          className={`text-sm font-medium underline ${textColor} hover:opacity-80`}
          aria-label="Dismiss notification"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}

// ─── Lessons Page ────────────────────────────────────────────────────────────

export default function LessonsPage() {
  const [lessons, setLessons] = useState<AdminLesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [publishErrors, setPublishErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    async function fetchLessons() {
      try {
        const res = await fetch('/api/admin/lessons');
        const json = await res.json();
        if (json.data) {
          setLessons(json.data);
        }
      } catch (error) {
        console.error('Failed to fetch lessons:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchLessons();
  }, []);

  const dismissNotification = useCallback(() => {
    setNotification(null);
  }, []);

  // ─── Duplicate Handler ───────────────────────────────────────────────────

  const handleDuplicate = useCallback(async (lesson: AdminLesson) => {
    try {
      const res = await fetch(`/api/admin/lessons/${lesson.id}/duplicate`, {
        method: 'POST',
      });
      const json = await res.json();

      if (!res.ok) {
        const retryAction = () => handleDuplicate(lesson);
        setNotification({
          id: `err-${Date.now()}`,
          type: 'error',
          message: json.error || `Failed to duplicate "${lesson.title}".`,
          onRetry: retryAction,
        });
        return;
      }

      setLessons((prev) => [...prev, json.data]);
      setNotification({
        id: `success-${Date.now()}`,
        type: 'success',
        message: `Lesson duplicated as "${json.data.title}".`,
      });
      setPublishErrors({});
    } catch (error) {
      const retryAction = () => handleDuplicate(lesson);
      setNotification({
        id: `err-${Date.now()}`,
        type: 'error',
        message: `Failed to duplicate "${lesson.title}". Your changes have been preserved.`,
        onRetry: retryAction,
      });
    }
  }, []);

  // ─── Publish Handler ─────────────────────────────────────────────────────

  const handlePublish = useCallback(async (lesson: AdminLesson) => {
    try {
      const res = await fetch(`/api/admin/lessons/${lesson.id}/publish`, {
        method: 'PATCH',
      });
      const json = await res.json();

      if (!res.ok) {
        if (json.details) {
          setPublishErrors((prev) => ({ ...prev, [lesson.id]: json.details }));
        }
        setNotification({
          id: `err-${Date.now()}`,
          type: 'error',
          message: json.error || `Cannot publish "${lesson.title}": validation failed.`,
        });
        return;
      }

      // Clear publish errors for this lesson
      setPublishErrors((prev) => {
        const next = { ...prev };
        delete next[lesson.id];
        return next;
      });

      setLessons((prev) =>
        prev.map((l) => (l.id === lesson.id ? json.data : l))
      );
      setNotification({
        id: `success-${Date.now()}`,
        type: 'success',
        message: `"${lesson.title}" has been published.`,
      });
    } catch (error) {
      const retryAction = () => handlePublish(lesson);
      setNotification({
        id: `err-${Date.now()}`,
        type: 'error',
        message: `Failed to publish "${lesson.title}". Your changes have been preserved.`,
        onRetry: retryAction,
      });
    }
  }, []);

  // ─── Difficulty Label ────────────────────────────────────────────────────

  const difficultyLabel = (level: number) => {
    const labels = ['', 'Very Easy', 'Easy', 'Medium', 'Hard', 'Very Hard'];
    return labels[level] || `${level}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Lessons</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Manage grammar lessons, exercises, and publishing status.
            </p>
          </div>
        </div>
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 animate-pulse">
          <div className="p-4 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-4 w-1/3 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-4 w-12 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-4 w-16 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-4 w-8 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-4 w-16 rounded bg-gray-200 dark:bg-gray-700" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Lessons</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage grammar lessons, exercises, and publishing status.
          </p>
        </div>
        <Link
          href="/admin/lessons/new"
          className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition-colors"
        >
          + New Lesson
        </Link>
      </div>

      {/* Notification */}
      {notification && (
        <NotificationBanner notification={notification} onDismiss={dismissNotification} />
      )}

      {/* Lessons Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Title
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  CEFR
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Difficulty
                </th>
                <th scope="col" className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Exercises
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Status
                </th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {lessons.map((lesson) => (
                <tr key={lesson.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {lesson.title}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {lesson.grammarFocus}
                      </span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <CEFRBadge level={lesson.cefrLevel} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {difficultyLabel(lesson.difficulty)} ({lesson.difficulty}/5)
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {lesson.exerciseCount}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <StatusBadge status={lesson.status} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/lessons/${lesson.id}/edit`}
                        className="rounded-md px-2.5 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/20 transition-colors"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDuplicate(lesson)}
                        className="rounded-md px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
                      >
                        Duplicate
                      </button>
                      {lesson.status !== 'published' && (
                        <button
                          onClick={() => handlePublish(lesson)}
                          className="rounded-md bg-green-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-green-700 transition-colors"
                        >
                          Publish
                        </button>
                      )}
                    </div>
                    {/* Publish Validation Errors */}
                    {publishErrors[lesson.id] && publishErrors[lesson.id].length > 0 && (
                      <div className="mt-1 text-left">
                        {publishErrors[lesson.id].map((err, i) => (
                          <p key={i} className="text-xs text-red-600 dark:text-red-400">
                            • {err}
                          </p>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {lessons.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No lessons found. Create your first lesson to get started.
            </p>
            <Link
              href="/admin/lessons/new"
              className="mt-3 inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
            >
              + Create Lesson
            </Link>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
        <span>{lessons.length} lesson{lessons.length !== 1 ? 's' : ''} total</span>
        <span>•</span>
        <span>{lessons.filter((l) => l.status === 'published').length} published</span>
        <span>•</span>
        <span>{lessons.filter((l) => l.status === 'draft').length} drafts</span>
      </div>
    </div>
  );
}
