// M8 LEAN — "Frameworks applied" tab per owner, plus Kotter + ADKAR for the Team page.
// Only frameworks that serve the owner's BP1 problem, each with a tracked metric (docs/SYLLABUS_AND_FRAMEWORKS.md §8).
import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, CircleCheck, CircleDashed, Circle } from 'lucide-react'
import { domainOrder, domains } from '../../data/domains'
import type { DomainId } from '../../data/domains'
import { sim } from '../../data/sim'
import {
  ADKAR, CYNEFIN_APPROACH, H_TARGET, RGT_TARGET, ROGERS, adkar, balancedScorecard, constraints, decisionsFramed, diffusion, pankajFwMeasures, ramFwMeasures,
  rgtGap, runGrowTransform, santhoshFwMeasures, sumanFwMeasures, tco, teamFwMeasures, threeHorizons, threeLines, tornado, vaibhavFwMeasures,
} from '../../data/sim/frameworks'
import type { Cynefin } from '../../data/sim/frameworks'
import { buildEvents } from '../../data/sim/events'
import { decisionsFor } from '../../data/sim/decisions'
import { USE_CASES, gateDecisionId } from '../../data/sim/aiPortfolio'
import { measureState } from '../../data/sim/team'
import type { MeasureDef } from '../../data/sim/team'
import { Badge, Card } from '../../components/ui'
import { GlidePill, MeasureCard } from '../../components/team/workspace'
import { useDecisionState } from '../../components/sim/decisionState'
import { useSimClock } from '../../components/sim/clock'

const dn = (d: DomainId) => domains[d].name
const cr = (n: number) => `₹${Math.round(n * 10) / 10} Cr`
const ALL: DomainId[] = ['banking', 'manufacturing', 'retail']

function Fw({ name, area, why, children }: { name: string; area: string; why: string; children: ReactNode }) {
  return (
    <Card className="mb-5">
      <div className="flex flex-wrap items-baseline gap-2 -mt-1 mb-3">
        <BookOpen size={15} className="text-brand-600 self-center" />
        <h3 className="text-[16px] font-semibold text-ink">{name}</h3>
        <span className="text-[11px] uppercase tracking-wide text-ink-3">{area}</span>
        <span className="text-xs text-ink-2 basis-full sm:basis-auto sm:ml-auto">{why}</span>
      </div>
      {children}
    </Card>
  )
}
function Metrics({ defs }: { defs: MeasureDef[] }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 mb-5">{defs.map((d) => <MeasureCard key={d.id} m={measureState(d)} />)}</div>
}
function Intro() {
  return <p className="text-xs text-ink-3 mb-4">Only frameworks that serve this owner's BP1 problem are applied here, each with a tracked metric (baseline Nov 2025 → today → target). The full library is on <Link to="/team/frameworks" className="text-brand-600 font-semibold hover:underline">Frameworks & syllabus</Link>.</p>
}

