# CTO360 Enterprise 360 Domain Dashboard — specification (received 6 Oct 2026)

> The user's second requirement, saved as received (condensed formatting, all requirements kept).
> It works alongside `docs/SIMULATION_SPEC.md`. The merged plan is in `PROJECT_NOTES.md` section 23.

Enhance each domain page (Banking, Retail, Manufacturing) with a highly visual **Enterprise 360 dashboard covering 16 enterprise functions**. Clearly separate functions **owned by the CTO** from functions that **provide cross-functional signals to the CTO**.

Do not position CTO360 as replacing CEO, CFO, COO, CISO, CHRO or other CXO systems. It is a **CTO decision intelligence layer** that consumes relevant signals from across the enterprise.

## 1. Common design for all 3 domains (different, realistic synthetic data each)

Every domain contains:

- Executive summary
- 16 function cards
- Function health score
- KPI tracking
- Target vs actual
- Monthly trend
- Risk indicators
- Financial, technology and business impact
- Open issues
- Strategic initiatives
- Recommended actions
- Cross-functional dependencies
- Drill-down dashboards

Label the data as simulated.

## 2. Executive 360 overview (top of each domain)

KPIs: Enterprise Health, Technology Health, Business Performance, Transformation Progress, Digital Maturity, AI Maturity, Architecture Health, Operational Health, Cyber Risk, Compliance Health, Customer Experience, Employee Experience, Budget Health, Innovation Index.

Large KPI cards show metric, current value, target, variance, trend and status. Example: Technology Health 87%, target 92%, +3% QoQ, AMBER.

Use Green / Amber / Red consistently, with a 12-month trend where meaningful.

## 3. Sixteen function cards

Each function lists its executive owner, what it tracks, its visuals and the CTO question it answers.

### 1. Corporate Strategy
- **Owner:** CEO / CSO
- **Track:** strategic objectives achieved, transformation progress, initiative health, value realisation, digital transformation progress, technology alignment, strategic risk, OKR achievement.
- **Visuals:** strategy execution score, OKR progress rings, initiative timeline, value realisation chart, strategy risk heatmap.
- **CTO question:** Are technology investments aligned with enterprise strategy?

### 2. Finance
- **Owner:** CFO
- **Track:** technology budget, actual spend, variance, CAPEX, OPEX, cloud spend, software spend, vendor spend, cost savings, technology ROI, AI investment, transformation investment.
- **Visuals:** budget vs actual, monthly spend, cost distribution, ROI trend, forecast, savings realisation.
- **CTO question:** Are technology investments producing measurable financial value?

### 3. Technology
- **Owner:** CTO / CIO
- **Track:** technology health, availability, technical debt, modernisation progress, platform health, cloud adoption, legacy systems, lifecycle, major incidents, technology cost.
- **Visuals:** health score, platform health cards, lifecycle chart, legacy vs modern, incident trend, cloud adoption trend.
- **CTO question:** Is the technology estate scalable, resilient and sustainable?

### 4. Enterprise Architecture
- **Owner:** CTO / CIO. LeanIX-style signals.
- **Track:** business capabilities, applications, critical / redundant / legacy apps, EOL technologies, architecture compliance, rationalisation, integration dependencies, modernisation candidates, architecture risk.
- **Visuals:** capability heatmap, application portfolio matrix, technology lifecycle, current vs target architecture, dependency visualisation, architecture risk heatmap.
- **Drill-down:** Capability → Application → API → Data → Technology → Infrastructure.
- **CTO question:** Does our architecture support the future business strategy?

### 5. Product & Innovation
- **Owner:** CPO / CTO
- **Track:** product portfolio, new products, innovation pipeline, experiment success, time to market, digital adoption, innovation investment and ROI, AI-enabled products.
- **Visuals:** innovation funnel, product portfolio, experiment pipeline, time-to-market trend, innovation investment vs return.
- **CTO question:** Are we converting technology innovation into business value?

### 6. Engineering & R&D
- **Owner:** CTO. Jellyfish-style signals.
- **Track:** capacity, delivery velocity, deployment frequency, lead time, change failure rate, MTTR, engineering allocation, technical debt, defect rate, release predictability, developer productivity.
- **Visuals:** engineering health, DORA metrics, delivery trend, capacity allocation, tech-debt trend, release calendar.
- **CTO question:** Is engineering capacity aligned with strategic priorities?

