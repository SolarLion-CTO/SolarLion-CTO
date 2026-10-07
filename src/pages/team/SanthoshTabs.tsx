// Santhosh · Technology Spend & Investment — CAPEX / OPEX & TBM, Budget & anomalies, FinOps & licences, Investment governance.
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bar as RBar, BarChart, CartesianGrid, Cell, ComposedChart, Legend, Line, ReferenceDot, ResponsiveContainer, Sankey, Tooltip, XAxis, YAxis } from 'recharts'
import { domainOrder, domains } from '../../data/domains'
import type { DomainId } from '../../data/domains'
import { FORECAST_MONTHS, sim } from '../../data/sim'
import { decisionsFor } from '../../data/sim/decisions'
import { buildEvents } from '../../data/sim/events'
import { CATEGORIES, cloudDaily, forecast3, investmentCase, ledger, licences, octMtd, runCostCr, tbmSankey } from '../../data/sim/spend'
import { OWNER, measureState } from '../../data/sim/team'
import { Card } from '../../components/ui'
import { StatusPill } from '../../components/sim/primitives'
import { useDecisionState } from '../../components/sim/decisionState'
import { useSimClock } from '../../components/sim/clock'
import { axisTick, chart, domainColor } from '../../theme'

type DF = DomainId | 'all'
const dn = (d: DomainId) => domains[d].name
const cr = (n: number) => `₹${Math.round(n * 10) / 10} Cr`
function Filter({ v, on, all = true }: { v: DF; on: (d: DF) => void; all?: boolean }) {
  return <div className="inline-flex rounded-lg border border-slate-300 bg-white overflow-hidden text-[13px] mb-4">{([...(all ? ['all'] : []), ...domainOrder] as DF[]).map((x) => <button key={x} onClick={() => on(x)} aria-pressed={v === x} className={`px-3 py-1.5 ${v === x ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-ink-2 hover:bg-slate-50'}`}>{x === 'all' ? 'All units' : dn(x)}</button>)}</div>
}
/** Sum the monthly ledgers of the selected business units. */
function useLedger(d: DF) {
  return useMemo(() => {
    const ls = (d === 'all' ? domainOrder : [d]).map(ledger)
    return ls[0].map((row, k) => {
      const byCat = Object.fromEntries(CATEGORIES.map((c) => [c, ls.reduce((a, l) => a + l[k].byCat[c], 0)])) as typeof row.byCat
      const sum = (f: (x: typeof row) => number) => Math.round(ls.reduce((a, l) => a + f(l[k]), 0) * 100) / 100
      return { ...row, byCat, total: sum((x) => x.total), capex: sum((x) => x.capex), opex: sum((x) => x.opex), budget: sum((x) => x.budget), run: sum((x) => x.run), change: sum((x) => x.change) }
    })
  }, [d])
}

