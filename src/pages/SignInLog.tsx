// /admin/sign-ins — who signed in with Google and when. Reads public.login_events (supabase/login_events.sql).
// Row Level Security decides what comes back: admins (public.app_admins) see everyone, other users only themselves.
import { useCallback, useEffect, useMemo, useState } from 'react'
import { RefreshCw, Search } from 'lucide-react'
import { Card, PageHeader, Stat } from '../components/ui'
import { supabase } from '../auth/supabase'
import { useAuth } from '../auth/AuthProvider'

interface LoginEvent { id: number; user_id: string; email: string | null; full_name: string | null; avatar_url: string | null; provider: string | null; user_agent: string | null; created_at: string }
interface UserRow { user_id: string; email: string; name: string; avatar: string; first: string; last: string; count: number; device: string }

const fmt = (iso: string) => new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
function ago(iso: string) {
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m} min ago`
  const h = Math.round(m / 60)
  return h < 24 ? `${h} h ago` : `${Math.round(h / 24)} d ago`
}
function device(ua: string | null) {
  if (!ua) return 'Unknown'
  const b = /Edg\//.test(ua) ? 'Edge' : /Chrome\//.test(ua) ? 'Chrome' : /Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : 'Browser'
  const o = /iPhone|iPad/.test(ua) ? 'iOS' : /Android/.test(ua) ? 'Android' : /Mac OS X/.test(ua) ? 'macOS' : /Windows/.test(ua) ? 'Windows' : /Linux/.test(ua) ? 'Linux' : 'Other'
  return `${b} · ${o}`
}
function Avatar({ src, name }: { src: string; name: string }) {
  return src
    ? <img src={src} alt="" referrerPolicy="no-referrer" className="w-7 h-7 rounded-full object-cover shrink-0" />
    : <div className="w-7 h-7 rounded-full bg-brand-50 text-brand-900 text-xs font-semibold flex items-center justify-center shrink-0" aria-hidden>{name[0]?.toUpperCase()}</div>
}

const SETUP_ERR = /login_events|app_admins|schema cache|does not exist/i

export default function SignInLog() {
  const { user } = useAuth()
  const [rows, setRows] = useState<LoginEvent[]>([])
  const [admin, setAdmin] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')

  const load = useCallback(async () => {
    if (!supabase || !user) { setLoading(false); return }
    setLoading(true); setErr(null)
    const [ev, ad] = await Promise.all([
      supabase.from('login_events').select('*').order('created_at', { ascending: false }).limit(1000),
      supabase.from('app_admins').select('email').eq('email', (user.email ?? '').toLowerCase()).maybeSingle(),
    ])
    if (ev.error) setErr(ev.error.message)
    setRows((ev.data as LoginEvent[] | null) ?? [])
    setAdmin(!!ad.data)
    setLoading(false)
  }, [user])
  useEffect(() => { void load() }, [load])

  const users = useMemo(() => {
    const m = new Map<string, UserRow>()
    for (const r of rows) {   // rows are newest first
      const u = m.get(r.user_id)
      if (!u) m.set(r.user_id, { user_id: r.user_id, email: r.email ?? '', name: r.full_name || r.email || 'Unknown', avatar: r.avatar_url ?? '', first: r.created_at, last: r.created_at, count: 1, device: device(r.user_agent) })
      else { u.count++; u.first = r.created_at }
    }
    return [...m.values()]
  }, [rows])
  const match = (s: string) => !q || s.toLowerCase().includes(q.toLowerCase())
  const shownUsers = users.filter((u) => match(`${u.name} ${u.email}`))
  const shownEvents = rows.filter((r) => match(`${r.full_name ?? ''} ${r.email ?? ''}`)).slice(0, 100)

  const now = Date.now(), day = 86400000
  const today = rows.filter((r) => new Date(r.created_at).toDateString() === new Date().toDateString()).length
  const week = rows.filter((r) => now - new Date(r.created_at).getTime() < 7 * day)
  const activeWeek = new Set(week.map((r) => r.user_id)).size

  if (!supabase) return <><PageHeader title="Sign-in log" subtitle="Login is not configured on this deployment" /><p className="text-sm text-ink-3">Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable Google sign-in and this log.</p></>

  return (
    <>
      <PageHeader title="Sign-in log" subtitle={admin ? 'Everyone who signed in to CTO360 with Google, and when' : 'Your own sign-ins (admins see all users)'} />
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <label className="relative"><Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-ink-4" aria-hidden />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or email…" aria-label="Search sign-ins" className="pl-7 pr-2 py-1.5 text-sm border border-slate-300 rounded-lg w-64 max-w-full" /></label>
        <button onClick={() => void load()} className="inline-flex items-center gap-1.5 text-sm rounded-lg border border-line bg-white px-3 py-1.5 hover:bg-slate-50"><RefreshCw size={14} className={loading ? 'animate-spin' : ''} />Refresh</button>
        <span className={`text-xs rounded-full px-2 py-0.5 ${admin ? 'bg-success-bg text-success-text' : 'bg-slate-100 text-ink-3'}`}>{admin ? 'Admin view · all users' : 'Personal view'}</span>
      </div>

      {err && (
        <div role="alert" className="rounded-xl border border-warn/40 bg-warn-bg text-warn-text px-4 py-3 text-sm mb-5">
          {SETUP_ERR.test(err)
            ? <><b>One-time setup needed.</b> The sign-in table does not exist yet. In Supabase → SQL Editor → New query, paste the contents of <code>supabase/login_events.sql</code> from the project and click Run. Then sign out and sign in again, and press Refresh.</>
            : <><b>Could not load the sign-in log:</b> {err}</>}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <Stat label={admin ? 'Users who signed in' : 'Your accounts'} value={users.length} />
        <Stat label="Sign-ins today" value={today} />
        <Stat label="Sign-ins, last 7 days" value={week.length} />
        <Stat label="Active users, last 7 days" value={activeWeek} />
      </div>

      <Card title={`Users (${shownUsers.length})`} className="mb-5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead><tr className="text-left text-xs text-ink-3 border-b border-line"><th className="py-2 pr-3 font-medium">User</th><th className="py-2 pr-3 font-medium">Last sign-in</th><th className="py-2 pr-3 font-medium">First sign-in</th><th className="py-2 pr-3 font-medium text-right">Sign-ins</th><th className="py-2 font-medium">Last device</th></tr></thead>
            <tbody>{shownUsers.map((u) => (
              <tr key={u.user_id} className="border-b border-line last:border-0">
                <td className="py-2 pr-3"><div className="flex items-center gap-2"><Avatar src={u.avatar} name={u.name} /><div className="min-w-0"><div className="font-medium text-ink truncate">{u.name}</div><div className="text-xs text-ink-3 truncate">{u.email}</div></div></div></td>
                <td className="py-2 pr-3 whitespace-nowrap">{fmt(u.last)}<div className="text-xs text-ink-3">{ago(u.last)}</div></td>
                <td className="py-2 pr-3 whitespace-nowrap">{fmt(u.first)}</td>
                <td className="py-2 pr-3 text-right tabular-nums">{u.count}</td>
                <td className="py-2 whitespace-nowrap text-ink-2">{u.device}</td>
              </tr>
            ))}</tbody>
          </table>
          {!loading && shownUsers.length === 0 && <p className="text-sm text-ink-3 py-3">No sign-ins recorded yet. Sign out and sign in again to create the first entry.</p>}
        </div>
      </Card>

      <Card title="Recent sign-ins (latest 100)">
        <ul className="divide-y divide-line">{shownEvents.map((r) => (
          <li key={r.id} className="py-2 flex items-center gap-3 text-sm">
            <Avatar src={r.avatar_url ?? ''} name={r.full_name || r.email || '?'} />
            <div className="min-w-0 flex-1"><span className="font-medium text-ink">{r.full_name || r.email}</span><span className="text-ink-3"> · {r.email}</span><div className="text-xs text-ink-3">{device(r.user_agent)} · {r.provider ?? 'google'}</div></div>
            <div className="text-right text-xs text-ink-2 whitespace-nowrap">{fmt(r.created_at)}<div className="text-ink-3">{ago(r.created_at)}</div></div>
          </li>
        ))}</ul>
        {!loading && shownEvents.length === 0 && <p className="text-sm text-ink-3">Nothing to show.</p>}
      </Card>
      <p className="text-xs text-ink-3 mt-4">One entry per Google sign-in per browser session. Entries cannot be edited or deleted from the app. Full account list: Supabase → Authentication → Users.</p>
    </>
  )
}
