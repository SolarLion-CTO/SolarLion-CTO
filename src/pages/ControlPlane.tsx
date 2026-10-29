// / — CTO Technology Control Plane (home). The CTO's standpoint: what do I control (EA layers), what is moving it
// right now (impact chains, blast radius), where is change in the ADM cycle, and what does the portfolio say statistically.
import { lazy, Suspense, useMemo, useRef, useState } from 'react'
import { MotionConfig, motion } from 'motion/react'
import { Collapse, CountUp, Reveal, Swap } from '../components/motion'
import { Peek, PeekCard, lift } from '../components/Peek'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useStore } from '../store'
import ExecutiveSummary, { Purpose } from './ControlPlaneSummary'
import { CartesianGrid, Line, LineChart, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ReferenceArea, ReferenceLine, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis } from 'recharts'
import { Activity, ArrowRight, ChevronDown, Crosshair, Gavel, IndianRupee, Layers3, MonitorPlay, Radio, Sigma, Target } from 'lucide-react'
import { SIM_NOW, sim, sourceHealth, SOURCES } from '../data/sim'
import type { DomainId, Rag } from '../data/sim'
import { BLAST_COLS, TARGET, admPlacement, briefing, capabilityPeek, recordPeek, blastRadius, chains, debtVsIncidents, eventsFor, layers, scopeIds, timeQuadrant, valueAtRisk } from '../data/sim/controlPlane'
import type { Chain, Layer, Scope } from '../data/sim/controlPlane'
import { decisionsFor, topDecisions } from '../data/sim/decisions'
import { liveImpact } from '../data/sim/events'
import { ragOf } from '../data/sim/scoring'
import { Card } from '../components/ui'
import { Sparkline, StatusPill, ragHex, ragText } from '../components/sim/primitives'
import { ago, useSimClock } from '../components/sim/clock'
import { axisTick, chart, domainColor } from '../theme'
import { domains } from '../data/domains'

const T0 = Date.parse(SIM_NOW)
const rec = (d: DomainId, id: string) => `/domain/${d}/record/${id}`
const cr = (x: number) => `₹${x.toLocaleString('en-IN', { maximumFractionDigits: 1 })} Cr`
const SHORT: Record<DomainId, string> = { banking: 'BNK', manufacturing: 'MFG', retail: 'RTL' }
const toneText = { crit: 'text-crit-text', warn: 'text-warn-text', ok: 'text-success-text', info: 'text-ink-2' } as const
const Present = lazy(() => import('./ControlPlanePresent'))

export default function ControlPlane() {
  const { now } = useSimClock()
  const [sp, setSp] = useSearchParams()
  const { setDomainId } = useStore()
  const bu = sp.get('bu')
  const scope: Scope = bu === 'banking' || bu === 'manufacturing' || bu === 'retail' ? bu : 'all'
  // One scope for the page pills, the header dropdown and Present mode; kept in the address so refresh / links keep it
  const setScope = (x: Scope) => {
    setSp((prev) => { const n = new URLSearchParams(prev); if (x === 'all') n.delete('bu'); else n.set('bu', x); return n }, { replace: true })
    if (x !== 'all') setDomainId(x)
  }
  const [open, setOpen] = useState<string | null>(null)
  const [blast, setBlast] = useState<{ domain: DomainId; id: string } | null>(null)
  const present = sp.get('present') === '1'
  const setPresent = (on: boolean) => setSp((prev) => { const n = new URLSearchParams(prev); if (on) n.set('present', '1'); else n.delete('present'); return n }, { replace: true })
  const jump = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  const drill = (layer: string) => { setOpen(layer); setTimeout(() => jump('layers'), 60) }
  const tick = Math.floor((now - T0) / 5000)   // recompute live parts every 5 s of simulation time
  const events = useMemo(() => eventsFor(scope), [scope])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const L = useMemo(() => layers(scope, events, now), [scope, events, tick])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const C = useMemo(() => chains(scope, events, now), [scope, events, tick])
  const decs = useMemo(() => topDecisions(scopeIds(scope).flatMap((d) => decisionsFor(sim[d])), 99), [scope])
  const live = liveImpact(events, now)
  const v = useMemo(() => valueAtRisk(scope), [scope])
  const score = Math.round(L.reduce((a, l) => a + l.current, 0) / L.length)
  const score3m = Math.round(L.reduce((a, l) => a + l.series[8], 0) / L.length)
  const stats = useMemo(() => { const tq = timeQuadrant(scope); const dv = debtVsIncidents(scope); return { time: (['Invest', 'Tolerate', 'Migrate', 'Eliminate'] as const).map((q) => ({ q, n: tq.filter((p) => p.quadrant === q).length })), r: dv.r, n: dv.n } }, [scope])
  const lines = briefing(scope, L, v, decs[0], C[0], stats.r, stats.n)

  return (
    <MotionConfig reducedMotion="user">
      {present && <Suspense fallback={null}><Present d={{ scope, setScope, now, L, C, score, delta: score - score3m, v, openDecisions: decs.length, critDecisions: decs.filter((x) => x.priority === 'Critical').length, live, ...stats }} onClose={() => setPresent(false)} lines={lines} /></Suspense>}
      {/* Title + scope */}
      <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
        <div className="min-w-0">
          <div className="text-xs font-bold tracking-widest text-brand-600 uppercase">CTO standpoint</div>
          <h1 className="text-2xl sm:text-3xl font-bold text-ink">Technology Control Plane</h1>
          <p className="text-sm text-ink-3 mt-0.5">What I control, what is moving it right now, and what to decide. Enterprise architecture layers × live signals × TOGAF ADM.</p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Scope">
          {(['all', 'banking', 'manufacturing', 'retail'] as Scope[]).map((s) => (
            <button key={s} onClick={() => setScope(s)} aria-pressed={scope === s} className={`text-xs rounded-full border px-3 py-1.5 font-medium ${scope === s ? 'bg-[#0f2747] text-white border-[#0f2747]' : 'bg-white text-ink-2 border-line hover:bg-slate-50'}`}>
              {s === 'all' ? 'All business units' : domains[s].name}
            </button>
          ))}
          <button onClick={() => setPresent(true)} className="ml-1 inline-flex items-center gap-1.5 text-xs rounded-full px-3 py-1.5 font-semibold text-white bg-gradient-to-r from-[#0f2747] to-[#2563eb] shadow-sm hover:shadow-md" title="Full-screen cockpit for presenting"><MonitorPlay size={14} />Present</button>
        </div>
      </div>

      <Hero score={score} delta={score - score3m} L={L} v={v} critDecisions={decs.filter((d) => d.priority === 'Critical').length} openDecisions={decs.length} live={live} />
      <Reveal delay={0.05}><ExecutiveSummary scope={scope} setScope={setScope} L={L} v={v} decs={decs} lines={lines} onDrill={drill} jump={jump} /></Reveal>
      <Reveal delay={0.05}><ImpactStrip chains={C} now={now} onBlast={(c) => { setBlast({ domain: c.domain, id: c.origin.id }); document.getElementById('blast')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }} /></Reveal>
      <Reveal delay={0.1}><LayerGrid L={L} open={open} setOpen={setOpen} now={now} scope={scope} /></Reveal>
      <Reveal><div className="grid grid-cols-1 xl:grid-cols-[1.6fr_1fr] gap-5 mt-5">
        <BlastRadius chains={C} sel={blast} setSel={setBlast} />
        <AdmWheel scope={scope} openDecisions={decs.length} />
      </div></Reveal>
      <Reveal><Swap k={scope}><Statistics scope={scope} v={v} /></Swap></Reveal>
      <Reveal><ToolStrip scope={scope} events={events} now={now} /></Reveal>
      <p className="text-xs text-ink-3 mt-4">Simulated enterprise data; every score, chain and statistic is calculated from linked records (the previous home page is the <Link to="/command-center" className="text-brand-600 hover:underline">Command Center</Link>). ADM phase is derived from initiative progress; TIME quadrant uses technical health vs functional fit.</p>
    </MotionConfig>
  )
}