// ── 1. CAPEX / OPEX & TBM ────────────────────────────────────────────
export function CapexTab() {
  const [d, setD] = useState<DF>('all')
  const rows = useLedger(d)
  const fc = forecast3(rows)
  const capShare = rows.reduce((a, x) => a + x.capex, 0) / rows.reduce((a, x) => a + x.total, 0)
  const data = [...rows.map((x) => ({ m: x.month, CAPEX: x.capex, OPEX: x.opex })), ...fc.map((v, i) => ({ m: FORECAST_MONTHS[i] + '*', 'CAPEX (forecast)': Math.round(v * capShare * 100) / 100, 'OPEX (forecast)': Math.round(v * (1 - capShare) * 100) / 100 }))]
  const fy = rows.reduce((a, x) => a + x.total, 0)
  const { now } = useSimClock()
  const events = useMemo(() => (d === 'all' ? domainOrder : [d]).flatMap((x) => buildEvents(sim[x])), [d])
  const mtd = (d === 'all' ? domainOrder : [d]).map((x) => octMtd(x, events.filter((e) => e.id.includes(sim[x].code)), now)).reduce((a, m) => ({ base: a.base + m.base, posted: a.posted + m.posted, mtd: a.mtd + m.mtd, full: a.full + m.full }), { base: 0, posted: 0, mtd: 0, full: 0 })
  const tbmPct = measureState(OWNER.santhosh.measures.find((m) => m.id === 'san-tbm')!).current
  const sankey = useMemo(() => tbmSankey(tbmPct), [tbmPct])
  return (
    <>
      <Filter v={d} on={setD} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          ['Technology spend (12 months)', cr(fy), `${(d === 'all' ? 'all units' : dn(d))} · run ${cr(rows.reduce((a, x) => a + x.run, 0))}`],
          ['CAPEX share', `${Math.round(capShare * 100)}%`, `OPEX ${100 - Math.round(capShare * 100)}% — cloud keeps shifting spend to OPEX`],
          ['Change-the-business', `${Math.round((rows.reduce((a, x) => a + x.change, 0) / fy) * 100)}%`, 'projects share of spend'],
          ['October to date · live', cr(mtd.mtd), `${cr(mtd.posted)} posted since 09:30 · month ${cr(mtd.full)}`],
        ].map(([l, v, s]) => <div key={l} className="bg-surface rounded-xl border border-line p-3.5"><div className="text-xs text-ink-2">{l}</div><div className="text-[24px] font-bold text-brand-900 leading-tight tabular-nums">{v}</div><div className="text-[11px] text-ink-3">{s}</div></div>)}
      </div>
      <Card title="CAPEX vs OPEX by month (₹ Cr) · 12 months + 3-month forecast" className="mb-5">
        <div className="h-72" role="img" aria-label={`Monthly CAPEX and OPEX; 12-month total ${cr(fy)}`}>
          <ResponsiveContainer>
            <BarChart data={data} margin={{ left: -12, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} vertical={false} />
              <XAxis dataKey="m" tick={axisTick} /><YAxis tick={axisTick} /><Tooltip formatter={(v) => `₹${v} Cr`} /><Legend wrapperStyle={{ fontSize: 12 }} />
              <RBar isAnimationActive={false} dataKey="CAPEX" stackId="a" fill={chart.primaryDark} />
              <RBar isAnimationActive={false} dataKey="OPEX" stackId="a" fill={chart.primary} radius={[3, 3, 0, 0]} />
              <RBar isAnimationActive={false} dataKey="CAPEX (forecast)" stackId="a" fill="#64748b" />
              <RBar isAnimationActive={false} dataKey="OPEX (forecast)" stackId="a" fill="#94a3b8" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-ink-3">Forecast (*) by Holt's double exponential smoothing on the monthly totals. Hardware refreshes land quarterly; projects are 60% capitalised.</p>
      </Card>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <Card title="Spend by category (12 months)">
          <table className="w-full text-sm">
            <tbody>{CATEGORIES.map((c) => { const v = rows.reduce((a, x) => a + x.byCat[c], 0); return (
              <tr key={c} className="border-b border-line last:border-0"><td className="py-1.5 text-ink">{c}</td><td className="w-28"><div className="h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-brand-600" style={{ width: `${(v / fy) * 100}%` }} /></div></td><td className="text-right tabular-nums pl-2">{cr(v)}</td></tr>
            ) })}</tbody>
          </table>
        </Card>
        <Card title={`TBM cost flow · cost pools → IT towers → business units (all units, ${tbmPct}% allocated)`} className="xl:col-span-2 min-w-0">
          <div className="overflow-x-auto"><div className="h-[380px] min-w-[640px]">
            <ResponsiveContainer>
              <Sankey data={sankey} nodePadding={18} nodeWidth={10} margin={{ left: 8, right: 160, top: 8, bottom: 8 }} link={{ stroke: '#93c5fd', strokeOpacity: 0.35 }}
                node={({ x, y, width, height, payload }: { x: number; y: number; width: number; height: number; payload: { name: string; value: number } }) => (
                  <g><rect x={x} y={y} width={width} height={height} fill={payload.name.startsWith('Unallocated') ? '#94a3b8' : chart.primaryDark} rx={2} />
                    <text x={x + width + 6} y={y + height / 2} dy={4} fontSize={11} fill="#172033">{payload.name} · ₹{Math.round(payload.value)} Cr</text></g>
                )}>
                <Tooltip formatter={(v) => `₹${Math.round(Number(v) * 10) / 10} Cr`} />
              </Sankey>
            </ResponsiveContainer>
          </div></div>
          <p className="text-xs text-ink-3">Technology Business Management (TBM) allocation by rule. The grey "Unallocated" flow is spend not yet tagged to a service — Santhosh's TBM coverage measure ({tbmPct}% → 95% target).</p>
        </Card>
      </div>
    </>
  )
}

