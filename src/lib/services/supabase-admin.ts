import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import { getSupabaseServiceRoleEnv } from '@/lib/env'

/**
 * Service-role Supabase client. Bypasses RLS entirely — never import this
 * in client components or expose its result to the browser.
 *
 * Scope of use is intentionally narrow: forcing a global sign-out after a
 * role change (so a demoted/promoted user can't keep using a stale JWT
 * for up to an hour), and admin user-management scripts (create/delete
 * user). Everything else — reading/writing content, progress, settings —
 * goes through the anon-key client and is governed by RLS.
 */
export function createSupabaseAdminClient() {
  const { url, serviceRoleKey } = getSupabaseServiceRoleEnv()
  return createClient<Database>(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
