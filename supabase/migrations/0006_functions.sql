-- ============================================================
-- WordPal: Triggers and RPC functions
--
-- All student-progress writes and all cross-student reads go through
-- the SECURITY DEFINER functions below. This keeps every allowlist
-- and every side-effect (XP grants, streaks, achievements) in exactly
-- one place instead of duplicated across route handlers.
-- ============================================================

-- ─── New user signup ────────────────────────────────────────────────
-- Public registration ALWAYS creates a 'student' role, ignoring
-- whatever the client sent in raw_user_meta_data.
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id, new.email,
    coalesce(nullif(new.raw_user_meta_data->>'display_name', ''), split_part(new.email, '@', 1))
  );

  insert into public.user_roles (user_id, role) values (new.id, 'student')
    on conflict (user_id) do nothing;

  insert into public.notifications (type, title, description, context_url, subject_id)
  values (
    'registration', 'New student registration',
    left(coalesce(new.raw_user_meta_data->>'display_name', new.email::text), 120),
    '/admin/students/' || new.id, new.id
  );

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── XP ledger ───────────────────────────────────────────────────────
-- xp_events is the only source of truth; profiles.total_xp is a
-- denormalized cache kept in sync by this trigger.
create or replace function public.apply_xp_event()
returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  update public.profiles
     set total_xp = greatest(0, total_xp + new.amount), updated_at = now()
   where id = new.user_id;
  return new;
end;
$$;

create trigger xp_events_apply
  after insert on public.xp_events
  for each row execute function public.apply_xp_event();

-- ─── Streaks ─────────────────────────────────────────────────────────
create or replace function public.touch_streak(p_user uuid)
returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_last  date;
  v_today date := (now() at time zone 'utc')::date;
begin
  select last_activity_date into v_last from public.profiles where id = p_user;

  if v_last is null or v_last < v_today - 1 then
    update public.profiles
       set streak_current = 1,
           streak_longest = greatest(streak_longest, 1),
           last_activity_date = v_today
     where id = p_user;
  elsif v_last = v_today - 1 then
    update public.profiles
       set streak_current = streak_current + 1,
           streak_longest = greatest(streak_longest, streak_current + 1),
           last_activity_date = v_today
     where id = p_user;
  end if;
  -- same day: no-op, already counted today
end;
$$;

-- ─── Achievements ────────────────────────────────────────────────────
create or replace function public.evaluate_achievements(p_user uuid)
returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_lessons_completed integer;
  v_exercises_completed integer;
  v_streak integer;
  v_avg_score numeric;
  v_challenges_passed integer;
  r record;
begin
  select count(*) into v_lessons_completed
    from public.user_lesson_progress where user_id = p_user and completed;

  select count(*) into v_exercises_completed
    from public.user_exercise_progress where user_id = p_user and completed;

  select streak_current into v_streak from public.profiles where id = p_user;

  select coalesce(avg(best_score), 0) into v_avg_score
    from public.user_exercise_progress where user_id = p_user and completed;

  select count(*) into v_challenges_passed
    from public.user_challenge_attempts where user_id = p_user and passed;

  for r in
    select * from public.achievements
     where is_active
       and id not in (select achievement_id from public.user_achievements where user_id = p_user)
  loop
    if (r.trigger_criteria = 'lessons_completed'   and v_lessons_completed   >= r.threshold_value)
    or (r.trigger_criteria = 'exercises_completed' and v_exercises_completed >= r.threshold_value)
    or (r.trigger_criteria = 'streak_days'         and v_streak              >= r.threshold_value)
    or (r.trigger_criteria = 'grammar_score'       and v_avg_score           >= r.threshold_value)
    or (r.trigger_criteria = 'challenge_passed'    and v_challenges_passed   >= r.threshold_value)
    then
      insert into public.user_achievements (user_id, achievement_id)
      values (p_user, r.id)
      on conflict do nothing;

      insert into public.xp_events (user_id, amount, source, source_id)
      values (p_user, r.xp_reward, 'achievement', r.id)
      on conflict do nothing;
    end if;
  end loop;
