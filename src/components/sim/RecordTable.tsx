import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { ChevronDown, ChevronUp, Search } from 'lucide-react'
import type { Rag } from '../../data/sim/model'

export interface Col<T> { key: string; label: string; render: (r: T) => ReactNode; sort?: (r: T) => number | string; align?: 'right' | 'center'; className?: string }
const rank: Record<Rag, number> = { Red: 0, Amber: 1, Green: 2 }

/** Exceptions first, sortable, filterable, paged ("show all"). */
export function RecordTable<T extends { id: string; name: string; health: Rag }>({ rows, cols, pageSize = 8, minWidth = 760, label }: { rows: T[]; cols: Col<T>[]; pageSize?: number; minWidth?: number; label: string }) {
  const [q, setQ] = useState('')
  const [all, setAll] = useState(false)
  const [sort, setSort] = useState<{ key: string; dir: 1 | -1 } | null>(null)
  const list = useMemo(() => {
    const f = rows.filter((r) => !q || `${r.id} ${r.name}`.toLowerCase().includes(q.toLowerCase()))
    const c = sort && cols.find((x) => x.key === sort.key)
    return [...f].sort((a, b) => {
      if (c?.sort) { const x = c.sort(a), y = c.sort(b); return (x < y ? -1 : x > y ? 1 : 0) * sort!.dir }
      return rank[a.health] - rank[b.health]
    })
  }, [rows, q, sort, cols])
  const shown = all ? list : list.slice(0, pageSize)
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <label className="relative">
          <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-ink-4" aria-hidden />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Filter ${label}…`} className="pl-7 pr-2 py-1.5 text-sm border border-slate-300 rounded-lg w-52 max-w-full" aria-label={`Filter ${label}`} />
        </label>
        <span className="text-xs text-ink-3">{list.length} {label} · exceptions first{sort ? ` · sorted by ${cols.find((c) => c.key === sort.key)?.label}` : ''}</span>
        {sort && <button onClick={() => setSort(null)} className="text-xs text-brand-600 font-semibold">Reset sort</button>}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm [&_th]:px-2 [&_td]:px-2" style={{ minWidth }}>
          <thead><tr className="text-[11px] uppercase tracking-wide text-ink-3 border-b border-line text-left">
            {cols.map((c) => (
              <th key={c.key} className={`py-2 font-semibold ${c.align === 'right' ? 'text-right' : c.align === 'center' ? 'text-center' : ''}`}>
                {c.sort ? (
                  <button className="inline-flex items-center gap-0.5 uppercase" onClick={() => setSort((s) => (s?.key === c.key ? { key: c.key, dir: (s.dir * -1) as 1 | -1 } : { key: c.key, dir: -1 }))}>
                    {c.label}{sort?.key === c.key && (sort.dir === 1 ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                  </button>
                ) : c.label}
              </th>
            ))}
          </tr></thead>
          <tbody>{shown.map((r) => (
            <tr key={r.id} className="border-b border-line last:border-0 align-top hover:bg-slate-50">
              {cols.map((c) => <td key={c.key} className={`py-2 ${c.align === 'right' ? 'text-right tabular-nums' : c.align === 'center' ? 'text-center' : ''} ${c.className ?? ''}`}>{c.render(r)}</td>)}
            </tr>
          ))}</tbody>
        </table>
      </div>
      {list.length > pageSize && <button onClick={() => setAll(!all)} className="mt-2 text-xs font-semibold text-brand-600">{all ? 'Show fewer' : `Show all ${list.length}`}</button>}
    </div>
  )
}
