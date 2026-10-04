import { useStore } from '../store'
import { Badge, Bar, Card, PageHeader, Ring } from '../components/ui'

const principles = [
  ['Human accountability', 'Material decisions are approved by a named human role'],
  ['Trust before intelligence', 'Identity, policy and compliance checks run before any AI inference'],
  ['Data governance', 'Classification, consent, retention and lineage enforced at the data layer'],
  ['Auditability', 'Every agent action, approval and override is recorded'],
  ['Responsible AI', 'Groundedness, bias and explainability evaluated per use case'],
]

export default function Governance() {
  const { domain, audit } = useStore()
  return (
    <>
      <PageHeader title="Regulatory & AI Governance" subtitle="Regulatory automation, DPDP compliance and responsible AI controls" owner="Vaibhav" />
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <Card title="Compliance Score">
          <div className="flex justify-center py-2"><Ring value={domain.kpis.compliance} size={130} color="#16a34a" /></div>
          <div className="grid grid-cols-3 text-center text-xs mt-2">
            <div><div className="text-lg font-bold text-emerald-700">{domain.controls.filter((c) => c.status === 'Compliant').length}</div>Compliant</div>
            <div><div className="text-lg font-bold text-amber-600">{domain.controls.filter((c) => c.status === 'Partial').length}</div>Partial</div>
            <div><div className="text-lg font-bold text-red-600">{domain.controls.filter((c) => c.status === 'Gap').length}</div>Gap</div>
          </div>
        </Card>
        <Card title="Control Catalogue" className="lg:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[520px]">
              <thead><tr className="text-[11px] uppercase text-slate-500 border-b text-left"><th className="py-2">Control</th><th>Regulation / policy</th><th className="w-36">Coverage</th><th>Status</th></tr></thead>
              <tbody>
                {domain.controls.map((c) => (
                  <tr key={c.name} className="border-b">
                    <td className="py-2.5 font-medium">{c.name}</td><td className="text-slate-500">{c.regulation}</td>
                    <td><div className="flex items-center gap-2"><Bar value={c.coverage} color={c.coverage >= 90 ? 'bg-emerald-500' : c.coverage >= 75 ? 'bg-amber-500' : 'bg-red-500'} /><span className="text-xs">{c.coverage}%</span></div></td>
                    <td><Badge>{c.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <Card title="Responsible AI Principles">
          <ul className="space-y-3">
            {principles.map(([t, d]) => (
              <li key={t} className="flex gap-3"><span className="text-emerald-600 font-bold">✓</span><div><div className="font-semibold text-sm">{t}</div><div className="text-xs text-slate-500">{d}</div></div></li>
            ))}
          </ul>
        </Card>
        <Card title="Decision Audit Evidence">
          {audit.length === 0 ? (
            <p className="text-sm text-slate-500">Audit entries appear here as decisions are made in the Decision Center.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {audit.map((a) => (
                <li key={a.decisionId + a.at} className="flex flex-wrap items-center gap-2 border-b pb-2">
                  <Badge>{a.verdict}</Badge><b>{a.decisionId}</b><span className="text-slate-500">{a.by}</span><span className="ml-auto text-xs text-slate-400">{a.at}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  )
}
