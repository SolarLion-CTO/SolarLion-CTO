// Operational resilience per domain: applications & incidents, cyber security, business impact (P&L).
// ── Where to update ──────────────────────────────────────────────────────
//   • Application figures (availability, incidents, MTTR …)  → `apps` below
//   • Cyber figures (threats, controls, vulnerabilities …)    → `cyber` below
//   • Incident cost records (₹ lakh)                           → `losses` below
// Status and priority are CALCULATED by the rules in this file — never typed in —
// so an application with many incidents can never show as healthy.
// All values are illustrative demo data.
import type { DomainId } from './domains'

export type Stage = 'Current' | 'Proposed' | 'Feasibility' | 'PoC' | 'Pilot' | 'Scale'
export const stages: Stage[] = ['Current', 'Proposed', 'Feasibility', 'PoC', 'Pilot', 'Scale']
export interface Improvement { current: string; proposed: string; feasibility: number; stage: Stage; owner: string }

// ── Applications & incidents ─────────────────────────────────────────────
export interface App {
  id: string
  name: string
  service: string // business service it supports
  critical: boolean // supports a critical business service
  tier: 0 | 1 | 2 | 3
  slo: number // availability target %
  avail: number // actual availability %, last 30 days
  plannedMin: number
  unplannedMin: number
  p1: number; p2: number; p3: number; p4: number
  repeat: number // repeat incidents (same root cause)
  mttrH: number; mttrTargetH: number
  changeFail: number // % of changes causing incidents
  slaBreaches: number
  owner: string
  improvement: Improvement
}

const imp = (current: string, proposed: string, feasibility: number, stage: Stage, owner: string): Improvement => ({ current, proposed, feasibility, stage, owner })

export const apps: Record<DomainId, App[]> = {
  banking: [
    { id: 'BNK-APP-01', name: 'Core banking (CBS)', service: 'Accounts & payments', critical: true, tier: 0, slo: 99.95, avail: 99.81, plannedMin: 240, unplannedMin: 82, p1: 1, p2: 3, p3: 11, p4: 19, repeat: 2, mttrH: 3.1, mttrTargetH: 2, changeFail: 14, slaBreaches: 2, owner: 'Head of IT Ops',
      improvement: imp('Month-end batch contention causes P1s', 'Re-sequence batch + capacity forecast (BNK-D-003)', 8, 'Pilot', 'Pankaj') },
    { id: 'BNK-APP-02', name: 'UPI switch', service: 'Digital payments', critical: true, tier: 0, slo: 99.95, avail: 99.96, plannedMin: 60, unplannedMin: 17, p1: 0, p2: 4, p3: 9, p4: 14, repeat: 3, mttrH: 1.4, mttrTargetH: 1, changeFail: 9, slaBreaches: 1, owner: 'Digital payments lead',
      improvement: imp('Timeouts at peak from bank-side queue', 'Auto-scaling + queue monitoring', 7, 'PoC', 'Pankaj') },
    { id: 'BNK-APP-03', name: 'Internet banking', service: 'Customer self-service', critical: true, tier: 1, slo: 99.9, avail: 99.94, plannedMin: 120, unplannedMin: 26, p1: 0, p2: 1, p3: 7, p4: 12, repeat: 0, mttrH: 1.2, mttrTargetH: 2, changeFail: 5, slaBreaches: 0, owner: 'Digital channels head',
      improvement: imp('Manual release checks', 'Automated release gates', 8, 'Scale', 'Ram') },
    { id: 'BNK-APP-04', name: 'ATM switch', service: 'Cash access', critical: true, tier: 1, slo: 99.9, avail: 99.91, plannedMin: 90, unplannedMin: 39, p1: 0, p2: 2, p3: 16, p4: 21, repeat: 1, mttrH: 2.6, mttrTargetH: 2, changeFail: 7, slaBreaches: 1, owner: 'Channels ops lead',
      improvement: imp('Reactive hardware replacement', 'Predictive failure alerts on terminals', 6, 'Feasibility', 'Ram') },
    { id: 'BNK-APP-05', name: 'Loan origination', service: 'Lending', critical: false, tier: 2, slo: 99.5, avail: 99.71, plannedMin: 180, unplannedMin: 74, p1: 0, p2: 0, p3: 5, p4: 9, repeat: 0, mttrH: 3.0, mttrTargetH: 4, changeFail: 4, slaBreaches: 0, owner: 'Lending IT lead',
      improvement: imp('Nightly batch only', 'Event-based data feed', 7, 'Proposed', 'Suman') },
  ],
  manufacturing: [
    { id: 'MFG-APP-01', name: 'SAP ERP', service: 'Order to cash, month-end close', critical: true, tier: 0, slo: 99.9, avail: 99.62, plannedMin: 300, unplannedMin: 164, p1: 2, p2: 4, p3: 14, p4: 22, repeat: 3, mttrH: 4.2, mttrTargetH: 2, changeFail: 16, slaBreaches: 3, owner: 'SAP basis lead',
      improvement: imp('Month-end CPU 96%, lock contention', 'Hybrid capacity (DEC-OPS-001) + RCA agent', 8, 'Pilot', 'Pankaj') },
    { id: 'MFG-APP-02', name: 'MES', service: 'Production execution', critical: true, tier: 0, slo: 99.9, avail: 99.91, plannedMin: 120, unplannedMin: 39, p1: 0, p2: 3, p3: 12, p4: 15, repeat: 2, mttrH: 2.4, mttrTargetH: 2, changeFail: 8, slaBreaches: 1, owner: 'MES lead',
      improvement: imp('Line stops logged manually', 'MES → RCA agent via MCP', 7, 'PoC', 'Pankaj') },
    { id: 'MFG-APP-03', name: 'Warehouse management (WMS)', service: 'Dispatch', critical: true, tier: 1, slo: 99.8, avail: 99.86, plannedMin: 90, unplannedMin: 40, p1: 0, p2: 1, p3: 6, p4: 10, repeat: 0, mttrH: 1.8, mttrTargetH: 3, changeFail: 5, slaBreaches: 0, owner: 'Logistics IT lead',
      improvement: imp('Single data centre', 'Warm standby for dispatch', 6, 'Feasibility', 'Pankaj') },
    { id: 'MFG-APP-04', name: 'Supplier portal (SCM)', service: 'Procurement & inbound', critical: false, tier: 2, slo: 99.5, avail: 99.28, plannedMin: 120, unplannedMin: 190, p1: 0, p2: 2, p3: 18, p4: 26, repeat: 4, mttrH: 5.5, mttrTargetH: 4, changeFail: 12, slaBreaches: 2, owner: 'Procurement IT lead',
      improvement: imp('Vendor-hosted, weak SLA', 'Renegotiate SLA or replace', 5, 'Proposed', 'Santhosh') },
    { id: 'MFG-APP-05', name: 'Quality system', service: 'Quality release', critical: false, tier: 2, slo: 99.5, avail: 99.84, plannedMin: 60, unplannedMin: 22, p1: 0, p2: 0, p3: 4, p4: 7, repeat: 0, mttrH: 2.0, mttrTargetH: 4, changeFail: 3, slaBreaches: 0, owner: 'Quality IT lead',
      improvement: imp('Batch export only', 'Live feed to RCA', 7, 'Proposed', 'Pankaj') },
  ],
  retail: [
    { id: 'RTL-APP-01', name: 'E-commerce platform', service: 'Online sales', critical: true, tier: 0, slo: 99.95, avail: 99.90, plannedMin: 60, unplannedMin: 43, p1: 1, p2: 2, p3: 10, p4: 18, repeat: 1, mttrH: 1.9, mttrTargetH: 1, changeFail: 11, slaBreaches: 1, owner: 'Head of e-commerce tech',
      improvement: imp('Owned servers sized for peak', 'Cloud burst for festive peak (RTL-D-001)', 8, 'Pilot', 'Pankaj') },
    { id: 'RTL-APP-02', name: 'Point of sale (POS)', service: 'Store sales', critical: true, tier: 0, slo: 99.9, avail: 99.93, plannedMin: 120, unplannedMin: 30, p1: 0, p2: 1, p3: 21, p4: 34, repeat: 1, mttrH: 1.1, mttrTargetH: 2, changeFail: 6, slaBreaches: 0, owner: 'Store systems lead',
      improvement: imp('Offline mode untested', 'Quarterly offline-mode drill', 9, 'Scale', 'Pankaj') },
    { id: 'RTL-APP-03', name: 'Payment gateway', service: 'Checkout', critical: true, tier: 0, slo: 99.95, avail: 99.96, plannedMin: 30, unplannedMin: 17, p1: 0, p2: 0, p3: 4, p4: 6, repeat: 0, mttrH: 0.6, mttrTargetH: 1, changeFail: 2, slaBreaches: 0, owner: 'Payments lead',
      improvement: imp('Single acquirer', 'Second acquirer for failover', 6, 'Feasibility', 'Santhosh') },
    { id: 'RTL-APP-04', name: 'Order management (OMS)', service: 'Fulfilment', critical: true, tier: 1, slo: 99.9, avail: 99.91, plannedMin: 90, unplannedMin: 39, p1: 0, p2: 3, p3: 15, p4: 19, repeat: 2, mttrH: 2.8, mttrTargetH: 2, changeFail: 10, slaBreaches: 1, owner: 'Retail systems lead',
      improvement: imp('ERP sync fails at peak', 'Idempotent retry queue', 8, 'PoC', 'Pankaj') },
    { id: 'RTL-APP-05', name: 'Loyalty', service: 'Customer engagement', critical: false, tier: 2, slo: 99.5, avail: 99.66, plannedMin: 60, unplannedMin: 87, p1: 0, p2: 1, p3: 6, p4: 8, repeat: 0, mttrH: 3.2, mttrTargetH: 4, changeFail: 4, slaBreaches: 0, owner: 'Loyalty manager',
      improvement: imp('No consent flag', 'Consent gate + schema change', 7, 'Pilot', 'Vaibhav') },
  ],
}

