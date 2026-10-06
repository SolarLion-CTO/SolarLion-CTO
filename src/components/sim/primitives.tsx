// CTO360 simulation building blocks. Colours come from the design tokens; status is never colour alone (icon + label).
import { ArrowDownRight, ArrowRight, ArrowUpRight, CircleCheck, Database, OctagonAlert, TriangleAlert } from 'lucide-react'
import type { Metric, Rag, SourceId } from '../../data/sim/model'
import { SIM_NOW } from '../../data/sim/model'
import { SOURCES } from '../../data/sim/scores'
import { status as statusHex } from '../../theme'
import { ago, useSimClock } from './clock'
import { useRange } from './range'

export const ragText: Record<Rag, string> = { Green: 'text-success-text', Amber: 'text-warn-text', Red: 'text-crit-text' }
export const ragBg: Record<Rag, string> = { Green: 'bg-success-bg border-green-200', Amber: 'bg-warn-bg border-amber-200', Red: 'bg-crit-bg border-red-200' }
export const ragHex: Record<Rag, string> = { Green: statusHex.ok, Amber: statusHex.warn, Red: statusHex.crit }
const ragIcon = { Green: CircleCheck, Amber: TriangleAlert, Red: OctagonAlert }
const ragWord: Record<Rag, string> = { Green: 'On track', Amber: 'Watch', Red: 'Act' }

/** Status with icon + word; hover/focus shows WHY (from the record's `why[]`). */
export function StatusPill({ status, why, label }: { status: Rag; why?: string[]; label?: string }) {
  const Icon = ragIcon[status]
  const tip = why?.length ? why.join(' · ') : undefined
  return (
    <span className="relative group inline-flex">
      <span tabIndex={tip ? 0 : undefined} className={`inline-flex items-center gap-1 text-[11px] font-medium border rounded-md px-1.5 py-0.5 whitespace-nowrap ${ragBg[status]} ${ragText[status]}`} aria-label={`${label ?? ragWord[status]}${tip ? ': ' + tip : ''}`}>
        <Icon size={11} aria-hidden />{label ?? ragWord[status]}
      </span>
      {tip && (
        <span role="tooltip" className="pointer-events-none absolute z-30 right-0 top-full mt-1 w-60 max-w-[80vw] rounded-lg bg-brand-950 text-white text-xs leading-snug p-2.5 shadow-lg hidden group-hover:block group-focus-within:block">
          <b className="block mb-0.5">Why {status === 'Green' ? 'green' : status === 'Amber' ? 'amber' : 'red'}</b>{tip}
        </span>
      )}
    </span>
  )
}

export function ScoreRing({ score, size = 56, status, label }: { score: number; size?: number; status: Rag; label?: string }) {
  const r = (size - 7) / 2
  const c = 2 * Math.PI * r
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={`${label ?? 'Score'} ${score} of 100, ${status}`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={6} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={ragHex[status]} strokeWidth={6} strokeLinecap="round" strokeDasharray={`${(c * score) / 100} ${c}`} />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-bold text-brand-900 tabular-nums" style={{ fontSize: size * 0.3 }}>{score}</span>
    </div>
  )
}

/** Tiny inline trend line (SVG). Optional dashed target line. */
export function Sparkline({ data, target, width = 110, height = 30, color = '#2563eb' }: { data: number[]; target?: number; width?: number; height?: number; color?: string }) {
  const vals = target !== undefined ? [...data, target] : data
  const lo = Math.min(...vals), hi = Math.max(...vals)
  const span = hi - lo || 1
  const x = (i: number) => (data.length === 1 ? width / 2 : (i / (data.length - 1)) * (width - 4) + 2)
  const y = (v: number) => height - 3 - ((v - lo) / span) * (height - 6)
  const pts = data.map((v, i) => `${x(i)},${y(v)}`).join(' ')
  return (
    <svg width={width} height={height} className="block" aria-hidden>
      {target !== undefined && <line x1={0} x2={width} y1={y(target)} y2={y(target)} stroke="#94a3b8" strokeDasharray="3 3" strokeWidth={1} />}
      <polyline points={pts} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={x(data.length - 1)} cy={y(data[data.length - 1])} r={2.8} fill={color} />
    </svg>
  )
}

export const fmt = (v: number, unit: string) => {
  const n = Math.abs(v) >= 1000 ? v.toLocaleString('en-IN', { maximumFractionDigits: 0 }) : String(v)
  if (unit === '%') return `${n}%`
  if (unit === '₹') return `₹${n}`
  if (unit.startsWith('₹')) return `₹${n} ${unit.slice(2)}`
  if (unit === '×') return `${n}×`
  return unit ? `${n} ${unit}` : n
}

