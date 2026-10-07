// M8 LEAN — frameworks applied to each owner's BP1 problem, each with a tracked metric.
// All computed from the existing simulated data (see docs/SYLLABUS_AND_FRAMEWORKS.md, section 8).
import type { DomainId } from '../domains'
import { MONTHS } from './model'
import { sim } from './index'
import { decisionsFor } from './decisions'
import type { Decision } from './decisions'
import { USE_CASES } from './aiPortfolio'
import type { UseCase } from './aiPortfolio'
import { ledger } from './spend'
import { capacity, SCENARIOS, runScenario } from './ops'
import { OWNERS, ownerState } from './team'
import type { MeasureDef } from './team'
import { npv, sCurve } from './analytics'
import { rng } from './rng'

const D: DomainId[] = ['banking', 'manufacturing', 'retail']
const r1 = (n: number) => Math.round(n * 10) / 10
/** Seeded linear 12-month history ending at the computed current value (same convention as team measures). */
const hist = (id: string, from: number, to: number, dp = 0) => { const r = rng(`fw-${id}`), f = 10 ** dp, span = Math.abs(to - from) || 1; return MONTHS.map((_, k) => (k === 0 ? from : k === 11 ? to : Math.round((from + ((to - from) * k) / 11 + (r.next() - 0.5) * span * 0.06) * f) / f)) }
export const fwMeasure = (id: string, name: string, unit: string, better: 'up' | 'down', from: number, to: number, target: number, note: string, dp = 0): MeasureDef => ({ id, name, unit, better, target, targetDate: '2027-06-30', dp, note, series: () => hist(id, from, to, dp) })

// ── Ram · Balanced Scorecard ─────────────────────────────────────────
export const BSC: Record<string, string[]> = {
  Financial: ['suman-value', 'suman-payback', 'san-fcst', 'san-waste', 'san-track', 'san-change', 'san-lic'],
  Customer: ['suman-adopt', 'vai-consent', 'vai-breach', 'pan-avail'],
  'Internal process': ['ram-s2d', 'ram-out', 'ram-ontrack', 'ram-risk', 'vai-oblig', 'vai-days', 'vai-ctl', 'pan-recur', 'pan-fix', 'pan-head', 'pan-chg', 'pan-auto', 'san-tbm'],
  'Learning & growth': ['ram-bu', 'ram-health', 'suman-ready', 'suman-prod', 'suman-conv', 'vai-models'],
}
export function balancedScorecard() {
  const all = OWNERS.flatMap((o) => ownerState(o).measures.map((m) => ({ ...m, owner: o.name })))
  return Object.entries(BSC).map(([p, ids]) => {
    const ms = all.filter((m) => ids.includes(m.def.id))
    return { perspective: p, measures: ms, score: Math.round(ms.reduce((a, m) => a + m.progress, 0) / ms.length), behind: ms.filter((m) => m.glide === 'Behind').length }
  })
}