export type AppHealth = 'Healthy' | 'Degraded' | 'Critical'
export type Priority = 'High' | 'Medium' | 'Low'
export const MONTH_MIN = 30 * 24 * 60
export const totalIncidents = (a: App) => a.p1 + a.p2 + a.p3 + a.p4

// THE RULES — health is calculated from evidence, then priority = impact × urgency.
export function assess(a: App): { health: AppHealth; priority: Priority; reasons: string[]; budgetUsed: number } {
  const reasons: string[] = []
  const budget = ((100 - a.slo) / 100) * MONTH_MIN // allowed unplanned downtime (min) this month
  const budgetUsed = Math.round((a.unplannedMin / budget) * 100)
  let health = 'Healthy' as AppHealth
  const red = (r: string) => { reasons.push(r); health = 'Critical' }
  const amber = (r: string) => { reasons.push(r); if (health === 'Healthy') health = 'Degraded' }

  if (a.p1 > 0) red(`${a.p1} P1 incident${a.p1 > 1 ? 's' : ''}`)
  if (a.avail < a.slo) red(`availability ${a.avail}% below ${a.slo}% target`)
  if (totalIncidents(a) >= 50) red(`${totalIncidents(a)} incidents in 30 days`)
  else if (totalIncidents(a) >= 30) amber(`${totalIncidents(a)} incidents in 30 days`)
  if (a.p2 >= 3) amber(`${a.p2} P2 incidents`)
  if (a.repeat >= 2) amber(`${a.repeat} repeat incidents`)
  if (a.mttrH > a.mttrTargetH) amber(`MTTR ${a.mttrH} h vs ${a.mttrTargetH} h target`)
  if (a.slaBreaches > 0) amber(`${a.slaBreaches} SLA breach${a.slaBreaches > 1 ? 'es' : ''}`)

  // Impact: critical business service or tier 0 = high
  const impact: Priority = a.critical || a.tier === 0 ? 'High' : a.tier === 1 ? 'Medium' : 'Low'
  const urgency: Priority = health === 'Critical' ? 'High' : health === 'Degraded' ? 'Medium' : 'Low'
  const matrix: Record<Priority, Record<Priority, Priority>> = {
    High: { High: 'High', Medium: 'High', Low: 'Low' }, // incident-heavy app on a critical service → High; healthy → Low
    Medium: { High: 'High', Medium: 'Medium', Low: 'Low' },
    Low: { High: 'Medium', Medium: 'Low', Low: 'Low' },
  }
  return { health, priority: matrix[impact][urgency], reasons, budgetUsed }
}

// ── Cyber security (organisation level, per domain) ──────────────────────
export type Outcome = 'Blocked' | 'Contained' | 'Breach'
export interface Cyber {
  monthly: { month: string; attempts: number; blocked: number; contained: number; breach: number }[]
  controls: { layer: string; control: string; coverage: number; target: number }[]
  vulns: { critical: number; high: number; criticalOverdue: number; patchSla: number }
  detect: { mttdH: number; mttrH: number; phishClick: number; socAlerts: number }
  nist: { fn: 'Govern' | 'Identify' | 'Protect' | 'Detect' | 'Respond' | 'Recover'; now: number; target: number }[]
  events: { date: string; what: string; outcome: Outcome; app: string; impact: string; dpdpReportable: boolean; reportedIn72h?: boolean }[]
  improvements: (Improvement & { name: string })[]
}

const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct']
const mk = (rows: [number, number, number, number][]) => rows.map(([attempts, blocked, contained, breach], i) => ({ month: months[i], attempts, blocked, contained, breach }))

