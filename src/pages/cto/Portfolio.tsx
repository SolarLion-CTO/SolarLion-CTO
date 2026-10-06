import { useState } from 'react'
import { CartesianGrid, Cell, ReferenceArea, ReferenceLine, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis } from 'recharts'
import { useCases } from '../../data/cto'
import type { Verdict } from '../../data/cto'
import { domainOrder, domains } from '../../data/domains'
import type { DomainId } from '../../data/domains'
import { Card, PageHeader, money } from '../../components/ui'
import { domainColor } from '../../theme'

const colors = domainColor
const verdictTone: Record<Verdict, string> = { 'Fund now': 'bg-emerald-600 text-white', Pilot: 'bg-blue-600 text-white', 'Strategic bet': 'bg-violet-600 text-white', Defer: 'bg-slate-300 text-slate-700' }

export default function Portfolio() {
  const [filter, setFilter] = useState<DomainId | 'all'>('all')
  const list = useCases.filter((u) => filter === 'all' || u.domain === filter)
  const ranked = [...list].sort((a, b) => b.value * b.feasibility - a.value * a.feasibility)
  const funded = list.filter((u) => u.verdict === 'Fund now')

  return (
    <>
      <PageHeader title="Use-Case Portfolio" subtitle="Identify and prioritise AI use cases by business value and feasibility (data readiness, technology, risk) — not by enthusiasm" owner="Suman" />

      <div className="flex flex-wrap gap-2 mb-4">
        {(['all', ...domainOrder] as const).map((d) => (
          <button key={d} onClick={() => setFilter(d)} className={`rounded-full px-3 py-1 text-sm font-semibold border ${filter === d ? 'bg-brand-900 text-white border-brand-900' : 'bg-white border-line'}`}>{d === 'all' ? 'All domains' : domains[d].name}</button>
        ))}
        <span className="ml-auto text-sm text-slate-600">{funded.length} funded now · {money(funded.reduce((s, u) => s + u.valueCr, 0))}/yr value</span>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <Card title="Priority matrix" className="lg:col-span-3">
          <div className="h-96">
            <ResponsiveContainer>
              <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                <ReferenceArea x1={5} x2={10} y1={5} y2={10} fill="#dcfce7" fillOpacity={0.6} />
                <ReferenceArea x1={0} x2={5} y1={5} y2={10} fill="#ede9fe" fillOpacity={0.5} />
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" dataKey="feasibility" domain={[0, 10]} name="Feasibility" tick={{ fontSize: 11 }} label={{ value: 'Feasibility →', position: 'insideBottom', offset: -10, fontSize: 11 }} />
                <YAxis type="number" dataKey="value" domain={[0, 10]} name="Value" tick={{ fontSize: 11 }} label={{ value: 'Value →', angle: -90, position: 'insideLeft', fontSize: 11 }} />
                <ZAxis dataKey="valueCr" range={[60, 400]} />
                <ReferenceLine x={5} stroke="#94a3b8" /><ReferenceLine y={5} stroke="#94a3b8" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ payload }) => {
                  const u = payload?.[0]?.payload as (typeof useCases)[number] | undefined
                  return u ? <div className="bg-white border rounded p-2 text-xs shadow"><b>{u.name}</b><div>{domains[u.domain].name} · value {u.value} · feasibility {u.feasibility}</div><div>{money(u.valueCr)}/yr · {u.verdict}</div></div> : null
                }} />
                <Scatter isAnimationActive={false} data={list}>{list.map((u) => <Cell key={u.name} fill={colors[u.domain]} fillOpacity={0.8} />)}</Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs mt-2">
            <div className="rounded bg-violet-50 p-2"><b>Strategic bets</b> — high value, low feasibility: fix data or tech first</div>
            <div className="rounded bg-emerald-50 p-2"><b>Quick wins</b> — high value, high feasibility: fund now</div>
            <div className="rounded bg-slate-50 p-2"><b>Avoid</b> — low value, low feasibility</div>
            <div className="rounded bg-slate-50 p-2"><b>Fill-ins</b> — easy but low value: only if cheap</div>
          </div>
          <div className="flex gap-4 text-xs mt-2">{domainOrder.map((d) => <span key={d}><span className="inline-block w-3 h-3 rounded-full mr-1 align-middle" style={{ background: colors[d] }} />{domains[d].name}</span>)}<span className="text-slate-500">bubble = annual value</span></div>
        </Card>

        <Card title="Ranked by value × feasibility" className="lg:col-span-2">
          <ol className="space-y-2">
            {ranked.map((u, i) => (
              <li key={u.name} className="flex items-start gap-2 text-sm">
                <span className="w-5 text-right font-bold text-blue-700">{i + 1}</span>
                <div className="flex-1">
                  <div className="font-semibold leading-tight">{u.name}</div>
                  <div className="text-xs text-slate-500">{domains[u.domain].name} · {u.owner} · V{u.value} × F{u.feasibility} = {u.value * u.feasibility} · {money(u.valueCr)}/yr</div>
                </div>
                <span className={`text-[10px] font-bold rounded px-1.5 py-0.5 whitespace-nowrap ${verdictTone[u.verdict]}`}>{u.verdict}</span>
              </li>
            ))}
          </ol>
        </Card>
      </div>
    </>
  )
}
