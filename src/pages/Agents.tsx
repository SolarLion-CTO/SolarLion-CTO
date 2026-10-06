import { useState } from 'react'
import { Bot, Send } from 'lucide-react'
import { useStore } from '../store'
import type { DomainPack } from '../data/domains'
import { Badge, Card, PageHeader, money } from '../components/ui'

// Phase 1: canned answers built from the mock data.
// Phase 2: replace answer() with a call to the Python API (LLM).
function answer(q: string, d: DomainPack): string {
  const s = q.toLowerCase()
  if (s.includes('risk') || s.includes('delay')) {
    const r = d.initiatives.filter((i) => i.status !== 'On Track')
    return `${r.length} initiative(s) need attention in ${d.name}: ${r.map((i) => `${i.name} (${i.status})`).join('; ')}. Recommend a review at the next governance gate.`
  }
  if (s.includes('roi') || s.includes('value')) {
    const best = [...d.initiatives].sort((a, b) => b.value / b.investment - a.value / a.investment)[0]
    return `Programme ROI is ${d.kpis.roi}%. Highest return: "${best.name}" at ${(best.value / best.investment).toFixed(1)}× (${money(best.value)} / yr on ${money(best.investment)}).`
  }
  if (s.includes('complian') || s.includes('dpdp') || s.includes('govern')) {
    const gaps = d.controls.filter((c) => c.status !== 'Compliant')
    return `Compliance score ${d.kpis.compliance}%. Open items: ${gaps.map((c) => `${c.name} (${c.coverage}%)`).join(', ')}.`
  }
  if (s.includes('problem')) {
    return `Top ${d.name} problems: ${Object.values(d.problems).map((p) => `${p.area}: ${p.title} (${p.progress}% to target)`).join('; ')}.`
  }
  return `In ${d.name}: ${d.initiatives.length} initiatives, ${d.agents.filter((a) => a.status === 'Active').length} active agents, ${d.decisions.length} decisions awaiting human approval. Try asking about problems, risk, ROI or compliance.`
}

export default function Agents() {
  const { domain } = useStore()
  const [q, setQ] = useState('')
  const [chat, setChat] = useState<{ who: 'you' | 'ai'; text: string }[]>([])

  const ask = (text: string) => {
    if (!text.trim()) return
    setChat((c) => [...c, { who: 'you', text }, { who: 'ai', text: answer(text, domain) }])
    setQ('')
  }

  return (
    <>
      <PageHeader title="AI Control Layer" subtitle="Agents prepare the decision · MCP connects enterprise systems · RAG grounds every answer" owner="Ram" />
      <div className="grid lg:grid-cols-5 gap-6">
        <Card title={`Agent Registry · ${domain.name}`} className="lg:col-span-3">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[620px]">
              <thead><tr className="text-[11px] uppercase text-slate-500 border-b text-left"><th className="py-2">Agent</th><th>Role</th><th>Status</th><th>MCP source</th><th>Tasks (30d)</th><th>Accuracy</th></tr></thead>
              <tbody>
                {domain.agents.map((a) => (
                  <tr key={a.name} className="border-b">
                    <td className="py-2.5 font-semibold flex items-center gap-2"><Bot size={15} className="text-blue-700" />{a.name}</td>
                    <td className="text-slate-500">{a.role}</td><td><Badge>{a.status}</Badge></td><td className="text-xs">{a.mcp}</td>
                    <td>{a.tasks.toLocaleString()}</td><td className="font-semibold">{a.accuracy}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 grid sm:grid-cols-3 gap-3 text-xs">
            <div className="rounded-lg bg-slate-50 p-3"><b>Bounded tools</b><br />Agents only call approved tools for their role.</div>
            <div className="rounded-lg bg-slate-50 p-3"><b>Human escalation</b><br />Low confidence or high risk → human review.</div>
            <div className="rounded-lg bg-slate-50 p-3"><b>Full observability</b><br />Every action logged with model version.</div>
          </div>
        </Card>

        <Card title="Ask the Framework" className="lg:col-span-2 flex flex-col">
          <div className="flex-1 min-h-64 max-h-96 overflow-y-auto space-y-3 mb-3">
            {chat.length === 0 && (
              <div className="space-y-2">
                <p className="text-sm text-slate-500">Ask about the {domain.name} transformation:</p>
                {['Which initiatives are at risk?', 'Where is the best ROI?', 'What is our DPDP compliance status?', 'What are our main problems?'].map((s) => (
                  <button key={s} onClick={() => ask(s)} className="block w-full text-left text-sm border border-line rounded-lg px-3 py-2 hover:bg-blue-50">{s}</button>
                ))}
              </div>
            )}
            {chat.map((m, i) => (
              <div key={i} className={`text-sm rounded-lg px-3 py-2 ${m.who === 'you' ? 'bg-blue-600 text-white ml-8' : 'bg-slate-100 mr-8'}`}>{m.text}</div>
            ))}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); ask(q) }} className="flex gap-2">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ask a question…" className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm" />
            <button className="bg-blue-700 text-white rounded-lg px-3" aria-label="Send"><Send size={16} /></button>
          </form>
          <p className="text-[11px] text-slate-400 mt-2">Demo mode — LLM integration via Python API in Phase 2.</p>
        </Card>
      </div>
    </>
  )
}
