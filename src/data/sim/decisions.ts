// Decision Intelligence engine (M5): Signal → Correlation → Insight → Decision → Action → Outcome.
// Decision cards are raised by RULES over linked simulated records — every signal cites a real record ID.
// No free-text "AI" claims: wording is assembled from the evidence values.
import type { DomainData, FunctionId, Metric, Rag, Severity, SourceId } from './model'
import { MONTHS, SIM_NOW } from './model'
import { FN } from './functions'
import { functionHealth, sourceHealth, SOURCES } from './scores'

export interface Signal { source: Exclude<SourceId, 'business'> | 'business'; text: string; recordId: string; health: Rag }
export interface PlannedAction { id: string; decisionId: string; action: string; owner: string; due: string; priority: Severity; expectedOutcome: string; evidence: string; preset?: { status: ActionStatus; actual?: string } }
export type ActionStatus = 'Not Started' | 'In Progress' | 'Blocked' | 'Completed'
export interface OutcomeRow { metric: Metric; baseline: number; target: number; current: number; variance: number; status: 'Target met' | 'On track' | 'Behind' }
export interface Decision {
  id: string; domain: DomainData['domain']; title: string; kind: string; priority: Severity
  whyNow: string; signals: Signal[]; correlation: string; insight: string; recommendation: string
  expected: string[]; confidence: number; owner: string; deadline: string
  businessImpact: string; technologyImpact: string; financialImpact: string; risk: string
  investmentCr: number; benefitCr: number; functions: FunctionId[]
  actions: PlannedAction[]
  preset?: { status: 'Approved'; decidedOn: string; by: string; outcomes: OutcomeRow[]; chain: string[] }
}

const T0 = Date.parse(SIM_NOW)
const DAY = 86_400_000
const date = (days: number) => new Date(T0 + days * DAY).toISOString().slice(0, 10)
const cr = (n: number) => `₹${Math.round(n * 10) / 10} Cr`
const rank: Record<Severity, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 }

