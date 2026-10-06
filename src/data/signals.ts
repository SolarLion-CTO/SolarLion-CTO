// Cross-cutting signals for the Executive Overview, Risk register and AI Intelligence.
// Everything here is DERIVED from the other data files — nothing new to maintain.
import { domainOrder, domains, overallScore } from './domains'
import type { DomainId } from './domains'
import {
  apps, assess, customer, customerStatus, cyber, cyberStatus, dr, drStatus, eol, eolStatus, losses, lossTotal, vendorStatus, vendors,
} from './resilience'
import { risks as tedifRisks } from './tedif'
import { buildTree, dims } from './tracker'

export type Severity = 'Critical' | 'High' | 'Medium'
export interface RiskItem {
  id: string; title: string; domain: string; source: string; severity: Severity
  businessImpact: string; techImpact: string; control: 'Effective' | 'Partial' | 'Gap'
  owner: string; mitigation: string; due: string; evidence: string; link: string
}

const appTier = (d: DomainId, id: string) => apps[d].find((a) => a.id === id)!

export function riskRegister(): RiskItem[] {
  const out: RiskItem[] = []
  for (const d of domainOrder) {
    const dn = domains[d].name
    for (const a of apps[d]) {
      const r = assess(a)
      if (r.health === 'Critical') out.push({
        id: `${a.id}-OPS`, title: `${a.name} unstable`, domain: dn, source: 'Applications', severity: r.priority === 'High' ? 'Critical' : 'High',
        businessImpact: a.critical ? `Critical service: ${a.service}` : a.service, techImpact: r.reasons.slice(0, 2).join('; '),
        control: 'Partial', owner: a.owner, mitigation: a.improvement.proposed, due: 'Next gate', evidence: `${a.p1 + a.p2 + a.p3 + a.p4} incidents, ${a.avail}% availability`, link: `/domain/${d}?tab=apps`,
      })
    }
    const cs = cyberStatus(cyber[d])
    if (cs.health !== 'Healthy') out.push({
      id: `${d.toUpperCase().slice(0, 3)}-CYB`, title: 'Cyber security exposure', domain: dn, source: 'Cyber', severity: cs.health === 'Critical' ? 'Critical' : 'High',
      businessImpact: cyber[d].events.filter((e) => e.outcome === 'Breach').map((e) => e.impact)[0] ?? 'Potential data loss', techImpact: cs.reasons.join('; '),
      control: cs.health === 'Critical' ? 'Gap' : 'Partial', owner: 'Vaibhav (CISO)', mitigation: cyber[d].improvements[0].proposed, due: 'Q4', evidence: `${cyber[d].monthly.reduce((s, m) => s + m.breach, 0)} breaches in 6 months`, link: `/domain/${d}?tab=cyber`,
    })
    for (const x of dr[d]) {
      const a = appTier(d, x.appId); const st = drStatus(x, a.tier)
      if (st.health === 'Critical') out.push({
        id: `${x.appId}-DR`, title: `${a.name} may not recover in time`, domain: dn, source: 'DR & continuity', severity: a.tier === 0 && ['Fail', 'Not tested'].includes(x.result) ? 'Critical' : 'High',
        businessImpact: `Tier ${a.tier}: ${a.service}`, techImpact: st.reasons.join('; '), control: 'Gap', owner: a.owner,
        mitigation: x.proposed?.proposed ?? 'Re-test and fix recovery runbook', due: x.nextDrill, evidence: `Last drill: ${x.lastDrill ?? 'never'} (${x.result})`, link: `/domain/${d}?tab=dr`,
      })
    }
    for (const v of vendors[d]) {
      const st = vendorStatus(v)
      if (st.health === 'Critical') out.push({
        id: `${d.toUpperCase().slice(0, 3)}-VND-${v.vendor.slice(0, 4)}`, title: `${v.vendor} — single point of failure`, domain: dn, source: 'Vendors', severity: 'High',
        businessImpact: `Supports ${v.apps}`, techImpact: st.reasons.join('; '), control: 'Gap', owner: 'Santhosh (vendor governance)',
        mitigation: 'Agree exit plan and second-source option', due: v.contractEnd, evidence: `SLA ${v.sla}%`, link: `/domain/${d}?tab=vendors`,
      })
    }
    for (const e of eol[d]) {
      const st = eolStatus(e)
      if (st.health === 'Critical') out.push({
        id: `${d.toUpperCase().slice(0, 3)}-EOL-${e.item.slice(0, 4)}`, title: `${e.item} out of support`, domain: dn, source: 'End of life', severity: e.monthsLeft < 0 ? 'Critical' : 'High',
        businessImpact: `Affects ${e.apps}`, techImpact: st.reasons.join('; '), control: e.exceptionExpiry?.startsWith('Expired') ? 'Gap' : 'Partial', owner: e.appOwner,
        mitigation: e.decision === 'Undecided' ? 'Decide: upgrade, replace or retire' : e.decision, due: e.monthsLeft < 0 ? 'Overdue' : e.endOfSupport, evidence: `${e.version}; ${e.monthsLeft < 0 ? -e.monthsLeft + ' months past support' : e.monthsLeft + ' months left'}`, link: `/domain/${d}?tab=eol`,
      })
    }
  }
  for (const r of tedifRisks.filter((x) => x.severity !== 'Medium')) out.push({
    id: r.id, title: r.risk, domain: 'All', source: 'TEDIF programme', severity: r.severity, businessImpact: 'Programme delivery and trust', techImpact: 'Framework design',
    control: 'Partial', owner: 'Ram (CTO)', mitigation: r.mitigation, due: 'Before next department', evidence: r.domains, link: '/tedif',
  })
  const rank: Record<Severity, number> = { Critical: 0, High: 1, Medium: 2 }
  return out.sort((a, b) => rank[a.severity] - rank[b.severity])
}

