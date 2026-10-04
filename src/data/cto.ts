// Data for the CTO-dimension pages. Demo values — replace with the team's baseline.
import type { DomainId } from './domains'

// ── Strategy · current state → target state ──────────────────────────────
export const states: { area: string; current: Record<DomainId, string>; target: string }[] = [
  { area: 'AI investment', current: { banking: '23 ideas, each team funds its own pilot', manufacturing: 'Pilots where vendors pitched', retail: 'Store and online fund separately' }, target: 'One portfolio ranked by value and feasibility, funded gate by gate' },
  { area: 'Data', current: { banking: 'Consent in 4 systems; control register unlinked', manufacturing: 'MES, ERP and quality data in silos; IoT kept 7 days', retail: 'Loyalty data has no consent flag' }, target: 'Classified, owned data reached through governed MCP connectors' },
  { area: 'Technology', current: { banking: 'Point-to-point integrations to core', manufacturing: 'OT network isolated from analytics', retail: 'Servers sized for peak all year' }, target: 'One control layer: MCP, RAG, model router, ten-engine runtime' },
  { area: 'Governance', current: { banking: 'Circulars mapped by hand in ~3 weeks', manufacturing: 'Audit evidence assembled manually', retail: 'Personalisation without verifiable consent' }, target: 'Trust enforced before AI; every decision audited' },
  { area: 'People & ownership', current: { banking: 'No named owner for AI outputs', manufacturing: 'Plant heads approve by habit', retail: 'No owner for new AI ideas' }, target: 'Named owner and approver for every decision; AI CoE' },
  { area: 'Value', current: { banking: 'ROI claimed after the fact', manufacturing: 'Payback not reviewed after spend', retail: 'Pilots without baseline' }, target: 'Baseline before pilot; value realised tracked quarterly' },
]
export const maturityCurve = ['Traditional', 'Digitized', 'Data-driven', 'AI-assisted', 'Decision-intelligent', 'Self-improving']
export const curvePosition: Record<DomainId, { now: number; target: number }> = {
  banking: { now: 3, target: 4 }, manufacturing: { now: 2, target: 4 }, retail: { now: 1, target: 3 },
}

// ── Assessment · 5 dimensions × 3 questions (1–5) ────────────────────────
export const assessment: { dim: string; questions: { q: string; precondition?: string }[] }[] = [
  { dim: 'Strategy', questions: [{ q: 'AI initiatives are linked to named business objectives' }, { q: 'A named executive sponsor has allocated time', precondition: 'No executive sponsor with allocated time' }, { q: 'There is a funded, gated AI roadmap' }] },
  { dim: 'Data', questions: [{ q: 'Core decision inputs live in a system of record', precondition: 'Core decision inputs not in a system of record' }, { q: 'Data quality is measured and owned' }, { q: 'Data is classified (public → highly restricted)' }] },
  { dim: 'Technology', questions: [{ q: 'Systems expose APIs that agents could use' }, { q: 'A platform exists to run local and cloud models' }, { q: 'Identity, access and audit are in place' }] },
  { dim: 'Governance', questions: [{ q: 'Policies are documented well enough to encode', precondition: 'No documented policies to encode' }, { q: 'An AI risk and approval process exists' }, { q: 'Decisions leave an audit trail' }] },
  { dim: 'People', questions: [{ q: 'Decision owners understand how to challenge AI' }, { q: 'Each department can name 5 owned, recurring decisions', precondition: 'No department can name 5 owned decisions' }, { q: 'There is capacity for change and training' }] },
]
export const assessmentDefaults: Record<DomainId, number[][]> = {
  banking: [[4, 4, 3], [3, 3, 3], [4, 3, 4], [4, 4, 4], [3, 3, 3]],
  manufacturing: [[3, 3, 3], [3, 2, 3], [3, 3, 4], [3, 3, 3], [3, 3, 2]],
  retail: [[3, 3, 2], [3, 2, 2], [3, 3, 3], [3, 2, 2], [2, 3, 2]],
}
export const levelName = (s: number) => (s < 1.5 ? 'Traditional' : s < 2.5 ? 'Digitized' : s < 3.25 ? 'Data-driven' : s < 4 ? 'AI-assisted' : s < 4.6 ? 'Decision-intelligent' : 'Self-improving')

