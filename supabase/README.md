# Supabase setup

## Apply the schema

```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase db push          # applies migrations/0001..0007 in order
```

Or, against a local Supabase instance (`npx supabase start`, requires Docker):

```bash
npx supabase db reset         # drops, recreates, migrates, then runs seed.sql
```

## Seed data

`seed.sql` is a **generated file** — regenerate it after changing the source
content, don't hand-edit it:

```bash
node scripts/generate-seed.mjs
```

Source of truth: `src/data/learning-path.ts` (7 lessons, Spanish tutor
explanations) and `src/data/placement-challenges.ts` (2 placement
challenges). The seed is idempotent via `legacy_id`, safe to re-run.

## Create the first admin user

Registration through `/auth/register` always creates a `student` (enforced
by the `handle_new_user` trigger). Promote the first admin manually after
they sign up:

```sql
update public.user_roles set role = 'admin', granted_by = user_id
where user_id = '<the user''s auth.users id>';
```

## Regenerating TypeScript types

`src/types/database.ts` is hand-written to match the migrations. Once the
project is linked, regenerate and diff before overwriting:

```bash
npx supabase gen types typescript --linked > /tmp/database.generated.ts
diff src/types/database.ts /tmp/database.generated.ts
```

## Required Supabase Auth setting

No special dashboard configuration is required for roles — they ride in
`app_metadata`, which Supabase automatically includes in every JWT once
`public.user_roles` is populated (see `0001_roles.sql`).
