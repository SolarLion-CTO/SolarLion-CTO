// Mock data for the demo. Same shape for every domain — that is the point:
// the framework is fixed, only the domain pack changes.

export type DomainId = 'banking' | 'manufacturing'

export type Risk = 'Low' | 'Medium' | 'High' | 'Critical'
export type Stage = 'Assess' | 'Design' | 'Pilot' | 'Scale' | 'Operate'

export interface Initiative {
  id: string
  name: string
  workstream: 'Strategy' | 'Operations' | 'Finance' | 'Governance' | 'AI Control'
  owner: string
  stage: Stage
  investment: number // $M
  value: number // $M realised / projected annual value
  risk: Risk
  progress: number // %
  status: 'On Track' | 'At Risk' | 'Delayed'
}

export interface Decision {
  id: string
  title: string
  initiative: string
  recommendation: string
  confidence: number
  evidence: string[]
  alternatives: string[]
  financialImpact: string
  risk: Risk
  approver: string
  policyCheck: 'Passed' | 'Conditional'
}

export interface Control {
  name: string
  regulation: string
  coverage: number
  status: 'Compliant' | 'Partial' | 'Gap'
}

export interface Agent {
  name: string
  role: string
  status: 'Active' | 'Idle' | 'Training' | 'Error'
  tasks: number
  accuracy: number
}

export interface OpsUseCase {
  name: string
  metric: string
  baseline: string
  current: string
  improvement: number
}

export interface DomainPack {
  id: DomainId
  name: string
  tagline: string
  kpis: { revenueImpact: number; costSaved: number; roi: number; productivity: number; compliance: number }
  dimensions: { strategy: number; governance: number; platform: number; modernization: number; operations: number }
  maturity: { current: number; target: number; label: string }
  initiatives: Initiative[]
  decisions: Decision[]
  controls: Control[]
  agents: Agent[]
  ops: OpsUseCase[]
  valueTrend: { month: string; value: number; cost: number }[]
  capexOpex: { quarter: string; capex: number; opex: number }[]
  alerts: { level: 'Critical' | 'Warning' | 'Info'; text: string; time: string }[]
}