// ── Hero ──────────────────────────────────────────────────────────────
function Hero({ score, delta, L, v, critDecisions, openDecisions, live }: { score: number; delta: number; L: Layer[]; v: ReturnType<typeof valueAtRisk>; critDecisions: number; openDecisions: number; live: ReturnType<typeof liveImpact> }) {
  const nav = useNavigate()
  const st = ragOf(score)
  const onTarget = L.filter((l) => l.current >= TARGET).length
  const radar = L.map((l) => ({ layer: l.def.label, now: l.current, target: TARGET, baseline: l.baseline }))
  const atRisk = Math.round((v.amber + v.red) * 10) / 10
  const jump = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  const tiles: { icon: typeof Target; label: string; value: React.ReactNode; sub: string; tone?: 'crit' | 'warn'; go: () => void; hint: string }[] = [
    { icon: IndianRupee, label: 'Value at risk', value: <CountUp value={atRisk} decimals={1} format={(x) => cr(x)} />, sub: `${Math.round((atRisk / Math.max(1, v.total)) * 100)}% of ${cr(v.total)} expected`, tone: 'warn', go: () => jump('stats'), hint: 'See the value split' },
    { icon: Layers3, label: 'Layers on target', value: <><CountUp value={onTarget} /> / {L.length}</>, sub: `target ${TARGET} per layer`, tone: onTarget < 3 ? 'warn' : undefined, go: () => jump('layers'), hint: 'Open the layer grid' },
    { icon: Gavel, label: 'Decisions open', value: <CountUp value={openDecisions} />, sub: `${critDecisions} critical`, tone: critDecisions ? 'crit' : undefined, go: () => nav('/decision-center'), hint: 'Open the Decision Center' },
    { icon: Radio, label: 'Live signals since 09:30', value: <CountUp value={live.fresh} />, sub: `${live.crit} critical · score ${live.delta >= 0 ? '+' : ''}${live.delta}`, tone: live.crit ? 'crit' : undefined, go: () => nav('/command-center'), hint: 'See the live event feed' },
  ]
  return (
    <section className="rounded-2xl bg-gradient-to-br from-[#0b1d38] via-[#0f2747] to-[#1d4ed8] text-white p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-[auto_1fr_300px] gap-6 items-center overflow-hidden">
      <div className="flex items-center gap-5">
        <svg viewBox="0 0 120 120" className="w-28 h-28 sm:w-32 sm:h-32 shrink-0" role="img" aria-label={`Control score ${score} of 100`}>
          <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,.15)" strokeWidth="10" />
          <motion.circle cx="60" cy="60" r="50" fill="none" stroke={ragHex[st]} strokeWidth="10" strokeLinecap="round" transform="rotate(-90 60 60)" initial={{ strokeDasharray: '0 314' }} animate={{ strokeDasharray: `${(score / 100) * 314} 314` }} transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }} />
          <circle cx="60" cy="60" r="50" fill="none" stroke="white" strokeWidth="2" strokeDasharray="2 312" strokeDashoffset={-(TARGET / 100) * 314 + 1} transform="rotate(-90 60 60)" />
          <text x="60" y="62" textAnchor="middle" fontSize="30" fontWeight="800" fill="white">{score}</text>
          <text x="60" y="80" textAnchor="middle" fontSize="10" fill="#c7d8f5">of 100 · target {TARGET}</text>
        </svg>
        <div>
          <div className="text-[13px] text-slate-300">Technology control score</div>
          <div className="text-2xl font-bold">{st === 'Green' ? 'In control' : st === 'Amber' ? 'Partly in control' : 'Out of control'}</div>
          <div className={`text-sm mt-1 ${delta >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>{delta >= 0 ? '▲' : '▼'} {Math.abs(delta)} pts in 3 months</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {tiles.map((t, k) => (
          <motion.button key={t.label} onClick={t.go} title={t.hint} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + k * 0.08, duration: 0.4 }} whileHover={{ y: -3 }} className="group text-left rounded-xl bg-white/[0.07] border border-white/15 px-3.5 py-3 min-w-0 transition-colors hover:bg-white/[0.13] hover:border-white/40 focus-visible:outline-2 focus-visible:outline-white">
            <div className="flex items-center gap-1.5 text-[12px] text-slate-300"><t.icon size={13} />{t.label}<ArrowRight size={12} className="ml-auto opacity-0 -translate-x-1 transition group-hover:opacity-100 group-hover:translate-x-0" /></div>
            <div className={`text-xl sm:text-2xl font-bold tabular-nums mt-0.5 ${t.tone === 'crit' ? 'text-red-300' : t.tone === 'warn' ? 'text-amber-300' : ''}`}>{t.value}</div>
            <div className="text-[11px] text-slate-300 truncate group-hover:hidden">{t.sub}</div>
            <div className="text-[11px] text-sky-200 truncate hidden group-hover:block">{t.hint} →</div>
          </motion.button>
        ))}
      </div>
      <div className="h-56 lg:h-60 -my-2" aria-label="Six control layers against target">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radar} outerRadius="72%">
            <PolarGrid stroke="rgba(255,255,255,.18)" />
            <PolarAngleAxis dataKey="layer" tick={{ fill: '#dbe7fb', fontSize: 10.5 }} />
            <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
            <Radar name="Target" dataKey="target" stroke="#86b6ef" strokeDasharray="4 3" fill="none" isAnimationActive={false} />
            <Radar name="Nov 2025" dataKey="baseline" stroke="rgba(255,255,255,.45)" fill="none" isAnimationActive={false} />
            <Radar name="Now" dataKey="now" stroke="#fbbf24" fill="#fbbf24" fillOpacity={0.25} strokeWidth={2} isAnimationActive={false} />
            <Tooltip contentStyle={{ fontSize: 12 }} />
          </RadarChart>
        </ResponsiveContainer>
        <div className="flex justify-center gap-3 text-[10.5px] text-slate-300 -mt-3"><span><span className="inline-block w-3 h-0.5 bg-amber-400 align-middle mr-1" />Now</span><span><span className="inline-block w-3 h-0.5 bg-white/50 align-middle mr-1" />Nov 2025</span><span><span className="inline-block w-3 border-t border-dashed border-[#86b6ef] align-middle mr-1" />Target</span></div>
      </div>
    </section>
  )
}

// ── Real-time impact strip ────────────────────────────────────────────
function ImpactStrip({ chains: cs, now, onBlast }: { chains: Chain[]; now: number; onBlast: (c: Chain) => void }) {
  const top = cs.slice(0, 6)
  const [pick, setPick] = useState<number | null>(null)
  const [held, setHeld] = useState(false)   // auto-rotation pauses while the pointer is on the chain
  if (!top.length) return null
  const auto = Math.floor((now - T0) / 9000) % top.length
  const i = pick ?? auto
  const c = top[i]
  const step = Math.floor(((now - T0) % 9000) / 1500)   // 0..5 sweeps along the chain
  const valPeek = { kind: 'Value at risk', name: cr(c.valueAtRiskCr), health: (c.valueAtRiskCr > 10 ? 'Red' : 'Amber') as Rag, owner: '', why: [c.origin.health === 'Red' ? 'Red signal: full expected value of linked initiatives counted' : 'Amber signal: half of the expected value counted'], facts: c.initiatives.slice(0, 4).map((x) => [x.name.length > 22 ? x.name.slice(0, 21) + '…' : x.name, cr(x.valueCr)] as [string, string]) }
  const decPeek = c.decision ? { kind: `Decision · ${c.decision.priority}`, name: c.decision.title, health: (c.decision.priority === 'Critical' ? 'Red' : 'Amber') as Rag, owner: c.decision.owner, why: [c.decision.whyNow, c.decision.recommendation].filter(Boolean).slice(0, 2), facts: [['Confidence', `${c.decision.confidence}%`], ['Deadline', c.decision.deadline], ['Ask', cr(c.decision.investmentCr)], ['Protects', cr(c.decision.benefitCr)]] as [string, string][] } : null
  const peeks = [recordPeek(c.domain, c.origin.id), recordPeek(c.domain, c.app.id), capabilityPeek(c.domain, c.capability), recordPeek(c.domain, c.initiatives[0].id), valPeek, decPeek]
  const nodes: { k: string; label: string; title: string; sub: string; to: string; health: Rag }[] = [
    { k: 'sig', label: c.origin.kind === 'Service' ? 'Live signal' : 'Lifecycle signal', title: c.origin.name, sub: c.origin.text, to: rec(c.domain, c.origin.id), health: c.origin.health },
    { k: 'app', label: 'Application', title: c.app.name, sub: `${c.app.criticality} · ₹${c.app.annualCostCr} Cr/yr`, to: rec(c.domain, c.app.id), health: c.app.health },
    { k: 'cap', label: 'Capability', title: c.capability, sub: domains[c.domain].name, to: `/domain/${c.domain}/leanix?tab=capabilities`, health: c.app.health },
    { k: 'ini', label: c.initiatives.length > 1 ? `Initiatives (${c.initiatives.length})` : 'Initiative', title: c.initiatives[0].name, sub: c.initiatives.length > 1 ? `+${c.initiatives.length - 1} more` : `${c.initiatives[0].health} delivery`, to: rec(c.domain, c.initiatives[0].id), health: c.initiatives[0].health },
    { k: 'val', label: 'Value at risk', title: cr(c.valueAtRiskCr), sub: 'expected initiative value', to: `/domain/${c.domain}/planview`, health: c.valueAtRiskCr > 10 ? 'Red' : 'Amber' },
    { k: 'dec', label: 'Decision', title: c.decision?.title ?? 'Raise a decision', sub: c.decision ? `${c.decision.priority} · ${c.decision.owner}` : 'no rule fired yet', to: c.decision ? '/decision-center' : `/domain/${c.domain}/decisions`, health: c.decision ? (c.decision.priority === 'Critical' ? 'Red' : 'Amber') : 'Green' },
  ]
  return (
    <Card className="mt-5">
      <div id="chain" className="scroll-mt-20 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2"><span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-60" /><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" /></span>
          <h2 className="font-semibold text-ink">Real-time impact chain</h2>
          {c.live ? <span className="text-[11px] rounded-full bg-crit-bg text-crit-text px-2 py-0.5">LIVE · {ago(now - c.live.at)}</span> : <span className="text-[11px] rounded-full bg-slate-100 text-ink-3 px-2 py-0.5">standing exposure</span>}
          <span className="text-[11px] rounded px-1.5 py-0.5 text-white" style={{ background: domainColor[c.domain] }}>{SHORT[c.domain]}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {top.map((x, k) => <button key={x.id} onClick={() => setPick(k)} aria-label={`Show chain ${k + 1}: ${x.origin.name}`} className={`h-2 rounded-full transition-all ${k === i ? 'w-6 bg-brand-600' : 'w-2 bg-slate-300 hover:bg-slate-400'}`} />)}
          {pick !== null && <button onClick={() => setPick(null)} className="text-[11px] text-brand-600 ml-1 hover:underline">auto</button>}
        </div>
      </div>
      <Purpose>Trace one live signal through the application, capability and initiative to the money at risk and the decision it needs.</Purpose>
      <Swap k={c.id}><ol className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-6 gap-2" onMouseEnter={() => { if (pick === null) { setPick(i); setHeld(true) } }} onMouseLeave={() => { if (held) { setPick(null); setHeld(false) } }}>
        {nodes.map((n, k) => (
          <li key={n.k} className="relative">
            <Peek p={peeks[k]} align={k < 3 ? 'left' : 'right'} className="h-full">
            <Link to={n.to} className={`group block h-full rounded-xl border p-3 bg-white ${lift} ${k <= step ? 'shadow-sm' : 'opacity-60'} hover:opacity-100`} style={{ borderColor: k === step ? ragHex[n.health] : undefined, background: k === step ? '#f8fbff' : undefined }}>
              <div className="flex items-center justify-between text-[10.5px] uppercase tracking-wide text-ink-3"><span>{k + 1} · {n.label}</span><span className="w-2 h-2 rounded-full" style={{ background: ragHex[n.health] }} /></div>
              <div className={`font-semibold mt-1 leading-snug ${k === 4 ? 'text-lg text-crit-text' : 'text-sm text-ink'}`}>{n.title}</div>
              <div className="text-[11.5px] text-ink-3 mt-0.5 line-clamp-2">{n.sub}</div>
              <div className="text-[11px] font-semibold text-brand-600 mt-1 flex items-center gap-1 opacity-0 -translate-x-1 transition group-hover:opacity-100 group-hover:translate-x-0">Open<ArrowRight size={11} /></div>
            </Link>
            </Peek>
            {k < 5 && <ArrowRight size={14} className="hidden xl:block absolute -right-[11px] top-1/2 -translate-y-1/2 text-slate-400 z-10 bg-white rounded-full" aria-hidden />}
          </li>
        ))}
      </ol></Swap>
      <div className="flex flex-wrap items-center justify-between gap-2 mt-3 text-xs text-ink-3">
        <span>{held ? <span className="text-brand-600 font-medium">Paused while you explore · move away to resume</span> : c.live ? <>Latest linked event: <b className="text-ink-2">{c.live.text}</b></> : 'No new event on this chain since 09:30; exposure is structural.'}</span>
        <button onClick={() => onBlast(c)} className="inline-flex items-center gap-1 font-semibold text-brand-600 hover:underline"><Crosshair size={13} />Show blast radius</button>
      </div>
    </Card>
  )
}

// ── Layer control grid with drill-down ────────────────────────────────
function Bullet({ l }: { l: Layer }) {
  return (
    <div className="relative h-3 rounded-full bg-slate-100" role="img" aria-label={`Baseline ${l.baseline}, now ${l.current}, target ${l.target}`}>
      <motion.div className="absolute inset-y-0 left-0 rounded-full" style={{ background: ragHex[l.status] }} initial={{ width: 0 }} animate={{ width: `${l.current}%` }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} />
      <div className="absolute -top-1 -bottom-1 w-0.5 bg-slate-500" style={{ left: `${l.baseline}%` }} title={`Nov 2025: ${l.baseline}`} />
      <div className="absolute -top-1.5 -bottom-1.5 w-1 rounded bg-[#0f2747]" style={{ left: `calc(${l.target}% - 2px)` }} title={`Target ${l.target}`} />
    </div>
  )
}
function LayerGrid({ L, open, setOpen, now, scope }: { L: Layer[]; open: string | null; setOpen: (x: string | null) => void; now: number; scope: Scope }) {
  return (
    <Card className="mt-5">
      <div id="layers" className="scroll-mt-20 flex flex-wrap items-center justify-between gap-2 mb-1">
        <h2 className="font-semibold text-ink">Control layers · current → target</h2>
        <span className="text-xs text-ink-3">Click a layer to drill down · bar = now, grey tick = Nov 2025, navy marker = target {TARGET}</span>
      </div>
      <Purpose>The six layers the CTO controls, from baseline to target, each with its live signal and its next decision.</Purpose>
      <div className="hidden lg:grid grid-cols-1 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1.1fr)_128px_158px_minmax(0,1.3fr)_minmax(0,1.4fr)_18px] gap-3 text-[11px] uppercase tracking-wide text-ink-3 border-b border-line py-2">
        <span>Layer · owner</span><span>Baseline → now → target</span><span>12-month trend</span><span>By unit</span><span>Live signal</span><span>Decision</span><span />
      </div>
      <ul className="divide-y divide-line">
        {L.map((l) => {
          const isOpen = open === l.def.id
          return (
            <li key={l.def.id}>
              <button onClick={() => setOpen(isOpen ? null : l.def.id)} aria-expanded={isOpen} title={isOpen ? 'Close the drill-down' : `Drill into ${l.def.label}`} className={`group relative w-full text-left grid grid-cols-1 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1.1fr)_128px_158px_minmax(0,1.3fr)_minmax(0,1.4fr)_18px] gap-3 py-3 items-center rounded-lg px-1 transition-colors hover:bg-brand-50/60 ${isOpen ? 'bg-brand-50/40' : ''}`}>
                <span className={`absolute left-0 top-2 bottom-2 w-1 rounded-full transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} style={{ background: ragHex[l.status] }} aria-hidden />
                <div className="min-w-0"><div className="flex items-center gap-2 min-w-0"><span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: ragHex[l.status] }} /><span className="font-semibold text-ink truncate group-hover:text-brand-700">{l.def.label}</span></div><div className="text-[11.5px] text-ink-3 truncate group-hover:hidden"><span className="font-medium text-ink-2">{l.def.owner}</span> · {l.def.ea}</div><div className="text-[11.5px] font-semibold text-brand-600 hidden group-hover:flex items-center gap-1">{isOpen ? 'Click to close' : 'Click to drill down'}<ChevronDown size={12} className={isOpen ? 'rotate-180' : ''} /></div></div>
                <div><div className="flex justify-between text-xs mb-1"><span className="text-ink-3">{l.baseline} →</span><b className={ragText[l.status]}>{l.current}</b><span className="text-ink-3">→ {l.target} · gap {l.gap}</span></div><Bullet l={l} /></div>
                <div className="flex items-center gap-2"><Sparkline data={l.series} target={TARGET} width={96} height={28} color={ragHex[l.status]} /><span className={`text-xs tabular-nums ${l.delta3m >= 0 ? 'text-success-text' : 'text-crit-text'}`}>{l.delta3m >= 0 ? '+' : ''}{l.delta3m}</span></div>
                <div className="flex gap-1">{l.byDomain.map((b) => <span key={b.d} title={`${domains[b.d].name}: ${b.score}`} className="text-[10px] font-semibold rounded-md px-1 py-0.5 text-white tabular-nums whitespace-nowrap leading-tight text-center" style={{ background: ragHex[b.status] }}>{scope === 'all' && <span className="block opacity-80 text-[8.5px]">{SHORT[b.d]}</span>}{b.score}</span>)}</div>
                <div className="text-xs min-w-0">{l.signal ? <Peek p={recordPeek(l.signal.domain, l.signal.recordId)} align="right" hint="Drill down to open the evidence"><span className={`${toneText[l.signal.tone]} line-clamp-2 underline decoration-dotted decoration-current/40 underline-offset-2`}>{l.signal.text}</span><span className="text-ink-4">{l.def.id === 'data' ? 'model register' : ago(now - l.signal.at)} · {SHORT[l.signal.domain]}</span></Peek> : <span className="text-ink-4">No signal</span>}</div>
                <div className="text-xs min-w-0">{l.decision ? <><span className="text-ink line-clamp-2 font-medium">{l.decision.title}</span><span className={l.decision.priority === 'Critical' ? 'text-crit-text' : 'text-warn-text'}>{l.decision.priority}</span><span className="text-ink-4"> · {l.decision.owner}</span></> : <span className="text-ink-4">No open decision</span>}</div>
                <ChevronDown size={16} className={`text-ink-3 transition-transform hidden lg:block group-hover:text-brand-600 ${isOpen ? 'rotate-180' : 'group-hover:translate-y-0.5'}`} />
              </button>
              <Collapse open={isOpen}><LayerDrill l={l} /></Collapse>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}
