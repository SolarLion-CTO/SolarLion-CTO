// Function view (first version, built with M3 so heatmap clicks always land somewhere useful).
// M4 deepens this template: impact panel, open issues, initiatives, dependencies.
import { Link, useParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { FUNCTIONS, SOURCES, functionHealth } from '../../data/sim'
import type { DomainData, FunctionId, Rag } from '../../data/sim'
import { Card } from '../../components/ui'
import { MetricCard, ScoreRing, StatusPill } from '../../components/sim/primitives'
import { TrendChart } from '../../components/sim/charts'
import { useKeepRange } from '../../components/sim/range'
import { NotFound, RecLink, SimHeader, useSimDomain } from './common'

export default function FunctionPage() {
  const d = useSimDomain()
  const { fn } = useParams()
  const keep = useKeepRange()
  const i = FUNCTIONS.findIndex((f) => f.id === fn)
  if (!d || i < 0) return <NotFound />
  const f = FUNCTIONS[i]
  const h = functionHealth(d, f.id as FunctionId)
  const prev = FUNCTIONS[(i + FUNCTIONS.length - 1) % FUNCTIONS.length], next = FUNCTIONS[(i + 1) % FUNCTIONS.length]
  const issues = exceptionsFor(d, f.sources)
  return (
    <>
      <div className="flex justify-between text-xs mb-1">
        <Link to={keep(`/domain/${d.domain}/fn/${prev.id}`)} className="inline-flex items-center gap-1 text-ink-3 hover:text-ink"><ChevronLeft size={14} />{prev.name}</Link>
        <Link to={keep(`/domain/${d.domain}/fn/${next.id}`)} className="inline-flex items-center gap-1 text-ink-3 hover:text-ink">{next.name}<ChevronRight size={14} /></Link>
      </div>
      <SimHeader d={d} crumbs={[{ to: `/domain/${d.domain}/fn/${f.id}`, label: f.name }]} title={f.name} question={f.question} source={f.sources}>
        <div className="flex items-center gap-2"><ScoreRing score={h.score} status={h.status} size={44} label={f.name} /><span className="text-xs text-ink-3 leading-tight">{f.cls === 'cto' ? 'CTO-owned' : 'Signal to CTO'}<br />Owner {f.owner}</span></div>
      </SimHeader>
      {f.cls === 'signal' && <div className="rounded-lg border border-brand-100 bg-brand-50 px-3 py-2 text-sm text-brand-900 mb-4">This function is owned by the {f.owner}. CTO360 shows only the signals the CTO needs from it — it does not replace their systems.</div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 mb-5">{h.metrics.map((m) => <MetricCard key={m.id} m={m} />)}</div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card title="Function health · 12 months" className="lg:col-span-2"><TrendChart series={h.series} target={80} name={`${f.name} health`} /></Card>
        <div className="space-y-5">
          <Card title="Fed by">
            <ul className="space-y-2 text-sm">{f.sources.map((s) => {
              const m = SOURCES.find((x) => x.id === s)
              return <li key={s}>{m ? <Link to={keep(`/domain/${d.domain}/${m.slug}`)} className="font-semibold text-brand-600 hover:underline">{m.capability} →</Link> : <span className="font-medium">Business systems</span>}<div className="text-xs text-ink-3">{m ? `Simulated · ${m.label}` : 'Simulated business data'}</div></li>
            })}</ul>
          </Card>
          <Card title="Exceptions from its sources">
            {issues.length === 0 ? <p className="text-sm text-success-text">No red records.</p> : (
              <ul className="space-y-1.5 text-sm">{issues.slice(0, 6).map((x) => (
                <li key={x.id} className="flex items-start gap-2"><StatusPill status={x.health} why={x.why} label={x.id.split('-')[0]} /><RecLink d={d} id={x.id} className="text-ink">{x.name}</RecLink></li>
              ))}</ul>
            )}
          </Card>
        </div>
      </div>
    </>
  )
}

function exceptionsFor(d: DomainData, sources: string[]) {
  const by: Record<string, { id: string; name: string; health: Rag; why: string[] }[]> = {
    planview: d.initiatives, leanix: d.applications, process: d.processes, servicenow: d.projects, jellyfish: d.teams, datadog: d.services, vanta: d.risks.filter((r) => r.severity === 'Critical' || r.severity === 'High'),
  }
  return sources.flatMap((s) => by[s] ?? []).filter((x) => x.health === 'Red' || (x.id.startsWith('RISK') && x.health !== 'Green'))
}