export function decisionsFor(d: DomainData): Decision[] {
  const out: Decision[] = []
  const C = d.code
  const id = () => `DEC-${C}-${String(out.length + 1).padStart(2, '0')}`
  const app = (x: string) => d.applications.find((a) => a.id === x)!
  const incidents90 = (svc: string) => d.incidents.filter((i) => i.serviceId === svc)
  const trend = (svc: string) => {
    const xs = incidents90(svc)
    const recent = xs.filter((i) => T0 - Date.parse(i.start) <= 45 * DAY).length
    const prior = xs.length - recent
    return { total: xs.length, recent, prior, pct: prior ? Math.round(((recent - prior) / prior) * 100) : recent ? 100 : 0 }
  }
  const lowPriDonor = (exclude: string[]) => {
    const pri = (initId: string) => rank[d.objectives.find((o) => o.id === d.initiatives.find((i) => i.id === initId)!.objectiveId)!.priority]
    return [...d.teams].filter((t) => t.health === 'Green' && t.capacityGap <= 3 && !exclude.includes(t.id)).sort((a, b) => pri(b.initiativeId) - pri(a.initiativeId) || b.engineers - a.engineers)[0]
  }

  // ── 1. Story decisions: one initiative chain across all seven layers ──
  for (const s of d.stories) {
    const init = d.initiatives.find((i) => i.id === s.initiativeId)!
    const obj = d.objectives.find((o) => o.id === init.objectiveId)!
    const proc = d.processes.find((p) => p.id === s.processId)!
    const proj = d.projects.find((p) => p.id === s.projectId)!
    const team = d.teams.find((t) => t.id === s.teamId)!
    const svc = d.services.find((x) => x.id === s.serviceId)!
    const ctl = d.controls.find((c) => c.id === s.controlId)!
    const risk = d.risks.find((r) => r.id === s.riskId)
    const legacy = s.appIds.map(app).filter((a) => a.health !== 'Green')
    const tr = trend(svc.id)
    const sig: Signal[] = []
    if (init.health !== 'Green') sig.push({ source: 'planview', recordId: init.id, health: init.health, text: `${init.name} at ${init.progress}% vs ${init.plannedProgress}% plan; forecast ${cr(init.forecastCr)} vs ${cr(init.budgetCr)} budget.` })
    if (legacy.length) sig.push({ source: 'leanix', recordId: legacy[0].id, health: legacy[0].health, text: `${legacy.length} ${legacy.some((a) => a.criticality === 'Mission critical') ? 'critical ' : ''}legacy dependenc${legacy.length > 1 ? 'ies' : 'y'} on the path: ${legacy.map((a) => a.name).join(', ')}${legacy.some((a) => a.usesEol) ? ' (end-of-life technology)' : ''}.` })
    if (proc.health !== 'Green') sig.push({ source: 'process', recordId: proc.id, health: proc.health, text: `${proc.name} takes ${proc.cycleTime} ${proc.unit} vs ${proc.targetCycleTime} ${proc.unit} target; bottleneck: ${proc.bottleneck.toLowerCase()}.` })
    if (proj.health !== 'Green') sig.push({ source: 'servicenow', recordId: proj.id, health: proj.health, text: `${proj.name}: ${proj.milestonesLate} of ${proj.milestonesDue} milestones late; forecast finish ${proj.forecastEnd} (planned ${proj.plannedEnd}).` })
    if (team.health !== 'Green') sig.push({ source: 'jellyfish', recordId: team.id, health: team.health, text: `${team.name} capacity ${team.capacityGap}% below requirement; ${team.allocation.unplanned}% of time on unplanned work.` })
    if (svc.health !== 'Green') sig.push({ source: 'datadog', recordId: svc.id, health: svc.health, text: `${svc.name}: ${tr.total} incidents in 90 days${tr.prior ? ` (${tr.pct >= 0 ? '+' : ''}${tr.pct}% in the last 45 days)` : ''}; availability ${svc.availability}% vs ${svc.slo}% SLO.` })
    if (ctl.controlStatus !== 'Passing') sig.push({ source: 'vanta', recordId: ctl.id, health: ctl.health, text: `Control "${ctl.control}" is ${ctl.controlStatus.toLowerCase()} (${ctl.framework})${risk && risk.severity !== 'Low' ? `; linked risk ${risk.id} rated ${risk.severity.toLowerCase()}` : ''}.` })
    const reds = sig.filter((x) => x.health === 'Red').length
    const priority: Severity = reds >= 6 && obj.priority === 'Critical' && init.health === 'Red' ? 'Critical' : reds >= 3 ? 'High' : sig.length >= 3 ? 'Medium' : 'Low'
    const causes = [legacy.length && 'legacy dependencies', team.health !== 'Green' && 'engineering capacity constraints', svc.health !== 'Green' && 'rising production instability', proc.health !== 'Green' && 'process friction', ctl.controlStatus !== 'Passing' && 'open control gaps'].filter(Boolean) as string[]
    const donor = lowPriDonor([team.id])
    const move = Math.max(2, Math.ceil((team.engineers * team.capacityGap) / 100))
    const atRisk = init.health !== 'Green'
    const did = id()
    const acts: Omit<PlannedAction, 'id' | 'decisionId'>[] = []
    if (legacy[0]) acts.push({ action: `Fast-track modernisation of ${legacy[0].name} (${legacy[0].recommendation.toLowerCase()})`, owner: legacy[0].owner, due: date(60), priority: 'High', expectedOutcome: 'Blocking dependency removed from the critical path', evidence: legacy[0].id })
    if (team.capacityGap > 8 && donor) acts.push({ action: `Move ${move} engineers from ${donor.name} to ${team.name} for one quarter`, owner: 'VP Engineering', due: date(14), priority: 'High', expectedOutcome: `Capacity gap below 5% (now ${team.capacityGap}%)`, evidence: team.id })
    if (svc.health !== 'Green') acts.push({ action: `Problem management on the top incident causes of ${svc.name}`, owner: svc.owner, due: date(30), priority: priority === 'Critical' ? 'Critical' : 'High', expectedOutcome: `${svc.name} back within ${svc.slo}% SLO`, evidence: svc.id })
    if (ctl.controlStatus !== 'Passing') acts.push({ action: `Close control gap: ${ctl.control}`, owner: ctl.owner, due: date(30), priority: 'High', expectedOutcome: 'Control passing on re-test', evidence: ctl.id })
    if (proc.health !== 'Green') acts.push({ action: `${proc.opportunity} for ${proc.name}`, owner: proc.owner, due: date(90), priority: 'Medium', expectedOutcome: `Cycle time towards ${proc.targetCycleTime} ${proc.unit}`, evidence: proc.id })
    out.push({
      id: did, domain: d.domain, title: s.title, kind: 'Cross-system story', priority,
      whyNow: atRisk ? `${init.name} is ${init.plannedProgress - init.progress} points behind with ${Math.round((Date.parse(init.target) - T0) / DAY)} days to its target date.` : `Signals are rising before the initiative itself slips — cheaper to act now.`,
      signals: sig,
      correlation: causes.length ? `${atRisk ? 'Delivery delay' : 'Emerging pressure'} on ${init.name} lines up with ${causes.join(', ')} — the same applications, team and service appear in each source.` : 'Signals are isolated; no shared cause found.',
      insight: atRisk ? `The ${init.target.slice(0, 7)} target for ${init.name} is at risk${obj.priority === 'Critical' ? ` and with it the critical objective "${obj.name}"` : ''}.` : `${s.title}: act before ${obj.name.toLowerCase()} is affected.`,
      recommendation: [legacy.length && `Prioritise modernisation of ${legacy.map((a) => a.name).join(', ')}`, team.capacityGap > 8 && donor && `reallocate ${move} engineers to ${team.name} from ${donor.name}`, ctl.controlStatus !== 'Passing' && `close the "${ctl.control}" control gap`].filter(Boolean).join('; ') + '.',
      expected: [atRisk ? 'Delivery confidence restored' : 'Initiative stays on track', svc.health !== 'Green' ? `${svc.name} back within SLO` : 'Service stability maintained', risk ? `${risk.id} reduced` : 'Risk exposure reduced', `Protect ${cr(init.expectedValueCr)} expected value`],
      confidence: Math.min(91, 50 + sig.length * 3 + reds * 2 + (init.health === 'Red' ? 3 : 0)),
      owner: `${init.owner} with ${init.sponsor}`, deadline: date(priority === 'Critical' ? 14 : priority === 'High' ? 30 : 45),
      businessImpact: `${obj.name}: ${obj.outcome}`, technologyImpact: causes.join(', ') || 'limited',
      financialImpact: `${cr(Math.max(0, init.forecastCr - init.budgetCr))} overrun forecast; ${cr(init.expectedValueCr)} value at stake`,
      risk: risk ? `${risk.id} · ${risk.name} (${risk.severity})` : 'No linked risk',
      investmentCr: Math.round((Math.max(0, init.forecastCr - init.budgetCr) + init.budgetCr * 0.08) * 10) / 10, benefitCr: init.expectedValueCr,
      functions: ['strategy', 'architecture', 'engineering', 'technology', 'cyber'],
      actions: acts.map((a, k) => ({ ...a, id: `ACT-${did.slice(4)}-${k + 1}`, decisionId: did })),
    })
  }

  // ── 2. Customer-facing apps on end-of-life technology (spec 2 §5 example) ──
  const cfEol = d.applications.filter((a) => a.customerFacing && a.usesEol)
  if (cfEol.length >= 2) {
    const svcs = d.services.filter((s) => cfEol.some((a) => a.id === s.appId))
    const p1All = d.incidents.filter((i) => i.severity === 'P1' || i.severity === 'P2')
    const p1Mine = p1All.filter((i) => svcs.some((s) => s.id === i.serviceId))
    const share = p1All.length ? Math.round((p1Mine.length / p1All.length) * 100) : 0
    const cost = cfEol.reduce((s, a) => s + a.annualCostCr, 0)
    const ctl = d.controls[16]
    const cx = d.metrics.find((m) => m.functionId === 'cx' && m.key === 'complaints')!
    const did = id()
    out.push({
      id: did, domain: d.domain, title: `Modernise ${cfEol.length} customer-facing applications on end-of-life technology`, kind: 'Cross-functional insight', priority: share >= 30 ? 'High' : 'Medium',
      whyNow: `They generated ${share}% of P1/P2 incidents in the last 90 days and run on software with no security patches.`,
      signals: [
        { source: 'leanix', recordId: cfEol[0].id, health: 'Red', text: `${cfEol.map((a) => a.name).join(', ')} run on end-of-life technology.` },
        { source: 'datadog', recordId: svcs[0]?.id ?? cfEol[0].id, health: share >= 30 ? 'Red' : 'Amber', text: `${p1Mine.length} of ${p1All.length} P1/P2 incidents (${share}%) came from their services.` },
        { source: 'vanta', recordId: ctl.id, health: ctl.health, text: `Control "${ctl.control}" is ${ctl.controlStatus.toLowerCase()}.` },
        { source: 'business', recordId: cx.id, health: cx.status, text: `Complaints at ${cx.current} per 10k customers vs ${cx.target} target.` },
        { source: 'planview', recordId: cfEol[0].id, health: 'Amber', text: `${cr(cost)}/yr run cost on these applications.` },
      ],
      correlation: `Architecture (end-of-life stack), operations (incident share), security (unsupported software) and customer experience (complaints) point to the same ${cfEol.length} applications.`,
      insight: `Customer-facing reliability and security exposure are concentrated in a small, fixable set of legacy applications.`,
      recommendation: `Approve phased modernisation of ${cfEol.map((a) => a.name).join(', ')}; ring-fence them with compensating controls until replaced.`,
      expected: ['Fewer P1/P2 incidents on customer journeys', 'Unsupported software removed from customer paths', 'Complaints back towards target'],
      confidence: 84, owner: 'CTO with Head of Architecture', deadline: date(45),
      businessImpact: `${share}% of serious incidents hit customer journeys`, technologyImpact: `${cfEol.length} apps on end-of-life technology`,
      financialImpact: `${cr(cost)}/yr run cost; modernisation estimated ${cr(cost * 1.4)}`, risk: 'Unsupported software in customer paths',
      investmentCr: Math.round(cost * 1.4 * 10) / 10, benefitCr: Math.round(cost * 2.2 * 10) / 10, functions: ['architecture', 'technology', 'cyber', 'cx', 'finance'],
      actions: cfEol.slice(0, 3).map((a, k) => ({ id: `ACT-${did.slice(4)}-${k + 1}`, decisionId: did, action: `${a.name}: ${a.recommendation.toLowerCase()}`, owner: a.owner, due: date(90 + k * 30), priority: 'High' as Severity, expectedOutcome: 'Off end-of-life technology', evidence: a.id }))
        .concat([{ id: `ACT-${did.slice(4)}-9`, decisionId: did, action: 'Compensating controls (segmentation, WAF rules, monitoring) on the remaining legacy apps', owner: 'Vaibhav (CISO)', due: date(21), priority: 'High', expectedOutcome: 'Risk exception approved with controls', evidence: ctl.id }]),
    })
  }

  // ── 3. Engineering capacity rebalancing ──
  const short = d.teams.filter((t) => t.health === 'Red')
  const donor = lowPriDonor(short.map((t) => t.id))
  if (short.length && donor) {
    const late = d.projects.filter((p) => p.teamIds.some((x) => short.some((t) => t.id === x)) && p.health !== 'Green')
    const did = id()
    const need = short.reduce((s, t) => s + Math.ceil((t.engineers * t.capacityGap) / 100), 0)
    const eng = functionHealth(d, 'engineering')
    out.push({
      id: did, domain: d.domain, title: `Rebalance engineering capacity to ${short.map((t) => t.name).join(' and ')}`, kind: 'Portfolio', priority: 'High',
      whyNow: `${short.length} team(s) on critical initiatives are short by about ${need} engineers while ${donor.name} has spare capacity.`,
      signals: [
        ...short.map((t) => ({ source: 'jellyfish' as const, recordId: t.id, health: t.health, text: `${t.name}: capacity ${t.capacityGap}% below plan; predictability ${t.predictability}%.` })),
        ...late.slice(0, 2).map((p) => ({ source: 'servicenow' as const, recordId: p.id, health: p.health, text: `${p.name}: demand ${p.demandFte} FTE vs capacity ${p.capacityFte}.` })),
        { source: 'jellyfish', recordId: donor.id, health: 'Green', text: `${donor.name} is fully staffed (${donor.capacityGap}% gap) on a lower-priority initiative.` },
      ],
      correlation: `The projects running late are staffed by the same over-capacity teams; engineering health is ${eng.score}.`,
      insight: 'Capacity, not budget, is the binding constraint on the critical initiatives.',
      recommendation: `Move ${need} engineers from ${donor.name} and lower-priority work to ${short.map((t) => t.name).join(' and ')} for one quarter.`,
      expected: ['Capacity gap below 5% on critical teams', 'Milestone slippage stops', 'Release predictability above 80%'],
      confidence: 80, owner: 'VP Engineering', deadline: date(14),
      businessImpact: 'Critical initiatives keep their dates', technologyImpact: `${need} engineers redeployed`, financialImpact: 'Cost-neutral (reallocation)', risk: `${donor.name} roadmap slows for one quarter`,
      investmentCr: 0, benefitCr: Math.round(late.reduce((s, p) => s + p.budgetCr, 0) * 10) / 10, functions: ['engineering', 'strategy', 'hr'],
      actions: [
        { id: `ACT-${did.slice(4)}-1`, decisionId: did, action: `Agree the move of ${need} engineers with ${donor.manager}`, owner: 'VP Engineering', due: date(7), priority: 'High', expectedOutcome: 'Named engineers released', evidence: donor.id },
        ...short.map((t, k) => ({ id: `ACT-${did.slice(4)}-${k + 2}`, decisionId: did, action: `Onboard extra engineers into ${t.name}`, owner: t.manager, due: date(21), priority: 'High' as Severity, expectedOutcome: `Capacity gap below 5% (now ${t.capacityGap}%)`, evidence: t.id })),
      ],
    })
  }

  // ── 4. Budget overrun across the portfolio ──
  const over = d.initiatives.filter((i) => i.forecastCr > i.budgetCr * 1.05)
  const overCr = over.reduce((s, i) => s + i.forecastCr - i.budgetCr, 0)
  if (overCr >= 1.5) {
    const did = id()
    const fin = d.metrics.find((m) => m.functionId === 'finance' && m.key === 'forecast')!
    out.push({
      id: did, domain: d.domain, title: `Approve or contain ${cr(overCr)} forecast overrun`, kind: 'Investment', priority: overCr > 4 ? 'High' : 'Medium',
      whyNow: `${over.length} initiative(s) forecast more than 5% over budget; the quarterly re-forecast closes soon.`,
      signals: [
        ...over.slice(0, 3).map((i) => ({ source: 'planview' as const, recordId: i.id, health: i.health, text: `${i.name}: forecast ${cr(i.forecastCr)} vs ${cr(i.budgetCr)} (+${Math.round((i.forecastCr / i.budgetCr - 1) * 100)}%).` })),
        { source: 'business', recordId: fin.id, health: fin.status, text: `Portfolio forecast at ${fin.current}% of budget.` },
      ],
      correlation: 'Overruns sit on the same initiatives that are behind schedule — cost and delay share causes.',
      insight: 'Paying for the overrun only makes sense where the value case still holds.',
      recommendation: `Fund the overrun on initiatives with ROI above 150%; descope or re-phase the rest.`,
      expected: ['Forecast back within 2% of budget', 'Value case reconfirmed per initiative'],
      confidence: 76, owner: 'CFO with CTO', deadline: date(30),
      businessImpact: 'Investment discipline', technologyImpact: 'Possible scope reduction', financialImpact: `${cr(overCr)} unbudgeted spend`, risk: 'Value erosion',
      investmentCr: Math.round(overCr * 10) / 10, benefitCr: Math.round(over.reduce((s, i) => s + i.expectedValueCr, 0) * 10) / 10, functions: ['finance', 'strategy'],
      actions: over.slice(0, 3).map((i, k) => ({ id: `ACT-${did.slice(4)}-${k + 1}`, decisionId: did, action: `Re-baseline ${i.name}: fund, descope or re-phase`, owner: i.owner, due: date(30), priority: 'Medium' as Severity, expectedOutcome: 'Approved forecast within tolerance', evidence: i.id })),
    })
  }

  // ── 5. Risks outside appetite ──
  const outside = d.risks.filter((r) => r.severity === 'Critical' || (r.severity === 'High' && r.openedDays > 180))
  if (outside.length) {
    const did = id()
    out.push({
      id: did, domain: d.domain, title: `Decide on ${outside.length} risk${outside.length > 1 ? 's' : ''} outside appetite`, kind: 'Risk', priority: outside.some((r) => r.severity === 'Critical') ? 'High' : 'Medium',
      whyNow: `${outside.length} risk${outside.length > 1 ? 's are' : ' is'} critical, or high and open for more than 180 days.`,
      signals: outside.slice(0, 4).map((r) => ({ source: 'vanta' as const, recordId: r.id, health: r.health, text: `${r.name} — ${r.severity.toLowerCase()}, open ${r.openedDays} days (${r.origin}).` })),
      correlation: 'Ageing risks cluster around end-of-life technology and failing controls.',
      insight: 'Leaving these open is an implicit risk acceptance without a named owner.',
      recommendation: 'For each risk: fund mitigation now, or formally accept with an expiry date and compensating controls.',
      expected: ['No unowned critical risks', 'Remediation overdue count back to target'],
      confidence: 78, owner: 'Chief Risk Officer with CISO', deadline: date(30),
      businessImpact: 'Regulatory and audit exposure', technologyImpact: 'Unsupported technology and control gaps', financialImpact: 'Potential penalties', risk: outside.map((r) => r.id).join(', '),
      investmentCr: 0, benefitCr: 0, functions: ['risk', 'cyber', 'legal'],
      actions: outside.slice(0, 3).map((r, k) => ({ id: `ACT-${did.slice(4)}-${k + 1}`, decisionId: did, action: `Mitigate or formally accept: ${r.name}`, owner: r.owner, due: date(30), priority: r.severity, expectedOutcome: 'Risk owned with a dated decision', evidence: r.id })),
    })
  }

  // ── 6. Process automation opportunity (worst process not already in a story) ──
  const storyProcs = new Set(d.stories.map((s) => s.processId))
  const proc = [...d.processes].filter((p) => !storyProcs.has(p.id) && p.health !== 'Green').sort((a, b) => b.cycleTime / b.targetCycleTime - a.cycleTime / a.targetCycleTime)[0]
  if (proc) {
    const did = id()
    const a = app(proc.appIds[0])
    out.push({
      id: did, domain: d.domain, title: `Fund automation of ${proc.name}`, kind: 'Process', priority: proc.health === 'Red' ? 'High' : 'Medium',
      whyNow: `${proc.name} runs at ${(proc.cycleTime / proc.targetCycleTime).toFixed(1)}× its target cycle time with ${proc.automationRate}% automation.`,
      signals: [
        { source: 'process', recordId: proc.id, health: proc.health, text: `${proc.cycleTime} ${proc.unit} vs ${proc.targetCycleTime} ${proc.unit}; ${proc.exceptionRate}% exceptions; bottleneck: ${proc.bottleneck.toLowerCase()}.` },
        { source: 'leanix', recordId: a.id, health: a.health, text: `Depends on ${a.name} (${a.lifecycle}, technical health ${a.techHealth}).` },
        { source: 'business', recordId: proc.id, health: 'Amber', text: proc.businessImpact },
      ],
      correlation: `The bottleneck sits on a manual step around ${a.name}.`,
      insight: `${proc.opportunity} would remove the main bottleneck.`,
      recommendation: `${proc.opportunity}; measure cycle time weekly.`,
      expected: [`Cycle time towards ${proc.targetCycleTime} ${proc.unit}`, 'Exception rate halved'],
      confidence: 72, owner: `${proc.owner} with Head of Enterprise Apps`, deadline: date(45),
      businessImpact: proc.businessImpact, technologyImpact: `Change to ${a.name}`, financialImpact: 'Small build; operating savings', risk: 'Change adoption',
      investmentCr: 0.8, benefitCr: 2.4, functions: ['operations', 'cx'],
      actions: [{ id: `ACT-${did.slice(4)}-1`, decisionId: did, action: proc.opportunity, owner: proc.owner, due: date(90), priority: 'Medium', expectedOutcome: `Cycle time below ${(proc.targetCycleTime * 1.2).toFixed(1)} ${proc.unit}`, evidence: proc.id }],
    })
  }

  // ── 7–8. Decisions approved earlier (Jul 2026) — the loop closed with measured outcomes ──
  const m = (fn: FunctionId, key: string) => d.metrics.find((x) => x.functionId === fn && x.key === key)!
  const outcome = (x: Metric): OutcomeRow => {
    const baseline = x.series[8], cur = x.current
    const good = x.better === 'up' ? cur >= x.target : cur <= x.target
    const moving = x.better === 'up' ? cur > baseline : cur < baseline
    return { metric: x, baseline, target: x.target, current: cur, variance: Math.round((cur - x.target) * 100) / 100, status: good ? 'Target met' : moving ? 'On track' : 'Behind' }
  }
  const pre = [
    { title: 'Accelerate cloud adoption and FinOps', owner: 'Ram (CTO)', o: [m('technology', 'cloud'), m('finance', 'savings')], acts: [['Move wave-2 workloads to cloud', 'Head of Cloud', 'Completed', 'Wave 2 live'], ['Introduce FinOps rightsizing', 'Head of Cloud', 'In Progress', '']] },
    { title: 'Put priority AI use cases into production', owner: 'Head of Data & AI', o: [m('data-ai', 'usecases'), m('data-ai', 'aivalue')], acts: [['Productionise the top use cases with MLOps', 'Head of Data & AI', 'Completed', 'Models live with monitoring'], ['Responsible-AI review for each model', 'Vaibhav (CISO)', 'In Progress', '']] },
  ]
  for (const p of pre) {
    const did = id()
    const outs = p.o.map(outcome)
    out.push({
      id: did, domain: d.domain, title: p.title, kind: 'Approved earlier', priority: 'Medium', whyNow: 'Approved on 6 Jul 2026 — tracking outcomes.',
      signals: outs.map((o) => ({ source: o.metric.derived ? (o.metric.source as Signal['source']) : 'business', recordId: o.metric.id, health: o.metric.status, text: `${o.metric.name}: ${o.baseline} → ${o.current} (target ${o.target}).` })),
      correlation: 'Measured against the baseline at approval (Jul 2026).', insight: outs.every((o) => o.status !== 'Behind') ? 'The decision is delivering.' : 'Part of the expected outcome is behind.',
      recommendation: 'Continue; review at the next quarterly checkpoint.', expected: outs.map((o) => `${o.metric.name} to ${o.target}`), confidence: 90, owner: p.owner, deadline: date(90),
      businessImpact: '', technologyImpact: '', financialImpact: '', risk: '', investmentCr: 0, benefitCr: 0, functions: [p.o[0].functionId, p.o[1].functionId],
      actions: p.acts.map(([a, owner, st, actual], k) => ({ id: `ACT-${did.slice(4)}-${k + 1}`, decisionId: did, action: a, owner, due: date(k ? 30 : -20), priority: 'Medium' as Severity, expectedOutcome: `${outs[k].metric.name} towards ${outs[k].target}`, evidence: outs[k].metric.id, preset: { status: st as ActionStatus, actual: actual || undefined } })),
      preset: { status: 'Approved', decidedOn: '2026-07-06', by: p.owner, outcomes: outs, chain: [p.title, p.acts[0][0], `${outs[0].metric.name} ${outs[0].baseline} → ${outs[0].current}`, `${outs[1].metric.name} ${outs[1].baseline} → ${outs[1].current}`] },
    })
  }
  return out
}

