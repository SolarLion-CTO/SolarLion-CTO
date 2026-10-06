import { Bar as RBar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { losses, lossTotal, prevention } from '../../data/resilience'
import type { DomainId } from '../../data/domains'
import { Badge, Card } from '../../components/ui'
import { axisTick, chart } from '../../theme'

const L = (x: number) => `₹${x.toLocaleString('en-IN')} L`

export default function PnlTab({ domainId }: { domainId: DomainId }) {
  const rows = losses[domainId]
  const total = rows.reduce((s, r) => s + lossTotal(r), 0)
  const validated = rows.filter((r) => r.validated).reduce((s, r) => s + lossTotal(r), 0)
  const outage = rows.filter((r) => r.source === 'Outage').reduce((s, r) => s + lossTotal(r), 0)
  const cyberL = total - outage
  const lines = [
    { line: 'Revenue', amount: rows.reduce((s, r) => s + r.revenue + r.churn, 0), note: 'lost sales + estimated churn' },
    { line: 'Operating cost', amount: rows.reduce((s, r) => s + r.productivity + r.recovery, 0), note: 'lost productivity + recovery effort' },
    { line: 'Penalties & fines', amount: rows.reduce((s, r) => s + r.penalties + r.fines, 0), note: 'SLA penalties + regulatory fines' },
  ]
  const prev = prevention[domainId].map((p) => ({ ...p, name: p.measure.length > 38 ? p.measure.slice(0, 36) + '…' : p.measure }))

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <Card><div className="text-xs font-medium text-ink-2">Business loss (6 months)</div><div className="text-[26px] font-bold text-crit-text leading-tight mt-1">{L(total)}</div><div className="text-xs text-ink-3">{rows.length} incidents costed</div></Card>
        <Card><div className="text-xs font-medium text-ink-2">From outages</div><div className="text-[26px] font-bold text-brand-900 leading-tight mt-1">{L(outage)}</div><div className="text-xs text-ink-3">{Math.round((outage / total) * 100)}% of loss</div></Card>
        <Card><div className="text-xs font-medium text-ink-2">From cyber incidents</div><div className="text-[26px] font-bold text-brand-900 leading-tight mt-1">{L(cyberL)}</div><div className="text-xs text-ink-3">{Math.round((cyberL / total) * 100)}% of loss</div></Card>
        <Card><div className="text-xs font-medium text-ink-2">Validated by Finance</div><div className="text-[26px] font-bold text-brand-900 leading-tight mt-1">{Math.round((validated / total) * 100)}%</div><div className="text-xs text-ink-3">owner: Santhosh</div></Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-5 mb-5">
        <Card title="Impact on P&L lines">
          <ul className="space-y-3">{lines.map((l) => (
            <li key={l.line}>
              <div className="flex justify-between text-sm"><span className="font-medium text-ink">{l.line}</span><span className="font-semibold tabular-nums">{L(l.amount)}</span></div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1"><div className="h-full bg-brand-600" style={{ width: `${(l.amount / total) * 100}%` }} /></div>
              <div className="text-xs text-ink-3 mt-0.5">{l.note}</div>
            </li>
          ))}</ul>
          <div className="mt-4 rounded-lg bg-slate-50 border border-line p-3 text-xs text-ink-2">
            <b>Cost of an incident</b> = lost revenue + lost productivity + SLA penalties + regulatory fines + recovery cost + estimated churn
          </div>
        </Card>
        <Card title="Prevention vs loss avoided (₹ lakh / year)" className="lg:col-span-2">
          <div className="h-56">
            <ResponsiveContainer>
              <BarChart data={prev} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={chart.grid} />
                <XAxis type="number" tick={axisTick} />
                <YAxis type="category" dataKey="name" width={230} tick={axisTick} />
                <Tooltip formatter={(v) => `₹${v} L`} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <RBar isAnimationActive={false} dataKey="costL" name="Cost of prevention" fill={chart.comparison} radius={[0, 4, 4, 0]} />
                <RBar isAnimationActive={false} dataKey="lossAvoidedL" name="Loss avoided" fill={chart.primary} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-ink-3 mt-1">Every prevention measure here pays back within a year — this is the investment case for resilience.</p>
        </Card>
      </div>

      <Card title="Incident cost register">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[900px] [&_th]:px-2 [&_td]:px-2">
            <thead><tr className="text-[11px] uppercase tracking-wide text-ink-3 border-b border-line text-left">
              <th className="py-2">Date</th><th>Incident</th><th>Source</th><th className="text-right">Revenue</th><th className="text-right">Productivity</th><th className="text-right">Penalties</th><th className="text-right">Fines</th><th className="text-right">Recovery</th><th className="text-right">Churn</th><th className="text-right">Total</th><th>Finance</th>
            </tr></thead>
            <tbody>{rows.map((r) => (
              <tr key={r.date + r.incident} className="border-b border-line last:border-0">
                <td className="py-2 text-ink-3 whitespace-nowrap">{r.date}</td>
                <td><div className="font-medium text-ink">{r.incident}</div><div className="text-xs text-ink-3">{r.app}</div></td>
                <td><span className="text-xs">{r.source}</span></td>
                {[r.revenue, r.productivity, r.penalties, r.fines, r.recovery, r.churn].map((v, i) => <td key={i} className="text-right tabular-nums">{v || '—'}</td>)}
                <td className="text-right font-semibold tabular-nums whitespace-nowrap">{L(lossTotal(r))}</td>
                <td><Badge>{r.validated ? 'Validated' : 'Unvalidated'}</Badge></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
        <p className="text-xs text-ink-3 mt-2">All amounts in ₹ lakh, illustrative. Unvalidated figures are excluded from board reporting until Finance confirms them.</p>
      </Card>
    </>
  )
}