export function domainHealth(d: DomainId) {
  const a = apps[d].map(assess)
  const tree = dims.map((dim) => buildTree(dim, d))
  const drRows = dr[d].map((x) => drStatus(x, appTier(d, x.appId).tier))
  return {
    strategic: overallScore(domains[d]),
    appsHealthy: a.filter((x) => x.health === 'Healthy').length,
    appsCritical: a.filter((x) => x.health === 'Critical').length,
    appsHigh: a.filter((x) => x.priority === 'High').length,
    incidents: apps[d].reduce((s, x) => s + x.p1 + x.p2 + x.p3 + x.p4, 0),
    downtime: apps[d].reduce((s, x) => s + x.unplannedMin, 0),
    drTested: dr[d].filter((x) => x.result !== 'Not tested').length,
    drCritical: drRows.filter((x) => x.health === 'Critical').length,
    delivery: Math.round(tree.reduce((s, t) => s + t.progress, 0) / tree.length),
    deliveryRed: tree.reduce((s, t) => s + countRed(t), 0),
    changeFail: Math.round(apps[d].reduce((s, x) => s + x.changeFail, 0) / apps[d].length),
    mttr: +(apps[d].reduce((s, x) => s + x.mttrH, 0) / apps[d].length).toFixed(1),
    lossL: losses[d].reduce((s, l) => s + lossTotal(l), 0),
    cyber: cyberStatus(cyber[d]).health,
    csat: customer[d].trend[customer[d].trend.length - 2].csat,
    customer: customerStatus(customer[d]).health,
  }
}
function countRed(n: { status: string; children: { status: string; children: unknown[] }[] }): number {
  return (n.status === 'Delayed' ? 1 : 0) + n.children.reduce((s, c) => s + countRed(c as never), 0)
}

