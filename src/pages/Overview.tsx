import { Link } from 'react-router-dom'
import { Bar as RBar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts'
import { Activity, Bot, DollarSign, Gauge, ShieldCheck, TrendingUp, Gavel } from 'lucide-react'
import { domains, plannedDomains } from '../data/domains'
import type { DomainPack } from '../data/domains'
import { useStore } from '../store'
import { Badge, Bar, Card, Kpi, PageHeader, Ring, money } from '../components/ui'

const dimColors: Record<string, string> = {
  strategy: 'bg-blue-600', governance: 'bg-emerald-600', platform: 'bg-violet-600', modernization: 'bg-orange-500', operations: 'bg-cyan-600',
}

const overall = (d: DomainPack) =>
  Math.round(Object.values(d.dimensions).reduce((a, b) => a + b, 0) / Object.values(d.dimensions).length)

export default function Overview() {
  const { domain, domainId, setDomainId, audit } = useStore()
  const health = overall(domain)
  const agentCounts = ['Active', 'Idle', 'Training', 'Error'].map((s) => ({
    name: s, value: domain.agents.filter((a) => a.status === s).length,
  })).filter((x) => x.value > 0)
  const agentColors: Record<string, string> = { Active: '#16a34a', Idle: '#2563eb', Training: '#f59e0b', Error: '#dc2626' }
  const totalInvest = domain.initiatives.reduce((a, i) => a + i.investment, 0)
  const totalValue = domain.initiatives.reduce((a, i) => a + i.value, 0)

  const valueBars = [
    { name: 'Revenue impact', now: domain.kpis.revenueImpact, prev: +(domain.kpis.revenueImpact * 0.87).toFixed(1) },
    { name: 'Cost saved', now: domain.kpis.costSaved, prev: +(domain.kpis.costSaved * 0.9).toFixed(1) },
    { name: 'Risk avoided', now: +(domain.kpis.costSaved * 0.55).toFixed(1), prev: +(domain.kpis.costSaved * 0.5).toFixed(1) },
    { name: 'Time saved', now: +(domain.kpis.revenueImpact * 0.3).toFixed(1), prev: +(domain.kpis.revenueImpact * 0.27).toFixed(1) },
  ]

  return (
    <>
      <PageHeader title="Executive Overview" subtitle={`${domain.name} · ${domain.tagline} · Last 30 days`} />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <Kpi icon={DollarSign} label="AI revenue impact" value={money(domain.kpis.revenueImpact)} delta="↑ 12.6% vs last period" tone="bg-blue-600" />
        <Kpi icon={TrendingUp} label="Cost saved" value={money(domain.kpis.costSaved)} delta="↑ 8.4% vs last period" tone="bg-rose-600" />
        <Kpi icon={Gauge} label="Programme ROI" value={`${domain.kpis.roi}%`} delta="↑ 14.2% vs last period" tone="bg-violet-600" />
        <Kpi icon={Activity} label="Productivity" value={`${domain.kpis.productivity}%`} delta="↑ 9.1% vs last period" tone="bg-sky-600" />
        <Kpi icon={ShieldCheck} label="Compliance score" value={`${domain.kpis.compliance}%`} delta="↑ 3.5% vs last period" tone="bg-emerald-600" />
      </div>

      <Card title="Industry Portfolio Summary" className="mb-6" action={<span className="text-xs text-slate-500">Same framework · different domain packs</span>}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="text-[11px] uppercase text-slate-500 border-b">
                <th className="text-left py-2 font-semibold">Industry domain</th>
                {Object.keys(domain.dimensions).map((k) => <th key={k} className="text-left py-2 font-semibold capitalize px-2">{k}</th>)}
                <th className="py-2 font-semibold">Overall</th>
                <th className="text-right py-2 font-semibold">Value / yr</th>
              </tr>
            </thead>
            <tbody>
              {Object.values(domains).map((d) => (
                <tr
                  key={d.id}
                  onClick={() => setDomainId(d.id)}
                  className={`border-b cursor-pointer ${d.id === domainId ? 'bg-blue-50/60' : 'hover:bg-slate-50'}`}
                >
                  <td className="py-3 font-semibold">{d.name} {d.id === domainId && <span className="ml-1 text-[10px] text-blue-700">● viewing</span>}</td>
                  {Object.entries(d.dimensions).map(([k, v]) => (
                    <td key={k} className="px-2 py-3 w-[13%]">
                      <div className="text-xs font-semibold mb-1">{v}%</div>
                      <Bar value={v} color={dimColors[k]} />
                    </td>
                  ))}
                  <td className="py-2"><div className="flex justify-center"><Ring value={overall(d)} /></div></td>
                  <td className="text-right font-bold text-emerald-700">{money(d.initiatives.reduce((a, i) => a + i.value, 0))}</td>
                </tr>
              ))}
              {plannedDomains.map((p) => (
                <tr key={p} className="border-b text-slate-400">
                  <td className="py-2.5">{p}</td>
                  <td colSpan={5} className="px-2 text-xs italic">Planned — reuse core framework, add domain pack (use cases, regulations, KPIs)</td>
                  <td className="text-center text-xs">—</td>
                  <td className="text-right text-xs">—</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <Card title="Business Value Realization ($M)">
          <div className="h-56">
            <ResponsiveContainer>
              <BarChart data={valueBars} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <RBar dataKey="now" name="This period" fill="#1d4ed8" radius={[3, 3, 0, 0]} />
                <RBar dataKey="prev" name="Previous" fill="#cbd5e1" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 rounded-lg bg-slate-50 p-3 text-center">
            <div className="text-[11px] uppercase text-slate-500 font-semibold">Total annual value vs investment</div>
            <div className="text-xl font-extrabold text-emerald-700">{money(totalValue)} <span className="text-slate-400 text-sm font-medium">on {money(totalInvest)}</span></div>
          </div>
        </Card>

        <Card title="Transformation Maturity">
          <div className="space-y-3">
            {[
              ['Strategy alignment', domain.dimensions.strategy],
              ['Governance coverage', domain.dimensions.governance],
              ['Platform readiness', domain.dimensions.platform],
              ['Modernization', domain.dimensions.modernization],
              ['Operational excellence', domain.dimensions.operations],
            ].map(([label, v]) => (
              <div key={label as string}>
                <div className="flex justify-between text-xs mb-1"><span>{label}</span><span className="font-semibold">{v}%</span></div>
                <Bar value={v as number} />
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-center">
            <div className="rounded-lg bg-slate-50 p-2"><div className="text-[11px] text-slate-500">Current level</div><div className="font-extrabold text-lg">{domain.maturity.current} / 5</div><div className="text-[11px] text-blue-700">{domain.maturity.label}</div></div>
            <div className="rounded-lg bg-slate-50 p-2"><div className="text-[11px] text-slate-500">Target (12 mo)</div><div className="font-extrabold text-lg">{domain.maturity.target} / 5</div><div className="text-[11px] text-blue-700">Decision-Intelligent</div></div>
          </div>
        </Card>

        <Card title="Enterprise Health Score">
          <div className="h-48 relative">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={[{ v: health }, { v: 100 - health }]} dataKey="v" innerRadius={60} outerRadius={80} startAngle={90} endAngle={-270} stroke="none">
                  <Cell fill="#1d4ed8" /><Cell fill="#e2e8f0" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-3xl font-extrabold">{health}%</div>
              <div className="text-xs text-emerald-600 font-semibold">{health >= 85 ? 'Healthy' : 'Improving'}</div>
            </div>
          </div>
          <ul className="text-xs space-y-1.5 mt-2">
            {domain.initiatives.slice(0, 4).map((i) => (
              <li key={i.id} className="flex justify-between gap-2"><span className="truncate">{i.name}</span><Badge>{i.status}</Badge></li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card title="AI & Agentic AI">
          <div className="flex items-center gap-3">
            <div className="h-28 w-28 shrink-0">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={agentCounts} dataKey="value" innerRadius={30} outerRadius={50} stroke="none">
                    {agentCounts.map((a) => <Cell key={a.name} fill={agentColors[a.name]} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="text-xs space-y-1">
              {agentCounts.map((a) => <li key={a.name}><span style={{ color: agentColors[a.name] }}>●</span> {a.name} ({a.value})</li>)}
            </ul>
          </div>
          <Link to="/agents" className="text-xs text-blue-700 font-semibold mt-2 inline-block">View agents →</Link>
        </Card>
        <Card title="Decision Engine">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Pending human review</span><b>{domain.decisions.length - audit.filter((a) => a.decisionId.includes(domainId === 'banking' ? 'BNK' : 'MFG')).length}</b></div>
            <div className="flex justify-between"><span className="text-slate-500">Decided this session</span><b>{audit.length}</b></div>
            <div className="flex justify-between"><span className="text-slate-500">Avg AI confidence</span><b>{Math.round(domain.decisions.reduce((a, d) => a + d.confidence, 0) / domain.decisions.length * 100)}%</b></div>
            <div className="flex justify-between"><span className="text-slate-500">Auto-approved</span><b className="text-emerald-700">0 — by design</b></div>
          </div>
          <Link to="/decisions" className="text-xs text-blue-700 font-semibold mt-3 inline-flex items-center gap-1"><Gavel size={12} /> Open Decision Center →</Link>
        </Card>
        <Card title="Governance">
          <div className="flex items-center gap-4">
            <Ring value={domain.kpis.compliance} size={70} color="#16a34a" />
            <div className="text-xs space-y-1">
              <div>{domain.controls.filter((c) => c.status === 'Compliant').length} compliant controls</div>
              <div>{domain.controls.filter((c) => c.status === 'Partial').length} partial</div>
              <div className="text-red-600 font-semibold">{domain.controls.filter((c) => c.status === 'Gap').length} gap(s)</div>
            </div>
          </div>
          <Link to="/governance" className="text-xs text-blue-700 font-semibold mt-3 inline-block">View controls →</Link>
        </Card>
        <Card title="Initiatives">
          <div className="text-3xl font-extrabold">{domain.initiatives.length}</div>
          <div className="text-xs text-slate-500 mb-2">across 5 workstreams</div>
          {(['Assess', 'Design', 'Pilot', 'Scale', 'Operate'] as const).map((s) => (
            <div key={s} className="flex justify-between text-xs"><span>{s}</span><b>{domain.initiatives.filter((i) => i.stage === s).length}</b></div>
          ))}
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card title="Recent Alerts">
          <ul className="space-y-2">
            {domain.alerts.map((a) => (
              <li key={a.text} className="flex items-start gap-3 text-sm">
                <Badge>{a.level === 'Critical' ? 'Critical' : a.level}</Badge>
                <span className="flex-1">{a.text}</span>
                <span className="text-xs text-slate-400">{a.time}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Recent Activity">
          <ul className="space-y-2 text-sm">
            {audit.slice(0, 3).map((a) => (
              <li key={a.decisionId + a.at} className="flex gap-3"><span className="text-xs text-slate-400 w-16">{a.at}</span><span className="flex-1">{a.decisionId} {a.verdict.toLowerCase()} by {a.by}</span><Badge>{a.verdict}</Badge></li>
            ))}
            <li className="flex gap-3"><span className="text-xs text-slate-400 w-16">10:21</span><span className="flex-1"><Bot size={13} className="inline" /> {domain.agents[0].name} executed scheduled run</span><Badge>Info</Badge></li>
            <li className="flex gap-3"><span className="text-xs text-slate-400 w-16">09:45</span><span className="flex-1">Policy updated: AI data access policy v2.1</span><Badge>Info</Badge></li>
          </ul>
        </Card>
      </div>
    </>
  )
}
