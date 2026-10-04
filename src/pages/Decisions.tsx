import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, CircleCheck, CircleX, Database, MessageCircleQuestion, Pencil, Play, Sparkles, Star } from 'lucide-react'
import type { Decision } from '../data/domains'
import { useStore } from '../store'
import type { Verdict } from '../store'
import { Badge, Card, PageHeader } from '../components/ui'

// The ten engines of the decision runtime, in strict order (PPT slide 11).
const engines = [
  ['Request', 'Valid, active decision only'],
  ['Context builder', 'Resolves data and versions'],
  ['Policy engine', 'Business rules — hard stop on fail'],
  ['Knowledge (RAG)', 'Filtered by entitlement, masked'],
  ['AI engine', 'Model routed by classification'],
  ['Decision engine', 'Rejects incomplete payloads'],
  ['Human engine', 'Approve · reject · modify · escalate'],
  ['Execution', 'Only on recorded approval'],
  ['Audit', 'No audit, no execution'],
  ['Learning', 'Feeds root-cause analysis'],
] as const

const HUMAN = 6
const reasons = ['Insufficient evidence', 'Policy conflict', 'Alternative preferred', 'Confidence too low', 'Data quality concern']
const route = (c: Decision['classification']) => (c === 'Restricted' ? 'Local LLM only' : c === 'Confidential' ? 'Local LLM (masked cloud allowed)' : 'Cloud LLM permitted')

function Runtime({ step, rejected }: { step: number; rejected: boolean }) {
  return (
    <div className="grid grid-cols-5 lg:grid-cols-10 gap-1.5 mb-4">
      {engines.map(([name, desc], i) => {
        const skipped = rejected && i === 7
        const done = i < step || (i === step && i > HUMAN)
        const waiting = i === step && i === HUMAN
        const tone = skipped ? 'bg-slate-100 text-slate-400 border-slate-200 line-through'
          : done ? (i <= 3 ? 'bg-amber-50 border-amber-300 text-amber-900' : i <= 5 ? 'bg-violet-50 border-violet-300 text-violet-900' : i === HUMAN ? 'bg-red-50 border-red-300 text-red-900' : 'bg-emerald-50 border-emerald-300 text-emerald-900')
          : waiting ? 'bg-red-600 text-white border-red-600 animate-pulse'
          : 'bg-white border-slate-200 text-slate-400'
        return (
          <div key={name} title={desc} className={`rounded-md border px-1.5 py-2 text-center transition-all duration-300 ${tone}`}>
            <div className="text-[10px] font-bold">{i + 1}</div>
            <div className="text-[10px] leading-tight font-semibold">{name}</div>
          </div>
        )
      })}
    </div>
  )
}