export const cyber: Record<DomainId, Cyber> = {
  banking: {
    monthly: mk([[41200, 41120, 79, 1], [38900, 38840, 60, 0], [44100, 44020, 80, 0], [47600, 47510, 89, 1], [45300, 45230, 70, 0], [12800, 12780, 20, 0]]),
    controls: [
      { layer: 'Network', control: 'Firewall / WAF on internet-facing apps', coverage: 100, target: 100 },
      { layer: 'Email', control: 'Email security gateway', coverage: 100, target: 100 },
      { layer: 'Endpoint', control: 'Antivirus / EDR coverage', coverage: 97, target: 98 },
      { layer: 'Identity', control: 'MFA for all users', coverage: 99, target: 100 },
      { layer: 'Identity', control: 'Privileged access management', coverage: 92, target: 100 },
      { layer: 'Data', control: 'Data loss prevention', coverage: 81, target: 95 },
      { layer: 'Recovery', control: 'Immutable backups for Tier 0', coverage: 100, target: 100 },
    ],
    vulns: { critical: 6, high: 41, criticalOverdue: 1, patchSla: 91 },
    detect: { mttdH: 3.5, mttrH: 9, phishClick: 4.2, socAlerts: 18400 },
    nist: [{ fn: 'Govern', now: 3.8, target: 4.5 }, { fn: 'Identify', now: 3.5, target: 4.2 }, { fn: 'Protect', now: 3.9, target: 4.5 }, { fn: 'Detect', now: 3.4, target: 4.3 }, { fn: 'Respond', now: 3.2, target: 4.2 }, { fn: 'Recover', now: 3.6, target: 4.3 }],
    events: [
      { date: '02 Oct', what: 'Credential-stuffing on internet banking', outcome: 'Blocked', app: 'Internet banking', impact: 'None — rate limiting + MFA', dpdpReportable: false },
      { date: '21 Aug', what: 'Phishing led to one compromised staff mailbox', outcome: 'Breach', app: 'Email', impact: '312 customer records exposed; customers notified', dpdpReportable: true, reportedIn72h: true },
      { date: '09 Aug', what: 'Ransomware dropper on branch PC', outcome: 'Contained', app: 'Branch endpoint', impact: 'Isolated by EDR in 14 min', dpdpReportable: false },
      { date: '14 May', what: 'Vendor VPN account misuse attempt', outcome: 'Breach', app: 'Vendor access', impact: 'Read access to test environment; no customer data', dpdpReportable: false },
    ],
    improvements: [
      { name: '24×7 SOC with automated response (SOAR)', current: 'SOC business hours; manual triage', proposed: '24×7 SOC, automated containment playbooks', feasibility: 7, stage: 'PoC', owner: 'Vaibhav' },
      { name: 'Zero-trust privileged access', current: 'Shared admin accounts on legacy core', proposed: 'Just-in-time privileged access, session recording', feasibility: 8, stage: 'Pilot', owner: 'Vaibhav' },
      { name: 'Data loss prevention to 95 %', current: 'DLP on email only', proposed: 'Endpoint + cloud DLP', feasibility: 6, stage: 'Feasibility', owner: 'Vaibhav' },
    ],
  },
  manufacturing: {
    monthly: mk([[18400, 18350, 48, 2], [17100, 17070, 30, 0], [19800, 19740, 60, 0], [21300, 21240, 59, 1], [20600, 20560, 40, 0], [6200, 6190, 10, 0]]),
    controls: [
      { layer: 'Network', control: 'Firewall between IT and OT networks', coverage: 88, target: 100 },
      { layer: 'Email', control: 'Email security gateway', coverage: 100, target: 100 },
      { layer: 'Endpoint', control: 'Antivirus / EDR coverage (IT)', coverage: 95, target: 98 },
      { layer: 'Endpoint', control: 'OT asset protection (plant PCs, HMIs)', coverage: 64, target: 90 },
      { layer: 'Identity', control: 'MFA for all users', coverage: 93, target: 100 },
      { layer: 'Recovery', control: 'Immutable backups for SAP + MES', coverage: 100, target: 100 },
    ],
    vulns: { critical: 14, high: 88, criticalOverdue: 5, patchSla: 74 },
    detect: { mttdH: 11, mttrH: 22, phishClick: 7.9, socAlerts: 9100 },
    nist: [{ fn: 'Govern', now: 2.9, target: 4.0 }, { fn: 'Identify', now: 2.6, target: 4.0 }, { fn: 'Protect', now: 3.0, target: 4.2 }, { fn: 'Detect', now: 2.7, target: 4.0 }, { fn: 'Respond', now: 2.8, target: 4.0 }, { fn: 'Recover', now: 3.4, target: 4.2 }],
    events: [
      { date: '19 Aug', what: 'Malware on plant HMI via USB', outcome: 'Breach', app: 'MES (Line 2)', impact: 'Line 2 stopped 6 h', dpdpReportable: false },
      { date: '28 Sep', what: 'Phishing campaign targeting procurement', outcome: 'Blocked', app: 'Email', impact: 'None', dpdpReportable: false },
      { date: '11 May', what: 'Supplier portal account takeover', outcome: 'Breach', app: 'Supplier portal', impact: 'Fake bank-detail change caught before payment', dpdpReportable: false },
      { date: '03 May', what: 'Unpatched VPN exploit attempt', outcome: 'Breach', app: 'Remote access', impact: 'Foothold removed in 2 days; no data loss', dpdpReportable: false },
    ],
    improvements: [
      { name: 'OT network segmentation', current: 'Flat network between IT and plants', proposed: 'Segmented OT zones with monitored gateways (IEC 62443)', feasibility: 6, stage: 'Feasibility', owner: 'Vaibhav' },
      { name: 'USB control on plant PCs', current: 'USB ports open', proposed: 'Device control + kiosk scanning', feasibility: 9, stage: 'Pilot', owner: 'Vaibhav' },
      { name: 'Patch SLA to 95 %', current: '74 % on time; 5 critical overdue', proposed: 'Monthly patch window + automated reporting', feasibility: 7, stage: 'Proposed', owner: 'Pankaj' },
    ],
  },
  retail: {
    monthly: mk([[26100, 26050, 49, 1], [24800, 24770, 30, 0], [25900, 25860, 40, 0], [29400, 29350, 50, 0], [31700, 31650, 49, 1], [9800, 9790, 10, 0]]),
    controls: [
      { layer: 'Network', control: 'WAF + bot protection on e-commerce', coverage: 100, target: 100 },
      { layer: 'Payments', control: 'Payment data isolation (PCI DSS scope)', coverage: 100, target: 100 },
      { layer: 'Endpoint', control: 'Antivirus / EDR coverage (stores + HQ)', coverage: 91, target: 98 },
      { layer: 'Identity', control: 'MFA for all users', coverage: 96, target: 100 },
      { layer: 'Data', control: 'Customer data encryption at rest', coverage: 100, target: 100 },
    ],
    vulns: { critical: 3, high: 29, criticalOverdue: 0, patchSla: 94 },
    detect: { mttdH: 5, mttrH: 12, phishClick: 5.6, socAlerts: 12200 },
    nist: [{ fn: 'Govern', now: 2.8, target: 4.0 }, { fn: 'Identify', now: 3.0, target: 4.0 }, { fn: 'Protect', now: 3.4, target: 4.2 }, { fn: 'Detect', now: 3.1, target: 4.0 }, { fn: 'Respond', now: 2.9, target: 4.0 }, { fn: 'Recover', now: 3.2, target: 4.0 }],
    events: [
      { date: '24 Sep', what: 'Card-testing bots on checkout', outcome: 'Breach', app: 'E-commerce platform', impact: '1,140 fraudulent low-value attempts; ₹3.2 L chargebacks', dpdpReportable: false },
      { date: '30 Sep', what: 'DDoS during festive sale preview', outcome: 'Blocked', app: 'E-commerce platform', impact: 'None — absorbed by WAF / CDN', dpdpReportable: false },
      { date: '07 May', what: 'Loyalty data export by former contractor', outcome: 'Breach', app: 'Loyalty', impact: '8,900 customer profiles; reported to DPB', dpdpReportable: true, reportedIn72h: false },
    ],
    improvements: [
      { name: 'Bot management on checkout', current: 'Basic rate limits', proposed: 'Behavioural bot detection + 3-DS step-up', feasibility: 8, stage: 'Pilot', owner: 'Vaibhav' },
      { name: 'Joiner-mover-leaver automation', current: 'Manual access removal', proposed: 'HR-driven access revocation within 1 hour', feasibility: 8, stage: 'PoC', owner: 'Vaibhav' },
    ],
  },
}

