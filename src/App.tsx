import { lazy } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { StoreProvider } from './store'
import Layout from './components/Layout'
import { SimClockProvider } from './components/sim/clock'
import { DecisionStateProvider } from './components/sim/decisionState'

// Pages load on demand (code splitting); the layout and sidebar stay in the main bundle.
const Overview = lazy(() => import('./pages/Overview'))
const Decisions = lazy(() => import('./pages/Decisions'))
const Value = lazy(() => import('./pages/Value'))
const Strategy = lazy(() => import('./pages/Strategy'))
const Finance = lazy(() => import('./pages/Finance'))
const Operations = lazy(() => import('./pages/Operations'))
const Governance = lazy(() => import('./pages/Governance'))
const Agents = lazy(() => import('./pages/Agents'))
const Framework = lazy(() => import('./pages/Framework'))
const Problems = lazy(() => import('./pages/Problems'))
const Innovation = lazy(() => import('./pages/Innovation'))
const Tedif = lazy(() => import('./pages/Tedif'))
const DomainView = lazy(() => import('./pages/DomainView'))
const TrackerPortfolio = lazy(() => import('./pages/TrackerPortfolio'))
const Engineering = lazy(() => import('./pages/Engineering'))
const RiskRegister = lazy(() => import('./pages/RiskRegister'))
const AiInsights = lazy(() => import('./pages/AiInsights'))
const DomainHome = lazy(() => import('./pages/sim/DomainHome'))
const SourcePage = lazy(() => import('./pages/sim/SourcePage'))
const RecordPage = lazy(() => import('./pages/sim/RecordPage'))
const FunctionPage = lazy(() => import('./pages/sim/FunctionPage'))
const DomainDecisions = lazy(() => import('./pages/sim/DomainDecisions'))
const DecisionCenter = lazy(() => import('./pages/sim/DecisionCenter'))
const About = lazy(() => import('./pages/About'))
const TrackerDim = lazy(() => import('./pages/TrackerDim'))
const Coverage = lazy(() => import('./pages/cto/Coverage'))
const Business = lazy(() => import('./pages/cto/Business'))
const CtoStrategy = lazy(() => import('./pages/cto/Strategy'))
const Assessment = lazy(() => import('./pages/cto/Assessment'))
const Portfolio = lazy(() => import('./pages/cto/Portfolio'))
const Data = lazy(() => import('./pages/cto/Data'))
const AiSelection = lazy(() => import('./pages/cto/AiSelection'))
const Architecture = lazy(() => import('./pages/cto/Architecture'))
const OperatingModel = lazy(() => import('./pages/cto/OperatingModel'))
const CtoDecisions = lazy(() => import('./pages/cto/Decisions'))
const Roadmap = lazy(() => import('./pages/cto/Roadmap'))
const CommandCenter = lazy(() => import('./pages/sim/CommandCenter'))
const ControlPlane = lazy(() => import('./pages/ControlPlane'))
const DataSources = lazy(() => import('./pages/sim/DataSources'))
const TeamPage = lazy(() => import('./pages/team/TeamPage'))
const WorkspacePage = lazy(() => import('./pages/team/WorkspacePage'))
const FrameworksPage = lazy(() => import('./pages/team/FrameworksPage'))
const ReferencePage = lazy(() => import('./pages/team/ReferencePage'))

export default function App() {
  return (
    <StoreProvider>
      <SimClockProvider>
      <DecisionStateProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<ControlPlane />} />
            <Route path="command-center" element={<CommandCenter />} />
            <Route path="overview" element={<Overview />} />
            <Route path="sources" element={<DataSources />} />
            <Route path="team" element={<TeamPage />} />
            <Route path="team/frameworks" element={<FrameworksPage />} />
            <Route path="team/reference" element={<ReferencePage />} />
            <Route path="team/:owner" element={<WorkspacePage />} />
            <Route path="decisions" element={<Decisions />} />
            <Route path="value" element={<Value />} />
            <Route path="strategy" element={<Strategy />} />
            <Route path="finance" element={<Finance />} />
            <Route path="operations" element={<Operations />} />
            <Route path="governance" element={<Governance />} />
            <Route path="agents" element={<Agents />} />
            <Route path="framework" element={<Framework />} />
            <Route path="problems" element={<Problems />} />
            <Route path="innovation" element={<Innovation />} />
            <Route path="tedif" element={<Tedif />} />
            <Route path="domain/:id" element={<DomainHome />} />
            <Route path="domain/:id/programme" element={<DomainView />} />
            <Route path="domain/:id/decisions" element={<DomainDecisions />} />
            <Route path="decision-center" element={<DecisionCenter />} />
            <Route path="about" element={<About />} />
            <Route path="domain/:id/record/:rid" element={<RecordPage />} />
            <Route path="domain/:id/fn/:fn" element={<FunctionPage />} />
            <Route path="domain/:id/:source" element={<SourcePage />} />
            <Route path="tracker" element={<TrackerPortfolio />} />
            <Route path="engineering" element={<Engineering />} />
            <Route path="risk" element={<RiskRegister />} />
            <Route path="ai" element={<AiInsights />} />
            <Route path="tracker/:dim" element={<TrackerDim />} />
            <Route path="cto/coverage" element={<Coverage />} />
            <Route path="cto/business" element={<Business />} />
            <Route path="cto/strategy" element={<CtoStrategy />} />
            <Route path="cto/assessment" element={<Assessment />} />
            <Route path="cto/portfolio" element={<Portfolio />} />
            <Route path="cto/data" element={<Data />} />
            <Route path="cto/ai-selection" element={<AiSelection />} />
            <Route path="cto/architecture" element={<Architecture />} />
            <Route path="cto/operating-model" element={<OperatingModel />} />
            <Route path="cto/decisions" element={<CtoDecisions />} />
            <Route path="cto/roadmap" element={<Roadmap />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      </DecisionStateProvider>
      </SimClockProvider>
    </StoreProvider>
  )
}
