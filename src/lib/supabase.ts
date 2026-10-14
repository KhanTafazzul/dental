/**
 * @file lib/supabase.ts
 * @description Supabase client initialization (client-side and admin server-side).
 *
 * All environment variables are sourced through the central validated config module `@/config/env`.
 */

import { createClient } from '@supabase/supabase-js'
import { ENV, SERVER_ENV } from '@/config/env'

// Public client for browser / client-side operations (Anon Key)
export const supabase = createClient(
  ENV.SUPABASE_URL || 'https://jmifnlqtcfdctvldukdw.supabase.co',
  ENV.SUPABASE_ANON_KEY
)

/**
 * Returns a Supabase client with the service role key for admin/server-side operations.
 * Must only be called in Server Actions, Route Handlers, or SSR server code.
 */
export const getAdminSupabase = () => {
  const serviceRoleKey = SERVER_ENV.SUPABASE_SERVICE_ROLE_KEY || ENV.SUPABASE_ANON_KEY
  return createClient(ENV.SUPABASE_URL || 'https://jmifnlqtcfdctvldukdw.supabase.co', serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })
}