// ── Ram ──────────────────────────────────────────────────────────────
const CYN_POS: Record<Cynefin, string> = { Complex: 'order-1', Complicated: 'order-2', Chaotic: 'order-3', Clear: 'order-4' }
export function RamFrameworks() {
  const bsc = balancedScorecard()
  const fr = useMemo(() => decisionsFramed(), [])
  const { now } = useSimClock()
  const st = useDecisionState()
  const events = useMemo(() => ALL.flatMap((d) => buildEvents(sim[d])), [])
  const released = events.filter((e) => e.at <= now)
  const decided = fr.filter((x) => st.statusOf(x.d) !== 'Awaiting decision')
  const acts = ALL.flatMap((d) => decisionsFor(sim[d])).filter((d) => st.statusOf(d) === 'Approved').flatMap((d) => d.actions).filter((a) => st.actionStatus(a) !== 'Not Started').length
  return (
    <>
      <Intro />
      <Metrics defs={ramFwMeasures()} />
      <Fw name="Balanced Scorecard" area="Execution" why="Is the transformation balanced across money, customers, processes and capability?">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">{bsc.map((p) => (
          <div key={p.perspective} className="rounded-xl border border-line p-3">
            <div className="flex items-center justify-between"><b className="text-ink">{p.perspective}</b><span className="text-xl font-bold text-brand-900">{p.score}%</span></div>
            <div className="text-[11px] text-ink-3 mb-2">{p.measures.length} measures · {p.behind} behind plan</div>
            <ul className="space-y-1">{p.measures.map((m) => (
              <li key={m.def.id} className="text-xs"><div className="flex justify-between gap-2"><span className="truncate text-ink-2" title={`${m.def.name} (${m.owner})`}>{m.def.name}</span><span className="text-ink-3 shrink-0">{m.owner}</span></div><div className="h-1 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full ${m.glide === 'Behind' ? 'bg-warn' : 'bg-brand-600'}`} style={{ width: `${m.progress}%` }} /></div></li>
            ))}</ul>
          </div>
        ))}</div>
        <p className="text-xs text-ink-3 mt-2">Score = average share of the old → target gap closed by the 30 team measures in each perspective.</p>
      </Fw>
      <Fw name="Cynefin + RAPID" area="Decision-making" why="Decide differently by problem type, and make the decider explicit.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">{(['Complex', 'Complicated', 'Chaotic', 'Clear'] as Cynefin[]).map((c) => {
          const xs = fr.filter((x) => x.cynefin === c)
          return (
            <div key={c} className={`rounded-xl border p-3 ${CYN_POS[c]} ${c === 'Chaotic' ? 'border-red-200 bg-crit-bg' : 'border-line bg-slate-50'}`}>
              <div className="flex justify-between"><b className="text-ink">{c}</b><span className="text-xs text-ink-3">{xs.length} decisions · avg {xs.length ? Math.round(xs.reduce((a, x) => a + x.age, 0) / xs.length) : 0} days open</span></div>
              <div className="text-[11px] text-ink-2 mb-1.5">{CYNEFIN_APPROACH[c]}</div>
              <div className="flex flex-wrap gap-1">{xs.slice(0, 6).map((x) => <Link key={x.d.id} to={`/domain/${x.d.domain}/decisions#${x.d.id}`} className="text-[10.5px] bg-white border border-line rounded px-1.5 py-0.5 hover:border-brand-600 truncate max-w-[14rem]" title={x.d.title}>{x.d.title}</Link>)}{xs.length === 0 && <span className="text-[11px] text-ink-3">{c === 'Chaotic' ? 'None now — the golden-thread peak would be one: act first (stabilise capacity), then analyse.' : '—'}</span>}</div>
            </div>
          )
        })}</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[900px] [&_th]:px-2 [&_td]:px-2">
            <thead><tr className="text-[11px] uppercase tracking-wide text-ink-3 border-b border-line text-left"><th className="py-2">Decision</th><th>Cynefin</th><th>Recommend</th><th>Agree</th><th>Perform</th><th>Input</th><th>Decide</th></tr></thead>
            <tbody>{[...fr].sort((a, b) => ['Critical', 'High', 'Medium', 'Low'].indexOf(a.d.priority) - ['Critical', 'High', 'Medium', 'Low'].indexOf(b.d.priority)).slice(0, 10).map((x) => (
              <tr key={x.d.id} className="border-b border-line last:border-0 align-top">
                <td className="py-1.5"><Link to={`/domain/${x.d.domain}/decisions#${x.d.id}`} className="font-medium text-ink hover:underline">{x.d.title}</Link><div className="text-[11px] text-ink-3">{dn(x.d.domain)} · {x.d.priority}</div></td>
                <td className="text-xs">{x.cynefin}</td><td className="text-xs">{x.rapid.R}</td><td className="text-xs">{x.rapid.A}</td><td className="text-xs">{x.rapid.P}</td><td className="text-xs text-ink-3">{x.rapid.I}</td><td className="text-xs font-semibold text-brand-900">{x.rapid.D}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
        <p className="text-xs text-ink-3 mt-2">Cynefin by rule: cross-system stories with ≥ 3 red signals are Complex; investment, capacity and architecture choices are Complicated; risk acceptance and process fixes are Clear. RAPID: High and Critical decisions are decided by the CTO.</p>
      </Fw>
      <Fw name="OODA loop" area="Decision speed" why="The control-tower loop, named.">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">{[
          ['Observe', `${released.length} source events`, 'Simulated agents watch 7 sources'],
          ['Orient', `${released.filter((e) => e.tone === 'crit' || e.tone === 'warn').length} signals`, 'Correlation by shared record IDs'],
          ['Decide', `${decided.length} of ${fr.length} decided`, 'Humans decide (TEDIF)'],
          ['Act', `${acts} actions moving`, 'Action tracker → outcomes'],
        ].map(([k, v, s], i) => <div key={k} className="rounded-lg border border-line p-3" style={{ background: `rgba(37,99,235,${0.04 + i * 0.03})` }}><div className="text-xs font-semibold text-brand-700">{i + 1}. {k}</div><div className="font-bold text-ink">{v}</div><div className="text-[11px] text-ink-3">{s}</div></div>)}</div>
      </Fw>
    </>
  )
}

