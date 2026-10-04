import { useStore } from '../store'
import ProblemPanel from '../components/ProblemPanel'
import { Badge, Bar, Card, PageHeader } from '../components/ui'

const fishbone = ['Machine', 'Method', 'Material', 'Manpower', 'Measurement', 'ERP / IT']

export default function Operations() {
  const { domain } = useStore()
  const opsInitiatives = domain.initiatives.filter((i) => i.area === 'Operations')

  return (
    <>
      <PageHeader title="Operations" subtitle="ERP root-cause analysis, IT and production capacity planning, workflow automation" owner="Pankaj" />
      <ProblemPanel p={domain.problems.Operations} domainName={domain.name} />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {domain.ops.map((o) => (
          <Card key={o.name}>
            <div className="text-[11px] uppercase font-semibold text-slate-500">{o.name}</div>
            <div className="flex items-end gap-2 mt-2"><span className="text-2xl font-extrabold">{o.current}</span><span className="text-xs text-slate-400 line-through mb-1">{o.baseline}</span></div>
            <div className="text-xs text-emerald-600 font-semibold mt-1">↑ {o.improvement}% vs baseline</div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <Card title="Root-Cause Analysis Method">
          <p className="text-sm text-slate-600 mb-3">Alert from MES / ERP / ITSM triggers the decision. The RCA agent applies 5 Whys over logs, work orders and quality data across six fishbone categories; an engineer approves the fix.</p>
          <div className="grid grid-cols-3 gap-2">
            {fishbone.map((f) => <div key={f} className="rounded-lg border border-slate-200 bg-slate-50 text-center py-3 text-sm font-semibold">{f}</div>)}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs mt-4">
            {['Alert', 'Agent: 5 Whys', 'Evidence pack', 'Engineer approves', 'Fix + SOP update'].map((s, i, arr) => (
              <span key={s} className="flex items-center gap-2"><span className="bg-blue-50 border border-blue-200 text-blue-800 rounded px-2 py-1 font-semibold">{s}</span>{i < arr.length - 1 && '→'}</span>
            ))}
          </div>
        </Card>
        <Card title="Capacity Planning — Both Sides">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="rounded-lg border border-slate-200 p-3"><div className="font-semibold text-sm">IT infrastructure</div><div className="text-xs text-slate-500">ERP / core servers, storage, month-end and seasonal peaks</div></div>
            <div className="rounded-lg border border-slate-200 p-3"><div className="font-semibold text-sm">Production / fulfilment</div><div className="text-xs text-slate-500">Line utilisation, shifts, maintenance windows, warehouse slots</div></div>
          </div>
          <div className="text-[11px] uppercase font-semibold text-slate-500 mb-2">Operational AI initiatives</div>
          <ul className="space-y-3">
            {opsInitiatives.map((i) => (
              <li key={i.id}>
                <div className="flex justify-between items-center gap-2 mb-1"><span className="font-semibold text-sm">{i.name}</span><Badge>{i.status}</Badge></div>
                <div className="flex items-center gap-2 text-xs text-slate-500"><span className="w-14">{i.stage}</span><Bar value={i.progress} /><span>{i.progress}%</span></div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card title="Before vs After AI">
        <table className="w-full text-sm">
          <thead><tr className="text-[11px] uppercase text-slate-500 border-b text-left"><th className="py-2">Metric</th><th>Baseline</th><th>Now</th><th className="w-40">Improvement</th></tr></thead>
          <tbody>
            {domain.ops.map((o) => (
              <tr key={o.name} className="border-b">
                <td className="py-2.5">{o.name}</td><td className="text-slate-500">{o.baseline}</td><td className="font-semibold">{o.current}</td>
                <td><div className="flex items-center gap-2"><Bar value={o.improvement} color="bg-emerald-500" /><span className="text-xs">{o.improvement}%</span></div></td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-xs text-slate-500 mt-3">Baselines captured before each pilot started — value is measured, not asserted.</p>
      </Card>
    </>
  )
}
