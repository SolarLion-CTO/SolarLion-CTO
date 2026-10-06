import { coeTeam, raci, raciRoles, training } from '../../data/cto'
import { domainOrder, domains } from '../../data/domains'
import { Card, PageHeader } from '../../components/ui'

const raciTone = (c: string) => (c.startsWith('A') ? 'bg-brand-900 text-white' : c.startsWith('R') ? 'bg-blue-600 text-white' : c.startsWith('C') ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-500')

export default function OperatingModel() {
  return (
    <>
      <PageHeader title="Operating Model & AI CoE" subtitle="People, process and ownership — who decides, who builds, who is accountable" owner="Ram (CTO)" />

      <Card title="Hub-and-spoke AI Centre of Excellence" className="mb-6">
        <div className="flex flex-col items-center">
          <div className="rounded-xl bg-brand-900 text-white px-6 py-4 text-center max-w-xl">
            <div className="text-xs uppercase tracking-wide text-blue-200">Hub · AI CoE (central)</div>
            <div className="font-bold">CTO · TEDIF office · architects · AI platform · governance</div>
            <div className="text-xs text-blue-200 mt-1">Owns standards, the control layer, the decision catalogue, gates and the risk register</div>
          </div>
          <div className="w-px h-6 bg-slate-300" />
          <div className="grid md:grid-cols-3 gap-4 w-full">
            {domainOrder.map((d) => (
              <div key={d} className="rounded-xl border-2 border-blue-200 bg-blue-50 p-3 text-center">
                <div className="text-xs uppercase tracking-wide text-blue-700">Spoke</div>
                <div className="font-bold">{domains[d].name}</div>
                <div className="text-xs text-slate-600 mt-1">Domain champion · decision owners · business analyst</div>
                <div className="text-xs text-slate-500">Owns domain decisions, KPIs and adoption</div>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-4 text-center">Hub builds once; spokes configure their domain pack and own the business outcome.</p>
      </Card>

      <Card title="RACI by decision area" className="mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[820px]">
            <thead><tr className="text-[11px] uppercase text-slate-500 border-b text-left"><th className="py-2">Decision area</th>{raciRoles.map((r) => <th key={r} className="text-center px-1">{r}</th>)}</tr></thead>
            <tbody>{raci.map((r) => (
              <tr key={r.area} className="border-b last:border-0"><td className="py-2 pr-2 font-medium">{r.area}</td>{r.cells.map((c, i) => <td key={i} className="text-center px-1"><span className={`inline-block text-[11px] font-bold rounded px-2 py-0.5 ${raciTone(c)}`}>{c}</span></td>)}</tr>
            ))}</tbody>
          </table>
        </div>
        <p className="text-xs text-slate-500 mt-2">R responsible · A accountable · C consulted · I informed. Exactly one A per area. Business owners — not the CTO — are accountable for business decisions.</p>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card title="Minimum viable CoE team (TEDIF 12.2)">
          <table className="w-full text-sm">
            <thead><tr className="text-[11px] uppercase text-slate-500 border-b text-left"><th className="py-2">Role</th><th>FTE</th><th>Source</th></tr></thead>
            <tbody>{coeTeam.map((t) => (
              <tr key={t.role} className="border-b last:border-0"><td className="py-2">{t.role}</td><td className="font-semibold">{t.fte}</td><td><span className={`text-[11px] font-semibold rounded px-1.5 ${t.source === 'New' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'}`}>{t.source}</span></td></tr>
            ))}</tbody>
          </table>
          <p className="text-xs text-slate-500 mt-2">≈ 5–6 FTE, mostly redeployed. Only decision analyst and knowledge engineer are new skills. Scale the team only after Gate 4 proves value.</p>
        </Card>
        <Card title="Adoption & training plan">
          <ul className="space-y-3">{training.map((t) => (
            <li key={t.audience} className="text-sm"><div className="flex justify-between gap-2"><b>{t.audience}</b><span className="text-xs text-slate-500">{t.when}</span></div><div className="text-xs text-slate-600">{t.topic}</div></li>
          ))}</ul>
          <div className="mt-4 rounded-lg bg-blue-50 p-3 text-xs"><b>Process:</b> new idea → intake (owner + KPI) → assessment → Gate 1 → catalogue → shadow → Gate 3 → active → value review at Gate 4.</div>
        </Card>
      </div>
    </>
  )
}
