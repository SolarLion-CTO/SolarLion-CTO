// /team/:owner — one workspace per capstone owner. Transformation tab for all; functional tabs per owner.
import { Link, useParams } from 'react-router-dom'
import { Hammer } from 'lucide-react'
import { OWNER } from '../../data/sim/team'
import type { OwnerId } from '../../data/sim/team'
import { Card } from '../../components/ui'
import { WorkspaceShell } from '../../components/team/workspace'
import { AgentsTab, MultiDomainTab, ProgrammesTab, ThreadTab } from './RamTabs'
import { OnboardTab, PortfolioTab, ReadinessTab, RoiTab } from './SumanTabs'
import { AuditTab, DataGovTab, ModelsTab, RegulatoryTab } from './VaibhavTabs'

// Functional tabs planned per owner (docs/TEAM_WORKSPACES_PLAN.md, section D). Built tabs replace these as M7 progresses.
const PLANNED: Record<'santhosh' | 'pankaj', { step: string; tabs: [string, string][] }> = {
  santhosh: { step: 'M7.4', tabs: [['CAPEX / OPEX & TBM', 'Monthly CAPEX vs OPEX, cost flow pools → towers → business units'], ['Budget, forecast & anomalies', 'Holt-Winters forecast, EWMA spend anomalies, variance waterfall'], ['FinOps & licences', 'Cloud cost vs plan, licence waste, savings'], ['Investment governance', 'Stage gates with NPV / IRR and value tracking']] },
  pankaj: { step: 'M7.5', tabs: [['ERP RCA', 'Root-cause Pareto, problem records, change correlation, 5-Whys'], ['Capacity & forecasting', 'Live utilisation, forecast-to-breach, headroom heatmap'], ['Peak scenarios', 'Month-end, salary day, festive — what-if scale-out'], ['Production automation', 'Plan-to-produce and maintenance automation, MES']] },
}

export default function WorkspacePage() {
  const { owner } = useParams()
  const o = OWNER[owner as OwnerId]
  if (!o) return <div className="p-8 text-ink-2">Unknown workspace. <Link to="/team" className="text-brand-600 font-semibold">Team</Link></div>
  const tabs = o.id === 'ram'
    ? [
      { id: 'multi', label: 'Multi-domain', render: () => <MultiDomainTab /> },
      { id: 'agents', label: 'Agents & correlation', render: () => <AgentsTab /> },
      { id: 'thread', label: 'Golden thread', render: () => <ThreadTab /> },
      { id: 'programmes', label: 'Programmes', render: () => <ProgrammesTab /> },
    ]
    : o.id === 'suman'
    ? [
      { id: 'readiness', label: 'Readiness', render: () => <ReadinessTab /> },
      { id: 'portfolio', label: 'Portfolio & gates', render: () => <PortfolioTab /> },
      { id: 'roi', label: 'ROI & benefits', render: () => <RoiTab /> },
      { id: 'onboard', label: 'Onboard any organisation', render: () => <OnboardTab /> },
    ]
    : o.id === 'vaibhav'
    ? [
      { id: 'regulatory', label: 'Regulatory change', render: () => <RegulatoryTab /> },
      { id: 'models', label: 'AI model register', render: () => <ModelsTab /> },
      { id: 'data', label: 'Data governance & DPDP', render: () => <DataGovTab /> },
      { id: 'audit', label: 'Audit readiness', render: () => <AuditTab /> },
    ]
    : PLANNED[o.id as 'santhosh' | 'pankaj'].tabs.map(([label, desc]) => ({
      id: label.toLowerCase().replace(/[^a-z]+/g, '-'), label,
      render: () => (
        <Card>
          <div className="flex items-start gap-3"><Hammer size={20} className="text-ink-3 shrink-0 mt-0.5" /><div><div className="font-semibold text-ink">{label}: being built in {PLANNED[o.id as 'santhosh' | 'pankaj'].step}</div><p className="text-sm text-ink-2 mt-1">{desc}.</p><p className="text-xs text-ink-3 mt-2">The Transformation tab and live KPIs above are already working for this workspace.</p></div></div>
        </Card>
      ),
    }))
  return <WorkspaceShell key={o.id} owner={o} tabs={tabs} />
}
