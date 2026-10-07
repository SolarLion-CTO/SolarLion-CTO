// Pankaj · ERP RCA & Capacity — ERP RCA, Capacity & forecasting, Peak scenarios, Production automation.
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bar as RBar, CartesianGrid, ComposedChart, Line, LineChart, ReferenceDot, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { CircleCheck, Circle, Gauge } from 'lucide-react'
import { domainOrder, domains } from '../../data/domains'
import type { DomainId } from '../../data/domains'
import { FORECAST_MONTHS, MONTHS, sim } from '../../data/sim'
import { AUTOMATION_STEPS, FIVE_WHYS, RESOURCES, SCENARIOS, capacity, changeCorrelation, erpIncidents, errorBudgets, liveUtil, problems, rootCauses, runScenario } from '../../data/sim/ops'
import type { CapRow } from '../../data/sim/ops'
import { queueLatency } from '../../data/sim/analytics'
import { headroomAt } from '../../data/sim/scenario'
import { OWNER, measureState } from '../../data/sim/team'
import { Card } from '../../components/ui'
import { StatusPill } from '../../components/sim/primitives'
import { useSimClock } from '../../components/sim/clock'
import { axisTick, chart } from '../../theme'

const dn = (d: DomainId) => domains[d].name
type DF = DomainId | 'all'
function Filter({ v, on }: { v: DF; on: (d: DF) => void }) {
  return <div className="inline-flex rounded-lg border border-slate-300 bg-white overflow-hidden text-[13px] mb-4">{(['all', ...domainOrder] as DF[]).map((x) => <button key={x} onClick={() => on(x)} aria-pressed={v === x} className={`px-3 py-1.5 ${v === x ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-ink-2 hover:bg-slate-50'}`}>{x === 'all' ? 'All units' : dn(x)}</button>)}</div>
}
const utilCls = (u: number) => (u >= 80 ? 'bg-crit-bg text-crit-text' : u >= 65 ? 'bg-warn-bg text-warn-text' : 'bg-success-bg text-success-text')

