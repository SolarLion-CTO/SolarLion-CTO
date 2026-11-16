// Capstone story at the top of the home page: problem statement, methodology, results, recommendations and conclusion.
// Mirrors the 9-slide deck (17 Nov 2026): five high priorities, top 5 problems per industry, 16 departments, KPI-first method.
// No simulation metrics here: results are old state → target state percentages, labelled as targets.
import { useState } from 'react'
import { ArrowRight, Check, ChevronDown } from 'lucide-react'

const PRIOS = [
  { name: 'Growth', q: 'How is technology driving growth and competitive advantage?' },
  { name: 'Return', q: 'What measurable return do we get from technology and AI?' },
  { name: 'Risk', q: 'How well protected are we against cyber, regulatory and AI risks, and how fast can we recover?' },
  { name: 'AI Transformation', q: 'Which processes has AI transformed, and what has it delivered?' },
  { name: 'Readiness', q: 'Do we have the capabilities and people for the next disruption?' },
]
const PROBLEMS = {
  Banking: ['Fraud and money laundering', 'Legacy core banking', 'Credit risk and loan defaults', 'Customer experience and personalisation', 'Regulatory compliance and data governance'],
  Manufacturing: ['Unplanned equipment downtime', 'Quality defects and rework', 'Supply chain disruptions', 'Engineering design inefficiency', 'Production planning and low OEE'],
}
const ROOT = [['Scattered work', 'across 16 departments and separate tools'], ['No common KPIs', 'linking department work to high priorities'], ['No transparency', 'across departments or up the hierarchy'], ['Opinion, not evidence', 'progress reported without proof']]
const THREAD = ['High priority', 'Priority problem', 'Department owner', 'KPI driver tree', 'Minimum data', 'Simplest AI model', 'Shadow run', 'Human decision', 'Priority scorecard']
const STEPS = [
  ['Prioritise', 'Rank the 5 problems by impact × feasibility; one pilot per industry', 'Value × feasibility matrix'],
  ['Driver tree', 'One outcome KPI and 3 to 4 driver KPIs, each with a department owner', 'Balanced Scorecard, OKRs'],
  ['Minimum data', 'Only the data that moves each driver: numbers, text, images, audio, video', 'Data audit, privacy by design'],
  ['Simplest model', 'Rules first, then machine learning, then deep learning only if needed', 'CRISP-DM'],
  ['Shadow run', 'AI recommends while people decide as before; live above 80% agreement', 'TEDIF shadow run'],
  ['Share', 'Team, department, cross-department and leadership views by role', 'RBAC, data classification'],
  ['Prove and scale', 'Compare with a unit without AI; scale to the next problem and industry', 'Before and after, comparison group'],
]
const TOOLS = [
  ['Growth', 'Planview, Power BI', 'Balanced Scorecard, OKRs, Three Horizons'],
  ['Return', 'Apptio, FinOps tools', 'TBM, payback, stage-gate funding, benefits realisation'],
  ['Risk', 'ServiceNow GRC, Vanta, Splunk', 'NIST AI RMF, ISO 42001, three lines of defence, PSI drift'],
  ['AI Transformation', 'Celonis, Databricks, MLflow', 'Process mining, machine learning, NLP, computer vision'],
  ['Readiness', 'LeanIX, skills platforms', 'TIME model, AI maturity model, ADKAR'],
]
const DATA_AI = [['Numbers', 'Anomaly detection, forecasting', 'Fraud patterns, machine failure'], ['Text and transcripts', 'NLP: extraction, summarising', 'Regulatory circulars, meeting actions'],
  ['Images and video', 'Computer vision', 'Defect inspection, KYC documents'], ['Audio', 'Speech models', 'Call centre themes, machine sounds']]
