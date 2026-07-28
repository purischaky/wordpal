'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ExerciseBuilder, { type ExerciseBuilderData } from '@/components/admin/exercise-builder/ExerciseBuilder';
import ExercisePreview from '@/components/admin/exercise-builder/ExercisePreview';
import type { DragDropContent } from '@/types/admin';

/**
 * targetSentence is the correct (non-distractor) blocks in order — the
 * admin builder doesn't collect it as free text, it's derived so the
 * student-facing check-answer logic always matches what's on screen.
 */
function toContent(data: ExerciseBuilderData): DragDropContent | ExerciseBuilderData['content'] {
  if (data.type !== 'drag-and-drop') return data.content;
  const targetSentence = (data.blocks ?? [])
    .filter((b) => !b.isDistractor)
    .sort((a, b) => a.sourceOrder - b.sourceOrder)
    .map((b) => b.label)
    .join(' ');
  return { targetSentence, blocks: data.blocks ?? [] };
}

export default function NewExercisePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const lessonId = searchParams.get('lessonId');
  const challengeId = searchParams.get('challengeId');
  const parentPath = lessonId ? `/admin/lessons/${lessonId}/edit` : challengeId ? `/admin/challenges/${challengeId}/edit` : '/admin/lessons';

  const [preview, setPreview] = useState<ExerciseBuilderData | null>(null);

  const handleSave = async (data: ExerciseBuilderData) => {
    try {
      // Fetch the current count of sibling exercises to append at the end.
      const scopeParam = lessonId
        ? `lessonId=${encodeURIComponent(lessonId)}`
        : `challengeId=${encodeURIComponent(challengeId ?? '')}`;
      const listRes = await fetch(`/api/admin/exercises?${scopeParam}`);
      const listJson = await listRes.json();
      const position = listJson.data ? listJson.data.length + 1 : 1;

      const res = await fetch('/api/admin/exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: data.type, content: toContent(data), lessonId, challengeId, position }),
      });
      const json = await res.json();
      if (json.error) {
        console.error('Failed to create exercise:', json.error);
        return;
      }
      router.push(parentPath);
    } catch (err) {
      console.error('Failed to create exercise:', err);
    }
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
