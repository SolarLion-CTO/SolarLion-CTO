import { Bar as RBar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { DomainData, Rag } from '../../../data/sim'
import { Card } from '../../../components/ui'
import { Bar2, StatusPill, ragBg, ragText } from '../../../components/sim/primitives'
import { RecordTable } from '../../../components/sim/RecordTable'
import { axisTick, chart } from '../../../theme'
import { NameCell, RecLink, cr } from '../common'
import { FunctionKpis } from './kpis'

const rag = (v: number, g: number, a: number): Rag => (v <= g ? 'Green' : v <= a ? 'Amber' : 'Red')

export default function Planview({ d }: { d: DomainData }) {
  const ins = d.initiatives
  const objName = (id: string) => d.objectives.find((o) => o.id === id)?.name ?? id
  const totBudget = ins.reduce((s, i) => s + i.budgetCr, 0)
  const chartData = ins.map((i) => ({ name: i.name.length > 26 ? i.name.slice(0, 25) + '…' : i.name, Budget: i.budgetCr, Forecast: i.forecastCr }))
  const valueRatio = (i: (typeof ins)[number]) => (i.expectedValueCr * (i.plannedProgress / 100) * 0.6 ? (i.valueRealizedCr / (i.expectedValueCr * (i.plannedProgress / 100) * 0.6)) * 100 : 100)
  return (
    <>
      <FunctionKpis d={d} fn="strategy" />
      <Card title="Strategic objectives" className="mb-5">
        <RecordTable label="objectives" rows={d.objectives} minWidth={860} cols={[
          { key: 'n', label: 'Objective', render: (o) => <NameCell d={d} id={o.id} name={o.name} sub={o.outcome} />, className: 'max-w-[300px]' },
          { key: 'p', label: 'Priority', render: (o) => <span className="text-xs font-medium">{o.priority}</span> },
          { key: 's', label: 'Sponsor · tech owner', render: (o) => <span className="text-xs">{o.sponsor}<br /><span className="text-ink-3">{o.owner}</span></span> },
          { key: 'pr', label: 'Progress', render: (o) => <div className="w-28"><Bar2 value={o.progress} /><span className="text-xs">{o.progress}%</span></div>, sort: (o) => o.progress },
          { key: 'inv', label: 'Investment', align: 'right', render: (o) => cr(o.investmentCr), sort: (o) => o.investmentCr },
          { key: 'v', label: 'Value realised / expected', align: 'right', render: (o) => <span className="text-xs">{cr(o.realizedValueCr)} / {cr(o.expectedValueCr)}</span> },
          { key: 'h', label: 'Health', render: (o) => <StatusPill status={o.health} why={o.why} /> },
        ]} />
      </Card>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        <Card title="Strategic initiatives" className="lg:col-span-2">
          <RecordTable label="initiatives" rows={ins} minWidth={900} cols={[
            { key: 'n', label: 'Initiative', render: (i) => <NameCell d={d} id={i.id} name={i.name} sub={objName(i.objectiveId)} />, className: 'max-w-[260px]' },
            { key: 'pr', label: 'Progress vs plan', render: (i) => <div className="w-28"><Bar2 value={i.progress} planned={i.plannedProgress} /><span className="text-xs">{i.progress}% / plan {i.plannedProgress}%</span></div>, sort: (i) => i.progress - i.plannedProgress },
            { key: 'b', label: 'Budget', align: 'right', render: (i) => cr(i.budgetCr), sort: (i) => i.budgetCr },
            { key: 'a', label: 'Actual', align: 'right', render: (i) => cr(i.actualCr) },
            { key: 'f', label: 'Forecast', align: 'right', render: (i) => <span className={i.forecastCr > i.budgetCr * 1.05 ? 'text-crit-text font-semibold' : ''}>{cr(i.forecastCr)}</span>, sort: (i) => i.forecastCr / i.budgetCr },
            { key: 'r', label: 'ROI', align: 'right', render: (i) => `${i.expectedRoi}%` },
            { key: 'h', label: 'Health', render: (i) => <StatusPill status={i.health} why={i.why} /> },
          ]} />
        </Card>
        <Card title="Investment allocation by objective">
          <ul className="space-y-3">{d.objectives.map((o) => (
            <li key={o.id}>
              <div className="flex justify-between text-sm gap-2"><RecLink d={d} id={o.id} className="text-ink font-medium truncate">{o.name}</RecLink><span className="tabular-nums shrink-0">{cr(o.investmentCr)}</span></div>
              <Bar2 value={o.investmentCr} max={totBudget} />
              <div className="text-[11px] text-ink-3">{Math.round((o.investmentCr / totBudget) * 100)}% of ₹{Math.round(totBudget)} Cr · {o.priority}</div>
            </li>
          ))}</ul>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card title="Budget vs forecast by initiative (₹ Cr)">
          <div className="h-80">
            <ResponsiveContainer>
              <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={chart.grid} />
                <XAxis type="number" tick={axisTick} /><YAxis type="category" dataKey="name" width={170} tick={axisTick} />
                <Tooltip formatter={(v) => `₹${v} Cr`} /><Legend wrapperStyle={{ fontSize: 12 }} />
                <RBar isAnimationActive={false} dataKey="Budget" fill={chart.comparison} radius={[0, 4, 4, 0]} />
                <RBar isAnimationActive={false} dataKey="Forecast" fill={chart.primary} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Initiative heatmap">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[460px] border-separate border-spacing-y-1">
              <thead><tr className="text-[11px] uppercase tracking-wide text-ink-3 text-left"><th className="pl-1">Initiative</th><th className="text-center">Schedule</th><th className="text-center">Cost</th><th className="text-center">Value</th><th className="text-center">Risk</th></tr></thead>
              <tbody>{ins.map((i) => {
                const cells: [Rag, string][] = [
                  [rag(i.plannedProgress - i.progress, 5, 10), `${i.progress - i.plannedProgress} pts`],
                  [rag((i.forecastCr / i.budgetCr - 1) * 100, 5, 10), `${Math.round((i.forecastCr / i.budgetCr - 1) * 100)}%`],
                  [rag(100 - valueRatio(i), 10, 30), `${Math.round(valueRatio(i))}%`],
                  [i.risk === 'Low' ? 'Green' : i.risk === 'Medium' ? 'Amber' : 'Red', i.risk],
                ]
                return (
                  <tr key={i.id}>
                    <td className="pl-1 pr-2 py-1"><RecLink d={d} id={i.id} className="text-ink">{i.name}</RecLink></td>
                    {cells.map(([h, t], k) => <td key={k} className="px-0.5"><div className={`text-center text-xs font-medium rounded py-1 border ${ragBg[h]} ${ragText[h]}`}>{t}</div></td>)}
                  </tr>
                )
              })}</tbody>
            </table>
          </div>
          <p className="text-xs text-ink-3 mt-2">Schedule = progress vs plan · Cost = forecast vs budget · Value = realised vs plan to date · Risk = initiative risk.</p>
        </Card>
      </div>
    </>
  )
}