export function cyberStatus(c: Cyber): { health: AppHealth; reasons: string[] } {
  const reasons: string[] = []
  let health = 'Healthy' as AppHealth
  const breaches = c.monthly.reduce((s, m) => s + m.breach, 0)
  if (breaches > 0) { health = 'Critical'; reasons.push(`${breaches} breach${breaches > 1 ? 'es' : ''} in 6 months`) }
  const edr = c.controls.find((x) => /EDR/.test(x.control))
  if (edr && edr.coverage < 95) { reasons.push(`EDR coverage ${edr.coverage}% (< 95%)`); if (health === 'Healthy') health = 'Degraded' }
  if (c.vulns.criticalOverdue > 0) { reasons.push(`${c.vulns.criticalOverdue} critical vulnerabilit${c.vulns.criticalOverdue > 1 ? 'ies' : 'y'} past patch SLA`); if (health === 'Healthy') health = 'Degraded' }
  if (c.events.some((e) => e.dpdpReportable && e.reportedIn72h === false)) { reasons.push('DPDP breach not reported within 72 h'); health = 'Critical' }
  return { health, reasons }
}

// ── Business impact (P&L) — incident cost records, ₹ lakh ────────────────
export interface Loss {
  date: string; incident: string; app: string; source: 'Outage' | 'Cyber'
  revenue: number; productivity: number; penalties: number; fines: number; recovery: number; churn: number
  validated: boolean // validated by Finance
}
export const lossTotal = (l: Loss) => l.revenue + l.productivity + l.penalties + l.fines + l.recovery + l.churn

export const losses: Record<DomainId, Loss[]> = {
  banking: [
    { date: '29 Sep', incident: 'Core banking month-end P1 (3.4 h)', app: 'Core banking (CBS)', source: 'Outage', revenue: 18, productivity: 6, penalties: 4, fines: 0, recovery: 3, churn: 5, validated: true },
    { date: '21 Aug', incident: 'Mailbox compromise — 312 records', app: 'Email', source: 'Cyber', revenue: 0, productivity: 2, penalties: 0, fines: 0, recovery: 9, churn: 4, validated: true },
    { date: '12 Aug', incident: 'UPI timeouts at salary-day peak', app: 'UPI switch', source: 'Outage', revenue: 11, productivity: 1, penalties: 2, fines: 0, recovery: 1, churn: 3, validated: false },
    { date: '18 Jul', incident: 'ATM switch outage (2 regions)', app: 'ATM switch', source: 'Outage', revenue: 6, productivity: 1, penalties: 1, fines: 0, recovery: 2, churn: 2, validated: true },
  ],
  manufacturing: [
    { date: '30 Sep', incident: 'SAP month-end slowdown — close delayed 2 days', app: 'SAP ERP', source: 'Outage', revenue: 0, productivity: 14, penalties: 0, fines: 0, recovery: 4, churn: 0, validated: true },
    { date: '19 Aug', incident: 'HMI malware — Line 2 stopped 6 h', app: 'MES', source: 'Cyber', revenue: 42, productivity: 9, penalties: 6, fines: 0, recovery: 7, churn: 0, validated: true },
    { date: '02 Aug', incident: 'SAP P1 — dispatch blocked 5 h', app: 'SAP ERP', source: 'Outage', revenue: 26, productivity: 5, penalties: 8, fines: 0, recovery: 3, churn: 0, validated: true },
    { date: '11 May', incident: 'Supplier portal takeover attempt', app: 'Supplier portal (SCM)', source: 'Cyber', revenue: 0, productivity: 3, penalties: 0, fines: 0, recovery: 4, churn: 0, validated: false },
  ],
  retail: [
    { date: '24 Sep', incident: 'Card-testing bots — chargebacks', app: 'E-commerce platform', source: 'Cyber', revenue: 3, productivity: 1, penalties: 0, fines: 0, recovery: 2, churn: 1, validated: true },
    { date: '14 Sep', incident: 'E-commerce P1 during sale preview (48 min)', app: 'E-commerce platform', source: 'Outage', revenue: 34, productivity: 2, penalties: 0, fines: 0, recovery: 2, churn: 6, validated: true },
    { date: '22 Aug', incident: 'OMS–ERP sync failure (orders stuck 9 h)', app: 'Order management (OMS)', source: 'Outage', revenue: 9, productivity: 4, penalties: 1, fines: 0, recovery: 2, churn: 3, validated: false },
    { date: '07 May', incident: 'Loyalty data export — late DPDP report', app: 'Loyalty', source: 'Cyber', revenue: 0, productivity: 2, penalties: 0, fines: 25, recovery: 6, churn: 8, validated: true },
  ],
}

// Prevention vs loss — the investment case (₹ lakh per year)
export const prevention: Record<DomainId, { measure: string; costL: number; lossAvoidedL: number }[]> = {
  banking: [
    { measure: 'Core banking capacity + batch re-sequencing', costL: 45, lossAvoidedL: 140 },
    { measure: '24×7 SOC with automated containment', costL: 120, lossAvoidedL: 210 },
    { measure: 'UPI auto-scaling', costL: 30, lossAvoidedL: 80 },
  ],
  manufacturing: [
    { measure: 'Hybrid ERP capacity (DEC-OPS-001)', costL: 35, lossAvoidedL: 160 },
    { measure: 'OT segmentation + USB control', costL: 60, lossAvoidedL: 250 },
  ],
  retail: [
    { measure: 'Festive cloud burst + load testing', costL: 22, lossAvoidedL: 180 },
    { measure: 'Bot management on checkout', costL: 18, lossAvoidedL: 40 },
    { measure: 'Joiner-mover-leaver automation', costL: 12, lossAvoidedL: 60 },
  ],
}

