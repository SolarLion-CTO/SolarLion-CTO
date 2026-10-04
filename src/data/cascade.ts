// CTO-to-ground cascade per domain.
// Level 1 CTO → Level 2 workstream lead → Level 3 initiative owner → Level 4 ground unit (team / plant / branch / store).
// Demo values — replace with the team's baseline.
import type { DomainId, Health } from './domains'

export type Track = 'Strategy' | 'Operations' | 'Finance' | 'ROI' | 'Innovation' | 'Governance'
export const tracks: Track[] = ['Strategy', 'Operations', 'Finance', 'ROI', 'Innovation', 'Governance']
export const trackLead: Record<Track, string> = {
  Strategy: 'Suman', Operations: 'Pankaj', Finance: 'Santhosh', ROI: 'Suman · Santhosh', Innovation: 'Ram', Governance: 'Vaibhav',
}

export interface Ground { unit: string; owner: string; metric: string; actual: string; target: string; status: Health; action: string }
export interface Init { name: string; owner: string; progress: number; status: Health; ground: Ground[] }
export interface TrackPack { problem: string; kpi: string; baseline: string; current: string; target: string; status: Health; initiatives: Init[] }
export interface Cascade { ctoObjective: string; ctoQuestion: string; tracks: Record<Track, TrackPack> }

export const g = (unit: string, owner: string, metric: string, actual: string, target: string, status: Health, action: string): Ground => ({ unit, owner, metric, actual, target, status, action })

