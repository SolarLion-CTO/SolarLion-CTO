import type { ReactNode } from 'react'
import { domains } from '../../data/domains'
import { useStore } from '../../store'
import DomainSwitch from '../../components/DomainSwitch'
import { Card, PageHeader } from '../../components/ui'

const tag = { build: 'bg-brand-900 text-white', buy: 'bg-slate-200 text-slate-700', existing: 'bg-white border border-slate-300 text-slate-600' }

function Box({ title, items, kind, wide }: { title: string; items: string[]; kind: keyof typeof tag; wide?: boolean }) {
  return (
    <div className={`rounded-lg border border-line bg-white p-3 ${wide ? 'col-span-full' : ''}`}>
      <div className="flex items-center justify-between mb-1.5"><span className="font-bold text-sm">{title}</span><span className={`text-[9px] font-bold uppercase rounded px-1.5 py-0.5 ${tag[kind]}`}>{kind}</span></div>
      <div className="flex flex-wrap gap-1">{items.map((i) => <span key={i} className="text-[11px] bg-slate-50 border border-line rounded px-1.5 py-0.5">{i}</span>)}</div>
    </div>
  )
}
function Layer({ n, name, children }: { n: number; name: string; children: ReactNode }) {
  return (
    <div className="flex gap-3">
      <div className="w-28 shrink-0 pt-2"><div className="text-[10px] font-bold text-blue-700">LAYER {n}</div><div className="text-xs font-semibold leading-tight">{name}</div></div>
      <div className="flex-1 grid sm:grid-cols-2 lg:grid-cols-3 gap-2">{children}</div>
    </div>
  )
}

export default function Architecture() {
  const { domainId } = useStore()
  const d = domains[domainId]
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <PageHeader title="Enterprise & AI Architecture" subtitle="One control layer for every domain — AI sits between governance controls and a human approval" owner="Ram (CTO)" />
        <div className="mb-6"><DomainSwitch /></div>
      </div>

      <div className="grid xl:grid-cols-4 gap-6 mb-6">
        <Card className="xl:col-span-3">
          <div className="space-y-3">
            <Layer n={1} name="Experience"><Box title="Control tower dashboard" items={['CTO view', 'Domain pages', 'Programme tracker']} kind="build" /><Box title="Decision center" items={['Challenge AI', 'Approve / modify / reject', 'Audit trail']} kind="build" /><Box title="Identity" items={['SSO', 'MFA', 'Role context']} kind="buy" /></Layer>
            <Layer n={2} name="Decision engine"><Box title="Ten-engine runtime" items={['Request', 'Context', 'Policy', 'Knowledge', 'AI', 'Decision', 'Human', 'Execution', 'Audit', 'Learning']} kind="build" wide /></Layer>
            <Layer n={3} name="AI control layer"><Box title="Agent orchestration" items={['Planner', 'Retriever', 'Analyst', 'Verifier', 'Coordinator']} kind="build" /><Box title="RAG knowledge" items={['Vector store', 'Knowledge graph', 'Hybrid search', 'Citations']} kind="buy" /><Box title="Model router" items={['Local LLM (restricted)', 'Cloud LLM (Claude / Grok)', 'Classic ML']} kind="build" /></Layer>
            <Layer n={4} name="Integration"><Box title="MCP connectors" items={['One per system', 'Allow-listed tools', 'Read-only until Gate 3']} kind="build" /><Box title="Events & workflow" items={['Event bus', 'Approval workflow', 'Notifications']} kind="buy" /></Layer>
            <Layer n={5} name={`Enterprise systems · ${d.name}`}><Box title={`${d.name} systems`} items={d.mcpConnectors} kind="existing" wide /></Layer>
            <Layer n={6} name="Platform"><Box title="Hybrid deployment" items={['On-prem for restricted data', 'Cloud for the rest', 'Kubernetes', 'Observability']} kind="buy" /><Box title="Data platform" items={['Postgres + pgvector', 'Object storage', 'Metadata & lineage']} kind="buy" /></Layer>
          </div>
        </Card>
        <div className="space-y-4">
          <section className="rounded-xl border-2 border-dashed border-amber-500 bg-amber-50 p-4">
            <div className="text-xs font-bold uppercase tracking-wide text-amber-800 mb-2">Trust gateway · wraps every layer</div>
            <ul className="text-sm space-y-1">{['Identity & RBAC / ABAC', 'Policy-as-code (pre- and post-inference)', 'Classification routing', 'Masking of restricted fields', 'Audit — no audit, no execution', 'DPDP controls'].map((x) => <li key={x}>• {x}</li>)}</ul>
          </section>
          <Card title="Legend">
            <div className="space-y-1.5 text-xs">
              <div><span className={`font-bold rounded px-1.5 py-0.5 mr-2 ${tag.build}`}>BUILD</span>thin control layer — our differentiator</div>
              <div><span className={`font-bold rounded px-1.5 py-0.5 mr-2 ${tag.buy}`}>BUY</span>commodity: cloud, LLMs, vector DB, identity</div>
              <div><span className={`font-bold rounded px-1.5 py-0.5 mr-2 ${tag.existing}`}>EXISTING</span>enterprise systems, untouched</div>
            </div>
          </Card>
          <Card title="Domain pack = configuration">
            <p className="text-xs text-slate-600">Switching domain changes only layer 5 and the domain pack (decisions, KPIs, policies, connectors). Layers 1–4 and 6 are reused unchanged.</p>
          </Card>
        </div>
      </div>

      <Card title="Technology stack">
        <table className="w-full text-sm">
          <thead><tr className="text-[11px] uppercase text-slate-500 border-b text-left"><th className="py-2">Layer</th><th>Phase 1 · demo (now)</th><th>Phase 2 · pilot</th></tr></thead>
          <tbody>
            {[
              ['Frontend', 'React · Vite · TypeScript · Tailwind · Recharts', 'Same'],
              ['Hosting', 'Vercel', 'Vercel (UI) + container host for API'],
              ['API & decision engine', 'Mock data in the browser', 'Python FastAPI'],
              ['AI', 'Canned answers', 'LLM via model router (local + cloud) · RAG with citations'],
              ['Data & knowledge', 'Static demo data', 'Postgres + pgvector · document store'],
              ['Integration', '—', 'MCP servers for ERP / ITSM / regulatory feed (read-only)'],
            ].map(([l, a, b]) => <tr key={l} className="border-b last:border-0"><td className="py-2 font-semibold">{l}</td><td className="text-slate-600">{a}</td><td>{b}</td></tr>)}
          </tbody>
        </table>
      </Card>
    </>
  )
}
