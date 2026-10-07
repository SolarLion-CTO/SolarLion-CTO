// ERP RCA, capacity and production automation (M7.5, Pankaj).
// ERP services and incidents come from the simulated Datadog-style data; problem records are ITIL-style (ServiceNow-style).
import type { DomainId } from '../domains'
import { SIM_NOW } from './model'
import { sim } from './index'
import { errorBudget, holt, pareto, queueLatency } from './analytics'
import { rng } from './rng'

const T0 = Date.parse(SIM_NOW)
const DAY = 86_400_000
const date = (d: number) => new Date(T0 + d * DAY).toISOString().slice(0, 10)
const D: DomainId[] = ['banking', 'manufacturing', 'retail']

/** ERP / core-transaction services per business unit. */
export const ERP_SERVICES: Record<DomainId, number[]> = { banking: [0], manufacturing: [0, 1], retail: [6] }
export const erpServices = () => D.flatMap((d) => ERP_SERVICES[d].map((i) => ({ d, s: sim[d].services[i] })))
export const erpIncidents = () => { const ids = new Set(erpServices().map((x) => x.s.id)); return D.flatMap((d) => sim[d].incidents.filter((i) => ids.has(i.serviceId)).map((i) => ({ ...i, d }))) }

/** 12-month ERP root-cause categories (problem-management history), Pareto-sorted. */
export const rootCauses = () => pareto([
  { cause: 'Batch job overrun (month-end / EOD)', count: 18 }, { cause: 'Database lock contention', count: 12 }, { cause: 'Interface / queue backlog', count: 9 },
  { cause: 'Change or configuration drift', count: 8 }, { cause: 'Capacity saturation at peak', count: 7 }, { cause: 'Certificate or credential expiry', count: 3 }, { cause: 'Other', count: 4 },
])

/** Share of ALL simulated incidents (all services, 90 days) that started within 24 h of a change — computed. */
export function changeCorrelation() {
  const all = D.flatMap((d) => sim[d].incidents)
  return { pct: Math.round((all.filter((i) => i.relatedChange).length / all.length) * 100), withChange: all.filter((i) => i.relatedChange).length, total: all.length }
}

export type PrbStatus = 'Root cause found' | 'Known error' | 'Fix in progress' | 'Closed'
export interface Problem { id: string; d: DomainId; title: string; serviceId: string; cause: string; incidents: number; status: PrbStatus; opened: string; ageDays: number; fix: string; change: string | null; owner: string }
type P = [DomainId, number, string, string, number, PrbStatus, number, string, string | null, string]
const PRB: P[] = [
  ['manufacturing', 1, 'Month-end batch overruns its window', 'Batch job overrun (month-end / EOD)', 9, 'Fix in progress', 62, 'Split batch into parallel streams; move reports off the batch window; add hybrid capacity', 'CHG-MFG-5102', 'SAP Basis lead'],
  ['manufacturing', 0, 'Order-to-cash locks during credit check', 'Database lock contention', 6, 'Known error', 48, 'Index and isolation-level change on credit tables', null, 'SAP Basis lead'],
  ['manufacturing', 0, 'IDoc queue backlog to MES', 'Interface / queue backlog', 4, 'Root cause found', 21, 'Async interface with retry and dead-letter queue', null, 'Integration lead'],
  ['manufacturing', 1, 'Batch job fails after transport', 'Change or configuration drift', 3, 'Closed', 95, 'Automated transport checks in release pipeline', 'CHG-MFG-4877', 'SAP Basis lead'],
  ['banking', 0, 'End-of-day posting overruns on salary days', 'Batch job overrun (month-end / EOD)', 5, 'Fix in progress', 40, 'Re-sequence EOD jobs; capacity forecast for salary days', 'CHG-BNK-5210', 'Head of Core Banking Tech'],
  ['banking', 0, 'Ledger posting latency from service-bus backlog', 'Interface / queue backlog', 4, 'Known error', 55, 'Replace service-bus hop with API gateway (Integration Layer Modernization)', null, 'Head of Architecture'],
  ['banking', 0, 'Lock waits on account master during peak', 'Database lock contention', 3, 'Root cause found', 18, 'Partition hot tables; read replicas for enquiries', null, 'Head of Core Banking Tech'],
  ['retail', 6, 'Order release stalls at festive peak', 'Capacity saturation at peak', 5, 'Fix in progress', 33, 'Auto-scaling policy and pre-scaling before peak days', 'CHG-RTL-5333', 'Head of Enterprise Apps'],
  ['retail', 6, 'Inventory sync conflicts cause order holds', 'Interface / queue backlog', 4, 'Known error', 70, 'Real-time inventory events (Intelligent Inventory)', null, 'Head of Enterprise Apps'],
  ['retail', 6, 'Certificate expiry on carrier API', 'Certificate or credential expiry', 2, 'Closed', 120, 'Certificate inventory with automated renewal', 'CHG-RTL-4720', 'Head of Enterprise Apps'],
]
export const problems: Problem[] = PRB.map(([d, svc, title, cause, incidents, status, age, fix, change, owner], i) => ({
  id: `PRB-${sim[d].code}-${String(i + 1).padStart(2, '0')}`, d, title, serviceId: sim[d].services[svc].id, cause, incidents, status, opened: date(-age), ageDays: age, fix, change, owner,
}))
export const recurringOpen = () => problems.filter((p) => p.incidents >= 3 && p.status !== 'Closed').length

