// CTO360 Enterprise Command Center (M6) — the home page. All three business units and their sub-levels
// (7 simulated source systems, 16 enterprise functions) on one screen. Every cell drills down.
import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bar as RBar, BarChart, CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Activity, ArrowRight, CircleCheck, Gavel, IndianRupee, OctagonAlert, TriangleAlert } from 'lucide-react'
import { domainOrder, domains } from '../../data/domains'
import type { DomainId } from '../../data/domains'
import { FUNCTIONS, MONTHS, SOURCES, domainHealth, functionHealth, sim, sourceHealth } from '../../data/sim'
import type { Rag } from '../../data/sim'
import { decisionsFor, topDecisions } from '../../data/sim/decisions'
import { buildEvents, liveImpact } from '../../data/sim/events'
import { ragOf as scoreRag } from '../../data/sim/scoring'
import { Card } from '../../components/ui'
import { ScoreRing, Sparkline, StatusPill, ragBg, ragText } from '../../components/sim/primitives'
import { DecisionRow } from '../../components/sim/DecisionCard'
import { useDecisionState } from '../../components/sim/decisionState'
import { TimeRange, useKeepRange, useRange } from '../../components/sim/range'
import { hhmm, useSimClock } from '../../components/sim/clock'
import { axisTick, chart, domainColor } from '../../theme'

const avg = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / (xs.length || 1)
const r1 = (n: number) => Math.round(n * 10) / 10
const name = (d: DomainId) => domains[d].name
const CELL: Record<Rag, string> = { Green: 'bg-success-bg text-success-text', Amber: 'bg-warn-bg text-warn-text', Red: 'bg-crit-bg text-crit-text' }
const ICON = { Green: CircleCheck, Amber: TriangleAlert, Red: OctagonAlert }