// ═════════════════════════════ STEP B ═════════════════════════════
// Update: DR & BCP → `dr`, `bcp` · Customer → `customer` · Vendors & support → `support`, `vendors` · End of life → `eol`

// ── DR & business continuity ─────────────────────────────────────────────
export type DrStrategy = 'Backup & restore' | 'Pilot light' | 'Warm standby' | 'Active-active'
export const drOptions: { strategy: DrStrategy; rto: string; rpo: string; cost: string; fit: string }[] = [
  { strategy: 'Backup & restore', rto: 'Hours – days', rpo: 'Hours', cost: '₹ (lowest)', fit: 'Tier 3 — can wait' },
  { strategy: 'Pilot light', rto: '1 – 4 hours', rpo: 'Minutes', cost: '₹₹', fit: 'Tier 2' },
  { strategy: 'Warm standby', rto: 'Minutes – 1 hour', rpo: 'Seconds – minutes', cost: '₹₹₹', fit: 'Tier 1' },
  { strategy: 'Active-active', rto: 'Near zero', rpo: 'Near zero', cost: '₹₹₹₹ (highest)', fit: 'Tier 0 — must not stop' },
]
export interface Dr { appId: string; strategy: DrStrategy; rtoTargetH: number; rtoTestedH: number | null; rpoTargetMin: number; rpoTestedMin: number | null; lastDrill: string | null; result: 'Pass' | 'Partial' | 'Fail' | 'Not tested'; nextDrill: string; overdue: boolean; proposed?: Improvement }
export const dr: Record<DomainId, Dr[]> = {
  banking: [
    { appId: 'BNK-APP-01', strategy: 'Warm standby', rtoTargetH: 2, rtoTestedH: 3.5, rpoTargetMin: 5, rpoTestedMin: 4, lastDrill: '12 Jul', result: 'Partial', nextDrill: '12 Oct', overdue: false, proposed: imp('Warm standby; tested RTO 3.5 h', 'Active-active for accounts & payments', 6, 'Feasibility', 'Pankaj') },
    { appId: 'BNK-APP-02', strategy: 'Active-active', rtoTargetH: 0.25, rtoTestedH: 0.2, rpoTargetMin: 0, rpoTestedMin: 0, lastDrill: '04 Sep', result: 'Pass', nextDrill: '04 Dec', overdue: false },
    { appId: 'BNK-APP-03', strategy: 'Warm standby', rtoTargetH: 1, rtoTestedH: 0.8, rpoTargetMin: 15, rpoTestedMin: 10, lastDrill: '20 Aug', result: 'Pass', nextDrill: '20 Nov', overdue: false },
    { appId: 'BNK-APP-04', strategy: 'Pilot light', rtoTargetH: 2, rtoTestedH: 2.5, rpoTargetMin: 15, rpoTestedMin: 15, lastDrill: '18 Mar', result: 'Pass', nextDrill: '18 Sep', overdue: true },
    { appId: 'BNK-APP-05', strategy: 'Backup & restore', rtoTargetH: 24, rtoTestedH: 16, rpoTargetMin: 240, rpoTestedMin: 180, lastDrill: '02 Jun', result: 'Pass', nextDrill: '02 Dec', overdue: false },
  ],
  manufacturing: [
    { appId: 'MFG-APP-01', strategy: 'Pilot light', rtoTargetH: 4, rtoTestedH: 7, rpoTargetMin: 15, rpoTestedMin: 30, lastDrill: '10 Apr', result: 'Fail', nextDrill: '10 Oct', overdue: false, proposed: imp('Pilot light; failed last drill (7 h)', 'Warm standby in hybrid design (DEC-OPS-001)', 8, 'Pilot', 'Pankaj') },
    { appId: 'MFG-APP-02', strategy: 'Warm standby', rtoTargetH: 1, rtoTestedH: null, rpoTargetMin: 5, rpoTestedMin: null, lastDrill: null, result: 'Not tested', nextDrill: '30 Oct', overdue: true, proposed: imp('Standby built, never tested', 'First DR drill per plant, then quarterly', 9, 'Proposed', 'Pankaj') },
    { appId: 'MFG-APP-03', strategy: 'Backup & restore', rtoTargetH: 8, rtoTestedH: 6, rpoTargetMin: 60, rpoTestedMin: 60, lastDrill: '15 Jul', result: 'Pass', nextDrill: '15 Jan', overdue: false, proposed: imp('Single data centre', 'Warm standby for dispatch', 6, 'Feasibility', 'Pankaj') },
    { appId: 'MFG-APP-04', strategy: 'Backup & restore', rtoTargetH: 24, rtoTestedH: null, rpoTargetMin: 240, rpoTestedMin: null, lastDrill: null, result: 'Not tested', nextDrill: 'Vendor-run', overdue: true },
    { appId: 'MFG-APP-05', strategy: 'Backup & restore', rtoTargetH: 24, rtoTestedH: 12, rpoTargetMin: 240, rpoTestedMin: 120, lastDrill: '22 May', result: 'Pass', nextDrill: '22 Nov', overdue: false },
  ],
  retail: [
    { appId: 'RTL-APP-01', strategy: 'Active-active', rtoTargetH: 0.25, rtoTestedH: 0.5, rpoTargetMin: 0, rpoTestedMin: 1, lastDrill: '01 Sep', result: 'Partial', nextDrill: '15 Oct', overdue: false, proposed: imp('Second region lags 30 min on failover', 'Automated failover runbook before Diwali', 8, 'Pilot', 'Pankaj') },
    { appId: 'RTL-APP-02', strategy: 'Pilot light', rtoTargetH: 1, rtoTestedH: 0.5, rpoTargetMin: 15, rpoTestedMin: 5, lastDrill: '09 Sep', result: 'Pass', nextDrill: '09 Dec', overdue: false },
    { appId: 'RTL-APP-03', strategy: 'Active-active', rtoTargetH: 0.25, rtoTestedH: 0.1, rpoTargetMin: 0, rpoTestedMin: 0, lastDrill: '20 Aug', result: 'Pass', nextDrill: '20 Nov', overdue: false },
    { appId: 'RTL-APP-04', strategy: 'Warm standby', rtoTargetH: 1, rtoTestedH: 1.5, rpoTargetMin: 15, rpoTestedMin: 15, lastDrill: '30 Jun', result: 'Partial', nextDrill: '30 Sep', overdue: true },
    { appId: 'RTL-APP-05', strategy: 'Backup & restore', rtoTargetH: 24, rtoTestedH: 10, rpoTargetMin: 240, rpoTestedMin: 120, lastDrill: '11 Apr', result: 'Pass', nextDrill: '11 Oct', overdue: false },
  ],
}
export function drStatus(x: Dr, tier: number): { health: AppHealth; reasons: string[] } {
  const reasons: string[] = []
  let health = 'Healthy' as AppHealth
  const red = (r: string) => { reasons.push(r); health = 'Critical' }
  const amber = (r: string) => { reasons.push(r); if (health === 'Healthy') health = 'Degraded' }
  if (x.result === 'Not tested') { if (tier <= 1) red('never tested (Tier ' + tier + ')'); else amber('never tested') }
  if (x.result === 'Fail') red('last drill failed')
  if (x.rtoTestedH !== null && x.rtoTestedH > x.rtoTargetH) red(`tested RTO ${x.rtoTestedH} h vs ${x.rtoTargetH} h target`)
  if (x.rpoTestedMin !== null && x.rpoTestedMin > x.rpoTargetMin) amber(`tested RPO ${x.rpoTestedMin} min vs ${x.rpoTargetMin} min`)
  if (x.result === 'Partial') amber('last drill partially passed')
  if (x.overdue) amber('drill overdue')
  return { health, reasons }
}
export interface Bcp { process: string; tier: 0 | 1 | 2 | 3; alternate: string; workaround: string; plan: 'Approved' | 'Draft' | 'Missing'; lastExercise: string | null; owner: string }
export const bcp: Record<DomainId, Bcp[]> = {
  banking: [
    { process: 'Payments & settlements', tier: 0, alternate: 'DR site, Chennai', workaround: 'Manual RTGS via correspondent bank', plan: 'Approved', lastExercise: 'Jul', owner: 'Head of Operations' },
    { process: 'Branch banking', tier: 1, alternate: 'Nearest branch', workaround: 'Offline teller limits', plan: 'Approved', lastExercise: 'Aug', owner: 'Branch network head' },
    { process: 'Customer contact centre', tier: 1, alternate: 'Work from home', workaround: 'IVR self-service', plan: 'Approved', lastExercise: 'Jun', owner: 'Service head' },
    { process: 'Regulatory reporting', tier: 2, alternate: 'DR site', workaround: 'Manual submission', plan: 'Draft', lastExercise: null, owner: 'Compliance head' },
  ],
  manufacturing: [
    { process: 'Production (4 plants)', tier: 0, alternate: 'Shift load across plants', workaround: 'Paper job cards for 24 h', plan: 'Approved', lastExercise: 'May', owner: 'COO' },
    { process: 'Dispatch & logistics', tier: 1, alternate: 'Plant 4 warehouse', workaround: 'Manual dispatch notes', plan: 'Draft', lastExercise: null, owner: 'Logistics head' },
    { process: 'Procurement', tier: 2, alternate: 'Email ordering', workaround: 'Pre-approved emergency suppliers', plan: 'Missing', lastExercise: null, owner: 'Procurement head' },
    { process: 'Month-end close', tier: 1, alternate: 'Extended close window', workaround: 'Provisional close from ledgers', plan: 'Approved', lastExercise: 'Mar', owner: 'CFO office' },
  ],
  retail: [
    { process: 'Store sales', tier: 0, alternate: 'POS offline mode', workaround: 'Offline card terminals', plan: 'Approved', lastExercise: 'Sep', owner: 'Head of stores' },
    { process: 'Online sales', tier: 0, alternate: 'Second cloud region', workaround: 'Maintenance page + app orders', plan: 'Approved', lastExercise: 'Sep', owner: 'Head of e-commerce' },
    { process: 'Fulfilment', tier: 1, alternate: 'Bengaluru DC', workaround: 'Manual pick lists', plan: 'Draft', lastExercise: null, owner: 'Warehouse ops head' },
    { process: 'Customer care', tier: 2, alternate: 'Outsourced partner', workaround: 'Chatbot FAQ', plan: 'Approved', lastExercise: 'Jul', owner: 'Customer care head' },
  ],
}

