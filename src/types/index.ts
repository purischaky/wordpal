/**
 * Central type re-exports for WordPal.
 * Import types from '@/types' for convenience.
 */

export type {
  BlockCategory,
  GrammarBlock,
  Exercise,
  Lesson,
  CanvasState,
  DraggableBlockProps,
} from './exercise';

export { GRAMMAR_EXPLANATIONS } from './exercise';

export type {
  ProgressUpdateRequest,
  LessonProgress,
  ProgressResponse,
  ProgressBarProps,
} from './progress';

export type { Database, Json } from './database';

export type {
  UserRole,
  CEFRLevel,
  LearningPathStatus,
  LessonStatus,
  ExerciseType,
  AdminUser,
  LearningPath,
  Unit,
  AdminLesson,
  AdminExercise,
  GrammarBlock as AdminGrammarBlock,
  DragDropContent,
  MultipleChoiceContent,
  SentenceOrderingContent,
  FillInBlankContent,
  RewriteSentenceContent,
  FreeWritingContent,
  AdminPlacementChallenge,
  Achievement,
  KPIMetric,
  ChartDataPoint,
  AdminNotification,
  PlatformSettings,
  AdminSection,
} from './admin';

export { ROLE_PERMISSIONS } from './admin';
