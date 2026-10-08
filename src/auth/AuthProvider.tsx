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

// One row in public.login_events per browser session (SIGNED_IN can re-fire on tab focus).
function recordSignIn(s: Session) {
  if (!supabase) return
  const key = `cto360.logged.${s.user.id}`
  try { if (sessionStorage.getItem(key)) return; sessionStorage.setItem(key, '1') } catch { /* storage blocked: log anyway */ }
  const u = displayUser(s.user)
  // Deferred so it does not run inside the auth callback; failures (e.g. table not created yet) are ignored.
  setTimeout(() => {
    void supabase!.from('login_events').insert({
      email: u.email.toLowerCase(), full_name: u.name, avatar_url: u.avatar || null,
      provider: (s.user.app_metadata?.provider as string | undefined) ?? 'google', user_agent: navigator.userAgent.slice(0, 300),
    }).then(({ error }) => { if (error) console.warn('Sign-in log not written:', error.message) })
  }, 0)
}
const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(authEnabled)

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false) })
    const { data } = supabase.auth.onAuthStateChange((e, s) => {
      setSession(s); setLoading(false)
      if (e === 'SIGNED_IN' && s) recordSignIn(s)
    })
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

  const signOut = async () => {
    if (!supabase) return
    try { if (session) sessionStorage.removeItem(`cto360.logged.${session.user.id}`) } catch { /* ignore */ }
    await supabase.auth.signOut()
  }

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