// ── Suman ────────────────────────────────────────────────────────────
export function SumanFrameworks() {
  const [d, setD] = useState<DomainId | 'all'>('all')
  const units = d === 'all' ? ALL : [d]
  const th = threeHorizons(units)
  const df = diffusion(units)
  return (
    <>
      <Intro />
      <Metrics defs={sumanFwMeasures()} />
      <div className="inline-flex rounded-lg border border-slate-300 bg-white overflow-hidden text-[13px] mb-4">{(['all', ...domainOrder] as (DomainId | 'all')[]).map((x) => <button key={x} onClick={() => setD(x)} className={`px-3 py-1.5 ${d === x ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-ink-2 hover:bg-slate-50'}`}>{x === 'all' ? 'All units' : dn(x)}</button>)}</div>
      <Fw name="Three Horizons" area="Innovation portfolio" why="Is AI investment balanced between core value today and future bets?">
        <div className="space-y-2 mb-3">{[['Actual', th.map((x) => x.pct)], ['Target', th.map((x) => x.target)]].map(([l, v]) => (
          <div key={l as string} className="grid grid-cols-[4rem_1fr] items-center gap-2 text-xs"><span className="text-ink-2">{l as string}</span>
            <div className="flex h-6 rounded-md overflow-hidden gap-0.5">{(v as number[]).map((p, i) => <div key={i} className="flex items-center justify-center text-white font-semibold" style={{ width: `${p}%`, background: ['#0f2747', '#2563eb', '#86b6ef'][i] }}>{p >= 8 ? `${p}%` : ''}</div>)}</div></div>
        ))}</div>
        <div className="flex gap-4 text-xs text-ink-3 mb-3">{Object.keys(H_TARGET).map((h, i) => <span key={h}><span className="inline-block w-3 h-3 rounded-sm mr-1 align-middle" style={{ background: ['#0f2747', '#2563eb', '#86b6ef'][i] }} />{h}</span>)}</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">{th.map((x) => (
          <div key={x.h} className="rounded-lg border border-line p-3"><div className="font-semibold text-ink text-sm">{x.h} <span className="text-xs text-ink-3 font-normal">· {x.n} use cases · {cr(x.inv)}</span></div>
            <ul className="text-xs text-ink-2 mt-1 space-y-0.5">{x.items.slice(0, 6).map((u) => <li key={u.id} className="truncate" title={u.name}>{u.name}{d === 'all' ? ` · ${dn(u.domain)}` : ''}</li>)}{x.items.length > 6 && <li className="text-ink-3">+{x.items.length - 6} more</li>}</ul></div>
        ))}</div>
        <p className="text-xs text-ink-3 mt-2">H1 = live (production / scaled), H2 = pilots and PoCs, H3 = ideas (incl. simulated blockchain trade finance and industrial-metaverse training). Too little in H1 = "pilot purgatory".</p>
      </Fw>
      <Fw name="Diffusion of Innovations + Crossing the Chasm" area="Adoption" why="Which live AI use cases have crossed into the mainstream, and which are stuck?">
        <div className="relative h-16 rounded-lg overflow-hidden flex mb-1" role="img" aria-label="Rogers adopter segments with use cases placed by adoption">
          {ROGERS.map(([seg, lim], i) => { const prev = i ? ROGERS[i - 1][1] : 0; return <div key={seg} className="h-full border-r border-white flex items-end justify-center pb-1 text-[10px] text-ink-2" style={{ width: `${lim - prev}%`, background: ['#eff6ff', '#dbeafe', '#cde2fb', '#b9d5f6', '#e2e8f0'][i] }}>{lim - prev >= 10 ? seg : ''}</div> })}
          <div className="absolute top-0 bottom-0 w-0.5 bg-crit" style={{ left: '16%' }} title="The chasm (16%)" />
          {df.rows.map((x, i) => <div key={x.u.id} className="absolute w-2.5 h-2.5 rounded-full bg-brand-900 border border-white" style={{ left: `calc(${Math.min(97, x.adoption)}% - 5px)`, top: `${8 + (i % 4) * 7}px` }} title={`${x.u.name}: ${x.adoption}%`} />)}
        </div>
        <div className="flex justify-between text-[10px] text-ink-3 mb-3"><span>0% adoption</span><span className="text-crit-text font-semibold">chasm at 16%</span><span>100%</span></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[820px] [&_th]:px-2 [&_td]:px-2">
            <thead><tr className="text-[11px] uppercase tracking-wide text-ink-3 border-b border-line text-left"><th className="py-2">Use case</th><th className="text-right">Adoption</th><th>Segment</th><th>Rogers factors (advantage · compatibility · simplicity · trialability · observability)</th></tr></thead>
            <tbody>{[...df.rows].sort((a, b) => a.adoption - b.adoption).map((x) => (
              <tr key={x.u.id} className="border-b border-line last:border-0">
                <td className="py-1.5"><div className="font-medium text-ink">{x.u.name}</div><div className="text-[11px] text-ink-3">{dn(x.u.domain)} · {x.u.stage} · live {x.u.monthsLive} months</div></td>
                <td className={`text-right tabular-nums ${x.adoption <= 16 ? 'text-crit-text font-semibold' : ''}`}>{x.adoption}%</td>
                <td className="text-xs">{x.segment}{x.adoption <= 16 ? ' · before the chasm' : ''}</td>
                <td><div className="flex gap-1">{Object.entries(x.factors).map(([k, v]) => <div key={k} className="w-10" title={`${k}: ${v}/10`}><div className="h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full ${v < 5 ? 'bg-warn' : 'bg-brand-600'}`} style={{ width: `${v * 10}%` }} /></div></div>)}</div></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
        <p className="text-xs text-ink-3 mt-2">Adoption follows an S-curve from go-live. Use cases below 16% need chasm-crossing moves: a reference user, a whole-product package, and fixing the weakest Rogers factor. The Business Model Canvas is generated in "Onboard any organisation".</p>
      </Fw>
    </>
  )
}

// ── Vaibhav ──────────────────────────────────────────────────────────
export function VaibhavFrameworks() {
  const [d, setD] = useState<DomainId | 'all'>('banking')
  const t = threeLines().filter((x) => d === 'all' || x.d === d)
  const L = (ok: boolean) => (ok ? <CircleCheck size={15} className="text-success-text" /> : <CircleDashed size={15} className="text-crit-text" />)
  return (
    <>
      <Intro />
      <Metrics defs={vaibhavFwMeasures()} />
      <Fw name="Three Lines Model" area="Risk governance" why="For every high / critical technology risk: who owns it, who oversees it, who assures it?">
        <div className="inline-flex rounded-lg border border-slate-300 bg-white overflow-hidden text-[13px] mb-3">{(['all', ...domainOrder] as (DomainId | 'all')[]).map((x) => <button key={x} onClick={() => setD(x)} className={`px-3 py-1.5 ${d === x ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-ink-2 hover:bg-slate-50'}`}>{x === 'all' ? 'All units' : dn(x)}</button>)}</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">{[
          ['1st line · own and manage', 'Business and technology owners', t.filter((x) => x.first).length],
          ['2nd line · oversee', 'Risk, compliance, CISO (Vaibhav)', t.filter((x) => x.second).length],
          ['3rd line · assure', 'Internal audit (independent)', t.filter((x) => x.third).length],
        ].map(([k, s, n]) => <div key={k as string} className="rounded-xl border border-line p-3"><div className="text-xs font-semibold text-brand-700">{k as string}</div><div className="text-2xl font-bold text-ink">{n as number} / {t.length}</div><div className="text-[11px] text-ink-3">{s as string}</div></div>)}</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[720px] [&_th]:px-2 [&_td]:px-2">
            <thead><tr className="text-[11px] uppercase tracking-wide text-ink-3 border-b border-line text-left"><th className="py-2">Risk</th><th>Severity</th><th>1st line owner</th><th className="text-center">2nd line</th><th className="text-center">3rd line</th></tr></thead>
            <tbody>{t.map((x) => (
              <tr key={x.r.id} className="border-b border-line last:border-0">
                <td className="py-1.5"><Link to={`/domain/${x.d}/record/${x.r.id}`} className="font-medium text-ink hover:underline">{x.r.name}</Link><div className="text-[11px] text-ink-3">{x.r.id} · {dn(x.d)} · {x.r.category}</div></td>
                <td><Badge>{x.r.severity}</Badge></td><td className="text-xs">{x.r.owner}</td>
                <td><div className="flex justify-center">{L(x.second)}</div></td><td><div className="flex justify-center">{L(x.third)}</div></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
        <p className="text-xs text-ink-3 mt-2">Gaps in the 3rd line are scheduled into the internal-audit plan; gaps in the 2nd line go to Vaibhav's review queue. Simulated governance data.</p>
      </Fw>
    </>
  )
}

// ── Santhosh ─────────────────────────────────────────────────────────
export function SanthoshFrameworks() {
  const [sel, setSel] = useState(sim.banking.initiatives[1].id)
  const ins = ALL.flatMap((d) => sim[d].initiatives.map((i) => ({ i, d })))
  const cur = ins.find((x) => x.i.id === sel)!
  const tz = tornado(cur.i)
  const span = Math.max(...tz.bars.map((b) => Math.max(Math.abs(b.lo - tz.base), Math.abs(b.hi - tz.base)))) || 1
  return (
    <>
      <Intro />
      <Metrics defs={santhoshFwMeasures()} />
      <Fw name="Run-Grow-Transform" area="Portfolio" why="Is technology spend balanced between running, growing and transforming the business?">
        <div className="space-y-3">{ALL.map((d) => { const x = runGrowTransform(d); return (
          <div key={d} className="grid grid-cols-[7rem_1fr_6rem] items-center gap-3 text-xs">
            <span className="font-medium text-ink">{dn(d)}</span>
            <div className="flex h-6 rounded-md overflow-hidden gap-0.5">{(['Run', 'Grow', 'Transform'] as const).map((k, i) => <div key={k} className="flex items-center justify-center text-white font-semibold" style={{ width: `${x[k]}%`, background: ['#64748b', '#2563eb', '#0f2747'][i] }}>{x[k]}%</div>)}</div>
            <span className="text-right text-ink-2">gap {rgtGap(x)} pts</span>
          </div>
        ) })}
          <div className="grid grid-cols-[7rem_1fr_6rem] items-center gap-3 text-xs"><span className="text-ink-3">Target</span><div className="flex h-4 rounded-md overflow-hidden gap-0.5 opacity-60">{(['Run', 'Grow', 'Transform'] as const).map((k, i) => <div key={k} className="flex items-center justify-center text-white" style={{ width: `${RGT_TARGET[k]}%`, background: ['#64748b', '#2563eb', '#0f2747'][i] }}>{RGT_TARGET[k]}%</div>)}</div><span /></div>
        </div>
        <p className="text-xs text-ink-3 mt-2">Run = keep the lights on; Grow = expand the existing business (digital channels, lending, personalisation, supply chain); Transform = new platforms, modernisation, AI. Grow is under-funded in Banking and Manufacturing.</p>
      </Fw>
      <Fw name="Sensitivity analysis (tornado)" area="Capital budgeting" why="Which assumption moves this investment's NPV the most?">
        <select value={sel} onChange={(e) => setSel(e.target.value)} className="border border-slate-300 rounded-lg px-2 py-1.5 bg-white text-sm mb-3 max-w-full">{ins.map(({ i, d }) => <option key={i.id} value={i.id}>{i.name} · {dn(d)}</option>)}</select>
        <div className="text-sm mb-2">Base NPV (12%, 5 years): <b className={tz.base < 0 ? 'text-crit-text' : 'text-ink'}>{cr(tz.base)}</b></div>
        <ul className="space-y-2">{tz.bars.map((b) => (
          <li key={b.k} className="grid grid-cols-[10rem_1fr] gap-3 items-center text-xs">
            <span className="text-ink-2">{b.k}</span>
            <div className="relative h-5 bg-slate-50 rounded" role="img" aria-label={`${b.k}: ${b.lo} to ${b.hi}`}>
              <div className="absolute top-0 bottom-0 w-px bg-ink-3" style={{ left: '50%' }} />
              <div className="absolute top-0.5 bottom-0.5 rounded-sm bg-seq-250" style={{ left: `${50 + ((Math.min(b.lo, b.hi) - tz.base) / span) * 48}%`, width: `${(Math.abs(b.hi - b.lo) / span) * 48}%` }} />
              <span className="absolute -top-0.5 text-[10px] text-ink-2" style={{ left: `${Math.max(0, 50 + ((Math.min(b.lo, b.hi) - tz.base) / span) * 48 - 9)}%` }}>{cr(Math.min(b.lo, b.hi))}</span>
              <span className="absolute -top-0.5 text-[10px] text-ink-2" style={{ left: `${Math.min(88, 50 + ((Math.max(b.lo, b.hi) - tz.base) / span) * 48 + 1)}%` }}>{cr(Math.max(b.lo, b.hi))}</span>
            </div>
          </li>
        ))}</ul>
        <p className="text-xs text-ink-3 mt-2">Bars sorted by swing; centre line = base NPV. Benefit value is usually the biggest driver, so benefits tracking (value realisation) matters more than cost control.</p>
      </Fw>
      <Fw name="Total cost of ownership (TCO)" area="Investment" why="What does each initiative really cost over 5 years?">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">{ALL.map((d) => { const rows = tco(d).sort((a, b) => b.tco - a.tco).slice(0, 5); return (
          <div key={d}><div className="font-semibold text-sm text-ink mb-1">{dn(d)} · {cr(tco(d).reduce((a, x) => a + x.tco, 0))}</div>
            <table className="w-full text-xs"><tbody>{rows.map((x) => <tr key={x.i.id} className="border-b border-line last:border-0"><td className="py-1 text-ink-2 truncate max-w-[10rem]" title={x.i.name}>{x.i.name}</td><td className="text-right tabular-nums">{cr(x.build)}</td><td className="text-right tabular-nums text-ink-3">+{cr(x.run5)}</td><td className="text-right tabular-nums font-semibold">{cr(x.tco)}</td></tr>)}</tbody></table>
          </div>
        ) })}</div>
        <p className="text-xs text-ink-3 mt-2">TCO = build (forecast at completion) + 5 years of run cost (10% of build a year).</p>
      </Fw>
    </>
  )
}

