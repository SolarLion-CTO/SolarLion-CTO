import { useState } from 'react'
import { areaOwner, areas, domainOrder, domains } from '../data/domains'
import type { Area, DomainId } from '../data/domains'
import { useStore } from '../store'
import ProblemPanel from '../components/ProblemPanel'
import { Bar, Card, PageHeader, money } from '../components/ui'

const healthDot: Record<string, string> = { 'On Track': 'bg-emerald-500', 'At Risk': 'bg-amber-500', Delayed: 'bg-red-500' }

export default function Problems() {
  const { domainId } = useStore()
  const [sel, setSel] = useState<{ d: DomainId; a: Area }>({ d: domainId, a: 'Operations' })
  const total = domainOrder.reduce((s, d) => s + areas.reduce((x, a) => x + domains[d].problems[a].valueCr, 0), 0)

  return (
    <>
      <PageHeader title="Problem Matrix" subtitle="The exact business problem per domain and workstream — one framework, three industries" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card><div className="text-[11px] uppercase font-semibold text-slate-500">Problems tracked</div><div className="text-2xl font-extrabold">{domainOrder.length * areas.length}</div><div className="text-xs text-slate-500">3 domains × 5 workstreams</div></Card>
        <Card><div className="text-[11px] uppercase font-semibold text-slate-500">Value at target</div><div className="text-2xl font-extrabold text-emerald-700">{money(total)}</div><div className="text-xs text-slate-500">per year, all domains</div></Card>
        <Card><div className="text-[11px] uppercase font-semibold text-slate-500">At risk</div><div className="text-2xl font-extrabold text-amber-600">{domainOrder.reduce((s, d) => s + areas.filter((a) => domains[d].problems[a].health !== 'On Track').length, 0)}</div><div className="text-xs text-slate-500">need a gate review</div></Card>
        <Card><div className="text-[11px] uppercase font-semibold text-slate-500">Reused agents in Retail</div><div className="text-2xl font-extrabold text-blue-700">4 of 5</div><div className="text-xs text-slate-500">added by configuration</div></Card>
      </div>

      <Card title="Domain × Workstream" className="mb-6" action={<span className="text-xs text-slate-500">Click a cell for the full problem</span>}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[820px] border-separate border-spacing-2">
            <thead>
              <tr>
                <th className="text-left text-[11px] uppercase text-slate-500 w-40">Workstream · owner</th>
                {domainOrder.map((d) => (
                  <th key={d} className="text-left text-[11px] uppercase text-slate-500">
                    {domains[d].name}{domains[d].configuredOnly && <span className="ml-1 normal-case text-blue-600">(config only)</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {areas.map((a) => (
                <tr key={a}>
                  <td className="align-top pt-2">
                    <div className="font-bold">{a}</div>
                    <div className="text-xs text-slate-500">{areaOwner[a]}</div>
                  </td>
                  {domainOrder.map((d) => {
                    const p = domains[d].problems[a]
                    const active = sel.d === d && sel.a === a
                    return (
                      <td key={d} className="align-top">
                        <button
                          onClick={() => setSel({ d, a })}
                          className={`w-full text-left rounded-lg border p-3 transition ${active ? 'border-blue-600 ring-2 ring-blue-200 bg-blue-50/50' : 'border-slate-200 hover:border-blue-300 bg-white'}`}
                        >
                          <div className="flex items-start gap-2">
                            <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${healthDot[p.health]}`} />
                            <span className="font-semibold leading-snug">{p.title}</span>
                          </div>
                          <div className="text-xs text-slate-500 mt-2">{p.kpi}</div>
                          <div className="text-xs mt-0.5"><span className="text-slate-400">{p.baseline}</span> → <b>{p.current}</b> → <span className="text-emerald-700">{p.target}</span></div>
                          <div className="mt-2"><Bar value={p.progress} /></div>
                        </button>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex gap-4 text-xs text-slate-500 mt-2 px-2">
          <span><span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-1" />On track</span>
          <span><span className="inline-block w-2 h-2 rounded-full bg-amber-500 mr-1" />At risk</span>
          <span><span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-1" />Delayed</span>
        </div>
      </Card>

      <ProblemPanel p={domains[sel.d].problems[sel.a]} domainName={domains[sel.d].name} />
    </>
  )
}
