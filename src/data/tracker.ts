// Programme Tracker — one plan, eight dimensions, nine role levels.
// Levels 1–6 are generated from the domain cascade; levels 7–9 are written out
// in full for the three flagship problems. Demo values — replace with real plans.
import type { DomainId, Health } from './domains'
import { domains } from './domains'
import { cascade, g } from './cascade'
import type { TrackPack } from './cascade'

export type Dim = 'Strategy' | 'ROI' | 'Finance' | 'Operations' | 'ERP' | 'AI' | 'Innovation' | 'Governance'
export const dims: Dim[] = ['Strategy', 'ROI', 'Finance', 'Operations', 'ERP', 'AI', 'Innovation', 'Governance']

export const roles = ['CTO', 'VP', 'AVP', 'Director', 'Delivery Head', 'Senior PM', 'PM', 'Tech Lead', 'Developer'] as const
export type Role = typeof roles[number]
// "View as" → how deep the tree opens by default for that role
export const viewDepth: Record<Role, number> = { CTO: 3, VP: 4, AVP: 5, Director: 6, 'Delivery Head': 6, 'Senior PM': 7, PM: 8, 'Tech Lead': 9, Developer: 9 }

// Problems exactly as written in the team notes (bp1 / bp2)
export const dimMeta: Record<Dim, { lead: string; notes: string[]; slug: string }> = {
  Strategy: { lead: 'Suman', notes: ['Transform any organization to AI'], slug: 'strategy' },
  ROI: { lead: 'Suman (identify) · Santhosh (realise)', notes: ['Identify ROI before investment', 'Prove value after spend'], slug: 'roi' },
  Finance: { lead: 'Santhosh', notes: ['Governance system for investment', 'Apps / resources / decision making — OPEX / CAPEX'], slug: 'finance' },
  Operations: { lead: 'Pankaj', notes: ['Capacity planning of infrastructure', 'Automation of the production management process'], slug: 'operations' },
  ERP: { lead: 'Pankaj', notes: ['ERP root-cause analysis (RCA)'], slug: 'erp' },
  AI: { lead: 'Ram', notes: ['AI + MCP agent implementation to track ongoing and new initiatives', 'Transparency of every AI recommendation'], slug: 'ai' },
  Innovation: { lead: 'Ram', notes: ['Domain-agnostic architecture reused across Banking, Manufacturing and Retail'], slug: 'innovation' },
  Governance: { lead: 'Vaibhav', notes: ['Automate regulatory change with implementation', 'DPDP / AI governance'], slug: 'governance' },
}
export const dimBySlug = Object.fromEntries(dims.map((d) => [dimMeta[d].slug, d])) as Record<string, Dim>

export interface Ai { mode: 'AI-assisted' | 'AI-recommended' | 'AI-generated draft'; agent: string; source: string; confidence: number; approver: string }
export interface Node {
  id: string
  level: number // 1 = CTO … 9 = Developer
  title: string
  detail?: string
  owner: string
  due?: string
  progress: number
  status: Health
  budget?: [number, number] // ₹ Cr planned, actual
  blocker?: string
  ai?: Ai
  children: Node[]
}