// ── Portfolio · value × feasibility (1–10) ───────────────────────────────
export type Verdict = 'Fund now' | 'Pilot' | 'Strategic bet' | 'Defer'
export interface UseCase { name: string; domain: DomainId; value: number; feasibility: number; valueCr: number; owner: string; verdict: Verdict }
export const useCases: UseCase[] = [
  { name: 'Regulatory circular mapping', domain: 'banking', value: 8, feasibility: 8, valueCr: 6.1, owner: 'Vaibhav', verdict: 'Fund now' },
  { name: 'Incident RCA on core banking', domain: 'banking', value: 6, feasibility: 8, valueCr: 4.1, owner: 'Pankaj', verdict: 'Fund now' },
  { name: 'Lending use-case portfolio', domain: 'banking', value: 9, feasibility: 7, valueCr: 12.8, owner: 'Suman', verdict: 'Fund now' },
  { name: 'KYC document triage', domain: 'banking', value: 7, feasibility: 5, valueCr: 2.9, owner: 'Suman', verdict: 'Pilot' },
  { name: 'Agentic actions on core banking', domain: 'banking', value: 8, feasibility: 3, valueCr: 5.0, owner: 'Ram', verdict: 'Strategic bet' },
  { name: 'ERP root-cause analysis', domain: 'manufacturing', value: 8, feasibility: 8, valueCr: 5.8, owner: 'Pankaj', verdict: 'Fund now' },
  { name: 'ERP + line capacity (DEC-OPS-001)', domain: 'manufacturing', value: 7, feasibility: 7, valueCr: 6.4, owner: 'Pankaj', verdict: 'Fund now' },
  { name: 'Predictive maintenance', domain: 'manufacturing', value: 9, feasibility: 5, valueCr: 6.4, owner: 'Ram', verdict: 'Pilot' },
  { name: 'CAPEX approval with payback', domain: 'manufacturing', value: 6, feasibility: 9, valueCr: 4.9, owner: 'Santhosh', verdict: 'Fund now' },
  { name: 'Digital twin of Line 3', domain: 'manufacturing', value: 7, feasibility: 2, valueCr: 3.0, owner: 'Ram', verdict: 'Strategic bet' },
  { name: 'Supplier certificate extraction', domain: 'manufacturing', value: 4, feasibility: 7, valueCr: 1.4, owner: 'Vaibhav', verdict: 'Pilot' },
  { name: 'Festive-peak capacity', domain: 'retail', value: 8, feasibility: 7, valueCr: 5.2, owner: 'Pankaj', verdict: 'Fund now' },
  { name: 'Demand forecasting & markdown', domain: 'retail', value: 9, feasibility: 5, valueCr: 6.1, owner: 'Ram', verdict: 'Pilot' },
  { name: 'Consent gate for personalisation', domain: 'retail', value: 5, feasibility: 8, valueCr: 1.2, owner: 'Vaibhav', verdict: 'Fund now' },
  { name: 'Seasonal cloud burst', domain: 'retail', value: 5, feasibility: 6, valueCr: 2.8, owner: 'Santhosh', verdict: 'Pilot' },
  { name: 'Generic chatbot for stores', domain: 'retail', value: 3, feasibility: 4, valueCr: 0.4, owner: '—', verdict: 'Defer' },
]

