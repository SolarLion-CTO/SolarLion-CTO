// Real-data panels: public datasets that sit next to the simulation as a reality check.
// Data: src/data/real/*.json, produced by scripts/real-data/process_real_data.py (sources in data/real/SOURCES.md).
import { Link } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'
import { Card } from '../ui'
import type { DomainData } from '../../data/sim'
import eol from '../../data/real/eol.json'
import kev from '../../data/real/kev.json'
import rbi from '../../data/real/rbi.json'
import fraud from '../../data/real/fraud.json'
import incidents from '../../data/real/incidents.json'
import focus from '../../data/real/focus.json'

const fmtDate = (iso: string | null) => iso ? new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
const n = (x: number) => x.toLocaleString('en-IN')

export function RealBadge({ source, url, fetched, licence }: { source: string; url: string; fetched: string; licence?: string }) {
  return (
    <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[11px] rounded-full border border-green-200 bg-success-bg text-success-text px-2 py-0.5 hover:underline max-w-full">
      <span className="font-bold tracking-wide">REAL DATA</span><span className="truncate">· {source} · fetched {fmtDate(fetched)}{licence ? ` · ${licence}` : ''}</span><ExternalLink size={11} className="shrink-0" />
    </a>
  )
}

function Head({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="flex flex-wrap items-center justify-between gap-2 mb-3"><h3 className="font-semibold text-ink">{title}</h3>{children}</div>
}
function Stat({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: 'crit' | 'warn' | 'ok' }) {
  const c = tone === 'crit' ? 'text-crit-text' : tone === 'warn' ? 'text-warn-text' : tone === 'ok' ? 'text-success-text' : 'text-ink'
  return <div className="rounded-lg border border-line p-3 min-w-0"><div className="text-[11px] text-ink-3">{label}</div><div className={`text-xl font-bold tabular-nums ${c}`}>{value}</div>{sub && <div className="text-[11px] text-ink-3">{sub}</div>}</div>
}
function HBars({ rows, unit = '', max }: { rows: { name: string; value: number; note?: string }[]; unit?: string; max?: number }) {
  const m = max ?? Math.max(...rows.map((r) => r.value), 1)
  return (
    <ul className="space-y-1.5">{rows.map((r) => (
      <li key={r.name} className="text-xs">
        <div className="flex justify-between gap-2"><span className="text-ink-2 truncate">{r.name}</span><span className="tabular-nums text-ink shrink-0">{r.value.toLocaleString('en-IN', { maximumFractionDigits: 1 })}{unit}{r.note ? <span className="text-ink-3"> · {r.note}</span> : null}</span></div>
        <div className="h-2 rounded bg-slate-100 mt-0.5"><div className="h-2 rounded bg-brand-600" style={{ width: `${Math.max(1, (r.value / m) * 100)}%` }} /></div>
      </li>
    ))}</ul>
  )
}
const pill = (tone: 'crit' | 'warn' | 'ok', text: string) => <span className={`text-[11px] rounded-full px-2 py-0.5 whitespace-nowrap ${tone === 'crit' ? 'bg-crit-bg text-crit-text' : tone === 'warn' ? 'bg-warn-bg text-warn-text' : 'bg-success-bg text-success-text'}`}>{text}</span>

// ── LeanIX · Technology lifecycle: simulated EOL dates vs endoflife.date ──
export function EolReality({ d }: { d?: DomainData }) {
  const ours = d ? new Set(d.technologies.map((t) => t.name)) : null   // simulated names include the version
  const rows = eol.rows.filter((r) => !ours || ours.has(`${r.name} ${r.version}`))
  if (!rows.length) return null
  const past = rows.filter((r) => r.status === 'End of life').length
  const extMatch = (r: (typeof rows)[number]) => !!r.simEol && r.simEol === r.extendedSupport   // simulation used the paid extended-support date
  const optimistic = rows.filter((r) => r.diffDays !== null && r.diffDays < -30 && !extMatch(r)).length
  return (
    <Card className="mt-5">
      <Head title="Reality check · real end-of-life dates"><RealBadge source="endoflife.date" url="https://endoflife.date" fetched={eol.fetched} /></Head>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <Stat label="Technologies matched to real products" value={`${rows.length}`} sub={d ? `in ${d.org}` : 'across all business units'} />
        <Stat label="Already past real end of life" value={`${past}`} tone={past ? 'crit' : 'ok'} sub="vendor standard support ended" />
        <Stat label="Simulation more optimistic than reality" value={`${optimistic}`} tone={optimistic ? 'warn' : 'ok'} sub="real EOL earlier by > 30 days" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[680px]">
          <thead><tr className="text-left text-xs text-ink-3 border-b border-line"><th className="py-2 pr-3 font-medium">Technology</th><th className="py-2 pr-3 font-medium">Simulated EOL</th><th className="py-2 pr-3 font-medium">Real EOL</th><th className="py-2 pr-3 font-medium">Extended support</th><th className="py-2 font-medium">Real status</th></tr></thead>
          <tbody>{rows.map((r) => (
            <tr key={`${r.name}${r.version}`} className="border-b border-line last:border-0">
              <td className="py-2 pr-3"><a href={r.url} target="_blank" rel="noreferrer" className="font-medium text-ink hover:underline">{r.name} {r.version}</a></td>
              <td className="py-2 pr-3 whitespace-nowrap text-ink-2">{fmtDate(r.simEol)}</td>
              <td className="py-2 pr-3 whitespace-nowrap">{fmtDate(r.realEol)}{extMatch(r) ? <span className="block text-[11px] text-ink-3">simulation uses the extended-support date</span> : r.diffDays !== null && Math.abs(r.diffDays) > 30 && <span className={`block text-[11px] ${r.diffDays < 0 ? 'text-crit-text' : 'text-ink-3'}`}>{r.diffDays < 0 ? `${n(-r.diffDays)} days earlier than simulated` : `${n(r.diffDays)} days later`}</span>}</td>
              <td className="py-2 pr-3 whitespace-nowrap text-ink-2">{fmtDate(r.extendedSupport)}</td>
              <td className="py-2">{pill(r.status === 'End of life' ? 'crit' : r.status === 'Supported' ? 'ok' : 'warn', r.status)}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      <p className="text-xs text-ink-3 mt-3">The simulated estate keeps its own dates (they drive the demo scores). This panel shows the real vendor lifecycle for the same product versions; where the simulation is more optimistic, the real risk is higher.</p>
    </Card>
  )
}

// ── Vanta · Cyber: CISA Known Exploited Vulnerabilities ──
export function KevPanel() {
  return (
    <Card className="mt-5">
      <Head title="Reality check · vulnerabilities exploited in the wild"><RealBadge source="CISA KEV catalog" url="https://www.cisa.gov/known-exploited-vulnerabilities-catalog" fetched={kev.fetched} licence={`v${kev.catalogVersion}`} /></Head>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <Stat label="Known exploited CVEs (catalogue)" value={n(kev.total)} />
        <Stat label="Added in the last 90 days" value={n(kev.last90)} tone="warn" sub={`${kev.last30} in the last 30 days`} />
        <Stat label="Used in ransomware campaigns" value={n(kev.ransomware)} tone="crit" sub={`${Math.round((kev.ransomware / kev.total) * 100)}% of the catalogue`} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div><div className="text-xs font-semibold text-ink-2 mb-2">Vendors in our simulated stack</div>
          <HBars rows={kev.ourStack.map((v) => ({ name: v.vendor, value: v.count, note: `${v.last90} new in 90 d` }))} /></div>
        <div><div className="text-xs font-semibold text-ink-2 mb-2">Latest additions</div>
          <ul className="divide-y divide-line">{kev.latest.slice(0, 6).map((k) => (
            <li key={k.cve} className="py-1.5 text-xs flex gap-2 items-start"><a href={`https://nvd.nist.gov/vuln/detail/${k.cve}`} target="_blank" rel="noreferrer" className="font-mono text-brand-600 hover:underline shrink-0">{k.cve}</a>
              <span className="min-w-0 flex-1 text-ink-2"><b className="text-ink">{k.vendor}</b> {k.product}<span className="text-ink-3"> · added {fmtDate(k.added)} · fix by {fmtDate(k.due)}</span></span>{k.ransomware && pill('crit', 'Ransomware')}</li>
          ))}</ul></div>
      </div>
      <p className="text-xs text-ink-3 mt-3">US federal agencies must patch catalogue entries by the due date; it is a widely used benchmark for prioritising patching. Simulated risks above stay unchanged.</p>
    </Card>
  )
}

// ── Vaibhav · Regulatory change: real RBI notifications ──
export function RbiFeed() {
  return (
    <Card className="mt-5">
      <Head title={`Real RBI notifications · ${fmtDate(rbi.from)} to ${fmtDate(rbi.to)}`}><RealBadge source="Reserve Bank of India" url={rbi.url} fetched={rbi.fetched} /></Head>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-5">
        <div>
          <Stat label="Notifications issued in the window" value={`${rbi.count}`} sub={`about ${(rbi.count / 2).toFixed(0)} a week; each needs triage`} />
          <div className="text-xs font-semibold text-ink-2 mt-4 mb-2">By theme (keyword classification)</div>
          <HBars rows={rbi.themes.map((t) => ({ name: t.theme, value: t.count }))} />
        </div>
        <ul className="divide-y divide-line">{rbi.items.slice(0, 10).map((i) => (
          <li key={i.id} className="py-2 text-sm flex gap-3 items-start">
            <span className="text-xs text-ink-3 w-20 shrink-0 tabular-nums">{fmtDate(i.date)}</span>
            <span className="min-w-0 flex-1"><a href={i.url} target="_blank" rel="noreferrer" className="text-ink hover:underline">{i.title}</a>
              <span className="block mt-0.5 text-[11px] text-ink-3">{i.theme}{i.ctoRelevant && <span className="ml-1.5 rounded bg-brand-50 text-brand-900 px-1">Technology / reporting impact</span>}{i.pdf && <> · <a href={i.pdf} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">PDF</a></>}</span></span>
          </li>
        ))}</ul>
      </div>
      <p className="text-xs text-ink-3 mt-3">Real titles, dates and links from rbi.org.in. The obligation → control mapping in the flow above remains simulated; in production this feed would be the intake step.</p>
    </Card>
  )
}

// ── Vaibhav · AI model register: real drift on a real fraud dataset ──
export function FraudDrift() {
  const band = (p: number) => p > 0.25 ? pill('crit', 'Drift · revalidate') : p > 0.1 ? pill('warn', 'Watch') : pill('ok', 'Stable')
  const maxH = Math.max(...fraud.hourlyFraudRatePct)
  return (
    <Card className="mt-5">
      <Head title="Reality check · PSI drift on real card transactions"><RealBadge source="Kaggle · ULB credit card fraud" url={fraud.url} fetched={fraud.fetched} licence={fraud.licence} /></Head>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <Stat label="Real transactions (2 days, Europe)" value={n(fraud.transactions)} sub={`${n(fraud.frauds)} frauds · ${fraud.fraudRatePct}%`} />
        <Stat label="Max PSI, day 1 → day 2 (normal)" value={fraud.maxPsiDay2.toFixed(2)} tone={fraud.maxPsiDay2 > 0.25 ? 'crit' : fraud.maxPsiDay2 > 0.1 ? 'warn' : 'ok'} sub="ordinary day-to-day shift" />
        <Stat label="PSI in attack hours (feature V14)" value={fraud.psiAttackV14.toFixed(2)} tone="crit" sub={`fraud rate ${fraud.attackFraudRatePct}% vs ${fraud.fraudRatePct}% normal`} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-xs text-ink-3 border-b border-line"><th className="py-1.5 font-medium">Feature</th><th className="py-1.5 font-medium text-right">PSI day 1 → 2</th><th className="py-1.5 font-medium text-right">Band</th></tr></thead>
          <tbody>{fraud.psiDay1vsDay2.map((p) => <tr key={p.feature} className="border-b border-line last:border-0"><td className="py-1.5">{p.feature}</td><td className="py-1.5 text-right tabular-nums">{p.psi.toFixed(3)}</td><td className="py-1.5 text-right">{band(p.psi)}</td></tr>)}</tbody>
        </table>
        <div><div className="text-xs font-semibold text-ink-2 mb-2">Fraud rate by hour (48 h) · attack hours highlighted</div>
          <svg viewBox="0 0 480 110" className="w-full h-28" role="img" aria-label="Hourly fraud rate over 48 hours">
            {fraud.hourlyFraudRatePct.map((v, i) => { const h = (v / maxH) * 92; const hot = fraud.attackHours.includes(i); return <rect key={i} x={i * 10 + 1} y={100 - h} width={8} height={Math.max(h, 1)} rx={1.5} fill={hot ? '#dc2626' : '#2563eb'}><title>{`Hour ${i}: ${v}%`}</title></rect> })}
            <line x1={0} y1={100} x2={480} y2={100} stroke="#cbd5e1" /><text x={2} y={109} fontSize={8} fill="#64748b">Day 1</text><text x={242} y={109} fontSize={8} fill="#64748b">Day 2</text>
          </svg></div>
      </div>
      <p className="text-xs text-ink-3 mt-3">PSI bands: below 0.10 stable, 0.10–0.25 watch, above 0.25 drift. On real data the population is stable day to day, but during fraud waves the key feature shifts sharply, which is exactly when the simulated fraud model (PSI 0.37) would be restricted. Features V1–V28 are PCA-anonymised by the data provider.</p>
    </Card>
  )
}

// ── Pankaj · ERP RCA: real incident log ──
export function IncidentReality() {
  const top = incidents.pareto
  return (
    <Card className="mt-5">
      <Head title="Reality check · Pareto on a real ServiceNow incident log"><RealBadge source="UCI · incident event log" url={incidents.url} fetched={incidents.fetched} licence="CC BY 4.0" /></Head>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <Stat label="Real incidents" value={n(incidents.incidents)} sub={`${n(incidents.events)} events · ${fmtDate(incidents.period[0])} to ${fmtDate(incidents.period[1])}`} />
        <Stat label="Top 20% of categories cause" value={`${incidents.top20pctCatsSharePct}%`} tone="warn" sub={`of incidents (${incidents.categories} categories)`} />
        <Stat label="SLA met" value={`${incidents.slaMetPct}%`} tone={incidents.slaMetPct < 80 ? 'warn' : 'ok'} sub={`median resolve ${incidents.medianResolveHours} h`} />
        <Stat label="Linked to a problem record" value={`${incidents.linkedToProblemPct}%`} tone="crit" sub="root cause rarely tracked" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div><div className="text-xs font-semibold text-ink-2 mb-2">Top 8 categories (cumulative share)</div>
          <HBars rows={top.map((p) => ({ name: p.category, value: p.count, note: `${p.cumPct}% cum.` }))} /></div>
        <div><div className="text-xs font-semibold text-ink-2 mb-2">Median time to resolve by priority</div>
          <HBars rows={incidents.medianResolveHoursByPriority.map((p) => ({ name: p.priority, value: p.hours, note: `${n(p.count)} incidents` }))} unit=" h" /></div>
      </div>
      <p className="text-xs text-ink-3 mt-3">The 80/20 pattern holds on real data: {incidents.top20pctCatsSharePct}% of incidents come from 20% of categories. Only {incidents.linkedToProblemPct}% of incidents were linked to a problem record, which is the gap ITIL problem management and the 5 Whys above are meant to close. Categories are anonymised by the data provider.</p>
    </Card>
  )
}

// ── Santhosh · FinOps: real (anonymised) cloud billing in FOCUS format ──
export function FocusReality() {
  const total = focus.effectiveCost
  const untagged = Math.round((100 - (focus.allocatedPct ?? 0)) * 10) / 10
  return (
    <Card className="mt-5">
      <Head title="Reality check · allocation on real cloud billing (FOCUS 1.0)"><RealBadge source="FinOps Foundation · FOCUS sample" url={focus.url} fetched={focus.fetched} licence={focus.licence} /></Head>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <Stat label="Billing lines analysed (usage)" value={n(focus.rows)} sub={`AWS, Microsoft, Oracle · ${focus.currency} ${n(Math.round(total))}`} />
        <Stat label="Cost fully allocatable (tagged)" value={`${focus.allocatedPct}%`} tone={(focus.allocatedPct ?? 0) < 80 ? 'warn' : 'ok'} sub={`${untagged}% cannot be traced to an app or business unit`} />
        <Stat label="Covered by commitment discounts" value={`${focus.commitmentCoveredPct}%`} tone="warn" sub="reserved / savings-plan coverage" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div><div className="text-xs font-semibold text-ink-2 mb-2">By service category ({focus.currency})</div><HBars rows={focus.byCategory.filter((c) => c.cost >= 0.5).map((c) => ({ name: c.name, value: c.cost }))} /></div>
        <div><div className="text-xs font-semibold text-ink-2 mb-2">By provider ({focus.currency})</div><HBars rows={focus.byProvider.map((c) => ({ name: c.name, value: c.cost }))} /></div>
      </div>
      <p className="text-xs text-ink-3 mt-3">FOCUS is the FinOps Foundation's open billing standard. The same "allocated to services" measure drives the simulated TBM figure (72%); on this real sample {focus.allocatedPct}% is allocatable. Amounts are anonymised and small by design.</p>
    </Card>
  )
}

// ── Data sources page / About: list of real sources ──
export const REAL_SOURCES = [
  { name: 'endoflife.date', what: 'Real vendor end-of-life dates for 20 technology versions in the simulated estate', where: 'Enterprise Architecture (LeanIX) → Technology lifecycle', to: '/domain/banking/leanix?tab=tech', url: 'https://endoflife.date', licence: 'Free public API', fetched: eol.fetched },
  { name: 'CISA Known Exploited Vulnerabilities', what: `${n(kev.total)} CVEs exploited in the wild, with ransomware use and due dates`, where: 'Security, Risk & Governance (Vanta) → Cyber', to: '/domain/banking/vanta?tab=cyber', url: 'https://www.cisa.gov/known-exploited-vulnerabilities-catalog', licence: 'US Government, public', fetched: kev.fetched },
  { name: 'Reserve Bank of India notifications', what: `${rbi.count} real notifications (${fmtDate(rbi.from)} to ${fmtDate(rbi.to)}) with themes and links`, where: 'Vaibhav → Regulatory change', to: '/team/vaibhav?tab=regulatory', url: rbi.url, licence: 'Public RBI website', fetched: rbi.fetched },
  { name: 'Kaggle · ULB credit card fraud', what: `${n(fraud.transactions)} real card transactions; PSI drift computed on real features`, where: 'Vaibhav → AI model register', to: '/team/vaibhav?tab=models', url: fraud.url, licence: fraud.licence, fetched: fraud.fetched },
  { name: 'UCI · incident management event log', what: `${n(incidents.incidents)} real incidents from a ServiceNow instance; Pareto, SLA, time to resolve`, where: 'Pankaj → ERP RCA', to: '/team/pankaj?tab=erp', url: incidents.url, licence: 'CC BY 4.0', fetched: incidents.fetched },
  { name: 'FinOps Foundation · FOCUS sample', what: `${n(focus.rows)} anonymised real cloud billing lines; allocation and commitment coverage`, where: 'Santhosh → FinOps & licences', to: '/team/santhosh?tab=finops', url: focus.url, licence: focus.licence, fetched: focus.fetched },
]

export function RealSourcesCard() {
  return (
    <Card title="Real data used alongside the simulation">
      <p className="text-sm text-ink-2 mb-3">Six public datasets act as a reality check next to the simulated views. Each panel is labelled <span className="font-semibold text-success-text">REAL DATA</span> with its source and fetch date; the simulated figures and scores are unchanged.</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[760px]">
          <thead><tr className="text-left text-xs text-ink-3 border-b border-line"><th className="py-2 pr-3 font-medium">Source</th><th className="py-2 pr-3 font-medium">What it adds</th><th className="py-2 pr-3 font-medium">Where in CTO360</th><th className="py-2 font-medium">Licence · fetched</th></tr></thead>
          <tbody>{REAL_SOURCES.map((s) => (
            <tr key={s.name} className="border-b border-line last:border-0 align-top">
              <td className="py-2 pr-3"><a href={s.url} target="_blank" rel="noreferrer" className="font-medium text-ink hover:underline">{s.name}</a></td>
              <td className="py-2 pr-3 text-ink-2">{s.what}</td>
              <td className="py-2 pr-3"><Link to={s.to} className="text-brand-600 hover:underline">{s.where}</Link></td>
              <td className="py-2 text-xs text-ink-3 whitespace-nowrap">{s.licence}<br />{fmtDate(s.fetched)}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </Card>
  )
}