// ── Pankaj ───────────────────────────────────────────────────────────
export function PankajFrameworks() {
  const cs = constraints()
  return (
    <>
      <Intro />
      <Metrics defs={pankajFwMeasures()} />
      <Fw name="Theory of Constraints" area="Operations" why="Find the one bottleneck that limits each peak — and fix that first.">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">{cs.map((x) => (
          <div key={x.s.id} className="rounded-xl border border-line p-3">
            <div className="font-semibold text-ink">{x.s.label} · {dn(x.s.d)}</div>
            <div className="text-xs text-ink-3 mb-2">Constraint headroom {x.headroom}% · peak utilisation {x.peakUtil}% · margin {x.margin}%</div>
            <ol className="space-y-1.5">{x.steps.map(([k, v], i) => <li key={k} className="flex gap-2 text-xs"><span className="w-5 h-5 shrink-0 rounded-full bg-brand-50 text-brand-700 font-bold flex items-center justify-center">{i + 1}</span><span><b className="text-ink">{k}.</b> <span className="text-ink-2">{v}</span></span></li>)}</ol>
          </div>
        ))}</div>
        <p className="text-xs text-ink-3 mt-2">Elevating anything other than the constraint does not raise peak throughput. Constraint and next constraint come from the live capacity data; scale-out from the peak scenarios.</p>
      </Fw>
    </>
  )
}

