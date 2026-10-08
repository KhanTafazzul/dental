import { createClient } from '@supabase/supabase-js'

// Safe defaults for Vercel deployment & production client operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jmifnlqtcfdctvldukdw.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptaWZubHF0Y2ZkY3R2bGR1a2R3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5MTAyMjIsImV4cCI6MjA5ODQ4NjIyMn0.zXLzoVaIKDnpSa-rW8wTWhlSefysJOCq4GoiUHhROK8'

// Public client for client-side operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey)  

// Server-side admin client using service role key
export const getAdminSupabase = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-role-key'
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  })
}