// ── Data readiness ───────────────────────────────────────────────────────
export type Integration = 'MCP live' | 'MCP in test' | 'Planned' | 'Batch only'
export interface DataSource { source: string; kind: 'Structured' | 'Documents' | 'Streaming'; owner: string; classification: 'Public' | 'Internal' | 'Confidential' | 'Restricted'; completeness: number; accuracy: number; timeliness: number; integration: Integration; feeds: string }
export const dataSources: Record<DomainId, DataSource[]> = {
  banking: [
    { source: 'Core banking (CBS)', kind: 'Structured', owner: 'Head of IT Ops', classification: 'Restricted', completeness: 96, accuracy: 94, timeliness: 90, integration: 'MCP in test', feeds: 'BNK-D-003 capacity' },
    { source: 'Loan origination', kind: 'Structured', owner: 'Head of Lending', classification: 'Confidential', completeness: 88, accuracy: 91, timeliness: 85, integration: 'Batch only', feeds: 'BNK-D-002 portfolio' },
    { source: 'ITSM incidents', kind: 'Structured', owner: 'Service delivery', classification: 'Internal', completeness: 92, accuracy: 86, timeliness: 98, integration: 'MCP live', feeds: 'RCA agent' },
    { source: 'Regulatory feed (RBI)', kind: 'Documents', owner: 'Compliance', classification: 'Public', completeness: 100, accuracy: 99, timeliness: 95, integration: 'MCP live', feeds: 'BNK-D-001 mapping' },
    { source: 'Control register', kind: 'Structured', owner: 'Compliance', classification: 'Internal', completeness: 78, accuracy: 82, timeliness: 60, integration: 'MCP in test', feeds: 'BNK-D-001 mapping' },
    { source: 'Consent store', kind: 'Structured', owner: 'DPO', classification: 'Restricted', completeness: 72, accuracy: 90, timeliness: 80, integration: 'Planned', feeds: 'DPDP evidence' },
    { source: 'Policy library', kind: 'Documents', owner: 'Knowledge engineer', classification: 'Internal', completeness: 81, accuracy: 95, timeliness: 70, integration: 'MCP live', feeds: 'RAG for all decisions' },
  ],
  manufacturing: [
    { source: 'SAP ERP', kind: 'Structured', owner: 'SAP basis lead', classification: 'Confidential', completeness: 94, accuracy: 92, timeliness: 88, integration: 'MCP in test', feeds: 'DEC-OPS-001, RCA' },
    { source: 'MES', kind: 'Structured', owner: 'MES lead', classification: 'Internal', completeness: 90, accuracy: 88, timeliness: 95, integration: 'MCP in test', feeds: 'MFG-D-001 RCA' },
    { source: 'Quality system', kind: 'Structured', owner: 'Quality head', classification: 'Internal', completeness: 85, accuracy: 93, timeliness: 80, integration: 'Batch only', feeds: 'MFG-D-001 RCA' },
    { source: 'IoT historian', kind: 'Streaming', owner: 'Maintenance head', classification: 'Internal', completeness: 62, accuracy: 89, timeliness: 99, integration: 'Planned', feeds: 'Predictive maintenance' },
    { source: 'Supplier certificates', kind: 'Documents', owner: 'Procurement', classification: 'Confidential', completeness: 74, accuracy: 85, timeliness: 55, integration: 'Planned', feeds: 'Compliance evidence' },
    { source: 'Maintenance SOPs', kind: 'Documents', owner: 'Knowledge engineer', classification: 'Internal', completeness: 88, accuracy: 94, timeliness: 75, integration: 'MCP live', feeds: 'RAG for RCA' },
    { source: 'Employee records (HRMS)', kind: 'Structured', owner: 'HR', classification: 'Restricted', completeness: 97, accuracy: 96, timeliness: 90, integration: 'Planned', feeds: 'Shift planning' },
  ],
  retail: [
    { source: 'POS', kind: 'Structured', owner: 'Store systems', classification: 'Internal', completeness: 86, accuracy: 92, timeliness: 85, integration: 'MCP in test', feeds: 'Demand forecast' },
    { source: 'E-commerce platform', kind: 'Structured', owner: 'E-com tech', classification: 'Confidential', completeness: 95, accuracy: 94, timeliness: 99, integration: 'MCP live', feeds: 'RTL-D-001 capacity' },
    { source: 'Warehouse system', kind: 'Structured', owner: 'Warehouse ops', classification: 'Internal', completeness: 88, accuracy: 87, timeliness: 90, integration: 'MCP in test', feeds: 'RTL-D-001 capacity' },
    { source: 'OMS / ERP', kind: 'Structured', owner: 'Retail systems', classification: 'Confidential', completeness: 91, accuracy: 83, timeliness: 78, integration: 'MCP live', feeds: 'Order sync RCA' },
    { source: 'Loyalty data', kind: 'Structured', owner: 'Loyalty manager', classification: 'Restricted', completeness: 80, accuracy: 76, timeliness: 70, integration: 'Planned', feeds: 'Personalisation (blocked)' },
    { source: 'Consent store', kind: 'Structured', owner: 'DPO', classification: 'Restricted', completeness: 78, accuracy: 92, timeliness: 85, integration: 'MCP live', feeds: 'Consent gate' },
    { source: 'Pricing & discount policy', kind: 'Documents', owner: 'Merchandising', classification: 'Internal', completeness: 60, accuracy: 95, timeliness: 65, integration: 'Planned', feeds: 'RTL-D-002 markdown' },
  ],
}
export const dataIssues: Record<DomainId, string[]> = {
  banking: ['Consent records split across 4 systems — DPDP evidence incomplete', 'Control register 78% complete — 2 clauses with no evidence source', 'Loan origination only in nightly batch — no live portfolio view'],
  manufacturing: ['IoT data kept 7 days — too short to train failure models', 'Quality data only via batch export', 'Supplier certificates in shared drives — no expiry field'],
  retail: ['Loyalty data has no consent flag — personalisation blocked', 'POS history missing for 9 northern stores', 'Pricing policy not yet ingested into RAG'],
}

