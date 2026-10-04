import { Area, AreaChart, Bar as RBar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { areas, erpEconomics } from '../data/domains'
import { useStore } from '../store'
import ProblemPanel from '../components/ProblemPanel'
import { Card, PageHeader, money } from '../components/ui'

export default function Finance() {
  const { domain } = useStore()
  const invest = domain.initiatives.reduce((a, i) => a + i.investment, 0)
  const value = domain.initiatives.reduce((a, i) => a + i.value, 0)
  const capex = domain.capexOpex.reduce((a, q) => a + q.capex, 0)
  const opex = domain.capexOpex.reduce((a, q) => a + q.opex, 0)
  const byArea = areas.map((a) => ({
    name: a,
    investment: +domain.initiatives.filter((i) => i.area === a).reduce((s, i) => s + i.investment, 0).toFixed(1),
    value: +domain.initiatives.filter((i) => i.area === a).reduce((s, i) => s + i.value, 0).toFixed(1),
  }))

  return (
    <>
      <PageHeader title="Finance & Investment" subtitle="Governance of apps, resources and investment decisions · OPEX vs CAPEX · value realisation" owner="Santhosh" />
      <ProblemPanel p={domain.problems.Finance} domainName={domain.name} />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {[
          ['Total investment', money(invest)],
          ['Annual value', money(value)],
          ['Value multiple', `${(value / invest).toFixed(1)}×`],
          ['CAPEX (FY)', money(capex)],
          ['OPEX (FY)', money(opex)],
        ].map(([l, v]) => (
          <Card key={l}><div className="text-[11px] uppercase font-semibold text-slate-500">{l}</div><div className="text-2xl font-extrabold mt-1">{v}</div></Card>
        ))}
      </div>

      <Card title="Flagship DEC-OPS-001 · ERP capacity — 3-year cumulative cost (₹ lakh)" className="mb-6">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-64">
            <ResponsiveContainer>
              <LineChart data={erpEconomics} margin={{ left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="year" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip formatter={(v) => `₹${v} L`} /><Legend wrapperStyle={{ fontSize: 12 }} />
                <Line dataKey="Cloud" stroke="#60a5fa" strokeWidth={2} />
                <Line dataKey="On-prem" stroke="#94a3b8" strokeWidth={2} />
                <Line dataKey="Hybrid" stroke="#16a34a" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3"><div className="text-2xl font-extrabold text-emerald-700">₹1.06 Cr</div><div className="text-xs">3-year hybrid cost — lowest of the three</div></div>
            <div className="rounded-lg bg-slate-50 p-3"><div className="text-2xl font-extrabold">~12 months</div><div className="text-xs">payback on ₹60 L/yr benefit</div></div>
            <div className="rounded-lg bg-slate-50 p-3"><div className="text-2xl font-extrabold">~70%</div><div className="text-xs">3-year ROI</div></div>
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-2">Cloud is cheapest in Year 1 but fails DPDP residency for restricted ERP data; on-prem needs ₹1.07 Cr upfront. Illustrative figures — replace with the team baseline before final submission.</p>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <Card title="CAPEX vs OPEX by Quarter (₹ Cr)">
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={domain.capexOpex} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="quarter" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip /><Legend wrapperStyle={{ fontSize: 12 }} />
                <RBar dataKey="capex" name="CAPEX" stackId="a" fill="#1d4ed8" />
                <RBar dataKey="opex" name="OPEX" stackId="a" fill="#60a5fa" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Monthly Value vs Run Cost (₹ Cr)">
          <div className="h-64">
            <ResponsiveContainer>
              <AreaChart data={domain.valueTrend} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip /><Legend wrapperStyle={{ fontSize: 12 }} />
                <Area dataKey="value" name="Value delivered" stroke="#16a34a" fill="#bbf7d0" />
                <Area dataKey="cost" name="Run cost" stroke="#dc2626" fill="#fecaca" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card title="Investment vs Annual Value by Workstream (₹ Cr)">
        <div className="h-64">
          <ResponsiveContainer>
            <BarChart data={byArea} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip /><Legend wrapperStyle={{ fontSize: 12 }} />
              <RBar dataKey="investment" name="Investment" fill="#94a3b8" radius={[3, 3, 0, 0]} />
              <RBar dataKey="value" name="Annual value" fill="#16a34a" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </>
  )
}
