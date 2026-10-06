import { stages } from '../../data/resilience'
import type { Improvement } from '../../data/resilience'

// Current → Proposed → Feasibility → PoC → Pilot → Scale, with the current stage highlighted.
export default function StagePath({ imp, compact = false }: { imp: Improvement; compact?: boolean }) {
  const at = stages.indexOf(imp.stage)
  return (
    <div>
      <div className="flex gap-0.5" aria-label={`Stage: ${imp.stage}`}>
        {stages.map((s, i) => (
          <div key={s} title={s} className={`flex-1 h-1.5 rounded-full ${i < at ? 'bg-brand-600' : i === at ? 'bg-brand-900' : 'bg-slate-200'}`} />
        ))}
      </div>
      {!compact && (
        <div className="flex justify-between text-[10px] text-ink-3 mt-1">
          {stages.map((s, i) => <span key={s} className={i === at ? 'font-semibold text-brand-900' : ''}>{s}</span>)}
        </div>
      )}
    </div>
  )
}
