import { useState } from 'react'
import { Info } from 'lucide-react'
import { apps, assess, totalIncidents } from '../../data/resilience'
import type { DomainId } from '../../data/domains'
import { Badge, Card } from '../../components/ui'
import StagePath from './StagePath'

const pct = (n: number) => `${n.toFixed(2)}%`

export default function AppsTab({ domainId }: { domainId: DomainId }) {
  const list = apps[domainId].map((a) => ({ a, r: assess(a) }))
  const [sel, setSel] = useState(list[0].a.id)
  const s = list.find((x) => x.a.id === sel) ?? list[0]
  const count = (h: string) => list.filter((x) => x.r.health === h).length
  const high = list.filter((x) => x.r.priority === 'High').length
  const sum = (k: 'p1' | 'p2' | 'p3' | 'p4' | 'unplannedMin') => list.reduce((t, x) => t + x.a[k], 0)

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-5">
        {[
          ['Applications', `${list.length}`, 'tracked'],
          ['Critical', `${count('Critical')}`, 'P1 or below target'],
          ['Degraded', `${count('Degraded')}`, 'needs attention'],
          ['High priority', `${high}`, 'escalated to CTO'],
          ['Incidents (30 d)', `${sum('p1') + sum('p2') + sum('p3') + sum('p4')}`, `P1 ${sum('p1')} · P2 ${sum('p2')} · P3 ${sum('p3')} · P4 ${sum('p4')}`],
          ['Unplanned downtime', `${sum('unplannedMin')} min`, 'last 30 days'],
        ].map(([l, v, c]) => (
          <Card key={l}><div className="text-xs font-medium text-ink-2">{l}</div><div className="text-[26px] font-bold text-brand-900 leading-tight mt-1">{v}</div><div className="text-xs text-ink-3">{c}</div></Card>
        ))}
      </div>

      <Card title="Application health — status calculated from evidence" className="mb-5" action={<span className="text-xs text-ink-3 hidden md:inline">Click a row for details</span>}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[980px] [&_th]:px-2 [&_td]:px-2">
            <thead><tr className="text-[11px] uppercase tracking-wide text-ink-3 border-b border-line text-left">
              <th className="py-2">Application</th><th>Tier</th><th className="text-right">Availability</th><th className="text-right">Target</th><th className="text-right">Downtime</th>
              <th className="text-center">P1</th><th className="text-center">P2</th><th className="text-center">P3</th><th className="text-center">P4</th><th className="text-right">MTTR</th><th>Health</th><th>Priority</th>
            </tr></thead>
            <tbody>
              {list.map(({ a, r }) => (
                <tr key={a.id} onClick={() => setSel(a.id)} className={`border-b border-line last:border-0 cursor-pointer ${sel === a.id ? 'bg-brand-50' : 'hover:bg-slate-50'}`}>
                  <td className="py-2.5"><div className="font-semibold text-ink">{a.name}</div><div className="text-xs text-ink-3">{a.service}{a.critical && ' · critical service'}</div></td>
                  <td>T{a.tier}</td>
                  <td className={`text-right font-semibold ${a.avail < a.slo ? 'text-crit-text' : 'text-ink'}`}>{pct(a.avail)}</td>
                  <td className="text-right text-ink-3">{pct(a.slo)}</td>
                  <td className="text-right">{a.unplannedMin} min</td>
                  <td className={`text-center font-semibold ${a.p1 ? 'text-crit-text' : 'text-ink-3'}`}>{a.p1}</td>
                  <td className={`text-center ${a.p2 >= 3 ? 'font-semibold text-warn-text' : ''}`}>{a.p2}</td>
                  <td className="text-center">{a.p3}</td>
                  <td className="text-center">{a.p4}</td>
                  <td className={`text-right ${a.mttrH > a.mttrTargetH ? 'text-warn-text font-semibold' : ''}`}>{a.mttrH} h</td>
                  <td><Badge>{r.health}</Badge></td>
                  <td><Badge>{r.priority}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-5">
        <Card title={s.a.name} className="lg:col-span-2" action={<div className="flex gap-2"><Badge>{s.r.health}</Badge><Badge>{s.r.priority}</Badge></div>}>
          <div className="grid sm:grid-cols-4 gap-3 text-sm mb-4">
            <div><div className="text-xs text-ink-3">Error budget used</div><div className={`font-bold text-lg ${s.r.budgetUsed > 100 ? 'text-crit-text' : s.r.budgetUsed > 75 ? 'text-warn-text' : 'text-ink'}`}>{s.r.budgetUsed}%</div></div>
            <div><div className="text-xs text-ink-3">Repeat incidents</div><div className="font-bold text-lg">{s.a.repeat}</div></div>
            <div><div className="text-xs text-ink-3">Change failure</div><div className="font-bold text-lg">{s.a.changeFail}%</div></div>
            <div><div className="text-xs text-ink-3">SLA breaches</div><div className="font-bold text-lg">{s.a.slaBreaches}</div></div>
          </div>
          <div className="text-xs font-semibold text-ink-2 mb-1">Why this status</div>
          {s.r.reasons.length ? (
            <ul className="text-sm space-y-1 mb-4">{s.r.reasons.map((x) => <li key={x} className="flex gap-2"><span className="text-ink-3">•</span>{x}</li>)}</ul>
          ) : <p className="text-sm text-success-text mb-4">Within target on every rule.</p>}
          <div className="rounded-lg border border-line p-3">
            <div className="text-xs font-semibold text-ink-2 mb-2">Improvement · owner {s.a.improvement.owner} · feasibility {s.a.improvement.feasibility}/10</div>
            <div className="grid sm:grid-cols-2 gap-3 text-sm mb-3">
              <div><span className="text-xs text-ink-3 block">Current state</span>{s.a.improvement.current}</div>
              <div><span className="text-xs text-ink-3 block">Proposed</span><span className="font-medium text-brand-900">{s.a.improvement.proposed}</span></div>
            </div>
            <StagePath imp={s.a.improvement} />
          </div>
          <p className="text-xs text-ink-3 mt-3">Application owner: {s.a.owner} · {totalIncidents(s.a)} incidents in 30 days</p>
        </Card>

        <Card title="How status is calculated">
          <div className="text-sm space-y-3">
            <div><Badge>Critical</Badge><p className="text-xs text-ink-2 mt-1">Any P1, availability below target, or 50+ incidents in 30 days.</p></div>
            <div><Badge>Degraded</Badge><p className="text-xs text-ink-2 mt-1">3+ P2s, 2+ repeat incidents, MTTR above target, any SLA breach, or 30+ incidents.</p></div>
            <div><Badge>Healthy</Badge><p className="text-xs text-ink-2 mt-1">Within target on every rule.</p></div>
            <div className="pt-3 border-t border-line">
              <div className="text-xs font-semibold text-ink-2 mb-1">Priority = impact × urgency</div>
              <p className="text-xs text-ink-2">An incident-heavy app on a <b>critical business service</b> is always <b>High</b> and appears in the CTO escalations.</p>
            </div>
            <p className="text-[11px] text-ink-3 flex gap-1"><Info size={12} className="shrink-0 mt-0.5" />Status is never typed in — it is recalculated from the figures in <code>src/data/resilience.ts</code>.</p>
          </div>
        </Card>
      </div>
    </>
  )
}