end;
$$;

-- ─── Exercise attempts (single write path for all student progress) ──
create or replace function public.record_exercise_attempt(
  p_exercise_id uuid,
  p_is_correct boolean,
  p_incorrect_categories text[] default '{}',
  p_duration_ms integer default null,
  p_submitted jsonb default null
) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_user uuid := auth.uid();
  v_lesson uuid;
  v_total int;
  v_done int;
  v_score smallint := case when p_is_correct then 100 else 0 end;
  v_xp_ex int;
  v_xp_les int;
  v_lesson_done boolean;
  v_was_done boolean;
begin
  if v_user is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  select e.lesson_id into v_lesson from public.exercises e where e.id = p_exercise_id;
  if v_lesson is null then
    raise exception 'Exercise not found or is not a lesson exercise' using errcode = 'P0002';
  end if;

  select (scoring->>'xpPerExercise')::int, (scoring->>'xpPerLesson')::int
    into v_xp_ex, v_xp_les
    from public.platform_settings where id = 1;
  -- Defensive default in case the singleton settings row was ever deleted:
  -- xp_events.amount is NOT NULL, so a null here would abort the whole attempt.
  v_xp_ex := coalesce(v_xp_ex, 10);
  v_xp_les := coalesce(v_xp_les, 50);

  insert into public.exercise_attempts
    (user_id, exercise_id, is_correct, score, submitted_answer, incorrect_categories, duration_ms)
  values (v_user, p_exercise_id, p_is_correct, v_score, p_submitted,
          coalesce(p_incorrect_categories, '{}'), p_duration_ms);

  select completed into v_was_done
    from public.user_exercise_progress
   where user_id = v_user and exercise_id = p_exercise_id;

  insert into public.user_exercise_progress as uep
    (user_id, exercise_id, best_score, completed, attempts, first_completed_at, last_attempt_at)
  values (v_user, p_exercise_id, v_score, p_is_correct, 1,
          case when p_is_correct then now() end, now())
  on conflict (user_id, exercise_id) do update set
    best_score = greatest(uep.best_score, excluded.best_score),
    completed  = uep.completed or excluded.completed,
    attempts   = uep.attempts + 1,
    first_completed_at = coalesce(uep.first_completed_at, excluded.first_completed_at),
    last_attempt_at = now();

  if p_is_correct and coalesce(v_was_done, false) = false then
    insert into public.xp_events (user_id, amount, source, source_id)
    values (v_user, v_xp_ex, 'exercise', p_exercise_id)
    on conflict do nothing;
  end if;

  select count(*) into v_total from public.exercises where lesson_id = v_lesson;
  select count(*) into v_done
    from public.user_exercise_progress uep
    join public.exercises e on e.id = uep.exercise_id
   where uep.user_id = v_user and e.lesson_id = v_lesson and uep.completed;
  v_lesson_done := v_total > 0 and v_done >= v_total;

  insert into public.user_lesson_progress as ulp
    (user_id, lesson_id, exercises_completed, exercises_total, completed, completed_at, updated_at)
  values (v_user, v_lesson, v_done, v_total, v_lesson_done,
          case when v_lesson_done then now() end, now())
  on conflict (user_id, lesson_id) do update set
    exercises_completed = excluded.exercises_completed,
    exercises_total     = excluded.exercises_total,
    completed           = ulp.completed or excluded.completed,
    completed_at        = coalesce(ulp.completed_at, excluded.completed_at),
    updated_at          = now();

  if v_lesson_done then
    insert into public.xp_events (user_id, amount, source, source_id)
    values (v_user, v_xp_les, 'lesson', v_lesson)
    on conflict do nothing;
  end if;

  perform public.touch_streak(v_user);
  perform public.evaluate_achievements(v_user);

  return jsonb_build_object(
    'lessonId', v_lesson,
    'lessonCompleted', v_lesson_done,
    'exercisesCompleted', v_done,
    'exercisesTotal', v_total,
    'totalXp', (select total_xp from public.profiles where id = v_user),
    'streak', (select streak_current from public.profiles where id = v_user)
  );