// ── Ram · Cynefin + RAPID on decisions ───────────────────────────────
export type Cynefin = 'Clear' | 'Complicated' | 'Complex' | 'Chaotic'
export const CYNEFIN_APPROACH: Record<Cynefin, string> = {
  Clear: 'Sense → categorise → respond (apply best practice)',
  Complicated: 'Sense → analyse → respond (expert analysis, good practice)',
  Complex: 'Probe → sense → respond (safe-to-fail experiments, emergent practice)',
  Chaotic: 'Act → sense → respond (stabilise first, novel practice)',
}
export function cynefinOf(d: Decision): Cynefin {
  if (d.kind === 'Cross-system story') return d.signals.filter((s) => s.health === 'Red').length >= 3 ? 'Complex' : 'Complicated'
  if (d.kind === 'Risk' || d.kind === 'Process') return 'Clear'
  return 'Complicated'
}
export function rapid(d: Decision) {
  const agree = d.functions.some((f) => ['risk', 'cyber', 'legal'].includes(f)) ? 'Vaibhav (governance)' : d.functions.includes('finance') || d.investmentCr > 0 ? 'Santhosh (finance)' : '—'
  return {
    R: d.owner, A: agree, P: [...new Set(d.actions.map((a) => a.owner))].slice(0, 3).join(', '),
    I: ((n) => `${n} source${n === 1 ? '' : 's'} / agents`)([...new Set(d.signals.map((s) => s.source))].length),
    D: d.priority === 'Critical' || d.priority === 'High' ? 'Ram (CTO)' : d.owner.split(' with ')[0],
  }
}
export function decisionsFramed() {
  const ds = D.flatMap((x) => decisionsFor(sim[x])).filter((d) => !d.preset)
  return ds.map((d) => {
    const c = cynefinOf(d)
    const r = rng(`age-${d.id}`)
    const age = c === 'Clear' ? r.int(1, 3) : c === 'Complicated' ? r.int(3, 8) : r.int(6, 14)
    return { d, cynefin: c, age, rapid: rapid(d) }
  })
}
export const ramFwMeasures = () => {
  const f = decisionsFramed()
  return [fwMeasure('fw-decider', 'Decisions with a named decider (RAPID D)', '%', 'up', 30, 100, 100, 'Every open decision card carries R-A-P-I-D roles'),
    fwMeasure('fw-age', 'Average open-decision age', 'days', 'down', 19, r1(f.reduce((a, x) => a + x.age, 0) / f.length), 3, 'Days since the first correlated signal', 1)]
}

// ── Suman · Three Horizons, Diffusion + Chasm ────────────────────────
export const horizonOf = (u: UseCase) => (u.stage === 'Production' || u.stage === 'Scaled' ? 'H1 · core' : u.stage === 'Idea' ? 'H3 · future' : 'H2 · emerging')
export const H_TARGET: Record<string, number> = { 'H1 · core': 70, 'H2 · emerging': 20, 'H3 · future': 10 }
export function threeHorizons(units: DomainId[]) {
  const ucs = USE_CASES.filter((u) => units.includes(u.domain))
  const tot = ucs.reduce((a, u) => a + u.investCr, 0)
  return Object.keys(H_TARGET).map((h) => { const xs = ucs.filter((u) => horizonOf(u) === h); const inv = xs.reduce((a, u) => a + u.investCr, 0); return { h, n: xs.length, inv: r1(inv), pct: Math.round((inv / tot) * 100), target: H_TARGET[h], items: xs } })
}
export const ROGERS = [['Innovators', 2.5], ['Early adopters', 16], ['Early majority', 50], ['Late majority', 84], ['Laggards', 100]] as const
export const adoptionOf = (u: UseCase) => r1(sCurve(u.monthsLive, 85, 10, 0.4))
export const segmentOf = (a: number) => ROGERS.find(([, lim]) => a < lim)?.[0] ?? 'Laggards'
/** Rogers' five factors (1–10) derived from portfolio attributes; complexity is inverted (simpler = higher). */
export const diffusionFactors = (u: UseCase) => ({
  'Relative advantage': u.value, Compatibility: Math.round(u.dataReady / 10), 'Low complexity': u.feasibility,
  Trialability: u.stage === 'Pilot' || u.stage === 'PoC' ? 8 : u.stage === 'Idea' ? 4 : 7, Observability: u.realisedCr > 0 ? Math.min(10, 5 + Math.round(u.realisedCr)) : 3,
})
export function diffusion(units: DomainId[]) {
  const live = USE_CASES.filter((u) => units.includes(u.domain) && u.monthsLive > 0)
  const rows = live.map((u) => ({ u, adoption: adoptionOf(u), segment: segmentOf(adoptionOf(u)), factors: diffusionFactors(u) }))
  return { rows, pastChasm: Math.round((rows.filter((x) => x.adoption > 16).length / rows.length) * 100) }
}
export const sumanFwMeasures = () => [
  fwMeasure('fw-chasm', 'Live AI use cases past the chasm (> 16% adoption)', '%', 'up', 18, diffusion(D).pastChasm, 75, 'Rogers curve: early adopters → early majority'),
  fwMeasure('fw-h1', 'AI investment in live use cases (H1)', '%', 'up', 20, threeHorizons(D)[0].pct, 70, 'Three Horizons: 70 / 20 / 10 target — low H1 = pilot purgatory'),
]

