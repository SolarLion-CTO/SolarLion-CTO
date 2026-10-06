import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CircleCheck, CircleX, Clock, Database, FileSearch } from 'lucide-react'
import type { Decision } from '../../data/sim/decisions'
import { SOURCES } from '../../data/sim/scores'
import { Badge } from '../ui'
import { useDecisionState } from './decisionState'
import { ragText } from './primitives'

const srcLabel = (s: string) => (s === 'business' ? 'Business data' : SOURCES.find((x) => x.id === s)!.label)
const srcCap = (s: string) => (s === 'business' ? 'Enterprise function' : SOURCES.find((x) => x.id === s)!.capability)
const dot = { Green: 'bg-ok', Amber: 'bg-warn', Red: 'bg-crit' }

function RecordRef({ domain, id }: { domain: string; id: string }) {
  if (id.startsWith('MET-')) return <span className="text-[11px] text-ink-3">{id}</span>
  return <Link to={`/domain/${domain}/record/${id}`} className="text-[11px] text-brand-700 hover:underline">{id}</Link>
}

/** Full decision card: Signal → Correlation → Insight → Decision → (Action → Outcome). */
export function DecisionCard({ d, showDomain = false }: { d: Decision; showDomain?: boolean }) {
  const st = useDecisionState()
  const status = st.statusOf(d)
  const [evidence, setEvidence] = useState(false)
  const awaiting = status === 'Awaiting decision'
  return (
    <article id={d.id} className="bg-surface rounded-xl border border-line shadow-[0_1px_2px_rgba(15,23,42,0.04)] scroll-mt-20">
      <header className="p-5 pb-3 border-b border-line">
        <div className="flex flex-wrap items-center gap-2 mb-1.5">
          <Badge>{d.priority}</Badge>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-3">{awaiting ? 'Decision required' : status}</span>
          <span className="text-[11px] text-ink-4">{d.id} · {d.kind}{showDomain ? ` · ${d.domain[0].toUpperCase() + d.domain.slice(1)}` : ''}</span>
          <span className="ml-auto inline-flex items-center gap-1 text-xs text-ink-3"><Clock size={12} />Decide by {d.deadline}</span>
        </div>
        <h3 className="text-lg font-semibold text-ink leading-snug">{d.title}</h3>
        <p className="text-sm text-ink-2 mt-0.5"><b className="font-semibold">Why now:</b> {d.whyNow}</p>
      </header>
      <div className="grid lg:grid-cols-2 gap-x-6 gap-y-4 p-5">
        <section>
          <h4 className="text-[11px] font-semibold uppercase tracking-wide text-ink-3 mb-2">Signals · {d.signals.length} source{d.signals.length > 1 ? 's' : ''}</h4>
          <ul className="space-y-2">{d.signals.map((s, k) => (
            <li key={k} className="flex gap-2 text-sm">
              <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${dot[s.health]}`} aria-label={s.health} />
              <div className="min-w-0"><span className="text-[11px] font-semibold text-brand-700 mr-1.5">{srcLabel(s.source)}</span><span className="text-ink-2">{s.text}</span> <RecordRef domain={d.domain} id={s.recordId} /></div>
            </li>
          ))}</ul>
          <h4 className="text-[11px] font-semibold uppercase tracking-wide text-ink-3 mt-4 mb-1">Correlation</h4>
          <p className="text-sm text-ink-2">{d.correlation}</p>
          <h4 className="text-[11px] font-semibold uppercase tracking-wide text-ink-3 mt-3 mb-1">Insight</h4>
          <p className="text-sm font-medium text-ink">{d.insight}</p>
        </section>
        <section>
          <div className="rounded-lg border border-brand-100 bg-brand-50 p-3">
            <h4 className="text-[11px] font-semibold uppercase tracking-wide text-brand-700 mb-1">Recommended decision</h4>
            <p className="text-sm font-semibold text-brand-900">{d.recommendation}</p>
          </div>
          <h4 className="text-[11px] font-semibold uppercase tracking-wide text-ink-3 mt-3 mb-1">Expected outcome</h4>
          <ul className="list-disc pl-4 text-sm text-ink-2 space-y-0.5">{d.expected.map((x) => <li key={x}>{x}</li>)}</ul>
          {!d.preset && (
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mt-3">
              <div><dt className="text-[11px] text-ink-3">Business impact</dt><dd className="text-ink">{d.businessImpact}</dd></div>
              <div><dt className="text-[11px] text-ink-3">Technology impact</dt><dd className="text-ink">{d.technologyImpact}</dd></div>
              <div><dt className="text-[11px] text-ink-3">Financial impact</dt><dd className="text-ink">{d.financialImpact}</dd></div>
              <div><dt className="text-[11px] text-ink-3">Risk</dt><dd className="text-ink">{d.risk}</dd></div>
              {(d.investmentCr > 0 || d.benefitCr > 0) && <div className="col-span-2"><dt className="text-[11px] text-ink-3">Investment → value protected</dt><dd className="text-ink font-semibold">₹{d.investmentCr} Cr → ₹{d.benefitCr} Cr</dd></div>}
            </dl>
          )}
          <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
            <div><div className="text-[11px] text-ink-3">Confidence</div><div className="flex items-center gap-2"><div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-brand-600" style={{ width: `${d.confidence}%` }} /></div><b className="text-xs">{d.confidence}%</b></div></div>
            <div><div className="text-[11px] text-ink-3">Owner</div><div className="text-ink font-medium">{d.owner}</div></div>
          </div>
        </section>
      </div>
      {evidence && (
        <div className="px-5 pb-4">
          <h4 className="text-[11px] font-semibold uppercase tracking-wide text-ink-3 mb-2">Evidence trail</h4>
          <div className="overflow-x-auto"><table className="w-full text-sm min-w-[480px]">
            <thead><tr className="text-[11px] uppercase tracking-wide text-ink-3 text-left border-b border-line"><th className="py-1.5">Layer</th><th>Simulated source</th><th>Record</th><th>State</th></tr></thead>
            <tbody>{d.signals.map((s, k) => (
              <tr key={k} className="border-b border-line last:border-0"><td className="py-1.5">{srcCap(s.source)}</td><td className="text-ink-2"><Database size={12} className="inline mr-1 text-ink-4" />{s.source === 'business' ? 'Simulated business data' : `${srcLabel(s.source)} simulation`}</td><td><RecordRef domain={d.domain} id={s.recordId} /></td><td className={ragText[s.health]}>{s.health}</td></tr>
            ))}</tbody>
          </table></div>
        </div>
      )}
      <footer className="px-5 py-3 border-t border-line flex flex-wrap items-center gap-2">
        <button onClick={() => setEvidence(!evidence)} className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 mr-auto"><FileSearch size={15} />{evidence ? 'Hide evidence' : 'Show evidence'}</button>
        {d.preset ? (
          <span className="text-sm text-success-text font-semibold inline-flex items-center gap-1"><CircleCheck size={15} />Approved {d.preset.decidedOn} by {d.preset.by} · outcomes tracked</span>
        ) : awaiting ? (
          <>
            <span className="text-xs text-ink-3 w-full sm:w-auto">AI recommends · a named human decides</span>
            <button onClick={() => st.decide(d.id, 'Approved')} className="inline-flex items-center gap-1 h-9 px-3 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700"><CircleCheck size={15} />Approve</button>
            <button onClick={() => st.decide(d.id, 'Deferred')} className="h-9 px-3 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50">Defer</button>
            <button onClick={() => st.decide(d.id, 'Rejected')} className="inline-flex items-center gap-1 h-9 px-3 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50"><CircleX size={15} />Reject</button>
          </>
        ) : (
          <>
            <span className={`text-sm font-semibold ${status === 'Approved' ? 'text-success-text' : status === 'Rejected' ? 'text-crit-text' : 'text-warn-text'}`}>{status}{status === 'Approved' ? ` — ${d.actions.length} action${d.actions.length > 1 ? 's' : ''} created` : ''}</span>
            {status === 'Approved' && <Link to={`/domain/${d.domain}/decisions?tab=actions`} className="text-sm font-medium text-brand-600 inline-flex items-center gap-1">Action tracker<ArrowRight size={14} /></Link>}
            <button onClick={() => st.decide(d.id, null)} className="text-xs text-ink-3 underline">Undo</button>
          </>
        )}
      </footer>
    </article>
  )
}

/** One-line version for overview pages. */
export function DecisionRow({ d }: { d: Decision }) {
  const st = useDecisionState()
  const status = st.statusOf(d)
  return (
    <Link to={`/domain/${d.domain}/decisions#${d.id}`} className="block border border-line rounded-lg p-3 hover:border-brand-600 transition">
      <div className="flex items-start justify-between gap-2">
        <span className="font-semibold text-ink text-sm leading-snug">{d.title}</span>
        <Badge>{d.priority}</Badge>
      </div>
      <div className="flex flex-wrap gap-1 mt-2">{d.signals.map((s, k) => <span key={k} className={`text-[10.5px] rounded px-1.5 py-0.5 border ${s.health === 'Red' ? 'bg-crit-bg text-crit-text border-red-200' : s.health === 'Amber' ? 'bg-warn-bg text-warn-text border-amber-200' : 'bg-success-bg text-success-text border-green-200'}`}>{srcLabel(s.source)}</span>)}</div>
      <div className="text-[11px] text-ink-3 mt-1.5">{status} · confidence {d.confidence}% · {d.owner} · by {d.deadline}</div>
    </Link>
  )
}