// AI insights in the Observation → Evidence → Recommendation → Impact → Confidence → Human decision format
export interface Insight { id: string; title: string; scope: string; observation: string; evidence: string[]; recommendation: string; impact: string; confidence: number; approver: string; link: string }
export function insights(): Insight[] {
  const pos = apps.retail.find((a) => a.id === 'RTL-APP-02')!
  const allBreaches = domainOrder.map((d) => cyber[d].monthly.reduce((s, m) => s + m.breach, 0))
  const spof = domainOrder.flatMap((d) => vendors[d].filter((v) => vendorStatus(v).health === 'Critical').map((v) => `${domains[d].name}: ${v.vendor}`))
  const loss = domainOrder.map((d) => ({ d, l: losses[d].reduce((s, x) => s + lossTotal(x), 0) }))
  return [
    {
      id: 'AI-01', title: 'Incident volume makes POS critical despite good availability', scope: 'Retail',
      observation: `POS met its availability target and had no P1, but logged ${pos.p1 + pos.p2 + pos.p3 + pos.p4} incidents in 30 days.`,
      evidence: [`P3 ${pos.p3} · P4 ${pos.p4} incidents`, '16% of retail complaints mention store billing delays', 'POS terminals are past end of support (June 2026)'],
      recommendation: 'Run problem management on the top 3 recurring causes and accelerate the terminal replacement pilot.',
      impact: 'Fewer store queues before the festive peak; est. ₹40 L / yr in avoided lost sales', confidence: 0.82, approver: 'Head of stores', link: '/domain/retail?tab=apps',
    },
    {
      id: 'AI-02', title: 'Customer satisfaction drops follow critical-app incidents in every domain', scope: 'Cross-domain',
      observation: 'In all three domains, the month with the worst incident (UPI, SAP / HMI, e-commerce) is the month CSAT fell 3–6 points.',
      evidence: domainOrder.map((d) => `${domains[d].name}: ${customer[d].insight}`),
      recommendation: 'Send proactive outage messages to customers when a critical app degrades, in all domains.',
      impact: 'Protects 2–4 CSAT points per major incident; reusable pattern across domains', confidence: 0.78, approver: 'Suman (strategy)', link: '/domain/banking?tab=customer',
    },
    {
      id: 'AI-03', title: 'Operational technology is Manufacturing’s largest single loss driver', scope: 'Manufacturing',
      observation: 'One USB-borne malware on a plant HMI stopped Line 2 for 6 hours — the largest incident cost in the period.',
      evidence: ['₹64 L cost (revenue ₹42 L, penalties ₹6 L)', 'Plant HMIs past end of support since 2020; risk exception expired', 'OT protection coverage 64% vs 90% target'],
      recommendation: 'Approve OT segmentation and USB control; renew or replace the HMI fleet.',
      impact: '₹60 L / yr prevention cost vs ₹250 L / yr loss avoided', confidence: 0.86, approver: 'COO with CISO', link: '/domain/manufacturing?tab=cyber',
    },
    {
      id: 'AI-04', title: 'Critical vendors without exit plans', scope: 'Cross-domain',
      observation: `${spof.length} vendors are single points of failure with no exit plan.`,
      evidence: spof,
      recommendation: 'Require an exit plan and second-source option at the next contract review; track in vendor governance.',
      impact: 'Removes the largest unmanaged continuity risk', confidence: 0.74, approver: 'Santhosh (finance)', link: '/domain/manufacturing?tab=vendors',
    },
    {
      id: 'AI-05', title: 'Breaches are concentrated, and one was reported late under DPDP', scope: 'Cross-domain',
      observation: `${allBreaches.reduce((a, b) => a + b, 0)} breaches in 6 months across domains; Retail’s loyalty-data incident was reported after 72 hours.`,
      evidence: domainOrder.map((d, i) => `${domains[d].name}: ${allBreaches[i]} breaches`).concat('Retail: ₹25 L fine recorded in P&L'),
      recommendation: 'Automate joiner-mover-leaver access removal and a 72-hour breach-reporting workflow owned by the DPO.',
      impact: 'Avoids repeat regulatory fines; DPDP readiness before May 2027', confidence: 0.81, approver: 'Vaibhav (CISO / DPO)', link: '/domain/retail?tab=cyber',
    },
    {
      id: 'AI-06', title: 'Where the business loss sits', scope: 'Cross-domain',
      observation: `Costed incidents total ₹${loss.reduce((s, x) => s + x.l, 0)} L in 6 months.`,
      evidence: loss.map((x) => `${domains[x.d].name}: ₹${x.l} L`),
      recommendation: 'Fund the prevention measures with the highest loss-avoided ratio first (festive cloud burst, OT segmentation, ERP hybrid capacity).',
      impact: 'Each funded measure pays back within a year', confidence: 0.76, approver: 'CFO', link: '/domain/manufacturing?tab=pnl',
    },
  ]
}
