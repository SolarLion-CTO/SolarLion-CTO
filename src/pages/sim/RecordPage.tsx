// Drill-down for any simulated record: why it has its colour, its fields, what it links to and what links to it.
import { Link, useParams } from 'react-router-dom'
import type { DomainData, Rag, SourceId } from '../../data/sim'
import { Card } from '../../components/ui'
import { SourceBadge, StatusPill, Sparkline } from '../../components/sim/primitives'
import { TrendChart } from '../../components/sim/charts'
import { SOURCES } from '../../data/sim'
import { NotFound, RecLink, SimHeader, useSimDomain } from './common'

type Any = Record<string, unknown> & { id: string; name: string; health?: Rag; why?: string[]; source?: SourceId; owner?: string; status?: string; updated?: string }
const KIND: Record<string, string> = { OBJ: 'Strategic objective', INIT: 'Initiative', APP: 'Application', TECH: 'Technology', PROC: 'Process', PRJ: 'Project', TEAM: 'Engineering team', SVC: 'Service', INC: 'Incident', RISK: 'Risk', CTL: 'Control' }
const SKIP = new Set(['id', 'name', 'domain', 'owner', 'status', 'health', 'source', 'updated', 'why', 'series', 'availabilitySeries', 'debtSeries'])
const label = (k: string) => k.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()).replace('Cr', '(₹ Cr)').replace(' Ids', 's').replace(' Id', '')

function all(d: DomainData): Any[] {
  return [...d.objectives, ...d.initiatives, ...d.applications, ...d.technologies, ...d.processes, ...d.projects, ...d.teams, ...d.services, ...d.risks, ...d.controls,
    ...d.incidents.map((i) => ({ ...i, name: `${i.severity} · ${i.businessImpact}`, health: (i.severity === 'P1' ? 'Red' : i.severity === 'P2' ? 'Amber' : 'Green') as Rag, owner: i.owner, why: [i.rootCause] }))] as unknown as Any[]
}
const isId = (v: unknown, d: DomainData) => typeof v === 'string' && new RegExp(`^[A-Z]+-${d.code}-\\d+$`).test(v)