// ── Extra packs for dimensions not in the domain cascade ─────────────────
const erp: Record<DomainId, TrackPack> = {
  banking: {
    problem: 'Core banking and finance-ERP incidents recur; RCA is manual across ITSM, logs and change records',
    kpi: 'Repeat ERP incidents / month', baseline: '18', current: '7', target: '≤ 4', status: 'At Risk',
    initiatives: [
      { name: 'Incident RCA agent on ITSM', owner: 'Director, Service Delivery', progress: 74, status: 'On Track', ground: [
        g('ITSM connector', 'Integration lead', 'Status', 'Live', 'Live', 'On Track', 'ITSM MCP connector live (read-only)'),
        g('RCA agent', 'AI engineer', 'Shadow agreement', '84%', '> 80%', 'On Track', 'RCA agent shadow run on P1 incidents'),
      ] },
      { name: 'Month-end GL close stability', owner: 'Director, Finance Systems', progress: 55, status: 'At Risk', ground: [
        g('GL batch', 'Finance systems lead', 'Batch overrun', '1.2 h', '< 0.5 h', 'At Risk', 'Re-sequence GL and interest accrual jobs'),
      ] },
    ],
  },
  manufacturing: {
    problem: 'SAP ERP incidents recur and month-end slowdowns delay close; RCA takes days of manual log reading',
    kpi: 'Repeat ERP incidents / month', baseline: '14', current: '5', target: '≤ 2', status: 'At Risk',
    initiatives: [
      { name: 'ERP RCA assistant', owner: 'Director, Plant Systems', progress: 66, status: 'At Risk', ground: [
        g('MES + SAP connector', 'Integration lead', 'Status', 'In build', 'Live by week 6', 'At Risk', 'MES + SAP read-only MCP connector live'),
        g('RCA agent', 'AI engineer', 'Shadow agreement', '78%', '> 80%', 'At Risk', 'RCA agent shadow run on Plant 2'),
        g('SAP basis', 'SAP basis lead', 'Repeat incidents', '5', '≤ 2', 'At Risk', 'Fix month-end lock contention'),
      ] },
      { name: 'Month-end ERP capacity (DEC-OPS-001)', owner: 'Director, Infrastructure', progress: 40, status: 'Delayed', ground: [
        g('ERP servers', 'Infra lead', 'Month-end CPU', '96%', '< 80%', 'Delayed', 'Hybrid capacity after CFO + CIO approval'),
        g('Storage', 'Storage admin', 'Peak IOPS headroom', '18%', '> 30%', 'At Risk', 'Tier month-end tables to SSD'),
      ] },
    ],
  },
  retail: {
    problem: 'Order-management to ERP sync fails at sale peaks; stock and finance postings drift',
    kpi: 'Order sync failures at peak', baseline: '2.4%', current: '0.9%', target: '< 0.3%', status: 'At Risk',
    initiatives: [
      { name: 'OMS–ERP sync RCA', owner: 'Director, Retail Systems', progress: 52, status: 'At Risk', ground: [
        g('OMS connector', 'Integration lead', 'Status', 'Live', 'Live', 'On Track', 'OMS + ERP read-only MCP connector'),
        g('Retry queue', 'Platform engineer', 'Failed posts recovered', '82%', '100%', 'At Risk', 'Idempotent retry for failed postings'),
      ] },
      { name: 'Inventory sync reliability', owner: 'Director, Supply Chain IT', progress: 45, status: 'On Track', ground: [
        g('Store stock feed', 'Store systems lead', 'Sync lag', '22 min', '< 5 min', 'At Risk', 'Event-based stock updates'),
      ] },
    ],
  },
}

