import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { customer, customerStatus } from '../../data/resilience'
import type { DomainId } from '../../data/domains'
import { Badge, Card, Stat } from '../../components/ui'
import { axisTick, chart } from '../../theme'
import StagePath from './StagePath'

export default function CustomerTab({ domainId }: { domainId: DomainId }) {
  const c = customer[domainId]
  const st = customerStatus(c)
  const last = c.trend[c.trend.length - 2]
  const prev = c.trend[c.trend.length - 3]
  const loop = [
    ['Feedback received', c.loop.received], ['Ticket raised', c.loop.ticketed], ['Root cause found', c.loop.rootCaused], ['Fixed', c.loop.fixed], ['Customer informed', c.loop.informed],
  ] as const
  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <Stat label="CSAT (last full month)" value={`${last.csat}%`} sub={`${last.csat - prev.csat >= 0 ? '+' : ''}${last.csat - prev.csat} vs previous month`} tone={st.health === 'Healthy' ? 'default' : 'warn'} />
        <Stat label="Net Promoter Score" value={last.nps} sub="promoters − detractors" />
        <Stat label="Customer effort" value={`${c.ces} / 7`} sub="lower is better" />
        <Stat label="Feedback loop closed" value={`${Math.round((c.loop.informed / c.loop.received) * 100)}%`} sub="customer told what changed" tone={c.loop.informed / c.loop.received < 0.6 ? 'warn' : 'default'} />
      </div>

      <Card title="CSAT trend — linked to incidents" className="mb-5" action={<Badge>{st.health}</Badge>}>
        <div className="h-56">
          <ResponsiveContainer>
            <LineChart data={c.trend} margin={{ left: -15, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} vertical={false} />
              <XAxis dataKey="month" tick={axisTick} /><YAxis domain={[60, 90]} tick={axisTick} /><Tooltip />
              <Line isAnimationActive={false} dataKey="csat" name="CSAT %" stroke={chart.primary} strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="text-sm mt-2"><b className="text-brand-900">Insight:</b> {c.insight}</p>
        {st.reasons.length > 0 && <p className="text-xs text-ink-3 mt-1">Status: {st.reasons.join(' · ')}</p>}
      </Card>

      <div className="grid lg:grid-cols-3 gap-5 mb-5">
        <Card title="Closed feedback loop">
          <ul className="space-y-2.5">{loop.map(([l, v]) => (
            <li key={l}>
              <div className="flex justify-between text-sm"><span className="text-ink">{l}</span><span className="font-semibold tabular-nums">{v.toLocaleString('en-IN')}</span></div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1"><div className="h-full bg-brand-600" style={{ width: `${(v / c.loop.received) * 100}%` }} /></div>
            </li>
          ))}</ul>
        </Card>
        <Card title="Top complaint themes (AI-summarised)">
          <ul className="space-y-2 text-sm">{c.themes.map((t) => (
            <li key={t.theme} className="flex justify-between gap-2 border-b border-line last:border-0 pb-1.5">
              <span><span className="text-ink">{t.theme}</span>{t.linkedApp && <span className="block text-xs text-ink-3">linked app: {t.linkedApp}</span>}</span>
              <span className="font-semibold tabular-nums">{t.share}%</span>
            </li>
          ))}</ul>
        </Card>
        <Card title="Feedback channels">
          <table className="w-full text-sm [&_th]:px-1 [&_td]:px-1">
            <thead><tr className="text-[11px] uppercase tracking-wide text-ink-3 border-b border-line text-left"><th className="py-2">Channel</th><th className="text-right">Share</th><th className="text-right">CSAT</th></tr></thead>
            <tbody>{c.channels.map((x) => (
              <tr key={x.channel} className="border-b border-line last:border-0"><td className="py-1.5">{x.channel}</td><td className="text-right">{x.share}%</td><td className={`text-right ${x.csat < 70 ? 'text-warn-text font-semibold' : ''}`}>{x.csat}%</td></tr>
            ))}</tbody>
          </table>
        </Card>
      </div>

      <Card title="Improvements — current → proposed → pilot">
        <div className="grid md:grid-cols-2 gap-4">
          {c.improvements.map((i) => (
            <div key={i.name} className="rounded-lg border border-line p-3 text-sm">
              <div className="font-semibold text-ink mb-1">{i.name}</div>
              <div className="text-xs text-ink-3">Current</div><div className="mb-1">{i.current}</div>
              <div className="text-xs text-ink-3">Proposed</div><div className="mb-2 font-medium text-brand-900">{i.proposed}</div>
              <StagePath imp={i} /><div className="text-xs text-ink-3 mt-2">Owner {i.owner} · feasibility {i.feasibility}/10</div>
            </div>
          ))}
        </div>
      </Card>
    </>
  )
}
