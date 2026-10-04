// TEDIF tracking data — follows the TEDIF v1.0 document top to bottom.
// Statuses are demo values aligned with the 90-day plan in the executive deck:
// "No production AI before day 90; three decisions in three domains in shadow mode."
import type { DomainId } from './domains'

export type St = 'D' | 'P' | 'T' // Done · In progress · To do
export const stLabel: Record<St, string> = { D: 'Done', P: 'In progress', T: 'Not started' }

// ── Summary ──────────────────────────────────────────────────────────────
export const summary: Record<DomainId, {
  phase: string; lastGate: string; nextGate: string; conformance: 'Aligned' | 'Partial' | 'Full'; rollout: number; note: string
}> = {
  banking: { phase: 'Phase 3 · Build', lastGate: 'Gate 2 · 16 Sep', nextGate: 'Gate 3 · Production go-live', conformance: 'Partial', rollout: 1, note: 'Trust platform enforcing; AI platform in shadow' },
  manufacturing: { phase: 'Phase 3 · Build', lastGate: 'Gate 2 · 22 Sep', nextGate: 'Gate 3 · Production go-live', conformance: 'Partial', rollout: 1, note: 'Flagship DEC-OPS-001 in shadow run' },
  retail: { phase: 'Phase 2 · Design', lastGate: 'Gate 1 · 25 Sep', nextGate: 'Gate 2 · Architecture approval', conformance: 'Aligned', rollout: 0, note: 'Added by configuration; DS-05 awaiting CISO sign-off' },
}

// ── Part 1 · Five principles ─────────────────────────────────────────────
export const principles: { name: string; test: string; status: Record<DomainId, St>; evidence: Record<DomainId, string> }[] = [
  {
    name: '1 · Business drives technology', test: 'Every initiative traces to a business objective (AS-02)',
    status: { banking: 'D', manufacturing: 'D', retail: 'D' },
    evidence: { banking: 'All 6 initiatives linked to objectives', manufacturing: 'All 7 initiatives linked', retail: 'All 5 initiatives linked' },
  },
  {
    name: '2 · Knowledge is the prime asset', test: 'Decisions use curated knowledge, not raw data (BL-03)',
    status: { banking: 'P', manufacturing: 'D', retail: 'T' },
    evidence: { banking: 'Policy library indexed; control register partial', manufacturing: 'SOPs and RCA history in RAG', retail: 'Pricing policy not yet ingested' },
  },
  {
    name: '3 · Trust before intelligence', test: 'Trust platform (BL-04) enforcing before AI (BL-05) runs',
    status: { banking: 'D', manufacturing: 'D', retail: 'P' },
    evidence: { banking: 'BL-04 enforcing; bypass test passed', manufacturing: 'BL-04 enforcing; bypass test passed', retail: 'DS-05 awaiting CISO — AI blocked until signed' },
  },
  {
    name: '4 · AI recommends, humans decide', test: 'Named approver on every decision; no auto-approval',
    status: { banking: 'D', manufacturing: 'D', retail: 'D' },
    evidence: { banking: '3/3 decisions have approver', manufacturing: '3/3 decisions have approver', retail: '3/3 decisions have approver' },
  },
  {
    name: '5 · Measurable value', test: 'KPI baseline captured before pilot (field 14)',
    status: { banking: 'D', manufacturing: 'D', retail: 'P' },
    evidence: { banking: 'Week-4 baseline captured', manufacturing: 'Week-4 baseline captured', retail: '2 of 3 KPI baselines captured' },
  },
]

// ── Part 1 · Decision chain ──────────────────────────────────────────────
export const chain = ['Business strategy', 'Capability', 'Process', 'Decision', 'Enterprise data', 'Knowledge', 'Trust layer', 'AI decision intelligence', 'Human accountability', 'Business outcome', 'Continuous learning']
export const chainReached: Record<DomainId, number> = { banking: 9, manufacturing: 9, retail: 5 } // number of links in place