function DecisionCard({ d }: { d: Decision }) {
  const { record, verdictFor } = useStore()
  const done = verdictFor(d.id)
  const [step, setStep] = useState(done ? 10 : -1)
  const [challenged, setChallenged] = useState(false)
  const [reason, setReason] = useState('')
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearInterval(timer.current), [])

  const animateTo = (target: number) => {
    window.clearInterval(timer.current)
    timer.current = window.setInterval(() => {
      setStep((s) => {
        if (s >= target) { window.clearInterval(timer.current); return s }
        return s + 1
      })
    }, 380)
  }

  const run = () => { setStep(0); animateTo(HUMAN) }

  const decide = (verdict: Verdict) => {
    if (verdict !== 'Approved' && !reason) return
    record({ decisionId: d.id, title: d.title, verdict, reason: verdict === 'Approved' ? '—' : reason, by: d.approver, challenged, confidence: d.confidence })
    animateTo(10)
  }

  const showRec = step > 5 || !!done
  const rejected = done?.verdict === 'Rejected' || done?.verdict === 'Escalated'

  return (
    <Card className={d.flagship ? 'ring-2 ring-blue-600' : ''}>
      <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
        <div>
          <div className="text-xs font-mono text-blue-700 flex items-center gap-2">
            {d.flagship && <span className="inline-flex items-center gap-1 bg-blue-700 text-white rounded px-1.5 py-0.5 font-sans font-bold text-[10px]"><Star size={10} /> FLAGSHIP · CROSS-FUNCTIONAL</span>}
            {d.id} · {d.area}
          </div>
          <h3 className="font-bold text-slate-900 mt-1">{d.title}</h3>
          <p className="text-sm text-slate-500">{d.question}</p>
        </div>
        <div className="flex flex-wrap gap-2"><Badge>{d.risk}</Badge><Badge>{d.classification}</Badge></div>
      </div>

      <div className="grid sm:grid-cols-3 gap-2 text-xs mb-4">
        <div className="rounded bg-slate-50 px-2 py-1.5"><span className="text-slate-500">Owner:</span> <b>{d.owner}</b></div>
        <div className="rounded bg-slate-50 px-2 py-1.5"><span className="text-slate-500">Approver:</span> <b>{d.approver}</b></div>
        <div className="rounded bg-slate-50 px-2 py-1.5"><span className="text-slate-500">Model route:</span> <b>{route(d.classification)}</b></div>
      </div>

      <Runtime step={step} rejected={rejected} />

      {step < 0 && !done && (
        <button onClick={run} className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold px-4 py-2 rounded-lg">
          <Play size={15} /> Run decision runtime
        </button>
      )}
      {step >= 0 && step < HUMAN && !done && <p className="text-sm text-slate-500">Running {engines[Math.max(step, 0)][0]}… <span className="text-xs">({engines[Math.max(step, 0)][1]})</span></p>}

      {showRec && (
        <>
          <div className="rounded-lg bg-blue-50 border border-blue-100 p-3 mb-3">
            <div className="text-[11px] font-bold text-blue-700 uppercase flex items-center gap-1 mb-1"><Sparkles size={12} /> AI recommendation · policy check {d.policyCheck.toLowerCase()}</div>
            <p className="text-sm font-medium">{d.recommendation}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-500">Confidence</span>
              <div className="w-32 h-1.5 bg-white rounded-full overflow-hidden"><div className="h-full bg-blue-600" style={{ width: `${d.confidence * 100}%` }} /></div>
              <b>{Math.round(d.confidence * 100)}%</b>
              <span className="text-slate-500 ml-2">Impact:</span> <b>{d.financialImpact}</b>
            </div>
          </div>

          {!done && !challenged && (
            <button onClick={() => setChallenged(true)} className="inline-flex items-center gap-1 text-sm font-semibold text-blue-700 border border-blue-200 rounded-lg px-3 py-1.5 mb-3 hover:bg-blue-50">
              <MessageCircleQuestion size={15} /> Challenge the AI — why? show evidence, alternatives, sources
            </button>
          )}

          {(challenged || done) && (
            <div className="grid md:grid-cols-3 gap-4 text-sm mb-4 border rounded-lg p-3">
              <div>
                <div className="text-[11px] font-bold text-slate-500 uppercase mb-1">Evidence</div>
                <ul className="list-disc pl-4 space-y-1">{d.evidence.map((e) => <li key={e}>{e}</li>)}</ul>
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-500 uppercase mb-1">Alternatives considered</div>
                <ul className="list-disc pl-4 space-y-1">{d.alternatives.map((a) => <li key={a}>{a}</li>)}</ul>
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-500 uppercase mb-1">Cited sources (MCP / RAG)</div>
                <ul className="space-y-1">{d.sources.map((s) => <li key={s} className="flex items-center gap-1 text-xs"><Database size={12} className="text-blue-700" />{s}</li>)}</ul>
              </div>
            </div>
          )}

          {done ? (
            <div className="flex flex-wrap items-center gap-2 text-sm border-t pt-3">
              <Badge>{done.verdict}</Badge>
              <span>by <b>{done.by}</b> at {done.at}</span>
              {done.reason !== '—' && <span className="text-slate-500">· {done.reason}</span>}
              {done.challenged && <span className="text-xs text-blue-700">· challenged before deciding</span>}
              <span className="ml-auto text-xs text-slate-400">Immutable audit record</span>
            </div>
          ) : step >= HUMAN && (
            <div className="flex flex-wrap items-center gap-2 border-t pt-3">
              <button onClick={() => decide('Approved')} className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-3 py-2 rounded-lg"><CircleCheck size={16} /> Approve as {d.approver.split(' ')[0]}</button>
              <select value={reason} onChange={(e) => setReason(e.target.value)} className="text-sm border border-slate-300 rounded-lg px-2 py-2 bg-white">
                <option value="">Reason (needed for reject / modify / escalate)…</option>
                {reasons.map((r) => <option key={r}>{r}</option>)}
              </select>
              <button onClick={() => decide('Modified')} disabled={!reason} className="inline-flex items-center gap-1 bg-blue-600 disabled:opacity-40 text-white text-sm font-semibold px-3 py-2 rounded-lg"><Pencil size={15} /> Modify</button>
              <button onClick={() => decide('Rejected')} disabled={!reason} className="inline-flex items-center gap-1 bg-red-600 disabled:opacity-40 text-white text-sm font-semibold px-3 py-2 rounded-lg"><CircleX size={16} /> Reject</button>
              <button onClick={() => decide('Escalated')} disabled={!reason} className="inline-flex items-center gap-1 bg-amber-500 disabled:opacity-40 text-white text-sm font-semibold px-3 py-2 rounded-lg"><ArrowUpRight size={16} /> Escalate</button>
            </div>
          )}
        </>
      )}
    </Card>
  )
}

