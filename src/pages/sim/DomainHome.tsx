// Domain Overview — Executive 360 (spec 2 §2), the 7 simulated source systems, the 16-function heatmap and
// the cross-system exceptions. Old links like /domain/banking?tab=cyber are redirected to the new source pages.
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, History } from 'lucide-react'
import { domains } from '../../data/domains'
import { domainHealth, exec360, sourceHealth } from '../../data/sim'
import type { DomainData } from '../../data/sim'
import { Card } from '../../components/ui'
import { ScoreCard, ScoreRing, Sparkline, StatusPill } from '../../components/sim/primitives'
import { HealthHeatmap } from '../../components/sim/HealthHeatmap'
import { EventFeed } from '../../components/sim/EventFeed'
import { useKeepRange, useRange } from '../../components/sim/range'
import { NotFound, RecLink, SimHeader, useSimDomain } from './common'

const LEGACY: Record<string, string> = {
  overview: 'programme', apps: 'datadog?tab=apps', dr: 'datadog?tab=dr', pnl: 'datadog?tab=pnl', cyber: 'vanta?tab=cyber',
  eol: 'leanix?tab=eol', vendors: 'servicenow?tab=vendors', customer: 'process?tab=customer',
}

export default function DomainHome() {
  const d = useSimDomain()
  const [sp] = useSearchParams()
  const legacy = sp.get('tab')
  if (!d) return <NotFound />
  if (legacy && LEGACY[legacy]) return <Navigate to={`/domain/${d.domain}/${LEGACY[legacy]}`} replace />
  return <Home d={d} />
}

function Home({ d }: { d: DomainData }) {
  const keep = useKeepRange()
  const range = useRange()
  const ex = exec360(d)
  const k = Object.fromEntries(ex.map((x) => [x.key, x]))
  const dh = domainHealth(d)
  const weakest = [...dh.functions].sort((a, b) => a.score - b.score)[0]
  const src = sourceHealth(d)
  const large = ['technology', 'business', 'transformation', 'operational', 'compliance'].map((x) => k[x])
  const compact = ['digital', 'ai', 'architecture', 'cyber', 'cx', 'employee', 'budget', 'innovation'].map((x) => k[x])
  const ent = k.enterprise
  const all = [...d.initiatives, ...d.applications, ...d.processes, ...d.projects, ...d.teams, ...d.services, ...d.controls, ...d.risks]
  const healthOf = (id?: string) => all.find((e) => e.id === id)

  return (
    <>
      <SimHeader d={d} title={`${domains[d.domain].name} · Enterprise 360`} question="Are we delivering the business strategy, and where must I intervene?" source="business">
        <span className="text-xs text-ink-3">{d.org}</span>
      </SimHeader>

      {/* Executive 360 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 gap-3 mb-3">
        <div className="sm:col-span-2 lg:col-span-1 bg-brand-950 text-white rounded-xl p-4 flex items-center gap-4">
          <div className="bg-white rounded-full p-1"><ScoreRing score={ent.current} status={ent.status} size={68} label="Enterprise health" /></div>
          <div className="min-w-0">
            <div className="text-xs text-slate-300">Enterprise health</div>
            <div className="text-sm">Target <b>{ent.target}</b> · <span className={ent.delta >= 0 ? 'text-green-300' : 'text-red-300'}>{ent.current - ent.series[12 - range.points] >= 0 ? '▲' : '▼'} {Math.abs(Math.round((ent.current - ent.series[12 - range.points]) * 10) / 10)}</span> <span className="text-slate-400 text-xs">{range.vs}</span></div>
            <div className="mt-1"><Sparkline data={ent.series.slice(12 - range.points)} target={ent.target} color="#93c5fd" width={120} height={26} /></div>
            <div className="text-[11px] text-slate-300 mt-1">Weakest: <b className="text-white">{weakest.def.name}</b> ({weakest.score})</div>
          </div>
        </div>
        {large.map((x) => <ScoreCard key={x.key} k={x} large />)}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 2xl:grid-cols-8 gap-3 mb-6">
        {compact.map((x) => <ScoreCard key={x.key} k={x} />)}
      </div>

      {/* 7 source systems */}
      <h2 className="text-[17px] font-semibold text-ink mb-2">Enterprise source systems <span className="text-xs font-normal text-ink-3">· simulated · click to open</span></h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 2xl:grid-cols-7 gap-3 mb-6">
        {src.map((s) => (
          <Link key={s.id} to={keep(`/domain/${d.domain}/${s.slug}`)} className="bg-surface rounded-xl border border-line p-3 hover:border-brand-600 hover:shadow-sm transition group">
            <div className="flex items-center gap-2.5">
              <ScoreRing score={s.score} status={s.status} size={44} label={s.capability} />
              <div className="min-w-0">
                <div className="text-[13px] font-semibold text-ink leading-tight">{s.capability}</div>
                <div className="text-[11px] text-ink-3 truncate">Simulated · {s.label}</div>
              </div>
            </div>
            <div className="flex justify-between text-[11px] text-ink-3 mt-2"><span>{s.records} records</span>{s.red > 0 ? <span className="text-crit-text font-semibold">{s.red} red</span> : <span className="text-success-text">no red</span>}</div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 2xl:grid-cols-3 gap-5 mb-6">
        <Card title="16 enterprise functions · health heatmap" className="2xl:col-span-2 min-w-0"><HealthHeatmap d={d} /></Card>
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-1 gap-5 content-start">
          <Card title="Needs your attention">
            <p className="text-xs text-ink-3 -mt-2 mb-3">Exceptions connected across several source systems. Full decision cards with evidence follow in the Decision Center.</p>
            <ul className="space-y-3">{d.stories.map((s) => {
              const chain: [string, string | undefined][] = [['Planview', s.initiativeId], ['LeanIX', s.appIds[0]], ['Process', s.processId], ['ServiceNow', s.projectId], ['Jellyfish', s.teamId], ['Datadog', s.serviceId], ['Vanta', s.controlId]]
              const reds = chain.filter(([, id]) => healthOf(id)?.health === 'Red').length
              const init = d.initiatives.find((i) => i.id === s.initiativeId)!
              return (
                <li key={s.id} className="border border-line rounded-lg p-3">
                  <div className="flex items-start justify-between gap-2">
                    <RecLink d={d} id={s.initiativeId} className="font-semibold text-ink text-sm leading-snug">{s.title}</RecLink>
                    <StatusPill status={reds >= 3 ? 'Red' : reds > 0 ? 'Amber' : 'Green'} label={reds >= 3 ? 'Decide' : 'Watch'} why={init.why} />
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">{chain.map(([label, id]) => {
                    const h = healthOf(id)?.health ?? 'Green'
                    return <RecLink key={label} d={d} id={id}><span className={`inline-flex items-center gap-1 text-[10.5px] rounded px-1.5 py-0.5 border ${h === 'Red' ? 'bg-crit-bg text-crit-text border-red-200' : h === 'Amber' ? 'bg-warn-bg text-warn-text border-amber-200' : 'bg-success-bg text-success-text border-green-200'}`}>{label}</span></RecLink>
                  })}</div>
                  <div className="text-[11px] text-ink-3 mt-1.5">{reds} of 7 layers red · owner {init.owner}</div>
                </li>
              )
            })}</ul>
          </Card>
          <Card title="Live source events"><EventFeed d={d} limit={7} /></Card>
        </div>
      </div>

      <Link to={`/domain/${d.domain}/programme`} className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:underline">
        <History size={15} />Programme view — TEDIF problems, CTO-to-developer cascade and resilience tabs<ArrowRight size={14} />
      </Link>
    </>
  )
}
