import { Suspense, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import {
  Bell, Briefcase, Building2, ChevronDown, CircleHelp, Cpu, Crown, Database, Activity, BookOpen, Boxes, Library, Radio, Gauge, Radar, Workflow, Gavel, LayoutDashboard, ListChecks, Menu, Network, ShieldCheck, Sparkles, Target, Users, Wallet, Wrench, X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useStore } from '../store'
import { domainOrder, domains } from '../data/domains'
import type { DomainId } from '../data/domains'
import { SOURCES } from '../data/sim/scores'
import { FUNCTIONS } from '../data/sim/functions'
import { ClockControls } from './sim/EventFeed'
import { SHORT_DISCLAIMER } from '../pages/About'

type Item = { to: string; label: string; icon: LucideIcon; badge?: number; sub?: string; end?: boolean; children?: Item[] }
type Group = { section: string; icon: LucideIcon; items: Item[] }

const SOURCE_ICON: Record<string, LucideIcon> = { planview: Target, leanix: Network, process: Workflow, servicenow: Briefcase, jellyfish: Wrench, datadog: Activity, vanta: ShieldCheck }

// Sidebar in demo order, top to bottom (17 Nov 2026): Overview → Enterprise → Business unit → Five high priorities → Governance → Library.
// Older pages (programme overview, problem matrix, business case, coverage, dimension groups) stay reachable by URL only.
const overview: Group = { section: 'Overview', icon: LayoutDashboard, items: [
  { to: '/#capstone', label: 'Capstone Overview', sub: 'Problem · method · results · recommendations', icon: BookOpen },
  { to: '/#plane', label: 'Technology Control Plane', sub: '6 layers · live impact · blast radius', icon: Gauge },
] }
const enterprise: Group = { section: 'Enterprise · All Units', icon: Radar, items: [
  { to: '/command-center', label: 'Command Center', sub: '3 business units side by side', icon: Radar },
  { to: '/decision-center', label: 'CTO Decision Center', sub: 'Top 10 → actions → outcomes', icon: Crown },
] }
// The selected business unit (header dropdown): Enterprise 360, 16 departments, 7 source systems, decision intelligence.
const unitGroup = (d: DomainId): Group => ({
  section: `Business Unit · ${domains[d].name}`, icon: Building2, items: [
    { to: `/domain/${d}`, label: 'Enterprise 360 Overview', icon: LayoutDashboard, end: true },
    { to: `/domain/${d}/fn/${FUNCTIONS[0].id}`, label: '16 Departments', sub: 'CTO-owned (6) · Signals (10)', icon: Boxes,
      children: FUNCTIONS.map((f) => ({ to: `/domain/${d}/fn/${f.id}`, label: f.name, sub: f.cls === 'cto' ? 'CTO-owned' : `Signal · ${f.owner}`, icon: f.cls === 'cto' ? Cpu : Radio })) },
    { to: `/domain/${d}/${SOURCES[0].slug}`, label: 'Source Systems', sub: '7 simulated enterprise tools', icon: Database,
      children: SOURCES.map((x) => ({ to: `/domain/${d}/${x.slug}`, label: x.capability, sub: `Simulated · ${x.label}`, icon: SOURCE_ICON[x.id] })) },
    { to: `/domain/${d}/decisions`, label: 'Decision Intelligence', sub: 'Decisions · actions · outcomes', icon: Gavel },
  ],
})
const priorities: Group = { section: 'Five High Priorities', icon: Target, items: [
  { to: '/team/suman', label: 'Growth & AI Transformation', sub: 'AI Transformation · Suman Kolekar', icon: Sparkles },
  { to: '/team/santosh', label: 'Return', sub: 'Technology Spend & Investment · Santosh Kumar', icon: Wallet },
  { to: '/team/governance', label: 'Risk', sub: 'Regulatory & AI Governance', icon: ShieldCheck },
  { to: '/team/operations', label: 'Readiness', sub: 'Operations & ERP', icon: Wrench },
  { to: '/team/ram', label: 'Control Tower', sub: 'CTO Control Tower · Ramkumar P', icon: Crown },
  { to: '/team', label: 'Team Scorecard', sub: '3 CTOs · RACI · golden thread', icon: Users, end: true },
] }
const trust: Group = { section: 'Governance & Trust', icon: ShieldCheck, items: [
  { to: '/sources', label: 'Data Sources', sub: 'Sync status · real-data checks', icon: Database },
  { to: '/tedif', label: 'TEDIF Tracker', sub: 'Gates · decision catalogue', icon: ListChecks },
  { to: '/about', label: 'About & Disclaimer', icon: CircleHelp },
] }
const library: Group = { section: 'Library', icon: Library, items: [
  { to: '/team/frameworks', label: 'Frameworks & Syllabus', sub: 'Applied frameworks · decision guide', icon: BookOpen },
  { to: '/team/reference', label: 'Reference Library', sub: 'Frameworks · techniques explained', icon: Library },
] }

const flat = (items: Item[]): Item[] => items.flatMap((i) => (i.children ? [i, ...flat(i.children)] : [i]))
const matches = (to: string, path: string, hash = '') => {
  if (to.startsWith('/#')) return path === '/' && (to === '/#plane' ? hash === '#plane' : hash !== '#plane')
  return to === '/' || to === '/tracker' || to === '/team' ? path === to : path === to || path.startsWith(to + '/')
}

export default function Layout() {
  const { domainId, setDomainId, domain } = useStore()
  const [open, setOpen] = useState(false)
  const { pathname, hash } = useLocation()
  const navigate = useNavigate()
  const groups = [overview, enterprise, unitGroup(domainId), priorities, trust, library]
  const activeGroup = groups.find((g) => flat(g.items).some((i) => matches(i.to, pathname, hash)))?.section
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const isOpen = (s: string) => expanded[s] ?? (s === activeGroup || s !== 'Library')   // demo: every group open except the library

  // On the Technology Control Plane the dropdown is the page scope (?bu=), including "All business units".
  const [sp, setSp] = useSearchParams()
  const onPlane = pathname === '/'
  const bu = sp.get('bu')
  const headerValue = onPlane ? (bu === 'banking' || bu === 'manufacturing' || bu === 'retail' ? bu : 'all') : domainId
  const onHeaderChange = (v: string) => {
    if (!onPlane) return switchDomain(v as DomainId)
    setSp((prev) => { const n = new URLSearchParams(prev); if (v === 'all') n.delete('bu'); else n.set('bu', v); return n }, { replace: true })
    if (v !== 'all') setDomainId(v as DomainId)
  }
  // Switching domain on a domain page also moves to that domain's page.
  const switchDomain = (d: DomainId) => {
    setDomainId(d)
    if (pathname.startsWith('/domain/')) {
      // keep the same page (source / function / programme) in the new domain; records are domain-specific
      const rest = pathname.replace(/^\/domain\/[^/]+/, '')
      navigate(`/domain/${d}${rest.startsWith('/record/') ? '' : rest}`)
    }
  }

  // One menu row; rows with children are collapsible sub-groups (16 departments, source systems).
  const go = (to: string) => {
    const m = to.match(/^\/domain\/(\w+)/)
    if (m) setDomainId(m[1] as DomainId)
    if (to.startsWith('/#')) setTimeout(() => document.getElementById(to.slice(2))?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80)
    setOpen(false)
  }
  const rowCls = (active: boolean, depth: number) =>
    `relative flex items-center gap-2 ${depth ? 'pl-7' : 'pl-4'} pr-3 py-1.5 -ml-px ${depth ? 'text-[13px]' : 'text-[13.5px]'} border-l-2 transition rounded-r-md ${active ? 'border-brand-600 bg-brand-50 text-brand-700 font-semibold' : 'border-transparent text-ink-2 hover:text-ink hover:bg-slate-50'}`
  const rowBody = ({ label, icon: Icon, badge, sub }: Item, extra?: React.ReactNode) => (
    <>
      <Icon size={14} className="shrink-0 opacity-70" />
      <span className="flex-1 min-w-0"><span className="block truncate">{label}</span>{sub && <span className="block text-[10.5px] font-normal text-ink-4 truncate leading-tight">{sub}</span>}</span>
      {!!badge && <span className="text-[10px] font-semibold bg-crit-bg text-crit-text border border-red-200 rounded-full px-1.5" title={`${badge} red escalations`}>{badge}</span>}
      {extra}
    </>
  )
  const renderItem = (it: Item, depth: number): React.ReactNode => {
    if (it.children) {
      const key = `sub:${it.label}`
      const childActive = it.children.some((c) => matches(c.to, pathname, hash))
      const subOpen = expanded[key] ?? childActive
      return (
        <div key={key}>
          <button onClick={() => setExpanded((e) => ({ ...e, [key]: !subOpen }))} aria-expanded={subOpen} className={`w-full text-left ${rowCls(false, depth)} ${childActive ? 'text-brand-700 font-semibold' : ''}`}>
            {rowBody(it, <ChevronDown size={13} className={`shrink-0 text-ink-4 transition-transform ${subOpen ? '' : '-rotate-90'}`} />)}
          </button>
          {subOpen && <div className="ml-4 border-l border-line">{it.children.map((c) => renderItem(c, depth + 1))}</div>}
        </div>
      )
    }
    if (it.to.startsWith('/#')) {
      const active = matches(it.to, pathname, hash)
      return <NavLink key={it.to} to={it.to} onClick={() => go(it.to)} className={rowCls(active, depth)} aria-current={active ? 'page' : undefined}>{rowBody(it)}</NavLink>
    }
    return (
      <NavLink key={it.to} to={it.to} end={it.end || /^\/domain\/\w+$/.test(it.to)} onClick={() => go(it.to)} className={({ isActive }) => rowCls(isActive, depth)}>
        {rowBody(it)}
      </NavLink>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header — compact, navy, brand on the left, context and user on the right */}
      <header className="bg-brand-900 text-white h-16 px-4 md:px-6 flex items-center gap-3 sticky top-0 z-40">
        <button className="lg:hidden shrink-0 p-1 -ml-1 rounded-md hover:bg-white/10" onClick={() => setOpen(!open)} aria-label="Toggle menu" aria-expanded={open}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
        <NavLink to="/" className="flex items-baseline gap-3 min-w-0 shrink-0" aria-label="CTO360 home">
          <span className="text-[20px] font-bold tracking-tight">CTO<span className="text-accent">360</span></span>
          <span className="hidden md:inline text-[13px] text-slate-300 border-l border-white/20 pl-3 truncate">Enterprise Technology Control Tower</span>
        </NavLink>

        <div className="ml-auto flex items-center gap-3 sm:gap-5 shrink-0">
          {/* Business unit — the domain-agnostic switch */}
          <label className="flex items-center gap-2 text-[13px]">
            <span className="hidden xl:inline text-slate-300">Business unit</span>
            <select
              value={headerValue}
              onChange={(e) => onHeaderChange(e.target.value)}
              className="bg-white/10 hover:bg-white/15 border border-white/20 rounded-lg pl-2.5 pr-7 py-1.5 text-white text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-accent appearance-none bg-no-repeat bg-[right_0.5rem_center] bg-[length:12px] cursor-pointer"
              style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23CBD5E1' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")" }}
              aria-label="Business unit"
            >
              {onPlane && <option value="all" className="text-ink">All units</option>}
              {domainOrder.map((d) => <option key={d} value={d} className="text-ink">{domains[d].name}{domains[d].configuredOnly ? ' (config)' : ''}</option>)}
            </select>
          </label>
          <ClockControls />
          <button className="relative hidden sm:block p-1 rounded-md hover:bg-white/10" aria-label={`${domain.alerts.length} notifications`}>
            <Bell size={19} />
            <span className="absolute -top-0.5 -right-0.5 bg-crit text-[10px] font-semibold rounded-full w-4 h-4 flex items-center justify-center">{domain.alerts.length}</span>
          </button>
          <NavLink to="/about" className="hidden md:block text-slate-300 hover:text-white" aria-label="About CTO360 and disclaimer" title="About & disclaimer"><CircleHelp size={19} /></NavLink>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center font-semibold text-sm" aria-hidden>C</div>
            <div className="hidden lg:block leading-tight text-xs">
              <div className="font-semibold">CTO Team</div>
              <div className="text-slate-300">3 CTOs</div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar — white, grouped, collapsible */}
        {open && <div className="lg:hidden fixed inset-0 top-16 z-20 bg-slate-900/40" onClick={() => setOpen(false)} aria-hidden />}
        <aside className={`${open ? 'block' : 'hidden'} lg:block fixed lg:sticky top-16 z-30 h-[calc(100vh-4rem)] w-72 lg:w-[17.5rem] max-w-[85vw] shrink-0 bg-surface border-r border-line overflow-y-auto shadow-xl lg:shadow-none`}>
          <nav className="py-3" aria-label="Main">
            {groups.map((g) => {
              const GroupIcon = g.icon
              const opened = isOpen(g.section)
              const groupActive = g.section === activeGroup
              return (
                <div key={g.section} className="px-3 mb-1">
                  <button
                    onClick={() => setExpanded((e) => ({ ...e, [g.section]: !opened }))}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[14px] transition ${groupActive ? 'text-brand-900 font-semibold' : 'text-ink-2 hover:bg-slate-50 font-medium'}`}
                    aria-expanded={opened}
                  >
                    <GroupIcon size={17} className={groupActive ? 'text-brand-600' : 'text-ink-3'} />
                    <span className="flex-1 text-left">{g.section}</span>
                    <ChevronDown size={15} className={`text-ink-4 transition-transform ${opened ? '' : '-rotate-90'}`} />
                  </button>
                  {opened && (
                    <div className="mt-0.5 mb-2 ml-[1.35rem] border-l border-line">
                      {g.items.map((it) => renderItem(it, 0))}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>
          <div className="mx-6 mt-2 mb-5 pt-4 border-t border-line text-[12px] text-ink-3 space-y-1">
            <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-success-text" />Trust layer enforcing</div>
            <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-success-text" />Audit trail active</div>
            <NavLink to="/about" onClick={() => setOpen(false)} className="flex items-center gap-2 pt-2 text-ink-2 hover:text-ink font-medium"><CircleHelp size={13} />About & disclaimer</NavLink>
          </div>
        </aside>

        <main className="flex-1 min-w-0 p-4 md:p-6">
          <div className="mx-auto max-w-[1440px]">
            <Suspense fallback={<div className="py-24 text-center text-sm text-ink-3" role="status">Loading…</div>}><Outlet /></Suspense>
            <footer className="mt-10 pt-4 pb-6 border-t border-line text-xs text-ink-3" role="contentinfo">
              <div className="flex flex-wrap gap-x-6 gap-y-1 justify-center">
                <span><b className="font-semibold text-ink-2">CTO360</b> · One View. Connected Decisions. Measurable Technology Outcomes.</span>
                <span>Decision intelligence powered by TEDIF</span>
              </div>
              <p className="mt-3 mx-auto max-w-3xl text-center rounded-lg border border-line bg-slate-50 px-4 py-2.5 text-[12px] leading-relaxed text-ink-2">
                <b className="text-ink">Disclaimer:</b> {SHORT_DISCLAIMER}{' '}
                <NavLink to="/about#disclaimer" className="font-semibold text-brand-600 hover:underline whitespace-nowrap">Full disclaimer</NavLink>
              </p>
            </footer>
          </div>
        </main>
      </div>
    </div>
  )
}