function LayerDrill({ l }: { l: Layer }) {
  const data = l.series.map((v, k) => ({ m: ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'][k], v }))
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr_1.3fr] gap-4 pb-4 pt-1 px-1">
      <div className="space-y-2">
        <div className="text-sm text-ink-2"><b className="text-ink">Question:</b> {l.def.question}</div>
        {l.facts.map((f) => <div key={f.label} className="rounded-lg border border-line px-3 py-2"><div className="text-[11px] text-ink-3">{f.label}</div><div className={`text-lg font-bold tabular-nums ${f.tone ? toneText[f.tone] : 'text-ink'}`}>{f.value}</div></div>)}
        <Link to={`/team/${l.def.ownerId}`} className="group inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline">Open {l.def.owner}'s workspace<ArrowRight size={12} className="transition group-hover:translate-x-0.5" /></Link>
      </div>
      <div className="h-52 min-w-0">
        <div className="text-xs font-semibold text-ink-2 mb-1">Layer score, Nov 2025 → Oct 2026</div>
        <ResponsiveContainer width="100%" height="88%">
          <LineChart data={data} margin={{ top: 6, right: 8, left: -18, bottom: 0 }}>
            <CartesianGrid stroke={chart.grid} vertical={false} />
            <XAxis dataKey="m" tick={axisTick} interval={1} /><YAxis domain={[40, 100]} tick={axisTick} />
            <ReferenceLine y={TARGET} stroke={chart.primaryDark} strokeDasharray="4 3" label={{ value: `Target ${TARGET}`, fontSize: 10, fill: chart.primaryDark, position: 'insideTopRight' }} />
            <Tooltip contentStyle={{ fontSize: 12 }} />
            <Line dataKey="v" name="Score" stroke={ragHex[l.status]} strokeWidth={2.5} dot={{ r: 2 }} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="min-w-0">
        <div className="text-xs font-semibold text-ink-2 mb-1">Worst records · click to drill into the evidence</div>
        <ul className="divide-y divide-line">{l.issues.map((x) => (
          <li key={x.id + x.name}><Peek p={x.to ? capabilityPeek(x.domain, x.name) : recordPeek(x.domain, x.id)} align="right" side="top"><Link to={x.to ?? rec(x.domain, x.id)} className="group flex items-start gap-2 py-1.5 rounded px-1 transition hover:bg-brand-50 hover:pl-2">
            <span className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: ragHex[x.health] }} />
            <span className="min-w-0 flex-1"><span className="text-sm text-ink block truncate">{x.name}</span><span className="text-[11.5px] text-ink-3">{SHORT[x.domain]} · {x.detail}</span></span><ArrowRight size={13} className="text-ink-4 mt-1 shrink-0 transition group-hover:text-brand-600 group-hover:translate-x-0.5" /></Link></Peek></li>
        ))}</ul>
        {l.decision && <Link to="/decision-center" className={`mt-2 block rounded-lg border border-amber-200 bg-warn-bg px-3 py-2 text-xs ${lift}`}><b className="text-warn-text">Decision:</b> <span className="text-ink">{l.decision.title}</span> · confidence {l.decision.confidence}% · ask {cr(l.decision.investmentCr)} vs {cr(l.decision.benefitCr)} protected</Link>}
      </div>
    </div>
  )
}

