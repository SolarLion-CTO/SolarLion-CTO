// Function context (M4): which simulated records belong to each enterprise function, and what they add up to —
// business / technology / financial impact, initiatives, open issues, recommended actions and dependencies.
// Everything is derived from the canonical records, so it changes when the data changes.
import type { Application, Control, DomainData, FunctionId, Initiative, Process, Project, Rag, Risk, Service, Team, Technology } from './model'
import { FUNCTIONS } from './functions'
import { functionHealth } from './scores'

export interface Scope { apps: Application[]; services: Service[]; processes: Process[]; initiatives: Initiative[]; projects: Project[]; teams: Team[]; risks: Risk[]; controls: Control[]; tech: Technology[] }

const has = (s: string, words: string[]) => words.some((w) => s.toLowerCase().includes(w))
const CUSTOMER_PROC = ['customer', 'onboarding', 'return', 'refund', 'dispute', 'click', 'closure', 'order', 'delivery', 'kyc']
const DATA_AI = ['data', 'ai ', 'fraud', 'predictive', 'forecast', 'personal', 'vision', 'recommend', 'aml', 'twin', 'analytics']

export function scope(d: DomainData, fn: FunctionId): Scope {
  const A = d.applications, S = d.services, P = d.processes, R = d.risks, C = d.controls
  const cf = A.filter((a) => a.customerFacing)
  const svcOf = (apps: Application[]) => S.filter((s) => apps.some((a) => a.id === s.appId))
  const cyberFw = (c: Control) => !/AI policy|DPDP/.test(c.framework)
  let apps: Application[] = [], services: Service[] = [], processes: Process[] = [], risks: Risk[] = [], controls: Control[] = [], tech: Technology[] = [], teams: Team[] = []
  switch (fn) {
    case 'technology': apps = A; services = S; tech = d.technologies.filter((t) => t.lifecycle !== 'Current'); risks = R.filter((r) => r.category === 'Technology' || r.category === 'Operational'); break
    case 'architecture': apps = A; tech = d.technologies; risks = R.filter((r) => r.category === 'Technology'); break
    case 'engineering': teams = d.teams; risks = R.filter((r) => r.category === 'Delivery'); break
    case 'data-ai': apps = A.filter((a) => has(`${a.name} ${a.capability} `, DATA_AI)); services = svcOf(apps); risks = R.filter((r) => r.category === 'Data & AI'); controls = C.filter((c) => /AI/.test(c.framework)); break
    case 'cyber': controls = C.filter(cyberFw); risks = R.filter((r) => r.category === 'Cyber' || r.controlIds.some((id) => controls.some((c) => c.id === id))); break
    case 'product': apps = A.filter((a) => a.lifecycle === 'Invest' || a.lifecycle === 'Strategic'); break
    case 'strategy': break
    case 'finance': apps = A.filter((a) => a.lifecycle === 'Retire' || a.lifecycle === 'Migrate'); risks = R.filter((r) => r.category === 'Vendor'); break
    case 'operations': processes = P; services = S.filter((s) => s.health !== 'Green'); risks = R.filter((r) => r.category === 'Operational'); break
    case 'sales': apps = cf; services = svcOf(cf); processes = P.filter((p) => has(p.name, ['order', 'loan', 'onboarding', 'sales', 'cash'])); break
    case 'marketing': apps = cf.filter((a) => has(`${a.name} ${a.capability}`, ['loyalty', 'customer', 'digital', 'mobile', 'personal', 'portal', 'e-commerce', 'storefront'])); services = svcOf(apps); controls = C.filter((c) => /consent/i.test(c.control)); break
    case 'cx': apps = cf; services = svcOf(cf); processes = P.filter((p) => has(p.name, CUSTOMER_PROC)); break
    case 'hr': teams = d.teams; risks = R.filter((r) => has(r.name, ['skill', 'people', 'key-person', 'capacity'])); break
    case 'risk': risks = R; controls = C; break
    case 'legal': controls = C.filter((c) => /DPDP|AI policy|RBI|PCI/.test(c.framework)); risks = R.filter((r) => r.category === 'Regulatory' || r.category === 'Vendor'); break
    case 'procurement': tech = d.technologies; apps = A.filter((a) => a.hosting === 'SaaS'); risks = R.filter((r) => r.category === 'Vendor'); break
  }
  const appIds = new Set(apps.map((a) => a.id))
  const initiatives = fn === 'strategy' || fn === 'finance' ? d.initiatives
    : fn === 'engineering' || fn === 'hr' ? d.initiatives.filter((i) => teams.some((t) => t.initiativeId === i.id))
    : fn === 'risk' || fn === 'cyber' || fn === 'legal' ? d.initiatives.filter((i) => risks.some((r) => r.initiativeId === i.id) || i.appIds.some((a) => controls.some((c) => c.appIds.includes(a))))
    : fn === 'operations' ? d.initiatives.filter((i) => i.processIds.some((p) => processes.some((x) => x.id === p)))
    : d.initiatives.filter((i) => i.appIds.some((a) => appIds.has(a)))
  const initIds = new Set(initiatives.map((i) => i.id))
  const projects = d.projects.filter((p) => initIds.has(p.initiativeId))
  return { apps, services, processes, initiatives, projects, teams, risks, controls, tech }
}