const GOV = ['A named owner approves at every gate', 'An audit trail records every step', 'Role-based access controls who sees what', 'Transparency within and across 16 departments', 'Consent and data masking for DPDP']
const RESULTS: { p: string; m: string; old: number; target: number; note?: string }[] = [
  { p: 'Growth', m: 'AI initiatives linked to a strategic KPI', old: 20, target: 100 },
  { p: 'Return', m: 'Investments with baseline and value tracking', old: 15, target: 100 },
  { p: 'Risk', m: 'AI models approved before go-live', old: 30, target: 100 },
  { p: 'AI Transformation', m: 'AI pilots reaching production', old: 20, target: 60 },
  { p: 'AI Transformation', m: 'Decision cycle time (share of old time)', old: 100, target: 15, note: '85% faster' },
  { p: 'Readiness', m: 'Technology within vendor support', old: 40, target: 90 },
  { p: 'All priorities', m: 'Departments with shared KPI visibility (of 16)', old: 0, target: 100 },
]
const RECS: [string, [string, string][]][] = [
  ['For the enterprise', [['Growth', 'Fund AI only when tied to a strategic KPI'], ['Return', 'No funding without a baseline and value tracking'], ['Risk', 'Register and approve every AI model; monitor drift'], ['AI Transformation', 'Two pilots, a shadow run, then scale'], ['Readiness', 'Retire unsupported technology; build AI skills']]],
  ['For society', [['Humans decide', 'A named person at every AI gate'], ['Privacy by design', 'Minimum data under the DPDP Act'], ['Fair and explainable', 'Credit and service decisions people can trust'], ['Safer and reliable', 'Fewer breakdowns in plants and services'], ['Transparent', 'Role-based, verifiable reporting']]],
  ['For the individual', [['Think KPI-first', 'Start from the outcome, not the tool'], ['Data literacy', 'Read and build a driver tree'], ['T-shaped skills', 'Domain plus data plus AI'], ['Own every decision', 'AI supports, you decide'], ['Communicate outcomes', 'Not activity or effort']]],
]
const ROADMAP = [['0 to 6 months', '2 pilots: Fraud and Downtime'], ['6 to 12 months', 'Shadow run, then go-live'], ['12 to 24 months', 'All 10 problems, 16 departments, new industries']]
const TABS = ['Problem statement', 'Methodology', 'Results', 'Recommendations', 'Conclusion'] as const
type Tab = typeof TABS[number]

const Label = ({ children }: { children: React.ReactNode }) => <div className="text-[11px] font-bold tracking-widest uppercase text-brand-600 mb-2">{children}</div>
const Num = ({ n, dark = false }: { n: number | string; dark?: boolean }) => <span className={`shrink-0 w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center ${dark ? 'bg-brand-900' : 'bg-brand-600'} text-white`}>{n}</span>
const Panel = ({ title, children, className = '' }: { title?: string; children: React.ReactNode; className?: string }) => (
  <div className={`rounded-xl border border-line bg-surface p-4 border-t-[3px] border-t-brand-600 ${className}`}>
    {title && <h3 className="text-[15px] font-semibold text-ink mb-3">{title}</h3>}
    {children}
  </div>
)

function Problem() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr_1fr] gap-4">
        <Panel title="Five high priorities">
          <ol className="space-y-2.5">{PRIOS.map((p, k) => <li key={p.name} className="flex gap-2.5"><Num n={k + 1} /><p className="text-sm text-ink-2 leading-snug"><b className="text-ink">{p.name}:</b> {p.q}</p></li>)}</ol>
        </Panel>
        {(Object.keys(PROBLEMS) as (keyof typeof PROBLEMS)[]).map((ind, i) => (
          <div key={ind} className="rounded-xl border border-line bg-surface overflow-hidden">
            <div className={`${i ? 'bg-brand-600' : 'bg-brand-900'} text-white text-sm font-semibold px-4 py-2.5`}>{ind} · Top 5 problems</div>
            <ol className="p-4 space-y-2.5">{PROBLEMS[ind].map((t, k) => <li key={t} className="flex gap-2.5 items-center"><Num n={k + 1} dark={!i} /><span className="text-sm text-ink">{t}</span></li>)}</ol>
          </div>
        ))}
      </div>
      <div>
        <Label>Root cause, the same in both industries</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">{ROOT.map(([h, d]) => <div key={h} className="rounded-lg bg-brand-50 border border-line px-3 py-2 text-sm text-ink-2"><b className="text-ink">{h}:</b> {d}</div>)}</div>
      </div>
      <div className="rounded-xl bg-brand-900 text-white p-4 grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-4">
        <p className="text-[15px] leading-snug"><b className="text-accent">Problem: </b>enterprises are solving their top priority problems with AI, but with work spread across 16 departments, no common KPIs and no shared visibility, progress on high priorities cannot be shown with evidence.</p>
        <p className="text-[15px] leading-snug lg:border-l lg:border-white/20 lg:pl-4"><b className="text-accent">Research question: </b>can one domain-agnostic framework, built on proven tools, techniques and processes, deliver evidence-based answers on high priorities in any industry?</p>
      </div>
    </div>
  )
}

