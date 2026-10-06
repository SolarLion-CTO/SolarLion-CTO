import { useState } from 'react'
import type { DomainData, Process } from '../../../data/sim'
import { Card } from '../../../components/ui'
import { StatusPill, ragBg, ragText } from '../../../components/sim/primitives'
import { RecordTable } from '../../../components/sim/RecordTable'
import { TrendChart } from '../../../components/sim/charts'
import CustomerTab from '../../domain/CustomerTab'
import { NameCell, RecLink, Tabs } from '../common'
import { FunctionKpis } from './kpis'

type T = 'processes' | 'pipeline' | 'customer'
const STAGES = ['Discover', 'Model', 'Improve', 'Automate', 'Monitor'] as const

export default function ProcessIntel({ d, tab, setTab }: { d: DomainData; tab: string; setTab: (t: string) => void }) {
  const t = (['processes', 'pipeline', 'customer'].includes(tab) ? tab : 'processes') as T
  const [sel, setSel] = useState<string>([...d.processes].sort((a, b) => b.cycleTime / b.targetCycleTime - a.cycleTime / a.targetCycleTime)[0].id)
  const p = d.processes.find((x) => x.id === sel)!
  return (
    <>
      <FunctionKpis d={d} fn="operations" />
      <Tabs<T> value={t} onChange={setTab} tabs={[
        { id: 'processes', label: 'Process performance', count: d.processes.length },
        { id: 'pipeline', label: 'Transformation pipeline' },
        { id: 'customer', label: 'Customer feedback (programme view)' },
      ]} />
      {t === 'processes' && (
        <>
          <Card className="mb-5">
            <RecordTable label="processes" rows={d.processes} minWidth={1000} cols={[
              { key: 'n', label: 'Process', render: (x) => <button onClick={() => setSel(x.id)} className="text-left"><NameCell d={d} id={x.id} name={x.name} sub={x.owner} /></button> },
              { key: 'c', label: 'Cycle time vs target', render: (x) => <Ratio p={x} />, sort: (x) => x.cycleTime / x.targetCycleTime },
              { key: 'cf', label: 'Conformance', align: 'right', render: (x) => `${x.conformance}%`, sort: (x) => x.conformance },
              { key: 'au', label: 'Automation', align: 'right', render: (x) => `${x.automationRate}%`, sort: (x) => x.automationRate },
              { key: 'ex', label: 'Exceptions', align: 'right', render: (x) => `${x.exceptionRate}%`, sort: (x) => x.exceptionRate },
              { key: 'b', label: 'Bottleneck', render: (x) => <span className="text-xs text-ink-2">{x.bottleneck}</span>, className: 'max-w-[240px]' },
              { key: 'h', label: 'Health', render: (x) => <StatusPill status={x.health} why={x.why} /> },
            ]} />
            <p className="text-xs text-ink-3 mt-2">Click a process name for detail; the chart below follows your selection.</p>
          </Card>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <Card title={`Cycle time trend · ${p.name}`} className="lg:col-span-2"><TrendChart series={p.series} target={p.targetCycleTime} name="Cycle time" unit={` ${p.unit}`} /></Card>
            <Card title="Bottleneck analysis">
              <dl className="text-sm space-y-2">
                <div><dt className="text-[11px] uppercase tracking-wide text-ink-3">Bottleneck</dt><dd className="font-medium text-ink">{p.bottleneck}</dd></div>
                <div><dt className="text-[11px] uppercase tracking-wide text-ink-3">Business impact</dt><dd>{p.businessImpact}</dd></div>
                <div><dt className="text-[11px] uppercase tracking-wide text-ink-3">Technology dependency</dt><dd className="flex flex-wrap gap-x-2">{p.appIds.map((a) => <RecLink key={a} d={d} id={a} className="text-brand-700">{d.applications.find((x) => x.id === a)!.name}</RecLink>)}</dd></div>
                <div><dt className="text-[11px] uppercase tracking-wide text-ink-3">Improvement opportunity</dt><dd className="font-medium text-brand-900">{p.opportunity}</dd></div>
              </dl>
            </Card>
          </div>
        </>
      )}
      {t === 'pipeline' && (
        <Card title="Process transformation pipeline">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">{STAGES.map((s) => (
            <div key={s} className="rounded-lg border border-line bg-slate-50 p-3">
              <div className="font-semibold text-sm text-ink mb-2">{s} <span className="text-xs text-ink-3">{d.processes.filter((x) => x.stage === s).length}</span></div>
              {d.processes.filter((x) => x.stage === s).map((x) => <RecLink key={x.id} d={d} id={x.id}><span className={`block text-xs rounded border px-2 py-1 mb-1 ${ragBg[x.health]} ${ragText[x.health]}`}>{x.name}</span></RecLink>)}
            </div>
          ))}</div>
          <p className="text-xs text-ink-3 mt-2">Discover → Model (Signavio-style design) → Improve → Automate → Monitor (Celonis-style mining). Colour = current process health.</p>
        </Card>
      )}
      {t === 'customer' && <CustomerTab domainId={d.domain} />}
    </>
  )
}

function Ratio({ p }: { p: Process }) {
  const r = p.cycleTime / p.targetCycleTime
  return (
    <div className="w-36">
      <div className="h-2 bg-slate-100 rounded-full relative overflow-hidden"><div className={`h-full ${r > 2.2 ? 'bg-crit' : r > 1.1 ? 'bg-warn' : 'bg-ok'}`} style={{ width: `${Math.min(100, (r / 3) * 100)}%` }} /><div className="absolute top-0 bottom-0 w-0.5 bg-brand-950" style={{ left: `${100 / 3}%` }} /></div>
      <span className="text-xs">{p.cycleTime} {p.unit} vs {p.targetCycleTime} {p.unit} ({r.toFixed(1)}×)</span>
    </div>
  )
}
