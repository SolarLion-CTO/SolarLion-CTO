import { useStore } from '../store'
import { Badge, Bar, Card, PageHeader } from '../components/ui'

export default function Operations() {
  const { domain } = useStore()
  const opsInitiatives = domain.initiatives.filter((i) => i.workstream === 'Operations')

  return (
    <>
      <PageHeader title="Operations" subtitle="Root cause analysis, capacity planning and process automation" owner="Pankaj" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {domain.ops.map((o) => (
          <Card key={o.name}>
            <div className="text-[11px] uppercase font-semibold text-slate-500">{o.name}</div>
            <div className="flex items-end gap-2 mt-2">
              <span className="text-2xl font-extrabold">{o.current}</span>
              <span className="text-xs text-slate-400 line-through mb-1">{o.baseline}</span>
            </div>
            <div className="text-xs text-emerald-600 font-semibold mt-1">↑ {o.improvement}% improvement vs baseline</div>
          </Card>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <Card title="Operational AI Initiatives">
          <ul className="space-y-4">
            {opsInitiatives.map((i) => (
              <li key={i.id}>
                <div className="flex justify-between items-center gap-2 mb-1">
                  <span className="font-semibold text-sm">{i.name}</span>
                  <Badge>{i.status}</Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="w-14">{i.stage}</span><Bar value={i.progress} /><span>{i.progress}%</span>
                </div>
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Operating Model — Before vs After AI">
          <table className="w-full text-sm">
            <thead><tr className="text-[11px] uppercase text-slate-500 border-b text-left"><th className="py-2">Metric</th><th>Baseline</th><th>Now</th><th className="w-28">Gain</th></tr></thead>
            <tbody>
              {domain.ops.map((o) => (
                <tr key={o.name} className="border-b">
                  <td className="py-2.5">{o.name}</td><td className="text-slate-500">{o.baseline}</td><td className="font-semibold">{o.current}</td>
                  <td><div className="flex items-center gap-2"><Bar value={o.improvement} color="bg-emerald-500" /><span className="text-xs">{o.improvement}%</span></div></td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-slate-500 mt-3">Baselines captured before pilot start — value is measured, not asserted.</p>
        </Card>
      </div>
    </>
  )
}
