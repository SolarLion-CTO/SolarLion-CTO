import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  Bell, Bot, Brain, ChevronDown, Briefcase, Building2, CalendarDays, Compass, Crown, Gauge, LayoutGrid, ListChecks, Network, Server, Users, CircleHelp, ClipboardCheck, Database, Factory, Gavel, Grid3x3, Landmark, Layers, LayoutDashboard, Lightbulb, Menu, Scale,
  Settings, ShieldCheck, ShoppingCart, Target, TrendingUp, Wallet, X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useStore } from '../store'
import { domainOrder, domains, plannedDomains } from '../data/domains'
import { cascade, tracks } from '../data/cascade'
import { summary } from '../data/tedif'
import type { DomainId } from '../data/domains'

const nav: { section: string; items: { to: string; label: string; icon: LucideIcon }[] }[] = [
  { section: 'Executive', items: [
    { to: '/', label: 'Overview', icon: LayoutDashboard },
    { to: '/problems', label: 'Problem Matrix', icon: Grid3x3 },
    { to: '/tedif', label: 'TEDIF Tracker', icon: ClipboardCheck },
    { to: '/decisions', label: 'Decision Center', icon: Gavel },
    { to: '/value', label: 'Business Value', icon: TrendingUp },
  ] },
  { section: 'CTO Dimensions', items: [
    { to: '/cto/coverage', label: 'Coverage (14 dimensions)', icon: ListChecks },
    { to: '/cto/business', label: 'Business case', icon: Building2 },
    { to: '/cto/strategy', label: 'Current → target', icon: Compass },
    { to: '/cto/assessment', label: 'Readiness assessment', icon: Gauge },
    { to: '/cto/portfolio', label: 'Use-case portfolio', icon: LayoutGrid },
    { to: '/cto/data', label: 'Data readiness', icon: Server },
    { to: '/cto/ai-selection', label: 'AI selection', icon: Brain },
    { to: '/cto/architecture', label: 'Architecture', icon: Network },
    { to: '/cto/operating-model', label: 'Operating model & CoE', icon: Users },
    { to: '/cto/roadmap', label: 'Roadmap', icon: CalendarDays },
    { to: '/cto/decisions', label: 'CTO decisions', icon: Crown },
  ] },
  { section: 'Programme Tracker', items: [
    { to: '/tracker', label: 'Portfolio', icon: Briefcase },
    { to: '/tracker/strategy', label: 'Strategy', icon: Target },
    { to: '/tracker/roi', label: 'ROI', icon: TrendingUp },
    { to: '/tracker/finance', label: 'Finance', icon: Wallet },
    { to: '/tracker/operations', label: 'Operations', icon: Factory },
    { to: '/tracker/erp', label: 'ERP', icon: Database },
    { to: '/tracker/ai', label: 'AI', icon: Bot },
    { to: '/tracker/innovation', label: 'Innovation', icon: Lightbulb },
    { to: '/tracker/governance', label: 'Governance', icon: ShieldCheck },
  ] },
  { section: 'Workstreams', items: [
    { to: '/strategy', label: 'Strategy & ROI', icon: Target },
    { to: '/finance', label: 'Finance & Investment', icon: Wallet },
    { to: '/operations', label: 'Operations', icon: Factory },
    { to: '/governance', label: 'Regulatory & Governance', icon: ShieldCheck },
    { to: '/innovation', label: 'Innovation', icon: Lightbulb },
  ] },
  { section: 'AI Control Layer', items: [
    { to: '/agents', label: 'AI Agents', icon: Bot },
    { to: '/framework', label: 'Framework', icon: Layers },
  ] },
]

const domainIcons: Record<DomainId, LucideIcon> = { banking: Landmark, manufacturing: Factory, retail: ShoppingCart }

