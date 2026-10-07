// AI portfolio (M7.2, Suman): flagship AI use cases per business unit, readiness, ROI and industry templates.
// Synthetic data; values in ₹ Cr per year. Linked to real simulated apps and initiatives.
import type { DomainId } from '../domains'
import { sim } from './index'
import { functionHealth } from './scores'
import { monteCarlo, npv, payback, sCurve, triangular } from './analytics'

export type Stage = 'Idea' | 'PoC' | 'Pilot' | 'Production' | 'Scaled'
export const STAGES: Stage[] = ['Idea', 'PoC', 'Pilot', 'Production', 'Scaled']
/** Probability a use case at this stage delivers its value (stage-gate attrition). */
export const STAGE_P: Record<Stage, number> = { Idea: 0.15, PoC: 0.35, Pilot: 0.6, Production: 0.9, Scaled: 1 }

export interface UseCase {
  id: string; domain: DomainId; name: string; stage: Stage; owner: string
  investCr: number; vMin: number; vLikely: number; vMax: number; realisedCr: number
  feasibility: number; value: number; dataReady: number; risk: 'Low' | 'Medium' | 'High'
  appId: string | null; initiativeId: string | null; monthsLive: number
  gate?: { criteria: [string, string, string, boolean][] } // criterion, target, actual, met
}