const ai: Record<DomainId, TrackPack> = {
  banking: {
    problem: 'Ongoing and new AI initiatives are not tracked; no single view of agents, approvals and outcomes',
    kpi: 'AI initiatives tracked by agents', baseline: '0%', current: '83%', target: '100%', status: 'On Track',
    initiatives: [
      { name: 'TrackerAgent across initiatives', owner: 'Director, AI Platform', progress: 70, status: 'On Track', ground: [
        g('Project tools connector', 'Integration lead', 'Initiatives synced', '5 of 6', '6 of 6', 'On Track', 'Sync Jira + portfolio tracker via MCP'),
        g('New initiative intake', 'PMO analyst', 'Intake form live', 'Yes', 'Yes', 'On Track', 'Every new idea gets owner + KPI on day 1'),
      ] },
      { name: 'AI transparency & audit', owner: 'Director, AI Governance', progress: 64, status: 'At Risk', ground: [
        g('Decision audit', 'Platform engineer', 'Decisions with full audit', '100%', '100%', 'On Track', 'Audit write blocks execution'),
        g('Explainability records', 'AI engineer', 'Recommendations with sources', '58%', '100%', 'Delayed', 'Store cited sources per recommendation'),
      ] },
    ],
  },
  manufacturing: {
    problem: 'Plant AI pilots run in isolation; no agent tracks status, risks or value across plants',
    kpi: 'AI initiatives tracked by agents', baseline: '0%', current: '71%', target: '100%', status: 'On Track',
    initiatives: [
      { name: 'TrackerAgent across plants', owner: 'Director, AI Platform', progress: 65, status: 'On Track', ground: [
        g('Project tools connector', 'Integration lead', 'Initiatives synced', '5 of 7', '7 of 7', 'On Track', 'Connect plant project trackers'),
        g('Escalation rules', 'AI engineer', 'Threshold alerts', 'Live', 'Live', 'On Track', 'Capacity threshold → human decision'),
      ] },
      { name: 'AI transparency & audit', owner: 'Director, AI Governance', progress: 70, status: 'On Track', ground: [
        g('Agent action log', 'Platform engineer', 'Agent actions logged', '84%', '100%', 'At Risk', 'Log every MCP tool call'),
      ] },
    ],
  },
  retail: {
    problem: 'Store and e-commerce AI efforts are invisible to each other; new ideas start without an owner',
    kpi: 'AI initiatives tracked by agents', baseline: '0%', current: '60%', target: '100%', status: 'At Risk',
    initiatives: [
      { name: 'TrackerAgent (reused)', owner: 'Director, Digital PMO', progress: 50, status: 'At Risk', ground: [
        g('Project tools connector', 'Integration lead', 'Initiatives synced', '3 of 5', '5 of 5', 'At Risk', 'Reuse banking connector config'),
        g('New initiative intake', 'PMO analyst', 'Intake form live', 'No', 'Yes', 'Delayed', 'Launch intake before Diwali freeze'),
      ] },
    ],
  },
}

const packFor = (dim: Dim, d: DomainId): TrackPack =>
  dim === 'ERP' ? erp[d] : dim === 'AI' ? ai[d] : cascade[d].tracks[dim]

// Which agent supports each dimension (for AI transparency)
const agentFor: Record<Dim, { agent: string; source: string }> = {
  Strategy: { agent: 'Portfolio Scorer', source: 'RAG · use-case inventory' },
  ROI: { agent: 'Value Tracker', source: 'MCP · finance ERP' },
  Finance: { agent: 'TCO Analyst', source: 'MCP · finance ERP' },
  Operations: { agent: 'Capacity Planner', source: 'MCP · monitoring / MES' },
  ERP: { agent: 'RCA Investigator', source: 'MCP · ERP + ITSM logs' },
  AI: { agent: 'TrackerAgent', source: 'MCP · project tools' },
  Innovation: { agent: 'Architecture Assistant', source: 'RAG · reference architecture' },
  Governance: { agent: 'RegMapper', source: 'MCP · regulatory feed · RAG · policy library' },
}

