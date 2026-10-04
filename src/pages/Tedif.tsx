import { useState } from 'react'
import type { ReactNode } from 'react'
import { Check, CircleDashed, Clock, Star } from 'lucide-react'
import { domainOrder, domains } from '../data/domains'
import type { DomainId } from '../data/domains'
import {
  antiPatterns, catalogue, chain, chainReached, classification, crossDomainDecision, decisionLifecycle, deliverableStatus, deliverables,
  gateState, gates, measures, onboarding, onboardingSteps, phases, practiceStatus, practices, principles, quality, risks, rollout,
  sectionStatus, sections, shadow, stLabel, summary, tierOf,
} from '../data/tedif'
import type { St, Watch } from '../data/tedif'
import { Badge, Card, PageHeader } from '../components/ui'

const nav: [string, string][] = [
  ['summary', 'Summary'], ['principles', 'Five principles'], ['chain', 'Decision chain'], ['lifecycle', 'Lifecycle · 32 sections'],
  ['gates', 'Gates 1–5'], ['deliverables', 'Deliverables'], ['catalogue', 'Decision catalogue'], ['onboarding', 'Onboarding'],
  ['shadow', 'Shadow run'], ['rollout', 'Rollout ladder'], ['trust', 'Classification'], ['practices', '22 practices'],
  ['quality', 'Decision quality'], ['measures', 'Success measures'], ['risks', 'Failure patterns & risks'],
]

const stTone: Record<St, string> = { D: 'bg-emerald-500 text-white', P: 'bg-amber-400 text-slate-900', T: 'bg-slate-200 text-slate-500' }
const watchTone: Record<Watch, string> = { Clear: 'bg-emerald-50 text-emerald-700 border-emerald-200', Watch: 'bg-amber-50 text-amber-700 border-amber-200', Triggered: 'bg-red-50 text-red-700 border-red-200' }

function Cell({ s, label }: { s: St; label?: string }) {
  const Icon = s === 'D' ? Check : s === 'P' ? Clock : CircleDashed
  return (
    <span title={stLabel[s]} className={`inline-flex items-center justify-center gap-1 rounded-md text-[11px] font-semibold px-2 py-1 w-full ${stTone[s]}`}>
      <Icon size={12} /> {label ?? stLabel[s]}
    </span>
  )
}

function Section({ id, title, tag, children, action }: { id: string; title: string; tag: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 mb-6">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-blue-700">TEDIF · {tag}</div>
            <h2 className="text-lg font-extrabold text-slate-900">{title}</h2>
          </div>
          {action}
        </div>
        {children}
      </Card>
    </section>
  )
}

function DomainHead({ first = 'Item' }: { first?: string }) {
  return (
    <thead>
      <tr className="text-[11px] uppercase text-slate-500 border-b text-left">
        <th className="py-2 pr-2">{first}</th>
        {domainOrder.map((d) => <th key={d} className="py-2 px-1 w-[22%]">{domains[d].name}</th>)}
      </tr>
    </thead>
  )
}

const pct = (d: DomainId) => Math.round((sections.filter((_, i) => sectionStatus(d, i) === 'D').length / sections.length) * 100)