// ── Customer: CSAT & feedback loop ───────────────────────────────────────
export interface Customer {
  trend: { month: string; csat: number; nps: number; complaints: number }[]
  ces: number // customer effort score (1–7, lower is better)
  channels: { channel: string; share: number; csat: number }[]
  themes: { theme: string; share: number; linkedApp?: string }[]
  loop: { received: number; ticketed: number; rootCaused: number; fixed: number; informed: number }
  insight: string
  improvements: (Improvement & { name: string })[]
}
export const customer: Record<DomainId, Customer> = {
  banking: {
    trend: [{ month: 'May', csat: 81, nps: 34, complaints: 2100 }, { month: 'Jun', csat: 82, nps: 36, complaints: 1980 }, { month: 'Jul', csat: 80, nps: 33, complaints: 2260 }, { month: 'Aug', csat: 77, nps: 29, complaints: 2710 }, { month: 'Sep', csat: 78, nps: 30, complaints: 2540 }, { month: 'Oct', csat: 79, nps: 31, complaints: 820 }],
    ces: 3.4,
    channels: [{ channel: 'Mobile app survey', share: 46, csat: 82 }, { channel: 'IVR after call', share: 22, csat: 74 }, { channel: 'Branch tablet', share: 14, csat: 85 }, { channel: 'Email / web form', share: 12, csat: 71 }, { channel: 'Social media', share: 6, csat: 58 }],
    themes: [{ theme: 'UPI failures / timeouts', share: 31, linkedApp: 'UPI switch' }, { theme: 'Month-end balance delays', share: 18, linkedApp: 'Core banking (CBS)' }, { theme: 'ATM out of service', share: 14, linkedApp: 'ATM switch' }, { theme: 'Loan status visibility', share: 11 }, { theme: 'Branch wait time', share: 9 }],
    loop: { received: 9600, ticketed: 9100, rootCaused: 6200, fixed: 5100, informed: 4300 },
    insight: 'CSAT fell 3 points in August — the month UPI had 4 P2s at salary-day peak.',
    improvements: [{ name: 'Proactive outage SMS', current: 'Customers learn of outages by failing', proposed: 'Auto-SMS when a critical app degrades', feasibility: 9, stage: 'Pilot', owner: 'Suman' }],
  },
  manufacturing: {
    trend: [{ month: 'May', csat: 74, nps: 22, complaints: 140 }, { month: 'Jun', csat: 75, nps: 24, complaints: 128 }, { month: 'Jul', csat: 76, nps: 25, complaints: 120 }, { month: 'Aug', csat: 70, nps: 18, complaints: 188 }, { month: 'Sep', csat: 72, nps: 20, complaints: 165 }, { month: 'Oct', csat: 73, nps: 21, complaints: 52 }],
    ces: 3.9,
    channels: [{ channel: 'B2B portal survey', share: 41, csat: 73 }, { channel: 'Account manager review', share: 33, csat: 78 }, { channel: 'Email', share: 26, csat: 66 }],
    themes: [{ theme: 'Late dispatch', share: 38, linkedApp: 'SAP ERP' }, { theme: 'Quality defects', share: 24, linkedApp: 'MES' }, { theme: 'Invoice errors', share: 17, linkedApp: 'SAP ERP' }, { theme: 'Order status visibility', share: 12, linkedApp: 'Warehouse management (WMS)' }],
    loop: { received: 790, ticketed: 760, rootCaused: 540, fixed: 410, informed: 300 },
    insight: 'B2B CSAT dropped 6 points in August — Line 2 stopped 6 h (HMI malware) and SAP blocked dispatch for 5 h.',
    improvements: [{ name: 'Order-status portal for B2B customers', current: 'Status by phone / email', proposed: 'Self-service order tracking from SAP + WMS', feasibility: 7, stage: 'Proposed', owner: 'Suman' }],
  },
  retail: {
    trend: [{ month: 'May', csat: 79, nps: 38, complaints: 3400 }, { month: 'Jun', csat: 80, nps: 39, complaints: 3200 }, { month: 'Jul', csat: 81, nps: 41, complaints: 3100 }, { month: 'Aug', csat: 79, nps: 37, complaints: 3600 }, { month: 'Sep', csat: 76, nps: 33, complaints: 4300 }, { month: 'Oct', csat: 77, nps: 34, complaints: 1500 }],
    ces: 3.1,
    channels: [{ channel: 'In-app rating', share: 52, csat: 79 }, { channel: 'Post-purchase email', share: 24, csat: 76 }, { channel: 'Store QR survey', share: 15, csat: 83 }, { channel: 'Social media', share: 9, csat: 55 }],
    themes: [{ theme: 'Checkout errors at sale', share: 29, linkedApp: 'E-commerce platform' }, { theme: 'Order stuck / late', share: 23, linkedApp: 'Order management (OMS)' }, { theme: 'Store billing delays', share: 16, linkedApp: 'Point of sale (POS)' }, { theme: 'Refund time', share: 13 }, { theme: 'Personalised offers not relevant', share: 7, linkedApp: 'Loyalty' }],
    loop: { received: 21100, ticketed: 18900, rootCaused: 11200, fixed: 8800, informed: 6100 },
    insight: 'CSAT fell 3 points in September — the e-commerce P1 during the sale preview and 56 POS incidents.',
    improvements: [{ name: 'Close the loop within 7 days', current: '29 % of feedback gets a reply', proposed: 'Auto-reply + fix status to every customer', feasibility: 8, stage: 'PoC', owner: 'Suman' }],
  },
}
export function customerStatus(c: Customer): { health: AppHealth; reasons: string[] } {
  const reasons: string[] = []
  let health = 'Healthy' as AppHealth
  const peak = Math.max(...c.trend.map((t) => t.csat))
  const last = c.trend[c.trend.length - 2].csat // last full month
  if (peak - last >= 5) { health = 'Critical'; reasons.push(`CSAT ${peak - last} points below recent peak`) }
  else if (peak - last >= 3) { health = 'Degraded'; reasons.push(`CSAT ${peak - last} points below recent peak`) }
  const closure = Math.round((c.loop.informed / c.loop.received) * 100)
  if (closure < 60) { reasons.push(`only ${closure}% of feedback closed with the customer`); if (health === 'Healthy') health = 'Degraded' }
  return { health, reasons }
}

