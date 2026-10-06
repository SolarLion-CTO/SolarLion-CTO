// CTO360 canonical enterprise model — every simulated source system is normalised into these entities.
// SIMULATED ENTERPRISE DATA. No live vendor integrations exist.
import type { DomainId } from '../domains'
export type { DomainId }

export type SourceId = 'planview' | 'leanix' | 'process' | 'servicenow' | 'jellyfish' | 'datadog' | 'vanta' | 'business'
export type Rag = 'Green' | 'Amber' | 'Red'
export type Severity = 'Critical' | 'High' | 'Medium' | 'Low'

/** Fields every canonical entity carries (spec 1 §12). `health` is always calculated, never typed. */
export interface Entity {
  id: string
  name: string
  domain: DomainId
  owner: string
  status: string
  health: Rag
  source: SourceId
  updated: string // ISO timestamp
  why: string[] // reasons behind the health — shown as "why amber/red"
}

// ── Strategy & Portfolio (Planview-style) ──────────────────────────────
export interface Objective extends Entity {
  outcome: string; sponsor: string; priority: Severity; targetDate: string
  progress: number; investmentCr: number; expectedValueCr: number; realizedValueCr: number
  risk: Severity; initiativeIds: string[]
}
export interface Initiative extends Entity {
  objectiveId: string; sponsor: string; start: string; target: string
  budgetCr: number; actualCr: number; forecastCr: number
  progress: number; plannedProgress: number; expectedRoi: number
  expectedValueCr: number; valueRealizedCr: number
  risk: Severity; appIds: string[]; dependsOn: string[]
  projectIds: string[]; teamIds: string[]; processIds: string[]
}

// ── Enterprise Architecture (LeanIX-style) ─────────────────────────────
export type Criticality = 'Mission critical' | 'Business critical' | 'Business operational' | 'Administrative'
export type AppLifecycle = 'Strategic' | 'Invest' | 'Maintain' | 'Migrate' | 'Retire'
export interface Application extends Entity {
  capability: string; criticality: Criticality; businessOwner: string; lifecycle: AppLifecycle
  techHealth: number; functionalFit: number; annualCostCr: number; users: number
  hosting: 'On-premise' | 'Private cloud' | 'Public cloud' | 'SaaS' | 'Hybrid'; cloud: string; stack: string
  techIds: string[]; dependsOn: string[]; recommendation: string; usesEol: boolean; customerFacing: boolean
  legacyId?: string // link to the earlier resilience demo data (e.g. BNK-APP-01)
}
export type TechLifecycle = 'Current' | 'Mainstream' | 'Extended support' | 'End of life'
export interface Technology extends Entity {
  version: string; vendor: string; lifecycle: TechLifecycle; eolDate: string | null
  appIds: string[]; criticality: Severity
}

// ── Process Intelligence (Celonis + Signavio-style) ────────────────────
export interface Process extends Entity {
  unit: 'h' | 'd' | 'min'; cycleTime: number; targetCycleTime: number
  conformance: number; automationRate: number; exceptionRate: number
  bottleneck: string; businessImpact: string; appIds: string[]; opportunity: string
  stage: 'Discover' | 'Model' | 'Improve' | 'Automate' | 'Monitor' // transformation pipeline (Signavio-style)
  series: number[] // cycle time, 12 months
}

// ── Portfolio & Workflow (ServiceNow SPM-style) ────────────────────────
export interface Project extends Entity {
  program: string; initiativeId: string; businessUnit: string; sponsor: string; pm: string
  budgetCr: number; actualCr: number; forecastCr: number
  start: string; plannedEnd: string; forecastEnd: string
  progress: number; plannedProgress: number; demandFte: number; capacityFte: number
  milestonesDue: number; milestonesLate: number; teamIds: string[]; appIds: string[]
  risk: Severity
}

