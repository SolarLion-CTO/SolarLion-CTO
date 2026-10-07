// Team workspaces (M7): the five capstone owners, what they are accountable for (from bp1.jpeg, 20 Sep 2026),
// and the measures that track their transformation from the old state (Nov 2025) to the target state.
// Measures reuse the simulated metric history wherever one exists, so they agree with every other page.
import type { DomainId } from '../domains'
import type { FunctionId, SourceId } from './model'
import { MONTHS, SIM_NOW } from './model'
import { sim } from './index'
import { exec360 } from './scores'
import { rng } from './rng'
import { circulars, modelsApprovedPct } from './governance'
import { PROGRAMME_START, elapsed, eta, glide, glidePath, progress } from './analytics'
import type { Glide } from './analytics'

export type OwnerId = 'ram' | 'suman' | 'vaibhav' | 'santhosh' | 'pankaj'
export interface MeasureDef { id: string; name: string; unit: string; better: 'up' | 'down'; target: number; targetDate: string; dp?: number; note: string; series: () => number[] }
export interface Owner {
  id: OwnerId; name: string; role: string; workspace: string; tagline: string
  accountable: string[]; bp1: string[]; from: string[]; to: string[]
  functions: FunctionId[]; sources: Exclude<SourceId, 'business'>[]; defaultDomain: DomainId | 'all'
  measures: MeasureDef[]
}

const D: DomainId[] = ['banking', 'manufacturing', 'retail']
const metric = (d: DomainId, fn: FunctionId, key: string) => sim[d].metrics.find((m) => m.functionId === fn && m.key === key)!
const across = (fn: FunctionId, key: string, how: 'sum' | 'avg') => MONTHS.map((_, k) => { const v = D.reduce((s, d) => s + metric(d, fn, key).series[k], 0); return Math.round((how === 'avg' ? v / D.length : v) * 10) / 10 })
const targetAcross = (fn: FunctionId, key: string, how: 'sum' | 'avg') => { const v = D.reduce((s, d) => s + metric(d, fn, key).target, 0); return Math.round((how === 'avg' ? v / D.length : v) * 10) / 10 }
const seed = (id: string, from: number, to: number, dp = 1) => {
  const r = rng(`team-${id}`), f = 10 ** dp, span = Math.abs(to - from) || 1
  return MONTHS.map((_, k) => (k === 0 ? from : k === 11 ? to : Math.round((from + ((to - from) * k) / 11 + (r.next() - 0.5) * span * 0.06) * f) / f))
}

