import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import type { Application, DomainData, Rag } from '../../../data/sim'
import { Card } from '../../../components/ui'
import { Bar2, StatusPill, ragBg, ragText } from '../../../components/sim/primitives'
import { RecordTable } from '../../../components/sim/RecordTable'
import EolTab from '../../domain/EolTab'
import { NameCell, RecLink, Tabs, cr } from '../common'
import { FunctionKpis } from './kpis'

type T = 'apps' | 'matrix' | 'tech' | 'capabilities' | 'deps' | 'eol'

export default function LeanIX({ d, tab, setTab }: { d: DomainData; tab: string; setTab: (t: string) => void }) {
  const t = (['apps', 'matrix', 'tech', 'capabilities', 'deps', 'eol'].includes(tab) ? tab : 'apps') as T
  return (
    <>
      <FunctionKpis d={d} fn="architecture" />
      <Tabs<T> value={t} onChange={setTab} tabs={[
        { id: 'apps', label: 'Application portfolio', count: d.applications.length },
        { id: 'matrix', label: 'Rationalisation matrix' },
        { id: 'tech', label: 'Technology lifecycle', count: d.technologies.length },
        { id: 'capabilities', label: 'Capability heatmap', count: d.capabilities.length },
        { id: 'deps', label: 'Dependencies' },
        { id: 'eol', label: 'End of life (programme view)' },
      ]} />
      {t === 'apps' && <Apps d={d} />}
      {t === 'matrix' && <Matrix d={d} />}
      {t === 'tech' && <Tech d={d} />}
      {t === 'capabilities' && <Capabilities d={d} />}
      {t === 'deps' && <Deps d={d} />}
      {t === 'eol' && <EolTab domainId={d.domain} />}
    </>
  )
}

function Apps({ d }: { d: DomainData }) {
  return (
    <Card>
      <RecordTable label="applications" rows={d.applications} minWidth={1080} cols={[
        { key: 'n', label: 'Application', render: (a) => <NameCell d={d} id={a.id} name={a.name} sub={a.capability} /> },
        { key: 'c', label: 'Criticality', render: (a) => <span className="text-xs">{a.criticality}</span> },
        { key: 'l', label: 'Lifecycle', render: (a) => <span className="text-xs font-medium">{a.lifecycle}</span> },
        { key: 'th', label: 'Tech health', render: (a) => <div className="w-20"><Bar2 value={a.techHealth} /><span className="text-xs">{a.techHealth}</span></div>, sort: (a) => a.techHealth },
        { key: 'f', label: 'Fit', align: 'right', render: (a) => a.functionalFit, sort: (a) => a.functionalFit },
        { key: 'cost', label: 'Cost / yr', align: 'right', render: (a) => cr(a.annualCostCr), sort: (a) => a.annualCostCr },
        { key: 'h', label: 'Hosting', render: (a) => <span className="text-xs">{a.hosting}{a.cloud !== '—' && a.cloud !== a.hosting ? ` · ${a.cloud}` : ''}</span> },
        { key: 'e', label: 'EOL tech', render: (a) => (a.usesEol ? <span className="text-xs font-semibold text-crit-text">Yes</span> : <span className="text-xs text-ink-3">No</span>) },
        { key: 'hh', label: 'Health', render: (a) => <StatusPill status={a.health} why={a.why} /> },
        { key: 'r', label: 'Recommendation', render: (a) => <span className="text-xs text-ink-2">{a.recommendation}</span>, className: 'max-w-[220px]' },
      ]} />
    </Card>
  )
}

