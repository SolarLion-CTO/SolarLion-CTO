import { support, vendorStatus, vendors } from '../../data/resilience'
import type { DomainId } from '../../data/domains'
import { Badge, Card, Stat } from '../../components/ui'

export default function VendorsTab({ domainId }: { domainId: DomainId }) {
  const tiers = support[domainId]
  const vs = vendors[domainId].map((v) => ({ v, st: vendorStatus(v) }))
  const backlog = tiers.reduce((s, t) => s + t.backlog, 0)
  const resolution = Math.round(tiers.reduce((s, t) => s + t.resolutionSla * t.tickets, 0) / tiers.reduce((s, t) => s + t.tickets, 0))
  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <Stat label="Tickets (30 days)" value={tiers.reduce((s, t) => s + t.tickets, 0).toLocaleString('en-IN')} sub="all support tiers" />
        <Stat label="Open backlog" value={backlog} sub="across L1 → vendor" />
        <Stat label="Resolved within SLA" value={`${resolution}%`} sub="weighted by volume" tone={resolution < 85 ? 'warn' : 'default'} />
        <Stat label="Critical vendors" value={vs.filter((x) => x.st.health === 'Critical').length} sub="no exit plan for a single point of failure" tone={vs.some((x) => x.st.health === 'Critical') ? 'crit' : 'ok'} />
      </div>

      <Card title="Tech support model — L1 → L2 → L3 → vendor" className="mb-5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px] [&_th]:px-2 [&_td]:px-2">
            <thead><tr className="text-[11px] uppercase tracking-wide text-ink-3 border-b border-line text-left"><th className="py-2">Tier</th><th className="text-right">Tickets</th><th className="text-right">Backlog</th><th className="w-48">Response within SLA</th><th className="w-48">Resolution within SLA</th></tr></thead>
            <tbody>{tiers.map((t) => (
              <tr key={t.tier} className="border-b border-line last:border-0">
                <td className="py-2.5 font-medium text-ink">{t.tier}</td><td className="text-right">{t.tickets.toLocaleString('en-IN')}</td><td className="text-right">{t.backlog}</td>
                {[t.responseSla, t.resolutionSla].map((v, i) => (
                  <td key={i}><div className="flex items-center gap-2"><div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full ${v < 80 ? 'bg-crit' : v < 90 ? 'bg-warn' : 'bg-brand-600'}`} style={{ width: `${v}%` }} /></div><span className="text-xs w-9 text-right tabular-nums">{v}%</span></div></td>
                ))}
              </tr>
            ))}</tbody>
          </table>
        </div>
        <p className="text-xs text-ink-3 mt-2">Resolution SLA falls at each hand-off — the vendor tier is usually the bottleneck.</p>
      </Card>

      <Card title="Vendors & supply-chain systems">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[860px] [&_th]:px-2 [&_td]:px-2">
            <thead><tr className="text-[11px] uppercase tracking-wide text-ink-3 border-b border-line text-left"><th className="py-2">Vendor</th><th>Service</th><th className="text-right">SLA met</th><th>Risk</th><th>Single point of failure</th><th>Exit plan</th><th>Contract end</th><th>Status</th></tr></thead>
            <tbody>{vs.map(({ v, st }) => (
              <tr key={v.vendor} className="border-b border-line last:border-0 align-top">
                <td className="py-2.5"><div className="font-medium text-ink">{v.vendor}</div><div className="text-xs text-ink-3">{v.apps}</div></td>
                <td>{v.service}</td>
                <td className={`text-right ${v.sla < 95 ? 'text-warn-text font-semibold' : ''}`}>{v.sla}%</td>
                <td><Badge>{v.risk}</Badge></td>
                <td>{v.spof ? 'Yes' : 'No'}</td>
                <td className={!v.exitPlan && v.spof ? 'text-crit-text font-semibold' : ''}>{v.exitPlan ? 'Yes' : 'No'}</td>
                <td className="whitespace-nowrap">{v.contractEnd}</td>
                <td><Badge>{st.health}</Badge>{st.reasons.length > 0 && <div className="text-xs text-ink-3 mt-0.5">{st.reasons.join(' · ')}</div>}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </Card>
    </>
  )
}