export const cascade: Record<DomainId, Cascade> = {
  // ───────────────────────────── BANKING ─────────────────────────────
  banking: {
    ctoObjective: 'Governed AI that grows lending and cuts regulatory cycle time from weeks to hours',
    ctoQuestion: 'Are we funding the right lending AI, and can we prove compliance for every AI decision?',
    tracks: {
      Strategy: {
        problem: 'AI use cases in lending are funded by enthusiasm, not ranked by ROI and readiness',
        kpi: 'AI spend on top-quartile ROI use cases', baseline: '35%', current: '61%', target: '80%', status: 'On Track',
        initiatives: [
          { name: 'Lending AI portfolio scoring', owner: 'Head of Lending Strategy', progress: 62, status: 'On Track', ground: [
            g('Retail lending team', 'Product manager', 'Use cases scored', '14 / 23', '23 / 23', 'On Track', 'Score remaining 9 by week 6'),
            g('SME lending team', 'Credit head, SME', 'Duplicate PoCs retired', '1 of 3', '3 of 3', 'At Risk', 'Retire vendor PoC B; merge into KYC triage'),
          ] },
          { name: 'AI maturity baseline', owner: 'Transformation office', progress: 70, status: 'On Track', ground: [
            g('Retail banking dept', 'Dept head', 'Maturity score', '3.4 / 5', 'Baseline set', 'On Track', 'Validated with functional owners'),
            g('Treasury dept', 'Treasury ops lead', 'Maturity score', 'Not assessed', 'Baseline set', 'At Risk', 'Book assessment workshop'),
          ] },
        ],
      },
      Operations: {
        problem: 'Core banking month-end batch overruns and repeat P1 incidents take hours to diagnose',
        kpi: 'P1 incident MTTR', baseline: '6.2 h', current: '3.1 h', target: '2.0 h', status: 'On Track',
        initiatives: [
          { name: 'Month-end batch optimisation', owner: 'Head of IT Operations', progress: 65, status: 'At Risk', ground: [
            g('Core banking DB team', 'DBA lead', 'Batch overrun', '1.2 h', '< 0.5 h', 'At Risk', 'Re-sequence interest accrual jobs'),
            g('Mumbai data centre', 'DC manager', 'Peak CPU at month-end', '88%', '< 80%', 'At Risk', 'Capacity agent forecast → BNK-D-003'),
          ] },
          { name: 'Incident RCA agent', owner: 'Service delivery manager', progress: 74, status: 'On Track', ground: [
            g('L2 support team', 'Support lead', 'MTTR (P1)', '3.1 h', '2.0 h', 'On Track', 'RCA agent live on ITSM via MCP'),
            g('Branch IT desk', 'Branch IT coordinator', 'Repeat incidents / month', '7', '≤ 4', 'At Risk', 'Feed fixes back into SOPs'),
          ] },
        ],
      },
      Finance: {
        problem: 'Core system spend decided on vendor quotes with no 3-year OPEX / CAPEX view',
        kpi: 'Infra decisions with 3-year TCO evidence', baseline: '10%', current: '55%', target: '100%', status: 'On Track',
        initiatives: [
          { name: 'Core systems TCO model', owner: 'Finance controller, IT', progress: 50, status: 'On Track', ground: [
            g('Infra procurement', 'Procurement manager', 'Requests with TCO', '11 of 20', '20 of 20', 'On Track', 'TCO agent attaches 3-year model'),
            g('Vendor management', 'Vendor manager', 'Contracts renegotiated', '3', '6', 'On Track', 'Storage and DR contracts next'),
          ] },
          { name: 'Application portfolio rationalisation', owner: 'IT finance partner', progress: 40, status: 'At Risk', ground: [
            g('Legacy reporting app', 'App owner', 'Decision', 'Retire', 'Retired by Q1', 'At Risk', 'Migrate 14 reports to BI'),
            g('Regulatory feed service', 'Compliance IT', 'Decision', 'Keep (OPEX)', 'Keep', 'On Track', 'Renew at same cost'),
          ] },
        ],
      },
      ROI: {
        problem: 'ROI of AI is not identified before investment, so value cannot be proven to the board',
        kpi: 'Initiatives with pre-investment ROI case', baseline: '20%', current: '83%', target: '100%', status: 'On Track',
        initiatives: [
          { name: 'Business case before funding', owner: 'PMO lead', progress: 83, status: 'On Track', ground: [
            g('Lending AI pilots', 'Pilot owners', 'Pilots with ROI case', '5 of 5', '5 of 5', 'On Track', 'Linked to field 14 KPI'),
            g('Ops automation pilots', 'IT ops lead', 'Pilots with ROI case', '2 of 4', '4 of 4', 'At Risk', 'Baseline MTTR before claiming value'),
          ] },
          { name: 'Value realisation tracking', owner: 'Finance business partner', progress: 58, status: 'On Track', ground: [
            g('Collections prioritisation', 'Collections head', 'Realised vs identified', '₹1.1 / 1.6 Cr', '₹1.6 Cr', 'On Track', 'Quarterly value review'),
            g('KYC triage', 'Onboarding head', 'Realised vs identified', '₹0.4 / 0.9 Cr', '₹0.9 Cr', 'At Risk', 'Adoption at 2 of 6 regions'),
          ] },
        ],
      },
      Innovation: {
        problem: 'No safe pattern for AI agents to act on core banking without exposing customer data',
        kpi: 'Use cases on the shared control layer', baseline: '0', current: '4', target: '10', status: 'On Track',
        initiatives: [
          { name: 'MCP control layer', owner: 'Enterprise architect', progress: 45, status: 'On Track', ground: [
            g('Core banking connector', 'Integration team', 'Allow-listed tools', '6 read · 0 write', 'Read-only in pilot', 'On Track', 'Write tools only after Gate 3'),
            g('CRM connector', 'CRM team', 'Status', 'In test', 'Live', 'On Track', 'Security test next week'),
          ] },
          { name: 'Local LLM for restricted data', owner: 'AI platform team', progress: 60, status: 'At Risk', ground: [
            g('GPU node (on-prem)', 'Platform engineer', 'Status', 'Live', 'Live', 'On Track', 'Monitoring added'),
            g('KYC masking test', 'QA lead', 'Masking test pass rate', '92%', '100%', 'At Risk', 'Fix PAN number pattern'),
          ] },
        ],
      },
      Governance: {
        problem: 'RBI circulars mapped to controls by hand (~3 weeks); DPDP consent evidence on spreadsheets',
        kpi: 'Days from circular to mapped controls', baseline: '21 days', current: '4 days', target: '< 1 day', status: 'At Risk',
        initiatives: [
          { name: 'Circular → control mapping', owner: 'Compliance manager', progress: 62, status: 'At Risk', ground: [
            g('Compliance ops team', 'Compliance analyst', 'Mapping time', '4 days', '< 1 day', 'At Risk', '2 clauses lack evidence source'),
            g('Policy library', 'Knowledge engineer', 'Policies indexed in RAG', '81%', '100%', 'On Track', 'Index treasury policies'),
          ] },
          { name: 'DPDP consent evidence', owner: 'Data protection officer', progress: 35, status: 'At Risk', ground: [
            g('Mobile app onboarding', 'Digital channel lead', 'Consent captured', '96%', '100%', 'On Track', 'Add re-consent flow'),
            g('Branch onboarding', 'Branch ops head', 'Consent captured', '72%', '100%', 'Delayed', 'Tablet consent rollout to 120 branches'),
          ] },
        ],
      },
    },
  },

  // ─────────────────────────── MANUFACTURING ───────────────────────────
  manufacturing: {
    ctoObjective: 'Fewer ERP incidents, capacity planned before it is needed, and machine spend tied to payback',
    ctoQuestion: 'Will our plants and ERP hold the next peak, and is every machine rupee earning back?',
    tracks: {
      Strategy: {
        problem: 'Four plants at different maturity; AI pilots started where vendors pitched, not where value is',
        kpi: 'Plants with scored maturity baseline', baseline: '0 of 4', current: '3 of 4', target: '4 of 4', status: 'On Track',
        initiatives: [
          { name: 'Plant maturity baseline', owner: 'Transformation office', progress: 75, status: 'On Track', ground: [
            g('Plant 1 · Pune', 'Plant head', 'Maturity score', '3.1 / 5', 'Baseline set', 'On Track', 'Validated'),
            g('Plant 4 · Hosur', 'Plant head', 'Maturity score', 'Not assessed', 'Baseline set', 'At Risk', 'Assessment scheduled week 5'),
          ] },
          { name: 'Use-case inventory & roadmap', owner: 'Strategy lead', progress: 55, status: 'On Track', ground: [
            g('Quality function', 'Quality head', 'Use cases scored', '6 of 8', '8 of 8', 'On Track', 'Visual inspection case pending'),
            g('Maintenance function', 'Maintenance head', 'Use cases scored', '4 of 4', '4 of 4', 'On Track', 'Predictive maintenance ranked #1'),
          ] },
        ],
      },
      Operations: {
        problem: 'ERP incidents recur, root cause takes days, and line and IT capacity are planned late',
        kpi: 'RCA resolution time', baseline: '38 h', current: '9 h', target: '6 h', status: 'On Track',
        initiatives: [
          { name: 'ERP RCA assistant', owner: 'Plant IT manager', progress: 66, status: 'On Track', ground: [
            g('Plant 2 · Line 3', 'Shift supervisor', 'Defect rate', '1.9%', '1.2%', 'At Risk', 'Recalibrate press P-07 (MFG-D-001)'),
            g('ERP support team', 'SAP basis lead', 'Repeat ERP incidents / month', '5', '≤ 2', 'At Risk', 'Fix month-end lock contention'),
          ] },
          { name: 'Line & IT capacity planning', owner: 'Production planning head', progress: 40, status: 'At Risk', ground: [
            g('Line 1', 'Line supervisor', 'Utilisation', '94%', '< 90%', 'Delayed', 'Add shift (DEC-OPS-001)'),
            g('ERP servers', 'Infra lead', 'Month-end CPU', '96%', '< 80%', 'Delayed', 'Hybrid capacity (DEC-OPS-001)'),
            g('Line 2', 'Line supervisor', 'Utilisation', '71%', '< 90%', 'On Track', 'Absorb 30% of Plant 2 CNC load'),
          ] },
        ],
      },
      Finance: {
        problem: 'Machine and infrastructure CAPEX takes ~45 days to approve and rarely shows payback',
        kpi: 'CAPEX approval cycle time', baseline: '45 days', current: '21 days', target: '10 days', status: 'On Track',
        initiatives: [
          { name: 'CAPEX approval with evidence', owner: 'Plant controller', progress: 69, status: 'On Track', ground: [
            g('Plant 2 · CNC request', 'Plant 2 head', 'Decision', 'Defer (MFG-D-002)', 'Decided', 'On Track', 'Shift load to Plant 4'),
            g('Plant 4 · press line', 'Plant 4 head', 'Payback', '2.1 years', '< 3 years', 'On Track', 'Approved; post-review in Q3'),
          ] },
          { name: 'OPEX / CAPEX portfolio', owner: 'IT finance partner', progress: 60, status: 'On Track', ground: [
            g('ERP platform', 'Pankaj', 'Funding · decision', 'CAPEX · expand hybrid', 'Decided', 'On Track', 'Awaiting DEC-OPS-001 approval'),
            g('MES hosting', 'MES lead', 'Funding · decision', 'OPEX · review', 'Decided', 'At Risk', 'Compare cloud MES quote'),
          ] },
        ],
      },
      ROI: {
        problem: 'Payback on automation and machines is not tracked after the money is spent',
        kpi: 'Investments with post-spend value review', baseline: '0%', current: '57%', target: '100%', status: 'On Track',
        initiatives: [
          { name: 'Business case before spend', owner: 'PMO lead', progress: 86, status: 'On Track', ground: [
            g('Plant AI initiatives', 'Initiative owners', 'With ROI case', '6 of 7', '7 of 7', 'On Track', 'Workflow automation case due'),
          ] },
          { name: 'Payback tracking', owner: 'Finance business partner', progress: 48, status: 'At Risk', ground: [
            g('RCA assistant', 'Plant IT manager', 'Realised vs identified', '₹3.1 / 5.8 Cr', '₹5.8 Cr', 'On Track', 'Scrap savings verified by finance'),
            g('Predictive maintenance', 'Maintenance head', 'Realised vs identified', '₹2.9 / 6.4 Cr', '₹6.4 Cr', 'At Risk', 'Extend to Plant 1 compressors'),
          ] },
        ],
      },
      Innovation: {
        problem: 'Maintenance is calendar-based; critical presses fail between services',
        kpi: 'Unplanned downtime', baseline: '52 h/mo', current: '29 h/mo', target: '15 h/mo', status: 'On Track',
        initiatives: [
          { name: 'Predictive maintenance', owner: 'Maintenance head', progress: 62, status: 'On Track', ground: [
            g('Press P-07 · Plant 2', 'Maintenance engineer', 'Sensors streaming', 'Live', 'Live', 'On Track', 'Anomaly model in shadow'),
            g('Compressors · Plant 1', 'Maintenance engineer', 'Data retention', '7 days', '12 months', 'Delayed', 'Historian storage upgrade'),
          ] },
          { name: 'Digital twin of Line 3', owner: 'R&D lead', progress: 15, status: 'On Track', ground: [
            g('Line 3', 'Process engineer', 'Stage', 'Explore', 'Pilot by Q2', 'On Track', 'Vendor-neutral PoC scoping'),
          ] },
        ],
      },
      Governance: {
        problem: 'Supplier and safety compliance evidence takes ~3 weeks to assemble; certificates expire unnoticed',
        kpi: 'Audit preparation time', baseline: '15 days', current: '6 days', target: '2 days', status: 'At Risk',
        initiatives: [
          { name: 'Supplier certificate tracking', owner: 'Procurement compliance', progress: 52, status: 'At Risk', ground: [
            g('Tier-1 suppliers', 'Supplier quality engineer', 'Valid certificates', '74%', '100%', 'At Risk', '3 expire within 30 days'),
          ] },
          { name: 'Safety incident digitisation', owner: 'EHS head', progress: 45, status: 'At Risk', ground: [
            g('Plant 3', 'EHS officer', 'Incidents logged digitally', '40%', '100%', 'Delayed', 'Replace paper log with mobile form'),
            g('Plant 4', 'EHS officer', 'Incidents logged digitally', '55%', '100%', 'At Risk', 'Train shift supervisors'),
          ] },
        ],
      },
    },
  },

  // ────────────────────────────── RETAIL ──────────────────────────────
  retail: {
    ctoObjective: 'Survive festive peaks, pay for capacity only when used, and personalise only with consent',
    ctoQuestion: 'Will we stay up during the Diwali sale, and is every personalisation call DPDP-compliant?',
    tracks: {
      Strategy: {
        problem: 'Store ops and e-commerce run separate AI projects with no shared priorities',
        kpi: 'Use cases scored on one portfolio', baseline: '0%', current: '40%', target: '100%', status: 'On Track',
        initiatives: [
          { name: 'Unified AI portfolio', owner: 'Chief digital officer', progress: 40, status: 'On Track', ground: [
            g('E-commerce team', 'Product lead', 'Use cases scored', '9 of 11', '11 of 11', 'On Track', 'Search ranking case pending'),
            g('Store operations', 'Regional ops head', 'Use cases scored', '3 of 10', '10 of 10', 'At Risk', 'Workshop with 4 regional heads'),
          ] },
          { name: 'Maturity baseline', owner: 'Transformation office', progress: 60, status: 'On Track', ground: [
            g('Online business', 'Head of e-commerce', 'Maturity score', '2.9 / 5', 'Baseline set', 'On Track', 'Validated'),
            g('Store network', 'Head of stores', 'Maturity score', '2.2 / 5', 'Baseline set', 'On Track', 'Validated'),
          ] },
        ],
      },
      Operations: {
        problem: 'Site slowdowns and warehouse backlogs during the Diwali sale; peak capacity planned by gut feel',
        kpi: 'Peak-hour site uptime', baseline: '97.2%', current: '99.1%', target: '99.9%', status: 'On Track',
        initiatives: [
          { name: 'Festive-peak site capacity', owner: 'Head of e-commerce tech', progress: 70, status: 'On Track', ground: [
            g('Web tier', 'SRE lead', 'Load test', '3× passed', '4× normal traffic', 'At Risk', 'Run 4× test before sale'),
            g('Checkout API', 'Payments engineer', 'p95 latency', '1.8 s', '< 1 s', 'At Risk', 'Cache stock checks'),
          ] },
          { name: 'Fulfilment capacity', owner: 'Warehouse operations head', progress: 55, status: 'At Risk', ground: [
            g('Bhiwandi warehouse', 'Warehouse manager', 'Forecast peak backlog', '14 h', '< 8 h', 'At Risk', '2 temporary pick shifts (RTL-D-001)'),
            g('Bengaluru DC', 'DC manager', 'Pick rate / hour', '410', '450', 'On Track', 'Slotting optimised'),
          ] },
        ],
      },
      Finance: {
        problem: 'Infrastructure sized for peak all year — about 60% idle outside the festive season',
        kpi: 'Infra cost per 1,000 orders', baseline: '₹410', current: '₹340', target: '₹250', status: 'At Risk',
        initiatives: [
          { name: 'Seasonal cloud burst model', owner: 'IT finance partner', progress: 44, status: 'At Risk', ground: [
            g('Owned server estate', 'Infra manager', 'Off-season utilisation', '40%', '> 70%', 'Delayed', 'Retire 30% of owned capacity'),
            g('Cloud burst contract', 'Procurement', 'Status', 'Negotiating', 'Signed before Diwali', 'At Risk', 'Final pricing round'),
          ] },
        ],
      },
      ROI: {
        problem: 'AI pilots claim ROI without a baseline, so value cannot be compared across pilots',
        kpi: 'Pilots with a captured baseline', baseline: '0 of 3', current: '2 of 3', target: '3 of 3', status: 'At Risk',
        initiatives: [
          { name: 'Baseline before pilot', owner: 'PMO lead', progress: 66, status: 'At Risk', ground: [
            g('Markdown pilot', 'Category manager', 'Baseline', 'Captured', 'Captured', 'On Track', 'Sell-through baseline set'),
            g('Personalisation pilot', 'CRM lead', 'Baseline', 'Missing', 'Captured', 'Delayed', 'No value claim until baseline'),
          ] },
          { name: 'Value realisation', owner: 'Finance business partner', progress: 23, status: 'On Track', ground: [
            g('Demand forecasting', 'Data science lead', 'Realised vs identified', '₹1.4 / 6.1 Cr', '₹6.1 Cr', 'On Track', 'South region first'),
          ] },
        ],
      },
      Innovation: {
        problem: 'Markdowns decided late; stock-outs and excess stock in the same week',
        kpi: 'Stock-out rate', baseline: '8.5%', current: '6.1%', target: '3.0%', status: 'On Track',
        initiatives: [
          { name: 'SKU-store demand forecasting', owner: 'Data science lead', progress: 50, status: 'On Track', ground: [
            g('South region · 38 stores', 'Regional merchandiser', 'Forecast accuracy', '78%', '85%', 'On Track', 'Add weather signal'),
            g('North region · 52 stores', 'Regional merchandiser', 'Stage', 'Data prep', 'Shadow', 'At Risk', 'POS history gaps in 9 stores'),
          ] },
          { name: 'Markdown recommendations', owner: 'Merchandising director', progress: 35, status: 'On Track', ground: [
            g('Winter range · 140 SKUs', 'Category manager', 'Decision', 'RTL-D-002 catalogued', 'Shadow', 'On Track', 'Margin floor policy encoded'),
          ] },
        ],
      },
      Governance: {
        problem: 'Personalisation uses customer data without verifiable DPDP consent; no erasure workflow',
        kpi: 'Personalisation calls with valid consent', baseline: '52%', current: '78%', target: '100%', status: 'At Risk',
        initiatives: [
          { name: 'Consent before personalisation', owner: 'Data protection officer', progress: 54, status: 'At Risk', ground: [
            g('Mobile app', 'App product lead', 'Consent captured', '91%', '100%', 'On Track', 'Granular purpose toggles'),
            g('Store loyalty data', 'Loyalty manager', 'Consent captured', '52%', '100%', 'Delayed', 'Block personalisation until consented'),
          ] },
          { name: 'Erasure on request', owner: 'Privacy operations', progress: 61, status: 'At Risk', ground: [
            g('Customer service desk', 'CS lead', 'Requests closed in SLA', '61%', '100%', 'At Risk', 'Automate erasure across 4 systems'),
          ] },
        ],
      },
    },
  },
}
