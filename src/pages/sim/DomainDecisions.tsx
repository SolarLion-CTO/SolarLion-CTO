import { useEffect, useMemo } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { RotateCcw } from 'lucide-react'
import { decisionsFor } from '../../data/sim/decisions'
import { Stat } from '../../components/ui'
import { DecisionCard } from '../../components/sim/DecisionCard'
import { useDecisionState } from '../../components/sim/decisionState'
import { NotFound, SimHeader, Tabs, useSimDomain } from './common'
import { ActionTracker, Maturity, Outcomes } from './decisionViews'

type T = 'cards' | 'actions' | 'outcomes' | 'maturity'

export default function DomainDecisions() {
  const d = useSimDomain()
  const [sp, setSp] = useSearchParams()
  const { hash } = useLocation()
  const st = useDecisionState()
  const all = useMemo(() => (d ? decisionsFor(d) : []), [d])
  useEffect(() => { if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }) }, [hash])
  if (!d) return <NotFound />
  const t = (['cards', 'actions', 'outcomes', 'maturity'].includes(sp.get('tab') ?? '') ? sp.get('tab') : 'cards') as T
  const setTab = (x: T) => { const n = new URLSearchParams(sp); n.set('tab', x); setSp(n, { replace: true }) }
  const open = all.filter((x) => !x.preset)
  const awaiting = open.filter((x) => st.statusOf(x) === 'Awaiting decision')
  const approved = all.filter((x) => st.statusOf(x) === 'Approved')
  const actions = approved.flatMap((x) => x.actions)
  return (
    <>
      <SimHeader d={d} crumbs={[{ to: `/domain/${d.domain}/decisions`, label: 'Decision Intelligence' }]} title="Decision Intelligence" question="Where should I intervene, and what decision should I make?">
        <button onClick={() => { if (confirm('Reset all demo decisions and action statuses in this browser?')) st.reset() }} className="inline-flex items-center gap-1 text-xs text-ink-3 border border-line rounded-lg px-2.5 py-1.5 hover:bg-slate-50"><RotateCcw size={13} />Reset demo</button>
      </SimHeader>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <Stat label="Awaiting your decision" value={awaiting.length} sub={`${awaiting.filter((x) => x.priority === 'Critical').length} critical · ${awaiting.filter((x) => x.priority === 'High').length} high`} tone={awaiting.some((x) => x.priority === 'Critical') ? 'crit' : 'warn'} />
        <Stat label="Value at stake" value={`₹${Math.round(awaiting.reduce((s, x) => s + x.benefitCr, 0))} Cr`} sub="expected value protected by open decisions" />
        <Stat label="Approved decisions" value={approved.length} sub={`${actions.length} actions · ${actions.filter((a) => st.actionStatus(a) === 'Completed').length} completed`} tone="ok" />
        <Stat label="Signals correlated" value={open.reduce((s, x) => s + x.signals.length, 0)} sub="each traceable to a simulated source record" />
      </div>
      <Tabs<T> value={t} onChange={setTab} tabs={[
        { id: 'cards', label: 'Decision cards', count: open.length },
        { id: 'actions', label: 'Action tracker', count: actions.length },
        { id: 'outcomes', label: 'Outcomes' },
        { id: 'maturity', label: 'Maturity' },
      ]} />
      {t === 'cards' && <div className="space-y-5">{open.map((x) => <DecisionCard key={x.id} d={x} />)}</div>}
      {t === 'actions' && <ActionTracker decisions={all} />}
      {t === 'outcomes' && <Outcomes decisions={all} />}
      {t === 'maturity' && <Maturity d={d} />}
    </>
  )
}