function Matrix({ d }: { d: DomainData }) {
  const q = (a: Application) => (a.functionalFit >= 60 ? (a.techHealth >= 60 ? 'Invest' : 'Migrate') : a.techHealth >= 60 ? 'Tolerate' : 'Eliminate')
  const quads: { id: string; title: string; note: string; tone: Rag }[] = [
    { id: 'Tolerate', title: 'Tolerate', note: 'Technically sound, weak business fit', tone: 'Amber' },
    { id: 'Invest', title: 'Invest', note: 'Good fit and healthy technology', tone: 'Green' },
    { id: 'Eliminate', title: 'Eliminate', note: 'Weak fit and weak technology', tone: 'Red' },
    { id: 'Migrate', title: 'Migrate', note: 'Good fit, technology holding it back', tone: 'Amber' },
  ]
  return (
    <Card title="Application rationalisation (TIME model)">
      <div className="grid grid-cols-[auto_1fr] gap-2">
        <div className="flex items-center"><span className="text-[11px] uppercase tracking-wide text-ink-3 [writing-mode:vertical-rl] rotate-180">Technical health →</span></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {quads.map((x) => {
            const apps = d.applications.filter((a) => q(a) === x.id)
            return (
              <div key={x.id} className={`rounded-lg border p-3 min-h-[140px] ${ragBg[x.tone]}`}>
                <div className={`font-semibold ${ragText[x.tone]}`}>{x.title} <span className="text-xs font-normal text-ink-3">· {apps.length} apps · {cr(apps.reduce((s, a) => s + a.annualCostCr, 0))}/yr</span></div>
                <div className="text-[11px] text-ink-3 mb-2">{x.note}</div>
                <div className="flex flex-wrap gap-1">{apps.map((a) => (
                  <RecLink key={a.id} d={d} id={a.id}><span className="inline-block text-[11px] bg-white border border-line rounded px-1.5 py-0.5 text-ink" title={`Fit ${a.functionalFit} · health ${a.techHealth} · ${a.criticality}`}>{a.criticality === 'Mission critical' ? '★ ' : ''}{a.name}</span></RecLink>
                ))}</div>
              </div>
            )
          })}
        </div>
        <div />
        <div className="text-center text-[11px] uppercase tracking-wide text-ink-3">Functional fit →</div>
      </div>
      <p className="text-xs text-ink-3 mt-2">★ mission critical. Thresholds: fit 60 and technical health 60 (simulated assessment scores).</p>
    </Card>
  )
}

function Tech({ d }: { d: DomainData }) {
  const order = ['End of life', 'Extended support', 'Mainstream', 'Current'] as const
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">{order.map((l) => {
        const n = d.technologies.filter((t) => t.lifecycle === l).length
        const tone: Rag = l === 'End of life' ? 'Red' : l === 'Extended support' ? 'Amber' : 'Green'
        return <div key={l} className={`rounded-xl border p-3 ${ragBg[tone]}`}><div className={`text-xs font-medium ${ragText[tone]}`}>{l}</div><div className="text-2xl font-bold text-brand-900">{n}</div></div>
      })}</div>
      <Card>
        <RecordTable label="technologies" rows={d.technologies} minWidth={820} cols={[
          { key: 'n', label: 'Technology', render: (t) => <NameCell d={d} id={t.id} name={t.name} sub={t.vendor} /> },
          { key: 'l', label: 'Lifecycle', render: (t) => <span className="text-xs font-medium">{t.lifecycle}</span> },
          { key: 'e', label: 'End of support', render: (t) => <span className="text-xs">{t.eolDate ?? 'Vendor-managed'}</span>, sort: (t) => t.eolDate ?? '9999' },
          { key: 'a', label: 'Used by', render: (t) => <span className="text-xs">{t.appIds.length} app(s)</span>, sort: (t) => t.appIds.length },
          { key: 'c', label: 'Criticality', render: (t) => <span className="text-xs">{t.criticality}</span> },
          { key: 'h', label: 'Health', render: (t) => <StatusPill status={t.health} why={t.why} /> },
        ]} />
      </Card>
    </>
  )
}

function Capabilities({ d }: { d: DomainData }) {
  const rank = { Red: 0, Amber: 1, Green: 2 }
  return (
    <Card title="Business capability heatmap">
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2">{d.capabilities.map((c) => {
        const apps = d.applications.filter((a) => a.capability === c)
        const worst = apps.reduce<Rag>((w, a) => (rank[a.health] < rank[w] ? a.health : w), 'Green')
        const avg = apps.length ? Math.round(apps.reduce((s, a) => s + a.techHealth, 0) / apps.length) : 0
        return (
          <div key={c} className={`rounded-lg border p-3 ${apps.length ? ragBg[worst] : 'bg-slate-50 border-line'}`}>
            <div className="font-semibold text-sm text-ink">{c}</div>
            <div className="text-xs text-ink-3">{apps.length} app(s){apps.length ? ` · avg health ${avg}` : ''}</div>
            <div className="flex flex-wrap gap-1 mt-1.5">{apps.map((a) => <RecLink key={a.id} d={d} id={a.id}><span className={`text-[10.5px] ${ragText[a.health]}`}>{a.name}</span></RecLink>)}</div>
          </div>
        )
      })}</div>
      <p className="text-xs text-ink-3 mt-2">Colour = worst application health in the capability.</p>
    </Card>
  )
}