// ── Engineering Intelligence (Jellyfish-style; team level, never individuals) ──
export interface Team extends Entity {
  product: string; manager: string; engineers: number; initiativeId: string
  allocation: { roadmap: number; unplanned: number; techDebt: number; keepTheLightsOn: number } // % sums to 100
  deploysPerWeek: number; leadTimeDays: number; cycleTimeDays: number; prThroughput: number
  wip: number; predictability: number; capacityGap: number // % below what the plan needs
  appIds: string[]; debtSeries: number[]
}

// ── Operations & Observability (Datadog-style) ─────────────────────────
export interface Service extends Entity {
  appId: string; capability: string; environment: 'Production'
  availability: number; slo: number; latencyMs: number; latencyTargetMs: number
  errorRate: number; requestsPerMin: number; incidents30: number; p1_30: number
  mttrH: number; sloCompliance: number; costCrYr: number; teamId: string
  availabilitySeries: number[]
}
export interface Incident {
  id: string; domain: DomainId; severity: 'P1' | 'P2' | 'P3' | 'P4'; serviceId: string
  start: string; durationMin: number; rootCause: string; businessImpact: string
  customersImpacted: number; owner: string; resolution: string; relatedChange: string | null
  status: 'Resolved' | 'Open'; source: 'datadog'
}

// ── Security, Risk & Governance (Vanta-style) ──────────────────────────
export interface Risk extends Entity {
  category: 'Technology' | 'Cyber' | 'Delivery' | 'Regulatory' | 'Vendor' | 'Data & AI' | 'Operational'
  businessImpact: string; techImpact: string; likelihood: number; impact: number; severity: Severity
  mitigation: string; due: string; appId: string | null; initiativeId: string | null; controlIds: string[]
  origin: string // the simulated condition that raised it, e.g. "Control CTL-BNK-004 failing"
  openedDays: number // remediation aging
}
export type ControlStatus = 'Passing' | 'Failing' | 'Exception' | 'Not tested'
export interface Control extends Entity {
  framework: string; control: string; controlStatus: ControlStatus; evidence: string
  lastTested: string; nextReview: string; exceptions: number; appIds: string[]
}

// ── Functions & metrics (spec 2) ───────────────────────────────────────
export type FunctionId =
  | 'technology' | 'architecture' | 'engineering' | 'data-ai' | 'cyber' | 'product'
  | 'strategy' | 'finance' | 'operations' | 'sales' | 'marketing' | 'cx' | 'hr' | 'risk' | 'legal' | 'procurement'
export type HeatCol = 'strategy' | 'performance' | 'cost' | 'technology' | 'risk' | 'transformation'
export interface Metric {
  id: string; key: string; functionId: FunctionId; col: HeatCol; name: string; unit: string
  current: number; target: number; previous: number; better: 'up' | 'down'
  variancePct: number; trend: 'Improving' | 'Stable' | 'Worsening'; status: Rag; score: number
  owner: string; source: SourceId; updated: string; series: number[]; forecast: number[]
  bounded: boolean // a true 0–100 percentage
  derived: boolean // true = calculated from entities, false = simulated business figure
}

export interface DomainData {
  domain: DomainId; code: string; org: string; capabilities: string[]
  objectives: Objective[]; initiatives: Initiative[]; applications: Application[]; technologies: Technology[]
  processes: Process[]; projects: Project[]; teams: Team[]; services: Service[]; incidents: Incident[]
  risks: Risk[]; controls: Control[]; metrics: Metric[]
  stories: Story[]
}

/** A hand-written executive story: one chain across the layers (spec 1 §11, §21). */
export interface Story {
  id: string; title: string
  initiativeId: string; appIds: string[]; processId: string; projectId: string
  teamId: string; serviceId: string; controlId: string; riskId?: string
}

export const SIM_NOW = '2026-10-06T09:30:00+05:30'
export const MONTHS = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'] // Nov 2025 → Oct 2026 (current)
export const FORECAST_MONTHS = ['Nov', 'Dec', 'Jan']
