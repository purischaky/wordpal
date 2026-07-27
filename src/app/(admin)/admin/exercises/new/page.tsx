'use client';

import { useRouter } from 'next/navigation';
import ExerciseBuilder from '@/components/admin/exercise-builder/ExerciseBuilder';

export default function NewExercisePage() {
  const router = useRouter();

  const handleSave = async (data: { type: string; blocks?: unknown[] }) => {
    try {
      const res = await fetch('/api/admin/exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.error) {
        console.error('Failed to create exercise:', json.error);
        return;
      }
      router.push('/admin/exercises');
    } catch (err) {
      console.error('Failed to create exercise:', err);
    }
  };

  const handlePreview = () => {
    // Preview would render the exercise as a student sees it (task 9.3)
    console.log('Preview exercise');
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Create Exercise
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Select an exercise type and configure its content.
        </p>
      </div>

      <ExerciseBuilder
        initialType="drag-and-drop"
        onSave={handleSave}
        onPreview={handlePreview}
      />
    </div>
  );
}
