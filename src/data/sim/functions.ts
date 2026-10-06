// The 16 enterprise functions (spec 2). Each has exactly six metrics — one per heatmap column —
// so the 16 × 6 health heatmap is backed by real metrics, never typed colours.
// `derive` = calculated from the canonical entities; otherwise the value is simulated business data from the domain config.
import type { DomainData, FunctionId, HeatCol, SourceId } from './model'
import type { Plan } from './config'

export interface MetricDef {
  key: string; col: HeatCol; name: string; unit: string; better: 'up' | 'down'; dp?: number
  open?: boolean // % that may exceed 100 (ROI, budget ratio)
  band?: [number, number] // absolute deviation allowed for Green / Amber; default 2% / 10% of target
  derive?: (d: DomainData, p: Plan) => { current: number; target: number }
}
export interface FunctionDef {
  id: FunctionId; name: string; owner: string; cls: 'cto' | 'signal'; question: string
  sources: SourceId[]; metrics: MetricDef[]
}
export const HEAT_COLS: { id: HeatCol; label: string }[] = [
  { id: 'strategy', label: 'Strategy' }, { id: 'performance', label: 'Performance' }, { id: 'cost', label: 'Cost' },
  { id: 'technology', label: 'Technology' }, { id: 'risk', label: 'Risk' }, { id: 'transformation', label: 'Transformation' },
]

const pct = (n: number, d: number) => (d ? (n / d) * 100 : 0)
const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0)
const wavg = (xs: [number, number][]) => { const w = xs.reduce((s, x) => s + x[1], 0); return w ? xs.reduce((s, x) => s + x[0] * x[1], 0) / w : 0 }
const MC = (d: DomainData) => d.applications.filter((a) => a.criticality === 'Mission critical')
const cloudy = new Set(['Public cloud', 'Private cloud', 'SaaS', 'Hybrid'])

