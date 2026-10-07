// Regulatory & AI governance (M7.3, Vaibhav). Banking-first.
// Circulars are SIMULATED and illustrative (fictional reference numbers) — not real regulator documents.
// Obligations map to real simulated controls; the model register is built from Suman's AI portfolio.
import type { DomainId } from '../domains'
import { SIM_NOW } from './model'
import { sim } from './index'
import { USE_CASES } from './aiPortfolio'
import type { UseCase } from './aiPortfolio'
import { psi, psiBand } from './analytics'
import { rng } from './rng'

const T0 = Date.parse(SIM_NOW)
const DAY = 86_400_000
const date = (d: number) => new Date(T0 + d * DAY).toISOString().slice(0, 10)
const ctl = (i: number) => sim.banking.controls[i]

// ── Regulatory change (Banking) ──
export type RegStage = 'Received' | 'AI-drafted' | 'Under review' | 'Mapped' | 'Evidence' | 'Closed'
export const REG_STAGES: RegStage[] = ['Received', 'AI-drafted', 'Under review', 'Mapped', 'Evidence', 'Closed']
export interface Obligation { id: string; text: string; controlId: string | null; confidence: number; status: 'Mapped' | 'Gap' | 'Pending review' }
export interface Circular { id: string; ref: string; regulator: string; title: string; received: string; due: string; stage: RegStage; daysTaken: number | null; obligations: Obligation[] }

type C = [string, string, string, number, number, RegStage, number | null, [string, number | null, number, Obligation['status']][]]
const CIRCULARS: C[] = [
  ['RBI (simulated)', 'IT governance, risk and controls for regulated entities', 'SIM/RBI/IT/2025-26/014', -300, -120, 'Closed', 19,
    [['Board-approved IT strategy and risk appetite reviewed annually', 23, 0.91, 'Mapped'], ['Privileged access reviewed at least quarterly', 0, 0.95, 'Mapped'], ['Change management with segregation of duties', 12, 0.93, 'Mapped'], ['Business continuity plan reviewed annually', 23, 0.9, 'Mapped']]],
  ['CERT-In (simulated)', 'Cyber incident reporting timelines and log retention', 'SIM/CERTIN/2025/007', -260, -200, 'Closed', 16,
    [['Report notifiable cyber incidents within the prescribed window', 8, 0.88, 'Mapped'], ['Retain security logs for the prescribed period', 7, 0.96, 'Mapped'], ['Synchronise system clocks to a trusted source', 7, 0.71, 'Mapped']]],
  ['RBI (simulated)', 'Outsourcing of IT services — vendor risk', 'SIM/RBI/OUT/2025-26/022', -210, -90, 'Closed', 14,
    [['Assess vendor risk before onboarding', 13, 0.94, 'Mapped'], ['Exit strategy for material outsourcing', null, 0.62, 'Gap'], ['Right to audit in contracts', 13, 0.78, 'Mapped']]],
  ['RBI (simulated)', 'Digital lending — data handling and consent', 'SIM/RBI/DL/2026-27/003', -150, -30, 'Evidence', 11,
    [['Collect only need-based data with explicit consent', 21, 0.9, 'Mapped'], ['Store borrower data only in India', 5, 0.84, 'Mapped'], ['Disclose AI-based credit decisions to borrowers', 20, 0.67, 'Mapped']]],
  ['RBI (simulated)', 'Payment system cyber resilience', 'SIM/RBI/PSS/2026-27/009', -95, 30, 'Mapped', 9,
    [['TLS 1.2+ on all external payment interfaces', 6, 0.97, 'Mapped'], ['Mask card data in logs and non-production', 18, 0.95, 'Mapped'], ['Patch critical vulnerabilities within 15 days', 3, 0.93, 'Mapped'], ['Real-time fraud monitoring on payment channels', null, 0.58, 'Gap']]],
  ['DPDP (simulated)', 'Consent notices and data principal rights', 'SIM/DPDP/2026/002', -70, 60, 'Under review', null,
    [['Itemised consent notice in plain language', 21, 0.86, 'Mapped'], ['Process erasure requests within the prescribed time', null, 0.64, 'Pending review'], ['Notify personal-data breaches to the Board and principals', 8, 0.81, 'Mapped']]],
  ['RBI (simulated)', 'Responsible use of AI in financial services', 'SIM/RBI/AI/2026-27/011', -40, 120, 'AI-drafted', null,
    [['Maintain an inventory of AI models with risk tiers', null, 0.82, 'Pending review'], ['Independent validation before production for high-risk models', 20, 0.77, 'Pending review'], ['Monitor models for drift and bias', 20, 0.74, 'Pending review'], ['Human oversight for adverse customer decisions', null, 0.69, 'Pending review']]],
  ['CERT-In (simulated)', 'Cloud security posture for critical workloads', 'SIM/CERTIN/2026/004', -12, 75, 'Received', null, []],
]
export const circulars: Circular[] = CIRCULARS.map(([regulator, title, ref, rec, due, stage, daysTaken, obs], i) => ({
  id: `CIRC-${String(i + 1).padStart(2, '0')}`, ref, regulator, title, received: date(rec), due: date(due), stage, daysTaken,
  obligations: obs.map(([text, c, confidence, status], k) => ({ id: `OBL-${String(i + 1).padStart(2, '0')}-${k + 1}`, text, controlId: c === null ? null : ctl(c).id, confidence, status })),
}))

