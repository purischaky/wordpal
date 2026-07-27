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
  FeedbackStatus,
  ExerciseState,
  ExerciseAction,
  DraggableBlockProps,
} from './exercise';

export { GRAMMAR_EXPLANATIONS } from './exercise';

export type {
  FeedbackResponse,
  FeedbackRequest,
  HintRequest,
  HintResponse,
  FeedbackPanelProps,
} from './feedback';

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
  BlockCategory as AdminBlockCategory,
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
  AIInsight,
  PlatformSettings,
  AdminSection,
} from './admin';

export { ROLE_PERMISSIONS } from './admin';
