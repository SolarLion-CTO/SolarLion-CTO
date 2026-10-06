# CTO360 — agreed layout mockups (6 Oct 2026)

Approved by the user before M1. Numbers are placeholders; in the build every number is calculated from the simulated data.
Plan: `PROJECT_NOTES.md` §23 (final navigation in §23.8).

## 1. Sidebar + Domain Overview (`/domain/banking`)

```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│ CTO360  Enterprise Technology Control Tower    Business unit [Banking ▾]  ● Simulation live ⏸ ⟲ │
├────────────────────────┬─────────────────────────────────────────────────────────────────┤
│ ◎ Command Center       │ BANKING · Enterprise 360                    [30d][Qtr][6m][12m]  │
│                        │ Simulated enterprise data · no live vendor integrations          │
│ ▾ BANKING              │                                                                  │
│   ■ Overview           │ ┌─ ENTERPRISE HEALTH ─┐ ┌Technology┐┌Business ┐┌Transform┐┌Cyber  ┐│
│   Strategy & Portfolio │ │        78           │ │ 87  ▲3   ││ 81  ▲1  ││ 64  ▼2  ││ 71 ▼4 ││
│     Simulated·Planview │ │  target 85  AMBER   │ │ tgt 92 ● ││ tgt 85 ●││ tgt 75 ●││tgt 85●││
│   Ent. Architecture    │ │  ╱‾‾╲_╱‾‾‾╲_╱‾  12m  │ │ AMBER    ││ GREEN   ││ RED     ││ AMBER ││
│     Simulated·LeanIX   │ └─────────────────────┘ └──────────┘└─────────┘└─────────┘└───────┘│
│   Process Intelligence │  Architecture 69 · Operations 88 · Compliance 81 · CX 76 ·        │
│     Sim·Celonis+Signav.│  Employee 72 · Budget 74 · AI maturity 2.8/5 · Innovation 66      │
│   Portfolio & Workflow │                                                                  │
│     Simulated·SNow SPM │ ┌─ 7 SOURCE SYSTEMS ──────────────────────────────────────────┐  │
│   Engineering Intel.   │ │ Planview  LeanIX  Process  ServiceNow Jellyfish Datadog Vanta│  │
│     Simulated·Jellyfish│ │   84 ●     69 ●    76 ●      73 ●       71 ●     88 ●   81 ● │  │
│   Operations & Observ. │ │ sync 2m   sync 5m  sync 1m   sync 3m    sync 1m  live  sync 4m│  │
│     Simulated·Datadog  │ └──────────────────────────────── click → source sub-page ────┘  │
│   Security, Risk & Gov.│                                                                  │
│     Simulated·Vanta    │ ┌─ 16 ENTERPRISE FUNCTIONS · health heatmap ──────────────────┐  │
│                        │ │ CTO-OWNED          Strat Perf Cost Tech Risk Trans │ Overall │  │
│ ▾ ENTERPRISE FUNCTIONS │ │ Technology          🟢   🟢   🟡   🟢   🟡   🟡   │   82    │  │
│   CTO-owned            │ │ Ent. Architecture   🟡   🟡   🟡   🔴   🔴   🟡   │   61  ← │  │
│    Technology          │ │ Engineering & R&D   🟢   🟡   🟢   🟡   🟢   🟡   │   74    │  │
│    Ent. Architecture   │ │ Data & AI           🟢   🟡   🟡   🟢   🟡   🟢   │   76    │  │
│    Engineering & R&D   │ │ Cybersecurity       🟡   🟢   🟢   🟡   🔴   🟡   │   68  ← │  │
│    Data & AI           │ │ Product & Innov.    🟢   🟢   🟡   🟢   🟢   🟡   │   79    │  │
│    Cybersecurity       │ │ SIGNALS TO CTO                                     │         │  │
│    Product & Innov.    │ │ Corporate Strategy  🟢   🟢   🟢   🟡   🟢   🟡   │   83    │  │
│   Signals to CTO       │ │ Finance             🟢   🟢   🟡   🟢   🟢   🟢   │   84    │  │
│    Corporate Strategy  │ │ Operations          🟢   🟡   🟢   🟡   🟢   🟢   │   78    │  │
│    Finance             │ │ Sales               🟢   🟢   🟢   🟢   🟢   🟡   │   86    │  │
│    Operations          │ │ Marketing           🟢   🟡   🟡   🟢   🟢   🟢   │   77    │  │
│    Sales · Marketing   │ │ CX & Service        🟢   🟡   🟢   🔴   🟡   🟢   │   70  ← │  │
│    CX & Service · HR   │ │ Human Resources     🟢   🟢   🟢   🟡   🟡   🟡   │   75    │  │
│    Risk & Compliance   │ │ Risk & Compliance   🟢   🟢   🟢   🟡   🟡   🟢   │   80    │  │
│    Legal · Procurement │ │ Legal               🟢   🟢   🟢   🟢   🟡   🟢   │   85    │  │
│                        │ │ Procurement/Vendor  🟢   🟡   🟡   🟢   🔴   🟢   │   72    │  │
│ ▾ DECISIONS & OUTCOMES │ └──────────────────────────────── click row → function page ──┘  │
│   Decision Center (3)  │                                                                  │
│   Actions · Outcomes   │ ┌─ NEEDS YOUR DECISION ───────────────────────────────────────┐  │
│ ▾ DATA SOURCES         │ │ 🔴 Modernise core banking integration layer  ₹8.4Cr→₹13.2Cr  │  │
│ ▾ PROGRAMME & FRAMEWORK│ │    EA + Cyber + Datadog + Finance + CX · 87% · CTO · 31 Oct  │  │
│   TEDIF · Trackers     │ │ 🟡 Payments modernisation 12% behind  · VP Eng · 15 Nov      │  │
│                        │ │ 🟡 Fraud platform scaling before festive peak · CRO · 20 Oct │  │
└────────────────────────┴─┴──────────────────────────────────────────────────────────────┴──┘
```
(Real UI: each status dot also carries an icon and a label, never colour alone.)

