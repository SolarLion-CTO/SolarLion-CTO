// One route, seven simulated source systems. Every page: sync strip + event feed, KPI row, artifacts, drill-down.
import { useParams, useSearchParams } from 'react-router-dom'
import { SOURCES, sourceHealth } from '../../data/sim'
import type { DomainData } from '../../data/sim'
import { SyncStrip } from '../../components/sim/EventFeed'
import { ScoreRing } from '../../components/sim/primitives'
import { NotFound, SimHeader, useSimDomain } from './common'
import Planview from './sources/Planview'
import LeanIX from './sources/LeanIX'
import ProcessIntel from './sources/ProcessIntel'
import ServiceNow from './sources/ServiceNow'
import Jellyfish from './sources/Jellyfish'
import Datadog from './sources/Datadog'
import Vanta from './sources/Vanta'

const BODY = { planview: Planview, leanix: LeanIX, process: ProcessIntel, servicenow: ServiceNow, jellyfish: Jellyfish, datadog: Datadog, vanta: Vanta }

export default function SourcePage() {
  const d = useSimDomain()
  const { source } = useParams()
  const s = SOURCES.find((x) => x.slug === source)
  if (!d || !s) return <NotFound />
  const h = sourceHealth(d).find((x) => x.id === s.id)!
  const Body = BODY[s.id] as (p: { d: DomainData; tab: string; setTab: (t: string) => void }) => React.ReactElement
  return (
    <>
      <SimHeader d={d} crumbs={[{ to: `/domain/${d.domain}/${s.slug}`, label: s.capability }]} title={s.capability} question={s.question} source={s.id}>
        <div className="flex items-center gap-2 text-xs text-ink-3"><ScoreRing score={h.score} status={h.status} size={40} label={s.capability} /><span className="leading-tight">Capability<br />health</span></div>
      </SimHeader>
      <SyncStrip d={d} source={s.id} records={h.records} />
      <BodyWithTab Body={Body} d={d} />
    </>
  )
}

function BodyWithTab({ Body, d }: { Body: (p: { d: DomainData; tab: string; setTab: (t: string) => void }) => React.ReactElement; d: DomainData }) {
  const [sp, setSp] = useSearchParams()
  const tab = sp.get('tab') ?? ''
  const setTab = (t: string) => { const n = new URLSearchParams(sp); n.set('tab', t); setSp(n, { replace: true }) }
  return <Body d={d} tab={tab} setTab={setTab} />
}
