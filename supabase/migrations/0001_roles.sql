-- ============================================================
-- WordPal: Roles
--
-- public.user_roles is the single source of truth for authorization.
-- A trigger mirrors the role into auth.users.raw_app_meta_data, which
-- Supabase automatically includes in every issued JWT as
-- `app_metadata.role`. raw_app_meta_data can only be written by
-- service_role, so a user can never grant themselves a role — unlike
-- raw_user_meta_data, which the client SDK lets a signed-in user edit.
--
-- The proxy (Next.js) reads app_metadata.role from the JWT for a fast,
-- read-only check with zero database round-trips. RLS policies never
-- trust the JWT directly: they call public.app_role_of(), which queries
-- this table, so a stale or forged token can never grant real access.
-- ============================================================

create extension if not exists pgcrypto;
create extension if not exists citext;

create type public.app_role as enum ('admin', 'instructor', 'content_creator', 'student');

create table public.user_roles (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  role       public.app_role not null default 'student',
  granted_by uuid references auth.users(id) on delete set null,
  granted_at timestamptz not null default now()
);
create index user_roles_role_idx on public.user_roles(role);
alter table public.user_roles enable row level security;

-- Authoritative role lookup. SECURITY DEFINER so RLS policies on OTHER
-- tables can call it without recursing into user_roles' own policies.
create or replace function public.app_role_of(p_user uuid)
returns public.app_role
language sql stable security definer set search_path = '' as $$
  select ur.role from public.user_roles ur where ur.user_id = p_user;
$$;

create or replace function public.my_role() returns public.app_role
language sql stable as $$
  select public.app_role_of(auth.uid());
$$;

create or replace function public.is_staff() returns boolean language sql stable as $$
  select public.my_role() in ('admin', 'instructor', 'content_creator');
$$;

create or replace function public.is_admin() returns boolean language sql stable as $$
  select public.my_role() = 'admin';
$$;

create or replace function public.can_edit_content() returns boolean language sql stable as $$
  select public.my_role() in ('admin', 'instructor', 'content_creator');
$$;

create or replace function public.can_manage_students() returns boolean language sql stable as $$
  select public.my_role() in ('admin', 'instructor');
$$;

create policy user_roles_select_own on public.user_roles
  for select to authenticated using (user_id = auth.uid());
create policy user_roles_select_staff on public.user_roles
  for select to authenticated using (public.is_staff());
create policy user_roles_admin_write on public.user_roles
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Mirrors the role to app_metadata so it lands in the JWT. Only this
-- SECURITY DEFINER trigger can write raw_app_meta_data — never the client.
create or replace function public.sync_role_to_app_metadata()
returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  update auth.users
     set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
                             || jsonb_build_object('role', new.role::text)
   where id = new.user_id;
  return new;
end;
$$;

create trigger user_roles_sync_jwt
  after insert or update of role on public.user_roles
  for each row execute function public.sync_role_to_app_metadata();

-- Guards against self-escalation (granted_by must not equal the target
-- user, except for the very first role a user gets via handle_new_user)
-- and against demoting the last remaining admin.
create or replace function public.guard_user_roles()
returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  v_admin_count integer;
begin
  if tg_op = 'UPDATE' and old.role = 'admin' and new.role <> 'admin' then
    select count(*) into v_admin_count from public.user_roles where role = 'admin';
    if v_admin_count <= 1 then
      raise exception 'Cannot remove the last remaining admin' using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

create trigger user_roles_guard
  before update of role on public.user_roles
  for each row execute function public.guard_user_roles();
