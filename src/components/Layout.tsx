import { useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Bell, Bot, Brain, Briefcase, Building2, CalendarDays, ChevronDown, CircleHelp, ClipboardCheck, Compass, Cpu, Crown, Database,
  Factory, Gauge, Gavel, Grid3x3, Landmark, Layers, LayoutDashboard, LayoutGrid, Lightbulb, ListChecks, Menu, Network, Server,
  ShieldCheck, ShoppingCart, Sparkles, Target, TrendingUp, Users, Wallet, Wrench, X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useStore } from '../store'
import { domainOrder, domains } from '../data/domains'
import type { DomainId } from '../data/domains'
import { cascade, tracks } from '../data/cascade'

type Item = { to: string; label: string; icon: LucideIcon; badge?: number }
type Group = { section: string; icon: LucideIcon; items: Item[] }

const redCount = (id: DomainId) =>
  tracks.flatMap((t) => cascade[id].tracks[t].initiatives.flatMap((i) => i.ground)).filter((g) => g.status === 'Delayed').length

// Nine executive sections. Every existing route is kept — only regrouped.
const nav: Group[] = [
  { section: 'Executive Overview', icon: LayoutDashboard, items: [
    { to: '/', label: 'Overview', icon: LayoutDashboard },
    { to: '/domain/banking', label: 'Banking view', icon: Landmark, badge: redCount('banking') },
    { to: '/domain/manufacturing', label: 'Manufacturing view', icon: Factory, badge: redCount('manufacturing') },
    { to: '/domain/retail', label: 'Retail view', icon: ShoppingCart, badge: redCount('retail') },
    { to: '/problems', label: 'Problem matrix', icon: Grid3x3 },
    { to: '/cto/business', label: 'Business case', icon: Building2 },
    { to: '/cto/coverage', label: 'Capstone coverage', icon: ListChecks },
  ] },
  { section: 'Strategy', icon: Compass, items: [
    { to: '/cto/strategy', label: 'Current → target', icon: Compass },
    { to: '/cto/assessment', label: 'Readiness assessment', icon: Gauge },
    { to: '/cto/portfolio', label: 'Use-case portfolio', icon: LayoutGrid },
    { to: '/strategy', label: 'Strategy & ROI', icon: Target },
    { to: '/cto/roadmap', label: 'Roadmap', icon: CalendarDays },
    { to: '/tracker/strategy', label: 'Strategy plan', icon: ListChecks },
  ] },
  { section: 'Enterprise Architecture', icon: Network, items: [
    { to: '/cto/architecture', label: 'Architecture', icon: Network },
    { to: '/cto/data', label: 'Data readiness', icon: Server },
    { to: '/framework', label: 'Framework', icon: Layers },
  ] },
  { section: 'Operations', icon: Factory, items: [
    { to: '/operations', label: 'Operations', icon: Factory },
    { to: '/tracker/operations', label: 'Operations plan', icon: ListChecks },
    { to: '/tracker/erp', label: 'ERP root cause', icon: Database },
  ] },
  { section: 'Engineering', icon: Wrench, items: [
    { to: '/tracker', label: 'Delivery portfolio', icon: Briefcase },
    { to: '/cto/operating-model', label: 'Operating model & CoE', icon: Users },
  ] },
  { section: 'Finance', icon: Wallet, items: [
    { to: '/finance', label: 'Finance & investment', icon: Wallet },
    { to: '/value', label: 'Business value', icon: TrendingUp },
    { to: '/tracker/roi', label: 'ROI plan', icon: TrendingUp },
    { to: '/tracker/finance', label: 'Finance plan', icon: ListChecks },
  ] },
  { section: 'Innovation', icon: Lightbulb, items: [
    { to: '/innovation', label: 'Innovation', icon: Lightbulb },
    { to: '/tracker/innovation', label: 'Innovation plan', icon: ListChecks },
  ] },
  { section: 'Risk & Governance', icon: ShieldCheck, items: [
    { to: '/governance', label: 'Regulatory & governance', icon: ShieldCheck },
    { to: '/tedif', label: 'TEDIF tracker', icon: ClipboardCheck },
    { to: '/tracker/governance', label: 'Governance plan', icon: ListChecks },
  ] },
  { section: 'AI Intelligence', icon: Sparkles, items: [
    { to: '/decisions', label: 'Decision center', icon: Gavel },
    { to: '/cto/decisions', label: 'CTO decisions', icon: Crown },
    { to: '/cto/ai-selection', label: 'AI selection', icon: Brain },
    { to: '/agents', label: 'AI agents', icon: Bot },
    { to: '/tracker/ai', label: 'AI plan', icon: Cpu },
  ] },
]

