import type { DomainData, Team } from '../../../data/sim'
import { Card } from '../../../components/ui'
import { StatusPill } from '../../../components/sim/primitives'
import { RecordTable } from '../../../components/sim/RecordTable'
import { TrendChart } from '../../../components/sim/charts'
import { series as palette } from '../../../theme'
import { NameCell, RecLink, Tabs } from '../common'
import { FunctionKpis } from './kpis'

type T = 'teams' | 'allocation'
const ALLOC = [
  { k: 'roadmap', label: 'Roadmap', color: palette[0] },
  { k: 'unplanned', label: 'Unplanned', color: palette[1] },
  { k: 'techDebt', label: 'Tech debt', color: palette[2] },
  { k: 'keepTheLightsOn', label: 'Keep the lights on', color: '#94a3b8' },
] as const

function AllocBar({ t }: { t: Team['allocation'] }) {
  return (
    <div className="flex h-2.5 rounded-full overflow-hidden gap-px bg-white w-36" role="img" aria-label={ALLOC.map((a) => `${a.label} ${t[a.k]}%`).join(', ')}>
      {ALLOC.map((a) => <div key={a.k} style={{ width: `${t[a.k]}%`, background: a.color }} title={`${a.label} ${t[a.k]}%`} />)}
    </div>
  )
}
const Legend = () => <div className="flex flex-wrap gap-4 text-xs text-ink-3">{ALLOC.map((a) => <span key={a.k}><span className="inline-block w-3 h-3 rounded-sm mr-1 align-middle" style={{ background: a.color }} />{a.label}</span>)}</div>

export default function Jellyfish({ d, tab, setTab }: { d: DomainData; tab: string; setTab: (t: string) => void }) {
  const t = (['teams', 'allocation'].includes(tab) ? tab : 'teams') as T
  const eng = d.teams.reduce((s, x) => s + x.engineers, 0)
  const w = (k: (typeof ALLOC)[number]['k']) => Math.round(d.teams.reduce((s, x) => s + x.allocation[k] * x.engineers, 0) / eng)
  const debt = d.teams[0].debtSeries.map((_, i) => Math.round(d.teams.reduce((s, x) => s + x.debtSeries[i] * x.engineers, 0) / eng))
  const initName = (id: string) => d.initiatives.find((i) => i.id === id)?.name ?? id
  return (
    <>
      <FunctionKpis d={d} fn="engineering" />
      <Tabs<T> value={t} onChange={setTab} tabs={[{ id: 'teams', label: 'Engineering teams', count: d.teams.length }, { id: 'allocation', label: 'Investment & allocation' }]} />
      {t === 'teams' && (
        <Card>
          <RecordTable label="teams" rows={d.teams} minWidth={1100} cols={[
            { key: 'n', label: 'Team', render: (x) => <NameCell d={d} id={x.id} name={x.name} sub={x.product} /> },
            { key: 'i', label: 'Strategic initiative', render: (x) => <RecLink d={d} id={x.initiativeId} className="text-xs text-ink-2">{initName(x.initiativeId)}</RecLink> },
            { key: 'e', label: 'Engineers', align: 'right', render: (x) => x.engineers, sort: (x) => x.engineers },
            { key: 'a', label: 'Allocation', render: (x) => <AllocBar t={x.allocation} /> },
            { key: 'dp', label: 'Deploys / wk', align: 'right', render: (x) => x.deploysPerWeek, sort: (x) => x.deploysPerWeek },
            { key: 'lt', label: 'Lead time', align: 'right', render: (x) => `${x.leadTimeDays} d`, sort: (x) => x.leadTimeDays },
            { key: 'pr', label: 'Predictability', align: 'right', render: (x) => `${x.predictability}%`, sort: (x) => x.predictability },
            { key: 'g', label: 'Capacity gap', align: 'right', render: (x) => <span className={x.capacityGap > 15 ? 'text-crit-text font-semibold' : x.capacityGap > 8 ? 'text-warn-text' : ''}>{x.capacityGap}%</span>, sort: (x) => x.capacityGap },
            { key: 'h', label: 'Delivery health', render: (x) => <StatusPill status={x.health} why={x.why} label={x.status} /> },
          ]} />
          <div className="mt-3"><Legend /></div>
          <p className="text-xs text-ink-3 mt-2">Team-level engineering intelligence only — CTO360 does not rank individual developers.</p>
        </Card>
      )}
      {t === 'allocation' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card title={`Where ${eng} engineers spend their time`}>
            <div className="flex h-6 rounded-lg overflow-hidden gap-0.5 mb-3" role="img" aria-label="Engineering allocation">
              {ALLOC.map((a) => <div key={a.k} style={{ width: `${w(a.k)}%`, background: a.color }} className="text-[11px] text-white font-semibold flex items-center justify-center">{w(a.k)}%</div>)}
            </div>
            <Legend />
            <h3 className="text-sm font-semibold text-ink mt-5 mb-2">Engineers by strategic initiative</h3>
            <ul className="space-y-1.5 text-sm">{d.initiatives.map((i) => {
              const n = d.teams.filter((x) => x.initiativeId === i.id).reduce((s, x) => s + x.engineers, 0)
              return n ? <li key={i.id} className="flex justify-between gap-2"><RecLink d={d} id={i.id} className="text-ink truncate">{i.name}</RecLink><span className="tabular-nums">{n} ({Math.round((n / eng) * 100)}%)</span></li> : null
            })}</ul>
          </Card>
          <Card title="Tech-debt paydown allocation (% of capacity)"><TrendChart series={debt} name="Tech-debt allocation" unit="%" /></Card>
        </div>
      )}
    </>
  )
}
