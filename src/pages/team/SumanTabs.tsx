// Suman · AI Transformation — Readiness, Portfolio & gates, ROI & benefits, Onboard any organisation.
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CartesianGrid, Cell, Legend, Line, LineChart, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ReferenceLine,
  ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis,
} from 'recharts'
import { CircleCheck, CircleX, Wand2 } from 'lucide-react'
import { domainOrder, domains } from '../../data/domains'
import type { DomainId } from '../../data/domains'
import { sim } from '../../data/sim'
import { DIMENSIONS, STAGES, STAGE_P, TEMPLATES, USE_CASES, cashflows, gateDecisionId, portfolioMonteCarlo, readiness, roi } from '../../data/sim/aiPortfolio'
import type { Stage, UseCase } from '../../data/sim/aiPortfolio'
import { Badge, Card } from '../../components/ui'
import { useDecisionState } from '../../components/sim/decisionState'
import { axisTick, chart, domainColor, series as palette } from '../../theme'

type DF = DomainId | 'all'
const dn = (d: DomainId) => domains[d].name
const cr = (n: number) => `₹${Math.round(n * 10) / 10} Cr`
const STAGE_COLOR: Record<Stage, string> = { Idea: '#94a3b8', PoC: palette[3], Pilot: palette[1], Production: palette[0], Scaled: chart.primaryDark }

function DomainFilter({ value, onChange }: { value: DF; onChange: (d: DF) => void }) {
  return (
    <div className="inline-flex rounded-lg border border-slate-300 bg-white overflow-hidden text-[13px] mb-4" role="group" aria-label="Business unit">
      {(['all', ...domainOrder] as DF[]).map((d) => (
        <button key={d} onClick={() => onChange(d)} aria-pressed={value === d} className={`px-3 py-1.5 ${value === d ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-ink-2 hover:bg-slate-50'}`}>{d === 'all' ? 'All units' : dn(d)}</button>
      ))}
    </div>
  )
}
/** A gate-approved pilot counts as Production. */
function useStages() {
  const st = useDecisionState()
  return (u: UseCase): Stage => (u.gate && st.verdicts[gateDecisionId(u)]?.v === 'Approved' ? 'Production' : u.stage)
}

// ── 1. Readiness ─────────────────────────────────────────────────────
export function ReadinessTab() {
  const [d, setD] = useState<DF>('all')
  const rows = DIMENSIONS.map((dim, i) => {
    const r = Object.fromEntries(domainOrder.map((x) => [dn(x), readiness(x)[i].current]))
    return { dim, ...r, Target: readiness('banking')[i].target }
  })
  const sel = d === 'all' ? null : readiness(d)
  const avg = DIMENSIONS.map((dim, i) => ({ dim, current: Math.round((domainOrder.reduce((s, x) => s + readiness(x)[i].current, 0) / 3) * 10) / 10, target: readiness('banking')[i].target, action: readiness('banking')[i].action }))
  const list = sel ?? avg
  return (
    <>
      <DomainFilter value={d} onChange={setD} />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <Card title={`AI readiness · ${d === 'all' ? 'all business units' : dn(d)} (1–5)`}>
          <div className="h-80" role="img" aria-label={`AI readiness by dimension: ${list.map((x) => `${x.dim} ${x.current}`).join(', ')}`}>
            <ResponsiveContainer>
              <RadarChart data={rows} outerRadius="72%">
                <PolarGrid stroke={chart.grid} /><PolarAngleAxis dataKey="dim" tick={{ fontSize: 12, fill: chart.axis }} /><PolarRadiusAxis domain={[0, 5]} tick={{ fontSize: 10, fill: chart.axis }} tickCount={6} />
                <Radar isAnimationActive={false} name="Target" dataKey="Target" stroke={chart.comparison} strokeDasharray="5 4" fill="none" strokeWidth={2} />
                {(d === 'all' ? domainOrder : [d]).map((x) => <Radar key={x} isAnimationActive={false} name={dn(x)} dataKey={dn(x)} stroke={domainColor[x]} fill={domainColor[x]} fillOpacity={d === 'all' ? 0.08 : 0.2} strokeWidth={2} />)}
                <Legend wrapperStyle={{ fontSize: 12 }} /><Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-ink-3">Each dimension is derived from simulated metrics: Strategy (strategy function), Data (data quality), Platform (technology + architecture), Skills (AI-skilled workforce), Governance (responsible-AI controls), Adoption (AI-assisted service share).</p>
        </Card>
        <Card title="Readiness gaps and next moves">
          <table className="w-full text-sm [&_th]:px-2 [&_td]:px-2">
            <thead><tr className="text-[11px] uppercase tracking-wide text-ink-3 border-b border-line text-left"><th className="py-2">Dimension</th><th className="text-right">Now</th><th className="text-right">Target</th><th className="text-right">Gap</th><th className="pl-3">Next move</th></tr></thead>
            <tbody>{[...list].sort((a, b) => (b.target - b.current) - (a.target - a.current)).map((x) => {
              const gap = Math.round((x.target - x.current) * 10) / 10
              return (
                <tr key={x.dim} className="border-b border-line last:border-0 align-top">
                  <td className="py-2 font-medium text-ink">{x.dim}</td>
                  <td className="text-right tabular-nums">{x.current}</td><td className="text-right tabular-nums">{x.target}</td>
                  <td className={`text-right font-semibold tabular-nums ${gap >= 1 ? 'text-warn-text' : gap > 0 ? 'text-ink-2' : 'text-success-text'}`}>{gap > 0 ? gap : '✓'}</td>
                  <td className="pl-3 text-xs text-ink-2">{gap > 0 ? x.action : 'At target — sustain'}</td>
                </tr>
              )
            })}</tbody>
          </table>
        </Card>
      </div>
    </>
  )
}