### 7. Operations
- **Owner:** COO. Celonis / Signavio-style signals.
- **Track:** process efficiency, cycle time, SLA compliance, automation rate, bottlenecks, deviations, operational cost, productivity, conformance.
- **Visuals:** process flow, bottleneck heatmap, SLA gauge, cycle-time trend, automation %, conformance.
- **CTO question:** Where can technology remove operational friction?

### 8. Sales
- **Owner:** CRO / CSO
- **Track:** revenue, pipeline, win rate, conversion, sales cycle, digital channel contribution, CRM health, technology-influenced revenue, forecast accuracy.
- **Visuals:** revenue trend, pipeline funnel, conversion funnel, forecast vs actual, digital sales contribution.
- **CTO question:** How is technology influencing revenue growth?

### 9. Marketing
- **Owner:** CMO
- **Track:** campaign performance, CAC, digital engagement, marketing ROI, conversion, personalisation effectiveness, digital traffic, AI-enabled campaigns.
- **Visuals:** marketing funnel, channel performance, CAC trend, campaign ROI, digital engagement.
- **CTO question:** Are data and technology improving customer acquisition?

### 10. Customer Experience & Service
- **Owner:** CXO / COO
- **Track:** NPS, CSAT, customer effort, service availability, response time, resolution time, digital adoption, complaints, AI-assisted service, self-service rate.
- **Visuals:** customer journey, NPS trend, CSAT gauge, digital adoption, service issue heatmap.
- **CTO question:** Where is technology affecting customer experience?

### 11. Human Resources
- **Owner:** CHRO
- **Track:** headcount, technology workforce, AI skills, critical skill gaps, attrition, hiring, productivity, learning completion, digital skills maturity.
- **Visuals:** workforce composition, skills heatmap, AI skills maturity, attrition trend, hiring pipeline.
- **CTO question:** Do we have the talent required for the technology strategy?

### 12. Cybersecurity
- **Owner:** CISO
- **Track:** security posture, critical and open vulnerabilities, mean time to remediate, security incidents, identity risks, cloud security, endpoint coverage, security debt, Zero Trust adoption.
- **Visuals:** cyber risk score, vulnerability trend, risk heatmap, incident trend, Zero Trust maturity, attack-surface summary.
- **CTO question:** What technology risks require executive intervention?

### 13. Risk & Compliance
- **Owner:** CRO. Vanta / Drata-style signals.
- **Track:** enterprise risks, technology risks, compliance score, control effectiveness, open findings, audit readiness, policy compliance, regulatory exposure, AI governance risks.
- **Visuals:** enterprise risk heatmap, compliance score, control coverage, open findings, risk trend, audit readiness.
- **CTO question:** Are technology risks within enterprise risk appetite?

### 14. Legal
- **Owner:** CLO
- **Track:** technology contracts, data privacy issues, AI legal risks, IP risks, regulatory obligations, contract renewals, data residency, open legal issues.
- **Visuals:** legal risk heatmap, contract renewal timeline, privacy compliance, AI legal risk summary.
- **CTO question:** Are technology decisions creating legal or regulatory exposure?

### 15. Procurement & Vendor Management
- **Owner:** CPO / COO
- **Track:** strategic and technology vendors, vendor spend, contract value, vendor risk, SLA performance, renewals, vendor concentration, licence utilisation, savings opportunities.
- **Visuals:** vendor portfolio, vendor risk matrix, spend distribution, contract timeline, SLA performance, licence utilisation.
- **CTO question:** Are technology vendors delivering appropriate value and resilience?

### 16. Data & AI
- **Owner:** CDO / CAIO / CTO
- **Track:** data quality, data platform health, AI use cases (total / in production), AI ROI, model performance, AI adoption, responsible-AI compliance, agentic AI initiatives, data governance, AI risk, AI cost.
- **Visuals:** AI portfolio, use-case funnel, data quality score, AI maturity, model health, AI value realisation, AI risk heatmap.
- **CTO question:** Are Data and AI producing measurable and governed business value?

## 4. Domain-specific data (never reuse identical datasets)

- **Banking**
  - Areas: Core Banking, Payments, Cards, Lending, Deposits, Treasury, Fraud, KYC, AML, Mobile Banking, Internet Banking, Customer Service, Regulatory Reporting.
  - Metrics: transaction availability, payment success rate, fraud losses, digital adoption, core banking modernisation, regulatory compliance, CX, API performance.
- **Retail**
  - Areas: E-commerce, POS, Inventory, Supply Chain, Warehouse, Pricing, Promotions, Loyalty, Customer Data, Order Management, Delivery, Store Technology.
  - Metrics: digital revenue, conversion, cart abandonment, inventory accuracy, stockouts, order fulfilment, retention, store availability, supply-chain efficiency.
