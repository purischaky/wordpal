-- ============================================================
-- WordPal: Notifications and platform settings
-- ============================================================

create table public.notifications (
  id          uuid primary key default gen_random_uuid(),
  type        text not null constraint notif_type_check
    check (type in ('registration', 'challenge_completion', 'system_error')),
  title       text not null check (length(title) between 1 and 120),
  description text not null default '' check (length(description) <= 120),
  context_url text not null default '/admin',
  subject_id  uuid,
  created_at  timestamptz not null default now()
);
create index notifications_created_idx on public.notifications(created_at desc);

-- isRead is now PER USER. The old model (a single global boolean in a
-- JSON file) was wrong the moment there was more than one admin: one
-- of them marking a notification read made it disappear for everyone.
create table public.notification_reads (
  notification_id uuid not null references public.notifications(id) on delete cascade,
  user_id         uuid not null references public.profiles(id) on delete cascade,
  read_at         timestamptz not null default now(),
  primary key (notification_id, user_id)
);

alter table public.notifications enable row level security;
alter table public.notification_reads enable row level security;

create policy notif_read_staff on public.notifications
  for select to authenticated using (public.is_staff());
create policy notif_delete_admin on public.notifications
  for delete to authenticated using (public.is_admin());
create policy nr_own on public.notification_reads
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Notifications are only ever inserted by triggers (e.g. handle_new_user)
-- running as SECURITY DEFINER, never directly by a client.
revoke insert, update on public.notifications from authenticated;

create table public.platform_settings (
  id            smallint primary key default 1 check (id = 1),
  brand         jsonb not null default '{"logoUrl":null,"themeColors":{"primary":"#FE669A","secondary":"#6366F1","accent":"#22C55E"},"language":"en"}'::jsonb,
  scoring       jsonb not null default '{"xpPerExercise":10,"xpPerLesson":50,"passingThreshold":70,"weightByExerciseType":{"multiple-choice":20,"fill-in-blank":20,"drag-and-drop":20,"sentence-ordering":20,"rewrite-sentence":10,"free-writing":10}}'::jsonb,
  notifications jsonb not null default '{"emailEnabled":true,"pushEnabled":false,"digestFrequency":"weekly"}'::jsonb,
  updated_by    uuid references auth.users(id) on delete set null,
  updated_at    timestamptz not null default now()
);
insert into public.platform_settings (id) values (1) on conflict do nothing;

alter table public.platform_settings enable row level security;
create policy ps_read on public.platform_settings
  for select to authenticated using (true);
create policy ps_write on public.platform_settings
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

create trigger platform_settings_touch before update on public.platform_settings
  for each row execute function public.touch_updated_at();