// ── Vaibhav · Three Lines Model ──────────────────────────────────────
export function threeLines() {
  return D.flatMap((d) => sim[d].risks.filter((r) => r.severity === 'High' || r.severity === 'Critical').map((r) => {
    const g = rng(`3l-${r.id}`)
    const second = r.category !== 'Delivery' || g.next() < 0.6
    const third = second && (r.openedDays > 90 ? g.next() < 0.7 : g.next() < 0.35)
    return { d, r, first: true, second, third }
  }))
}
export const vaibhavFwMeasures = () => { const t = threeLines(); return [fwMeasure('fw-3l', 'High / critical risks covered by all three lines', '%', 'up', 20, Math.round((t.filter((x) => x.second && x.third).length / t.length) * 100), 100, '1st line owns · 2nd line oversees · 3rd line assures')] }

// ── Santhosh · Run-Grow-Transform, TCO, sensitivity ──────────────────
const GROW = /Lending|Open Banking|Customer 360|Omnichannel|Personali|Mobile|Loyalty|Supply Chain|Demand|Predictive|Quality/i
export const rgtOf = (name: string) => (GROW.test(name) ? 'Grow' : 'Transform')
export const RGT_TARGET = { Run: 60, Grow: 25, Transform: 15 }
export function runGrowTransform(d: DomainId) {
  const l = ledger(d)
  const run = l.reduce((a, x) => a + x.run, 0), change = l.reduce((a, x) => a + x.change, 0)
  const ins = sim[d].initiatives, bt = ins.reduce((a, i) => a + i.budgetCr, 0)
  const grow = change * ins.filter((i) => rgtOf(i.name) === 'Grow').reduce((a, i) => a + i.budgetCr, 0) / bt
  const tot = run + change
  return { Run: Math.round((run / tot) * 100), Grow: Math.round((grow / tot) * 100), Transform: Math.round(((change - grow) / tot) * 100), totalCr: r1(tot) }
}
/** Distance from the 60 / 25 / 15 target mix in percentage points (0 = on target). */
export const rgtGap = (x: { Run: number; Grow: number; Transform: number }) => (Math.abs(x.Run - 60) + Math.abs(x.Grow - 25) + Math.abs(x.Transform - 15)) / 2
export function tco(d: DomainId) {
  return sim[d].initiatives.map((i) => ({ i, build: i.forecastCr, run5: r1(i.budgetCr * 0.1 * 5), tco: r1(i.forecastCr + i.budgetCr * 0.5), overBudget: Math.round((i.forecastCr / i.budgetCr - 1) * 100) }))
}
/** Tornado: NPV swing for one initiative under ±20% value, ±20% build cost, 1-year delay, discount 9% / 15%. */
export function tornado(i: (typeof sim)['banking']['initiatives'][number]) {
  const flows = (v = 1, c = 1, delay = 0) => { const annual = (i.expectedValueCr / 3) * v; const runs = [0.4, 0.8, 1, 1, 1].map((x) => annual * x - i.budgetCr * c * 0.1); return [-i.budgetCr * c, ...Array(delay).fill(-i.budgetCr * c * 0.1), ...runs].slice(0, 6 + delay) }
  const base = npv(0.12, flows())
  const bars = [
    { k: 'Benefit value ±20%', lo: npv(0.12, flows(0.8)), hi: npv(0.12, flows(1.2)) },
    { k: 'Build cost ±20%', lo: npv(0.12, flows(1, 1.2)), hi: npv(0.12, flows(1, 0.8)) },
    { k: 'Go-live 1 year late', lo: npv(0.12, flows(1, 1, 1)), hi: base },
    { k: 'Discount rate 15% / 9%', lo: npv(0.15, flows()), hi: npv(0.09, flows()) },
  ].sort((a, b) => b.hi - b.lo - (a.hi - a.lo))
  return { base, bars }
}
export const santhoshFwMeasures = () => {
  const neg = D.flatMap((d) => sim[d].initiatives).filter((i) => npv(0.12, [-i.budgetCr, ...[0.4, 0.8, 1, 1, 1].map((x) => (i.expectedValueCr / 3) * 0.8 * x - i.budgetCr * 0.1)]) < 0).length
  const gap = r1(D.reduce((a, d) => a + rgtGap(runGrowTransform(d)), 0) / 3)
  return [fwMeasure('fw-rgt', 'Gap from Run-Grow-Transform target mix', 'pts', 'down', 30, gap, 5, 'Half the sum of |actual − target| across 60 / 25 / 15', 1),
    fwMeasure('fw-fragile', 'Investments with NPV < 0 if benefits fall 20%', '', 'down', 19, neg, 5, 'Sensitivity stress test across 30 initiatives')]
}

