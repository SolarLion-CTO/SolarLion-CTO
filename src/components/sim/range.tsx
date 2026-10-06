// Time range (30 days / Quarter / 6 months / 12 months) — kept in the URL so drill-down and back keep context.
import { useSearchParams } from 'react-router-dom'

export type Range = '30d' | 'qtr' | '6m' | '12m'
export const RANGES: { id: Range; label: string; points: number; vs: string }[] = [
  { id: '30d', label: '30 days', points: 2, vs: 'vs last month' },
  { id: 'qtr', label: 'Quarter', points: 4, vs: 'vs last quarter' },
  { id: '6m', label: '6 months', points: 7, vs: 'vs 6 months ago' },
  { id: '12m', label: '12 months', points: 12, vs: 'vs 12 months ago' },
]
export function useRange() {
  const [sp] = useSearchParams()
  const id = (sp.get('range') as Range) || 'qtr'
  return RANGES.find((r) => r.id === id) ?? RANGES[1]
}

export function TimeRange() {
  const [sp, setSp] = useSearchParams()
  const cur = useRange()
  return (
    <div className="inline-flex rounded-lg border border-slate-300 bg-white overflow-hidden text-[13px]" role="group" aria-label="Time range">
      {RANGES.map((r) => (
        <button key={r.id} onClick={() => { const n = new URLSearchParams(sp); n.set('range', r.id); setSp(n, { replace: true }) }}
          className={`px-2.5 sm:px-3 py-1.5 ${cur.id === r.id ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-ink-2 hover:bg-slate-50'}`} aria-pressed={cur.id === r.id}>
          {r.label}
        </button>
      ))}
    </div>
  )
}
/** Keep the current range when linking to another simulation page. */
export function useKeepRange() {
  const [sp] = useSearchParams()
  const r = sp.get('range')
  return (to: string) => (r ? `${to}${to.includes('?') ? '&' : '?'}range=${r}` : to)
}