// ── AI technique selection ───────────────────────────────────────────────
export type Technique = 'Rules (no AI)' | 'Classic ML' | 'GenAI' | 'RAG' | 'Agentic AI'
export const techniqueGuide: { t: Technique; when: string; avoid: string }[] = [
  { t: 'Rules (no AI)', when: 'Policy is explicit and must be applied the same way every time', avoid: 'Judgement or unstructured inputs are involved' },
  { t: 'Classic ML', when: 'Tabular or time-series data with history and labels — forecast, score, detect anomalies', avoid: 'No labelled history; answer must explain itself in words' },
  { t: 'GenAI', when: 'Read, summarise or draft from unstructured text', avoid: 'Exact numbers or facts must be guaranteed without sources' },
  { t: 'RAG', when: 'Answers must be grounded in approved enterprise documents and cite them', avoid: 'Knowledge base is not curated or access-controlled' },
  { t: 'Agentic AI', when: 'Multi-step work across several systems (via MCP), preparing a decision', avoid: 'Consequential actions without human approval; unbounded tools' },
]
export interface AiChoice { useCase: string; domain: DomainId | 'all'; techniques: Technique[]; why: string; notChosen: string; route: string; autonomy: 'Recommend only' | 'Draft for approval' | 'Bounded read-only actions' | 'Deterministic'; risk: 'Low' | 'Medium' | 'High' | 'Critical' }
export const aiChoices: AiChoice[] = [
  { useCase: 'Regulatory circular mapping', domain: 'banking', techniques: ['RAG', 'GenAI'], why: 'Text-heavy circulars; every mapping must cite clause and policy', notChosen: 'Classic ML — no labelled mappings; Agentic — no multi-system action needed', route: 'Cloud LLM (internal data)', autonomy: 'Draft for approval', risk: 'High' },
  { useCase: 'KYC document triage', domain: 'banking', techniques: ['GenAI'], why: 'Extract fields from varied scanned documents', notChosen: 'Cloud LLM — KYC is restricted personal data', route: 'Local LLM only', autonomy: 'Draft for approval', risk: 'High' },
  { useCase: 'Credit early-warning signals', domain: 'banking', techniques: ['Classic ML'], why: 'Tabular repayment history with labelled defaults', notChosen: 'GenAI — not suited to numeric risk scoring', route: 'Local ML model', autonomy: 'Recommend only', risk: 'High' },
  { useCase: 'Incident / ERP root-cause analysis', domain: 'all', techniques: ['Agentic AI', 'RAG'], why: 'Needs several steps across ITSM, logs, MES and ERP, with cited evidence', notChosen: 'Single GenAI prompt — cannot gather evidence across systems', route: 'Local LLM (confidential ERP data)', autonomy: 'Bounded read-only actions', risk: 'Medium' },
  { useCase: 'ERP capacity decision (DEC-OPS-001)', domain: 'manufacturing', techniques: ['Agentic AI', 'Classic ML'], why: 'Forecast load (ML), then assemble cost, policy and residency evidence (agent)', notChosen: 'Full autonomy — high-risk capital decision needs CFO + CIO', route: 'Local LLM + ML', autonomy: 'Recommend only', risk: 'High' },
  { useCase: 'Capacity forecasting', domain: 'all', techniques: ['Classic ML'], why: 'Time-series utilisation with seasonality', notChosen: 'GenAI — forecasts must be numeric and calibrated', route: 'Local ML model', autonomy: 'Recommend only', risk: 'Medium' },
  { useCase: 'Predictive maintenance', domain: 'manufacturing', techniques: ['Classic ML'], why: 'Sensor anomaly detection on streaming data', notChosen: 'GenAI — no value on raw sensor signals', route: 'Edge / local ML', autonomy: 'Recommend only', risk: 'Medium' },
  { useCase: 'Supplier certificate extraction', domain: 'manufacturing', techniques: ['GenAI', 'RAG'], why: 'Read PDFs, extract expiry and scope, cite the page', notChosen: 'Manual review — 3 weeks per audit', route: 'Cloud LLM with masking', autonomy: 'Draft for approval', risk: 'Low' },
  { useCase: 'Demand forecasting', domain: 'retail', techniques: ['Classic ML'], why: 'SKU-store sales history plus weather and events', notChosen: 'GenAI — forecasting is a numeric task', route: 'Cloud ML (internal data)', autonomy: 'Recommend only', risk: 'Medium' },
  { useCase: 'Markdown recommendation', domain: 'retail', techniques: ['Classic ML', 'GenAI'], why: 'Optimise markdown from forecast; GenAI explains the reason to the category manager', notChosen: 'Auto-pricing — margin floor needs human approval', route: 'Local LLM (confidential margins)', autonomy: 'Draft for approval', risk: 'Medium' },
  { useCase: 'Consent check before personalisation', domain: 'retail', techniques: ['Rules (no AI)'], why: 'DPDP consent is a yes/no rule that must never vary', notChosen: 'Any AI — a probabilistic consent check is not acceptable', route: 'Trust gateway rule', autonomy: 'Deterministic', risk: 'High' },
  { useCase: 'Initiative tracking (TrackerAgent)', domain: 'all', techniques: ['Agentic AI'], why: 'Reads project tools via MCP, raises escalations to humans', notChosen: 'Manual status reports — weekly and inconsistent', route: 'Cloud LLM (internal data)', autonomy: 'Bounded read-only actions', risk: 'Low' },
]