export default function Decisions() {
  const { decisions, audit, domain } = useStore()
  const challengeRate = audit.length ? Math.round((audit.filter((a) => a.challenged).length / audit.length) * 100) : 0

  return (
    <>
      <PageHeader title="Decision Center" subtitle={`AI recommends · Humans decide — ${domain.name} decisions plus the cross-functional flagship`} owner="Ram" />
      <div className="grid xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          {decisions.map((d) => <DecisionCard key={d.id} d={d} />)}
        </div>
        <div className="space-y-6">
          <Card title="Runtime Legend">
            <ul className="text-xs space-y-1.5">
              <li><span className="inline-block w-3 h-3 rounded bg-amber-200 mr-2 align-middle" />Engines 1–4 · trust chain (before any AI)</li>
              <li><span className="inline-block w-3 h-3 rounded bg-violet-200 mr-2 align-middle" />Engines 5–6 · AI recommendation</li>
              <li><span className="inline-block w-3 h-3 rounded bg-red-300 mr-2 align-middle" />Engine 7 · human decides</li>
              <li><span className="inline-block w-3 h-3 rounded bg-emerald-200 mr-2 align-middle" />Engines 8–10 · execute, audit, learn</li>
            </ul>
          </Card>
          <Card title="Approval Routing by Risk">
            <table className="w-full text-xs">
              <tbody>
                {[['Low', 'Auto-approve with notification (never for people or irreversible decisions)'], ['Medium', 'Manager approval'], ['High', 'Director or executive approval'], ['Critical', 'Executive approval + board notification']].map(([r, p]) => (
                  <tr key={r} className="border-b last:border-0"><td className="py-2 pr-2"><Badge>{r}</Badge></td><td>{p}</td></tr>
                ))}
              </tbody>
            </table>
          </Card>
          <Card title="Audit Trail" action={<span className="text-xs text-slate-500">Challenged: {challengeRate}%</span>}>
            {audit.length === 0 ? (
              <p className="text-sm text-slate-500">Run a decision and approve, modify, reject or escalate it to create an audit record.</p>
            ) : (
              <ul className="space-y-3 text-sm">
                {audit.map((a) => (
                  <li key={a.decisionId + a.at} className="border-l-2 border-blue-600 pl-3">
                    <div className="flex items-center gap-2"><Badge>{a.verdict}</Badge><span className="text-xs text-slate-400">{a.at}</span></div>
                    <div className="font-semibold mt-1">{a.decisionId} <span className="font-normal text-slate-500">· {a.domain}</span></div>
                    <div className="text-xs text-slate-500">{a.by}{a.reason !== '—' && ` · ${a.reason}`} · AI conf. {Math.round(a.confidence * 100)}%{a.challenged && ' · challenged'}</div>
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
