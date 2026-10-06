import { useState } from 'react'
import { Link } from 'react-router-dom'
import { riskRegister } from '../data/signals'
import type { Severity } from '../data/signals'
import { domainOrder, domains } from '../data/domains'
import { Badge, Card, PageHeader, Stat } from '../components/ui'

export default function RiskRegister() {
  const all = riskRegister()
  const [domain, setDomain] = useState('All domains')
  const [sev, setSev] = useState<Severity | 'All'>('All')
  const list = all.filter((r) => (domain === 'All domains' || r.domain === domain || r.domain === 'All') && (sev === 'All' || r.severity === sev))
  const sources = [...new Set(all.map((r) => r.source))]
  const controlTone = { Effective: 'Compliant', Partial: 'Partial', Gap: 'Gap' } as const

  return (
    <>
      <PageHeader title="Risk register" subtitle="One consolidated view of technology risk across applications, cyber, recovery, vendors, end of life and the programme" owner="Vaibhav" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <Stat label="Open risks" value={all.length} sub={`${sources.length} sources`} />
        <Stat label="Critical" value={all.filter((r) => r.severity === 'Critical').length} sub="need executive attention" tone="crit" />
        <Stat label="High" value={all.filter((r) => r.severity === 'High').length} sub="owner action this quarter" tone="warn" />
        <Stat label="Controls with a gap" value={all.filter((r) => r.control === 'Gap').length} sub="no effective control yet" tone="warn" />
      </div>

      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <label className="text-sm flex items-center gap-2">Domain
          <select value={domain} onChange={(e) => setDomain(e.target.value)} className="border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-sm">
            {['All domains', ...domainOrder.map((d) => domains[d].name)].map((d) => <option key={d}>{d}</option>)}
          </select>
        </label>
        <div className="flex rounded-lg border border-slate-300 overflow-hidden text-sm bg-white" role="group" aria-label="Severity">
          {(['All', 'Critical', 'High'] as const).map((s) => (
            <button key={s} onClick={() => setSev(s)} className={`px-3 py-1.5 ${sev === s ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-ink-2 hover:bg-slate-50'}`}>{s}</button>
          ))}
        </div>
        <span className="text-sm text-ink-3 ml-auto">{list.length} shown</span>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[1180px] [&_th]:px-2 [&_td]:px-2">
            <thead><tr className="text-[11px] uppercase tracking-wide text-ink-3 border-b border-line text-left">
              <th className="py-2">Risk</th><th>Severity</th><th>Business impact</th><th>Technology impact</th><th>Control</th><th>Owner</th><th>Mitigation</th><th>Due</th><th>Evidence</th>
            </tr></thead>
            <tbody>{list.map((r) => (
              <tr key={r.id} className="border-b border-line last:border-0 align-top">
                <td className="py-2.5"><Link to={r.link} className="font-semibold text-ink hover:underline">{r.title}</Link><div className="text-xs text-ink-3">{r.domain} · {r.source}</div></td>
                <td><Badge>{r.severity}</Badge></td>
                <td className="text-xs text-ink-2 max-w-[180px]">{r.businessImpact}</td>
                <td className="text-xs text-ink-2 max-w-[200px]">{r.techImpact}</td>
                <td><Badge>{controlTone[r.control]}</Badge></td>
                <td className="text-xs">{r.owner}</td>
                <td className="text-xs max-w-[200px]">{r.mitigation}</td>
                <td className={`text-xs min-w-[80px] ${r.due === 'Overdue' ? 'text-crit-text font-semibold' : ''}`}>{r.due}</td>
                <td className="text-xs text-ink-3 max-w-[160px]">{r.evidence}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
        <p className="text-xs text-ink-3 mt-2">Built automatically from the domain tabs and the TEDIF risk register — fix the source and the risk updates here. Red is used only for genuinely critical items.</p>
      </Card>
    </>
  )
}