// ── Blast radius ──────────────────────────────────────────────────────
function BlastRadius({ chains: cs, sel, setSel }: { chains: Chain[]; sel: { domain: DomainId; id: string } | null; setSel: (x: { domain: DomainId; id: string } | null) => void }) {
  const nav = useNavigate()
  const [hover, setHover] = useState<string | null>(null)
  const [tip, setTip] = useState<{ id: string; x: number; y: number; right: boolean; up: boolean } | null>(null)
  const box = useRef<HTMLDivElement>(null)
  const origins = useMemo(() => { const seen = new Set<string>(); return cs.filter((c) => (seen.has(c.origin.id) ? false : (seen.add(c.origin.id), true))) }, [cs])
  const cur = sel && origins.some((o) => o.origin.id === sel.id) ? sel : origins[0] ? { domain: origins[0].domain, id: origins[0].origin.id } : null
  const g = useMemo(() => (cur ? blastRadius(cur.domain, cur.id) : null), [cur?.domain, cur?.id])
  if (!cur || !g) return <Card title="Blast radius"><p className="text-sm text-ink-3">No red or amber signal in this scope.</p></Card>
  const W = 900, colW = 128, gap = (W - colW * 6) / 5
  const byCol = BLAST_COLS.map((_, c) => g.nodes.filter((n) => n.col === c))
  const rows = Math.max(...byCol.map((x) => x.length), 1)
  const H = Math.max(260, rows * 54 + 40)
  const pos = new Map<string, { x: number; y: number }>()
  byCol.forEach((ns, c) => { const top = (H - 30 - ns.length * 54) / 2 + 30; ns.forEach((n, k) => pos.set(n.id, { x: c * (colW + gap), y: top + k * 54 })) })
  const maxW = Math.max(...g.links.map((l) => l.weight), 1)
  const touched = (id: string) => !hover || hover === id || g.links.some((l) => (l.from === hover && l.to === id) || (l.to === hover && l.from === id))
  const go = (id: string) => nav(id.startsWith('CAP:') ? `/domain/${cur.domain}/leanix?tab=capabilities` : rec(cur.domain, id))
  return (
    <Card className="min-w-0">
      <div id="blast" className="scroll-mt-20 flex flex-wrap items-center justify-between gap-2 mb-2">
        <h2 className="font-semibold text-ink flex items-center gap-2"><Crosshair size={16} className="text-crit-text" />Blast radius</h2>
        <select value={`${cur.domain}|${cur.id}`} onChange={(e) => { const [d, id] = e.target.value.split('|'); setSel({ domain: d as DomainId, id }) }} className="text-sm border border-slate-300 rounded-lg px-2 py-1 max-w-full" aria-label="Choose the signal">
          {origins.map((o) => <option key={o.origin.id} value={`${o.domain}|${o.origin.id}`}>{SHORT[o.domain]} · {o.origin.name} ({o.origin.kind === 'Service' ? 'service' : 'EOL tech'})</option>)}
        </select>
      </div>
      <Purpose>Show everything one signal touches across applications, capabilities, initiatives, objectives and risks.</Purpose>
      <p className="text-sm text-ink-2 mb-2">One signal touches <b>{g.counts[1]}</b> app(s), <b>{g.counts[2]}</b> capabilities and processes, <b>{g.counts[3]}</b> initiative(s) worth <b className="text-crit-text">{cr(g.valueCr)}</b>, <b>{g.counts[4]}</b> objective(s) and <b>{g.counts[5]}</b> risk(s) or control(s). Hover to trace, click to open the record.</p>
      <div ref={box} className="relative">
      <div className="overflow-x-auto -mx-1 px-1">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[600px] xl:min-w-0" style={{ maxHeight: H }} role="img" aria-label="Blast radius graph">
          {BLAST_COLS.map((t, c) => <text key={t} x={c * (colW + gap) + colW / 2} y={14} textAnchor="middle" fontSize={11} fill="#64748b" fontWeight={600}>{t}</text>)}
          {g.links.map((l) => { const a = pos.get(l.from), b = pos.get(l.to); if (!a || !b) return null
            const x1 = a.x + colW, y1 = a.y + 20, x2 = b.x, y2 = b.y + 20, on = touched(l.from) && touched(l.to)
            return <path key={l.from + l.to} d={`M${x1},${y1} C${(x1 + x2) / 2},${y1} ${(x1 + x2) / 2},${y2} ${x2},${y2}`} fill="none" stroke={on ? '#2563eb' : '#cbd5e1'} strokeOpacity={on ? 0.5 : 0.25} strokeWidth={1.5 + (l.weight / maxW) * 9} /> })}
          {g.nodes.map((n) => { const p = pos.get(n.id)!; const on = touched(n.id)
            return (
              <g key={n.id} transform={`translate(${p.x},${p.y})`} opacity={on ? 1 : 0.3} style={{ cursor: 'pointer', transition: 'opacity .2s' }}
                onMouseEnter={(e) => { setHover(n.id); const b = box.current?.getBoundingClientRect(), r = (e.currentTarget as SVGGElement).getBoundingClientRect(); if (b) setTip({ id: n.id, x: n.col >= 3 ? b.right - r.right : r.left - b.left, y: n.col >= 0 && r.top - b.top > b.height / 2 ? b.bottom - r.top + 6 : r.bottom - b.top + 6, right: n.col >= 3, up: r.top - b.top > b.height / 2 }) }}
                onMouseLeave={() => { setHover(null); setTip(null) }} onClick={() => go(n.id)}>
                <rect width={colW} height={40} rx={8} fill={hover === n.id ? '#eff6ff' : 'white'} stroke={hover === n.id ? '#2563eb' : ragHex[n.health]} strokeWidth={hover === n.id ? 2.5 : n.col === 0 ? 3 : 1.5} />
                <rect width={5} height={40} rx={2} fill={ragHex[n.health]} />
                <text x={11} y={17} fontSize={11} fontWeight={600} fill="#0f172a">{n.name.length > 19 ? n.name.slice(0, 18) + '…' : n.name}</text>
                <text x={11} y={31} fontSize={9.5} fill="#64748b">{n.sub.length > 24 ? n.sub.slice(0, 23) + '…' : n.sub}</text>
              </g>
            ) })}
        </svg>
      </div>
      {tip && (() => { const n = g.nodes.find((x) => x.id === tip.id); const pk = n && (n.id.startsWith('CAP:') ? capabilityPeek(cur.domain, n.name) : recordPeek(cur.domain, n.id))
        return pk ? <div role="tooltip" className="pointer-events-none absolute z-50 hidden [@media(hover:hover)]:block" style={{ [tip.right ? 'right' : 'left']: Math.max(0, tip.x), [tip.up ? 'bottom' : 'top']: tip.y }}><div className="peek-pop"><PeekCard p={pk} /></div></div> : null })()}
      </div>
    </Card>
  )
}

