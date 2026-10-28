// CTO Technology Control Plane (home page). Re-composes the linked simulation records into:
// 6 control layers (EA: business, data, application, technology + security and spend), real-time impact chains,
// blast radius graphs, TOGAF ADM placement of initiatives, and portfolio statistics. Everything is calculated.
import type { Application, DomainData, DomainId, FunctionId, Rag, Severity } from './model'
import { SIM_NOW } from './model'
import { sim } from './index'
import { functionHealth } from './scores'
import { ragOf } from './scoring'
import { decisionsFor, topDecisions, type Decision } from './decisions'
import { buildEvents, type SimEvent } from './events'
import { USE_CASES } from './aiPortfolio'
import { models } from './governance'

export const ALL: DomainId[] = ['banking', 'manufacturing', 'retail']
export type Scope = DomainId | 'all'
export const scopeIds = (s: Scope) => (s === 'all' ? ALL : [s])
const T0 = Date.parse(SIM_NOW)
const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0)
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0)
const r1 = (x: number) => Math.round(x * 10) / 10
const sevRank: Record<Severity, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 }

// ── 1. Control layers ────────────────────────────────────────────────
export type LayerId = 'business' | 'data' | 'application' | 'technology' | 'security' | 'spend'
interface LayerDef { id: LayerId; label: string; ea: string; owner: string; ownerId: string; fns: FunctionId[]; question: string }
export const LAYERS: LayerDef[] = [
  { id: 'business', label: 'Business', ea: 'Business architecture · capabilities & processes', owner: 'Suman', ownerId: 'suman', fns: ['strategy', 'operations', 'cx', 'product'], question: 'Are capabilities and processes delivering the strategy?' },
  { id: 'data', label: 'Data & AI', ea: 'Data architecture · AI portfolio & models', owner: 'Vaibhav', ownerId: 'vaibhav', fns: ['data-ai'], question: 'Is data governed and is AI producing value safely?' },
  { id: 'application', label: 'Application', ea: 'Application architecture · portfolio & lifecycle', owner: 'Ram', ownerId: 'ram', fns: ['architecture', 'engineering'], question: 'Is the application estate fit for the target state?' },
  { id: 'technology', label: 'Technology', ea: 'Technology architecture · platforms, infra, operations', owner: 'Pankaj', ownerId: 'pankaj', fns: ['technology'], question: 'Are platforms reliable, current and ready for peak?' },
  { id: 'security', label: 'Security & risk', ea: 'Cross-cutting · cyber, controls, regulation', owner: 'Vaibhav', ownerId: 'vaibhav', fns: ['cyber', 'risk'], question: 'Is technology risk inside appetite?' },
  { id: 'spend', label: 'Spend & value', ea: 'Cross-cutting · run cost, investment, value', owner: 'Santhosh', ownerId: 'santhosh', fns: ['finance', 'procurement'], question: 'Is every rupee producing measurable value?' },
]
export const TARGET = 85

export interface Fact { label: string; value: string; tone?: 'crit' | 'warn' | 'ok' }
export interface IssueRec { id: string; domain: DomainId; name: string; detail: string; health: Rag; to?: string }
export interface Layer {
  def: LayerDef; series: number[]; baseline: number; current: number; target: number; gap: number
  delta3m: number; status: Rag; progress: number; byDomain: { d: DomainId; score: number; status: Rag }[]
  facts: Fact[]; issues: IssueRec[]; decision: Decision | null; signal: { text: string; recordId: string; domain: DomainId; tone: SimEvent['tone']; at: number } | null
}

const layerSeries = (d: DomainData, fns: FunctionId[]) => {
  const ss = fns.map((f) => functionHealth(d, f).series)
  return ss[0].map((_, k) => Math.round(avg(ss.map((s) => s[k]))))
}
const SIGNAL_SOURCES: Record<LayerId, SimEvent['source'][]> = {
  business: ['process'], data: ['planview'], application: ['leanix', 'servicenow', 'jellyfish'], technology: ['datadog'], security: ['vanta'], spend: ['planview'],
}

export function eventsFor(scope: Scope) {
  return scopeIds(scope).flatMap((d) => buildEvents(sim[d]).map((e) => ({ ...e, domain: d })))
}
type DEvent = ReturnType<typeof eventsFor>[number]

