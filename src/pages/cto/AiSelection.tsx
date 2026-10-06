import { useState } from 'react'
import { aiChoices, techniqueGuide } from '../../data/cto'
import type { Technique } from '../../data/cto'
import { domainOrder, domains } from '../../data/domains'
import type { DomainId } from '../../data/domains'
import { Badge, Card, PageHeader } from '../../components/ui'

const tTone: Record<Technique, string> = { 'Rules (no AI)': 'bg-slate-600', 'Classic ML': 'bg-teal-600', GenAI: 'bg-blue-600', RAG: 'bg-indigo-600', 'Agentic AI': 'bg-violet-600' }

export default function AiSelection() {
  const [filter, setFilter] = useState<DomainId | 'all'>('all')
  const list = aiChoices.filter((c) => filter === 'all' || c.domain === filter || c.domain === 'all')
  const counts = techniqueGuide.map((t) => ({ t: t.t, n: list.filter((c) => c.techniques.includes(t.t)).length }))

  return (
    <>
      <PageHeader title="AI Technique Selection" subtitle="ML, GenAI, RAG or agentic AI — chosen per use case, with the reason and the alternatives rejected" owner="Ram (CTO)" />

      <Card title="Selection guide" className="mb-6">
        <div className="grid md:grid-cols-5 gap-3">
          {techniqueGuide.map((g) => (
            <div key={g.t} className="rounded-lg border border-line overflow-hidden">
              <div className={`${tTone[g.t]} text-white text-sm font-bold px-3 py-2 flex justify-between`}>{g.t}<span className="opacity-80">{counts.find((c) => c.t === g.t)?.n}</span></div>
              <div className="p-3 text-xs space-y-2">
                <div><b className="text-emerald-700">Use when:</b> {g.when}</div>
                <div><b className="text-red-600">Avoid when:</b> {g.avoid}</div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-3">Not every problem needs AI — the DPDP consent check is deliberately a rule. Autonomy falls as risk rises: high-risk decisions are recommend-only.</p>
      </Card>

      <div className="flex flex-wrap gap-2 mb-4">
        {(['all', ...domainOrder] as const).map((d) => (
          <button key={d} onClick={() => setFilter(d)} className={`rounded-full px-3 py-1 text-sm font-semibold border ${filter === d ? 'bg-brand-900 text-white border-brand-900' : 'bg-white border-line'}`}>{d === 'all' ? 'All domains' : domains[d].name}</button>
        ))}
      </div>

      <Card title="Decision per use case">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[980px]">
            <thead><tr className="text-[11px] uppercase text-slate-500 border-b text-left"><th className="py-2">Use case</th><th>Technique</th><th>Why</th><th>Not chosen</th><th>Model route</th><th>Autonomy</th><th>Risk</th></tr></thead>
            <tbody>
              {list.map((c) => (
                <tr key={c.useCase} className="border-b last:border-0 align-top">
                  <td className="py-2 pr-2"><div className="font-semibold">{c.useCase}</div><div className="text-[11px] text-slate-500">{c.domain === 'all' ? 'All domains' : domains[c.domain].name}</div></td>
                  <td className="pr-2"><div className="flex flex-col gap-1">{c.techniques.map((t) => <span key={t} className={`${tTone[t]} text-white text-[10px] font-bold rounded px-1.5 py-0.5 w-fit`}>{t}</span>)}</div></td>
                  <td className="pr-2 text-xs">{c.why}</td>
                  <td className="pr-2 text-xs text-slate-500">{c.notChosen}</td>
                  <td className="pr-2 text-xs font-semibold">{c.route}</td>
                  <td className="pr-2 text-xs">{c.autonomy}</td>
                  <td><Badge>{c.risk}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  )
}
