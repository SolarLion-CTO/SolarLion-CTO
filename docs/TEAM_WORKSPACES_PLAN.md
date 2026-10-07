# CTO360 — Team workspaces plan (M7), 7 Oct 2026

> **v2, deep design (this section leads; the earlier sections below remain as detail).**
> These five pages are the **main capstone problem statement**. Each page simulates a real-world problem using real practices, real analytical techniques and simulated versions of the tools enterprises actually use. All data is synthetic and labelled "Simulated".

## A. Capstone problem statement (umbrella)

> Enterprises investing in AI-led transformation cannot **see, govern, fund and run** it as one system.
> - Strategy and ROI, regulation and AI governance, technology spend and operations are owned by different people using different tools.
> - So AI stays stuck in pilots, risk is unmanaged, spend can't be tied to value, and operations keep firefighting.
>
> **CTO360** simulates a real enterprise (3 business units) and shows how a CTO-led team uses one decision-intelligence layer to move each area **from current state to target state, measurably**, with AI recommending and humans deciding.

**Every page follows the same 10-part structure:**
1. Real-world problem
2. Old state → target state
3. Measures: baseline → current → target, with progress and glide path
4. Real-world practices and frameworks
5. Simulated tools
6. Analytical techniques (genuinely computed in the app)
7. Live scenario (scripted on the simulation clock)
8. Decisions and approvals (TEDIF: AI recommends, humans decide)
9. Outcome measurement
10. Limits (what is simulated)

## B. The golden thread: one live cross-team scenario (the thesis, made visible)

**"Month-end close meets festive peak."** It plays on the simulation clock (about 2–3 minutes) and restarts with Reset.

| Step | Owner | What happens live | Source (simulated) |
|---|---|---|---|
| 1 | **Pankaj** | ERP month-end batch overruns; capacity headroom on order and payment services drops below 10%; anomaly flagged; linked to a recurring problem record | Datadog telemetry, ERP batch monitor, ServiceNow problem |
| 2 | **Ram** | The control tower correlates it with the retail festive peak and the banking salary-day load; a decision card is raised: "Add peak capacity before 15 Oct" | All sources, correlation engine |
| 3 | **Santhosh** | Options costed: cloud burst (OPEX ₹x) vs hardware (CAPEX ₹y) vs re-scheduling batches (₹0). The FinOps check shows last festive burst's cost per order | Cloud billing (FOCUS-style), Planview |
| 4 | **Suman** | Proposes the "AI demand forecasting" use case to predict peaks ahead of time; ROI and payback shown; promoted to pilot | AI portfolio, MLOps telemetry |
| 5 | **Vaibhav** | Governance check: cloud-burst data residency (DPDP), forecasting model risk tier = Medium; approves with conditions | Vanta controls, model register |
| 6 | **Ram** | Approves; actions are created for all 4 owners; headroom recovers to above 30% on the live gauges; the outcome is recorded | Decision Center → Action tracker → Outcomes |

The `/team` page shows this as a **timeline with each owner's step lighting up**. Each workspace shows its own step in context.

