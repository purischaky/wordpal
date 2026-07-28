/**
 * Centralized environment variable access.
 *
 * Reading through these helpers (instead of `process.env.X!`) means every
 * call site fails with a clear message instead of a silent `undefined`
 * reaching the Supabase client constructor.
 */

function normalize(value: string | undefined): string | undefined {
  return value && value !== 'your-supabase-url' ? value : undefined
}

// NEXT_PUBLIC_* vars must be read via a static `process.env.NEXT_PUBLIC_X`
// access — Next.js's bundler inlines them into the client bundle by
// pattern-matching that exact literal expression at build time. A dynamic
// `process.env[name]` lookup (e.g. through a `readEnv(name: string)`
// helper) can't be statically analyzed, so it silently resolves to
// `undefined` in the browser even though the same code works server-side
// (Node's real `process.env` supports dynamic access there).
export function isSupabaseConfigured(): boolean {
  return Boolean(
    normalize(process.env.NEXT_PUBLIC_SUPABASE_URL) && normalize(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  )
}

export function getSupabasePublicEnv(): { url: string; anonKey: string } {
  const url = normalize(process.env.NEXT_PUBLIC_SUPABASE_URL)
  const anonKey = normalize(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

  if (!url || !anonKey) {
    throw new Error(
      'Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (see .env.example).'
    )
  }

  return { url, anonKey }
}

export function getSupabaseServiceRoleEnv(): { url: string; serviceRoleKey: string } {
  const url = normalize(process.env.NEXT_PUBLIC_SUPABASE_URL)
  const serviceRoleKey = normalize(process.env.SUPABASE_SERVICE_ROLE_KEY)

  if (!url || !serviceRoleKey) {
    throw new Error(
      'Missing Supabase service-role environment variables. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (see .env.example).'
    )
  }

  return { url, serviceRoleKey }
}
