/**
 * Admin Dashboard type definitions for WordPal.
 * Covers roles, permissions, content management, analytics, and platform settings.
 */

import type { BlockCategory } from './exercise';
export type { BlockCategory } from './exercise';

// ─── Core Enums & Union Types ────────────────────────────────────────────────

/** User roles within the admin system */
export type UserRole = 'admin' | 'instructor' | 'content_creator' | 'student';

/** CEFR language proficiency levels */
export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

/** Status for learning paths and placement challenges */
export type LearningPathStatus = 'draft' | 'published';

/** Status for lessons */
export type LessonStatus = 'draft' | 'published' | 'incomplete';

/** Supported exercise types in the admin builder */
export type ExerciseType =
  | 'drag-and-drop'
  | 'multiple-choice'
  | 'sentence-ordering'
  | 'fill-in-blank'
  | 'rewrite-sentence'
  | 'free-writing';

// ─── User & Auth ─────────────────────────────────────────────────────────────

/** Admin user profile with role and learning metadata */
export interface AdminUser {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  avatarUrl: string | null;
  cefrLevel: CEFRLevel;
  status: 'active' | 'inactive' | 'suspended';
  currentLessonId: string | null;
  currentLearningPathId: string | null;
  grammarScore: number;       // 0-100
  progressPercentage: number; // 0-100
  joinedAt: string;
  lastActiveAt: string;
}

// ─── Content Models ──────────────────────────────────────────────────────────

