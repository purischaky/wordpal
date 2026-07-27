/**
 * Centralized data access layer for the WordPal admin dashboard.
 * Provides typed getter functions that wrap JSON data imports.
 */

import type {
  KPIMetric,
  LearningPath,
  AdminLesson,
  Achievement,
  AdminPlacementChallenge,
  AIInsight,
  AdminNotification,
  ExerciseType,
  GrammarBlock,
} from '@/types/admin';

import studentsData from './students.json';
import studentProfilesData from './student-profiles.json';
import learningPathsData from './learning-paths.json';
import lessonsData from './lessons.json';
import achievementsData from './achievements.json';
import challengesData from './challenges.json';
import kpiMetricsData from './kpi-metrics.json';
import aiInsightsData from './ai-insights.json';
import searchDataJson from './search-data.json';
import exercisesData from './exercises.json';
import notificationsData from './notifications.json';

// ─── Student Row Type (matches StudentTable component) ───────────────────────

export interface StudentRow {
  id: string;
  avatarUrl: string | null;
  name: string;
  email: string;
  role: string;
  cefrLevel: string;
  currentLesson: string | null;
  grammarScore: number;
  progressPercentage: number;
  status: 'active' | 'inactive' | 'suspended';
  lastActiveAt: string;
}

// ─── Student Profile Type ────────────────────────────────────────────────────

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  joinDate: string;
  avatarUrl: string | null;
  status: 'active' | 'inactive' | 'suspended';
  currentLearningPath: string | null;
  currentLesson: string | null;
  grammarScores: { category: string; score: number }[];
  achievements: { id: string; badgeIcon: string; title: string; date: string }[];
  placementResults: { id: string; date: string; score: number; result: 'pass' | 'fail'; targetLevel: string }[];
  aiCoach: { weakAreas: string[]; recommendedLessons: string[]; assessment: string };
  timelineEvents: { id: string; date: string; type: string; title: string; description?: string }[];
  certificates: { id: string; title: string; type: string; issueDate: string }[];
}

// ─── Search Result Type ──────────────────────────────────────────────────────

export interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  category: string;
  href: string;
}

// ─── Exercise Data Type ──────────────────────────────────────────────────────

export interface ExerciseData {
  type: ExerciseType;
  blocks: GrammarBlock[];
}

// ─── Getter Functions ────────────────────────────────────────────────────────

/** Get all students for the student list table */
export function getStudents(): StudentRow[] {
  return studentsData as StudentRow[];
}

/** Get a student profile by ID, or null if not found */
export function getStudentProfile(id: string): StudentProfile | null {
  const profiles = studentProfilesData as Record<string, StudentProfile>;
  return profiles[id] ?? null;
}

/** Get all learning paths */
export function getLearningPaths(): LearningPath[] {
  return learningPathsData as LearningPath[];
}

/** Get all lessons */
export function getLessons(): AdminLesson[] {
  return lessonsData as AdminLesson[];
}

/** Get all achievements */
export function getAchievements(): Achievement[] {
  return achievementsData as Achievement[];
}

/** Get all placement challenges */
export function getChallenges(): AdminPlacementChallenge[] {
  return challengesData as AdminPlacementChallenge[];
}

/** Get KPI metrics for the dashboard */
export function getKPIMetrics(): KPIMetric[] {
  return kpiMetricsData as KPIMetric[];
}

/** Get AI insights for the analytics page */
export function getAIInsights(): AIInsight[] {
  return aiInsightsData as unknown as AIInsight[];
}

/** Get search data for the global search modal */
export function getSearchData(): SearchResult[] {
  return searchDataJson as SearchResult[];
}

/** Get exercise data by ID, or null if not found */
export function getExercise(id: string): ExerciseData | null {
  const exercises = exercisesData as Record<string, ExerciseData>;
  return exercises[id] ?? null;
}

/** Get all notifications */
export function getNotifications(): AdminNotification[] {
  return notificationsData as AdminNotification[];
}
