-- ============================================================
-- WordPal: Real analytics + student activity tracking
--
-- Fixes three gaps found by manual QA of the admin dashboard:
--   1. profiles.current_lesson_id / current_learning_path_id were never
--      written anywhere, so "current lesson" always showed empty on the
--      student list and profile pages.
--   2. get_kpi_metrics() returned a flat jsonb OBJECT, but the dashboard
--      expects a jsonb ARRAY of {id,title,value,changePercentage,
--      trendDirection,period} — a hard TypeError on every /admin load.
--   3. /admin/analytics had no backing query at all (client-side
--      Math.random()). get_analytics_data() replaces it with real
--      aggregates over exercise_attempts / user_lesson_progress /
--      user_challenge_attempts, which were already being recorded.
-- ============================================================

-- ─── 1. Track "current lesson" as the student progresses ─────────────
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
  v_learning_path uuid;
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

  select e.lesson_id, u.learning_path_id into v_lesson, v_learning_path
    from public.exercises e
    join public.lessons l on l.id = e.lesson_id
    join public.units u on u.id = l.unit_id
   where e.id = p_exercise_id;
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

  -- Reflects "where the student currently is", updated on every attempt
  -- (not just completion) so admins see live progress, not just history.
  update public.profiles
     set current_lesson_id = v_lesson,
         current_learning_path_id = v_learning_path,
         updated_at = now()
   where id = v_user;

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

-- ─── 2. Student profile: expose XP/streak/last-activity ───────────────
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
    'totalXp', p.total_xp,
    'streakCurrent', p.streak_current,
    'streakLongest', p.streak_longest,
    'lastActivityDate', p.last_activity_date,
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

-- ─── 3. KPI metrics: return an ARRAY, each with a real period-over-period trend ──
create or replace function public.pct_change(v_current numeric, v_previous numeric)
returns numeric
language sql immutable as $$
  select case when v_previous is null or v_previous = 0 then 0
              else round(((v_current - v_previous) / abs(v_previous)) * 100, 1)
         end;
$$;

create or replace function public.get_kpi_metrics()
returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  v_caller public.app_role := public.app_role_of(auth.uid());

  v_total_students int;
  v_total_students_prev int;

  v_active_7d int;
  v_active_prev7d int;

  v_completions_7d int;
  v_completions_prev7d int;

  v_avg_score numeric;
  v_avg_score_prev numeric;

  v_pass_rate numeric;
  v_pass_rate_prev numeric;

  v_dau_today int;
  v_dau_yesterday int;
