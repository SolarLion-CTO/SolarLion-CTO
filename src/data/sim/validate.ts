// Data-quality checks for the simulation (spec 1 §28). Run: npm run validate:sim
import type { DomainData } from './model'
import { domainHealth, exec360, sourceHealth } from './scores'

export function validate(d: DomainData) {
  const errors: string[] = []
  const warnings: string[] = []
  const ids = new Map<string, string>()
  const all = { objectives: d.objectives, initiatives: d.initiatives, applications: d.applications, technologies: d.technologies, processes: d.processes, projects: d.projects, teams: d.teams, services: d.services, risks: d.risks, controls: d.controls }
  for (const [kind, xs] of Object.entries(all)) for (const x of xs) { if (ids.has(x.id)) errors.push(`duplicate id ${x.id}`); ids.set(x.id, kind) }
  for (const x of d.incidents) { if (ids.has(x.id)) errors.push(`duplicate id ${x.id}`); ids.set(x.id, 'incidents') }
  const ref = (from: string, to: string | null | undefined, kind?: string) => {
    if (to == null) return
    if (!ids.has(to)) errors.push(`${from} → ${to} does not exist`)
    else if (kind && ids.get(to) !== kind) errors.push(`${from} → ${to} is a ${ids.get(to)}, expected ${kind}`)
  }
  for (const o of d.objectives) o.initiativeIds.forEach((x) => ref(o.id, x, 'initiatives'))
  for (const i of d.initiatives) {
    ref(i.id, i.objectiveId, 'objectives'); i.appIds.forEach((x) => ref(i.id, x, 'applications')); i.dependsOn.forEach((x) => ref(i.id, x, 'initiatives'))
    i.projectIds.forEach((x) => ref(i.id, x, 'projects')); i.teamIds.forEach((x) => ref(i.id, x, 'teams')); i.processIds.forEach((x) => ref(i.id, x, 'processes'))
    if (i.start >= i.target) errors.push(`${i.id} starts after its target`)
  }
  for (const a of d.applications) { a.techIds.forEach((x) => ref(a.id, x, 'technologies')); a.dependsOn.forEach((x) => ref(a.id, x, 'applications')); if (a.dependsOn.includes(a.id)) errors.push(`${a.id} depends on itself`) }
  for (const p of d.processes) p.appIds.forEach((x) => ref(p.id, x, 'applications'))
  for (const p of d.projects) { ref(p.id, p.initiativeId, 'initiatives'); p.teamIds.forEach((x) => ref(p.id, x, 'teams')); p.appIds.forEach((x) => ref(p.id, x, 'applications')); if (p.start >= p.plannedEnd) errors.push(`${p.id} starts after planned end`) }
  for (const t of d.teams) { ref(t.id, t.initiativeId, 'initiatives'); t.appIds.forEach((x) => ref(t.id, x, 'applications'))
    const a = t.allocation; if (a.keepTheLightsOn < 0 || a.roadmap + a.unplanned + a.techDebt + a.keepTheLightsOn !== 100) errors.push(`${t.id} allocation does not sum to 100`) }
  for (const s of d.services) {
    ref(s.id, s.appId, 'applications'); ref(s.id, s.teamId, 'teams')
    const n = d.incidents.filter((x) => x.serviceId === s.id && Date.parse('2026-10-06T09:30:00+05:30') - Date.parse(x.start) <= 30 * 86400000).length
    if (n !== s.incidents30) errors.push(`${s.id} incidents30 ${s.incidents30} ≠ incident log ${n}`)
    if (s.availability > 100 || s.availabilitySeries[11] !== s.availability) errors.push(`${s.id} availability series does not end at current`)
  }
  for (const x of d.incidents) ref(x.id, x.serviceId, 'services')
  for (const r of d.risks) { ref(r.id, r.appId, 'applications'); ref(r.id, r.initiativeId, 'initiatives'); r.controlIds.forEach((x) => ref(r.id, x, 'controls')) }
  for (const c of d.controls) c.appIds.forEach((x) => ref(c.id, x, 'applications'))
  for (const s of d.stories) { ref(s.id, s.initiativeId, 'initiatives'); s.appIds.forEach((x) => ref(s.id, x, 'applications')); ref(s.id, s.processId, 'processes'); ref(s.id, s.projectId, 'projects'); ref(s.id, s.teamId, 'teams'); ref(s.id, s.serviceId, 'services'); ref(s.id, s.controlId, 'controls'); ref(s.id, s.riskId, 'risks') }

  // reconciliation
  for (const o of d.objectives) {
    const sum = d.initiatives.filter((i) => i.objectiveId === o.id).reduce((s, i) => s + i.budgetCr, 0)
    if (Math.abs(sum - o.investmentCr) > 0.01) errors.push(`${o.id} investment ${o.investmentCr} ≠ initiatives ${sum}`)
  }
  for (const i of d.initiatives) {
    const pj = d.projects.filter((p) => p.initiativeId === i.id).reduce((s, p) => s + p.budgetCr, 0)
    if (pj > i.budgetCr + 0.01) errors.push(`${i.id} project budgets ₹${pj} Cr exceed initiative budget ₹${i.budgetCr} Cr`)
    if (i.valueRealizedCr > i.expectedValueCr) errors.push(`${i.id} realised value above expected`)
  }
  // ranges & series
  for (const m of d.metrics) {
    if (m.series[11] !== m.current) errors.push(`${m.id} series does not end at current`)
    if (m.bounded && (m.current < 0 || m.current > 100 || m.series.some((v) => v < 0 || v > 100))) errors.push(`${m.id} percentage out of range`)
    if (!Number.isFinite(m.current) || !Number.isFinite(m.target)) errors.push(`${m.id} not a number`)
  }
  for (const p of d.processes) for (const v of [p.conformance, p.automationRate, p.exceptionRate]) if (v < 0 || v > 100) errors.push(`${p.id} percentage out of range`)

  // realism (warnings)
  const share = (xs: { health: string }[]) => xs.filter((x) => x.health === 'Red').length / (xs.length || 1)
  for (const [kind, xs] of Object.entries(all)) if (share(xs) > 0.3) warnings.push(`${kind}: ${Math.round(share(xs) * 100)}% red — too many exceptions`)
  const crit = d.risks.filter((r) => r.severity === 'Critical').length
  if (crit > 3) warnings.push(`${crit} critical risks — too many alerts`)
  const vol: [string, number, number, number][] = [['objectives', d.objectives.length, 5, 8], ['initiatives', d.initiatives.length, 8, 12], ['applications', d.applications.length, 20, 30], ['technologies', d.technologies.length, 20, 40], ['processes', d.processes.length, 8, 12], ['projects', d.projects.length, 12, 20], ['teams', d.teams.length, 8, 15], ['services', d.services.length, 15, 25], ['incidents', d.incidents.length, 20, 40], ['risks', d.risks.length, 15, 25], ['controls', d.controls.length, 20, 40]]
  for (const [k, n, lo, hi] of vol) if (n < lo || n > hi) warnings.push(`${k}: ${n} (spec ${lo}–${hi})`)

  return { errors, warnings, summary: summary(d) }
}

