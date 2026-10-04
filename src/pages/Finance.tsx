import { Area, AreaChart, Bar as RBar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useStore } from '../store'
import { Card, PageHeader, money } from '../components/ui'

export default function Finance() {
  const { domain } = useStore()
  const invest = domain.initiatives.reduce((a, i) => a + i.investment, 0)
  const value = domain.initiatives.reduce((a, i) => a + i.value, 0)
  const capex = domain.capexOpex.reduce((a, q) => a + q.capex, 0)
  const opex = domain.capexOpex.reduce((a, q) => a + q.opex, 0)
  const byStream = ['Strategy', 'Operations', 'Finance', 'Governance', 'AI Control'].map((w) => ({
    name: w,
    investment: +domain.initiatives.filter((i) => i.workstream === w).reduce((a, i) => a + i.investment, 0).toFixed(1),
    value: +domain.initiatives.filter((i) => i.workstream === w).reduce((a, i) => a + i.value, 0).toFixed(1),
  }))

  return (
    <>
      <PageHeader title="Finance & Investment" subtitle="Investment governance, OPEX / CAPEX and value realisation" owner="Santhosh" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          ['Total investment', money(invest)],
          ['Annual value', money(value)],
          ['CAPEX (FY)', money(capex)],
          ['OPEX (FY)', money(opex)],
        ].map(([l, v]) => (
          <Card key={l}><div className="text-[11px] uppercase font-semibold text-slate-500">{l}</div><div className="text-2xl font-extrabold mt-1">{v}</div></Card>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <Card title="CAPEX vs OPEX by Quarter ($M)">
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
          <p className="text-xs text-slate-500">Shift from CAPEX to OPEX as pilots move to run state.</p>
        </Card>
        <Card title="Monthly Value vs Run Cost ($M)">
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
      <Card title="Investment vs Value by Workstream ($M)">
        <div className="h-64">
          <ResponsiveContainer>
            <BarChart data={byStream} margin={{ left: -20 }}>
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