// ── Team · Kotter + ADKAR ────────────────────────────────────────────
export function KotterAdkar() {
  const st = useDecisionState()
  const decisions = ALL.flatMap((d) => decisionsFor(sim[d]))
  const capApproved = decisions.some((x) => x.kind === 'Portfolio' && st.statusOf(x) === 'Approved')
  const promoted = USE_CASES.some((u) => u.gate && st.verdicts[gateDecisionId(u)]?.v === 'Approved')
  const steps: [string, 'done' | 'progress' | 'todo', string][] = [
    ['Create urgency', 'done', 'Golden thread and P&L losses make the cost of inaction visible'],
    ['Build a guiding coalition', 'done', '5 accountable owners with a RACI (this page)'],
    ['Form a strategic vision', 'done', 'Capstone problem statement and target states'],
    ['Enlist a volunteer army', 'done', 'Command Center and workspaces shared across business units'],
    ['Remove barriers', capApproved ? 'done' : 'progress', capApproved ? 'Engineering capacity rebalanced (decision approved)' : 'Capacity rebalancing decision awaiting approval'],
    ['Generate short-term wins', 'done', 'Cloud and AI decisions approved in July already show measured outcomes'],
    ['Sustain acceleration', promoted ? 'done' : 'progress', promoted ? 'A pilot promoted to production through the gate' : 'Pilots waiting at their production gate'],
    ['Institute change (refreeze)', 'todo', 'TEDIF gates, decision rights and measures become standard operating practice'],
  ]
  const groups = adkar()
  const cls = (v: number) => (v >= 4 ? 'bg-success-bg text-success-text' : v >= 3 ? 'bg-info-bg text-info-text' : v >= 2.5 ? 'bg-warn-bg text-warn-text' : 'bg-crit-bg text-crit-text')
  return (
    <div className="grid grid-cols-1 2xl:grid-cols-2 gap-5">
      <Card title="Kotter 8 steps · organisation-level change" className="min-w-0">
        <ol className="space-y-2">{steps.map(([k, s, ev], i) => (
          <li key={k} className="flex gap-2 text-sm">{s === 'done' ? <CircleCheck size={16} className="text-success-text shrink-0 mt-0.5" /> : s === 'progress' ? <CircleDashed size={16} className="text-warn-text shrink-0 mt-0.5" /> : <Circle size={16} className="text-ink-4 shrink-0 mt-0.5" />}<span><b className="text-ink">{i + 1}. {k}</b> <span className="text-xs text-ink-2">— {ev}</span></span></li>
        ))}</ol>
        <p className="text-xs text-ink-3 mt-2">Lewin view: steps 1–4 unfreeze, 5–7 change, 8 refreeze. Steps 5 and 7 complete when the related decisions are approved in the app.</p>
      </Card>
      <Card title="ADKAR · individual adoption by stakeholder group" className="min-w-0">
        <Metrics defs={teamFwMeasures()} />
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[520px] border-separate border-spacing-1">
            <thead><tr className="text-[10.5px] uppercase text-ink-3"><th className="text-left font-semibold">Group</th>{ADKAR.map((a) => <th key={a} className="font-semibold">{a}</th>)}<th className="font-semibold">Barrier</th></tr></thead>
            <tbody>{groups.map((g) => (
              <tr key={g.g}><td className="text-xs text-ink pr-2">{g.g}</td>{g.sc.map((v, i) => <td key={i} className={`text-center rounded-md py-1.5 text-xs font-semibold ${cls(v)}`}>{v}</td>)}<td className="text-xs font-semibold text-crit-text pl-1">{g.barrier}</td></tr>
            ))}</tbody>
          </table>
        </div>
        <p className="text-xs text-ink-3 mt-2">Scores 1–5 from simulated pulse surveys. The barrier point is the first element below 3 — later elements cannot hold until it is fixed. Business users stall at Knowledge (training first); operations at Desire (show what is in it for them); leaders and engineers at Reinforcement (recognise and embed the change).</p>
      </Card>
    </div>
  )
}
export { GlidePill }
