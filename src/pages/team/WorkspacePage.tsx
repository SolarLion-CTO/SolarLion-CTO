// /team/:owner — one workspace per capstone owner. Transformation tab for all; functional tabs per owner.
import { Link, useParams } from 'react-router-dom'
import { OWNER } from '../../data/sim/team'
import type { OwnerId } from '../../data/sim/team'
import { WorkspaceShell } from '../../components/team/workspace'
import { AgentsTab, MultiDomainTab, ProgrammesTab, ThreadTab } from './RamTabs'
import { OnboardTab, PortfolioTab, ReadinessTab, RoiTab } from './SumanTabs'
import { AuditTab, DataGovTab, ModelsTab, RegulatoryTab } from './VaibhavTabs'
import { BudgetTab, CapexTab, FinOpsTab, InvestTab } from './SanthoshTabs'
import { CapacityTab, ErpRcaTab, PeakTab, ProductionTab } from './PankajTabs'

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
    : o.id === 'santhosh'
    ? [
      { id: 'capex', label: 'CAPEX / OPEX & TBM', render: () => <CapexTab /> },
      { id: 'budget', label: 'Budget, forecast & anomalies', render: () => <BudgetTab /> },
      { id: 'finops', label: 'FinOps & licences', render: () => <FinOpsTab /> },
      { id: 'invest', label: 'Investment governance', render: () => <InvestTab /> },
    ]
    : [
      { id: 'erp', label: 'ERP RCA', render: () => <ErpRcaTab /> },
      { id: 'capacity', label: 'Capacity & forecasting', render: () => <CapacityTab /> },
      { id: 'peaks', label: 'Peak scenarios', render: () => <PeakTab /> },
      { id: 'production', label: 'Production automation', render: () => <ProductionTab /> },
    ]
  return <WorkspaceShell key={o.id} owner={o} tabs={tabs} />
}
