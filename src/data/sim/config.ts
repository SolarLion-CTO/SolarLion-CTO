// Shape of a hand-written domain configuration. Indices refer to positions in the same config,
// the builder turns them into canonical IDs (APP-BNK-017 …) and calculates every health/status.
import type { AppLifecycle, ControlStatus, FunctionId, Severity } from './model'

export interface Plan {
  runCostCr: number; cloudPct: number; legacyApps: number; eolTech: number; redundantCostCr: number
  deploysPerWeek: number; leadTimeDays: number; p1Per90d: number
}
type Crit = 'M' | 'B' | 'O' | 'A'
export interface DomainConfig {
  code: string; org: string; capabilities: string[]; plan: Plan
  // name, outcome, sponsor, tech owner, priority, target date
  objectives: [string, string, string, string, Severity, string][]
  initiatives: {
    name: string; obj: number; sponsor: string; owner: string; start: string; target: string
    budget: number; forecastPct: number; progress: number; planned: number; roi: number; value: number
    realizedPct: number; apps: number[]; deps?: number[]
  }[]
  // name, version, vendor, eolDate|null
  tech: [string, string, string, string | null][]
  // name, capability idx, criticality, lifecycle, techHealth, fit, cost ₹Cr, users, hosting, cloud, stack, tech idx, depends-on app idx, owner, business owner, customer-facing, legacyId?
  apps: [string, number, Crit, AppLifecycle, number, number, number, number, 'On-premise' | 'Private cloud' | 'Public cloud' | 'SaaS' | 'Hybrid', string, string, number[], number[], string, string, boolean, string?][]
  // name, owner, unit, cycle, target, conformance, automation, exception %, bottleneck, business impact, app idx, opportunity, stage
  processes: [string, string, 'h' | 'd' | 'min', number, number, number, number, number, string, string, number[], string, 'Discover' | 'Model' | 'Improve' | 'Automate' | 'Monitor'][]
  // name, program, initiative idx, PM, budget, forecast %, start, planned end, slip days, progress, planned progress, demand FTE, capacity FTE, milestones due, late, team idx, app idx
  projects: [string, string, number, string, number, number, string, string, number, number, number, number, number, number, number, number[], number[]][]
  // name, product, manager, engineers, initiative idx, roadmap %, unplanned %, tech-debt %, deploys/wk, lead days, predictability %, capacity gap %, app idx
  teams: [string, string, string, number, number, number, number, number, number, number, number, number, number[]][]
  // name, app idx, stress 0..1 (drives incidents), latency target ms, requests/min, cost ₹Cr/yr, team idx, latency multiplier at stress
  services: [string, number, number, number, number, number, number][]
  rootCauses: string[]
  // control template idx → framework (default ISO 27001)
  frameworks: Record<number, string>
  // control template idx → [status, exceptions, app idx]
  controlOverrides: Record<number, [ControlStatus, number, number[]]>
  // title, category, likelihood 1-5, impact 1-5, owner, mitigation, due, app idx|null, initiative idx|null, business impact
  baselineRisks: [string, 'Technology' | 'Cyber' | 'Delivery' | 'Regulatory' | 'Vendor' | 'Data & AI' | 'Operational', number, number, string, string, string, number | null, number | null, string][]
  // per function: metric key → [current, target, value 12 months ago]
  business: Partial<Record<FunctionId, Record<string, [number, number, number]>>>
  stories: { title: string; initiative: number; apps: number[]; process: number; project: number; team: number; service: number; control: number }[]
}