// ── 2. Budget, forecast & anomalies ──────────────────────────────────
export function BudgetTab() {
  const [d, setD] = useState<DF>('all')
  const rows = useLedger(d)
  const fc = forecast3(rows)
  let cb = 0, ca = 0
  const data = [...rows.map((x) => { cb += x.budget; ca += x.total; return { m: x.month, Budget: x.budget, Actual: x.total, 'Cumulative variance': Math.round((ca - cb) * 10) / 10 } }), ...fc.map((v, i) => ({ m: FORECAST_MONTHS[i] + '*', Forecast: v }))]
  const ins = (d === 'all' ? domainOrder : [d]).flatMap((x) => sim[x].initiatives.map((i) => ({ i, d: x }))).map(({ i, d: x }) => ({ name: i.name.length > 24 ? i.name.slice(0, 23) + '…' : i.name, v: Math.round((i.forecastCr - i.budgetCr) * 100) / 100, d: x })).filter((x) => Math.abs(x.v) > 0.05).sort((a, b) => Math.abs(b.v) - Math.abs(a.v))
  const top = ins.slice(0, 8), rest = ins.slice(8).reduce((a, x) => a + x.v, 0)
  const wfIn = [...top.sort((a, b) => b.v - a.v), ...(ins.length > 8 ? [{ name: `Others (${ins.length - 8})`, v: Math.round(rest * 100) / 100, d: 'banking' as DomainId }] : [])]
  let run = 0
  const wf = wfIn.map((x) => { const base = x.v >= 0 ? run : run + x.v; run += x.v; return { name: x.name, base: Math.round(base * 100) / 100, delta: Math.abs(x.v), up: x.v >= 0 } })
  const [cd, setCd] = useState<DomainId>('retail')
  const cdaily = cloudDaily(cd)
  return (
    <>
      <Filter v={d} on={setD} />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-5">
        <Card title="Budget vs actual vs forecast (₹ Cr / month)">
          <div className="h-64">
            <ResponsiveContainer>
              <ComposedChart data={data} margin={{ left: -12, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} vertical={false} />
                <XAxis dataKey="m" tick={axisTick} /><YAxis tick={axisTick} /><Tooltip /><Legend wrapperStyle={{ fontSize: 12 }} />
                <RBar isAnimationActive={false} dataKey="Actual" fill={chart.primary} radius={[3, 3, 0, 0]} />
                <Line isAnimationActive={false} dataKey="Budget" stroke={chart.comparison} strokeWidth={2} strokeDasharray="5 4" dot={false} />
                <Line isAnimationActive={false} dataKey="Forecast" stroke={chart.primaryDark} strokeWidth={2} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-ink-3">12-month variance: <b className="text-ink">{cr(ca - cb)}</b> ({Math.round(((ca - cb) / cb) * 1000) / 10}% vs budget). Forecast = Holt smoothing.</p>
        </Card>
        <Card title="Variance waterfall · initiative forecast vs budget">
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={wf} margin={{ left: -12, right: 8, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} vertical={false} />
                <XAxis dataKey="name" tick={{ ...axisTick, fontSize: 9 }} angle={-30} textAnchor="end" interval={0} height={60} /><YAxis tick={axisTick} />
                <Tooltip formatter={(v, n) => (n === 'base' ? null : `₹${v} Cr`)} />
                <RBar isAnimationActive={false} dataKey="base" stackId="w" fill="transparent" />
                <RBar isAnimationActive={false} dataKey="delta" stackId="w" name="Variance">{wf.map((x, k) => <Cell key={k} fill={x.up ? chart.primaryDark : chart.comparison} />)}</RBar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-ink-3">Dark = overrun, grey = underspend; bars build up to the net forecast variance of {cr(run)}.</p>
        </Card>
      </div>
      <Card title="Cloud cost anomalies · daily (₹ lakh), last 60 days" action={<Filter v={cd} on={(x) => setCd(x as DomainId)} all={false} />}>
        <div className="h-64">
          <ResponsiveContainer>
            <ComposedChart data={cdaily.days} margin={{ left: -8, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} vertical={false} />
              <XAxis dataKey="day" tick={axisTick} interval={9} /><YAxis tick={axisTick} /><Tooltip />
              <Line isAnimationActive={false} dataKey="v" name="Daily cloud cost" stroke={domainColor[cd]} strokeWidth={2} dot={false} />
              {cdaily.anomalies.map((a) => <ReferenceDot key={a.index} x={cdaily.days[a.index].day} y={a.value} r={6} fill={chart.primaryDark} stroke="white" />)}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <ul className="text-sm mt-2 space-y-1">{cdaily.anomalies.length === 0 ? <li className="text-success-text">No anomalies.</li> : cdaily.anomalies.map((a) => (
          <li key={a.index} className="flex flex-wrap gap-x-3"><b>{cdaily.days[a.index].day}</b><span>₹{a.value} L vs expected ₹{a.expected} L (z = {a.z})</span><span className="text-ink-3">{a.why}</span></li>
        ))}</ul>
        <p className="text-xs text-ink-3 mt-1">EWMA control chart (λ = 0.3, 3σ) on the simulated daily cost series.</p>
      </Card>
    </>
  )
}

// ── 3. FinOps & licences ─────────────────────────────────────────────
export function FinOpsTab() {
  const [d, setD] = useState<DomainId>('banking')
  const lic = licences(d)
  const waste = measureState(OWNER.santhosh.measures.find((m) => m.id === 'san-waste')!).current
  const cloudYr = ledger(d).reduce((a, x) => a + x.byCat.Cloud, 0)
  const parts = [['Idle compute', 0.4], ['Over-provisioned instances', 0.3], ['Unattached storage and snapshots', 0.15], ['Non-production running 24×7', 0.15]] as const
  const wasteCr = (cloudYr * waste) / 100
  const licWaste = lic.reduce((a, x) => a + x.waste, 0)
  const ops = [
    ...parts.map(([n, s]) => ({ n: `Cloud: remove ${n.toLowerCase()}`, v: wasteCr * s * 0.8, owner: 'Head of Cloud' })),
    ...lic.filter((x) => x.util < 75).map((x) => ({ n: `Right-size ${x.product} (${x.seats - x.used} unused)`, v: x.waste * 0.7, owner: 'Procurement with app owner' })),
  ].sort((a, b) => b.v - a.v)
  return (
    <>
      <Filter v={d} on={(x) => setD(x as DomainId)} all={false} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[['Cloud spend (12 months)', cr(cloudYr)], ['Cloud waste', `${waste}% · ${cr(wasteCr)}`], ['Licence waste', cr(licWaste)], ['Savings identified', cr(ops.reduce((a, x) => a + x.v, 0))]].map(([l, v]) => <div key={l} className="bg-surface rounded-xl border border-line p-3.5"><div className="text-xs text-ink-2">{l}</div><div className="text-[22px] font-bold text-brand-900 leading-tight tabular-nums">{v}</div></div>)}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-5">
        <Card title="Where the cloud waste is">
          <ul className="space-y-2.5">{parts.map(([n, s]) => <li key={n} className="grid grid-cols-[1fr_8rem_4rem] gap-3 items-center text-sm"><span className="text-ink">{n}</span><div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-brand-600" style={{ width: `${s * 100}%` }} /></div><span className="text-right tabular-nums">{cr(wasteCr * s)}</span></li>)}</ul>
          <p className="text-xs text-ink-3 mt-3">FinOps lifecycle: inform (allocate, show) → optimise (rightsize, schedule) → operate (budgets, alerts). Waste share is Santhosh's measure ({waste}% → 8% target).</p>
        </Card>
        <Card title="Licence utilisation">
          <table className="w-full text-sm">
            <thead><tr className="text-[11px] uppercase tracking-wide text-ink-3 border-b border-line text-left"><th className="py-1.5">Product</th><th className="text-right">Seats</th><th className="w-32 pl-2">Used</th><th className="text-right">Waste / yr</th></tr></thead>
            <tbody>{lic.map((x) => <tr key={x.product} className="border-b border-line last:border-0"><td className="py-1.5 text-ink">{x.product}</td><td className="text-right tabular-nums">{x.seats.toLocaleString('en-IN')}</td><td className="pl-2"><div className="flex items-center gap-1.5"><div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full ${x.util < 70 ? 'bg-warn' : 'bg-brand-600'}`} style={{ width: `${x.util}%` }} /></div><span className="text-xs w-8 text-right">{x.util}%</span></div></td><td className="text-right tabular-nums">{cr(x.waste)}</td></tr>)}</tbody>
          </table>
        </Card>
      </div>
      <Card title="Savings opportunities">
        <ol className="space-y-1.5 text-sm">{ops.slice(0, 7).map((o, k) => <li key={o.n} className="flex flex-wrap gap-x-3"><b className="w-5">{k + 1}.</b><span className="flex-1 min-w-0 text-ink">{o.n}</span><span className="text-xs text-ink-3">{o.owner}</span><b className="tabular-nums">{cr(o.v)}/yr</b></li>)}</ol>
        <p className="text-xs text-ink-3 mt-2">Savings assume 80% of cloud waste and 70% of licence waste is recoverable within a year.</p>
      </Card>
    </>
  )
}

// ── 4. Investment governance ─────────────────────────────────────────
export function InvestTab() {
  const [d, setD] = useState<DF>('all')
  const st = useDecisionState()
  const units = d === 'all' ? domainOrder : [d]
  const ins = units.flatMap((x) => sim[x].initiatives.map((i) => ({ i, d: x, c: investmentCase(i) })))
  const decisions = units.flatMap((x) => decisionsFor(sim[x]))
  const cases = decisions.filter((x) => !x.preset && x.investmentCr > 0 && st.statusOf(x) === 'Awaiting decision')
  const approved = decisions.filter((x) => st.statusOf(x) === 'Approved')
  const stages = [
    ['1 · Business case', cases.length, cases.reduce((a, x) => a + x.investmentCr, 0), 'decision cards asking for money'],
    ['2 · Approved & funded', ins.length, ins.reduce((a, x) => a + x.i.budgetCr, 0), 'initiatives with budget'],
    ['3 · In delivery', ins.filter((x) => x.i.progress < 100).length, ins.reduce((a, x) => a + x.i.forecastCr, 0), 'forecast at completion'],
    ['4 · Value tracking', ins.filter((x) => x.i.valueRealizedCr > 0).length, ins.reduce((a, x) => a + x.i.valueRealizedCr, 0), 'value realised so far'],
  ] as const
  return (
    <>
      <Filter v={d} on={setD} />
      <Card title="Stage-gate funnel · from business case to realised value" className="mb-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">{stages.map(([l, n, v, s], k) => (
          <div key={l} className="rounded-xl border border-line p-3" style={{ background: `rgba(37,99,235,${0.04 + k * 0.03})` }}>
            <div className="text-xs font-semibold text-ink-2">{l}</div><div className="text-2xl font-bold text-brand-900">{n}</div><div className="text-sm text-ink">{cr(v)}</div><div className="text-[11px] text-ink-3">{s}</div>
          </div>
        ))}</div>
      </Card>
      <Card title="Investment cases (5 years after build, 12% discount rate)" className="mb-5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[880px] [&_th]:px-2 [&_td]:px-2">
            <thead><tr className="text-[11px] uppercase tracking-wide text-ink-3 border-b border-line text-left"><th className="py-2">Initiative</th><th className="text-right">Budget</th><th className="text-right">Forecast</th><th className="text-right">NPV</th><th className="text-right">IRR</th><th className="text-right">Payback</th><th className="text-right">Value realised</th><th>Gate status</th></tr></thead>
            <tbody>{ins.sort((a, b) => b.c.npv - a.c.npv).map(({ i, d: x, c }) => (
              <tr key={i.id} className="border-b border-line last:border-0">
                <td className="py-1.5"><Link to={`/domain/${x}/record/${i.id}`} className="font-medium text-ink hover:underline">{i.name}</Link><div className="text-[11px] text-ink-3">{dn(x)} · {i.owner}</div></td>
                <td className="text-right tabular-nums">{cr(i.budgetCr)}</td>
                <td className={`text-right tabular-nums ${i.forecastCr > i.budgetCr * 1.05 ? 'text-crit-text font-semibold' : ''}`}>{cr(i.forecastCr)}</td>
                <td className="text-right tabular-nums font-semibold">{cr(c.npv)}</td>
                <td className="text-right tabular-nums">{c.irr === null ? '—' : `${c.irr}%`}</td>
                <td className="text-right tabular-nums">{c.paybackYears === null ? '—' : `${c.paybackYears} yr`}</td>
                <td className="text-right tabular-nums">{cr(i.valueRealizedCr)}</td>
                <td><StatusPill status={i.health} why={i.why} label={i.health === 'Green' ? 'Proceed' : i.health === 'Amber' ? 'Review at gate' : 'Re-baseline'} /></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
        <p className="text-xs text-ink-3 mt-2">Cash flows: build cost, then the planned 3-year benefit as an annual run-rate (÷ 3) ramping 40% → 80% → 100%, over 5 years, net of 10% run cost. NPV, IRR and payback are computed in the app; negative NPV means the case does not pay back on these assumptions. Security and compliance programmes (zero trust, OT security, DPDP) are risk-reduction investments — judge them on risk avoided, not NPV.</p>
      </Card>
      <Card title="Approval log">
        <ul className="divide-y divide-line text-sm">{approved.map((x) => (
          <li key={x.id} className="py-2 flex flex-wrap gap-x-3"><Link to={`/domain/${x.domain}/decisions#${x.id}`} className="font-medium text-ink hover:underline">{x.title}</Link><span className="text-xs text-ink-3">{dn(x.domain)} · {x.preset ? `approved ${x.preset.decidedOn} by ${x.preset.by}` : `approved ${st.verdicts[x.id]?.at} (this session)`}</span>{x.investmentCr > 0 && <b className="ml-auto tabular-nums">{cr(x.investmentCr)}</b>}</li>
        ))}</ul>
        <p className="text-xs text-ink-3 mt-2">Run cost reference: {units.map((x) => `${dn(x)} ${cr(runCostCr(x))}/yr`).join(' · ')}.</p>
      </Card>
    </>
  )
}
