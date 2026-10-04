import { Link } from 'react-router-dom'
import { Star } from 'lucide-react'
import { domainOrder, domains } from '../data/domains'
import { buildTree, dimMeta, dims, flatten, isFlagship, roles } from '../data/tracker'
import { useStore } from '../store'
import { Badge, Card, PageHeader } from '../components/ui'

const cellTone: Record<string, string> = { 'On Track': 'bg-emerald-50 border-emerald-200', 'At Risk': 'bg-amber-50 border-amber-200', Delayed: 'bg-red-50 border-red-200' }

export default function TrackerPortfolio() {
  const { setDomainId } = useStore()
  const trees = dims.flatMap((dim) => domainOrder.map((d) => ({ dim, d, tree: buildTree(dim, d) })))
  const items = trees.flatMap((t) => flatten(t.tree).map((x) => ({ ...x, dim: t.dim, d: t.d })))
  const reds = items.filter((x) => x.node.status === 'Delayed')
  const budget = trees.reduce((s, t) => [s[0] + t.tree.budget![0], s[1] + t.tree.budget![1]], [0, 0])
  const byLevel = roles.map((r, i) => ({ r, n: items.filter((x) => x.node.level === i + 1).length }))

  return (
    <>
      <PageHeader title="Programme Tracker · Portfolio" subtitle="Eight dimensions × three domains, tracked from CTO to developer — one plan, one source of truth" owner="Ram (CTO)" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card><div className="text-[11px] uppercase text-slate-500 font-semibold">Items tracked</div><div className="text-2xl font-extrabold">{items.length}</div><div className="text-xs text-slate-500">across 9 role levels</div></Card>
        <Card><div className="text-[11px] uppercase text-slate-500 font-semibold">Spent / budget</div><div className="text-2xl font-extrabold">₹{budget[1].toFixed(1)} / {budget[0].toFixed(1)} Cr</div></Card>
        <Card><div className="text-[11px] uppercase text-slate-500 font-semibold">Red items</div><div className="text-2xl font-extrabold text-red-600">{reds.length}</div><div className="text-xs text-slate-500">escalated to CTO</div></Card>
        <Card><div className="text-[11px] uppercase text-slate-500 font-semibold">AI-involved items</div><div className="text-2xl font-extrabold text-violet-700">{items.filter((x) => x.node.ai).length}</div><div className="text-xs text-slate-500">all with a human approver</div></Card>
      </div>

      <Card title="Dimension × domain" className="mb-6" action={<span className="text-xs text-slate-500">Click a cell to open that tab · ★ = tracked to developer level</span>}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[760px] border-separate border-spacing-1.5">
            <thead><tr><th className="text-left text-[11px] uppercase text-slate-500">Dimension · lead</th>{domainOrder.map((d) => <th key={d} className="text-left text-[11px] uppercase text-slate-500">{domains[d].name}</th>)}</tr></thead>
            <tbody>
              {dims.map((dim) => (
                <tr key={dim}>
                  <td className="align-top pt-2"><Link to={`/tracker/${dimMeta[dim].slug}`} className="font-bold text-blue-800 hover:underline">{dim}</Link><div className="text-[11px] text-slate-500">{dimMeta[dim].lead}</div></td>
                  {domainOrder.map((d) => {
                    const t = trees.find((x) => x.dim === dim && x.d === d)!.tree
                    const r = flatten(t).filter((x) => x.node.status === 'Delayed').length
                    return (
                      <td key={d} className="align-top">
                        <Link to={`/tracker/${dimMeta[dim].slug}`} onClick={() => setDomainId(d)} className={`block rounded-lg border p-2.5 hover:shadow ${cellTone[t.status]}`}>
                          <div className="text-xs font-semibold leading-snug line-clamp-2">{t.title}</div>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex-1 h-1.5 bg-white rounded-full overflow-hidden"><div className="h-full bg-blue-700" style={{ width: `${t.progress}%` }} /></div>
                            <span className="text-[11px] font-semibold">{t.progress}%</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-[11px]">
                            <Badge>{t.status}</Badge>{r > 0 && <span className="text-red-600 font-semibold">{r} red</span>}
                            {isFlagship(dim, d) && <Star size={11} className="ml-auto fill-amber-400 text-amber-400" />}
                          </div>
                        </Link>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card title="Escalations to CTO (red, any level)" className="lg:col-span-2">
          <ul className="space-y-3 max-h-[420px] overflow-y-auto">
            {reds.map(({ node, path, dim, d }) => (
              <li key={node.id} className="border-l-2 border-red-500 pl-3 text-sm">
                <div className="flex flex-wrap items-center gap-2"><b>{node.title}</b><span className="text-[10px] font-bold text-white bg-slate-700 rounded px-1.5">L{node.level} · {roles[node.level - 1]}</span></div>
                <div className="text-xs text-slate-500">{dim} · {domains[d].name} · {path.slice(3).map((p) => p.title).join(' › ') || 'top level'}</div>
                {node.blocker && <div className="text-xs text-red-700">Blocker: {node.blocker}</div>}
                {node.detail && <div className="text-xs">{node.detail}</div>}
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Items by role level">
          <ul className="space-y-1.5 text-sm">
            {byLevel.map(({ r, n }, i) => (
              <li key={r} className="flex items-center gap-2"><span className="text-[10px] font-bold text-white bg-slate-700 rounded px-1.5 w-8 text-center">L{i + 1}</span><span className="flex-1">{r}</span><b>{n}</b></li>
            ))}
          </ul>
          <p className="text-xs text-slate-500 mt-3">Levels 7–9 are planned in full for the three ★ flagship problems; other items are planned to Senior PM level.</p>
        </Card>
      </div>
    </>
  )
}
