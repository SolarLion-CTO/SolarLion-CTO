import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

// Card — one style everywhere: white surface, hairline border, 12px radius, soft shadow.
export function Card({ title, action, children, className = '' }: { title?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`bg-surface rounded-xl border border-line shadow-[0_1px_2px_rgba(15,23,42,0.04)] p-5 ${className}`}>
      {title && (
        <div className="flex items-center justify-between gap-3 mb-4">
          <h3 className="text-[15px] font-semibold text-ink leading-snug">{title}</h3>
          {action}
        </div>
      )}
      {children}
    </section>
  )
}

// Page header — sentence-case title, one-line subtitle, optional owner chip.
export function PageHeader({ title, subtitle, owner }: { title: string; subtitle: string; owner?: string }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-[28px] leading-tight font-bold tracking-tight text-brand-900">{title}</h1>
        <p className="text-ink-2 text-sm mt-1 max-w-3xl">{subtitle}</p>
      </div>
      {owner && (
        <span className="text-xs font-medium bg-brand-50 text-brand-700 border border-brand-100 rounded-full px-3 py-1">
          Lead: {owner}
        </span>
      )}
    </div>
  )
}

// KPI tile — label, hero value, change. One neutral icon style (tone kept for API compatibility).
export function Kpi({ icon: Icon, label, value, delta }: { icon: LucideIcon; label: string; value: string; delta: string; tone?: string }) {
  const negative = /gap|↓|risk|delay/i.test(delta) && !/^0 /.test(delta)
  return (
    <div className="bg-surface rounded-xl border border-line shadow-[0_1px_2px_rgba(15,23,42,0.04)] p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-7 h-7 shrink-0 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center"><Icon size={15} /></span>
        <span className="text-xs font-medium text-ink-2 leading-tight">{label}</span>
      </div>
      <div className="text-[28px] leading-none font-bold text-brand-900 tracking-tight">{value}</div>
      <div className={`text-xs font-medium mt-2 ${negative ? 'text-warn-text' : 'text-success-text'}`}>{delta}</div>
    </div>
  )
}

// Badges — soft tint + darker text. Health states also carry a shape so colour is never alone.
type Tone = { cls: string; icon?: string }
const ok = 'bg-success-bg text-success-text border-green-200'
const warn = 'bg-warn-bg text-warn-text border-amber-200'
const serious = 'bg-warn-bg text-warn-text border-amber-300'
const crit = 'bg-crit-bg text-crit-text border-red-200'
const info = 'bg-info-bg text-info-text border-brand-100'
const neutral = 'bg-slate-50 text-slate-600 border-line'
const toneMap: Record<string, Tone> = {
  'On Track': { cls: ok, icon: '●' }, Compliant: { cls: ok, icon: '●' }, Active: { cls: ok, icon: '●' }, Passed: { cls: ok, icon: '●' }, Approved: { cls: ok, icon: '✓' },
  'At Risk': { cls: warn, icon: '▲' }, Partial: { cls: warn, icon: '▲' }, Conditional: { cls: warn, icon: '▲' }, Warning: { cls: warn, icon: '▲' }, Escalated: { cls: warn, icon: '↑' },
  Delayed: { cls: crit, icon: '■' }, Gap: { cls: crit, icon: '■' }, Error: { cls: crit, icon: '■' }, Rejected: { cls: crit, icon: '✕' },
  Low: { cls: neutral }, Medium: { cls: warn }, High: { cls: serious }, Critical: { cls: crit, icon: '■' },
  Idle: { cls: neutral }, Training: { cls: info }, Modified: { cls: info, icon: '✎' }, Info: { cls: info },
  Healthy: { cls: ok, icon: '●' }, Degraded: { cls: warn, icon: '▲' }, Blocked: { cls: ok, icon: '●' }, Contained: { cls: warn, icon: '▲' }, Breach: { cls: crit, icon: '■' },
  Validated: { cls: ok, icon: '✓' }, Unvalidated: { cls: warn, icon: '▲' },
}

export function Badge({ children }: { children: string }) {
  const t = toneMap[children] ?? { cls: neutral }
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-medium border rounded-md px-2 py-0.5 whitespace-nowrap ${t.cls}`}>
      {t.icon && <span aria-hidden className="text-[9px] leading-none">{t.icon}</span>}
      {children}
    </span>
  )
}

export function Bar({ value, color = 'bg-brand-600' }: { value: number; color?: string }) {
  return (
    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(value, 100)}%` }} />
    </div>
  )
}

export function Ring({ value, size = 44, color = '#2563eb' }: { value: number; size?: number; color?: string }) {
  const r = (size - 6) / 2
  const c = 2 * Math.PI * r
  return (
    <svg width={size} height={size} className="block" role="img" aria-label={`${value}%`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={5} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={5} strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x="50%" y="54%" textAnchor="middle" dominantBaseline="middle" fontSize={size / 4} fontWeight={600} fill="#172033">
        {value}%
      </text>
    </svg>
  )
}

export const money = (cr: number) => `₹${cr.toFixed(1)} Cr`

// Stat tile — label, value, context. Tone only when the value means something.
export function Stat({ label, value, sub, tone = 'default' }: { label: string; value: string | number; sub?: string; tone?: 'default' | 'crit' | 'warn' | 'ok' }) {
  const color = tone === 'crit' ? 'text-crit-text' : tone === 'warn' ? 'text-warn-text' : tone === 'ok' ? 'text-success-text' : 'text-brand-900'
  return (
    <div className="bg-surface rounded-xl border border-line shadow-[0_1px_2px_rgba(15,23,42,0.04)] p-4">
      <div className="text-xs font-medium text-ink-2">{label}</div>
      <div className={`text-[26px] font-bold leading-tight mt-1 tabular-nums ${color}`}>{value}</div>
      {sub && <div className="text-xs text-ink-3">{sub}</div>}
    </div>
  )
}
