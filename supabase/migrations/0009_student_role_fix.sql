-- ============================================================
-- WordPal: Student-only KPI metrics
--
-- get_kpi_metrics()'s "Total Students" / "Active Students" counted every
-- profile regardless of role, so an admin or instructor account inflated
-- the count and was indistinguishable from a real student in the metric.
-- Scope both to role = 'student' via user_roles, the same source of
-- truth every RLS policy already uses (public.app_role_of).
-- ============================================================

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

  select count(*) into v_total_students
    from public.profiles p
    join public.user_roles ur on ur.user_id = p.id
   where p.status = 'active' and ur.role = 'student';
  select count(*) into v_total_students_prev
    from public.profiles p
    join public.user_roles ur on ur.user_id = p.id
   where p.status = 'active' and ur.role = 'student' and p.created_at < now() - interval '7 days';

  select count(distinct ea.user_id) into v_active_7d
    from public.exercise_attempts ea
    join public.user_roles ur on ur.user_id = ea.user_id
   where ea.created_at >= now() - interval '7 days' and ur.role = 'student';
  select count(distinct ea.user_id) into v_active_prev7d
    from public.exercise_attempts ea
    join public.user_roles ur on ur.user_id = ea.user_id
   where ea.created_at >= now() - interval '14 days' and ea.created_at < now() - interval '7 days'
     and ur.role = 'student';

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