export const FIVE_WHYS = {
  problem: 'PRB-MFG-01 · Month-end batch overruns its window',
  whys: [
    'Why did order-to-cash slow down on day 1 of month-end? — The financial-close batch was still running at 08:00.',
    'Why was the batch still running? — It took 9 h against a 6 h window.',
    'Why did it take 9 h? — Volume grew 28% this year and three new reports were added to the same window.',
    'Why were reports added to the batch window? — No capacity check is part of the change process for batch jobs.',
    'Why is there no capacity check? — Capacity is planned yearly, not per change or per peak.',
  ],
  root: 'Capacity planning is annual and not linked to change or peak calendars.',
  fix: 'Forecast-driven capacity per peak + capacity gate in batch change process (owner Pankaj).',
}

export const errorBudgets = () => erpServices().map(({ d, s }) => ({ d, s, ...errorBudget(s.slo, s.availability) }))

// ── Capacity telemetry ──
export const RESOURCES = ['CPU', 'Memory', 'Storage', 'Network'] as const
export interface CapRow { d: DomainId; serviceId: string; name: string; res: (typeof RESOURCES)[number]; series: number[]; forecast: number[]; current: number; breach80: number | null; breach95: number | null }
/** Critical services per business unit for capacity planning (index into services). */
const CAP_SERVICES: Record<DomainId, number[]> = { banking: [0, 1, 3, 4, 10, 8], manufacturing: [0, 1, 2, 4, 5, 15], retail: [0, 1, 2, 6, 7, 16] }
export function capacity(): CapRow[] {
  return D.flatMap((d) => CAP_SERVICES[d].flatMap((si) => {
    const s = sim[d].services[si]
    return RESOURCES.map((res, ri) => {
      const r = rng(`cap-${s.id}-${res}`)
      const start = 30 + r.next() * 20
      const growth = (res === 'Storage' ? 1.3 : 1) * (8 + s.requestsPerMin / 4000 + r.next() * 12) * (s.health === 'Red' ? 1.4 : 1)
      const end = Math.min(83, start + growth)
      const series = Array.from({ length: 12 }, (_, k) => Math.round((start + ((end - start) * k) / 11 + (r.next() - 0.5) * 3) * 10) / 10)
      series[11] = Math.round(end * 10) / 10
      const fc = holt(series, 9, 0.5, 0.3).map((v) => Math.min(130, v))
      const first = (t: number) => { const i = fc.findIndex((v) => v >= t); return i < 0 ? null : i + 1 }
      void ri
      return { d, serviceId: s.id, name: s.name, res, series, forecast: fc, current: series[11], breach80: first(80), breach95: first(95) }
    })
  }))
}
/** Live gauge value: oscillates just below the measured monthly peak, driven by the simulation clock. */
export const liveUtil = (row: CapRow, now: number, k: number) => Math.round(Math.max(0, row.current - Math.abs(Math.sin(now / 4000 + k)) * 2.5) * 10) / 10 // never above the measured peak

// ── Peak scenarios (what-if) ──
export interface Scenario { id: string; d: DomainId; label: string; when: string; baseUtil: number; mult: number; serviceMs: number; targetMs: number; costPerPctCr: number }
export const SCENARIOS: Scenario[] = [
  { id: 'month-end', d: 'manufacturing', label: 'Month-end close', when: 'Last 2 days of each month', baseUtil: 0.48, mult: 1.62, serviceMs: 180, targetMs: 800, costPerPctCr: 0.012 },
  { id: 'salary-day', d: 'banking', label: 'Salary day', when: '1st working day of each month', baseUtil: 0.5, mult: 1.7, serviceMs: 120, targetMs: 300, costPerPctCr: 0.02 },
  { id: 'festive', d: 'retail', label: 'Festive peak', when: 'Mid Oct – mid Nov', baseUtil: 0.42, mult: 2.15, serviceMs: 150, targetMs: 600, costPerPctCr: 0.016 },
]
export function runScenario(s: Scenario, scaleOutPct: number) {
  const util = (s.baseUtil * s.mult) / (1 + scaleOutPct / 100)
  const latency = queueLatency(Math.min(0.99, util), s.serviceMs)
  return { util: Math.round(util * 1000) / 10, latency, ok: latency <= s.targetMs, costCr: Math.round(s.costPerPctCr * scaleOutPct * 6 * 100) / 100 } // ~6 weeks of extra capacity
}

// ── Production automation (Manufacturing) ──
export const AUTOMATION_STEPS: [string, string, boolean, string][] = [
  ['Plan to Produce', 'Demand signal loaded into planning', true, 'Done'], ['Plan to Produce', 'Capacity check against line calendar', true, 'Done'], ['Plan to Produce', 'Schedule pushed to MES (plants 5–6)', true, 'Done'],
  ['Plan to Produce', 'Schedule pushed to MES (plants 1–4)', false, 'Q1 2027 (MES 9 upgrade)'], ['Plan to Produce', 'Material availability check', true, 'Done'], ['Plan to Produce', 'Changeover sequencing', false, 'Q2 2027 (AI demand sensing)'],
  ['Maintenance', 'Sensor alert raises work order', true, 'Done'], ['Maintenance', 'Spare-part reservation', false, 'Q4 2026'], ['Maintenance', 'Technician dispatch', false, 'Q1 2027'],
  ['Maintenance', 'Predictive maintenance scoring', true, 'Done'], ['Quality', 'AI vision inspection result to MES', false, 'Q4 2026 (gate review)'], ['Quality', 'Non-conformance report creation', true, 'Done'],
]
