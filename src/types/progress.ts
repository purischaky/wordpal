/**
 * Progress tracking type definitions for WordPal.
 */

/** Request payload for POST /api/progress */
export interface ProgressUpdateRequest {
  exerciseId: string;
  lessonId: string;
  score: number;
  completedAt: string;
}

/** Progress data for a single lesson */
export interface LessonProgress {
  lessonId: string;
  title: string;
  completedExercises: number;
  totalExercises: number;
  percentage: number;
}

/** Response from GET /api/progress */
export interface ProgressResponse {
  lessons: LessonProgress[];
  lastExerciseId: string | null;
  totalCompleted: number;
  totalExercises: number;
}

/** Props for the ProgressBar component */
export interface ProgressBarProps {
  completed: number;
  total: number;
  colorScheme: 'blue' | 'green' | 'purple';
}
