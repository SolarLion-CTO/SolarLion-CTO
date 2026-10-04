import { useState } from 'react'
import { CircleCheck, CircleX, ArrowUpRight, Sparkles } from 'lucide-react'
import type { Decision } from '../data/domains'
import { useStore } from '../store'
import type { Verdict } from '../store'
import { Badge, Card, PageHeader } from '../components/ui'

const reasons = ['Insufficient evidence', 'Policy conflict', 'Alternative preferred', 'Confidence too low', 'Data quality concern']

function DecisionCard({ d }: { d: Decision }) {
  const { record, verdictFor } = useStore()
  const [reason, setReason] = useState('')
  const done = verdictFor(d.id)

  const decide = (verdict: Verdict) => {
    if (verdict !== 'Approved' && !reason) return
    record({ decisionId: d.id, title: d.title, verdict, reason: verdict === 'Approved' ? '—' : reason, by: d.approver })
  }

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
        <div>
          <div className="text-xs font-mono text-blue-700">{d.id} · {d.initiative}</div>
          <h3 className="font-bold text-slate-900">{d.title}</h3>
        </div>
        <div className="flex gap-2"><Badge>{d.risk}</Badge><Badge>{d.policyCheck}</Badge></div>
      </div>

      <div className="rounded-lg bg-blue-50 border border-blue-100 p-3 mb-4">
        <div className="text-[11px] font-bold text-blue-700 uppercase flex items-center gap-1 mb-1"><Sparkles size={12} /> AI recommendation</div>
        <p className="text-sm">{d.recommendation}</p>
        <div className="mt-2 flex items-center gap-2 text-xs">
          <span className="text-slate-500">Confidence</span>
          <div className="w-32 h-1.5 bg-white rounded-full overflow-hidden"><div className="h-full bg-blue-600" style={{ width: `${d.confidence * 100}%` }} /></div>
          <b>{Math.round(d.confidence * 100)}%</b>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 text-sm mb-4">
        <div>
          <div className="text-[11px] font-bold text-slate-500 uppercase mb-1">Evidence</div>
          <ul className="list-disc pl-4 space-y-0.5">{d.evidence.map((e) => <li key={e}>{e}</li>)}</ul>
        </div>
        <div>
          <div className="text-[11px] font-bold text-slate-500 uppercase mb-1">Alternatives considered</div>
          <ul className="list-disc pl-4 space-y-0.5">{d.alternatives.map((a) => <li key={a}>{a}</li>)}</ul>
        </div>
        <div>
          <div className="text-[11px] font-bold text-slate-500 uppercase mb-1">Impact & accountability</div>
          <p>{d.financialImpact}</p>
          <p className="mt-1 text-slate-500">Approver: <b className="text-slate-800">{d.approver}</b></p>
        </div>
      </div>

      {done ? (
        <div className="flex flex-wrap items-center gap-2 text-sm border-t pt-3">
          <Badge>{done.verdict}</Badge>
          <span>by {done.by} at {done.at}</span>
          {done.reason !== '—' && <span className="text-slate-500">· Reason: {done.reason}</span>}
          <span className="ml-auto text-xs text-slate-400">Recorded in immutable audit trail</span>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2 border-t pt-3">
          <button onClick={() => decide('Approved')} className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2 rounded-lg"><CircleCheck size={16} /> Approve</button>
          <select value={reason} onChange={(e) => setReason(e.target.value)} className="text-sm border border-slate-300 rounded-lg px-2 py-2 bg-white">
            <option value="">Reason (required to reject/escalate)…</option>
            {reasons.map((r) => <option key={r}>{r}</option>)}
          </select>
          <button onClick={() => decide('Rejected')} disabled={!reason} className="inline-flex items-center gap-1 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white text-sm font-semibold px-4 py-2 rounded-lg"><CircleX size={16} /> Reject</button>
          <button onClick={() => decide('Escalated')} disabled={!reason} className="inline-flex items-center gap-1 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white text-sm font-semibold px-4 py-2 rounded-lg"><ArrowUpRight size={16} /> Escalate</button>
        </div>
      )}
    </Card>
  )
}

export default function Decisions() {
  const { domain, audit } = useStore()
  return (
    <>
      <PageHeader title="Decision Center" subtitle="AI recommends · Humans decide · Every decision is evidenced, attributed and audited" owner="Ram" />
      <div className="grid xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          {domain.decisions.map((d) => <DecisionCard key={d.id} d={d} />)}
        </div>
        <div className="space-y-6">
          <Card title="Decision Flow">
            <ol className="text-sm space-y-2">
              {['Business question raised', 'Permission & policy check', 'Knowledge retrieval', 'AI recommendation + evidence', 'Human challenge & decision', 'Execution & audit record', 'Outcome measured → learning'].map((s, i) => (
                <li key={s} className="flex items-center gap-2">
                  <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${i === 4 ? 'bg-red-600 text-white' : 'bg-blue-100 text-blue-700'}`}>{i + 1}</span>
                  {s}
                </li>
              ))}
            </ol>
          </Card>
          <Card title="Audit Trail">
            {audit.length === 0 ? (
              <p className="text-sm text-slate-500">No decisions recorded yet. Approve, reject or escalate a recommendation to see it logged here.</p>
            ) : (
              <ul className="space-y-3 text-sm">
                {audit.map((a) => (
                  <li key={a.decisionId + a.at} className="border-l-2 border-blue-600 pl-3">
                    <div className="flex items-center gap-2"><Badge>{a.verdict}</Badge><span className="text-xs text-slate-400">{a.at}</span></div>
                    <div className="font-semibold mt-1">{a.decisionId}</div>
                    <div className="text-xs text-slate-500">{a.by}{a.reason !== '—' && ` · ${a.reason}`}</div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </>
  )
}
