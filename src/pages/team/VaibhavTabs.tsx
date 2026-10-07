// Vaibhav · Regulatory & AI Governance — Regulatory change, AI model register, Data governance & DPDP, Audit readiness.
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BellRing, CircleCheck, Clock, FileText, Radio, ShieldAlert } from 'lucide-react'
import { domainOrder, domains } from '../../data/domains'
import type { DomainId } from '../../data/domains'
import { sim } from '../../data/sim'
import type { Rag } from '../../data/sim'
import { BREACH, BREACH_AT, LIVE_CIRCULAR_AT, LIVE_CIRCULAR_DECISION, REG_STAGES, circulars, dataElements, liveCircular, models } from '../../data/sim/governance'
import type { Circular, Model, RegStage } from '../../data/sim/governance'
import { Badge, Card } from '../../components/ui'
import { ScoreRing, StatusPill, ragBg, ragText } from '../../components/sim/primitives'
import { useDecisionState } from '../../components/sim/decisionState'
import { useSimClock } from '../../components/sim/clock'

const dn = (d: DomainId) => domains[d].name
const appName = (id: string) => sim.banking.applications.find((a) => a.id === id)?.name ?? id
const ctlName = (id: string | null) => (id ? sim.banking.controls.find((c) => c.id === id)!.control : '—')
const stageTone = (s: RegStage) => (s === 'Closed' || s === 'Evidence' ? 'Compliant' : s === 'Mapped' ? 'Active' : s === 'Under review' ? 'Partial' : 'Info')

function useLive() {
  const { now } = useSimClock()
  const st = useDecisionState()
  const arrived = now >= LIVE_CIRCULAR_AT
  const verdict = st.verdicts[LIVE_CIRCULAR_DECISION]?.v
  const live: Circular | null = arrived ? { ...liveCircular, stage: verdict === 'Approved' ? 'Mapped' : 'AI-drafted', obligations: liveCircular.obligations.map((o) => ({ ...o, status: verdict === 'Approved' ? (o.controlId ? 'Mapped' : 'Gap') : 'Pending review' })) } : null
  return { now, live, verdict, st, secs: Math.max(0, Math.round((LIVE_CIRCULAR_AT - now) / 1000)) }
}

