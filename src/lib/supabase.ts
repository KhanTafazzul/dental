/**
 * @file lib/supabase.ts
 * @description Supabase client initialization (client-side and admin server-side).
 *
 * All environment variables are sourced through the central validated config module `@/config/env`.
 */

import { createClient } from '@supabase/supabase-js'
import { ENV, SERVER_ENV } from '@/config/env'

const configuredUrl = ENV.SUPABASE_URL
const configuredAnonKey = ENV.SUPABASE_ANON_KEY

if ((configuredUrl && !configuredAnonKey) || (!configuredUrl && configuredAnonKey)) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be configured together.')
}

const DEFAULT_SUPABASE_URL = 'https://jmifnlqtcfdctvldukdw.supabase.co'
const DEFAULT_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptaWZubHF0Y2ZkY3R2bGR1a2R3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5MTAyMjIsImV4cCI6MjA5ODQ4NjIyMn0.zXLzoVaIKDnpSa-rW8wTWhlSefysJOCq4GoiUHhROK8'

const supabaseUrl = configuredUrl || DEFAULT_SUPABASE_URL
const supabaseAnonKey = configuredAnonKey || DEFAULT_ANON_KEY

// Public client for browser / client-side operations (Anon Key)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Returns a Supabase client with the service role key for admin/server-side operations.
 * Must only be called in Server Actions, Route Handlers, or SSR server code.
 */
export const getAdminSupabase = () => {
  const serviceRoleKey = SERVER_ENV.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })
}