// ── Part 2 · Lifecycle — 32 sections ─────────────────────────────────────
export const phases = ['Assess', 'Design', 'Build', 'Operate', 'Optimize'] as const
export const sections: { id: string; name: string; phase: typeof phases[number]; mvp?: boolean }[] = [
  { id: 'AS-01', name: 'Vision, mission & business model', phase: 'Assess' },
  { id: 'AS-02', name: 'Business strategy', phase: 'Assess' },
  { id: 'AS-03', name: 'Organization & leadership', phase: 'Assess' },
  { id: 'AS-04', name: 'Business capability', phase: 'Assess', mvp: true },
  { id: 'AS-05', name: 'Business process', phase: 'Assess' },
  { id: 'AS-06', name: 'Department', phase: 'Assess', mvp: true },
  { id: 'AS-07', name: 'Technology landscape', phase: 'Assess' },
  { id: 'AS-08', name: 'Enterprise data', phase: 'Assess', mvp: true },
  { id: 'AS-09', name: 'Security, governance & compliance', phase: 'Assess' },
  { id: 'AS-10', name: 'AI & digital maturity', phase: 'Assess' },
  { id: 'DS-01', name: 'Business operating model', phase: 'Design' },
  { id: 'DS-02', name: 'Organization & decision ownership', phase: 'Design', mvp: true },
  { id: 'DS-03', name: 'Enterprise architecture', phase: 'Design' },
  { id: 'DS-04', name: 'Data & knowledge architecture', phase: 'Design' },
  { id: 'DS-05', name: 'Enterprise trust architecture', phase: 'Design', mvp: true },
  { id: 'DS-06', name: 'AI & decision intelligence', phase: 'Design', mvp: true },
  { id: 'DS-07', name: 'Technology platform', phase: 'Design' },
  { id: 'DS-08', name: 'Transformation roadmap', phase: 'Design' },
  { id: 'BL-01', name: 'Foundation platform', phase: 'Build', mvp: true },
  { id: 'BL-02', name: 'Data platform', phase: 'Build' },
  { id: 'BL-03', name: 'Knowledge platform', phase: 'Build' },
  { id: 'BL-04', name: 'Trust platform', phase: 'Build', mvp: true },
  { id: 'BL-05', name: 'AI platform', phase: 'Build', mvp: true },
  { id: 'BL-06', name: 'Business applications', phase: 'Build', mvp: true },
  { id: 'BL-07', name: 'Integration & automation', phase: 'Build' },
  { id: 'BL-08', name: 'Testing, validation & go-live', phase: 'Build' },
  { id: 'OP-01', name: 'Department operations', phase: 'Operate' },
  { id: 'OP-02', name: 'Cross-functional decisions', phase: 'Operate' },
  { id: 'OP-03', name: 'Human-in-the-loop governance', phase: 'Operate', mvp: true },
  { id: 'OP-04', name: 'Operations & adoption', phase: 'Operate' },
  { id: 'OPT-01', name: 'Performance & value realization', phase: 'Optimize' },
  { id: 'OPT-02', name: 'Continuous learning', phase: 'Optimize', mvp: true },
]
// One character per section above, in order.
//                     AS(10)      DS(8)     BL(8)     OP  OPT
const secStatus: Record<DomainId, string> = {
  banking:       'DDDDDDDDDD' + 'DDDDDDDD' + 'DPPDPPTT' + 'TTTT' + 'TT',
  manufacturing: 'DDDDDDDDDD' + 'DDDDDDDD' + 'DPDDPPTT' + 'TTTT' + 'TT',
  retail:        'DDDDDDDDDD' + 'DDPPPTPT' + 'TTTTTTTT' + 'TTTT' + 'TT',
}
export const sectionStatus = (d: DomainId, i: number) => secStatus[d][i] as St

