// Builder: domain config → canonical CTO360 entities. Every health / status / severity is CALCULATED here
// from rules, never typed in the config. Randomness is seeded, so the data is identical on every load.
import type { DomainConfig } from './config'
import type {
  Application, Control, ControlStatus, Criticality, DomainData, DomainId, Incident, Initiative, Metric, Objective,
  Process, Project, Rag, Risk, Service, Severity, SourceId, Story, Team, Technology, TechLifecycle,
} from './model'
import { SIM_NOW } from './model'
import { FUNCTIONS } from './functions'
import { forecast, pad, rng, round, series } from './rng'
import { metricScore } from './scoring'

const NOW = new Date(SIM_NOW).getTime()
const DAY = 86_400_000
const iso = (t: number) => new Date(t).toISOString()
const date = (t: number) => new Date(t).toISOString().slice(0, 10)
const addDays = (d: string, n: number) => date(new Date(d).getTime() + n * DAY)
const ago = (minutes: number) => iso(NOW - minutes * 60_000)

export const CONTROL_TEMPLATES = [
  'Privileged access reviewed quarterly', 'MFA enforced for all administrative access', 'Leaver access removed within 24 hours',
  'Critical vulnerabilities patched within 15 days', 'Endpoint detection on all servers and laptops', 'Sensitive data encrypted at rest',
  'TLS 1.2+ on all external interfaces', 'Security logs centralised and kept for 1 year', 'Incident response plan tested annually',
  'Backup restore tested quarterly', 'DR test for Tier 0 applications twice a year', 'Changes approved and tested before production',
  'Segregation of duties for production deployment', 'Vendor risk assessed before onboarding', 'Code scanning before every release',
  'Critical environments network-segmented', 'Unsupported software removed or risk-accepted', 'Data classification and DLP on sensitive data',
  'Card / customer data masked in logs and non-production', 'Security awareness training completed', 'AI models reviewed for bias and explainability',
  'Consent recorded for personal data processing', 'Cloud misconfigurations monitored continuously', 'Business continuity plan reviewed annually',
]

const CRIT: Record<'M' | 'B' | 'O' | 'A', Criticality> = { M: 'Mission critical', B: 'Business critical', O: 'Business operational', A: 'Administrative' }
const SLO: Record<Criticality, number> = { 'Mission critical': 99.95, 'Business critical': 99.9, 'Business operational': 99.5, Administrative: 99 }
const sevOf = (score: number): Severity => (score >= 20 ? 'Critical' : score >= 12 ? 'High' : score >= 6 ? 'Medium' : 'Low')
const worst = (xs: Rag[]): Rag => (xs.includes('Red') ? 'Red' : xs.includes('Amber') ? 'Amber' : 'Green')

