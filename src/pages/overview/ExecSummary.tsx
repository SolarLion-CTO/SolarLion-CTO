import { Link } from 'react-router-dom'
import { ArrowRight, CircleAlert, Gavel, ListTodo, TriangleAlert } from 'lucide-react'
import { useStore } from '../../store'
import { domains } from '../../data/domains'
import { apps, assess } from '../../data/resilience'
import { domainHealth, riskRegister } from '../../data/signals'
import { ctoDecisions } from '../../data/cto'
import { Badge, Card } from '../../components/ui'

// Executive summary: what is happening → why it matters → what decision is needed.
export default function ExecSummary() {
  const { domainId, domain, decisions, verdictFor } = useStore()
  const h = domainHealth(domainId)
  const risks = riskRegister().filter((r) => r.domain === domain.name || r.domain === 'All')
  const exceptions = risks.filter((r) => r.source !== 'TEDIF programme').slice(0, 4)
  const topRisks = risks.slice(0, 4)
  const pendingBiz = decisions.filter((d) => !verdictFor(d.id))
  const pendingCto = ctoDecisions.filter((d) => d.status === 'Pending')
  const spend = domain.capexOpex.reduce((s, q) => s + q.capex + q.opex, 0)
  const invest = domain.initiatives.reduce((s, i) => s + i.investment, 0)
  const value = domain.initiatives.reduce((s, i) => s + i.value, 0)
  const actions = apps[domainId].filter((a) => ['PoC', 'Pilot'].includes(a.improvement.stage)).slice(0, 4)
  const top = apps[domainId].map((a) => ({ a, r: assess(a) })).find((x) => x.r.priority === 'High')
  const riskCount = risks.filter((r) => r.severity === 'Critical').length

  const kpis: { label: string; value: string; note: string; tone: 'ok' | 'warn' | 'crit' | 'info' }[] = [
    { label: 'Strategic execution', value: `${h.strategic}%`, note: 'progress to target', tone: h.strategic >= 60 ? 'ok' : 'warn' },
    { label: 'Technology operations', value: `${h.appsHealthy} / ${apps[domainId].length}`, note: `apps healthy · ${h.appsCritical} critical`, tone: h.appsCritical ? 'crit' : 'ok' },
    { label: 'Engineering delivery', value: `${h.delivery}%`, note: `${h.deliveryRed} red items in plans`, tone: h.deliveryRed ? 'warn' : 'ok' },
    { label: 'Technology spend', value: `₹${spend.toFixed(1)} Cr`, note: 'FY run-rate (CAPEX + OPEX)', tone: 'info' },
    { label: 'Innovation', value: `${domain.problems.Innovation.progress}%`, note: domain.problems.Innovation.title, tone: 'info' },
    { label: 'Risk', value: `${riskCount}`, note: 'critical risks need attention', tone: riskCount ? 'crit' : 'ok' },
  ]
  const toneText = { ok: 'text-success-text', warn: 'text-warn-text', crit: 'text-crit-text', info: 'text-ink-3' }
  const toneDot = { ok: 'bg-ok', warn: 'bg-warn', crit: 'bg-crit', info: 'bg-brand-600' }

  return (
    <div className="mb-8">
      {/* 1 · Critical KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-5">
        {kpis.map((k) => (
          <div key={k.label} className="bg-surface rounded-xl border border-line shadow-[0_1px_2px_rgba(15,23,42,0.04)] p-4">
            <div className="text-xs font-medium text-ink-2 flex items-center gap-1.5"><span className={`w-1.5 h-1.5 rounded-full ${toneDot[k.tone]}`} />{k.label}</div>
            <div className="text-[28px] font-bold text-brand-900 leading-tight mt-1 tabular-nums">{k.value}</div>
            <div className={`text-xs line-clamp-2 ${toneText[k.tone]}`} title={k.note}>{k.note}</div>
          </div>
        ))}
      </div>

      {/* 2 · Signal → Insight → Decision → Action → Outcome */}
      {top && (
        <section className="bg-surface rounded-xl border border-line p-4 mb-5" aria-label="Decision flow">
          <div className="text-xs font-semibold text-ink-2 mb-3">From signal to outcome · {top.a.name}</div>
          <div className="grid md:grid-cols-5 gap-2 text-sm">
            {[
              ['Signal', `${top.a.name}: ${top.r.health.toLowerCase()}`],
              ['Insight', top.r.reasons.slice(0, 2).join('; ')],
              ['Decision', `${top.a.improvement.proposed}`],
              ['Action', `${top.a.improvement.stage} · owner ${top.a.improvement.owner}`],
              ['Outcome', `${top.a.slo}% availability, P1-free month`],
            ].map(([k, v], i) => (
              <div key={k} className="flex items-stretch gap-2">
                <div className={`flex-1 rounded-lg p-3 ${i === 2 ? 'bg-brand-50 border border-brand-100' : 'bg-slate-50 border border-line'}`}>
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-3">{k}</div>
                  <div className="text-ink mt-0.5 leading-snug">{v}</div>
                </div>
                {i < 4 && <ArrowRight size={16} className="hidden md:block self-center text-ink-4 shrink-0" />}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3 · Consolidated health */}
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
        <Card title="Strategic health">
          <dl className="text-sm space-y-2">
            <Row k="Progress to target" v={`${h.strategic}%`} />
            <Row k="Maturity" v={`${domain.maturity.current} → ${domain.maturity.target}`} />
            <Row k="Strategy problem" v={domain.problems.Strategy.current} sub={domain.problems.Strategy.kpi} />
          </dl>
          <Link to="/cto/strategy" className="text-xs font-semibold text-brand-600 mt-3 inline-block">Strategy →</Link>
        </Card>
        <Card title="Operational health">
          <dl className="text-sm space-y-2">
            <Row k="Apps healthy" v={`${h.appsHealthy} of ${apps[domainId].length}`} bad={h.appsCritical > 0} />
            <Row k="Incidents (30 days)" v={`${h.incidents}`} />
            <Row k="Unplanned downtime" v={`${h.downtime} min`} />
            <Row k="DR tested" v={`${h.drTested} of ${apps[domainId].length}`} />
            <Row k="Recovery at risk" v={`${h.drCritical} app${h.drCritical === 1 ? '' : 's'}`} bad={h.drCritical > 0} />
          </dl>
          <Link to={`/domain/${domainId}?tab=apps`} className="text-xs font-semibold text-brand-600 mt-3 inline-block">Applications →</Link>
        </Card>
        <Card title="Engineering performance">
          <dl className="text-sm space-y-2">
            <Row k="Delivery progress" v={`${h.delivery}%`} />
            <Row k="Red items in plans" v={`${h.deliveryRed}`} bad={h.deliveryRed > 0} />
            <Row k="Change failure rate" v={`${h.changeFail}%`} bad={h.changeFail > 10} />
            <Row k="Mean time to restore" v={`${h.mttr} h`} />
          </dl>
          <Link to="/engineering" className="text-xs font-semibold text-brand-600 mt-3 inline-block">Engineering →</Link>
        </Card>
        <Card title="Financial position">
          <dl className="text-sm space-y-2">
            <Row k="Invested (AI programme)" v={`₹${invest.toFixed(1)} Cr`} />
            <Row k="Annual value" v={`₹${value.toFixed(1)} Cr`} />
            <Row k="Programme ROI" v={`${domain.kpis.roi}%`} />
            <Row k="Business loss (6 m)" v={`₹${h.lossL} L`} bad={h.lossL > 100} />
          </dl>
          <Link to={`/domain/${domainId}?tab=pnl`} className="text-xs font-semibold text-brand-600 mt-3 inline-block">P&amp;L impact →</Link>
        </Card>
      </div>

      {/* 4 · Attention */}
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
        <ListCard title="Top risks" icon={TriangleAlert} link="/risk" items={topRisks.map((r) => ({ key: r.id, main: r.title, sub: `${r.source} · ${r.owner}`, badge: r.severity }))} />
        <ListCard title="Major exceptions" icon={CircleAlert} link={`/domain/${domainId}?tab=apps`} items={exceptions.map((r) => ({ key: r.id, main: r.title, sub: r.techImpact, badge: r.severity, to: r.link }))} />
        <ListCard title="Decisions required" icon={Gavel} link="/decisions" items={[
          ...pendingBiz.slice(0, 2).map((d) => ({ key: d.id, main: d.title, sub: `${d.id} · approver ${d.approver}`, badge: d.risk })),
          ...pendingCto.slice(0, 2).map((d) => ({ key: d.decision, main: d.decision, sub: `CTO · ${d.role} · ${d.when}`, badge: 'Pending' })),
        ]} />
        <ListCard title="Priority actions" icon={ListTodo} link={`/domain/${domainId}?tab=apps`} items={actions.map((a) => ({ key: a.id, main: a.improvement.proposed, sub: `${a.name} · ${a.improvement.stage} · ${a.improvement.owner}`, badge: assess(a).priority }))} />
      </div>
      <p className="text-xs text-ink-3 mt-3">{domains[domainId].name} · all figures illustrative · detail below</p>
    </div>
  )
}

function Row({ k, v, sub, bad }: { k: string; v: string; sub?: string; bad?: boolean }) {
  return (
    <div className="flex justify-between gap-3 border-b border-line last:border-0 pb-1.5">
      <dt className="text-ink-2">{k}{sub && <span className="block text-xs text-ink-3">{sub}</span>}</dt>
      <dd className={`font-semibold tabular-nums text-right ${bad ? 'text-crit-text' : 'text-ink'}`}>{v}</dd>
    </div>
  )
}

function ListCard({ title, icon: Icon, items, link }: { title: string; icon: typeof Gavel; link: string; items: { key: string; main: string; sub: string; badge: string; to?: string }[] }) {
  return (
    <Card title={title} action={<Icon size={16} className="text-ink-3" />}>
      {items.length === 0 ? <p className="text-sm text-success-text">Nothing outstanding.</p> : (
        <ul className="space-y-2.5">{items.map((i) => (
          <li key={i.key} className="flex gap-2 text-sm">
            <div className="flex-1 min-w-0"><div className="font-medium text-ink leading-snug">{i.main}</div><div className="text-xs text-ink-3 truncate" title={i.sub}>{i.sub}</div></div>
            <div className="shrink-0"><Badge>{i.badge}</Badge></div>
          </li>
        ))}</ul>
      )}
      <Link to={link} className="text-xs font-semibold text-brand-600 mt-3 inline-block">View all →</Link>
    </Card>
  )
}
