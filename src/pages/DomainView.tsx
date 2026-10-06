import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ChevronDown, ChevronRight, Crown, Flag, MapPin, User, Users } from 'lucide-react'
import { areas, domainOrder, domains } from '../data/domains'
import type { DomainId, Health } from '../data/domains'
import { cascade, trackLead, tracks } from '../data/cascade'
import type { Track } from '../data/cascade'
import { summary } from '../data/tedif'
import { useStore } from '../store'
import { Badge, Bar, money } from '../components/ui'
import { apps, assess, customer, customerStatus, cyber, cyberStatus, dr, drStatus, eol, eolStatus, losses, lossTotal, vendorStatus, vendors } from '../data/resilience'
import AppsTab from './domain/AppsTab'
import CyberTab from './domain/CyberTab'
import PnlTab from './domain/PnlTab'
import DrTab from './domain/DrTab'
import CustomerTab from './domain/CustomerTab'
import VendorsTab from './domain/VendorsTab'
import EolTab from './domain/EolTab'

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'apps', label: 'Applications & incidents' },
  { key: 'cyber', label: 'Cyber security' },
  { key: 'dr', label: 'DR & continuity' },
  { key: 'customer', label: 'Customer' },
  { key: 'vendors', label: 'Vendors & support' },
  { key: 'eol', label: 'End of life' },
  { key: 'pnl', label: 'Business impact (P&L)' },
] as const

const healthBorder: Record<Health, string> = { 'On Track': 'border-l-emerald-500', 'At Risk': 'border-l-amber-400', Delayed: 'border-l-red-500' }
const healthDot: Record<Health, string> = { 'On Track': 'bg-emerald-500', 'At Risk': 'bg-amber-400', Delayed: 'bg-red-500' }

function Level({ n, label, icon: Icon }: { n: number; label: string; icon: typeof Crown }) {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide rounded px-1.5 py-0.5 bg-slate-800 text-white">
      <Icon size={10} /> L{n} · {label}
    </span>
  )
}