export const OWNERS: Owner[] = [
  {
    id: 'ram', name: 'Ram', role: 'Group CTO', workspace: 'CTO Control Tower', tagline: 'Integrate, decide, prove outcomes',
    accountable: ['Domain-agnostic framework across Banking, Manufacturing and Retail', 'AI and multi-agent decision intelligence to track ongoing and new work'],
    bp1: ['Agnostic domain: Banking + Manufacturing', 'AI + multi-agent implementation to track ongoing + new'],
    from: ['Each business unit reports separately, in its own format', 'Cross-tool causes are found late, in steering meetings', 'Decisions take ~3 weeks; nobody checks if they worked'],
    to: ['One CTO view across 3 business units on one framework', 'Signals correlated automatically by agents; decision in ≤ 3 days', '80% of decisions tracked to a measured outcome'],
    functions: ['strategy', 'technology', 'architecture', 'engineering'], sources: ['planview', 'leanix', 'process', 'servicenow', 'jellyfish', 'datadog', 'vanta'], defaultDomain: 'all',
    measures: [
      { id: 'ram-bu', name: 'Business units on one framework', unit: '', better: 'up', target: 3, targetDate: '2026-12-31', dp: 0, note: 'Banking (Feb), Manufacturing (Jun), Retail (Aug 2026)', series: () => [0, 0, 0, 1, 1, 1, 1, 2, 2, 3, 3, 3] },
      { id: 'ram-s2d', name: 'Signal-to-decision time', unit: 'days', better: 'down', target: 3, targetDate: '2027-03-31', note: 'From first correlated signal to a recorded decision', series: () => seed('s2d', 21, 6) },
      { id: 'ram-out', name: 'Decisions with measured outcome', unit: '%', better: 'up', target: 80, targetDate: '2027-06-30', dp: 0, note: 'Approved decisions with baseline → current → target tracked', series: () => seed('out', 0, 22, 0) },
      { id: 'ram-health', name: 'Enterprise technology health', unit: '/100', better: 'up', target: 85, targetDate: '2027-06-30', dp: 0, note: 'Average of the 3 business units (calculated)', series: () => MONTHS.map((_, k) => Math.round(D.reduce((s, d) => s + exec360(sim[d])[0].series[k], 0) / 3)) },
      { id: 'ram-ontrack', name: 'Programmes on track', unit: '%', better: 'up', target: 85, targetDate: '2027-06-30', dp: 0, note: 'Initiatives with green health, all business units', series: () => { const all = D.flatMap((d) => sim[d].initiatives); return seed('ontrack', 45, Math.round((all.filter((i) => i.health === 'Green').length / all.length) * 100), 0) } },
      { id: 'ram-risk', name: 'Critical + high risks open', unit: '', better: 'down', target: 15, targetDate: '2027-06-30', dp: 0, note: 'All business units (calculated from the risk registers)', series: () => { const n = D.reduce((s, d) => s + sim[d].risks.filter((r) => r.severity === 'Critical' || r.severity === 'High').length, 0); return seed('risk', n + 12, n, 0) } },
    ],
  },
  {
    id: 'suman', name: 'Suman', role: 'Strategy & ROI lead', workspace: 'AI Transformation', tagline: 'From pilots to measurable value — for any organisation',
    accountable: ['Identify and prove ROI of AI and technology investment', 'A repeatable method to transform any organisation to AI'],
    bp1: ['Identify ROI', 'Transform any organisation to AI'],
    from: ['AI exists as scattered pilots; most never reach production', 'ROI is claimed, not measured', 'Every new business unit starts its AI journey from scratch'],
    to: ['A stage-gated AI portfolio from idea to scaled', 'Value tracked per use case with payback and confidence ranges', 'Any organisation onboarded from an industry template in weeks'],
    functions: ['data-ai', 'product', 'strategy'], sources: ['planview', 'jellyfish'], defaultDomain: 'all',
    measures: [
      { id: 'suman-ready', name: 'AI readiness', unit: '/5', better: 'up', target: 4.5, targetDate: '2027-06-30', note: 'Average AI maturity of the 3 business units (calculated)', series: () => MONTHS.map((_, k) => Math.round((D.reduce((s, d) => s + exec360(sim[d]).find((x) => x.key === 'ai')!.series[k], 0) / 3) * 10) / 10) },
      { id: 'suman-prod', name: 'AI use cases in production', unit: '', better: 'up', target: targetAcross('data-ai', 'usecases', 'sum'), targetDate: '2027-03-31', dp: 0, note: 'Sum across business units (simulated portfolio)', series: () => across('data-ai', 'usecases', 'sum') },
      { id: 'suman-value', name: 'AI value realised', unit: '₹ Cr', better: 'up', target: targetAcross('data-ai', 'aivalue', 'sum'), targetDate: '2027-03-31', note: 'Sum across business units', series: () => across('data-ai', 'aivalue', 'sum') },
      { id: 'suman-conv', name: 'Pilot-to-production conversion', unit: '%', better: 'up', target: 60, targetDate: '2027-06-30', dp: 0, note: 'Share of pilots promoted to production', series: () => seed('conv', 18, 41, 0) },
      { id: 'suman-payback', name: 'Average AI payback', unit: 'months', better: 'down', target: 18, targetDate: '2027-06-30', dp: 0, note: 'Across use cases in production', series: () => seed('payback', 30, 24, 0) },
      { id: 'suman-adopt', name: 'AI-assisted service adoption', unit: '%', better: 'up', target: targetAcross('cx', 'ai', 'avg'), targetDate: '2027-03-31', note: 'Average share of AI-assisted service', series: () => across('cx', 'ai', 'avg') },
    ],
  },
  {
    id: 'vaibhav', name: 'Vaibhav', role: 'Regulatory & AI Governance lead', workspace: 'Regulatory & AI Governance', tagline: 'Compliance at the speed of change; trustworthy AI and data',
    accountable: ['Automate regulatory compliance, with implementation (Banking first)', 'DPDP and AI governance'],
    bp1: ['Automate regulatory with implementation', 'DPDP / AI governance'],
    from: ['Each circular mapped to controls by hand, ~3 weeks', 'No inventory of AI models in production', 'Partial DPDP consent; breach reporting clocks often missed'],
    to: ['AI drafts obligations; human approves within 2 days', 'Every model registered, risk-tiered and approved', 'Full consent coverage; breaches reported on time'],
    functions: ['risk', 'cyber', 'legal'], sources: ['vanta'], defaultDomain: 'banking',
    measures: [
      { id: 'vai-oblig', name: 'Obligations mapped to controls', unit: '%', better: 'up', target: 100, targetDate: '2027-03-31', dp: 0, note: 'Banking (simulated legal & compliance data)', series: () => metric('banking', 'legal', 'oblig').series },
      { id: 'vai-days', name: 'Days per regulatory circular', unit: 'days', better: 'down', target: 2, targetDate: '2027-03-31', note: 'Receipt to approved control mapping', series: () => { const done = circulars.filter((c) => c.daysTaken !== null).slice(-2); return seed('days', 21, Math.round((done.reduce((a, c) => a + c.daysTaken!, 0) / done.length) * 10) / 10) } },
      { id: 'vai-models', name: 'AI models registered & approved', unit: '%', better: 'up', target: 100, targetDate: '2027-03-31', dp: 0, note: 'Models in production with approval', series: () => seed('models', 30, modelsApprovedPct(), 0) },
      { id: 'vai-consent', name: 'DPDP consent coverage', unit: '%', better: 'up', target: 100, targetDate: '2027-05-31', dp: 0, note: 'Banking customers with recorded consent', series: () => metric('banking', 'marketing', 'consent').series },
      { id: 'vai-breach', name: 'Breach reports on time', unit: '%', better: 'up', target: 100, targetDate: '2027-03-31', dp: 0, note: 'Within the configured reporting clock (illustrative)', series: () => seed('breach', 50, 80, 0) },
      { id: 'vai-ctl', name: 'Control effectiveness', unit: '%', better: 'up', target: 95, targetDate: '2027-06-30', dp: 0, note: 'Banking controls passing (calculated)', series: () => metric('banking', 'risk', 'ctl').series },
    ],
  },
  {
    id: 'santhosh', name: 'Santhosh', role: 'Finance & Investment Governance lead', workspace: 'Technology Spend & Investment', tagline: 'Every rupee traceable to a service and a value',
    accountable: ['A governance system for technology investment', 'Apps, resources and decision making across OPEX and CAPEX'],
    bp1: ['Governance system', 'Apps / resources / decision making — OPEX / CAPEX'],
    from: ['Spend tracked late in spreadsheets', 'CAPEX / OPEX split unclear as workloads move to cloud', 'Investments approved once and never value-tracked'],
    to: ['Monthly CAPEX / OPEX by business unit and service (TBM)', 'FinOps: cloud cost watched daily, waste removed', 'Every investment stage-gated with NPV and value tracking'],
    functions: ['finance', 'procurement'], sources: ['planview', 'servicenow'], defaultDomain: 'all',
    measures: [
      { id: 'san-fcst', name: 'Spend forecast accuracy', unit: '%', better: 'up', target: 95, targetDate: '2027-03-31', dp: 0, note: 'Quarterly forecast vs actual', series: () => seed('fcst', 80, 88, 0) },
      { id: 'san-tbm', name: 'Spend allocated to services (TBM)', unit: '%', better: 'up', target: 95, targetDate: '2027-06-30', dp: 0, note: 'Cost pools allocated to towers and applications', series: () => seed('tbm', 40, 72, 0) },
      { id: 'san-waste', name: 'Cloud waste (idle / unused)', unit: '%', better: 'down', target: 8, targetDate: '2027-03-31', dp: 0, note: 'Share of cloud spend on idle or unused resources (FinOps)', series: () => seed('waste', 28, 17, 0) },
      { id: 'san-lic', name: 'Licence utilisation', unit: '%', better: 'up', target: 85, targetDate: '2027-03-31', note: 'Average across business units', series: () => across('procurement', 'licence', 'avg') },
      { id: 'san-change', name: 'Change-the-business share', unit: '%', better: 'up', target: 45, targetDate: '2027-06-30', note: 'Share of spend on transformation', series: () => across('finance', 'share', 'avg') },
      { id: 'san-track', name: 'Investments value-tracked', unit: '%', better: 'up', target: 100, targetDate: '2027-06-30', dp: 0, note: 'Approved investments with benefits tracked after go-live', series: () => seed('track', 15, 58, 0) },
    ],
  },
  {
    id: 'pankaj', name: 'Pankaj', role: 'Operations lead', workspace: 'ERP RCA & Capacity', tagline: 'Fix causes, not symptoms; capacity before the peak',
    accountable: ['ERP root-cause analysis', 'Capacity planning of infrastructure', 'Automation of the production management process'],
    bp1: ['ERP — RCA', 'Capacity planning of infra', 'Automation of the production management process'],
    from: ['ERP incidents recur every month-end; fixes are workarounds', 'Capacity added after outages', 'Production planning largely manual'],
    to: ['Problem management with permanent fixes', 'Forecast-driven capacity ahead of every peak', 'Automated plan-to-produce with closed loop to MES'],
    functions: ['operations', 'technology'], sources: ['datadog', 'servicenow', 'process'], defaultDomain: 'manufacturing',
    measures: [
      { id: 'pan-recur', name: 'Recurring ERP problems', unit: '', better: 'down', target: 3, targetDate: '2027-03-31', dp: 0, note: 'Open problem records with ≥ 3 linked incidents', series: () => seed('recur', 14, 7, 0) },
      { id: 'pan-fix', name: 'Time to permanent fix', unit: 'days', better: 'down', target: 10, targetDate: '2027-03-31', dp: 0, note: 'Problem opened → root-cause fix deployed', series: () => seed('fix', 45, 24, 0) },
      { id: 'pan-avail', name: 'ERP availability in peak windows', unit: '%', better: 'up', target: 99.9, targetDate: '2027-03-31', dp: 2, note: 'Month-end and festive windows: core ledger, SAP order-to-cash and batch, retail OMS', series: () => seed('avail', 99.42, 99.71, 2) },
      { id: 'pan-head', name: 'Minimum capacity headroom', unit: '%', better: 'up', target: 30, targetDate: '2027-03-31', dp: 0, note: 'Lowest headroom across critical services at peak', series: () => seed('head', 8, 17, 0) },
      { id: 'pan-auto', name: 'Production steps automated', unit: '%', better: 'up', target: 70, targetDate: '2027-06-30', dp: 0, note: 'Plan-to-produce and maintenance steps running without manual hand-off', series: () => seed('auto', 40, 52, 0) },
      { id: 'pan-chg', name: 'Incidents caused by changes', unit: '%', better: 'down', target: 15, targetDate: '2027-03-31', dp: 0, note: 'Incidents within 24 h of a change', series: () => seed('chg', 38, 27, 0) },
    ],
  },
]
export const OWNER = Object.fromEntries(OWNERS.map((o) => [o.id, o])) as Record<OwnerId, Owner>

