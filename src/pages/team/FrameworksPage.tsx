// /team/frameworks — the lean framework library: which framework when, what is applied (with metrics) per owner,
// what stays as reference, and syllabus coverage. Detail: docs/SYLLABUS_AND_FRAMEWORKS.md.
import { Link } from 'react-router-dom'
import { BookOpen, CircleCheck } from 'lucide-react'
import { Card, PageHeader } from '../../components/ui'

const T = (o: string) => `/team/${o}?tab=frameworks`
// framework → where it is applied (only frameworks implemented with a metric or already built)
const APPLIED: Record<string, { to: string; label: string }> = {
  'Balanced Scorecard': { to: T('ram'), label: 'Ram' }, Cynefin: { to: T('ram'), label: 'Ram' }, RAPID: { to: T('ram'), label: 'Ram' }, OODA: { to: T('ram'), label: 'Ram' },
  'Three Horizons': { to: T('suman'), label: 'Suman' }, 'Value vs Effort': { to: '/team/suman?tab=portfolio', label: 'Suman' }, 'Stage-Gate': { to: '/team/suman?tab=portfolio', label: 'Suman' },
  'Business Model Canvas': { to: '/team/suman?tab=onboard', label: 'Suman' }, 'Diffusion of Innovations': { to: T('suman'), label: 'Suman' }, 'Crossing the Chasm': { to: T('suman'), label: 'Suman' },
  'NPV / IRR / ROI / TCO': { to: T('santhosh'), label: 'Santhosh' }, 'Run-Grow-Transform': { to: T('santhosh'), label: 'Santhosh' }, 'Sensitivity (tornado)': { to: T('santhosh'), label: 'Santhosh' },
  'Three Lines': { to: T('vaibhav'), label: 'Vaibhav' }, 'Risk Matrix / Heat Map': { to: '/team/vaibhav?tab=models', label: 'Vaibhav' },
  'Theory of Constraints': { to: T('pankaj'), label: 'Pankaj' }, 'Kotter': { to: '/team', label: 'Team' }, ADKAR: { to: '/team', label: 'Team' }, Lewin: { to: '/team', label: 'Team' },
  RACI: { to: '/team', label: 'Team' }, 'Digital Maturity Model': { to: '/team/suman?tab=readiness', label: 'Suman' }, 'Capability Maturity Model': { to: '/domain/banking/decisions?tab=maturity', label: 'Decision Intelligence' },
}
const GUIDE: [string, string[]][] = [
  ["What's happening outside?", ['PESTLE', 'Five Forces']], ['Where are we?', ['SWOT', 'VRIO']], ['Where should we compete?', ['Porter', 'Ansoff', 'Blue Ocean']],
  ['Where is the value?', ['Value Chain', 'Business Model Canvas']], ['What should we invest in?', ['Three Horizons', 'NPV / IRR / ROI / TCO']], ['What should we prioritise?', ['Value vs Effort', 'Stage-Gate']],
  ['How should we organise?', ['McKinsey 7S', 'Operating Model']], ['How do we transform people?', ['Kotter', 'ADKAR']], ['How do we execute?', ['Balanced Scorecard', 'OKRs']],
  ['How do we decide under complexity?', ['Cynefin', 'RAPID']], ['How do we govern risk?', ['Three Lines']],
]
const OWNERS: [string, string, string, [string, string][]][] = [
  ['ram', 'Ram', 'Multi-domain decision intelligence', [['Balanced Scorecard', 'score per perspective'], ['Cynefin + RAPID', '% with named decider · decision age'], ['OODA', 'loop counts (label)']]],
  ['suman', 'Suman', 'ROI · any organisation to AI', [['Three Horizons', 'H1 share of AI investment vs 70%'], ['Diffusion + Crossing the Chasm', '% live use cases past the chasm'], ['Business Model Canvas', 'generated in onboarding'], ['Stage-Gate · Value vs Effort · NPV', 'already built']]],
  ['vaibhav', 'Vaibhav', 'Regulatory automation · DPDP / AI governance', [['Three Lines Model', '% high / critical risks with all three lines'], ['Risk process · heat map', 'already built']]],
  ['santhosh', 'Santhosh', 'Governance system · CAPEX / OPEX', [['Run-Grow-Transform', 'gap from 60 / 25 / 15 mix'], ['Sensitivity (tornado)', 'investments negative at −20% value'], ['TCO', '5-year cost per initiative'], ['NPV / IRR', 'already built']]],
  ['pankaj', 'Pankaj', 'ERP RCA · capacity · production', [['Theory of Constraints', 'capacity margin at worst peak'], ['Lewin', 'label on production automation'], ['Pareto · ITIL · SRE', 'already built']]],
]
const MASTER = ['PESTLE', 'Five Forces', 'SWOT', 'Porter Value Chain', 'Ansoff', 'Three Horizons', 'Business Model Canvas', 'Balanced Scorecard', 'OKRs', 'Stage-Gate', 'McKinsey 7S', 'Kotter', 'ADKAR', 'Cynefin', 'Three Lines']
const REFERENCE = ['SWOT', 'PESTLE', 'Five Forces', 'VRIO', 'Porter generic strategies', 'Porter value chain', 'Ansoff', 'BCG matrix', 'Blue Ocean', 'Mintzberg 5Ps', 'Strategy Maps', 'OKRs (Transformation tab works this way)', 'Jobs-to-be-Done', 'Value Proposition Canvas', 'Lean Startup', 'Design Thinking', 'Pipeline vs platform', 'Network effects', 'Winner-take-all', 'XaaS', 'McKinsey 7S', 'Galbraith Star', 'Operating Model Canvas', 'Theory E vs O', 'DuPont / ROIC', 'CVP', 'ESG']

