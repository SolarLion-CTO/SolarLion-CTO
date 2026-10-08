import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { StoreProvider } from './store'
import Layout from './components/Layout'
import Overview from './pages/Overview'
import Decisions from './pages/Decisions'
import Value from './pages/Value'
import Strategy from './pages/Strategy'
import Finance from './pages/Finance'
import Operations from './pages/Operations'
import Governance from './pages/Governance'
import Agents from './pages/Agents'
import Framework from './pages/Framework'
import Problems from './pages/Problems'
import Innovation from './pages/Innovation'
import Tedif from './pages/Tedif'
import DomainView from './pages/DomainView'
import TrackerPortfolio from './pages/TrackerPortfolio'
import Engineering from './pages/Engineering'
import RiskRegister from './pages/RiskRegister'
import AiInsights from './pages/AiInsights'
import DomainHome from './pages/sim/DomainHome'
import SourcePage from './pages/sim/SourcePage'
import RecordPage from './pages/sim/RecordPage'
import FunctionPage from './pages/sim/FunctionPage'
import { SimClockProvider } from './components/sim/clock'
import { DecisionStateProvider } from './components/sim/decisionState'
import DomainDecisions from './pages/sim/DomainDecisions'
import DecisionCenter from './pages/sim/DecisionCenter'
import About from './pages/About'
import TrackerDim from './pages/TrackerDim'
import Coverage from './pages/cto/Coverage'
import Business from './pages/cto/Business'
import CtoStrategy from './pages/cto/Strategy'
import Assessment from './pages/cto/Assessment'
import Portfolio from './pages/cto/Portfolio'
import Data from './pages/cto/Data'
import AiSelection from './pages/cto/AiSelection'
import Architecture from './pages/cto/Architecture'
import OperatingModel from './pages/cto/OperatingModel'
import CtoDecisions from './pages/cto/Decisions'
import Roadmap from './pages/cto/Roadmap'
import CommandCenter from './pages/sim/CommandCenter'
import DataSources from './pages/sim/DataSources'
import TeamPage from './pages/team/TeamPage'
import WorkspacePage from './pages/team/WorkspacePage'
import FrameworksPage from './pages/team/FrameworksPage'
import ReferencePage from './pages/team/ReferencePage'
import Login from './pages/Login'
import SignInLog from './pages/SignInLog'
import { AuthProvider, RequireAuth } from './auth/AuthProvider'

export default function App() {
  return (
    <StoreProvider>
      <SimClockProvider>
      <DecisionStateProvider>
      <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="login" element={<Login />} />
          <Route element={<RequireAuth><Layout /></RequireAuth>}>
            <Route index element={<CommandCenter />} />
            <Route path="overview" element={<Overview />} />
            <Route path="sources" element={<DataSources />} />
            <Route path="team" element={<TeamPage />} />
            <Route path="team/frameworks" element={<FrameworksPage />} />
            <Route path="team/reference" element={<ReferencePage />} />
            <Route path="admin/sign-ins" element={<SignInLog />} />
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
        </Routes>
      </AuthProvider>
      </BrowserRouter>
      </DecisionStateProvider>
      </SimClockProvider>
    </StoreProvider>
  )
}