export default function RecordPage() {
  const d = useSimDomain()
  const { rid } = useParams()
  if (!d) return <NotFound />
  const records = all(d)
  const r = records.find((x) => x.id === rid)
  if (!r) return <div className="p-8 text-ink-2">Record {rid} not found in {d.org}. <Link to={`/domain/${d.domain}`} className="text-brand-600 font-semibold">Back</Link></div>
  const kind = KIND[r.id.split('-')[0]] ?? 'Record'
  const src = (r.source ?? 'business') as SourceId
  const srcMeta = SOURCES.find((s) => s.id === src)
  const out = Object.entries(r).flatMap(([k, v]) => (Array.isArray(v) ? v : [v]).filter((x) => isId(x, d)).map((x) => ({ k, id: x as string })))
  const inbound = records.filter((x) => x.id !== r.id && Object.values(x).some((v) => v === r.id || (Array.isArray(v) && v.includes(r.id))))
  const fields = Object.entries(r).filter(([k, v]) => !SKIP.has(k) && !(Array.isArray(v) && v.every((x) => isId(x, d))) && !isId(v, d) && v !== undefined && typeof v !== 'object')
  const nameOf = (id: string) => records.find((x) => x.id === id)?.name ?? id
  const healthOf = (id: string) => records.find((x) => x.id === id)?.health
  const series = (r.availabilitySeries ?? r.series ?? r.debtSeries) as number[] | undefined

  return (
    <>
      <SimHeader d={d} crumbs={srcMeta ? [{ to: `/domain/${d.domain}/${srcMeta.slug}`, label: srcMeta.capability }, { to: `/domain/${d.domain}/record/${r.id}`, label: r.id }] : [{ to: `/domain/${d.domain}/record/${r.id}`, label: r.id }]}
        title={r.name} question={`${kind} · ${r.id}`} source={src} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <div className="flex flex-wrap items-center gap-3 mb-3">
              {r.health && <StatusPill status={r.health} why={r.why} label={r.health === 'Green' ? 'Healthy' : r.health === 'Amber' ? 'Watch' : 'Act now'} />}
              {r.status && <span className="text-sm text-ink-2">Status <b>{String(r.status)}</b></span>}
              {r.owner && <span className="text-sm text-ink-2">Owner <b>{r.owner}</b></span>}
              {r.updated && <span className="text-xs text-ink-3">Updated {new Date(r.updated).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })}</span>}
            </div>
            {r.why && r.why.length > 0 && (
              <div className={`rounded-lg border p-3 text-sm mb-3 ${r.health === 'Red' ? 'bg-crit-bg border-red-200' : r.health === 'Amber' ? 'bg-warn-bg border-amber-200' : 'bg-slate-50 border-line'}`}>
                <b>Why {r.health?.toLowerCase() ?? ''}:</b> {r.why.join(' · ')}
              </div>
            )}
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 text-sm">
              {fields.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3 border-b border-line py-1.5">
                  <dt className="text-ink-3">{label(k)}</dt>
                  <dd className="font-medium text-ink text-right break-words min-w-0">{Array.isArray(v) ? v.join(', ') : typeof v === 'boolean' ? (v ? 'Yes' : 'No') : String(v)}</dd>
                </div>
              ))}
              {r.allocation !== undefined && Object.entries(r.allocation as Record<string, number>).map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3 border-b border-line py-1.5"><dt className="text-ink-3">Allocation · {label(k)}</dt><dd className="font-medium">{v}%</dd></div>
              ))}
            </dl>
          </Card>
          {series && <Card title="12-month trend"><TrendChart series={series} name={r.name} target={(r.slo as number | undefined) ?? (r.targetCycleTime as number | undefined)} /></Card>}
          {r.id.startsWith('SVC') && (
            <Card title="Incidents (90 days)">
              <ul className="text-sm divide-y divide-line">{d.incidents.filter((i) => i.serviceId === r.id).reverse().map((i) => (
                <li key={i.id} className="py-1.5 flex flex-wrap gap-x-3"><RecLink d={d} id={i.id} className="font-semibold">{i.id}</RecLink><span className={i.severity === 'P1' ? 'text-crit-text font-semibold' : i.severity === 'P2' ? 'text-warn-text' : 'text-ink-3'}>{i.severity}</span><span className="text-ink-3">{i.start.slice(0, 10)}</span><span>{i.durationMin} min · {i.rootCause}</span></li>
              ))}</ul>
            </Card>
          )}
        </div>
        <div className="space-y-5">
          <Card title="Links to">
            {out.length === 0 ? <p className="text-sm text-ink-3">No outgoing links.</p> : (
              <ul className="space-y-1.5 text-sm">{out.map(({ k, id }) => (
                <li key={k + id} className="flex items-center gap-2 min-w-0">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${healthOf(id) === 'Red' ? 'bg-crit' : healthOf(id) === 'Amber' ? 'bg-warn' : 'bg-ok'}`} aria-hidden />
                  <span className="text-[11px] text-ink-3 w-24 shrink-0 truncate">{label(k)}</span>
                  <RecLink d={d} id={id} className="truncate text-ink">{nameOf(id)}</RecLink>
                </li>
              ))}</ul>
            )}
          </Card>
          <Card title="Linked from">
            {inbound.length === 0 ? <p className="text-sm text-ink-3">Nothing links here.</p> : (
              <ul className="space-y-1.5 text-sm">{inbound.slice(0, 20).map((x) => (
                <li key={x.id} className="flex items-center gap-2 min-w-0">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${x.health === 'Red' ? 'bg-crit' : x.health === 'Amber' ? 'bg-warn' : 'bg-ok'}`} aria-hidden />
                  <span className="text-[11px] text-ink-3 w-24 shrink-0">{KIND[x.id.split('-')[0]]}</span>
                  <RecLink d={d} id={x.id} className="truncate text-ink">{x.name}</RecLink>
                </li>
              ))}{inbound.length > 20 && <li className="text-xs text-ink-3">+{inbound.length - 20} more</li>}</ul>
            )}
          </Card>
          <Card title="Source">
            <SourceBadge source={src} />
            <p className="text-xs text-ink-3 mt-2">{srcMeta ? `${srcMeta.label}-style ${srcMeta.capability.toLowerCase()} record, simulated for this demonstration. CTO360 normalises it into its canonical model; no live integration is active.` : 'Simulated business data.'}</p>
            {series && <div className="mt-3"><Sparkline data={series} width={200} height={36} /></div>}
          </Card>
        </div>
      </div>
    </>
  )
}
