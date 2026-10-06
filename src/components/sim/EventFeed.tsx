import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Pause, Play, RotateCcw } from 'lucide-react'
import type { DomainData, SourceId } from '../../data/sim/model'
import { buildEvents } from '../../data/sim/events'
import { SOURCES } from '../../data/sim/scores'
import { ago, hhmm, useSimClock } from './clock'

const dot = { ok: 'bg-ok', warn: 'bg-warn', crit: 'bg-crit', info: 'bg-brand-600' }

/** Scrolling simulated event feed. New events are released by the simulation clock. */
export function EventFeed({ d, source, limit = 6 }: { d: DomainData; source?: SourceId; limit?: number }) {
  const { now } = useSimClock()
  const events = useMemo(() => buildEvents(d), [d])
  const list = events.filter((e) => e.at <= now && (!source || e.source === source)).slice(0, limit)
  return (
    <ul className="text-[13px] divide-y divide-line" aria-live="polite" aria-label="Simulated event feed">
      {list.map((e) => (
        <li key={e.id} className="py-1.5 flex items-start gap-2 min-w-0">
          <span className="text-[11px] text-ink-4 tabular-nums w-14 shrink-0 pt-0.5">{hhmm(e.at).slice(0, 5)}</span>
          <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${dot[e.tone]}`} aria-hidden />
          <Link to={`/domain/${d.domain}/record/${e.recordId}`} className="flex-1 min-w-0 text-ink-2 hover:text-ink hover:underline truncate" title={e.text}>{e.text}</Link>
          {!source && <span className="text-[10px] text-ink-4 shrink-0 hidden sm:inline">{SOURCES.find((s) => s.id === e.source)!.label}</span>}
        </li>
      ))}
      {list.length === 0 && <li className="py-2 text-ink-3">No events yet.</li>}
    </ul>
  )
}

/** "Simulation active · synced …" strip at the top of every source page. */
export function SyncStrip({ d, source, records }: { d: DomainData; source: Exclude<SourceId, 'business'>; records: number }) {
  const { now, paused } = useSimClock()
  const events = useMemo(() => buildEvents(d).filter((e) => e.source === source), [d, source])
  const last = events.find((e) => e.at <= now)
  const perHour = events.filter((e) => e.at <= now && now - e.at <= 3_600_000).length
  return (
    <div className="rounded-xl border border-line bg-surface p-4 mb-5">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] mb-2">
        <span className={`inline-flex items-center gap-1.5 font-semibold ${paused ? 'text-ink-3' : 'text-success-text'}`}><span className={`w-2 h-2 rounded-full ${paused ? 'bg-ink-4' : 'bg-ok animate-pulse'}`} />{paused ? 'Simulation paused' : 'Simulation active'}</span>
        <span className="text-ink-2">synced {last ? ago(now - last.at) : '—'}</span>
        <span className="text-ink-2">{records} records</span>
        <span className="text-ink-2">{perHour} events in the last hour</span>
        <span className="text-ink-3 text-xs ml-auto">Demonstration environment · simulated enterprise data · no live vendor integration</span>
      </div>
      <EventFeed d={d} source={source} limit={4} />
    </div>
  )
}

export function ClockControls() {
  const { now, paused, toggle, reset } = useSimClock()
  return (
    <div className="hidden md:flex items-center gap-1.5 text-[12px] text-slate-200">
      <span className={`w-2 h-2 rounded-full ${paused ? 'bg-slate-400' : 'bg-green-400 animate-pulse'}`} aria-hidden />
      <span className="hidden xl:inline">{paused ? 'Simulation paused' : 'Simulation live'}</span>
      <span className="tabular-nums">{hhmm(now)}</span>
      <button onClick={toggle} className="p-1 rounded hover:bg-white/10" aria-label={paused ? 'Resume simulation' : 'Pause simulation'}>{paused ? <Play size={14} /> : <Pause size={14} />}</button>
      <button onClick={reset} className="p-1 rounded hover:bg-white/10" aria-label="Reset simulation clock"><RotateCcw size={14} /></button>
    </div>
  )
}