export function layers(scope: Scope, events: DEvent[], now: number): Layer[] {
  const ids = scopeIds(scope)
  const ds = ids.map((d) => sim[d])
  const decs = topDecisions(ds.flatMap((d) => decisionsFor(d)), 99)
  const released = events.filter((e) => e.at <= now).sort((a, b) => b.at - a.at)
  const used = new Set<string>()   // each layer shows its most relevant decision not already shown above
  return LAYERS.map((def) => {
    const per = ds.map((d) => layerSeries(d, def.fns))
    const series = per[0].map((_, k) => Math.round(avg(per.map((s) => s[k]))))
    const current = series[11], baseline = series[0]
    const byDomain = ds.map((d, i) => ({ d: d.domain, score: per[i][11], status: ragOf(per[i][11]) }))
    const { facts, issues } = layerFacts(def.id, ds)
    const rel = decs.filter((x) => x.functions.some((f) => def.fns.includes(f)))
    const decision = rel.find((x) => !used.has(x.id)) ?? rel[0] ?? null
    if (decision) used.add(decision.id)
    const worstModel = def.id === 'data' ? models.filter((m) => ids.includes(m.domain)).sort((a, b) => b.psi - a.psi)[0] : undefined
    const ev = worstModel ? undefined : released.find((e) => SIGNAL_SOURCES[def.id].includes(e.source) && e.tone !== 'ok' && e.tone !== 'info') ?? released.find((e) => SIGNAL_SOURCES[def.id].includes(e.source))
    return {
      def, series, baseline, current, target: TARGET, gap: Math.max(0, TARGET - current), delta3m: current - series[8], status: ragOf(current),
      progress: Math.max(0, Math.min(100, Math.round(((current - baseline) / Math.max(1, TARGET - baseline)) * 100))),
      byDomain, facts, issues, decision,
      signal: worstModel ? { text: `${worstModel.name}: PSI ${worstModel.psi} · ${worstModel.approval.toLowerCase()}`, recordId: worstModel.useCase.appId ?? '', domain: worstModel.domain, tone: worstModel.psi > 0.25 ? 'crit' : 'warn', at: T0 }
        : ev ? { text: ev.text, recordId: ev.recordId, domain: ev.domain, tone: ev.tone, at: ev.at } : null,
    }
  })
}