/** A structured curriculum targeting a CEFR level */
export interface LearningPath {
  id: string;
  title: string;              // max 150 chars
  description: string;        // max 500 chars
  targetLevel: CEFRLevel;
  estimatedDuration: number;  // minutes, 1-9999
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  xpReward: number;           // 1-10000
  status: LearningPathStatus;
  unitCount: number;
  lessonCount: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

/** A thematic grouping of lessons within a learning path */
export interface Unit {
  id: string;
  learningPathId: string;
  title: string;
  description: string;
  order: number;
  lessonCount: number;
}

/** A lesson as managed in the admin builder */
export interface AdminLesson {
  id: string;
  unitId: string;
  title: string;              // max 150 chars
  description: string;        // max 500 chars
  grammarFocus: string;       // max 100 chars
  cefrLevel: CEFRLevel;
  difficulty: 1 | 2 | 3 | 4 | 5;
  estimatedDuration: number;  // minutes, max 180
  learningObjectives: string[]; // max 10 items, each max 200 chars
  exerciseCount: number;
  status: LessonStatus;
  order: number;
  createdAt: string;
  updatedAt: string;
}

/** An exercise with type-specific content for the admin builder */
export interface AdminExercise {
  id: string;
  lessonId: string;
  type: ExerciseType;
  order: number;
  status: LessonStatus;
  content:
    | DragDropContent
    | MultipleChoiceContent
    | SentenceOrderingContent
    | FillInBlankContent
    | RewriteSentenceContent
    | FreeWritingContent;
  createdAt: string;
  updatedAt: string;
}

// ─── Exercise Content Types ──────────────────────────────────────────────────

/** Grammar block used in drag-and-drop exercises */
export interface GrammarBlock {
  id: string;
  label: string;
  category: BlockCategory;
  isDistractor: boolean;
  sourceOrder: number;
}

/** Content for drag-and-drop sentence building exercises */
export interface DragDropContent {
  targetSentence: string;
  blocks: GrammarBlock[];
}

/** Content for multiple-choice exercises */
export interface MultipleChoiceContent {
  question: string;           // 1-300 chars
  options: string[];          // 4 options, 1-200 chars each
  correctIndex: number;       // 0-3
  explanation?: string;       // max 500 chars
}

/** Content for sentence ordering exercises */
export interface SentenceOrderingContent {
  fragments: string[];        // 2-12 items, 1-200 chars each
}

/** Content for fill-in-the-blank exercises */
export interface FillInBlankContent {
  sentence: string;           // max 500 chars, ___ as markers
  answers: string[];          // 1-10, each 1-200 chars
}

/** Content for rewrite sentence exercises */
export interface RewriteSentenceContent {
  originalSentence: string;   // 1-300 chars
  instruction: string;        // 1-300 chars
  acceptableAnswers: string[]; // 1-5, each 1-300 chars
}

/** Content for free writing exercises */
export interface FreeWritingContent {
  prompt: string;             // 1-500 chars
  minWords?: number;          // at least 1
  maxWords?: number;          // up to 1000
  evaluationGuidelines?: string; // max 500 chars
}

// ─── Placement Challenges ────────────────────────────────────────────────────

/** An adaptive assessment for CEFR level placement */
export interface AdminPlacementChallenge {
  id: string;
  title: string;              // max 150 chars
  targetLevel: CEFRLevel;
  grammarTopics: string[];
  difficulty: 1 | 2 | 3 | 4 | 5;
  questionCount: number;      // derived: count of questions actually added; 5+ required to publish
  status: LearningPathStatus;
  questions: AdminExercise[];
  createdAt: string;
  updatedAt: string;
}

// ─── Achievements ────────────────────────────────────────────────────────────

/** A badge/reward that students can unlock */
export interface Achievement {
  id: string;
  title: string;              // max 100 chars
  description: string;        // max 300 chars
  badgeIcon: string;          // URL or emoji
  xpReward: number;           // 1-10000
  triggerCriteria:
    | 'lessons_completed'
    | 'streak_days'
    | 'grammar_score'
    | 'challenge_passed'
    | 'exercises_completed';
  thresholdValue: number;
  unlockCount: number;
  createdAt: string;
}

// ─── Analytics ───────────────────────────────────────────────────────────────

/** A key performance indicator metric for the dashboard */
export interface KPIMetric {
  id: string;
  title: string;
  value: number | string;
  changePercentage: number;
  trendDirection: 'up' | 'down';
  period: string;
}

/** A single data point for chart rendering */
export interface ChartDataPoint {
  label: string;
  value: number;
  date?: string;
  category?: string;
}

// ─── Notifications ───────────────────────────────────────────────────────────

/** A platform notification delivered via the notification center */
export interface AdminNotification {
  id: string;
  type:
    | 'registration'
    | 'challenge_completion'
    | 'system_error';
  title: string;
  description: string;        // max 120 chars
  isRead: boolean;
  contextUrl: string;
  createdAt: string;
}

// ─── Platform Settings ───────────────────────────────────────────────────────

/** An AI-generated learning insight for the analytics dashboard */
export interface AIInsight {
  id: string;
  title: string;
  description: string;
  affectedStudentCount: number;
  priority: 'high' | 'medium' | 'low';
  suggestedAction: string;
  actionType: string;
  actionParams: Record<string, string>;
  generatedAt: string;
}

/** Platform-wide configuration managed by administrators */
export interface PlatformSettings {
  brand: {
    logoUrl: string | null;
    themeColors: { primary: string; secondary: string; accent: string };
    language: string;
  };
  scoring: {
    xpPerExercise: number;      // 1-1000
    xpPerLesson: number;        // 1-10000
    weightByExerciseType: Record<ExerciseType, number>; // percentages sum to 100
    passingThreshold: number;   // 50-100
  };
  notifications: {
    emailEnabled: boolean;
    pushEnabled: boolean;
    digestFrequency: 'daily' | 'weekly' | 'never';
  };
}

// ─── Role Permission Matrix ──────────────────────────────────────────────────

/** Admin dashboard sections that can be gated by role */
export type AdminSection =
  | 'dashboard'
  | 'students'
  | 'learning-paths'
  | 'units'
  | 'lessons'
  | 'exercises'
  | 'challenges'
  | 'analytics'
  | 'achievements'
  | 'settings'
  | 'profile';

/**
 * Role permission matrix mapping each role to its permitted admin sections.
 *
 * - Administrator: all sections
 * - Instructor: all except Settings
 * - Content Creator: content creation sections only
 * - Student: no admin sections
 */
export const ROLE_PERMISSIONS: Record<UserRole, readonly AdminSection[]> = {
  admin: [
    'dashboard',
    'students',
    'learning-paths',
    'units',
    'lessons',
    'exercises',
    'challenges',
    'analytics',
    'achievements',
    'settings',
    'profile',
  ],
  instructor: [
    'dashboard',
    'students',
    'learning-paths',
    'units',
    'lessons',
    'exercises',
    'challenges',
    'analytics',
    'achievements',
    'profile',
  ],
  content_creator: [
    'dashboard',
    'learning-paths',
    'units',
    'lessons',
    'exercises',
    'profile',
  ],
  student: [],
} as const;