const matches = (to: string, path: string) => (to === '/' || to === '/tracker' ? path === to : path === to || path.startsWith(to + '/'))

export default function Layout() {
  const { domainId, setDomainId, domain } = useStore()
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const activeGroup = nav.find((g) => g.items.some((i) => matches(i.to, pathname)))?.section
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const isOpen = (s: string) => expanded[s] ?? (s === activeGroup || s === 'Executive Overview')

  // Switching domain on a domain page also moves to that domain's page.
  const switchDomain = (d: DomainId) => {
    setDomainId(d)
    if (pathname.startsWith('/domain/')) navigate(`/domain/${d}`)
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
              value={domainId}
              onChange={(e) => switchDomain(e.target.value as DomainId)}
              className="bg-white/10 hover:bg-white/15 border border-white/20 rounded-lg pl-2.5 pr-7 py-1.5 text-white text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-accent appearance-none bg-no-repeat bg-[right_0.5rem_center] bg-[length:12px] cursor-pointer"
              style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23CBD5E1' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")" }}
              aria-label="Business unit"
            >
              {domainOrder.map((d) => <option key={d} value={d} className="text-ink">{domains[d].name}{domains[d].configuredOnly ? ' (config)' : ''}</option>)}
            </select>
          </label>
          <span className="hidden xl:inline text-[12px] text-slate-300">Updated 6 Oct 2026, 09:30</span>
          <button className="relative hidden sm:block p-1 rounded-md hover:bg-white/10" aria-label={`${domain.alerts.length} notifications`}>
            <Bell size={19} />
            <span className="absolute -top-0.5 -right-0.5 bg-crit text-[10px] font-semibold rounded-full w-4 h-4 flex items-center justify-center">{domain.alerts.length}</span>
          </button>
          <CircleHelp size={19} className="hidden md:block text-slate-300" aria-hidden />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center font-semibold text-sm" aria-hidden>R</div>
            <div className="hidden lg:block leading-tight text-xs">
              <div className="font-semibold">Ram</div>
              <div className="text-slate-300">Group CTO</div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar — white, grouped, collapsible */}
        {open && <div className="lg:hidden fixed inset-0 top-16 z-20 bg-slate-900/40" onClick={() => setOpen(false)} aria-hidden />}
        <aside className={`${open ? 'block' : 'hidden'} lg:block fixed lg:sticky top-16 z-30 h-[calc(100vh-4rem)] w-72 lg:w-[17.5rem] max-w-[85vw] shrink-0 bg-surface border-r border-line overflow-y-auto shadow-xl lg:shadow-none`}>
          <nav className="py-3" aria-label="Main">
            {nav.map((g) => {
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
                      {g.items.map(({ to, label, icon: Icon, badge }) => (
                        <NavLink
                          key={to}
                          to={to}
                          end={to === '/' || to === '/tracker'}
                          onClick={() => {
                            const m = to.match(/^\/domain\/(\w+)/)
                            if (m) setDomainId(m[1] as DomainId)
                            setOpen(false)
                          }}
                          className={({ isActive }) =>
                            `relative flex items-center gap-2 pl-4 pr-3 py-1.5 -ml-px text-[13.5px] border-l-2 transition ${isActive ? 'border-brand-600 bg-brand-50 text-brand-700 font-semibold rounded-r-md' : 'border-transparent text-ink-2 hover:text-ink hover:bg-slate-50 rounded-r-md'}`
                          }
                        >
                          <Icon size={14} className="shrink-0 opacity-70" />
                          <span className="flex-1 truncate">{label}</span>
                          {!!badge && <span className="text-[10px] font-semibold bg-crit-bg text-crit-text border border-red-200 rounded-full px-1.5" title={`${badge} red escalations`}>{badge}</span>}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>
          <div className="mx-6 mt-2 mb-5 pt-4 border-t border-line text-[12px] text-ink-3 space-y-1">
            <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-success-text" />Trust layer enforcing</div>
            <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-success-text" />Audit trail active</div>
          </div>
        </aside>

        <main className="flex-1 min-w-0 p-4 md:p-6">
          <div className="mx-auto max-w-[1440px]">
            <Outlet />
            <footer className="mt-10 py-4 border-t border-line text-xs text-ink-3 flex flex-wrap gap-x-6 gap-y-1 justify-center">
              <span><b className="font-semibold text-ink-2">CTO360</b> · One View. Connected Decisions. Measurable Technology Outcomes.</span>
              <span>Decision intelligence powered by TEDIF</span>
              <span>Demo data</span>
            </footer>
          </div>
        </main>
      </div>
    </div>
  )
}
