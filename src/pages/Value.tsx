import { CartesianGrid, Legend, Line, LineChart, PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { domains } from '../data/domains'
import { useStore } from '../store'
import { Card, PageHeader, money } from '../components/ui'

const kpiDims = [
  ['Strategy', '% priority initiatives aligned to enterprise objectives'],
  ['Operations', 'Cycle time, throughput, RCA time, automation rate'],
  ['Finance', 'ROI, avoided cost, OPEX/CAPEX impact, unit AI cost'],
  ['Governance', 'Control coverage, exceptions, audit completeness'],
  ['AI quality', 'Task success, groundedness, human override rate'],
  ['Adoption', 'Active users, accepted recommendations'],
]

export default function Value() {
  const { domain } = useStore()
  const b = domains.banking
  const m = domains.manufacturing
  const radar = Object.keys(b.dimensions).map((k) => ({
    dim: k[0].toUpperCase() + k.slice(1),
    Banking: b.dimensions[k as keyof typeof b.dimensions],
    Manufacturing: m.dimensions[k as keyof typeof m.dimensions],
  }))
  const trend = b.valueTrend.map((t, i) => ({ month: t.month, Banking: t.value, Manufacturing: m.valueTrend[i].value }))

  return (
    <>
      <PageHeader title="Business Value" subtitle="Cross-domain value realisation — proof that one framework works across industries" />
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <Card title="Cross-Domain Maturity Comparison">
          <div className="h-72">
            <ResponsiveContainer>
              <RadarChart data={radar}>
                <PolarGrid /><PolarAngleAxis dataKey="dim" tick={{ fontSize: 11 }} />
                <Radar dataKey="Banking" stroke="#1d4ed8" fill="#1d4ed8" fillOpacity={0.25} />
                <Radar dataKey="Manufacturing" stroke="#16a34a" fill="#16a34a" fillOpacity={0.25} />
                <Legend wrapperStyle={{ fontSize: 12 }} /><Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Monthly Value Delivered ($M)">
          <div className="h-72">
            <ResponsiveContainer>
              <LineChart data={trend} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip /><Legend wrapperStyle={{ fontSize: 12 }} />
                <Line dataKey="Banking" stroke="#1d4ed8" strokeWidth={2} />
                <Line dataKey="Manufacturing" stroke="#16a34a" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <Card title={`${domain.name} — Value Summary`}>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-slate-500">Revenue impact</dt><dd className="font-bold">{money(domain.kpis.revenueImpact)}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Cost saved</dt><dd className="font-bold">{money(domain.kpis.costSaved)}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Programme ROI</dt><dd className="font-bold">{domain.kpis.roi}%</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Maturity</dt><dd className="font-bold">{domain.maturity.current} → {domain.maturity.target}</dd></div>
          </dl>
        </Card>
        <Card title="KPI Framework" className="lg:col-span-2">
          <div className="grid sm:grid-cols-2 gap-3">
            {kpiDims.map(([t, d]) => (
              <div key={t} className="rounded-lg border border-slate-200 p-3"><div className="font-semibold text-sm text-blue-800">{t}</div><div className="text-xs text-slate-500">{d}</div></div>
            ))}
          </div>
        </Card>
      </div>
    </>
  )
}