export const topDecisions = (all: Decision[], n = 10) => all.filter((x) => !x.preset).sort((a, b) => rank[a.priority] - rank[b.priority] || b.confidence - a.confidence || b.benefitCr - a.benefitCr).slice(0, n)

// ── Maturity (management visualisation, NOT a CMMI assessment) ──
export const LEVELS = ['Visibility', 'Managed tracking', 'Standardised', 'Quantitatively managed', 'Continuous optimisation']
export function maturity(d: DomainData) {
  const bad = (h: string) => h !== 'Green'
  const appBad = new Set(d.applications.filter((a) => a.usesEol || a.health === 'Red').map((a) => a.id))
  const svcBadApps = new Set(d.services.filter((x) => bad(x.health)).map((x) => x.appId))
  const ctlApps = new Set(d.controls.filter((c) => c.controlStatus !== 'Passing').flatMap((c) => c.appIds))
  // relevance of an initiative to each area = how many of that source's problem records it carries
  const score: Record<string, (i: (typeof d.initiatives)[number]) => number> = {
    planview: (i) => (bad(i.health) ? i.plannedProgress - i.progress + (i.forecastCr / i.budgetCr - 1) * 50 : 0),
    leanix: (i) => i.appIds.filter((a) => appBad.has(a)).length,
    process: (i) => i.processIds.filter((p) => bad(d.processes.find((x) => x.id === p)!.health)).length,
    servicenow: (i) => i.projectIds.filter((p) => bad(d.projects.find((x) => x.id === p)!.health)).length,
    jellyfish: (i) => i.teamIds.filter((t) => bad(d.teams.find((x) => x.id === t)!.health)).length,
    datadog: (i) => i.appIds.filter((a) => svcBadApps.has(a)).length,
    vanta: (i) => d.risks.filter((r) => r.initiativeId === i.id && (r.severity === 'High' || r.severity === 'Critical')).length + i.appIds.filter((a) => ctlApps.has(a)).length,
  }
  const used: Record<string, number> = {}
  return sourceHealth(d).map((s) => {
    const current = Math.max(1, Math.min(5, Math.round((1 + (s.score - 40) / 15) * 10) / 10))
    const target = s.id === 'vanta' || s.id === 'datadog' ? 4.5 : 4
    const fn = FN[s.primaryFunction]
    const inits = d.initiatives.map((i) => ({ i, v: score[s.id](i) })).filter((x) => x.v > 0)
      .sort((a, b) => b.v - (used[b.i.id] ?? 0) * 0.75 - (a.v - (used[a.i.id] ?? 0) * 0.75)).slice(0, 2).map((x) => x.i)
    inits.forEach((i) => { used[i.id] = (used[i.id] ?? 0) + 1 })
    const targetDate = inits.map((i) => i.target).sort().pop() ?? date(365)
    return { area: s.capability, source: s.label, slug: s.slug, current, target, gap: Math.max(0, Math.round((target - current) * 10) / 10), level: LEVELS[Math.min(4, Math.floor(current) - 1)], owner: fn.owner, fn: fn.id, initiatives: inits, targetDate }
  })
}
export { MONTHS, SOURCES }
