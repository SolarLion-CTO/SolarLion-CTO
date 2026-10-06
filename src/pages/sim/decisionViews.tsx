import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import type { ActionStatus, Decision } from '../../data/sim/decisions'
import { LEVELS, maturity } from '../../data/sim/decisions'
import type { DomainData } from '../../data/sim'
import { MONTHS } from '../../data/sim'
import { Badge, Card } from '../../components/ui'
import { useDecisionState } from '../../components/sim/decisionState'
import { Sparkline, fmt } from '../../components/sim/primitives'

const STATUSES: ActionStatus[] = ['Not Started', 'In Progress', 'Blocked', 'Completed']
const stCls: Record<ActionStatus, string> = { 'Not Started': 'text-ink-2', 'In Progress': 'text-info-text', Blocked: 'text-crit-text', Completed: 'text-success-text' }
const dname = (d: string) => d[0].toUpperCase() + d.slice(1)

export function ActionTracker({ decisions, showDomain = false }: { decisions: Decision[]; showDomain?: boolean }) {
  const st = useDecisionState()
  const [filter, setFilter] = useState<ActionStatus | 'All'>('All')
  const live = decisions.filter((d) => st.statusOf(d) === 'Approved')
  const rows = live.flatMap((d) => d.actions.map((a) => ({ a, d, s: st.actionStatus(a) }))).filter((r) => filter === 'All' || r.s === filter).sort((x, y) => x.a.due.localeCompare(y.a.due))
  const all = live.flatMap((d) => d.actions.map((a) => st.actionStatus(a)))
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">{STATUSES.map((s) => (
        <button key={s} onClick={() => setFilter(filter === s ? 'All' : s)} className={`text-left rounded-xl border p-3 bg-surface ${filter === s ? 'border-brand-600 ring-1 ring-brand-600' : 'border-line'}`}>
          <div className="text-xs text-ink-2">{s}</div><div className={`text-2xl font-bold ${stCls[s]}`}>{all.filter((x) => x === s).length}</div>
        </button>
      ))}</div>
      <Card>
        {rows.length === 0 ? <p className="text-sm text-ink-3">No actions yet. Approve a decision card to create its actions{filter !== 'All' ? ` (filter: ${filter})` : ''}.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[1000px] [&_th]:px-2 [&_td]:px-2">
              <thead><tr className="text-[11px] uppercase tracking-wide text-ink-3 border-b border-line text-left"><th className="py-2">Action</th><th>Decision</th><th>Owner</th><th>Due</th><th>Priority</th><th>Status</th><th>Expected outcome</th><th>Actual outcome</th><th>Evidence</th></tr></thead>
              <tbody>{rows.map(({ a, d, s }) => (
                <tr key={a.id} className="border-b border-line last:border-0 align-top">
                  <td className="py-2 max-w-[280px]"><div className="font-medium text-ink">{a.action}</div><div className="text-[11px] text-ink-3">{a.id}</div></td>
                  <td className="text-xs max-w-[180px]"><Link to={`/domain/${d.domain}/decisions#${d.id}`} className="text-brand-700 hover:underline">{d.id}</Link><div className="text-ink-3">{showDomain ? `${dname(d.domain)} · ` : ''}{d.title}</div></td>
                  <td className="text-xs">{a.owner}</td>
                  <td className={`text-xs whitespace-nowrap ${s !== 'Completed' && a.due < '2026-10-06' ? 'text-crit-text font-semibold' : ''}`}>{a.due}</td>
                  <td><Badge>{a.priority}</Badge></td>
                  <td><select value={s} onChange={(e) => st.setAction(a.id, e.target.value as ActionStatus)} className={`text-xs border border-slate-300 rounded-md px-1.5 py-1 bg-white font-medium ${stCls[s]}`} aria-label={`Status of ${a.id}`}>{STATUSES.map((x) => <option key={x}>{x}</option>)}</select></td>
                  <td className="text-xs text-ink-2 max-w-[180px]">{a.expectedOutcome}</td>
                  <td className="text-xs text-ink-2 max-w-[160px]">{s === 'Completed' ? a.preset?.actual ?? 'Completed — measure at next checkpoint' : '—'}</td>
                  <td className="text-xs">{a.evidence.startsWith('MET-') ? <span className="text-ink-3">{a.evidence}</span> : <Link to={`/domain/${d.domain}/record/${a.evidence}`} className="text-brand-700 hover:underline">{a.evidence}</Link>}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
        <p className="text-xs text-ink-3 mt-3">Status changes are saved in this browser only (demo). Use "Reset demo" to start again.</p>
      </Card>
    </>
  )
}

export function Outcomes({ decisions, showDomain = false }: { decisions: Decision[]; showDomain?: boolean }) {
  const st = useDecisionState()
  const preset = decisions.filter((d) => d.preset)
  const fresh = decisions.filter((d) => !d.preset && st.statusOf(d) === 'Approved')
  return (
    <div className="space-y-5">
      {preset.map((d) => (
        <Card key={d.id} title={`${showDomain ? dname(d.domain) + ' · ' : ''}${d.title}`} action={<span className="text-xs text-ink-3">Approved {d.preset!.decidedOn} · {d.preset!.by}</span>}>
          <ol className="flex flex-col md:flex-row md:items-stretch gap-2 mb-4" aria-label="Decision to outcome chain">
            {['Decision', 'Action', 'Technology result', 'Business outcome'].map((label, k) => (
              <li key={label} className="flex items-stretch gap-2 flex-1 min-w-0">
                <div className={`flex-1 rounded-lg p-3 border ${k === 3 ? 'bg-success-bg border-green-200' : 'bg-slate-50 border-line'}`}>
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-3">{label}</div>
                  <div className="text-sm text-ink leading-snug mt-0.5">{d.preset!.chain[k]}</div>
                </div>
                {k < 3 && <ArrowRight size={16} className="hidden md:block self-center text-ink-4 shrink-0" />}
              </li>
            ))}
          </ol>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px] [&_th]:px-2 [&_td]:px-2">
              <thead><tr className="text-[11px] uppercase tracking-wide text-ink-3 border-b border-line text-left"><th className="py-2">Outcome metric</th><th className="text-right">Baseline (Jul)</th><th className="text-right">Target</th><th className="text-right">Current</th><th className="text-right">Variance</th><th>Since approval</th><th>Status</th></tr></thead>
              <tbody>{d.preset!.outcomes.map((o) => (
                <tr key={o.metric.id} className="border-b border-line last:border-0">
                  <td className="py-2 font-medium text-ink">{o.metric.name}<div className="text-[11px] text-ink-3">{o.metric.derived ? 'calculated from source records' : 'simulated business data'}</div></td>
                  <td className="text-right tabular-nums">{fmt(o.baseline, o.metric.unit)}</td>
                  <td className="text-right tabular-nums">{fmt(o.target, o.metric.unit)}</td>
                  <td className="text-right tabular-nums font-semibold">{fmt(o.current, o.metric.unit)}</td>
                  <td className="text-right tabular-nums">{o.variance > 0 ? '+' : ''}{o.variance}</td>
                  <td><Sparkline data={o.metric.series.slice(8)} target={o.target} width={90} height={26} /><span className="text-[10px] text-ink-4">{MONTHS[8]}–{MONTHS[11]}</span></td>
                  <td><Badge>{o.status === 'Target met' ? 'Validated' : o.status === 'On track' ? 'On Track' : 'At Risk'}</Badge> <span className="text-xs text-ink-3">{o.status}</span></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </Card>
      ))}
      {fresh.length > 0 && (
        <Card title="Approved in this session — baseline captured">
          <ul className="space-y-2 text-sm">{fresh.map((d) => (
            <li key={d.id} className="border-b border-line last:border-0 pb-2"><Link to={`/domain/${d.domain}/decisions#${d.id}`} className="font-semibold text-ink hover:underline">{d.title}</Link>
              <div className="text-xs text-ink-3">Baseline taken today (6 Oct 2026); outcomes measured at the next checkpoint against: {d.expected.join('; ')}.</div></li>
          ))}</ul>
        </Card>
      )}
    </div>
  )
}

export function Maturity({ d }: { d: DomainData }) {
  const rows = maturity(d)
  return (
    <Card title="Technology management maturity (1–5)">
      <p className="text-xs text-ink-3 -mt-2 mb-4">Management visualisation derived from the simulated capability scores — not a CMMI or any other formal assessment.</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[900px] [&_th]:px-2 [&_td]:px-2">
          <thead><tr className="text-[11px] uppercase tracking-wide text-ink-3 border-b border-line text-left"><th className="py-2">Area</th><th className="w-[34%]">Current → target</th><th>Level today</th><th className="text-right">Gap</th><th>Improvement initiatives</th><th>Owner</th><th>Target date</th></tr></thead>
          <tbody>{rows.map((r) => (
            <tr key={r.area} className="border-b border-line last:border-0 align-top">
              <td className="py-2.5"><Link to={`/domain/${d.domain}/${r.slug}`} className="font-medium text-ink hover:underline">{r.area}</Link><div className="text-[11px] text-ink-3">Simulated · {r.source}</div></td>
              <td>
                <div className="relative h-3 bg-slate-100 rounded-full mt-1" role="img" aria-label={`Current ${r.current}, target ${r.target} of 5`}>
                  <div className="absolute h-full rounded-full bg-brand-600" style={{ width: `${(r.current / 5) * 100}%` }} />
                  <div className="absolute -top-1 -bottom-1 w-0.5 bg-brand-950" style={{ left: `${(r.target / 5) * 100}%` }} />
                </div>
                <div className="flex justify-between text-[10px] text-ink-4 mt-1">{[1, 2, 3, 4, 5].map((n) => <span key={n}>{n}</span>)}</div>
              </td>
              <td className="text-xs"><b className="text-ink">{r.current}</b> · {r.level}</td>
              <td className={`text-right font-semibold ${r.gap >= 1 ? 'text-warn-text' : 'text-ink-2'}`}>{r.gap}</td>
              <td className="text-xs">{r.initiatives.length ? r.initiatives.map((i) => <Link key={i.id} to={`/domain/${d.domain}/record/${i.id}`} className="block text-brand-700 hover:underline">{i.name}</Link>) : <span className="text-ink-3">—</span>}</td>
              <td className="text-xs">{r.owner}</td>
              <td className="text-xs whitespace-nowrap">{r.targetDate}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-ink-3 mt-3">{LEVELS.map((l, k) => <span key={l}><b>L{k + 1}</b> {l}</span>)}</div>
    </Card>
  )
}