function FwLink({ name }: { name: string }) {
  const a = APPLIED[name]
  return a ? <Link to={a.to} className="inline-flex items-center gap-1 text-xs font-medium rounded-md border border-green-200 bg-success-bg text-success-text px-1.5 py-0.5 hover:underline"><CircleCheck size={11} />{name} · {a.label}</Link>
    : <span className="text-xs rounded-md border border-line bg-slate-50 text-ink-2 px-1.5 py-0.5">{name} · reference</span>
}

export default function FrameworksPage() {
  return (
    <>
      <PageHeader title="Frameworks & syllabus" subtitle="Lean by design: frameworks are applied only where they serve a team member's problem and produce a tracked metric — the rest is a reference toolbox" />
      <div className="rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-900 mb-5 flex gap-2"><BookOpen size={16} className="shrink-0 mt-0.5" /><span><b>"You don't need 100 frameworks."</b> Choose and apply the right one when a CEO, CFO, COO or business leader brings a problem. Green = applied in CTO360 on simulated data (click to open); grey = reference. Plain-language explanations with diagrams: <Link to="/team/reference" className="font-semibold underline">Reference library</Link>.</span></div>
      <Card title="Which framework when · executive decision guide" className="mb-5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <tbody>{GUIDE.map(([q, fs]) => (
              <tr key={q} className="border-b border-line last:border-0"><td className="py-2 pr-3 font-medium text-ink w-72">{q}</td><td className="py-2"><div className="flex flex-wrap gap-1.5">{fs.map((f) => <FwLink key={f} name={f} />)}</div></td></tr>
            ))}</tbody>
          </table>
        </div>
      </Card>
      <Card title="Applied per owner · with tracked metrics" className="mb-5">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">{OWNERS.map(([id, name, prob, fs]) => (
          <Link key={id} to={T(id)} className="rounded-xl border border-line p-3 hover:border-brand-600 transition">
            <div className="font-semibold text-ink">{name}</div><div className="text-[11px] text-ink-3 mb-2">{prob}</div>
            <ul className="space-y-1.5">{fs.map(([f, m]) => <li key={f} className="text-xs"><b className="text-ink">{f}</b><div className="text-ink-3">{m}</div></li>)}</ul>
          </Link>
        ))}</div>
        <p className="text-xs text-ink-3 mt-3">Team level: Kotter 8 steps + ADKAR per stakeholder group + Lewin on the <Link to="/team" className="text-brand-600 hover:underline">Team page</Link>. RACI already there.</p>
      </Card>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <Card title="The 15 to master deeply">
          <div className="flex flex-wrap gap-1.5">{MASTER.map((m) => <FwLink key={m} name={m === 'Porter Value Chain' ? 'Value Chain' : m} />)}</div>
          <p className="text-xs text-ink-3 mt-2">Order: understand outside → position → value → invest → prioritise → organise → transform people → execute → decide → govern risk.</p>
        </Card>
        <Card title="Reference toolbox (not built as screens)">
          <div className="flex flex-wrap gap-1.5">{REFERENCE.map((r) => <span key={r} className="text-xs rounded-md border border-line bg-slate-50 text-ink-2 px-1.5 py-0.5">{r}</span>)}</div>
          <p className="text-xs text-ink-3 mt-2">Explained with their CTO use in the project's syllabus & frameworks document; consolidated: Three Horizons = McKinsey Horizons, ADKAR = Prosci ADKAR. Eisenhower, RICE and Bow-Tie left out as too tactical for this level.</p>
        </Card>
      </div>
      <Card title="Syllabus coverage (4 pillars)" className="mt-5">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 text-sm">{[
          ['Pillar 1 · Technology stack & strategy', 'CTO role, data strategy, AI, cloud, GenAI, robotics, tech × organisational strategy; blockchain and industrial-metaverse ideas in the AI portfolio (H3)'],
          ['Pillar 2 · Digital strategy & innovation', 'Adoption (diffusion, chasm), value-chain digitalisation, implementation and renewal; platform economics as reference'],
          ['Pillar 3 · Technology & organisational leadership', 'NPV / IRR / TCO, sensitivity, capital allocation (Run-Grow-Transform), innovation portfolio, outsourcing / vendors, product & agile, change management'],
          ['Pillar 4 · Governance, ethics & impact', 'IT governance (TEDIF), algorithmic bias and model risk, cybersecurity, Three Lines, alliances; ESG as reference'],
        ].map(([h, v]) => <div key={h} className="rounded-lg border border-line p-3"><div className="font-semibold text-ink mb-1">{h}</div><div className="text-xs text-ink-2">{v}</div></div>)}</div>
      </Card>
    </>
  )
}
