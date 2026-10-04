import { Link } from 'react-router-dom'
import { CircleCheck } from 'lucide-react'
import { Card, PageHeader } from '../../components/ui'

// The 14 CTO dimensions an evaluator looks for, each linked to the screen that proves it.
const rows: { dim: string; demonstrate: string; evidence: [string, string][] }[] = [
  { dim: 'Business', demonstrate: 'Why an enterprise needs AI transformation', evidence: [['Business case', '/cto/business'], ['Problem matrix', '/problems']] },
  { dim: 'Strategy', demonstrate: 'Current state → target state', evidence: [['Current → target', '/cto/strategy'], ['Strategy tracker', '/tracker/strategy']] },
  { dim: 'Assessment', demonstrate: 'AI readiness or maturity scoring', evidence: [['Readiness assessment', '/cto/assessment'], ['TEDIF tracker', '/tedif']] },
  { dim: 'Portfolio', demonstrate: 'Identification and prioritisation of use cases', evidence: [['Value × feasibility', '/cto/portfolio'], ['Strategy & ROI', '/strategy']] },
  { dim: 'Finance', demonstrate: 'Cost, benefit, ROI, TCO and investment decisions', evidence: [['Finance & TCO', '/finance'], ['ROI tracker', '/tracker/roi'], ['Finance tracker', '/tracker/finance']] },
  { dim: 'Technology', demonstrate: 'Enterprise and AI architecture', evidence: [['Architecture', '/cto/architecture'], ['Innovation', '/innovation']] },
  { dim: 'Data', demonstrate: 'Data readiness, quality and integration', evidence: [['Data readiness', '/cto/data']] },
  { dim: 'AI', demonstrate: 'ML, GenAI, RAG and agentic AI selection', evidence: [['AI selection', '/cto/ai-selection'], ['AI agents', '/agents'], ['Decision runtime', '/decisions']] },
  { dim: 'Governance', demonstrate: 'Responsible AI, risk, security and compliance', evidence: [['Governance', '/governance'], ['Governance tracker', '/tracker/governance'], ['TEDIF risks', '/tedif']] },
  { dim: 'Operating model', demonstrate: 'People, process, ownership and CoE', evidence: [['Operating model & CoE', '/cto/operating-model'], ['Programme tracker', '/tracker']] },
  { dim: 'Execution', demonstrate: 'Roadmap, phases and milestones', evidence: [['Roadmap', '/cto/roadmap'], ['TEDIF gates', '/tedif']] },
  { dim: 'Measurement', demonstrate: 'KPIs, business outcomes and value realisation', evidence: [['Business value', '/value'], ['Overview KPIs', '/']] },
  { dim: 'Cross-industry', demonstrate: 'Banking + Manufacturing applicability', evidence: [['Banking', '/domain/banking'], ['Manufacturing', '/domain/manufacturing'], ['Retail (config)', '/domain/retail']] },
  { dim: 'Leadership', demonstrate: 'What the CTO / control tower actually decides', evidence: [['CTO decisions', '/cto/decisions'], ['Decision center', '/decisions']] },
]

export default function Coverage() {
  return (
    <>
      <PageHeader title="Capstone Coverage" subtitle="The 14 CTO dimensions — each one linked to the screen that demonstrates it" />
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[760px]">
            <thead><tr className="text-[11px] uppercase text-slate-500 border-b text-left"><th className="py-2 w-8">#</th><th>CTO dimension</th><th>What the project demonstrates</th><th>Evidence (click to open)</th></tr></thead>
            <tbody>{rows.map((r, i) => (
              <tr key={r.dim} className="border-b last:border-0">
                <td className="py-2.5 font-bold text-blue-700">{i + 1}</td>
                <td className="font-semibold"><span className="inline-flex items-center gap-1"><CircleCheck size={15} className="text-emerald-600" />{r.dim}</span></td>
                <td className="text-slate-600">{r.demonstrate}</td>
                <td><div className="flex flex-wrap gap-1.5">{r.evidence.map(([label, to]) => <Link key={to} to={to} className="text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200 rounded px-2 py-1 hover:bg-blue-100">{label} →</Link>)}</div></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </Card>
      <p className="text-xs text-slate-500 mt-3">Tip for the presentation: keep this page open and jump to evidence when an evaluator asks “where is…?”.</p>
    </>
  )
}
