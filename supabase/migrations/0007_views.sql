-- ============================================================
-- WordPal: Admin aggregation views
--
-- Every view below is declared `security_invoker = true`. Without it,
-- a view runs with the privileges of its OWNER (the migration role,
-- effectively superuser) and silently bypasses the caller's RLS —
-- turning a read-only convenience view into a data leak. This is a
-- Postgres 15+ feature; Supabase's managed Postgres satisfies it.
-- ============================================================

create or replace view public.admin_lesson_rows
with (security_invoker = true) as
select
  l.*,
  u.learning_path_id,
  (select count(*) from public.exercises e where e.lesson_id = l.id) as exercise_count
from public.lessons l
join public.units u on u.id = l.unit_id;

create or replace view public.admin_learning_path_rows
with (security_invoker = true) as
select
  lp.*,
  (select count(*) from public.units u where u.learning_path_id = lp.id) as unit_count,
  (select count(*)
     from public.lessons l
     join public.units u on u.id = l.unit_id
    where u.learning_path_id = lp.id) as lesson_count
from public.learning_paths lp;

create or replace view public.admin_placement_challenge_rows
with (security_invoker = true) as
select
  pc.*,
  (select count(*) from public.exercises e where e.challenge_id = pc.id) as question_count
from public.placement_challenges pc;

create or replace view public.admin_student_rows
with (security_invoker = true) as
select
  p.id,
  p.avatar_url,
  p.display_name as name,
  p.email,
  public.app_role_of(p.id) as role,
  p.cefr_level,
  l.title as current_lesson,
  round(coalesce((
    select avg(best_score) from public.user_exercise_progress uep
     where uep.user_id = p.id and uep.completed
  ), 0)) as grammar_score,
  case
    when lp.id is null then 0
    else round(100.0 * (
      select count(*) from public.user_lesson_progress ulp
        join public.lessons l2 on l2.id = ulp.lesson_id
        join public.units u2 on u2.id = l2.unit_id
       where ulp.user_id = p.id and u2.learning_path_id = lp.id and ulp.completed
    ) / greatest(1, (
      select count(*) from public.lessons l3
        join public.units u3 on u3.id = l3.unit_id
       where u3.learning_path_id = lp.id
    )))
  end as progress_percentage,
  p.status,
  p.last_activity_date as last_active_at
from public.profiles p
left join public.lessons l on l.id = p.current_lesson_id
left join public.learning_paths lp on lp.id = p.current_learning_path_id;

-- These views run as their querying user (security_invoker), so access
-- is already bounded by the base tables' RLS: admin_student_rows only
-- surfaces rows a staff member's profiles_select_staff policy allows,
-- and the content views only surface what lp_read/lessons_read allow.
-- No additional grants are required beyond the default PUBLIC select
-- on views, which Postgres still filters through each view's owner
-- policies at invoker time.

