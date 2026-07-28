'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ExerciseBuilder, { type ExerciseBuilderData } from '@/components/admin/exercise-builder/ExerciseBuilder';
import ExercisePreview from '@/components/admin/exercise-builder/ExercisePreview';
import type { ExerciseType, GrammarBlock, DragDropContent } from '@/types/admin';

function toContent(data: ExerciseBuilderData): DragDropContent | ExerciseBuilderData['content'] {
  if (data.type !== 'drag-and-drop') return data.content;
  // Same derivation as the create flow: the target sentence is the
  // correct (non-distractor) blocks in order, not free text the admin types.
  const targetSentence = (data.blocks ?? [])
    .filter((b) => !b.isDistractor)
    .sort((a, b) => a.sourceOrder - b.sourceOrder)
    .map((b) => b.label)
    .join(' ');
  return { targetSentence, blocks: data.blocks ?? [] };
}

export default function EditExercisePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const lessonId = searchParams.get('lessonId');
  const challengeId = searchParams.get('challengeId');
  const parentPath = lessonId
    ? `/admin/lessons/${lessonId}/edit`
    : challengeId
      ? `/admin/challenges/${challengeId}/edit`
      : '/admin/exercises';

  const [exerciseData, setExerciseData] = useState<{ type: ExerciseType; blocks: GrammarBlock[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<ExerciseBuilderData | null>(null);

  useEffect(() => {
    async function fetchExercise() {
      try {
        const res = await fetch(`/api/admin/exercises/${id}`);
        const json = await res.json();
        if (json.error) {
          setError(json.error);
          return;
        }
        const type: ExerciseType = json.data.type;
        const blocks: GrammarBlock[] = type === 'drag-and-drop' ? (json.data.content as DragDropContent).blocks : [];
        setExerciseData({ type, blocks });
      } catch {
        setError('Failed to load exercise');
      } finally {
        setIsLoading(false);
      }
    }
    fetchExercise();
  }, [id]);

  const handleSave = async (data: ExerciseBuilderData) => {
    try {
      const res = await fetch(`/api/admin/exercises/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: data.type, content: toContent(data) }),
      });
      const json = await res.json();
      if (json.error) {
        console.error('Failed to update exercise:', json.error);
        return;
      }
      router.push(parentPath);
    } catch (err) {
      console.error('Failed to update exercise:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl">
        <div className="flex items-center justify-center py-12">
          <div className="text-sm text-muted-foreground">Loading exercise...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl">
        <div className="rounded-xl border border-destructive/50 bg-destructive/5 p-6 text-center">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  const resolvedData = exerciseData ?? { type: 'drag-and-drop' as ExerciseType, blocks: [] as GrammarBlock[] };

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        {(lessonId || challengeId) && (
          <nav className="mb-3 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Link href={parentPath} className="transition-colors hover:text-foreground">
              {lessonId ? 'Lesson' : 'Challenge'}
            </Link>
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
            <span className="text-foreground">Edit Exercise</span>
          </nav>
        )}
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Edit Exercise
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Exercise ID: <span className="font-mono text-xs">{id}</span>
        </p>
      </div>

      <ExerciseBuilder
        initialType={resolvedData.type}
        initialBlocks={resolvedData.blocks}
        onSave={handleSave}
        onPreview={setPreview}
      />

      {preview && (
        <ExercisePreview
          type={preview.type}
          content={toContent(preview)!}
          open={!!preview}
          onClose={() => setPreview(null)}
        />
      )}
    </div>
  );
}
