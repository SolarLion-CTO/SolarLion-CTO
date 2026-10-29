// Executive summary for the Technology Control Plane: a briefing written from the numbers, a unit × layer heat
// matrix, four standard executive visuals, and a guide to the page. Each block starts with a one-line purpose.
import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ArrowRight, Check, ClipboardCopy, FileText } from 'lucide-react'
import type { DomainId, Rag, Severity } from '../data/sim'
import { SCOPE_NAME, TARGET, layerMatrix } from '../data/sim/controlPlane'
import type { Layer, Scope } from '../data/sim/controlPlane'
import type { Decision } from '../data/sim/decisions'
import { Card } from '../components/ui'
import { ragHex } from '../components/sim/primitives'
import { axisTick, chart } from '../theme'
import { domains } from '../data/domains'

const UNITS: DomainId[] = ['banking', 'manufacturing', 'retail']
const SHORT: Record<DomainId, string> = { banking: 'BNK', manufacturing: 'MFG', retail: 'RTL' }
const MONTHS = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct']
const cr = (x: number) => `₹${x.toLocaleString('en-IN', { maximumFractionDigits: 1 })} Cr`
const PRI: Severity[] = ['Critical', 'High', 'Medium', 'Low']
const PRI_COL: Record<Severity, string> = { Critical: '#dc2626', High: '#ea580c', Medium: '#d97706', Low: '#94a3b8' }

export const Purpose = ({ children }: { children: string }) => <p className="text-[12.5px] text-ink-3 mt-0.5 mb-3"><b className="font-semibold text-ink-2">Purpose:</b> {children}</p>

export interface SummaryProps {
  scope: Scope; setScope: (s: Scope) => void; L: Layer[]; v: { green: number; amber: number; red: number; total: number; realised: number }
  decs: Decision[]; lines: string[]; onDrill: (layer: string) => void; jump: (id: string) => void
}