// ── Part 3 · Gates ───────────────────────────────────────────────────────
export type GateOutcome = 'Approved' | 'In review' | 'Not reached'
export const gates: { n: number; name: string; board: string; criteria: string[] }[] = [
  { n: 1, name: 'Executive assessment approval', board: 'CEO · Transformation Lead (CTO) · Sponsors', criteria: ['Assessment complete AS-01 … AS-10', 'Gap analysis approved by functional owners', 'Maturity baseline quantified', 'Objectives traceable to findings'] },
  { n: 2, name: 'Architecture & design approval', board: 'CTO · Architects · Sponsors · CISO', criteria: ['Architecture conformant to reference', 'DS-05 trust signed by CISO before DS-06 AI', 'Decision ownership (DS-02) assigned', 'Budget approved against roadmap (DS-08)', 'Waves, risks and metrics agreed'] },
  { n: 3, name: 'Production go-live', board: 'CTO · CISO · Business owners · Release board', criteria: ['BL-01 … BL-07 complete and tested', 'Security tested; BL-04 enforcing', 'AI validation passed (explainability, guardrails, HITL)', 'UAT signed off; performance met', 'Readiness certificate; rollback tested'] },
  { n: 4, name: 'Business value validation', board: 'Steering committee · CEO · CTO · Business leaders', criteria: ['KPIs achieved or trending to target', 'Adoption thresholds met', 'Decision audit trail complete', 'AI within bounds; overrides analysed', 'ROI positive vs Phase 1 baseline'] },
  { n: 5, name: 'Transformation board approval', board: 'Board · CEO · CTO', criteria: ['KPIs independently validated', 'ROI validated (OPT-01)', 'Lessons captured (OPT-02)', 'Improvements piloted before rollout', 'Next maturity level funded'] },
]
export const gateState: Record<DomainId, { outcome: GateOutcome; met: number; date?: string }[]> = {
  banking: [{ outcome: 'Approved', met: 4, date: '12 Aug' }, { outcome: 'Approved', met: 5, date: '16 Sep' }, { outcome: 'In review', met: 2 }, { outcome: 'Not reached', met: 0 }, { outcome: 'Not reached', met: 0 }],
  manufacturing: [{ outcome: 'Approved', met: 4, date: '19 Aug' }, { outcome: 'Approved', met: 5, date: '22 Sep' }, { outcome: 'In review', met: 2 }, { outcome: 'Not reached', met: 0 }, { outcome: 'Not reached', met: 0 }],
  retail: [{ outcome: 'Approved', met: 4, date: '25 Sep' }, { outcome: 'In review', met: 2 }, { outcome: 'Not reached', met: 0 }, { outcome: 'Not reached', met: 0 }, { outcome: 'Not reached', met: 0 }],
}

// ── Part 4 · Deliverables ────────────────────────────────────────────────
export const deliverables: { phase: typeof phases[number]; items: string[] }[] = [
  { phase: 'Assess', items: ['Current state assessment report', 'Enterprise maturity assessment', 'Readiness scorecard', 'Gap analysis report', 'Assessment repository'] },
  { phase: 'Design', items: ['Target state blueprint', 'Enterprise architecture', 'Reference architecture', 'Security blueprint', 'AI blueprint', 'Transformation roadmap'] },
  { phase: 'Build', items: ['TEDIF enterprise platform', 'Reference implementation', 'Integrated enterprise platform', 'Operational documentation', 'Production readiness certificate'] },
  { phase: 'Operate', items: ['Enterprise operations model', 'Decision repository', 'Executive dashboards', 'Operational reports', 'Business adoption report'] },
  { phase: 'Optimize', items: ['Enterprise performance report', 'Value realization report', 'Continuous improvement plan', 'Innovation roadmap', 'Next transformation roadmap'] },
]
//                   Assess  Design   Build   Operate Optimize
const delStatus: Record<DomainId, string> = {
  banking:       'DDDDD' + 'DDDDDD' + 'PPTTT' + 'TPPTT' + 'TTTTT',
  manufacturing: 'DDDDD' + 'DDDDDD' + 'PPTPT' + 'TPPTT' + 'TTTTT',
  retail:        'DDDDD' + 'PPDPTP' + 'TTTTT' + 'TTPTT' + 'TTTTT',
}
export const deliverableStatus = (d: DomainId, i: number) => delStatus[d][i] as St

// ── Part 5 · Decision catalogue (thin slice: 3 decisions × 3 domains) ────
export type DecStatus = 'Draft' | 'Catalogued' | 'Shadow' | 'Active' | 'Suspended' | 'Retired'
export const decisionLifecycle: DecStatus[] = ['Draft', 'Catalogued', 'Shadow', 'Active', 'Suspended', 'Retired']
export const tierOf = (risk: string) => (risk === 'Low' ? { tier: 1, fields: 10 } : risk === 'Medium' ? { tier: 2, fields: 15 } : { tier: 3, fields: 18 })

