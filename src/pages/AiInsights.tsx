import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CircleCheck, CircleX, Sparkles } from 'lucide-react'
import { insights } from '../data/signals'
import { Card, PageHeader } from '../components/ui'

export default function AiInsights() {
  const list = insights()
  const [verdict, setVerdict] = useState<Record<string, 'Accepted' | 'Rejected'>>({})
  return (
    <>
      <PageHeader title="AI Intelligence" subtitle="Cross-domain insights prepared by AI agents — every recommendation needs a named human decision" owner="Ram (CTO)" />
      <div className="rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-900 mb-5 flex gap-2 items-start">
        <Sparkles size={16} className="mt-0.5 shrink-0" />
        <span>AI observes, gathers evidence and recommends. <b>People decide.</b> Nothing here is executed automatically; accepted items go to the Decision Center with an approver and an audit record.</span>
      </div>
      <div className="grid lg:grid-cols-2 gap-5">
        {list.map((i) => (
          <Card key={i.id} title={i.title} action={<span className="text-xs text-ink-3 whitespace-nowrap">{i.scope}</span>}>
            <dl className="text-sm space-y-3">
              <div><dt className="text-[11px] font-semibold uppercase tracking-wide text-ink-3">Observation</dt><dd className="text-ink mt-0.5">{i.observation}</dd></div>
              <div><dt className="text-[11px] font-semibold uppercase tracking-wide text-ink-3">Evidence</dt><dd><ul className="list-disc pl-4 text-ink-2 mt-0.5 space-y-0.5">{i.evidence.map((e) => <li key={e}>{e}</li>)}</ul></dd></div>
              <div><dt className="text-[11px] font-semibold uppercase tracking-wide text-ink-3">Recommendation</dt><dd className="font-medium text-brand-900 mt-0.5">{i.recommendation}</dd></div>
              <div className="grid grid-cols-2 gap-3">
                <div><dt className="text-[11px] font-semibold uppercase tracking-wide text-ink-3">Expected impact</dt><dd className="text-ink mt-0.5">{i.impact}</dd></div>
                <div><dt className="text-[11px] font-semibold uppercase tracking-wide text-ink-3">Confidence</dt>
                  <dd className="mt-1 flex items-center gap-2"><div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-brand-600" style={{ width: `${i.confidence * 100}%` }} /></div><span className="text-xs font-semibold tabular-nums">{Math.round(i.confidence * 100)}%</span></dd></div>
              </div>
            </dl>
            <div className="mt-4 pt-3 border-t border-line flex flex-wrap items-center gap-2">
              <span className="text-xs text-ink-3 mr-auto">Human decision · {i.approver}</span>
              {verdict[i.id] ? (
                <span className={`text-sm font-semibold ${verdict[i.id] === 'Accepted' ? 'text-success-text' : 'text-crit-text'}`}>{verdict[i.id]}</span>
              ) : (
                <>
                  <button onClick={() => setVerdict((v) => ({ ...v, [i.id]: 'Accepted' }))} className="inline-flex items-center gap-1 h-8 px-3 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700"><CircleCheck size={14} />Accept</button>
                  <button onClick={() => setVerdict((v) => ({ ...v, [i.id]: 'Rejected' }))} className="inline-flex items-center gap-1 h-8 px-3 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50"><CircleX size={14} />Reject</button>
                </>
              )}
              <Link to={i.link} className="text-xs font-semibold text-brand-600">Evidence →</Link>
            </div>
          </Card>
        ))}
      </div>
    </>
  )
}
