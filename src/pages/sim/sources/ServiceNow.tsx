import type { DomainData } from '../../../data/sim'
import { Card } from '../../../components/ui'
import { Bar2, StatusPill, Tile } from '../../../components/sim/primitives'
import { RecordTable } from '../../../components/sim/RecordTable'
import VendorsTab from '../../domain/VendorsTab'
import { NameCell, RecLink, Tabs, cr, ragFrom } from '../common'

type T = 'projects' | 'capacity' | 'vendors'

export default function ServiceNow({ d, tab, setTab }: { d: DomainData; tab: string; setTab: (t: string) => void }) {
  const t = (['projects', 'capacity', 'vendors'].includes(tab) ? tab : 'projects') as T
  const ps = d.projects
  const onTrack = ps.filter((p) => p.health === 'Green').length
  const delayed = ps.filter((p) => p.health === 'Red').length
  const bud = ps.reduce((s, p) => s + p.budgetCr, 0), fc = ps.reduce((s, p) => s + p.forecastCr, 0)
  const varPct = Math.round((fc / bud - 1) * 1000) / 10
  const dem = ps.reduce((s, p) => s + p.demandFte, 0), cap = ps.reduce((s, p) => s + p.capacityFte, 0)
  const due = ps.reduce((s, p) => s + p.milestonesDue, 0), late = ps.reduce((s, p) => s + p.milestonesLate, 0)
  const slip = (p: (typeof ps)[number]) => Math.round((Date.parse(p.forecastEnd) - Date.parse(p.plannedEnd)) / 86_400_000)
  const avgSlip = Math.round(ps.reduce((s, p) => s + slip(p), 0) / ps.length)
  const initName = (id: string) => d.initiatives.find((i) => i.id === id)?.name ?? id
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-3 mb-5">
        <Tile label="Projects on track" value={`${onTrack} of ${ps.length}`} target={`${Math.ceil(ps.length * 0.8)}`} status={ragFrom(onTrack >= ps.length * 0.8, onTrack >= ps.length * 0.6)} />
        <Tile label="Delayed projects" value={`${delayed}`} target="0" status={ragFrom(delayed === 0, delayed <= 2)} note="> 30 days late or > 10% over" />
        <Tile label="Budget variance (forecast)" value={`${varPct > 0 ? '+' : ''}${varPct}%`} target="≤ +2%" status={ragFrom(varPct <= 2, varPct <= 6)} note={`${cr(fc)} vs ${cr(bud)}`} />
        <Tile label="Demand vs capacity" value={`${dem} / ${cap} FTE`} target="≤ 100%" status={ragFrom(dem <= cap, dem <= cap * 1.1)} note={`${Math.round((dem / cap) * 100)}% loaded`} />
        <Tile label="Milestones late" value={`${late} of ${due}`} target="0" status={ragFrom(late === 0, late <= 3)} />
        <Tile label="Average forecast slip" value={`${avgSlip} days`} target="0" status={ragFrom(avgSlip <= 3, avgSlip <= 15)} />
      </div>
      <Tabs<T> value={t} onChange={setTab} tabs={[
        { id: 'projects', label: 'Projects & programmes', count: ps.length },
        { id: 'capacity', label: 'Demand vs capacity' },
        { id: 'vendors', label: 'Vendors & support (programme view)' },
      ]} />
      {t === 'projects' && (
        <Card>
          <RecordTable label="projects" rows={ps} minWidth={1120} cols={[
            { key: 'n', label: 'Project', render: (p) => <NameCell d={d} id={p.id} name={p.name} sub={p.program} /> },
            { key: 'i', label: 'Strategic initiative', render: (p) => <RecLink d={d} id={p.initiativeId} className="text-xs text-ink-2">{initName(p.initiativeId)}</RecLink> },
            { key: 'pm', label: 'PM', render: (p) => <span className="text-xs">{p.pm}</span> },
            { key: 'pr', label: 'Progress vs plan', render: (p) => <div className="w-28"><Bar2 value={p.progress} planned={p.plannedProgress} /><span className="text-xs">{p.progress}% / {p.plannedProgress}%</span></div>, sort: (p) => p.progress - p.plannedProgress },
            { key: 'b', label: 'Budget → forecast', align: 'right', render: (p) => <span className={`text-xs ${p.forecastCr > p.budgetCr * 1.05 ? 'text-crit-text font-semibold' : ''}`}>{cr(p.budgetCr)} → {cr(p.forecastCr)}</span>, sort: (p) => p.forecastCr / p.budgetCr },
            { key: 'e', label: 'Planned → forecast end', render: (p) => <span className="text-xs whitespace-nowrap">{p.plannedEnd} → <b className={slip(p) > 0 ? 'text-warn-text' : ''}>{p.forecastEnd}</b></span>, sort: (p) => slip(p) },
            { key: 'm', label: 'Milestones', align: 'right', render: (p) => <span className="text-xs">{p.milestonesLate ? <b className="text-crit-text">{p.milestonesLate} late</b> : 'on time'} / {p.milestonesDue}</span> },
            { key: 'h', label: 'Status', render: (p) => <StatusPill status={p.health} why={p.why} label={p.status} /> },
          ]} />
        </Card>
      )}
      {t === 'capacity' && (
        <Card title="Resource demand vs capacity (FTE)">
          <ul className="space-y-2.5">{[...ps].sort((a, b) => b.demandFte / b.capacityFte - a.demandFte / a.capacityFte).map((p) => {
            const max = Math.max(...ps.map((x) => x.demandFte))
            const over = p.demandFte > p.capacityFte
            return (
              <li key={p.id} className="grid grid-cols-[minmax(0,14rem)_1fr_auto] gap-3 items-center text-sm">
                <RecLink d={d} id={p.id} className="truncate text-ink">{p.name}</RecLink>
                <div className="relative h-3 bg-slate-100 rounded-full" role="img" aria-label={`Demand ${p.demandFte}, capacity ${p.capacityFte}`}>
                  <div className="absolute h-full rounded-full bg-seq-250" style={{ width: `${(p.demandFte / max) * 100}%` }} />
                  <div className="absolute h-full rounded-full bg-brand-600" style={{ width: `${(Math.min(p.capacityFte, p.demandFte) / max) * 100}%` }} />
                </div>
                <span className={`text-xs tabular-nums w-24 text-right ${over ? 'text-crit-text font-semibold' : 'text-ink-2'}`}>{p.capacityFte} / {p.demandFte}{over ? ` (−${p.demandFte - p.capacityFte})` : ''}</span>
              </li>
            )
          })}</ul>
          <div className="flex gap-4 text-xs text-ink-3 mt-3"><span><span className="inline-block w-3 h-3 rounded-sm bg-brand-600 mr-1 align-middle" />Capacity assigned</span><span><span className="inline-block w-3 h-3 rounded-sm bg-seq-250 mr-1 align-middle" />Unmet demand</span></div>
        </Card>
      )}
      {t === 'vendors' && <VendorsTab domainId={d.domain} />}
    </>
  )
}
