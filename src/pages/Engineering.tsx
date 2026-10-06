import { Link } from 'react-router-dom'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useStore } from '../store'
import { domainOrder, domains } from '../data/domains'
import { engineering } from '../data/engineering'
import { domainHealth } from '../data/signals'
import { buildTree, dimMeta, dims, flatten, roles } from '../data/tracker'
import { Badge, Card, PageHeader, Stat } from '../components/ui'
import { axisTick, chart } from '../theme'

export default function Engineering() {
  const { domainId } = useStore()
  const e = engineering[domainId]
  const h = domainHealth(domainId)
  const trees = dims.map((dim) => ({ dim, t: buildTree(dim, domainId) }))
  const items = trees.flatMap(({ dim, t }) => flatten(t).map((x) => ({ ...x.node, dim })))
  const byLevel = roles.map((r, i) => ({ r, total: items.filter((n) => n.level === i + 1).length, red: items.filter((n) => n.level === i + 1 && n.status === 'Delayed').length }))
  const blockers = items.filter((n) => n.blocker)

  return (
    <>
      <PageHeader title="Engineering" subtitle={`${domains[domainId].name} — delivery speed, stability and the plan from CTO to developer`} owner="Ram (CTO)" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <Stat label="Deployment frequency" value={`${e.deploysPerWeek} / week`} sub="to production" />
        <Stat label="Lead time for change" value={`${e.leadTimeDays} days`} sub="commit → production" tone={e.leadTimeDays > 10 ? 'warn' : 'default'} />
        <Stat label="Change failure rate" value={`${h.changeFail}%`} sub="changes causing incidents" tone={h.changeFail > 10 ? 'warn' : 'default'} />
        <Stat label="Mean time to restore" value={`${h.mttr} h`} sub="average across apps" tone={h.mttr > 2.5 ? 'warn' : 'default'} />
      </div>

      <div className="grid lg:grid-cols-3 gap-5 mb-5">
        <Card title="Deployments per month" className="lg:col-span-2">
          <div className="h-56">
            <ResponsiveContainer>
              <LineChart data={e.trend} margin={{ left: -15, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} vertical={false} />
                <XAxis dataKey="month" tick={axisTick} /><YAxis tick={axisTick} /><Tooltip />
                <Line isAnimationActive={false} dataKey="deploys" name="Deployments" stroke={chart.primary} strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Domains compared">
          <table className="w-full text-sm [&_th]:px-1 [&_td]:px-1">
            <thead><tr className="text-[11px] uppercase tracking-wide text-ink-3 border-b border-line text-left"><th className="py-2">Domain</th><th className="text-right">Deploys/wk</th><th className="text-right">Lead time</th><th className="text-right">Change fail</th></tr></thead>
            <tbody>{domainOrder.map((d) => (
              <tr key={d} className={`border-b border-line last:border-0 ${d === domainId ? 'bg-brand-50' : ''}`}><td className="py-2 font-medium">{domains[d].name}</td><td className="text-right">{engineering[d].deploysPerWeek}</td><td className="text-right whitespace-nowrap">{engineering[d].leadTimeDays} d</td><td className="text-right">{domainHealth(d).changeFail}%</td></tr>
            ))}</tbody>
          </table>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-5 mb-5">
        <Card title="Team capacity & delivery" className="lg:col-span-2">
          <table className="w-full text-sm [&_th]:px-2 [&_td]:px-2">
            <thead><tr className="text-[11px] uppercase tracking-wide text-ink-3 border-b border-line text-left"><th className="py-2">Team</th><th className="w-48">Capacity used</th><th className="text-right">Work in progress</th><th className="text-right">Milestones on time</th></tr></thead>
            <tbody>{e.teams.map((t) => (
              <tr key={t.team} className="border-b border-line last:border-0">
                <td className="py-2.5 font-medium text-ink">{t.team}</td>
                <td><div className="flex items-center gap-2"><div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full ${t.capacity >= 95 ? 'bg-warn' : 'bg-brand-600'}`} style={{ width: `${t.capacity}%` }} /></div><span className="text-xs w-9 text-right">{t.capacity}%</span></div></td>
                <td className="text-right">{t.wip}</td>
                <td className={`text-right ${t.onTime < 75 ? 'text-warn-text font-semibold' : ''}`}>{t.onTime}%</td>
              </tr>
            ))}</tbody>
          </table>
          <p className="text-xs text-ink-3 mt-2">Teams above 95% capacity have no room for incidents — expect delivery to slip.</p>
        </Card>
        <Card title="Plan health by role level">
          <ul className="space-y-1.5 text-sm">{byLevel.map((l, i) => (
            <li key={l.r} className="flex items-center gap-2"><span className="text-[10px] font-semibold text-white bg-slate-700 rounded px-1.5 w-8 text-center">L{i + 1}</span><span className="flex-1">{l.r}</span><span className="tabular-nums">{l.total}</span><span className="text-xs text-crit-text font-semibold w-12 text-right">{l.red > 0 ? `${l.red} red` : ''}</span></li>
          ))}</ul>
          <Link to="/tracker" className="text-xs font-semibold text-brand-600 mt-3 inline-block">Delivery portfolio →</Link>
        </Card>
      </div>

      <Card title="Blockers raised by delivery teams">
        {blockers.length === 0 ? <p className="text-sm text-success-text">No blockers in this domain’s plans.</p> : (
          <ul className="space-y-2">{blockers.map((b) => (
            <li key={b.id} className="flex flex-wrap gap-2 items-start text-sm border-b border-line last:border-0 pb-2">
              <Badge>{b.status}</Badge>
              <div className="flex-1 min-w-0"><div className="font-medium text-ink">{b.blocker}</div><div className="text-xs text-ink-3">{dimMeta[b.dim].slug.toUpperCase()} · {b.title} · {b.owner}</div></div>
              <Link to={`/tracker/${dimMeta[b.dim].slug}`} className="text-xs font-semibold text-brand-600">Open plan →</Link>
            </li>
          ))}</ul>
        )}
      </Card>
    </>
  )
}
