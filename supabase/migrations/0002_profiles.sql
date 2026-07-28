-- ============================================================
-- WordPal: Profiles
--
-- Renamed from the old public.users to avoid confusion with auth.users.
-- ============================================================

create table public.profiles (
  id                       uuid primary key references auth.users(id) on delete cascade,
  email                    citext not null,
  display_name             text not null default '',
  avatar_url               text,
  cefr_level               text not null default 'A1'
    constraint profiles_cefr_check check (cefr_level in ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  status                   text not null default 'active'
    constraint profiles_status_check check (status in ('active', 'inactive', 'suspended')),
  current_learning_path_id uuid,          -- FK added in 0003_content.sql
  current_lesson_id        uuid,          -- FK added in 0003_content.sql
  total_xp                 integer not null default 0 check (total_xp >= 0),
  streak_current           integer not null default 0 check (streak_current >= 0),
  streak_longest           integer not null default 0 check (streak_longest >= 0),
  last_activity_date       date,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);
create index profiles_total_xp_idx on public.profiles (total_xp desc);
create index profiles_status_idx on public.profiles (status);

alter table public.profiles enable row level security;

create policy profiles_select_own on public.profiles
  for select to authenticated using (id = auth.uid());
create policy profiles_select_staff on public.profiles
  for select to authenticated using (public.is_staff());
create policy profiles_update_own on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- Mass-assignment closed at the database level: a student can only ever
-- touch these columns directly. Staff mutate other students exclusively
-- through admin_update_student() (0006_functions.sql), which is the
-- single allowlist for what staff may change on someone else's profile.
revoke update on public.profiles from authenticated;
grant update (display_name, avatar_url, current_lesson_id, current_learning_path_id)
  on public.profiles to authenticated;

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch
  before update on public.profiles
  for each row execute function public.touch_updated_at();