function Methodology() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-ink-2"><b className="text-ink">Design Science Research:</b> we start from the high priority and work backwards to only the data and AI that move each KPI.</p>
      <div>
        <Label>The golden thread</Label>
        <div className="flex flex-wrap items-center gap-1.5">{THREAD.map((t, k) => <span key={t} className="flex items-center gap-1.5"><span className={`rounded-md px-2.5 py-1.5 text-xs font-semibold text-white ${k === 0 || k === THREAD.length - 1 ? 'bg-brand-900' : 'bg-brand-600'}`}>{t}</span>{k < THREAD.length - 1 && <ArrowRight size={14} className="text-ink-4" aria-hidden />}</span>)}</div>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-[1.35fr_1fr] gap-4">
        <div className="rounded-xl border border-line bg-surface overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead><tr className="bg-brand-900 text-white text-left"><th className="px-3 py-2 font-semibold">Step</th><th className="px-3 py-2 font-semibold">What happens</th><th className="px-3 py-2 font-semibold">Technique</th></tr></thead>
            <tbody>{STEPS.map(([s, w, t], k) => <tr key={s} className={k % 2 ? 'bg-brand-50/60' : ''}><td className="px-3 py-2 font-semibold text-ink whitespace-nowrap">{k + 1}. {s}</td><td className="px-3 py-2 text-ink-2">{w}</td><td className="px-3 py-2 text-ink-2">{t}</td></tr>)}</tbody>
          </table>
        </div>
        <div className="rounded-xl border border-line bg-surface overflow-x-auto">
          <table className="w-full text-sm min-w-[440px]">
            <thead><tr className="bg-brand-900 text-white text-left"><th className="px-3 py-2 font-semibold">High priority</th><th className="px-3 py-2 font-semibold">Tools</th><th className="px-3 py-2 font-semibold">Techniques</th></tr></thead>
            <tbody>{TOOLS.map(([p, tl, tc], k) => <tr key={p} className={k % 2 ? 'bg-brand-50/60' : ''}><td className="px-3 py-2 font-semibold text-ink">{k + 1}. {p}</td><td className="px-3 py-2 text-ink-2">{tl}</td><td className="px-3 py-2 text-ink-2">{tc}</td></tr>)}</tbody>
          </table>
        </div>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-[1.35fr_1fr] gap-4">
        <div>
          <Label>Pilot driver trees and AI by data type</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            {[['Banking · Fraud', 'Fraud losses', ['False-positive alerts', 'Detection speed', 'Model drift']], ['Manufacturing · Downtime', 'Unplanned downtime', ['Early failure warnings', 'Maintenance on time', 'Repeat faults']]].map(([tag, out, ds]) => (
              <Panel key={tag as string}><div className="text-sm font-semibold text-ink mb-2">{tag}</div><div className="rounded-md bg-brand-900 text-white text-xs font-semibold text-center py-1.5 mb-2">Outcome: {out}</div>
                <div className="grid grid-cols-3 gap-1.5">{(ds as string[]).map((d) => <div key={d} className="rounded-md bg-brand-50 border border-line text-[11px] text-ink text-center px-1 py-1.5 leading-tight">{d}</div>)}</div></Panel>
            ))}
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">{DATA_AI.map(([d, t, e]) => <div key={d} className="rounded-lg border border-line bg-surface p-3"><div className="text-sm font-semibold text-ink">{d}</div><div className="text-xs font-semibold text-brand-600 mt-1">{t}</div><div className="text-xs text-ink-3 mt-1">{e}</div></div>)}</div>
        </div>
        <div className="rounded-xl bg-brand-900 text-white p-5">
          <div className="text-[11px] font-bold tracking-widest uppercase text-accent">Governance · TEDIF</div>
          <div className="text-2xl font-bold leading-tight mt-2">AI recommends.<br />Humans decide.</div>
          <ul className="mt-4 space-y-2.5">{GOV.map((g) => <li key={g} className="flex gap-2.5 items-start text-sm text-slate-200"><span className="mt-0.5 w-5 h-5 rounded-full bg-brand-600 flex items-center justify-center shrink-0"><Check size={12} aria-hidden /></span>{g}</li>)}</ul>
        </div>
      </div>
    </div>
  )
}

