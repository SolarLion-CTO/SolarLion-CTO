// Cross-workspace checks for the team data (M7.6). Run with: npm run validate:sim
import { sim } from './index'
import { USE_CASES, STAGES, roi } from './aiPortfolio'
import { circulars, liveCircular, models } from './governance'
import { ledger, runCostCr } from './spend'
import { capacity, problems, recurringOpen } from './ops'
import { OWNERS, ownerState } from './team'
import { goldenThread } from './scenario'
import type { DomainId } from '../domains'

export function validateTeam() {
  const errors: string[] = [], notes: string[] = []
  const D: DomainId[] = ['banking', 'manufacturing', 'retail']
  const ids = new Set(D.flatMap((d) => { const s = sim[d]; return [...s.applications, ...s.initiatives, ...s.services, ...s.controls, ...s.risks, ...s.processes].map((x) => x.id) }))
  // Suman
  for (const u of USE_CASES) {
    if (!STAGES.includes(u.stage)) errors.push(`${u.id} bad stage`)
    if (u.appId && !ids.has(u.appId)) errors.push(`${u.id} → app ${u.appId} missing`)
    if (u.initiativeId && !ids.has(u.initiativeId)) errors.push(`${u.id} → initiative ${u.initiativeId} missing`)
    if (!(u.vMin <= u.vLikely && u.vLikely <= u.vMax)) errors.push(`${u.id} value range not ordered`)
    if (u.gate && u.stage !== 'Pilot') errors.push(`${u.id} has a gate but is not a pilot`)
  }
  const neg = USE_CASES.filter((u) => roi(u).npv < 0).length
  notes.push(`Suman: ${USE_CASES.length} use cases, ${neg} with negative NPV`)
  // Vaibhav
  for (const c of [...circulars, liveCircular]) for (const o of c.obligations) if (o.controlId && !ids.has(o.controlId)) errors.push(`${o.id} → control ${o.controlId} missing`)
  for (const m of models) { if (m.useCase.appId && !ids.has(m.useCase.appId)) errors.push(`${m.id} → app missing`); if (Math.abs(m.actual.reduce((a, b) => a + b, 0) - 1) > 0.01) errors.push(`${m.id} distribution does not sum to 1`) }
  notes.push(`Vaibhav: ${circulars.length} circulars, ${circulars.reduce((a, c) => a + c.obligations.length, 0)} obligations, ${models.length} models (${models.filter((m) => m.approval === 'Restricted').length} restricted)`)
  // Santhosh: run-cost categories reconcile with app + service costs (within 3%)
  for (const d of D) {
    const l = ledger(d)
    const runCats = l.reduce((a, x) => a + x.byCat['Licences & SaaS'] + x.byCat.People + x.byCat['Vendors & services'] + x.byCat['Hardware & DC'], 0)
    const diff = Math.abs(runCats - runCostCr(d)) / runCostCr(d)
    if (diff > 0.03) errors.push(`${d}: run-cost categories ₹${runCats.toFixed(1)} Cr vs app + service cost ₹${runCostCr(d).toFixed(1)} Cr (${(diff * 100).toFixed(1)}%)`)
    const cloud = sim[d].metrics.find((m) => m.functionId === 'finance' && m.key === 'cloud')!
    const cl = l.reduce((a, x) => a + x.byCat.Cloud, 0), exp = cloud.series.reduce((a, b) => a + b, 0) / 3
    if (Math.abs(cl - exp) > 0.1) errors.push(`${d}: cloud ledger ${cl.toFixed(2)} ≠ metric ${exp.toFixed(2)}`)
    if (l.some((x) => Math.abs(x.capex + x.opex - x.total) > 0.02)) errors.push(`${d}: CAPEX + OPEX ≠ total`)
  }
  notes.push(`Santhosh: ledgers reconcile with run cost and cloud metric (±3%)`)
  // Pankaj
  for (const p of problems) if (!ids.has(p.serviceId)) errors.push(`${p.id} → service missing`)
  const minHead = Math.round(100 - Math.max(...capacity().map((c) => c.current)))
  notes.push(`Pankaj: ${problems.length} problem records (${recurringOpen()} recurring open), min headroom ${minHead}%`)
  // Measures
  for (const o of OWNERS) {
    const st = ownerState(o)
    for (const m of st.measures) {
      if (m.series.length !== 12) errors.push(`${m.def.id} series length ${m.series.length}`)
      if (m.baseline !== m.series[0] || m.current !== m.series[11]) errors.push(`${m.def.id} baseline/current not first/last point`)
      if (m.progress < 0 || m.progress > 100) errors.push(`${m.def.id} progress out of range`)
    }
  }
  const pk = ownerState(OWNERS.find((o) => o.id === 'pankaj')!).measures
  if (pk.find((m) => m.def.id === 'pan-recur')!.current !== recurringOpen()) errors.push('pan-recur measure does not match problem records')
  if (pk.find((m) => m.def.id === 'pan-head')!.current !== minHead) errors.push('pan-head measure does not match capacity data')
  notes.push(`Team: ${OWNERS.map((o) => `${o.name} ${ownerState(o).score}%`).join(', ')}`)
  // Golden thread evidence
  for (const s of goldenThread()) for (const e of s.evidence) if (!ids.has(e) && !e.startsWith('MET-')) errors.push(`Golden thread step ${s.n} evidence ${e} missing`)
  return { errors, notes }
}