const cr = (n: number) => `₹${Math.round(n * 10) / 10} Cr`
const sum = <T,>(xs: T[], f: (x: T) => number) => xs.reduce((s, x) => s + f(x), 0)

export function impact(d: DomainData, sc: Scope) {
  const svcIds = new Set(sc.services.map((s) => s.id))
  const inc = d.incidents.filter((i) => svcIds.has(i.serviceId) && (i.severity === 'P1' || i.severity === 'P2'))
  const belowSlo = sc.services.filter((s) => s.availability < s.slo)
  const redInit = sc.initiatives.filter((i) => i.health !== 'Green')
  const business: string[] = [], technology: string[] = [], financial: string[] = []
  if (belowSlo.length) business.push(`${belowSlo.length} service(s) below SLO: ${belowSlo.slice(0, 3).map((s) => s.name).join(', ')}`)
  if (inc.length) business.push(`${sum(inc, (i) => i.customersImpacted).toLocaleString('en-IN')} customer transactions hit by ${inc.length} P1/P2 incidents (90 days)`)
  for (const p of sc.processes.filter((x) => x.health === 'Red').slice(0, 2)) business.push(`${p.name}: ${p.businessImpact}`)
  if (redInit.length) business.push(`${redInit.length} initiative(s) not on track: ${redInit.slice(0, 2).map((i) => i.name).join(', ')}`)
  const eol = sc.apps.filter((a) => a.usesEol)
  if (eol.length) technology.push(`${eol.length} application(s) on end-of-life technology${eol.some((a) => a.criticality === 'Mission critical') ? ' (incl. mission critical)' : ''}`)
  const redApps = sc.apps.filter((a) => a.health === 'Red'); if (redApps.length) technology.push(`${redApps.length} application(s) red: ${redApps.slice(0, 3).map((a) => a.name).join(', ')}`)
  const redSvc = sc.services.filter((s) => s.health === 'Red'); if (redSvc.length) technology.push(`${redSvc.length} service(s) critical`)
  const fail = sc.controls.filter((c) => c.controlStatus === 'Failing'); if (fail.length) technology.push(`${fail.length} control(s) failing: ${fail.map((c) => c.control).join('; ')}`)
  const gap = sc.teams.filter((t) => t.capacityGap > 8); if (gap.length) technology.push(`${gap.length} team(s) short of capacity (up to ${Math.max(...gap.map((t) => t.capacityGap))}%)`)
  const hiRisk = sc.risks.filter((r) => r.severity === 'Critical' || r.severity === 'High'); if (hiRisk.length) technology.push(`${hiRisk.length} high or critical risk(s) open`)
  const over = sum(sc.initiatives, (i) => Math.max(0, i.forecastCr - i.budgetCr)); if (over > 0.05) financial.push(`${cr(over)} forecast budget overrun on linked initiatives`)
  const atRisk = sum(redInit, (i) => i.expectedValueCr); if (atRisk) financial.push(`${cr(atRisk)} expected value on initiatives not on track`)
  const legacyCost = sum(sc.apps.filter((a) => a.lifecycle === 'Retire' || a.lifecycle === 'Migrate'), (a) => a.annualCostCr); if (legacyCost) financial.push(`${cr(legacyCost)}/yr run cost on legacy apps (migrate / retire)`)
  const prj = sc.projects.filter((p) => p.forecastCr > p.budgetCr * 1.05); if (prj.length) financial.push(`${prj.length} project(s) forecast more than 5% over budget`)
  const svcCost = sum(belowSlo, (s) => s.costCrYr); if (svcCost) financial.push(`${cr(svcCost)}/yr spent on services not meeting their SLO`)
  return { business, technology, financial }
}