/** The circular that arrives LIVE during the demo (simulation clock +50 s). AI drafts obligations; Vaibhav approves. */
export const LIVE_CIRCULAR_AT = T0 + 50_000
export const liveCircular: Circular = {
  id: 'CIRC-LIVE', ref: 'SIM/RBI/CYB/2026-27/018', regulator: 'RBI (simulated)', title: 'Cyber resilience for peak transaction windows', received: date(0), due: date(45), stage: 'AI-drafted', daysTaken: null,
  obligations: [
    { id: 'OBL-L-1', text: 'Capacity and DR tested before declared peak windows (salary day, festive)', controlId: ctl(10).id, confidence: 0.88, status: 'Pending review' },
    { id: 'OBL-L-2', text: 'Unsupported software removed or risk-accepted on payment paths', controlId: ctl(16).id, confidence: 0.92, status: 'Pending review' },
    { id: 'OBL-L-3', text: 'Cloud workloads for payments monitored for misconfiguration continuously', controlId: ctl(22).id, confidence: 0.84, status: 'Pending review' },
    { id: 'OBL-L-4', text: 'Peak-window incident drills with the board-level crisis team', controlId: null, confidence: 0.61, status: 'Pending review' },
  ],
}
export const LIVE_CIRCULAR_DECISION = 'REG-CIRC-LIVE'