// ── Pankaj · Theory of Constraints ───────────────────────────────────
export function constraints() {
  const cap = capacity()
  return SCENARIOS.map((s) => {
    const rows = cap.filter((c) => c.d === s.d).sort((a, b) => b.current - a.current)
    const c = rows[0], next = rows.find((x) => x.serviceId !== c.serviceId || x.res !== c.res)!
    const sc = runScenario(s, 0)
    const minOk = [0, 5, 10, 15, 20, 25, 30, 35, 40, 50, 60, 75, 100].find((x) => runScenario(s, x).ok) ?? 100
    return {
      s, c, next, headroom: r1(100 - c.current), peakUtil: sc.util, margin: r1(100 - sc.util),
      steps: [
        ['Identify', `${c.name} · ${c.res} at ${c.current}% peak utilisation is the constraint for ${s.label.toLowerCase()}.`],
        ['Exploit', 'Get the most from it without spending: tune queries, cache, move non-critical jobs out of the peak window.'],
        ['Subordinate', `Schedule batches and changes around the constraint; change freeze during ${s.when.toLowerCase()}.`],
        ['Elevate', `Add capacity: minimum ${minOk}% scale-out meets the response-time target (₹${runScenario(s, minOk).costCr} Cr for the peak).`],
        ['Repeat', `Next constraint once elevated: ${next.name} · ${next.res} (${next.current}%).`],
      ] as [string, string][],
    }
  })
}
export const pankajFwMeasures = () => [fwMeasure('fw-margin', 'Capacity margin at the worst peak', '%', 'up', 2, Math.round(Math.min(...constraints().map((x) => x.margin))), 25, 'Theory of Constraints: 100% − peak utilisation of the constraint')]

// ── Team · Kotter + ADKAR ────────────────────────────────────────────
export const ADKAR = ['Awareness', 'Desire', 'Knowledge', 'Ability', 'Reinforcement'] as const
export const ADKAR_GROUPS: [string, number[]][] = [
  ['CXOs & business heads', [4.5, 4, 3.5, 3.2, 2.8]],
  ['Engineering & IT', [4.2, 3.6, 3.4, 3, 2.6]],
  ['Business users', [3.6, 3, 2.6, 2.4, 2.2]],
  ['Operations & plants', [3.8, 2.8, 2.9, 2.5, 2.3]],
]
/** ADKAR barrier point = the FIRST element scoring below 3 — people stall at the first gap in the sequence. */
export const adkar = () => ADKAR_GROUPS.map(([g, sc]) => { const i = sc.findIndex((v) => v < 3); return { g, sc, barrier: i < 0 ? 'None' : ADKAR[i], score: r1(sc.reduce((a, b) => a + b, 0) / sc.length) } })
export const teamFwMeasures = () => [fwMeasure('fw-adkar', 'ADKAR adoption score (average of groups)', '/5', 'up', 1.8, r1(adkar().reduce((a, x) => a + x.score, 0) / 4), 4, 'Awareness, Desire, Knowledge, Ability, Reinforcement — 1 to 5', 1)]
