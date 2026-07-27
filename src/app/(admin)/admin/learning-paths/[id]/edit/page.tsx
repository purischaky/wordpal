'use client';

import { useState, useCallback, use, useEffect } from 'react';
import Link from 'next/link';
import type { CEFRLevel } from '@/types/admin';
import { validateLearningPathPublish } from '@/lib/validators/learning-path';

// ─── Types ───────────────────────────────────────────────────────────────────

interface EditableLesson {
  id: string;
  title: string;
  status: 'draft' | 'published' | 'incomplete';
  order: number;
}

interface EditableUnit {
  id: string;
  title: string;
  description: string;
  order: number;
  lessons: EditableLesson[];
}

interface EditableLearningPath {
  id: string;
  title: string;
  description: string;
  targetLevel: CEFRLevel;
  estimatedDuration: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  xpReward: number;
  status: 'draft' | 'published';
  units: EditableUnit[];
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

function getMockLearningPath(id: string): EditableLearningPath {
  return {
    id,
    title: 'Intermediate Grammar Mastery',
    description: 'Develop fluency with complex sentence structures, conditionals, and reported speech.',
    targetLevel: 'B1',
    estimatedDuration: 2400,
    difficulty: 'Intermediate',
    xpReward: 1200,
    status: 'draft',
    units: [
      {
        id: 'unit-1',
        title: 'Conditionals',
        description: 'Master zero, first, second, and third conditionals.',
        order: 1,
        lessons: [
          { id: 'lesson-1-1', title: 'Zero & First Conditional', status: 'published', order: 1 },
          { id: 'lesson-1-2', title: 'Second Conditional', status: 'published', order: 2 },
          { id: 'lesson-1-3', title: 'Third Conditional', status: 'draft', order: 3 },
        ],
      },
      {
        id: 'unit-2',
        title: 'Reported Speech',
        description: 'Transform direct speech into reported speech and vice versa.',
        order: 2,
        lessons: [
          { id: 'lesson-2-1', title: 'Statements in Reported Speech', status: 'published', order: 1 },
          { id: 'lesson-2-2', title: 'Questions in Reported Speech', status: 'draft', order: 2 },
        ],
      },
      {
        id: 'unit-3',
        title: 'Passive Voice',
        description: 'Use passive constructions in various tenses and contexts.',
        order: 3,
        lessons: [
          { id: 'lesson-3-1', title: 'Present & Past Passive', status: 'published', order: 1 },
          { id: 'lesson-3-2', title: 'Passive with Modals', status: 'incomplete', order: 2 },
          { id: 'lesson-3-3', title: 'Causative Passive', status: 'draft', order: 3 },
        ],
      },
    ],
  };
}

// ─── Helper Components ───────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const styles = {
    published: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    draft: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    incomplete: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${styles[status as keyof typeof styles] ?? styles.draft}`}>
      {status}
    </span>
  );
}

function ConfirmationDialog({
  open,
  title,
  message,
  confirmLabel,
  confirmVariant = 'primary',
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  confirmVariant?: 'primary' | 'destructive';
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
      <div className="mx-4 w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl">
        <h2 id="dialog-title" className="text-lg font-semibold text-foreground">
          {title}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {message}
        </p>
        <div className="mt-5 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-[12px] border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors duration-200 hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-[12px] px-4 py-2 text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring ${
              confirmVariant === 'destructive'
                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Edit Page ──────────────────────────────────────────────────────────

export default function EditLearningPathPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [learningPath, setLearningPath] = useState<EditableLearningPath>(() =>
    getMockLearningPath(id)
  );
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Dialog states
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);

  // Fetch learning path data from API
  useEffect(() => {
    async function fetchLearningPath() {
      try {
        const res = await fetch('/api/admin/learning-paths');
        const json = await res.json();
        if (json.data) {
          const found = json.data.find((lp: EditableLearningPath) => lp.id === id);
          if (found) {
            setLearningPath(found);
          }
        }
      } catch (error) {
        console.error('Failed to fetch learning path:', error);
      } finally {
        setIsLoadingData(false);
      }
    }
    fetchLearningPath();
  }, [id]);

  // Drag state
  const [draggedUnitId, setDraggedUnitId] = useState<string | null>(null);
  const [draggedLessonId, setDraggedLessonId] = useState<string | null>(null);
  const [dragSourceUnitId, setDragSourceUnitId] = useState<string | null>(null);

  // ─── Unit Drag-and-Drop ──────────────────────────────────────────────────

  const handleUnitDragStart = useCallback((e: React.DragEvent, unitId: string) => {
    setDraggedUnitId(unitId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', unitId);
  }, []);

  const handleUnitDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleUnitDrop = useCallback(
    (e: React.DragEvent, targetUnitId: string) => {
      e.preventDefault();
      if (!draggedUnitId || draggedUnitId === targetUnitId) {
        setDraggedUnitId(null);
        return;
      }

      setLearningPath((prev) => {
        const units = [...prev.units];
        const dragIdx = units.findIndex((u) => u.id === draggedUnitId);
        const dropIdx = units.findIndex((u) => u.id === targetUnitId);
        if (dragIdx === -1 || dropIdx === -1) return prev;

        const [moved] = units.splice(dragIdx, 1);
        units.splice(dropIdx, 0, moved);

        // Re-assign order values
        const reordered = units.map((u, i) => ({ ...u, order: i + 1 }));
        return { ...prev, units: reordered };
      });

      setDraggedUnitId(null);
    },
    [draggedUnitId]
  );

  const handleUnitDragEnd = useCallback(() => {
    setDraggedUnitId(null);
  }, []);

  // ─── Lesson Drag-and-Drop ────────────────────────────────────────────────

  const handleLessonDragStart = useCallback(
    (e: React.DragEvent, lessonId: string, unitId: string) => {
      setDraggedLessonId(lessonId);
      setDragSourceUnitId(unitId);
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', lessonId);
    },
    []
  );

  const handleLessonDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleLessonDrop = useCallback(
    (e: React.DragEvent, targetLessonId: string, targetUnitId: string) => {
      e.preventDefault();
      if (!draggedLessonId || !dragSourceUnitId) {
        setDraggedLessonId(null);
        setDragSourceUnitId(null);
        return;
      }

      if (draggedLessonId === targetLessonId && dragSourceUnitId === targetUnitId) {
        setDraggedLessonId(null);
        setDragSourceUnitId(null);
        return;
      }

      setLearningPath((prev) => {
        const units = prev.units.map((u) => ({
          ...u,
          lessons: [...u.lessons],
        }));

        // Find and remove the dragged lesson from source unit
        const sourceUnit = units.find((u) => u.id === dragSourceUnitId);
        if (!sourceUnit) return prev;

        const lessonIdx = sourceUnit.lessons.findIndex((l) => l.id === draggedLessonId);
        if (lessonIdx === -1) return prev;

        const [movedLesson] = sourceUnit.lessons.splice(lessonIdx, 1);

        // Insert into target unit at target position
        const targetUnit = units.find((u) => u.id === targetUnitId);
        if (!targetUnit) return prev;

        const targetIdx = targetUnit.lessons.findIndex((l) => l.id === targetLessonId);
        if (targetIdx === -1) {
          targetUnit.lessons.push(movedLesson);
        } else {
          targetUnit.lessons.splice(targetIdx, 0, movedLesson);
        }

        // Re-assign order values in both units
        sourceUnit.lessons = sourceUnit.lessons.map((l, i) => ({ ...l, order: i + 1 }));
        if (sourceUnit.id !== targetUnit.id) {
          targetUnit.lessons = targetUnit.lessons.map((l, i) => ({ ...l, order: i + 1 }));
        }

        return { ...prev, units };
      });

      setDraggedLessonId(null);
      setDragSourceUnitId(null);
    },
    [draggedLessonId, dragSourceUnitId]
  );

  const handleLessonDragEnd = useCallback(() => {
    setDraggedLessonId(null);
    setDragSourceUnitId(null);
  }, []);

  // ─── Publish Logic ───────────────────────────────────────────────────────

  const handlePublishClick = useCallback(() => {
    setPublishError(null);
    const result = validateLearningPathPublish({
      id: learningPath.id,
      title: learningPath.title,
      units: (learningPath.units || []).map((u) => ({
        id: u.id,
        title: u.title,
        lessons: (u.lessons || []).map((l) => ({ id: l.id, title: l.title })),
      })),
    });

    if (!result.valid) {
      setPublishError(result.errors.join(' '));
      return;
    }

    setPublishDialogOpen(true);
  }, [learningPath]);

  const confirmPublish = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/learning-paths/${learningPath.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...learningPath, status: 'published' }),
      });

      if (!res.ok) {
        const json = await res.json();
        setPublishError(json.error || 'Failed to publish learning path');
        setPublishDialogOpen(false);
        return;
      }

      setLearningPath((prev) => ({ ...prev, status: 'published' }));
      setPublishDialogOpen(false);
    } catch (error) {
      setPublishError('Failed to publish learning path. Please try again.');
      setPublishDialogOpen(false);
    }
  }, [learningPath]);

  // ─── Delete Logic ────────────────────────────────────────────────────────

  const units = learningPath.units || [];
  const totalUnits = units.length;
  const totalLessons = units.reduce((sum, u) => sum + (u.lessons || []).length, 0);

  const confirmDelete = useCallback(async () => {
    try {
      await fetch(`/api/admin/learning-paths/${learningPath.id}`, {
        method: 'DELETE',
      });
      setDeleteDialogOpen(false);
      window.location.href = '/admin/learning-paths';
    } catch (error) {
      setDeleteDialogOpen(false);
      window.location.href = '/admin/learning-paths';
    }
  }, [learningPath.id]);

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/admin/learning-paths" className="transition-colors hover:text-foreground">
          Learning Paths
        </Link>
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
        <span className="text-foreground">Edit</span>
      </nav>

      {/* Editable Header Section */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.15)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">
                {learningPath.title}
              </h1>
              <StatusBadge status={learningPath.status} />
            </div>
            <p className="text-sm text-muted-foreground">
              {learningPath.description}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span className="font-medium text-foreground">{learningPath.targetLevel}</span>
                CEFR Level
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="font-medium text-foreground">{learningPath.difficulty}</span>
                Difficulty
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="font-medium text-foreground">{learningPath.estimatedDuration}</span>
                min duration
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="font-medium text-foreground">{learningPath.xpReward}</span>
                XP reward
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePublishClick}
              disabled={learningPath.status === 'published'}
              className="inline-flex items-center gap-1.5 rounded-[12px] bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors duration-200 hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19.5v-15m0 0l-6.75 6.75M12 4.5l6.75 6.75" />
              </svg>
              Publish
            </button>
            <button
              type="button"
              onClick={() => setDeleteDialogOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-[12px] border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive transition-colors duration-200 hover:bg-destructive/20 focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
              Delete
            </button>
          </div>
        </div>

        {/* Publish Error */}
        {publishError && (
          <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3" role="alert">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-destructive" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <p className="text-sm font-medium text-destructive">
                {publishError}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Units and Lessons Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            Units & Lessons
          </h2>
          <p className="text-sm text-muted-foreground">
            Drag to reorder units and lessons
          </p>
        </div>

        {(learningPath.units || []).length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
            <p className="text-sm text-muted-foreground">
              No units yet. Add a unit to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {(learningPath.units || []).map((unit) => (
              <div
                key={unit.id}
                draggable
                onDragStart={(e) => handleUnitDragStart(e, unit.id)}
                onDragOver={handleUnitDragOver}
                onDrop={(e) => handleUnitDrop(e, unit.id)}
                onDragEnd={handleUnitDragEnd}
                className={`rounded-xl border bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-200 dark:shadow-[0_2px_8px_rgba(0,0,0,0.15)] ${
                  draggedUnitId === unit.id
                    ? 'border-primary opacity-50'
                    : 'border-border hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_4px_16px_rgba(0,0,0,0.25)]'
                }`}
              >
                {/* Unit Header */}
                <div className="flex items-center gap-3 border-b border-border px-5 py-4">
                  {/* Drag handle */}
                  <div className="cursor-grab text-muted-foreground hover:text-foreground active:cursor-grabbing" aria-label={`Drag to reorder ${unit.title}`}>
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                    </svg>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary">
                        {unit.order}
                      </span>
                      <h3 className="text-sm font-semibold text-foreground">
                        {unit.title}
                      </h3>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {unit.description}
                    </p>
                  </div>

                  <span className="text-xs text-muted-foreground">
                    {unit.lessons.length} lesson{unit.lessons.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Lessons List */}
                <div className="divide-y divide-border/50">
                  {unit.lessons.length === 0 ? (
                    <div className="px-5 py-4 text-center">
                      <p className="text-xs text-muted-foreground">
                        No lessons in this unit.
                      </p>
                    </div>
                  ) : (
                    unit.lessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        draggable
                        onDragStart={(e) => {
                          e.stopPropagation();
                          handleLessonDragStart(e, lesson.id, unit.id);
                        }}
                        onDragOver={(e) => {
                          e.stopPropagation();
                          handleLessonDragOver(e);
                        }}
                        onDrop={(e) => {
                          e.stopPropagation();
                          handleLessonDrop(e, lesson.id, unit.id);
                        }}
                        onDragEnd={handleLessonDragEnd}
                        className={`flex items-center gap-3 px-5 py-3 transition-colors duration-150 ${
                          draggedLessonId === lesson.id
                            ? 'bg-primary/5 opacity-50'
                            : 'hover:bg-muted/50'
                        }`}
                      >
                        {/* Lesson drag handle */}
                        <div className="cursor-grab text-muted-foreground/60 hover:text-muted-foreground active:cursor-grabbing" aria-label={`Drag to reorder ${lesson.title}`}>
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h.008v.008H8.25V6.75zm0 5.25h.008v.008H8.25V12zm0 5.25h.008v.008H8.25v-.008zm7.5-10.5h.008v.008h-.008V6.75zm0 5.25h.008v.008h-.008V12zm0 5.25h.008v.008h-.008v-.008z" />
                          </svg>
                        </div>

                        <span className="text-xs font-medium text-muted-foreground w-6 text-center">
                          {lesson.order}
                        </span>

                        <span className="flex-1 text-sm text-foreground">
                          {lesson.title}
                        </span>

                        <StatusBadge status={lesson.status} />
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.15)]">
        <div className="flex items-center gap-6 text-sm">
          <span className="text-muted-foreground">
            <span className="font-medium text-foreground">{totalUnits}</span> unit{totalUnits !== 1 ? 's' : ''}
          </span>
          <span className="text-muted-foreground">
            <span className="font-medium text-foreground">{totalLessons}</span> lesson{totalLessons !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Publish Confirmation Dialog */}
      <ConfirmationDialog
        open={publishDialogOpen}
        title="Publish Learning Path"
        message={`Are you sure you want to publish "${learningPath.title}"? This will make it visible to students.`}
        confirmLabel="Publish"
        confirmVariant="primary"
        onConfirm={confirmPublish}
        onCancel={() => setPublishDialogOpen(false)}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        title="Delete Learning Path"
        message={`This will permanently delete "${learningPath.title}" along with ${totalUnits} unit${totalUnits !== 1 ? 's' : ''} and ${totalLessons} lesson${totalLessons !== 1 ? 's' : ''}. This action cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="destructive"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </div>
  );
}