end;
$$;

revoke execute on function public.record_exercise_attempt(uuid, boolean, text[], integer, jsonb)
  from public, anon;
grant execute on function public.record_exercise_attempt(uuid, boolean, text[], integer, jsonb)
  to authenticated;

-- ─── Placement challenge attempts ────────────────────────────────────
create or replace function public.record_challenge_attempt(
  p_challenge_id uuid,
  p_correct_count integer,
  p_total_count integer
) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_user uuid := auth.uid();
  v_required int;
  v_passed boolean;
begin
  if v_user is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;
  if p_total_count < 1 or p_correct_count < 0 or p_correct_count > p_total_count then
    raise exception 'Invalid attempt counts' using errcode = '22023';
  end if;

  select required_correct into v_required
    from public.placement_challenges where id = p_challenge_id;
  if v_required is null then
    raise exception 'Challenge not found' using errcode = 'P0002';
  end if;

  v_passed := p_correct_count >= v_required;

  insert into public.user_challenge_attempts (user_id, challenge_id, correct_count, total_count, passed)
  values (v_user, p_challenge_id, p_correct_count, p_total_count, v_passed)
  -- The partial unique index (uca_user_passed_uniq) only guards duplicate
  -- PASSED rows; a failed re-attempt is always allowed to insert.
  on conflict (user_id, challenge_id) where passed do nothing;

  if v_passed then
    insert into public.xp_events (user_id, amount, source, source_id)
    values (v_user, 50, 'challenge', p_challenge_id)
    on conflict do nothing;
    perform public.evaluate_achievements(v_user);
  end if;

  return jsonb_build_object('passed', v_passed, 'requiredCorrect', v_required);
end;
$$;

revoke execute on function public.record_challenge_attempt(uuid, integer, integer) from public, anon;
grant execute on function public.record_challenge_attempt(uuid, integer, integer) to authenticated;

-- ─── Leaderboard ─────────────────────────────────────────────────────
-- Returns only display-safe columns — never email, matching the RLS
-- gap fixed from the old schema.sql (which let any authenticated user
-- read every profile's email via a blanket policy).
create or replace function public.get_leaderboard(p_limit integer default 50)
returns table (
  user_id uuid,
  display_name text,
  avatar_url text,
  total_xp integer,
  streak_current integer,
  rank bigint
)
language sql stable security definer set search_path = '' as $$
  select id, display_name, avatar_url, total_xp, streak_current,
         row_number() over (order by total_xp desc, id) as rank
    from public.profiles
   where status = 'active'
   order by total_xp desc, id
   limit greatest(1, least(p_limit, 200));
$$;

revoke execute on function public.get_leaderboard(integer) from public, anon;
grant execute on function public.get_leaderboard(integer) to authenticated;

-- ─── Admin: student profile detail ───────────────────────────────────
create or replace function public.get_student_profile(p_user uuid)
returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  v_caller public.app_role := public.app_role_of(auth.uid());
  v_result jsonb;
begin
  if v_caller not in ('admin', 'instructor') then
    raise exception 'Insufficient permissions' using errcode = '42501';
  end if;

  select jsonb_build_object(
    'id', p.id,
    'email', p.email,
    'displayName', p.display_name,
    'avatarUrl', p.avatar_url,
    'status', p.status,
    'cefrLevel', p.cefr_level,
    'role', public.app_role_of(p.id),
    'joinDate', p.created_at,
    'currentLearningPath', lp.title,
    'currentLesson', l.title,
    'placementResults', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', a.id, 'date', a.created_at, 'score',
        round(a.correct_count::numeric / a.total_count * 100),
        'result', case when a.passed then 'pass' else 'fail' end,
        'targetLevel', pc.target_level
      ) order by a.created_at desc)
      from public.user_challenge_attempts a
      join public.placement_challenges pc on pc.id = a.challenge_id
      where a.user_id = p.id
    ), '[]'::jsonb),
    'achievements', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', ach.id, 'badgeIcon', ach.badge_icon, 'title', ach.title, 'date', ua.unlocked_at
      ) order by ua.unlocked_at desc)
      from public.user_achievements ua
      join public.achievements ach on ach.id = ua.achievement_id
      where ua.user_id = p.id
    ), '[]'::jsonb),
    'timelineEvents', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', ulp.lesson_id, 'date', ulp.completed_at, 'type', 'lesson_completed',
        'title', 'Completed "' || l2.title || '"'
      ) order by ulp.completed_at desc)
      from public.user_lesson_progress ulp
      join public.lessons l2 on l2.id = ulp.lesson_id
      where ulp.user_id = p.id and ulp.completed
    ), '[]'::jsonb)
  ) into v_result
  from public.profiles p
  left join public.learning_paths lp on lp.id = p.current_learning_path_id
  left join public.lessons l on l.id = p.current_lesson_id
  where p.id = p_user;

  if v_result is null then
    raise exception 'Student not found' using errcode = 'P0002';
  end if;

  return v_result;