export interface CatalogueEntry { id: string; name: string; owner: string; approver: string; risk: 'Low' | 'Medium' | 'High' | 'Critical'; filled: number; status: DecStatus; frequency: 'High' | 'Medium' | 'Low' }
export const catalogue: Record<DomainId, CatalogueEntry[]> = {
  banking: [
    { id: 'BNK-D-001', name: 'Regulatory circular → control mapping', owner: 'Compliance manager', approver: 'Chief Compliance Officer', risk: 'High', filled: 18, status: 'Shadow', frequency: 'Medium' },
    { id: 'BNK-D-002', name: 'Fund lending AI use cases', owner: 'Suman (Strategy)', approver: 'CTO + Head of Lending', risk: 'Medium', filled: 15, status: 'Shadow', frequency: 'Low' },
    { id: 'BNK-D-003', name: 'Month-end core banking capacity', owner: 'Pankaj (Operations)', approver: 'CIO', risk: 'Medium', filled: 13, status: 'Catalogued', frequency: 'Medium' },
  ],
  manufacturing: [
    { id: 'DEC-OPS-001', name: 'ERP capacity expansion (flagship)', owner: 'Pankaj (Operations)', approver: 'CFO with CIO', risk: 'High', filled: 18, status: 'Shadow', frequency: 'Low' },
    { id: 'MFG-D-001', name: 'Line defect root cause', owner: 'Pankaj (Operations)', approver: 'Plant Manager', risk: 'Medium', filled: 15, status: 'Shadow', frequency: 'High' },
    { id: 'MFG-D-002', name: 'Machine CAPEX approval', owner: 'Santhosh (Finance)', approver: 'CFO', risk: 'High', filled: 18, status: 'Catalogued', frequency: 'Low' },
  ],
  retail: [
    { id: 'RTL-D-001', name: 'Festive-peak capacity', owner: 'Pankaj (Operations)', approver: 'Head of E-commerce', risk: 'Medium', filled: 15, status: 'Catalogued', frequency: 'Low' },
    { id: 'RTL-D-002', name: 'Markdown pricing approval', owner: 'Category manager', approver: 'Merchandising Director', risk: 'Medium', filled: 15, status: 'Catalogued', frequency: 'High' },
    { id: 'RTL-D-003', name: 'Personalisation consent check', owner: 'Vaibhav (Governance)', approver: 'DPO', risk: 'High', filled: 11, status: 'Draft', frequency: 'High' },
  ],
}
export const crossDomainDecision: CatalogueEntry = { id: 'FIN-D-005', name: 'AI investment portfolio (all domains)', owner: 'Santhosh (Finance)', approver: 'CFO → Board', risk: 'Critical', filled: 18, status: 'Catalogued', frequency: 'Low' }

// Status used by the Decision Center for each decision
export const decisionStatusById: Record<string, DecStatus> = Object.fromEntries(
  [...Object.values(catalogue).flat(), crossDomainDecision].map((c) => [c.id, c.status]),
)

// ── 5.5 · Department onboarding (12 steps) ───────────────────────────────
export const onboardingSteps = ['Department selection', 'Owner assigned', 'Objectives agreed', 'KPIs baselined', 'Decision catalogue built', 'Data mapping', 'Knowledge mapping', 'Policy mapping', 'Roles & permissions', 'Training & readiness', 'Shadow run', 'Department go-live']
export const onboarding: Record<DomainId, { dept: string; done: number }> = {
  banking: { dept: 'Compliance & lending ops', done: 10 },
  manufacturing: { dept: 'Plant 2 operations', done: 10 },
  retail: { dept: 'E-commerce operations', done: 5 },
}