// ── Operating model ──────────────────────────────────────────────────────
export const raciRoles = ['CTO (Ram)', 'Strategy (Suman)', 'Finance (Santhosh)', 'Operations (Pankaj)', 'Governance (Vaibhav)', 'Domain business owner']
export const raci: { area: string; cells: string[] }[] = [
  { area: 'Business priority & ROI identification', cells: ['C', 'A/R', 'C', 'C', 'C', 'C'] },
  { area: 'Funding, OPEX/CAPEX, value realisation', cells: ['C', 'C', 'A/R', 'C', 'I', 'C'] },
  { area: 'Operational readiness & capacity need', cells: ['C', 'I', 'C', 'A/R', 'C', 'C'] },
  { area: 'Regulation, DPDP, responsible AI', cells: ['C', 'I', 'I', 'C', 'A/R', 'C'] },
  { area: 'Architecture, data, AI platform & agents', cells: ['A/R', 'C', 'C', 'C', 'C', 'I'] },
  { area: 'Business decision (approve / reject AI recommendation)', cells: ['I', 'I', 'C', 'C', 'C', 'A/R'] },
  { area: 'Gate approval (funding release)', cells: ['R', 'C', 'C', 'C', 'C (veto at G2/G3)', 'A'] },
]
export const coeTeam: { role: string; fte: string; source: 'Redeployed' | 'New' | 'Shared' }[] = [
  { role: 'Transformation lead (CTO)', fte: '0.5', source: 'Redeployed' },
  { role: 'Enterprise / AI architect', fte: '1', source: 'Redeployed' },
  { role: 'Security architect', fte: '0.5', source: 'Shared' },
  { role: 'Decision analyst', fte: '1', source: 'New' },
  { role: 'Knowledge engineer', fte: '0.5', source: 'New' },
  { role: 'Platform engineer', fte: '1–2', source: 'Redeployed' },
  { role: 'Domain champion (per domain)', fte: '3 × 0.3', source: 'Redeployed' },
]
export const training: { audience: string; topic: string; when: string }[] = [
  { audience: 'Executives & approvers', topic: 'Reading an AI recommendation; when to challenge, modify or escalate', when: 'Before shadow run' },
  { audience: 'Decision owners', topic: 'Decision catalogue, risk tiers, evidence and reason codes', when: 'Onboarding step 10' },
  { audience: 'Engineers', topic: 'MCP connectors, RAG with citations, bounded agents, audit logging', when: 'Sprint 1' },
  { audience: 'Everyone', topic: 'DPDP basics, data classification, responsible AI', when: 'Week 2' },
]