// ── 1. ERP RCA ───────────────────────────────────────────────────────
export function ErpRcaTab() {
  const [d, setD] = useState<DF>('all')
  const pr = problems.filter((p) => d === 'all' || p.d === d)
  const rc = rootCauses()
  const cc = changeCorrelation()
  const avail = measureState(OWNER.pankaj.measures.find((m) => m.id === 'pan-avail')!)
  const inc = erpIncidents().filter((i) => d === 'all' || i.d === d).sort((a, b) => b.start.localeCompare(a.start))
  const eb = errorBudgets().filter((x) => d === 'all' || x.d === d)
  const svcName = (dd: DomainId, id: string) => sim[dd].services.find((s) => s.id === id)?.name ?? id
  return (
    <>
      <Filter v={d} on={setD} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          ['ERP availability (peak windows)', `${avail.current}%`, `target ${avail.target}%`],
          ['Recurring problems open', `${pr.filter((p) => p.incidents >= 3 && p.status !== 'Closed').length}`, `${pr.length} problem records`],
          ['Incidents within 24 h of a change', `${cc.pct}%`, `${cc.withChange} of ${cc.total} incidents (all services, 90 days)`],
          ['Median problem age', `${pr.map((p) => p.ageDays).sort((a, b) => a - b)[Math.floor(pr.length / 2)]} days`, 'time to permanent fix target 10 days'],
        ].map(([l, v, s]) => <div key={l} className="bg-surface rounded-xl border border-line p-3.5"><div className="text-xs text-ink-2">{l}</div><div className="text-[24px] font-bold text-brand-900 leading-tight tabular-nums">{v}</div><div className="text-[11px] text-ink-3">{s}</div></div>)}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-5">
        <Card title="Root-cause Pareto · ERP incidents, 12 months">
          <div className="h-72" role="img" aria-label={`Top causes: ${rc.slice(0, 3).map((x) => `${x.cause} ${x.count}`).join(', ')}`}>
            <ResponsiveContainer>
              <ComposedChart data={rc.map((x) => ({ ...x, short: x.cause.split(' ').slice(0, 2).join(' ') }))} margin={{ left: -12, right: 8, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} vertical={false} />
                <XAxis dataKey="short" tick={{ ...axisTick, fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={50} />
                <YAxis yAxisId="c" tick={axisTick} /><YAxis yAxisId="p" orientation="right" domain={[0, 100]} hide />
                <Tooltip formatter={(v, n) => (n === 'Cumulative %' ? `${v}%` : v)} />
                <RBar yAxisId="c" isAnimationActive={false} dataKey="count" name="Incidents" fill={chart.primary} radius={[4, 4, 0, 0]} />
                <Line yAxisId="p" isAnimationActive={false} dataKey="cumPct" name="Cumulative %" stroke={chart.primaryDark} strokeWidth={2} dot={{ r: 3 }} />
                <ReferenceLine yAxisId="p" y={80} stroke={chart.comparison} strokeDasharray="4 4" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-ink-3">The top 3 causes account for {rc[2].cumPct}% of ERP incidents — fix these first (Pareto 80/20). Cumulative line uses a hidden 0–100% axis; dashed line = 80%.</p>
        </Card>
        <Card title="5-Whys · top problem">
          <div className="text-sm font-semibold text-ink mb-2">{FIVE_WHYS.problem}</div>
          <ol className="space-y-1.5 text-sm">{FIVE_WHYS.whys.map((w, i) => <li key={i} className="flex gap-2"><span className="w-6 h-6 shrink-0 rounded-full bg-brand-50 text-brand-700 text-xs font-bold flex items-center justify-center">{i + 1}</span><span className="text-ink-2">{w}</span></li>)}</ol>
          <div className="rounded-lg bg-brand-50 border border-brand-100 p-3 mt-3 text-sm"><b className="text-brand-900">Root cause:</b> {FIVE_WHYS.root}<br /><b className="text-brand-900">Permanent fix:</b> {FIVE_WHYS.fix}</div>
        </Card>
      </div>
      <Card title="Problem records (incident → problem → known error → change)" className="mb-5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[980px] [&_th]:px-2 [&_td]:px-2">
            <thead><tr className="text-[11px] uppercase tracking-wide text-ink-3 border-b border-line text-left"><th className="py-2">Problem</th><th>Service</th><th>Root cause</th><th className="text-right">Incidents (12 m)</th><th>Status</th><th className="text-right">Age</th><th>Permanent fix</th><th>Change</th></tr></thead>
            <tbody>{pr.sort((a, b) => b.incidents - a.incidents).map((p) => (
              <tr key={p.id} className="border-b border-line last:border-0 align-top">
                <td className="py-1.5"><div className="font-medium text-ink">{p.title}</div><div className="text-[11px] text-ink-3">{p.id} · {dn(p.d)} · {p.owner}</div></td>
                <td className="text-xs"><Link to={`/domain/${p.d}/record/${p.serviceId}`} className="text-brand-700 hover:underline">{svcName(p.d, p.serviceId)}</Link></td>
                <td className="text-xs">{p.cause}</td>
                <td className={`text-right tabular-nums ${p.incidents >= 3 && p.status !== 'Closed' ? 'font-semibold text-crit-text' : ''}`}>{p.incidents}</td>
                <td><StatusPill status={p.status === 'Closed' ? 'Green' : p.status === 'Fix in progress' ? 'Amber' : 'Red'} label={p.status} /></td>
                <td className="text-right tabular-nums text-xs">{p.ageDays} d</td>
                <td className="text-xs text-ink-2 max-w-[240px]">{p.fix}</td>
                <td className="text-xs text-ink-3">{p.change ?? '—'}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </Card>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <Card title="Error budgets · ERP services (30 days)">
          <ul className="space-y-3">{eb.map((x) => (
            <li key={x.s.id}>
              <div className="flex justify-between text-sm"><Link to={`/domain/${x.d}/record/${x.s.id}`} className="font-medium text-ink hover:underline">{x.s.name} <span className="text-xs text-ink-3">· {dn(x.d)}</span></Link><span className={`font-semibold ${x.remainingPct < 25 ? 'text-crit-text' : x.remainingPct < 60 ? 'text-warn-text' : 'text-success-text'}`}>{x.remainingPct}% left</span></div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden mt-1"><div className={`h-full ${x.remainingPct < 25 ? 'bg-crit' : x.remainingPct < 60 ? 'bg-warn' : 'bg-ok'}`} style={{ width: `${x.remainingPct}%` }} /></div>
              <div className="text-[11px] text-ink-3">SLO {x.s.slo}% · budget {x.budgetMin} min · used {x.burnedMin} min · burn rate {x.burnRate}×</div>
            </li>
          ))}</ul>
          <p className="text-xs text-ink-3 mt-2">SRE practice: when the budget is spent, freeze risky changes and spend effort on reliability.</p>
        </Card>
        <Card title={`ERP incidents · last 90 days (${inc.length})`}>
          <ul className="divide-y divide-line text-sm">{inc.slice(0, 8).map((i) => (
            <li key={i.id} className="py-1.5 flex flex-wrap gap-x-3"><Link to={`/domain/${i.d}/record/${i.id}`} className="font-semibold text-brand-700 hover:underline">{i.id}</Link><span className={i.severity === 'P1' ? 'text-crit-text font-semibold' : i.severity === 'P2' ? 'text-warn-text' : 'text-ink-3'}>{i.severity}</span><span className="text-ink-3 text-xs">{i.start.slice(0, 10)}</span><span className="flex-1 min-w-0 text-ink-2">{i.rootCause}{i.relatedChange ? ` · after ${i.relatedChange}` : ''}</span></li>
          ))}</ul>
        </Card>
      </div>
    </>
  )
}

// ── 2. Capacity & forecasting ────────────────────────────────────────
export function CapacityTab() {
  const [d, setD] = useState<DF>('all')
  const { now } = useSimClock()
  const rows = useMemo(() => capacity(), [])
  const vis = rows.filter((r) => d === 'all' || r.d === d)
  const hottest = [...vis].sort((a, b) => b.current - a.current).slice(0, 5)
  const [sel, setSel] = useState<string>(hottest[0] ? `${hottest[0].serviceId}|${hottest[0].res}` : '')
  const cur: CapRow = vis.find((r) => `${r.serviceId}|${r.res}` === sel) ?? hottest[0]
  const services = [...new Map(vis.map((r) => [r.serviceId, r])).values()]
  const head = Math.round(headroomAt(now))
  const data = [...MONTHS.map((m, k) => ({ m, Actual: cur.series[k] })), ...cur.forecast.map((v, i) => ({ m: (i < 3 ? FORECAST_MONTHS[i] : ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'][i - 3]) + '*', Forecast: v }))]
  return (
    <>
      <Filter v={d} on={setD} />
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-5">
        <div className={`rounded-xl border p-3 ${head < 10 ? 'border-red-200 bg-crit-bg' : head < 20 ? 'border-amber-200 bg-warn-bg' : 'border-green-200 bg-success-bg'}`}>
          <div className="text-xs text-ink-2 flex items-center gap-1"><Gauge size={13} />Shared ERP / order cluster</div><div className="text-[26px] font-bold text-ink tabular-nums">{100 - head}%</div><div className="text-[11px] text-ink-3">headroom {head}% · golden thread (live)</div>
        </div>
        {hottest.map((r, k) => { const u = liveUtil(r, now, k); return (
          <button key={r.serviceId + r.res} onClick={() => setSel(`${r.serviceId}|${r.res}`)} className={`text-left rounded-xl border p-3 ${utilCls(u)} ${sel === `${r.serviceId}|${r.res}` ? 'ring-2 ring-brand-600' : ''}`}>
            <div className="text-xs text-ink-2 truncate" title={r.name}>{r.name} · {r.res}</div><div className="text-[26px] font-bold tabular-nums">{u}%</div><div className="text-[11px] text-ink-3">{dn(r.d)} · 80% in {r.breach80 ?? '9+'} mo</div>
          </button>
        ) })}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
        <Card title={`Forecast to breach · ${cur.name} · ${cur.res}`} className="xl:col-span-3 min-w-0">
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={data} margin={{ left: -12, right: 12, top: 6 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} vertical={false} />
                <XAxis dataKey="m" tick={axisTick} interval={1} /><YAxis tick={axisTick} domain={[0, 120]} /><Tooltip formatter={(v) => `${v}%`} />
                <ReferenceLine y={80} stroke="#d97706" strokeDasharray="4 4" label={{ value: '80% warning', fontSize: 10, fill: chart.axis, position: 'insideTopLeft' }} />
                <ReferenceLine y={95} stroke="#dc2626" strokeDasharray="4 4" label={{ value: '95% saturation', fontSize: 10, fill: chart.axis, position: 'insideTopLeft' }} />
                <Line isAnimationActive={false} dataKey="Actual" stroke={chart.primary} strokeWidth={2.5} dot={{ r: 2.5 }} />
                <Line isAnimationActive={false} dataKey="Forecast" stroke={chart.primaryDark} strokeWidth={2} strokeDasharray="6 4" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-sm text-ink-2"><b>{cur.breach80 ? `Crosses 80% in ~${cur.breach80} month(s)` : 'Stays below 80% for 9 months'}</b>{cur.breach95 ? `, saturates (95%) in ~${cur.breach95} months` : ''}. Add capacity before then. <span className="text-xs text-ink-3">Forecast: Holt's double exponential smoothing on monthly peak utilisation.</span></p>
        </Card>
        <Card title="Headroom heatmap · peak utilisation %" className="xl:col-span-2 min-w-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-separate border-spacing-0.5 min-w-[360px]">
              <thead><tr className="text-[10px] uppercase text-ink-3"><th className="text-left font-semibold">Service</th>{RESOURCES.map((r) => <th key={r} className="font-semibold">{r}</th>)}</tr></thead>
              <tbody>{services.map((s) => (
                <tr key={s.serviceId}><td className="pr-1 py-0.5 text-ink truncate max-w-[9rem]" title={`${s.name} · ${dn(s.d)}`}>{s.name}</td>{RESOURCES.map((res) => { const r = vis.find((x) => x.serviceId === s.serviceId && x.res === res)!; return <td key={res}><button onClick={() => setSel(`${r.serviceId}|${r.res}`)} className={`w-full rounded py-1 font-semibold tabular-nums ${utilCls(r.current)}`}>{Math.round(r.current)}</button></td> })}</tr>
              ))}</tbody>
            </table>
          </div>
          <p className="text-xs text-ink-3 mt-2">≥ 80% red, 65–80% amber. Click a cell to forecast it.</p>
        </Card>
      </div>
    </>
  )
}

// ── 3. Peak scenarios (what-if) ──────────────────────────────────────
export function PeakTab() {
  const [scale, setScale] = useState<Record<string, number>>({ 'month-end': 0, 'salary-day': 0, festive: 0 })
  const curve = Array.from({ length: 14 }, (_, i) => { const u = 0.3 + i * 0.05; return { u: Math.round(u * 100), ms: Math.min(3000, queueLatency(u, 150)) } })
  return (
    <>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-5">{SCENARIOS.map((s) => {
        const pct = scale[s.id]
        const r = runScenario(s, pct)
        const minOk = [0, 5, 10, 15, 20, 25, 30, 35, 40, 50, 60, 75, 100].find((x) => runScenario(s, x).ok)
        return (
          <Card key={s.id} title={`${s.label} · ${dn(s.d)}`}>
            <div className="text-xs text-ink-3 -mt-2 mb-3">{s.when} · demand × {s.mult}</div>
            <label className="block text-sm">Extra capacity (scale-out): <b>{pct}%</b>
              <input type="range" min={0} max={100} step={5} value={pct} onChange={(e) => setScale((x) => ({ ...x, [s.id]: Number(e.target.value) }))} className="w-full accent-brand-600 mt-1" aria-label={`Scale-out for ${s.label}`} />
            </label>
            <dl className="grid grid-cols-3 gap-2 mt-3 text-center">
              <div className={`rounded-lg p-2 ${utilCls(r.util)}`}><dt className="text-[10px]">Peak utilisation</dt><dd className="text-lg font-bold tabular-nums">{r.util}%</dd></div>
              <div className={`rounded-lg p-2 ${r.ok ? 'bg-success-bg text-success-text' : 'bg-crit-bg text-crit-text'}`}><dt className="text-[10px]">Response time</dt><dd className="text-lg font-bold tabular-nums">{r.latency === Infinity ? '∞' : `${r.latency} ms`}</dd></div>
              <div className="rounded-lg p-2 bg-slate-50 text-ink"><dt className="text-[10px]">Cost (6 weeks)</dt><dd className="text-lg font-bold tabular-nums">₹{r.costCr} Cr</dd></div>
            </dl>
            <p className="text-xs text-ink-2 mt-2">Target ≤ {s.targetMs} ms. {minOk !== undefined ? <>Minimum scale-out to meet it: <b>{minOk}%</b> (₹{runScenario(s, minOk).costCr} Cr).</> : 'Needs re-architecture, not just capacity.'}</p>
          </Card>
        )
      })}</div>
      <Card title="Why peaks hurt: response time vs utilisation (M/M/1 queue)">
        <div className="h-56">
          <ResponsiveContainer>
            <LineChart data={curve} margin={{ left: -6, right: 12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} vertical={false} />
              <XAxis dataKey="u" tick={axisTick} unit="%" /><YAxis tick={axisTick} unit=" ms" width={60} /><Tooltip formatter={(v) => `${v} ms`} />
              <Line isAnimationActive={false} dataKey="ms" name="Response time" stroke={chart.primary} strokeWidth={2.5} dot={false} />
              {SCENARIOS.map((s) => { const r = runScenario(s, scale[s.id]); const x = Math.round(r.util / 5) * 5; return r.util >= 30 && r.util <= 95 ? <ReferenceDot key={s.id} x={x} y={Math.min(3000, queueLatency(x / 100, 150))} r={5} fill={chart.primaryDark} stroke="white" /> : null })}
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-ink-3">Response time = service time ÷ (1 − utilisation). Above ~80% it rises steeply — the reason capacity must be added before the peak, not during it. Dots = current scenario settings.</p>
      </Card>
    </>
  )
}

// ── 4. Production automation (Manufacturing) ─────────────────────────
export function ProductionTab() {
  const m = sim.manufacturing
  const procs = m.processes.filter((p) => /Plan to Produce|Maintenance|Quality/.test(p.name))
  const auto = measureState(OWNER.pankaj.measures.find((x) => x.id === 'pan-auto')!)
  const done = AUTOMATION_STEPS.filter((s) => s.at(2)).length
  const story = m.stories.find((s) => /MES/.test(s.title))!
  return (
    <>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-5">
        <Card title="Automation progress">
          <div className="text-3xl font-bold text-brand-900">{auto.current}%</div>
          <div className="text-sm text-ink-2">of production steps run without manual hand-off · from {auto.baseline}% → target {auto.target}%</div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden mt-2"><div className="h-full bg-brand-600" style={{ width: `${auto.progress}%` }} /></div>
          <div className="text-xs text-ink-3 mt-1">{auto.progress}% of the gap closed · {auto.glide}</div>
          <Link to={`/domain/manufacturing/record/${story.initiativeId}`} className="text-xs font-semibold text-brand-600 mt-3 inline-block">MES Reliability story →</Link>
        </Card>
        <Card title="Production processes · Manufacturing" className="xl:col-span-2">
          <ul className="divide-y divide-line">{procs.map((p) => (
            <li key={p.id} className="py-2 grid grid-cols-1 md:grid-cols-[1fr_10rem_6rem_7rem] gap-2 items-center text-sm">
              <Link to={`/domain/manufacturing/record/${p.id}`} className="font-medium text-ink hover:underline">{p.name}<span className="block text-[11px] text-ink-3 font-normal">{p.bottleneck}</span></Link>
              <span className="text-xs">Cycle {p.cycleTime} {p.unit} vs {p.targetCycleTime} {p.unit}</span>
              <span className="text-xs">Automation {p.automationRate}%</span>
              <StatusPill status={p.health} why={p.why} />
            </li>
          ))}</ul>
        </Card>
      </div>
      <Card title="Lewin change model · production automation" className="mb-5">
        <ol className="grid grid-cols-1 md:grid-cols-3 gap-3">{[
          ['Unfreeze', 'done', 'Case for change: 6-hour line stops, manual schedule hand-offs, 2 P1s on MES plants 1–4'],
          ['Change', 'now', `MES 9 upgrade, closed-loop scheduling, predictive maintenance — ${done} of ${AUTOMATION_STEPS.length} key steps automated`],
          ['Refreeze', 'next', 'Standard work, automation KPIs in plant reviews, capacity gate in the change process'],
        ].map(([k, st, v]) => <li key={k} className={`rounded-lg border p-3 ${st === 'now' ? 'border-brand-600 ring-2 ring-brand-100' : st === 'done' ? 'border-green-200 bg-success-bg' : 'border-line bg-slate-50'}`}><div className="text-xs font-semibold text-ink">{k} {st === 'done' ? '✓' : st === 'now' ? '· in progress' : '· next'}</div><div className="text-xs text-ink-2 mt-0.5">{v}</div></li>)}</ol>
      </Card>
      <Card title={`Key automation steps · ${done} of ${AUTOMATION_STEPS.length} automated`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{['Plan to Produce', 'Maintenance', 'Quality'].map((area) => (
          <div key={area}>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-3 mb-2">{area}</div>
            <ul className="space-y-1.5">{AUTOMATION_STEPS.filter((s) => s[0] === area).map(([, step, isDone, when]) => (
              <li key={step} className="flex items-start gap-2 text-sm">{isDone ? <CircleCheck size={15} className="text-success-text mt-0.5 shrink-0" /> : <Circle size={15} className="text-ink-4 mt-0.5 shrink-0" />}<span className={isDone ? 'text-ink' : 'text-ink-2'}>{step}<span className="block text-[11px] text-ink-3">{when}</span></span></li>
            ))}</ul>
          </div>
        ))}</div>
        <p className="text-xs text-ink-3 mt-3">Key steps shown; the {auto.current}% measure covers all plan-to-produce, maintenance and quality steps. Closed loop to MES on plants 1–4 depends on the MES 9 upgrade (MES Reliability decision).</p>
      </Card>
    </>
  )
}