// ── TOGAF ADM wheel ───────────────────────────────────────────────────
function AdmWheel({ scope, openDecisions }: { scope: Scope; openDecisions: number }) {
  const phases = useMemo(() => admPlacement(scope), [scope])
  const [sel, setSel] = useState<string>('G')
  const [hp, setHp] = useState<string | null>(null)   // hovered phase previews in the panel; click pins
  const ring = phases.filter((p) => p.id !== 'P')
  const prelim = phases.find((p) => p.id === 'P')!
  const max = Math.max(...phases.map((p) => p.initiatives.length), 1)
  const cx = 160, cy = 175, R = 118, r = 62
  const seg = (k: number) => { const a0 = (k / 8) * 2 * Math.PI - Math.PI / 2 - Math.PI / 8 + 0.02, a1 = ((k + 1) / 8) * 2 * Math.PI - Math.PI / 2 - Math.PI / 8 - 0.02
    const P = (rad: number, a: number) => `${cx + rad * Math.cos(a)},${cy + rad * Math.sin(a)}`
    return { d: `M${P(R, a0)} A${R},${R} 0 0 1 ${P(R, a1)} L${P(r, a1)} A${r},${r} 0 0 0 ${P(r, a0)} Z`, mid: (a0 + a1) / 2 } }
  const fill = (n: number) => `rgba(37,99,235,${0.12 + (n / max) * 0.7})`
  const cur = phases.find((p) => p.id === (hp ?? sel))!
  return (
    <Card className="min-w-0">
      <div id="adm" className="scroll-mt-20 flex items-center justify-between gap-2"><h2 className="font-semibold text-ink">TOGAF ADM · where change sits</h2><span className="text-[11px] text-ink-3">{phases.reduce((a, p) => a + p.initiatives.length, 0)} initiatives</span></div>
      <Purpose>See which phase of architecture change each initiative is in, and where delivery is stuck.</Purpose>
      <svg viewBox="0 0 320 320" className="w-full max-w-[360px] mx-auto block" role="img" aria-label="ADM cycle with initiative counts per phase">
        <g onClick={() => setSel('P')} onMouseEnter={() => setHp('P')} onMouseLeave={() => setHp(null)} style={{ cursor: 'pointer' }}><rect x={cx - 52} y={6} width={104} height={30} rx={15} fill={sel === 'P' ? '#0f2747' : fill(prelim.initiatives.length)} stroke={hp === 'P' ? '#0f2747' : '#93c5fd'} strokeWidth={hp === 'P' ? 2 : 1} /><text x={cx} y={25} textAnchor="middle" fontSize={11} fontWeight={600} fill={sel === 'P' ? 'white' : '#0f2747'}>Preliminary · {prelim.initiatives.length}</text></g>
        {ring.map((p, k) => { const s = seg(k); const lx = cx + ((R + r) / 2) * Math.cos(s.mid), ly = cy + ((R + r) / 2) * Math.sin(s.mid)
          return (
            <g key={p.id} onClick={() => setSel(p.id)} onMouseEnter={() => setHp(p.id)} onMouseLeave={() => setHp(null)} style={{ cursor: 'pointer', transformOrigin: `${cx}px ${cy}px`, transform: hp === p.id ? 'scale(1.04)' : undefined, transition: 'transform .18s ease-out' }}>
              <path d={s.d} fill={sel === p.id ? '#0f2747' : hp === p.id ? '#2563eb' : fill(p.initiatives.length)} stroke="white" strokeWidth={2} />
              <text x={lx} y={ly - 3} textAnchor="middle" fontSize={15} fontWeight={800} fill={sel === p.id || hp === p.id || p.initiatives.length / max > 0.5 ? 'white' : '#0f2747'}>{p.id}</text>
              <text x={lx} y={ly + 11} textAnchor="middle" fontSize={10} fill={sel === p.id || hp === p.id || p.initiatives.length / max > 0.5 ? 'white' : '#334155'}>{p.initiatives.length}{p.red ? ` · ${p.red}●` : ''}</text>
              <title>{`${p.label}: ${p.initiatives.length} initiatives, ₹${p.budgetCr} Cr budget, ${p.red} red`}</title>
            </g>
          ) })}
        <circle cx={cx} cy={cy} r={r - 6} fill="#f1f5fb" stroke="#dbe3ee" />
        <text x={cx} y={cy - 8} textAnchor="middle" fontSize={10} fill="#64748b">Requirements</text>
        <text x={cx} y={cy + 6} textAnchor="middle" fontSize={10} fill="#64748b">management</text>
        <text x={cx} y={cy + 24} textAnchor="middle" fontSize={15} fontWeight={800} fill="#0f2747">{openDecisions}</text>
        <text x={cx} y={cy + 36} textAnchor="middle" fontSize={9} fill="#64748b">open decisions</text>
      </svg>
      <div className={`mt-1 rounded-lg border p-3 transition-colors ${hp && hp !== sel ? 'border-brand-600 bg-brand-50/40' : 'border-line'}`}>
        <div className="flex justify-between text-sm"><b className="text-ink">{cur.label}</b><span className="text-ink-3">{cur.initiatives.length} · {cr(cur.budgetCr)}</span></div>
        <div className="text-[10.5px] text-ink-3 mb-1">{hp && hp !== sel ? 'Preview · click the phase to pin it' : 'Pinned · hover another phase to preview'}</div>
        <ul className="mt-1 space-y-0.5">{cur.initiatives.map((i) => (
          <li key={i.id}><Peek p={recordPeek(i.domain, i.id)} side="top"><Link to={rec(i.domain, i.id)} className="group flex items-center gap-2 text-xs rounded px-1 py-0.5 transition hover:bg-brand-50"><span className="w-2 h-2 rounded-full shrink-0" style={{ background: ragHex[i.health] }} /><span className="truncate text-ink-2 group-hover:text-brand-700">{i.name}</span><span className="ml-auto text-ink-3 shrink-0">{i.progress}%</span><ArrowRight size={11} className="shrink-0 text-brand-600 opacity-0 transition group-hover:opacity-100" /></Link></Peek></li>
        ))}{!cur.initiatives.length && <li className="text-xs text-ink-3">No initiatives in this phase.</li>}</ul>
      </div>
      <p className="text-[11px] text-ink-3 mt-2">Phase is derived from initiative progress (A–F design and planning, G delivery under governance, H change). ● = red delivery health.</p>
    </Card>
  )
}