// ── Vendors & tech support ───────────────────────────────────────────────
export interface SupportTier { tier: 'L1 service desk' | 'L2 application support' | 'L3 engineering' | 'Vendor'; tickets: number; backlog: number; responseSla: number; resolutionSla: number }
export interface Vendor { vendor: string; service: string; apps: string; sla: number; risk: 'Low' | 'Medium' | 'High'; spof: boolean; exitPlan: boolean; contractEnd: string }
export const support: Record<DomainId, SupportTier[]> = {
  banking: [
    { tier: 'L1 service desk', tickets: 4200, backlog: 180, responseSla: 97, resolutionSla: 93 },
    { tier: 'L2 application support', tickets: 1100, backlog: 140, responseSla: 94, resolutionSla: 86 },
    { tier: 'L3 engineering', tickets: 260, backlog: 70, responseSla: 91, resolutionSla: 78 },
    { tier: 'Vendor', tickets: 120, backlog: 38, responseSla: 88, resolutionSla: 71 },
  ],
  manufacturing: [
    { tier: 'L1 service desk', tickets: 1900, backlog: 90, responseSla: 95, resolutionSla: 90 },
    { tier: 'L2 application support', tickets: 640, backlog: 110, responseSla: 89, resolutionSla: 79 },
    { tier: 'L3 engineering', tickets: 180, backlog: 64, responseSla: 86, resolutionSla: 70 },
    { tier: 'Vendor', tickets: 95, backlog: 41, responseSla: 79, resolutionSla: 62 },
  ],
  retail: [
    { tier: 'L1 service desk', tickets: 5100, backlog: 260, responseSla: 96, resolutionSla: 91 },
    { tier: 'L2 application support', tickets: 1300, backlog: 170, responseSla: 92, resolutionSla: 84 },
    { tier: 'L3 engineering', tickets: 300, backlog: 90, responseSla: 90, resolutionSla: 80 },
    { tier: 'Vendor', tickets: 140, backlog: 35, responseSla: 93, resolutionSla: 88 },
  ],
}
export const vendors: Record<DomainId, Vendor[]> = {
  banking: [
    { vendor: 'Core banking software vendor', service: 'CBS product support', apps: 'Core banking', sla: 92, risk: 'High', spof: true, exitPlan: false, contractEnd: 'Mar 2028' },
    { vendor: 'Payment switch provider', service: 'UPI / IMPS switch', apps: 'UPI switch', sla: 98, risk: 'Medium', spof: true, exitPlan: true, contractEnd: 'Dec 2027' },
    { vendor: 'ATM managed service', service: 'ATM operations', apps: 'ATM switch', sla: 95, risk: 'Medium', spof: false, exitPlan: true, contractEnd: 'Jun 2027' },
    { vendor: 'Cloud provider', service: 'DR + digital channels', apps: 'Internet banking', sla: 99.9, risk: 'Low', spof: false, exitPlan: true, contractEnd: 'Aug 2028' },
  ],
  manufacturing: [
    { vendor: 'SAP support partner', service: 'ERP basis & functional', apps: 'SAP ERP', sla: 88, risk: 'High', spof: true, exitPlan: false, contractEnd: 'Jan 2027' },
    { vendor: 'MES vendor', service: 'MES product support', apps: 'MES', sla: 93, risk: 'Medium', spof: true, exitPlan: false, contractEnd: 'Sep 2028' },
    { vendor: 'Supplier portal SaaS', service: 'SCM portal hosting', apps: 'Supplier portal (SCM)', sla: 90, risk: 'High', spof: true, exitPlan: false, contractEnd: 'Apr 2027' },
    { vendor: 'Logistics partner IT', service: 'Carrier integration', apps: 'WMS', sla: 96, risk: 'Low', spof: false, exitPlan: true, contractEnd: 'Dec 2026' },
  ],
  retail: [
    { vendor: 'E-commerce platform SaaS', service: 'Storefront & checkout', apps: 'E-commerce platform', sla: 99.9, risk: 'Medium', spof: true, exitPlan: true, contractEnd: 'Feb 2028' },
    { vendor: 'Payment acquirer', service: 'Card & UPI acquiring', apps: 'Payment gateway', sla: 99.95, risk: 'High', spof: true, exitPlan: false, contractEnd: 'Nov 2027' },
    { vendor: 'POS hardware & support', service: 'Store terminals', apps: 'POS', sla: 94, risk: 'Medium', spof: false, exitPlan: true, contractEnd: 'Jul 2027' },
    { vendor: '3PL warehouse partner', service: 'Fulfilment systems', apps: 'OMS', sla: 95, risk: 'Medium', spof: false, exitPlan: true, contractEnd: 'Mar 2027' },
  ],
}
export function vendorStatus(v: Vendor): { health: AppHealth; reasons: string[] } {
  const reasons: string[] = []
  let health = 'Healthy' as AppHealth
  if (v.spof && !v.exitPlan) { health = 'Critical'; reasons.push('single point of failure with no exit plan') }
  if (v.sla < 95) { reasons.push(`SLA ${v.sla}% (< 95%)`); if (health === 'Healthy') health = 'Degraded' }
  if (v.risk === 'High' && health === 'Healthy') { health = 'Degraded'; reasons.push('high vendor risk') }
  return { health, reasons }
}

