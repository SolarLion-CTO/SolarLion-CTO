// Demo data. Every domain pack has the same shape — the framework is fixed,
// only the domain pack (problems, decisions, KPIs, controls) changes.
// Problem statements follow the capstone PPT (slide 14) and proposal (section 8).
// Money is in ₹ crore unless stated otherwise.

export type DomainId = 'banking' | 'manufacturing' | 'retail'
export type Area = 'Strategy' | 'Operations' | 'Finance' | 'Governance' | 'Innovation'
export const areas: Area[] = ['Strategy', 'Operations', 'Finance', 'Governance', 'Innovation']

export const areaOwner: Record<Area, string> = {
  Strategy: 'Suman', Operations: 'Pankaj', Finance: 'Santhosh', Governance: 'Vaibhav', Innovation: 'Ram',
}

export type Risk = 'Low' | 'Medium' | 'High' | 'Critical'
export type Stage = 'Assess' | 'Design' | 'Pilot' | 'Scale' | 'Operate'
export type Health = 'On Track' | 'At Risk' | 'Delayed'

export interface Problem {
  area: Area
  title: string
  pain: string // what hurts today
  rootCauses: string[]
  aiSolution: string
  kpi: string
  baseline: string
  current: string
  target: string
  progress: number // % of the way from baseline to target
  valueCr: number // annual value at target
  stage: Stage
  health: Health
}

export interface Initiative {
  id: string
  name: string
  area: Area
  owner: string
  stage: Stage
  investment: number // ₹ Cr
  value: number // ₹ Cr annual value
  risk: Risk
  progress: number
  status: Health
}

export interface Decision {
  id: string
  title: string
  area: Area
  question: string
  recommendation: string
  confidence: number
  evidence: string[]
  alternatives: string[]
  financialImpact: string
  valueCr: number // added to realised value when approved
  risk: Risk
  owner: string
  approver: string
  classification: 'Public' | 'Internal' | 'Confidential' | 'Restricted'
  policyCheck: 'Passed' | 'Conditional'
  sources: string[] // MCP / RAG sources cited
  flagship?: boolean
}

export interface Control { name: string; regulation: string; coverage: number; status: 'Compliant' | 'Partial' | 'Gap' }
export interface Agent { name: string; role: string; status: 'Active' | 'Idle' | 'Training' | 'Error'; tasks: number; accuracy: number; mcp: string }
export interface OpsMetric { name: string; baseline: string; current: string; improvement: number }

export interface DomainPack {
  id: DomainId
  name: string
  tagline: string
  configuredOnly?: boolean // true = added by configuration, no code change
  kpis: { revenueImpact: number; costSaved: number; roi: number; productivity: number; compliance: number }
  maturity: { current: number; target: number; label: string }
  problems: Record<Area, Problem>
  initiatives: Initiative[]
  decisions: Decision[]
  controls: Control[]
  agents: Agent[]
  ops: OpsMetric[]
  mcpConnectors: string[]
  valueTrend: { month: string; value: number; cost: number }[]
  capexOpex: { quarter: string; capex: number; opex: number }[]
  alerts: { level: 'Critical' | 'Warning' | 'Info'; text: string; time: string }[]
}

// Cross-functional flagship decision (PPT slide 15). Shown in every domain.
export const flagship: Decision = {
  id: 'DEC-OPS-001',
  title: 'ERP capacity expansion — cloud, on-prem or hybrid?',
  area: 'Operations',
  question: 'Month-end ERP slowdowns are delaying close. How should we add capacity?',
  recommendation: 'Hybrid: keep ERP database on-prem (restricted data), burst application tier to cloud at month-end. Add one production shift in Q1.',
  confidence: 0.84,
  evidence: [
    'Pankaj · ERP RCA: month-end batch runs 3.4 h over SLA; CPU at 96% for 31 h each close',
    'Pankaj · Forecast: +40% IT headroom needed; order book +12% YoY',
    "Suman · Linked to objective 'on-time month-end close' — value 8.2, feasibility 7.6",
    'Santhosh · 3-year cost: Cloud ₹1.14 Cr · On-prem ₹1.31 Cr · Hybrid ₹1.06 Cr (lowest)',
    'Vaibhav · DPDP residency: restricted data stays on-prem → hybrid passes; security sign-off given',
  ],
  alternatives: [
    'Full cloud — lowest Year-1 cost (₹38 L) but restricted ERP data leaves premises; fails residency policy',
    'Full on-prem — ₹1.07 Cr upfront CAPEX; highest 3-year cost; 14-week hardware lead time',
  ],
  financialImpact: '₹1.06 Cr over 3 years · ₹60 L/yr benefit · payback ~12 months · ~70% 3-yr ROI',
  valueCr: 0.6,
  risk: 'High',
  owner: 'Pankaj (Operations)',
  approver: 'CFO with CIO',
  classification: 'Confidential',
  policyCheck: 'Passed',
  sources: ['MCP · ERP (SAP) performance logs', 'MCP · ITSM incident history', 'RAG · Capacity planning SOP v3', 'RAG · DPDP data residency policy'],
  flagship: true,
}