function Results() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1.6fr_1fr] gap-4">
      <div className="rounded-xl border border-line bg-surface p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <Label>Priority scorecard · old state → target state</Label>
          <div className="flex gap-3 text-xs text-ink-2"><span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-sm bg-ink-4" />Old state</span><span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-sm bg-brand-600" />Target state</span></div>
        </div>
        <div className="space-y-1">{RESULTS.map((r, k) => (
          <div key={r.m} className={`grid grid-cols-1 sm:grid-cols-[1.1fr_1fr_auto] items-center gap-x-4 gap-y-1 rounded-lg px-3 py-2 ${k % 2 ? '' : 'bg-brand-50/60'}`}>
            <div><div className="text-[11px] font-bold text-brand-600">{r.p}</div><div className="text-sm text-ink">{r.m}</div></div>
            <div className="space-y-1" aria-hidden><div className="h-2 rounded-full bg-slate-200"><div className="h-2 rounded-full bg-ink-4" style={{ width: `${r.old}%` }} /></div><div className="h-2 rounded-full bg-slate-200"><div className="h-2 rounded-full bg-brand-600" style={{ width: `${r.target}%` }} /></div></div>
            <div className="text-sm sm:text-right whitespace-nowrap"><span className="text-ink-3">{r.old}% → </span><b className="text-brand-900">{r.target}%</b>{r.note && <div className="text-[11px] font-semibold text-brand-600">{r.note}</div>}</div>
          </div>))}
        </div>
        <p className="text-xs text-ink-3 mt-3">Target state, to be validated through the Fraud and Downtime pilots. Old-state values are illustrative industry baselines.</p>
      </div>
      <Panel title="What the framework delivers">
        <ol className="space-y-3">{[['One priority scorecard', 'five high priorities shown with evidence'], ['16 departments', 'on common KPIs with role-based transparency'], ['10 priority problems', 'each with an owner and a driver tree'], ['Domain-agnostic', 'the same process for banking and manufacturing'], ['Live demonstration', 'this site shows the framework in action, below']].map(([h, d], k) => (
          <li key={h} className="flex gap-2.5"><Num n={k + 1} /><div><div className="text-sm font-semibold text-ink">{h}</div><div className="text-xs text-ink-2">{d}</div></div></li>))}
        </ol>
      </Panel>
    </div>
  )
}

function Recommendations() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">{RECS.map(([t, items], i) => (
        <div key={t} className="rounded-xl border border-line bg-surface overflow-hidden">
          <div className={`${['bg-brand-900', 'bg-[#173a6b]', 'bg-brand-600'][i]} text-white text-[15px] font-semibold text-center py-2.5`}>{t}</div>
          <ol className="p-4 space-y-3">{items.map(([h, d], k) => <li key={h} className="flex gap-2.5"><Num n={k + 1} dark={i === 0} /><div><div className="text-sm font-semibold text-ink">{h}</div><div className="text-xs text-ink-2">{d}</div></div></li>)}</ol>
        </div>))}
      </div>
      <div>
        <Label>Roadmap</Label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">{ROADMAP.map(([w, d], k) => <div key={w} className={`rounded-lg px-4 py-3 text-white ${['bg-brand-600', 'bg-[#173a6b]', 'bg-brand-900'][k]}`}><div className="text-sm font-bold">{w}</div><div className="text-xs text-slate-200 mt-0.5">{d}</div></div>)}</div>
      </div>
    </div>
  )
}