begin
  if not (v_caller in ('admin', 'instructor', 'content_creator')) then
    raise exception 'Insufficient permissions' using errcode = '42501';
  end if;

  select count(*) into v_total_students from public.profiles where status = 'active';
  select count(*) into v_total_students_prev from public.profiles
   where status = 'active' and created_at < now() - interval '7 days';

  select count(distinct user_id) into v_active_7d from public.exercise_attempts
   where created_at >= now() - interval '7 days';
  select count(distinct user_id) into v_active_prev7d from public.exercise_attempts
   where created_at >= now() - interval '14 days' and created_at < now() - interval '7 days';

  select count(*) into v_completions_7d from public.user_lesson_progress
   where completed and completed_at >= now() - interval '7 days';
  select count(*) into v_completions_prev7d from public.user_lesson_progress
   where completed and completed_at >= now() - interval '14 days' and completed_at < now() - interval '7 days';

  select coalesce(avg(score), 0) into v_avg_score from public.exercise_attempts
   where created_at >= now() - interval '7 days';
  select coalesce(avg(score), 0) into v_avg_score_prev from public.exercise_attempts
   where created_at >= now() - interval '14 days' and created_at < now() - interval '7 days';

  select coalesce(100.0 * count(*) filter (where passed) / nullif(count(*), 0), 0) into v_pass_rate
    from public.user_challenge_attempts where created_at >= now() - interval '30 days';
  select coalesce(100.0 * count(*) filter (where passed) / nullif(count(*), 0), 0) into v_pass_rate_prev
    from public.user_challenge_attempts
   where created_at >= now() - interval '60 days' and created_at < now() - interval '30 days';

  select count(distinct user_id) into v_dau_today from public.exercise_attempts
   where created_at >= (now() at time zone 'utc')::date;
  select count(distinct user_id) into v_dau_yesterday from public.exercise_attempts
   where created_at >= (now() at time zone 'utc')::date - 1 and created_at < (now() at time zone 'utc')::date;

  return jsonb_build_array(
    jsonb_build_object(
      'id', 'total-students', 'title', 'Total Students', 'value', v_total_students,
      'changePercentage', public.pct_change(v_total_students, v_total_students_prev),
      'trendDirection', case when v_total_students >= v_total_students_prev then 'up' else 'down' end,
      'period', 'all time'
    ),
    jsonb_build_object(
      'id', 'active-students-7d', 'title', 'Active Students', 'value', v_active_7d,
      'changePercentage', public.pct_change(v_active_7d, v_active_prev7d),
      'trendDirection', case when v_active_7d >= v_active_prev7d then 'up' else 'down' end,
      'period', 'last 7 days'
    ),
    jsonb_build_object(
      'id', 'lessons-completed-7d', 'title', 'Lessons Completed', 'value', v_completions_7d,
      'changePercentage', public.pct_change(v_completions_7d, v_completions_prev7d),
      'trendDirection', case when v_completions_7d >= v_completions_prev7d then 'up' else 'down' end,
      'period', 'last 7 days'
    ),
    jsonb_build_object(
      'id', 'avg-grammar-score', 'title', 'Avg Grammar Score', 'value', round(v_avg_score, 1),
      'changePercentage', public.pct_change(v_avg_score, v_avg_score_prev),
      'trendDirection', case when v_avg_score >= v_avg_score_prev then 'up' else 'down' end,
      'period', 'last 7 days'
    ),
    jsonb_build_object(
      'id', 'placement-success-rate', 'title', 'Challenge Pass Rate', 'value', round(v_pass_rate, 1),
      'changePercentage', public.pct_change(v_pass_rate, v_pass_rate_prev),
      'trendDirection', case when v_pass_rate >= v_pass_rate_prev then 'up' else 'down' end,
      'period', 'last 30 days'
    ),
    jsonb_build_object(
      'id', 'daily-active-users', 'title', 'Daily Active Users', 'value', v_dau_today,
      'changePercentage', public.pct_change(v_dau_today, v_dau_yesterday),
      'trendDirection', case when v_dau_today >= v_dau_yesterday then 'up' else 'down' end,
      'period', 'today'
    )
  );
end;
$$;

-- ─── 4. Analytics page: real aggregates for every chart, over [p_start, p_end] ──
create or replace function public.get_analytics_data(p_start timestamptz, p_end timestamptz)
returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  v_caller public.app_role := public.app_role_of(auth.uid());
  v_result jsonb;
