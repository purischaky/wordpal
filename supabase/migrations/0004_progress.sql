-- ============================================================
-- WordPal: Student progress
--
-- All writes go through SECURITY DEFINER RPCs in 0006_functions.sql
-- (record_exercise_attempt, record_challenge_attempt) so a client can
-- never award itself XP or mark a lesson complete directly — these
-- tables grant SELECT only to `authenticated`, never INSERT/UPDATE.
-- ============================================================

create table public.exercise_attempts (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references public.profiles(id) on delete cascade,
  exercise_id          uuid not null references public.exercises(id) on delete cascade,
  is_correct           boolean not null,
  score                smallint not null default 0 check (score between 0 and 100),
  submitted_answer     jsonb,
  incorrect_categories text[] not null default '{}',   -- feeds the GrammarRadar component
  duration_ms          integer check (duration_ms is null or duration_ms >= 0),
  created_at           timestamptz not null default now()
);
create index ea_user_created_idx on public.exercise_attempts(user_id, created_at desc);
create index ea_exercise_idx on public.exercise_attempts(exercise_id);
create index ea_categories_gin on public.exercise_attempts using gin (incorrect_categories);

create table public.user_exercise_progress (
  user_id            uuid not null references public.profiles(id) on delete cascade,
  exercise_id        uuid not null references public.exercises(id) on delete cascade,
  best_score         smallint not null default 0 check (best_score between 0 and 100),
  completed          boolean not null default false,
  attempts           integer not null default 0 check (attempts >= 0),
  first_completed_at timestamptz,
  last_attempt_at    timestamptz not null default now(),
  primary key (user_id, exercise_id)
);
create index uep_user_completed_idx on public.user_exercise_progress(user_id, completed);

create table public.user_lesson_progress (
  user_id             uuid not null references public.profiles(id) on delete cascade,
  lesson_id           uuid not null references public.lessons(id) on delete cascade,
  exercises_completed integer not null default 0 check (exercises_completed >= 0),
  exercises_total     integer not null default 0 check (exercises_total >= 0),
  completed           boolean not null default false,
  completed_at        timestamptz,
  updated_at          timestamptz not null default now(),
  primary key (user_id, lesson_id)
);
create index ulp_user_idx on public.user_lesson_progress(user_id);

create table public.user_challenge_attempts (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  challenge_id  uuid not null references public.placement_challenges(id) on delete cascade,
  correct_count integer not null check (correct_count >= 0),
  total_count   integer not null check (total_count >= 1),
  passed        boolean not null,
  created_at    timestamptz not null default now()
);
create index uca_user_idx on public.user_challenge_attempts(user_id, created_at desc);
-- Idempotency guard: a user can only have ONE passed attempt per challenge on record.
create unique index uca_user_passed_uniq
  on public.user_challenge_attempts(user_id, challenge_id) where passed;

create table public.user_achievements (
  user_id        uuid not null references public.profiles(id) on delete cascade,
  achievement_id uuid not null references public.achievements(id) on delete cascade,
  unlocked_at    timestamptz not null default now(),
  primary key (user_id, achievement_id)
);
create index ua_achievement_idx on public.user_achievements(achievement_id);

-- XP ledger: auditable, and makes granting XP idempotent per (user, source, source_id).
create table public.xp_events (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  amount     integer not null check (amount <> 0),
  source     text not null constraint xp_source_check
    check (source in ('exercise', 'lesson', 'challenge', 'achievement', 'adjustment')),
  source_id  uuid,
  created_at timestamptz not null default now()
);
create index xp_user_created_idx on public.xp_events(user_id, created_at desc);
create unique index xp_unique_award on public.xp_events(user_id, source, source_id)
  where source in ('lesson', 'challenge', 'achievement');

-- RLS: read own row, or any row if staff. Writes only via SECURITY DEFINER RPCs.
do $$
declare
  t text;
begin
  foreach t in array array[
    'exercise_attempts', 'user_exercise_progress', 'user_lesson_progress',
    'user_challenge_attempts', 'user_achievements', 'xp_events'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format(
      $f$create policy %I on public.%I for select to authenticated
         using (user_id = auth.uid() or public.can_manage_students())$f$,
      t || '_read', t
    );
    execute format('revoke insert, update, delete on public.%I from authenticated', t);
  end loop;
end $$;
