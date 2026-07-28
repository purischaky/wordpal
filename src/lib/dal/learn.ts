import { cache } from 'react';
import { createSupabaseServerClient } from '@/lib/services/supabase-server';
import type { GrammarBlock } from '@/types';

export interface LearnExercise {
  id: string;
  targetSentence: string;
  hint: string;
  tutorExplanation: string;
  blocks: GrammarBlock[];
}

export interface LearnLesson {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  icon: string;
  exercises: LearnExercise[];
}

export interface LearnChallenge {
  id: string;
  fromLevel: 'beginner' | 'intermediate';
  toLevel: 'intermediate' | 'advanced';
  title: string;
  description: string;
  requiredCorrect: number;
  exercises: LearnExercise[];
}

export interface LearnProgress {
  /** lessonId -> number of exercises completed */
  lessons: Record<string, number>;
  /** e.g. "challenge-beginner-passed" */
  challengesPassed: string[];
  totalXp: number;
  streakCurrent: number;
}

function toLearnExercise(row: {
  id: string;
  hint: string;
  tutor_explanation: string;
  content: unknown;
}): LearnExercise {
  const content = row.content as { targetSentence?: string; blocks?: GrammarBlock[] } | null;
  return {
    id: row.id,
    targetSentence: content?.targetSentence ?? '',
    hint: row.hint,
    tutorExplanation: row.tutor_explanation,
    blocks: content?.blocks ?? [],
  };
}

/**
 * Loads the published core learning path (units -> lessons -> exercises),
 * ordered the same way the old static LEARNING_PATH array was.
 *
 * Runs as three flat queries joined in memory rather than a single nested
 * PostgREST embed (units(lessons(exercises))): the generated Database type
 * declares `Relationships: []` for every table (see src/types/database.ts),
 * so supabase-js has no foreign-key metadata to resolve a nested embed
 * against — three plain selects are simpler and don't depend on it.
 */
export const getLearningPath = cache(async (): Promise<LearnLesson[]> => {
  const supabase = await createSupabaseServerClient();

  const { data: units } = await supabase
    .from('units')
    .select('id, learning_path_id, position')
    .order('position');

  const { data: lessonRows } = await supabase
    .from('lessons')
    .select('id, unit_id, title, description, path_level, icon, position')
    .eq('status', 'published')
    .order('position');

  const { data: exerciseRows } = await supabase
    .from('exercises')
    .select('id, lesson_id, hint, tutor_explanation, content, position')
    .not('lesson_id', 'is', null)
    .eq('status', 'published')
    .order('position');

  const exercisesByLesson = new Map<string, LearnExercise[]>();
  for (const ex of exerciseRows ?? []) {
    if (!ex.lesson_id) continue;
    const list = exercisesByLesson.get(ex.lesson_id) ?? [];
    list.push(toLearnExercise(ex));
    exercisesByLesson.set(ex.lesson_id, list);
  }

  const unitPosition = new Map((units ?? []).map((u) => [u.id, u.position]));

  return (lessonRows ?? [])
    .slice()
    .sort((a, b) => {
      const unitDiff = (unitPosition.get(a.unit_id) ?? 0) - (unitPosition.get(b.unit_id) ?? 0);
      return unitDiff !== 0 ? unitDiff : a.position - b.position;
    })
    .map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      level: lesson.path_level as LearnLesson['level'],
      icon: lesson.icon,
      exercises: exercisesByLesson.get(lesson.id) ?? [],
    }));
});

/** Loads both placement challenges, keyed the same way getChallengeForLevel() was. */
export const getPlacementChallenges = cache(async (): Promise<LearnChallenge[]> => {
  const supabase = await createSupabaseServerClient();

  const { data: challenges } = await supabase
    .from('placement_challenges')
    .select('id, title, description, from_level, to_level, required_correct')
    .eq('status', 'published')
    .not('from_level', 'is', null);

  const { data: exerciseRows } = await supabase
    .from('exercises')
    .select('id, challenge_id, hint, tutor_explanation, content, position')
    .not('challenge_id', 'is', null)
    .eq('status', 'published')
    .order('position');

  const exercisesByChallenge = new Map<string, LearnExercise[]>();
  for (const ex of exerciseRows ?? []) {
    if (!ex.challenge_id) continue;
    const list = exercisesByChallenge.get(ex.challenge_id) ?? [];
    list.push(toLearnExercise(ex));
    exercisesByChallenge.set(ex.challenge_id, list);
  }

  return (challenges ?? []).map((c) => ({
    id: c.id,
    fromLevel: c.from_level as LearnChallenge['fromLevel'],
    toLevel: c.to_level as LearnChallenge['toLevel'],
    title: c.title,
    description: c.description,
    requiredCorrect: c.required_correct,
    exercises: exercisesByChallenge.get(c.id) ?? [],
  }));
});

/** Loads the current user's progress in the shape the old localStorage blob used. */
export const getUserProgress = cache(async (userId: string): Promise<LearnProgress> => {
  const supabase = await createSupabaseServerClient();

  const [lessonProgress, challengeAttempts, profile, challenges] = await Promise.all([
    supabase.from('user_lesson_progress').select('lesson_id, exercises_completed').eq('user_id', userId),
    supabase.from('user_challenge_attempts').select('challenge_id, passed').eq('user_id', userId).eq('passed', true),
    supabase.from('profiles').select('total_xp, streak_current').eq('id', userId).maybeSingle(),
    supabase.from('placement_challenges').select('id, from_level').not('from_level', 'is', null),
  ]);

  const lessons: Record<string, number> = {};
  for (const row of lessonProgress.data ?? []) {
    lessons[row.lesson_id] = row.exercises_completed;
  }

  const challengeIdToLevel = new Map<string, 'beginner' | 'intermediate'>();
  for (const c of challenges.data ?? []) {
    if (c.from_level) challengeIdToLevel.set(c.id, c.from_level as 'beginner' | 'intermediate');
  }

  const challengesPassed = (challengeAttempts.data ?? [])
    .map((a) => challengeIdToLevel.get(a.challenge_id))
    .filter((level): level is 'beginner' | 'intermediate' => Boolean(level))
    .map((level) => `challenge-${level}-passed`);

  return {
    lessons,
    challengesPassed: [...new Set(challengesPassed)],
    totalXp: profile.data?.total_xp ?? 0,
    streakCurrent: profile.data?.streak_current ?? 0,
  };
});