// ── AI model register (all domains, from Suman's portfolio: pilot and above are models) ──
export type Tier = 'High' | 'Medium' | 'Low'
export interface Model {
  id: string; domain: DomainId; useCase: UseCase; name: string; stage: UseCase['stage']; tier: Tier
  impact: number; autonomy: number; sensitivity: number
  bias: 'Passed' | 'Failed' | 'Not run'; explainability: 'Documented' | 'Partial' | 'Missing'
  approval: 'Approved' | 'Conditional' | 'Pending' | 'Restricted'; psi: number; drift: string; lastValidated: string; owner: string
  expected: number[]; actual: number[]
}
const HIGH_IMPACT = /fraud|credit|underwriting|aml|pricing|markdown|returns/i
export const models: Model[] = USE_CASES.filter((u) => u.stage !== 'Idea' && u.stage !== 'PoC').map((u, _i, all) => {
  const i = all.filter((x) => x.domain === u.domain).indexOf(u)
  const r = rng(`model-${u.id}`)
  const impact = HIGH_IMPACT.test(u.name) ? 3 : u.risk === 'Medium' ? 2 : 1
  const autonomy = /real-time|scoring|pricing|agent|assistant/i.test(u.name) ? 3 : u.stage === 'Pilot' ? 1 : 2
  const sensitivity = /customer|credit|kyc|aml|loyalty|personal|collections|fraud/i.test(u.name) ? 3 : 1
  const score = impact * autonomy * sensitivity
  const tier: Tier = score >= 12 ? 'High' : score >= 4 ? 'Medium' : 'Low'
  const expected = [0.1, 0.2, 0.3, 0.25, 0.15]
  const shift = u.id === 'AIUC-BNK-01' ? 0.11 : u.id === 'AIUC-RTL-03' ? 0.06 : r.between(0, 0.035) // fraud scoring drifting at festive peak
  const actual = expected.map((e, k) => Math.max(0.01, e + (k < 2 ? -shift : k > 2 ? shift * 0.9 : shift * 0.2)))
  const tot = actual.reduce((a, b) => a + b, 0)
  const act = actual.map((x) => Math.round((x / tot) * 1000) / 1000)
  const p = psi(expected, act)
  const bias: Model['bias'] = tier === 'Low' ? (r.next() < 0.5 ? 'Not run' : 'Passed') : r.next() < 0.85 ? 'Passed' : 'Not run'
  const explain: Model['explainability'] = tier === 'High' ? (r.next() < 0.7 ? 'Documented' : 'Partial') : r.next() < 0.5 ? 'Documented' : 'Partial'
  let approval: Model['approval'] = u.stage === 'Pilot' ? 'Pending' : bias === 'Passed' && explain === 'Documented' ? 'Approved' : 'Conditional'
  if (p > 0.25) approval = 'Restricted'
  return { id: `MDL-${sim[u.domain].code}-${String(i + 1).padStart(2, '0')}`, domain: u.domain, useCase: u, name: /model$/i.test(u.name) ? u.name : `${u.name} model`, stage: u.stage, tier, impact, autonomy, sensitivity,
    bias, explainability: explain, approval, psi: p, drift: psiBand(p), lastValidated: date(-r.int(10, 160)), owner: u.owner, expected, actual: act }
})
export const modelsApprovedPct = () => { const live = models.filter((m) => m.stage !== 'Pilot'); return Math.round((live.filter((m) => m.approval === 'Approved').length / live.length) * 100) }

// ── Data governance (Banking critical data elements, lineage) ──
export interface DataElement { id: string; name: string; owner: string; quality: number; personal: boolean; consentRequired: boolean; lineage: string[] /* app ids, source → consumer */ ; report: string }
const A = (i: number) => sim.banking.applications[i].id
export const dataElements: DataElement[] = [
  ['Customer identity (KYC)', 'Head of Retail Ops', 93, true, true, [14, 0, 19], 'KYC refresh and AML reports'],
  ['Account balance', 'Head of Core Banking Tech', 99, true, false, [0, 21, 20], 'Regulatory returns'],
  ['Card PAN', 'Head of Payments Security', 98, true, false, [5, 2, 4], 'PCI scope report'],
  ['UPI transaction', 'Head of Payments', 96, true, false, [3, 12, 19], 'Fraud MIS'],
  ['Loan application', 'Head of Retail Lending', 88, true, true, [8, 9, 20], 'Lending returns'],
  ['Credit bureau score', 'Head of Credit Risk', 91, true, true, [8, 19], 'Credit risk MIS'],
  ['Marketing consent', 'DPO', 84, true, true, [16, 19, 18], 'DPDP consent register'],
  ['Device fingerprint', 'Head of Data & AI', 81, true, true, [16, 12], 'Fraud model features'],
  ['Collections contact log', 'Head of Collections', 86, true, true, [22, 18], 'Conduct MIS'],
  ['Treasury position', 'Treasurer', 97, false, false, [11, 21], 'ALM report'],
].map(([name, owner, quality, personal, consentRequired, lin, report], i) => ({ id: `CDE-BNK-${String(i + 1).padStart(2, '0')}`, name: name as string, owner: owner as string, quality: quality as number, personal: personal as boolean, consentRequired: consentRequired as boolean, lineage: (lin as number[]).map(A), report: report as string }))

/** A simulated personal-data incident that starts the reporting clocks during the demo (+80 s). Windows are illustrative. */
export const BREACH_AT = T0 + 80_000
export const BREACH = { title: 'Unauthorised access to a customer-data export (simulated)', system: A(19), records: 4_200, clocks: [{ name: 'Cyber incident report (CERT-In style)', hours: 6 }, { name: 'Personal-data breach notice (DPDP style)', hours: 72 }] }