function layerFacts(id: LayerId, ds: DomainData[]): { facts: Fact[]; issues: IssueRec[] } {
  const apps = ds.flatMap((d) => d.applications)
  if (id === 'business') {
    const caps = ds.flatMap((d) => capabilityHealth(d))
    const procs = ds.flatMap((d) => d.processes)
    const late = procs.filter((p) => p.cycleTime > p.targetCycleTime)
    return {
      facts: [
        { label: 'Capabilities at risk', value: `${caps.filter((c) => c.health !== 'Green').length} / ${caps.length}`, tone: caps.some((c) => c.health === 'Red') ? 'crit' : 'warn' },
        { label: 'Processes over target cycle time', value: `${late.length} / ${procs.length}`, tone: late.length ? 'warn' : 'ok' },
        { label: 'Average automation rate', value: `${Math.round(avg(procs.map((p) => p.automationRate)))}%` },
      ],
      issues: caps.filter((c) => c.health !== 'Green').sort((a, b) => a.score - b.score).slice(0, 5).map((c) => ({ id: c.appIds[0], domain: c.domain, name: c.name, detail: `${c.apps} app(s) · ${c.red} red · score ${c.score}`, health: c.health, to: `/domain/${c.domain}/leanix?tab=capabilities` })),
    }
  }
  if (id === 'data') {
    const ucs = USE_CASES.filter((u) => ds.some((d) => d.domain === u.domain))
    const ms = models.filter((m) => ds.some((d) => d.domain === m.domain))
    const live = ucs.filter((u) => u.stage === 'Production' || u.stage === 'Scaled')
    return {
      facts: [
        { label: 'AI use cases live', value: `${live.length} / ${ucs.length}`, tone: live.length / Math.max(1, ucs.length) < 0.35 ? 'warn' : 'ok' },
        { label: 'Models restricted or pending', value: `${ms.filter((m) => m.approval === 'Restricted' || m.approval === 'Pending').length} / ${ms.length}`, tone: ms.some((m) => m.approval === 'Restricted') ? 'crit' : 'ok' },
        { label: 'AI value realised', value: `₹${r1(sum(ucs.map((u) => u.realisedCr)))} Cr` },
      ],
      issues: ms.filter((m) => m.approval !== 'Approved').sort((a, b) => b.psi - a.psi).slice(0, 5).map((m) => ({ id: m.useCase.appId ?? m.useCase.initiativeId ?? '', domain: m.domain, name: m.name, detail: `${m.approval} · PSI ${m.psi} · ${m.tier} tier`, health: (m.approval === 'Restricted' ? 'Red' : 'Amber') as Rag })).filter((x) => x.id),
    }
  }
  if (id === 'application') {
    const legacy = apps.filter((a) => a.lifecycle === 'Migrate' || a.lifecycle === 'Retire')
    return {
      facts: [
        { label: 'Legacy apps (migrate / retire)', value: `${legacy.length} / ${apps.length}`, tone: legacy.length ? 'warn' : 'ok' },
        { label: 'Apps running on end-of-life tech', value: `${apps.filter((a) => a.usesEol).length}`, tone: apps.some((a) => a.usesEol && a.criticality === 'Mission critical') ? 'crit' : 'warn' },
        { label: 'Average technical health', value: `${Math.round(avg(apps.map((a) => a.techHealth)))} / 100` },
      ],
      issues: apps.filter((a) => a.health !== 'Green').sort((a, b) => a.techHealth - b.techHealth).slice(0, 5).map((a) => ({ id: a.id, domain: a.domain, name: a.name, detail: `${a.criticality} · tech ${a.techHealth} · ${a.lifecycle}`, health: a.health })),
    }
  }
  if (id === 'technology') {
    const tech = ds.flatMap((d) => d.technologies), svcs = ds.flatMap((d) => d.services)
    return {
      facts: [
        { label: 'End-of-life technologies', value: `${tech.filter((t) => t.lifecycle === 'End of life').length} / ${tech.length}`, tone: 'crit' },
        { label: 'Services breaching SLO', value: `${svcs.filter((s) => s.availability < s.slo || s.latencyMs > s.latencyTargetMs).length} / ${svcs.length}`, tone: 'warn' },
        { label: 'P1 incidents, 30 days', value: `${sum(svcs.map((s) => s.p1_30))}`, tone: sum(svcs.map((s) => s.p1_30)) > 2 ? 'crit' : 'ok' },
      ],
      issues: svcs.filter((s) => s.health !== 'Green').sort((a, b) => a.sloCompliance - b.sloCompliance).slice(0, 5).map((s) => ({ id: s.id, domain: s.domain, name: s.name, detail: `avail ${s.availability}% vs ${s.slo}% · ${s.latencyMs} ms · ${s.incidents30} incidents`, health: s.health })),
    }
  }
  if (id === 'security') {
    const risks = ds.flatMap((d) => d.risks), ctl = ds.flatMap((d) => d.controls)
    const hi = risks.filter((r) => r.severity === 'Critical' || r.severity === 'High')
    return {
      facts: [
        { label: 'Critical + high risks open', value: `${hi.length}`, tone: risks.some((r) => r.severity === 'Critical') ? 'crit' : 'warn' },
        { label: 'Controls failing', value: `${ctl.filter((c) => c.controlStatus === 'Failing').length} / ${ctl.length}`, tone: ctl.some((c) => c.controlStatus === 'Failing') ? 'crit' : 'ok' },
        { label: 'Average remediation age', value: `${Math.round(avg(hi.map((r) => r.openedDays)))} days` },
      ],
      issues: hi.sort((a, b) => sevRank[a.severity] - sevRank[b.severity] || b.openedDays - a.openedDays).slice(0, 5).map((r) => ({ id: r.id, domain: r.domain, name: r.name, detail: `${r.severity} · ${r.category} · open ${r.openedDays} d`, health: r.health })),
    }
  }
  const inits = ds.flatMap((d) => d.initiatives)
  const over = inits.filter((i) => i.forecastCr > i.budgetCr * 1.05)
  return {
    facts: [
      { label: 'Initiatives forecast over budget', value: `${over.length} / ${inits.length}`, tone: over.length ? 'warn' : 'ok' },
      { label: 'Value realised vs expected', value: `${Math.round((sum(inits.map((i) => i.valueRealizedCr)) / Math.max(1, sum(inits.map((i) => i.expectedValueCr)))) * 100)}%` },
      { label: 'Annual application run cost', value: `₹${r1(sum(apps.map((a) => a.annualCostCr)))} Cr` },
    ],
    issues: inits.filter((i) => i.health !== 'Green').sort((a, b) => b.expectedValueCr - a.expectedValueCr).slice(0, 5).map((i) => ({ id: i.id, domain: i.domain, name: i.name, detail: `₹${r1(i.forecastCr)} Cr forecast vs ₹${r1(i.budgetCr)} Cr · ₹${r1(i.expectedValueCr)} Cr value`, health: i.health })),
  }
}

