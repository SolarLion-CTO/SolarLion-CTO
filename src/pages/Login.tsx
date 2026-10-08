// /login — Google (Gmail) sign-in through Supabase. Redirects back here, then on to the page the user wanted.
import { useEffect, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Lock, Radar, ShieldCheck, Target } from 'lucide-react'
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
    <div className="min-h-screen grid lg:grid-cols-[1.1fr_1fr] bg-white">
      {/* Brand panel */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0b1d38] via-[#0f2747] to-[#1d4ed8] text-white px-6 py-8 sm:px-10 lg:px-14 lg:py-12 flex flex-col">
        <svg className="absolute -right-24 -bottom-24 w-[520px] h-[520px] opacity-[0.12] pointer-events-none" viewBox="0 0 200 200" aria-hidden>
          <circle cx="100" cy="100" r="96" fill="none" stroke="white" strokeWidth="0.6" />
          <circle cx="100" cy="100" r="68" fill="none" stroke="white" strokeWidth="0.6" />
          <circle cx="100" cy="100" r="40" fill="none" stroke="white" strokeWidth="0.6" />
          {Array.from({ length: 7 }, (_, i) => { const a = (i / 7) * Math.PI * 2; return <circle key={i} cx={100 + Math.cos(a) * 96} cy={100 + Math.sin(a) * 96} r="3" fill="white" /> })}
        </svg>
        <div className="text-2xl font-extrabold tracking-tight">CTO<span className="text-[#86b6ef]">360</span></div>
        <div className="text-[13px] text-slate-300 mt-0.5">Enterprise Technology Control Tower</div>
        <div className="mt-8 lg:mt-auto lg:mb-auto max-w-lg">
          <h1 className="text-2xl sm:text-3xl lg:text-[2.6rem] font-bold leading-tight">One view. Connected decisions. Measurable technology outcomes.</h1>
          <p className="hidden sm:block text-slate-300 mt-4 text-[15px] leading-relaxed">The decision layer for technology leaders: signals from every source system, prioritised into decisions that are owned, actioned and measured.</p>
          <ul className="hidden lg:block mt-8 space-y-4">
            {[
              [Radar, 'Enterprise-wide visibility', '3 business units, 7 source systems and 16 functions on one scale'],
              [Target, 'Decision intelligence', 'A prioritised Top 10 with evidence, owners and measured outcomes'],
              [ShieldCheck, 'Governed AI', 'AI recommends, humans decide, with a full audit trail'],
            ].map(([Icon, t, d]) => { const I = Icon as typeof Radar; return (
              <li key={t as string} className="flex gap-3">
                <span className="w-9 h-9 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center shrink-0"><I size={17} /></span>
                <span><span className="block font-semibold text-[15px]">{t as string}</span><span className="block text-sm text-slate-300">{d as string}</span></span>
              </li>
            ) })}
          </ul>
        </div>
        <div className="hidden lg:block text-xs text-slate-400">© 2026 CTO360 · Capstone programme</div>
      </section>

      {/* Sign-in panel */}
      <section className="flex flex-col px-6 py-10 sm:px-10 lg:px-16">
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-sm">
            <h2 className="text-2xl font-bold text-ink">Sign in</h2>
            <p className="text-sm text-ink-3 mt-1.5">Welcome back. Continue with your Google account to access your workspace.</p>
            <button onClick={go} disabled={busy || loading} className="mt-8 w-full h-11 flex items-center justify-center gap-3 rounded-lg border border-slate-300 bg-white text-sm font-semibold text-ink shadow-sm hover:bg-slate-50 hover:border-slate-400 transition disabled:opacity-60">
              <GoogleMark />{busy ? 'Redirecting to Google…' : 'Continue with Google'}
            </button>
            {(err || urlError) && <p role="alert" className="mt-3 text-xs rounded-md bg-crit-bg text-crit-text px-3 py-2">{err || urlError}</p>}
            <div className="mt-8 flex items-center gap-3 text-[11px] uppercase tracking-wider text-ink-4"><span className="h-px flex-1 bg-line" />Secure single sign-on<span className="h-px flex-1 bg-line" /></div>
            <div className="mt-4 flex items-start gap-2.5 text-xs text-ink-3 leading-relaxed">
              <Lock size={14} className="shrink-0 mt-0.5 text-brand-600" />
              <span>Protected by Google single sign-on. Your session is encrypted, and you can sign out at any time.</span>
            </div>
          </div>
        </div>
        <p className="text-[11px] text-ink-4 leading-relaxed max-w-md mx-auto text-center mt-10">{SHORT_DISCLAIMER}</p>
      </section>
    </div>
  )
}
