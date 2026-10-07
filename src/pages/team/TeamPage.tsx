// /team — the capstone problem statement, the team's transformation scorecard, the golden thread,
// accountability (RACI) and BP1 coverage.
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Target } from 'lucide-react'
import { OWNERS, ownerState } from '../../data/sim/team'
import type { OwnerId } from '../../data/sim/team'
import { sim } from '../../data/sim'
import { buildEvents } from '../../data/sim/events'
import { ragOf } from '../../data/sim/scoring'
import { Card } from '../../components/ui'
import { ScoreRing } from '../../components/sim/primitives'
import { GlidePill, GoldenThread } from '../../components/team/workspace'
import { hhmm, useSimClock } from '../../components/sim/clock'
import { KotterAdkar } from './FrameworkTabs'

type R = 'A' | 'R' | 'C' | 'I' | 'A/R' | ''
const RACI: [string, Record<OwnerId, R>][] = [
  ['Multi-domain framework', { ram: 'A/R', suman: 'C', vaibhav: 'C', santhosh: 'C', pankaj: 'C' }],
  ['Decision intelligence & agents', { ram: 'A/R', suman: 'C', vaibhav: 'C', santhosh: 'C', pankaj: 'C' }],
  ['AI transformation (any organisation)', { ram: 'C', suman: 'A/R', vaibhav: 'C', santhosh: 'C', pankaj: 'I' }],
  ['ROI & benefits realisation', { ram: 'I', suman: 'A/R', vaibhav: 'I', santhosh: 'C', pankaj: 'I' }],
  ['Regulatory automation (Banking)', { ram: 'I', suman: 'I', vaibhav: 'A/R', santhosh: 'I', pankaj: 'I' }],
  ['AI & data governance (DPDP)', { ram: 'C', suman: 'C', vaibhav: 'A/R', santhosh: 'I', pankaj: 'I' }],
  ['CAPEX / OPEX & investment governance', { ram: 'C', suman: 'C', vaibhav: 'I', santhosh: 'A/R', pankaj: 'I' }],
  ['ERP root-cause analysis', { ram: 'I', suman: 'I', vaibhav: 'I', santhosh: 'I', pankaj: 'A/R' }],
  ['Infrastructure capacity planning', { ram: 'C', suman: 'I', vaibhav: 'I', santhosh: 'C', pankaj: 'A/R' }],
  ['Production management automation', { ram: 'I', suman: 'C', vaibhav: 'I', santhosh: 'I', pankaj: 'A/R' }],
]
const raciCls: Record<string, string> = { 'A/R': 'bg-brand-600 text-white', A: 'bg-brand-600 text-white', R: 'bg-brand-100 text-brand-900', C: 'bg-slate-100 text-ink-2', I: 'text-ink-4', '': '' }