type Row = [string, Stage, string, number, number, number, number, number, number, number, number, 'Low' | 'Medium' | 'High', number | null, number | null, number]
const ROWS: Record<DomainId, Row[]> = {
  banking: [
    ['Real-time fraud scoring (UPI)', 'Production', 'Head of Data & AI', 2.4, 6, 9, 13, 5.1, 8, 9, 85, 'High', 12, 2, 9],
    ['AML alert triage', 'Pilot', 'Head of Fraud Ops', 1.1, 2, 3.5, 5, 0.4, 7, 8, 70, 'High', 13, 2, 3],
    ['KYC document extraction', 'Production', 'Compliance Ops lead', 0.8, 1.5, 2.4, 3.2, 1.6, 9, 7, 80, 'Medium', 14, 6, 11],
    ['SME credit underwriting assist', 'Pilot', 'Head of Credit Risk', 1.6, 2.5, 4, 6, 0.3, 6, 8, 60, 'High', 8, 7, 2],
    ['Customer 360 next-best-action', 'PoC', 'Head of Data & AI', 1.2, 2, 3.6, 5.5, 0, 6, 8, 55, 'Medium', 19, 5, 0],
    ['Contact-centre GenAI assistant', 'Scaled', 'Head of Digital', 0.9, 1.8, 2.6, 3.4, 2.2, 8, 7, 75, 'Medium', 18, 5, 14],
    ['Collections propensity model', 'Production', 'Head of Collections', 0.6, 1.2, 1.8, 2.5, 1.3, 8, 6, 80, 'Medium', 22, 7, 10],
    ['Regulatory return auto-reconciliation', 'Pilot', 'Head of RegTech', 0.7, 1, 1.6, 2.2, 0.2, 7, 6, 65, 'Low', 20, 6, 2],
    ['Payments anomaly detection', 'PoC', 'Head of Payments Tech', 0.5, 0.8, 1.4, 2, 0, 7, 7, 70, 'Low', 2, 1, 0],
    ['Mainframe code-to-Java assist', 'Idea', 'Head of Core Banking Tech', 1.8, 2, 4, 7, 0, 4, 8, 40, 'Medium', 0, 0, 0],
    ['Treasury liquidity forecasting', 'Idea', 'Treasurer', 0.4, 0.5, 0.9, 1.4, 0, 6, 5, 60, 'Low', 11, null, 0],
    ['Branch cash demand forecasting', 'Production', 'Head of Branch Banking', 0.3, 0.6, 0.9, 1.2, 0.7, 9, 5, 85, 'Low', 17, null, 12],
    ['Tokenised trade finance (blockchain)', 'Idea', 'Head of Digital', 1.5, 1, 2.5, 4.5, 0, 4, 7, 35, 'Medium', 1, 4, 0],
  ],
  manufacturing: [
    ['Predictive maintenance — critical lines', 'Scaled', 'Head of Maintenance', 2.2, 4, 6.5, 9, 5.8, 8, 9, 80, 'Medium', 11, 4, 15],
    ['AI vision final inspection', 'Pilot', 'Head of Quality', 1.4, 2.5, 4, 5.5, 0.5, 7, 8, 70, 'Medium', 14, 7, 3],
    ['Demand sensing for production plan', 'PoC', 'Head of Planning', 0.9, 1.5, 2.6, 3.8, 0, 6, 8, 55, 'Low', 4, 6, 0],
    ['Plant energy optimisation', 'Production', 'Head of Manufacturing', 0.8, 1.4, 2.1, 3, 1.6, 8, 6, 75, 'Low', 10, 5, 8],
    ['Supplier risk early warning', 'Pilot', 'Chief Supply Chain Officer', 0.6, 1, 1.8, 2.6, 0.2, 7, 7, 60, 'Medium', 17, 6, 2],
    ['Generative design for components', 'PoC', 'Chief Engineer', 1.1, 1.2, 2.4, 4, 0, 5, 7, 45, 'Medium', 7, 3, 0],
    ['BOM auto-reconciliation PLM → ERP', 'Idea', 'Head of Engineering Systems', 0.7, 1, 1.8, 2.8, 0, 5, 8, 40, 'Low', 5, 2, 0],
    ['Digital-twin throughput optimisation', 'Pilot', 'Head of OT', 1.5, 1.8, 3, 4.5, 0.3, 5, 8, 50, 'Medium', 15, 0, 2],
    ['Spare-parts inventory optimisation', 'Production', 'Head of Maintenance', 0.5, 1, 1.6, 2.2, 1.2, 8, 6, 80, 'Low', 12, 4, 9],
    ['Shop-floor GenAI work instructions', 'Idea', 'Head of Manufacturing', 0.6, 0.8, 1.5, 2.4, 0, 6, 6, 50, 'Medium', 2, 1, 0],
    ['Scrap root-cause analytics', 'Production', 'Head of Quality', 0.4, 0.8, 1.3, 1.9, 1, 8, 6, 75, 'Low', 13, 7, 10],
    ['Freight cost optimisation', 'Production', 'Head of Logistics', 0.3, 0.5, 0.9, 1.3, 0.6, 9, 5, 85, 'Low', 20, 6, 7],
    ['Industrial metaverse training (digital twin + XR)', 'Idea', 'Head of OT', 1.3, 0.8, 1.8, 3, 0, 4, 6, 40, 'Medium', 15, 0, 0],
  ],
  retail: [
    ['Personalised recommendations', 'Scaled', 'CMO', 1.8, 4, 6.5, 9, 6.2, 8, 9, 85, 'Medium', 20, 4, 16],
    ['AI demand forecasting (store × SKU)', 'Pilot', 'COO', 1.6, 3, 5, 7.5, 0.6, 7, 9, 65, 'Medium', 8, 5, 3],
    ['Dynamic markdown pricing', 'Production', 'Head of Pricing', 0.9, 1.8, 2.8, 3.8, 2.1, 7, 8, 75, 'Medium', 12, null, 8],
    ['Customer service GenAI agent', 'Production', 'Head of Customer Ops', 0.8, 1.4, 2.2, 3, 1.7, 8, 7, 80, 'Medium', 19, null, 9],
    ['Returns-abuse and fraud detection', 'Pilot', 'Head of E-commerce Tech', 0.7, 1.2, 2, 2.8, 0.3, 7, 7, 70, 'High', 13, 0, 2],
    ['Visual search', 'PoC', 'Head of Digital', 0.6, 0.8, 1.5, 2.4, 0, 6, 6, 60, 'Low', 0, 3, 0],
    ['Store labour scheduling', 'Production', 'Head of Stores', 0.5, 0.9, 1.5, 2.1, 1.1, 8, 6, 80, 'Low', null, null, 7],
    ['Shelf-gap detection (store cameras)', 'Idea', 'Head of Stores', 1.2, 1, 2, 3.5, 0, 4, 7, 40, 'Medium', 18, 2, 0],
    ['Delivery route optimisation', 'Production', 'Head of Delivery', 0.6, 1, 1.6, 2.2, 1.3, 8, 6, 80, 'Low', 11, 6, 11],
    ['GenAI product content', 'Pilot', 'Head of Merchandising', 0.4, 0.6, 1.1, 1.6, 0.2, 8, 5, 70, 'Medium', 16, 3, 2],
    ['Assortment planning AI', 'PoC', 'Head of Merchandising', 0.9, 1.2, 2.2, 3.4, 0, 6, 7, 55, 'Low', 21, 6, 0],
    ['Loyalty churn prediction', 'Idea', 'CMO', 0.5, 0.8, 1.4, 2, 0, 7, 6, 60, 'Medium', 14, 7, 0],
  ],
}
/** Pilot gate criteria for the pilot that is ready for its production gate (row 2 in each domain). */
const GATES: Record<DomainId, [string, string, string, boolean][]> = {
  banking: [['Alert reduction', '≥ 40%', '47%', true], ['Missed true positives', '≤ 1%', '0.6%', true], ['Investigator time saved', '≥ 25%', '31%', true], ['Model risk review', 'Approved', 'Approved (Medium tier)', true]],
  manufacturing: [['Defect detection rate', '≥ 95%', '96.8%', true], ['False reject rate', '≤ 2%', '1.7%', true], ['Line speed impact', 'None', 'None', true], ['Bias / drift monitoring', 'In place', 'In place', true]],
  retail: [['Forecast accuracy (WAPE)', '≤ 20%', '17.5%', true], ['Stockout reduction (pilot stores)', '≥ 15%', '19%', true], ['Planner adoption', '≥ 70%', '78%', true], ['Data residency check', 'Pass', 'Pass', true]],
}

