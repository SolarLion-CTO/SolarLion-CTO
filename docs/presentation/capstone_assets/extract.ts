import { layers, layerMatrix, eventsFor, chains, valueAtRisk, debtVsIncidents, timeQuadrant, admPlacement, briefing } from '/Users/ram/Downloads/CTO CApstone/ai-transformation-framework/src/data/sim/controlPlane'
import { decisionsFor, topDecisions } from '/Users/ram/Downloads/CTO CApstone/ai-transformation-framework/src/data/sim/decisions'
import { sim, SIM_NOW } from '/Users/ram/Downloads/CTO CApstone/ai-transformation-framework/src/data/sim'
const now = Date.parse(SIM_NOW)
const ev = eventsFor('all')
const L = layers('all', ev, now)
const C = chains('all', ev, now)
const v = valueAtRisk('all')
const dv = debtVsIncidents('all')
const decs = topDecisions((['banking', 'manufacturing', 'retail'] as const).flatMap((d) => decisionsFor(sim[d])), 99)
const per = Object.fromEntries((['banking', 'manufacturing', 'retail'] as const).map((d) => [d, debtVsIncidents(d).r]))
const out = {
  layers: L.map((l) => ({ id: l.def.id, label: l.def.label, owner: l.def.owner, baseline: l.baseline, current: l.current, series: l.series, gap: l.gap })),
  matrix: layerMatrix().map((r) => ({ label: r.def.label, cells: r.cells.map((c) => c.score), all: r.all })),
  value: v, debt: { r: dv.r, n: dv.n, slope: dv.fit.slope, intercept: dv.fit.intercept, pts: dv.pts.map((p) => [p.x, p.incidents]), perUnit: per },
  time: (['Invest', 'Tolerate', 'Migrate', 'Eliminate'] as const).map((q) => [q, timeQuadrant('all').filter((p) => p.quadrant === q).length]),
  adm: admPlacement('all').map((p) => [p.id, p.initiatives.length]),
  decisions: (['Critical', 'High', 'Medium', 'Low'] as const).map((p) => [p, decs.filter((d) => d.priority === p).length]),
  topChain: C[0] ? { origin: C[0].origin.name, app: C[0].app.name, cap: C[0].capability, init: C[0].initiatives[0].name, value: C[0].valueAtRiskCr, decision: C[0].decision?.title } : null,
  briefing: briefing('all', L, v, decs[0], C[0], dv.r, dv.n),
}
console.log(JSON.stringify(out))
