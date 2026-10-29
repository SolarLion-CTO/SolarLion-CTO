// Present mode for the Technology Control Plane: a zero-scroll, dark, full-screen cockpit for a CXO audience.
// Same calculated data as the page. Keys: Esc close · ←/→ impact chain · 1–4 business unit scope.
import { useEffect, useState } from 'react'
import { Area, AreaChart, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ReferenceLine, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { ArrowRight, Gauge, Gavel, IndianRupee, Layers3, Maximize2, Radio, X } from 'lucide-react'
import { motion } from 'motion/react'
import { SIM_NOW } from '../data/sim'
import type { DomainId, Rag } from '../data/sim'
import { TARGET } from '../data/sim/controlPlane'
import type { Chain, Layer, Scope } from '../data/sim/controlPlane'
import { ragOf } from '../data/sim/scoring'
import { CountUp, Swap } from '../components/motion'
import { hhmm, ago } from '../components/sim/clock'
import { domains } from '../data/domains'

const T0 = Date.parse(SIM_NOW)
const HEX: Record<Rag, string> = { Green: '#34d399', Amber: '#fbbf24', Red: '#f87171' }
const SHORT: Record<DomainId, string> = { banking: 'BNK', manufacturing: 'MFG', retail: 'RTL' }
const SCOPES: Scope[] = ['all', 'banking', 'manufacturing', 'retail']
const cr = (x: number) => `₹${x.toLocaleString('en-IN', { maximumFractionDigits: 1 })} Cr`

export interface PresentData {
  scope: Scope; setScope: (s: Scope) => void; now: number; L: Layer[]; C: Chain[]; score: number; delta: number
  v: { green: number; amber: number; red: number; total: number; realised: number }; openDecisions: number; critDecisions: number
  live: { fresh: number; crit: number; delta: number }; time: { q: string; n: number }[]; r: number; n: number
}

export default function ControlPlanePresent({ d, onClose, lines = [] }: { d: PresentData; onClose: () => void; lines?: string[] }) {
  const top = d.C.slice(0, 6)
  const [pick, setPick] = useState<number | null>(null)
  const auto = top.length ? Math.floor((d.now - T0) / 9000) % top.length : 0
  const i = pick ?? auto
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight' && top.length) setPick((p) => ((p ?? auto) + 1) % top.length)
      else if (e.key === 'ArrowLeft' && top.length) setPick((p) => ((p ?? auto) - 1 + top.length) % top.length)
      else if (['1', '2', '3', '4'].includes(e.key)) { d.setScope(SCOPES[Number(e.key) - 1]); setPick(null) }
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [onClose, top.length, auto, d])
  const st = ragOf(d.score)
  const atRisk = Math.round((d.v.amber + d.v.red) * 10) / 10
  const radar = d.L.map((l) => ({ layer: l.def.label, now: l.current, target: TARGET, baseline: l.baseline }))
  const c = top[i]
  const trend = d.L[0].series.map((_, k) => ({ m: ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'][k], v: Math.round(d.L.reduce((a, l) => a + l.series[k], 0) / d.L.length) }))
  const fs = () => { const el = document.documentElement; if (!document.fullscreenElement) void el.requestFullscreen?.().catch(() => {}); else void document.exitFullscreen?.() }

  return (
    <motion.div role="dialog" aria-modal="true" aria-label="Technology Control Plane, present mode" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[60] text-slate-100 overflow-auto lg:overflow-hidden" style={{ background: 'radial-gradient(1200px 600px at 15% 0%, #13305c 0%, #071226 55%, #030a17 100%)' }}>
      <div className="min-h-full lg:h-full flex flex-col gap-3 p-4 lg:p-5">
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-xl font-extrabold tracking-tight">CTO<span className="text-[#86b6ef]">360</span></span>
            <span className="hidden sm:inline text-slate-400">|</span>
            <span className="font-semibold truncate">Technology Control Plane</span>
            <span className="hidden md:inline-flex items-center gap-1.5 text-xs text-emerald-300"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />Simulation live {hhmm(d.now)}</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {SCOPES.map((s, k) => (
              <button key={s} onClick={() => { d.setScope(s); setPick(null) }} aria-pressed={d.scope === s} className={`text-xs rounded-full px-3 py-1.5 border ${d.scope === s ? 'bg-white text-[#0f2747] border-white font-semibold' : 'border-white/20 text-slate-300 hover:bg-white/10'}`}>
                <span className="hidden sm:inline text-[10px] opacity-60 mr-1">{k + 1}</span>{s === 'all' ? 'All units' : domains[s].name}
              </button>
            ))}
            <button onClick={fs} className="p-2 rounded-lg hover:bg-white/10 text-slate-300" aria-label="Toggle full screen" title="Full screen"><Maximize2 size={16} /></button>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 text-slate-300" aria-label="Close present mode (Esc)" title="Close (Esc)"><X size={18} /></button>
          </div>
        </header>

        {/* Main: score + KPIs · radar · layers */}
        <section className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_1.15fr] gap-3 lg:flex-1 lg:min-h-0">
          <div className="rounded-2xl bg-white/[0.05] border border-white/10 p-4 flex flex-col gap-3 min-h-0">
            <div className="flex items-center gap-4">
              <svg viewBox="0 0 120 120" className="w-[clamp(96px,13vh,150px)] h-[clamp(96px,13vh,150px)] shrink-0" role="img" aria-label={`Control score ${d.score}`}>
                <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="10" />
                <motion.circle cx="60" cy="60" r="50" fill="none" stroke={HEX[st]} strokeWidth="10" strokeLinecap="round" transform="rotate(-90 60 60)"
                  initial={{ strokeDasharray: '0 314' }} animate={{ strokeDasharray: `${(d.score / 100) * 314} 314` }} transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }} />
                <text x="60" y="64" textAnchor="middle" fontSize="32" fontWeight="800" fill="white">{d.score}</text>
                <text x="60" y="82" textAnchor="middle" fontSize="10" fill="#94a3b8">target {TARGET}</text>
              </svg>
              <div className="min-w-0">
                <div className="text-xs uppercase tracking-widest text-slate-400 flex items-center gap-1.5"><Gauge size={13} />Control score</div>
                <div className="text-[clamp(18px,2.6vh,28px)] font-bold leading-tight">{st === 'Green' ? 'In control' : st === 'Amber' ? 'Partly in control' : 'Out of control'}</div>
                <div className={`text-sm ${d.delta >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>{d.delta >= 0 ? '▲' : '▼'} {Math.abs(d.delta)} pts in 3 months</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: IndianRupee, label: 'Value at risk', node: <CountUp value={atRisk} decimals={1} format={(x) => cr(x)} />, sub: `of ${cr(d.v.total)} expected`, tone: 'text-amber-300' },
                { icon: Layers3, label: 'Layers on target', node: <><CountUp value={d.L.filter((l) => l.current >= TARGET).length} /> / {d.L.length}</>, sub: `target ${TARGET}`, tone: '' },
                { icon: Gavel, label: 'Open decisions', node: <CountUp value={d.openDecisions} />, sub: `${d.critDecisions} critical`, tone: d.critDecisions ? 'text-red-300' : '' },
                { icon: Radio, label: 'Live signals', node: <CountUp value={d.live.fresh} />, sub: `${d.live.crit} critical since 09:30`, tone: d.live.crit ? 'text-red-300' : '' },
              ].map((t) => (
                <div key={t.label} className="rounded-xl bg-white/[0.04] border border-white/10 px-3 py-2 flex flex-col justify-center min-w-0">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1"><t.icon size={12} />{t.label}</div>
                  <div className={`text-[clamp(18px,3.2vh,40px)] font-bold leading-tight ${t.tone}`}>{t.node}</div>
                  <div className="text-[11px] text-slate-400 truncate">{t.sub}</div>
                </div>
              ))}
            </div>
            <div className="hidden [@media(min-height:860px)]:flex flex-col flex-1 min-h-0">
              <div className="text-[11px] text-slate-400 mb-1">Control score, Nov 2025 → Oct 2026</div>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trend} margin={{ top: 4, right: 4, left: -26, bottom: 0 }}>
                    <defs><linearGradient id="cpTrend" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#60a5fa" stopOpacity={0.45} /><stop offset="95%" stopColor="#60a5fa" stopOpacity={0} /></linearGradient></defs>
                    <XAxis dataKey="m" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} interval={1} />
                    <YAxis domain={[40, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <ReferenceLine y={TARGET} stroke="#ffffff" strokeOpacity={0.5} strokeDasharray="4 4" />
                    <Area dataKey="v" stroke="#60a5fa" strokeWidth={2.5} fill="url(#cpTrend)" isAnimationActive={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white/[0.05] border border-white/10 p-3 flex flex-col min-h-[280px] lg:min-h-0">
            <div className="text-xs uppercase tracking-widest text-slate-400 px-1">Six control layers · now vs Nov 2025 vs target</div>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radar} outerRadius="68%" margin={{ top: 6, right: 34, bottom: 6, left: 34 }}>
                  <PolarGrid stroke="rgba(255,255,255,.14)" />
                  <PolarAngleAxis dataKey="layer" tick={{ fill: '#cbd5e1', fontSize: 12 }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar dataKey="target" stroke="#60a5fa" strokeDasharray="5 4" fill="none" isAnimationActive={false} />
                  <Radar dataKey="baseline" stroke="rgba(255,255,255,.4)" fill="none" isAnimationActive={false} />
                  <Radar dataKey="now" stroke="#fbbf24" strokeWidth={2.5} fill="#fbbf24" fillOpacity={0.22} isAnimationActive={false} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 text-[11px] text-slate-400"><span><span className="inline-block w-3 h-0.5 bg-amber-400 align-middle mr-1" />Now</span><span><span className="inline-block w-3 h-0.5 bg-white/50 align-middle mr-1" />Nov 2025</span><span><span className="inline-block w-3 border-t border-dashed border-blue-400 align-middle mr-1" />Target {TARGET}</span></div>
          </div>

          <div className="rounded-2xl bg-white/[0.05] border border-white/10 p-4 flex flex-col min-h-0">
            <div className="text-xs uppercase tracking-widest text-slate-400 mb-2">Baseline → now → target</div>
            <ul className="flex-1 flex flex-col justify-between gap-2 min-h-0">
              {d.L.map((l, k) => (
                <li key={l.def.id} className="min-w-0">
                  <div className="flex items-baseline justify-between gap-2 text-[clamp(13px,1.7vh,19px)]"><span className="font-semibold truncate">{l.def.label} <span className="text-[11px] font-normal text-slate-400">· {l.def.owner}</span></span><span className="tabular-nums font-bold" style={{ color: HEX[l.status] }}>{l.current}<span className="text-[11px] font-normal text-slate-400"> / {TARGET}</span></span></div>
                  <div className="relative h-[clamp(8px,1.3vh,14px)] rounded-full bg-white/10 mt-1">
                    <motion.div className="absolute inset-y-0 left-0 rounded-full" style={{ background: HEX[l.status] }} initial={{ width: 0 }} animate={{ width: `${l.current}%` }} transition={{ duration: 0.9, delay: 0.08 * k, ease: [0.16, 1, 0.3, 1] }} />
                    <div className="absolute -top-1 -bottom-1 w-0.5 bg-slate-300/70" style={{ left: `${l.baseline}%` }} />
                    <div className="absolute -top-1.5 -bottom-1.5 w-1 rounded bg-white" style={{ left: `calc(${TARGET}% - 2px)` }} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Bottom: impact chain · statistics */}
        <section className="grid grid-cols-1 lg:grid-cols-[2.1fr_1fr] gap-3">
          <div className="rounded-2xl bg-white/[0.05] border border-white/10 p-4 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-slate-400"><span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />Real-time impact chain{c?.live && <span className="normal-case tracking-normal text-[11px] rounded-full bg-red-500/20 text-red-300 px-2">LIVE · {ago(d.now - c.live.at)}</span>}{c && <span className="normal-case tracking-normal text-[11px] rounded bg-white/10 px-1.5">{SHORT[c.domain]}</span>}</div>
              <div className="flex gap-1.5">{top.map((x, k) => <button key={x.id} onClick={() => setPick(k)} aria-label={`Chain ${k + 1}`} className={`h-1.5 rounded-full transition-all ${k === i ? 'w-6 bg-white' : 'w-1.5 bg-white/30'}`} />)}</div>
            </div>
            {c ? (
              <Swap k={c.id} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {[
                  ['Signal', c.origin.name, c.origin.text, c.origin.health],
                  ['Application', c.app.name, c.app.criticality, c.app.health],
                  ['Capability', c.capability, domains[c.domain].name, c.app.health],
                  ['Initiative', c.initiatives[0].name, c.initiatives.length > 1 ? `+${c.initiatives.length - 1} more` : `${c.initiatives[0].health} delivery`, c.initiatives[0].health],
                  ['Value at risk', cr(c.valueAtRiskCr), 'expected value', c.valueAtRiskCr > 10 ? 'Red' : 'Amber'],
                  ['Decision', c.decision?.title ?? 'Raise a decision', c.decision ? `${c.decision.priority} · ${c.decision.owner}` : 'no rule fired', c.decision?.priority === 'Critical' ? 'Red' : 'Amber'],
                ].map(([label, title, sub, h], k) => (
                  <motion.div key={label as string} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 * k, duration: 0.3 }} className="relative rounded-xl bg-white/[0.06] border p-2.5 min-w-0" style={{ borderColor: `${HEX[h as Rag]}66` }}>
                    <div className="text-[10px] uppercase tracking-wider text-slate-400">{k + 1} · {label}</div>
                    <div className={`font-semibold leading-snug mt-0.5 line-clamp-2 ${k === 4 ? 'text-[clamp(18px,2.6vh,28px)] text-red-300' : 'text-[clamp(13px,1.6vh,17px)]'}`}>{title}</div>
                    <div className="text-[11px] text-slate-400 line-clamp-1">{sub}</div>
                    {k < 5 && <ArrowRight size={13} className="hidden lg:block absolute -right-[11px] top-1/2 -translate-y-1/2 text-slate-500" aria-hidden />}
                  </motion.div>
                ))}
              </Swap>
            ) : <div className="text-sm text-slate-400">No red or amber signal in this scope.</div>}
          </div>
          <div className="rounded-2xl bg-white/[0.05] border border-white/10 p-4 min-w-0 flex flex-col gap-2">
            <div className="text-xs uppercase tracking-widest text-slate-400">Board statistics</div>
            <div className="flex items-baseline gap-2"><span className="text-[clamp(22px,3.4vh,34px)] font-bold text-red-300 whitespace-nowrap">r = {d.r.toFixed(2)}</span><span className="text-[11px] text-slate-400 leading-tight">technical health vs incidents · {d.n} apps</span></div>
            <div className="grid grid-cols-4 gap-1 text-center">{d.time.map((t) => <div key={t.q} className="rounded-md bg-white/[0.06] py-1"><div className="text-[10px] text-slate-400">{t.q}</div><div className="font-bold tabular-nums">{t.n}</div></div>)}</div>
            <div>
              <div className="flex h-2.5 rounded-full overflow-hidden gap-0.5">{[[d.v.green, '#34d399'], [d.v.amber, '#fbbf24'], [d.v.red, '#f87171']].map(([x, col], k) => <div key={k} style={{ width: `${((x as number) / Math.max(1, d.v.total)) * 100}%`, background: col as string }} />)}</div>
              <div className="flex justify-between text-[11px] text-slate-400 mt-1"><span>On track {cr(d.v.green)}</span><span>At risk {cr(atRisk)}</span></div>
            </div>
          </div>
        </section>
        <footer className="hidden lg:flex items-center justify-between gap-4 text-[11px] text-slate-500">
          {lines.length ? <Swap k={Math.floor((d.now - T0) / 7000) % lines.length} className="flex items-center gap-2 min-w-0 text-[13px] text-slate-200"><span className="shrink-0 text-[10px] uppercase tracking-widest text-sky-300">CTO briefing {Math.floor((d.now - T0) / 7000) % lines.length + 1}/{lines.length}</span><span className="truncate">{lines[Math.floor((d.now - T0) / 7000) % lines.length]}</span></Swap> : <span>Simulated enterprise data · every figure calculated from linked records</span>}
          <span className="shrink-0">Esc close · ← → chain · 1–4 business unit</span></footer>
      </div>
    </motion.div>
  )
}