export interface Action { text: string; owner: string; recordId: string; priority: 'High' | 'Medium'; why: string }
export function actions(sc: Scope): Action[] {
  const out: Action[] = []
  const pr = (h: Rag) => (h === 'Red' ? 'High' : 'Medium') as Action['priority']
  for (const i of sc.initiatives.filter((x) => x.health !== 'Green')) out.push({ text: `Re-plan ${i.name}: resolve dependencies and rebalance capacity`, owner: i.owner, recordId: i.id, priority: pr(i.health), why: i.why.join('; ') })
  for (const a of sc.apps.filter((x) => x.health === 'Red')) out.push({ text: `${a.name}: ${a.recommendation.toLowerCase()}`, owner: a.owner, recordId: a.id, priority: 'High', why: a.why.join('; ') })
  for (const p of sc.processes.filter((x) => x.health === 'Red')) out.push({ text: `${p.name}: ${p.opportunity.toLowerCase()}`, owner: p.owner, recordId: p.id, priority: 'High', why: p.why.join('; ') })
  for (const s of sc.services.filter((x) => x.health === 'Red')) out.push({ text: `${s.name}: problem management on top incident causes`, owner: s.owner, recordId: s.id, priority: 'High', why: s.why.join('; ') })
  for (const t of sc.teams.filter((x) => x.health === 'Red')) out.push({ text: `${t.name}: rebalance capacity from lower-priority work`, owner: t.manager, recordId: t.id, priority: 'High', why: t.why.join('; ') })
  for (const c of sc.controls.filter((x) => x.controlStatus === 'Failing')) out.push({ text: `Fix and re-test: ${c.control}`, owner: c.owner, recordId: c.id, priority: 'High', why: c.why.join('; ') })
  for (const r of sc.risks.filter((x) => x.severity === 'Critical' || x.severity === 'High')) out.push({ text: r.mitigation, owner: r.owner, recordId: r.id, priority: r.severity === 'Critical' ? 'High' : 'Medium', why: r.name })
  const seen = new Set<string>()
  return out.filter((a) => (seen.has(a.recordId) ? false : (seen.add(a.recordId), true))).sort((a, b) => (a.priority === b.priority ? 0 : a.priority === 'High' ? -1 : 1))
}

// Cross-functional dependencies (spec 2 §5): "this function's results depend on …"
export const DEPENDS: Record<FunctionId, [FunctionId, string][]> = {
  technology: [['architecture', 'legacy platforms limit reliability'], ['engineering', 'delivery capacity for fixes'], ['cyber', 'secure, patched estate'], ['procurement', 'vendor support and SLAs']],
  architecture: [['strategy', 'target state follows strategy'], ['finance', 'funding for modernisation'], ['engineering', 'capacity to migrate']],
  engineering: [['hr', 'skills and hiring'], ['architecture', 'tech debt slows delivery'], ['strategy', 'clear priorities']],
  'data-ai': [['architecture', 'data platforms'], ['risk', 'AI governance'], ['legal', 'consent and AI legal review'], ['hr', 'AI skills']],
  cyber: [['architecture', 'end-of-life technology'], ['technology', 'patching and hardening'], ['procurement', 'third-party risk']],
  product: [['engineering', 'build capacity'], ['data-ai', 'AI capabilities'], ['finance', 'innovation funding']],
  strategy: [['finance', 'investment'], ['engineering', 'execution capacity'], ['architecture', 'platform readiness']],
  finance: [['strategy', 'value cases'], ['procurement', 'vendor spend'], ['technology', 'run cost']],
  operations: [['technology', 'system availability'], ['architecture', 'integration between systems'], ['data-ai', 'automation and AI']],
  sales: [['technology', 'digital channel availability'], ['cx', 'customer experience'], ['marketing', 'pipeline']],
  marketing: [['data-ai', 'personalisation'], ['legal', 'consent'], ['technology', 'digital platforms']],
  cx: [['technology', 'service reliability'], ['operations', 'process speed'], ['data-ai', 'AI-assisted service']],
  hr: [['finance', 'hiring budget'], ['strategy', 'skills needed for the plan']],
  risk: [['cyber', 'security controls'], ['architecture', 'end-of-life exposure'], ['procurement', 'vendor risk']],
  legal: [['risk', 'control evidence'], ['data-ai', 'AI use cases'], ['procurement', 'contracts']],
  procurement: [['finance', 'spend controls'], ['legal', 'contract terms'], ['risk', 'vendor risk assessment']],
}
export function dependencies(d: DomainData, fn: FunctionId) {
  const dependents = FUNCTIONS.filter((f) => DEPENDS[f.id].some(([x]) => x === fn)).map((f) => f.id)
  return {
    dependsOn: DEPENDS[fn].map(([id, why]) => ({ id, why, h: functionHealth(d, id) })),
    dependents: dependents.map((id) => ({ id, h: functionHealth(d, id) })),
  }
}