// ── 5.5 · Shadow run ─────────────────────────────────────────────────────
export const shadow: Record<DomainId, { started: boolean; week: number; agreement: number; calibrationError: number; observations: number; supervised: string[] } > = {
  banking: { started: true, week: 3, agreement: 84, calibrationError: 7, observations: 126, supervised: ['BNK-D-002 (low frequency)'] },
  manufacturing: { started: true, week: 2, agreement: 78, calibrationError: 9, observations: 88, supervised: ['DEC-OPS-001 (low frequency)'] },
  retail: { started: false, week: 0, agreement: 0, calibrationError: 0, observations: 0, supervised: [] },
}

// ── 5.6 · Rollout ladder ─────────────────────────────────────────────────
export const rollout = ['Pilot — 1 team, 3–5 decisions', 'Department — full catalogue', 'Business unit — cross-functional', 'Region — local variation', 'Country — regulatory conformance', 'Enterprise — KPIs moving', 'Global — federated governance']

// ── 12.5 · Data classification → model routing ───────────────────────────
export const classification: { level: string; routing: string; examples: Record<DomainId, string> }[] = [
  { level: 'Public', routing: 'Cloud LLM permitted', examples: { banking: 'Published interest rates', manufacturing: 'Product catalogue', retail: 'Product listings' } },
  { level: 'Internal', routing: 'Cloud LLM with contract, no training use', examples: { banking: 'Ops metrics, circulars', manufacturing: 'OEE reports', retail: 'Store footfall' } },
  { level: 'Confidential', routing: 'Local preferred; cloud only if masked', examples: { banking: 'Lending pipeline', manufacturing: 'ERP data, supplier terms', retail: 'Margins, markdown plans' } },
  { level: 'Restricted', routing: 'Local LLM only · no egress', examples: { banking: 'Customer KYC (DPDP)', manufacturing: 'Employee records (DPDP)', retail: 'Customer profiles & consent (DPDP)' } },
  { level: 'Highly restricted', routing: 'Local only + extra approval', examples: { banking: 'Board & M&A matters', manufacturing: 'Product IP', retail: 'M&A, store expansion plans' } },
]

// ── Part 7 · 22 excellence practices ─────────────────────────────────────
export const practices = [
  'Enterprise governance', 'Architecture governance', 'AI governance', 'Data governance', 'Security governance', 'Policy management',
  'Compliance management', 'Risk & opportunity', 'Configuration mgmt', 'Change & release', 'Decision analysis (DAR)', 'Causal analysis (CAR)',
  'Quantitative perf. mgmt', 'Org. performance mgmt', 'Knowledge management', 'Supplier & vendor', 'Training & competency', 'QA & peer review',
  'Audit & traceability', 'Human accountability', 'Continuous measurement', 'Metrics repository',
]
// O = operating, P = partial, T = not started — one char per practice EP-01 … EP-22
const epStatus: Record<DomainId, string> = {
  banking:       'OOOOOO' + 'OOPOPT' + 'TTPPPP' + 'OOPT',
  manufacturing: 'OOOPOP' + 'POPOPP' + 'TTOPPP' + 'OOPT',
  retail:        'OOPPPP' + 'PPPTTT' + 'TTPTTT' + 'POTT',
}
export const practiceStatus = (d: DomainId, i: number) => ({ O: 'D', P: 'P', T: 'T' } as Record<string, St>)[epStatus[d][i]]

// ── 12.3 · Decision quality (from shadow run) ────────────────────────────
export const quality: Record<DomainId, { reinforce: number; accept: number; nearMiss: number; fix: number; challengeRate: number; challengeYield: number } | null> = {
  banking: { reinforce: 98, accept: 14, nearMiss: 6, fix: 8, challengeRate: 34, challengeYield: 62 },
  manufacturing: { reinforce: 64, accept: 11, nearMiss: 5, fix: 8, challengeRate: 18, challengeYield: 71 },
  retail: null,
}