// ── 1. Regulatory change ─────────────────────────────────────────────
export function RegulatoryTab() {
  const { live, verdict, st, secs } = useLive()
  const all = live ? [live, ...circulars] : circulars
  const obs = all.flatMap((c) => c.obligations)
  const mapped = obs.filter((o) => o.status === 'Mapped').length
  const [gapsOnly, setGapsOnly] = useState(false)
  return (
    <>
      <div className="rounded-lg border border-line bg-slate-50 px-3 py-2 text-xs text-ink-2 mb-4"><b>Banking first.</b> Circulars and reference numbers are simulated and illustrative, not real regulator documents. Manufacturing and Retail regulators are mapped in the next phase.</div>
      <Card title="Regulatory change pipeline" className="mb-5">
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">{REG_STAGES.map((s, i) => {
          const n = all.filter((c) => c.stage === s).length
          return (
            <div key={s} className="relative rounded-lg border border-line p-3 text-center bg-surface">
              <div className="text-[11px] text-ink-3">{i + 1}. {s}</div><div className="text-2xl font-bold text-brand-900">{n}</div>
              {i < 5 && <ArrowRight size={14} className="hidden md:block absolute -right-2.5 top-1/2 -translate-y-1/2 text-ink-4 bg-page rounded-full" />}
            </div>
          )
        })}</div>
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm mt-3">
          <span>Recent circulars: <b>{mapped} of {obs.length}</b> obligations mapped ({Math.round((mapped / obs.length) * 100)}%) <span className="text-ink-3">· the full obligation library (KPI above) is {sim.banking.metrics.find((m) => m.functionId === 'legal' && m.key === 'oblig')!.current}% mapped</span></span>
          <span>Gaps (no control yet): <b className="text-crit-text">{obs.filter((o) => o.status === 'Gap').length}</b></span>
          <span>Awaiting review: <b className="text-warn-text">{obs.filter((o) => o.status === 'Pending review').length}</b></span>
        </div>
      </Card>

      <Card title="Live regulatory feed" className="mb-5" action={<span className="inline-flex items-center gap-1 text-xs text-ink-3"><Radio size={13} className={live ? '' : 'animate-pulse text-success-text'} />{live ? 'New circular received' : `Monitoring · next check in ${secs}s`}</span>}>
        {!live ? <p className="text-sm text-ink-3">No new circulars in the last check. A simulated circular arrives on the simulation clock — keep this page open, or use Reset in the header to replay.</p> : (
          <div className={`rounded-xl border p-4 ${verdict === 'Approved' ? 'border-green-200 bg-success-bg' : 'border-brand-600 ring-2 ring-brand-100'}`}>
            <div className="flex flex-wrap items-center gap-2 text-xs text-ink-3"><BellRing size={14} className="text-brand-600" />{live.regulator} · {live.ref} · received today · due {live.due}</div>
            <div className="font-semibold text-ink text-lg mt-1">{live.title}</div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-3 mt-3 mb-1">Obligations drafted by AI (rule-based extraction · confidence)</div>
            <ul className="space-y-1.5">{live.obligations.map((o) => (
              <li key={o.id} className="grid grid-cols-1 md:grid-cols-[1fr_14rem_7rem] gap-2 items-center text-sm border-b border-line last:border-0 pb-1.5">
                <span className="text-ink">{o.text}</span>
                <span className="text-xs">{o.controlId ? <Link to={`/domain/banking/record/${o.controlId}`} className="text-brand-700 hover:underline">{o.controlId} · {ctlName(o.controlId)}</Link> : <span className="text-crit-text font-semibold">No matching control — gap</span>}</span>
                <span className="flex items-center gap-1.5"><span className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden"><span className="block h-full bg-brand-600" style={{ width: `${o.confidence * 100}%` }} /></span><span className="text-xs tabular-nums">{Math.round(o.confidence * 100)}%</span></span>
              </li>
            ))}</ul>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {verdict ? (<><span className={`text-sm font-semibold ${verdict === 'Approved' ? 'text-success-text' : 'text-warn-text'}`}>{verdict === 'Approved' ? `Mapping approved · ${live.obligations.filter((o) => !o.controlId).length} gap(s) raised as actions for control owners` : 'Sent back for re-drafting'}</span><button onClick={() => st.decide(LIVE_CIRCULAR_DECISION, null)} className="text-xs text-ink-3 underline">Undo</button></>) : (
                <>
                  <button onClick={() => st.decide(LIVE_CIRCULAR_DECISION, 'Approved')} className="inline-flex items-center gap-1 h-8 px-3 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700"><CircleCheck size={14} />Approve mapping</button>
                  <button onClick={() => st.decide(LIVE_CIRCULAR_DECISION, 'Deferred')} className="h-8 px-3 rounded-lg border border-slate-300 text-sm font-medium hover:bg-slate-50">Send back</button>
                  <span className="text-[11px] text-ink-3">AI drafts · Vaibhav approves (TEDIF: humans decide)</span>
                </>
              )}
            </div>
          </div>
        )}
      </Card>

      <Card title="Circulars" className="mb-5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[860px] [&_th]:px-2 [&_td]:px-2">
            <thead><tr className="text-[11px] uppercase tracking-wide text-ink-3 border-b border-line text-left"><th className="py-2">Circular</th><th>Received</th><th>Due</th><th>Stage</th><th className="text-right">Mapped</th><th className="text-right">Days taken</th></tr></thead>
            <tbody>{all.map((c) => (
              <tr key={c.id} className="border-b border-line last:border-0">
                <td className="py-2"><div className="font-medium text-ink flex items-center gap-1.5"><FileText size={13} className="text-ink-4" />{c.title}</div><div className="text-[11px] text-ink-3">{c.regulator} · {c.ref}</div></td>
                <td className="text-xs whitespace-nowrap">{c.received}</td><td className="text-xs whitespace-nowrap">{c.due}</td>
                <td><Badge>{stageTone(c.stage)}</Badge> <span className="text-xs text-ink-2">{c.stage}</span></td>
                <td className="text-right tabular-nums">{c.obligations.filter((o) => o.status === 'Mapped').length}/{c.obligations.length}</td>
                <td className="text-right tabular-nums">{c.daysTaken ?? '—'}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </Card>

      <Card title="Obligation library" action={<label className="text-xs flex items-center gap-1.5"><input type="checkbox" checked={gapsOnly} onChange={(e) => setGapsOnly(e.target.checked)} />Gaps and pending only</label>}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[760px] [&_th]:px-2 [&_td]:px-2">
            <thead><tr className="text-[11px] uppercase tracking-wide text-ink-3 border-b border-line text-left"><th className="py-2">Obligation</th><th>Mapped control</th><th className="text-right">AI confidence</th><th>Status</th></tr></thead>
            <tbody>{obs.filter((o) => !gapsOnly || o.status !== 'Mapped').map((o) => (
              <tr key={o.id} className="border-b border-line last:border-0">
                <td className="py-1.5"><div className="text-ink">{o.text}</div><div className="text-[11px] text-ink-3">{o.id}</div></td>
                <td className="text-xs">{o.controlId ? <Link to={`/domain/banking/record/${o.controlId}`} className="text-brand-700 hover:underline">{ctlName(o.controlId)}</Link> : '—'}</td>
                <td className="text-right tabular-nums text-xs">{Math.round(o.confidence * 100)}%</td>
                <td><StatusPill status={o.status === 'Mapped' ? 'Green' : o.status === 'Gap' ? 'Red' : 'Amber'} label={o.status} /></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
        <p className="text-xs text-ink-3 mt-2">Low-confidence drafts (&lt; 70%) always go to human review. Extraction is rule-based today and can use a live LLM once a provider is chosen.</p>
      </Card>
    </>
  )
}

// ── 2. AI model register ─────────────────────────────────────────────
const tierTone: Record<Model['tier'], Rag> = { High: 'Red', Medium: 'Amber', Low: 'Green' }
const apprTone: Record<Model['approval'], Rag> = { Approved: 'Green', Conditional: 'Amber', Pending: 'Amber', Restricted: 'Red' }
export function ModelsTab() {
  const [d, setD] = useState<DomainId | 'all'>('all')
  const ms = models.filter((m) => d === 'all' || m.domain === d)
  const tiers: Model['tier'][] = ['High', 'Medium', 'Low']
  const appr: Model['approval'][] = ['Approved', 'Conditional', 'Pending', 'Restricted']
  const drifting = ms.filter((m) => m.psi > 0.1)
  return (
    <>
      <div className="inline-flex rounded-lg border border-slate-300 bg-white overflow-hidden text-[13px] mb-4">{(['all', ...domainOrder] as (DomainId | 'all')[]).map((x) => <button key={x} onClick={() => setD(x)} className={`px-3 py-1.5 ${d === x ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-ink-2 hover:bg-slate-50'}`}>{x === 'all' ? 'All units' : dn(x)}</button>)}</div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-5">
        <Card title="Risk tier × approval">
          <table className="w-full text-sm border-separate border-spacing-1 table-fixed">
            <thead><tr className="text-[9.5px] uppercase text-ink-3 tracking-normal"><th className="w-14" />{appr.map((a) => <th key={a} className="font-semibold truncate" title={a}>{a === 'Conditional' ? 'Condit.' : a === 'Restricted' ? 'Restrict.' : a}</th>)}</tr></thead>
            <tbody>{tiers.map((t) => (
              <tr key={t}><td className="text-xs font-semibold text-ink pr-1">{t}</td>{appr.map((a) => {
                const n = ms.filter((m) => m.tier === t && m.approval === a).length
                const bad = (t === 'High' && a !== 'Approved') || a === 'Restricted'
                return <td key={a} className={`text-center rounded-md py-2 font-bold ${n ? (bad ? ragBg.Red + ' ' + ragText.Red : a === 'Approved' ? ragBg.Green + ' ' + ragText.Green : ragBg.Amber + ' ' + ragText.Amber) : 'bg-slate-50 text-ink-4'}`}>{n || ''}</td>
              })}</tr>
            ))}</tbody>
          </table>
          <p className="text-xs text-ink-3 mt-2">Tier = impact × autonomy × data sensitivity (1–3 each): ≥ 12 High, ≥ 4 Medium. Rule: no High-tier model in production without approval.</p>
        </Card>
        <Card title="Drift alerts (PSI)" className="xl:col-span-2">
          {drifting.length === 0 ? <p className="text-sm text-success-text">All models stable (PSI ≤ 0.10).</p> : (
            <ul className="space-y-3">{drifting.map((m) => (
              <li key={m.id} className={`rounded-lg border p-3 ${m.psi > 0.25 ? 'border-red-200 bg-crit-bg' : 'border-amber-200 bg-warn-bg'}`}>
                <div className="flex flex-wrap items-center gap-2"><ShieldAlert size={15} className={m.psi > 0.25 ? 'text-crit-text' : 'text-warn-text'} /><b className="text-ink text-sm">{m.name}</b><span className="text-xs text-ink-3">{dn(m.domain)} · {m.id}</span><span className="ml-auto text-sm font-bold tabular-nums">PSI {m.psi}</span></div>
                <div className="flex items-end gap-4 mt-2">
                  <Dist e={m.expected} a={m.actual} />
                  <div className="text-xs text-ink-2">{m.drift}. {m.psi > 0.25 ? <>Status set to <b>Restricted</b>: outputs need human review until revalidated.</> : 'Schedule revalidation within 30 days.'}</div>
                </div>
              </li>
            ))}</ul>
          )}
          <p className="text-xs text-ink-3 mt-2">Population Stability Index between the training and the latest score distributions (5 bins): &gt; 0.25 significant, 0.10–0.25 moderate. Computed live from the simulated distributions.</p>
        </Card>
      </div>
      <Card title={`Model register (${ms.length})`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[980px] [&_th]:px-2 [&_td]:px-2">
            <thead><tr className="text-[11px] uppercase tracking-wide text-ink-3 border-b border-line text-left"><th className="py-2">Model</th><th>Stage</th><th>Risk tier</th><th>Bias test</th><th>Explainability</th><th>Approval</th><th className="text-right">PSI</th><th>Validated</th></tr></thead>
            <tbody>{[...ms].sort((a, b) => b.impact * b.autonomy * b.sensitivity - a.impact * a.autonomy * a.sensitivity).map((m) => (
              <tr key={m.id} className="border-b border-line last:border-0">
                <td className="py-1.5"><div className="font-medium text-ink">{m.name}</div><div className="text-[11px] text-ink-3">{m.id} · {dn(m.domain)} · {m.owner}</div></td>
                <td className="text-xs">{m.stage}</td>
                <td><StatusPill status={tierTone[m.tier]} label={`${m.tier} (${m.impact}×${m.autonomy}×${m.sensitivity})`} /></td>
                <td className={`text-xs ${m.bias === 'Passed' ? 'text-success-text' : 'text-warn-text'}`}>{m.bias}</td>
                <td className={`text-xs ${m.explainability === 'Documented' ? 'text-success-text' : 'text-warn-text'}`}>{m.explainability}</td>
                <td><StatusPill status={apprTone[m.approval]} label={m.approval} /></td>
                <td className={`text-right tabular-nums ${m.psi > 0.25 ? 'text-crit-text font-semibold' : m.psi > 0.1 ? 'text-warn-text' : ''}`}>{m.psi}</td>
                <td className="text-xs whitespace-nowrap">{m.lastValidated}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
        <p className="text-xs text-ink-3 mt-2">Built from Suman's portfolio: every use case at Pilot or beyond is a registered model. Management simulation aligned in spirit with NIST AI RMF and ISO/IEC 42001 — not a certification.</p>
      </Card>
    </>
  )
}
function Dist({ e, a }: { e: number[]; a: number[] }) {
  const max = Math.max(...e, ...a)
  return (
    <div className="flex items-end gap-1 h-12 shrink-0" role="img" aria-label="Training vs latest score distribution">
      {e.map((x, i) => <div key={i} className="flex items-end gap-0.5"><div className="w-2 bg-slate-300 rounded-t" style={{ height: `${(x / max) * 44}px` }} /><div className="w-2 bg-brand-600 rounded-t" style={{ height: `${(a[i] / max) * 44}px` }} /></div>)}
    </div>
  )
}

// ── 3. Data governance & DPDP ────────────────────────────────────────
export function DataGovTab() {
  const { now } = useSimClock()
  const [sel, setSel] = useState(dataElements[0].id)
  const cde = dataElements.find((x) => x.id === sel)!
  const consent = sim.banking.metrics.find((m) => m.functionId === 'marketing' && m.key === 'consent')!
  const breached = now >= BREACH_AT
  const since = Math.max(0, now - BREACH_AT)
  const fmtLeft = (h: number) => { const ms = Math.max(0, h * 3_600_000 - since); const s = Math.floor(ms / 1000); return `${String(Math.floor(s / 3600)).padStart(2, '0')}:${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}` }
  return (
    <>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-5">
        <Card title="DPDP consent coverage · Banking">
          <div className="flex items-center gap-4"><ScoreRing score={Math.round(consent.current)} status={consent.status} size={84} label="Consent coverage" /><div className="text-sm"><b className="text-2xl text-brand-900">{consent.current}%</b> of customers<div className="text-xs text-ink-3">Target {consent.target}% · {consent.trend.toLowerCase()} · consent records from the simulated consent manager</div></div></div>
          <div className="text-xs text-ink-2 mt-3">{dataElements.filter((x) => x.consentRequired).length} of {dataElements.length} critical data elements need consent.</div>
        </Card>
        <Card title="Personal-data incident clock" className="xl:col-span-2">
          {!breached ? <p className="text-sm text-success-text flex items-center gap-1.5"><CircleCheck size={15} />No open personal-data incidents. A simulated incident starts on the simulation clock for the demo.</p> : (
            <div>
              <div className="flex flex-wrap items-center gap-2 text-sm"><ShieldAlert size={16} className="text-crit-text" /><b className="text-ink">{BREACH.title}</b><span className="text-xs text-ink-3">· system <Link to={`/domain/banking/record/${BREACH.system}`} className="text-brand-700 hover:underline">{appName(BREACH.system)}</Link> · ~{BREACH.records.toLocaleString('en-IN')} records</span></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">{BREACH.clocks.map((c) => (
                <div key={c.name} className="rounded-lg border border-red-200 bg-crit-bg p-3"><div className="text-xs text-crit-text font-semibold flex items-center gap-1"><Clock size={13} />{c.name}</div><div className="text-3xl font-bold text-crit-text tabular-nums">{fmtLeft(c.hours)}</div><div className="text-[11px] text-ink-3">remaining of {c.hours} h (illustrative window)</div></div>
              ))}</div>
              <ol className="flex flex-wrap gap-2 text-xs mt-3">{['Contain', 'Assess scope', 'Report to CERT-In', 'Notify Data Protection Board', 'Notify affected customers'].map((s, i) => <li key={s} className={`rounded-md border px-2 py-1 ${i === 0 ? 'bg-success-bg text-success-text border-green-200' : 'border-line text-ink-2'}`}>{i + 1}. {s}{i === 0 ? ' ✓' : ''}</li>)}</ol>
              <p className="text-[11px] text-ink-3 mt-2">Reporting windows are configured for the simulation and are illustrative — validate with Compliance before real use.</p>
            </div>
          )}
        </Card>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <Card title="Critical data elements · Banking">
          <ul className="divide-y divide-line">{dataElements.map((x) => (
            <li key={x.id}><button onClick={() => setSel(x.id)} className={`w-full text-left py-2 px-1 grid grid-cols-[1fr_7rem_auto] gap-3 items-center ${sel === x.id ? 'bg-brand-50' : 'hover:bg-slate-50'}`}>
              <span className="min-w-0"><span className="block font-medium text-ink text-sm">{x.name}</span><span className="block text-[11px] text-ink-3">{x.owner}{x.personal ? ' · personal data' : ''}{x.consentRequired ? ' · consent' : ''}</span></span>
              <span className="flex items-center gap-1.5"><span className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden"><span className={`block h-full ${x.quality >= 95 ? 'bg-ok' : x.quality >= 85 ? 'bg-brand-600' : 'bg-warn'}`} style={{ width: `${x.quality}%` }} /></span><span className="text-xs tabular-nums w-7 text-right">{x.quality}</span></span>
              <ArrowRight size={14} className="text-ink-4" />
            </button></li>
          ))}</ul>
          <p className="text-xs text-ink-3 mt-2">Bar = data-quality score (completeness, validity, timeliness). Select an element to see its lineage.</p>
        </Card>
        <Card title={`Lineage · ${cde.name}`}>
          <ol className="flex flex-col md:flex-row md:items-center gap-2 flex-wrap">
            {cde.lineage.map((id, i) => (
              <li key={id} className="flex items-center gap-2">
                <Link to={`/domain/banking/record/${id}`} className="rounded-lg border border-line bg-surface px-3 py-2 text-sm hover:border-brand-600"><div className="text-[10.5px] text-ink-3">{i === 0 ? 'Source' : 'Consumer'}</div><div className="font-medium text-ink">{appName(id)}</div></Link>
                <ArrowRight size={16} className="text-ink-4 shrink-0" />
              </li>
            ))}
            <li className="rounded-lg border border-brand-100 bg-brand-50 px-3 py-2 text-sm"><div className="text-[10.5px] text-brand-700">Report</div><div className="font-medium text-brand-900">{cde.report}</div></li>
          </ol>
          <dl className="grid grid-cols-2 gap-3 text-sm mt-4">
            <div><dt className="text-[11px] text-ink-3">Owner</dt><dd className="text-ink">{cde.owner}</dd></div>
            <div><dt className="text-[11px] text-ink-3">Quality</dt><dd className="text-ink">{cde.quality} / 100</dd></div>
            <div><dt className="text-[11px] text-ink-3">Personal data</dt><dd className="text-ink">{cde.personal ? 'Yes — DPDP applies' : 'No'}</dd></div>
            <div><dt className="text-[11px] text-ink-3">Consent needed</dt><dd className="text-ink">{cde.consentRequired ? 'Yes' : 'No (legitimate use)'}</dd></div>
          </dl>
        </Card>
      </div>
    </>
  )
}

// ── 4. Audit readiness ───────────────────────────────────────────────
export function AuditTab() {
  const [d, setD] = useState<DomainId>('banking')
  const s = sim[d]
  const fws = [...new Set(s.controls.map((c) => c.framework))]
  const buckets = [['0–30 days', 0, 30], ['31–90 days', 31, 90], ['91–180 days', 91, 180], ['> 180 days', 181, 99999]] as const
  const open = s.risks.filter((r) => r.severity !== 'Low')
  const evid = ['Automated test passed', 'Exception approved', 'Failed test', 'Missing'].map((e) => ({ e, n: s.controls.filter((c) => c.evidence === e).length }))
  return (
    <>
      <div className="inline-flex rounded-lg border border-slate-300 bg-white overflow-hidden text-[13px] mb-4">{domainOrder.map((x) => <button key={x} onClick={() => setD(x)} className={`px-3 py-1.5 ${d === x ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-ink-2 hover:bg-slate-50'}`}>{dn(x)}</button>)}</div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-5">
        <Card title="Readiness by framework">
          <ul className="space-y-3">{fws.map((f) => {
            const cs = s.controls.filter((c) => c.framework === f)
            const pass = cs.filter((c) => c.controlStatus === 'Passing').length, exc = cs.filter((c) => c.controlStatus === 'Exception' || c.controlStatus === 'Not tested').length, fail = cs.filter((c) => c.controlStatus === 'Failing').length
            const pct = Math.round((pass / cs.length) * 100)
            return (
              <li key={f}>
                <div className="flex justify-between text-sm"><span className="font-medium text-ink">{f}</span><span className={`font-semibold ${pct === 100 ? 'text-success-text' : pct >= 75 ? 'text-warn-text' : 'text-crit-text'}`}>{pct}% ready</span></div>
                <div className="flex h-2.5 rounded-full overflow-hidden gap-px mt-1" role="img" aria-label={`${pass} passing, ${exc} exception or not tested, ${fail} failing`}>
                  <div className="bg-ok" style={{ width: `${(pass / cs.length) * 100}%` }} /><div className="bg-warn" style={{ width: `${(exc / cs.length) * 100}%` }} /><div className="bg-crit" style={{ width: `${(fail / cs.length) * 100}%` }} />
                </div>
                <div className="text-[11px] text-ink-3">{pass} passing · {exc} exception / not tested · {fail} failing</div>
              </li>
            )
          })}</ul>
          <p className="text-xs text-ink-3 mt-2">Continuous control monitoring simulation (Vanta-style) — not an audit opinion.</p>
        </Card>
        <div className="space-y-5">
          <Card title="Evidence status">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">{evid.map(({ e, n }) => <div key={e} className={`rounded-lg border p-2.5 ${e === 'Automated test passed' ? ragBg.Green : e === 'Exception approved' ? ragBg.Amber : ragBg.Red}`}><div className="text-[11px] text-ink-2">{e}</div><div className="text-xl font-bold text-ink">{n}</div></div>)}</div>
          </Card>
          <Card title="Open findings ageing">
            <ul className="space-y-2">{buckets.map(([l, lo, hi]) => {
              const n = open.filter((r) => r.openedDays >= lo && r.openedDays <= hi).length
              return <li key={l} className="grid grid-cols-[6rem_1fr_2rem] items-center gap-2 text-sm"><span className="text-ink-2">{l}</span><div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full ${hi > 180 ? 'bg-crit' : hi > 90 ? 'bg-warn' : 'bg-brand-600'}`} style={{ width: `${(n / Math.max(1, open.length)) * 100}%` }} /></div><b className="text-right">{n}</b></li>
            })}</ul>
            <Link to={`/domain/${d}/vanta`} className="text-xs font-semibold text-brand-600 mt-2 inline-block">Full risk register and controls →</Link>
          </Card>
        </div>
      </div>
    </>
  )
}
