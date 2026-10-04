import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import {
  Bell, Bot, Brain, Briefcase, Building2, CalendarDays, Compass, Crown, Gauge, LayoutGrid, ListChecks, Network, Server, Users, CircleHelp, ClipboardCheck, Database, Factory, Gavel, Grid3x3, Landmark, Layers, LayoutDashboard, Lightbulb, Menu, Scale,
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

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="bg-gradient-to-r from-[#08205a] to-[#0d3a9a] text-white px-4 md:px-6 py-3 flex items-center gap-3 sticky top-0 z-30 shadow">
        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X /> : <Menu />}
        </button>
        <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center"><Scale size={20} /></div>
        <div className="leading-tight">
          <div className="font-extrabold tracking-wide text-sm md:text-lg">DOMAIN-AGNOSTIC ENTERPRISE AI TRANSFORMATION FRAMEWORK</div>
          <div className="text-[10px] md:text-xs text-blue-200 tracking-widest">POWERED BY TEDIF · AI RECOMMENDS, HUMANS DECIDE</div>
        </div>
        <div className="ml-auto flex items-center gap-4">
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
        <aside className={`${open ? 'block' : 'hidden'} md:block fixed md:sticky top-[60px] z-20 h-[calc(100vh-60px)] w-60 shrink-0 bg-[#0a1f4d] text-blue-100 overflow-y-auto`}>
          <div className="p-3">
            <div className="text-[10px] font-bold tracking-widest text-blue-300 px-2 mb-2">INDUSTRY DOMAIN</div>
            {domainOrder.map((id) => {
              const Icon = domainIcons[id]
              const active = id === domainId
              const red = tracks.flatMap((t) => cascade[id].tracks[t].initiatives.flatMap((i) => i.ground)).filter((g) => g.status === 'Delayed').length
              return (
                <NavLink
                  key={id}
                  to={`/domain/${id}`}
                  onClick={() => { setDomainId(id); setOpen(false) }}
                  className={({ isActive }) => `block px-3 py-2 rounded-md text-sm mb-1 transition ${isActive ? 'bg-white text-[#0a1f4d]' : active ? 'bg-blue-600 text-white' : 'hover:bg-white/10'}`}
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
            <div key={group.section} className="p-3 border-t border-white/10">
              <div className="text-[10px] font-bold tracking-widest text-blue-300 px-2 mb-2">{group.section.toUpperCase()}</div>
              {group.items.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/' || to === '/tracker'}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2 rounded-md text-sm mb-0.5 transition ${isActive ? 'bg-white text-[#0a1f4d] font-semibold' : 'hover:bg-white/10'}`
                  }
                >
                  <Icon size={16} /> {label}
                </NavLink>
              ))}
            </div>
          ))}

          <div className="m-3 p-3 rounded-lg bg-white/5 text-[11px] leading-5">
            <div className="font-bold text-blue-200 mb-1">SYSTEM STATUS</div>
            <div><span className="text-emerald-400">●</span> Trust layer enforcing</div>
            <div><span className="text-emerald-400">●</span> AI services online</div>
            <div><span className="text-emerald-400">●</span> Audit trail active</div>
          </div>
        </aside>

        <main className="flex-1 min-w-0 p-4 md:p-6">
          <Outlet />
          <footer className="mt-8 py-4 border-t border-slate-200 text-xs text-slate-500 flex flex-wrap gap-x-6 gap-y-1 justify-center">
            <span>One Framework · Any Industry</span>
            <span>AI Recommends · Humans Decide</span>
            <span>CTO Capstone Project · 2026 · Demo data</span>
          </footer>
        </main>
      </div>
    </div>
  )
}
