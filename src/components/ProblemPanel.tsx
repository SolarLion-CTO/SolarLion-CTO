import { CircleAlert, Lightbulb, Search, Target } from 'lucide-react'
import type { Problem } from '../data/domains'
import { areaOwner } from '../data/domains'
import { Badge, Bar, money } from './ui'

// The "exact problem" for one area in one domain: pain → root causes → AI solution → KPI.
export default function ProblemPanel({ p, domainName }: { p: Problem; domainName: string }) {
  return (
    <section className="bg-white rounded-xl border-l-4 border-blue-700 border border-slate-200 shadow-sm p-5 mb-6">
      <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wide text-blue-700">{domainName} · {p.area} problem · owner {areaOwner[p.area]}</div>
          <h2 className="text-lg font-extrabold text-slate-900">{p.title}</h2>
        </div>
        <div className="flex gap-2"><Badge>{p.stage}</Badge><Badge>{p.health}</Badge></div>
      </div>
      <div className="grid md:grid-cols-3 gap-4 text-sm">
        <div>
          <div className="text-[11px] font-bold uppercase text-red-600 flex items-center gap-1 mb-1"><CircleAlert size={13} /> Business pain</div>
          <p>{p.pain}</p>
        </div>
        <div>
          <div className="text-[11px] font-bold uppercase text-amber-600 flex items-center gap-1 mb-1"><Search size={13} /> Root causes</div>
          <ul className="list-disc pl-4 space-y-0.5">{p.rootCauses.map((r) => <li key={r}>{r}</li>)}</ul>
        </div>
        <div>
          <div className="text-[11px] font-bold uppercase text-emerald-700 flex items-center gap-1 mb-1"><Lightbulb size={13} /> AI-enabled solution</div>
          <p>{p.aiSolution}</p>
        </div>
      </div>
      <div className="mt-4 rounded-lg bg-slate-50 p-3 grid sm:grid-cols-5 gap-3 items-center text-sm">
        <div className="sm:col-span-2 flex items-center gap-2"><Target size={15} className="text-blue-700 shrink-0" /><span className="font-semibold">{p.kpi}</span></div>
        <div><span className="text-slate-500 text-xs">Baseline</span><div className="font-semibold">{p.baseline}</div></div>
        <div><span className="text-slate-500 text-xs">Now → Target</span><div className="font-semibold">{p.current} → <span className="text-emerald-700">{p.target}</span></div></div>
        <div><span className="text-slate-500 text-xs">Value at target</span><div className="font-semibold text-emerald-700">{money(p.valueCr)} / yr</div></div>
        <div className="sm:col-span-5 flex items-center gap-2"><Bar value={p.progress} /><span className="text-xs whitespace-nowrap">{p.progress}% to target</span></div>
      </div>
    </section>
  )
}