export const domains: Record<DomainId, DomainPack> = {
  banking: {
    id: 'banking',
    name: 'Banking',
    tagline: 'Trust · Regulation · Growth',
    kpis: { revenueImpact: 42.6, costSaved: 18.3, roi: 166, productivity: 78.4, compliance: 94 },
    dimensions: { strategy: 92, governance: 96, platform: 89, modernization: 84, operations: 90 },
    maturity: { current: 3.4, target: 4.5, label: 'AI-Assisted' },
    initiatives: [
      { id: 'BNK-01', name: 'Regulatory change interpretation & control mapping', workstream: 'Governance', owner: 'Vaibhav', stage: 'Pilot', investment: 2.4, value: 6.1, risk: 'High', progress: 62, status: 'On Track' },
      { id: 'BNK-02', name: 'DPDP privacy evidence & audit automation', workstream: 'Governance', owner: 'Vaibhav', stage: 'Design', investment: 1.8, value: 3.9, risk: 'High', progress: 35, status: 'At Risk' },
      { id: 'BNK-03', name: 'AI-assisted credit decision support', workstream: 'AI Control', owner: 'Ram', stage: 'Pilot', investment: 4.2, value: 12.8, risk: 'Critical', progress: 55, status: 'On Track' },
      { id: 'BNK-04', name: 'Fraud detection agent', workstream: 'Operations', owner: 'Pankaj', stage: 'Scale', investment: 3.1, value: 9.6, risk: 'Medium', progress: 84, status: 'On Track' },
      { id: 'BNK-05', name: 'Core banking modernisation roadmap', workstream: 'Strategy', owner: 'Suman', stage: 'Assess', investment: 6.5, value: 14.2, risk: 'Medium', progress: 20, status: 'Delayed' },
      { id: 'BNK-06', name: 'Branch & ATM cost optimisation', workstream: 'Finance', owner: 'Santhosh', stage: 'Operate', investment: 1.2, value: 4.4, risk: 'Low', progress: 100, status: 'On Track' },
    ],
    decisions: [
      {
        id: 'DEC-BNK-014', title: 'Approve scale-out of fraud detection agent to all card channels', initiative: 'BNK-04',
        recommendation: 'Scale to debit + credit card channels in Q1; keep UPI in shadow mode for 4 more weeks.',
        confidence: 0.87,
        evidence: ['False-positive rate fell 31% over 8-week pilot', 'Shadow-run agreement with analysts: 89%', 'Projected fraud loss avoided: $9.6M / year'],
        alternatives: ['Scale all channels at once (higher risk, +$1.4M value)', 'Hold at pilot (no additional value)'],
        financialImpact: '+$9.6M annual loss avoided; $0.9M run cost', risk: 'Medium', approver: 'CTO (Ram)', policyCheck: 'Passed',
      },
      {
        id: 'DEC-BNK-015', title: 'Map RBI circular to internal controls', initiative: 'BNK-01',
        recommendation: 'Update 7 controls; 2 require new evidence collection. Route to Compliance for sign-off.',
        confidence: 0.79,
        evidence: ['14 clauses parsed, 7 matched to existing controls', 'Two clauses have no current evidence source'],
        alternatives: ['Manual review by compliance team (est. 3 weeks)'],
        financialImpact: 'Avoids potential penalty exposure; 120 analyst-hours saved', risk: 'High', approver: 'Head of Compliance (Vaibhav)', policyCheck: 'Conditional',
      },
      {
        id: 'DEC-BNK-016', title: 'Release capex for core banking modernisation wave 1', initiative: 'BNK-05',
        recommendation: 'Release $2.1M of $6.5M now; gate remainder on wave-1 outcomes.',
        confidence: 0.72,
        evidence: ['Assessment 60% complete', 'Vendor shortlist finalised', 'Legacy run cost $3.8M / year'],
        alternatives: ['Release full $6.5M (faster, higher risk)', 'Defer to next FY'],
        financialImpact: '$2.1M capex now; payback 26 months', risk: 'High', approver: 'CFO (Santhosh)', policyCheck: 'Passed',
      },
    ],
    controls: [
      { name: 'Consent capture & notice', regulation: 'DPDP Act 2023', coverage: 88, status: 'Partial' },
      { name: 'Data retention & erasure', regulation: 'DPDP Act 2023', coverage: 72, status: 'Partial' },
      { name: 'Breach reporting within 72h', regulation: 'DPDP Rules 2025', coverage: 100, status: 'Compliant' },
      { name: 'Model risk management', regulation: 'RBI guidance', coverage: 91, status: 'Compliant' },
      { name: 'Human oversight of AI decisions', regulation: 'AI Governance policy', coverage: 100, status: 'Compliant' },
      { name: 'AI explainability records', regulation: 'AI Governance policy', coverage: 58, status: 'Gap' },
    ],
    agents: [
      { name: 'Fraud Sentinel', role: 'Transaction risk scoring', status: 'Active', tasks: 12840, accuracy: 96.1 },
      { name: 'RegMapper', role: 'Regulation → control mapping', status: 'Active', tasks: 214, accuracy: 91.4 },
      { name: 'Credit Advisor', role: 'Credit recommendation', status: 'Training', tasks: 0, accuracy: 88.2 },
      { name: 'Privacy Auditor', role: 'DPDP evidence collection', status: 'Active', tasks: 1530, accuracy: 93.7 },
      { name: 'Value Tracker', role: 'KPI & benefit tracking', status: 'Active', tasks: 96, accuracy: 98.9 },
    ],
    ops: [
      { name: 'Loan processing cycle time', metric: 'days', baseline: '9.5 d', current: '4.2 d', improvement: 56 },
      { name: 'KYC verification', metric: 'minutes', baseline: '42 min', current: '11 min', improvement: 74 },
      { name: 'Fraud false positives', metric: '%', baseline: '4.8%', current: '3.3%', improvement: 31 },
      { name: 'Customer query automation', metric: '%', baseline: '18%', current: '61%', improvement: 43 },
    ],
    valueTrend: [
      { month: 'Apr', value: 1.8, cost: 1.4 }, { month: 'May', value: 2.4, cost: 1.5 }, { month: 'Jun', value: 3.1, cost: 1.6 },
      { month: 'Jul', value: 3.9, cost: 1.6 }, { month: 'Aug', value: 4.6, cost: 1.7 }, { month: 'Sep', value: 5.5, cost: 1.8 },
    ],
    capexOpex: [
      { quarter: 'Q1', capex: 3.2, opex: 1.1 }, { quarter: 'Q2', capex: 4.1, opex: 1.5 },
      { quarter: 'Q3', capex: 2.6, opex: 1.9 }, { quarter: 'Q4', capex: 1.8, opex: 2.2 },
    ],
    alerts: [
      { level: 'Critical', text: 'AI explainability records below policy threshold (58%)', time: '10:25' },
      { level: 'Warning', text: 'DPDP audit automation behind plan by 2 weeks', time: '09:58' },
      { level: 'Info', text: 'Fraud Sentinel model v3.2 passed validation', time: '09:30' },
    ],
  },

  manufacturing: {
    id: 'manufacturing',
    name: 'Manufacturing',
    tagline: 'Efficiency · Scale · Innovation',
    kpis: { revenueImpact: 31.2, costSaved: 22.7, roi: 142, productivity: 81.6, compliance: 88 },
    dimensions: { strategy: 81, governance: 86, platform: 78, modernization: 72, operations: 88 },
    maturity: { current: 2.9, target: 4.2, label: 'Data-Driven' },
    initiatives: [
      { id: 'MFG-01', name: 'ERP-based root cause analysis assistant', workstream: 'Operations', owner: 'Pankaj', stage: 'Pilot', investment: 1.9, value: 5.8, risk: 'Medium', progress: 66, status: 'On Track' },
      { id: 'MFG-02', name: 'Infrastructure capacity planning', workstream: 'Operations', owner: 'Pankaj', stage: 'Design', investment: 2.7, value: 6.4, risk: 'Medium', progress: 40, status: 'On Track' },
      { id: 'MFG-03', name: 'Production management workflow automation', workstream: 'Operations', owner: 'Pankaj', stage: 'Pilot', investment: 3.4, value: 9.1, risk: 'High', progress: 48, status: 'At Risk' },
      { id: 'MFG-04', name: 'Engineering knowledge retrieval (RAG)', workstream: 'AI Control', owner: 'Ram', stage: 'Scale', investment: 1.1, value: 3.7, risk: 'Low', progress: 82, status: 'On Track' },
      { id: 'MFG-05', name: 'Plant AI adoption roadmap', workstream: 'Strategy', owner: 'Suman', stage: 'Assess', investment: 0.6, value: 2.2, risk: 'Low', progress: 30, status: 'On Track' },
      { id: 'MFG-06', name: 'Opex/capex rebalancing for 4 plants', workstream: 'Finance', owner: 'Santhosh', stage: 'Operate', investment: 0.8, value: 4.9, risk: 'Low', progress: 100, status: 'On Track' },
    ],
    decisions: [
      {
        id: 'DEC-MFG-021', title: 'Root cause: Line 3 defect spike', initiative: 'MFG-01',
        recommendation: 'Recalibrate press P-07 and change resin supplier lot; probable cause temperature drift.',
        confidence: 0.84,
        evidence: ['Defects correlate with P-07 temp > 212°C (r = 0.78)', 'Spike began with resin lot #4471', 'Similar incident resolved same way in 2025'],
        alternatives: ['Replace P-07 heating element ($42K)', 'Slow line speed by 8% (throughput loss)'],
        financialImpact: '$310K/month scrap avoided', risk: 'Medium', approver: 'Plant Manager (Pankaj)', policyCheck: 'Passed',
      },
      {
        id: 'DEC-MFG-022', title: 'Add compute capacity for MES before Q4 peak', initiative: 'MFG-02',
        recommendation: 'Add 2 nodes to MES cluster by 15 Nov; utilisation forecast 91% at peak.',
        confidence: 0.81,
        evidence: ['Peak utilisation last year: 86%', 'Order book +12% YoY', 'Latency SLA breached twice in September'],
        alternatives: ['Burst to cloud during peak only', 'Defer and accept SLA risk'],
        financialImpact: '$180K capex; avoids est. $1.2M downtime', risk: 'Medium', approver: 'CTO (Ram)', policyCheck: 'Passed',
      },
      {
        id: 'DEC-MFG-023', title: 'Automate work-order release to shop floor', initiative: 'MFG-03',
        recommendation: 'Automate release for standard orders; keep human approval for custom and rush orders.',
        confidence: 0.76,
        evidence: ['78% of orders are standard', 'Manual release adds 5.5h average delay'],
        alternatives: ['Full automation (higher risk on custom orders)'],
        financialImpact: '$2.3M/year throughput gain', risk: 'High', approver: 'COO', policyCheck: 'Conditional',
      },
    ],
    controls: [
      { name: 'Worker data privacy', regulation: 'DPDP Act 2023', coverage: 81, status: 'Partial' },
      { name: 'Quality traceability', regulation: 'ISO 9001', coverage: 95, status: 'Compliant' },
      { name: 'OT network security', regulation: 'IEC 62443', coverage: 69, status: 'Gap' },
      { name: 'Environmental reporting', regulation: 'CPCB norms', coverage: 90, status: 'Compliant' },
      { name: 'Human oversight of AI decisions', regulation: 'AI Governance policy', coverage: 100, status: 'Compliant' },
      { name: 'Agent action audit logs', regulation: 'AI Governance policy', coverage: 84, status: 'Partial' },
    ],
    agents: [
      { name: 'RCA Investigator', role: 'Defect root cause analysis', status: 'Active', tasks: 342, accuracy: 89.5 },
      { name: 'Capacity Planner', role: 'Infra & line capacity forecast', status: 'Active', tasks: 58, accuracy: 92.3 },
      { name: 'Work-Order Bot', role: 'Production workflow automation', status: 'Training', tasks: 0, accuracy: 85.0 },
      { name: 'Knowledge Assistant', role: 'Engineering SOP retrieval', status: 'Active', tasks: 4120, accuracy: 94.8 },
      { name: 'Value Tracker', role: 'KPI & benefit tracking', status: 'Active', tasks: 88, accuracy: 98.9 },
    ],
    ops: [
      { name: 'Overall equipment effectiveness', metric: '%', baseline: '64%', current: '76%', improvement: 19 },
      { name: 'RCA resolution time', metric: 'hours', baseline: '38 h', current: '9 h', improvement: 76 },
      { name: 'Unplanned downtime', metric: 'h/month', baseline: '52 h', current: '29 h', improvement: 44 },
      { name: 'Scrap rate', metric: '%', baseline: '3.9%', current: '2.6%', improvement: 33 },
    ],
    valueTrend: [
      { month: 'Apr', value: 1.2, cost: 1.1 }, { month: 'May', value: 1.7, cost: 1.2 }, { month: 'Jun', value: 2.5, cost: 1.3 },
      { month: 'Jul', value: 3.0, cost: 1.3 }, { month: 'Aug', value: 3.8, cost: 1.4 }, { month: 'Sep', value: 4.4, cost: 1.4 },
    ],
    capexOpex: [
      { quarter: 'Q1', capex: 2.1, opex: 0.9 }, { quarter: 'Q2', capex: 2.8, opex: 1.2 },
      { quarter: 'Q3', capex: 1.9, opex: 1.4 }, { quarter: 'Q4', capex: 1.5, opex: 1.6 },
    ],
    alerts: [
      { level: 'Critical', text: 'OT network security control coverage at 69%', time: '11:02' },
      { level: 'Warning', text: 'Work-order automation pilot delayed by MES integration', time: '10:14' },
      { level: 'Info', text: 'RCA Investigator resolved Line 3 defect spike', time: '09:41' },
    ],
  },
}

// Domains shown in the portfolio as "next" to prove the framework is reusable.
export const plannedDomains = ['Retail', 'Healthcare', 'Insurance', 'Telecom', 'Energy']

export const team = [
  { name: 'Ram', area: 'AI Control Layer & Architecture' },
  { name: 'Suman', area: 'Strategy & Transformation' },
  { name: 'Santhosh', area: 'Finance & Decision Systems' },
  { name: 'Pankaj', area: 'Operations' },
  { name: 'Vaibhav', area: 'Regulatory & AI Governance' },
]