// ── End of life ──────────────────────────────────────────────────────────
export type EolDecision = 'Upgrade' | 'Replace' | 'Retire' | 'Extended support' | 'Risk accepted' | 'Undecided'
export interface Eol { item: string; type: 'Operating system' | 'Database' | 'Middleware' | 'Hardware' | 'Application'; version: string; endOfSupport: string; monthsLeft: number; apps: string; decision: EolDecision; exceptionExpiry?: string; appOwner: string; stage: Stage }
export const eol: Record<DomainId, Eol[]> = {
  banking: [
    { item: 'Core banking database', type: 'Database', version: 'v12', endOfSupport: 'Jul 2026', monthsLeft: -3, apps: 'Core banking', decision: 'Extended support', exceptionExpiry: 'Jan 2027', appOwner: 'Head of IT Ops', stage: 'Pilot' },
    { item: 'Branch desktops OS', type: 'Operating system', version: 'Desktop OS (old)', endOfSupport: 'Oct 2025', monthsLeft: -12, apps: '1,240 branch PCs', decision: 'Upgrade', appOwner: 'End-user computing head', stage: 'Scale' },
    { item: 'ATM operating system', type: 'Operating system', version: 'Embedded OS (old)', endOfSupport: 'Jan 2027', monthsLeft: 3, apps: 'ATM switch', decision: 'Undecided', appOwner: 'Channels ops lead', stage: 'Current' },
    { item: 'Integration middleware', type: 'Middleware', version: 'v9', endOfSupport: 'Dec 2027', monthsLeft: 14, apps: 'Internet banking, UPI', decision: 'Upgrade', appOwner: 'Integration lead', stage: 'Proposed' },
  ],
  manufacturing: [
    { item: 'SAP ERP (current release)', type: 'Application', version: 'ECC 6.0', endOfSupport: 'Dec 2027', monthsLeft: 14, apps: 'SAP ERP', decision: 'Replace', appOwner: 'SAP basis lead', stage: 'Feasibility' },
    { item: 'Plant HMI PCs', type: 'Operating system', version: 'Legacy embedded OS', endOfSupport: 'Jan 2020', monthsLeft: -69, apps: 'MES, 4 plants', decision: 'Risk accepted', exceptionExpiry: 'Expired Jun 2026', appOwner: 'Plant IT manager', stage: 'Current' },
    { item: 'MES database server', type: 'Hardware', version: 'Gen 8 servers', endOfSupport: 'Mar 2027', monthsLeft: 5, apps: 'MES', decision: 'Undecided', appOwner: 'MES lead', stage: 'Current' },
    { item: 'Quality system', type: 'Application', version: 'v4.2', endOfSupport: 'Dec 2028', monthsLeft: 26, apps: 'Quality system', decision: 'Upgrade', appOwner: 'Quality IT lead', stage: 'Proposed' },
  ],
  retail: [
    { item: 'Store POS terminals', type: 'Hardware', version: 'Model 2017', endOfSupport: 'Jun 2026', monthsLeft: -4, apps: 'POS, 140 stores', decision: 'Replace', appOwner: 'Store systems lead', stage: 'Pilot' },
    { item: 'OMS application server', type: 'Middleware', version: 'v8', endOfSupport: 'Feb 2027', monthsLeft: 4, apps: 'Order management', decision: 'Upgrade', appOwner: 'Retail systems lead', stage: 'PoC' },
    { item: 'Loyalty database', type: 'Database', version: 'v11', endOfSupport: 'Nov 2027', monthsLeft: 13, apps: 'Loyalty', decision: 'Undecided', appOwner: 'Loyalty manager', stage: 'Current' },
  ],
}
export function eolStatus(e: Eol): { health: AppHealth; reasons: string[] } {
  if (e.monthsLeft < 0 && (e.decision === 'Risk accepted' && e.exceptionExpiry?.startsWith('Expired'))) return { health: 'Critical', reasons: ['past end of support; risk exception expired'] }
  if (e.monthsLeft < 0 && !['Extended support', 'Upgrade', 'Replace', 'Retire'].includes(e.decision)) return { health: 'Critical', reasons: ['past end of support with no plan'] }
  if (e.monthsLeft < 0) return { health: 'Degraded', reasons: ['past end of support; remediation in progress'] }
  if (e.monthsLeft <= 6 && e.decision === 'Undecided') return { health: 'Critical', reasons: [`${e.monthsLeft} months to end of support and no decision`] }
  if (e.monthsLeft <= 12 && e.decision === 'Undecided') return { health: 'Degraded', reasons: ['under 12 months and no decision'] }
  return { health: 'Healthy', reasons: [] }
}
export const eolRaci = [
  { role: 'Application owner', does: 'Accountable for the decision and the deadline' },
  { role: 'IT asset manager', does: 'Tracks dates; alerts at 12, 6 and 3 months' },
  { role: 'Enterprise architect', does: 'Proposes the replacement or upgrade path' },
  { role: 'CISO (Vaibhav)', does: 'Approves a time-limited security exception if late' },
  { role: 'Finance (Santhosh)', does: 'Funds the upgrade or replacement' },
]