export default function ExecutiveSummary({ scope, setScope, L, v, decs, lines, onDrill, jump }: SummaryProps) {
  const matrix = useMemo(() => layerMatrix(), [])
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    const text = `CTO360 · Technology Control Plane · ${SCOPE_NAME[scope]}\n` + lines.map((l) => `• ${l}`).join('\n')
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch { /* clipboard blocked: ignore */ }
  }
  const trend = MONTHS.map((m, k) => ({ m, v: Math.round(L.reduce((a, l) => a + l.series[k], 0) / L.length) }))
  const bars = L.map((l) => ({ name: l.def.label.replace(' & ', ' & '), now: l.current, base: l.baseline, status: l.status }))
  const donut = [{ name: 'On track', value: v.green, c: '#15803d' }, { name: 'At risk (amber)', value: v.amber, c: '#d97706' }, { name: 'Off track (red)', value: v.red, c: '#dc2626' }]
  const byPri = PRI.map((p) => ({ p, n: decs.filter((d) => d.priority === p).length }))
  const guide: [string, string, string][] = [
    ['chain', 'Real-time impact chain', 'What does one live signal put at risk, and which decision does it need?'],
    ['layers', 'Control layers', 'Where is each layer against target, and what is its next decision?'],
    ['blast', 'Blast radius', 'Everything a single signal touches, across all layers.'],
    ['adm', 'TOGAF ADM wheel', 'Which phase of architecture change each initiative is in.'],
    ['stats', 'TIME, debt and value', 'Which apps to invest in, migrate or retire, and does technical debt cause incidents?'],
    ['tools', 'Tools feeding the plane', 'Which source systems feed the plane, and how fresh are they?'],
  ]

  return (
    <Card className="mt-5">
      <div id="summary" className="scroll-mt-20 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-semibold text-ink text-lg flex items-center gap-2"><FileText size={18} className="text-brand-600" />Executive summary · {scope === 'all' ? 'all business units' : domains[scope].name}</h2>
      </div>
      <Purpose>The whole page in one minute: the story in sentences, where each business unit stands by layer, four standard board charts, and where to look next.</Purpose>

      {/* 1 + 2: briefing and heat matrix */}
      <div className="grid grid-cols-1 xl:grid-cols-[1.05fr_1fr] gap-5">
        <section className="rounded-xl border border-line bg-gradient-to-br from-[#f6f9ff] to-white p-4 min-w-0">
          <div className="flex items-center justify-between gap-2"><h3 className="font-semibold text-ink">① CTO briefing</h3>
            <button onClick={copy} className="inline-flex items-center gap-1.5 text-xs font-semibold rounded-md border border-line bg-white px-2 py-1 text-brand-600 transition hover:border-brand-600 hover:-translate-y-0.5">{copied ? <><Check size={13} />Copied</> : <><ClipboardCopy size={13} />Copy briefing</>}</button></div>
          <Purpose>Six headline sentences written from the live numbers; they change with the business unit.</Purpose>
          <ol className="space-y-2">{lines.map((l, k) => (
            <li key={k} className="flex gap-2.5 text-sm text-ink-2 leading-relaxed"><span className="w-5 h-5 rounded-full bg-[#0f2747] text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">{k + 1}</span><span>{l}</span></li>
          ))}</ol>
        </section>

        <section className="rounded-xl border border-line p-4 min-w-0">
          <h3 className="font-semibold text-ink">② Business unit × layer heat matrix</h3>
          <Purpose>Compare units on the same scale to see where to act. Click a cell to switch to that unit and open the layer.</Purpose>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px] sm:text-sm table-fixed" aria-label="Layer scores by business unit">
              <colgroup><col className="w-[30%] sm:w-[34%]" /><col /><col /><col /><col /></colgroup>
              <thead><tr className="text-[11px] uppercase tracking-wide text-ink-3"><th className="text-left font-medium py-1.5">Layer</th>
                {UNITS.map((d) => <th key={d} className={`font-medium py-1.5 ${scope === d ? 'text-brand-700' : ''}`}><button onClick={() => setScope(d)} className="hover:underline" title={`Switch to ${domains[d].name}`}>{SHORT[d]}</button></th>)}
                <th className={`font-medium py-1.5 ${scope === 'all' ? 'text-brand-700' : ''}`}><button onClick={() => setScope('all')} className="hover:underline">All</button></th></tr></thead>
              <tbody>{matrix.map((row) => (
                <tr key={row.def.id} className="border-t border-line">
                  <td className="py-1.5 pr-1 text-ink font-medium leading-tight sm:whitespace-nowrap">{row.def.label}</td>
                  {row.cells.map((c) => (
                    <td key={c.d} className="p-0.5 sm:p-1">
                      <button onClick={() => { setScope(c.d); onDrill(row.def.id) }} title={`${domains[c.d].name} · ${row.def.label}: ${c.score} (target ${TARGET}). Click to open.`}
                        className={`w-full rounded-md py-1.5 text-center font-bold tabular-nums text-white transition hover:-translate-y-0.5 hover:shadow-md ${scope === c.d ? 'ring-2 ring-offset-1 ring-[#0f2747]' : ''}`} style={{ background: ragHex[c.status], opacity: scope === 'all' || scope === c.d ? 1 : 0.55 }}>{c.score}</button>
                    </td>
                  ))}
                  <td className="p-0.5 sm:p-1"><button onClick={() => { setScope('all'); onDrill(row.def.id) }} className={`w-full rounded-md py-1.5 text-center font-bold tabular-nums border-2 transition hover:-translate-y-0.5 ${scope === 'all' ? 'ring-2 ring-offset-1 ring-[#0f2747]' : ''}`} style={{ borderColor: ragHex[row.allStatus], color: ragHex[row.allStatus] }}>{row.all}</button></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          <div className="flex flex-wrap gap-3 text-[11px] text-ink-3 mt-2">{(['Green', 'Amber', 'Red'] as Rag[]).map((r) => <span key={r} className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm" style={{ background: ragHex[r] }} />{r === 'Green' ? '80 and above' : r === 'Amber' ? '60 to 79' : 'below 60'}</span>)}<span>· target {TARGET}</span></div>
        </section>
      </div>

      {/* 3: standard executive visuals */}
      <section className="mt-5">
        <h3 className="font-semibold text-ink">③ Standard executive visuals</h3>
        <Purpose>Four familiar board charts with the same calculated data, for readers who prefer standard formats.</Purpose>
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-4">
          <Std title="Layer scores vs target" purpose="Where each layer stands today against the target, and how far it has moved since Nov 2025.">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bars} layout="vertical" margin={{ top: 4, right: 12, left: 4, bottom: 0 }}>
                <CartesianGrid stroke={chart.grid} horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={axisTick} /><YAxis type="category" dataKey="name" tick={{ ...axisTick, fontSize: 10.5 }} width={92} />
                <Tooltip contentStyle={{ fontSize: 12 }} /><Legend wrapperStyle={{ fontSize: 11 }} />
                <ReferenceLine x={TARGET} stroke={chart.primaryDark} strokeDasharray="4 3" />
                <Bar dataKey="base" name="Nov 2025" fill={chart.comparison} barSize={7} radius={[0, 3, 3, 0]} isAnimationActive={false} />
                <Bar dataKey="now" name="Now" fill={chart.primary} barSize={9} radius={[0, 4, 4, 0]} isAnimationActive={false}>{bars.map((b) => <Cell key={b.name} fill={ragHex[b.status as Rag]} />)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </Std>
          <Std title="Expected value by delivery health" purpose="How much of the expected initiative value is on track versus at risk.">
            <div className="relative h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={donut} dataKey="value" nameKey="name" innerRadius="58%" outerRadius="85%" paddingAngle={2} isAnimationActive={false}>{donut.map((x) => <Cell key={x.name} fill={x.c} />)}</Pie>
                  <Tooltip formatter={(x) => cr(Number(x))} contentStyle={{ fontSize: 12 }} /><Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-x-0 top-[38%] text-center pointer-events-none"><div className="text-lg font-bold text-ink tabular-nums">{cr(v.total)}</div><div className="text-[10.5px] text-ink-3">expected</div></div>
            </div>
          </Std>
          <Std title="Control score trend" purpose="Whether the overall control score is improving fast enough to reach the target.">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
                <CartesianGrid stroke={chart.grid} vertical={false} />
                <XAxis dataKey="m" tick={axisTick} interval={1} /><YAxis domain={[40, 100]} tick={axisTick} />
                <ReferenceLine y={TARGET} stroke={chart.primaryDark} strokeDasharray="4 3" label={{ value: `Target ${TARGET}`, fontSize: 10, fill: chart.primaryDark, position: 'insideTopRight' }} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Line dataKey="v" name="Control score" stroke={chart.primary} strokeWidth={2.5} dot={{ r: 2 }} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </Std>
          <Std title="Open decisions by priority" purpose="How much decision load sits with leadership, by urgency.">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byPri} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
                <CartesianGrid stroke={chart.grid} vertical={false} />
                <XAxis dataKey="p" tick={axisTick} /><YAxis allowDecimals={false} tick={axisTick} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Bar dataKey="n" name="Decisions" radius={[4, 4, 0, 0]} barSize={34} isAnimationActive={false}>{byPri.map((b) => <Cell key={b.p} fill={PRI_COL[b.p]} />)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </Std>
        </div>
      </section>

      {/* 4: page guide */}
      <section className="mt-5">
        <h3 className="font-semibold text-ink">④ What this page does</h3>
        <Purpose>A guide for first-time viewers: each section, the question it answers, and a shortcut to it.</Purpose>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">{guide.map(([id, t, q], k) => (
          <button key={id} onClick={() => jump(id)} className="group text-left rounded-lg border border-line p-3 transition hover:-translate-y-0.5 hover:border-brand-600 hover:shadow-md">
            <div className="flex items-center gap-2"><span className="w-6 h-6 rounded-md bg-brand-50 text-brand-700 text-xs font-bold flex items-center justify-center">{k + 1}</span><span className="font-semibold text-ink text-sm">{t}</span><ArrowRight size={14} className="ml-auto text-brand-600 opacity-0 -translate-x-1 transition group-hover:opacity-100 group-hover:translate-x-0" /></div>
            <div className="text-[12.5px] text-ink-3 mt-1">{q}</div>
          </button>
        ))}</div>
      </section>
    </Card>
  )
}

function Std({ title, purpose, children }: { title: string; purpose: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-line p-3 min-w-0 flex flex-col">
      <div className="font-semibold text-ink text-sm">{title}</div>
      <p className="text-[11.5px] text-ink-3 leading-snug mb-2"><b className="font-semibold text-ink-2">Purpose:</b> {purpose}</p>
      <div className="h-56">{children}</div>
    </div>
  )
}
