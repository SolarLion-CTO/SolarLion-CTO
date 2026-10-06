// Roll-ups: metric → function (6 heatmap columns) → domain → enterprise. Also the 7 source-system scores
// and the 14 Executive 360 KPIs. Monthly series are re-scored from each metric's own history, so trends match.
import type { DomainData, FunctionId, HeatCol, Rag, SourceId } from './model'
import { FN, FUNCTIONS, HEAT_COLS } from './functions'
import { metricScore, ragOf } from './scoring'

const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0)
const avgSeries = (ss: number[][]) => ss[0].map((_, k) => Math.round(avg(ss.map((s) => s[k]))))

export interface Score { score: number; status: Rag; series: number[] }

export function functionHealth(d: DomainData, fid: FunctionId) {
  const def = FN[fid]
  const ms = d.metrics.filter((m) => m.functionId === fid)
  const scored = ms.map((m) => {
    const md = def.metrics.find((x) => x.key === m.key)!
    return { m, series: m.series.map((v) => metricScore(md, v, m.target).score) }
  })
  const cols = Object.fromEntries(HEAT_COLS.map(({ id }) => {
    const x = scored.find((s) => s.m.col === id)!
    return [id, { score: x.m.score, status: x.m.status, metric: x.m }]
  })) as Record<HeatCol, { score: number; status: Rag; metric: (typeof ms)[number] }>
  const series = avgSeries(scored.map((s) => s.series))
  const score = series[11]
  return { def, cols, metrics: ms, score, status: ragOf(score), series }
}

export function domainHealth(d: DomainData) {
  const fns = FUNCTIONS.map((f) => functionHealth(d, f.id))
  const series = avgSeries(fns.map((f) => f.series))
  return { functions: fns, score: series[11], status: ragOf(series[11]), series }
}

// ── 7 source systems (system lens) ──
export const SOURCES: { id: Exclude<SourceId, 'business'>; label: string; capability: string; slug: string; question: string }[] = [
  { id: 'planview', label: 'Planview', capability: 'Strategy & Portfolio', slug: 'planview', question: 'Are technology investments aligned with business strategy?' },
  { id: 'leanix', label: 'SAP LeanIX', capability: 'Enterprise Architecture', slug: 'leanix', question: 'Is our technology architecture enabling or constraining strategy?' },
  { id: 'process', label: 'Celonis + SAP Signavio', capability: 'Process Intelligence', slug: 'process', question: 'Where is technology causing or solving process inefficiency?' },
  { id: 'servicenow', label: 'ServiceNow SPM', capability: 'Portfolio & Workflow', slug: 'servicenow', question: 'Can the organisation execute the technology strategy?' },
  { id: 'jellyfish', label: 'Jellyfish', capability: 'Engineering Intelligence', slug: 'jellyfish', question: 'Is engineering capacity aligned with strategic priorities?' },
  { id: 'datadog', label: 'Datadog', capability: 'Operations & Observability', slug: 'datadog', question: 'Is technology reliable enough to support the business?' },
  { id: 'vanta', label: 'Vanta', capability: 'Security, Risk & Governance', slug: 'vanta', question: 'Where could technology expose the organisation to unacceptable risk?' },
]
const pts = (h: Rag) => (h === 'Green' ? 100 : h === 'Amber' ? 70 : 35)
// A source's score blends the health of its own records with the function it mainly feeds,
// so "SAP LeanIX" and "Enterprise Architecture" never tell different stories on the same screen.
const PRIMARY_FN: Record<Exclude<SourceId, 'business'>, FunctionId> = { planview: 'strategy', leanix: 'architecture', process: 'operations', servicenow: 'strategy', jellyfish: 'engineering', datadog: 'technology', vanta: 'risk' }
export function sourceHealth(d: DomainData) {
  const ents: Record<Exclude<SourceId, 'business'>, { health: Rag }[]> = {
    planview: [...d.objectives, ...d.initiatives], leanix: [...d.applications, ...d.technologies], process: d.processes,
    servicenow: d.projects, jellyfish: d.teams, datadog: d.services, vanta: [...d.controls, ...d.risks],
  }
  return SOURCES.map((s) => {
    const xs = ents[s.id]
    const records = Math.round(avg(xs.map((x) => pts(x.health))))
    const score = Math.round((records + functionHealth(d, PRIMARY_FN[s.id]).score) / 2)
    return { ...s, score, recordScore: records, primaryFunction: PRIMARY_FN[s.id], status: ragOf(score), records: xs.length + (s.id === 'datadog' ? d.incidents.length : 0), red: xs.filter((x) => x.health === 'Red').length }
  })
}

// ── Executive 360: 14 KPIs, all roll-ups of function scores ──
export function exec360(d: DomainData) {
  const dh = domainHealth(d)
  const f = Object.fromEntries(dh.functions.map((x) => [x.def.id, x])) as Record<FunctionId, ReturnType<typeof functionHealth>>
  const mix = (ids: FunctionId[]) => avgSeries(ids.map((i) => f[i].series))
  const colSeries = (col: HeatCol, ids: FunctionId[] = FUNCTIONS.map((x) => x.id)) => {
    const ss = ids.map((i) => { const m = f[i].cols[col].metric; const md = f[i].def.metrics.find((x) => x.key === m.key)!; return m.series.map((v) => metricScore(md, v, m.target).score) })
    return avgSeries(ss)
  }
  const maturity = (s: number[]) => s.map((v) => Math.round((1 + (4 * v) / 100) * 10) / 10)
  const k = (key: string, label: string, series: number[], target = 85, unit = '/100') => {
    const current = series[11]; const previous = series[8]
    const status: Rag = unit === '/5' ? (current >= target - 0.1 ? 'Green' : current >= target - 0.8 ? 'Amber' : 'Red') : ragOf(current)
    return { key, label, current, target, unit, previous, delta: Math.round((current - previous) * 10) / 10, status, series }
  }
  return [
    k('enterprise', 'Enterprise health', dh.series),
    k('technology', 'Technology health', f.technology.series),
    k('business', 'Business performance', mix(['sales', 'marketing', 'cx', 'operations'])),
    k('transformation', 'Transformation progress', colSeries('transformation')),
    k('digital', 'Digital maturity', maturity(mix(['technology', 'architecture', 'cx', 'sales'])), 4, '/5'),
    k('ai', 'AI maturity', maturity(f['data-ai'].series), 4, '/5'),
    k('architecture', 'Architecture health', f.architecture.series),
    k('operational', 'Operational health', avgSeries([colSeries('performance', ['technology']), f.operations.series])),
    k('cyber', 'Cyber posture', f.cyber.series),
    k('compliance', 'Compliance health', f.risk.series),
    k('cx', 'Customer experience', f.cx.series),
    k('employee', 'Employee experience', f.hr.series),
    k('budget', 'Budget health', f.finance.series),
    k('innovation', 'Innovation index', f.product.series),
  ]
}