// 3-year cumulative cost for DEC-OPS-001, ₹ lakh (PPT slide 19, illustrative)
export const erpEconomics = [
  { year: 'Year 1', Cloud: 38, 'On-prem': 107, Hybrid: 62 },
  { year: 'Year 2', Cloud: 76, 'On-prem': 119, Hybrid: 84 },
  { year: 'Year 3', Cloud: 114, 'On-prem': 131, Hybrid: 106 },
]

const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep']
const trend = (vals: number[], costs: number[]) => months.map((m, i) => ({ month: m, value: vals[i], cost: costs[i] }))

export const domains: Record<DomainId, DomainPack> = {
  // ─────────────────────────────── BANKING ───────────────────────────────
  banking: {
    id: 'banking',
    name: 'Banking',
    tagline: 'Trust · Regulation · Growth',
    kpis: { revenueImpact: 42.6, costSaved: 18.3, roi: 166, productivity: 78.4, compliance: 94 },
    maturity: { current: 3.4, target: 4.5, label: 'AI-Assisted' },
    problems: {
      Strategy: {
        area: 'Strategy', title: 'Prioritise AI use cases by ROI for lending operations',
        pain: '23 AI ideas raised across retail and SME lending; each team funds its own pilot and none can show ROI to the board.',
        rootCauses: ['No common scoring of value vs feasibility', 'No pre-pilot KPI baseline', 'Duplicate vendor PoCs in 3 teams'],
        aiSolution: 'Scoring agent ranks every use case on value, feasibility, risk and data readiness; portfolio reviewed at Gate 1.',
        kpi: 'AI spend on top-quartile ROI use cases', baseline: '35%', current: '61%', target: '80%', progress: 58, valueCr: 12.8, stage: 'Pilot', health: 'On Track',
      },
      Operations: {
        area: 'Operations', title: 'Core banking month-end capacity and incident RCA',
        pain: 'Month-end batch overruns delay reporting; repeat P1 incidents take hours to diagnose.',
        rootCauses: ['Batch jobs compete for the same DB window', 'Incident data spread across ITSM, logs and email', 'No capacity forecast before peaks'],
        aiSolution: 'RCA agent correlates ITSM, logs and change records via MCP; capacity agent forecasts month-end load.',
        kpi: 'Mean time to resolve P1 incidents', baseline: '6.2 h', current: '3.1 h', target: '2.0 h', progress: 74, valueCr: 4.1, stage: 'Pilot', health: 'On Track',
      },
      Finance: {
        area: 'Finance', title: 'Cloud vs on-prem for core systems',
        pain: 'Hardware refresh due; no consistent TCO model, so infra decisions are made on vendor quotes.',
        rootCauses: ['OPEX and CAPEX tracked in different systems', 'Data-residency cost not priced in', 'No 3-year view'],
        aiSolution: 'Finance agent builds 3-year TCO per option with residency constraints; CFO approves via Decision Center.',
        kpi: 'Infra decisions with 3-year TCO evidence', baseline: '10%', current: '55%', target: '100%', progress: 50, valueCr: 3.6, stage: 'Design', health: 'On Track',
      },
      Governance: {
        area: 'Governance', title: 'Regulatory change mapped to controls; DPDP compliance',
        pain: 'Each RBI circular takes ~3 weeks to map to controls manually; DPDP evidence is collected by spreadsheet.',
        rootCauses: ['Manual reading of circulars', 'Control register not linked to policies', 'Consent records split across 4 systems'],
        aiSolution: 'Regulatory-feed MCP + RAG over the policy library drafts a cited gap analysis; compliance officer approves.',
        kpi: 'Days from circular to mapped controls', baseline: '21 days', current: '4 days', target: '< 1 day', progress: 81, valueCr: 6.1, stage: 'Pilot', health: 'At Risk',
      },
      Innovation: {
        area: 'Innovation', title: 'Safe agentic AI on core banking systems',
        pain: 'Business wants AI agents to act on core banking, but no pattern exists to do it without risking customer data.',
        rootCauses: ['Point-to-point integrations, no standard connector', 'No model routing by data classification', 'Legacy core with thin APIs'],
        aiSolution: 'CTO pattern: MCP connectors with allow-listed tools, local LLM for restricted data, cloud LLM for the rest.',
        kpi: 'AI use cases on the shared control layer', baseline: '0', current: '4', target: '10', progress: 40, valueCr: 5.0, stage: 'Design', health: 'On Track',
      },
    },
    initiatives: [
      { id: 'BNK-01', name: 'Regulatory change → control mapping', area: 'Governance', owner: 'Vaibhav', stage: 'Pilot', investment: 2.4, value: 6.1, risk: 'High', progress: 62, status: 'At Risk' },
      { id: 'BNK-02', name: 'DPDP consent & evidence automation', area: 'Governance', owner: 'Vaibhav', stage: 'Design', investment: 1.8, value: 3.9, risk: 'High', progress: 35, status: 'At Risk' },
      { id: 'BNK-03', name: 'Lending AI use-case portfolio', area: 'Strategy', owner: 'Suman', stage: 'Pilot', investment: 4.2, value: 12.8, risk: 'Medium', progress: 55, status: 'On Track' },
      { id: 'BNK-04', name: 'Core banking RCA & month-end capacity', area: 'Operations', owner: 'Pankaj', stage: 'Pilot', investment: 1.6, value: 4.1, risk: 'Medium', progress: 74, status: 'On Track' },
      { id: 'BNK-05', name: 'Core systems TCO: cloud vs on-prem', area: 'Finance', owner: 'Santhosh', stage: 'Design', investment: 0.9, value: 3.6, risk: 'Low', progress: 50, status: 'On Track' },
      { id: 'BNK-06', name: 'MCP control layer for core banking', area: 'Innovation', owner: 'Ram', stage: 'Design', investment: 2.2, value: 5.0, risk: 'High', progress: 40, status: 'On Track' },
    ],
    decisions: [
      {
        id: 'BNK-D-001', title: 'Map new RBI circular to internal controls', area: 'Governance',
        question: 'Which internal controls does the new circular affect, and what evidence is missing?',
        recommendation: 'Update 7 controls; create 2 new evidence collections. Route to Chief Compliance Officer.',
        confidence: 0.79,
        evidence: ['14 clauses parsed; 7 match existing controls', '2 clauses have no evidence source today', 'Every mapping cites the clause and policy section'],
        alternatives: ['Manual review by compliance team (~3 weeks)'],
        financialImpact: '120 analyst-hours saved; reduces penalty exposure', valueCr: 0.4, risk: 'High',
        owner: 'Compliance manager', approver: 'Chief Compliance Officer', classification: 'Internal', policyCheck: 'Conditional',
        sources: ['MCP · Regulatory feed', 'RAG · Policy library', 'MCP · Control register'],
      },
      {
        id: 'BNK-D-002', title: 'Fund top-5 lending AI use cases', area: 'Strategy',
        question: 'Which lending AI use cases should get funding this quarter?',
        recommendation: 'Fund 5 of 23: document extraction, early-warning signals, collections prioritisation, KYC triage, pricing assist.',
        confidence: 0.82,
        evidence: ['Top 5 deliver 71% of total scored value', 'All 5 have data readiness ≥ 3/5', '3 duplicate PoCs can be retired'],
        alternatives: ['Fund all 23 (₹19 Cr, low focus)', 'Fund top 3 only (miss ₹2.6 Cr value)'],
        financialImpact: '₹4.2 Cr investment → ₹12.8 Cr annual value', valueCr: 2.1, risk: 'Medium',
        owner: 'Suman (Strategy)', approver: 'CTO + Head of Lending', classification: 'Internal', policyCheck: 'Passed',
        sources: ['RAG · Use-case inventory', 'MCP · Portfolio tracker'],
      },
    ],
    controls: [
      { name: 'Consent capture & notice', regulation: 'DPDP Act 2023', coverage: 88, status: 'Partial' },
      { name: 'Data retention & erasure', regulation: 'DPDP Act 2023', coverage: 72, status: 'Partial' },
      { name: 'Breach reporting within 72 h', regulation: 'DPDP Rules 2025', coverage: 100, status: 'Compliant' },
      { name: 'Model risk management', regulation: 'RBI guidance', coverage: 91, status: 'Compliant' },
      { name: 'Human oversight of AI decisions', regulation: 'AI governance policy', coverage: 100, status: 'Compliant' },
      { name: 'AI explainability records', regulation: 'AI governance policy', coverage: 58, status: 'Gap' },
    ],
    agents: [
      { name: 'RegMapper', role: 'Circular → control mapping', status: 'Active', tasks: 214, accuracy: 91.4, mcp: 'Regulatory feed' },
      { name: 'Portfolio Scorer', role: 'Use-case ROI scoring', status: 'Active', tasks: 96, accuracy: 93.0, mcp: 'Portfolio tracker' },
      { name: 'RCA Investigator', role: 'Incident root cause', status: 'Active', tasks: 342, accuracy: 89.5, mcp: 'ITSM' },
      { name: 'TCO Analyst', role: 'Cloud vs on-prem cost', status: 'Training', tasks: 0, accuracy: 87.2, mcp: 'Finance ERP' },
      { name: 'Privacy Auditor', role: 'DPDP evidence collection', status: 'Active', tasks: 1530, accuracy: 93.7, mcp: 'Consent store' },
    ],
    ops: [
      { name: 'P1 incident MTTR', baseline: '6.2 h', current: '3.1 h', improvement: 50 },
      { name: 'Month-end batch overrun', baseline: '3.4 h', current: '1.2 h', improvement: 65 },
      { name: 'Repeat incidents / month', baseline: '18', current: '7', improvement: 61 },
      { name: 'Loan processing time', baseline: '9.5 d', current: '4.2 d', improvement: 56 },
    ],
    mcpConnectors: ['Core banking', 'Regulatory feed', 'ITSM', 'CRM', 'Consent store'],
    valueTrend: trend([1.8, 2.4, 3.1, 3.9, 4.6, 5.5], [1.4, 1.5, 1.6, 1.6, 1.7, 1.8]),
    capexOpex: [{ quarter: 'Q1', capex: 3.2, opex: 1.1 }, { quarter: 'Q2', capex: 4.1, opex: 1.5 }, { quarter: 'Q3', capex: 2.6, opex: 1.9 }, { quarter: 'Q4', capex: 1.8, opex: 2.2 }],
    alerts: [
      { level: 'Critical', text: 'AI explainability records below policy threshold (58%)', time: '10:25' },
      { level: 'Warning', text: 'Regulatory mapping: 2 clauses without evidence source', time: '09:58' },
      { level: 'Info', text: 'RCA Investigator resolved month-end batch contention', time: '09:30' },
    ],
  },

  // ───────────────────────────── MANUFACTURING ─────────────────────────────
  manufacturing: {
    id: 'manufacturing',
    name: 'Manufacturing',
    tagline: 'Efficiency · Scale · Innovation',
    kpis: { revenueImpact: 31.2, costSaved: 22.7, roi: 142, productivity: 81.6, compliance: 88 },
    maturity: { current: 2.9, target: 4.2, label: 'Data-Driven' },
    problems: {
      Strategy: {
        area: 'Strategy', title: 'Plant-wide AI readiness and roadmap',
        pain: 'Four plants at different digital maturity; AI pilots started where vendors pitched, not where value is.',
        rootCauses: ['No maturity baseline per plant', 'No shared roadmap or funding gates', 'Plant KPIs not comparable'],
        aiSolution: 'Assessment toolkit scores each plant; roadmap agent sequences use cases by value and readiness.',
        kpi: 'Plants with scored maturity baseline', baseline: '0 of 4', current: '3 of 4', target: '4 of 4', progress: 75, valueCr: 2.2, stage: 'Assess', health: 'On Track',
      },
      Operations: {
        area: 'Operations', title: 'ERP root cause for downtime; line and IT capacity',
        pain: 'Unplanned downtime and month-end ERP slowdowns; RCA takes days of manual log reading.',
        rootCauses: ['Machine, method, material, manpower, measurement and ERP data in separate systems', 'No capacity forecast for IT or lines', 'Fixes not fed back into SOPs'],
        aiSolution: 'RCA agent runs fishbone + 5 Whys over MES, ERP and quality data; engineer approves the fix.',
        kpi: 'RCA resolution time', baseline: '38 h', current: '9 h', target: '6 h', progress: 91, valueCr: 5.8, stage: 'Pilot', health: 'On Track',
      },
      Finance: {
        area: 'Finance', title: 'Machine and infrastructure CAPEX approval',
        pain: 'CAPEX requests take ~45 days to approve and rarely show payback against actual utilisation.',
        rootCauses: ['Requests on email and spreadsheets', 'Utilisation data not attached', 'No post-investment review'],
        aiSolution: 'CAPEX agent attaches utilisation, payback and alternatives to every request; Gate 4 reviews realised value.',
        kpi: 'CAPEX approval cycle time', baseline: '45 days', current: '21 days', target: '10 days', progress: 69, valueCr: 4.9, stage: 'Operate', health: 'On Track',
      },
      Governance: {
        area: 'Governance', title: 'Supplier and safety compliance evidence',
        pain: 'Audit preparation takes ~3 weeks; supplier certificates expire unnoticed.',
        rootCauses: ['Certificates stored in shared drives', 'Safety incidents logged on paper at 2 plants', 'No expiry alerts'],
        aiSolution: 'Evidence agent extracts certificates via RAG, tracks expiry and assembles audit packs automatically.',
        kpi: 'Audit preparation time', baseline: '15 days', current: '6 days', target: '2 days', progress: 69, valueCr: 1.4, stage: 'Pilot', health: 'At Risk',
      },
      Innovation: {
        area: 'Innovation', title: 'Predictive maintenance from sensor data',
        pain: 'Maintenance is calendar-based; critical presses fail between services.',
        rootCauses: ['IoT data not stored beyond 7 days', 'No failure labels to train on', 'OT network isolated from analytics'],
        aiSolution: 'CTO pattern: edge collection on OT network, anomaly model on local LLM/ML stack, work orders raised via MCP.',
        kpi: 'Unplanned downtime', baseline: '52 h/mo', current: '29 h/mo', target: '15 h/mo', progress: 62, valueCr: 6.4, stage: 'Pilot', health: 'On Track',
      },
    },
    initiatives: [
      { id: 'MFG-01', name: 'ERP RCA assistant', area: 'Operations', owner: 'Pankaj', stage: 'Pilot', investment: 1.9, value: 5.8, risk: 'Medium', progress: 66, status: 'On Track' },
      { id: 'MFG-02', name: 'Line & IT capacity planning', area: 'Operations', owner: 'Pankaj', stage: 'Design', investment: 2.7, value: 6.4, risk: 'Medium', progress: 40, status: 'On Track' },
      { id: 'MFG-03', name: 'Production workflow automation', area: 'Operations', owner: 'Pankaj', stage: 'Pilot', investment: 3.4, value: 9.1, risk: 'High', progress: 48, status: 'At Risk' },
      { id: 'MFG-04', name: 'Plant AI readiness roadmap', area: 'Strategy', owner: 'Suman', stage: 'Assess', investment: 0.6, value: 2.2, risk: 'Low', progress: 75, status: 'On Track' },
      { id: 'MFG-05', name: 'CAPEX approval with payback evidence', area: 'Finance', owner: 'Santhosh', stage: 'Operate', investment: 0.8, value: 4.9, risk: 'Low', progress: 100, status: 'On Track' },
      { id: 'MFG-06', name: 'Supplier & safety evidence automation', area: 'Governance', owner: 'Vaibhav', stage: 'Pilot', investment: 0.7, value: 1.4, risk: 'Medium', progress: 52, status: 'At Risk' },
      { id: 'MFG-07', name: 'Predictive maintenance', area: 'Innovation', owner: 'Ram', stage: 'Pilot', investment: 2.3, value: 6.4, risk: 'High', progress: 62, status: 'On Track' },
    ],
    decisions: [
      {
        id: 'MFG-D-001', title: 'Root cause: Line 3 defect spike', area: 'Operations',
        question: 'Why did Line 3 defects triple this week, and what is the fix?',
        recommendation: 'Recalibrate press P-07 and quarantine resin lot #4471; probable cause is temperature drift.',
        confidence: 0.84,
        evidence: ['Machine: defects correlate with P-07 temp > 212 °C (r = 0.78)', 'Material: spike began with resin lot #4471', 'Method: same fix resolved a 2025 incident'],
        alternatives: ['Replace P-07 heating element (₹35 L)', 'Slow line speed by 8% (throughput loss)'],
        financialImpact: '₹2.6 Cr/month scrap avoided', valueCr: 2.6, risk: 'Medium',
        owner: 'Pankaj (Operations)', approver: 'Plant Manager', classification: 'Internal', policyCheck: 'Passed',
        sources: ['MCP · MES', 'MCP · Quality system', 'RAG · Maintenance SOPs'],
      },
      {
        id: 'MFG-D-002', title: 'Approve CAPEX for CNC machine at Plant 2', area: 'Finance',
        question: 'Should we buy a ₹1.8 Cr CNC machine for Plant 2?',
        recommendation: 'Defer purchase; shift 30% of load to Plant 4 (62% utilised) and revisit in Q2.',
        confidence: 0.77,
        evidence: ['Plant 2 CNC utilisation 94%, Plant 4 62%', 'Transfer cost ₹9 L/quarter', 'Order growth forecast uncertain (±15%)'],
        alternatives: ['Buy now: ₹1.8 Cr, payback 2.6 years', 'Lease: ₹6 L/month'],
        financialImpact: '₹1.8 Cr CAPEX deferred; ₹36 L/yr transfer cost', valueCr: 1.4, risk: 'High',
        owner: 'Santhosh (Finance)', approver: 'CFO', classification: 'Confidential', policyCheck: 'Passed',
        sources: ['MCP · ERP fixed assets', 'MCP · MES utilisation', 'RAG · CAPEX policy'],
      },
    ],
    controls: [
      { name: 'Worker data privacy', regulation: 'DPDP Act 2023', coverage: 81, status: 'Partial' },
      { name: 'Quality traceability', regulation: 'ISO 9001', coverage: 95, status: 'Compliant' },
      { name: 'OT network security', regulation: 'IEC 62443', coverage: 69, status: 'Gap' },
      { name: 'Supplier certificate validity', regulation: 'Supplier policy', coverage: 74, status: 'Partial' },
      { name: 'Human oversight of AI decisions', regulation: 'AI governance policy', coverage: 100, status: 'Compliant' },
      { name: 'Agent action audit logs', regulation: 'AI governance policy', coverage: 84, status: 'Partial' },
    ],
    agents: [
      { name: 'RCA Investigator', role: 'Fishbone + 5 Whys', status: 'Active', tasks: 342, accuracy: 89.5, mcp: 'MES / ERP' },
      { name: 'Capacity Planner', role: 'Line & IT forecast', status: 'Active', tasks: 58, accuracy: 92.3, mcp: 'ERP' },
      { name: 'Work-Order Bot', role: 'Production workflow', status: 'Training', tasks: 0, accuracy: 85.0, mcp: 'MES' },
      { name: 'Evidence Collector', role: 'Supplier & safety evidence', status: 'Active', tasks: 610, accuracy: 94.1, mcp: 'Document store' },
      { name: 'Maintenance Predictor', role: 'Failure anomaly detection', status: 'Active', tasks: 4120, accuracy: 90.8, mcp: 'IoT historian' },
    ],
    ops: [
      { name: 'Overall equipment effectiveness', baseline: '64%', current: '76%', improvement: 19 },
      { name: 'RCA resolution time', baseline: '38 h', current: '9 h', improvement: 76 },
      { name: 'Unplanned downtime', baseline: '52 h/mo', current: '29 h/mo', improvement: 44 },
      { name: 'Scrap rate', baseline: '3.9%', current: '2.6%', improvement: 33 },
    ],
    mcpConnectors: ['ERP (SAP)', 'MES', 'Quality system', 'IoT historian', 'ITSM'],
    valueTrend: trend([1.2, 1.7, 2.5, 3.0, 3.8, 4.4], [1.1, 1.2, 1.3, 1.3, 1.4, 1.4]),
    capexOpex: [{ quarter: 'Q1', capex: 2.1, opex: 0.9 }, { quarter: 'Q2', capex: 2.8, opex: 1.2 }, { quarter: 'Q3', capex: 1.9, opex: 1.4 }, { quarter: 'Q4', capex: 1.5, opex: 1.6 }],
    alerts: [
      { level: 'Critical', text: 'OT network security control coverage at 69%', time: '11:02' },
      { level: 'Warning', text: '3 supplier certificates expire within 30 days', time: '10:14' },
      { level: 'Info', text: 'RCA Investigator resolved Line 3 defect spike', time: '09:41' },
    ],
  },

  // ──────────────────────── RETAIL (configuration only) ────────────────────────
  retail: {
    id: 'retail',
    name: 'Retail',
    tagline: 'Customer · Speed · Scale',
    configuredOnly: true,
    kpis: { revenueImpact: 18.4, costSaved: 9.6, roi: 118, productivity: 72.5, compliance: 83 },
    maturity: { current: 2.6, target: 3.8, label: 'Digitized' },
    problems: {
      Strategy: {
        area: 'Strategy', title: 'Store and e-commerce AI use-case portfolio',
        pain: 'Store ops and e-commerce run separate AI projects with overlapping vendors and no shared priorities.',
        rootCauses: ['Two P&Ls, two roadmaps', 'No shared customer KPI', 'Vendor-led pilots'],
        aiSolution: 'Same scoring agent as Banking, reused with a retail KPI library.',
        kpi: 'Use cases scored on one portfolio', baseline: '0%', current: '40%', target: '100%', progress: 40, valueCr: 3.1, stage: 'Assess', health: 'On Track',
      },
      Operations: {
        area: 'Operations', title: 'Festive-peak IT and fulfilment capacity',
        pain: 'Site slowdowns and warehouse backlogs during Diwali sale; peak capacity planned by gut feel.',
        rootCauses: ['No load forecast from marketing calendar', 'Warehouse slots planned manually', 'Incidents not analysed after peak'],
        aiSolution: 'Capacity agent (reused from Manufacturing) forecasts peak traffic and fulfilment load.',
        kpi: 'Peak-hour site uptime', baseline: '97.2%', current: '99.1%', target: '99.9%', progress: 70, valueCr: 5.2, stage: 'Pilot', health: 'On Track',
      },
      Finance: {
        area: 'Finance', title: 'Seasonal OPEX vs owned infrastructure',
        pain: 'Infrastructure is sized for peak all year; 60% idle outside festive season.',
        rootCauses: ['Owned servers sized for Diwali peak', 'No cost-per-order tracking', 'Cloud burst not approved'],
        aiSolution: 'TCO agent (reused from Banking) compares owned vs seasonal cloud burst.',
        kpi: 'Infra cost per 1,000 orders', baseline: '₹410', current: '₹340', target: '₹250', progress: 44, valueCr: 2.8, stage: 'Design', health: 'At Risk',
      },
      Governance: {
        area: 'Governance', title: 'Customer consent (DPDP) for personalisation',
        pain: 'Personalisation uses customer data without verifiable consent records.',
        rootCauses: ['Consent captured only at app sign-up', 'Store loyalty data has no consent flag', 'No erasure workflow'],
        aiSolution: 'Privacy agent (reused from Banking) checks consent before any personalisation call.',
        kpi: 'Personalisation calls with valid consent', baseline: '52%', current: '78%', target: '100%', progress: 54, valueCr: 1.2, stage: 'Pilot', health: 'At Risk',
      },
      Innovation: {
        area: 'Innovation', title: 'Demand forecasting and markdown pricing',
        pain: 'Markdowns decided late by category managers; stock-outs and excess stock in the same week.',
        rootCauses: ['Forecast at category, not SKU-store level', 'Weather and event signals unused', 'Markdown approval by email'],
        aiSolution: 'CTO pattern: SKU-store forecast model; markdown recommendations approved in the Decision Center.',
        kpi: 'Stock-out rate', baseline: '8.5%', current: '6.1%', target: '3.0%', progress: 44, valueCr: 6.1, stage: 'Pilot', health: 'On Track',
      },
    },
    initiatives: [
      { id: 'RTL-01', name: 'Unified AI use-case portfolio', area: 'Strategy', owner: 'Suman', stage: 'Assess', investment: 0.5, value: 3.1, risk: 'Low', progress: 40, status: 'On Track' },
      { id: 'RTL-02', name: 'Festive-peak capacity planning', area: 'Operations', owner: 'Pankaj', stage: 'Pilot', investment: 1.4, value: 5.2, risk: 'Medium', progress: 70, status: 'On Track' },
      { id: 'RTL-03', name: 'Seasonal cloud burst TCO', area: 'Finance', owner: 'Santhosh', stage: 'Design', investment: 0.6, value: 2.8, risk: 'Medium', progress: 44, status: 'At Risk' },
      { id: 'RTL-04', name: 'DPDP consent for personalisation', area: 'Governance', owner: 'Vaibhav', stage: 'Pilot', investment: 0.8, value: 1.2, risk: 'High', progress: 54, status: 'At Risk' },
      { id: 'RTL-05', name: 'Demand forecast & markdown pricing', area: 'Innovation', owner: 'Ram', stage: 'Pilot', investment: 1.9, value: 6.1, risk: 'Medium', progress: 44, status: 'On Track' },
    ],
    decisions: [
      {
        id: 'RTL-D-001', title: 'Festive-peak capacity for Diwali sale', area: 'Operations',
        question: 'How much IT and warehouse capacity do we need for the Diwali sale?',
        recommendation: 'Burst web tier to 3× for 10 days; add 2 temporary pick shifts at the Bhiwandi warehouse.',
        confidence: 0.81,
        evidence: ['Last Diwali peak: 4.2× normal traffic for 6 h', 'Marketing calendar: 3 flash sales planned', 'Warehouse backlog peaked at 31 h last year'],
        alternatives: ['Buy servers for peak (₹1.4 Cr, idle 10 months)', 'No change (est. ₹3 Cr lost sales)'],
        financialImpact: '₹22 L burst cost vs ₹3 Cr sales at risk', valueCr: 2.8, risk: 'Medium',
        owner: 'Pankaj (Operations)', approver: 'Head of E-commerce', classification: 'Internal', policyCheck: 'Passed',
        sources: ['MCP · E-commerce platform', 'MCP · Warehouse system', 'RAG · Peak runbook'],
      },
      {
        id: 'RTL-D-002', title: 'Approve markdown on winter range', area: 'Innovation',
        question: 'Should we mark down the winter range now, and by how much?',
        recommendation: '20% markdown on 140 SKUs in 38 southern stores; hold price in northern stores for 3 weeks.',
        confidence: 0.74,
        evidence: ['Southern stores: 11 weeks of cover vs 4 target', 'Weather forecast: warm December in south', 'Margin floor maintained at 22%'],
        alternatives: ['Chain-wide 15% markdown (₹45 L more margin loss)', 'Hold all prices (excess stock ₹2.1 Cr)'],
        financialImpact: '₹1.1 Cr stock released; margin above floor', valueCr: 1.1, risk: 'Medium',
        owner: 'Category manager', approver: 'Merchandising Director', classification: 'Confidential', policyCheck: 'Conditional',
        sources: ['MCP · POS', 'MCP · Inventory', 'RAG · Pricing & discount policy'],
      },
    ],
    controls: [
      { name: 'Personalisation consent', regulation: 'DPDP Act 2023', coverage: 78, status: 'Partial' },
      { name: 'Erasure on request', regulation: 'DPDP Act 2023', coverage: 61, status: 'Gap' },
      { name: 'Pricing & discount rules', regulation: 'Pricing policy', coverage: 96, status: 'Compliant' },
      { name: 'Payment data isolation', regulation: 'PCI DSS', coverage: 92, status: 'Compliant' },
      { name: 'Human oversight of AI decisions', regulation: 'AI governance policy', coverage: 100, status: 'Compliant' },
    ],
    agents: [
      { name: 'Portfolio Scorer', role: 'Use-case ROI scoring (reused)', status: 'Active', tasks: 41, accuracy: 93.0, mcp: 'Portfolio tracker' },
      { name: 'Capacity Planner', role: 'Peak forecast (reused)', status: 'Active', tasks: 22, accuracy: 90.4, mcp: 'E-commerce platform' },
      { name: 'TCO Analyst', role: 'Cloud burst cost (reused)', status: 'Idle', tasks: 8, accuracy: 87.2, mcp: 'Finance ERP' },
      { name: 'Privacy Auditor', role: 'Consent check (reused)', status: 'Active', tasks: 9800, accuracy: 95.2, mcp: 'Consent store' },
      { name: 'Demand Forecaster', role: 'SKU-store forecast', status: 'Training', tasks: 0, accuracy: 84.6, mcp: 'POS' },
    ],
    ops: [
      { name: 'Peak-hour site uptime', baseline: '97.2%', current: '99.1%', improvement: 68 },
      { name: 'Warehouse backlog at peak', baseline: '31 h', current: '14 h', improvement: 55 },
      { name: 'Stock-out rate', baseline: '8.5%', current: '6.1%', improvement: 28 },
      { name: 'Conversion rate', baseline: '2.1%', current: '2.6%', improvement: 24 },
    ],
    mcpConnectors: ['POS', 'E-commerce platform', 'Warehouse system', 'Consent store'],
    valueTrend: trend([0.6, 0.9, 1.3, 1.6, 2.1, 2.7], [0.7, 0.8, 0.8, 0.9, 0.9, 1.0]),
    capexOpex: [{ quarter: 'Q1', capex: 0.8, opex: 0.6 }, { quarter: 'Q2', capex: 0.9, opex: 0.8 }, { quarter: 'Q3', capex: 0.6, opex: 1.4 }, { quarter: 'Q4', capex: 0.4, opex: 1.1 }],
    alerts: [
      { level: 'Critical', text: 'Erasure-on-request control at 61% (DPDP)', time: '10:48' },
      { level: 'Warning', text: 'Diwali capacity decision awaiting approval', time: '10:05' },
      { level: 'Info', text: 'Retail domain pack activated — no code changes', time: '09:00' },
    ],
  },
}

export const domainOrder: DomainId[] = ['banking', 'manufacturing', 'retail']
export const plannedDomains = ['Healthcare', 'Insurance', 'Telecom', 'Energy']

export const team = [
  { name: 'Ram', area: 'CTO · AI Control Layer & Innovation' },
  { name: 'Suman', area: 'Strategy & Transformation' },
  { name: 'Santhosh', area: 'Finance & Investment Governance' },
  { name: 'Pankaj', area: 'Operations' },
  { name: 'Vaibhav', area: 'Regulatory & AI Governance' },
]

// Readiness of each area = average progress on that area's problem
export const areaScore = (d: DomainPack, a: Area) => d.problems[a].progress
export const overallScore = (d: DomainPack) => Math.round(areas.reduce((s, a) => s + d.problems[a].progress, 0) / areas.length)
