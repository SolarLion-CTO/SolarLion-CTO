import { useState } from 'react'
import { Bar as RBar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { DomainData, Rag } from '../../../data/sim'
import { SIM_NOW } from '../../../data/sim'
import { Card } from '../../../components/ui'
import { MetricCard, StatusPill, Tile } from '../../../components/sim/primitives'
import { RecordTable } from '../../../components/sim/RecordTable'
import { TrendChart } from '../../../components/sim/charts'
import { axisTick, chart } from '../../../theme'
import AppsTab from '../../domain/AppsTab'
import DrTab from '../../domain/DrTab'
import PnlTab from '../../domain/PnlTab'
import { NameCell, RecLink, Tabs, cr, ragFrom } from '../common'

type T = 'services' | 'incidents' | 'apps' | 'dr' | 'pnl'

export default function Datadog({ d, tab, setTab }: { d: DomainData; tab: string; setTab: (t: string) => void }) {
  const t = (['services', 'incidents', 'apps', 'dr', 'pnl'].includes(tab) ? tab : 'services') as T
  const sv = d.services
  const [sel, setSel] = useState(sv.find((s) => s.health === 'Red')?.id ?? sv[0].id)
  const s = sv.find((x) => x.id === sel)!
  const metric = (k: string) => d.metrics.find((m) => m.functionId === 'technology' && m.key === k)!
  const met = sv.filter((x) => x.availability >= x.slo).length
  const mttr = Math.round((sv.reduce((a, x) => a + x.mttrH, 0) / sv.length) * 10) / 10
  const cost = sv.reduce((a, x) => a + x.costCrYr, 0)
  const err = Math.round((sv.reduce((a, x) => a + x.errorRate, 0) / sv.length) * 100) / 100
  const T0 = Date.parse(SIM_NOW)
  const weeks = Array.from({ length: 13 }, (_, k) => {
    const end = T0 - (12 - k) * 7 * 86_400_000, start = end - 7 * 86_400_000
    const inc = d.incidents.filter((i) => Date.parse(i.start) > start && Date.parse(i.start) <= end)
    return { w: `W${k + 1}`, 'P1–P2': inc.filter((i) => i.severity === 'P1' || i.severity === 'P2').length, 'P3–P4': inc.filter((i) => i.severity === 'P3' || i.severity === 'P4').length }
  })
  const incRows = d.incidents.map((i) => ({ ...i, name: i.businessImpact, health: (i.severity === 'P1' ? 'Red' : i.severity === 'P2' ? 'Amber' : 'Green') as Rag }))
  const svcName = (id: string) => sv.find((x) => x.id === id)?.name ?? id
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-3 mb-5">
        <MetricCard m={metric('avail')} />
        <Tile label="Services meeting SLO" value={`${met} of ${sv.length}`} target={`${sv.length}`} status={ragFrom(met === sv.length, met >= sv.length - 2)} />
        <MetricCard m={metric('p1')} />
        <Tile label="Mean time to restore" value={`${mttr} h`} target="≤ 1.5 h" status={ragFrom(mttr <= 1.5, mttr <= 2.5)} note="all incidents, 90 days" />
        <Tile label="Service run cost" value={cr(cost) + '/yr'} target="within plan" status="Green" note="infrastructure and cloud" />
        <Tile label="Average error rate" value={`${err}%`} target="≤ 0.3%" status={ragFrom(err <= 0.3, err <= 0.5)} />
      </div>
      <Tabs<T> value={t} onChange={setTab} tabs={[
        { id: 'services', label: 'Critical services', count: sv.length },
        { id: 'incidents', label: 'Incidents (90 days)', count: d.incidents.length },
        { id: 'apps', label: 'Applications & incidents (programme view)' },
        { id: 'dr', label: 'DR & continuity' },
        { id: 'pnl', label: 'Business impact (P&L)' },
      ]} />
      {t === 'services' && (
        <>
          <Card className="mb-5">
            <RecordTable label="services" rows={sv} minWidth={1060} cols={[
              { key: 'n', label: 'Service', render: (x) => <button onClick={() => setSel(x.id)} className="text-left"><NameCell d={d} id={x.id} name={x.name} sub={x.capability} /></button> },
              { key: 'h', label: 'Health', render: (x) => <StatusPill status={x.health} why={x.why} label={x.status} /> },
              { key: 'a', label: 'Availability / SLO', align: 'right', render: (x) => <span className={x.availability < x.slo ? 'text-crit-text font-semibold' : ''}>{x.availability}% / {x.slo}%</span>, sort: (x) => x.availability - x.slo },
              { key: 'l', label: 'Latency', align: 'right', render: (x) => <span className={x.latencyMs > x.latencyTargetMs ? 'text-warn-text font-semibold' : ''}>{x.latencyMs} / {x.latencyTargetMs} ms</span>, sort: (x) => x.latencyMs / x.latencyTargetMs },
              { key: 'e', label: 'Errors', align: 'right', render: (x) => `${x.errorRate}%`, sort: (x) => x.errorRate },
              { key: 'r', label: 'Requests / min', align: 'right', render: (x) => x.requestsPerMin.toLocaleString('en-IN'), sort: (x) => x.requestsPerMin },
              { key: 'i', label: 'Incidents 30d', align: 'right', render: (x) => <span>{x.incidents30}{x.p1_30 ? <b className="text-crit-text"> ({x.p1_30} P1)</b> : ''}</span>, sort: (x) => x.incidents30 },
              { key: 'm', label: 'MTTR', align: 'right', render: (x) => `${x.mttrH} h`, sort: (x) => x.mttrH },
              { key: 'slo', label: 'SLO met (12 m)', align: 'right', render: (x) => `${x.sloCompliance}%`, sort: (x) => x.sloCompliance },
            ]} />
          </Card>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card title={`Availability · ${s.name}`}><TrendChart series={s.availabilitySeries} target={s.slo} name="Availability" unit="%" /></Card>
            <Card title="Incident trend (weekly, last 13 weeks)">
              <div className="h-[200px]">
                <ResponsiveContainer>
                  <BarChart data={weeks} margin={{ left: -20, right: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} vertical={false} />
                    <XAxis dataKey="w" tick={axisTick} /><YAxis tick={axisTick} allowDecimals={false} /><Tooltip />
                    <RBar isAnimationActive={false} dataKey="P1–P2" stackId="a" fill={chart.primary} />
                    <RBar isAnimationActive={false} dataKey="P3–P4" stackId="a" fill={chart.comparison} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex gap-4 text-xs text-ink-3"><span><span className="inline-block w-3 h-3 rounded-sm mr-1 align-middle" style={{ background: chart.primary }} />P1–P2</span><span><span className="inline-block w-3 h-3 rounded-sm mr-1 align-middle" style={{ background: chart.comparison }} />P3–P4</span></div>
            </Card>
          </div>
        </>
      )}
      {t === 'incidents' && (
        <Card>
          <RecordTable label="incidents" rows={incRows} pageSize={12} minWidth={1060} cols={[
            { key: 'id', label: 'Incident', render: (i) => <RecLink d={d} id={i.id} className="font-semibold text-ink">{i.id}</RecLink>, sort: (i) => i.start },
            { key: 's', label: 'Severity', render: (i) => <span className={`text-xs font-semibold ${i.severity === 'P1' ? 'text-crit-text' : i.severity === 'P2' ? 'text-warn-text' : 'text-ink-3'}`}>{i.severity}</span>, sort: (i) => i.severity },
            { key: 'sv', label: 'Service', render: (i) => <RecLink d={d} id={i.serviceId} className="text-xs">{svcName(i.serviceId)}</RecLink> },
            { key: 'st', label: 'Started', render: (i) => <span className="text-xs whitespace-nowrap">{new Date(i.start).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>, sort: (i) => i.start },
            { key: 'du', label: 'Duration', align: 'right', render: (i) => `${i.durationMin} min`, sort: (i) => i.durationMin },
            { key: 'rc', label: 'Root cause', render: (i) => <span className="text-xs">{i.rootCause}</span> },
            { key: 'cu', label: 'Customers', align: 'right', render: (i) => (i.customersImpacted ? i.customersImpacted.toLocaleString('en-IN') : '—'), sort: (i) => i.customersImpacted },
            { key: 'ch', label: 'Related change', render: (i) => <span className="text-xs text-ink-3">{i.relatedChange ?? '—'}</span> },
            { key: 'res', label: 'Resolution', render: (i) => <span className="text-xs">{i.status === 'Open' ? <b className="text-crit-text">Open</b> : i.resolution}</span> },
          ]} />
        </Card>
      )}
      {t === 'apps' && <AppsTab domainId={d.domain} />}
      {t === 'dr' && <DrTab domainId={d.domain} />}
      {t === 'pnl' && <PnlTab domainId={d.domain} />}
    </>
  )
}