// ── Roadmap (weeks from programme start, 3 Aug 2026) ─────────────────────
export const currentWeek = 10
export const roadmapPhases: { name: string; start: number; end: number; lead: string; output: string; color: string }[] = [
  { name: 'Foundation', start: 1, end: 4, lead: 'Suman · Pankaj', output: 'Maturity baseline, use-case inventory, KPI baseline', color: 'bg-[#0b2a6b]' },
  { name: 'Design', start: 5, end: 8, lead: 'Ram · Vaibhav', output: 'Architecture, governance model, 5–10 decisions catalogued', color: 'bg-blue-700' },
  { name: 'Pilot (shadow)', start: 9, end: 12, lead: 'Ram · all', output: '3 decisions × 3 domains in shadow mode', color: 'bg-violet-600' },
  { name: 'Scale blueprint', start: 13, end: 16, lead: 'Santhosh · Suman', output: 'Benefits case, rollout to next department', color: 'bg-emerald-600' },
]
export const roadmapLanes: { lane: string; bars: { label: string; start: number; end: number; tone: string }[]; gates: { label: string; week: number }[] }[] = [
  { lane: 'Banking', bars: [{ label: 'Assess', start: 1, end: 3, tone: 'bg-slate-400' }, { label: 'Design', start: 4, end: 7, tone: 'bg-blue-500' }, { label: 'Build + shadow', start: 8, end: 13, tone: 'bg-violet-500' }], gates: [{ label: 'G1', week: 2 }, { label: 'G2', week: 7 }, { label: 'G3', week: 13 }] },
  { lane: 'Manufacturing', bars: [{ label: 'Assess', start: 1, end: 4, tone: 'bg-slate-400' }, { label: 'Design', start: 5, end: 8, tone: 'bg-blue-500' }, { label: 'Build + shadow', start: 9, end: 14, tone: 'bg-violet-500' }], gates: [{ label: 'G1', week: 3 }, { label: 'G2', week: 8 }, { label: 'G3', week: 14 }] },
  { lane: 'Retail (config)', bars: [{ label: 'Assess', start: 5, end: 8, tone: 'bg-slate-400' }, { label: 'Design', start: 9, end: 12, tone: 'bg-blue-500' }, { label: 'Shadow', start: 13, end: 16, tone: 'bg-violet-500' }], gates: [{ label: 'G1', week: 8 }, { label: 'G2', week: 11 }] },
]
export const milestones: { week: number; what: string; owner: string; done: boolean }[] = [
  { week: 1, what: 'Kick-off; decision owners confirmed', owner: 'Ram', done: true },
  { week: 2, what: 'Maturity assessment started', owner: 'Suman', done: true },
  { week: 4, what: 'KPI baseline captured — no value claimed before this', owner: 'Suman · Santhosh', done: true },
  { week: 8, what: 'First decisions catalogued and owner-signed', owner: 'Ram · Vaibhav', done: true },
  { week: 10, what: 'Shadow run started in Banking and Manufacturing', owner: 'Ram · Pankaj', done: true },
  { week: 12, what: 'Shadow pilot review at gate (day 90)', owner: 'All', done: false },
  { week: 16, what: 'Benefits case and next-department rollout', owner: 'Santhosh · Suman', done: false },
]

