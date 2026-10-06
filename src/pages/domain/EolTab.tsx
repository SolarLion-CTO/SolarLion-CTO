import { eol, eolRaci, eolStatus } from '../../data/resilience'
import type { DomainId } from '../../data/domains'
import { Badge, Card, Stat } from '../../components/ui'
import StagePath from './StagePath'

export default function EolTab({ domainId }: { domainId: DomainId }) {
  const rows = eol[domainId].map((e) => ({ e, st: eolStatus(e) }))
  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <Stat label="Items tracked" value={rows.length} sub="software, hardware, platforms" />
        <Stat label="Past end of support" value={rows.filter((r) => r.e.monthsLeft < 0).length} sub="no vendor security patches" tone={rows.some((r) => r.e.monthsLeft < 0) ? 'crit' : 'ok'} />
        <Stat label="Due within 12 months" value={rows.filter((r) => r.e.monthsLeft >= 0 && r.e.monthsLeft <= 12).length} sub="decision needed now" tone="warn" />
        <Stat label="Undecided" value={rows.filter((r) => r.e.decision === 'Undecided').length} sub="no upgrade, replace or retire plan" tone={rows.some((r) => r.e.decision === 'Undecided') ? 'warn' : 'ok'} />
      </div>

      <Card title="End-of-life register" className="mb-5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[980px] [&_th]:px-2 [&_td]:px-2">
            <thead><tr className="text-[11px] uppercase tracking-wide text-ink-3 border-b border-line text-left"><th className="py-2">Item</th><th>Type</th><th>End of support</th><th className="text-right">Months left</th><th>Affects</th><th>Decision</th><th>Accountable</th><th className="w-36">Stage</th><th>Status</th></tr></thead>
            <tbody>{rows.map(({ e, st }) => (
              <tr key={e.item} className="border-b border-line last:border-0 align-top">
                <td className="py-2.5"><div className="font-medium text-ink">{e.item}</div><div className="text-xs text-ink-3">{e.version}</div></td>
                <td className="text-xs">{e.type}</td>
                <td className="whitespace-nowrap">{e.endOfSupport}</td>
                <td className={`text-right font-semibold ${e.monthsLeft < 0 ? 'text-crit-text' : e.monthsLeft <= 6 ? 'text-warn-text' : ''}`}>{e.monthsLeft < 0 ? `${-e.monthsLeft} overdue` : e.monthsLeft}</td>
                <td className="text-xs">{e.apps}</td>
                <td>{e.decision}{e.exceptionExpiry && <div className={`text-xs ${e.exceptionExpiry.startsWith('Expired') ? 'text-crit-text' : 'text-ink-3'}`}>exception: {e.exceptionExpiry}</div>}</td>
                <td className="text-xs">{e.appOwner}</td>
                <td><StagePath imp={{ current: '', proposed: '', feasibility: 0, stage: e.stage, owner: '' }} compact /><div className="text-[11px] text-ink-3 mt-1">{e.stage}</div></td>
                <td><Badge>{st.health}</Badge>{st.reasons.length > 0 && <div className="text-xs text-ink-3 mt-0.5">{st.reasons[0]}</div>}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-5">
        <Card title="Who takes care of end of life">
          <ul className="space-y-2 text-sm">{eolRaci.map((r) => (
            <li key={r.role} className="flex gap-3 border-b border-line last:border-0 pb-2"><span className="font-semibold text-ink w-40 shrink-0">{r.role}</span><span className="text-ink-2">{r.does}</span></li>
          ))}</ul>
        </Card>
        <Card title="Decision options">
          <ul className="space-y-2 text-sm">
            {[['Upgrade', 'Move to a supported version of the same product'], ['Replace', 'Switch to a different product or platform'], ['Retire', 'Remove it — the capability is no longer needed'], ['Extended support', 'Pay the vendor for patches for a fixed period'], ['Risk accepted', 'Time-limited exception signed by the CISO, with compensating controls']].map(([d, t]) => (
              <li key={d} className="flex gap-3 border-b border-line last:border-0 pb-2"><span className="font-semibold text-ink w-36 shrink-0">{d}</span><span className="text-ink-2">{t}</span></li>
            ))}
          </ul>
          <p className="text-xs text-ink-3 mt-3">Each choice goes through the Decision Center with a named approver. Alerts fire at 12, 6 and 3 months.</p>
        </Card>
      </div>
    </>
  )
}
