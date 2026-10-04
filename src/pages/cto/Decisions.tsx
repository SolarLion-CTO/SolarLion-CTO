import { Link } from 'react-router-dom'
import { ctoDecisions, ctoDoesNot } from '../../data/cto'
import type { CtoRole } from '../../data/cto'
import { Card, PageHeader } from '../../components/ui'

const roleTone: Record<CtoRole, string> = { Decides: 'bg-[#0b2a6b] text-white', 'Co-approves': 'bg-blue-600 text-white', 'Recommends to board': 'bg-violet-600 text-white', 'Sets guardrail': 'bg-amber-500 text-white' }
const statusTone = { Decided: 'text-emerald-700', Pending: 'text-amber-600', Upcoming: 'text-slate-500' }

export default function CtoDecisions() {
  const by = (s: string) => ctoDecisions.filter((d) => d.status === s).length
  return (
    <>
      <PageHeader title="What the CTO Decides" subtitle="Decision rights of the CTO and the control tower — and what they deliberately do not decide" owner="Ram (CTO)" />

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card><div className="text-[11px] uppercase text-slate-500 font-semibold">Decided</div><div className="text-3xl font-extrabold text-emerald-700">{by('Decided')}</div></Card>
        <Card><div className="text-[11px] uppercase text-slate-500 font-semibold">Pending</div><div className="text-3xl font-extrabold text-amber-600">{by('Pending')}</div></Card>
        <Card><div className="text-[11px] uppercase text-slate-500 font-semibold">Upcoming</div><div className="text-3xl font-extrabold text-slate-500">{by('Upcoming')}</div></Card>
      </div>

      <Card title="CTO decision log" className="mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead><tr className="text-[11px] uppercase text-slate-500 border-b text-left"><th className="py-2">Decision</th><th>CTO role</th><th>Status</th><th>When</th><th>Outcome</th><th>Why</th></tr></thead>
            <tbody>{ctoDecisions.map((d) => (
              <tr key={d.decision} className="border-b last:border-0 align-top">
                <td className="py-2 pr-2 font-semibold">{d.decision}</td>
                <td className="pr-2"><span className={`text-[10px] font-bold rounded px-1.5 py-0.5 whitespace-nowrap ${roleTone[d.role]}`}>{d.role}</span></td>
                <td className={`pr-2 font-semibold ${statusTone[d.status]}`}>{d.status}</td>
                <td className="pr-2 text-xs whitespace-nowrap">{d.when}</td>
                <td className="pr-2">{d.outcome}</td>
                <td className="text-xs text-slate-500">{d.why}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card title="Decision rights">
          <ul className="text-sm space-y-2">
            <li><span className={`text-[10px] font-bold rounded px-1.5 py-0.5 mr-2 ${roleTone.Decides}`}>Decides</span>platform, architecture, vendors, model policy</li>
            <li><span className={`text-[10px] font-bold rounded px-1.5 py-0.5 mr-2 ${roleTone['Sets guardrail']}`}>Sets guardrail</span>rules every team must follow — trust before AI, routing, stop criteria</li>
            <li><span className={`text-[10px] font-bold rounded px-1.5 py-0.5 mr-2 ${roleTone['Co-approves']}`}>Co-approves</span>gate releases and cross-functional decisions with CFO / CISO</li>
            <li><span className={`text-[10px] font-bold rounded px-1.5 py-0.5 mr-2 ${roleTone['Recommends to board']}`}>Recommends</span>investment waves and scale-out to the board</li>
          </ul>
          <Link to="/decisions" className="text-xs text-blue-700 font-semibold mt-3 inline-block">Business decisions live in the Decision Center →</Link>
        </Card>
        <Card title="What the CTO does not decide">
          <ul className="text-sm space-y-2">{ctoDoesNot.map((x) => <li key={x} className="flex gap-2"><span className="text-red-600 font-bold">✕</span>{x}</li>)}</ul>
        </Card>
      </div>
    </>
  )
}
