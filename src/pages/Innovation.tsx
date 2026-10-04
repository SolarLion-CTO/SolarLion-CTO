import { domainOrder, domains } from '../data/domains'
import { useStore } from '../store'
import ProblemPanel from '../components/ProblemPanel'
import { Badge, Card, PageHeader, money } from '../components/ui'

// Innovation = CTO technical problem solving (PPT slide 6): the reusable
// technical patterns that make AI safe and repeatable across domains.
const patterns = [
  { name: 'MCP connectors', what: 'One standard connector per enterprise system, reused across domains', reuse: 'Core banking, ERP, MES, POS, ITSM' },
  { name: 'RAG knowledge layer', what: 'Answers cite approved policies, SOPs and records', reuse: 'Policy library, SOPs, runbooks' },
  { name: 'Classification model router', what: 'Restricted data → local LLM; public/internal → cloud LLM', reuse: 'Every decision in every domain' },
  { name: 'Bounded agents', what: 'Allow-listed tools; humans approve anything consequential', reuse: 'Planner · retriever · analyst · verifier' },
  { name: 'Decision runtime', what: 'Ten engines — trust checks run before the model', reuse: 'All decisions' },
]

const radar = [
  { stage: 'Explore', items: ['Digital twin of production line', 'GenAI-assisted legacy code analysis'] },
  { stage: 'Pilot', items: ['Predictive maintenance', 'Demand forecasting & markdown', 'MCP control layer for core banking'] },
  { stage: 'Scale', items: ['RAG over policies and SOPs', 'RCA agent across domains'] },
]

export default function Innovation() {
  const { domain } = useStore()
  return (
    <>
      <PageHeader title="Innovation" subtitle="CTO technical problem solving — reusable patterns that make AI safe and repeatable" owner="Ram" />
      <ProblemPanel p={domain.problems.Innovation} domainName={domain.name} />

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {domainOrder.map((id) => {
          const p = domains[id].problems.Innovation
          return (
            <Card key={id} title={domains[id].name}>
              <div className="font-semibold text-sm mb-1">{p.title}</div>
              <div className="text-xs text-slate-500 mb-2">{p.kpi}: {p.baseline} → <b className="text-slate-800">{p.current}</b> → {p.target}</div>
              <div className="flex gap-2 items-center"><Badge>{p.stage}</Badge><Badge>{p.health}</Badge><span className="ml-auto text-xs font-semibold text-emerald-700">{money(p.valueCr)}/yr</span></div>
            </Card>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card title="Reusable Technical Patterns">
          <table className="w-full text-sm">
            <thead><tr className="text-[11px] uppercase text-slate-500 border-b text-left"><th className="py-2">Pattern</th><th>What it solves</th><th>Reused for</th></tr></thead>
            <tbody>
              {patterns.map((p) => (
                <tr key={p.name} className="border-b align-top"><td className="py-2.5 font-semibold pr-2">{p.name}</td><td className="pr-2">{p.what}</td><td className="text-slate-500 text-xs">{p.reuse}</td></tr>
              ))}
            </tbody>
          </table>
        </Card>
        <Card title="Technology Radar">
          <div className="space-y-4">
            {radar.map((r) => (
              <div key={r.stage}>
                <div className="text-xs font-bold uppercase text-blue-700 mb-1">{r.stage}</div>
                <div className="flex flex-wrap gap-1.5">{r.items.map((i) => <span key={i} className="text-xs bg-slate-100 rounded px-2 py-1">{i}</span>)}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-lg bg-blue-50 p-3 text-xs"><b>Build vs buy:</b> buy commodity layers (cloud, LLMs, vector DB, identity); build only the thin control layer that differentiates.</div>
        </Card>
      </div>
    </>
  )
}
