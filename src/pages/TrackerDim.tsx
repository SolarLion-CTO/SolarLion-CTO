import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { Bar as RBar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { NotebookPen, Star } from 'lucide-react'
import { domainOrder, domains } from '../data/domains'
import {
  appPortfolio, automationSteps, buildTree, capacity, dimBySlug, dimMeta, dpdp, flatten, isFlagship, maturity5,
  rcaPipeline, regPipeline, roiByQuarter, roles, viewDepth,
} from '../data/tracker'
import type { Dim, Role } from '../data/tracker'
import { useStore } from '../store'
import TreeView from '../components/TreeView'
import { Badge, Card } from '../components/ui'

function Pipeline({ stages, counts }: { stages: string[]; counts: number[] }) {
  return (
    <div className="grid grid-cols-4 gap-1">
      {stages.map((s, i) => (
        <div key={s} className={`rounded-md px-2 py-2 text-center text-white ${i === stages.length - 1 ? 'bg-amber-500' : i === 0 ? 'bg-[#0b2a6b]' : 'bg-blue-600'}`}>
          <div className="text-xl font-extrabold">{counts[i]}</div>
          <div className="text-[10px] leading-tight font-semibold">{s}</div>
        </div>
      ))}
    </div>
  )
}

function Extras({ dim }: { dim: Dim }) {
  const { domainId } = useStore()
  const [intake, setIntake] = useState<{ name: string; owner: string; kpi: string }[]>([])
  const [form, setForm] = useState({ name: '', owner: '', kpi: '' })

  if (dim === 'Strategy') return (
    <Card title="AI maturity by dimension (1–5)">
      <div className="space-y-2">
        {maturity5[domainId].map((m) => (
          <div key={m.dim} className="flex items-center gap-3 text-sm"><span className="w-24">{m.dim}</span><div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-blue-700" style={{ width: `${(m.score / 5) * 100}%` }} /></div><b className="w-8 text-right">{m.score}</b></div>
        ))}
      </div>
      <p className="text-xs text-slate-500 mt-2">Lowest dimension shows where transformation must start.</p>
    </Card>
  )
  if (dim === 'ROI') return (
    <Card title="ROI tracker — identified vs realised (₹ Cr, cumulative)">
      <div className="h-48"><ResponsiveContainer><BarChart data={roiByQuarter[domainId]} margin={{ left: -20 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" /><XAxis dataKey="q" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip /><Legend wrapperStyle={{ fontSize: 11 }} /><RBar dataKey="identified" name="Identified (Suman)" fill="#bfdbfe" /><RBar dataKey="realised" name="Realised (Santhosh)" fill="#0b2a6b" /></BarChart></ResponsiveContainer></div>
    </Card>
  )
  if (dim === 'Finance') return (
    <Card title="Application & resource portfolio">
      <table className="w-full text-sm">
        <thead><tr className="text-[10px] uppercase text-slate-500 border-b text-left"><th className="py-1.5">Application</th><th>Owner</th><th>Funding</th><th>₹ Cr / yr</th><th>Decision</th></tr></thead>
        <tbody>{appPortfolio[domainId].map((a) => (
          <tr key={a.app} className="border-b last:border-0"><td className="py-1.5">{a.app}</td><td>{a.owner}</td><td><span className={`text-[11px] font-semibold rounded px-1.5 ${a.funding === 'CAPEX' ? 'bg-[#0b2a6b] text-white' : 'bg-blue-100 text-blue-800'}`}>{a.funding}</span></td><td>{a.costCr}</td>
            <td><span className={`text-[11px] font-bold ${a.decision === 'Retire' ? 'text-red-600' : a.decision === 'Expand' ? 'text-emerald-700' : a.decision === 'Review' ? 'text-amber-600' : 'text-slate-700'}`}>{a.decision}</span></td></tr>
        ))}</tbody>
      </table>
    </Card>
  )
  if (dim === 'Operations') return (
    <div className="grid md:grid-cols-2 gap-4">
      <Card title="Capacity headroom (threshold 85%)">
        <div className="space-y-2">{capacity[domainId].map((c) => (
          <div key={c.name} className="text-sm"><div className="flex justify-between text-xs"><span>{c.name}</span><b className={c.used >= 85 ? 'text-red-600' : ''}>{c.used}%</b></div>
            <div className="h-2 bg-slate-100 rounded-full relative overflow-hidden"><div className={`h-full ${c.used >= 85 ? 'bg-amber-500' : 'bg-blue-600'}`} style={{ width: `${c.used}%` }} /><div className="absolute top-0 bottom-0 w-0.5 bg-red-600" style={{ left: '85%' }} /></div></div>
        ))}</div>
      </Card>
      <Card title="Process automation coverage">
        <ul className="space-y-1.5 text-sm">{automationSteps[domainId].map((s) => (
          <li key={s.step} className="flex items-center gap-2"><span className={`w-3 h-3 rounded-full border-2 ${s.state === 'Automated' ? 'bg-blue-700 border-blue-700' : s.state === 'In pilot' ? 'bg-amber-400 border-amber-400' : 'border-slate-300'}`} /><span className="flex-1">{s.step}</span><span className="text-xs font-semibold text-slate-600">{s.state}</span></li>
        ))}</ul>
      </Card>
    </div>
  )
  if (dim === 'ERP') return (
    <Card title="ERP root-cause pipeline (last 90 days)">
      <Pipeline stages={['Incidents raised', 'Analysed by RCA agent', 'Root cause confirmed', 'Fix approved by engineer']} counts={rcaPipeline[domainId]} />
      <p className="text-xs text-slate-500 mt-2">Every root cause cites log lines and work orders; an engineer approves the fix. Recurrence is tracked after the fix.</p>
    </Card>
  )
  if (dim === 'Governance') return (
    <div className="grid md:grid-cols-2 gap-4">
      <Card title={`Regulatory change → implementation · ${regPipeline[domainId].label}`}>
        <Pipeline stages={['Change received', 'Impact mapped', 'Controls implemented', 'Evidence filed']} counts={regPipeline[domainId].counts} />
        <p className="text-xs text-slate-500 mt-2">Not just mapping: each change is tracked until the control is implemented and evidence is filed.</p>
      </Card>
      <Card title="DPDP coverage by obligation">
        <ul className="space-y-1.5 text-sm">{dpdp[domainId].map((o) => (
          <li key={o.obligation} className="flex justify-between items-center"><span>{o.obligation}</span><span className={`text-[11px] font-bold rounded px-2 py-0.5 text-white ${o.status === 'Covered' ? 'bg-emerald-600' : o.status === 'Partial' ? 'bg-amber-500' : 'bg-red-600'}`}>{o.status}</span></li>
        ))}</ul>
      </Card>
    </div>
  )
  if (dim === 'AI') return (
    <Card title="Register a new AI initiative — TrackerAgent picks it up">
      <form className="grid sm:grid-cols-4 gap-2" onSubmit={(e) => { e.preventDefault(); if (!form.name || !form.owner || !form.kpi) return; setIntake([{ ...form }, ...intake]); setForm({ name: '', owner: '', kpi: '' }) }}>
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Initiative name" className="border border-slate-300 rounded-lg px-2 py-1.5 text-sm" />
        <input value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} placeholder="Accountable owner" className="border border-slate-300 rounded-lg px-2 py-1.5 text-sm" />
        <input value={form.kpi} onChange={(e) => setForm({ ...form, kpi: e.target.value })} placeholder="KPI it will move" className="border border-slate-300 rounded-lg px-2 py-1.5 text-sm" />
        <button className="inline-flex items-center justify-center gap-1 bg-blue-700 text-white rounded-lg text-sm font-semibold"><NotebookPen size={14} /> Register</button>
      </form>
      <p className="text-xs text-slate-500 mt-2">No owner and no KPI → not accepted. New initiatives enter at TEDIF Phase 1 (Assess).</p>
      {intake.length > 0 && (
        <ul className="mt-3 space-y-1 text-sm">{intake.map((i) => (
          <li key={i.name} className="flex flex-wrap gap-2 items-center border-b pb-1"><b>{i.name}</b><span className="text-slate-500">· {i.owner} · KPI: {i.kpi}</span><span className="ml-auto text-[11px] font-semibold bg-blue-100 text-blue-800 rounded px-1.5">Assess · tracked by TrackerAgent</span></li>
        ))}</ul>
      )}
    </Card>
  )
  return (
    <Card title="Reuse across domains">
      <p className="text-sm">The same control layer — MCP connectors, RAG, model router, bounded agents, ten-engine runtime — runs in all three domains. <Link to="/innovation" className="text-blue-700 font-semibold">See patterns and radar →</Link></p>
    </Card>
  )
}

export default function TrackerDim() {
  const { dim: slug } = useParams()
  const dim = slug ? dimBySlug[slug] : undefined
  const { domainId, setDomainId } = useStore()
  const [role, setRole] = useState<Role>('CTO')
  const [aiOnly, setAiOnly] = useState(false)
  if (!dim) return <Navigate to="/tracker" replace />

  const meta = dimMeta[dim]
  const tree = buildTree(dim, domainId)
  const all = flatten(tree).map((x) => x.node)
  const red = all.filter((n) => n.status === 'Delayed').length
  const aiCount = all.filter((n) => n.ai).length
  const deepest = Math.max(...all.map((n) => n.level))

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-blue-700">Programme tracker · lead {meta.lead}</div>
          <h1 className="text-2xl font-extrabold text-[#0b2a6b] uppercase">{dim}</h1>
          <div className="text-sm text-slate-600 mt-1">Team notes (bp1/bp2): {meta.notes.map((n) => <span key={n} className="inline-block bg-amber-50 border border-amber-200 rounded px-2 py-0.5 mr-1 mb-1 text-xs">“{n}”</span>)}</div>
        </div>
        <div className="flex rounded-lg border border-slate-200 overflow-hidden text-sm font-semibold bg-white">
          {domainOrder.map((d) => (
            <button key={d} onClick={() => setDomainId(d)} className={`px-4 py-2 flex items-center gap-1 ${d === domainId ? 'bg-[#0b2a6b] text-white' : 'hover:bg-slate-50'}`}>
              {domains[d].name}{isFlagship(dim, d) && <Star size={11} className="fill-amber-400 text-amber-400" />}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
        <Card><div className="text-[11px] uppercase text-slate-500 font-semibold">Items tracked</div><div className="text-2xl font-extrabold">{all.length}</div></Card>
        <Card><div className="text-[11px] uppercase text-slate-500 font-semibold">Levels deep</div><div className="text-2xl font-extrabold">{deepest} <span className="text-sm text-slate-400">/ 9</span></div>{isFlagship(dim, domainId) && <div className="text-[11px] text-amber-600 font-semibold">★ flagship — down to developer</div>}</Card>
        <Card><div className="text-[11px] uppercase text-slate-500 font-semibold">Overall progress</div><div className="text-2xl font-extrabold">{tree.progress}%</div><Badge>{tree.status}</Badge></Card>
        <Card><div className="text-[11px] uppercase text-slate-500 font-semibold">Red items</div><div className={`text-2xl font-extrabold ${red ? 'text-red-600' : 'text-emerald-700'}`}>{red}</div></Card>
        <Card><div className="text-[11px] uppercase text-slate-500 font-semibold">AI-involved items</div><div className="text-2xl font-extrabold text-violet-700">{aiCount}</div><div className="text-[11px] text-slate-500">each with a human approver</div></Card>
      </div>

      <div className="mb-4"><Extras dim={dim} /></div>

      <div className="flex flex-wrap items-center gap-3 mb-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700 mr-auto">Plan · CTO → developer</h2>
        <label className="text-sm flex items-center gap-2">View as
          <select value={role} onChange={(e) => setRole(e.target.value as Role)} className="border border-slate-300 rounded-lg px-2 py-1.5 bg-white text-sm font-semibold">
            {roles.map((r) => <option key={r}>{r}</option>)}
          </select>
        </label>
        <label className="text-sm flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={aiOnly} onChange={(e) => setAiOnly(e.target.checked)} /> AI-involved only</label>
      </div>
      <TreeView root={tree} depth={viewDepth[role]} focusLevel={roles.indexOf(role) + 1} aiOnly={aiOnly} />
      <p className="text-xs text-slate-500 mt-2">“View as” opens the plan to that role’s depth and highlights its level. Amber “below” flags show issues hidden deeper in the tree. Click an AI tag to see agent, source, confidence and the human approver.</p>
    </>
  )
}