function Trend({ delta, better, vs }: { delta: number; better: 'up' | 'down'; vs: string }) {
  const good = better === 'up' ? delta > 0 : delta < 0
  const flat = Math.abs(delta) < 1e-9
  const Icon = flat ? ArrowRight : delta > 0 ? ArrowUpRight : ArrowDownRight
  const r = Math.round(delta * 100) / 100
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs ${flat ? 'text-ink-3' : good ? 'text-success-text' : 'text-crit-text'}`} title={vs}>
      <Icon size={13} aria-hidden />{flat ? 'flat' : `${r > 0 ? '+' : ''}${r}`} <span className="text-ink-3 hidden sm:inline">{vs}</span>
    </span>
  )
}

/** Metric card: current · target · variance · trend · status · owner · updated · sparkline. Never a bare number. */
export function MetricCard({ m, compact = false }: { m: Metric; compact?: boolean }) {
  const range = useRange()
  const { now } = useSimClock()
  const s = m.series.slice(12 - range.points)
  const delta = m.current - s[0]
  const updatedMs = now - new Date(SIM_NOW).getTime() + (new Date(SIM_NOW).getTime() - new Date(m.updated).getTime())
  return (
    <div className="bg-surface rounded-xl border border-line shadow-[0_1px_2px_rgba(15,23,42,0.04)] p-4 flex flex-col gap-1 min-w-0">
      <div className="flex flex-wrap items-start justify-between gap-x-2 gap-y-1">
        <div className="text-xs font-medium text-ink-2 leading-snug min-w-0">{m.name}</div>
        <StatusPill status={m.status} />
      </div>
      <div className="flex items-end justify-between gap-2">
        <div className={`${compact ? 'text-xl' : 'text-[26px]'} font-bold text-brand-900 leading-tight tabular-nums`}>{fmt(m.current, m.unit)}</div>
        <Sparkline data={s} target={m.target} width={compact ? 70 : 96} />
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-ink-3">
        <span>Target <b className="text-ink-2 font-semibold">{fmt(m.target, m.unit)}</b></span>
        {m.target !== 0 && <span className={m.status === 'Green' ? '' : ragText[m.status]}>{m.variancePct > 0 ? '+' : ''}{m.variancePct}%</span>}
        <Trend delta={delta} better={m.better} vs={range.vs} />
      </div>
      {!compact && <div className="text-[11px] text-ink-4 mt-0.5 truncate" title={`Owner ${m.owner}`}>Owner {m.owner} · updated {ago(updatedMs)}</div>}
    </div>
  )
}

/** Score card for roll-up KPIs (Executive 360). */
export function ScoreCard({ k, large = false }: { k: { label: string; current: number; target: number; unit: string; status: Rag; series: number[] }; large?: boolean }) {
  const range = useRange()
  const s = k.series.slice(12 - range.points)
  const delta = Math.round((k.current - s[0]) * 10) / 10
  return (
    <div className={`bg-surface rounded-xl border border-line shadow-[0_1px_2px_rgba(15,23,42,0.04)] ${large ? 'p-4' : 'p-3'} min-w-0`}>
      <div className="flex flex-wrap items-start justify-between gap-x-2 gap-y-1">
        <div className={`${large ? 'text-xs' : 'text-[11px]'} font-medium text-ink-2 leading-snug min-w-0`}>{k.label}</div>
        <StatusPill status={k.status} />
      </div>
      <div className="flex items-end justify-between gap-2 mt-1">
        <div className={`${large ? 'text-[28px]' : 'text-xl'} font-bold text-brand-900 leading-tight tabular-nums`}>{k.current}<span className="text-sm font-medium text-ink-3">{k.unit}</span></div>
        <Sparkline data={s} target={k.target} width={large ? 96 : 64} height={large ? 30 : 24} />
      </div>
      <div className="flex flex-wrap gap-x-3 text-xs text-ink-3 mt-0.5">
        <span>Target <b className="text-ink-2">{k.target}</b></span>
        <Trend delta={delta} better="up" vs={large ? range.vs : ''} />
      </div>
    </div>
  )
}

/** Tile for source-specific figures that have no history (still shows target and status). */
export function Tile({ label, value, target, status, note }: { label: string; value: string; target?: string; status: Rag; note?: string }) {
  return (
    <div className="bg-surface rounded-xl border border-line shadow-[0_1px_2px_rgba(15,23,42,0.04)] p-4 min-w-0">
      <div className="flex flex-wrap items-start justify-between gap-x-2 gap-y-1"><div className="text-xs font-medium text-ink-2 leading-snug min-w-0">{label}</div><StatusPill status={status} /></div>
      <div className="text-[26px] font-bold text-brand-900 leading-tight tabular-nums mt-1">{value}</div>
      <div className="text-xs text-ink-3">{target && <>Target <b className="text-ink-2">{target}</b></>}{target && note && ' · '}{note}</div>
    </div>
  )
}

/** "Simulated Source: X" — the legal wording rule. Never "connected". */
export function SourceBadge({ source, className = '' }: { source: SourceId; className?: string }) {
  const label = source === 'business' ? 'Simulated business data' : `Simulated Source: ${SOURCES.find((s) => s.id === source)!.label}`
  return <span className={`inline-flex items-center gap-1 text-[11px] font-medium text-ink-3 border border-line bg-slate-50 rounded-md px-1.5 py-0.5 whitespace-nowrap ${className}`}><Database size={11} aria-hidden />{label}</span>
}

export function Bar2({ value, planned, max = 100 }: { value: number; planned?: number; max?: number }) {
  return (
    <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden min-w-[60px]" role="img" aria-label={`${value} of ${max}${planned !== undefined ? `, plan ${planned}` : ''}`}>
      <div className="absolute h-full bg-brand-600 rounded-full" style={{ width: `${Math.min(100, (value / max) * 100)}%` }} />
      {planned !== undefined && <div className="absolute top-0 bottom-0 w-0.5 bg-brand-950" style={{ left: `${Math.min(100, (planned / max) * 100)}%` }} />}
    </div>
  )
}
