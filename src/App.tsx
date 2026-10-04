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

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Overview />} />
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
          </Route>
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  )
}