export function build(domain: DomainId, c: DomainConfig): DomainData {
  const id = (p: string, i: number, w = 3) => `${p}-${c.code}-${pad(i + 1, w)}`
  const R = rng(`${domain}-build`)
  const upd = () => ago(R.int(1, 240))
  const base = (p: string, i: number, w: number, name: string, owner: string, source: SourceId) =>
    ({ id: id(p, i, w), name, domain, owner, source, updated: upd(), why: [] as string[] })

  // ── Technologies (lifecycle from EOL date vs simulation "now") ──
  const technologies: Technology[] = c.tech.map(([name, version, vendor, eol], i) => {
    const left = eol ? (new Date(eol).getTime() - NOW) / DAY : Infinity
    const lifecycle: TechLifecycle = left < 0 ? 'End of life' : left < 365 ? 'Extended support' : left < 365 * 3 ? 'Mainstream' : 'Current'
    return { ...base('TECH', i, 3, `${name} ${version}`, 'Head of Architecture', 'leanix'), version, vendor, lifecycle, eolDate: eol, appIds: [], criticality: 'Low' as Severity, status: lifecycle, health: 'Green' as Rag }
  })

  // ── Applications ──
  const applications: Application[] = c.apps.map((a, i) => {
    const [name, cap, crit, lifecycle, techHealth, fit, cost, users, hosting, cloud, stack, techIdx, deps, owner, bizOwner, cf, legacyId] = a
    const criticality = CRIT[crit]
    const techIds = techIdx.map((t) => technologies[t].id)
    const usesEol = techIdx.some((t) => technologies[t].lifecycle === 'End of life')
    const why: string[] = []
    if (usesEol) why.push(`runs on end-of-life ${techIdx.filter((t) => technologies[t].lifecycle === 'End of life').map((t) => technologies[t].name).join(', ')}`)
    if (techHealth < 55) why.push(`technical health ${techHealth}/100`)
    if (lifecycle === 'Migrate' || lifecycle === 'Retire') why.push(`lifecycle: ${lifecycle.toLowerCase()}`)
    const health: Rag = techHealth < 40 || (crit === 'M' && usesEol && techHealth < 55) ? 'Red' : usesEol || techHealth < 65 || lifecycle === 'Migrate' || lifecycle === 'Retire' ? 'Amber' : 'Green'
    const recommendation =
      lifecycle === 'Retire' ? 'Retire and move remaining functions to strategic platforms'
      : lifecycle === 'Migrate' ? 'Migrate off the legacy stack; decouple dependants first'
      : usesEol ? 'Upgrade end-of-life components this year'
      : lifecycle === 'Invest' ? 'Invest — scale adoption and capacity'
      : lifecycle === 'Strategic' ? 'Keep as a strategic platform'
      : 'Maintain; review at the next portfolio cycle'
    return {
      ...base('APP', i, 3, name, owner, 'leanix'), why, health, status: lifecycle,
      capability: c.capabilities[cap], criticality, businessOwner: bizOwner, lifecycle, techHealth, functionalFit: fit,
      annualCostCr: cost, users, hosting, cloud, stack, techIds, dependsOn: deps.map((d) => id('APP', d)), recommendation, usesEol, customerFacing: cf, legacyId,
    }
  })
  const critRank: Record<Criticality, Severity> = { 'Mission critical': 'Critical', 'Business critical': 'High', 'Business operational': 'Medium', Administrative: 'Low' }
  const sevRank: Severity[] = ['Low', 'Medium', 'High', 'Critical']
  technologies.forEach((t, ti) => {
    const users = applications.filter((_, ai) => c.apps[ai][11].includes(ti))
    t.appIds = users.map((a) => a.id)
    t.criticality = users.reduce<Severity>((m, a) => (sevRank.indexOf(critRank[a.criticality]) > sevRank.indexOf(m) ? critRank[a.criticality] : m), 'Low')
    const mc = users.some((a) => a.criticality === 'Mission critical')
    if (t.lifecycle === 'End of life' && users.length) t.why.push(`past end of support since ${t.eolDate}`, `${users.length} application(s) still use it`)
    if (t.lifecycle === 'Extended support') t.why.push(`support ends ${t.eolDate}`)
    t.health = t.lifecycle === 'End of life' && mc ? 'Red' : t.lifecycle === 'End of life' || t.lifecycle === 'Extended support' ? 'Amber' : 'Green'
  })

  // ── Processes (Celonis + Signavio style) ──
  const processes: Process[] = c.processes.map((p, i) => {
    const [name, owner, unit, cycle, target, conf, auto, exc, bottleneck, impact, appIdx, opp, stage] = p
    const ratio = cycle / target
    const why: string[] = []
    if (ratio > 1.1) why.push(`cycle time ${cycle} ${unit} vs ${target} ${unit} target`)
    if (conf < 85) why.push(`conformance ${conf}%`)
    if (exc > 8) why.push(`exception rate ${exc}%`)
    const health: Rag = ratio > 2.2 || conf < 75 ? 'Red' : ratio > 1.1 || conf < 85 || exc > 8 ? 'Amber' : 'Green'
    const start = health === 'Red' ? cycle * 0.8 : cycle * 1.15
    return {
      ...base('PROC', i, 2, name, owner, 'process'), why, health, status: stage,
      unit, cycleTime: cycle, targetCycleTime: target, conformance: conf, automationRate: auto, exceptionRate: exc,
      bottleneck, businessImpact: impact, appIds: appIdx.map((a) => applications[a].id), opportunity: opp, stage,
      series: series(`${domain}-proc-${i}`, start, cycle, { noise: 0.04, dp: 1, min: 0 }),
    }
  })

  // ── Teams (Jellyfish style — team level only) ──
  const teams: Team[] = c.teams.map((t, i) => {
    const [name, product, manager, engineers, init, roadmap, unplanned, debt, deploys, lead, predict, gap, appIdx] = t
    const why: string[] = []
    if (gap > 8) why.push(`capacity ${gap}% below plan`)
    if (predict < 80) why.push(`predictability ${predict}%`)
    if (unplanned > 25) why.push(`${unplanned}% unplanned work`)
    const health: Rag = gap > 15 || predict < 70 ? 'Red' : gap > 8 || predict < 80 || unplanned > 25 ? 'Amber' : 'Green'
    return {
      ...base('TEAM', i, 2, name, manager, 'jellyfish'), why, health, status: health === 'Green' ? 'Healthy' : health === 'Amber' ? 'Stretched' : 'Over capacity',
      product, manager, engineers, initiativeId: id('INIT', init),
      allocation: { roadmap, unplanned, techDebt: debt, keepTheLightsOn: 100 - roadmap - unplanned - debt },
      deploysPerWeek: deploys, leadTimeDays: lead, cycleTimeDays: round(lead * 0.6), prThroughput: Math.round(engineers * 2.2 * (predict / 100)),
      wip: Math.round(engineers * 0.6), predictability: predict, capacityGap: gap, appIds: appIdx.map((a) => applications[a].id),
      debtSeries: series(`${domain}-debt-${i}`, debt - 4, debt, { noise: 0.05, dp: 0, min: 0 }),
    }
  })

  // ── Projects (ServiceNow SPM style) ──
  const projects: Project[] = c.projects.map((p, i) => {
    const [name, program, init, pm, budget, fcPct, start, plannedEnd, slip, progress, planned, demand, capacity, due, late, teamIdx, appIdx] = p
    const why: string[] = []
    if (slip > 0) why.push(`forecast ${slip} days late`)
    if (fcPct > 105) why.push(`forecast ${fcPct - 100}% over budget`)
    if (late > 0) why.push(`${late} of ${due} milestones late`)
    if (demand > capacity * 1.1) why.push(`demand ${demand} FTE vs capacity ${capacity}`)
    const health: Rag = slip > 30 || fcPct > 110 || late >= 2 ? 'Red' : slip > 0 || fcPct > 105 || late > 0 || demand > capacity * 1.1 ? 'Amber' : 'Green'
    return {
      ...base('PRJ', i, 3, name, pm, 'servicenow'), why, health, status: health === 'Green' ? 'On track' : health === 'Amber' ? 'At risk' : 'Delayed',
      program, initiativeId: id('INIT', init), businessUnit: c.capabilities[applications[appIdx[0]] ? c.apps[appIdx[0]][1] : 0], sponsor: c.initiatives[init].sponsor, pm,
      budgetCr: budget, actualCr: round((budget * progress) / 100 * (fcPct / 100), 2), forecastCr: round((budget * fcPct) / 100, 2),
      start, plannedEnd, forecastEnd: addDays(plannedEnd, slip), progress, plannedProgress: planned, demandFte: demand, capacityFte: capacity,
      milestonesDue: due, milestonesLate: late, teamIds: teamIdx.map((t) => teams[t].id), appIds: appIdx.map((a) => applications[a].id),
      risk: health === 'Red' ? 'High' : health === 'Amber' ? 'Medium' : 'Low',
    }
  })

  // ── Initiatives & objectives (Planview style) ──
  const initiatives: Initiative[] = c.initiatives.map((x, i) => {
    const gap = x.planned - x.progress
    const over = x.forecastPct - 100
    const why: string[] = []
    if (gap > 5) why.push(`${gap} points behind plan`)
    if (over > 5) why.push(`forecast ${over}% over budget`)
    if (x.realizedPct < 70) why.push(`value realisation ${x.realizedPct}% of plan`)
    const health: Rag = gap > 10 || over > 10 ? 'Red' : gap > 5 || over > 5 || x.realizedPct < 70 ? 'Amber' : 'Green'
    const iid = id('INIT', i)
    const appIds = x.apps.map((a) => applications[a].id)
    return {
      ...base('INIT', i, 3, x.name, x.owner, 'planview'), why, health, status: health === 'Green' ? 'On track' : health === 'Amber' ? 'At risk' : 'Off track',
      objectiveId: id('OBJ', x.obj, 2), sponsor: x.sponsor, start: x.start, target: x.target,
      budgetCr: x.budget, actualCr: round((x.budget * x.progress) / 100 * (x.forecastPct / 100), 2), forecastCr: round((x.budget * x.forecastPct) / 100, 2),
      progress: x.progress, plannedProgress: x.planned, expectedRoi: x.roi, expectedValueCr: x.value,
      valueRealizedCr: round(x.value * (x.progress / 100) * 0.6 * (x.realizedPct / 100), 2),
      risk: health === 'Red' ? 'High' : health === 'Amber' ? 'Medium' : 'Low',
      appIds, dependsOn: (x.deps ?? []).map((d) => id('INIT', d)),
      projectIds: projects.filter((p) => p.initiativeId === iid).map((p) => p.id),
      teamIds: teams.filter((t) => t.initiativeId === iid).map((t) => t.id),
      processIds: processes.filter((p) => p.appIds.some((a) => appIds.includes(a))).map((p) => p.id),
    }
  })
  const objectives: Objective[] = c.objectives.map(([name, outcome, sponsor, owner, priority, targetDate], i) => {
    const oid = id('OBJ', i, 2)
    const ins = initiatives.filter((x) => x.objectiveId === oid)
    const inv = ins.reduce((s, x) => s + x.budgetCr, 0)
    const health = worst(ins.map((x) => x.health))
    return {
      ...base('OBJ', i, 2, name, owner, 'planview'), why: ins.filter((x) => x.health !== 'Green').map((x) => `${x.name}: ${x.status.toLowerCase()}`), health,
      status: health === 'Green' ? 'On track' : health === 'Amber' ? 'At risk' : 'Off track',
      outcome, sponsor, priority, targetDate, progress: Math.round(ins.reduce((s, x) => s + x.progress * x.budgetCr, 0) / (inv || 1)),
      investmentCr: round(inv, 2), expectedValueCr: round(ins.reduce((s, x) => s + x.expectedValueCr, 0), 2), realizedValueCr: round(ins.reduce((s, x) => s + x.valueRealizedCr, 0), 2),
      risk: health === 'Red' ? 'High' : health === 'Amber' ? 'Medium' : 'Low', initiativeIds: ins.map((x) => x.id),
    }
  })

  // ── Services & incidents (Datadog style) — availability is DERIVED from incident downtime ──
  const storySvc = new Map(c.stories.map((s, k) => [s.service, k]))
  const raw: Omit<Incident, 'id'>[] = []
  const svcMeta = c.services.map(([name, appIdx, stress, latT, rpm, cost, teamIdx], i) => {
    const r = rng(`${domain}-svc-${i}`)
    const sid = id('SVC', i)
    const n = Math.round(stress * 5 + r.next())
    const team = teams[teamIdx]
    for (let k = 0; k < n; k++) {
      const forced = k === 0 && storySvc.has(i)
      const x = r.next()
      const p1 = Math.max(0, stress - 0.4) * 0.35
      let sev: Incident['severity'] = x < p1 ? 'P1' : x < p1 + stress * 0.35 ? 'P2' : x < p1 + stress * 0.35 + 0.35 ? 'P3' : 'P4'
      let daysAgo = Math.floor(90 * r.next() ** (1 + stress))
      if (forced) { sev = stress >= 0.6 ? 'P1' : 'P2'; daysAgo = 3 + storySvc.get(i)! * 5 }
      const dur = sev === 'P1' ? r.int(60, 200) : sev === 'P2' ? r.int(30, 120) : sev === 'P3' ? r.int(15, 60) : r.int(10, 30)
      const cause = r.pick(c.rootCauses)
      const change = /deploy|change|release/i.test(cause) || r.next() < 0.25
      raw.push({
        domain, severity: sev, serviceId: sid, start: iso(NOW - daysAgo * DAY - r.int(0, 23) * 3_600_000), durationMin: dur, rootCause: cause,
        businessImpact: `${name} ${sev === 'P1' ? 'unavailable' : 'degraded'} for ${dur} min`,
        customersImpacted: sev === 'P1' || sev === 'P2' ? Math.round(rpm * dur * (sev === 'P1' ? 0.6 : 0.15)) : 0,
        owner: team.manager, resolution: r.pick(['Rolled back the release', 'Restarted and scaled out', 'Failed over to secondary', 'Applied vendor fix', 'Cleared blocking sessions', 'Renewed certificate']),
        relatedChange: change ? `CHG-${c.code}-${4000 + raw.length}` : null, status: daysAgo === 0 ? 'Open' : 'Resolved', source: 'datadog',
      })
    }
    return { sid, name, appIdx, stress, latT, rpm, cost, teamIdx, r }
  })
  raw.sort((a, b) => a.start.localeCompare(b.start))
  const incidents: Incident[] = raw.map((x, k) => ({ id: `INC-${c.code}-${pad(101 + k, 4)}`, ...x }))

  const services: Service[] = svcMeta.map(({ sid, name, appIdx, stress, latT, rpm, cost, teamIdx, r }, i) => {
    const app = applications[appIdx]
    const slo = SLO[app.criticality]
    const mine = incidents.filter((x) => x.serviceId === sid)
    const last30 = mine.filter((x) => NOW - new Date(x.start).getTime() <= 30 * DAY)
    const downtime = last30.reduce((s, x) => s + (x.severity === 'P1' ? x.durationMin : x.severity === 'P2' ? x.durationMin * 0.5 : 0), 0)
    const availability = round(99.99 - (downtime / 43200) * 100 - r.next() * 0.01, 2)
    const latencyMs = Math.round(latT * (0.55 + stress * 0.7 + r.next() * 0.1))
    const p1 = last30.filter((x) => x.severity === 'P1').length
    const why: string[] = []
    if (availability < slo) why.push(`availability ${availability}% below ${slo}% SLO`)
    if (p1) why.push(`${p1} P1 in 30 days`)
    if (last30.length >= 4) why.push(`${last30.length} incidents in 30 days`)
    if (latencyMs > latT) why.push(`latency ${latencyMs} ms vs ${latT} ms target`)
    const health: Rag = (p1 > 0 && availability < slo) || availability < slo - 0.1 ? 'Red' : availability < slo || last30.length >= 4 || latencyMs > latT ? 'Amber' : 'Green'
    const startAvail = stress > 0.5 ? Math.min(99.99, slo + 0.02) : availability
    const availabilitySeries = series(`${domain}-avail-${i}`, startAvail, availability, { noise: 0.02, dp: 2, max: 99.99 })
    return {
      ...base('SVC', i, 3, name, teams[teamIdx].manager, 'datadog'), why, health, status: health === 'Green' ? 'Healthy' : health === 'Amber' ? 'Degraded' : 'Critical',
      appId: app.id, capability: app.capability, environment: 'Production', availability, slo, latencyMs, latencyTargetMs: latT,
      errorRate: round(0.05 + stress * 0.6 + r.next() * 0.05, 2), requestsPerMin: rpm, incidents30: last30.length, p1_30: p1,
      mttrH: round(mine.reduce((s, x) => s + x.durationMin, 0) / (mine.length || 1) / 60, 1),
      sloCompliance: Math.round((availabilitySeries.filter((v) => v >= slo).length / 12) * 100), costCrYr: cost, teamId: teams[teamIdx].id, availabilitySeries,
    }
  })

  // ── Controls (Vanta style monitoring — not a certification) ──
  const controls: Control[] = CONTROL_TEMPLATES.map((text, i) => {
    const o = c.controlOverrides[i]
    const st: ControlStatus = o ? o[0] : 'Passing'
    const framework = c.frameworks[i] ?? 'ISO 27001'
    const tested = st === 'Not tested' ? null : date(NOW - R.int(5, 80) * DAY)
    const why = st === 'Passing' ? [] : [st === 'Failing' ? 'latest automated test failed' : st === 'Exception' ? 'running on an approved exception' : 'no test evidence collected']
    return {
      ...base('CTL', i, 3, text, framework === 'PCI DSS' ? 'Head of Payments Security' : framework.includes('AI') ? 'Head of Data & AI' : 'Vaibhav (CISO)', 'vanta'),
      why, health: (st === 'Failing' ? 'Red' : st === 'Passing' ? 'Green' : 'Amber') as Rag, status: st,
      framework, control: text, controlStatus: st, evidence: st === 'Passing' ? 'Automated test passed' : st === 'Failing' ? 'Failed test' : st === 'Exception' ? 'Exception approved' : 'Missing',
      lastTested: tested ?? '—', nextReview: tested ? addDays(tested, 90) : date(NOW + 14 * DAY), exceptions: o ? o[1] : 0, appIds: o ? o[2].map((a) => applications[a].id) : [],
    }
  })

  // ── Risks: raised from simulated CONDITIONS, plus a few hand-written baseline risks ──
  const risks: Risk[] = []
  const addRisk = (x: Omit<Risk, keyof ReturnType<typeof base> | 'health' | 'status' | 'severity' | 'openedDays'> & { name: string; owner: string; openedDays?: number }) => {
    const i = risks.length
    const severity = sevOf(x.likelihood * x.impact)
    const openedDays = x.openedDays ?? R.int(10, 150)
    risks.push({ ...base('RISK', i, 3, x.name, x.owner, 'vanta'), ...x, severity, openedDays,
      health: severity === 'Critical' ? 'Red' : severity === 'High' ? 'Amber' : 'Green', status: openedDays < 45 ? 'Open' : 'Mitigating', why: [x.origin] })
  }
  for (const ct of controls.filter((x) => x.controlStatus !== 'Passing')) {
    const L = ct.controlStatus === 'Failing' ? 4 : 2
    addRisk({ name: `${ct.control} — ${ct.controlStatus === 'Not tested' ? 'not tested' : ct.controlStatus === 'Failing' ? 'control failing' : 'on exception'}`, owner: ct.owner, category: ct.framework.includes('AI') ? 'Data & AI' : ct.framework === 'PCI DSS' || ct.framework.includes('Cyber') ? 'Cyber' : 'Regulatory',
      businessImpact: ct.framework === 'PCI DSS' ? 'Card scheme penalties and loss of certification readiness' : 'Regulatory finding and audit exposure',
      techImpact: `${ct.appIds.length || 'Several'} application(s) affected`, likelihood: L, impact: 4, mitigation: ct.controlStatus === 'Failing' ? 'Fix the failing control and re-test' : 'Complete evidence and close the exception',
      due: ct.nextReview, appId: ct.appIds[0] ?? null, initiativeId: null, controlIds: [ct.id], origin: `Control ${ct.id} ${ct.controlStatus.toLowerCase()}` })
  }
  for (const t of technologies.filter((x) => x.lifecycle === 'End of life' && x.appIds.length)) {
    const users = applications.filter((a) => t.appIds.includes(a.id))
    const I = users.some((a) => a.criticality === 'Mission critical' && (a.customerFacing || a.users > 1000)) ? 5 : users.some((a) => a.criticality === 'Mission critical') ? 4 : users.some((a) => a.criticality === 'Business critical') ? 3 : 2
    const L = Math.min(...users.map((a) => a.techHealth)) < 45 ? 3 : 2
    const ctl = controls[16]
    addRisk({ name: `${t.name} past end of support`, owner: 'Head of Architecture', category: 'Technology',
      businessImpact: `Supports ${users.map((a) => a.name).join(', ')}`, techImpact: `No security patches since ${t.eolDate}`, likelihood: L, impact: I,
      mitigation: 'Upgrade, replace or ring-fence with compensating controls', due: date(NOW + 180 * DAY), appId: users[0].id, initiativeId: null,
      controlIds: [ctl.id], origin: `Technology ${t.id} end of life`, openedDays: Math.round((NOW - new Date(t.eolDate!).getTime()) / DAY) })
  }
  for (const x of initiatives.filter((i) => i.health === 'Red')) {
    const pr = objectives.find((o) => o.id === x.objectiveId)!.priority
    addRisk({ name: `${x.name} will miss its target`, owner: x.owner, category: 'Delivery', businessImpact: `${x.expectedValueCr} Cr expected value delayed`,
      techImpact: x.why.join('; '), likelihood: 4, impact: pr === 'Critical' ? 5 : 4, mitigation: 'Re-plan scope and capacity; resolve blocking dependencies', due: x.target,
      appId: x.appIds[0] ?? null, initiativeId: x.id, controlIds: [], origin: `Initiative ${x.id} off track` })
  }
  for (const s of services.filter((x) => x.health === 'Red' && x.p1_30 > 0)) {
    addRisk({ name: `${s.name} reliability below SLO`, owner: s.owner, category: 'Operational', businessImpact: `${s.capability} disruption`,
      techImpact: s.why.join('; '), likelihood: 3, impact: 4, mitigation: 'Problem management on top causes; capacity and resilience fixes', due: date(NOW + 45 * DAY),
      appId: s.appId, initiativeId: null, controlIds: [], origin: `Service ${s.id} critical` })
  }
  for (const t of teams.filter((x) => x.health === 'Red')) {
    addRisk({ name: `${t.name} team over capacity`, owner: t.manager, category: 'Delivery', businessImpact: `Delivery of ${initiatives.find((i) => i.id === t.initiativeId)!.name} at risk`,
      techImpact: t.why.join('; '), likelihood: 3, impact: 3, mitigation: 'Rebalance capacity from lower-priority work', due: date(NOW + 30 * DAY),
      appId: t.appIds[0] ?? null, initiativeId: t.initiativeId, controlIds: [], origin: `Team ${t.id} over capacity` })
  }
  for (const [name, cat, L, I, owner, mit, due, appIdx, initIdx, impact] of c.baselineRisks) {
    addRisk({ name, owner, category: cat, businessImpact: impact, techImpact: appIdx !== null ? applications[appIdx].name : 'Enterprise-wide', likelihood: L, impact: I, mitigation: mit, due,
      appId: appIdx !== null ? applications[appIdx].id : null, initiativeId: initIdx !== null ? initiatives[initIdx].id : null, controlIds: [], origin: 'Risk workshop (baseline register)' })
  }

  const stories: Story[] = c.stories.map((s, k) => ({
    id: `STORY-${c.code}-${k + 1}`, title: s.title, initiativeId: initiatives[s.initiative].id, appIds: s.apps.map((a) => applications[a].id),
    processId: processes[s.process].id, projectId: projects[s.project].id, teamId: teams[s.team].id, serviceId: services[s.service].id, controlId: controls[s.control].id,
    riskId: risks.filter((r) => r.initiativeId === initiatives[s.initiative].id || r.controlIds.includes(controls[s.control].id) || s.apps.some((a) => r.appId === applications[a].id))
      .sort((x, y) => sevRank.indexOf(y.severity) - sevRank.indexOf(x.severity))[0]?.id,
  }))

  const data: DomainData = { domain, code: c.code, org: c.org, capabilities: c.capabilities, objectives, initiatives, applications, technologies, processes, projects, teams, services, incidents, risks, controls, metrics: [], stories }

  // ── Metrics: 16 functions × 6 (derived from entities, or simulated business data) ──
  for (const f of FUNCTIONS) {
    for (const m of f.metrics) {
      let current: number, target: number, start: number | undefined
      if (m.derive) ({ current, target } = m.derive(data, c.plan))
      else {
        const v = c.business[f.id]?.[m.key]
        if (!v) throw new Error(`${domain}: missing business value ${f.id}.${m.key}`)
        ;[current, target, start] = v
      }
      const dp = m.dp ?? (m.unit === '%' || m.unit.includes('Cr') ? 1 : 1)
      current = round(current, dp); target = round(target, dp)
      const s0 = metricScore(m, current, target)
      if (start === undefined) {
        const [g, a] = s0.band
        const sign = m.better === 'up' ? 1 : -1
        start = s0.status === 'Red' ? current + sign * a : current - sign * g * 2
      }
      const isPct = m.unit === '%' && !m.open
      const ser = series(`${domain}-${f.id}-${m.key}`, start, current, { noise: 0.04, dp, min: 0, max: isPct ? 100 : Infinity })
      const previous = ser[8]
      const diff = m.better === 'up' ? current - previous : previous - current
      const thr = Math.max(s0.band[0], Math.abs(target) * 0.01) * 0.3
      const metric: Metric = {
        id: `MET-${c.code}-${f.id}-${m.key}`, key: m.key, functionId: f.id, col: m.col, name: m.name, unit: m.unit, current, target, previous, better: m.better,
        variancePct: target ? round(((current - target) / Math.abs(target)) * 100, 1) : 0,
        trend: diff > thr ? 'Improving' : diff < -thr ? 'Worsening' : 'Stable', status: s0.status, score: s0.score,
        owner: f.owner, source: m.derive ? f.sources[0] : 'business', updated: ago(R.int(2, 180)),
        series: ser, forecast: forecast(ser, dp, 0, isPct ? 100 : Infinity), bounded: isPct, derived: !!m.derive,
      }
      data.metrics.push(metric)
    }
  }
  return data
}