// ── Statistics ────────────────────────────────────────────────────────
const QCOL: Record<string, string> = { Invest: '#15803d', Tolerate: '#2563eb', Migrate: '#d97706', Eliminate: '#dc2626' }
function Statistics({ scope, v }: { scope: Scope; v: ReturnType<typeof valueAtRisk> }) {
  const nav = useNavigate()
  const openPt = (p: unknown) => { const q = (p as { payload?: { id?: string; domain?: DomainId } }).payload; if (q?.id && q.domain) nav(rec(q.domain, q.id)) }
  const tq = useMemo(() => timeQuadrant(scope), [scope])
  const dv = useMemo(() => debtVsIncidents(scope), [scope])
  const counts = (['Invest', 'Tolerate', 'Migrate', 'Eliminate'] as const).map((q) => ({ q, n: tq.filter((p) => p.quadrant === q).length, cost: tq.filter((p) => p.quadrant === q).reduce((a, p) => a + p.cost, 0) }))
  const strength = Math.abs(dv.r) >= 0.5 ? 'strong' : Math.abs(dv.r) >= 0.3 ? 'moderate' : 'weak'
  const xs = dv.pts.map((p) => p.x); const x0 = Math.min(...xs), x1 = Math.max(...xs)
  const fitLine = [{ x: x0, y: Math.max(0, dv.fit.intercept + dv.fit.slope * x0) }, { x: x1, y: Math.max(0, dv.fit.intercept + dv.fit.slope * x1) }]
  const tot = v.total || 1
  const segs = [{ k: 'On track', val: v.green, c: '#15803d' }, { k: 'At risk (amber)', val: v.amber, c: '#d97706' }, { k: 'Off track (red)', val: v.red, c: '#dc2626' }]
  type TipProps = { active?: boolean; payload?: { payload?: { id?: string; domain?: DomainId; quadrant?: string; incidents?: number } }[] }
  const tipFor = (extra: (q: NonNullable<NonNullable<TipProps['payload']>[number]['payload']>) => [string, string]) => (props: TipProps) => {
    const q = props.active ? props.payload?.[0]?.payload : undefined
    const pk = q?.id && q.domain ? recordPeek(q.domain, q.id) : null
    return pk ? <PeekCard p={{ ...pk, facts: [extra(q!), ...pk.facts].slice(0, 4) }} /> : null
  }
  const timeTip = tipFor((q) => ['TIME quadrant', q.quadrant ?? ''])
  const debtTip = tipFor((q) => ['Incidents, 30 d', `${q.incidents ?? 0}`])
  return (
    <div id="stats" className="scroll-mt-20 grid grid-cols-1 xl:grid-cols-3 gap-5 mt-5">
      <Card className="min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1"><h2 className="font-semibold text-ink">Application portfolio · TIME model</h2><span className="text-[11px] text-ink-3">{tq.length} apps · bubble = run cost</span></div>
        <Purpose>Decide which applications to invest in, tolerate, migrate or eliminate.</Purpose>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 8, right: 8, bottom: 14, left: -14 }}>
              <ReferenceArea x1={60} x2={100} y1={60} y2={100} fill="#15803d" fillOpacity={0.05} /><ReferenceArea x1={0} x2={60} y1={0} y2={60} fill="#dc2626" fillOpacity={0.05} />
              <CartesianGrid stroke={chart.grid} />
              <XAxis type="number" dataKey="x" domain={[0, 100]} tick={axisTick} label={{ value: 'Technical health →', position: 'insideBottom', offset: -8, fontSize: 11, fill: '#64748b' }} />
              <YAxis type="number" dataKey="y" domain={[0, 100]} tick={axisTick} label={{ value: 'Functional fit →', angle: -90, position: 'insideLeft', offset: 22, fontSize: 11, fill: '#64748b' }} />
              <ZAxis type="number" dataKey="cost" range={[40, 420]} />
              <ReferenceLine x={60} stroke="#94a3b8" strokeDasharray="4 3" /><ReferenceLine y={60} stroke="#94a3b8" strokeDasharray="4 3" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} content={timeTip as never} wrapperStyle={{ zIndex: 50, outline: 'none' }} />
              {counts.map(({ q }) => <Scatter key={q} name={q} data={tq.filter((p) => p.quadrant === q)} fill={QCOL[q]} fillOpacity={0.7} isAnimationActive={false} onClick={openPt} style={{ cursor: 'pointer' }} />)}
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-4 gap-1.5 text-center mt-1">{counts.map((c) => <div key={c.q} className="rounded-md py-1" style={{ background: `${QCOL[c.q]}14` }}><div className="text-[11px] font-semibold" style={{ color: QCOL[c.q] }}>{c.q}</div><div className="text-sm font-bold text-ink tabular-nums">{c.n}</div><div className="text-[10px] text-ink-3">{cr(Math.round(c.cost * 10) / 10)}/yr</div></div>)}</div>
      </Card>

      <Card className="min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1"><h2 className="font-semibold text-ink flex items-center gap-1.5"><Sigma size={15} />Does technical debt cause incidents?</h2><span className="text-[11px] text-ink-3">n = {dv.n}</span></div>
        <Purpose>Test, with statistics, whether weaker technical health goes with more incidents.</Purpose>
        <div className="flex items-baseline gap-3 mb-1"><span className={`text-3xl font-bold tabular-nums whitespace-nowrap ${dv.r < -0.3 ? 'text-crit-text' : 'text-ink'}`}>r = {dv.r.toFixed(2)}</span><span className="text-xs text-ink-3">Pearson correlation, technical health vs incidents (30 days)</span></div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 6, right: 8, bottom: 14, left: -18 }}>
              <CartesianGrid stroke={chart.grid} />
              <XAxis type="number" dataKey="x" domain={['dataMin - 5', 'dataMax + 5']} tick={axisTick} label={{ value: 'Technical health →', position: 'insideBottom', offset: -8, fontSize: 11, fill: '#64748b' }} />
              <YAxis type="number" dataKey="y" tick={axisTick} allowDecimals={false} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} content={debtTip as never} wrapperStyle={{ zIndex: 50, outline: 'none' }} />
              <Scatter data={dv.pts.map((p) => ({ x: p.x, y: p.incidents, id: p.id, domain: p.domain, name: p.name, incidents: p.incidents }))} fill={chart.primary} fillOpacity={0.65} isAnimationActive={false} onClick={openPt} style={{ cursor: 'pointer' }} />
              <Scatter data={fitLine} line={{ stroke: '#dc2626', strokeWidth: 2 }} shape={() => <g />} isAnimationActive={false} legendType="none" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-ink-2 mt-1"><b>{strength[0].toUpperCase() + strength.slice(1)} {dv.r < 0 ? 'negative' : 'positive'} relationship:</b> {dv.r < 0 ? `every 10 points of lost technical health adds about ${Math.abs(dv.fit.slope * 10).toFixed(1)} incidents a month per app.` : 'technical health does not explain incidents in this scope.'} Regression line in red. Correlation, not proof of cause.</p>
      </Card>

      <Card className="min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1"><h2 className="font-semibold text-ink">Value at risk · initiative portfolio</h2><span className="text-[11px] text-ink-3">expected value</span></div>
        <Purpose>Show how much expected initiative value is safe, at risk or off track.</Purpose>
        <div className="text-3xl font-bold text-ink tabular-nums">{cr(v.total)}</div>
        <div className="text-xs text-ink-3 mb-3">expected from {scopeIds(scope).reduce((a, d) => a + sim[d].initiatives.length, 0)} initiatives · {cr(v.realised)} realised so far</div>
        <div className="flex h-8 rounded-lg overflow-hidden gap-0.5" role="img" aria-label="Expected value by delivery health">{segs.map((s) => <div key={s.k} style={{ width: `${(s.val / tot) * 100}%`, background: s.c }} title={`${s.k}: ${cr(s.val)}`} />)}</div>
        <ul className="mt-3 space-y-2">{segs.map((s) => (
          <li key={s.k} className="flex items-center gap-2 text-sm"><span className="w-3 h-3 rounded-sm shrink-0" style={{ background: s.c }} /><span className="text-ink-2">{s.k}</span><span className="ml-auto font-semibold tabular-nums text-ink">{cr(s.val)}</span><span className="w-12 text-right text-xs text-ink-3 tabular-nums">{Math.round((s.val / tot) * 100)}%</span></li>
        ))}</ul>
        <div className="mt-3 rounded-lg bg-slate-50 border border-line px-3 py-2 text-xs text-ink-2">Realisation so far: <b>{Math.round((v.realised / tot) * 100)}%</b> of expected value. Open the <Link to="/decision-center" className="text-brand-600 font-semibold hover:underline">Decision Center</Link> to protect the at-risk share.</div>
      </Card>
    </div>
  )
}

