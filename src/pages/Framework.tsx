import { team } from '../data/domains'
import { Card, PageHeader } from '../components/ui'

const layers = [
  ['Domain layer', 'Banking · Manufacturing · future industries as pluggable domain packs', 'bg-slate-600'],
  ['Business control layer', 'Strategy · Operations · Finance — value, priorities, success measures', 'bg-blue-700'],
  ['Technology foundation', 'Enterprise architecture · Data & AI · Modernization · Integration', 'bg-cyan-700'],
  ['Trust layer', 'Regulatory · Privacy (DPDP) · AI governance · Security · Audit', 'bg-amber-600'],
  ['AI control layer', 'Agentic AI · policy-aware workflows · human approval · KPI monitoring', 'bg-violet-700'],
  ['Business value layer', 'Growth · Efficiency · Compliance · Automation · Decision quality', 'bg-emerald-700'],
]

const lifecycle = ['Discover', 'Assess', 'Prioritize', 'Architect', 'Pilot', 'Govern', 'Measure', 'Scale']

export default function Framework() {
  return (
    <>
      <PageHeader title="The Framework" subtitle="Domain-agnostic enterprise AI transformation — one model, any industry" />
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <Card title="Framework Layers">
          <div className="space-y-2">
            {layers.map(([t, d, c]) => (
              <div key={t} className={`${c} text-white rounded-lg px-4 py-3`}>
                <div className="font-bold text-sm">{t}</div>
                <div className="text-xs opacity-90">{d}</div>
              </div>
            ))}
          </div>
        </Card>
        <div className="space-y-6">
          <Card title="Transformation Lifecycle">
            <div className="flex flex-wrap items-center gap-2">
              {lifecycle.map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <span className="bg-blue-50 border border-blue-200 text-blue-800 text-sm font-semibold rounded-lg px-3 py-1.5">{i + 1}. {s}</span>
                  {i < lifecycle.length - 1 && <span className="text-slate-400">→</span>}
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-3">Each phase ends in a decision gate; evidence from one phase funds the next.</p>
          </Card>
          <Card title="Core Principles">
            <ul className="text-sm space-y-2">
              <li><b>Business drives technology</b> — every initiative traces to a business objective.</li>
              <li><b>Trust before intelligence</b> — governance is enforced before AI is switched on.</li>
              <li><b>AI recommends, humans decide</b> — accountability never transfers to a model.</li>
              <li><b>Measurable value</b> — baselines first, then measured outcomes.</li>
              <li><b>Domain-agnostic</b> — reusable core, modular domain packs.</li>
            </ul>
          </Card>
          <Card title="Team & Workstreams">
            <ul className="text-sm divide-y">
              {team.map((t) => <li key={t.name} className="py-2 flex justify-between gap-2"><b>{t.name}</b><span className="text-slate-500 text-right">{t.area}</span></li>)}
            </ul>
          </Card>
        </div>
      </div>
    </>
  )
}
