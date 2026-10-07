// Technology spend (M7.4, Santhosh). Monthly ledger per business unit, CAPEX / OPEX, TBM allocation,
// cloud daily cost with anomalies, licences and investment cases. Derived from the existing records so totals reconcile:
// run cost = apps + services; change spend = initiative budgets over their active months; cloud = cloud spend metric.
import type { DomainId } from '../domains'
import { MONTHS, SIM_NOW } from './model'
import { sim } from './index'
import { ewmaAnomalies, holt, irr, npv, payback } from './analytics'
import { rng } from './rng'

const D: DomainId[] = ['banking', 'manufacturing', 'retail']
const T0 = Date.parse(SIM_NOW)
const r2 = (n: number) => Math.round(n * 100) / 100
export const MONTH_START = MONTHS.map((_, k) => Date.UTC(2025, 10 + k, 1))

export const CATEGORIES = ['Cloud', 'Licences & SaaS', 'People', 'Vendors & services', 'Hardware & DC', 'Projects (change)'] as const
export type Category = (typeof CATEGORIES)[number]
/** Share of each category that is capitalised (CAPEX). Projects: capitalisable build work. */
export const CAPEX_SHARE: Record<Category, number> = { Cloud: 0, 'Licences & SaaS': 0, People: 0, 'Vendors & services': 0, 'Hardware & DC': 1, 'Projects (change)': 0.6 }

export interface MonthRow { month: string; k: number; byCat: Record<Category, number>; total: number; capex: number; opex: number; budget: number; run: number; change: number }

export function runCostCr(d: DomainId) { const s = sim[d]; return s.applications.reduce((a, x) => a + x.annualCostCr, 0) + s.services.reduce((a, x) => a + x.costCrYr, 0) }

export function ledger(d: DomainId): MonthRow[] {
  const s = sim[d], r = rng(`ledger-${d}`)
  const run = runCostCr(d)
  const cloud = s.metrics.find((m) => m.functionId === 'finance' && m.key === 'cloud')!
  return MONTHS.map((month, k) => {
    const t = MONTH_START[k]
    const season = 1 + (r.next() - 0.5) * 0.06 + (d === 'retail' && k >= 10 ? 0.08 : 0) + (d === 'manufacturing' && (k === 4 || k === 10) ? 0.04 : 0)
    const projects = s.initiatives.reduce((a, i) => {
      const st = Date.parse(i.start), en = Date.parse(i.target)
      const months = Math.max(1, (en - st) / (30.4 * 86_400_000))
      return a + (t >= st && t <= en ? i.budgetCr / months : 0)
    }, 0)
    const byCat: Record<Category, number> = {
      Cloud: r2(cloud.series[k] / 3),
      'Licences & SaaS': r2((run * 0.3 / 12) * season),
      People: r2((run * 0.35 / 12) * (1 + (r.next() - 0.5) * 0.02)),
      'Vendors & services': r2((run * 0.2 / 12) * season),
      'Hardware & DC': r2((run * 0.15 / 12) * (k % 3 === 2 ? 1.6 : 0.7)),
      'Projects (change)': r2(projects * (1 + (r.next() - 0.5) * 0.1)),
    }
    const total = r2(CATEGORIES.reduce((a, c) => a + byCat[c], 0))
    const capex = r2(CATEGORIES.reduce((a, c) => a + byCat[c] * CAPEX_SHARE[c], 0))
    const budget = r2(total * (0.94 + r.next() * 0.08))
    return { month, k, byCat, total, capex, opex: r2(total - capex), budget, run: r2(total - byCat['Projects (change)']), change: byCat['Projects (change)'] }
  })
}
export const forecast3 = (rows: MonthRow[]) => holt(rows.map((x) => x.total), 3)

/** October month-to-date: the share of the month elapsed + live Planview "actuals posted" events after 09:30. */
export function octMtd(d: DomainId, events: { at: number; source: string; text: string }[], now: number) {
  const oct = ledger(d)[11].total
  const base = oct * (5.4 / 31)
  const posted = events.filter((e) => e.source === 'planview' && e.at > T0 && e.at <= now).reduce((a, e) => a + Number(/₹([\d.]+) Cr/.exec(e.text)?.[1] ?? 0), 0)
  return { base: r2(base), posted: r2(posted), mtd: r2(base + posted), full: oct }
}