export default function DomainView() {
  const { id } = useParams()
  const domainId = (domainOrder.includes(id as DomainId) ? id : 'banking') as DomainId
  const { setDomainId, decisions, verdictFor } = useStore()
  useEffect(() => { setDomainId(domainId) }, [domainId, setDomainId])

  const d = domains[domainId]
  const c = cascade[domainId]
  const s = summary[domainId]
  const [open, setOpen] = useState<Record<string, boolean>>({ Operations: true })
  const allOpen = tracks.every((t) => open[t])
  const toggleAll = () => setOpen(Object.fromEntries(tracks.map((t) => [t, !allOpen])))

  const ground = tracks.flatMap((t) => c.tracks[t].initiatives.flatMap((i) => i.ground.map((g) => ({ ...g, track: t, initiative: i.name }))))
  const delayed = ground.filter((g) => g.status === 'Delayed')
  const atRisk = ground.filter((g) => g.status === 'At Risk')
  const valueAtTarget = areas.reduce((sum, a) => sum + d.problems[a].valueCr, 0)
  const pending = decisions.filter((x) => !verdictFor(x.id)).length
  const [params, setParams] = useSearchParams()
  const tab = (TABS.find((t) => t.key === params.get('tab'))?.key ?? 'overview') as (typeof TABS)[number]['key']
  const appRows = apps[domainId].map((a) => ({ a, r: assess(a) }))
  const highApps = appRows.filter((x) => x.r.priority === 'High')
  const cy = cyberStatus(cyber[domainId])
  const lossL = losses[domainId].reduce((sum, l) => sum + lossTotal(l), 0)
  const drCrit = dr[domainId].filter((x) => drStatus(x, apps[domainId].find((a) => a.id === x.appId)!.tier).health === 'Critical')
  const vendorCrit = vendors[domainId].filter((v) => vendorStatus(v).health === 'Critical')
  const eolCrit = eol[domainId].filter((e) => eolStatus(e).health === 'Critical')
  const cust = customerStatus(customer[domainId])
  const tabBadge: Record<string, string> = {
    apps: `${appRows.filter((x) => x.r.health === 'Critical').length} critical`,
    cyber: cy.health,
    dr: `${drCrit.length} critical`,
    customer: cust.health,
    vendors: `${vendorCrit.length} critical`,
    eol: `${eolCrit.length} critical`,
    pnl: `₹${lossL} L`,
  }

  return (
    <>
      {/* Domain header */}
      <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-blue-700">Industry domain{d.configuredOnly && ' · added by configuration only'}</div>
          <h1 className="text-3xl font-semibold tracking-tight text-brand-900">{d.name}</h1>
          <p className="text-slate-500 text-sm">{d.tagline} · tracked from CTO to ground level</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-blue-50 border border-blue-200 text-blue-800 font-semibold px-3 py-1">{s.phase}</span>
          <span className="rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold px-3 py-1">Last gate: {s.lastGate}</span>
          <Link to="/tedif" className="rounded-full bg-white border border-line font-semibold px-3 py-1 hover:bg-slate-50">TEDIF tracker →</Link>
        </div>
      </div>

      {/* Tabs — same structure for every domain */}
      <div className="border-b border-line mb-5 overflow-x-auto" role="tablist" aria-label={`${d.name} views`}>
        <div className="flex gap-1 min-w-max">
          {TABS.map((t) => {
            const active = tab === t.key
            return (
              <button
                key={t.key}
                role="tab"
                aria-selected={active}
                onClick={() => setParams(t.key === 'overview' ? {} : { tab: t.key })}
                className={`px-4 py-2.5 text-sm border-b-2 -mb-px transition flex items-center gap-2 ${active ? 'border-brand-600 text-brand-700 font-semibold' : 'border-transparent text-ink-2 hover:text-ink'}`}
              >
                {t.label}
                {tabBadge[t.key] && <span className={`text-[11px] font-medium rounded-full px-2 py-0.5 ${tabBadge[t.key].startsWith('0') || tabBadge[t.key] === 'Healthy' ? 'bg-slate-100 text-ink-3' : t.key === 'pnl' ? 'bg-slate-100 text-ink-2' : 'bg-crit-bg text-crit-text'}`}>{tabBadge[t.key]}</span>}
              </button>
            )
          })}
        </div>
      </div>

      {tab === 'apps' && <AppsTab domainId={domainId} />}
      {tab === 'cyber' && <CyberTab domainId={domainId} />}
      {tab === 'pnl' && <PnlTab domainId={domainId} />}
      {tab === 'dr' && <DrTab domainId={domainId} />}
      {tab === 'customer' && <CustomerTab domainId={domainId} />}
      {tab === 'vendors' && <VendorsTab domainId={domainId} />}
      {tab === 'eol' && <EolTab domainId={domainId} />}

      {tab === 'overview' && (<>
      {/* Level 1 — CTO */}
      <section className="rounded-xl bg-brand-900 text-white p-5 mb-5 shadow">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide rounded px-1.5 py-0.5 bg-white/20"><Crown size={10} /> L1 · CTO view</span>
          <span className="text-xs text-blue-200">Owner: Ram (CTO)</span>
        </div>
        <h2 className="text-lg font-bold">{c.ctoObjective}</h2>
        <p className="text-sm text-blue-200 mt-1">CTO question: “{c.ctoQuestion}”</p>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mt-4">
          {[
            ['Value at target', `${money(valueAtTarget)}/yr`],
            ['Programme ROI', `${d.kpis.roi}%`],
            ['Maturity', `${d.maturity.current} → ${d.maturity.target}`],
            ['Compliance', `${d.kpis.compliance}%`],
            ['Decisions awaiting', `${pending}`],
            ['Ground escalations', `${delayed.length} red · ${atRisk.length} amber`],
          ].map(([l, v]) => (
            <div key={l} className="rounded-lg bg-white/10 p-3"><div className="text-[10px] uppercase text-blue-200 font-semibold">{l}</div><div className="font-bold text-lg leading-tight">{v}</div></div>
          ))}
        </div>
      </section>

      {/* Track strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-5">
        {tracks.map((t) => {
          const tp = c.tracks[t]
          const prog = Math.round(tp.initiatives.reduce((sum, i) => sum + i.progress, 0) / tp.initiatives.length)
          return (
            <button key={t} onClick={() => { setOpen((o) => ({ ...o, [t]: true })); document.getElementById(`track-${t}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }}
              className={`text-left bg-white rounded-xl border border-line border-l-4 ${healthBorder[tp.status]} p-3 hover:shadow`}>
              <div className="flex justify-between items-center"><span className="font-bold text-sm">{t}</span><span className={`w-2 h-2 rounded-full ${healthDot[tp.status]}`} /></div>
              <div className="text-[11px] text-slate-500 mb-2">{trackLead[t]}</div>
              <Bar value={prog} /><div className="text-[11px] mt-1 text-slate-500">{prog}% delivered</div>
            </button>
          )
        })}
      </div>

      <div className="grid xl:grid-cols-4 gap-5">
        {/* Cascade */}
        <div className="xl:col-span-3 space-y-4 min-w-0">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">Core problems · CTO → ground</h2>
            <button onClick={toggleAll} className="text-xs font-semibold text-blue-700 border border-blue-200 rounded-lg px-3 py-1 hover:bg-blue-50">{allOpen ? 'Collapse all' : 'Expand all'}</button>
          </div>

          {tracks.map((t: Track) => {
            const tp = c.tracks[t]
            const isOpen = !!open[t]
            return (
              <section key={t} id={`track-${t}`} className={`scroll-mt-24 bg-white rounded-xl border border-line border-l-4 ${healthBorder[tp.status]} shadow-sm`}>
                {/* Level 2 — workstream lead */}
                <button onClick={() => setOpen((o) => ({ ...o, [t]: !o[t] }))} className="w-full text-left p-4 flex gap-3">
                  {isOpen ? <ChevronDown size={18} className="mt-1 shrink-0 text-slate-400" /> : <ChevronRight size={18} className="mt-1 shrink-0 text-slate-400" />}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <Level n={2} label="Workstream lead" icon={User} />
                      <span className="font-bold">{t}</span><span className="text-xs text-slate-500">· {trackLead[t]}</span>
                      <span className="ml-auto"><Badge>{tp.status}</Badge></span>
                    </div>
                    <div className="text-sm font-semibold text-slate-800">{tp.problem}</div>
                    <div className="text-xs text-slate-500 mt-1">{tp.kpi}: <span className="line-through">{tp.baseline}</span> → <b className="text-slate-800">{tp.current}</b> → <span className="text-emerald-700 font-semibold">{tp.target}</span></div>
                  </div>
                </button>

                {isOpen && (
                  <div className="px-3 sm:px-4 pb-4 sm:pl-11 space-y-3">
                    {tp.initiatives.map((i) => (
                      <div key={i.name} className="rounded-lg border border-line">
                        {/* Level 3 — initiative owner */}
                        <div className="p-3 bg-slate-50 rounded-t-lg flex flex-wrap items-center gap-2">
                          <Level n={3} label="Initiative" icon={Users} />
                          <span className="font-semibold text-sm">{i.name}</span>
                          <span className="text-xs text-slate-500">· {i.owner}</span>
                          <div className="w-full sm:w-48 sm:ml-auto flex items-center gap-2"><Bar value={i.progress} /><span className="text-xs">{i.progress}%</span><Badge>{i.status}</Badge></div>
                        </div>
                        {/* Level 4 — ground */}
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm min-w-[720px] [&_th]:px-2 [&_td]:px-2 [&_th]:whitespace-nowrap">
                            <thead><tr className="text-[10px] uppercase text-slate-500 text-left border-b">
                              <th className="py-1.5 px-3"><Level n={4} label="Ground" icon={MapPin} /></th><th>Owner</th><th>Metric</th><th>Actual</th><th>Target</th><th>Next action</th><th className="pr-3">Status</th>
                            </tr></thead>
                            <tbody>
                              {i.ground.map((gr) => (
                                <tr key={gr.unit} className="border-b last:border-0">
                                  <td className="py-2 px-3 font-medium">{gr.unit}</td>
                                  <td className="text-slate-500 text-xs">{gr.owner}</td>
                                  <td className="text-xs">{gr.metric}</td>
                                  <td className="font-semibold">{gr.actual}</td>
                                  <td className="text-emerald-700 text-xs font-semibold">{gr.target}</td>
                                  <td className="text-xs text-slate-600">{gr.action}</td>
                                  <td className="pr-3"><Badge>{gr.status}</Badge></td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )
          })}
        </div>

        {/* Escalations — ground issues rolled up to the CTO */}
        <aside className="space-y-4">
          <section className="bg-white rounded-xl border border-line shadow-sm p-4 xl:sticky xl:top-24">
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-800 flex items-center gap-1 mb-1"><Flag size={14} className="text-red-600" /> Escalations to CTO</h3>
            <p className="text-xs text-slate-500 mb-3">Ground-level items that are red roll up automatically.</p>
            {delayed.length === 0 ? <p className="text-sm text-emerald-700">No red items.</p> : (
              <ul className="space-y-3">
                {delayed.map((gr) => (
                  <li key={gr.unit + gr.metric} className="border-l-2 border-red-500 pl-3 text-sm">
                    <div className="font-semibold">{gr.unit}</div>
                    <div className="text-xs text-slate-500">{gr.track} · {gr.initiative}</div>
                    <div className="text-xs">{gr.metric}: <b>{gr.actual}</b> vs {gr.target}</div>
                    <div className="text-xs text-blue-700 mt-0.5">→ {gr.action}</div>
                  </li>
                ))}
              </ul>
            )}
            {highApps.length > 0 && (
              <div className="mt-4 pt-3 border-t border-line">
                <div className="text-xs font-semibold text-ink-2 mb-2">High-priority applications</div>
                <ul className="space-y-2">
                  {highApps.map(({ a, r }) => (
                    <li key={a.id} className="border-l-2 border-red-500 pl-3 text-sm">
                      <button onClick={() => setParams({ tab: 'apps' })} className="font-semibold text-left hover:underline">{a.name}</button>
                      <div className="text-xs text-ink-3">{r.health} · {r.reasons.slice(0, 2).join(' · ')}</div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {[
              ...drCrit.map((x) => ({ key: 'dr', label: `DR · ${apps[domainId].find((a) => a.id === x.appId)!.name}`, why: drStatus(x, apps[domainId].find((a) => a.id === x.appId)!.tier).reasons.slice(0, 2).join(' · ') })),
              ...vendorCrit.map((v) => ({ key: 'vendors', label: `Vendor · ${v.vendor}`, why: vendorStatus(v).reasons.join(' · ') })),
              ...eolCrit.map((e) => ({ key: 'eol', label: `End of life · ${e.item}`, why: eolStatus(e).reasons.join(' · ') })),
            ].map((x) => (
              <div key={x.label} className="mt-3 border-l-2 border-red-500 pl-3 text-sm">
                <button onClick={() => setParams({ tab: x.key })} className="font-semibold text-left hover:underline">{x.label}</button>
                <div className="text-xs text-ink-3">{x.why}</div>
              </div>
            ))}
            {cy.health !== 'Healthy' && (
              <div className="mt-3 border-l-2 border-red-500 pl-3 text-sm">
                <button onClick={() => setParams({ tab: 'cyber' })} className="font-semibold text-left hover:underline">Cyber security · {cy.health}</button>
                <div className="text-xs text-ink-3">{cy.reasons.slice(0, 2).join(' · ')}</div>
              </div>
            )}
            <div className="mt-4 pt-3 border-t text-xs text-slate-500">{atRisk.length} amber items monitored by workstream leads.</div>
            <Link to="/decisions" className="mt-3 block text-center text-sm font-semibold bg-blue-700 hover:bg-blue-800 text-white rounded-lg py-2">Open Decision Center →</Link>
          </section>
        </aside>
      </div>
      </>)}
    </>
  )
}
