import { useNavigate } from 'react-router-dom'
import { CircleCheck, OctagonAlert, TriangleAlert } from 'lucide-react'
import type { DomainData, Rag } from '../../data/sim/model'
import { HEAT_COLS } from '../../data/sim/functions'
import { domainHealth } from '../../data/sim/scores'
import { useKeepRange } from './range'

const cell: Record<Rag, string> = { Green: 'bg-success-bg text-success-text', Amber: 'bg-warn-bg text-warn-text', Red: 'bg-crit-bg text-crit-text' }
const Icon = { Green: CircleCheck, Amber: TriangleAlert, Red: OctagonAlert }

/** 16 functions × 6 columns + Overall. Every cell is one real metric; click a row for the function page. */
export function HealthHeatmap({ d }: { d: DomainData }) {
  const nav = useNavigate()
  const keep = useKeepRange()
  const fns = domainHealth(d).functions
  const groups = [
    { label: 'CTO-owned', items: fns.filter((f) => f.def.cls === 'cto') },
    { label: 'Signals to the CTO', items: fns.filter((f) => f.def.cls === 'signal') },
  ]
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[760px] border-separate border-spacing-y-1 table-fixed">
        <colgroup><col className="w-[30%]" />{HEAT_COLS.map((c) => <col key={c.id} />)}<col className="w-[9%]" /></colgroup>
        <thead>
          <tr className="text-[11px] uppercase tracking-wide text-ink-3 text-left">
            <th className="font-semibold pb-1 pl-2">Function</th>
            {HEAT_COLS.map((c) => <th key={c.id} className="font-semibold pb-1 text-center px-0.5 text-[10px] tracking-normal">{c.label}</th>)}
            <th className="font-semibold pb-1 text-center text-[10px] tracking-normal">Overall</th>
          </tr>
        </thead>
        {groups.map((g) => (
          <tbody key={g.label}>
            <tr><td colSpan={8} className="pt-2 pb-0.5 pl-2 text-[11px] font-semibold uppercase tracking-wide text-brand-700">{g.label}</td></tr>
            {g.items.map((f) => (
              <tr key={f.def.id} onClick={() => nav(keep(`/domain/${d.domain}/fn/${f.def.id}`))} className="cursor-pointer group" title={`Open ${f.def.name}`}>
                <td className="pl-2 pr-3 py-1.5 rounded-l-lg bg-slate-50 group-hover:bg-brand-50">
                  <div className="font-medium text-ink leading-tight">{f.def.name}</div>
                  <div className="text-[11px] text-ink-3">{f.def.owner}</div>
                </td>
                {HEAT_COLS.map((c) => {
                  const x = f.cols[c.id]
                  const I = Icon[x.status]
                  return (
                    <td key={c.id} className="px-0.5">
                      <div className={`rounded-md text-center py-1.5 text-xs font-semibold tabular-nums whitespace-nowrap ${cell[x.status]}`} title={`${x.metric.name}: ${x.metric.current}${x.metric.unit === '%' ? '%' : ' ' + x.metric.unit} (target ${x.metric.target}) — ${x.status}`}>
                        <I size={11} className="inline -mt-0.5 mr-0.5" aria-hidden />{x.score}
                      </div>
                    </td>
                  )
                })}
                <td className="pl-1 rounded-r-lg">
                  <div className={`rounded-md text-center py-1.5 text-sm font-bold tabular-nums border ${f.status === 'Green' ? 'border-green-200' : f.status === 'Amber' ? 'border-amber-200' : 'border-red-200'} ${cell[f.status]}`}>{f.score}</div>
                </td>
              </tr>
            ))}
          </tbody>
        ))}
      </table>
      <p className="text-xs text-ink-3 mt-2">Each cell is one simulated metric scored against its target (hover for the value). Click a row to open the function.</p>
    </div>
  )
}
