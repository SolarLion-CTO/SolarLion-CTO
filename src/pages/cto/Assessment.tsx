import { useEffect, useState } from 'react'
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer } from 'recharts'
import { assessment, assessmentDefaults, levelName } from '../../data/cto'
import { domains } from '../../data/domains'
import { useStore } from '../../store'
import DomainSwitch from '../../components/DomainSwitch'
import { Card, PageHeader } from '../../components/ui'

const scale = ['1 · None', '2 · Ad hoc', '3 · Defined', '4 · Managed', '5 · Optimised']

export default function Assessment() {
  const { domainId } = useStore()
  const [answers, setAnswers] = useState<number[][]>(assessmentDefaults[domainId])
  useEffect(() => { setAnswers(assessmentDefaults[domainId]) }, [domainId])

  const scores = assessment.map((a, i) => ({ dim: a.dim, score: +(answers[i].reduce((s, v) => s + v, 0) / answers[i].length).toFixed(1) }))
  const overall = +(scores.reduce((s, x) => s + x.score, 0) / scores.length).toFixed(2)
  const weakest = [...scores].sort((a, b) => a.score - b.score)[0]
  const failed = assessment.flatMap((a, i) => a.questions.map((q, j) => ({ q, v: answers[i][j] }))).filter((x) => x.q.precondition && x.v < 3)
  const set = (i: number, j: number, v: number) => setAnswers((prev) => prev.map((row, ri) => (ri === i ? row.map((c, cj) => (cj === j ? v : c)) : row)))

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <PageHeader title="AI Readiness Assessment" subtitle={`Score ${domains[domainId].name} on 5 dimensions — the TEDIF Phase 1 instrument behind Gate 1`} owner="Suman" />
        <div className="mb-6"><DomainSwitch /></div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {assessment.map((a, i) => (
            <Card key={a.dim} title={`${a.dim} · ${scores[i].score}`}>
              <div className="space-y-2">
                {a.questions.map((q, j) => (
                  <div key={q.q} className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="flex-1 min-w-[220px]">{q.q}{q.precondition && <span className="ml-1 text-[10px] font-bold text-red-600">GATE</span>}</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((v) => (
                        <button key={v} title={scale[v - 1]} onClick={() => set(i, j, v)} className={`w-8 h-8 rounded-md text-xs font-bold border ${answers[i][j] === v ? 'bg-[#0b2a6b] text-white border-[#0b2a6b]' : answers[i][j] > v ? 'bg-blue-100 border-blue-200' : 'bg-white border-slate-200'}`}>{v}</button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
          <p className="text-xs text-slate-500">Scale: {scale.join(' · ')}. Answers are pre-filled with demo values — click to rescore live.</p>
        </div>

        <div className="space-y-4 lg:sticky lg:top-24 self-start">
          <Card title="Result">
            <div className="text-center">
              <div className="text-4xl font-extrabold text-[#0b2a6b]">{overall}</div>
              <div className="text-sm font-semibold text-blue-700">{levelName(overall)}</div>
            </div>
            <div className="h-56">
              <ResponsiveContainer>
                <RadarChart data={scores}><PolarGrid /><PolarAngleAxis dataKey="dim" tick={{ fontSize: 11 }} /><PolarRadiusAxis domain={[0, 5]} tick={false} axisLine={false} /><Radar dataKey="score" stroke="#1d4ed8" fill="#1d4ed8" fillOpacity={0.3} /></RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="rounded-lg bg-blue-50 p-3 text-sm"><b>Start here:</b> {weakest.dim} ({weakest.score}) is the weakest dimension.</div>
          </Card>
          <Card title="Gate 1 preconditions">
            {failed.length === 0 ? (
              <p className="text-sm text-emerald-700 font-semibold">✓ All “do not start” preconditions pass — ready for Gate 1 review.</p>
            ) : (
              <>
                <p className="text-sm text-red-700 font-semibold mb-2">✕ Do not start — fix first:</p>
                <ul className="text-sm list-disc pl-4 space-y-1">{failed.map((f) => <li key={f.q.q}>{f.q.precondition}</li>)}</ul>
              </>
            )}
            <p className="text-xs text-slate-500 mt-2">From TEDIF 12.1: a failed precondition becomes the first project.</p>
          </Card>
        </div>
      </div>
    </>
  )
}
