'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ExerciseBuilder from '@/components/admin/exercise-builder/ExerciseBuilder';
import type { ExerciseType, GrammarBlock } from '@/types/admin';

export default function EditExercisePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [exerciseData, setExerciseData] = useState<{ type: ExerciseType; blocks: GrammarBlock[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchExercise() {
      try {
        const res = await fetch(`/api/admin/exercises/${id}`);
        const json = await res.json();
        if (json.error) {
          setError(json.error);
          return;
        }
        setExerciseData(json.data as { type: ExerciseType; blocks: GrammarBlock[] });
      } catch {
        setError('Failed to load exercise');
      } finally {
        setIsLoading(false);
      }
    }
    fetchExercise();
  }, [id]);

  const handleSave = async (data: { type: string; blocks?: unknown[] }) => {
    try {
      const res = await fetch(`/api/admin/exercises/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.error) {
        console.error('Failed to update exercise:', json.error);
        return;
      }
      router.push('/admin/exercises');
    } catch (err) {
      console.error('Failed to update exercise:', err);
    }
  };

  const handlePreview = () => {
    // Preview would render the exercise as a student sees it (task 9.3)
    console.log('Preview exercise:', id);
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
        onPreview={handlePreview}
      />
    </div>
  );
}
