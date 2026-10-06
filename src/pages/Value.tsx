import { CartesianGrid, Legend, Line, LineChart, PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { areas, domainOrder, domains } from '../data/domains'
import { useStore } from '../store'
import { domainColor } from '../theme'
import { Card, PageHeader, money } from '../components/ui'

const colors = domainColor

const kpiDims = [
  ['Strategy', '% priority initiatives aligned to enterprise objectives'],
  ['Operations', 'Cycle time, throughput, RCA time, automation rate'],
  ['Finance', 'ROI, avoided cost, OPEX/CAPEX impact, unit AI cost'],
  ['Governance', 'Control coverage, exceptions, audit completeness'],
  ['AI quality', 'Task success, groundedness, human override, challenge yield'],
  ['Adoption', 'Active users, accepted recommendations'],
]

export default function Value() {
  const { domain, realisedCr } = useStore()
  const radar = areas.map((a) => ({
    area: a,
    ...Object.fromEntries(domainOrder.map((id) => [domains[id].name, domains[id].problems[a].progress])),
  }))
  const trend = domains.banking.valueTrend.map((t, i) => ({
    month: t.month,
    ...Object.fromEntries(domainOrder.map((id) => [domains[id].name, domains[id].valueTrend[i].value])),
  }))

  return (
    <>
      <PageHeader title="Business Value" subtitle="Cross-domain value realisation — proof that one framework works across industries" />
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        {domainOrder.map((id) => {
          const d = domains[id]
          return (
            <Card key={id}>
              <div className="text-[11px] uppercase font-semibold" style={{ color: colors[id] }}>{d.name}{d.configuredOnly && ' · config only'}</div>
              <div className="text-2xl font-bold mt-1">{money(areas.reduce((s, a) => s + d.problems[a].valueCr, 0))}<span className="text-sm font-medium text-slate-400"> / yr at target</span></div>
              <div className="text-xs text-slate-500">ROI {d.kpis.roi}% · maturity {d.maturity.current} → {d.maturity.target}</div>
            </Card>
          )
        })}
      </div>
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <Card title="Progress to Target by Workstream">
          <div className="h-72">
            <ResponsiveContainer>
              <RadarChart data={radar}>
                <PolarGrid /><PolarAngleAxis dataKey="area" tick={{ fontSize: 11 }} />
                {domainOrder.map((id) => <Radar isAnimationActive={false} key={id} dataKey={domains[id].name} stroke={colors[id]} fill={colors[id]} fillOpacity={0.15} />)}
                <Legend wrapperStyle={{ fontSize: 12 }} /><Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Monthly Value Delivered (₹ Cr)">
          <div className="h-72">
            <ResponsiveContainer>
              <LineChart data={trend} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip /><Legend wrapperStyle={{ fontSize: 12 }} />
                {domainOrder.map((id) => <Line isAnimationActive={false} key={id} dataKey={domains[id].name} stroke={colors[id]} strokeWidth={2} />)}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <Card title={`${domain.name} — Value Summary`}>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-slate-500">AI value (annual)</dt><dd className="font-bold">{money(domain.kpis.revenueImpact + realisedCr)}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Cost saved</dt><dd className="font-bold">{money(domain.kpis.costSaved)}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Approved this session</dt><dd className="font-bold text-emerald-700">+{money(realisedCr)}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Programme ROI</dt><dd className="font-bold">{domain.kpis.roi}%</dd></div>
          </dl>
        </Card>
        <Card title="KPI Framework" className="lg:col-span-2">
          <div className="grid sm:grid-cols-2 gap-3">
            {kpiDims.map(([t, d]) => <div key={t} className="rounded-lg border border-line p-3"><div className="font-semibold text-sm text-blue-800">{t}</div><div className="text-xs text-slate-500">{d}</div></div>)}
          </div>
        </Card>
      </div>
    </>
  )
}