end;
$$;

revoke execute on function public.get_student_profile(uuid) from public, anon;
grant execute on function public.get_student_profile(uuid) to authenticated;

-- ─── Admin: KPI metrics ──────────────────────────────────────────────
create or replace function public.get_kpi_metrics()
returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  v_caller public.app_role := public.app_role_of(auth.uid());
  v_total_students int;
  v_active_7d int;
  v_completions_7d int;
  v_avg_score numeric;
begin
  if not (v_caller in ('admin', 'instructor', 'content_creator')) then
    raise exception 'Insufficient permissions' using errcode = '42501';
  end if;

  select count(*) into v_total_students from public.profiles where status = 'active';

  select count(*) into v_active_7d from public.profiles
   where last_activity_date >= (now() at time zone 'utc')::date - 7;

  select count(*) into v_completions_7d from public.user_lesson_progress
   where completed and completed_at >= now() - interval '7 days';

  select coalesce(avg(best_score), 0) into v_avg_score from public.user_exercise_progress
   where completed;

  return jsonb_build_object(
    'totalStudents', v_total_students,
    'activeStudents7d', v_active_7d,
    'lessonCompletions7d', v_completions_7d,
    'averageGrammarScore', round(v_avg_score, 1)
  );
end;
$$;

revoke execute on function public.get_kpi_metrics() from public, anon;
grant execute on function public.get_kpi_metrics() to authenticated;

-- ─── Admin: update a student (allowlist enforced in the database) ────
-- Replaces the {...existing, ...body} mass-assignment pattern from
-- src/app/api/admin/students/[id]/route.ts.
create or replace function public.admin_update_student(
  p_user uuid,
  p_status text default null,
  p_cefr_level text default null,
  p_display_name text default null,
  p_role public.app_role default null
) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_caller public.app_role := public.app_role_of(auth.uid());
begin
  if v_caller not in ('admin', 'instructor') then
    raise exception 'Insufficient permissions' using errcode = '42501';
  end if;
  if p_role is not null and v_caller <> 'admin' then
    raise exception 'Only administrators can change roles' using errcode = '42501';
  end if;

  update public.profiles set
    status = coalesce(p_status, status),
    cefr_level = coalesce(p_cefr_level, cefr_level),
    display_name = coalesce(p_display_name, display_name),
    updated_at = now()
   where id = p_user;

  if not found then
    raise exception 'Student not found' using errcode = 'P0002';
  end if;

  if p_role is not null then
    insert into public.user_roles (user_id, role, granted_by, granted_at)
    values (p_user, p_role, auth.uid(), now())
    on conflict (user_id) do update
      set role = excluded.role, granted_by = excluded.granted_by, granted_at = now();
  end if;

  return public.get_student_profile(p_user);
end;
$$;

revoke execute on function public.admin_update_student(uuid, text, text, text, public.app_role)
  from public, anon;
grant execute on function public.admin_update_student(uuid, text, text, text, public.app_role)
  to authenticated;
