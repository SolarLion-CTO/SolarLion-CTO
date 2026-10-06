// Simulated source-system event stream. Every event references a real simulated record, so the feed is consistent
// with the data on screen. Times are relative to the simulation clock (SIM_NOW + elapsed seconds).
import type { DomainData, SourceId } from './model'
import { SIM_NOW } from './model'
import { rng } from './rng'

export interface SimEvent { id: string; at: number; source: Exclude<SourceId, 'business'>; text: string; recordId: string; tone: 'ok' | 'warn' | 'crit' | 'info' }

const T0 = new Date(SIM_NOW).getTime()

/** ~60 past events (last 3 hours) plus a queue of future events released by the live clock. */
export function buildEvents(d: DomainData) {
  const r = rng(`${d.domain}-events`)
  const make: (() => Omit<SimEvent, 'id' | 'at'>)[] = []
  for (const s of d.services) {
    make.push(() => s.health === 'Green'
      ? { source: 'datadog', text: `${s.name}: availability ${s.availability}% · latency ${s.latencyMs} ms`, recordId: s.id, tone: 'ok' }
      : { source: 'datadog', text: `${s.name}: ${s.latencyMs > s.latencyTargetMs ? `latency ${s.latencyMs} ms above ${s.latencyTargetMs} ms target` : `availability ${s.availability}% below ${s.slo}% SLO`}`, recordId: s.id, tone: s.health === 'Red' ? 'crit' : 'warn' })
  }
  for (const t of d.teams) {
    const app = d.applications.find((a) => a.id === t.appIds[0])
    make.push(() => ({ source: 'jellyfish', text: `${t.name} deployed ${app?.name ?? t.product} (${r.int(40, 99)} PRs this week)`, recordId: t.id, tone: 'info' }))
  }
  for (const c of d.controls) {
    make.push(() => ({ source: 'vanta', text: `Control test · ${c.control}: ${c.controlStatus === 'Passing' ? 'passed' : c.controlStatus === 'Failing' ? 'FAILED' : c.controlStatus.toLowerCase()}`, recordId: c.id, tone: c.controlStatus === 'Passing' ? 'ok' : c.controlStatus === 'Failing' ? 'crit' : 'warn' }))
  }
  for (const p of d.projects) {
    make.push(() => p.milestonesLate > 0
      ? { source: 'servicenow', text: `${p.name}: milestone slipped, forecast ${p.forecastEnd}`, recordId: p.id, tone: p.health === 'Red' ? 'crit' : 'warn' }
      : { source: 'servicenow', text: `${p.name}: task completed, progress ${p.progress}%`, recordId: p.id, tone: 'ok' })
  }
  for (const i of d.initiatives) {
    make.push(() => ({ source: 'planview', text: `₹${(r.between(0.05, 0.6)).toFixed(2)} Cr actuals posted to ${i.name}`, recordId: i.id, tone: i.health === 'Red' ? 'warn' : 'info' }))
  }
  for (const t of d.technologies.filter((x) => x.lifecycle === 'End of life' || x.lifecycle === 'Extended support')) {
    make.push(() => ({ source: 'leanix', text: `${t.name}: ${t.lifecycle === 'End of life' ? 'past end of support' : 'support ends ' + t.eolDate} · ${t.appIds.length} app(s)`, recordId: t.id, tone: t.lifecycle === 'End of life' ? 'crit' : 'warn' }))
  }
  for (const a of d.applications.slice(0, 10)) make.push(() => ({ source: 'leanix', text: `Fact sheet updated: ${a.name} (${a.lifecycle})`, recordId: a.id, tone: 'info' }))
  for (const p of d.processes) {
    make.push(() => ({ source: 'process', text: `${p.name}: ${p.exceptionRate > 8 ? 'exception spike — ' + p.bottleneck.toLowerCase() : `cycle ${p.cycleTime} ${p.unit} vs ${p.targetCycleTime} ${p.unit} target`}`, recordId: p.id, tone: p.health === 'Red' ? 'crit' : p.health === 'Amber' ? 'warn' : 'ok' }))
  }
  const out: SimEvent[] = []
  for (let k = 0; k < 140; k++) {
    const e = make[Math.floor(r.next() * make.length)]()
    // k < 60 → past (spread over the last 3 hours); k ≥ 60 → future, released one every ~6 s of simulation time
    const at = k < 60 ? T0 - Math.floor(r.between(0, 180 * 60_000)) : T0 + (k - 59) * 6_000
    out.push({ ...e, id: `EVT-${d.code}-${k}`, at })
  }
  return out.sort((a, b) => b.at - a.at)
}