// ── Capabilities (business layer) ────────────────────────────────────
const pts = (h: Rag) => (h === 'Green' ? 100 : h === 'Amber' ? 65 : 30)
export function capabilityHealth(d: DomainData) {
  return d.capabilities.map((name) => {
    const as = d.applications.filter((a) => a.capability === name)
    const svc = d.services.filter((s) => s.capability === name)
    const xs = [...as.map((a) => pts(a.health)), ...svc.map((s) => pts(s.health))]
    const score = xs.length ? Math.round(avg(xs)) : 80
    return { name, domain: d.domain, score, health: ragOf(score), apps: as.length, red: [...as, ...svc].filter((x) => x.health === 'Red').length, appIds: as.map((a) => a.id) }
  }).filter((c) => c.appIds.length)
}

// ── 2. Impact chains: signal → app → capability → initiative → ₹ → decision ──
export interface Chain {
  id: string; domain: DomainId; origin: { id: string; name: string; kind: 'Service' | 'Technology'; text: string; health: Rag }
  app: Application; capability: string; initiatives: { id: string; name: string; valueCr: number; health: Rag }[]
  valueAtRiskCr: number; decision: Decision | null; live: { at: number; text: string } | null
}
export function chains(scope: Scope, events: DEvent[], now: number): Chain[] {
  const out: Chain[] = []
  for (const id of scopeIds(scope)) {
    const d = sim[id]
    const decs = decisionsFor(d).filter((x) => !x.preset)
    const findDecision = (ids: string[]) => decs.filter((x) => x.signals.some((s) => ids.includes(s.recordId))).sort((a, b) => sevRank[a.priority] - sevRank[b.priority])[0] ?? null
    const push = (origin: Chain['origin'], app: Application) => {
      const inits = d.initiatives.filter((i) => i.appIds.includes(app.id))
      if (!inits.length) return
      const atRisk = inits.filter((i) => i.health !== 'Green')
      const valueAtRiskCr = r1(sum((atRisk.length ? atRisk : inits).map((i) => i.expectedValueCr)) * (origin.health === 'Red' ? 1 : 0.5))
      const ids = [origin.id, app.id, ...inits.map((i) => i.id)]
      const ev = events.filter((e) => e.domain === id && e.at > T0 && e.at <= now && ids.includes(e.recordId)).sort((a, b) => b.at - a.at)[0]
      out.push({ id: `${origin.id}>${app.id}`, domain: id, origin, app, capability: app.capability, initiatives: inits.map((i) => ({ id: i.id, name: i.name, valueCr: i.expectedValueCr, health: i.health })), valueAtRiskCr, decision: findDecision(ids), live: ev ? { at: ev.at, text: ev.text } : null })
    }
    for (const s of d.services.filter((x) => x.health !== 'Green')) {
      const app = d.applications.find((a) => a.id === s.appId)
      if (app) push({ id: s.id, name: s.name, kind: 'Service', health: s.health, text: s.latencyMs > s.latencyTargetMs ? `latency ${s.latencyMs} ms vs ${s.latencyTargetMs} ms target` : `availability ${s.availability}% vs ${s.slo}% SLO` }, app)
    }
    for (const t of d.technologies.filter((x) => x.lifecycle === 'End of life')) {
      for (const app of d.applications.filter((a) => t.appIds.includes(a.id) && a.criticality === 'Mission critical').slice(0, 1)) {
        push({ id: t.id, name: t.name, kind: 'Technology', health: 'Red', text: `past end of support (${t.eolDate ?? 'n/a'})` }, app)
      }
    }
  }
  return out.sort((a, b) => Number(!!b.live) - Number(!!a.live) || b.valueAtRiskCr - a.valueAtRiskCr)
}