export default function Layout() {
  const { domainId, setDomainId, domain } = useStore()
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const groupOf = (path: string) =>
    nav.find((g) => g.items.some((i) => (i.to === '/' ? path === '/' : path === i.to || path.startsWith(i.to + '/'))))?.section
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ Executive: true })
  const activeGroup = groupOf(pathname)
  const isOpen = (section: string) => expanded[section] ?? section === activeGroup

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="bg-brand-900 text-white px-4 md:px-6 h-16 flex items-center gap-3 sticky top-0 z-40 border-b border-white/10">
        <button className="lg:hidden shrink-0" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X /> : <Menu />}
        </button>
        <div className="w-9 h-9 shrink-0 rounded-lg bg-white/10 ring-1 ring-white/15 flex items-center justify-center"><Scale size={19} /></div>
        <div className="leading-tight min-w-0">
          <div className="font-semibold tracking-normal text-[14px] sm:text-[15px] xl:text-base truncate">
            <span className="sm:hidden">AI Transformation</span><span className="hidden sm:inline xl:hidden">AI Transformation Framework</span>
            <span className="hidden xl:inline">Domain-Agnostic Enterprise AI Transformation Framework</span>
          </div>
          <div className="text-[11px] sm:text-xs text-blue-200/90 truncate">
            <span className="sm:hidden">Framework · powered by TEDIF</span><span className="hidden sm:inline xl:hidden">Domain-agnostic · powered by TEDIF</span>
            <span className="hidden xl:inline">Powered by TEDIF · AI recommends, humans decide</span>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-4 shrink-0">
          <div className="relative hidden sm:block">
            <Bell size={20} />
            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
              {domain.alerts.length}
            </span>
          </div>
          <Settings size={20} className="hidden sm:block" />
          <CircleHelp size={20} className="hidden sm:block" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">R</div>
            <div className="hidden lg:block leading-tight text-xs">
              <div className="font-semibold">ram</div>
              <div className="text-blue-200">Group CTO</div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        {open && <div className="lg:hidden fixed inset-0 top-16 z-20 bg-slate-900/50" onClick={() => setOpen(false)} aria-hidden />}
        <aside className={`${open ? 'block' : 'hidden'} lg:block fixed lg:sticky top-16 z-30 h-[calc(100vh-4rem)] w-72 lg:w-60 max-w-[85vw] shrink-0 bg-brand-950 text-blue-100 overflow-y-auto nav-scroll shadow-xl lg:shadow-none`}>
          <div className="p-3">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-blue-300/80 px-2 mb-2">Industry domain</div>
            {domainOrder.map((id) => {
              const Icon = domainIcons[id]
              const active = id === domainId
              const red = tracks.flatMap((t) => cascade[id].tracks[t].initiatives.flatMap((i) => i.ground)).filter((g) => g.status === 'Delayed').length
              return (
                <NavLink
                  key={id}
                  to={`/domain/${id}`}
                  onClick={() => { setDomainId(id); setOpen(false) }}
                  className={({ isActive }) => `block px-3 py-2 rounded-md text-sm mb-1 transition ${isActive ? 'bg-white text-brand-950' : active ? 'bg-white/10 text-white ring-1 ring-white/20' : 'hover:bg-white/5'}`}
                >
                  <div className="flex items-center gap-2 font-semibold">
                    <Icon size={16} /> {domains[id].name}
                    {domains[id].configuredOnly && <span className="text-[9px] opacity-70 font-normal">config</span>}
                    {red > 0 && <span className="ml-auto text-[10px] bg-red-500 text-white rounded-full px-1.5" title="Red ground-level escalations">{red}</span>}
                  </div>
                  <div className="text-[10px] opacity-70 pl-6">{summary[id].phase} · 6 workstreams</div>
                </NavLink>
              )
            })}
            <div className="text-[10px] text-blue-300/70 px-3 mb-1">Selected domain drives every page</div>
            {plannedDomains.slice(0, 2).map((d) => (
              <div key={d} className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-300/60">
                <span className="w-4 text-center">+</span> {d} <span className="ml-auto text-[10px]">planned</span>
              </div>
            ))}
          </div>

          {nav.map((group) => (
            <div key={group.section} className="px-3 py-2 border-t border-white/10">
              <button
                onClick={() => setExpanded((e) => ({ ...e, [group.section]: !isOpen(group.section) }))}
                className="w-full flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-blue-300/80 hover:text-white px-2 py-1.5"
                aria-expanded={isOpen(group.section)}
              >
                {group.section}
                <ChevronDown size={14} className={`transition-transform ${isOpen(group.section) ? '' : '-rotate-90'}`} />
              </button>
              {isOpen(group.section) && group.items.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/' || to === '/tracker'}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2 rounded-md text-sm mb-0.5 transition ${isActive ? 'bg-white text-brand-950 font-medium' : 'text-blue-100/90 hover:bg-white/5 hover:text-white'}`
                  }
                >
                  <Icon size={16} /> {label}
                </NavLink>
              ))}
            </div>
          ))}

          <div className="m-3 p-3 rounded-lg bg-white/5 text-[11px] leading-5">
            <div className="font-semibold uppercase tracking-wider text-blue-300/80 mb-1">System status</div>
            <div><span className="text-emerald-400">●</span> Trust layer enforcing</div>
            <div><span className="text-emerald-400">●</span> AI services online</div>
            <div><span className="text-emerald-400">●</span> Audit trail active</div>
          </div>
        </aside>

        <main className="flex-1 min-w-0 p-4 md:p-6 xl:p-8">
          <div className="mx-auto max-w-[1440px]">
          <Outlet />
          <footer className="mt-10 py-4 border-t border-line text-xs text-ink-3 flex flex-wrap gap-x-6 gap-y-1 justify-center">
            <span>One Framework · Any Industry</span>
            <span>AI Recommends · Humans Decide</span>
            <span>CTO Capstone Project · 2026 · Demo data</span>
          </footer>
          </div>
        </main>
      </div>
    </div>
  )
}
