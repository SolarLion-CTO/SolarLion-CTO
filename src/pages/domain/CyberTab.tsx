import { ShieldAlert, ShieldCheck, ShieldX } from 'lucide-react'
import { cyber, cyberStatus } from '../../data/resilience'
import type { DomainId } from '../../data/domains'
import { Badge, Card } from '../../components/ui'
import StagePath from './StagePath'

const n = (x: number) => x.toLocaleString('en-IN')

export default function CyberTab({ domainId }: { domainId: DomainId }) {
  const c = cyber[domainId]
  const st = cyberStatus(c)
  const t = c.monthly.reduce((s, m) => ({ attempts: s.attempts + m.attempts, blocked: s.blocked + m.blocked, contained: s.contained + m.contained, breach: s.breach + m.breach }), { attempts: 0, blocked: 0, contained: 0, breach: 0 })

  return (
    <>
      <Card className="mb-5" title="Cyber posture — last 6 months" action={<Badge>{st.health}</Badge>}>
        <div className="grid sm:grid-cols-4 gap-3 mb-3">
          <div className="rounded-lg border border-line p-3"><div className="text-xs text-ink-3">Threat attempts</div><div className="text-[26px] font-bold text-brand-900">{n(t.attempts)}</div></div>
          <div className="rounded-lg border border-line p-3"><div className="text-xs text-ink-3 flex items-center gap-1"><ShieldCheck size={13} className="text-success-text" />Stopped at the perimeter</div><div className="text-[26px] font-bold text-brand-900">{n(t.blocked)}</div><div className="text-xs text-success-text">{((t.blocked / t.attempts) * 100).toFixed(2)}% blocked</div></div>
          <div className="rounded-lg border border-line p-3"><div className="text-xs text-ink-3 flex items-center gap-1"><ShieldAlert size={13} className="text-warn-text" />Got in, then contained</div><div className="text-[26px] font-bold text-brand-900">{n(t.contained)}</div><div className="text-xs text-warn-text">detected and stopped inside</div></div>
          <div className="rounded-lg border border-red-200 bg-crit-bg p-3"><div className="text-xs text-crit-text flex items-center gap-1"><ShieldX size={13} />Not stopped (breach)</div><div className="text-[26px] font-bold text-crit-text">{t.breach}</div><div className="text-xs text-crit-text">each linked to an incident and P&amp;L</div></div>
        </div>
        {st.reasons.length > 0 && <p className="text-sm text-ink-2"><b>Why {st.health.toLowerCase()}:</b> {st.reasons.join(' · ')}</p>}
        <div className="overflow-x-auto mt-3">
          <table className="w-full text-sm min-w-[560px] [&_th]:px-2 [&_td]:px-2">
            <thead><tr className="text-[11px] uppercase tracking-wide text-ink-3 border-b border-line text-left"><th className="py-2">Month</th><th className="text-right">Attempts</th><th className="text-right">Blocked</th><th className="text-right">Contained</th><th className="text-right">Breach</th></tr></thead>
            <tbody>{c.monthly.map((m) => (
              <tr key={m.month} className="border-b border-line last:border-0"><td className="py-1.5">{m.month}{m.month === 'Oct' && <span className="text-ink-3 text-xs"> (to date)</span>}</td><td className="text-right">{n(m.attempts)}</td><td className="text-right">{n(m.blocked)}</td><td className="text-right">{m.contained}</td><td className={`text-right font-semibold ${m.breach ? 'text-crit-text' : 'text-ink-3'}`}>{m.breach}</td></tr>
            ))}</tbody>
          </table>
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-5 mb-5">
        <Card title="Controls by layer" className="lg:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[560px] [&_th]:px-2 [&_td]:px-2">
              <thead><tr className="text-[11px] uppercase tracking-wide text-ink-3 border-b border-line text-left"><th className="py-2">Layer</th><th>Control</th><th className="w-40">Coverage</th><th>Status</th></tr></thead>
              <tbody>{c.controls.map((x) => {
                const ok = x.coverage >= x.target
                return (
                  <tr key={x.control} className="border-b border-line last:border-0">
                    <td className="py-2 text-ink-3">{x.layer}</td><td className="font-medium text-ink">{x.control}</td>
                    <td><div className="flex items-center gap-2"><div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full ${ok ? 'bg-brand-600' : 'bg-warn'}`} style={{ width: `${x.coverage}%` }} /></div><span className="text-xs tabular-nums w-20 text-right whitespace-nowrap">{x.coverage}% / {x.target}%</span></div></td>
                    <td><Badge>{ok ? 'Compliant' : x.coverage < x.target - 10 ? 'Gap' : 'Partial'}</Badge></td>
                  </tr>
                )
              })}</tbody>
            </table>
          </div>
        </Card>
        <Card title="Vulnerabilities & response">
          <dl className="text-sm space-y-2">
            {[
              ['Critical vulnerabilities open', c.vulns.critical, false],
              ['Critical past patch SLA', c.vulns.criticalOverdue, c.vulns.criticalOverdue > 0],
              ['High vulnerabilities open', c.vulns.high, false],
              ['Patched within SLA', `${c.vulns.patchSla}%`, c.vulns.patchSla < 90],
              ['Mean time to detect', `${c.detect.mttdH} h`, c.detect.mttdH > 6],
              ['Mean time to respond', `${c.detect.mttrH} h`, c.detect.mttrH > 12],
              ['Phishing test click rate', `${c.detect.phishClick}%`, c.detect.phishClick > 5],
              ['SOC alerts (6 months)', n(c.detect.socAlerts), false],
            ].map(([l, v, bad]) => (
              <div key={l as string} className="flex justify-between border-b border-line last:border-0 pb-1.5"><dt className="text-ink-2">{l}</dt><dd className={`font-semibold tabular-nums ${bad ? 'text-warn-text' : 'text-ink'}`}>{v as string}</dd></div>
            ))}
          </dl>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-5 mb-5">
        <Card title="NIST CSF 2.0 maturity (1–5)">
          <div className="space-y-2.5">
            {c.nist.map((f) => (
              <div key={f.fn}>
                <div className="flex justify-between text-xs mb-1"><span className="font-medium text-ink">{f.fn}</span><span className="tabular-nums"><b>{f.now.toFixed(1)}</b> → <b className="text-brand-700">{f.target.toFixed(1)}</b></span></div>
                <div className="h-2 bg-slate-100 rounded-full relative overflow-hidden">
                  <div className="absolute h-full bg-seq-250" style={{ width: `${(f.target / 5) * 100}%` }} />
                  <div className="absolute h-full bg-brand-900" style={{ width: `${(f.now / 5) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-4 text-xs text-ink-3 mt-3"><span><span className="inline-block w-3 h-3 rounded-sm bg-brand-900 mr-1 align-middle" />Today</span><span><span className="inline-block w-3 h-3 rounded-sm bg-seq-250 mr-1 align-middle" />Target</span></div>
        </Card>
        <Card title="What actually happened">
          <ul className="space-y-3">{c.events.map((e) => (
            <li key={e.date + e.what} className="text-sm border-b border-line last:border-0 pb-2">
              <div className="flex flex-wrap items-center gap-2"><Badge>{e.outcome}</Badge><span className="text-xs text-ink-3">{e.date} · {e.app}</span>
                {e.dpdpReportable && <span className={`text-[11px] font-medium rounded px-1.5 py-0.5 border ${e.reportedIn72h ? 'bg-success-bg text-success-text border-green-200' : 'bg-crit-bg text-crit-text border-red-200'}`}>DPDP reportable · {e.reportedIn72h ? 'reported < 72 h' : 'reported late'}</span>}
              </div>
              <div className="font-medium text-ink mt-1">{e.what}</div>
              <div className="text-xs text-ink-2">{e.impact}</div>
            </li>
          ))}</ul>
        </Card>
      </div>

      <Card title="Improvements — current → proposed → pilot">
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {c.improvements.map((i) => (
            <div key={i.name} className="rounded-lg border border-line p-3 text-sm">
              <div className="font-semibold text-ink mb-1">{i.name}</div>
              <div className="text-xs text-ink-3">Current</div><div className="mb-1">{i.current}</div>
              <div className="text-xs text-ink-3">Proposed</div><div className="mb-2 font-medium text-brand-900">{i.proposed}</div>
              <StagePath imp={i} />
              <div className="text-xs text-ink-3 mt-2">Owner {i.owner} · feasibility {i.feasibility}/10</div>
            </div>
          ))}
        </div>
      </Card>
    </>
  )
}
