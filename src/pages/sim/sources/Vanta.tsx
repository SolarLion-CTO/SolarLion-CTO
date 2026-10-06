import type { DomainData, Rag } from '../../../data/sim'
import { Card } from '../../../components/ui'
import { StatusPill, ragBg, ragText } from '../../../components/sim/primitives'
import { RecordTable } from '../../../components/sim/RecordTable'
import CyberTab from '../../domain/CyberTab'
import { NameCell, RecLink, Tabs } from '../common'
import { FunctionKpis } from './kpis'

type T = 'risks' | 'heatmap' | 'controls' | 'cyber'
const sevRag = (s: string): Rag => (s === 'Critical' ? 'Red' : s === 'High' ? 'Amber' : 'Green')

export default function Vanta({ d, tab, setTab }: { d: DomainData; tab: string; setTab: (t: string) => void }) {
  const t = (['risks', 'heatmap', 'controls', 'cyber'].includes(tab) ? tab : 'risks') as T
  const fws = [...new Set(d.controls.map((c) => c.framework))]
  return (
    <>
      <FunctionKpis d={d} fn="risk" />
      <div className="rounded-lg border border-line bg-slate-50 px-3 py-2 text-xs text-ink-2 mb-4">Continuous control <b>monitoring simulation</b> — this is not a compliance certification or audit opinion.</div>
      <Tabs<T> value={t} onChange={setTab} tabs={[
        { id: 'risks', label: 'Risk register', count: d.risks.length },
        { id: 'heatmap', label: 'Risk heatmap' },
        { id: 'controls', label: 'Controls', count: d.controls.length },
        { id: 'cyber', label: 'Cyber posture (programme view)' },
      ]} />
      {t === 'risks' && (
        <Card>
          <RecordTable label="risks" rows={d.risks} pageSize={10} minWidth={1180} cols={[
            { key: 'n', label: 'Risk', render: (r) => <NameCell d={d} id={r.id} name={r.name} sub={r.category} />, className: 'max-w-[260px]' },
            { key: 's', label: 'Severity', render: (r) => <StatusPill status={sevRag(r.severity)} label={r.severity} why={[r.origin]} />, sort: (r) => r.likelihood * r.impact },
            { key: 'li', label: 'L × I', align: 'center', render: (r) => <span className="text-xs">{r.likelihood} × {r.impact}</span> },
            { key: 'b', label: 'Business impact', render: (r) => <span className="text-xs text-ink-2">{r.businessImpact}</span>, className: 'max-w-[200px]' },
            { key: 'o', label: 'Owner', render: (r) => <span className="text-xs">{r.owner}</span> },
            { key: 'm', label: 'Mitigation', render: (r) => <span className="text-xs">{r.mitigation}</span>, className: 'max-w-[200px]' },
            { key: 'd', label: 'Due', render: (r) => <span className="text-xs whitespace-nowrap">{r.due}</span>, sort: (r) => r.due },
            { key: 'a', label: 'Age', align: 'right', render: (r) => <span className={`text-xs ${r.openedDays > 90 ? 'text-warn-text font-semibold' : ''}`}>{r.openedDays} d</span>, sort: (r) => r.openedDays },
            { key: 'l', label: 'Linked', render: (r) => <span className="text-xs flex flex-col">{r.appId && <RecLink d={d} id={r.appId} />}{r.initiativeId && <RecLink d={d} id={r.initiativeId} />}{r.controlIds.map((c) => <RecLink key={c} d={d} id={c} />)}</span> },
          ]} />
        </Card>
      )}
      {t === 'heatmap' && (
        <Card title="Risk heatmap — likelihood × impact">
          <div className="grid grid-cols-[auto_repeat(5,minmax(0,1fr))] gap-1 max-w-2xl">
            {[5, 4, 3, 2, 1].map((L) => [
              <div key={`l${L}`} className="text-xs text-ink-3 pr-2 flex items-center justify-end">L{L}</div>,
              ...[1, 2, 3, 4, 5].map((I) => {
                const rs = d.risks.filter((r) => r.likelihood === L && r.impact === I)
                const sc = L * I
                const tone: Rag = sc >= 20 ? 'Red' : sc >= 12 ? 'Amber' : 'Green'
                return (
                  <div key={`${L}-${I}`} className={`rounded-md border min-h-[56px] p-1.5 ${rs.length ? ragBg[tone] : 'bg-slate-50 border-line'}`} title={rs.map((r) => `${r.id} ${r.name}`).join('\n')}>
                    {rs.length > 0 && <div className={`text-lg font-bold ${ragText[tone]}`}>{rs.length}</div>}
                    <div className="flex flex-wrap gap-x-1">{rs.slice(0, 3).map((r) => <RecLink key={r.id} d={d} id={r.id} className="text-[10px] text-ink-2">{r.id.split('-').pop()}</RecLink>)}</div>
                  </div>
                )
              }),
            ])}
            <div />
            {[1, 2, 3, 4, 5].map((I) => <div key={I} className="text-xs text-ink-3 text-center">I{I}</div>)}
          </div>
          <p className="text-xs text-ink-3 mt-3">Severity = likelihood × impact: 20+ critical, 12+ high, 6+ medium. Hover a cell for the risks in it.</p>
        </Card>
      )}
      {t === 'controls' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-4">{fws.map((f) => {
            const cs = d.controls.filter((c) => c.framework === f)
            const ok = cs.filter((c) => c.controlStatus === 'Passing').length
            const tone: Rag = ok === cs.length ? 'Green' : ok / cs.length >= 0.75 ? 'Amber' : 'Red'
            return <div key={f} className={`rounded-xl border p-3 ${ragBg[tone]}`}><div className="text-xs font-medium text-ink-2">{f}</div><div className={`text-xl font-bold ${ragText[tone]}`}>{ok} / {cs.length}</div><div className="text-[11px] text-ink-3">controls passing</div></div>
          })}</div>
          <Card>
            <RecordTable label="controls" rows={d.controls} pageSize={10} minWidth={980} cols={[
              { key: 'n', label: 'Control', render: (c) => <NameCell d={d} id={c.id} name={c.control} sub={c.framework} />, className: 'max-w-[300px]' },
              { key: 'o', label: 'Owner', render: (c) => <span className="text-xs">{c.owner}</span> },
              { key: 's', label: 'Status', render: (c) => <StatusPill status={c.health} why={c.why} label={c.controlStatus} /> },
              { key: 'e', label: 'Evidence', render: (c) => <span className="text-xs">{c.evidence}</span> },
              { key: 't', label: 'Last tested', render: (c) => <span className="text-xs">{c.lastTested}</span>, sort: (c) => c.lastTested },
              { key: 'r', label: 'Next review', render: (c) => <span className="text-xs">{c.nextReview}</span>, sort: (c) => c.nextReview },
              { key: 'x', label: 'Exceptions', align: 'right', render: (c) => c.exceptions, sort: (c) => c.exceptions },
              { key: 'a', label: 'Applications', render: (c) => <span className="text-xs flex flex-wrap gap-x-1">{c.appIds.map((a) => <RecLink key={a} d={d} id={a} />)}</span> },
            ]} />
          </Card>
        </>
      )}
      {t === 'cyber' && <CyberTab domainId={d.domain} />}
    </>
  )
}
