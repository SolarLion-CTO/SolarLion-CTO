// Supabase client for Google (Gmail) sign-in. Configured through Vite env vars:
//   VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY  (see .env.example)
// If either is missing, auth is disabled and the site stays open (demo-safe).
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const supabase: SupabaseClient | null = url && key
  ? createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'pkce' } })
  : null

export const authEnabled = supabase !== null
