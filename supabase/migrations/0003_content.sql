-- ============================================================
-- WordPal: Content hierarchy
--
-- learning_paths -> units -> lessons -> exercises, plus standalone
-- placement_challenges (whose exercises reuse the same `exercises`
-- table via challenge_id instead of lesson_id) and achievements.
--
-- Grammar blocks live inside exercises.content as JSONB rather than a
-- separate table: no query ever filters exercises by block, and
-- supabase-js has no client transactions, so a relational table would
-- mean non-atomic delete+insert writes on every edit. A CHECK
-- constraint (exercise_content_is_valid) enforces the per-type shape
-- in the database, mirroring src/lib/api/validators/exercises.ts.
-- ============================================================

create table public.learning_paths (
  id                 uuid primary key default gen_random_uuid(),
  legacy_id          text unique,
  title              text not null check (length(title) between 1 and 150),
  description        text not null default '' check (length(description) <= 500),
  target_level       text not null
    constraint lp_target_check check (target_level in ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  difficulty         text not null default 'Beginner'
    constraint lp_difficulty_check check (difficulty in ('Beginner', 'Intermediate', 'Advanced')),
  estimated_duration integer not null default 0 check (estimated_duration between 0 and 9999),
  xp_reward          integer not null default 0 check (xp_reward between 0 and 10000),
  status             text not null default 'draft'
    constraint lp_status_check check (status in ('draft', 'published')),
  created_by         uuid references auth.users(id) on delete set null,
  updated_by         uuid references auth.users(id) on delete set null,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index learning_paths_status_idx on public.learning_paths(status);
create trigger learning_paths_touch before update on public.learning_paths
  for each row execute function public.touch_updated_at();

create table public.units (
  id               uuid primary key default gen_random_uuid(),
  learning_path_id uuid not null references public.learning_paths(id) on delete cascade,
  legacy_id        text unique,
  title            text not null check (length(title) between 1 and 150),
  description      text not null default '' check (length(description) <= 500),
  position         integer not null check (position > 0),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint units_path_pos_key unique (learning_path_id, position) deferrable initially deferred
);
create index units_path_idx on public.units(learning_path_id, position);
create trigger units_touch before update on public.units
  for each row execute function public.touch_updated_at();

create table public.lessons (
  id                  uuid primary key default gen_random_uuid(),
  unit_id             uuid not null references public.units(id) on delete cascade,
  legacy_id           text unique,                          -- 'lesson-1' … (maps old localStorage keys)
  title               text not null check (length(title) between 1 and 150),
  description         text not null default '' check (length(description) <= 500),
  grammar_focus       text not null default '' check (length(grammar_focus) <= 100),
  cefr_level          text not null default 'A1'
    constraint lessons_cefr_check check (cefr_level in ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  path_level          text not null default 'beginner'
    constraint lessons_path_level_check check (path_level in ('beginner', 'intermediate', 'advanced')),
  icon                text not null default '📘',
  difficulty          smallint not null default 1 check (difficulty between 1 and 5),
  estimated_duration  integer not null default 0 check (estimated_duration between 0 and 180),
  learning_objectives text[] not null default '{}'
    check (coalesce(array_length(learning_objectives, 1), 0) <= 10),
  status              text not null default 'draft'
    constraint lessons_status_check check (status in ('draft', 'published', 'incomplete')),
  position            integer not null check (position > 0),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  constraint lessons_unit_pos_key unique (unit_id, position) deferrable initially deferred
);
create index lessons_unit_idx on public.lessons(unit_id, position);
create index lessons_status_idx on public.lessons(status);
create trigger lessons_touch before update on public.lessons
  for each row execute function public.touch_updated_at();

create table public.placement_challenges (
  id               uuid primary key default gen_random_uuid(),
  legacy_id        text unique,      -- 'challenge-beginner-to-intermediate'
  title            text not null check (length(title) between 1 and 150),
  description      text not null default '' check (length(description) <= 500),
  target_level     text not null
    constraint pc_target_check check (target_level in ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  from_level       text constraint pc_from_check
    check (from_level is null or from_level in ('beginner', 'intermediate')),
  to_level         text constraint pc_to_check
    check (to_level is null or to_level in ('intermediate', 'advanced')),
  grammar_topics   text[] not null default '{}',
  difficulty       smallint not null default 1 check (difficulty between 1 and 5),
  required_correct integer not null default 3 check (required_correct >= 1),
  status           text not null default 'draft'
    constraint pc_status_check check (status in ('draft', 'published')),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint pc_level_pair_check check ((from_level is null) = (to_level is null))
);
create trigger placement_challenges_touch before update on public.placement_challenges
  for each row execute function public.touch_updated_at();

-- Structural validation of `content` per exercise type — a database-level
-- defense mirroring src/lib/api/validators/exercises.ts, so not even a
-- service-role script can insert malformed exercise content.
create or replace function public.exercise_content_is_valid(p_type text, p_content jsonb)
returns boolean
language sql immutable as $$
  select case p_type
    when 'drag-and-drop' then
      jsonb_typeof(p_content->'targetSentence') = 'string'
      and jsonb_typeof(p_content->'blocks') = 'array'
      and jsonb_array_length(p_content->'blocks') between 2 and 15
      and not exists (
        select 1 from jsonb_array_elements(p_content->'blocks') b
         where jsonb_typeof(b->'label') <> 'string'
            or b->>'category' not in ('subject', 'verb', 'object', 'modifier',
                                      'time', 'place', 'connector', 'contrast')
            or jsonb_typeof(b->'isDistractor') <> 'boolean')
    when 'multiple-choice' then
      jsonb_typeof(p_content->'question') = 'string'
      and jsonb_typeof(p_content->'options') = 'array'
      and jsonb_array_length(p_content->'options') = 4
      and (p_content->>'correctIndex')::int between 0 and 3
    when 'sentence-ordering' then
      jsonb_typeof(p_content->'fragments') = 'array'
      and jsonb_array_length(p_content->'fragments') between 2 and 12
    when 'fill-in-blank' then
      jsonb_typeof(p_content->'sentence') = 'string'
      and jsonb_typeof(p_content->'answers') = 'array'
      and jsonb_array_length(p_content->'answers') between 1 and 10
    when 'rewrite-sentence' then
      jsonb_typeof(p_content->'originalSentence') = 'string'
      and jsonb_typeof(p_content->'instruction') = 'string'
      and jsonb_typeof(p_content->'acceptableAnswers') = 'array'
      and jsonb_array_length(p_content->'acceptableAnswers') between 1 and 5
    when 'free-writing' then
      jsonb_typeof(p_content->'prompt') = 'string'
    else false
  end;
$$;

create table public.exercises (
  id                uuid primary key default gen_random_uuid(),
  lesson_id         uuid references public.lessons(id) on delete cascade,
  challenge_id      uuid references public.placement_challenges(id) on delete cascade,
  legacy_id         text unique,
  type              text not null constraint exercises_type_check
    check (type in ('drag-and-drop', 'multiple-choice', 'sentence-ordering',
                    'fill-in-blank', 'rewrite-sentence', 'free-writing')),
  position          integer not null check (position > 0),
  status            text not null default 'draft'
    constraint exercises_status_check check (status in ('draft', 'published', 'incomplete')),
  hint              text not null default '' check (length(hint) <= 300),
  tutor_explanation text not null default '' check (length(tutor_explanation) <= 2000),
  content           jsonb not null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  constraint exercises_single_parent_check check ((lesson_id is null) <> (challenge_id is null)),
  constraint exercises_content_shape_check check (public.exercise_content_is_valid(type, content))
);
create index exercises_lesson_idx on public.exercises(lesson_id, position);
create index exercises_challenge_idx on public.exercises(challenge_id, position);
create index exercises_content_gin on public.exercises using gin (content jsonb_path_ops);
create trigger exercises_touch before update on public.exercises
  for each row execute function public.touch_updated_at();

create table public.achievements (
  id               uuid primary key default gen_random_uuid(),
  legacy_id        text unique,
  title            text not null check (length(title) between 1 and 100),
  description      text not null default '' check (length(description) <= 300),
  badge_icon       text not null default '🏅',
  xp_reward        integer not null default 0 check (xp_reward between 0 and 10000),
  trigger_criteria text not null constraint ach_trigger_check
    check (trigger_criteria in ('lessons_completed', 'streak_days', 'grammar_score',
                                'challenge_passed', 'exercises_completed')),
  threshold_value  integer not null check (threshold_value >= 1),
  is_active        boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create trigger achievements_touch before update on public.achievements
  for each row execute function public.touch_updated_at();

alter table public.profiles
  add constraint profiles_current_path_fk
    foreign key (current_learning_path_id) references public.learning_paths(id) on delete set null,
  add constraint profiles_current_lesson_fk
    foreign key (current_lesson_id) references public.lessons(id) on delete set null;

-- ─── Row-Level Security ───────────────────────────────────────────────
-- Same shape across the six tables: anyone authenticated can read
-- published content (or everything, if staff); only staff can write.
-- Publication cascades down the hierarchy via EXISTS subqueries.

alter table public.learning_paths       enable row level security;
alter table public.units                enable row level security;
alter table public.lessons              enable row level security;
alter table public.exercises            enable row level security;
alter table public.placement_challenges enable row level security;
alter table public.achievements         enable row level security;

create policy lp_read on public.learning_paths for select to authenticated
  using (status = 'published' or public.is_staff());
create policy lp_write on public.learning_paths for all to authenticated
  using (public.can_edit_content()) with check (public.can_edit_content());

create policy units_read on public.units for select to authenticated
  using (public.is_staff() or exists (
    select 1 from public.learning_paths lp
     where lp.id = units.learning_path_id and lp.status = 'published'));
create policy units_write on public.units for all to authenticated
  using (public.can_edit_content()) with check (public.can_edit_content());

create policy lessons_read on public.lessons for select to authenticated
  using (public.is_staff() or (status = 'published' and exists (
    select 1 from public.units u
      join public.learning_paths lp on lp.id = u.learning_path_id
     where u.id = lessons.unit_id and lp.status = 'published')));
create policy lessons_write on public.lessons for all to authenticated
  using (public.can_edit_content()) with check (public.can_edit_content());

create policy exercises_read on public.exercises for select to authenticated
  using (public.is_staff() or (status = 'published' and (
    exists (select 1 from public.lessons l
              join public.units u on u.id = l.unit_id
              join public.learning_paths lp on lp.id = u.learning_path_id
             where l.id = exercises.lesson_id and l.status = 'published' and lp.status = 'published')
    or exists (select 1 from public.placement_challenges c
                where c.id = exercises.challenge_id and c.status = 'published'))));
create policy exercises_write on public.exercises for all to authenticated
  using (public.can_edit_content()) with check (public.can_edit_content());

create policy pc_read on public.placement_challenges for select to authenticated
  using (status = 'published' or public.is_staff());
create policy pc_write on public.placement_challenges for all to authenticated
  using (public.can_edit_content()) with check (public.can_edit_content());

create policy ach_read on public.achievements for select to authenticated using (true);
create policy ach_write on public.achievements for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