const D: DomainId[] = ['banking', 'manufacturing', 'retail']
export const USE_CASES: UseCase[] = D.flatMap((d) => ROWS[d].map((r, i): UseCase => {
  const [name, stage, owner, investCr, vMin, vLikely, vMax, realisedCr, feasibility, value, dataReady, risk, app, init, monthsLive] = r
  return {
    id: `AIUC-${sim[d].code}-${String(i + 1).padStart(2, '0')}`, domain: d, name, stage, owner, investCr, vMin, vLikely, vMax, realisedCr, feasibility, value, dataReady, risk,
    appId: app === null ? null : sim[d].applications[app].id, initiativeId: init === null ? null : sim[d].initiatives[init].id, monthsLive,
    gate: i === 1 ? { criteria: GATES[d] } : undefined,
  }
}))
export const gateDecisionId = (u: UseCase) => `GATE-${u.id}`

// ── Readiness (1–5) per domain: six dimensions derived from existing simulated metrics ──
export const DIMENSIONS = ['Strategy', 'Data', 'Platform', 'Skills', 'Governance', 'Adoption'] as const
export function readiness(d: DomainId) {
  const s = sim[d]
  const m = (fn: string, key: string) => s.metrics.find((x) => x.functionId === fn && x.key === key)!.score
  const lvl = (score: number) => Math.round((1 + (4 * score) / 100) * 10) / 10
  const raw: Record<(typeof DIMENSIONS)[number], number> = {
    Strategy: functionHealth(s, 'strategy').score,
    Data: m('data-ai', 'dq'),
    Platform: Math.round((functionHealth(s, 'technology').score + functionHealth(s, 'architecture').score) / 2),
    Skills: m('hr', 'aiskill'),
    Governance: m('data-ai', 'rai'),
    Adoption: m('cx', 'ai'),
  }
  const action: Record<(typeof DIMENSIONS)[number], string> = {
    Strategy: 'Tie every AI use case to a strategic objective and value case',
    Data: 'Fix data quality on the critical data elements feeding models',
    Platform: 'Retire legacy dependencies; standard MLOps platform',
    Skills: 'AI academy for engineers and product owners',
    Governance: 'Model register, risk tiering and bias tests before production',
    Adoption: 'Embed AI in front-line workflows with change management',
  }
  return DIMENSIONS.map((dim) => ({ dim, current: lvl(raw[dim]), target: dim === 'Governance' ? 4.5 : 4, action: action[dim] }))
}

// ── ROI: quarterly cash flows over 3 years with an adoption S-curve after go-live ──
const STAGE_START: Record<Stage, number> = { Scaled: 0, Production: 0, Pilot: 2, PoC: 4, Idea: 6 } // quarters until value starts
/** Run cost (cloud, MLOps, support) = 30% of build cost per year once live — keeps ROI realistic. */
export const RUN_COST_RATE = 0.3
export function cashflows(u: UseCase, quarters = 12) {
  const start = STAGE_START[u.stage]
  return Array.from({ length: quarters + 1 }, (_, q) => (q === 0 ? -u.investCr : q <= start ? 0 : Math.round(((u.vLikely / 4) * sCurve(q - start, 1, 2.5, 1.1) - (u.investCr * RUN_COST_RATE) / 4) * 100) / 100))
}
export function roi(u: UseCase) {
  const f = cashflows(u)
  const pb = payback(f)
  return { npv: npv(0.03, f), paybackMonths: pb === null ? null : Math.round(pb * 3), roi3y: Math.round(((f.slice(1).reduce((s, x) => s + x, 0) - u.investCr) / u.investCr) * 100), flows: f }
}
/** Monte Carlo of the annual portfolio value: triangular value × stage success probability. */
export function portfolioMonteCarlo(ucs: UseCase[], seed: string) {
  return monteCarlo(seed, 2000, (r) => ucs.reduce((s, u) => s + (r.next() < STAGE_P[u.stage] ? triangular(r, u.vMin, u.vLikely, u.vMax) : 0), 0))
}