export default function TeamPage() {
  const states = OWNERS.map(ownerState)
  const overall = Math.round(states.reduce((s, x) => s + x.score, 0) / states.length)
  const all = states.flatMap((s) => s.measures)
  const { now } = useSimClock()
  const events = useMemo(() => Object.values(sim).flatMap((d) => buildEvents(d).map((e) => ({ ...e, domain: d.domain }))), [])
  const feed = events.filter((e) => e.at <= now).sort((a, b) => b.at - a.at).slice(0, 8)
  const owners = ['ram', 'suman', 'vaibhav', 'santhosh', 'pankaj'] as OwnerId[]
  return (
    <>
      <section className="rounded-xl bg-brand-950 text-white p-5 mb-5">
        <div className="text-xs uppercase tracking-wide text-accent font-semibold flex items-center gap-1.5"><Target size={14} />Capstone problem statement</div>
        <p className="text-[17px] sm:text-[19px] leading-snug mt-2 max-w-5xl">
          Enterprises investing in AI-led transformation cannot <b>see, govern, fund and run</b> it as one system. Strategy and ROI, regulation and AI governance, spend and operations sit with different people and tools — so AI stalls in pilots, risk goes unmanaged, spend is not tied to value and operations firefight.
        </p>
        <p className="text-sm text-slate-300 mt-2 max-w-5xl">CTO360 simulates a real enterprise across three business units and shows a CTO-led team moving each area from its <b className="text-white">current state to its target state, measurably</b> — AI recommends, humans decide.</p>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-5">
        <Card title="Transformation scorecard · old state → target state" className="xl:col-span-2">
          <div className="flex flex-wrap items-center gap-5 mb-4">
            <ScoreRing score={overall} status={ragOf(overall + 20)} size={80} label="Team transformation progress" />
            <div><div className="text-2xl font-bold text-brand-900">{overall}% transformed</div><div className="text-sm text-ink-2">Average share of the gap closed since Nov 2025 across {all.length} measures</div>
              <div className="flex gap-2 mt-2 text-xs"><GlidePill g="Ahead" /><b>{all.filter((m) => m.glide === 'Ahead').length}</b><GlidePill g="On track" /><b>{all.filter((m) => m.glide === 'On track').length}</b><GlidePill g="Behind" /><b>{all.filter((m) => m.glide === 'Behind').length}</b></div></div>
          </div>
          <ul className="space-y-3">{states.map((s) => (
            <li key={s.owner.id} className="grid grid-cols-[minmax(0,15rem)_1fr_auto] gap-3 items-center">
              <Link to={`/team/${s.owner.id}`} className="min-w-0 hover:underline"><div className="font-semibold text-ink text-sm truncate">{s.owner.workspace} · {s.owner.name}</div><div className="text-[11px] text-ink-3 truncate">{s.owner.role}</div></Link>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden" role="img" aria-label={`${s.score}% transformed`}><div className="h-full bg-brand-600 rounded-full" style={{ width: `${s.score}%` }} /></div>
              <div className="text-xs text-ink-3 w-36 text-right"><b className="text-ink text-sm">{s.score}%</b> · {s.ahead}▲ {s.onTrack}● {s.behind}▼</div>
            </li>
          ))}</ul>
        </Card>
        <Card title="Team pulse · live">
          <ul className="text-[12.5px] divide-y divide-line">{feed.map((e) => (
            <li key={e.id} className="py-1.5 flex gap-2 min-w-0"><span className="text-ink-4 tabular-nums shrink-0">{hhmm(e.at).slice(0, 5)}</span><span className={`w-1.5 h-1.5 mt-1.5 rounded-full shrink-0 ${e.tone === 'crit' ? 'bg-crit' : e.tone === 'warn' ? 'bg-warn' : e.tone === 'ok' ? 'bg-ok' : 'bg-brand-600'}`} /><Link to={`/domain/${e.domain}/record/${e.recordId}`} className="truncate text-ink-2 hover:underline" title={e.text}>{e.text}</Link></li>
          ))}</ul>
        </Card>
      </div>

      <Card title="The golden thread · live" className="mb-5"><GoldenThread compact /></Card>

      <h2 className="text-[17px] font-semibold text-ink mb-2">Change & adoption <span className="text-xs font-normal text-ink-3">· Kotter (organisation) + ADKAR (people) + Lewin</span></h2>
      <div className="mb-5"><KotterAdkar /></div>

      <div className="grid grid-cols-1 2xl:grid-cols-2 gap-5">
        <Card title="Accountability (RACI)" className="min-w-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[560px] border-separate border-spacing-1">
              <thead><tr className="text-[11px] uppercase tracking-wide text-ink-3"><th className="text-left font-semibold">Workstream</th>{owners.map((o) => <th key={o} className="font-semibold"><Link to={`/team/${o}`} className="hover:underline">{OWNERS.find((x) => x.id === o)!.name}</Link></th>)}</tr></thead>
              <tbody>{RACI.map(([w, r]) => (
                <tr key={w}><td className="text-ink pr-2">{w}</td>{owners.map((o) => <td key={o} className={`text-center text-xs font-bold rounded-md py-1 ${raciCls[r[o]]}`}>{r[o]}</td>)}</tr>
              ))}</tbody>
            </table>
          </div>
          <p className="text-xs text-ink-3 mt-2">A = accountable, R = responsible, C = consulted, I = informed.</p>
        </Card>
        <Card title="BP1 problems → where they are solved" className="min-w-0">
          <ul className="divide-y divide-line text-sm">{OWNERS.flatMap((o) => o.bp1.map((b, i) => (
            <li key={o.id + i} className="py-2 grid grid-cols-[5.5rem_minmax(0,1fr)] gap-x-3">
              <span className="font-semibold text-ink">{o.name}</span>
              <div className="min-w-0">
                <div className="text-ink-2">{b}</div>
                <div className="flex flex-wrap items-center gap-2 mt-0.5">
                  <Link to={`/team/${o.id}`} className="text-xs text-brand-600 font-semibold hover:underline">{o.workspace} →</Link>
                  <span className="text-[11px] rounded px-1.5 py-0.5 border bg-success-bg text-success-text border-green-200">Built · tracked live</span>
                </div>
              </div>
            </li>
          )))}</ul>
          <p className="text-xs text-ink-3 mt-2">Source: team notes of 20 Sep 2026 (bp1.jpeg).</p>
        </Card>
      </div>
    </>
  )
}
