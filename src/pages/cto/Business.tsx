import { Link } from 'react-router-dom'
import { ArrowRight, Clock, IndianRupee, ShieldAlert } from 'lucide-react'
import { domainOrder, domains } from '../../data/domains'
import { Card, PageHeader } from '../../components/ui'

const chain = ['Isolated AI pilots', 'Duplicated spend', 'No accountable owner', 'Late governance', 'Value cannot be proven']
const beforeAfter = [
  ['AI pilots chosen by enthusiasm', 'AI investment ranked by value and feasibility'],
  ['Governance checked after go-live', 'Governance enforced before any AI runs'],
  ['Decisions with no named owner', 'Every decision has an owner and approver'],
  ['ROI claimed after the fact', 'ROI measured against a baseline'],
  ['Each domain builds its own stack', 'One platform with plug-in domain packs'],
]
const whyNow = [
  ['Regulation is arriving', 'DPDP full compliance due May 2027; banking regulators expect AI model governance'],
  ['AI is becoming agentic', 'Agents now act on ERP, CRM and core systems — control must sit before the model'],
  ['Boards fund evidence', 'Every AI rupee must trace to a KPI and a named owner'],
]

export default function Business() {
  return (
    <>
      <PageHeader title="Business Case" subtitle="Why an enterprise needs a governed, domain-agnostic AI transformation" owner="Ram (CTO)" />

      <Card title="The problem" className="mb-6">
        <div className="flex flex-wrap items-center gap-2">
          {chain.map((c, i) => (
            <span key={c} className="flex items-center gap-2">
              <span className={`rounded-lg px-3 py-2 text-sm font-semibold ${i === chain.length - 1 ? 'bg-amber-500 text-white' : 'bg-slate-100'}`}>{c}</span>
              {i < chain.length - 1 && <ArrowRight size={16} className="text-slate-400" />}
            </span>
          ))}
        </div>
        <p className="mt-4 text-sm font-semibold text-brand-900">CTO question: how do we govern AI once and reuse it across every domain with measurable value?</p>
      </Card>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <Card><div className="flex items-center gap-2 text-rose-700 font-bold mb-1"><IndianRupee size={16} /> Cost</div><div className="text-2xl font-bold">~₹4.6 Cr</div><p className="text-sm text-slate-600">duplicated across three domain stacks (LLM contracts, vector stores, connectors). Same capability bought three times.</p></Card>
        <Card><div className="flex items-center gap-2 text-amber-700 font-bold mb-1"><ShieldAlert size={16} /> Risk</div><div className="text-2xl font-bold">3 gaps</div><p className="text-sm text-slate-600">privacy and audit gaps found after go-live — consent, explainability records, OT security.</p></Card>
        <Card><div className="flex items-center gap-2 text-blue-700 font-bold mb-1"><Clock size={16} /> Speed</div><div className="text-2xl font-bold">21 days</div><p className="text-sm text-slate-600">to map one regulatory circular by hand; 38 h per ERP root cause; 45 days per CAPEX approval.</p></Card>
      </div>

      <Card title="Current state — each domain runs its own AI" className="mb-6">
        <div className="grid md:grid-cols-3 gap-3">
          {domainOrder.map((d) => (
            <div key={d} className="rounded-lg border border-line p-3">
              <div className="font-bold mb-2">{domains[d].name}</div>
              {['Own AI pilot', 'Own data copy', 'Own approval habit', 'Own vendor'].map((x) => <div key={x} className="text-sm bg-slate-50 rounded px-2 py-1 mb-1">{x}</div>)}
            </div>
          ))}
        </div>
        <div className="mt-3 rounded-lg border border-dashed border-red-300 p-3 text-sm"><b className="text-red-700">Missing today:</b> shared decision catalogue · common governance · one value baseline · CTO-wide visibility</div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <Card title="Before → after">
          <table className="w-full text-sm">
            <tbody>{beforeAfter.map(([b, a]) => (
              <tr key={b} className="border-b last:border-0"><td className="py-2 pr-2 text-slate-500">{b}</td><td className="px-2 text-slate-300">→</td><td className="font-semibold text-brand-900">{a}</td></tr>
            ))}</tbody>
          </table>
        </Card>
        <Card title="Why now">
          <ul className="space-y-3">{whyNow.map(([t, d]) => <li key={t}><div className="font-semibold text-sm">{t}</div><div className="text-xs text-slate-500">{d}</div></li>)}</ul>
        </Card>
      </div>

      <section className="rounded-xl bg-amber-50 border border-amber-300 p-5">
        <div className="text-xs font-bold uppercase tracking-wide text-amber-800">The ask</div>
        <div className="grid md:grid-cols-3 gap-3 mt-2 text-sm">
          <div><b>1 · Approve the 90-day foundation</b><div className="text-slate-600">No production AI, no platform purchase, no irreversible commitment.</div></div>
          <div><b>2 · Name one executive sponsor</b><div className="text-slate-600">With genuinely allocated time.</div></div>
          <div><b>3 · Nominate one pilot department</b><div className="text-slate-600">Willing to be assessed honestly.</div></div>
        </div>
        <p className="text-xs text-slate-500 mt-3">Figures are illustrative until the week-4 baseline. <Link to="/cto/strategy" className="text-blue-700 font-semibold">Current → target state →</Link></p>
      </section>
    </>
  )
}
