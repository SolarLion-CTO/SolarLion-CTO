// Enterprise Data Sources (M6, spec 1 §23): the 7 simulated source systems across all three business units.
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Database, Info } from 'lucide-react'
import { domainOrder, domains } from '../../data/domains'
import type { DomainId } from '../../data/domains'
import { SOURCES, sim, sourceHealth } from '../../data/sim'
import { buildEvents } from '../../data/sim/events'
import { PageHeader } from '../../components/ui'
import { ScoreRing } from '../../components/sim/primitives'
import { ago, hhmm, useSimClock } from '../../components/sim/clock'
import { useKeepRange } from '../../components/sim/range'
import { ragOf } from '../../data/sim/scoring'

export default function DataSources() {
  const { now, paused } = useSimClock()
  const keep = useKeepRange()
  const events = useMemo(() => domainOrder.flatMap((id) => buildEvents(sim[id]).map((e) => ({ ...e, domain: id as DomainId }))), [])
  const health = useMemo(() => Object.fromEntries(domainOrder.map((id) => [id, sourceHealth(sim[id])])) as Record<DomainId, ReturnType<typeof sourceHealth>>, [])
  return (
    <>
      <PageHeader title="Enterprise data sources" subtitle="The seven source-system categories CTO360 simulates for each business unit" />
      <div className="rounded-xl border-2 border-brand-600 bg-brand-50 px-4 py-3 mb-5 flex gap-2 items-start text-sm text-brand-900">
        <Info size={17} className="shrink-0 mt-0.5" />
        <span><b>Demonstration environment using simulated enterprise data. No live vendor integrations are active.</b> Product names are referenced only to illustrate the category of platform a CTO would connect; CTO360 is not affiliated with or endorsed by these vendors.</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {SOURCES.map((s) => {
          const mine = events.filter((e) => e.source === s.id && e.at <= now)
          const last = mine.reduce((m, e) => Math.max(m, e.at), 0)
          const perHour = mine.filter((e) => now - e.at <= 3_600_000).length
          const rows = domainOrder.map((id) => health[id].find((x) => x.id === s.id)!)
          const avg = Math.round(rows.reduce((a, x) => a + x.score, 0) / rows.length)
          return (
            <section key={s.id} className="bg-surface rounded-xl border border-line p-4 flex flex-col">
              <div className="flex items-start gap-3">
                <ScoreRing score={avg} status={ragOf(avg)} size={52} label={s.capability} />
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold text-ink leading-tight">{s.label}</h2>
                  <div className="text-xs text-ink-3">{s.capability}</div>
                  <div className={`text-xs font-semibold mt-1 inline-flex items-center gap-1 ${paused ? 'text-ink-3' : 'text-success-text'}`}><span className={`w-1.5 h-1.5 rounded-full ${paused ? 'bg-ink-4' : 'bg-ok animate-pulse'}`} />{paused ? 'Simulation paused' : 'Simulation active'}</div>
                </div>
                <Database size={16} className="text-ink-4 shrink-0" aria-hidden />
              </div>
              <dl className="grid grid-cols-3 gap-2 text-center my-3">
                <div className="rounded-lg bg-slate-50 py-1.5"><dt className="text-[10px] text-ink-3">Records</dt><dd className="font-bold text-brand-900 tabular-nums">{rows.reduce((a, x) => a + x.records, 0)}</dd></div>
                <div className="rounded-lg bg-slate-50 py-1.5"><dt className="text-[10px] text-ink-3">Last sync</dt><dd className="font-bold text-brand-900 text-sm">{last ? ago(now - last) : '—'}</dd></div>
                <div className="rounded-lg bg-slate-50 py-1.5"><dt className="text-[10px] text-ink-3">Events / h</dt><dd className="font-bold text-brand-900 tabular-nums">{perHour}</dd></div>
              </dl>
              <div className="text-[11px] uppercase tracking-wide text-ink-3 mb-1">By business unit</div>
              <ul className="space-y-1 mb-3">{rows.map((x, k) => (
                <li key={domainOrder[k]}><Link to={keep(`/domain/${domainOrder[k]}/${s.slug}`)} className="flex items-center justify-between text-sm hover:underline">
                  <span className="text-ink">{domains[domainOrder[k]].name}</span>
                  <span className="text-xs text-ink-3">{x.records} records · <b className={x.status === 'Green' ? 'text-success-text' : x.status === 'Amber' ? 'text-warn-text' : 'text-crit-text'}>{x.score}</b>{x.red ? ` · ${x.red} red` : ''}</span>
                </Link></li>
              ))}</ul>
              <div className="text-[11px] uppercase tracking-wide text-ink-3 mb-1 mt-auto">Latest events</div>
              <ul className="text-[12px] divide-y divide-line">{mine.sort((a, b) => b.at - a.at).slice(0, 3).map((e) => (
                <li key={e.id} className="py-1 flex gap-2 min-w-0"><span className="text-ink-4 tabular-nums shrink-0">{hhmm(e.at).slice(0, 5)}</span><Link to={`/domain/${e.domain}/record/${e.recordId}`} className="truncate text-ink-2 hover:underline" title={e.text}>{e.text}</Link></li>
              ))}</ul>
            </section>
          )
        })}
      </div>
    </>
  )
}