// ── Tools feeding the plane ───────────────────────────────────────────
function ToolStrip({ scope, events, now }: { scope: Scope; events: ReturnType<typeof eventsFor>; now: number }) {
  const ids = scopeIds(scope)
  const hs = ids.map((d) => sourceHealth(sim[d]))
  return (
    <Card className="mt-5">
      <div id="tools" className="scroll-mt-20 flex flex-wrap items-center justify-between gap-2"><h2 className="font-semibold text-ink flex items-center gap-2"><Activity size={16} />Tools feeding the control plane</h2><Link to="/sources" className="text-xs font-semibold text-brand-600 hover:underline">All data sources →</Link></div>
      <Purpose>Show which source systems feed the plane, how healthy they are and how fresh their data is.</Purpose>
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-2">
        {SOURCES.map((s, k) => {
          const score = Math.round(hs.reduce((a, h) => a + h[k].score, 0) / hs.length)
          const last = events.filter((e) => e.source === s.id && e.at <= now).reduce((m, e) => Math.max(m, e.at), 0)
          return (
            <Peek key={s.id} align={k >= 4 ? 'right' : 'left'} side="top" p={{ kind: 'Source system', name: `${s.label} · ${s.capability}`, health: ragOf(score), owner: '', why: [s.question], facts: [['Health', `${score} / 100`], ['Last update', last ? ago(now - last) : 'none'], ['Opens', domains[ids[0]].name], ['Records', `${hs.reduce((a, h) => a + h[k].records, 0)}`]] }}>
            <Link to={`/domain/${ids[0]}/${s.slug}`} className={`block h-full rounded-lg border border-line p-2.5 min-w-0 bg-white ${lift}`}>
              <div className="text-[12px] font-semibold text-ink truncate">{s.label}</div>
              <div className="text-[10.5px] text-ink-3 truncate">{s.capability}</div>
              <div className="flex items-center justify-between mt-1"><span className={`text-sm font-bold ${ragText[ragOf(score)]}`}>{score}</span><span className="text-[10px] text-ink-4">{last ? ago(now - last) : '—'}</span></div>
            </Link>
            </Peek>
          )
        })}
        <Link to="/sources" className={`rounded-lg border border-green-200 bg-success-bg p-2.5 min-w-0 ${lift}`}>
          <div className="text-[12px] font-bold text-success-text">REAL DATA</div>
          <div className="text-[10.5px] text-success-text">6 public datasets</div>
          <div className="text-[10px] text-ink-3 mt-1">reality checks</div>
        </Link>
      </div>
      <div className="mt-2"><StatusPill status={ragOf(Math.round(hs.flat().reduce((a, h) => a + h.score, 0) / hs.flat().length))} label="Source health (average)" /></div>
    </Card>
  )
}