// ── Industry templates for "onboard any organisation" ──
export interface Template { id: string; label: string; useCases: [string, string, string, number, number][]; kpis: string[]; risks: string[] } // name, value lever, data needed, value 1-10, feasibility 1-10
export const TEMPLATES: Template[] = [
  { id: 'banking', label: 'Banking & financial services', kpis: ['Fraud loss (bps)', 'Straight-through processing %', 'Cost-to-income ratio', 'Digital adoption %', 'Regulatory findings'], risks: ['Model risk and explainability', 'DPDP consent', 'Regulator approval for customer-facing AI'],
    useCases: [['Fraud scoring', 'Loss avoided', 'Transactions, device data', 9, 8], ['KYC document extraction', 'Ops cost', 'ID documents', 7, 9], ['Contact-centre assistant', 'Handle time', 'Call transcripts', 7, 8], ['Credit underwriting assist', 'Approval speed', 'Bureau + transactions', 8, 6], ['Collections propensity', 'Recovery rate', 'Repayment history', 6, 8]] },
  { id: 'manufacturing', label: 'Manufacturing & industrial', kpis: ['OEE %', 'Unplanned downtime %', 'First-pass yield %', 'Scrap %', 'Energy per unit'], risks: ['OT security', 'Sensor data quality', 'Shop-floor adoption'],
    useCases: [['Predictive maintenance', 'Downtime avoided', 'Sensor / historian data', 9, 7], ['AI vision inspection', 'Scrap and rework', 'Line images', 8, 7], ['Demand sensing', 'Inventory', 'Orders, POS, signals', 7, 6], ['Energy optimisation', 'Energy cost', 'Meter data', 6, 8], ['Spare-parts optimisation', 'Working capital', 'CMMS history', 6, 8]] },
  { id: 'retail', label: 'Retail & e-commerce', kpis: ['Conversion %', 'Stockouts %', 'Gross margin %', 'Repeat purchase %', 'Cost to serve'], risks: ['Personal data use', 'Pricing fairness', 'Peak-season reliability'],
    useCases: [['Personalised recommendations', 'Basket size', 'Clickstream, orders', 9, 8], ['Demand forecasting', 'Stockouts, waste', 'Sales history', 9, 7], ['Markdown pricing', 'Margin', 'Price, inventory', 8, 7], ['Service GenAI agent', 'Contact cost', 'Tickets, FAQs', 7, 8], ['Route optimisation', 'Delivery cost', 'Orders, addresses', 6, 8]] },
  { id: 'insurance', label: 'Insurance', kpis: ['Combined ratio', 'Claims cycle time', 'Fraud detected', 'Quote-to-bind %', 'NPS'], risks: ['Pricing fairness / bias', 'Explainability to customers', 'Health data sensitivity'],
    useCases: [['Claims triage', 'Cycle time', 'Claims, photos', 9, 7], ['Claims fraud detection', 'Leakage', 'Claims history', 9, 7], ['Underwriting assist', 'Speed, accuracy', 'Proposal data', 8, 6], ['Policy servicing GenAI', 'Service cost', 'Policy docs, tickets', 7, 8], ['Lapse prediction', 'Retention', 'Payment behaviour', 6, 8]] },
  { id: 'healthcare', label: 'Healthcare', kpis: ['Patient wait time', 'Bed occupancy %', 'Readmission %', 'Claim denial %', 'Clinician admin hours'], risks: ['Patient safety', 'Clinical validation', 'Highly sensitive personal data'],
    useCases: [['Clinical documentation assist', 'Clinician time', 'Notes, transcripts', 8, 7], ['Bed and staff forecasting', 'Capacity', 'Admissions history', 8, 7], ['Claims denial prediction', 'Revenue cycle', 'Claims data', 7, 8], ['Imaging triage (assistive)', 'Turnaround', 'Images, reports', 9, 5], ['Readmission risk', 'Outcomes', 'EHR data', 7, 6]] },
  { id: 'telecom', label: 'Telecom', kpis: ['Churn %', 'Network incidents', 'ARPU', 'First-contact resolution %', 'Energy per GB'], risks: ['Network change risk', 'Customer data use', 'Scale of automation'],
    useCases: [['Churn prediction and offers', 'Retention', 'Usage, billing', 9, 8], ['Network anomaly detection', 'Outage minutes', 'Network telemetry', 8, 7], ['Care GenAI agent', 'Contact cost', 'Tickets, transcripts', 7, 8], ['Network energy optimisation', 'Energy cost', 'Site telemetry', 7, 7], ['Field-force scheduling', 'Truck rolls', 'Work orders', 6, 8]] },
]