- **Manufacturing**
  - Areas: ERP, MES, PLM, CAD, Digital Engineering, Production, Quality, Maintenance, Supply Chain, Warehouse, IoT, Digital Twin, Robotics, AI Vision.
  - Metrics: OEE, throughput, downtime, first-pass yield, scrap, quality, engineering cycle time, predictive maintenance, automation, digital engineering maturity.

## 5. Cross-functional intelligence

Do not keep the 16 functions isolated. Correlate them, e.g. EA + Cyber + Finance + Operations + CX → CTO decision.

Example: "Three customer-facing applications run on end-of-life technology. They generated 41% of P1 incidents this quarter and support 28% of digital transactions."

Show evidence, business / financial / technology impact, risk, recommendation, priority, executive owner and target date.

## 6. CTO Decision Center: Top 10

Each item has: decision, why now, business / technology / financial impact, risk, recommended action, responsible executive, confidence, deadline and status.

Example: Modernise Core Banking Integration Layer.

| Field | Value |
|---|---|
| Priority | Critical |
| Business impact | High |
| Technology risk | High |
| Investment | ₹8.4 Cr |
| Expected benefit | ₹13.2 Cr over 3 years |
| Recommendation | Approve phased API modernisation |

## 7. Enterprise health heatmap

16 rows (functions) × columns Strategy, Performance, Cost, Technology, Risk, Transformation, Overall. Green / Amber / Red. Click a row to open that function's dashboard.

## 8. Metric design

Every important metric has: current, target, previous period, variance, trend, status, owner and last updated. Never show a number without context.

Example: Cloud Spend — current ₹4.2 Cr, target ₹3.8 Cr, variance +10.5%, trend increasing, status Amber, owner CTO, updated 2 hours ago.

## 9. Time series and chart rules

Time ranges: 30 days / Quarter / 6 months / 12 months.

| Chart | Use for |
|---|---|
| Line / area | Trends |
| Bar | Comparisons |
| Donut | Meaningful composition only |
| Heatmap | Risk and maturity |
| Gauge | Sparingly, executive KPIs only |

## 10. High visual design

About 70% visual, 30% text. Favour:

- KPI cards and trend charts
- Heatmaps, portfolio matrices and capability maps
- Dependency diagrams, timelines and funnels
- Risk matrices, progress indicators and scorecards

No long paragraphs. Each screen's main message should land in about 5 seconds.

## 11. Drill-down model

Enterprise → Domain → Function → KPI → Initiative → Application / Process → Issue → Evidence → Decision → Action.

The executive layer stays simple; technical detail appears only after drill-down.

## 12. Tool signal mapping (conceptual categories only; no copied UIs, trademarks, layouts or datasets)

| Source | Area |
|---|---|
| Planview | Strategy, portfolio, investment |
| SAP LeanIX | Enterprise architecture |
| Celonis / SAP Signavio | Process intelligence |
| ServiceNow SPM | Portfolio execution, enterprise work |
| Jellyfish | Engineering intelligence |
| Datadog | Operations and observability |
| Vanta / Drata | Security, compliance and evidence |

## 13. CTO360 intelligence layer

16 functions + 7 tool-signal categories + 3 domains + historical metrics + business KPIs + technology KPIs + risk signals + financial signals feed the CTO360 Intelligence Layer.

The layer runs **Detect → Correlate → Prioritise → Recommend → Decide → Track → Measure → Optimise**.

## 14. Maturity tracking

Levels:

1. Visibility
2. Managed Tracking
3. Standardised
4. Quantitatively Managed
5. Continuous Optimisation

Show current, target, gap, improvement initiatives, owner and target date. **Do not claim CMMI certification**; this is a simulation and management visualisation only.

## 15. Final CTO view: one screen answers

1. Are we delivering the business strategy?
2. Where is technology investment going?
3. Are we within budget?
4. Which transformations are at risk?
5. Is our architecture healthy?
6. Are critical systems reliable?
7. Is engineering delivering effectively?
8. Where is technical debt increasing?
9. What are the biggest cyber risks?
10. Are we compliant?
11. Are vendors performing?
12. Are Data and AI delivering value?
13. What is affecting customers?
14. Where are the largest business risks?
15. What requires my decision today?
16. What should we optimise next?

Must not become 16 disconnected reporting dashboards. The objective chain:

**Enterprise Signals → CTO Context → Cross-Functional Intelligence → Prioritised Decisions → Governed Actions → Measurable Business Outcomes → Continuous Optimisation**