// ── 3. Blast radius: everything one origin touches, by layer ──
export interface BNode { id: string; name: string; col: number; health: Rag; sub: string; weight: number }
export interface BLink { from: string; to: string; weight: number }
export const BLAST_COLS = ['Signal', 'Applications', 'Capabilities & processes', 'Initiatives', 'Objectives', 'Risks & controls']
export function blastRadius(domain: DomainId, originId: string) {
  const d = sim[domain]
  const nodes = new Map<string, BNode>(), links: BLink[] = []
  const add = (n: BNode) => { if (!nodes.has(n.id)) nodes.set(n.id, n) }
  const link = (from: string, to: string, weight: number) => { if (!links.some((l) => l.from === from && l.to === to)) links.push({ from, to, weight }) }
  const svc = d.services.find((s) => s.id === originId)
  const tech = d.technologies.find((t) => t.id === originId)
  const appIds = svc ? [svc.appId] : tech ? tech.appIds : []
  if (svc) add({ id: svc.id, name: svc.name, col: 0, health: svc.health, sub: `${svc.availability}% · ${svc.latencyMs} ms`, weight: 1 })
  if (tech) add({ id: tech.id, name: tech.name, col: 0, health: tech.health, sub: tech.lifecycle, weight: 1 })
  const apps = d.applications.filter((a) => appIds.includes(a.id))
  for (const a of apps) {
    add({ id: a.id, name: a.name, col: 1, health: a.health, sub: `${a.criticality} · ₹${a.annualCostCr} Cr/yr`, weight: a.annualCostCr }); link(originId, a.id, a.annualCostCr)
    const cap = `CAP:${a.capability}`
    add({ id: cap, name: a.capability, col: 2, health: a.health, sub: 'Capability', weight: 1 }); link(a.id, cap, a.annualCostCr)
    for (const p of d.processes.filter((x) => x.appIds.includes(a.id))) { add({ id: p.id, name: p.name, col: 2, health: p.health, sub: `Process · ${p.cycleTime} ${p.unit} vs ${p.targetCycleTime}`, weight: 1 }); link(a.id, p.id, 1) }
    for (const i of d.initiatives.filter((x) => x.appIds.includes(a.id))) {
      add({ id: i.id, name: i.name, col: 3, health: i.health, sub: `₹${i.expectedValueCr} Cr value · ${i.progress}%`, weight: i.expectedValueCr }); link(cap, i.id, i.expectedValueCr)
      const o = d.objectives.find((x) => x.id === i.objectiveId)
      if (o) { add({ id: o.id, name: o.name, col: 4, health: o.health, sub: `${o.priority} · ₹${o.expectedValueCr} Cr`, weight: o.expectedValueCr }); link(i.id, o.id, i.expectedValueCr) }
    }
    for (const r of d.risks.filter((x) => x.appId === a.id)) { add({ id: r.id, name: r.name, col: 5, health: r.health, sub: `${r.severity} risk`, weight: 1 }); link(a.id, r.id, 1) }
    for (const c of d.controls.filter((x) => x.appIds.includes(a.id) && x.controlStatus !== 'Passing')) { add({ id: c.id, name: c.control, col: 5, health: c.health, sub: `Control ${c.controlStatus.toLowerCase()}`, weight: 1 }); link(a.id, c.id, 1) }
  }
  const ns = [...nodes.values()]
  const valueCr = r1(sum(ns.filter((n) => n.col === 3).map((n) => n.weight)))
  return { nodes: ns, links, valueCr, counts: BLAST_COLS.map((_, c) => ns.filter((n) => n.col === c).length) }
}