function Conclusion() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{[['Problem', 'Five high priorities (growth, return, risk, AI transformation, readiness) lack shared evidence of progress.'], ['Solution', 'A KPI-first, domain-agnostic framework with proven tools, techniques and TEDIF governance, across 16 departments.'], ['Outcome', '16 departments on shared KPIs, every AI model governed, and AI moving from pilot to production under human control.']].map(([h, b]) => (
        <Panel key={h} title={h}><p className="text-sm text-ink-2 leading-snug">{b}</p></Panel>))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2.2fr] gap-4">
        <div className="rounded-xl bg-brand-50 p-4"><h3 className="text-[15px] font-semibold text-ink mb-2">Limitations</h3><ul className="space-y-1.5 text-sm text-ink-2">{['Targets still to be validated in pilots', 'Live multimodal AI is the next phase', 'Two industries designed so far'].map((l) => <li key={l} className="flex gap-2"><span className="mt-1.5 w-1.5 h-1.5 rounded-sm bg-brand-600 shrink-0" />{l}</li>)}</ul></div>
        <div>
          <Label>What each priority gets</Label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">{PRIOS.map((p, k) => <div key={p.name} className="rounded-lg border border-line border-t-[3px] border-t-brand-600 bg-surface p-3 text-center"><div className="text-sm font-semibold text-ink">{p.name}</div><div className="text-xs text-ink-2 mt-1">{['KPI-linked AI portfolio', 'Value-tracked investments', 'Registered, governed AI', 'Pilots reaching production', 'Supported tech, skilled people'][k]}</div></div>)}</div>
        </div>
      </div>
      <div className="rounded-xl bg-brand-900 text-white px-5 py-4"><div className="text-lg sm:text-xl font-bold">One framework. Any industry. Measured outcomes.</div><div className="text-sm font-semibold text-accent mt-0.5">AI recommends. Humans decide.</div></div>
    </div>
  )
}

const BODY: Record<Tab, () => React.ReactElement> = { 'Problem statement': Problem, Methodology, Results, Recommendations, Conclusion }

export default function CapstoneStory() {
  const [tab, setTab] = useState<Tab>('Problem statement')
  const [all, setAll] = useState(false)
  const Body = BODY[tab]
  return (
    <section id="capstone" className="scroll-mt-20 mb-6 rounded-2xl border border-line bg-page/40" aria-label="Capstone overview">
      <div className="rounded-t-2xl bg-gradient-to-br from-[#0b1d38] via-[#0f2747] to-[#1d4ed8] text-white p-5 sm:p-6">
        <div className="text-[11px] font-bold tracking-widest uppercase text-accent">CTO Capstone 2026 · Overview</div>
        <h1 className="text-2xl sm:text-3xl font-bold mt-1">Domain-Agnostic Enterprise AI Transformation Framework</h1>
        <p className="text-sm sm:text-[15px] text-slate-200 mt-1.5 max-w-4xl">Build one domain-agnostic framework that turns every department's work into evidence-based answers on five high priorities, in any industry.</p>
        <div className="flex flex-wrap gap-2 mt-4">{[['5', 'high priorities'], ['10', 'priority problems'], ['16', 'departments'], ['2 + any', 'industries']].map(([n, l]) => <div key={l} className="rounded-lg bg-white/10 border border-white/15 px-3 py-1.5"><span className="text-lg font-bold">{n}</span> <span className="text-xs text-slate-200">{l}</span></div>)}</div>
        <p className="text-xs text-slate-300 mt-3">Presented by Ramkumar P · Suman Kolekar · Santosh Kumar, CTOs</p>
      </div>
      <div className="p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div role="tablist" aria-label="Capstone sections" className={`flex flex-wrap gap-1.5 ${all ? 'opacity-50 pointer-events-none' : ''}`}>
            {TABS.map((t, k) => <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${tab === t ? 'bg-brand-900 text-white' : 'bg-surface border border-line text-ink-2 hover:border-brand-600 hover:text-brand-600'}`}>{k + 1} · {t}</button>)}
          </div>
          <button onClick={() => setAll(!all)} className="text-sm font-semibold text-brand-600 hover:underline flex items-center gap-1" aria-expanded={all}>{all ? 'Show one section' : 'Show all sections'}<ChevronDown size={15} className={all ? 'rotate-180' : ''} aria-hidden /></button>
        </div>
        {all
          ? <div className="space-y-8">{TABS.map((t, k) => { const B = BODY[t]; return <div key={t}><h2 className="text-lg font-bold text-ink mb-3">{k + 1} · {t}</h2><B /></div> })}</div>
          : <div role="tabpanel" aria-label={tab}><Body /></div>}
      </div>
    </section>
  )
}
