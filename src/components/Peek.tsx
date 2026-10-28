// Hover previews for clickable items on the Technology Control Plane. Shown on hover or keyboard focus, only on
// devices that can hover. Hidden previews are display:none, so they never widen the page.
import type { ReactNode } from 'react'
import { ArrowRight } from 'lucide-react'
import type { Peek as PeekData } from '../data/sim/controlPlane'

const DOT = { Green: '#34d399', Amber: '#fbbf24', Red: '#f87171' } as const
/** Shared hover affordance for clickable cards: lift, brand border, shadow. */
export const lift = 'transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-8px_rgba(15,39,71,0.35)] hover:border-brand-600 focus-visible:outline-2 focus-visible:outline-brand-600'

export function PeekCard({ p, hint = 'Click to open' }: { p: PeekData; hint?: string }) {
  return (
    <div className="w-72 rounded-xl bg-[#0b1d38] text-white shadow-2xl ring-1 ring-white/10 p-3 text-left">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-slate-400"><span>{p.kind}</span><span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: DOT[p.health] }} />{p.health}</span></div>
      <div className="font-semibold text-[13.5px] leading-snug mt-0.5">{p.name}</div>
      {p.owner && <div className="text-[11px] text-slate-400">Owner: {p.owner}</div>}
      {p.why.length > 0 && <ul className="mt-2 space-y-0.5">{p.why.map((w, k) => <li key={k} className="text-[11.5px] text-amber-200 leading-snug flex gap-1.5"><span className="text-amber-400">›</span><span>{w}</span></li>)}</ul>}
      {p.facts.length > 0 && <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">{p.facts.map(([k, v]) => <div key={k} className="min-w-0"><dt className="text-[10px] text-slate-400">{k}</dt><dd className="text-[12px] font-medium truncate">{v}</dd></div>)}</dl>}
      {hint && <div className="mt-2 pt-2 border-t border-white/10 text-[11px] text-sky-300 flex items-center gap-1">{hint}<ArrowRight size={11} /></div>}
    </div>
  )
}

/** Wraps a clickable item; shows a preview card next to it on hover / focus. */
export function Peek({ p, children, side = 'bottom', align = 'left', className = '', hint }: { p: PeekData | null; children: ReactNode; side?: 'top' | 'bottom'; align?: 'left' | 'right' | 'center'; className?: string; hint?: string }) {
  const pos = `${side === 'bottom' ? 'top-full mt-2' : 'bottom-full mb-2'} ${align === 'left' ? 'left-0' : align === 'right' ? 'right-0' : 'left-1/2 -translate-x-1/2'}`
  return (
    <div className={`relative group/peek ${className}`}>
      {children}
      {p && <div role="tooltip" className={`pointer-events-none absolute z-50 ${pos} hidden [@media(hover:hover)]:group-hover/peek:block [@media(hover:hover)]:group-focus-within/peek:block`}><div className="peek-pop"><PeekCard p={p} hint={hint} /></div></div>}
    </div>
  )
}
