// Ram · CTO Control Tower — workspace tabs (multi-domain, agents & correlation, golden thread, programmes).
import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bar as RBar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ArrowRight, Bot, GitMerge, Gavel } from 'lucide-react'
import { domainOrder, domains } from '../../data/domains'
import type { DomainId } from '../../data/domains'
import { FUNCTIONS, SOURCES, functionHealth, sim, sourceHealth } from '../../data/sim'
import type { SourceId } from '../../data/sim'
import { decisionsFor } from '../../data/sim/decisions'
import { buildEvents } from '../../data/sim/events'
import { Card } from '../../components/ui'
import { useSimClock, hhmm } from '../../components/sim/clock'
import { useDecisionState } from '../../components/sim/decisionState'
import { GoldenThread } from '../../components/team/workspace'
import { Matrix } from '../sim/CommandCenter'
import { axisTick, chart } from '../../theme'

const name = (d: DomainId) => domains[d].name

export function MultiDomainTab() {
  const nav = useNavigate()
  return (
    <div className="space-y-5">
      <Card title="7 source systems × 3 business units"><Matrix cols={domainOrder.map((id) => ({ id, label: name(id) }))} rows={SOURCES.map((s) => ({ id: s.id, label: s.capability, sub: `Simulated · ${s.label}` }))}
        cell={(row, col) => { const x = sourceHealth(sim[col as DomainId]).find((s) => s.id === row)!; return { score: x.score, status: x.status, to: `/domain/${col}/${x.slug}`, title: `${x.capability}: ${x.score}` } }} onOpen={nav} /></Card>
      <Card title="16 enterprise functions × 3 business units"><Matrix compact cols={domainOrder.map((id) => ({ id, label: name(id) }))} rows={FUNCTIONS.map((f) => ({ id: f.id, label: f.name, sub: f.cls === 'cto' ? 'CTO-owned' : `Signal · ${f.owner}`, group: f.cls === 'cto' ? 'CTO-owned' : 'Signals to the CTO' }))}
        cell={(row, col) => { const x = functionHealth(sim[col as DomainId], row as (typeof FUNCTIONS)[number]['id']); return { score: x.score, status: x.status, to: `/domain/${col}/fn/${row}`, title: `${x.def.name}: ${x.score}` } }} onOpen={nav} /></Card>
      <Link to="/" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600">Open the full Command Center<ArrowRight size={14} /></Link>
    </div>
  )
}

const AGENTS: { name: string; watches: Exclude<SourceId, 'business'>[]; role: string }[] = [
  { name: 'Delivery agent', watches: ['planview', 'servicenow', 'jellyfish'], role: 'Schedule slips, budget drift, capacity gaps' },
  { name: 'Reliability agent', watches: ['datadog'], role: 'SLO breaches, incident trends, latency' },
  { name: 'Architecture agent', watches: ['leanix'], role: 'End-of-life technology, legacy dependencies' },
  { name: 'Process agent', watches: ['process'], role: 'Cycle-time and exception spikes' },
  { name: 'Risk & compliance agent', watches: ['vanta'], role: 'Failing controls, ageing risks' },
]

