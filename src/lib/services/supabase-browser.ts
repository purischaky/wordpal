import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'
import { getSupabasePublicEnv } from '@/lib/env'

/**
 * Creates a Supabase client for use in Client Components (browser-side).
 *
 * This client handles cookie management automatically via `document.cookie`.
 * It is configured as a singleton — multiple calls return the same instance.
 */
export function createSupabaseBrowserClient() {
  const { url, anonKey } = getSupabasePublicEnv()
  return createBrowserClient<Database>(url, anonKey)
}
