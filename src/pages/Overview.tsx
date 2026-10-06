import { Link } from 'react-router-dom'
import { Bar as RBar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Activity, Bot, DollarSign, Gauge, Gavel, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react'
import { areaOwner, areas, domainOrder, domains, overallScore, plannedDomains } from '../data/domains'
import { useStore } from '../store'
import { gateState } from '../data/tedif'
import ExecSummary from './overview/ExecSummary'
import { Badge, Card, Kpi, PageHeader, Ring, money } from '../components/ui'

const heat = (v: number) => (v >= 75 ? 'bg-seq-550 text-white' : v >= 55 ? 'bg-seq-400 text-white' : v >= 45 ? 'bg-seq-250 text-ink' : 'bg-seq-100 text-ink')

export default function Overview() {
  const { domain, domainId, setDomainId, audit, decisions, verdictFor, realisedCr } = useStore()
  const health = overallScore(domain)
  const pending = decisions.filter((d) => !verdictFor(d.id)).length
  const agentCounts = (['Active', 'Idle', 'Training', 'Error'] as const)
    .map((s) => ({ name: s, value: domain.agents.filter((a) => a.status === s).length }))
    .filter((x) => x.value > 0)
  const agentColors: Record<string, string> = { Active: '#16a34a', Idle: '#2563eb', Training: '#f59e0b', Error: '#dc2626' }
  const invest = domain.initiatives.reduce((a, i) => a + i.investment, 0)
  const value = domain.initiatives.reduce((a, i) => a + i.value, 0)
  const revenue = domain.kpis.revenueImpact + realisedCr
  const roi = Math.round(domain.kpis.roi + (realisedCr / invest) * 100)

  const areaValue = areas.map((a) => ({ name: a, value: domain.problems[a].valueCr, progress: domain.problems[a].progress }))

  return (
    <>
      <PageHeader title="Executive Overview" subtitle={`${domain.name} — what is happening, why it matters, and what needs a decision`} />
      <ExecSummary />
      <h2 className="text-xl font-semibold text-ink mb-4 pt-2 border-t border-line">Detail</h2>

      {realisedCr > 0 && (
        <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-2 text-sm text-emerald-800 flex items-center gap-2">
          <Sparkles size={15} /> {money(realisedCr)} of annual value added from decisions approved this session — KPIs updated.
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6 [&>*:last-child]:col-span-2 lg:[&>*:last-child]:col-span-1">
        <Kpi icon={DollarSign} label="AI value (annual)" value={money(revenue)} delta="↑ 12.6% vs last quarter" tone="bg-blue-600" />
        <Kpi icon={TrendingUp} label="Cost saved" value={money(domain.kpis.costSaved)} delta="↑ 8.4% vs last quarter" tone="bg-rose-600" />
        <Kpi icon={Gauge} label="Programme ROI" value={`${roi}%`} delta={`on ${money(invest)} invested`} tone="bg-violet-600" />
        <Kpi icon={Activity} label="Productivity" value={`${domain.kpis.productivity}%`} delta="↑ 9.1% vs last quarter" tone="bg-sky-600" />
        <Kpi icon={ShieldCheck} label="Compliance" value={`${domain.kpis.compliance}%`} delta={`${domain.controls.filter((c) => c.status === 'Gap').length} control gap(s)`} tone="bg-emerald-600" />
      </div>

      <Card title="Transformation Heatmap — progress to target per problem" className="mb-6" action={<Link to="/problems" className="text-xs text-blue-700 font-semibold">Open Problem Matrix →</Link>}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[760px]">
            <thead>
              <tr className="text-[11px] uppercase text-slate-500 border-b">
                <th className="text-left py-2 font-semibold">Domain</th>
                {areas.map((a) => <th key={a} className="text-left py-2 font-semibold px-1">{a}<div className="normal-case font-normal text-slate-400">{areaOwner[a]}</div></th>)}
                <th className="py-2 font-semibold">Overall</th>
                <th className="text-right py-2 font-semibold">Value at target</th>
              </tr>
            </thead>
            <tbody>
              {domainOrder.map((id) => {
                const d = domains[id]
                return (
                  <tr key={id} onClick={() => setDomainId(id)} className={`border-b cursor-pointer ${id === domainId ? 'bg-blue-50/60' : 'hover:bg-slate-50'}`}>
                    <td className="py-3 font-semibold whitespace-nowrap">
                      {d.name}
                      {d.configuredOnly && <span className="ml-1 text-[10px] text-blue-600">config only</span>}
                      {id === domainId && <span className="ml-1 text-[10px] text-blue-700">● viewing</span>}
                    </td>
                    {areas.map((a) => {
                      const p = d.problems[a]
                      return (
                        <td key={a} className="px-1 py-2">
                          <div className={`rounded-md ${heat(p.progress)} px-2 py-1.5`} title={p.title}>
                            <div className="text-xs font-semibold">{p.progress}%</div>
                            <div className="text-[10px] opacity-90 truncate max-w-[130px]">{p.title}</div>
                          </div>
                        </td>
                      )
                    })}
                    <td className="py-2"><div className="flex justify-center"><Ring value={overallScore(d)} /></div></td>
                    <td className="text-right font-bold text-emerald-700 whitespace-nowrap">{money(areas.reduce((s, a) => s + d.problems[a].valueCr, 0))}</td>
                  </tr>
                )
              })}
              {plannedDomains.map((p) => (
                <tr key={p} className="border-b text-slate-400">
                  <td className="py-2">{p}</td>
                  <td colSpan={5} className="px-2 text-xs italic">Planned — reuse the core, configure a domain pack (decisions, KPIs, MCP connectors, policies)</td>
                  <td className="text-center text-xs">—</td><td className="text-right text-xs">—</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap gap-4 text-xs text-slate-500 mt-3">
          <span className="font-medium text-ink-2">Progress to target:</span>
          <span><span className="inline-block w-3 h-3 rounded bg-seq-100 mr-1 align-middle" />&lt; 45%</span>
          <span><span className="inline-block w-3 h-3 rounded bg-seq-250 mr-1 align-middle" />45–54%</span>
          <span><span className="inline-block w-3 h-3 rounded bg-seq-400 mr-1 align-middle" />55–74%</span>
          <span><span className="inline-block w-3 h-3 rounded bg-seq-550 mr-1 align-middle" />≥ 75%</span>
          <span className="text-ink-3">· health is shown by the status badges</span>
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <Card title={`Value at Target by Workstream (₹ Cr)`}>
          <div className="h-56">
            <ResponsiveContainer>
              <BarChart data={areaValue} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 10 }} /><Tooltip formatter={(v) => `₹${v} Cr`} />
                <RBar isAnimationActive={false} dataKey="value" name="Annual value" fill="#1d4ed8" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 rounded-lg bg-slate-50 p-3 text-center">
            <div className="text-[11px] uppercase text-slate-500 font-semibold">Initiative value vs investment</div>
            <div className="text-xl font-bold text-emerald-700">{money(value)} <span className="text-slate-400 text-sm font-medium">on {money(invest)}</span></div>
          </div>
        </Card>

        <Card title="Transformation Maturity">
          <div className="flex items-center justify-around mb-3">
            <div className="text-center"><div className="text-[11px] text-slate-500">Current</div><div className="text-3xl font-bold">{domain.maturity.current}</div><div className="text-xs text-blue-700">{domain.maturity.label}</div></div>
            <div className="text-2xl text-slate-300">→</div>
            <div className="text-center"><div className="text-[11px] text-slate-500">Target (12 mo)</div><div className="text-3xl font-bold text-emerald-700">{domain.maturity.target}</div><div className="text-xs text-blue-700">Decision-intelligent</div></div>
          </div>
          <div className="text-[11px] uppercase font-semibold text-slate-500 mb-2">TEDIF gates <Link to="/tedif" className="normal-case text-blue-700 ml-1">tracker →</Link></div>
          <div className="flex gap-1">
            {['Assess', 'Design', 'Build', 'Operate', 'Optimize'].map((g, i) => {
              const st = gateState[domainId][i].outcome
              return (
                <div key={g} title={`Gate ${i + 1}: ${st}`} className={`flex-1 rounded text-center py-1.5 text-[10px] font-semibold ${st === 'Approved' ? 'bg-emerald-600 text-white' : st === 'In review' ? 'bg-amber-400 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  G{i + 1}<br />{g}
                </div>
              )
            })}
          </div>
          <div className="text-xs text-slate-500 mt-3">MCP connectors: {domain.mcpConnectors.join(' · ')}</div>
        </Card>

        <Card title="Enterprise Health Score">
          <div className="h-44 relative">
            <ResponsiveContainer>
              <PieChart>
                <Pie isAnimationActive={false} data={[{ v: health }, { v: 100 - health }]} dataKey="v" innerRadius={55} outerRadius={75} startAngle={90} endAngle={-270} stroke="none">
                  <Cell fill="#1d4ed8" /><Cell fill="#e2e8f0" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-3xl font-bold">{health}%</div>
              <div className="text-[11px] text-slate-500">avg progress</div>
            </div>
          </div>
          <ul className="text-xs space-y-1.5 mt-2">
            {areas.map((a) => (
              <li key={a} className="flex justify-between gap-2"><span>{a}</span><Badge>{domain.problems[a].health}</Badge></li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card title="AI Agents">
          <div className="flex items-center gap-3">
            <div className="h-28 w-28 shrink-0">
              <ResponsiveContainer>
                <PieChart>
                  <Pie isAnimationActive={false} data={agentCounts} dataKey="value" innerRadius={30} outerRadius={50} stroke="none">
                    {agentCounts.map((a) => <Cell key={a.name} fill={agentColors[a.name]} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="text-xs space-y-1">{agentCounts.map((a) => <li key={a.name}><span style={{ color: agentColors[a.name] }}>●</span> {a.name} ({a.value})</li>)}</ul>
          </div>
          <Link to="/agents" className="text-xs text-blue-700 font-semibold mt-2 inline-block">View agents →</Link>
        </Card>
        <Card title="Decision Engine">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Awaiting human decision</span><b>{pending}</b></div>
            <div className="flex justify-between"><span className="text-slate-500">Decided this session</span><b>{audit.length}</b></div>
            <div className="flex justify-between"><span className="text-slate-500">Challenged before deciding</span><b>{audit.filter((a) => a.challenged).length}</b></div>
            <div className="flex justify-between"><span className="text-slate-500">Auto-approved</span><b className="text-emerald-700">0 — by design</b></div>
          </div>
          <Link to="/decisions" className="text-xs text-blue-700 font-semibold mt-3 inline-flex items-center gap-1"><Gavel size={12} /> Open Decision Center →</Link>
        </Card>
        <Card title="Governance">
          <div className="flex items-center gap-4">
            <Ring value={domain.kpis.compliance} size={70} color="#16a34a" />
            <div className="text-xs space-y-1">
              <div>{domain.controls.filter((c) => c.status === 'Compliant').length} compliant</div>
              <div>{domain.controls.filter((c) => c.status === 'Partial').length} partial</div>
              <div className="text-red-600 font-semibold">{domain.controls.filter((c) => c.status === 'Gap').length} gap(s)</div>
            </div>
          </div>
          <Link to="/governance" className="text-xs text-blue-700 font-semibold mt-3 inline-block">View controls →</Link>
        </Card>
        <Card title="Initiatives by Stage">
          <div className="text-3xl font-bold">{domain.initiatives.length}</div>
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
              <li key={a.text} className="flex items-start gap-3 text-sm"><Badge>{a.level}</Badge><span className="flex-1">{a.text}</span><span className="text-xs text-slate-400">{a.time}</span></li>
            ))}
          </ul>
        </Card>
        <Card title="Recent Activity">
          <ul className="space-y-2 text-sm">
            {audit.slice(0, 4).map((a) => (
              <li key={a.decisionId + a.at} className="flex gap-3"><span className="text-xs text-slate-400 w-16 shrink-0">{a.at}</span><span className="flex-1">{a.decisionId} {a.verdict.toLowerCase()} by {a.by}</span><Badge>{a.verdict}</Badge></li>
            ))}
            <li className="flex gap-3"><span className="text-xs text-slate-400 w-16 shrink-0">10:21</span><span className="flex-1"><Bot size={13} className="inline" /> {domain.agents[0].name} ran via MCP · {domain.agents[0].mcp}</span><Badge>Info</Badge></li>
            <li className="flex gap-3"><span className="text-xs text-slate-400 w-16 shrink-0">09:45</span><span className="flex-1">Policy updated: AI data access policy v2.1</span><Badge>Info</Badge></li>
          </ul>
        </Card>
      </div>
    </>
  )
}