// ── Levels 7–9 for the three flagship problems ───────────────────────────
type Deep = { pm: Omit<Node, 'level' | 'children'>; leads: (Omit<Node, 'level' | 'children'> & { tasks: Omit<Node, 'level' | 'children'>[] })[] }
const deep: Partial<Record<string, { initiative: number; milestone: number; plan: Deep }>> = {
  'ERP:manufacturing': {
    initiative: 0, milestone: 0,
    plan: {
      pm: { id: 'pm', title: 'Sprint 4 — RCA agent integration', owner: 'PM, Plant Systems', due: 'Week 8', progress: 78, status: 'At Risk', blocker: 'SAP read access for service account pending (security ticket open)' },
      leads: [
        { id: 'tl1', title: 'Epic: SAP + MES MCP connector (read-only tools)', detail: 'Decision record: no write tools until Gate 3', owner: 'Tech Lead, Integration', due: 'Week 6', progress: 70, status: 'At Risk',
          tasks: [
            { id: 't1', title: 'Map SAP work-order and downtime fields', owner: 'Developer', due: 'Week 5', progress: 100, status: 'On Track', detail: '5 pts · merged' },
            { id: 't2', title: 'Parse MES alarm logs into events', owner: 'Developer', due: 'Week 6', progress: 80, status: 'On Track', detail: '8 pts · PR in review' },
            { id: 't3', title: 'Contract test: no write tools exposed', owner: 'Developer', due: 'Week 6', progress: 40, status: 'At Risk', detail: '3 pts · blocked on SAP access' },
          ] },
        { id: 'tl2', title: 'Epic: 5-Whys reasoning with cited evidence', detail: 'Every root cause cites log lines and work orders', owner: 'Tech Lead, AI', due: 'Week 8', progress: 60, status: 'On Track',
          ai: { mode: 'AI-generated draft', agent: 'RCA Investigator', source: 'RAG · maintenance SOPs', confidence: 0.84, approver: 'Plant engineer' },
          tasks: [
            { id: 't4', title: 'Build 50-case RCA evaluation set', owner: 'Developer', due: 'Week 7', progress: 60, status: 'On Track', detail: '5 pts' },
            { id: 't5', title: 'Prompt + RAG over SOPs; cite sources', owner: 'Developer', due: 'Week 8', progress: 50, status: 'On Track', detail: '8 pts',
              ai: { mode: 'AI-assisted', agent: 'Coding assistant', source: 'Repository', confidence: 0.9, approver: 'Tech Lead review' } },
          ] },
      ],
    },
  },
  'Governance:banking': {
    initiative: 0, milestone: 0,
    plan: {
      pm: { id: 'pm', title: 'Sprint 3 — circular to implemented control', owner: 'PM, Compliance Tech', due: 'Week 7', progress: 65, status: 'At Risk', blocker: '2 clauses have no evidence source in the control register' },
      leads: [
        { id: 'tl1', title: 'Epic: Regulatory-feed MCP server', owner: 'Tech Lead, Integration', due: 'Week 5', progress: 100, status: 'On Track',
          tasks: [
            { id: 't1', title: 'Ingest RBI circular PDFs and metadata', owner: 'Developer', due: 'Week 4', progress: 100, status: 'On Track', detail: '5 pts · merged' },
            { id: 't2', title: 'Clause splitter with citations', owner: 'Developer', due: 'Week 5', progress: 100, status: 'On Track', detail: '8 pts · merged' },
          ] },
        { id: 'tl2', title: 'Epic: Control update workflow with CCO approval', detail: 'AI drafts mapping; Chief Compliance Officer approves; evidence filed', owner: 'Tech Lead, Workflow', due: 'Week 8', progress: 45, status: 'At Risk',
          ai: { mode: 'AI-recommended', agent: 'RegMapper', source: 'RAG · policy library', confidence: 0.79, approver: 'Chief Compliance Officer' },
          tasks: [
            { id: 't3', title: 'Approval screen: approve / modify / escalate', owner: 'Developer', due: 'Week 7', progress: 70, status: 'On Track', detail: '5 pts' },
            { id: 't4', title: 'Evidence filing to audit store', owner: 'Developer', due: 'Week 8', progress: 20, status: 'At Risk', detail: '5 pts · waiting on evidence sources' },
          ] },
      ],
    },
  },
  'Governance:retail': {
    initiative: 0, milestone: 1,
    plan: {
      pm: { id: 'pm', title: 'Sprint 2 — consent gate before personalisation', owner: 'PM, Customer Data', due: 'Week 6', progress: 40, status: 'Delayed', blocker: 'Loyalty system has no consent flag; vendor change request pending' },
      leads: [
        { id: 'tl1', title: 'Epic: Consent check in the trust gateway', detail: 'No consent → no personalisation call (deny by default)', owner: 'Tech Lead, Platform', due: 'Week 6', progress: 55, status: 'At Risk',
          tasks: [
            { id: 't1', title: 'Consent lookup API (cached)', owner: 'Developer', due: 'Week 5', progress: 90, status: 'On Track', detail: '5 pts · PR in review' },
            { id: 't2', title: 'Block personalisation when consent missing', owner: 'Developer', due: 'Week 6', progress: 30, status: 'At Risk', detail: '3 pts' },
          ] },
        { id: 'tl2', title: 'Epic: Loyalty data consent backfill', owner: 'Tech Lead, Data', due: 'Week 9', progress: 15, status: 'Delayed',
          tasks: [
            { id: 't3', title: 'Add consent flag to loyalty schema', owner: 'Developer', due: 'Week 7', progress: 0, status: 'Delayed', detail: '3 pts · blocked by vendor' },
            { id: 't4', title: 'Re-consent SMS campaign list (masked)', owner: 'Developer', due: 'Week 9', progress: 10, status: 'At Risk', detail: '5 pts',
              ai: { mode: 'AI-assisted', agent: 'Privacy Auditor', source: 'MCP · consent store', confidence: 0.95, approver: 'Data protection officer' } },
          ] },
      ],
    },
  },
}
export const isFlagship = (dim: Dim, d: DomainId) => !!deep[`${dim}:${d}`]

