// Simulation clock: starts at SIM_NOW and advances in real time (pausable). Drives "synced Xs ago" and the event feeds.
import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { SIM_NOW } from '../../data/sim/model'

const T0 = new Date(SIM_NOW).getTime()
interface Clock { now: number; paused: boolean; toggle: () => void; reset: () => void }
const Ctx = createContext<Clock>({ now: T0, paused: false, toggle: () => {}, reset: () => {} })

export function SimClockProvider({ children }: { children: ReactNode }) {
  const [elapsed, setElapsed] = useState(0)
  const [paused, setPaused] = useState(false)
  useEffect(() => {
    if (paused) return
    const t = setInterval(() => setElapsed((e) => e + 1000), 1000)
    return () => clearInterval(t)
  }, [paused])
  return <Ctx.Provider value={{ now: T0 + elapsed, paused, toggle: () => setPaused((p) => !p), reset: () => setElapsed(0) }}>{children}</Ctx.Provider>
}
export const useSimClock = () => useContext(Ctx)

export function ago(ms: number) {
  const s = Math.max(0, Math.round(ms / 1000))
  if (s < 60) return `${s}s ago`
  const m = Math.round(s / 60)
  if (m < 60) return `${m} min ago`
  const h = Math.round(m / 60)
  return h < 24 ? `${h} h ago` : `${Math.round(h / 24)} d ago`
}
export const hhmm = (t: number) => new Date(t).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: 'Asia/Kolkata' })