## 2. Source sub-page (`/domain/banking/datadog`) — the same pattern for all 7

```
 Banking › Operations & Observability
 Simulated Source: Datadog · Datadog-style observability simulation
 Is technology reliable enough to support the business?
┌─ SOURCE SYNC ─────────────────────────────────────────────────────────────────────────┐
│ ● Simulation active · synced 40s ago · 22 services · 34 incidents (90d) · 18 events/h  │
│ 09:31 INC-BNK-0231 opened  P2  SVC-BNK-011 Payments API  latency 820ms               ▲ │
│ 09:29 deploy payments-api v4.12 (Jellyfish TEAM-BNK-06)                              │ │
│ 09:24 INC-BNK-0228 resolved  MTTR 42m                                                ▼ │
└────────────────────────────────────────────────────────────────────────────────────────┘
 ┌Availability┐┌SLO met    ┐┌P1 (30d)  ┐┌MTTR      ┐┌Cloud cost ┐┌Error rate ┐
 │ 99.91% ▼   ││ 18/22 ●   ││ 2  ●     ││ 2.3h ▲   ││ ₹4.2Cr ●  ││ 0.42% ▲   │
 │ tgt 99.95  ││ tgt 21    ││ tgt 0    ││ tgt 2h   ││ tgt 3.8   ││ tgt 0.3   │
 └────────────┘└───────────┘└──────────┘└──────────┘└───────────┘└───────────┘
 [Services] [Incidents] [SLOs] [Infrastructure] [Cloud cost] [DR & BCP] [P&L impact]
 ┌─ Services (exceptions first) ────────────────────────────────────────────────────────┐
 │ SVC-BNK-011 Payments API     APP-BNK-017  99.82%  820ms  6 inc  🔴 Critical   →      │
 │ SVC-BNK-003 Core ledger      APP-BNK-001  99.90%  140ms  3 inc  🟡 Degraded   →      │
 │ SVC-BNK-007 UPI switch       APP-BNK-009  99.97%   95ms  1 inc  🟢 Healthy    →      │
 │ … 19 more  [show all]                                                                │
 └──────────────────────────────────────────────────────────────────────────────────────┘
 Feeds functions:  Technology · CX & Service · Cybersecurity          ← links back
```

## 3. Function page (`/domain/banking/fn/enterprise-architecture`) — one template, all 16

```
 ‹ Engineering & R&D        Banking › Enterprise Architecture        Data & AI ›
 CTO-owned · Executive owner: CTO / CIO
 Does our architecture support the future business strategy?
 ┌Arch health┐┌Legacy apps┐┌EOL tech  ┐┌Cloud adopt┐┌Tech debt  ┐┌Redundant  ┐
 │ 61 🔴 ▼3  ││ 7 of 26   ││ 5  ▲1    ││ 58% ▲     ││ 34 ▲      ││ 4 apps    │
 │ tgt 75    ││ tgt 4     ││ tgt 2    ││ tgt 70%   ││ tgt 25    ││ tgt 1     │
 │ owner CTO · updated 5 min ago (each card)                                   │
 └───────────┘└───────────┘└──────────┘└───────────┘└───────────┘└───────────┘
 ┌─ 12-month trend ────────────────┐ ┌─ Capability heatmap ─────────────────────┐
 │ health  ‾‾╲__╱‾╲___   61        │ │ Payments 🔴  Lending 🟡  Cards 🟢 KYC 🟡  │
 │ debt    __╱‾‾╱‾‾‾‾   34         │ │ Deposits 🟢  Treasury 🟢  Fraud 🟡 …      │
 └─────────────────────────────────┘ └──────────────────────────────────────────┘
 ┌─ Impact ─────────────────────────────────────────────────────────────────────┐
 │ Business: 3 customer apps on EOL tech carry 28% of digital transactions      │
 │ Technology: 41% of P1s this quarter │ Financial: ₹2.1Cr extra run cost/yr     │
 └──────────────────────────────────────────────────────────────────────────────┘
 Open issues (3) · Initiatives (2) · Recommended actions (2) · Depends on: Cyber, Ops
 ┌─ FED BY ─────────────────────────────────────────────────────────────────────┐
 │ LeanIX  apps · tech lifecycle → │ Datadog  incidents on EOL apps → │ Vanta → │
 └──────────────────────────────────────────────────────────────────────────────┘
```

## 4. How it connects

```
 7 SOURCE PAGES (system lens)          16 FUNCTIONS (business lens)
 Planview ─────────────────────────▶ Strategy · Finance · Product & Innovation
 LeanIX ───────────────────────────▶ Enterprise Architecture · Technology
 Celonis + Signavio ───────────────▶ Operations · CX & Service
 ServiceNow SPM ───────────────────▶ Strategy (execution) · Technology · Procurement
 Jellyfish ────────────────────────▶ Engineering & R&D
 Datadog ──────────────────────────▶ Technology · CX & Service · Cybersecurity
 Vanta ────────────────────────────▶ Cybersecurity · Risk & Compliance · Legal
 Simulated business data ──────────▶ Sales · Marketing · HR · Data & AI
                 │                                  │
                 └──────────┬───────────────────────┘
                            ▼
            CTO360 Intelligence: Detect → Correlate → Prioritise
                            ▼
              Decision Center → Actions → Outcomes
```
