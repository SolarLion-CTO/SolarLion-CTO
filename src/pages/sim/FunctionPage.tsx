// Function page (M4) — one template renders all 16 functions in all 3 domains.
// Function → KPI → initiative → application / process → issue → evidence → action.
import { Link, useParams } from 'react-router-dom'
import { ArrowRight, Briefcase, ChevronLeft, ChevronRight, Cpu, IndianRupee } from 'lucide-react'
import { FN, FUNCTIONS, SOURCES, functionHealth } from '../../data/sim'
import type { DomainData, FunctionId } from '../../data/sim'
import { actions, dependencies, impact, scope } from '../../data/sim/context'
import { Card } from '../../components/ui'
import { Bar2, MetricCard, ScoreRing, StatusPill } from '../../components/sim/primitives'
import { TrendChart } from '../../components/sim/charts'
import { useKeepRange } from '../../components/sim/range'
import { NotFound, RecLink, SimHeader, cr, useSimDomain } from './common'

export default function FunctionPage() {
  const d = useSimDomain()
  const { fn } = useParams()
  const i = FUNCTIONS.findIndex((f) => f.id === fn)
  if (!d || i < 0) return <NotFound />
  return <Fn d={d} i={i} />
}

function Fn({ d, i }: { d: DomainData; i: number }) {
  const keep = useKeepRange()
  const f = FUNCTIONS[i]
  const fid = f.id as FunctionId
  const h = functionHealth(d, fid)
  const sc = scope(d, fid)
  const imp = impact(d, sc)
  const acts = actions(sc)
  const deps = dependencies(d, fid)
  const prev = FUNCTIONS[(i + FUNCTIONS.length - 1) % FUNCTIONS.length], next = FUNCTIONS[(i + 1) % FUNCTIONS.length]
  const issues = [...sc.initiatives, ...sc.apps, ...sc.processes, ...sc.projects, ...sc.teams, ...sc.services, ...sc.controls].filter((x) => x.health === 'Red')
  const kind = (id: string) => ({ INIT: 'Initiative', APP: 'Application', PROC: 'Process', PRJ: 'Project', TEAM: 'Team', SVC: 'Service', CTL: 'Control', RISK: 'Risk' } as Record<string, string>)[id.split('-')[0]]
  const impacts = [
    { title: 'Business impact', icon: Briefcase, items: imp.business },
    { title: 'Technology impact', icon: Cpu, items: imp.technology },
    { title: 'Financial impact', icon: IndianRupee, items: imp.financial },
  ]
  return (
    <>
      <div className="flex justify-between text-xs mb-1 gap-2">
        <Link to={keep(`/domain/${d.domain}/fn/${prev.id}`)} className="inline-flex items-center gap-1 text-ink-3 hover:text-ink min-w-0"><ChevronLeft size={14} className="shrink-0" /><span className="truncate">{prev.name}</span></Link>
        <Link to={keep(`/domain/${d.domain}/fn/${next.id}`)} className="inline-flex items-center gap-1 text-ink-3 hover:text-ink min-w-0"><span className="truncate">{next.name}</span><ChevronRight size={14} className="shrink-0" /></Link>
      </div>
      <SimHeader d={d} crumbs={[{ to: `/domain/${d.domain}/fn/${f.id}`, label: f.name }]} title={f.name} question={f.question} source={f.sources}>
        <div className="flex items-center gap-2"><ScoreRing score={h.score} status={h.status} size={44} label={f.name} /><span className="text-xs text-ink-3 leading-tight">{f.cls === 'cto' ? 'CTO-owned' : 'Signal to CTO'}<br />Owner {f.owner}</span></div>
      </SimHeader>
      {f.cls === 'signal' && <div className="rounded-lg border border-brand-100 bg-brand-50 px-3 py-2 text-sm text-brand-900 mb-4">Owned by the {f.owner}. CTO360 shows only the signals the CTO needs from this function — it does not replace their systems.</div>}

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 mb-5">{h.metrics.map((m) => <MetricCard key={m.id} m={m} />)}</div>

      {/* Impact */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">{impacts.map(({ title, icon: Icon, items }) => (
        <Card key={title} title={title} action={<Icon size={16} className="text-ink-3" />}>
          {items.length === 0 ? <p className="text-sm text-success-text">No material impact in the simulated data.</p> : <ul className="list-disc pl-4 space-y-1.5 text-sm text-ink-2">{items.slice(0, 4).map((x) => <li key={x}>{x}</li>)}</ul>}
        </Card>
      ))}</div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-5">
        <Card title="Function health · 12 months" className="xl:col-span-2 min-w-0"><TrendChart series={h.series} target={80} name={`${f.name} health`} score /></Card>
        <Card title="Cross-functional dependencies">
          <div className="text-[11px] uppercase tracking-wide text-ink-3 mb-1.5">Depends on</div>
          <ul className="space-y-1.5 mb-3">{deps.dependsOn.map((x) => (
            <li key={x.id} className="flex items-center gap-2 text-sm">
              <StatusPill status={x.h.status} label={String(x.h.score)} />
              <Link to={keep(`/domain/${d.domain}/fn/${x.id}`)} className="font-medium text-ink hover:underline">{FN[x.id].name}</Link>
              <span className="text-xs text-ink-3 truncate">· {x.why}</span>
            </li>
          ))}</ul>
          <div className="text-[11px] uppercase tracking-wide text-ink-3 mb-1.5">Affects</div>
          <div className="flex flex-wrap gap-1.5">{deps.dependents.map((x) => (
            <Link key={x.id} to={keep(`/domain/${d.domain}/fn/${x.id}`)} className="text-xs border border-line rounded-md px-2 py-0.5 hover:bg-slate-50">{FN[x.id].name} <span className="text-ink-3">{x.h.score}</span></Link>
          ))}</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-5">
        <Card title={`Strategic initiatives linked to ${f.name.toLowerCase()}`}>
          {sc.initiatives.length === 0 ? <p className="text-sm text-ink-3">No initiatives linked in the simulated data.</p> : (
            <ul className="divide-y divide-line">{[...sc.initiatives].sort((a, b) => ({ Red: 0, Amber: 1, Green: 2 })[a.health] - ({ Red: 0, Amber: 1, Green: 2 })[b.health]).slice(0, 6).map((x) => (
              <li key={x.id} className="py-2 grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 items-center text-sm">
                <RecLink d={d} id={x.id} className="font-medium text-ink truncate">{x.name}</RecLink>
                <StatusPill status={x.health} why={x.why} label={x.status} />
                <div className="flex items-center gap-2"><div className="w-28"><Bar2 value={x.progress} planned={x.plannedProgress} /></div><span className="text-xs text-ink-3">{x.progress}% / plan {x.plannedProgress}%</span></div>
                <span className="text-xs text-ink-3 text-right">{cr(x.forecastCr)} of {cr(x.budgetCr)}</span>
              </li>
            ))}</ul>
          )}
        </Card>
        <Card title="Recommended actions">
          {acts.length === 0 ? <p className="text-sm text-success-text">Nothing needs action — keep monitoring.</p> : (
            <ol className="space-y-2.5">{acts.slice(0, 5).map((a, k) => (
              <li key={a.recordId} className="flex gap-3 text-sm">
                <span className={`shrink-0 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${a.priority === 'High' ? 'bg-crit-bg text-crit-text' : 'bg-warn-bg text-warn-text'}`}>{k + 1}</span>
                <div className="min-w-0"><div className="font-medium text-ink">{a.text}</div><div className="text-xs text-ink-3">Owner {a.owner} · evidence <RecLink d={d} id={a.recordId} className="text-brand-700" />{a.why ? ` · ${a.why}` : ''}</div></div>
              </li>
            ))}</ol>
          )}
          <p className="text-xs text-ink-3 mt-3">Recommendations are drafted from the simulated evidence; a named human decides (Decision Center, M5).</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <Card title={`Open issues (${issues.length})`} className="xl:col-span-2">
          {issues.length === 0 ? <p className="text-sm text-success-text">No red records linked to this function.</p> : (
            <ul className="divide-y divide-line">{issues.slice(0, 8).map((x) => (
              <li key={x.id} className="py-2 flex flex-wrap items-start gap-x-3 gap-y-1 text-sm">
                <span className="text-[11px] text-ink-3 w-20 shrink-0 pt-0.5">{kind(x.id)}</span>
                <RecLink d={d} id={x.id} className="font-medium text-ink">{x.name}</RecLink>
                <span className="text-xs text-ink-3 basis-full sm:basis-auto sm:flex-1 min-w-0">{x.why.join(' · ')}</span>
              </li>
            ))}</ul>
          )}
        </Card>
        <Card title="Fed by">
          <ul className="space-y-2.5 text-sm">{f.sources.map((s) => {
            const m = SOURCES.find((x) => x.id === s)
            return (
              <li key={s}>{m ? <Link to={keep(`/domain/${d.domain}/${m.slug}`)} className="font-semibold text-brand-600 hover:underline inline-flex items-center gap-1">{m.capability}<ArrowRight size={13} /></Link> : <span className="font-medium">Business systems</span>}
                <div className="text-xs text-ink-3">{m ? `Simulated · ${m.label}` : 'Simulated business data'}</div></li>
            )
          })}</ul>
          <div className="text-xs text-ink-3 mt-3 pt-3 border-t border-line">
            {h.metrics.filter((m) => m.derived).length} of 6 KPIs are calculated from source records; {h.metrics.filter((m) => !m.derived).length} are simulated business figures.
            <div className="mt-1">In scope: {[[sc.initiatives.length, 'initiatives'], [sc.apps.length, 'apps'], [sc.services.length, 'services'], [sc.processes.length, 'processes'], [sc.teams.length, 'teams'], [sc.risks.length, 'risks'], [sc.controls.length, 'controls']].filter(([n]) => n).map(([n, l]) => `${n} ${l}`).join(' · ')}</div>
          </div>
        </Card>
      </div>
    </>
  )
}