// ── Transformation maths (current → target) ──
export const MONTH_ISO = MONTHS.map((_, k) => { const d = new Date(Date.UTC(2025, 10 + k, 1)); return d.toISOString().slice(0, 10) })
export interface MeasureState { def: MeasureDef; series: number[]; baseline: number; current: number; target: number; progress: number; elapsed: number; glide: Glide; eta: string | null; plan: number[] }
export function measureState(m: MeasureDef): MeasureState {
  const s = m.series()
  const now = Date.parse(SIM_NOW)
  const baseline = s[0], current = s[11]
  const prog = progress(baseline, current, m.target)
  const el = elapsed(m.targetDate, now)
  return { def: m, series: s, baseline, current, target: m.target, progress: prog, elapsed: el, glide: glide(prog, el), eta: prog >= 100 ? 'Reached' : eta(s, m.target, now), plan: glidePath(baseline, m.target, m.targetDate, MONTH_ISO) }
}
export function ownerState(o: Owner) {
  const ms = o.measures.map(measureState)
  const score = Math.round(ms.reduce((s, m) => s + m.progress, 0) / ms.length)
  const count = (g: Glide) => ms.filter((m) => m.glide === g).length
  return { owner: o, measures: ms, score, ahead: count('Ahead'), onTrack: count('On track'), behind: count('Behind') }
}
export { PROGRAMME_START }