export default function CommandCenter() {
  const keep = useKeepRange()
  const nav = useNavigate()
  const range = useRange()
  const { now } = useSimClock()
  const st = useDecisionState()
  const D = domainOrder.map((id) => sim[id])
  const dh = useMemo(() => Object.fromEntries(domainOrder.map((id) => [id, domainHealth(sim[id])])) as Record<DomainId, ReturnType<typeof domainHealth>>, [])
  const events = useMemo(() => Object.fromEntries(domainOrder.map((id) => [id, buildEvents(sim[id])])) as Record<DomainId, ReturnType<typeof buildEvents>>, [])
  const decisions = useMemo(() => D.flatMap(decisionsFor), [D])
  const live = Object.fromEntries(domainOrder.map((id) => [id, liveImpact(events[id], now)])) as Record<DomainId, ReturnType<typeof liveImpact>>

  const entSeries = MONTHS.map((_, k) => Math.round(avg(domainOrder.map((id) => dh[id].series[k]))))
  const liveScore = (id: DomainId) => r1(dh[id].score + live[id].delta)
  const entLive = r1(avg(domainOrder.map(liveScore)))
  const entDelta = r1(entLive - entSeries[12 - range.points])
  const awaiting = decisions.filter((x) => !x.preset && st.statusOf(x) === 'Awaiting decision')
  const risks = D.flatMap((d) => d.risks)
  const inits = D.flatMap((d) => d.initiatives)
  const invested = inits.reduce((s, i) => s + i.budgetCr, 0)
  const realised = inits.reduce((s, i) => s + i.valueRealizedCr, 0)
  const expectedToDate = inits.reduce((s, i) => s + i.expectedValueCr * (i.plannedProgress / 100) * 0.6, 0)
  const freshCrit = domainOrder.reduce((s, id) => s + live[id].crit, 0)
  const freshAll = domainOrder.reduce((s, id) => s + live[id].fresh, 0)

  const trend = MONTHS.slice(12 - range.points).map((m, i) => {
    const k = 12 - range.points + i
    return { m, Enterprise: entSeries[k], ...Object.fromEntries(domainOrder.map((id) => [name(id), dh[id].series[k]])) }
  })
  const money = domainOrder.map((id) => {
    const ins = sim[id].initiatives
    return { d: name(id), Budget: r1(ins.reduce((s, i) => s + i.budgetCr, 0)), Forecast: r1(ins.reduce((s, i) => s + i.forecastCr, 0)), 'Expected value': r1(ins.reduce((s, i) => s + i.expectedValueCr, 0)) }
  })
  const allEvents = domainOrder.flatMap((id) => events[id].map((e) => ({ ...e, domain: id }))).filter((e) => e.at <= now).sort((a, b) => b.at - a.at).slice(0, 8)
  const preset = decisions.filter((x) => x.preset)

  return (
    <>
      {/* Header */}
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-brand-700">CTO360 · Enterprise Command Center</div>
          <h1 className="text-[26px] sm:text-[30px] font-bold text-brand-900 leading-tight">All business units at a glance</h1>
          <p className="text-ink-2 mt-1"><span className="text-ink-3">CTO question · </span>Where should I intervene, across every domain, today?</p>
          <p className="text-xs text-ink-3 mt-1">Simulated enterprise data · no live vendor integrations</p>
        </div>
        <TimeRange />
      </div>

      {/* ① Enterprise + domains */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 mb-3">
        <div className="bg-brand-950 text-white rounded-xl p-4 flex items-center gap-4">
          <div className="bg-white rounded-full p-1"><ScoreRing score={Math.round(entLive)} status={scoreRag(entLive)} size={76} label="Enterprise health" /></div>
          <div className="min-w-0">
            <div className="text-xs text-slate-300">Enterprise health · 3 business units</div>
            <div className="text-sm">Target <b>85</b> · <span className={entDelta >= 0 ? 'text-green-300' : 'text-red-300'}>{entDelta >= 0 ? '▲' : '▼'} {Math.abs(entDelta)}</span> <span className="text-slate-400 text-xs">{range.vs}</span></div>
            <Sparkline data={entSeries.slice(12 - range.points)} target={85} color="#93c5fd" width={130} height={26} />
            <div className="text-[11px] text-slate-300 mt-1">Live since 09:30: {freshAll} events, {freshCrit} critical</div>
          </div>
        </div>
        {domainOrder.map((id) => {
          const h = dh[id]
          const weakest = [...h.functions].sort((a, b) => a.score - b.score)[0]
          const s = liveScore(id)
          const delta = r1(s - h.series[12 - range.points])
          return (
            <Link key={id} to={keep(`/domain/${id}`)} className="bg-surface rounded-xl border border-line p-4 hover:border-brand-600 hover:shadow-sm transition flex items-center gap-3">
              <ScoreRing score={Math.round(s)} status={scoreRag(s)} size={60} label={name(id)} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: domainColor[id] }} aria-hidden /><span className="font-semibold text-ink">{name(id)}</span></div>
                <div className="text-xs text-ink-3 truncate">{sim[id].org}</div>
                <div className="flex items-center gap-2 mt-1"><Sparkline data={h.series.slice(12 - range.points)} target={85} width={80} height={22} /><span className={`text-xs font-semibold ${delta >= 0 ? 'text-success-text' : 'text-crit-text'}`}>{delta >= 0 ? '▲' : '▼'} {Math.abs(delta)}</span></div>
                <div className="text-[11px] text-ink-3 mt-0.5">Weakest: <b className={ragText[weakest.status]}>{weakest.def.name} {weakest.score}</b>{live[id].delta !== 0 && <> · live {live[id].delta > 0 ? '+' : ''}{live[id].delta}</>}</div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
        {[
          { label: 'Decisions awaiting', value: awaiting.length, sub: `${awaiting.filter((x) => x.priority === 'Critical').length} critical · ${awaiting.filter((x) => x.priority === 'High').length} high`, to: '/decision-center', icon: Gavel, tone: 'Amber' as Rag },
          { label: 'Critical + high risks', value: risks.filter((x) => x.severity === 'Critical' || x.severity === 'High').length, sub: `${risks.filter((x) => x.severity === 'Critical').length} critical`, to: '/domain/banking/vanta', icon: OctagonAlert, tone: 'Red' as Rag },
          { label: 'Programmes not on track', value: inits.filter((i) => i.health !== 'Green').length, sub: `${inits.filter((i) => i.health === 'Red').length} off track of ${inits.length}`, to: '/domain/banking/planview', icon: TriangleAlert, tone: 'Amber' as Rag },
          { label: 'Technology investment', value: `₹${Math.round(invested)} Cr`, sub: `forecast ₹${Math.round(inits.reduce((s, i) => s + i.forecastCr, 0))} Cr`, to: '/domain/banking/planview', icon: IndianRupee, tone: 'Green' as Rag },
          { label: 'Value realisation', value: `${Math.round((realised / expectedToDate) * 100)}%`, sub: `₹${Math.round(realised)} Cr realised vs plan to date`, to: '/domain/banking/fn/finance', icon: IndianRupee, tone: scoreRag((realised / expectedToDate) * 100) },
          { label: 'Services below SLO', value: D.reduce((s, d) => s + d.services.filter((x) => x.availability < x.slo).length, 0), sub: `of ${D.reduce((s, d) => s + d.services.length, 0)} critical services`, to: '/domain/banking/datadog', icon: Activity, tone: 'Amber' as Rag },
        ].map((k) => (
          <Link key={k.label} to={keep(k.to)} className="bg-surface rounded-xl border border-line p-3 hover:border-brand-600 transition min-w-0">
            <div className="flex items-start justify-between gap-1"><span className="text-xs font-medium text-ink-2 leading-snug">{k.label}</span><k.icon size={15} className={ragText[k.tone]} aria-hidden /></div>
            <div className="text-[24px] font-bold text-brand-900 leading-tight mt-1 tabular-nums">{k.value}</div>
            <div className="text-[11px] text-ink-3 truncate" title={k.sub}>{k.sub}</div>
          </Link>
        ))}
      </div>

      {/* ② + ③ heatmaps */}
      <div className="grid grid-cols-1 2xl:grid-cols-5 gap-5 mb-6">
        <Card title="7 source systems × 3 domains" className="2xl:col-span-2 min-w-0">
          <p className="text-xs text-ink-3 -mt-2 mb-3">Capability health by simulated source. Click a cell to open that source in that domain.</p>
          <Matrix
            cols={domainOrder.map((id) => ({ id, label: name(id) }))}
            rows={SOURCES.map((s) => ({ id: s.id, label: s.capability, sub: `Simulated · ${s.label}` }))}
            cell={(row, col) => { const x = sourceHealth(sim[col as DomainId]).find((s) => s.id === row)!; return { score: x.score, status: x.status, to: `/domain/${col}/${x.slug}`, title: `${x.capability} · ${name(col as DomainId)}: ${x.score} (${x.red} red records)` } }}
            onOpen={(to) => nav(keep(to))}
          />
        </Card>
        <Card title="16 enterprise functions × 3 domains" className="2xl:col-span-3 min-w-0">
          <p className="text-xs text-ink-3 -mt-2 mb-3">Function health. CTO-owned functions first, then signals the CTO receives from other executives.</p>
          <Matrix
            cols={domainOrder.map((id) => ({ id, label: name(id) }))}
            rows={FUNCTIONS.map((f) => ({ id: f.id, label: f.name, sub: f.cls === 'cto' ? 'CTO-owned' : `Signal · ${f.owner}`, group: f.cls === 'cto' ? 'CTO-owned' : 'Signals to the CTO' }))}
            cell={(row, col) => { const x = functionHealth(sim[col as DomainId], row as (typeof FUNCTIONS)[number]['id']); return { score: x.score, status: x.status, to: `/domain/${col}/fn/${row}`, title: `${x.def.name} · ${name(col as DomainId)}: ${x.score}` } }}
            onOpen={(to) => nav(keep(to))}
            compact
          />
        </Card>
      </div>

      {/* ④ trend + ⑤ decisions */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-6">
        <Card title="Health trend by business unit" className="xl:col-span-2 min-w-0">
          <div className="h-80" role="img" aria-label={`Enterprise health ${entSeries[11]} now; ${domainOrder.map((id) => `${name(id)} ${dh[id].score}`).join(', ')}`}>
            <ResponsiveContainer>
              <LineChart data={trend} margin={{ left: -14, right: 12, top: 6 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} vertical={false} />
                <XAxis dataKey="m" tick={axisTick} /><YAxis tick={axisTick} domain={[(lo: number) => Math.floor((lo - 5) / 5) * 5, 90]} />
                <Tooltip /><Legend wrapperStyle={{ fontSize: 12 }} />
                <ReferenceLine y={85} stroke={chart.comparison} strokeDasharray="4 4" label={{ value: 'Target 85', fontSize: 11, fill: chart.axis, position: 'insideTopRight' }} />
                {domainOrder.map((id) => <Line key={id} isAnimationActive={false} dataKey={name(id)} stroke={domainColor[id]} strokeWidth={2} dot={{ r: 2.5 }} />)}
                <Line isAnimationActive={false} dataKey="Enterprise" stroke={chart.primaryDark} strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Top decisions · all domains" action={<Link to={keep('/decision-center')} className="text-xs font-semibold text-brand-600">Decision Center →</Link>}>
          <div className="space-y-2.5">{topDecisions(decisions, 3).map((x) => <DecisionRow key={x.id} d={x} />)}</div>
        </Card>
      </div>

      {/* ⑥ risk ⑦ money ⑧ operations ⑨ outcomes */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
        <Card title="Enterprise risk heatmap">
          <div className="grid grid-cols-[auto_repeat(5,minmax(0,1fr))] gap-0.5 text-[10px]">
            {[5, 4, 3, 2, 1].map((L) => [
              <div key={`l${L}`} className="text-ink-3 pr-1 flex items-center">L{L}</div>,
              ...[1, 2, 3, 4, 5].map((I) => {
                const n = risks.filter((x) => x.likelihood === L && x.impact === I).length
                const tone: Rag = L * I >= 20 ? 'Red' : L * I >= 12 ? 'Amber' : 'Green'
                return <div key={`${L}${I}`} className={`aspect-square rounded flex items-center justify-center font-bold text-xs ${n ? CELL[tone] : 'bg-slate-50 text-ink-4'}`} title={`Likelihood ${L} × impact ${I}: ${n} risk(s)`}>{n || ''}</div>
              }),
            ])}
            <div />{[1, 2, 3, 4, 5].map((I) => <div key={I} className="text-ink-3 text-center">I{I}</div>)}
          </div>
          <div className="text-xs text-ink-3 mt-2">{risks.length} risks across 3 domains · {domainOrder.map((id) => <Link key={id} to={keep(`/domain/${id}/vanta?tab=heatmap`)} className="text-brand-600 hover:underline mr-2">{name(id)}</Link>)}</div>
        </Card>
        <Card title="Investment & value (₹ Cr)">
          <div className="h-48">
            <ResponsiveContainer>
              <BarChart data={money} margin={{ left: -16, right: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} vertical={false} />
                <XAxis dataKey="d" tick={axisTick} /><YAxis tick={axisTick} /><Tooltip formatter={(v) => `₹${v} Cr`} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <RBar isAnimationActive={false} dataKey="Budget" fill={chart.comparison} radius={[3, 3, 0, 0]} />
                <RBar isAnimationActive={false} dataKey="Forecast" fill={chart.primary} radius={[3, 3, 0, 0]} />
                <RBar isAnimationActive={false} dataKey="Expected value" fill={chart.primaryDark} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Operational health">
          <ul className="space-y-3">{domainOrder.map((id) => {
            const sv = sim[id].services
            const below = sv.filter((x) => x.availability < x.slo).length
            const p1 = sim[id].incidents.filter((x) => x.severity === 'P1').length
            const av = sim[id].metrics.find((m) => m.functionId === 'technology' && m.key === 'avail')!
            return (
              <li key={id}>
                <Link to={keep(`/domain/${id}/datadog`)} className="flex items-center justify-between gap-2 text-sm hover:underline"><span className="font-medium text-ink">{name(id)}</span><StatusPill status={av.status} label={`${av.current}%`} /></Link>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1"><div className="h-full bg-brand-600" style={{ width: `${((sv.length - below) / sv.length) * 100}%` }} /></div>
                <div className="text-[11px] text-ink-3 mt-0.5">{sv.length - below}/{sv.length} services meet SLO · {p1} P1 in 90 days</div>
              </li>
            )
          })}</ul>
        </Card>
        <Card title="Business outcomes">
          <ul className="space-y-2.5">{preset.slice(0, 6).map((x) => (
            <li key={x.id} className="text-sm">
              <Link to={keep(`/domain/${x.domain}/decisions?tab=outcomes`)} className="font-medium text-ink hover:underline">{name(x.domain)} · {x.title}</Link>
              <div className="flex flex-wrap gap-1 mt-1">{x.preset!.outcomes.map((o) => <span key={o.metric.id} className={`text-[10.5px] rounded px-1.5 py-0.5 border ${o.status === 'Behind' ? ragBg.Red + ' ' + ragText.Red : o.status === 'On track' ? ragBg.Amber + ' ' + ragText.Amber : ragBg.Green + ' ' + ragText.Green}`}>{o.metric.name}: {o.baseline} → {o.current} ({o.status})</span>)}</div>
            </li>
          ))}</ul>
        </Card>
      </div>

      {/* ⑩ live events */}
      <Card title="Live source events · all domains" action={<Link to={keep('/sources')} className="text-xs font-semibold text-brand-600 inline-flex items-center gap-1">Data sources<ArrowRight size={13} /></Link>}>
        <ul className="text-[13px] divide-y divide-line">{allEvents.map((e) => (
          <li key={e.id} className="py-1.5 flex items-center gap-2 min-w-0">
            <span className="text-[11px] text-ink-4 tabular-nums w-12 shrink-0">{hhmm(e.at).slice(0, 5)}</span>
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${e.tone === 'crit' ? 'bg-crit' : e.tone === 'warn' ? 'bg-warn' : e.tone === 'ok' ? 'bg-ok' : 'bg-brand-600'}`} aria-hidden />
            <span className="text-[11px] font-semibold w-24 shrink-0 truncate" style={{ color: domainColor[e.domain] }}>{name(e.domain)}</span>
            <Link to={`/domain/${e.domain}/record/${e.recordId}`} className="flex-1 min-w-0 truncate text-ink-2 hover:underline" title={e.text}>{e.text}</Link>
            <span className="text-[10px] text-ink-4 shrink-0 hidden sm:inline">{SOURCES.find((s) => s.id === e.source)!.label}</span>
          </li>
        ))}</ul>
      </Card>

      <p className="text-xs text-ink-3 mt-4">Previous home page: <Link to="/overview" className="text-brand-600 font-semibold hover:underline">Programme overview (TEDIF)</Link></p>
    </>
  )
}

export function Matrix({ rows, cols, cell, onOpen, compact = false }: {
  rows: { id: string; label: string; sub?: string; group?: string }[]; cols: { id: string; label: string }[]
  cell: (row: string, col: string) => { score: number; status: Rag; to: string; title: string }; onOpen: (to: string) => void; compact?: boolean
}) {
  let lastGroup = ''
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[420px] border-separate border-spacing-y-1 table-fixed">
        <colgroup><col className="w-[46%]" />{cols.map((c) => <col key={c.id} />)}</colgroup>
        <thead><tr className="text-[11px] uppercase tracking-wide text-ink-3"><th className="text-left font-semibold pl-1">{compact ? 'Function' : 'Source system'}</th>{cols.map((c) => <th key={c.id} className="font-semibold text-center">{c.label}</th>)}</tr></thead>
        <tbody>{rows.flatMap((r) => {
          const out = []
          if (r.group && r.group !== lastGroup) { lastGroup = r.group; out.push(<tr key={`g-${r.group}`}><td colSpan={cols.length + 1} className="pt-1.5 pl-1 text-[11px] font-semibold uppercase tracking-wide text-brand-700">{r.group}</td></tr>) }
          out.push(
            <tr key={r.id}>
              <td className="pl-1 pr-2 py-0.5"><div className={`font-medium text-ink leading-tight ${compact ? 'text-[13px]' : ''} truncate`}>{r.label}</div>{r.sub && <div className="text-[10.5px] text-ink-3 truncate">{r.sub}</div>}</td>
              {cols.map((c) => {
                const x = cell(r.id, c.id)
                const I = ICON[x.status]
                return (
                  <td key={c.id} className="px-0.5">
                    <button onClick={() => onOpen(x.to)} title={x.title} className={`w-full rounded-md py-1.5 text-xs font-semibold tabular-nums hover:ring-2 hover:ring-brand-600 ${CELL[x.status]}`}>
                      <I size={11} className="inline -mt-0.5 mr-0.5" aria-hidden />{x.score}
                    </button>
                  </td>
                )
              })}
            </tr>,
          )
          return out
        })}</tbody>
      </table>
    </div>
  )
}
