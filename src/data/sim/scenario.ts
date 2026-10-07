// The golden thread (M7): "Month-end close meets festive peak" — one live cross-team scenario that plays on the
// simulation clock (Reset in the header replays it). Every step cites real simulated records.
import { SIM_NOW } from './model'
import { sim } from './index'
import type { OwnerId } from './team'
import { USE_CASES, roi } from './aiPortfolio'

const T0 = Date.parse(SIM_NOW)
export interface ThreadStep { n: number; at: number; owner: OwnerId; title: string; detail: string; source: string; link: string; evidence: string[] }

export function goldenThread(): ThreadStep[] {
  const sap = sim.manufacturing.services[1] // SAP month-end batch
  const o2c = sim.manufacturing.services[0]
  const store = sim.retail.services[0]
  const checkout = sim.retail.services[1]
  const cloud = sim.retail.metrics.find((m) => m.functionId === 'finance' && m.key === 'cloud')!
  const fc = sim.retail.initiatives.find((i) => i.name.includes('Forecasting'))!
  const ctl = sim.retail.controls[22]
  const uc = USE_CASES.find((u) => u.id === 'AIUC-RTL-02')!
  const ucRoi = roi(uc)
  const s = (sec: number) => T0 + sec * 1000
  return [
    { n: 1, at: s(15), owner: 'pankaj', title: 'Month-end batch overrun; capacity headroom below 10%', source: 'Datadog · ERP batch monitor · ServiceNow',
      detail: `${sap.name} overruns its window by 3 h; ${o2c.name} and ${store.name} share the cluster, headroom falls to 8%. Anomaly flagged (EWMA z > 3) and linked to a recurring problem.`,
      link: '/team/pankaj', evidence: [sap.id, o2c.id, store.id] },
    { n: 2, at: s(40), owner: 'ram', title: 'Control tower correlates with festive and salary-day peaks', source: 'Correlation engine · all sources',
      detail: `Same window as the retail festive peak (${checkout.name}) and banking salary day. Decision raised: "Add peak capacity before 15 Oct". Priority High, confidence 84%.`,
      link: '/team/ram', evidence: [checkout.id, sim.banking.services[0].id] },
    { n: 3, at: s(65), owner: 'santhosh', title: 'Options costed: cloud burst vs hardware vs re-schedule', source: 'Cloud billing (FOCUS-style) · Planview',
      detail: `Cloud burst ₹0.6 Cr OPEX for 6 weeks · on-prem hardware ₹2.4 Cr CAPEX · re-schedule batches ₹0 (partial fix). Last festive burst: ₹${cloud.current} Cr/qtr cloud vs ₹${cloud.target} Cr plan. Recommends burst + re-schedule.`,
      link: '/team/santhosh', evidence: [cloud.id] },
    { n: 4, at: s(90), owner: 'suman', title: 'AI demand forecasting proposed to predict peaks', source: 'AI portfolio · MLOps telemetry',
      detail: `Use case "${uc.name}" (${fc.name}): forecasts peak load 3 weeks ahead so capacity is booked, not bought in panic. NPV ₹${ucRoi.npv} Cr, payback ~${ucRoi.paybackMonths} months; pilot gate criteria met.`,
      link: '/team/suman', evidence: [fc.id] },
    { n: 5, at: s(115), owner: 'vaibhav', title: 'Governance check: data residency and model risk', source: 'Vanta controls · model register',
      detail: `Cloud burst stays in the India region (DPDP residency OK). Forecasting model risk tier Medium: approve with conditions (bias test, drift monitoring). Control "${ctl.control}" re-checked.`,
      link: '/team/vaibhav', evidence: [ctl.id] },
    { n: 6, at: s(140), owner: 'ram', title: 'Decision approved; actions issued; headroom recovers', source: 'Decision Center → actions → outcomes',
      detail: 'Approved by Ram. 4 actions: burst capacity (Pankaj), budget release (Santhosh), forecasting pilot (Suman), conditions (Vaibhav). Headroom back above 30%; outcome tracked.',
      link: '/decision-center', evidence: [] },
  ]
}

export type StepStatus = 'done' | 'active' | 'upcoming'
export function threadState(now: number) {
  const steps = goldenThread()
  const doneCount = steps.filter((x) => x.at <= now).length
  return {
    steps: steps.map((x, i) => ({ ...x, status: (i < doneCount - 1 ? 'done' : i === doneCount - 1 ? (doneCount === steps.length ? 'done' : 'active') : 'upcoming') as StepStatus })),
    progress: Math.round((doneCount / steps.length) * 100),
    complete: doneCount === steps.length,
    nextIn: doneCount < steps.length ? Math.max(0, Math.round((steps[doneCount].at - now) / 1000)) : 0,
  }
}

/** Capacity headroom on the shared cluster during the scenario (%), for live gauges. */
export function headroomAt(now: number) {
  const sec = (now - T0) / 1000
  if (sec < 15) return 22 - sec * 0.2
  if (sec < 140) return Math.max(7, 8 + Math.sin(sec / 3) * 1.2)
  return Math.min(34, 8 + (sec - 140) * 1.5)
}