// ── Tree builder ─────────────────────────────────────────────────────────
const round1 = (n: number) => Math.round(n * 10) / 10

export function buildTree(dim: Dim, d: DomainId): Node {
  const p = packFor(dim, d)
  const dn = domains[d].name
  const a = agentFor[dim]
  const fl = deep[`${dim}:${d}`]

  const directors: Node[] = p.initiatives.map((ini, ii) => {
    const plan = round1(0.8 + ((ini.name.length * 7) % 30) / 10)
    const actual = round1(plan * (ini.progress / 100) * (ini.status === 'On Track' ? 0.95 : 1.12))
    const milestones: Node[] = ini.ground.map((gr, gi) => {
      const node: Node = {
        id: `${dim}-${d}-${ii}-${gi}`, level: 6, title: gr.action, detail: `${gr.unit}: ${gr.metric} ${gr.actual} → ${gr.target}`,
        owner: `Senior PM · ${gr.owner}`, due: `Week ${5 + gi * 2 + ii}`, progress: gr.status === 'On Track' ? 80 : gr.status === 'At Risk' ? 50 : 20, status: gr.status, children: [],
      }
      if (fl && fl.initiative === ii && fl.milestone === gi) {
        const { pm, leads } = fl.plan
        node.children = [{
          ...pm, id: `${node.id}-pm`, level: 7,
          children: leads.map((tl) => ({
            ...tl, id: `${node.id}-${tl.id}`, level: 8,
            children: tl.tasks.map((t) => ({ ...t, id: `${node.id}-${tl.id}-${t.id}`, level: 9, children: [] })),
          })),
        }]
      }
      return node
    })
    const delivery: Node = {
      id: `${dim}-${d}-${ii}-del`, level: 5, title: `Delivery plan · Release 1 — ${ini.name}`,
      detail: `${ini.ground.length} milestones · team capacity ${ini.status === 'On Track' ? '84' : '96'}%`,
      owner: `Delivery Head, ${dn}`, due: `Week ${10 + ii}`, progress: ini.progress, status: ini.status, children: milestones,
    }
    return {
      id: `${dim}-${d}-${ii}`, level: 4, title: ini.name, owner: ini.owner, due: `Week ${12 + ii}`,
      progress: ini.progress, status: ini.status, budget: [plan, actual],
      ai: { mode: 'AI-assisted', agent: a.agent, source: a.source, confidence: 0.8 + ((ii * 3) % 10) / 100, approver: ini.owner },
      children: [delivery],
    }
  })

  const budget = directors.reduce<[number, number]>((s, n) => [round1(s[0] + n.budget![0]), round1(s[1] + n.budget![1])], [0, 0])
  const progress = Math.round(directors.reduce((s, n) => s + n.progress, 0) / directors.length)
  const avp: Node = { id: `${dim}-${d}-avp`, level: 3, title: `${dim} sub-programme · ${dn}`, detail: p.problem, owner: `AVP ${dim}, ${dn}`, progress, status: p.status, budget, children: directors }
  const vp: Node = { id: `${dim}-${d}-vp`, level: 2, title: `${dim} programme`, detail: `KPI: ${p.kpi} · ${p.baseline} → ${p.current} → ${p.target}`, owner: `VP ${dim}`, progress, status: p.status, budget, children: [avp] }
  return {
    id: `${dim}-${d}-cto`, level: 1, title: p.problem, detail: `Outcome KPI: ${p.kpi} — target ${p.target}`, owner: `CTO · lead ${dimMeta[dim].lead}`,
    due: 'Day 90 gate', progress, status: p.status, budget, children: [vp],
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────
export const flatten = (n: Node, path: Node[] = []): { node: Node; path: Node[] }[] =>
  [{ node: n, path }, ...n.children.flatMap((c) => flatten(c, [...path, n]))]

const rank: Record<Health, number> = { 'On Track': 0, 'At Risk': 1, Delayed: 2 }
export const worstBelow = (n: Node): Health | null => {
  let w: Health | null = null
  for (const c of n.children) {
    for (const h of [c.status, worstBelow(c)]) if (h && (!w || rank[h] > rank[w])) w = h
  }
  return w
}

// ── Dimension extras (close the gaps found in the team notes) ────────────
export const maturity5: Record<DomainId, { dim: string; score: number }[]> = {
  banking: [{ dim: 'Strategy', score: 3.8 }, { dim: 'Data', score: 3.1 }, { dim: 'Technology', score: 3.6 }, { dim: 'Governance', score: 3.9 }, { dim: 'People', score: 2.8 }],
  manufacturing: [{ dim: 'Strategy', score: 3.0 }, { dim: 'Data', score: 2.6 }, { dim: 'Technology', score: 3.2 }, { dim: 'Governance', score: 2.9 }, { dim: 'People', score: 2.7 }],
  retail: [{ dim: 'Strategy', score: 2.7 }, { dim: 'Data', score: 2.4 }, { dim: 'Technology', score: 3.0 }, { dim: 'Governance', score: 2.2 }, { dim: 'People', score: 2.5 }],
}
export const roiByQuarter: Record<DomainId, { q: string; identified: number; realised: number }[]> = {
  banking: [{ q: 'Q1', identified: 4.2, realised: 1.1 }, { q: 'Q2', identified: 7.8, realised: 3.4 }, { q: 'Q3', identified: 10.6, realised: 6.2 }, { q: 'Q4', identified: 12.8, realised: 8.9 }],
  manufacturing: [{ q: 'Q1', identified: 3.1, realised: 0.9 }, { q: 'Q2', identified: 6.4, realised: 2.8 }, { q: 'Q3', identified: 9.2, realised: 5.1 }, { q: 'Q4', identified: 12.2, realised: 7.4 }],
  retail: [{ q: 'Q1', identified: 1.2, realised: 0.2 }, { q: 'Q2', identified: 2.9, realised: 0.8 }, { q: 'Q3', identified: 4.8, realised: 1.6 }, { q: 'Q4', identified: 6.1, realised: 2.3 }],
}
export const appPortfolio: Record<DomainId, { app: string; owner: string; funding: 'OPEX' | 'CAPEX'; costCr: number; decision: 'Keep' | 'Expand' | 'Review' | 'Retire' }[]> = {
  banking: [
    { app: 'Core banking platform', owner: 'Pankaj', funding: 'CAPEX', costCr: 6.5, decision: 'Review' },
    { app: 'Regulatory feed service', owner: 'Vaibhav', funding: 'OPEX', costCr: 0.4, decision: 'Keep' },
    { app: 'Legacy reporting', owner: 'Santhosh', funding: 'OPEX', costCr: 0.9, decision: 'Retire' },
    { app: 'AI model hosting', owner: 'Ram', funding: 'OPEX', costCr: 0.7, decision: 'Review' },
  ],
  manufacturing: [
    { app: 'ERP platform (SAP)', owner: 'Pankaj', funding: 'CAPEX', costCr: 1.06, decision: 'Expand' },
    { app: 'MES', owner: 'Pankaj', funding: 'OPEX', costCr: 0.8, decision: 'Review' },
    { app: 'Paper-based EHS logs', owner: 'Vaibhav', funding: 'OPEX', costCr: 0.1, decision: 'Retire' },
    { app: 'AI model hosting', owner: 'Ram', funding: 'OPEX', costCr: 0.5, decision: 'Keep' },
  ],
  retail: [
    { app: 'Owned peak servers', owner: 'Pankaj', funding: 'CAPEX', costCr: 1.4, decision: 'Retire' },
    { app: 'Cloud burst capacity', owner: 'Santhosh', funding: 'OPEX', costCr: 0.22, decision: 'Expand' },
    { app: 'Order management system', owner: 'Pankaj', funding: 'OPEX', costCr: 0.6, decision: 'Keep' },
    { app: 'Personalisation engine', owner: 'Vaibhav', funding: 'OPEX', costCr: 0.3, decision: 'Review' },
  ],
}
export const capacity: Record<DomainId, { name: string; used: number }[]> = {
  banking: [{ name: 'Core banking DB', used: 88 }, { name: 'Month-end batch window', used: 92 }, { name: 'Storage', used: 64 }, { name: 'Branch network', used: 51 }],
  manufacturing: [{ name: 'ERP servers', used: 96 }, { name: 'Storage', used: 82 }, { name: 'Line 1', used: 94 }, { name: 'Line 2', used: 71 }, { name: 'Line 3', used: 63 }],
  retail: [{ name: 'Web tier (peak)', used: 91 }, { name: 'Checkout API', used: 86 }, { name: 'Bhiwandi warehouse', used: 97 }, { name: 'Bengaluru DC', used: 74 }],
}
export const automationSteps: Record<DomainId, { step: string; state: 'Automated' | 'In pilot' | 'Planned' }[]> = {
  banking: [{ step: 'Loan application intake', state: 'Automated' }, { step: 'KYC verification', state: 'In pilot' }, { step: 'Credit memo draft', state: 'In pilot' }, { step: 'Sanction approval', state: 'Planned' }, { step: 'Disbursal', state: 'Planned' }],
  manufacturing: [{ step: 'Order intake', state: 'Automated' }, { step: 'Scheduling', state: 'Automated' }, { step: 'Material check', state: 'Automated' }, { step: 'Quality release', state: 'Planned' }, { step: 'Dispatch', state: 'Planned' }],
  retail: [{ step: 'Order capture', state: 'Automated' }, { step: 'Stock allocation', state: 'In pilot' }, { step: 'Pick & pack', state: 'In pilot' }, { step: 'Returns', state: 'Planned' }, { step: 'Refund', state: 'Planned' }],
}
export const rcaPipeline: Record<DomainId, number[]> = { banking: [42, 38, 31, 27], manufacturing: [36, 33, 26, 21], retail: [24, 19, 13, 9] } // raised, analysed, confirmed, fix approved
export const regPipeline: Record<DomainId, { label: string; counts: number[] }> = {
  banking: { label: 'RBI circulars', counts: [14, 12, 7, 5] },
  manufacturing: { label: 'Safety & supplier rules', counts: [9, 8, 5, 4] },
  retail: { label: 'DPDP & consumer rules', counts: [6, 5, 2, 1] },
} // received, impact mapped, controls updated (implemented), evidence filed
export const dpdp: Record<DomainId, { obligation: string; status: 'Covered' | 'Partial' | 'Gap' }[]> = {
  banking: [{ obligation: 'Consent', status: 'Covered' }, { obligation: 'Purpose limitation', status: 'Covered' }, { obligation: 'Retention', status: 'Partial' }, { obligation: 'Breach report in 72 h', status: 'Covered' }, { obligation: 'Data residency', status: 'Covered' }],
  manufacturing: [{ obligation: 'Consent (employees)', status: 'Partial' }, { obligation: 'Purpose limitation', status: 'Covered' }, { obligation: 'Retention', status: 'Partial' }, { obligation: 'Breach report in 72 h', status: 'Covered' }, { obligation: 'Data residency', status: 'Gap' }],
  retail: [{ obligation: 'Consent', status: 'Partial' }, { obligation: 'Purpose limitation', status: 'Partial' }, { obligation: 'Retention / erasure', status: 'Gap' }, { obligation: 'Breach report in 72 h', status: 'Covered' }, { obligation: 'Data residency', status: 'Covered' }],
}
