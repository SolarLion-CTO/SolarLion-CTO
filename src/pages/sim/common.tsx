import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { useStore } from '../../store'
import { domains } from '../../data/domains'
import type { DomainId } from '../../data/domains'
import { sim } from '../../data/sim'
import type { DomainData, Rag, SourceId } from '../../data/sim'
import { SourceBadge } from '../../components/sim/primitives'
import { TimeRange, useKeepRange } from '../../components/sim/range'

/** Reads :id, keeps the header's business-unit selector in sync, returns the simulated domain. */
export function useSimDomain(): DomainData | null {
  const { id } = useParams()
  const { domainId, setDomainId } = useStore()
  const ok = id === 'banking' || id === 'manufacturing' || id === 'retail'
  useEffect(() => { if (ok && id !== domainId) setDomainId(id as DomainId) }, [ok, id, domainId, setDomainId])
  return ok ? sim[id as DomainId] : null
}

export function NotFound() {
  return <div className="p-8 text-center text-ink-2">Unknown domain. <Link to="/" className="text-brand-600 font-semibold">Back to overview</Link></div>
}

export function SimHeader({ d, crumbs, title, question, source, children }: { d: DomainData; crumbs?: { to: string; label: string }[]; title: string; question: string; source?: SourceId | SourceId[]; children?: ReactNode }) {
  const keep = useKeepRange()
  const srcs = source === undefined ? [] : Array.isArray(source) ? source : [source]
  return (
    <div className="mb-5">
      <nav className="flex flex-wrap items-center gap-1 text-xs text-ink-3 mb-2" aria-label="Breadcrumb">
        <Link to={keep(`/domain/${d.domain}`)} className="hover:text-ink hover:underline">{domains[d.domain].name} 360</Link>
        {crumbs?.map((c) => <span key={c.to} className="inline-flex items-center gap-1"><ChevronRight size={12} aria-hidden /><Link to={keep(c.to)} className="hover:text-ink hover:underline">{c.label}</Link></span>)}
      </nav>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-[26px] sm:text-[28px] font-bold text-brand-900 leading-tight">{title}</h1>
          <p className="text-ink-2 mt-1"><span className="text-ink-3">CTO question · </span>{question}</p>
          {srcs.length > 0 && <div className="flex flex-wrap gap-1.5 mt-2">{srcs.map((s) => <SourceBadge key={s} source={s} />)}</div>}
        </div>
        <div className="flex flex-wrap items-center gap-2">{children}<TimeRange /></div>
      </div>
    </div>
  )
}

export function RecLink({ d, id, children, className = '' }: { d: DomainData; id: string | null | undefined; children?: ReactNode; className?: string }) {
  const keep = useKeepRange()
  if (!id) return <span className="text-ink-4">—</span>
  return <Link to={keep(`/domain/${d.domain}/record/${id}`)} className={`hover:underline ${className}`}>{children ?? id}</Link>
}

export function NameCell({ d, id, name, sub }: { d: DomainData; id: string; name: string; sub?: string }) {
  return (
    <div className="min-w-0">
      <RecLink d={d} id={id} className="font-semibold text-ink">{name}</RecLink>
      <div className="text-[11px] text-ink-3">{id}{sub ? ` · ${sub}` : ''}</div>
    </div>
  )
}

export function Tabs<T extends string>({ tabs, value, onChange }: { tabs: { id: T; label: string; count?: number }[]; value: T; onChange: (t: T) => void }) {
  return (
    <div className="flex gap-1 border-b border-line mb-4 overflow-x-auto" role="tablist">
      {tabs.map((t) => (
        <button key={t.id} role="tab" aria-selected={value === t.id} onClick={() => onChange(t.id)}
          className={`px-3 py-2 text-sm whitespace-nowrap border-b-2 -mb-px ${value === t.id ? 'border-brand-600 text-brand-700 font-semibold' : 'border-transparent text-ink-2 hover:text-ink'}`}>
          {t.label}{t.count !== undefined && <span className="ml-1.5 text-[11px] text-ink-3">{t.count}</span>}
        </button>
      ))}
    </div>
  )
}

export const ragFrom = (good: boolean, warn: boolean): Rag => (good ? 'Green' : warn ? 'Amber' : 'Red')
export const cr = (n: number) => `₹${Math.round(n * 10) / 10} Cr`
