// About CTO360 + full disclaimer. The short version appears in the footer of every page.
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Info, ShieldCheck } from 'lucide-react'
import { Card, PageHeader } from '../components/ui'
import { SOURCES } from '../data/sim/scores'

export const SHORT_DISCLAIMER = 'Independent demonstration using synthetic data. Third-party product names are referenced solely for conceptual integration scenarios. CTO360 is not affiliated with or endorsed by the referenced vendors.'

export default function About() {
  const { hash } = useLocation()
  useEffect(() => { if (hash) document.getElementById(hash.slice(1))?.scrollIntoView() }, [hash])
  return (
    <>
      <PageHeader title="About CTO360" subtitle="Enterprise Technology Control Tower — an independent CTO capstone demonstration" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <section id="disclaimer" className="rounded-xl border-2 border-brand-600 bg-brand-50 p-5 scroll-mt-20" aria-labelledby="disclaimer-h">
            <h2 id="disclaimer-h" className="flex items-center gap-2 text-lg font-bold text-brand-900 mb-2"><ShieldCheck size={20} />Disclaimer</h2>
            <p className="text-[15px] leading-relaxed text-ink">
              CTO360 is an independent demonstration platform developed for educational, research and professional portfolio purposes using synthetic and simulated data.
              References to third-party products, platforms and trademarks are included solely to demonstrate conceptual integration scenarios and potential enterprise workflows.
              CTO360 is not affiliated with, endorsed by, sponsored by or officially connected with any referenced vendor.
              No proprietary customer data, vendor data or production system data is used.
              All product names, trademarks and registered trademarks remain the property of their respective owners.
            </p>
          </section>
          <Card title="What CTO360 is">
            <ul className="list-disc pl-5 space-y-1.5 text-sm text-ink-2">
              <li>A CTO decision-intelligence layer that shows how signals from specialised enterprise platforms could be connected into one view: <b>Signal → Correlation → Insight → Decision → Action → Outcome</b>.</li>
              <li>It does <b>not</b> replace those platforms, or the systems used by the CEO, CFO, COO, CISO, CHRO or other executives.</li>
              <li>Banking (Meridian Bank), Manufacturing (Arvant Industries) and Retail (Orbit Retail) are <b>fictional organisations</b>. Every record, metric, incident and decision is synthetic.</li>
              <li>There are <b>no live integrations</b>: no API connections, credentials or data feeds to any vendor. The "Simulation live" clock replays generated events.</li>
              <li>Maturity levels are a management visualisation only — not a CMMI or any other formal assessment. Control monitoring is a simulation — not a compliance certification or audit opinion.</li>
            </ul>
          </Card>
        </div>
        <div className="space-y-5">
          <Card title="Simulated source categories">
            <p className="text-xs text-ink-3 -mt-2 mb-3">Named only to illustrate the type of enterprise platform a CTO would connect. Interfaces, layouts and data are original and fictional.</p>
            <ul className="space-y-2 text-sm">{SOURCES.map((s) => (
              <li key={s.id} className="flex justify-between gap-3 border-b border-line last:border-0 pb-1.5"><span className="text-ink">{s.capability}</span><span className="text-ink-3 text-right">Simulated · {s.label}</span></li>
            ))}</ul>
          </Card>
          <Card title="Project">
            <dl className="text-sm space-y-1.5">
              <div className="flex justify-between gap-3"><dt className="text-ink-3">Purpose</dt><dd className="text-right">CTO capstone · portfolio</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-ink-3">Framework</dt><dd className="text-right">TEDIF · AI recommends, humans decide</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-ink-3">Data</dt><dd className="text-right">Synthetic, seeded, reproducible</dd></div>
            </dl>
            <p className="flex gap-2 text-xs text-ink-3 mt-3"><Info size={14} className="shrink-0 mt-0.5" />Questions about a trademark or reference can be raised with the project team and will be corrected promptly.</p>
          </Card>
        </div>
      </div>
    </>
  )
}
