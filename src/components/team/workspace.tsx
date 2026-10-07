// Shared building blocks for the five team workspaces (M7).
import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ArrowRight, CheckCircle2, CircleDot, Circle, FlaskConical, RotateCcw } from 'lucide-react'
import { MONTHS, sim, SOURCES } from '../../data/sim'
import { decisionsFor } from '../../data/sim/decisions'
import type { Decision } from '../../data/sim/decisions'
import { buildEvents } from '../../data/sim/events'
import type { MeasureState, Owner } from '../../data/sim/team'
import { ownerState } from '../../data/sim/team'
import { headroomAt, threadState } from '../../data/sim/scenario'
import { OWNER } from '../../data/sim/team'
import { ragOf } from '../../data/sim/scoring'
import { Card } from '../ui'
import { ScoreRing, Sparkline, fmt } from '../sim/primitives'
import { DecisionRow } from '../sim/DecisionCard'
import { useDecisionState } from '../sim/decisionState'
import { hhmm, useSimClock } from '../sim/clock'
import { axisTick, chart } from '../../theme'

const GLIDE: Record<string, string> = { Ahead: 'bg-success-bg text-success-text border-green-200', 'On track': 'bg-info-bg text-info-text border-blue-200', Behind: 'bg-crit-bg text-crit-text border-red-200' }
export const GlidePill = ({ g }: { g: string }) => <span className={`inline-flex text-[11px] font-medium border rounded-md px-1.5 py-0.5 whitespace-nowrap ${GLIDE[g]}`}>{g === 'Ahead' ? '▲ ' : g === 'Behind' ? '▼ ' : '● '}{g}</span>
const v = (m: MeasureState, x: number) => fmt(x, m.def.unit === '/100' || m.def.unit === '/5' ? '' : m.def.unit) + (m.def.unit === '/100' || m.def.unit === '/5' ? m.def.unit : '')

/** Measure card: current, target, progress from baseline, glide-path status. */
export function MeasureCard({ m }: { m: MeasureState }) {
  return (
    <div className="bg-surface rounded-xl border border-line p-3.5 min-w-0">
      <div className="flex flex-wrap items-start justify-between gap-x-2 gap-y-1"><span className="text-xs font-medium text-ink-2 leading-snug min-w-0">{m.def.name}</span><GlidePill g={m.glide} /></div>
      <div className="flex items-end justify-between gap-2 mt-1">
        <div className="text-[24px] font-bold text-brand-900 leading-tight tabular-nums">{v(m, m.current)}</div>
        <Sparkline data={m.series} target={m.target} width={84} height={26} />
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1.5" role="img" aria-label={`${m.progress}% of the gap closed`}><div className="h-full bg-brand-600" style={{ width: `${m.progress}%` }} /></div>
      <div className="flex justify-between text-[11px] text-ink-3 mt-1"><span>From {v(m, m.baseline)} → target {v(m, m.target)}</span><b className="text-ink-2">{m.progress}%</b></div>
    </div>
  )
}