function Deps({ d }: { d: DomainData }) {
  const [sel, setSel] = useState(d.stories[0]?.appIds[0] ?? d.applications[0].id)
  const a = d.applications.find((x) => x.id === sel)!
  const upstream = d.applications.filter((x) => a.dependsOn.includes(x.id))
  const downstream = d.applications.filter((x) => x.dependsOn.includes(a.id))
  const tech = d.technologies.filter((t) => a.techIds.includes(t.id))
  const procs = d.processes.filter((p) => p.appIds.includes(a.id))
  const svcs = d.services.filter((s) => s.appId === a.id)
  const Chip = ({ id, name, h }: { id: string; name: string; h: Rag }) => <RecLink d={d} id={id}><span className={`block text-xs rounded-md border px-2 py-1 mb-1 ${ragBg[h]} ${ragText[h]}`}>{name}</span></RecLink>
  const Col = ({ title, children }: { title: string; children: React.ReactNode }) => <div className="min-w-[150px] flex-1"><div className="text-[11px] uppercase tracking-wide text-ink-3 mb-1.5">{title}</div>{children}</div>
  const Arrow = () => <ArrowRight size={16} className="text-ink-4 self-center shrink-0 hidden md:block" />
  return (
    <Card title="Dependency view: capability → application → technology → infrastructure → process">
      <label className="text-sm flex flex-wrap items-center gap-2 mb-4 min-w-0">Application
        <select value={sel} onChange={(e) => setSel(e.target.value)} className="border border-slate-300 rounded-lg px-2 py-1.5 bg-white text-sm w-full sm:w-auto min-w-0">
          {d.applications.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
        </select>
      </label>
      <div className="flex flex-col md:flex-row gap-3 overflow-x-auto">
        <Col title="Capability"><span className="block text-xs rounded-md border border-line bg-slate-50 px-2 py-1">{a.capability}</span><div className="text-[11px] text-ink-3 mt-2">Depends on</div>{upstream.map((x) => <Chip key={x.id} id={x.id} name={x.name} h={x.health} />)}{upstream.length === 0 && <span className="text-xs text-ink-3">none</span>}</Col>
        <Arrow />
        <Col title="Application"><Chip id={a.id} name={a.name} h={a.health} /><div className="text-[11px] text-ink-3 mt-2">Used by</div>{downstream.map((x) => <Chip key={x.id} id={x.id} name={x.name} h={x.health} />)}{downstream.length === 0 && <span className="text-xs text-ink-3">none</span>}</Col>
        <Arrow />
        <Col title="Technology & data">{tech.map((t) => <Chip key={t.id} id={t.id} name={t.name} h={t.health} />)}{tech.length === 0 && <span className="text-xs text-ink-3">SaaS (vendor-managed)</span>}</Col>
        <Arrow />
        <Col title="Infrastructure & cloud"><span className="block text-xs rounded-md border border-line bg-slate-50 px-2 py-1 mb-1">{a.hosting}</span>{a.cloud !== '—' && <span className="block text-xs rounded-md border border-line bg-slate-50 px-2 py-1">{a.cloud}</span>}<div className="text-[11px] text-ink-3 mt-2">Runs as</div>{svcs.map((s) => <Chip key={s.id} id={s.id} name={s.name} h={s.health} />)}</Col>
        <Arrow />
        <Col title="Business process">{procs.map((p) => <Chip key={p.id} id={p.id} name={p.name} h={p.health} />)}{procs.length === 0 && <span className="text-xs text-ink-3">none mapped</span>}</Col>
      </div>
    </Card>
  )
}
