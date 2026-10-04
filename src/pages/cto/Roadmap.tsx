import { currentWeek, milestones, roadmapLanes, roadmapPhases } from '../../data/cto'
import { Card, PageHeader } from '../../components/ui'

const WEEKS = 16
const pos = (w: number) => `${((w - 1) / WEEKS) * 100}%`
const span = (s: number, e: number) => `${((e - s + 1) / WEEKS) * 100}%`

export default function Roadmap() {
  return (
    <>
      <PageHeader title="Execution Roadmap" subtitle="90-day foundation in 30-day increments, then scale — each increment ends in a gate: approve, redo or stop" owner="Ram (CTO)" />

      <div className="grid md:grid-cols-4 gap-3 mb-6">
        {roadmapPhases.map((p) => (
          <div key={p.name} className={`rounded-xl text-white p-4 ${p.color}`}>
            <div className="text-xs opacity-80">Weeks {p.start}–{p.end}</div>
            <div className="font-extrabold text-lg">{p.name}</div>
            <div className="text-xs mt-1">{p.output}</div>
            <div className="text-[11px] opacity-80 mt-2">Lead: {p.lead}</div>
          </div>
        ))}
      </div>

      <Card title="Timeline by domain" className="mb-6" action={<span className="md:hidden text-xs text-slate-500">Swipe →</span>}>
        <div className="overflow-x-auto">
          <div className="min-w-[760px]">
            <div className="flex text-[10px] text-slate-500 ml-32 mb-1">{Array.from({ length: WEEKS }, (_, i) => <div key={i} className="flex-1 text-center">W{i + 1}</div>)}</div>
            <div className="relative">
              <div className="flex ml-32 mb-2 h-6">
                {roadmapPhases.map((p) => <div key={p.name} className={`${p.color} text-white text-[10px] font-semibold flex items-center justify-center`} style={{ width: span(p.start, p.end) }}>{p.name}</div>)}
              </div>
              {roadmapLanes.map((l) => (
                <div key={l.lane} className="flex items-center h-10 border-t border-slate-100">
                  <div className="w-32 text-sm font-semibold shrink-0">{l.lane}</div>
                  <div className="relative flex-1 h-full">
                    {l.bars.map((b) => <div key={b.label} className={`absolute top-2 h-6 rounded ${b.tone} text-white text-[10px] font-semibold flex items-center px-1.5 overflow-hidden whitespace-nowrap`} style={{ left: pos(b.start), width: span(b.start, b.end) }}>{b.label}</div>)}
                    {l.gates.map((g) => <div key={g.label} title={`Gate ${g.label} · week ${g.week}`} className="absolute top-1 w-4 h-4 rotate-45 bg-amber-400 border border-white shadow" style={{ left: `calc(${pos(g.week)} + ${100 / WEEKS / 2}% - 8px)` }} />)}
                  </div>
                </div>
              ))}
              <div className="absolute top-0 bottom-0 w-0.5 bg-red-500" style={{ left: `calc(8rem + (100% - 8rem) * ${(currentWeek - 0.5) / WEEKS})` }}>
                <span className="absolute -top-1 left-1 text-[10px] font-bold text-red-600 whitespace-nowrap">Today · W{currentWeek}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-4 text-xs text-slate-500 mt-3"><span><span className="inline-block w-3 h-3 rotate-45 bg-amber-400 mr-1 align-middle" />Gate</span><span><span className="inline-block w-3 h-0.5 bg-red-500 mr-1 align-middle" />Today</span><span>Retail starts later — added by configuration once the core is proven.</span></div>
      </Card>

      <Card title="Milestones">
        <ul className="space-y-2">{milestones.map((m) => (
          <li key={m.week} className="flex items-center gap-3 text-sm">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${m.done ? 'bg-emerald-600 text-white' : m.week <= currentWeek + 2 ? 'bg-amber-400' : 'bg-slate-200 text-slate-500'}`}>{m.done ? '✓' : ''}</span>
            <span className="w-16 shrink-0 font-semibold text-slate-500">Week {m.week}</span>
            <span className="flex-1 min-w-0">{m.what}<span className="block sm:hidden text-xs text-slate-500">{m.owner}</span></span>
            <span className="hidden sm:block text-xs text-slate-500">{m.owner}</span>
          </li>
        ))}</ul>
        <p className="text-xs text-slate-500 mt-3">No production AI and no platform purchase before day 90.</p>
      </Card>
    </>
  )
}
