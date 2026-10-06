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
            <div key={m} className={`rounded-lg px-2 py-2.5 text-center text-xs font-semibold border ${
              i === pos.now ? 'bg-brand-900 border-brand-900 text-white'
              : i === pos.target ? 'bg-brand-50 border-2 border-dashed border-brand-600 text-brand-700'
              : i < pos.now ? 'bg-brand-100 border-brand-100 text-brand-900'
              : i < pos.target ? 'bg-white border-brand-100 text-brand-700'
              : 'bg-slate-50 border-line text-ink-3'}`}>
              {m}
              {i === pos.now && <div className="text-[10px] font-medium opacity-90 mt-0.5">● Today</div>}
              {i === pos.target && <div className="text-[10px] font-medium mt-0.5">◎ 12-month target</div>}
              {i > pos.now && i < pos.target && <div className="text-[10px] font-medium mt-0.5 text-ink-3">next step</div>}
            </div>
          ))}
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <Card title="Maturity gap by dimension (1–5)">
          <div className="space-y-3">
            {maturity5[domainId].map((m) => {
              const gap = target5[m.dim] - m.score
              const largest = gap === Math.max(...maturity5[domainId].map((x) => target5[x.dim] - x.score))
              return (
                <div key={m.dim}>
                  <div className="flex justify-between items-baseline text-xs mb-1">
                    <span className="font-medium text-ink">{m.dim}{largest && <span className="ml-2 text-[10px] font-semibold text-brand-700 bg-brand-50 border border-brand-100 rounded px-1.5 py-0.5">largest gap</span>}</span>
                    <span className="tabular-nums text-ink-2"><b className="text-ink">{m.score.toFixed(1)}</b> → <b className="text-brand-700">{target5[m.dim].toFixed(1)}</b><span className="text-ink-3"> (+{gap.toFixed(1)})</span></span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full relative overflow-hidden">
                    <div className="absolute h-full bg-seq-250" style={{ width: `${(target5[m.dim] / 5) * 100}%` }} />
                    <div className="absolute h-full bg-brand-900" style={{ width: `${(m.score / 5) * 100}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
          <div className="flex flex-wrap gap-4 text-xs text-ink-3 mt-4">
            <span><span className="inline-block w-3 h-3 rounded-sm bg-brand-900 mr-1 align-middle" />Today</span>
            <span><span className="inline-block w-3 h-3 rounded-sm bg-seq-250 mr-1 align-middle" />12-month target</span>
          </div>
          <p className="text-xs text-ink-3 mt-2">The largest gap sets the first investment.</p>
        </Card>
        <Card title="Current state → target state" className="lg:col-span-2">
          <table className="w-full text-sm">
            <thead><tr className="text-[11px] uppercase tracking-wide text-ink-3 border-b border-line text-left"><th className="py-2 w-36 font-semibold">Area</th><th>Current ({domains[domainId].name})</th><th>Target (all domains)</th></tr></thead>
            <tbody>{states.map((s) => (
              <tr key={s.area} className="border-b border-line last:border-0 align-top"><td className="py-3 pr-3 font-semibold text-ink">{s.area}</td><td className="py-3 pr-4 text-ink-2">{s.current[domainId]}</td><td className="py-3 font-medium text-brand-900">{s.target}</td></tr>
            ))}</tbody>
          </table>
        </Card>
      </div>
    </>
  )
}
