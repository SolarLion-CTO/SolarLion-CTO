import { useState } from 'react'
import { ChevronDown, ChevronRight, Sparkles, TriangleAlert } from 'lucide-react'
import type { Node } from '../data/tracker'
import { roles, worstBelow } from '../data/tracker'
import { Badge } from './ui'

const levelTone = ['bg-brand-900', 'bg-blue-800', 'bg-blue-700', 'bg-blue-600', 'bg-sky-700', 'bg-sky-600', 'bg-teal-600', 'bg-violet-600', 'bg-slate-600']
const dot: Record<string, string> = { 'On Track': 'bg-emerald-500', 'At Risk': 'bg-amber-400', Delayed: 'bg-red-500' }

function Row({ n, depth, focusLevel, aiOnly }: { n: Node; depth: number; focusLevel: number; aiOnly: boolean }) {
  const [open, setOpen] = useState(n.level < depth)
  const [showAi, setShowAi] = useState(false)
  const below = worstBelow(n)
  const hasAiBelow = (x: Node): boolean => !!x.ai || x.children.some(hasAiBelow)
  if (aiOnly && !hasAiBelow(n)) return null
  const focus = n.level === focusLevel

  return (
    <div>
      <div
        className={`flex items-start gap-2 py-2 pr-3 border-b border-slate-100 ${focus ? 'bg-blue-50/70' : ''}`}
        style={{ paddingLeft: `${(n.level - 1) * 12 + 6}px` }}
      >
        <button onClick={() => setOpen(!open)} className={`mt-0.5 shrink-0 text-slate-400 ${n.children.length ? '' : 'invisible'}`} aria-label={open ? 'Collapse' : 'Expand'}>
          {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        <span className={`shrink-0 text-[10px] font-bold text-white rounded px-1.5 py-0.5 w-20 sm:w-24 text-center ${levelTone[n.level - 1]}`}>L{n.level} · {roles[n.level - 1]}</span>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-x-2">
            <span className={`text-sm ${n.level <= 3 ? 'font-bold' : 'font-semibold'}`}>{n.title}</span>
            {n.ai && (
              <button onClick={() => setShowAi(!showAi)} className="inline-flex items-center gap-1 text-[10px] font-bold rounded px-1.5 py-0.5 bg-violet-100 text-violet-800 hover:bg-violet-200">
                <Sparkles size={10} /> {n.ai.mode}
              </button>
            )}
            {below && below !== 'On Track' && n.status === 'On Track' && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700" title="Something below this item is not on track">
                <TriangleAlert size={11} /> {below.toLowerCase()} below
              </span>
            )}
          </div>
          {n.detail && <div className="text-xs text-slate-500">{n.detail}</div>}
          <div className="text-[11px] text-slate-500">{n.owner}{n.due && ` · due ${n.due}`}</div>
          <div className="md:hidden flex items-center gap-2 text-[11px] mt-0.5"><span className={`w-2 h-2 rounded-full ${dot[n.status]}`} />{n.status} · {n.progress}%{n.budget && ` · ₹${n.budget[1]} / ${n.budget[0]} Cr`}</div>
          {n.blocker && <div className="text-xs text-red-700 mt-0.5">Blocker: {n.blocker}</div>}
          {showAi && n.ai && (
            <div className="mt-2 rounded-lg border border-violet-200 bg-violet-50 p-2 text-xs grid sm:grid-cols-5 gap-2">
              <div><span className="text-slate-500 block">Mode</span><b>{n.ai.mode}</b></div>
              <div><span className="text-slate-500 block">Agent</span><b>{n.ai.agent}</b></div>
              <div><span className="text-slate-500 block">Source</span><b>{n.ai.source}</b></div>
              <div><span className="text-slate-500 block">Confidence</span><b>{Math.round(n.ai.confidence * 100)}%</b></div>
              <div><span className="text-slate-500 block">Human approver</span><b>{n.ai.approver}</b></div>
            </div>
          )}
        </div>
        <div className="hidden md:flex items-center gap-3 shrink-0">
          {n.budget && <span className="text-[11px] text-slate-500 w-28 text-right">₹{n.budget[1]} / {n.budget[0]} Cr</span>}
          <div className="w-24">
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full ${dot[n.status]}`} style={{ width: `${n.progress}%` }} /></div>
            <div className="text-[10px] text-slate-500 text-right">{n.progress}%</div>
          </div>
          <div className="w-20 text-right"><Badge>{n.status}</Badge></div>
        </div>
      </div>
      {open && n.children.map((c) => <Row key={c.id} n={c} depth={depth} focusLevel={focusLevel} aiOnly={aiOnly} />)}
    </div>
  )
}

// The key forces a remount when "view as" changes so the default expansion is re-applied.
export default function TreeView({ root, depth, focusLevel, aiOnly }: { root: Node; depth: number; focusLevel: number; aiOnly: boolean }) {
  return (
    <div className="rounded-xl border border-line bg-white overflow-hidden">
      <div className="hidden md:flex text-[10px] uppercase font-semibold text-slate-500 border-b bg-slate-50 py-2 px-3">
        <span className="flex-1">Level · role · item</span><span className="w-28 text-right mr-3">Spent / budget</span><span className="w-24 text-right mr-3">Progress</span><span className="w-20 text-right">Status</span>
      </div>
      <Row key={`${root.id}-${depth}-${aiOnly}`} n={root} depth={depth} focusLevel={focusLevel} aiOnly={aiOnly} />
    </div>
  )
}
