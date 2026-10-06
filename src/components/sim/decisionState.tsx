// Decision verdicts and action statuses for the demo. Kept in this browser only (localStorage, guarded),
// so the demo works without a backend; "Reset demo" clears it. Real persistence comes with the Python API phase.
import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { ActionStatus, Decision } from '../../data/sim/decisions'

export type Verdict = 'Approved' | 'Rejected' | 'Deferred'
interface State { verdicts: Record<string, { v: Verdict; at: string }>; actions: Record<string, ActionStatus> }
interface Ctx extends State {
  decide: (id: string, v: Verdict | null) => void
  setAction: (id: string, s: ActionStatus) => void
  reset: () => void
  statusOf: (d: Decision) => Verdict | 'Awaiting decision'
  actionStatus: (a: Decision['actions'][number]) => ActionStatus
}
const KEY = 'cto360-sim-decisions-v1'
const empty: State = { verdicts: {}, actions: {} }
const C = createContext<Ctx | null>(null)

function load(): State {
  try { const raw = localStorage.getItem(KEY); return raw ? { ...empty, ...JSON.parse(raw) } : empty } catch { return empty }
}

export function DecisionStateProvider({ children }: { children: ReactNode }) {
  const [st, setSt] = useState<State>(load)
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(st)) } catch { /* private mode: keep in memory */ } }, [st])
  const value: Ctx = {
    ...st,
    decide: (id, v) => setSt((s) => { const verdicts = { ...s.verdicts }; if (v) verdicts[id] = { v, at: '2026-10-06' }; else delete verdicts[id]; return { ...s, verdicts } }),
    setAction: (id, a) => setSt((s) => ({ ...s, actions: { ...s.actions, [id]: a } })),
    reset: () => setSt(empty),
    statusOf: (d) => (d.preset ? 'Approved' : st.verdicts[d.id]?.v ?? 'Awaiting decision'),
    actionStatus: (a) => st.actions[a.id] ?? a.preset?.status ?? 'Not Started',
  }
  return <C.Provider value={value}>{children}</C.Provider>
}
export function useDecisionState() {
  const c = useContext(C)
  if (!c) throw new Error('DecisionStateProvider missing')
  return c
}