// ── CTO decisions ────────────────────────────────────────────────────────
export type CtoRole = 'Decides' | 'Co-approves' | 'Recommends to board' | 'Sets guardrail'
export const ctoDecisions: { decision: string; role: CtoRole; status: 'Decided' | 'Pending' | 'Upcoming'; when: string; outcome: string; why: string }[] = [
  { decision: 'Build vs buy', role: 'Decides', status: 'Decided', when: 'Week 6', outcome: 'Buy cloud, LLMs, vector DB, identity; build only the thin control layer', why: 'Commodity layers are cheaper to buy; the control layer is the differentiator' },
  { decision: 'Deployment model', role: 'Decides', status: 'Decided', when: 'Week 6', outcome: 'Hybrid — restricted data local, the rest may use cloud', why: 'DPDP residency plus access to frontier models' },
  { decision: 'Model routing policy', role: 'Sets guardrail', status: 'Decided', when: 'Week 7', outcome: 'Route on highest classification; unknown → local', why: 'Data leakage risk; routing is a control, not a preference' },
  { decision: 'Trust before AI', role: 'Sets guardrail', status: 'Decided', when: 'Week 5', outcome: 'No AI path live until the trust platform is enforcing (BL-04 before BL-05)', why: 'Retrofitting trust means revalidating every model' },
  { decision: 'LLM vendor strategy', role: 'Decides', status: 'Decided', when: 'Week 7', outcome: 'Multi-vendor behind a model router (local + Claude / Grok)', why: 'Avoid lock-in; exit strategy per EP-16' },
  { decision: 'Stop criteria for pilots', role: 'Sets guardrail', status: 'Decided', when: 'Week 8', outcome: 'Stop if no baseline by week 4, or shadow agreement < 70% after 8 weeks', why: 'Kill weak pilots early; protect sponsor trust' },
  { decision: 'DEC-OPS-001 ERP capacity (hybrid)', role: 'Co-approves', status: 'Pending', when: 'Week 11', outcome: 'Awaiting CFO + CIO approval in Decision Center', why: '₹1.06 Cr over 3 years; lowest-cost compliant option' },
  { decision: 'Matrix approver precedence (risk R-01)', role: 'Decides', status: 'Pending', when: 'Week 11', outcome: 'Precedence per decision type before onboarding matrixed teams', why: 'Prevents deadlock on cross-domain decisions' },
  { decision: 'Gate 3 go-live — Banking', role: 'Co-approves', status: 'Pending', when: 'Week 13', outcome: '2 of 5 criteria met', why: 'Shadow agreement 84%; UAT and rollback test outstanding' },
  { decision: 'Retail Gate 2', role: 'Co-approves', status: 'Pending', when: 'Week 11', outcome: 'Waiting for CISO sign-off on trust architecture (DS-05)', why: 'AI design cannot be accepted before trust design' },
  { decision: 'FIN-D-005 AI investment portfolio', role: 'Recommends to board', status: 'Upcoming', when: 'Week 16', outcome: 'Fund next wave based on value realised', why: 'Funding follows evidence, gate by gate' },
  { decision: 'Scale to next department', role: 'Recommends to board', status: 'Upcoming', when: 'After Gate 4', outcome: 'Only after value is validated', why: 'Measurable value before scale' },
]
export const ctoDoesNot = [
  'Approve individual business decisions — the named business owner does (AI recommends, humans decide)',
  'Override a CISO veto on trust architecture',
  'Claim value without a baseline',
  'Let any team bypass the trust gateway for speed',
]
