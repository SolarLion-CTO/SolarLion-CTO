import type { DomainData, FunctionId } from '../../../data/sim'
import { MetricCard } from '../../../components/sim/primitives'

/** The six metrics of a function as a KPI row (used by source pages that mainly feed that function). */
export function FunctionKpis({ d, fn }: { d: DomainData; fn: FunctionId }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-3 mb-5">
      {d.metrics.filter((m) => m.functionId === fn).map((m) => <MetricCard key={m.id} m={m} />)}
    </div>
  )
}