/** Transformation tab: From → To, bridge per measure, glide-path chart, transformation ladder. */
export function TransformationTab({ owner }: { owner: Owner }) {
  const st = ownerState(owner)
  const [sel, setSel] = useState(st.measures[0].def.id)
  const m = st.measures.find((x) => x.def.id === sel)!
  const data = MONTHS.map((mo, k) => ({ m: mo, Actual: m.series[k], Plan: m.plan[k] }))
  const level = Math.round((1 + (st.score / 100) * 3) * 10) / 10 // L1 at start → L4 when every measure hits target
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-line bg-slate-50 p-4"><div className="text-[11px] font-semibold uppercase tracking-wide text-ink-3 mb-2">Old state · Nov 2025</div><ul className="space-y-1.5 text-sm text-ink-2 list-disc pl-4">{owner.from.map((x) => <li key={x}>{x}</li>)}</ul></div>
        <div className="rounded-xl border border-brand-100 bg-brand-50 p-4"><div className="text-[11px] font-semibold uppercase tracking-wide text-brand-700 mb-2">Target state</div><ul className="space-y-1.5 text-sm text-brand-900 list-disc pl-4">{owner.to.map((x) => <li key={x}>{x}</li>)}</ul></div>
      </div>
      <Card title="Transformation bridge · baseline → today → target">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[760px] [&_th]:px-2 [&_td]:px-2">
            <thead><tr className="text-[11px] uppercase tracking-wide text-ink-3 border-b border-line text-left"><th className="py-2">Measure</th><th className="w-[34%]">Baseline ── today ── target</th><th className="text-right">Progress</th><th className="text-right">Time used</th><th>Glide path</th><th>ETA</th></tr></thead>
            <tbody>{st.measures.map((x) => (
              <tr key={x.def.id} onClick={() => setSel(x.def.id)} className={`border-b border-line last:border-0 cursor-pointer ${sel === x.def.id ? 'bg-brand-50' : 'hover:bg-slate-50'}`}>
                <td className="py-2"><div className="font-medium text-ink">{x.def.name}</div><div className="text-[11px] text-ink-3">{x.def.note}</div></td>
                <td>
                  <div className="relative h-2 bg-slate-100 rounded-full" role="img" aria-label={`${x.progress}% of the way from ${x.baseline} to ${x.target}`}>
                    <div className="absolute h-full bg-brand-600 rounded-full" style={{ width: `${x.progress}%` }} />
                    <div className="absolute -top-1 w-0.5 h-4 bg-ink-3" style={{ left: `${x.elapsed}%` }} title={`Time used ${x.elapsed}%`} />
                  </div>
                  <div className="flex justify-between text-[11px] text-ink-3 mt-1 tabular-nums"><span>{v(x, x.baseline)}</span><b className="text-ink">{v(x, x.current)}</b><span>{v(x, x.target)} · {x.def.targetDate.slice(0, 7)}</span></div>
                </td>
                <td className="text-right font-semibold tabular-nums">{x.progress}%</td>
                <td className="text-right text-ink-3 tabular-nums">{x.elapsed}%</td>
                <td><GlidePill g={x.glide} /></td>
                <td className="text-xs whitespace-nowrap">{x.eta ? x.eta.slice(0, 7) : <span className="text-crit-text">Not on current trend</span>}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
        <p className="text-xs text-ink-3 mt-2">Progress = share of the gap from baseline (Nov 2025) to target that has been closed. The tick marks how much of the time to the target date has been used: progress right of the tick is ahead of plan. ETA projects the last quarter's trend.</p>
      </Card>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <Card title={`Glide path · ${m.def.name}`} className="xl:col-span-2 min-w-0">
          <div className="h-64" role="img" aria-label={`${m.def.name}: actual ${m.current} vs plan ${m.plan[11]}, target ${m.target}`}>
            <ResponsiveContainer>
              <LineChart data={data} margin={{ left: -8, right: 12, top: 6 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} vertical={false} />
                <XAxis dataKey="m" tick={axisTick} /><YAxis tick={axisTick} domain={['auto', 'auto']} width={52} />
                <Tooltip /><Legend wrapperStyle={{ fontSize: 12 }} />
                <ReferenceLine y={m.target} stroke={chart.comparison} strokeDasharray="4 4" label={{ value: `Target ${m.target}`, fontSize: 11, fill: chart.axis, position: 'insideTopRight' }} />
                <Line isAnimationActive={false} dataKey="Plan" stroke={chart.comparison} strokeWidth={2} strokeDasharray="6 4" dot={false} />
                <Line isAnimationActive={false} dataKey="Actual" stroke={chart.primary} strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-ink-3">Dashed: straight-line plan from the Nov 2025 baseline to the target date. Click a row above to switch measure.</p>
        </Card>
        <Card title="Transformation ladder">
          <div className="flex items-center gap-3 mb-3"><ScoreRing score={st.score} status={ragOf(st.score + 20)} size={56} label="Transformation progress" /><div className="text-sm"><b className="text-ink">{st.score}%</b> of the way from old to target state<div className="text-xs text-ink-3">{st.ahead} ahead · {st.onTrack} on track · {st.behind} behind</div></div></div>
          <ol className="space-y-1.5">{['Old state — ad hoc', 'Visible — measured', 'Managed — governed', 'Target state — optimised'].map((l, i) => {
            const n = i + 1, here = Math.floor(level) === n
            return <li key={l} className={`flex items-center gap-2 text-sm rounded-md px-2 py-1 ${here ? 'bg-brand-50 text-brand-900 font-semibold' : level >= n ? 'text-ink-2' : 'text-ink-4'}`}>{level >= n + 1 ? <CheckCircle2 size={15} className="text-success-text" /> : here ? <CircleDot size={15} className="text-brand-600" /> : <Circle size={15} />}L{n} · {l}{here && <span className="ml-auto text-xs">now {level}</span>}</li>
          })}</ol>
        </Card>
      </div>
    </div>
  )
}

/** Right rail: the owner's decisions + live events from their sources. */
export function OwnerRail({ owner }: { owner: Owner }) {
  const st = useDecisionState()
  const { now } = useSimClock()
  const decisions = useMemo(() => Object.values(sim).flatMap(decisionsFor), [])
  const mine: Decision[] = decisions.filter((d) => !d.preset && (owner.id === 'ram' || d.functions.some((f) => owner.functions.includes(f))))
  const top = [...mine].sort((a, b) => ['Critical', 'High', 'Medium', 'Low'].indexOf(a.priority) - ['Critical', 'High', 'Medium', 'Low'].indexOf(b.priority)).slice(0, 3)
  const actions = decisions.filter((d) => st.statusOf(d) === 'Approved' && (owner.id === 'ram' || d.functions.some((f) => owner.functions.includes(f)))).flatMap((d) => d.actions)
  const events = useMemo(() => Object.values(sim).flatMap((d) => buildEvents(d).map((e) => ({ ...e, domain: d.domain }))).filter((e) => owner.sources.includes(e.source)), [owner])
  const feed = events.filter((e) => e.at <= now).sort((a, b) => b.at - a.at).slice(0, 6)
  return (
    <div className="space-y-5">
      <Card title={`${owner.name}'s decisions`} action={<Link to="/decision-center" className="text-xs font-semibold text-brand-600">All →</Link>}>
        <div className="text-xs text-ink-3 -mt-2 mb-2">{mine.filter((d) => st.statusOf(d) === 'Awaiting decision').length} awaiting · {actions.length} actions from approved decisions</div>
        <div className="space-y-2">{top.map((d) => <DecisionRow key={d.id} d={d} />)}</div>
      </Card>
      <Card title="Live feed · my sources">
        <ul className="text-[12.5px] divide-y divide-line">{feed.map((e) => (
          <li key={e.id} className="py-1.5 flex gap-2 min-w-0"><span className="text-ink-4 tabular-nums shrink-0">{hhmm(e.at).slice(0, 5)}</span><span className={`w-1.5 h-1.5 mt-1.5 rounded-full shrink-0 ${e.tone === 'crit' ? 'bg-crit' : e.tone === 'warn' ? 'bg-warn' : e.tone === 'ok' ? 'bg-ok' : 'bg-brand-600'}`} /><Link to={`/domain/${e.domain}/record/${e.recordId}`} className="truncate text-ink-2 hover:underline" title={e.text}>{e.text}</Link></li>
        ))}</ul>
        <div className="text-[10.5px] text-ink-4 mt-1">{owner.sources.map((s) => SOURCES.find((x) => x.id === s)!.label).join(' · ')} (simulated)</div>
      </Card>
    </div>
  )
}

/** Workspace shell: owner banner, 6 measure KPIs, tabs (Transformation first), main + right rail, honesty note. */
export function WorkspaceShell({ owner, tabs }: { owner: Owner; tabs: { id: string; label: string; render: () => ReactNode }[] }) {
  const [sp, setSp] = useSearchParams()
  const st = ownerState(owner)
  const all = [{ id: 'transformation', label: 'Transformation', render: () => <TransformationTab owner={owner} /> }, ...tabs]
  const cur = all.find((t) => t.id === sp.get('tab')) ?? all[0]
  return (
    <>
      <section className="rounded-xl bg-brand-950 text-white p-5 mb-4 flex flex-col lg:flex-row gap-5 lg:items-center">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <div className="w-14 h-14 rounded-full bg-white/15 flex items-center justify-center text-2xl font-bold shrink-0" aria-hidden>{owner.name[0]}</div>
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-wide text-accent font-semibold">Team workspace · {owner.workspace}</div>
            <h1 className="text-[24px] sm:text-[28px] font-bold leading-tight">{owner.name} <span className="text-slate-300 font-medium text-lg">· {owner.role}</span></h1>
            <p className="text-sm text-slate-300">{owner.tagline}</p>
            <div className="flex flex-wrap gap-1.5 mt-2">{owner.bp1.map((b, i) => <span key={b} className="text-[11px] bg-white/10 border border-white/15 rounded-md px-2 py-0.5">BP1 · {i + 1} · {b}</span>)}</div>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-white rounded-full p-1"><ScoreRing score={st.score} status={ragOf(st.score + 20)} size={66} label="Transformation progress" /></div>
          <div className="text-sm leading-snug"><div className="text-slate-300 text-xs">Old → target state</div><b>{st.score}% transformed</b><div className="text-xs text-slate-300">{st.ahead} ahead · {st.onTrack} on track · {st.behind} behind</div></div>
        </div>
      </section>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-3 mb-5">{st.measures.map((m) => <MeasureCard key={m.def.id} m={m} />)}</div>
      <div className="flex gap-1 border-b border-line mb-4 overflow-x-auto" role="tablist">
        {all.map((t) => (
          <button key={t.id} role="tab" aria-selected={cur.id === t.id} onClick={() => { const n = new URLSearchParams(sp); n.set('tab', t.id); setSp(n, { replace: true }) }}
            className={`px-3 py-2 text-sm whitespace-nowrap border-b-2 -mb-px ${cur.id === t.id ? 'border-brand-600 text-brand-700 font-semibold' : 'border-transparent text-ink-2 hover:text-ink'}`}>{t.label}</button>
        ))}
      </div>
      <div className="grid grid-cols-1 2xl:grid-cols-4 gap-5">
        <div className="2xl:col-span-3 min-w-0">{cur.render()}</div>
        <div className="min-w-0"><OwnerRail owner={owner} /></div>
      </div>
      <div className="mt-6 rounded-lg border border-line bg-slate-50 px-4 py-3 text-xs text-ink-2 flex gap-2"><FlaskConical size={14} className="shrink-0 mt-0.5 text-ink-3" />
        <span><b>About this simulation:</b> all data is synthetic and seeded; tool names are simulated categories only. Forecasts, Monte Carlo ranges, drift scores, NPV and Pareto analysis are genuinely computed on that data. Baselines are the Nov 2025 values; targets are illustrative and agreed by the team.</span>
      </div>
    </>
  )
}

/** Golden-thread timeline, live on the simulation clock. */
export function GoldenThread({ compact = false }: { compact?: boolean }) {
  const { now, reset } = useSimClock()
  const t = threadState(now)
  const head = Math.round(headroomAt(now))
  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <div className="text-sm"><b className="text-ink">Month-end close meets festive peak</b> <span className="text-ink-3">· live cross-team scenario · {t.complete ? 'complete' : `next step in ${t.nextIn}s`}</span></div>
        <div className={`text-xs font-semibold rounded-md border px-2 py-0.5 ${head < 10 ? 'bg-crit-bg text-crit-text border-red-200' : head < 20 ? 'bg-warn-bg text-warn-text border-amber-200' : 'bg-success-bg text-success-text border-green-200'}`}>Shared cluster headroom {head}%</div>
        <button onClick={reset} className="ml-auto inline-flex items-center gap-1 text-xs text-ink-3 border border-line rounded-lg px-2.5 py-1 hover:bg-slate-50"><RotateCcw size={12} />Replay</button>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-4"><div className="h-full bg-brand-600 transition-all" style={{ width: `${t.progress}%` }} /></div>
      <ol className={`grid gap-3 ${compact ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'}`}>
        {t.steps.map((x) => (
          <li key={x.n} className={`rounded-xl border p-3 transition ${x.status === 'active' ? 'border-brand-600 ring-2 ring-brand-100 bg-surface' : x.status === 'done' ? 'border-line bg-surface' : 'border-dashed border-line bg-slate-50 opacity-70'}`}>
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${x.status === 'upcoming' ? 'bg-slate-200 text-ink-3' : 'bg-brand-600 text-white'}`}>{x.n}</span>
              <Link to={x.link} className="text-xs font-semibold text-brand-700 hover:underline">{OWNER[x.owner].name} · {OWNER[x.owner].workspace}</Link>
              <span className="ml-auto text-[10.5px] text-ink-4">{hhmm(x.at).slice(0, 8)}</span>
            </div>
            <div className="font-semibold text-sm text-ink leading-snug">{x.title}</div>
            {(!compact || x.status !== 'upcoming') && <p className="text-xs text-ink-2 mt-1">{x.status === 'upcoming' ? 'Waiting for the previous step…' : x.detail}</p>}
            <div className="text-[10.5px] text-ink-4 mt-1">Simulated · {x.source}</div>
          </li>
        ))}
      </ol>
      {t.complete && <Link to="/decision-center?tab=outcomes" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 mt-3">See outcomes<ArrowRight size={14} /></Link>}
    </div>
  )
}