// ── TBM: cost pools → IT towers → business units ──
export const TOWERS = ['Compute & hosting', 'Applications & SaaS', 'Data & AI', 'Security', 'Network & end-user', 'Unallocated (pending tagging)'] as const
const POOL_TO_TOWER: Record<Category, number[]> = { // shares across the first 5 towers (allocated part only)
  Cloud: [0.55, 0.15, 0.2, 0.05, 0.05], 'Licences & SaaS': [0.05, 0.65, 0.15, 0.1, 0.05], People: [0.2, 0.35, 0.15, 0.1, 0.2],
  'Vendors & services': [0.25, 0.35, 0.1, 0.15, 0.15], 'Hardware & DC': [0.6, 0, 0.1, 0.05, 0.25], 'Projects (change)': [0.15, 0.45, 0.25, 0.1, 0.05],
}
/** Builds Sankey nodes / links for the fiscal year. `allocatedPct` = share of spend tagged to services (TBM coverage). */
export function tbmSankey(allocatedPct: number) {
  const totals = Object.fromEntries(D.map((d) => [d, Object.fromEntries(CATEGORIES.map((c) => [c, ledger(d).reduce((a, x) => a + x.byCat[c], 0)]))])) as Record<DomainId, Record<Category, number>>
  const nodes = [...CATEGORIES.map((name) => ({ name })), ...TOWERS.map((name) => ({ name })), ...D.map((d) => ({ name: sim[d].org.replace(' (fictional)', '') }))]
  const towerIdx = (i: number) => CATEGORIES.length + i, buIdx = (i: number) => CATEGORIES.length + TOWERS.length + i
  const a = allocatedPct / 100
  const links: { source: number; target: number; value: number }[] = []
  CATEGORIES.forEach((c, ci) => {
    const amt = D.reduce((s, d) => s + totals[d][c], 0)
    POOL_TO_TOWER[c].forEach((sh, ti) => sh && links.push({ source: ci, target: towerIdx(ti), value: r2(amt * a * sh) }))
    links.push({ source: ci, target: towerIdx(5), value: r2(amt * (1 - a)) })
  })
  TOWERS.forEach((_, ti) => {
    D.forEach((d, di) => {
      const v = CATEGORIES.reduce((s, c) => s + totals[d][c] * (ti === 5 ? 1 - a : a * POOL_TO_TOWER[c][ti]), 0)
      if (v > 0) links.push({ source: towerIdx(ti), target: buIdx(di), value: r2(v) })
    })
  })
  return { nodes, links }
}

// ── Cloud daily cost (last 60 days) with EWMA anomaly detection ──
export function cloudDaily(d: DomainId) {
  const r = rng(`cloud-daily-${d}`)
  const daily = (ledger(d)[11].byCat.Cloud / 30) * 100 // ₹ lakh per day
  const xs = Array.from({ length: 60 }, (_, i) => {
    let v = daily * (1 + (r.next() - 0.5) * 0.08) * (i % 7 >= 5 ? 0.9 : 1)
    if (d === 'retail' && i >= 55) v *= 1.55 + (i - 55) * 0.08 // festive autoscaling burst (golden thread step 3)
    if (d === 'banking' && i === 38) v *= 1.45 // runaway batch job left on
    if (d === 'manufacturing' && i === 47) v *= 1.4 // misconfigured data-lake export
    return Math.round(v * 10) / 10
  })
  const days = xs.map((v, i) => ({ day: new Date(T0 - (59 - i) * 86_400_000).toISOString().slice(5, 10), v }))
  // Cost anomalies that matter are spikes (z > 0); dips (weekends) are expected.
  const why = (i: number) => (d === 'retail' && i >= 55 ? 'Festive autoscaling — value or waste? Check cost per order.' : d === 'banking' && i === 38 ? 'Batch compute left running after a job — FinOps ticket raised and closed.' : d === 'manufacturing' && i === 47 ? 'Data-lake export misconfigured (full copy) — fixed the same day.' : 'Unexplained spike — tag owners to investigate.')
  return { days, anomalies: ewmaAnomalies(xs, 0.3, 3).filter((a) => a.z > 0).map((a) => ({ ...a, why: why(a.index) })) }
}

// ── Licences (per business unit) ──
type L = [string, number, number, number] // product, seats, used, ₹ Cr / yr
const LIC: Record<DomainId, L[]> = {
  banking: [['CRM service cloud', 1400, 1100, 2.3], ['Data platform credits', 1000, 690, 1.6], ['Productivity suite', 9800, 8100, 2.9], ['Developer tooling', 420, 300, 0.6], ['Security tooling (EDR)', 9800, 9500, 1.4], ['BI and reporting', 1200, 620, 0.8]],
  manufacturing: [['CAD seats', 950, 760, 3.1], ['PLM named users', 1500, 1050, 1.8], ['Productivity suite', 7200, 6100, 2.1], ['MES client licences', 2400, 2050, 0.9], ['BI and reporting', 800, 430, 0.5], ['Simulation software', 120, 64, 0.9]],
  retail: [['Commerce platform (GMV-based)', 1, 1, 2.4], ['CDP profiles (millions)', 30, 24, 1.1], ['Productivity suite', 5200, 4600, 1.5], ['Store workforce app', 18000, 15600, 0.7], ['BI and reporting', 900, 520, 0.5], ['Design and content tools', 260, 150, 0.3]],
}
export const licences = (d: DomainId) => LIC[d].map(([product, seats, used, cost]) => ({ product, seats, used, cost, util: Math.round((used / seats) * 100), waste: r2(cost * (1 - used / seats)) }))

// ── Investment cases per initiative: NPV / IRR / payback over 3 years after build ──
export function investmentCase(i: (typeof sim)['banking']['initiatives'][number]) {
  // Expected value in the plan is a 3-year benefit → annual run-rate = value / 3, ramping 40% → 80% → 100%, over 5 years after build, net of 10% run cost.
  const annual = i.expectedValueCr / 3
  const flows = [-i.budgetCr, ...[0.4, 0.8, 1, 1, 1].map((x) => Math.round((annual * x - i.budgetCr * 0.1) * 100) / 100)]
  const pb = payback(flows)
  return { npv: npv(0.12, flows), irr: irr(flows), paybackYears: pb, flows }
}
export const D_ALL = D
