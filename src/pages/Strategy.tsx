import { CartesianGrid, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis } from 'recharts'
import { useStore } from '../store'
import ProblemPanel from '../components/ProblemPanel'
import { Badge, Bar, Card, PageHeader, money } from '../components/ui'

export default function Strategy() {
  const { domain } = useStore()
  const points = domain.initiatives.map((i) => ({ name: i.name, x: i.investment, y: i.value, z: i.progress }))
  const ranked = [...domain.initiatives].sort((a, b) => b.value / b.investment - a.value / a.investment)

  return (
    <>
      <PageHeader title="Strategy & ROI" subtitle="Identify ROI, prioritise AI opportunities, and transform the organisation to AI" owner="Suman" />
      <ProblemPanel p={domain.problems.Strategy} domainName={domain.name} />

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <Card title="Value vs Investment (₹ Cr)">
          <div className="h-72">
            <ResponsiveContainer>
              <ScatterChart margin={{ left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" dataKey="x" name="Investment" unit=" Cr" tick={{ fontSize: 11 }} />
                <YAxis type="number" dataKey="y" name="Annual value" unit=" Cr" tick={{ fontSize: 11 }} />
                <ZAxis dataKey="z" range={[80, 400]} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={(v) => `₹${v} Cr`} labelFormatter={() => ''} />
                <Scatter isAnimationActive={false} data={points} fill="#1d4ed8" fillOpacity={0.7} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-slate-500">Top-left = quick wins (high value, low investment). Bubble size = delivery progress.</p>
        </Card>
        <Card title="Transformation Roadmap">
          <div className="space-y-3">
            {(['Assess', 'Design', 'Pilot', 'Scale', 'Operate'] as const).map((stage, idx) => {
              const items = domain.initiatives.filter((i) => i.stage === stage)
              return (
                <div key={stage} className="flex gap-3">
                  <div className="w-20 shrink-0"><div className="text-xs font-bold text-blue-700">Phase {idx + 1}</div><div className="text-sm font-semibold">{stage}</div></div>
                  <div className="flex-1 flex flex-wrap gap-1.5 border-l-2 border-blue-100 pl-3 min-h-8">
                    {items.length ? items.map((i) => <span key={i.id} className="text-xs bg-slate-100 rounded px-2 py-1">{i.id} · {i.name}</span>) : <span className="text-xs text-slate-400">—</span>}
                  </div>
                </div>
              )
            })}
          </div>
          <div className="mt-4 rounded-lg bg-blue-50 p-3 text-xs">
            <b>Maturity:</b> {domain.maturity.current} ({domain.maturity.label}) → target {domain.maturity.target}. Funding is released gate by gate.
          </div>
        </Card>
      </div>

      <Card title="Prioritised Initiative Portfolio — ranked by ROI multiple">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[760px]">
            <thead><tr className="text-[11px] uppercase text-slate-500 border-b text-left">
              <th className="py-2">#</th><th>Initiative</th><th>Workstream</th><th>Owner</th><th>Investment</th><th>Value / yr</th><th>ROI</th><th>Risk</th><th className="w-32">Progress</th>
            </tr></thead>
            <tbody>
              {ranked.map((i, n) => (
                <tr key={i.id} className="border-b">
                  <td className="py-2.5 font-bold text-blue-700">{n + 1}</td>
                  <td className="font-medium">{i.name}</td><td>{i.area}</td><td>{i.owner}</td>
                  <td>{money(i.investment)}</td><td className="text-emerald-700 font-semibold">{money(i.value)}</td>
                  <td className="font-semibold">{(i.value / i.investment).toFixed(1)}×</td>
                  <td><Badge>{i.risk}</Badge></td>
                  <td><div className="flex items-center gap-2"><Bar value={i.progress} /><span className="text-xs">{i.progress}%</span></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  )
}
