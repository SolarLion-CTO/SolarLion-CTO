import { curvePosition, maturityCurve, states } from '../../data/cto'
import { domains } from '../../data/domains'
import { maturity5 } from '../../data/tracker'
import { useStore } from '../../store'
import DomainSwitch from '../../components/DomainSwitch'
import { Card, PageHeader } from '../../components/ui'

const target5: Record<string, number> = { Strategy: 4.5, Data: 4.0, Technology: 4.2, Governance: 4.5, People: 3.8 }

export default function CtoStrategy() {
  const { domainId } = useStore()
  const pos = curvePosition[domainId]
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <PageHeader title="Strategy · Current → Target" subtitle={`Where ${domains[domainId].name} is today and where the transformation takes it`} owner="Suman" />
        <div className="mb-6"><DomainSwitch /></div>
      </div>

      <Card title="Transformation maturity curve" className="mb-6">
        <div className="grid grid-cols-6 gap-1">
          {maturityCurve.map((m, i) => (
            <div key={m} className={`rounded-lg p-2 text-center text-xs font-semibold ${i === pos.now ? 'bg-amber-400 text-slate-900' : i === pos.target ? 'bg-emerald-600 text-white' : i < pos.now ? 'bg-slate-300' : 'bg-slate-100 text-slate-500'}`}>
              {m}{i === pos.now && <div className="text-[10px]">● today</div>}{i === pos.target && <div className="text-[10px]">◎ 12-month target</div>}
            </div>
          ))}
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <Card title="Maturity gap by dimension (1–5)">
          <div className="space-y-3">
            {maturity5[domainId].map((m) => (
              <div key={m.dim}>
                <div className="flex justify-between text-xs"><span>{m.dim}</span><span><b>{m.score}</b> → <b className="text-emerald-700">{target5[m.dim]}</b></span></div>
                <div className="h-2 bg-slate-100 rounded-full relative overflow-hidden">
                  <div className="absolute h-full bg-emerald-200" style={{ width: `${(target5[m.dim] / 5) * 100}%` }} />
                  <div className="absolute h-full bg-blue-700" style={{ width: `${(m.score / 5) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-3">Blue = today · green = target. Largest gap sets the first investment.</p>
        </Card>
        <Card title="Current state → target state" className="lg:col-span-2">
          <table className="w-full text-sm">
            <thead><tr className="text-[11px] uppercase text-slate-500 border-b text-left"><th className="py-2 w-32">Area</th><th>Current ({domains[domainId].name})</th><th>Target (all domains)</th></tr></thead>
            <tbody>{states.map((s) => (
              <tr key={s.area} className="border-b last:border-0 align-top"><td className="py-2 font-semibold">{s.area}</td><td className="pr-3 text-slate-600">{s.current[domainId]}</td><td className="font-medium text-brand-900">{s.target}</td></tr>
            ))}</tbody>
          </table>
        </Card>
      </div>
    </>
  )
}
