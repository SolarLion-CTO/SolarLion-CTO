// /login — Google (Gmail) sign-in through Supabase. Redirects back here, then on to the page the user wanted.
import { useEffect, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import { takeReturnTo, useAuth } from '../auth/AuthProvider'
import { SHORT_DISCLAIMER } from './About'

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  )
}

export default function Login() {
  const { enabled, loading, session, signInWithGoogle } = useAuth()
  const loc = useLocation()
  const nav = useNavigate()
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const from = (loc.state as { from?: string } | null)?.from ?? '/'
  const urlError = new URLSearchParams(loc.search).get('error_description')

  useEffect(() => { if (session) nav(takeReturnTo() ?? from, { replace: true }) }, [session, from, nav])
  if (!enabled) return <Navigate to="/" replace />

  const go = async () => { setBusy(true); setErr(null); const e = await signInWithGoogle(from); if (e) { setErr(e); setBusy(false) } }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f2747] via-[#173a6b] to-[#2563eb] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-3xl font-extrabold tracking-tight text-[#0f2747]">CTO<span className="text-brand-600">360</span></div>
        <div className="text-sm font-semibold text-ink-2 mt-1">Enterprise Technology Control Tower</div>
        <p className="text-sm text-ink-3 mt-4 leading-relaxed">Sign in with your Google account to open the control tower, team workspaces and Decision Center.</p>
        <button onClick={go} disabled={busy || loading} className="mt-6 w-full flex items-center justify-center gap-3 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-ink hover:bg-slate-50 disabled:opacity-60">
          <GoogleMark />{busy ? 'Redirecting to Google…' : 'Continue with Google'}
        </button>
        {(err || urlError) && <p role="alert" className="mt-3 text-xs rounded-md bg-crit-bg text-crit-text px-3 py-2">{err || urlError}</p>}
        <div className="mt-6 flex gap-2 text-xs text-ink-3"><ShieldCheck size={14} className="shrink-0 mt-0.5 text-brand-600" /><span>Authentication by Supabase with Google OAuth. CTO360 only reads your name, email and profile picture.</span></div>
        <p className="mt-6 pt-4 border-t border-line text-[11px] text-ink-4 leading-relaxed">{SHORT_DISCLAIMER}</p>
      </div>
    </div>
  )
}