## C. Analytical techniques, all computed in the browser on synthetic data
| Technique | Used for | Where |
|---|---|---|
| Event correlation (time window + shared record IDs) | Joining signals across tools | Ram |
| ITIL impact × urgency priority, weighted scoring | Decision and use-case prioritisation | Ram, Suman |
| Monte Carlo simulation (P10 / P50 / P90) | Benefit ranges, programme ETA | Suman, Ram |
| NPV, IRR, payback | Investment gates, AI ROI | Suman, Santhosh |
| Adoption S-curve | AI adoption trajectory | Suman |
| Rule-based NLP extraction with confidence (pluggable live-LLM later) | Regulatory obligations from circulars | Vaibhav |
| Risk tiering (impact × autonomy × data sensitivity) | AI model risk | Vaibhav |
| Population Stability Index (PSI) drift detection | Model drift alerts | Vaibhav |
| SLA / regulatory clocks | Breach reporting, obligation deadlines | Vaibhav |
| TBM allocation (cost pools → IT towers → apps → domains) | Cost transparency, CAPEX / OPEX | Santhosh |
| Holt-Winters seasonal forecasting | Spend forecast, capacity forecast | Santhosh, Pankaj |
| Anomaly detection (EWMA / z-score) | Cloud spend spikes, telemetry anomalies | Santhosh, Pankaj |
| Pareto + keyword clustering of incidents | Root-cause analysis | Pankaj |
| Change correlation (incident within 24 h of a change) | Change-induced incidents | Pankaj |
| Utilisation → latency curve (queueing, Little's law) | Peak what-if scenarios | Pankaj |
| SRE error budget and burn rate | ERP / service reliability | Pankaj |
| Glide path and progress % | Current → target on every page | All |

## D. The five pages in depth

### D1. CTO Control Tower · Ram: *integrate, decide, prove outcomes*
| Part | Content |
|---|---|
| **Problem** | The CTO receives 7+ tool reports; cross-tool causes are found late; decisions wait for steering meetings; nobody checks whether decisions worked |
| **Old → target** | Separate BU reporting, 3-week decision cycle → one framework across 3 BUs, signal-to-decision in ≤ 3 days, 80% of decisions outcome-tracked |
| **Measures** | Domains on one framework (0 → 3) · signal-to-decision days (21 → 3) · decisions with measured outcome (0% → 80%) · enterprise health (≈ 70 → 85) · programmes on track (% → 85%) |
| **Practices** | Control tower, portfolio governance, ITIL priority matrix, AIOps-style correlation, TEDIF gates |
| **Simulated tools** | All 7 (aggregated) plus 5 simulated AI agents (Delivery, Reliability, Risk, Finance, Compliance) |
| **Techniques** | Event correlation, priority scoring, Monte Carlo programme ETA |
| **Tabs** | Transformation · Multi-domain (heatmaps) · Agents & correlation (agent → signals → correlated decision, live) · Golden thread (conductor view) · Programme tracker |
| **Live** | Agents raise signals as events arrive; the golden-thread decision appears at its scripted time |

### D2. AI Transformation · Suman: *from pilots to measurable value, for any organisation*
| Part | Content |
|---|---|
| **Problem** | "Pilot purgatory": most AI pilots never reach production; ROI is unproven; every new business unit starts from scratch |
| **Old → target** | Scattered pilots, no value tracking → stage-gated AI portfolio, value tracked per use case, any organisation onboarded from a template in weeks |
| **Measures** | AI readiness (≈ 2 → 4 / 5) · use cases in production · pilot-to-production conversion (≈ 20% → 60%) · AI value realised (₹ Cr) · payback (≈ 30 → 18 months) · adoption % |
| **Practices** | 5-level AI maturity model, stage-gate portfolio (idea → PoC → pilot → production → scaled), benefits-realisation management, value × feasibility prioritisation, change and adoption management, TEDIF gates |
| **Simulated tools** | Planview (portfolio), Jellyfish (capacity), simulated MLOps platform (model telemetry), business data (adoption) |
| **Techniques** | Weighted scoring, NPV / payback, Monte Carlo benefit fan (P10–P90), adoption S-curve, funnel conversion analytics, template rule engine |
| **Tabs** | Transformation · Readiness (6-dimension radar per BU) · Portfolio & gates (funnel, value × feasibility 2×2, Kanban, gate reviews) · ROI & benefits (payback curve, P10–P90 fan, ranked ROI) · Onboard any organisation (wizard: industry → starter use cases, readiness checklist, 30-60-90 plan, KPIs) |
| **Live** | A pilot meets its success criteria → "Gate review: promote to production?" → Suman approves → value tracking starts; value postings move the tiles |

### D3. Regulatory & AI Governance · Vaibhav: *compliance at the speed of change; trustworthy AI and data* (Banking first)
| Part | Content |
|---|---|
| **Problem** | High volume of regulatory change; manual circular-to-control mapping takes weeks; AI models reach production without inventory or risk review; DPDP consent and breach-reporting clocks are hard to meet |
| **Old → target** | Manual mapping, no model inventory, partial consent → AI-drafted and human-approved obligations in ≤ 2 days, 100% of models registered and approved, full consent coverage, on-time breach reporting |
| **Measures** | Obligations mapped (≈ 45% → 100%) · days per circular (≈ 21 → 2) · models approved (≈ 30% → 100%) · consent coverage (≈ 70% → 100%) · breach reports on time (→ 100%) · control effectiveness |
| **Practices** | GRC obligation library, control mapping, three lines of defence, model risk management, NIST AI RMF, ISO/IEC 42001, RBI responsible-AI guidance, DPDP Act 2023, CERT-In reporting. Reporting clocks are configured in the simulation and are illustrative, not legal advice. |
| **Simulated tools** | Vanta (controls / evidence), simulated regulatory change feed, simulated consent manager, simulated model registry |
| **Techniques** | Rule-based obligation extraction with confidence (live-LLM ready), control-mapping similarity score, AI risk tiering, PSI drift detection, regulatory SLA clocks, evidence-freshness checks |
| **Tabs** | Transformation · Regulatory change (circular → obligations → controls → evidence pipeline) · AI model register & risk (tier heatmap, bias / explainability, PSI drift) · Data governance & DPDP (consent gauge, lineage, breach clock) · Audit readiness |
| **Live** | ① New circular arrives → AI drafts obligations → Vaibhav approves → gaps become actions. ② Model PSI > 0.25 → model "Restricted" pending review. ③ Simulated breach → reporting clocks start. |

### D4. Technology Spend & Investment · Santhosh: *every rupee traceable to a service and a value*
| Part | Content |
|---|---|
| **Problem** | Technology spend is opaque; cloud is shifting CAPEX to OPEX; the business can't see cost per service; investments aren't tracked for value; licence waste |
| **Old → target** | Late spreadsheet tracking → monthly CAPEX / OPEX by BU and service, FinOps in place, every investment stage-gated and value-tracked |
| **Measures** | Forecast accuracy (≈ 80% → 95%) · spend allocated to services (≈ 40% → 95%) · cloud vs plan · licence utilisation (≈ 66% → 85%) · change-the-business share (≈ 33% → 45%) · value realisation % |
| **Practices** | TBM taxonomy (cost pools → towers → solutions), FinOps framework (inform / optimise / operate), FOCUS-style billing data, showback, stage-gate with NPV / IRR, unit economics |
| **Simulated tools** | Planview (investments), ServiceNow (projects / vendors), simulated cloud billing (FOCUS-style), simulated ERP general ledger |
| **Techniques** | TBM allocation, Holt-Winters spend forecast, EWMA anomaly detection on daily cloud cost, variance waterfall, NPV / IRR, what-if (move workload → CAPEX / OPEX shift) |
| **Tabs** | Transformation · CAPEX / OPEX & TBM (stacked months, cost-flow Sankey: pools → towers → BUs) · Budget, forecast & anomalies · FinOps & licences · Investment governance (stage-gate, NPV, value tracking) |
| **Live** | Cloud cost spike detected (retail festive autoscaling) → value or waste? (cost per order) → decision; actuals postings move month-to-date figures |

### D5. ERP RCA, Capacity & Production Automation · Pankaj: *fix causes, not symptoms; capacity before the peak*
| Part | Content |
|---|---|
| **Problem** | ERP incidents recur (month-end batch overruns); root-cause analysis is manual; capacity is added after outages; production planning is manual |
| **Old → target** | Firefighting → problem management with permanent fixes, forecast-driven capacity, automated production planning |
| **Measures** | Recurring ERP problems (≈ 14 → 3) · time to permanent fix (≈ 45 → 10 days) · ERP availability (≈ 99.6% → 99.9%) · minimum capacity headroom (≈ 8% → 30%) · production automation (≈ 40% → 70%) |
| **Practices** | ITIL incident → problem → known error → change, 5-Whys and fishbone, Pareto, ITIL capacity management, SRE (SLOs, error budgets), AIOps |
| **Simulated tools** | Datadog (telemetry), ServiceNow (incident / problem / change), simulated ERP batch monitor, Celonis / Signavio (production processes), MES |
| **Techniques** | Incident keyword clustering + Pareto, change correlation, 5-Whys tree, Holt-Winters capacity forecast with breach-date prediction, utilisation → latency curve, error-budget burn rate, what-if scale-out slider |
| **Tabs** | Transformation · ERP RCA (Pareto, problem records, change correlation, 5-Whys) · Capacity & forecasting (live gauges, forecast-to-breach, headroom heatmap) · Peak scenarios (month-end, salary day, festive; what-if) · Production automation |
| **Live** | Live telemetry ticks; the golden-thread month-end overrun spikes gauges → anomaly → linked recurring problem → suggested permanent fix → capacity request flows to Santhosh |

### D6. Team & accountability (`/team`)
- **Content:**
  - the capstone problem statement
  - a **transformation scorecard** (overall and per owner; Ahead / On track / Behind counts)
  - a **golden-thread timeline**
  - a responsibility matrix (RACI) across workstreams
  - BP1 coverage
  - a team live feed

## E. Honesty and limits (shown on each page under "About this simulation")
- All data is synthetic and seeded. Tool names are simulated categories only (see the disclaimer).
- The techniques (forecasting, Monte Carlo, PSI, Pareto, NPV) are **really computed** in the app on the synthetic data.
- NLP extraction is rule-based today. It can switch to a live LLM once a provider and key are chosen (pending decision).
- Regulatory timelines are illustrative and must be validated with Compliance before any real use.

## F. Revised build plan (v2)
| Step | Scope | Effort |
|---|---|---|
| M7.1 | Workspace shell + Transformation tab component + analytics library (forecast, Monte Carlo, PSI, EWMA, NPV, Pareto) + scenario engine (golden thread) + `/team` + Ram | ~1.25 days |
| M7.2 | Suman | ~1 day |
| M7.3 | Vaibhav | ~1 day |
| M7.4 | Santhosh | ~0.75 day |
| M7.5 | Pankaj | ~1 day |
| M7.6 | Golden thread end-to-end, validation, full overflow sweep, notes | ~0.5 day |
| **Total** | | **~5.5 days** |

---

One sidebar group **TEAM** with five owner workspaces plus an accountability page.
Every workspace uses the same layout and the same simulated, linked data as the rest of CTO360, so numbers agree across pages.
"Real time" here means the **CTO360 simulation clock**: seeded events and telemetry that tick live, always labelled as simulated.

```
TEAM
  Team & accountability                         /team
  CTO Control Tower · Ram                       /team/ram
  AI Transformation · Suman                     /team/suman
  Regulatory & AI Governance · Vaibhav          /team/vaibhav
  Technology Spend & Investment · Santhosh      /team/santhosh
  ERP RCA & Capacity · Pankaj                   /team/pankaj
```

## Transformation tracking: current state → target state (added 7 Oct 2026, applies to ALL workspaces)

**Every workspace opens on a "Transformation" tab** (tab 0, before the four functional tabs) that measures movement from the old state to the target state.

### Model
| Term | Definition |
|---|---|
| **Baseline (old state)** | Value at programme start, **Nov 2025** = `series[0]` of the metric (12-month history already exists) |
| **Current** | Value today (`series[11]`, Oct 2026) |
| **Target (target state)** | Agreed value with a **target date** |
| **Progress %** | (current − baseline) ÷ (target − baseline), capped at 0–100%. Respects the metric's direction (up or down is better). |
| **Time elapsed %** | (today − Nov 2025) ÷ (target date − Nov 2025) |
| **Glide path** | **Ahead** if progress ≥ time elapsed + 10 · **On track** if within ±10 · **Behind** if progress < time elapsed − 10 |
| **ETA** | Linear projection from the last 3 months' trend; "not reached on current trend" if the trend is flat or wrong-way |

Progress is **calculated, never typed**. `validate:sim` checks that baseline = first series point and that progress uses the right direction.

### Visuals on the Transformation tab
1. **From → To cards:** a two-column narrative of the old state vs the target state (3–4 bullets each).
2. **Transformation bridge:** one row per measure: baseline ── ● current ── target, with progress %, glide-path status and ETA.
3. **Glide-path chart:** planned straight line from baseline to target vs actual monthly line, per selected measure.
4. **Maturity ladder:** L1–L5, now vs target (same scale as the Decision Intelligence maturity view).
5. **Transformation score:** average progress of the owner's measures, shown in the owner banner.

### Old state → target state, per owner
| Owner | Old state (Nov 2025) | Target state | Measures (baseline → target) |
|---|---|---|---|
| **Ram** | Each business unit reports separately; decisions in steering meetings weeks later | One CTO view across 3 domains; signal-to-decision in days; outcomes tracked | Domains on one framework; signal-to-decision days; decisions with measured outcomes; enterprise health; signals correlated / month |
| **Suman** | Scattered AI pilots, no ROI tracking | AI portfolio with stage gates; value tracked per use case; any organisation onboarded from a template | AI readiness (1–5); use cases in production; AI value realised (₹ Cr); payback (months); adoption % |
| **Vaibhav** | Manual regulatory mapping; no AI model inventory; partial DPDP consent | AI-drafted, human-approved obligations; every model registered and approved; full consent coverage | Obligations mapped %; days per circular; models approved %; consent coverage %; breaches reported within 72 h % |
| **Santhosh** | Spend tracked late in spreadsheets; CAPEX / OPEX unclear | Monthly CAPEX / OPEX by domain; every investment gated and value-tracked | Forecast accuracy %; change-the-business share %; cloud vs plan; licence utilisation %; value realisation % |
| **Pankaj** | ERP firefighting; capacity added after outages | Root-cause fixes; capacity forecast ahead of peaks | Recurring ERP problems; time to permanent fix (days); ERP availability %; minimum capacity headroom %; production automation % |

**Team page addition:** a **transformation scorecard**. It shows overall progress (average of the 5 owners), one progress bar per owner, and counts of measures Ahead / On track / Behind, answering "are we transforming?" in 5 seconds.

**New measures that have no history yet** (e.g. days per circular, signal-to-decision days) get a seeded 12-month series starting at a realistic old-state value.

## Common workspace layout (all five)

```
┌ Owner banner ───────────────────────────────────────────────────────────┐
│ (avatar) Name · Role · Accountable for …        Domain [All|BNK|MFG|RTL] │
│ BP1 problems: ① …  ② …                      Status ● On track / Watch    │
└──────────────────────────────────────────────────────────────────────────┘
 [KPI][KPI][KPI][KPI][KPI][KPI]   ← 6 live KPI cards (current · target · trend · status)
 [Tab 1] [Tab 2] [Tab 3] [Tab 4]
 ┌ main visual ───────────────────────┐ ┌ My decisions & actions ─────┐
 │ charts / heatmaps / funnels         │ │ from Decision Center         │
 └─────────────────────────────────────┘ ├ Live feed (my sources) ─────┤
                                          └──────────────────────────────┘
```
- **Domain filter:** All / Banking / Manufacturing / Retail on every workspace (Vaibhav defaults to Banking).
- **Right rail on every page:** that owner's decisions and actions (filtered from the Decision Center) plus their live event feed.
- **Every number drills down** to the existing source, function or record pages.

---

## 0. Team & accountability (`/team`)
- **5 owner cards:**
  - photo initial, role, BP1 problems
  - 3 headline live KPIs
  - workspace status ring
  - open decisions and actions
  - link to the workspace
- **Accountability matrix (RACI):** workstreams (AI transformation, ROI, regulatory, AI / data governance, CAPEX / OPEX, ERP, capacity, multi-domain, decision intelligence) × 5 people.
- **Coverage tracker:** BP1 problem → workspace tab → status (built / partial).
- **Team pulse (live):** a combined feed of everyone's events.

## 1. CTO Control Tower · Ram (`/team/ram`)
**Accountable for:** agnostic multi-domain framework (Banking, Manufacturing, Retail); AI and multi-agent implementation to track ongoing and new work.

**KPIs:** enterprise health · decisions awaiting · critical risks · value realisation · programmes off track · live events.

| Tab | Visuals |
|---|---|
| Multi-domain view | Domain rings, the 7×3 source heatmap and 16×3 function heatmap (compact), health trend |
| Decision Intelligence | Top 10 queue, approval funnel (raised → approved → actions → outcomes), confidence vs value scatter |
| AI agents & TEDIF | Agent roster (simulated agents per source: "Delivery agent", "Reliability agent", …), the signals each raised today, human-approval rate, TEDIF gates |
| Programme tracker | Initiatives by stage, CTO → developer cascade summary (links to the existing tracker) |

**Live:** agents "raise" signals as clock events arrive, giving a counter of signals correlated today.

## 2. AI Transformation · Suman (`/team/suman`)
**Accountable for:** ① identify ROI; ② transform *any* organisation to AI.

**KPIs:** AI readiness (1–5) · use cases in production · AI value realised (₹ Cr) · AI ROI % · average payback (months) · adoption %.

| Tab | Visuals | Data |
|---|---|---|
| Readiness | **Radar chart**, 6 dimensions (Strategy, Data, Platform, Skills, Governance, Adoption), current vs target per domain; maturity ladder L1–L5 | Derived from existing metrics (strategy fn, data quality, architecture / technology, HR AI skills, responsible-AI, CX AI share) |
| Use-case pipeline | **Funnel:** Idea → PoC → Pilot → Production → Scaled (count and ₹); **value vs effort 2×2**; Kanban by stage | **New:** about 12 AI use cases per domain (stage, owner, investment, expected / realised value, risk tier, model link, app link) |
| ROI & value | Invested vs realised by domain (bars); **payback curve** (cumulative); ROI by use case (ranked bars); the cloud / AI "approved earlier" outcomes | Use cases + initiatives |
| Onboard an organisation | **Template wizard:** pick an industry (Banking, Manufacturing, Retail, + Insurance, Healthcare, Telecom templates). Shows starter use cases, readiness questions, 30-60-90 day roadmap, KPIs to track, governance gates (TEDIF). "Any organisation" = same framework, different template. | **New:** 6 industry templates (static) |

**Live:** a use case moves stage, or a value posting arrives, and the funnel and value tiles update.

## 3. Regulatory & AI Governance · Vaibhav (`/team/vaibhav`, Banking first)
**Accountable for:** ① automate regulatory compliance with implementation; ② DPDP / AI governance.

**KPIs:** obligations mapped % · controls passing % · open findings · AI models approved % · DPDP consent coverage % · breach reports within 72 h %.

| Tab | Visuals | Data |
|---|---|---|
| Regulatory change | **Pipeline:** circular received → AI extracts obligations → human review → mapped to controls → evidence → closed. Sankey-style flow or stepped bars; circular table with deadlines | **New:** about 8 simulated circulars (RBI IT / cyber, CERT-In, DPDP, card / payment security) → about 30 obligations → mapped to existing controls (CTL-…) |
| AI model register | Models table with **risk-tier heatmap**, bias / explainability test status, drift sparkline, approval status, owner; "no model in production without approval" gate | **New:** about 8 models per domain linked to AI apps and use cases |
| Data governance | Critical data elements with owner, quality score, **consent coverage gauge**, **lineage diagram** (source → app → report), DPDP breach clock | **New:** about 10 critical data elements per domain + lineage from app dependencies |
| Audit readiness | Control evidence status by framework (stacked bars), open findings aging, regulator-wise readiness % | Existing Vanta controls and risks |

**Live:** at a set clock time, **a new circular arrives** → AI drafts obligations → "Awaiting Vaibhav's approval" → Approve maps it to controls. A strong demo moment.

## 4. Technology Spend & Investment · Santhosh (`/team/santhosh`)
**Accountable for:** ① governance system; ② apps / resources / decision making, OPEX / CAPEX.

**KPIs:** total technology spend (FY) · CAPEX % / OPEX % · forecast vs budget · run vs change ratio · cloud spend vs plan · licence utilisation %.

| Tab | Visuals | Data |
|---|---|---|
| CAPEX vs OPEX | **Stacked monthly bars** (12 months + 3 forecast), split by domain; **treemap** by category (cloud, licences, people, vendors, projects) | **New:** monthly spend ledger derived from initiative budgets (CAPEX), app run cost (OPEX) and cloud spend metric, reconciled to existing totals |
| Budget vs actual vs forecast | Line chart (budget / actual / forecast); variance waterfall by initiative | Initiatives / projects |
| Run vs change & FinOps | Run vs change donut per domain; cloud cost trend vs plan; licence waste (unused licences × cost); top saving opportunities | Apps, services, procurement metrics |
| Investment governance | **Stage-gate funnel:** business case → approved → in delivery → value tracking; decisions with ₹ ask vs value; approval log | Initiatives + decision cards |

**Live:** actuals postings arrive as spend events, the month-to-date bar grows, and the forecast updates.

## 5. ERP RCA & Capacity · Pankaj (`/team/pankaj`)
**Accountable for:** ① ERP root-cause analysis; ② infrastructure capacity planning; ③ automation of production management.

**KPIs:** ERP availability · recurring problems open · mean time to permanent fix · capacity headroom (min %) · services at risk of capacity breach · automation rate (production processes).

| Tab | Visuals | Data |
|---|---|---|
| ERP RCA | **Pareto chart** of root causes (count + cumulative %); problem records (recurring) with RCA status and fix backlog; incident → problem → change chain | ERP / core services (SAP, core banking, merchandising ERP) incidents + **new** problem records (about 6 per domain) |
| Capacity planning | Utilisation trends (CPU / memory / storage / network) per critical service, **forecast to 80% / 100% threshold** with "breach in N days", headroom heatmap (service × resource) | **New:** seeded 12-month utilisation series for critical services |
| Peak scenarios | Scenario bars: month-end (Manufacturing), salary day (Banking), festive peak (Retail) — demand vs capacity; scale-up recommendation and cost | Derived from utilisation + services |
| Production automation | Plan-to-produce and maintenance process cycle times, MES story status, automation pipeline (links to Process and Manufacturing pages) | Existing processes / stories |

**Live:** **telemetry ticks** every few seconds (utilisation gauges move slightly, seeded); an ERP incident event appears → suggested root cause → "create problem record".

---

## Data to add (all simulated, seeded, validated)
| New data | Per domain | Feeds |
|---|---|---|
| AI use cases | ~12 | Suman |
| Industry templates | 6 (global) | Suman |
| Regulatory circulars → obligations | ~8 → ~30 (Banking deepest) | Vaibhav |
| AI models | ~8 | Vaibhav |
| Critical data elements + lineage | ~10 | Vaibhav |
| Monthly spend ledger (CAPEX / OPEX × category) | 15 months | Santhosh |
| ERP problem records | ~6 | Pankaj |
| Capacity telemetry (4 resources × critical services) | 12 months + live jitter | Pankaj |

`validate:sim` is extended so that:
- spend ledger totals reconcile with initiative and app costs
- every obligation maps to a real control
- models link to real apps
- problem records link to real incidents

## Build order and effort
| Step | Scope | Effort |
|---|---|---|
| M7.1 | Team sidebar group, `/team`, Ram workspace, common workspace shell | ~0.5 day |
| M7.2 | Suman: AI Transformation | ~0.75 day |
| M7.3 | Vaibhav: Regulatory & AI Governance | ~0.75 day |
| M7.4 | Santhosh: Technology Spend & Investment | ~0.5 day |
| M7.5 | Pankaj: ERP RCA & Capacity | ~0.75 day |
| M7.6 | Full checks (build, validate, overflow sweep), notes | ~0.25 day |

Each step ends deployable and is recorded in `PROJECT_NOTES.md`.