// ── 4. TOGAF ADM: where each initiative sits (rule on progress, documented) ──
export const ADM = [
  { id: 'P', label: 'Preliminary', short: 'Prelim' }, { id: 'A', label: 'A · Architecture vision', short: 'A Vision' },
  { id: 'B', label: 'B · Business architecture', short: 'B Business' }, { id: 'C', label: 'C · Information systems', short: 'C Info sys' },
  { id: 'D', label: 'D · Technology architecture', short: 'D Technology' }, { id: 'E', label: 'E · Opportunities & solutions', short: 'E Solutions' },
  { id: 'F', label: 'F · Migration planning', short: 'F Migration' }, { id: 'G', label: 'G · Implementation governance', short: 'G Govern' },
  { id: 'H', label: 'H · Architecture change management', short: 'H Change' },
] as const
const ADM_CUTS = [5, 12, 20, 28, 36, 45, 55, 92, 101]   // progress % upper bounds per phase
export function admPlacement(scope: Scope) {
  const inits = scopeIds(scope).flatMap((d) => sim[d].initiatives)
  return ADM.map((ph, k) => {
    const xs = inits.filter((i) => i.progress < ADM_CUTS[k] && (k === 0 || i.progress >= ADM_CUTS[k - 1]))
    return { ...ph, initiatives: xs, budgetCr: r1(sum(xs.map((i) => i.budgetCr))), red: xs.filter((i) => i.health === 'Red').length }
  })
}

// ── 5. Statistics ────────────────────────────────────────────────────
export function pearson(xs: number[], ys: number[]) {
  const mx = avg(xs), my = avg(ys)
  const num = sum(xs.map((x, i) => (x - mx) * (ys[i] - my)))
  const den = Math.sqrt(sum(xs.map((x) => (x - mx) ** 2)) * sum(ys.map((y) => (y - my) ** 2)))
  return den ? num / den : 0
}
export function linreg(xs: number[], ys: number[]) {
  const mx = avg(xs), my = avg(ys)
  const b = sum(xs.map((x, i) => (x - mx) * (ys[i] - my))) / Math.max(1e-9, sum(xs.map((x) => (x - mx) ** 2)))
  return { slope: b, intercept: my - b * mx }
}
/** Gartner TIME portfolio: technical health (x) vs functional fit (y), bubble = annual cost. */
export function timeQuadrant(scope: Scope) {
  return scopeIds(scope).flatMap((id) => sim[id].applications.map((a) => {
    const incidents = sum(sim[id].services.filter((s) => s.appId === a.id).map((s) => s.incidents30))
    const q = a.techHealth >= 60 ? (a.functionalFit >= 60 ? 'Invest' : 'Tolerate') : a.functionalFit >= 60 ? 'Migrate' : 'Eliminate'
    return { id: a.id, domain: id, name: a.name, x: a.techHealth, y: a.functionalFit, cost: a.annualCostCr, incidents, criticality: a.criticality, health: a.health, quadrant: q as 'Invest' | 'Tolerate' | 'Migrate' | 'Eliminate' }
  }))
}
/** Does technical debt hurt? Correlate app technical health with incidents on its services (30 days). */
export function debtVsIncidents(scope: Scope) {
  const pts = timeQuadrant(scope).filter((p) => sim[p.domain].services.some((s) => s.appId === p.id))
  const xs = pts.map((p) => p.x), ys = pts.map((p) => p.incidents)
  const r = pearson(xs, ys)
  return { pts, r: Math.round(r * 100) / 100, n: pts.length, fit: linreg(xs, ys) }
}
/** Expected initiative value split by delivery health: where the money is safe vs at risk. */
export function valueAtRisk(scope: Scope) {
  const inits = scopeIds(scope).flatMap((d) => sim[d].initiatives)
  const by = (h: Rag) => r1(sum(inits.filter((i) => i.health === h).map((i) => i.expectedValueCr)))
  return { green: by('Green'), amber: by('Amber'), red: by('Red'), total: r1(sum(inits.map((i) => i.expectedValueCr))), realised: r1(sum(inits.map((i) => i.valueRealizedCr))) }
}
