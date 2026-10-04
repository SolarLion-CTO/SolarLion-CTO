import { dataIssues, dataSources } from '../../data/cto'
import type { Integration } from '../../data/cto'
import { domains } from '../../data/domains'
import { useStore } from '../../store'
import DomainSwitch from '../../components/DomainSwitch'
import { Card, PageHeader } from '../../components/ui'

const integTone: Record<Integration, string> = { 'MCP live': 'bg-emerald-600 text-white', 'MCP in test': 'bg-blue-600 text-white', 'Batch only': 'bg-amber-400 text-slate-900', Planned: 'bg-slate-200 text-slate-600' }
const classTone: Record<string, string> = { Public: 'bg-emerald-50 text-emerald-700', Internal: 'bg-blue-50 text-blue-700', Confidential: 'bg-amber-50 text-amber-700', Restricted: 'bg-red-50 text-red-700' }
const q = (v: number) => (v >= 90 ? 'text-emerald-700' : v >= 75 ? 'text-amber-600' : 'text-red-600')

export default function Data() {
  const { domainId } = useStore()
  const src = dataSources[domainId]
  const quality = (s: (typeof src)[number]) => Math.round((s.completeness + s.accuracy + s.timeliness) / 3)
  const readiness = Math.round(src.reduce((a, s) => a + quality(s), 0) / src.length)
  const integrated = src.filter((s) => s.integration === 'MCP live').length
  const restricted = src.filter((s) => s.classification === 'Restricted').length

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <PageHeader title="Data Readiness" subtitle={`Is ${domains[domainId].name} data ready for AI? Quality, ownership, classification and integration`} owner="Ram · data owners" />
        <div className="mb-6"><DomainSwitch /></div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card><div className="text-[11px] uppercase text-slate-500 font-semibold">Data readiness score</div><div className={`text-3xl font-extrabold ${q(readiness)}`}>{readiness}%</div><div className="text-xs text-slate-500">avg of completeness, accuracy, timeliness</div></Card>
        <Card><div className="text-[11px] uppercase text-slate-500 font-semibold">Sources mapped</div><div className="text-3xl font-extrabold">{src.length}</div><div className="text-xs text-slate-500">each with a named owner</div></Card>
        <Card><div className="text-[11px] uppercase text-slate-500 font-semibold">Integrated via MCP</div><div className="text-3xl font-extrabold text-blue-700">{integrated} / {src.length}</div><div className="text-xs text-slate-500">live, governed connectors</div></Card>
        <Card><div className="text-[11px] uppercase text-slate-500 font-semibold">Restricted sources</div><div className="text-3xl font-extrabold text-red-600">{restricted}</div><div className="text-xs text-slate-500">local LLM only · no egress</div></Card>
      </div>

      <Card title="Source inventory" className="mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[860px]">
            <thead><tr className="text-[11px] uppercase text-slate-500 border-b text-left"><th className="py-2">Source</th><th>Type</th><th>Owner</th><th>Classification</th><th className="text-center">Complete</th><th className="text-center">Accurate</th><th className="text-center">Timely</th><th>Integration</th><th>Feeds</th></tr></thead>
            <tbody>
              {src.map((s) => (
                <tr key={s.source} className="border-b last:border-0">
                  <td className="py-2 font-semibold">{s.source}</td><td className="text-xs">{s.kind}</td><td className="text-xs text-slate-500">{s.owner}</td>
                  <td><span className={`text-[11px] font-semibold rounded px-1.5 py-0.5 ${classTone[s.classification]}`}>{s.classification}</span></td>
                  <td className={`text-center font-semibold ${q(s.completeness)}`}>{s.completeness}%</td>
                  <td className={`text-center font-semibold ${q(s.accuracy)}`}>{s.accuracy}%</td>
                  <td className={`text-center font-semibold ${q(s.timeliness)}`}>{s.timeliness}%</td>
                  <td><span className={`text-[11px] font-bold rounded px-1.5 py-0.5 whitespace-nowrap ${integTone[s.integration]}`}>{s.integration}</span></td>
                  <td className="text-xs text-slate-600">{s.feeds}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card title="Data issues blocking AI">
          <ul className="space-y-2 text-sm">{dataIssues[domainId].map((i) => <li key={i} className="border-l-2 border-red-500 pl-3">{i}</li>)}</ul>
        </Card>
        <Card title="Path from raw data to AI (TEDIF knowledge lifecycle)">
          <div className="flex flex-wrap gap-1 text-xs">
            {['Raw data', 'Validation', 'Master data', 'Metadata', 'Classification', 'Business rules', 'Knowledge graph', 'Vector store', 'Decision context', 'AI'].map((s, i, a) => (
              <span key={s} className="flex items-center gap-1"><span className="rounded bg-slate-100 px-2 py-1 font-semibold">{s}</span>{i < a.length - 1 && '→'}</span>
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-3">No source reaches AI without an owner, a classification and a quality score. Quality below 75% blocks the decisions it feeds.</p>
        </Card>
      </div>
    </>
  )
}