function summary(d: DomainData) {
  const dh = domainHealth(d)
  const count = (xs: { health: string }[]) => `${xs.length} (G${xs.filter((x) => x.health === 'Green').length} A${xs.filter((x) => x.health === 'Amber').length} R${xs.filter((x) => x.health === 'Red').length})`
  return {
    domain: `${d.org} — enterprise health ${dh.score} (${dh.status})`,
    entities: { objectives: count(d.objectives), initiatives: count(d.initiatives), applications: count(d.applications), technologies: count(d.technologies), processes: count(d.processes), projects: count(d.projects), teams: count(d.teams), services: count(d.services), incidents: d.incidents.length, risks: `${d.risks.length} (C${d.risks.filter((r) => r.severity === 'Critical').length} H${d.risks.filter((r) => r.severity === 'High').length} M${d.risks.filter((r) => r.severity === 'Medium').length} L${d.risks.filter((r) => r.severity === 'Low').length})`, controls: count(d.controls), metrics: d.metrics.length },
    functions: dh.functions.map((f) => `${f.def.name.padEnd(32)} ${String(f.score).padStart(3)} ${f.status.padEnd(5)} │ ${Object.values(f.cols).map((c) => c.status[0]).join(' ')}`),
    sources: sourceHealth(d).map((s) => `${s.capability.padEnd(28)} ${s.label.padEnd(24)} ${s.score} ${s.status}`),
    stories: d.stories.map((s) => {
      const h = (id: string) => { const all = [...d.initiatives, ...d.applications, ...d.processes, ...d.projects, ...d.teams, ...d.services, ...d.controls, ...d.risks] as { id: string; health: string }[]; const x = all.find((e) => e.id === id); return `${id}:${x?.health[0]}` }
      return `${s.title}\n      ${[s.initiativeId, ...s.appIds, s.processId, s.projectId, s.teamId, s.serviceId, s.controlId, s.riskId ?? '(no risk)'].map(h).join(' → ')}`
    }),
    exec: exec360(d).map((k) => `${k.label.padEnd(24)} ${k.current}${k.unit} (target ${k.target}) ${k.status} Δ${k.delta}`),
  }
}