export const FUNCTIONS: FunctionDef[] = [
  // ── CTO-owned (deep) ──
  { id: 'technology', name: 'Technology', owner: 'CTO / CIO', cls: 'cto', question: 'Is the technology estate scalable, resilient and sustainable?', sources: ['leanix', 'datadog', 'servicenow'], metrics: [
    { key: 'modern', col: 'strategy', name: 'Apps on supported, target platforms', unit: '%', better: 'up', band: [5, 15], derive: (d) => ({ current: pct(d.applications.filter((a) => !a.usesEol && a.lifecycle !== 'Retire').length, d.applications.length), target: 75 }) },
    { key: 'avail', col: 'performance', name: 'Critical service availability', unit: '%', better: 'up', dp: 2, band: [0.02, 0.08], derive: (d) => { const s = d.services.filter((x) => x.slo >= 99.95); return { current: avg(s.map((x) => x.availability)), target: avg(s.map((x) => x.slo)) } } },
    { key: 'runcost', col: 'cost', name: 'Technology run cost', unit: '₹ Cr/yr', better: 'down', derive: (d, p) => ({ current: d.applications.reduce((s, a) => s + a.annualCostCr, 0) + d.services.reduce((s, x) => s + x.costCrYr, 0), target: p.runCostCr }) },
    { key: 'platform', col: 'technology', name: 'Platform technical health', unit: '/100', better: 'up', band: [3, 10], derive: (d) => ({ current: wavg(d.applications.map((a) => [a.techHealth, a.criticality === 'Mission critical' ? 3 : 1])), target: 70 }) },
    { key: 'p1', col: 'risk', name: 'Major incidents (P1, 90 days)', unit: '', better: 'down', dp: 0, band: [1, 3], derive: (d, p) => ({ current: d.incidents.filter((i) => i.severity === 'P1').length, target: p.p1Per90d }) },
    { key: 'cloud', col: 'transformation', name: 'Cloud adoption', unit: '%', better: 'up', derive: (d, p) => ({ current: pct(d.applications.filter((a) => cloudy.has(a.hosting)).length, d.applications.length), target: p.cloudPct }) },
  ] },
  { id: 'architecture', name: 'Enterprise Architecture', owner: 'CTO / CIO', cls: 'cto', question: 'Does our architecture support the future business strategy?', sources: ['leanix'], metrics: [
    { key: 'fit', col: 'strategy', name: 'Fit-for-purpose applications', unit: '%', better: 'up', band: [5, 15], derive: (d) => ({ current: pct(d.applications.filter((a) => a.functionalFit >= 60 && a.techHealth >= 60).length, d.applications.length), target: 70 }) },
    { key: 'legacydeps', col: 'performance', name: 'Integrations depending on legacy apps', unit: '', better: 'down', dp: 0, band: [3, 8], derive: (d) => { const legacy = new Set(d.applications.filter((a) => a.lifecycle === 'Migrate' || a.lifecycle === 'Retire').map((a) => a.id)); return { current: d.applications.reduce((s, a) => s + a.dependsOn.filter((x) => legacy.has(x)).length, 0), target: 12 } } },
    { key: 'redundant', col: 'cost', name: 'Cost of apps marked for retirement', unit: '₹ Cr/yr', better: 'down', band: [1, 4], derive: (d, p) => ({ current: d.applications.filter((a) => a.lifecycle === 'Retire').reduce((s, a) => s + a.annualCostCr, 0), target: p.redundantCostCr }) },
    { key: 'eol', col: 'technology', name: 'End-of-life technologies in use', unit: '', better: 'down', dp: 0, band: [1, 3], derive: (d, p) => ({ current: d.technologies.filter((t) => t.lifecycle === 'End of life' && t.appIds.length).length, target: p.eolTech }) },
    { key: 'mceol', col: 'risk', name: 'Mission-critical apps on EOL technology', unit: '', better: 'down', dp: 0, band: [0, 2], derive: (d) => ({ current: MC(d).filter((a) => a.usesEol).length, target: 0 }) },
    { key: 'legacy', col: 'transformation', name: 'Legacy apps (migrate / retire)', unit: '', better: 'down', dp: 0, band: [1, 3], derive: (d, p) => ({ current: d.applications.filter((a) => a.lifecycle === 'Migrate' || a.lifecycle === 'Retire').length, target: p.legacyApps }) },
  ] },
  { id: 'engineering', name: 'Engineering & R&D', owner: 'CTO', cls: 'cto', question: 'Is engineering capacity aligned with strategic priorities?', sources: ['jellyfish'], metrics: [
    { key: 'roadmap', col: 'strategy', name: 'Capacity on roadmap work', unit: '%', better: 'up', band: [3, 10], derive: (d) => ({ current: wavg(d.teams.map((t) => [t.allocation.roadmap, t.engineers])), target: 60 }) },
    { key: 'deploys', col: 'performance', name: 'Deployments per week', unit: '', better: 'up', dp: 0, derive: (d, p) => ({ current: d.teams.reduce((s, t) => s + t.deploysPerWeek, 0), target: p.deploysPerWeek }) },
    { key: 'unplanned', col: 'cost', name: 'Unplanned work', unit: '%', better: 'down', band: [2, 8], derive: (d) => ({ current: wavg(d.teams.map((t) => [t.allocation.unplanned, t.engineers])), target: 15 }) },
    { key: 'lead', col: 'technology', name: 'Lead time for change', unit: 'days', better: 'down', band: [0.5, 2.5], derive: (d, p) => ({ current: wavg(d.teams.map((t) => [t.leadTimeDays, t.engineers])), target: p.leadTimeDays }) },
    { key: 'predict', col: 'risk', name: 'Delivery predictability', unit: '%', better: 'up', band: [3, 10], derive: (d) => ({ current: wavg(d.teams.map((t) => [t.predictability, t.engineers])), target: 85 }) },
    { key: 'debt', col: 'transformation', name: 'Capacity paying down tech debt', unit: '%', better: 'up', band: [2, 6], derive: (d) => ({ current: wavg(d.teams.map((t) => [t.allocation.techDebt, t.engineers])), target: 15 }) },
  ] },
  { id: 'data-ai', name: 'Data & AI', owner: 'CDO / CAIO / CTO', cls: 'cto', question: 'Are Data and AI producing measurable and governed business value?', sources: ['planview', 'business'], metrics: [
    { key: 'usecases', col: 'strategy', name: 'AI use cases in production', unit: '', better: 'up', dp: 0, band: [1, 4] },
    { key: 'model', col: 'performance', name: 'Model performance (avg accuracy)', unit: '%', better: 'up', band: [1, 4] },
    { key: 'aicost', col: 'cost', name: 'AI run cost', unit: '₹ Cr/yr', better: 'down' },
    { key: 'dq', col: 'technology', name: 'Data quality score', unit: '%', better: 'up', band: [2, 8] },
    { key: 'rai', col: 'risk', name: 'Responsible-AI controls met', unit: '%', better: 'up', band: [3, 15] },
    { key: 'aivalue', col: 'transformation', name: 'AI value realised', unit: '₹ Cr', better: 'up' },
  ] },
  { id: 'cyber', name: 'Cybersecurity', owner: 'CISO', cls: 'cto', question: 'What technology risks require executive intervention?', sources: ['vanta', 'datadog'], metrics: [
    { key: 'zt', col: 'strategy', name: 'Zero Trust adoption', unit: '%', better: 'up', band: [3, 15] },
    { key: 'mttrv', col: 'performance', name: 'Time to remediate critical vulns', unit: 'days', better: 'down', band: [1, 6] },
    { key: 'secdebt', col: 'cost', name: 'Security debt (overdue patches)', unit: '', better: 'down', dp: 0, band: [10, 30] },
    { key: 'edr', col: 'technology', name: 'Endpoint protection coverage', unit: '%', better: 'up', band: [1, 5] },
    { key: 'cyrisk', col: 'risk', name: 'Cyber risks rated high or critical', unit: '', better: 'down', dp: 0, band: [1, 3], derive: (d) => ({ current: d.risks.filter((r) => r.category === 'Cyber' && (r.severity === 'High' || r.severity === 'Critical')).length, target: 1 }) },
    { key: 'secctl', col: 'transformation', name: 'Security controls passing', unit: '%', better: 'up', band: [4, 12], derive: (d) => ({ current: pct(d.controls.filter((c) => c.controlStatus === 'Passing').length, d.controls.length), target: 90 }) },
  ] },
  { id: 'product', name: 'Product & Innovation', owner: 'CPO / CTO', cls: 'cto', question: 'Are we converting technology innovation into business value?', sources: ['planview', 'business'], metrics: [
    { key: 'pipeline', col: 'strategy', name: 'Ideas in validation', unit: '', better: 'up', dp: 0 },
    { key: 'ttm', col: 'performance', name: 'Time to market', unit: 'weeks', better: 'down', band: [1, 4] },
    { key: 'spend', col: 'cost', name: 'Innovation share of IT budget', unit: '%', better: 'up', band: [1, 4] },
    { key: 'aiprod', col: 'technology', name: 'AI-enabled products', unit: '', better: 'up', dp: 0, band: [1, 3] },
    { key: 'success', col: 'risk', name: 'Experiment success rate', unit: '%', better: 'up', band: [3, 10] },
    { key: 'roi', col: 'transformation', name: 'Innovation ROI', unit: '%', better: 'up', open: true },
  ] },
  // ── Signals to the CTO (other executives own these) ──
  { id: 'strategy', name: 'Corporate Strategy', owner: 'CEO / CSO', cls: 'signal', question: 'Are technology investments aligned with enterprise strategy?', sources: ['planview', 'servicenow'], metrics: [
    { key: 'objok', col: 'strategy', name: 'Strategic objectives on track', unit: '%', better: 'up', band: [5, 20], derive: (d) => ({ current: pct(d.objectives.filter((o) => o.health === 'Green').length, d.objectives.length), target: 80 }) },
    { key: 'sched', col: 'performance', name: 'Initiatives on schedule', unit: '%', better: 'up', band: [5, 20], derive: (d) => ({ current: pct(d.initiatives.filter((i) => i.plannedProgress - i.progress <= 5).length, d.initiatives.length), target: 85 }) },
    { key: 'value', col: 'cost', name: 'Value realised vs plan to date', unit: '%', better: 'up', band: [5, 20], derive: (d) => { const exp = d.initiatives.reduce((s, i) => s + i.expectedValueCr * (i.plannedProgress / 100) * 0.6, 0); return { current: pct(d.initiatives.reduce((s, i) => s + i.valueRealizedCr, 0), exp), target: 100 } } },
    { key: 'align', col: 'technology', name: 'Tech budget on strategic objectives', unit: '%', better: 'up', band: [3, 10], derive: (d) => { const all = d.initiatives.reduce((s, i) => s + i.budgetCr, 0); const crit = d.initiatives.filter((i) => d.objectives.find((o) => o.id === i.objectiveId)!.priority !== 'Medium').reduce((s, i) => s + i.budgetCr, 0); return { current: pct(crit, all), target: 85 } } },
    { key: 'atrisk', col: 'risk', name: 'Initiatives at risk', unit: '', better: 'down', dp: 0, band: [1, 2], derive: (d) => ({ current: d.initiatives.filter((i) => i.health === 'Red').length, target: 0 }) },
    { key: 'transform', col: 'transformation', name: 'Transformation progress vs plan', unit: '%', better: 'up', band: [3, 10], derive: (d) => ({ current: pct(d.initiatives.reduce((s, i) => s + i.progress * i.budgetCr, 0), d.initiatives.reduce((s, i) => s + i.plannedProgress * i.budgetCr, 0)), target: 100 }) },
  ] },
  { id: 'finance', name: 'Finance', owner: 'CFO', cls: 'signal', question: 'Are technology investments producing measurable financial value?', sources: ['planview', 'business'], metrics: [
    { key: 'share', col: 'strategy', name: 'Transformation share of IT spend', unit: '%', better: 'up', band: [2, 8] },
    { key: 'roi', col: 'performance', name: 'Technology programme ROI', unit: '%', better: 'up', open: true },
    { key: 'forecast', col: 'cost', name: 'Forecast vs budget', unit: '%', better: 'down', open: true, band: [2, 8], derive: (d) => ({ current: pct(d.initiatives.reduce((s, i) => s + i.forecastCr, 0), d.initiatives.reduce((s, i) => s + i.budgetCr, 0)), target: 100 }) },
    { key: 'cloud', col: 'technology', name: 'Cloud spend', unit: '₹ Cr/qtr', better: 'down', band: [0.1, 0.5] },
    { key: 'atrisk', col: 'risk', name: 'Budget overrun forecast', unit: '₹ Cr', better: 'down', band: [1, 6], derive: (d) => ({ current: d.initiatives.reduce((s, i) => s + Math.max(0, i.forecastCr - i.budgetCr), 0), target: 0 }) },
    { key: 'savings', col: 'transformation', name: 'Savings realised (FY)', unit: '₹ Cr', better: 'up' },
  ] },
  { id: 'operations', name: 'Operations', owner: 'COO', cls: 'signal', question: 'Where can technology remove operational friction?', sources: ['process'], metrics: [
    { key: 'auto', col: 'strategy', name: 'Process automation rate', unit: '%', better: 'up', band: [3, 12], derive: (d) => ({ current: avg(d.processes.map((p) => p.automationRate)), target: 65 }) },
    { key: 'conf', col: 'performance', name: 'Process conformance', unit: '%', better: 'up', band: [3, 10], derive: (d) => ({ current: avg(d.processes.map((p) => p.conformance)), target: 90 }) },
    { key: 'unitcost', col: 'cost', name: 'Cost per transaction', unit: '₹', better: 'down', dp: 2 },
    { key: 'slow', col: 'technology', name: 'Processes slower than target', unit: '', better: 'down', dp: 0, band: [1, 4], derive: (d) => ({ current: d.processes.filter((p) => p.cycleTime > p.targetCycleTime * 1.1).length, target: 2 }) },
    { key: 'exc', col: 'risk', name: 'Process exception rate', unit: '%', better: 'down', band: [1, 4], derive: (d) => ({ current: avg(d.processes.map((p) => p.exceptionRate)), target: 5 }) },
    { key: 'pipeline', col: 'transformation', name: 'Processes automated or monitored', unit: '%', better: 'up', band: [5, 20], derive: (d) => ({ current: pct(d.processes.filter((p) => p.stage === 'Automate' || p.stage === 'Monitor').length, d.processes.length), target: 50 }) },
  ] },
  { id: 'sales', name: 'Sales', owner: 'CRO / CSO', cls: 'signal', question: 'How is technology influencing revenue growth?', sources: ['business'], metrics: [
    { key: 'digital', col: 'strategy', name: 'Digital channel revenue share', unit: '%', better: 'up', band: [2, 8] },
    { key: 'plan', col: 'performance', name: 'Revenue vs plan', unit: '%', better: 'up', band: [1, 5] },
    { key: 'cos', col: 'cost', name: 'Cost of sale', unit: '%', better: 'down', band: [0.5, 2] },
    { key: 'crm', col: 'technology', name: 'CRM data completeness', unit: '%', better: 'up', band: [3, 10] },
    { key: 'fcst', col: 'risk', name: 'Forecast accuracy', unit: '%', better: 'up', band: [2, 8] },
    { key: 'techrev', col: 'transformation', name: 'Technology-influenced revenue', unit: '₹ Cr', better: 'up' },
  ] },
  { id: 'marketing', name: 'Marketing', owner: 'CMO', cls: 'signal', question: 'Are data and technology improving customer acquisition?', sources: ['business'], metrics: [
    { key: 'person', col: 'strategy', name: 'Personalised campaigns', unit: '%', better: 'up', band: [4, 15] },
    { key: 'conv', col: 'performance', name: 'Digital conversion rate', unit: '%', better: 'up', dp: 2, band: [0.1, 0.5] },
    { key: 'cac', col: 'cost', name: 'Customer acquisition cost', unit: '₹', better: 'down', dp: 0 },
    { key: 'mau', col: 'technology', name: 'Digital engagement (MAU)', unit: 'lakh', better: 'up' },
    { key: 'consent', col: 'risk', name: 'Consent coverage', unit: '%', better: 'up', band: [2, 6] },
    { key: 'roi', col: 'transformation', name: 'Marketing ROI', unit: '×', better: 'up', dp: 2, band: [0.1, 0.5] },
  ] },
  { id: 'cx', name: 'Customer Experience & Service', owner: 'CXO / COO', cls: 'signal', question: 'Where is technology affecting customer experience?', sources: ['process', 'datadog', 'business'], metrics: [
    { key: 'nps', col: 'strategy', name: 'Net Promoter Score', unit: '', better: 'up', dp: 0, band: [2, 8] },
    { key: 'csat', col: 'performance', name: 'CSAT', unit: '%', better: 'up', band: [1, 5] },
    { key: 'self', col: 'cost', name: 'Self-service rate', unit: '%', better: 'up', band: [3, 10] },
    { key: 'cfavail', col: 'technology', name: 'Customer-facing service availability', unit: '%', better: 'up', dp: 2, band: [0.02, 0.08], derive: (d) => { const cf = new Set(d.applications.filter((a) => a.customerFacing).map((a) => a.id)); const s = d.services.filter((x) => cf.has(x.appId)); return { current: avg(s.map((x) => x.availability)), target: avg(s.map((x) => x.slo)) } } },
    { key: 'complaints', col: 'risk', name: 'Complaints per 10k customers', unit: '', better: 'down', band: [0.5, 2] },
    { key: 'ai', col: 'transformation', name: 'AI-assisted service share', unit: '%', better: 'up', band: [3, 12] },
  ] },
  { id: 'hr', name: 'Human Resources', owner: 'CHRO', cls: 'signal', question: 'Do we have the talent required for the technology strategy?', sources: ['business'], metrics: [
    { key: 'gaps', col: 'strategy', name: 'Critical skill gaps', unit: '', better: 'down', dp: 0, band: [2, 8] },
    { key: 'attrition', col: 'performance', name: 'Technology attrition', unit: '%', better: 'down', band: [1, 4] },
    { key: 'hirecost', col: 'cost', name: 'Hiring cost per engineer', unit: '₹ L', better: 'down' },
    { key: 'aiskill', col: 'technology', name: 'AI-skilled technology workforce', unit: '%', better: 'up', band: [3, 12] },
    { key: 'keyperson', col: 'risk', name: 'Key-person dependent roles', unit: '', better: 'down', dp: 0, band: [1, 4] },
    { key: 'learning', col: 'transformation', name: 'Learning completion', unit: '%', better: 'up', band: [3, 12] },
  ] },
  { id: 'risk', name: 'Risk & Compliance', owner: 'CRO', cls: 'signal', question: 'Are technology risks within enterprise risk appetite?', sources: ['vanta'], metrics: [
    { key: 'appetite', col: 'strategy', name: 'Risks outside appetite (critical)', unit: '', better: 'down', dp: 0, band: [0, 2], derive: (d) => ({ current: d.risks.filter((r) => r.severity === 'Critical').length, target: 0 }) },
    { key: 'ctl', col: 'performance', name: 'Control effectiveness', unit: '%', better: 'up', band: [4, 12], derive: (d) => ({ current: pct(d.controls.filter((c) => c.controlStatus === 'Passing').length, d.controls.length), target: 90 }) },
    { key: 'findings', col: 'cost', name: 'Open audit findings', unit: '', better: 'down', dp: 0, band: [2, 6] },
    { key: 'techrisk', col: 'technology', name: 'Technology risks high or critical', unit: '', better: 'down', dp: 0, band: [2, 6], derive: (d) => ({ current: d.risks.filter((r) => r.severity === 'High' || r.severity === 'Critical').length, target: 8 }) },
    { key: 'aging', col: 'risk', name: 'Remediation overdue (> 90 days)', unit: '', better: 'down', dp: 0, band: [2, 5], derive: (d) => ({ current: d.risks.filter((r) => r.openedDays > 90 && r.status !== 'Accepted').length, target: 4 }) },
    { key: 'audit', col: 'transformation', name: 'Audit readiness', unit: '%', better: 'up', band: [3, 10], derive: (d) => ({ current: pct(d.controls.filter((c) => c.controlStatus !== 'Not tested' && c.evidence !== 'Missing').length, d.controls.length), target: 95 }) },
  ] },
  { id: 'legal', name: 'Legal', owner: 'CLO', cls: 'signal', question: 'Are technology decisions creating legal or regulatory exposure?', sources: ['vanta', 'business'], metrics: [
    { key: 'oblig', col: 'strategy', name: 'Regulatory obligations mapped to controls', unit: '%', better: 'up', band: [3, 12] },
    { key: 'renewals', col: 'performance', name: 'Contract renewals handled on time', unit: '%', better: 'up', band: [3, 10] },
    { key: 'exposure', col: 'cost', name: 'Estimated legal exposure', unit: '₹ Cr', better: 'down', band: [0.5, 2] },
    { key: 'residency', col: 'technology', name: 'Data residency compliance', unit: '%', better: 'up', band: [1, 4] },
    { key: 'privacy', col: 'risk', name: 'Open privacy issues', unit: '', better: 'down', dp: 0, band: [1, 3] },
    { key: 'ailegal', col: 'transformation', name: 'AI use cases with legal review', unit: '%', better: 'up', band: [5, 25] },
  ] },
  { id: 'procurement', name: 'Procurement & Vendor Management', owner: 'CPO / COO', cls: 'signal', question: 'Are technology vendors delivering appropriate value and resilience?', sources: ['servicenow', 'business'], metrics: [
    { key: 'exit', col: 'strategy', name: 'Strategic vendors with exit plan', unit: '%', better: 'up', band: [5, 15] },
    { key: 'sla', col: 'performance', name: 'Vendor SLAs met', unit: '%', better: 'up', band: [2, 6] },
    { key: 'licence', col: 'cost', name: 'Licence utilisation', unit: '%', better: 'up', band: [4, 15] },
    { key: 'conc', col: 'technology', name: 'Spend with top 3 vendors', unit: '%', better: 'down', band: [3, 10] },
    { key: 'hrv', col: 'risk', name: 'High-risk vendors', unit: '', better: 'down', dp: 0, band: [1, 3] },
    { key: 'savings', col: 'transformation', name: 'Savings secured (FY)', unit: '₹ Cr', better: 'up' },
  ] },
]
export const FN = Object.fromEntries(FUNCTIONS.map((f) => [f.id, f])) as Record<FunctionId, FunctionDef>