// ── Part 15 · Success measures ───────────────────────────────────────────
export const measures: { name: string; target: string; values: Record<DomainId, string>; ok: Record<DomainId, boolean | null> }[] = [
  { name: 'Decisions with named owner & approver', target: '100%', values: { banking: '100%', manufacturing: '100%', retail: '100%' }, ok: { banking: true, manufacturing: true, retail: true } },
  { name: 'AI paths bypassing governance', target: '0', values: { banking: '0', manufacturing: '0', retail: 'n/a — AI blocked' }, ok: { banking: true, manufacturing: true, retail: null } },
  { name: 'Restricted-data egress events', target: '0', values: { banking: '0', manufacturing: '0', retail: '0' }, ok: { banking: true, manufacturing: true, retail: true } },
  { name: 'Decisions reconstructable from audit', target: '100%', values: { banking: '100%', manufacturing: '100%', retail: '—' }, ok: { banking: true, manufacturing: true, retail: null } },
  { name: 'Shadow-run agreement before go-live', target: '> 80%', values: { banking: '84%', manufacturing: '78%', retail: '—' }, ok: { banking: true, manufacturing: false, retail: null } },
  { name: 'Knowledge retrieval accuracy', target: '> 85%', values: { banking: '88%', manufacturing: '91%', retail: '—' }, ok: { banking: true, manufacturing: true, retail: null } },
  { name: 'Challenge yield (not approval rate)', target: 'High', values: { banking: '62%', manufacturing: '71%', retail: '—' }, ok: { banking: true, manufacturing: true, retail: null } },
  { name: 'Improvements piloted before rollout', target: '> 90%', values: { banking: '—', manufacturing: '—', retail: '—' }, ok: { banking: null, manufacturing: null, retail: null } },
]

// ── 12.4 · Failure patterns ──────────────────────────────────────────────
export type Watch = 'Clear' | 'Watch' | 'Triggered'
export const antiPatterns: { id: string; name: string; signal: string; status: Record<DomainId, Watch> }[] = [
  { id: 'AP-1', name: 'Skipping assessment', signal: 'No maturity baseline', status: { banking: 'Clear', manufacturing: 'Clear', retail: 'Clear' } },
  { id: 'AP-2', name: 'No decision catalogue', signal: '"What should we ask the AI?"', status: { banking: 'Clear', manufacturing: 'Clear', retail: 'Watch' } },
  { id: 'AP-3', name: 'Trust layer retrofitted', signal: 'Policy checks after inference', status: { banking: 'Clear', manufacturing: 'Clear', retail: 'Watch' } },
  { id: 'AP-4', name: 'Rubber-stamping', signal: 'Approval ~100%, challenge ~0', status: { banking: 'Clear', manufacturing: 'Watch', retail: 'Clear' } },
  { id: 'AP-5', name: 'Catalogue over-scoping', signal: 'Many decisions, none reach Active', status: { banking: 'Clear', manufacturing: 'Clear', retail: 'Clear' } },
]

// ── Part 16 · Open risk register ─────────────────────────────────────────
export const risks: { id: string; risk: string; severity: 'Critical' | 'High' | 'Medium'; mitigation: string; domains: string }[] = [
  { id: 'R-01', risk: 'Matrix approver conflict, no deterministic rule', severity: 'Critical', mitigation: 'Precedence rule declared per decision type before onboarding', domains: 'All — DEC-OPS-001 uses CFO with CIO' },
  { id: 'R-02', risk: 'One policy engine for rules and AI guardrails', severity: 'Critical', mitigation: 'Two evaluation phases (pre- and post-inference)', domains: 'All' },
  { id: 'R-03', risk: 'Preconditions fail (data, policies)', severity: 'High', mitigation: 'Pre-work as standalone project', domains: 'Retail' },
  { id: 'R-04', risk: 'Attempting full 32-section depth', severity: 'High', mitigation: 'MVP critical path; cycle-1 catalogue cap', domains: 'All' },
  { id: 'R-05', risk: 'Sponsor patience expires before Gate 4', severity: 'High', mitigation: 'Standalone value every 30 days', domains: 'All' },
  { id: 'R-06', risk: 'Conformance claims diluted', severity: 'Medium', mitigation: 'Evidence-based conformance levels', domains: 'All' },
  { id: 'R-07', risk: 'Regulatory timing shifts (DPDP)', severity: 'Medium', mitigation: 'Regulatory profiles kept separate', domains: 'Banking, Retail' },
  { id: 'R-08', risk: 'Permanent team becomes cost centre', severity: 'Medium', mitigation: 'Only TEDIF office + decision analyst permanent', domains: 'All' },
]
