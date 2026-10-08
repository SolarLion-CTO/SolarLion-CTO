// Session state for the whole app, plus the route guard used around the main layout.
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import type { Session, User } from '@supabase/supabase-js'
import { authEnabled, supabase } from './supabase'

interface AuthState {
  enabled: boolean
  loading: boolean
  session: Session | null
  user: User | null
  signInWithGoogle: (returnTo?: string) => Promise<string | null>
  signOut: () => Promise<void>
}

const RETURN_KEY = 'cto360.returnTo'
const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(authEnabled)

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false) })
    const { data } = supabase.auth.onAuthStateChange((_e, s) => { setSession(s); setLoading(false) })
    return () => data.subscription.unsubscribe()
  }, [])

  const signInWithGoogle = async (returnTo?: string) => {
    if (!supabase) return 'Sign-in is not configured.'
    try { if (returnTo) sessionStorage.setItem(RETURN_KEY, returnTo) } catch { /* storage blocked */ }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/login`, queryParams: { prompt: 'select_account' } },
    })
    return error ? error.message : null
  }

  const signOut = async () => { if (supabase) await supabase.auth.signOut() }

  return (
    <AuthContext.Provider value={{ enabled: authEnabled, loading, session, user: session?.user ?? null, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

export function takeReturnTo() {
  try { const v = sessionStorage.getItem(RETURN_KEY); sessionStorage.removeItem(RETURN_KEY); return v } catch { return null }
}

// Wraps protected routes: open when auth is not configured, otherwise requires a session.
export function RequireAuth({ children }: { children: ReactNode }) {
  const { enabled, loading, session } = useAuth()
  const loc = useLocation()
  if (!enabled) return <>{children}</>
  if (loading) return <div className="min-h-screen flex items-center justify-center text-sm text-ink-3">Checking sign-in…</div>
  if (!session) return <Navigate to="/login" replace state={{ from: loc.pathname + loc.search }} />
  return <>{children}</>
}

export function displayUser(user: User | null) {
  const m = (user?.user_metadata ?? {}) as { full_name?: string; name?: string; avatar_url?: string; picture?: string }
  const name = m.full_name || m.name || user?.email?.split('@')[0] || 'Signed in'
  return { name, email: user?.email ?? '', avatar: m.avatar_url || m.picture || '' }
}