// ── 2. Portfolio & gates ─────────────────────────────────────────────
export function PortfolioTab() {
  const [d, setD] = useState<DF>('all')
  const stageOf = useStages()
  const st = useDecisionState()
  const ucs = USE_CASES.filter((u) => d === 'all' || u.domain === d).map((u) => ({ ...u, stage: stageOf(u) }))
  const funnel = STAGES.map((s) => { const xs = ucs.filter((u) => u.stage === s); return { s, n: xs.length, v: xs.reduce((a, u) => a + u.vLikely, 0) } })
  const maxN = Math.max(...funnel.map((f) => f.n))
  const live = ucs.filter((u) => u.stage === 'Production' || u.stage === 'Scaled')
  const totalProd = (d === 'all' ? domainOrder : [d]).reduce((s, x) => s + sim[x].metrics.find((m) => m.functionId === 'data-ai' && m.key === 'usecases')!.current, 0)
  const gates = USE_CASES.filter((u) => u.gate && (d === 'all' || u.domain === d))
  const pilots = ucs.filter((u) => u.stage === 'Pilot').length
  return (
    <>
      <DomainFilter value={d} onChange={setD} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          ['Flagship use cases', `${ucs.length}`, `of ${totalProd} AI use cases in production overall`],
          ['Live (production + scaled)', `${live.length}`, `${cr(live.reduce((s, u) => s + u.realisedCr, 0))} realised to date`],
          ['Pipeline value (likely, per year)', cr(ucs.reduce((s, u) => s + u.vLikely, 0)), `risk-adjusted ${cr(ucs.reduce((s, u) => s + u.vLikely * STAGE_P[u.stage], 0))}`],
          ['Pilots awaiting gate', `${pilots}`, `${gates.filter((g) => !st.verdicts[gateDecisionId(g)]).length} ready for a production decision`],
        ].map(([l, v, s]) => <div key={l} className="bg-surface rounded-xl border border-line p-3.5"><div className="text-xs text-ink-2">{l}</div><div className="text-[24px] font-bold text-brand-900 leading-tight">{v}</div><div className="text-[11px] text-ink-3">{s}</div></div>)}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-5">
        <Card title="Stage-gate funnel · idea → scaled">
          <ul className="space-y-2">{funnel.map((f) => (
            <li key={f.s} className="grid grid-cols-[6rem_1fr_auto] items-center gap-3 text-sm">
              <span className="font-medium text-ink">{f.s}</span>
              <div className="h-7 bg-slate-50 rounded-md flex items-center justify-center"><div className="h-full rounded-md flex items-center justify-center text-xs font-semibold text-white" style={{ width: `${Math.max(12, (f.n / maxN) * 100)}%`, background: STAGE_COLOR[f.s] }}>{f.n}</div></div>
              <span className="text-xs text-ink-3 w-28 text-right">{cr(f.v)}/yr · p {Math.round(STAGE_P[f.s] * 100)}%</span>
            </li>
          ))}</ul>
          <p className="text-xs text-ink-3 mt-3">p = probability a use case at that stage delivers its value (stage-gate attrition), used for risk-adjusted value and the Monte Carlo on the ROI tab.</p>
        </Card>
        <Card title="Value × feasibility">
          <div className="h-72" role="img" aria-label="Use cases plotted by business value and feasibility">
            <ResponsiveContainer>
              <ScatterChart margin={{ left: -10, right: 12, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} />
                <XAxis type="number" dataKey="feasibility" name="Feasibility" domain={[3, 10]} tick={axisTick} label={{ value: 'Feasibility →', position: 'insideBottomRight', offset: -2, fontSize: 11, fill: chart.axis }} />
                <YAxis type="number" dataKey="value" name="Business value" domain={[3, 10]} tick={axisTick} label={{ value: 'Value →', angle: -90, position: 'insideLeft', fontSize: 11, fill: chart.axis }} />
                <ZAxis type="number" dataKey="vLikely" range={[60, 360]} />
                <ReferenceLine x={6.5} stroke={chart.comparison} strokeDasharray="4 4" /><ReferenceLine y={6.5} stroke={chart.comparison} strokeDasharray="4 4" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ payload }) => { const u = payload?.[0]?.payload as UseCase | undefined; return u ? <div className="bg-white border border-line rounded-md p-2 text-xs shadow"><b>{u.name}</b><br />{dn(u.domain)} · {u.stage}<br />Value {u.value} · feasibility {u.feasibility} · {cr(u.vLikely)}/yr</div> : null }} />
                <Scatter isAnimationActive={false} data={ucs}>{ucs.map((u) => <Cell key={u.id} fill={STAGE_COLOR[u.stage]} />)}</Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-ink-3">{STAGES.map((s) => <span key={s}><span className="inline-block w-2.5 h-2.5 rounded-full mr-1 align-middle" style={{ background: STAGE_COLOR[s] }} />{s}</span>)} · top-right = do first · bubble = value per year</div>
        </Card>
      </div>

      <Card title="Gate reviews · pilots ready for production" className="mb-5">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">{gates.map((g) => {
          const v = st.verdicts[gateDecisionId(g)]?.v
          const r = roi(g)
          return (
            <div key={g.id} className={`rounded-xl border p-4 ${v === 'Approved' ? 'border-green-200 bg-success-bg' : 'border-line'}`}>
              <div className="text-[11px] text-ink-3">{dn(g.domain)} · {g.id} · owner {g.owner}</div>
              <div className="font-semibold text-ink">{g.name}</div>
              <table className="w-full text-xs mt-2"><tbody>{g.gate!.criteria.map(([c, t, a, ok]) => (
                <tr key={c} className="border-b border-line last:border-0"><td className="py-1 text-ink-2">{c}</td><td className="text-ink-3">{t}</td><td className="font-semibold text-right">{a}</td><td className="pl-1">{ok ? <CircleCheck size={13} className="text-success-text" /> : <CircleX size={13} className="text-crit-text" />}</td></tr>
              ))}</tbody></table>
              <div className="text-xs text-ink-2 mt-2">Value {cr(g.vMin)}–{cr(g.vMax)}/yr · NPV {cr(r.npv)} · payback {r.paybackMonths ?? '—'} months</div>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                {v ? (<><span className={`text-sm font-semibold ${v === 'Approved' ? 'text-success-text' : 'text-warn-text'}`}>{v === 'Approved' ? 'Promoted to production · value tracking started' : 'Held at pilot'}</span><button onClick={() => st.decide(gateDecisionId(g), null)} className="text-xs text-ink-3 underline">Undo</button></>) : (
                  <>
                    <button onClick={() => st.decide(gateDecisionId(g), 'Approved')} className="inline-flex items-center gap-1 h-8 px-3 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700"><CircleCheck size={14} />Promote</button>
                    <button onClick={() => st.decide(gateDecisionId(g), 'Deferred')} className="h-8 px-3 rounded-lg border border-slate-300 text-sm font-medium hover:bg-slate-50">Hold</button>
                    <span className="text-[11px] text-ink-3">Gate decision: Suman, with model-risk sign-off (Vaibhav)</span>
                  </>
                )}
              </div>
            </div>
          )
        })}</div>
      </Card>

      <Card title="Portfolio board">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">{STAGES.map((s) => (
          <div key={s} className="rounded-lg bg-slate-50 border border-line p-2.5 min-w-0">
            <div className="flex items-center gap-1.5 text-sm font-semibold text-ink mb-2"><span className="w-2.5 h-2.5 rounded-full" style={{ background: STAGE_COLOR[s] }} />{s}<span className="text-xs text-ink-3 font-normal">{ucs.filter((u) => u.stage === s).length}</span></div>
            <ul className="space-y-1.5">{ucs.filter((u) => u.stage === s).map((u) => (
              <li key={u.id} className="bg-white rounded-md border border-line p-2 text-xs">
                <div className="font-medium text-ink leading-snug">{u.name}</div>
                <div className="text-ink-3 mt-0.5">{d === 'all' ? `${dn(u.domain)} · ` : ''}{cr(u.vLikely)}/yr · {u.risk} risk</div>
                {u.appId && <Link to={`/domain/${u.domain}/record/${u.appId}`} className="text-brand-700 hover:underline">{u.appId}</Link>}
              </li>
            ))}</ul>
          </div>
        ))}</div>
      </Card>
    </>
  )
}