export default function Tedif() {
  const [mvpOnly, setMvpOnly] = useState(true)
  const [openGate, setOpenGate] = useState(3)
  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <>
      <PageHeader title="TEDIF Tracker" subtitle="Trusted Enterprise Decision Intelligence Framework v1.0 — tracked top to bottom across Banking, Manufacturing and Retail" />

      <div className="flex gap-6">
        <nav className="hidden xl:block w-48 shrink-0">
          <div className="sticky top-24 bg-white rounded-xl border border-slate-200 p-3 text-sm">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Sections</div>
            {nav.map(([id, label], i) => (
              <button key={id} onClick={() => go(id)} className="block w-full text-left px-2 py-1 rounded hover:bg-blue-50 text-slate-700">
                <span className="text-slate-400 text-xs mr-1">{i + 1}.</span>{label}
              </button>
            ))}
          </div>
        </nav>

        <div className="flex-1 min-w-0">
          {/* 1 · Summary */}
          <Section id="summary" title="Where each domain stands" tag="Summary">
            <div className="grid md:grid-cols-3 gap-4">
              {domainOrder.map((d) => {
                const s = summary[d]
                const inShadow = catalogue[d].filter((c) => c.status === 'Shadow').length
                return (
                  <div key={d} className="rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-extrabold text-lg">{domains[d].name}</div>
                      <span className={`text-[11px] font-semibold rounded px-2 py-0.5 ${s.conformance === 'Aligned' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}`}>{s.conformance}</span>
                    </div>
                    <div className="text-sm font-semibold text-blue-800">{s.phase}</div>
                    <div className="text-xs text-slate-500 mb-3">{s.note}</div>
                    <dl className="text-xs space-y-1">
                      <div className="flex justify-between"><dt className="text-slate-500">Last gate passed</dt><dd className="font-semibold">{s.lastGate}</dd></div>
                      <div className="flex justify-between"><dt className="text-slate-500">Next gate</dt><dd className="font-semibold">{s.nextGate}</dd></div>
                      <div className="flex justify-between"><dt className="text-slate-500">Conformance</dt><dd className="font-semibold">TEDIF {s.conformance}</dd></div>
                      <div className="flex justify-between"><dt className="text-slate-500">Decisions in shadow</dt><dd className="font-semibold">{inShadow} of {catalogue[d].length}</dd></div>
                      <div className="flex justify-between"><dt className="text-slate-500">Sections done</dt><dd className="font-semibold">{pct(d)}% of 32</dd></div>
                    </dl>
                    <div className="mt-3 flex gap-1">
                      {phases.map((p, i) => {
                        const st = gateState[d][i].outcome
                        return <div key={p} title={`${p} · Gate ${i + 1}: ${st}`} className={`flex-1 h-2 rounded ${st === 'Approved' ? 'bg-emerald-500' : st === 'In review' ? 'bg-amber-400' : 'bg-slate-200'}`} />
                      })}
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1">{phases.map((p) => <span key={p}>{p}</span>)}</div>
                  </div>
                )
              })}
            </div>
            <p className="text-xs text-slate-500 mt-3">90-day plan: no production AI before Gate 3. Thin slice = 3 decisions × 3 domains in shadow mode. Retail reuses the core and is added by configuration.</p>
          </Section>

          {/* 2 · Principles */}
          <Section id="principles" title="Five principles — is each one evidenced?" tag="Part 1 · Constitution">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[720px]">
                <DomainHead first="Principle" />
                <tbody>
                  {principles.map((p) => (
                    <tr key={p.name} className="border-b align-top">
                      <td className="py-2.5 pr-2"><div className="font-semibold">{p.name}</div><div className="text-xs text-slate-500">{p.test}</div></td>
                      {domainOrder.map((d) => (
                        <td key={d} className="px-1 py-2.5"><Cell s={p.status[d]} label={p.status[d] === 'D' ? 'Evidenced' : p.status[d] === 'P' ? 'Partial' : 'Not yet'} /><div className="text-[11px] text-slate-500 mt-1">{p.evidence[d]}</div></td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          {/* 3 · Decision chain */}
          <Section id="chain" title="Decision chain — how far each domain has wired it" tag="Part 1 · Core philosophy">
            <div className="space-y-3">
              {domainOrder.map((d) => (
                <div key={d}>
                  <div className="text-sm font-semibold mb-1">{domains[d].name} <span className="text-xs text-slate-500 font-normal">· {chainReached[d]} of {chain.length} links in place</span></div>
                  <div className="flex flex-wrap gap-1">
                    {chain.map((c, i) => (
                      <span key={c} className={`text-[11px] rounded px-2 py-1 font-semibold ${i < chainReached[d] ? (c === 'Decision' ? 'bg-blue-700 text-white' : 'bg-emerald-100 text-emerald-800') : 'bg-slate-100 text-slate-400'}`}>
                        {c}{i < chain.length - 1 && <span className="ml-1 opacity-50">→</span>}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-3">The decision is the unit of value. Outcome and learning links close only after decisions go Active and outcomes are measured.</p>
          </Section>

          {/* 4 · Lifecycle */}
          <Section
            id="lifecycle" title="Lifecycle — 5 phases, 32 sections" tag="Part 2"
            action={
              <div className="flex rounded-lg border border-slate-200 overflow-hidden text-xs font-semibold">
                <button onClick={() => setMvpOnly(true)} className={`px-3 py-1.5 ${mvpOnly ? 'bg-blue-700 text-white' : 'bg-white'}`}>★ MVP path (12)</button>
                <button onClick={() => setMvpOnly(false)} className={`px-3 py-1.5 ${!mvpOnly ? 'bg-blue-700 text-white' : 'bg-white'}`}>All 32</button>
              </div>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[720px]">
                <DomainHead first="Section" />
                <tbody>
                  {phases.map((ph) => {
                    const rows = sections.map((s, i) => ({ s, i })).filter(({ s }) => s.phase === ph && (!mvpOnly || s.mvp))
                    return [
                      <tr key={ph}><td colSpan={4} className="pt-4 pb-1 text-xs font-bold uppercase tracking-wide text-blue-700">Phase {phases.indexOf(ph) + 1} · {ph}</td></tr>,
                      ...rows.map(({ s, i }) => (
                        <tr key={s.id} className="border-b">
                          <td className="py-1.5 pr-2"><span className="font-mono text-xs text-blue-700 mr-2">{s.id}</span>{s.name}{s.mvp && <Star size={11} className="inline ml-1 text-amber-500 fill-amber-400" />}</td>
                          {domainOrder.map((d) => <td key={d} className="px-1 py-1.5"><Cell s={sectionStatus(d, i)} /></td>)}
                        </tr>
                      )),
                    ]
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-slate-500 mt-3">Hard dependencies: DS-05 trust before DS-06 AI · BL-04 trust platform enforcing before BL-05 AI platform. Retail DS-06 is blocked until DS-05 is signed.</p>
          </Section>

          {/* 5 · Gates */}
          <Section id="gates" title="Gates — funding decisions: approve, redo or stop" tag="Part 3 · Decision governance">
            <div className="grid grid-cols-5 gap-2 mb-4">
              {gates.map((g) => (
                <button key={g.n} onClick={() => setOpenGate(g.n)} className={`rounded-lg border p-2 text-left ${openGate === g.n ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                  <div className="text-xs font-bold text-blue-700">Gate {g.n}</div>
                  <div className="text-[11px] leading-tight">{g.name}</div>
                </button>
              ))}
            </div>
            {gates.filter((g) => g.n === openGate).map((g) => (
              <div key={g.n}>
                <div className="text-xs text-slate-500 mb-3">Review board: <b className="text-slate-700">{g.board}</b></div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[720px]">
                    <DomainHead first="Approval criterion" />
                    <tbody>
                      {g.criteria.map((c, ci) => (
                        <tr key={c} className="border-b">
                          <td className="py-2 pr-2">{c}</td>
                          {domainOrder.map((d) => {
                            const gs = gateState[d][g.n - 1]
                            const s: St = ci < gs.met ? 'D' : gs.outcome === 'Not reached' ? 'T' : 'P'
                            return <td key={d} className="px-1 py-2"><Cell s={s} label={s === 'D' ? 'Met' : s === 'P' ? 'Open' : '—'} /></td>
                          })}
                        </tr>
                      ))}
                      <tr>
                        <td className="py-2 font-bold">Gate outcome</td>
                        {domainOrder.map((d) => {
                          const gs = gateState[d][g.n - 1]
                          return <td key={d} className="px-1 py-2 text-sm"><b className={gs.outcome === 'Approved' ? 'text-emerald-700' : gs.outcome === 'In review' ? 'text-amber-600' : 'text-slate-400'}>{gs.outcome}</b>{gs.date && <span className="text-xs text-slate-500"> · {gs.date}</span>}</td>
                        })}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </Section>

          {/* 6 · Deliverables */}
          <Section id="deliverables" title="Named deliverables by phase" tag="Part 4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[720px]">
                <DomainHead first="Deliverable" />
                <tbody>
                  {(() => {
                    let k = 0
                    return deliverables.flatMap((ph) => [
                      <tr key={ph.phase}><td colSpan={4} className="pt-4 pb-1 text-xs font-bold uppercase tracking-wide text-blue-700">{ph.phase}</td></tr>,
                      ...ph.items.map((it) => {
                        const idx = k++
                        return (
                          <tr key={it} className="border-b">
                            <td className="py-1.5 pr-2">{it}</td>
                            {domainOrder.map((d) => <td key={d} className="px-1 py-1.5"><Cell s={deliverableStatus(d, idx)} /></td>)}
                          </tr>
                        )
                      }),
                    ])
                  })()}
                </tbody>
              </table>
            </div>
          </Section>

          {/* 7 · Decision catalogue */}
          <Section id="catalogue" title="Decision catalogue — thin slice: 3 decisions × 3 domains" tag="Part 5 · EDOM 5.2–5.4">
            <div className="flex flex-wrap items-center gap-1 text-[11px] mb-4">
              <span className="text-slate-500 mr-1">Lifecycle:</span>
              {decisionLifecycle.map((s, i) => <span key={s} className="flex items-center gap-1"><span className="rounded bg-slate-100 px-2 py-0.5 font-semibold">{s}</span>{i < decisionLifecycle.length - 1 && '→'}</span>)}
              <span className="ml-2 text-slate-500">· Active only from Shadow · catalogue fields frozen when Active</span>
            </div>
            <div className="grid lg:grid-cols-3 gap-4">
              {domainOrder.map((d) => (
                <div key={d}>
                  <div className="font-bold mb-2">{domains[d].name}</div>
                  <div className="space-y-2">
                    {catalogue[d].map((c) => {
                      const t = tierOf(c.risk)
                      return (
                        <div key={c.id} className="rounded-lg border border-slate-200 p-3 text-sm">
                          <div className="flex justify-between gap-2"><span className="font-mono text-xs text-blue-700">{c.id}</span><span className={`text-[11px] font-bold rounded px-1.5 ${c.status === 'Shadow' ? 'bg-violet-100 text-violet-800' : c.status === 'Catalogued' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'}`}>{c.status}</span></div>
                          <div className="font-semibold">{c.name}</div>
                          <div className="text-xs text-slate-500">{c.owner} → {c.approver}</div>
                          <div className="flex items-center gap-2 mt-2 text-xs">
                            <Badge>{c.risk}</Badge>
                            <span>Tier {t.tier} · {c.filled}/{t.fields} catalogue fields</span>
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full mt-1.5 overflow-hidden"><div className={`h-full ${c.filled >= t.fields ? 'bg-emerald-500' : 'bg-amber-400'}`} style={{ width: `${Math.min(100, (c.filled / t.fields) * 100)}%` }} /></div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-lg bg-blue-50 border border-blue-100 p-3 text-sm flex flex-wrap items-center gap-2">
              <b>Cross-domain:</b> <span className="font-mono text-xs text-blue-700">{crossDomainDecision.id}</span> {crossDomainDecision.name} · {crossDomainDecision.owner} → {crossDomainDecision.approver} · <Badge>{crossDomainDecision.risk}</Badge> <span className="text-xs">{crossDomainDecision.status}</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">Fields 1–18 at catalogue time (tiered by risk: 10 / 15 / 18) · fields 19–24 generated at runtime · fields 25–31 at decision time — never reduced.</p>
          </Section>

          {/* 8 · Onboarding */}
          <Section id="onboarding" title="Department onboarding — 12 steps" tag="EDOM 5.5">
            <div className="space-y-4">
              {domainOrder.map((d) => (
                <div key={d}>
                  <div className="text-sm mb-1"><b>{domains[d].name}</b> <span className="text-slate-500 text-xs">· {onboarding[d].dept} · step {Math.min(onboarding[d].done + 1, 12)} of 12</span></div>
                  <div className="grid grid-cols-6 lg:grid-cols-12 gap-1">
                    {onboardingSteps.map((s, i) => (
                      <div key={s} title={s} className={`rounded px-1 py-1.5 text-[10px] leading-tight text-center font-semibold ${i < onboarding[d].done ? 'bg-emerald-500 text-white' : i === onboarding[d].done ? 'bg-amber-400 text-slate-900' : 'bg-slate-100 text-slate-400'}`}>
                        {i + 1}. {s}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* 9 · Shadow run */}
          <Section id="shadow" title="Shadow run — AI recommends, humans decide as before, outputs compared" tag="EDOM 5.5 · step 11">
            <div className="grid md:grid-cols-3 gap-4">
              {domainOrder.map((d) => {
                const s = shadow[d]
                const ready = s.agreement > 80 && s.calibrationError < 10
                return (
                  <div key={d} className="rounded-xl border border-slate-200 p-4">
                    <div className="font-bold mb-2">{domains[d].name}</div>
                    {!s.started ? (
                      <p className="text-sm text-slate-500">Not started — starts after Gate 2 and data mapping. Retail decisions are Catalogued only.</p>
                    ) : (
                      <>
                        <div className="text-xs text-slate-500 mb-2">Week {s.week} of 4–6 · {s.observations} observations</div>
                        <div className="mb-2">
                          <div className="flex justify-between text-xs"><span>Agreement (target &gt; 80%)</span><b className={s.agreement > 80 ? 'text-emerald-700' : 'text-amber-600'}>{s.agreement}%</b></div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden relative"><div className={`h-full ${s.agreement > 80 ? 'bg-emerald-500' : 'bg-amber-400'}`} style={{ width: `${s.agreement}%` }} /><div className="absolute top-0 bottom-0 w-0.5 bg-slate-800" style={{ left: '80%' }} /></div>
                        </div>
                        <div className="mb-2">
                          <div className="flex justify-between text-xs"><span>Calibration error (target &lt; 10%)</span><b className={s.calibrationError < 10 ? 'text-emerald-700' : 'text-amber-600'}>{s.calibrationError}%</b></div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-blue-600" style={{ width: `${s.calibrationError * 5}%` }} /></div>
                        </div>
                        <div className="text-xs mt-2">Supervised go-live (low frequency): {s.supervised.join(', ') || '—'}</div>
                        <div className={`mt-3 text-xs font-bold ${ready ? 'text-emerald-700' : 'text-amber-600'}`}>{ready ? '✓ Meets department exit criteria' : '… Below exit threshold — continue shadow run'}</div>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </Section>

          {/* 10 · Rollout */}
          <Section id="rollout" title="Enterprise rollout ladder" tag="EDOM 5.6">
            <div className="space-y-1.5">
              {rollout.map((r, i) => {
                const here = domainOrder.filter((d) => summary[d].rollout === i + 1)
                return (
                  <div key={r} className="flex items-center gap-3">
                    <div className={`flex-1 rounded-lg px-3 py-2 text-sm ${here.length ? 'bg-blue-700 text-white font-semibold' : 'bg-slate-50 text-slate-600'}`}>{i + 1} · {r}</div>
                    <div className="w-56 text-xs">{here.map((d) => domains[d].name).join(' · ')}</div>
                  </div>
                )
              })}
              <div className="text-xs text-slate-500 pt-1">Pre-pilot: {domainOrder.filter((d) => summary[d].rollout === 0).map((d) => domains[d].name).join(', ')}</div>
            </div>
          </Section>

          {/* 11 · Trust & classification */}
          <Section id="trust" title="Data classification decides where AI runs" tag="12.5 · Part 10 routing">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[760px]">
                <thead><tr className="text-[11px] uppercase text-slate-500 border-b text-left"><th className="py-2">Level</th><th>Model routing</th>{domainOrder.map((d) => <th key={d}>{domains[d].name} example</th>)}</tr></thead>
                <tbody>
                  {classification.map((c, i) => (
                    <tr key={c.level} className="border-b">
                      <td className="py-2"><span className={`text-xs font-semibold rounded px-2 py-0.5 ${i < 2 ? 'bg-emerald-50 text-emerald-700' : i === 2 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>{c.level}</span></td>
                      <td className="font-medium pr-2">{c.routing}</td>
                      {domainOrder.map((d) => <td key={d} className="text-slate-600 pr-2">{c.examples[d]}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-slate-500 mt-2">Route on the highest classification present in a request. Unknown classification runs locally.</p>
          </Section>

          {/* 12 · Practices */}
          <Section id="practices" title="22 cross-cutting excellence practices" tag="Part 7 · EP-01 … EP-22">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[720px]">
                <DomainHead first="Practice" />
                <tbody>
                  {practices.map((p, i) => (
                    <tr key={p} className="border-b">
                      <td className="py-1.5 pr-2"><span className="font-mono text-xs text-blue-700 mr-2">EP-{String(i + 1).padStart(2, '0')}</span>{p}</td>
                      {domainOrder.map((d) => { const s = practiceStatus(d, i); return <td key={d} className="px-1 py-1.5"><Cell s={s} label={s === 'D' ? 'Operating' : s === 'P' ? 'Partial' : 'Not started'} /></td> })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          {/* 13 · Decision quality */}
          <Section id="quality" title="Decision quality ≠ business outcome" tag="12.3">
            <div className="grid md:grid-cols-3 gap-4">
              {domainOrder.map((d) => {
                const q = quality[d]
                return (
                  <div key={d} className="rounded-xl border border-slate-200 p-4">
                    <div className="font-bold mb-2">{domains[d].name}</div>
                    {!q ? <p className="text-sm text-slate-500">No shadow-run decisions yet.</p> : (
                      <>
                        <div className="text-[11px] uppercase font-semibold text-slate-500 mb-1">Quality × outcome (shadow decisions)</div>
                        <div className="grid grid-cols-2 gap-1 text-xs text-center mb-3">
                          <div className="rounded bg-emerald-100 p-2"><b className="text-lg block">{q.reinforce}</b>Reinforce</div>
                          <div className="rounded bg-blue-50 p-2"><b className="text-lg block">{q.accept}</b>Accept variance</div>
                          <div className="rounded bg-red-100 p-2"><b className="text-lg block">{q.nearMiss}</b>Near-miss</div>
                          <div className="rounded bg-amber-100 p-2"><b className="text-lg block">{q.fix}</b>Fix (RCA)</div>
                        </div>
                        <div className="text-[11px] uppercase font-semibold text-slate-500 mb-1">Challenge rate × yield</div>
                        <div className="text-sm">Rate <b>{q.challengeRate}%</b> · Yield <b>{q.challengeYield}%</b></div>
                        <div className="text-xs mt-1 font-semibold text-emerald-700">
                          {q.challengeRate >= 25 ? 'Healthy oversight' : 'Low rate, high yield — acceptable'}
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
            <p className="text-xs text-slate-500 mt-3">Quality score frozen at decision time (8 factors). Near-miss = poor process with a lucky outcome — fix before it scales. Challenge measured per department, never per person.</p>
          </Section>

          {/* 14 · Success measures */}
          <Section id="measures" title="Success measures" tag="Part 15">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[720px]">
                <thead><tr className="text-[11px] uppercase text-slate-500 border-b text-left"><th className="py-2">Measure</th><th>Target</th>{domainOrder.map((d) => <th key={d}>{domains[d].name}</th>)}</tr></thead>
                <tbody>
                  {measures.map((m) => (
                    <tr key={m.name} className="border-b">
                      <td className="py-2 pr-2">{m.name}</td><td className="font-bold">{m.target}</td>
                      {domainOrder.map((d) => (
                        <td key={d}><span className={`font-semibold ${m.ok[d] === true ? 'text-emerald-700' : m.ok[d] === false ? 'text-amber-600' : 'text-slate-400'}`}>{m.ok[d] === true ? '✓ ' : m.ok[d] === false ? '⚠ ' : ''}{m.values[d]}</span></td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          {/* 15 · Failure patterns & risks */}
          <Section id="risks" title="Failure patterns and open risks" tag="12.4 · Part 16">
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-sm min-w-[720px]">
                <DomainHead first="Failure pattern" />
                <tbody>
                  {antiPatterns.map((a) => (
                    <tr key={a.id} className="border-b">
                      <td className="py-2 pr-2"><span className="font-mono text-xs text-blue-700 mr-2">{a.id}</span><b>{a.name}</b><div className="text-xs text-slate-500">Signal: {a.signal}</div></td>
                      {domainOrder.map((d) => <td key={d} className="px-1"><span className={`inline-block text-[11px] font-semibold border rounded px-2 py-0.5 ${watchTone[a.status[d]]}`}>{a.status[d]}</span></td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[720px]">
                <thead><tr className="text-[11px] uppercase text-slate-500 border-b text-left"><th className="py-2">Risk</th><th>Severity</th><th>Mitigation</th><th>Domains</th></tr></thead>
                <tbody>
                  {risks.map((r) => (
                    <tr key={r.id} className="border-b align-top">
                      <td className="py-2 pr-2"><span className="font-mono text-xs text-blue-700 mr-2">{r.id}</span>{r.risk}</td>
                      <td className="pr-2"><Badge>{r.severity}</Badge></td>
                      <td className="pr-2 text-slate-600">{r.mitigation}</td>
                      <td className="text-xs text-slate-500">{r.domains}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        </div>
      </div>
    </>
  )
}
