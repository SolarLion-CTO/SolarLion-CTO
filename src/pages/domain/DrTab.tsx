import { apps, bcp, dr, drOptions, drStatus } from '../../data/resilience'
import type { DomainId } from '../../data/domains'
import { Badge, Card, Stat } from '../../components/ui'
import StagePath from './StagePath'

const h = (x: number | null) => (x === null ? '—' : x < 1 ? `${Math.round(x * 60)} min` : `${x} h`)

export default function DrTab({ domainId }: { domainId: DomainId }) {
  const rows = dr[domainId].map((x) => { const a = apps[domainId].find((p) => p.id === x.appId)!; return { x, a, st: drStatus(x, a.tier) } })
  const tested = rows.filter((r) => r.x.result !== 'Not tested').length
  const meetsRto = rows.filter((r) => r.x.rtoTestedH !== null && r.x.rtoTestedH <= r.x.rtoTargetH).length
  const plans = bcp[domainId]
  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <Stat label="Apps with tested DR" value={`${tested} / ${rows.length}`} sub="at least one drill" tone={tested < rows.length ? 'warn' : 'ok'} />
        <Stat label="Meet RTO when tested" value={`${meetsRto} / ${tested}`} sub="recovery time within target" tone={meetsRto < tested ? 'warn' : 'ok'} />
        <Stat label="Drills overdue" value={rows.filter((r) => r.x.overdue).length} sub="past due date" tone={rows.some((r) => r.x.overdue) ? 'warn' : 'ok'} />
        <Stat label="BCP plans approved" value={`${plans.filter((p) => p.plan === 'Approved').length} / ${plans.length}`} sub="business processes" tone={plans.some((p) => p.plan === 'Missing') ? 'crit' : 'default'} />
      </div>

      <Card title="Disaster recovery by application" className="mb-5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[1000px] [&_th]:px-2 [&_td]:px-2">
            <thead><tr className="text-[11px] uppercase tracking-wide text-ink-3 border-b border-line text-left">
              <th className="py-2">Application</th><th>Tier</th><th>DR strategy</th><th className="text-right">RTO target</th><th className="text-right">RTO tested</th><th className="text-right">RPO target</th><th className="text-right">RPO tested</th><th>Last drill</th><th>Next</th><th>Status</th>
            </tr></thead>
            <tbody>{rows.map(({ x, a, st }) => (
              <tr key={x.appId} className="border-b border-line last:border-0 align-top">
                <td className="py-2.5"><div className="font-semibold text-ink">{a.name}</div>{st.reasons.length > 0 && <div className="text-xs text-ink-3">{st.reasons.join(' · ')}</div>}</td>
                <td>T{a.tier}</td><td className="whitespace-nowrap">{x.strategy}</td>
                <td className="text-right">{h(x.rtoTargetH)}</td>
                <td className={`text-right ${x.rtoTestedH !== null && x.rtoTestedH > x.rtoTargetH ? 'text-crit-text font-semibold' : ''}`}>{h(x.rtoTestedH)}</td>
                <td className="text-right">{x.rpoTargetMin} min</td>
                <td className={`text-right ${x.rpoTestedMin !== null && x.rpoTestedMin > x.rpoTargetMin ? 'text-warn-text font-semibold' : ''}`}>{x.rpoTestedMin === null ? '—' : `${x.rpoTestedMin} min`}</td>
                <td className="whitespace-nowrap">{x.lastDrill ?? '—'} <span className="text-xs text-ink-3">{x.result}</span></td>
                <td className={`whitespace-nowrap ${x.overdue ? 'text-warn-text font-semibold' : ''}`}>{x.nextDrill}{x.overdue && ' (overdue)'}</td>
                <td><Badge>{st.health}</Badge></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
        <p className="text-xs text-ink-3 mt-2">RTO = how long until the service is back · RPO = how much data can be lost. Never-tested Tier 0–1, a failed drill or a tested RTO above target is Critical.</p>
      </Card>

      <div className="grid lg:grid-cols-2 gap-5 mb-5">
        <Card title="DR options — recovery speed vs cost">
          <div className="overflow-x-auto"><table className="w-full text-sm min-w-[480px] [&_th]:px-2 [&_td]:px-2">
            <thead><tr className="text-[11px] uppercase tracking-wide text-ink-3 border-b border-line text-left"><th className="py-2">Strategy</th><th>RTO</th><th>RPO</th><th>Cost</th><th>Fits</th></tr></thead>
            <tbody>{drOptions.map((o) => (
              <tr key={o.strategy} className="border-b border-line last:border-0"><td className="py-2 font-medium text-ink">{o.strategy}</td><td>{o.rto}</td><td>{o.rpo}</td><td className="text-ink-2">{o.cost}</td><td className="text-xs text-ink-3">{o.fit}</td></tr>
            ))}</tbody>
          </table></div>
        </Card>
        <Card title="Business continuity plans">
          <div className="overflow-x-auto"><table className="w-full text-sm min-w-[480px] [&_th]:px-2 [&_td]:px-2">
            <thead><tr className="text-[11px] uppercase tracking-wide text-ink-3 border-b border-line text-left"><th className="py-2">Process</th><th>Fallback</th><th>Plan</th><th>Last exercise</th></tr></thead>
            <tbody>{plans.map((p) => (
              <tr key={p.process} className="border-b border-line last:border-0 align-top">
                <td className="py-2"><div className="font-medium text-ink">{p.process}</div><div className="text-xs text-ink-3">Tier {p.tier} · {p.owner}</div></td>
                <td className="text-xs">{p.alternate}<div className="text-ink-3">{p.workaround}</div></td>
                <td><Badge>{p.plan === 'Approved' ? 'Approved' : p.plan === 'Draft' ? 'Partial' : 'Gap'}</Badge></td>
                <td className={p.lastExercise ? '' : 'text-warn-text'}>{p.lastExercise ?? 'Never'}</td>
              </tr>
            ))}</tbody>
          </table></div>
        </Card>
      </div>

      {rows.some((r) => r.x.proposed) && (
        <Card title="Improvements — current → proposed → pilot">
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {rows.filter((r) => r.x.proposed).map(({ x, a }) => (
              <div key={x.appId} className="rounded-lg border border-line p-3 text-sm">
                <div className="font-semibold text-ink mb-1">{a.name}</div>
                <div className="text-xs text-ink-3">Current</div><div className="mb-1">{x.proposed!.current}</div>
                <div className="text-xs text-ink-3">Proposed</div><div className="mb-2 font-medium text-brand-900">{x.proposed!.proposed}</div>
                <StagePath imp={x.proposed!} />
                <div className="text-xs text-ink-3 mt-2">Owner {x.proposed!.owner} · feasibility {x.proposed!.feasibility}/10</div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </>
  )
}