begin
  if not (v_caller in ('admin', 'instructor')) then
    raise exception 'Insufficient permissions' using errcode = '42501';
  end if;

  select jsonb_build_object(
    -- Cumulative active students by day (line)
    'studentGrowth', coalesce((
      select jsonb_agg(jsonb_build_object('label', to_char(d, 'MM/DD'), 'value', cnt, 'date', d::text) order by d)
      from (
        select d::date as d,
               (select count(*) from public.profiles p where p.status = 'active' and p.created_at::date <= d::date) as cnt
          from generate_series(p_start::date, p_end::date, interval '1 day') d
      ) s
    ), '[]'::jsonb),

    -- Completion rate by CEFR level (bar)
    'lessonCompletion', coalesce((
      select jsonb_agg(jsonb_build_object('label', lvl, 'value', pct) order by lvl)
      from (
        select l.cefr_level as lvl,
               round(100.0 * count(*) filter (where ulp.completed) / greatest(1, count(*))) as pct
          from public.user_lesson_progress ulp
          join public.lessons l on l.id = ulp.lesson_id
         where ulp.updated_at between p_start and p_end
         group by l.cefr_level
      ) s
    ), '[]'::jsonb),

    -- Grammar error distribution by block category (pie)
    'grammarErrors', coalesce((
      select jsonb_agg(jsonb_build_object('label', cat, 'value', cnt, 'category', cat) order by cnt desc)
      from (
        select unnest(incorrect_categories) as cat, count(*) as cnt
          from public.exercise_attempts
         where created_at between p_start and p_end
         group by cat
      ) s
    ), '[]'::jsonb),

    -- Lessons with the highest error rate = where students get stuck (bar)
    'difficultLessons', coalesce((
      select jsonb_agg(jsonb_build_object('label', title, 'value', error_rate) order by error_rate desc)
      from (
        select l.title,
               round(100.0 * count(*) filter (where not ea.is_correct) / count(*)) as error_rate
          from public.exercise_attempts ea
          join public.exercises e on e.id = ea.exercise_id
          join public.lessons l on l.id = e.lesson_id
         where ea.created_at between p_start and p_end
         group by l.id, l.title
        having count(*) >= 3
         order by error_rate desc
         limit 7
      ) s
    ), '[]'::jsonb),

    -- Average correctness score trend by day (line)
    'grammarScoreTrend', coalesce((
      select jsonb_agg(jsonb_build_object('label', to_char(d, 'MM/DD'), 'value', avg_score, 'date', d::text) order by d)
      from (
        select d::date as d,
               round(coalesce((select avg(score) from public.exercise_attempts ea where ea.created_at::date = d::date), 0)) as avg_score
          from generate_series(p_start::date, p_end::date, interval '1 day') d
      ) s
    ), '[]'::jsonb),

    -- Placement challenge pass rate by target CEFR level (bar)
    'challengePassRate', coalesce((
      select jsonb_agg(jsonb_build_object('label', lvl, 'value', pct) order by lvl)
      from (
        select pc.target_level as lvl,
               round(100.0 * count(*) filter (where uca.passed) / greatest(1, count(*))) as pct
          from public.user_challenge_attempts uca
          join public.placement_challenges pc on pc.id = uca.challenge_id
         where uca.created_at between p_start and p_end
         group by pc.target_level
      ) s
    ), '[]'::jsonb),

    -- % of active students with any attempt that day (area) — activity retention proxy
    'studentRetention', coalesce((
      select jsonb_agg(jsonb_build_object('label', to_char(d, 'MM/DD'), 'value', pct, 'date', d::text) order by d)
      from (
        select d::date as d,
               round(100.0 * (select count(distinct user_id) from public.exercise_attempts ea where ea.created_at::date = d::date)
                     / greatest(1, (select count(*) from public.profiles p where p.status = 'active' and p.created_at::date <= d::date))) as pct
          from generate_series(p_start::date, p_end::date, interval '1 day') d
      ) s
    ), '[]'::jsonb),

    -- Distinct active users per day (area)
    'dailyActiveUsers', coalesce((
      select jsonb_agg(jsonb_build_object('label', to_char(d, 'MM/DD'), 'value', cnt, 'date', d::text) order by d)
      from (
        select d::date as d,
               (select count(distinct user_id) from public.exercise_attempts ea where ea.created_at::date = d::date) as cnt
          from generate_series(p_start::date, p_end::date, interval '1 day') d
      ) s
    ), '[]'::jsonb),

    -- Activity heatmap: day-of-week x hour (grid)
    'heatmap', coalesce((
      select jsonb_agg(jsonb_build_object('label', dow_label || '-' || hr, 'value', cnt, 'category', dow_label))
      from (
        select (array['Sun','Mon','Tue','Wed','Thu','Fri','Sat'])[extract(dow from created_at)::int + 1] as dow_label,
               extract(hour from created_at)::int as hr,
               count(*) as cnt
          from public.exercise_attempts
         where created_at between p_start and p_end
         group by dow_label, hr
      ) s
    ), '[]'::jsonb)
  ) into v_result;

  return v_result;
end;
$$;

revoke execute on function public.get_kpi_metrics() from public, anon;
grant execute on function public.get_kpi_metrics() to authenticated;
revoke execute on function public.get_analytics_data(timestamptz, timestamptz) from public, anon;
grant execute on function public.get_analytics_data(timestamptz, timestamptz) to authenticated;