export function AgentsTab() {
  const { now } = useSimClock()
  const st = useDecisionState()
  const events = useMemo(() => domainOrder.flatMap((id) => buildEvents(sim[id]).map((e) => ({ ...e, domain: id }))), [])
  const decisions = useMemo(() => domainOrder.flatMap((id) => decisionsFor(sim[id])).filter((d) => !d.preset), [])
  const released = events.filter((e) => e.at <= now)
  const signals = released.filter((e) => e.tone === 'crit' || e.tone === 'warn')
  const decided = decisions.filter((d) => st.statusOf(d) !== 'Awaiting decision')
  const approved = decisions.filter((d) => st.statusOf(d) === 'Approved')
  const byPri = ['Critical', 'High', 'Medium', 'Low'].map((p) => ({ p, n: decisions.filter((d) => d.priority === p).length }))
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_auto_1fr_auto_1fr] gap-3 items-stretch">
        <Card title="Simulated agents">
          <ul className="space-y-2">{AGENTS.map((a) => {
            const mine = signals.filter((e) => a.watches.includes(e.source))
            return (
              <li key={a.name} className="flex items-start gap-2 text-sm">
                <Bot size={16} className="text-brand-600 mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1"><div className="font-medium text-ink">{a.name} <span className="text-xs text-ink-3">· {mine.length} signals</span></div><div className="text-[11px] text-ink-3">{a.role} · watches {a.watches.map((w) => SOURCES.find((s) => s.id === w)!.label).join(', ')}</div></div>
              </li>
            )
          })}</ul>
        </Card>
        <ArrowRight className="hidden lg:block self-center text-ink-4" />
        <Card title="Correlation engine">
          <div className="flex items-center gap-2 text-sm"><GitMerge size={18} className="text-brand-600" /><b className="text-2xl text-brand-900">{signals.length}</b> signals in 3 h</div>
          <p className="text-xs text-ink-3 mt-1">Joined by shared record IDs (initiative → app → project → team → service → control) and time window.</p>
          <div className="mt-3 text-sm"><b className="text-brand-900 text-xl">{decisions.length}</b> decisions raised · avg {Math.round((decisions.reduce((s, d) => s + d.signals.length, 0) / decisions.length) * 10) / 10} signals each</div>
        </Card>
        <ArrowRight className="hidden lg:block self-center text-ink-4" />
        <Card title="Human decisions (TEDIF)">
          <div className="flex items-center gap-2 text-sm"><Gavel size={18} className="text-brand-600" /><b className="text-2xl text-brand-900">{decided.length}</b> of {decisions.length} decided</div>
          <div className="text-xs text-ink-3 mt-1">{approved.length} approved · approval rate {decided.length ? Math.round((approved.length / decided.length) * 100) : 0}% · AI never executes on its own</div>
          <ul className="mt-3 space-y-1">{byPri.map((x) => <li key={x.p} className="flex items-center gap-2 text-xs"><span className="w-14 text-ink-2">{x.p}</span><div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-brand-600" style={{ width: `${(x.n / decisions.length) * 100}%` }} /></div><span className="w-5 text-right">{x.n}</span></li>)}</ul>
          <Link to="/decision-center" className="text-xs font-semibold text-brand-600 mt-3 inline-block">Decision Center →</Link>
        </Card>
      </div>
      <Card title="Latest agent signals">
        <ul className="text-[13px] divide-y divide-line">{signals.sort((a, b) => b.at - a.at).slice(0, 8).map((e) => (
          <li key={e.id} className="py-1.5 flex gap-2 min-w-0"><span className="text-ink-4 tabular-nums shrink-0 w-12">{hhmm(e.at).slice(0, 5)}</span><span className="text-[11px] font-semibold w-24 shrink-0 truncate text-brand-700">{AGENTS.find((a) => a.watches.includes(e.source))?.name}</span><Link to={`/domain/${e.domain}/record/${e.recordId}`} className="truncate text-ink-2 hover:underline" title={e.text}>{name(e.domain)} · {e.text}</Link></li>
        ))}</ul>
      </Card>
    </div>
  )
}

export function ThreadTab() {
  return <Card title="Golden thread · one problem, five owners, one decision"><GoldenThread /></Card>
}

export function ProgrammesTab() {
  const data = domainOrder.map((id) => {
    const ins = sim[id].initiatives
    return { d: name(id), 'On track': ins.filter((i) => i.health === 'Green').length, 'At risk': ins.filter((i) => i.health === 'Amber').length, 'Off track': ins.filter((i) => i.health === 'Red').length }
  })
  const off = domainOrder.flatMap((id) => sim[id].initiatives.filter((i) => i.health !== 'Green').map((i) => ({ i, id })))
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
      <Card title="Initiatives by status and business unit">
        <div className="h-56">
          <ResponsiveContainer>
            <BarChart data={data} margin={{ left: -20, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} vertical={false} />
              <XAxis dataKey="d" tick={axisTick} /><YAxis tick={axisTick} allowDecimals={false} /><Tooltip /><Legend wrapperStyle={{ fontSize: 12 }} />
              <RBar isAnimationActive={false} dataKey="On track" stackId="a" fill={chart.primary} />
              <RBar isAnimationActive={false} dataKey="At risk" stackId="a" fill={chart.comparison} />
              <RBar isAnimationActive={false} dataKey="Off track" stackId="a" fill={chart.primaryDark} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <Link to="/tracker" className="text-xs font-semibold text-brand-600">CTO → developer cascade (programme tracker) →</Link>
      </Card>
      <Card title={`Not on track (${off.length})`}>
        <ul className="divide-y divide-line text-sm">{off.map(({ i, id }) => (
          <li key={i.id} className="py-2"><Link to={`/domain/${id}/record/${i.id}`} className="font-medium text-ink hover:underline">{i.name}</Link><div className="text-xs text-ink-3">{name(id)} · {i.progress}% vs {i.plannedProgress}% plan · {i.why.join('; ')}</div></li>
        ))}</ul>
      </Card>
    </div>
  )
}
