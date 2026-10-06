// CTO Decision Center — the Top 10 items needing the CTO's attention across all business units (spec 2 §6).
import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { RotateCcw } from 'lucide-react'
import { sim } from '../../data/sim'
import { decisionsFor, topDecisions } from '../../data/sim/decisions'
import { PageHeader, Stat } from '../../components/ui'
import { DecisionCard } from '../../components/sim/DecisionCard'
import { useDecisionState } from '../../components/sim/decisionState'
import { Tabs } from './common'
import { ActionTracker, Outcomes } from './decisionViews'

type T = 'top' | 'actions' | 'outcomes'

export default function DecisionCenter() {
  const all = useMemo(() => Object.values(sim).flatMap(decisionsFor), [])
  const top = useMemo(() => topDecisions(all), [all])
  const st = useDecisionState()
  const [sp, setSp] = useSearchParams()
  const t = (['top', 'actions', 'outcomes'].includes(sp.get('tab') ?? '') ? sp.get('tab') : 'top') as T
  const setTab = (x: T) => { const n = new URLSearchParams(sp); n.set('tab', x); setSp(n, { replace: true }) }
  const awaiting = top.filter((x) => st.statusOf(x) === 'Awaiting decision')
  return (
    <>
      <PageHeader title="CTO Decision Center" subtitle="Top 10 decisions across Banking, Manufacturing and Retail — ranked by priority, confidence and value. Simulated enterprise data." owner="Ram (CTO)" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <Stat label="Top decisions awaiting you" value={awaiting.length} sub={`${awaiting.filter((x) => x.priority === 'Critical').length} critical`} tone="warn" />
        <Stat label="Value at stake (top 10)" value={`₹${Math.round(top.reduce((s, x) => s + x.benefitCr, 0))} Cr`} sub="expected value protected" />
        <Stat label="Investment asked" value={`₹${Math.round(top.reduce((s, x) => s + x.investmentCr, 0) * 10) / 10} Cr`} sub="incremental, across the top 10" />
        <Stat label="Decisions in the engine" value={all.filter((x) => !x.preset).length} sub="raised by cross-system rules, all domains" />
      </div>
      <div className="flex justify-between items-center gap-2">
        <Tabs<T> value={t} onChange={setTab} tabs={[{ id: 'top', label: 'Top 10', count: top.length }, { id: 'actions', label: 'Action tracker (all domains)' }, { id: 'outcomes', label: 'Outcomes' }]} />
        <button onClick={() => { if (confirm('Reset all demo decisions and action statuses in this browser?')) st.reset() }} className="inline-flex items-center gap-1 text-xs text-ink-3 border border-line rounded-lg px-2.5 py-1.5 hover:bg-slate-50 shrink-0 mb-4"><RotateCcw size={13} />Reset demo</button>
      </div>
      {t === 'top' && <div className="space-y-5">{top.map((x) => <DecisionCard key={x.id} d={x} showDomain />)}</div>}
      {t === 'actions' && <ActionTracker decisions={all} showDomain />}
      {t === 'outcomes' && <Outcomes decisions={all} showDomain />}
    </>
  )
}