// ── 3. ROI & benefits ────────────────────────────────────────────────
export function RoiTab() {
  const [d, setD] = useState<DF>('all')
  const stageOf = useStages()
  const ucs = USE_CASES.filter((u) => d === 'all' || u.domain === d).map((u) => ({ ...u, stage: stageOf(u) }))
  const mc = useMemo(() => [...domainOrder.map((x) => ({ k: dn(x), r: portfolioMonteCarlo(ucs.filter((u) => u.domain === x), `mc-${x}-${ucs.filter((u) => u.domain === x).map((u) => u.stage).join('')}`) })).filter((x) => ucs.some((u) => dn(u.domain) === x.k)),
    { k: d === 'all' ? 'Enterprise' : 'Total', r: portfolioMonteCarlo(ucs, `mc-all-${d}-${ucs.map((u) => u.stage).join('')}`) }], [ucs, d])
  const maxV = Math.max(...mc.map((x) => x.r.p90))
  const q = Array.from({ length: 13 }, (_, i) => i)
  const cum = q.map((i) => ({ q: i === 0 ? 'Now' : `Q${i}`, Cumulative: Math.round(ucs.reduce((s, u) => s + cashflows(u).slice(0, i + 1).reduce((a, b) => a + b, 0), 0) * 10) / 10 }))
  const ranked = ucs.map((u) => ({ u, r: roi(u) })).sort((a, b) => b.r.npv - a.r.npv)
  const invest = ucs.reduce((s, u) => s + u.investCr, 0)
  const breakEven = cum.findIndex((x) => x.Cumulative >= 0)
  return (
    <>
      <DomainFilter value={d} onChange={setD} />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-5">
        <Card title="Annual portfolio value · Monte Carlo (2,000 runs)">
          <ul className="space-y-4 mt-1">{mc.map(({ k, r }) => (
            <li key={k}>
              <div className="flex justify-between text-sm"><span className="font-medium text-ink">{k}</span><span className="tabular-nums text-ink-2">P50 <b className="text-ink">{cr(r.p50)}</b></span></div>
              <div className="relative h-4 bg-slate-100 rounded-full mt-1" role="img" aria-label={`${k}: P10 ${r.p10}, P50 ${r.p50}, P90 ${r.p90} crore per year`}>
                <div className="absolute h-full rounded-full bg-seq-250" style={{ left: `${(r.p10 / maxV) * 100}%`, width: `${((r.p90 - r.p10) / maxV) * 100}%` }} />
                <div className="absolute -top-0.5 -bottom-0.5 w-1 rounded bg-brand-900" style={{ left: `${(r.p50 / maxV) * 100}%` }} />
              </div>
              <div className="flex justify-between text-[11px] text-ink-3 mt-0.5"><span>P10 {cr(r.p10)} (downside)</span><span>P90 {cr(r.p90)} (upside)</span></div>
            </li>
          ))}</ul>
          <p className="text-xs text-ink-3 mt-3">Each run samples every use case's value from a triangular (min, likely, max) range and whether it succeeds at its stage (stage probability). Bar = P10–P90 range; marker = P50.</p>
        </Card>
        <Card title="Payback curve · cumulative cash flow">
          <div className="h-64" role="img" aria-label={`Cumulative cash flow of ${ucs.length} use cases; break-even ${breakEven > 0 ? `in quarter ${breakEven}` : 'not within 3 years'}`}>
            <ResponsiveContainer>
              <LineChart data={cum} margin={{ left: -10, right: 12, top: 6 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} vertical={false} />
                <XAxis dataKey="q" tick={axisTick} /><YAxis tick={axisTick} /><Tooltip formatter={(v) => `₹${v} Cr`} />
                <ReferenceLine y={0} stroke={chart.axis} />
                <Line isAnimationActive={false} dataKey="Cumulative" stroke={chart.primary} strokeWidth={2.5} dot={{ r: 2.5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-ink-3">Investment {cr(invest)} up front; value ramps on an adoption S-curve after each use case goes live, net of run cost (30% of build cost a year). Break-even: <b className="text-ink">{breakEven > 0 ? `quarter ${breakEven} (~${breakEven * 3} months)` : 'beyond 3 years'}</b>.</p>
        </Card>
      </div>
      <Card title="Use cases ranked by NPV (3 years, 12% a year)">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[720px] [&_th]:px-2 [&_td]:px-2">
            <thead><tr className="text-[11px] uppercase tracking-wide text-ink-3 border-b border-line text-left"><th className="py-2">Use case</th><th>Stage</th><th className="text-right">Investment</th><th className="text-right">Value / yr (min–max)</th><th className="text-right">NPV</th><th className="text-right">Payback</th><th className="text-right">3-yr ROI</th></tr></thead>
            <tbody>{ranked.slice(0, 12).map(({ u, r }) => (
              <tr key={u.id} className="border-b border-line last:border-0">
                <td className="py-1.5"><div className="font-medium text-ink">{u.name}</div><div className="text-[11px] text-ink-3">{dn(u.domain)} · {u.owner}</div></td>
                <td><span className="inline-flex items-center gap-1 text-xs"><span className="w-2 h-2 rounded-full" style={{ background: STAGE_COLOR[u.stage] }} />{u.stage}</span></td>
                <td className="text-right tabular-nums">{cr(u.investCr)}</td>
                <td className="text-right tabular-nums text-xs">{cr(u.vLikely)} ({u.vMin}–{u.vMax})</td>
                <td className={`text-right tabular-nums font-semibold ${r.npv < 0 ? 'text-crit-text' : 'text-ink'}`}>{cr(r.npv)}</td>
                <td className="text-right tabular-nums">{r.paybackMonths !== null ? `${r.paybackMonths} mo` : '—'}</td>
                <td className="text-right tabular-nums">{r.roi3y}%</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </Card>
    </>
  )
}

// ── 4. Onboard any organisation ──────────────────────────────────────
export function OnboardTab() {
  const [tid, setTid] = useState('insurance')
  const [org, setOrg] = useState('New business unit')
  const [size, setSize] = useState('1,000–10,000')
  const [self, setSelf] = useState<number[]>([2, 2, 2, 1, 2, 1])
  const t = TEMPLATES.find((x) => x.id === tid)!
  const avg = Math.round((self.reduce((a, b) => a + b, 0) / self.length) * 10) / 10
  const weakest = DIMENSIONS.map((dim, i) => ({ dim, v: self[i] })).sort((a, b) => a.v - b.v).slice(0, 2)
  const dataFactor = 0.6 + 0.1 * self[1] // data readiness lifts feasibility
  const ranked = t.useCases.map(([n, lever, data, v, f]) => ({ n, lever, data, v, f, score: Math.round(v * f * dataFactor) })).sort((a, b) => b.score - a.score)
  const start = avg < 2 ? 'Foundations first: data, governance and one quick-win pilot' : avg < 3 ? 'Two pilots with clear value cases, plus foundations in parallel' : 'Portfolio mode: several pilots and a production path'
  const weeks = avg < 2 ? 16 : avg < 3 ? 12 : 8
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
      <Card title="1 · Describe the organisation">
        <label className="block text-sm mb-3">Organisation<input value={org} onChange={(e) => setOrg(e.target.value)} className="mt-1 w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-sm" /></label>
        <label className="block text-sm mb-3">Industry template
          <select value={tid} onChange={(e) => setTid(e.target.value)} className="mt-1 w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-sm bg-white">{TEMPLATES.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}</select>
        </label>
        <label className="block text-sm mb-4">Employees
          <select value={size} onChange={(e) => setSize(e.target.value)} className="mt-1 w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-sm bg-white">{['< 1,000', '1,000–10,000', '10,000–50,000', '> 50,000'].map((x) => <option key={x}>{x}</option>)}</select>
        </label>
        <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-3 mb-2">Self-assessed readiness (1–5)</div>
        {DIMENSIONS.map((dim, i) => (
          <label key={dim} className="flex items-center gap-3 text-sm mb-2"><span className="w-24 shrink-0">{dim}</span>
            <input type="range" min={1} max={5} step={1} value={self[i]} onChange={(e) => setSelf((s) => s.map((x, k) => (k === i ? Number(e.target.value) : x)))} className="flex-1 accent-brand-600" aria-label={`${dim} readiness`} />
            <b className="w-4 text-right">{self[i]}</b></label>
        ))}
      </Card>
      <div className="xl:col-span-2 space-y-5">
        <Card title={`2 · Generated plan for ${org}`} action={<span className="inline-flex items-center gap-1 text-xs text-ink-3"><Wand2 size={13} />Rule engine · no live AI call</span>}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <div className="rounded-lg bg-brand-50 border border-brand-100 p-3"><div className="text-[11px] text-brand-700 font-semibold uppercase">Readiness</div><div className="text-2xl font-bold text-brand-900">{avg} / 5</div><div className="text-xs text-ink-2">Weakest: {weakest.map((w) => w.dim).join(', ')}</div></div>
            <div className="rounded-lg bg-slate-50 border border-line p-3 md:col-span-2"><div className="text-[11px] text-ink-3 font-semibold uppercase">Starting point</div><div className="font-semibold text-ink">{start}</div><div className="text-xs text-ink-2">Time to first measurable value: ~{weeks} weeks · {t.label} · {size} employees</div></div>
          </div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-3 mb-1">Prioritised starter use cases</div>
          <table className="w-full text-sm mb-4"><thead><tr className="text-[11px] text-ink-3 border-b border-line text-left"><th className="py-1.5">Use case</th><th>Value lever</th><th>Data needed</th><th className="text-right">Priority</th></tr></thead>
            <tbody>{ranked.map((x, i) => <tr key={x.n} className="border-b border-line last:border-0"><td className="py-1.5 font-medium text-ink">{i + 1}. {x.n}</td><td className="text-xs">{x.lever}</td><td className="text-xs text-ink-3">{x.data}</td><td className="text-right"><Badge>{i < 2 ? 'High' : i < 4 ? 'Medium' : 'Low'}</Badge></td></tr>)}</tbody></table>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">{[
            ['Days 0–30 · Foundations', [`Readiness baseline and AI policy (TEDIF gates G1–G2)`, `Fix ${weakest[0].dim.toLowerCase()} gaps first`, `Pick 2 use cases: ${ranked[0].n}, ${ranked[1].n}`]],
            ['Days 31–60 · Pilot', [`Pilot ${ranked[0].n} with success criteria`, 'Model register entry + risk tier', `Baseline KPIs: ${t.kpis.slice(0, 2).join(', ')}`]],
            ['Days 61–90 · Prove value', ['Gate review: promote, hold or stop', 'Value tracking live in CTO360', `Plan next wave: ${ranked.slice(2, 4).map((x) => x.n).join(', ')}`]],
          ].map(([h, xs]) => <div key={h as string} className="rounded-lg border border-line p-3"><div className="font-semibold text-sm text-ink mb-1">{h as string}</div><ul className="list-disc pl-4 text-xs text-ink-2 space-y-0.5">{(xs as string[]).map((x) => <li key={x}>{x}</li>)}</ul></div>)}</div>
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Card title="KPIs to track from day one"><ul className="list-disc pl-4 text-sm text-ink-2 space-y-0.5">{t.kpis.map((k) => <li key={k}>{k}</li>)}</ul></Card>
          <Card title="Risks to govern (with Vaibhav)"><ul className="list-disc pl-4 text-sm text-ink-2 space-y-0.5">{t.risks.map((k) => <li key={k}>{k}</li>)}</ul><p className="text-xs text-ink-3 mt-2">The same CTO360 framework, gates and measures apply to any industry — only the template changes.</p></Card>
        </div>
        <BusinessModelCanvas t={t} top={ranked.slice(0, 3).map((x) => x.n)} levers={ranked.map((x) => x.lever)} />
      </div>
    </div>
  )
}

/** Business Model Canvas (Osterwalder) generated for the chosen industry template — rule-based. */
const SEGMENTS: Record<string, string[]> = {
  banking: ['Retail customers', 'SME borrowers', 'Merchants', 'Regulators (reporting)'], manufacturing: ['B2B customers and dealers', 'Plants and production teams', 'Suppliers'],
  retail: ['Online shoppers', 'Store customers', 'Loyalty members'], insurance: ['Policyholders', 'Agents and brokers', 'Claimants'],
  healthcare: ['Patients', 'Clinicians', 'Payers'], telecom: ['Consumer subscribers', 'Enterprise customers', 'Field engineers'],
}
function BusinessModelCanvas({ t, top, levers }: { t: (typeof TEMPLATES)[number]; top: string[]; levers: string[] }) {
  const B = ({ title, items, className = '' }: { title: string; items: string[]; className?: string }) => (
    <div className={`rounded-lg border border-line bg-surface p-2.5 ${className}`}><div className="text-[10.5px] font-semibold uppercase tracking-wide text-brand-700 mb-1">{title}</div><ul className="text-xs text-ink-2 space-y-0.5 list-disc pl-3.5">{items.map((x) => <li key={x}>{x}</li>)}</ul></div>
  )
  return (
    <Card title={`Business Model Canvas · AI programme for ${t.label}`} action={<span className="text-xs text-ink-3">Generated · rule-based</span>}>
      <div className="overflow-x-auto"><div className="grid grid-cols-5 gap-2 min-w-[760px]">
        <B title="Key partners" items={['Cloud and AI platform providers', 'Data and integration partners', 'System integrators']} className="row-span-2" />
        <B title="Key activities" items={['Data foundation and MLOps', `Pilot → production gates for ${top[0]}`, 'Change and adoption']} />
        <B title="Value propositions" items={[...new Set(levers)].slice(0, 4).map((l) => `Better ${l.toLowerCase()}`)} className="row-span-2" />
        <B title="Customer relationships" items={['AI-assisted service', 'Self-service with human fallback']} />
        <B title="Customer segments" items={SEGMENTS[t.id]} className="row-span-2" />
        <B title="Key resources" items={['Critical data elements', 'AI platform and models', 'AI-skilled teams']} />
        <B title="Channels" items={['Existing digital channels', 'Front-line staff tools', 'APIs to partners']} />
        <B title="Cost structure" items={['Build (CAPEX) and run cost (cloud, MLOps, support)', 'Data and change effort']} className="col-span-2" />
        <B title="Revenue streams / value captured" items={[...t.kpis.slice(0, 3).map((k) => `Improved ${k}`), 'Cost avoided and risk reduced']} className="col-span-3" />
      </div></div>
      <p className="text-xs text-ink-3 mt-2">Business Model Canvas (Osterwalder): how this AI programme creates, delivers and captures value. Top use cases: {top.join(', ')}.</p>
    </Card>
  )
}
