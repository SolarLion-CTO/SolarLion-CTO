# Domain-Agnostic Enterprise AI Transformation Framework — Project Notes

> Complete record of the CTO capstone project, from the first idea to the current website.
> Use this file to pick the work up again, brief a teammate, or brief an AI assistant.
> Last updated: 7 October 2026 (M1–M5 simulation build + disclaimer). **Start here next time:** section 0.

---

## 0. Resume here (status at close)

- **Live site:** https://cto360.vercel.app (brand: **CTO360 · Enterprise Technology Control Tower**)
- **Code:** first run `git status`; if it says "ahead", run `git push` (section 8). Vercel redeploys after each push.
- **Website (7 Oct 2026):**
  - **Home `/`** is the **Enterprise Command Center**: all 3 domains, source and function heatmaps, trends, top decisions, risk, investment, operations, outcomes, live events. It is joined by **Data sources** at `/sources` (section 30).
  - **Each domain** (`/domain/:id`) opens the **Enterprise 360** overview. It links to 7 simulated source pages (Planview, LeanIX, Celonis + Signavio, ServiceNow, Jellyfish, Datadog, Vanta), 16 function pages, a record drill-down, and Decision Intelligence (decision cards, actions, outcomes, maturity).
  - **Cross-domain:** the **CTO Decision Center** (Top 10) at `/decision-center`, and **About & disclaimer** at `/about`.
  - **Unchanged:** the previous domain page is at `/domain/:id/programme`. The TEDIF, tracker and CTO pages are unchanged.
  - Sections 24 and 26–29 describe these.
- **Where to update figures:**
  - **Simulation:** `src/data/sim/domains/banking.ts`, `manufacturing.ts` and `retail.ts`. Run **`npm run validate:sim`** after every change.
  - **Older resilience tabs:** `src/data/resilience.ts` and `src/data/engineering.ts`.
  - Statuses, scores, risks and decisions are all **calculated**; never type a status by hand.
- **Disclaimer:** a short version appears in the footer of every page; the full version is at `/about#disclaimer` (section 29).
- **Business problem and pitch line:** section 31. Use it for the deck's "Problem → Solution → Value" slide.
- **IN BUILD, M7: Team workspaces** (the main capstone problem statement). Design: **`docs/TEAM_WORKSPACES_PLAN.md`**; summary in section 32.
  - **M7.1 ✅ done 7 Oct 2026** (section 33): TEAM sidebar group, `/team`, all 5 workspaces with live Transformation tab and KPIs, Ram's 4 tabs, golden-thread scenario, analytics library.
  - **M7.2 ✅ done 7 Oct 2026** (section 34): Suman's workspace with Readiness, Portfolio & gates, ROI & benefits, and Onboard any organisation.
  - **M7.3 ✅ done 7 Oct 2026** (section 35): Vaibhav's workspace with Regulatory change (live circular), AI model register (PSI drift), Data governance & DPDP (breach clock, lineage), and Audit readiness.
  - **M7.4 ✅ done 7 Oct 2026** (section 36): Santhosh's workspace with CAPEX / OPEX & TBM Sankey, Budget, forecast & anomalies, FinOps & licences, and Investment governance.
  - **M7.5 ✅ done 7 Oct 2026** (section 37): Pankaj's workspace with ERP RCA, Capacity & forecasting, Peak scenarios, and Production automation.
  - **Next: M7.6** cross-checks, full sweep, notes.
- **Pending decisions (yours / team):**
  1. **Live AI provider:** Grok (paid), Groq (free tier) or Claude (section 16). Needs the API key in Vercel environment variables. Not built yet.
  2. Owner map and naming consistency across the proposal, decks and TEDIF (section 12).
- **NEXT BUILD (agreed direction):** two specs merged into one plan, **section 23** (this supersedes the build order in section 22).
  - Specs: `docs/SIMULATION_SPEC.md` (7 tool layers, canonical model, decisions → actions → outcomes) and `docs/ENTERPRISE360_SPEC.md` (16 enterprise functions per domain, heatmap, Top 10 decisions, maturity).
  - **M1–M6 ALL DONE (6–7 Oct 2026, sections 24 and 26–30).** The simulation build is complete. Home `/` is now the **Enterprise Command Center**; the previous home page is at `/overview`.
- **Sprint tracker (simulation build, plan in section 23):**

| Sprint | What it delivers | Visible on site? | Status |
|---|---|---|---|
| M1 | Data engine: canonical model, Banking data, scoring rules, `npm run validate:sim` (section 24) | No | ✅ Done 6 Oct 2026 |
| M2 | Reusable UI building blocks: KPI card, sparkline, heatmap, source badge, time-range selector, event feed, "why this colour" tip (section 25) | Used directly by M3 pages (no separate test page needed) | ✅ Done 6 Oct 2026 (section 26) |
| M3 | Domain Overview (Executive 360) + 7 source pages per domain + Manufacturing and Retail data; existing tabs re-homed (section 25) | **Yes, the first big visible change** | ✅ Done 6 Oct 2026 (section 26) |
| M4 | 16-function page template + "Fed by" links into sources | Yes | ✅ Done 6 Oct 2026 (section 27) |
| M5 | Cross-functional insights, Decision Center Top 10, Actions, Outcomes, evidence trail, maturity | Yes | ✅ Done 7 Oct 2026 (section 28) |
| M6 | Cross-domain Command Center as home, Data Sources page, simulated live clock, full checks | Yes | ✅ Done 7 Oct 2026 (section 30) |

- **Pending checklist (cross-verified 7 Oct 2026):**
  1. ✅ **Disclaimer done:** built, committed (`ed14e4d`) and pushed on 7 Oct 2026; live on Vercel. A full overflow re-check across all routes is still worth running at the start of M6.
  2. ✅ **M6 done** (section 30). The full sweep found 219 / 219 views clean. If `git status` says "ahead", run `git push`.
  3. **Live AI call:** pick a provider and add the API key in Vercel (section 16).
  4. **Naming consistency:** the website brand is **CTO360**, but section 1 and some decks still say "Domain-Agnostic Enterprise AI Transformation Framework" or "Universal CTO Control Tower". Align the proposal and decks to CTO360, with TEDIF as the underlying framework (section 12).
  5. Owner map consistency across the proposal, decks and TEDIF (section 12).
  6. Optional: code-split routes (the bundle is above 500 kB; this is only a warning).
  7. Housekeeping: confirm the GitHub token pasted in chat earlier has been **revoked**.
- **Later build step:** a live AI call for "Challenge the AI" on DEC-OPS-001, plus AI insight text, via a Vercel serverless function (section 16).
- **Scores today:** capstone **7.8 / 10**; concept **8.5 / 10**; future value **8 / 10**; value today **4 / 10** (section 14). Expect about +0.5 on the capstone score after the resilience and control-tower work.

---

## 1. Project at a glance

| Item | Value |
|---|---|
| Programme | CTO Capstone Project, 2026 |
| Product name (website) | **Domain-Agnostic Enterprise AI Transformation Framework** |
| Deck name | "Universal CTO Control Tower" — **decide on one name** (see section 12) |
| Underlying framework | **TEDIF** — Trusted Enterprise Decision Intelligence Framework v1.0 |
| Signature principle | **AI recommends. Humans decide.** |
| Domains | Banking, Manufacturing (pilots) + Retail (added by configuration only) |
| Website | React + Vite + TypeScript, deployed on Vercel from GitHub |
| **Live website** | **https://cto360.vercel.app** (renamed from solar-lion-cto.vercel.app on 6 Oct 2026) |
| GitHub repo | https://github.com/SolarLion-CTO/SolarLion-CTO |
| Local folder | `/Users/ram/Downloads/CTO CApstone/ai-transformation-framework` |
| Source documents folder | `/Users/ram/Downloads/CTO CApstone` |

**One-line pitch:** one governed way to turn AI investment into measurable business decisions in any industry — build the control layer once, add each new industry as configuration.

---

## 2. Team and ownership (agreed owner map)

| Owner | Title | Owns | Not this |
|---|---|---|---|
| **Ram** | CTO · AI Control Layer · Innovation | Domain-agnostic architecture, agents + MCP + RAG, tracking ongoing and new initiatives, innovation | — |
| **Suman** | Strategy & ROI | Maturity baseline ("transform any org to AI"), roadmap, **ROI identified before investment** | Spend tracking |
| **Santhosh** | Finance & Investment Governance | OPEX/CAPEX, app & resource portfolio (keep/expand/review/retire), **value realised after spend**, funding decisions | Capacity forecasting |
| **Pankaj** | Operations | ERP RCA, **capacity need** (how much, when), production automation, Retail reuse | Funding choice |
| **Vaibhav** | Regulatory & AI Governance | Regulatory change **circular → implemented control → evidence**, DPDP, responsible AI | Investment governance |

Key splits that remove overlap:
- Suman **identifies** ROI before spend; Santhosh **proves** value after spend.
- Pankaj says **how much** capacity; Santhosh decides **how to fund** it (this is exactly flagship DEC-OPS-001).
- "Investment governance" (Santhosh) ≠ "Regulatory & AI governance" (Vaibhav) — always use these two names.

### Original team notes (bp1.jpeg, 20/9/2026)
- Suman — ① Identify ROI ② Transform any organization to AI
- Vaibhav — ① Automate regulatory **with implementation** ② DPDP / AI governance
- Santhosh — ① Governance system ② Apps / resources / decision making, OPEX / CAPEX
- Ram — ① Agnostic domain: Banking + Manufacturing ② AI + MCP agent implementation to **track ongoing + new**
- Pankaj — ① ERP RCA ② Capacity planning of infra ③ Automation of the production management process

### Framework tree (bp2.jpeg)
Domain-agnostic framework → Banking · Manufacturing · Retail → Strategy · Operations · Finance & ROI · Innovation → Architecture · Data & AI · Innovation. Notes: Pankaj — Retail business problem, domain-specific reuse, ERP capacity planning of infra; Suman — ROI, finance, "any organisation to AI"; Santhosh — system governance, infra planning + IT infrastructure.

---

## 3. Source documents (in `/Users/ram/Downloads/CTO CApstone`)

| File | What it is |
|---|---|
| `Universal_CTO_Control_Tower_Proposal_Aligned.pdf` | 15-page proposal: framework layers, workstreams, pilots, governance, KPIs, roadmap, risks |
| `Enterprise_Decision_Intelligence_Framework_*.pdf` | **TEDIF v1.0**, 71 pages — the framework (author: Ganapathi Ramkumar Palanivelu) |
| `Universal_CTO_Control_Tower.pptx` | 26-slide deck (problem matrix slide 14, flagship slide 15, runtime slide 11, economics slide 19, demo script slide 25) |
| `Universal_CTO_Control_Tower_Executive.pdf` | 23-slide executive deck — defines **6 dashboards** (slides 11–16) |
| `CTO_Solar_Lion.pptx` | Earlier version of the executive deck |
| `bp1.jpeg`, `bp2.jpeg` | Handwritten team notes (section 2) |
| `dashboard.jpeg` | Original dashboard mockup (dark-blue sidebar, KPI cards, portfolio table) |
| `WhatsApp Image … (1).jpeg` | Architecture infographic (domains → workstreams → control layer → value) |

### TEDIF in one page
- **5 principles:** business drives technology · knowledge is the prime asset · trust before intelligence · AI recommends, humans decide · every decision produces measurable value.
- **Decision chain:** Strategy → Capability → Process → **Decision** → Data → Knowledge → Trust → AI → Human → Outcome → Learning.
- **Lifecycle:** 5 phases, 32 sections — Assess (AS-01…10), Design (DS-01…08), Build (BL-01…08), Operate (OP-01…04), Optimize (OPT-01…02).
- **MVP critical path (12 sections):** AS-04, AS-06, AS-08 · DS-02, DS-05, DS-06 · BL-01, BL-04, BL-05, BL-06 · OP-03 · OPT-02.
- **5 gates:** G1 Executive assessment · G2 Architecture & design (CISO signs DS-05 before DS-06) · G3 Production go-live (BL-04 enforcing before BL-05) · G4 Business value · G5 Transformation board. Outcomes: approve / redo / stop.
- **Decision Object:** 31 fields — catalogue time 1–18 (tiered by risk: 10 / 15 / 18 fields), runtime 19–24, decision time 25–31. Status: Draft → Catalogued → Shadow → Active → Suspended → Retired.
- **Ten-engine runtime:** Request → Context → Policy → Knowledge (RAG) → AI → Decision → Human → Execution → Audit → Learning. No audit, no execution.
- **Shadow run:** AI recommends, humans decide as before; exit at > 80 % agreement and < 10 % calibration error.
- **Data classification:** Public / Internal (cloud) · Confidential (local preferred, masked cloud) · Restricted / Highly restricted (local only).
- **22 excellence practices** (EP-01…22), **5 failure patterns** (AP-1…5), **8 open risks** (R-01…08 — R-01 matrix approver conflict and R-02 single policy engine are critical).

### TEDIF document errata (fix before submission)
1. Decision Object is called **31 fields** (pages 4, 21) and **22 fields** (Appendix A, sign-off page).
2. Section 5.7 cites risk = field 11 and approver = field 6; the schema has risk = **12**, approver = **9**.
3. Says **25** named deliverables; the Part 4 table lists **26** (5 + 6 + 5 + 5 + 5).
4. TEDIF says "Transformation Lead"; decks say "CTO" — state once that the CTO plays that role.

---

## 4. Business problems (problem matrix)

| Workstream | Banking | Manufacturing | Retail |
|---|---|---|---|
| Strategy (Suman) | Prioritise lending AI use cases by ROI | Plant-wide AI readiness and roadmap | Store + e-commerce AI portfolio |
| Operations (Pankaj) | Core banking month-end capacity + incident RCA | ERP RCA for downtime; line and IT capacity | Festive-peak IT and fulfilment capacity |
| Finance (Santhosh) | Cloud vs on-prem for core systems | Machine and infra CAPEX approval | Seasonal OPEX vs owned infrastructure |
| ROI (Suman · Santhosh) | ROI not identified before funding | Payback not tracked after spend | Pilots claim ROI without baseline |
| Governance (Vaibhav) | RBI circular → controls; DPDP | Supplier and safety compliance evidence | Customer consent (DPDP) for personalisation |
| Innovation (Ram) | Safe agentic AI on core banking | Predictive maintenance | Demand forecasting & markdown |
| ERP (Pankaj) | Core banking / GL incident RCA | SAP incidents + month-end slowdowns | OMS–ERP sync failures at peak |
| AI (Ram) | Track ongoing + new AI initiatives; AI transparency | same, across plants | same, store + online |

> Innovation problems were proposed by us — the decks only say "Innovation: CTO technical problem solving". Confirm with the team.

**Flagship decision — DEC-OPS-001 ERP capacity expansion:** Pankaj detects (ERP RCA, +40 % headroom) → Suman prioritises (on-time close objective) → Santhosh funds (cloud ₹1.14 Cr / on-prem ₹1.31 Cr / **hybrid ₹1.06 Cr** over 3 years; ~12-month payback; ~70 % 3-yr ROI — illustrative) → Vaibhav governs (DPDP residency, security sign-off) → Ram recommends hybrid → **CFO + CIO approve**, audited.

---

## 5. Timeline of what was built

| # | Step | Result |
|---|---|---|
| 1 | Stack chosen | React + Vite + TypeScript → Vercel now; Python FastAPI + LLM later (Phase 2) |
| 2 | Phase 1 dashboard | Overview (mockup style), Decision Center, workstream pages, AI Agents, Value, Framework |
| 3 | Pushed to GitHub | Repo `SolarLion-CTO/SolarLion-CTO` |
| 4 | Detailed dashboard | Problem Matrix, Retail domain, ten-engine runtime, flagship DEC-OPS-001, ₹ crore, cloud/on-prem/hybrid economics, Innovation page |
| 5 | TEDIF Tracker | TEDIF top-to-bottom across 3 domains (15 sections) |
| 6 | Domain pages | Each sidebar domain → CTO-to-ground cascade |
| 7 | Programme Tracker | Portfolio + 8 dimension tabs, 9 role levels CTO → developer, AI transparency |
| 8 | CTO Dimensions | 11 pages covering the 14 CTO capstone dimensions + coverage map |
| 9 | Project notes | This file (`PROJECT_NOTES.md`) |
| 10 | Responsive polish | Compact header, slide-out drawer below desktop, no page overflow on phones, charts render instantly |
| 11 | Design system | Tokens in `src/index.css` + `src/theme.ts`; calm enterprise look; documented in section 18 |

Commits (oldest first): Phase 1 dashboard → detailed dashboard → TEDIF Tracker → domain pages → Programme Tracker → CTO Dimensions pages → project notes → responsive polish → notes update → design system → notes update.

---

## 6. Website map (routes)

### Industry domain (sidebar top)
| Route | Page |
|---|---|
| `/domain/banking`, `/domain/manufacturing`, `/domain/retail` | Domain page: L1 CTO → L2 workstream lead → L3 initiative → L4 ground unit; escalations to CTO. Clicking a domain also switches the whole site. |

### Executive
| Route | Page |
|---|---|
| `/` | Overview — KPIs, transformation heatmap, value, maturity, TEDIF gates, agents, decision engine, alerts |
| `/problems` | Problem Matrix — 3 domains × 5 workstreams, click for pain → root causes → AI solution → KPI |
| `/tedif` | TEDIF Tracker — principles, chain, 32 sections (MVP toggle), gates, deliverables, catalogue, onboarding, shadow run, rollout, classification, 22 practices, decision quality, success measures, risks |
| `/decisions` | Decision Center — flagship DEC-OPS-001 + domain decisions; ten-engine run; challenge the AI; approve / modify / reject / escalate; audit trail; TEDIF status (Shadow / Catalogued) |
| `/value` | Business Value — cross-domain radar, monthly value, KPI framework |

### CTO Dimensions
| Route | Dimension | Page |
|---|---|---|
| `/cto/coverage` | All 14 | Coverage map with links to evidence — **keep open in the presentation** |
| `/cto/business` | Business | Problem chain, cost / risk / speed, current silos, before→after, why now, the ask |
| `/cto/strategy` | Strategy | Maturity curve, gap per dimension, current vs target state |
| `/cto/assessment` | Assessment | Interactive 15-question readiness scoring, radar, Gate 1 preconditions |
| `/cto/portfolio` | Portfolio | Value × feasibility matrix, 16 use cases ranked |
| `/cto/data` | Data | Source inventory, quality, classification, MCP integration, blocking issues |
| `/cto/ai-selection` | AI | Rules / ML / GenAI / RAG / agentic guide; 12 use cases with why, rejected options, route, autonomy |
| `/cto/architecture` | Technology | 6-layer architecture + trust gateway, build vs buy, tech stack |
| `/cto/operating-model` | Operating model | Hub-and-spoke CoE, RACI, team (~5–6 FTE), training |
| `/cto/roadmap` | Execution | 16-week timeline, gates, today marker, milestones |
| `/cto/decisions` | Leadership | CTO decision log, decision rights, what the CTO does **not** decide |

### Programme Tracker
| Route | Page |
|---|---|
| `/tracker` | Portfolio — 8 dimensions × 3 domains, red escalations, items per role level |
| `/tracker/strategy`, `/roi`, `/finance`, `/operations`, `/erp`, `/ai`, `/innovation`, `/governance` | Dimension tabs — notes from bp1, extras panel, plan tree L1 CTO → L9 Developer, "View as" role, AI-involved filter |

Flagships planned to developer level (★): **ERP × Manufacturing**, **Governance × Banking**, **Governance × Retail**. Others planned to Senior PM level.

Role levels: L1 CTO · L2 VP · L3 AVP · L4 Director · L5 Delivery Head · L6 Senior PM · L7 PM · L8 Tech Lead · L9 Developer.

### Workstreams and AI Control Layer
`/strategy`, `/finance`, `/operations`, `/governance`, `/innovation`, `/agents` (agent registry + "Ask the Framework" canned chat), `/framework`.

---

## 7. Code structure — where to edit

```
ai-transformation-framework/
├── PROJECT_NOTES.md          ← this file
├── vercel.json               ← SPA rewrite so deep links don't 404
├── index.html                ← page title
└── src/
    ├── index.css             ← design tokens (@theme): colours, font, surfaces — change a colour here
    ├── theme.ts              ← chart colours (domain, status, progress scale)
    ├── App.tsx               ← all routes
    ├── store.tsx             ← selected domain, audit trail, value realised from approvals
    ├── components/
    │   ├── Layout.tsx        ← header + sidebar (nav groups)
    │   ├── ui.tsx            ← Card, Badge, Bar, Ring, Kpi, money (₹ Cr)
    │   ├── ProblemPanel.tsx  ← pain / root causes / AI solution / KPI card
    │   ├── TreeView.tsx      ← 9-level plan tree with AI transparency
    │   └── DomainSwitch.tsx
    ├── data/                 ← ALL demo data lives here
    │   ├── domains.ts        ← domain packs: KPIs, problems, initiatives, decisions, controls, agents, flagship, ERP economics
    │   ├── cascade.ts        ← CTO → ground cascade per domain (feeds domain pages AND tracker)
    │   ├── tracker.ts        ← tracker dimensions, ERP + AI packs, flagship levels 7–9, extras
    │   ├── tedif.ts          ← TEDIF statuses: sections, gates, deliverables, catalogue, shadow run, practices, risks
    │   └── cto.ts            ← CTO-dimension pages: states, assessment, use cases, data sources, AI choices, RACI, roadmap, CTO decisions
    └── pages/                ← one file per page; pages/cto/ for CTO-dimension pages
```

**Who edits what (replace demo data with real values):**
| Owner | Files / sections |
|---|---|
| Suman | `cascade.ts` → Strategy, ROI · `cto.ts` → `useCases`, `assessmentDefaults`, `states` · `tracker.ts` → `maturity5`, `roiByQuarter` |
| Santhosh | `cascade.ts` → Finance, ROI · `domains.ts` → `erpEconomics`, `capexOpex` · `tracker.ts` → `appPortfolio` |
| Pankaj | `cascade.ts` → Operations · `tracker.ts` → `erp` pack, `capacity`, `automationSteps`, `rcaPipeline` |
| Vaibhav | `cascade.ts` → Governance · `domains.ts` → `controls` · `tracker.ts` → `regPipeline`, `dpdp` · `tedif.ts` |
| Ram | `tracker.ts` → `ai` pack, flagship `deep` plans · `cto.ts` → `aiChoices`, `dataSources`, `ctoDecisions`, `raci` · `tedif.ts` |

---

## 8. How to run, push and deploy

```bash
# open in VS Code
code "/Users/ram/Downloads/CTO CApstone/ai-transformation-framework"

# run locally  (it is NOT npm start)
npm run dev            # → http://localhost:5173

# production build check
npm run build

# publish
git add -A
git commit -m "your message"
git push               # same as: git push origin main
git status             # should say: up to date with 'origin/main'
```

- `git remote -v` only **shows** the remote; it does not push.
- Push login: username `SolarLion-CTO`, password = a **personal access token** (not the account password). Paste it only at the terminal prompt, never in chat.
- A token was once pasted into a chat — make sure it is **revoked** at https://github.com/settings/personal-access-tokens.
- If push says "Invalid username or token" without prompting: Keychain Access → search `github.com` → delete the entry → push again.
- **Vercel:** vercel.com → sign in with GitHub → Add New → Project → import `SolarLion-CTO` → Framework preset Vite (defaults) → Deploy. Every `git push` redeploys automatically.

---

## 9. Demo script (3–5 minutes, after the PPT)

1. **Coverage page** (`/cto/coverage`) — "here is every CTO dimension and where it is proven".
2. **Overview** — switch domains Banking → Manufacturing → Retail ("Retail is configuration only").
3. **Decision Center** → DEC-OPS-001 → *Run decision runtime* (watch the 10 engines; trust checks before AI) → *Challenge the AI* (evidence, alternatives, MCP/RAG sources) → **Approve as CFO** → audit trail.
4. Back to **Overview** — KPIs and ROI update from the approval.
5. **Programme Tracker → ERP** (Manufacturing ★) — "View as" CTO, then Developer; show the SAP-access blocker rolling up; click an AI tag (agent, confidence, human approver).
6. **CTO decisions** — "what I decide, and what I deliberately do not decide".

---

## 10. Phase 2 plan (Python API + AI)

```
React (Vercel)  →  FastAPI (Render / Railway / container)  →  LLM via model router
                                ↘  Postgres + pgvector (RAG)  ↘  MCP servers (read-only)
```
- Endpoints: `GET /metrics`, `GET /decisions/{id}`, `POST /decisions/{id}/invoke`, `POST /decisions/{id}/challenge`, `POST /decisions/{id}/resolve`, `POST /ask`.
- Start with **one live call**: "Challenge the AI" on DEC-OPS-001 with RAG over 5–10 policy documents and cited sources. One working call beats ten mocked screens.
- LLM options: **Groq** (with a q — free tier, hosts open models like Llama, OpenAI-compatible API) vs **Grok** (xAI — paid API). Claude is also an option. Keep the router multi-vendor.
- Replace the `answer()` function in `src/pages/Agents.tsx` and the Decision Center runtime with API calls.
- Persist the audit trail (today it resets on page refresh).

---

## 11. Assessment of the project (honest)

Earlier rating was 7.5 / 10; after the CTO-dimension pages and responsive polish it is **7.8 / 10** (full breakdown in section 14).

| Strong | Weak / still to do |
|---|---|
| Problem framing, TEDIF depth, governance and "AI recommends, humans decide" | All numbers are illustrative — add at least one or two **real** baselines |
| Cross-industry proof (3 domains) | No live AI yet — do the Phase 2 single live call |
| Decision runtime, gates, audit, challenge yield | Documents contradict each other (names, owners, TEDIF errata) |
| Measurement against baselines | Decks lack slides for Data readiness, AI selection, Operating model / CoE |

---

## 12. Open items / next steps

1. **One name everywhere** — e.g. "TEDIF is the framework; the Control Tower is the CTO's view of it". Today: decks = Universal CTO Control Tower; website = Domain-Agnostic Enterprise AI Transformation Framework.
2. **Apply the owner map (section 2)** to proposal, both decks, TEDIF and the website (ROI and Innovation owners differ between decks today).
3. **Fix TEDIF errata** (section 3).
4. **Replace demo data** with real baselines, starting with one KPI per owner (section 7 table).
5. **Add deck slides** for Data readiness, AI selection, Operating model / CoE.
6. **Phase 2:** one live LLM call with RAG + persistent audit.
7. **Optional UX:** "illustrative data" banner; optional dark mode from the same tokens. *(Collapsible sidebar — done 6 Oct.)*
9. **Pick the final name** (section 15) and apply it to website header, decks and this file.
10. **Test on real devices** — iPhone Safari and Android Chrome (only Chrome emulation was tested).
11. **Present from a laptop or tablet** — wide tables (heatmap, TEDIF grids, RACI) scroll sideways on phones.
8. Rehearse the demo script (section 9); don't try to show every TEDIF section.

---

## 13. Key numbers used in the demo (all illustrative)

| Item | Value |
|---|---|
| ERP 3-year cost (₹ lakh) Y1 / Y2 / Y3 | Cloud 38 / 76 / 114 · On-prem 107 / 119 / 131 · **Hybrid 62 / 84 / 106** |
| Hybrid benefit / payback / ROI | ₹60 L / yr · ~12 months · ~70 % over 3 years |
| Duplicated AI spend across 3 domain stacks | ~₹4.6 Cr |
| Regulatory mapping time | 21 days → 4 days → target < 1 day |
| Manufacturing RCA time | 38 h → 9 h → target 6 h |
| CAPEX approval cycle | 45 days → 21 → target 10 |
| Shadow run agreement | Banking 84 % (exit ready) · Manufacturing 78 % (below 80 %) · Retail not started |
| TEDIF position | Banking & Manufacturing: Phase 3 Build, G2 passed · Retail: Phase 2 Design, G1 passed |
| Programme week | Week 10 of 16 (start 3 Aug 2026); no production AI before day 90 |
| Programme tracker size | 271 items across 24 plans; 3 flagships to developer level |

---

## 14. Ratings and value simulation (5 Oct 2026)

### Headline scores
| What | Score | Note |
|---|---|---|
| Capstone project (as built today) | **7.8 / 10** | Strong thinking and demo; held back by illustrative data, no live AI, document inconsistencies |
| Concept (if implemented as designed) | **8.5 / 10** | Real CTO problem; mature, defensible stance; novelty is the combination + TEDIF rigour |
| Future value | **8 / 10** | Regulation (DPDP 2027, EU AI Act) and agentic AI raise demand; depends on adoption and data quality |
| Value today | **4 / 10** | Blueprint ≈ 8, working system ≈ 3 |

### Per dimension
| Dimension | Score | Dimension | Score |
|---|---|---|---|
| Business | 8 | Governance | 9 |
| Strategy | 8 | Operating model | 7.5 |
| Assessment | 7.5 | Execution | 8 |
| Portfolio | 8 | Measurement | 8 |
| Finance | 7 | Cross-industry | 8.5 |
| Technology | 7.5 | Leadership | 8.5 |
| Data | 6.5 | Presentation & demo | 8.5 |
| AI | 6.5 | Consistency across documents | 5.5 |
| Real evidence / data | 4 | Technical depth | 5.5 |

### Value simulation (illustrative — website's own demo numbers)
Assumptions: value at full target ≈ ₹70.7 Cr / yr (Banking 31.6 + Manufacturing 20.7 + Retail 18.4); build ≈ ₹30.7 Cr over 2 years + run 10–20 % / yr; value ramp 15 % → 45 % → 75 %.

| Scenario | 3-yr value | 3-yr cost | Net | ROI | Payback |
|---|---|---|---|---|---|
| Conservative (½ value) | ₹47.7 Cr | ₹46.7 Cr | ≈ ₹1 Cr | ~2 % | ~month 35 |
| Base | ₹95.4 Cr | ₹46.7 Cr | ≈ ₹48.7 Cr | ~104 % | ~month 22 |
| Optimistic (1.25×) | ₹119.4 Cr | ₹46.7 Cr | ≈ ₹72.7 Cr | ~156 % | ~month 18 |

- ₹70 Cr / yr at target is aggressive vs ₹30.7 Cr invested — **commit to the conservative case, show base as expectation.**
- Biggest unquantified value: **risk avoidance** (DPDP penalties for failed safeguards can reach ~₹250 Cr; RBI findings) — one avoided incident can fund the programme.

### Value today vs future
| | Today | 6–12 months (Phase 2 + pilot) | 2–3 years (scaled) |
|---|---|---|---|
| Exists | Framework, decks, interactive demo | Live AI on 3 decisions, real data, persistent audit | Platform in 2–3 business units |
| Value | Capstone + board-ready blueprint | Measured gains (circular mapping days → hours; RCA 38 h → < 10 h) | ₹25–50 Cr / yr + compliance readiness |
| Score | 3 (system) / 8 (blueprint) | 6 | 8–9 if adoption holds |

### Path to 9 / 10
| Fix | Gain | Effort |
|---|---|---|
| One live AI call with RAG on DEC-OPS-001 "Challenge the AI" | +0.5 | 1–2 days |
| One or two real baselines from your organisation | +0.4 | 1 day |
| Consistency pass (one name, one owner map, TEDIF errata) | +0.3 | 1 day |
| Present conservative value case + DPDP risk avoidance | +0.2 | ½ day |

---

## 15. Naming options (not yet decided)

**Recommended: DecisionOS** — *The enterprise operating system for trusted AI decisions.*
Reason: short, futuristic, domain-agnostic, and says the core idea (the decision is the unit of value).

| Title | Subtitle |
|---|---|
| **DecisionOS** (recommended) | The enterprise operating system for trusted AI decisions |
| AXIS | One control layer for enterprise AI |
| Sentinel AI | Governed AI transformation for every industry |
| NorthStar AI | From AI pilots to measurable value |
| Helix | The domain-agnostic AI transformation framework |
| TrustOS | AI recommends. Humans decide. |
| Control Tower X | The CTO's command centre for enterprise AI |

Naming hierarchy that removes today's inconsistency: **DecisionOS** = product · **TEDIF** = framework inside it · **Control Tower** = the CTO's view.
- Website header: `DecisionOS · powered by TEDIF`
- Deck title: `DecisionOS — The Domain-Agnostic Enterprise AI Transformation Framework`
- Tagline: *AI recommends. Humans decide.*

Do a quick web / trademark search before final use. To apply: header text in `src/components/Layout.tsx`, `<title>` in `index.html`.

---

## 16. Live AI call — what it means and how to build it

**Meaning:** the website sends a real question to an AI model's API (e.g. Grok) and shows the model's actual answer — today the "AI" text is pre-written.

```
Website (React, Vercel) ── click "Challenge the AI"
   ▼
Backend function  ← API key lives here only (never in the browser)
   │  sends: question + decision data + 3–5 policy snippets (= RAG)
   ▼
AI model API (Grok / Groq / Claude)
   │  returns: recommendation + reasons + cited sources
   ▼
Website shows it → a human approves / rejects → audit
```

| Provider | Cost | Note |
|---|---|---|
| Grok (xAI) | Paid API (sometimes starter credits) | OpenAI-compatible |
| Groq (with a q) | Free tier | Open models (Llama), fast, OpenAI-compatible — good for the capstone |
| Claude (Anthropic) | Paid API | Strong reasoning and source citation |

Build plan (when back):
1. Create an API key with the chosen provider.
2. Add it in **Vercel → Project → Settings → Environment Variables** (never in code or chat).
3. Add a Vercel serverless function (e.g. `api/challenge`) in this repo — no separate server; deploys with `git push`. (Python FastAPI remains the longer-term Phase 2 option.)
4. Wire "Challenge the AI" (`src/pages/Decisions.tsx`) and "Ask the Framework" (`answer()` in `src/pages/Agents.tsx`) to it; keep canned answers as offline fallback.
5. Send 3–5 policy snippets with each call and require citations (RAG-lite).

---

## 17. Responsive testing record (5 Oct 2026)

- Method: Chrome DevTools-protocol emulation — phone 390 px, tablet 820 px, desktop 1440 px.
- Result: **35 pages × phone + tablet = 70 checks, no horizontal overflow.**
- Fixes made: compact fixed-height header with short titles; sidebar → slide-out drawer with backdrop below 1024 px; `.grid > * { min-width: 0 }` so wide tables scroll inside cards; KPI grid without orphan card; mobile status line in plan tree; stacked roadmap milestones; chart animations off (`isAnimationActive={false}`) so charts render instantly.
- Not yet done: real-device test on iPhone Safari and Android.

---

## 18. Design system (6 Oct 2026)

Standard followed: calm enterprise dashboard (Carbon / Fluent style), WCAG 2.2 AA. Tokens live in `src/index.css` (`@theme`) and, for charts, `src/theme.ts`.

**Rules:** brand navy = navigation & actions · status colours = health only, always with an icon + label · domain colours = identity in charts · one blue scale = progress / magnitude · nothing decorative.

| Group | Tokens |
|---|---|
| Brand | `brand-950 #071C4A` (sidebar) · `brand-900 #0B2A6B` (header, titles) · `brand-700 #1E40AF` · `brand-600 #1D4ED8` (actions) · `brand-100 #DBE7FF` · `brand-50 #EEF4FF` |
| Surfaces / ink | `page #F6F7F9` · `surface #FFFFFF` · `line #E3E6EB` · `ink #0F172A` · `ink-2 #475569` · `ink-3 #64748B` |
| Status | on track `#0CA30C` ● · at risk `#FAB219` ▲ · serious `#EC835A` ◆ · delayed / critical `#D03B3B` ■ |
| Domains | Banking `#2A78D6` (blue) · Manufacturing `#1BAF7A` (aqua — not green, to avoid clashing with "on track") · Retail `#EB6834` (orange) — validated colour-blind-safe categorical slots |
| Progress scale | `seq-100 #CDE2FB` → `seq-250 #86B6EF` → `seq-400 #3987E5` → `seq-550 #1C5CAB` |

- **Type:** Inter (Google Fonts) · page title 24 semibold sentence case · card title 15 semibold · body 14 · caption 12 · KPI value 26 bold · overlines 11 uppercase only for tiny labels · tabular numbers in tables.
- **Layout:** content max-width 1440 px, centred · 4/8 spacing scale · cards 12 px radius, hairline border, soft shadow · page = header → filters → KPIs → main insight → detail.
- **Components:** KPI tile = neutral icon + label + value + change · badges = soft tint + dark text + shape icon · charts: one axis, light grid, legend for ≥ 2 series, no animation.
- **Sidebar:** collapsible groups; the group of the current page opens automatically; Executive open by default.
- **Changed from before:** uppercase extra-bold titles → sentence case semibold · rainbow KPI icons → one neutral style · heatmap mint/yellow/red → blue progress scale (health stays in badges) · Manufacturing green → aqua · gradient header → solid navy · 35 always-open links → collapsible groups.
- **Present in light mode** (dark dashboards wash out on projectors). Dark mode can be added later from the same tokens.

### Validation from `references_to_validate/` (6 Oct 2026)
Screenshot of the live site (then `solar-lion-cto.vercel.app/cto/strategy`, now `cto360.vercel.app`) confirmed the design system is deployed. Fixes made from it:
- Maturity curve and gap bars used yellow / green (status colours) for "today" / "target" → now navy (today) and light blue / dashed outline (target).
- Numbers formatted to one decimal ("4.0", not "4"), gap shown (+0.7), "largest gap" tag added.
- Table cells aligned (consistent padding, top-aligned area labels).
- Sidebar label shortened to "Coverage · 14".
- Same rule applied elsewhere: roadmap phases and the business-case "ask" box now use brand colours, not status colours.

---

## 19. CTO360 Phase 1 — brand and shell (6 Oct 2026)

From the CTO360 UI spec (UI only — no content, routes or features changed):
- **Brand:** header shows **CTO360 · Enterprise Technology Control Tower**; footer: *One View. Connected Decisions. Measurable Technology Outcomes.* · Decision intelligence powered by TEDIF. Browser title: "CTO360 · Enterprise Technology Control Tower".
- **Header (64 px, navy #0F2747):** brand left; right = **Business unit switch** (Banking / Manufacturing / Retail — keeps the domain-agnostic story), "Updated" timestamp, notifications, user.
- **Sidebar:** white, 9 collapsible sections — Executive Overview · Strategy · Enterprise Architecture · Operations · Engineering · Finance · Innovation · Risk & Governance · AI Intelligence. **All ~35 existing routes kept**, regrouped. Active item = #EFF6FF background, #1D4ED8 text, blue left indicator. Domain views (with red-escalation counts) sit under Executive Overview.
- **Tokens updated to the spec:** navy #0F2747, blue #2563EB, page #F6F8FB, border #E2E8F0, text #172033 / #475569 / #64748B / #94A3B8, semantic text+background pairs (success, warning, critical, info). Page title 28/700 navy; KPI values 28/700 navy.
- **Chart palette:** spec palette (blue / slate / grey) for single-series and comparisons; **domain comparisons keep the validated blue / aqua / orange** — the spec's slate + grey failed the colour-blind/chroma validator for telling categories apart.
- **Verified:** 35 pages × 1366 px laptop + 390 px phone = 70 checks, no horizontal overflow.

Phase 2 (Executive Overview rebuild) and Phase 3 (Engineering, consolidated Risk & Governance, AI Intelligence hub) are **not started** — they add new content, so they need approval first.

**Disk note:** the Mac ran out of disk space on 6 Oct; keep a few GB free for builds and tests.

---

## 20. Operational resilience tabs — Step A (6 Oct 2026)

Each industry view (sidebar → Executive Overview → Banking / Manufacturing / Retail view) now has tabs: **Overview** (existing CTO → ground) · **Applications & incidents** · **Cyber security** · **Business impact (P&L)**. Deep links: `/domain/banking?tab=apps`, `?tab=cyber`, `?tab=pnl`.

**Where to update the figures:** `src/data/resilience.ts` — `apps` (availability, P1–P4 counts, MTTR …), `cyber` (threats, controls, vulnerabilities, events), `losses` (₹ lakh per incident), `prevention` (cost vs loss avoided). Screens: `src/pages/domain/AppsTab.tsx`, `CyberTab.tsx`, `PnlTab.tsx`.

**Rules (status is calculated, never typed):**
- **Critical:** any P1, availability below target, or 50+ incidents in 30 days.
- **Degraded:** 3+ P2s, 2+ repeat incidents, MTTR above target, any SLA breach, or 30+ incidents.
- **Priority = impact × urgency;** an unhealthy app on a critical business service is always **High** and appears in the domain's *Escalations to CTO* panel. Healthy apps are Low.
- Example: Retail POS has fine availability and no P1, but 56 incidents in 30 days → **Critical / High**.
- **Cyber:** any breach or a late DPDP report → Critical; EDR < 95 % or critical vulnerability past patch SLA → Degraded. Organised by NIST CSF 2.0 (Govern, Identify, Protect, Detect, Respond, Recover); shows attempts → blocked → contained → not stopped.
- **P&L:** incident cost = lost revenue + productivity + SLA penalties + fines + recovery + estimated churn; mapped to P&L lines; Finance (Santhosh) validates — unvalidated figures excluded from board reporting. Prevention vs loss-avoided chart = the investment case.
- Every app and cyber improvement shows **Current → Proposed → Feasibility → PoC → Pilot → Scale** with owner and feasibility score.

**Step B (not started, awaiting go-ahead):** DR & BCP (tiers, RTO/RPO tested vs target, DR options, drills), Customer (CSAT, NPS, closed feedback loop linked to incidents), Vendors & tech support (L1–L3, vendor SLA, supply-chain systems), End of life (EOL register, who owns it, decision options).

---

## 21. Resilience tabs Step B, plus CTO360 Phases 2 and 3 (6 Oct 2026)

**Domain page tabs** (`/domain/<id>?tab=...`): overview · apps · cyber · **dr** · **customer** · **vendors** · **eol** · pnl. The escalations panel on the Overview tab links to every critical item.

| Tab | Data in `resilience.ts` | Rule (calculated, never typed) |
|---|---|---|
| DR & BCP | `drOptions`, `dr`, `bcp` | `drStatus`: Critical if a Tier 0–1 app was never tested, the drill failed, or the tested RTO is above target. Amber if the drill is overdue or partial. |
| Customer | `customer` (CSAT, NPS, complaints, channels, loop) | `customerStatus`: falling CSAT, or complaints not closed within SLA |
| Vendors & support | `support`, `vendors` | `vendorStatus`: Critical if a single point of failure has no exit plan, or the SLA was missed on a critical app |
| End of life | `eol`, `eolRaci` | `eolStatus`: Critical if past end of support with no decision, or the risk exception has expired. The app owner is accountable; the RACI is shown on the tab. |

**Phase 2: Executive Overview** (`src/pages/overview/ExecSummary.tsx`, placed above the original content under "Detail"):
- 6 KPIs
- a Signal → Insight → Decision → Action → Outcome strip
- 4 health cards (strategic, operational, engineering, financial)
- Top risks, Major exceptions, Decisions required, Priority actions

**Phase 3: new pages:**
- `/engineering`: deployment frequency, lead time, change failure, MTTR, deploy trend, domains compared, team capacity, plan health by role level L1–L9, blockers. Data: `src/data/engineering.ts`.
- `/risk`: consolidated register built automatically by `riskRegister()` from applications, cyber, DR, vendors, end of life and the TEDIF programme. Filter by domain and severity. Shows business and technical impact, control status, owner, mitigation, due date and evidence. Severity rules: a Tier-0 DR item is Critical only if never tested or failed; end-of-life past support shows "Overdue".
- `/ai`: six insights from `insights()` in the format Observation → Evidence → Recommendation → Expected impact → Confidence → Human decision (Accept / Reject, held in memory only). "AI recommends. Humans decide."

**Sidebar additions:** Engineering → Engineering metrics; Risk & Governance → Risk register; AI Intelligence → AI insights.

---

## 22. Enterprise Source-System Simulation: plan (6 Oct 2026, not started)

**Spec:** `docs/SIMULATION_SPEC.md` (32 sections). It turns CTO360 into a simulated control tower over 7 capability layers:

| Layer | Simulated source |
|---|---|
| Strategy | Planview |
| Architecture | SAP LeanIX |
| Process | Celonis + Signavio |
| Portfolio | ServiceNow SPM |
| Engineering | Jellyfish |
| Operations | Datadog |
| Governance | Vanta |

**Verdict:** strong direction, and the right story for a CTO capstone: "existing tools see functions; CTO360 connects them into decisions". It also answers the obvious panel question, "why not just buy ServiceNow?" It is large (about 2–3 focused build days). Build it in sprints; each sprint leaves the site working and deployable.

### Key design decisions (recommended)
1. **One canonical model, not 7 datasets.** New folder `src/data/sim/`:
   - `model.ts`: the entity types, each with `{id, name, domain, owner, status, health, rel:{...ids}, source, lastUpdated}`.
   - Data files: `banking.ts`, `manufacturing.ts`, `retail.ts`.
   - `scores.ts`: health calculations.
   - `intelligence.ts`: correlation → decisions.

   ID scheme: `OBJ-BNK-01`, `INIT-BNK-004`, `APP-BNK-017`, `PROC-BNK-03`, `PRJ-BNK-012`, `TEAM-BNK-06`, `SVC-BNK-011`, `INC-BNK-0231`, `RISK-BNK-008`, `CTL-BNK-021`, `DEC-BNK-02`, `ACT-BNK-05`. Use MFG and RTL for the other domains.
2. **Hand-author the stories, generate the filler.**
   - The 3 executive stories per domain are written by hand as a connected chain (initiative → app → process → project → team → service → risk/control) with numbers that tell the story.
   - The remaining records (to reach about 25 apps, 20 services and so on) come from a **seeded** generator, so values never change between reloads.
   - Generated values follow rules: healthy filler only, plus a few Medium items, so the data stays "mostly healthy, few exceptions".
3. **Scores are calculated, never typed** (this extends the existing rule).
   - Capability score = weighted average of normalised metrics. For example:
     - **Operations:** SLO compliance, P1 count, MTTR vs target.
     - **Governance:** % of controls passing, open critical risks, remediation age.
   - Domain score = average of the 7 capability scores. Enterprise score = average of the domains.
   - Write the formula on screen ("How is this calculated?").
4. **Decision engine = rules over linked records.** A decision card is raised when one initiative chain has ≥ 3 layers in an exception state, for example progress behind, a blocking legacy app, a delayed milestone, a capacity gap, an incident trend or a failing control.
   - Priority comes from the number of layers involved plus business criticality.
   - Confidence comes from the number and strength of signals.
   - Every signal line shows its source record ID. This gives real traceability without "AI text".
5. **Time:** a 12-month monthly series (Nov 2025 – Oct 2026) per score and per key metric, plus a 3-month forecast. A 30 days / Quarter / 6 months / 12 months selector slices the same series. "Today" is 6 Oct 2026, consistent with the header.
6. **Decision → Action → Outcome loop.**
   - Approve on a card → actions appear in the Action Tracker (state kept in localStorage with a "reset demo" button).
   - For the story, 1–2 decisions per domain are already approved, with outcomes showing baseline → target → current → variance.
7. **Legal wording.**
   - Always write "Simulated Source: X" in small grey text under the section title.
   - No vendor logos or colours.
   - A Data Sources page with the banner "Demonstration environment using simulated enterprise data. No live vendor integrations are active."
   - The footer keeps "Demo data".
8. **Reuse what exists** instead of duplicating it:
   - The current resilience tabs (apps, cyber, DR, customer, vendors, EOL, P&L) and the rules in `resilience.ts` become the Operations and Risk & Governance views.
   - The current 5 apps per domain become the critical anchors inside the 25-app portfolio, so their IDs are mapped.
   - `/risk`, `/ai` and `/engineering` are rebuilt on the canonical model.
   - The TEDIF and tracker pages stay as they are.

### Navigation (proposed)
- **`/` → Executive Command Center** (cross-domain): enterprise health, domain scores, 7 capability scores with trend, counts, Top decisions, Top risks, transformation health, investment, operations and outcomes.
- Cross-domain comparison table: health, trend arrow and primary issue.
- **Each domain `/domain/:id/:capability`**: Overview · Strategy · Architecture · Process · Portfolio · Engineering · Operations · Risk & Governance · Decision Intelligence.
  - Each screen opens with its CTO question.
  - Drill-down uses a side panel or record page, `/domain/:id/record/:recordId`, showing the record, its relationships and its source. The back button returns to the same view.
- **New pages:** `/actions` (Action Tracker), `/outcomes`, `/sources` (Data Sources).
- The current 8 domain tabs move under the new Operations and Risk & Governance sections, so no feature is lost.

### Build order (sprints)
- **S1 Foundation:** canonical types, ID scheme, seeded generator, Banking hand-authored chains; `scores.ts`; `/sources` page; validation script (relationships resolve, budgets reconcile, % in 0–100, trends end at the current value).
- **S2 Domain capability pages:** Overview health + 6 KPIs, then Strategy, Architecture, Process, Portfolio, Engineering, Operations, Governance, all for Banking first, then Manufacturing and Retail data.
- **S3 Decision Intelligence:** correlation rules, decision cards with signals, evidence and confidence, Approve → Actions, Outcomes.
- **S4 Command Center + cross-domain compare + time range selector**, overflow check on all routes, notes, commit.

### Risks / watch-outs
- **Scope:** about 600–800 records. Keep tables paginated with filters, and lead with exceptions.
- **Consistency:** the validation script in S1 is the safety net. Run it after every data change.
- **Demo clarity:** in a 3–5 minute demo, show one story end to end, Banking "Digital Payments Modernization at Risk", rather than every page.
- **Presentation:** vendor names are used only for nominative reference with "Simulated"; never "integration", "partner" or "connected".

### Open questions for the user (decide at the start of the next session)
1. Replace the current `/` Executive Overview with the Command Center? (Recommended: yes. The current overview content moves to the domain Overview.)
2. Build all 3 domains fully, or Banking fully plus the other two at lower data volume? (Recommended: all 3 at about 70% of the spec volume.)
3. Keep the Decision approvals in localStorage only (fine for the demo) until the Python API / live AI phase?

---

## 23. Merged plan: Simulation (spec 1) + Enterprise 360 (spec 2), 6 Oct 2026, not started

### 23.1 How the two specs fit together
They are not two products; they are **two axes of one model**:

| Axis | What it is | Example |
|---|---|---|
| **16 enterprise functions** (spec 2) | *What* the CTO looks at: the business context | Finance, Sales, HR, Cyber, Data & AI |
| **7 source layers** (spec 1) | *Where the signal comes from* (simulated) | Planview, LeanIX, Datadog, Vanta |
| **3 domains** | *Which business* | Banking, Manufacturing, Retail |

Every metric = function × domain × source, held as one record in the canonical model. Decisions correlate metrics across functions. This keeps the site one framework instead of 16 + 7 dashboards.

### 23.2 Overall changes to make (the recommendation)
1. **Split the 16 functions into two clear classes, shown visually:**
   - **CTO-owned (deep, 6):** Technology · Enterprise Architecture · Engineering & R&D · Data & AI · Cybersecurity (co-owned with the CISO) · Product & Innovation (co-owned with the CPO). Each gets a full dashboard with drill-down to records (apps, services, teams, use cases).
   - **Signal functions (lighter, 10):** Corporate Strategy · Finance · Operations · Sales · Marketing · CX & Service · HR · Risk & Compliance · Legal · Procurement & Vendors. Each gets one standard dashboard: KPIs + trend + "technology impact on this function" + dependencies.
   - A label on every card: "CTO-owned" vs "Signal to CTO · owner CFO". This answers the rule "do not replace CXO systems".
2. **One reusable Function Dashboard template, driven by data.** One React component renders all 16 functions × 3 domains, using config: metrics list, chart types, CTO question, owner, source. Building 48 hand-made pages would be impossible in the time and inconsistent.
3. **One Metric object everywhere** (spec 2 §8):
   - Fields: `{id, name, unit, current, target, previous, direction (higher/lower is better), owner, source, updated, series[12 months], forecast[3]}`.
   - Status (G/A/R) and variance are **calculated** from target and direction (for example, Green within 2% of target, Amber within 10%, Red otherwise; tunable per metric).
   - The UI component `MetricCard` always shows current · target · variance · trend sparkline · status · owner · updated. No number appears without context.
4. **Scores roll up, never typed:** metric → function health (7 heatmap columns: Strategy, Performance, Cost, Technology, Risk, Transformation, Overall) → domain health → enterprise health. The 14 executive scores in spec 2 §2 are named roll-ups of these. Show **6 large + 8 compact** cards, not 14 large ones; 14 large cards fail the "5-second" rule.
5. **Domain page structure (new):**
   - **Executive 360** (top): 6 large + 8 compact KPI cards, 12-month trend.
   - **Enterprise health heatmap:** 16 rows × 7 columns; click a row to open the function.
   - **16 function cards**, grouped as CTO-owned and Signals.
   - **Cross-functional intelligence:** correlated insights with evidence.
   - **Decision Center Top 10:** shared with spec 1's decision cards; one engine.
   - **Maturity:** levels 1–5 per technology management area, current → target, gap. Note: "not a CMMI assessment".
   - **Existing tabs** (apps, cyber, DR, customer, vendors, EOL, P&L) stay, re-homed: Apps / DR → Technology; Cyber → Cybersecurity; Customer → CX; Vendors → Procurement; EOL → Enterprise Architecture; P&L → Finance. Nothing is lost.
6. **Route plan:**
   - `/`: Enterprise Command Center (cross-domain).
   - `/domain/:id`: Executive 360.
   - `/domain/:id/fn/:function`: the function dashboard.
   - `/domain/:id/record/:recordId`: drill-down record with relationships and source.
   - `/decisions` (Top 10 + engine).
   - `/actions`, `/outcomes`, `/sources`.
   - The current sidebar groups shrink: Strategy / Architecture / etc. become function links inside the domain. TEDIF, the tracker and the CTO pages stay under "Programme & framework".
7. **Decision engine** (one for both specs): rules over linked records produce a card when ≥ 3 functions or layers show exceptions on one chain.
   - Fields: why now, business / technology / financial impact (₹ from Finance metrics), risk, recommendation, executive owner, confidence, deadline, status.
   - Approve → Actions → Outcomes (baseline / target / current / variance).
   - Each domain has 3 hand-written stories (spec 1 §21), and those become the top decisions.
8. **Data volume:**
   - Each domain has 16 functions with about 6–8 metrics, so about 110 metrics, each with 12 months of history. Spec 1's records (apps, services, teams and so on) add about 200 more per domain.
   - Generate with a **seeded** generator around hand-written story anchors, then run a **validation script** (relationships resolve, budgets reconcile, % in range, series end at current, statuses match). Expect about 70% of the spec volume per domain to keep it buildable.
9. **Visual rules (spec 2 §9–10)** fit the existing design system:
   - Line / area for trends, bars for comparison, donut only for composition, heatmaps for risk and maturity, and at most 1–2 gauges per page.
   - G / A / R uses the existing ok / warn / crit tokens with an icon and label, never colour alone. No vendor colours.
   - About 70% visual.
10. **Wording rules:** "Simulated Source: X" or "X-style signal". Never "connected", "integrated" or "partner". No vendor logos. Maturity is "management visualisation, not certification". The `/sources` banner says no live integrations.

### 23.3 What to keep, change or remove from today's site
- **Keep:** the design system, CTO360 shell, TEDIF tracker, programme tracker, CTO pages (as the framework section), resilience rules in `resilience.ts`, and the overflow-test tooling.
- **Change:**
  - `/` becomes the Command Center.
  - Domain pages become Executive 360 + functions.
  - `/risk`, `/ai` and `/engineering` are rebuilt on the canonical model. `/ai` merges into Cross-functional intelligence; `/engineering` becomes the Engineering & R&D function.
- **Remove later (only after the replacement exists):** the duplicate KPI blocks in the old Overview "Detail" section.

### 23.4 Build order (supersedes section 22)
| Sprint | Scope | Result |
|---|---|---|
| **M1 Foundation** | `src/data/sim/`: `model.ts` (Metric, Function, entities, IDs), `functions.ts` (16 definitions: owner, class, CTO question, metric templates, source), seeded generator, Banking data, `scores.ts`, validation script | Data is correct before any UI |
| **M2 Metric UI** | `MetricCard`, `Sparkline`, `Heatmap`, `Funnel`, `RiskMatrix`, `TimeRange` (30d / Q / 6m / 12m) components | Reusable visuals |
| **M3 Domain Executive 360** | KPI cards, 16-row heatmap, function cards, Function Dashboard template, existing tabs re-homed | Banking complete, then Manufacturing and Retail data |
| **M4 Deep CTO functions** | EA (capability heatmap, app matrix, dependency drill-down), Engineering (DORA), Technology / Ops (services, incidents), Data & AI, Cyber, Risk & Compliance (controls) | Spec 1 layers covered |
| **M5 Intelligence** | Correlation rules, cross-functional insights, Decision Center Top 10, Actions, Outcomes, Evidence panel, maturity view | The differentiator |
| **M6 Command Center** | Cross-domain `/`, domain comparison, `/sources`, notes, overflow check on all routes, commit | Demo-ready |

Each sprint ends deployable. Rough effort: M1–M3 about 1.5 days, M4–M6 about 1.5–2 days.

### 23.5 Demo story (3–5 minutes)
1. Command Center: "Banking needs a decision".
2. Banking Executive 360: heatmap shows Architecture and Cyber amber/red.
3. Open the EA function: 3 customer-facing apps on EOL tech, 41% of P1s.
4. Cross-functional insight: EA + Cyber + Finance + CX evidence.
5. Decision "Modernise core banking integration layer": ₹8.4 Cr in, ₹13.2 Cr benefit.
6. Approve → actions.
7. Outcome tracker showing an earlier approved decision that already delivered (incidents −30%).

Close on the line: "Tools see functions; CTO360 connects them into decisions."

### 23.6 Risks
- **Scope creep:** 48 function views. The template approach is mandatory, and the 10 signal functions stay light.
- **Number consistency:** the validation script must pass before each commit.
- **Executive layer overload:** apply exception over volume; show only Amber/Red on cards by default.
- **Legal / brand:** wording rules in 23.2 (10).

### 23.7 Open questions (answer at the start of the next session)
1. Make `/` the cross-domain Command Center? (Recommended: yes.)
2. Data volume: all 3 domains at about 70% of the spec? (Recommended: yes.)
3. Approvals and actions in localStorage until the Python API phase? (Recommended: yes.)
4. Is the CTO-owned vs Signal split of the 16 functions (23.2 point 1) acceptable?
5. Keep the TEDIF, programme tracker and 11 CTO pages as a separate "Programme & framework" sidebar group? (Recommended: yes.)

### 23.8 Navigation: FINAL decision (user, 6 Oct 2026). Approved ASCII mockups: `docs/MOCKUPS.md`
**User decision:** the 7 source systems are important and must be **sub-pages of each domain**. Claude decides how the 16 functions are placed (below).

**Structure per domain** (repeated for Banking, Manufacturing and Retail; same components, different data):
```
/domain/:id                     Overview = Executive 360 + 16-function heatmap + Top decisions
/domain/:id/planview            Strategy & Portfolio        (Simulated Source: Planview)
/domain/:id/leanix              Enterprise Architecture     (Simulated Source: SAP LeanIX)
/domain/:id/process             Process Intelligence        (Simulated Sources: Celonis + SAP Signavio)
/domain/:id/servicenow          Portfolio & Workflow        (Simulated Source: ServiceNow SPM)
/domain/:id/jellyfish           Engineering Intelligence    (Simulated Source: Jellyfish)
/domain/:id/datadog             Operations & Observability  (Simulated Source: Datadog)
/domain/:id/vanta               Security, Risk & Governance (Simulated Source: Vanta)
/domain/:id/fn/:function        one of 16 function views (one template)
/domain/:id/record/:recordId    drill-down record + relationships + source
```
- **Source sub-page label:** two lines, the capability on top and "Simulated · Planview" underneath. The sources are prominent, as the user wants, while the wording stays legally safe (spec 1 §30). Each source page has:
  - a "source header": simulated sync time, records held, events in the last hour, a live event feed, and the "Simulated enterprise data, no live integration" note
  - the artifacts from spec 1 §4–10 (objectives and initiatives; app portfolio and tech lifecycle; processes; projects; teams and DORA; services and incidents; risks and controls)
  - drill-down to records
- **16 functions (Claude's call):**
  - They are the **business lens on the domain Overview**: a 16-row heatmap (7 columns) plus compact cards grouped "CTO-owned (6)" and "Signals to CTO (10)".
  - Clicking one opens `/domain/:id/fn/:function`. This is **one template**, giving 48 views from one file.
  - Function pages do not duplicate source data. They show the function's KPIs and trend, then "**Fed by**" panels that link into the source sub-pages (e.g. Enterprise Architecture → LeanIX page; Cybersecurity → Vanta + Datadog).
  - Functions with no tool (Sales, Marketing, HR, part of Data & AI) use synthetic business metrics labelled "Simulated business data".
  - Result: **sources = the system lens** (where the data comes from); **functions = the business lens** (what it means for the CFO, COO and so on).
- **Sidebar:** the header switcher picks the domain. Sidebar groups:
  - **Command Center**
  - **[Domain name]:** Overview + the 7 source sub-pages
  - **Enterprise functions:** collapsible, 16 items in 2 sub-groups, following the selected domain
  - **Decisions & outcomes:** Decision Center, Actions, Outcomes
  - **Data sources:** cross-domain sync status
  - **Programme & framework:** TEDIF, trackers, CTO pages
- **Existing domain tabs move to sources:**

| Existing tab | Source page |
|---|---|
| apps, DR, P&L impact | Datadog (operations) |
| cyber | Vanta (plus Datadog security events) |
| EOL | LeanIX (technology lifecycle) |
| vendors | ServiceNow (vendor and support workflow) |
| customer | Process Intelligence (customer processes) + CX function |

- **Real-time simulation:**
  - A seeded clock (`src/data/sim/clock.ts`) ticks every 5–10 s. Each source emits its own event types:

| Source | Events |
|---|---|
| Planview | spend posting, milestone |
| LeanIX | lifecycle change |
| Process | process exception |
| ServiceNow | task or milestone update |
| Jellyfish | deploy, PR merged |
| Datadog | incident opened or resolved, latency |
| Vanta | control test pass or fail |

  - Events update the linked metrics, function scores and decision confidence.
  - The header shows "● Simulation live", with Pause and Reset.
- **Build order impact:**
  - M3 = Overview + **7 source pages** for Banking. Then Manufacturing and Retail data.
  - M4 = 16-function template + "Fed by" links.
  - The rest is unchanged.

---

## 24. M1 done: simulation data foundation (6 Oct 2026)

Nothing visible on the website yet; this is the data engine the new pages will read. `npm run build` passes.

### Files (`src/data/sim/`)
| File | What it is |
|---|---|
| `model.ts` | Canonical entities: Objective, Initiative, Application, Technology, Process, Project, Team, Service, Incident, Risk, Control, Metric, Story. Each has id, name, domain, owner, status, **health (calculated)**, source, updated and `why[]` (the reasons for its health). Also `SIM_NOW` = 6 Oct 2026 09:30 IST and the 12 months Nov 2025 → Oct 2026. |
| `config.ts` | Shape of a domain configuration: hand-written records with index links. |
| `domains/banking.ts` | **Meridian Bank (fictional).** 6 objectives, 10 initiatives, 24 apps, 22 technologies, 9 processes, 14 projects, 10 teams, 18 services, baseline risks, business metric values and 3 stories. **To change Banking figures, edit this file.** |
| `functions.ts` | The 16 functions: owner, CTO-owned or Signal, CTO question, source systems, and **6 metrics each, one per heatmap column** (Strategy, Performance, Cost, Technology, Risk, Transformation). A metric with `derive` is calculated from records; otherwise the value comes from `business` in the domain config. |
| `build.ts` | Config → entities. **All health, status and severity values come from rules here.** It generates incidents (seeded), works out availability from incident downtime, raises risks from conditions (failing controls, EOL tech, red initiatives, red services, overloaded teams) plus baseline risks, and builds 12-month metric series. |
| `scoring.ts` | One rule for every metric: distance from target against a Green / Amber band, giving a score of 0–100 and a status. |
| `scores.ts` | Roll-ups: `functionHealth`, `domainHealth`, `sourceHealth` (the 7 sources: half record health, half the main function fed) and `exec360` (14 KPIs). |
| `rng.ts` | Seeded random numbers and series that end exactly at the current value, so data is identical on every reload. |
| `validate.ts` + `scripts/validate-sim.mjs` | **`npm run validate:sim`** checks that all IDs resolve, budgets reconcile (objective = sum of initiatives; projects ≤ initiative), percentages are 0–100, series end at current, service incident counts match the incident log, team allocation sums to 100, red share stays at or below 30%, there are at most 3 critical risks, and volumes match the spec. It prints all scores and the story chains. **Run it after every data change.** |
| `index.ts` | `sim.banking`, plus the helpers the pages will import. |

### Key rules (from `build.ts`)
- **Initiative:** Red if more than 10 points behind plan or forecast more than 10% over budget. Amber if more than 5 points behind, more than 5% over, or value realisation below 70%. An objective takes the worst health of its initiatives.
- **App:** Red if technical health < 40, or a mission-critical app on EOL tech with health < 55. Amber if it uses EOL tech, health < 65, or is marked Migrate / Retire.
- **Tech lifecycle:** from the EOL date vs 6 Oct 2026: past = End of life; under 12 months = Extended support; under 3 years = Mainstream; otherwise Current.
- **Service:** availability = 99.99 minus 30-day downtime (P1 full duration, P2 half). Red if there was a P1 and availability is below SLO, or availability is more than 0.1 below SLO. SLO by criticality: 99.95 / 99.9 / 99.5 / 99.
- **Project:** Red if more than 30 days late, more than 10% over budget, or 2 or more late milestones.
- **Team:** Red if capacity gap > 15% or predictability < 70%.
- **Process:** Red if cycle time is more than 2.2× target or conformance < 75%.
- **Risk:** severity = likelihood × impact. ≥ 20 Critical, ≥ 12 High, ≥ 6 Medium.

### Banking result (calibrated to the spec's "mostly healthy, few exceptions")
- **Enterprise health: 78 (Amber)**, matching the spec example exactly.
- **Enterprise Architecture is the red exception: 55** (6 EOL technologies, 5 mission-critical apps on EOL tech).
- 39 incidents. 23 risks: 1 Critical, 12 High.
- **Source scores:**

| Source | Score |
|---|---|
| Planview | 78 |
| LeanIX | 68 |
| Process | 67 |
| ServiceNow | 75 |
| Jellyfish | 79 |
| Datadog | 85 |
| Vanta | 78 |

- **Stories, each connected through 7+ layers:**
  1. *Digital Payments Modernization at Risk*: INIT-BNK-002 (12 points behind, 12% over) → Payments Hub / service bus / Payments API → Payment Processing → PRJ-BNK-001 (45 days late, 2 milestones late) → Payments Engineering team (18% capacity gap) → SVC-BNK-002 Payments API (P1, below SLO) → CTL-BNK-007 TLS failing → **RISK-BNK-012, Critical**.
  2. *Core Banking Legacy Risk*: INIT-BNK-009 Integration Layer Modernization → Core Banking / service bus / Internet Banking on EOL tech → Customer Onboarding (2.5× target) → service bus replacement project late → Integration team → service bus broker → CTL-BNK-017 unsupported software failing → RISK-BNK-003.
  3. *Fraud Platform Scaling Requirement*: INIT-BNK-003 (on track) → Fraud Detection Platform → Fraud Investigation (72% false positives) → Fraud model scale-out → Fraud team → Fraud scoring service under strain → AI bias review not tested.

### Next
- **M2:** UI building blocks, using the existing design tokens: `MetricCard` (current / target / variance / trend / status / owner / updated), `Sparkline`, `Heatmap` (16 × 6), `SourceBadge` ("Simulated · X"), `TimeRange` (30d / Qtr / 6m / 12m slicing the 12-month series), `EventFeed`, and a "why this colour" tooltip from `why[]`.
- **M3:** domain Overview (Executive 360 + heatmap + source strip) and the 7 source pages for Banking. Then add `domains/manufacturing.ts` and `domains/retail.ts` (same shape, different data and stories), and run `validate:sim` on each.
- **Known tuning items:** the derived metric "start" values (12 months ago) use a rule (Red = was better, so worsening; Green / Amber = improving). They can be overridden per metric later if a story needs a specific trend.

---

## 25. M2 and M3 explained (scope checklist)

### M2: UI building blocks (about half a day)
**Why:** M3–M6 build about 70 screens (3 domains × 7 sources, plus 16 functions, decisions and so on). Building each visual piece once, in the CTO360 design system, keeps every page consistent and fast to build. These are like Lego bricks; the pages come in M3.

| Component | What it shows | Used on |
|---|---|---|
| `MetricCard` | current · target · variance · trend arrow · G/A/R status with icon · owner · "updated 12 min ago" · sparkline. Never a bare number (spec 2 §8). | every page |
| `Sparkline` / `TrendChart` | 12-month line plus 3-month forecast (dashed); target line | cards, function pages |
| `TimeRange` | 30d · Quarter · 6m · 12m selector that slices the same 12-month series | page headers |
| `HealthHeatmap` | 16 functions × 6 columns + Overall; click a row → function page | domain Overview |
| `SourceBadge` | "Simulated Source: SAP LeanIX" + sync time (legal wording rule) | source and function pages |
| `StatusPill` + `WhyTip` | Green/Amber/Red with shape icon; hover shows *why* (from each record's `why[]`) | tables, cards |
| `RecordTable` | sortable, filterable table with exceptions first, paging and a "show all" option | source pages |
| `EventFeed` | scrolling simulated events (deploys, incidents, control tests) | source pages, header |
| `ScoreRing` | 0–100 score ring for enterprise, domain, function and source | overview pages |

**Done when:** all components appear on a hidden test page `/sim-lab` with Banking data, pass the phone / tablet / laptop overflow check, and the build passes. The live site looks the same as before.

### M3: domain Overview + 7 source pages (about 1–1.5 days); first big visible change
1. **Domain Overview `/domain/:id`** (see `docs/MOCKUPS.md` §1):
   - Executive 360: 6 large + 8 compact KPI cards with 12-month trend
   - 7-source strip with scores and sync time
   - 16-function heatmap
   - Top 3 decisions (placeholder cards until M5)
2. **7 source sub-pages per domain** (see mockup §2):

| Route | Simulated source | Main contents |
|---|---|---|
| `/domain/:id/planview` | Planview | objectives, initiatives, budget vs actual, value realisation, initiative heatmap |
| `/domain/:id/leanix` | SAP LeanIX | 24 apps (lifecycle × health matrix), technology lifecycle / EOL, capability heatmap, dependencies |
| `/domain/:id/process` | Celonis + Signavio | 9 processes, cycle time vs target, conformance, bottlenecks, transformation pipeline |
| `/domain/:id/servicenow` | ServiceNow SPM | 14 projects, schedule slip, budget variance, demand vs capacity, milestones |
| `/domain/:id/jellyfish` | Jellyfish | 10 teams, allocation (roadmap / unplanned / debt / KTLO), DORA metrics, capacity gaps |
| `/domain/:id/datadog` | Datadog | 18 services, SLOs, incident log, MTTR, cost; **plus today's Apps, DR & BCP and P&L tabs** |
| `/domain/:id/vanta` | Vanta | 24 controls by framework, risk register and heatmap, remediation aging; **plus today's Cyber tab** |

   Each page has a "Simulated Source" sync strip at the top and the CTO question as its subtitle.
3. **Record drill-down** `/domain/:id/record/:recordId`: the record, its `why[]`, its links up and down the chain, and its source.
4. **Sidebar:** under the selected domain, Overview + the 7 sources (capability name, with "Simulated · Planview" underneath).
5. **Re-home existing tabs** so nothing is lost:

| Existing tab | New home |
|---|---|
| Customer | Process Intelligence |
| Vendors | ServiceNow |
| End of life | LeanIX |

6. **Manufacturing and Retail data:** `domains/manufacturing.ts` and `domains/retail.ts`, each with its own 3 stories:
   - Manufacturing: Smart Factory delay, MES reliability, PLM tech debt
   - Retail: E-commerce peak readiness, inventory transformation delay, POS modernisation and security

   Each must pass `validate:sim` with enterprise health of about 70–82.

**Done when:** all 3 domains show the Overview and 7 source pages with their own data; the validator passes for all 3; the overflow check passes on all new routes; notes are updated; changes are committed.

---

## 26. M2 + M3 done: Enterprise 360 pages are live (6 Oct 2026)

**What changed on the website.** `/domain/banking`, `/domain/manufacturing` and `/domain/retail` now open the new **Enterprise 360** overview. The sidebar has a new top group, **"<Domain> 360"**, holding the overview and the 7 simulated source pages. The header shows **● Simulation live, a clock, Pause and Reset**.

### Routes (new)
| Route | Page | File |
|---|---|---|
| `/domain/:id` | Enterprise 360 overview: enterprise health ring, 5 large + 8 compact KPIs (Executive 360), 7 source cards, 16-function heatmap, "Needs your attention" (the 3 stories with their 7-layer chain), live event feed | `src/pages/sim/DomainHome.tsx` |
| `/domain/:id/planview` | Strategy & Portfolio: objectives, initiatives, investment allocation, budget vs forecast chart, initiative heatmap | `sources/Planview.tsx` |
| `/domain/:id/leanix` | Enterprise Architecture tabs: application portfolio · rationalisation matrix (TIME) · technology lifecycle · capability heatmap · dependency view · **End of life (old tab)** | `sources/LeanIX.tsx` |
| `/domain/:id/process` | Process Intelligence tabs: process performance + cycle-time trend + bottleneck panel · transformation pipeline · **Customer (old tab)** | `sources/ProcessIntel.tsx` |
| `/domain/:id/servicenow` | Portfolio & Workflow tabs: 6 KPI tiles · projects · demand vs capacity · **Vendors & support (old tab)** | `sources/ServiceNow.tsx` |
| `/domain/:id/jellyfish` | Engineering Intelligence tabs: teams with allocation bars · investment and allocation + tech-debt trend (team level only, no individual ranking) | `sources/Jellyfish.tsx` |
| `/domain/:id/datadog` | Operations & Observability tabs: services + availability trend + weekly incident trend · incidents · **Applications, DR & BCP, P&L (old tabs)** | `sources/Datadog.tsx` |
| `/domain/:id/vanta` | Security, Risk & Governance tabs: risk register · 5×5 risk heatmap · controls by framework · **Cyber (old tab)**. Labelled "monitoring simulation, not a certification". | `sources/Vanta.tsx` |
| `/domain/:id/record/:rid` | Drill-down for any record: why it has its colour, its fields, "Links to", "Linked from", source, trend | `src/pages/sim/RecordPage.tsx` |
| `/domain/:id/fn/:fn` | Function page (first version of M4): 6 metric cards, 12-month function trend, "Fed by" source links, exceptions from its sources, previous / next function | `src/pages/sim/FunctionPage.tsx` |
| `/domain/:id/programme` | **The previous domain page, unchanged**: TEDIF problems, CTO → developer cascade, all 8 old tabs | `src/pages/DomainView.tsx` |

**Old links still work.** `/domain/x?tab=apps|dr|pnl|cyber|eol|vendors|customer|overview` redirect to their new homes. The Risk register, AI insights and Executive Overview links therefore still land on the right content.

### Building blocks (M2), in `src/components/sim/`
| File | Contents |
|---|---|
| `primitives.tsx` | `MetricCard` (current · target · variance · trend vs period · status · owner · updated · sparkline), `ScoreCard`, `Tile`, `ScoreRing`, `Sparkline`, `StatusPill` (icon + word, with a "Why red/amber" tooltip from `why[]`), `SourceBadge` ("Simulated Source: X"), `Bar2` (progress with a plan marker) |
| `range.tsx` | `TimeRange`: 30 days / Quarter / 6 months / 12 months, kept in the URL (`?range=`) so drill-down and back keep context. `useKeepRange()` carries it into links. |
| `charts.tsx` | `TrendChart`: actual line, dashed 3-month forecast, dashed target line, single axis |
| `HealthHeatmap.tsx` | 16 × 6 heatmap plus Overall, grouped CTO-owned / Signals. Each cell is one metric (hover for the value). Click a row to open the function page. |
| `RecordTable.tsx` | Exceptions first, filter, sortable columns, "Show all" |
| `EventFeed.tsx` | `EventFeed`, `SyncStrip` ("Simulation active · synced X ago · N records · events in the last hour" + "no live vendor integration"), `ClockControls` |
| `clock.tsx` | `SimClockProvider`: the simulation clock starts at 6 Oct 2026 09:30 IST and ticks every second (pausable, resettable) |
| `src/data/sim/events.ts` | Deterministic event stream. 60 past events plus 80 future events, released one every 6 s by the clock. Every event links to a real record. |

### Data (M3)
- `domains/manufacturing.ts`: **Arvant Industries (fictional)**, enterprise health **73**, weakest **Operations**.
  - Stories: Smart Factory Program Delay; MES Reliability Impacting Production; PLM Technical Debt Blocking Engineering Automation.
- `domains/retail.ts`: **Orbit Retail (fictional)**, enterprise health **76**, weakest **Operations / Engineering**.
  - Stories: E-commerce Peak Readiness Risk; Inventory Transformation Delay; POS Modernization and Security Risk.
- Banking stays at **78**, weakest **Enterprise Architecture**. Each domain therefore tells a different story within the same framework.
- `npm run validate:sim` passes for all 3 domains with no errors or warnings.

### Checks
- `npm run build` passes.
- Overflow check: **128 / 128 views clean** at 1366 px and 390 px. That covers every old route, every new page in all 3 domains, and the old `?tab=` redirects.
- Fixes found during the check:
  - Hidden tooltips widened the page; they are now shown only on hover.
  - Grids needed `grid-cols-1` so tables scroll inside their card.
  - The heatmap takes the full width below 1536 px.

### Known items / next (M4)
- The function page still needs: impact panel (business / technology / financial), open issues and initiatives per function, cross-functional dependencies, and a sidebar "Enterprise functions" list.
- The Executive 360 KPI targets are a flat 85 (maturity 4 / 5). They could be set per domain later.
- The JS bundle is above 500 kB (a Vite warning only). Code-splitting the routes is a later optimisation.
- The live clock moves the event feeds and "synced X ago" times. Event-driven *metric* changes are planned for M6.

---

## 27. M4 done: the 16 enterprise function pages (6 Oct 2026)

**Route:** `/domain/:id/fn/:fn`. One template (`src/pages/sim/FunctionPage.tsx`) renders all **48 views** (16 functions × 3 domains). They open from the heatmap rows on the domain Overview, or from the new sidebar group **"Enterprise functions"**: 16 items, each labelled "CTO-owned" or "Signal · <owner>", and they follow the selected business unit.

**Each function page shows, top to bottom (spec 2 §3, §8, §11):**
1. Previous / next function, a breadcrumb, the CTO question, the source badges, the function score ring and "CTO-owned / Signal to CTO · owner".
   - Signal functions also carry a note: "Owned by the CFO … CTO360 does not replace their systems."
2. **6 KPI cards**, one per heatmap column (current · target · variance · trend · status · owner · updated).
3. **Business, technology and financial impact**, calculated from the records in scope (e.g. "17,80,200 customer transactions hit by 6 P1/P2 incidents", "₹5 Cr forecast overrun on linked initiatives").
4. **12-month function health** with the target at 80. The score axis is padded so flat lines look flat.
5. **Cross-functional dependencies:** "Depends on" (each with its live score and a reason) and "Affects" (reverse links).
6. **Linked strategic initiatives:** progress vs plan, forecast vs budget, status.
7. **Recommended actions** (top 5), drafted from red and amber evidence, each with an owner and an evidence link. "A named human decides" (Decision Center in M5).
8. **Open issues:** red records in scope, each with its `why`.
9. **Fed by:** links into the source pages, the count of calculated vs simulated KPIs, and the records in scope.

**Engine:** `src/data/sim/context.ts`
- `scope(d, fn)` is the list of records belonging to each function. For example: Technology = all apps and services; CX = customer-facing apps and services plus customer processes; Legal = DPDP / AI / regulator controls plus regulatory and vendor risks; Procurement = vendors (technologies), SaaS apps and vendor risks.
- `impact()`, `actions()` and `dependencies()` all work from that scope.
- `DEPENDS` is the hand-written dependency map with reasons. Edit it there.

**Checks:**
- Build passes.
- `validate:sim` passes for all 3 domains.
- **96 / 96 function views have no overflow** (48 at 1366 px and 48 at 390 px).

**Possible later polish:**
- Per-domain wording for dependency reasons.
- A KPI click-through that shows the records behind a derived metric.
- Function-specific visuals from spec 2 (OKR rings, funnels). Today every function uses the common template.

---

## 28. M5 done: Decision Intelligence (7 Oct 2026)

**The model:** Signal → Correlation → Insight → Decision → Action → Outcome (spec 1 §15–18, spec 2 §5–6, §14).

### New pages
| Route | What |
|---|---|
| `/domain/:id/decisions` | **Decision Intelligence** per domain. 4 summary tiles (awaiting, value at stake, approved, signals correlated). Tabs: **Decision cards** · **Action tracker** · **Outcomes** · **Maturity**. Sidebar: "<Domain> 360 → Decision Intelligence". |
| `/decision-center` | **CTO Decision Center: Top 10** across all three domains, ranked by priority, then confidence, then value. Tabs: Top 10 · Action tracker (all domains) · Outcomes. Sidebar: AI Intelligence → "CTO Decision Center (Top 10)". |
| `/domain/:id` | The "Needs your attention" card is now **"Needs your decision"**: the top 3 decision cards with coloured source chips. |

The old `/decisions` (TEDIF Decision Object center) is unchanged.

### Engine: `src/data/sim/decisions.ts`
Decisions are raised by **rules over linked records**. Every signal cites a real record ID, and the wording is assembled from the evidence values, not free AI text.

1. **Story decisions** (3 per domain): one signal per layer that is not green (Planview initiative, LeanIX legacy apps, Process, ServiceNow project, Jellyfish team, Datadog service with incident trend over the last 45 vs previous 45 days, Vanta control plus linked risk).
   - Priority: **Critical** only if ≥ 6 red signals, the objective is Critical and the initiative is red. **High** if ≥ 3 red; otherwise Medium / Low.
   - Confidence = 50 + 3 × signals + 2 × red signals (+3 if the initiative is red), capped at 91.
   - The recommendation names the legacy apps, the number of engineers to move and from which lower-priority team (calculated from the capacity gap), and the control to close.
2. **Customer-facing apps on end-of-life technology** (the spec 2 §5 example). Uses the share of P1/P2 incidents, run cost, the unsupported-software control and complaints.
3. **Rebalance engineering capacity:** red teams vs a fully staffed team on a lower-priority initiative.
4. **Approve or contain the forecast overrun:** initiatives more than 5% over budget, raised if the total is ≥ ₹1.5 Cr.
5. **Risks outside appetite:** Critical risks, or High risks open for more than 180 days.
6. **Process automation:** the worst process not already covered by a story.
7. **Approved earlier (6 Jul 2026), with measured outcomes:** "Accelerate cloud adoption and FinOps" and "Put priority AI use cases into production". Baseline = the metric value in Jul (series index 8); current = today; target, variance and status come from the **same metric history**, so the outcome stays honest. Example: Manufacturing's AI use cases show **Behind** (11 → 11).

**Result:**

| Domain | Open decisions | Priorities |
|---|---|---|
| Banking | 8 | 1 Critical, 3 High |
| Manufacturing | 7 | 6 High, 1 Medium |
| Retail | 8 | 6 High, 2 Medium |

There are 2 approved decisions with outcomes per domain, and the Top 10 holds 1 Critical overall.

### Decision card (`src/components/sim/DecisionCard.tsx`)
- Header: priority, "Decision required", ID and type, decide-by date, title, why now.
- Body: signals by source (with health dot and record link), correlation, insight, **recommended decision** box, expected outcome, business / technology / financial impact, risk, investment → value protected, confidence bar, owner.
- **Show evidence:** a traceability table (layer · simulated source · record ID · state), as in spec 1 §22.
- **Approve / Defer / Reject.** "AI recommends · a named human decides." Approving creates the actions; Undo is available.

### Actions and outcomes (`src/pages/sim/decisionViews.tsx`)
- **Action tracker:** shows actions of approved decisions.
  - Columns: action, decision, owner, due date (red if overdue), priority, status (Not Started / In Progress / Blocked / Completed, editable), expected outcome, actual outcome, evidence link.
  - Clicking a status tile filters the list.
- **Outcomes:** for each decision approved earlier, a Decision → Action → Technology result → Business outcome chain, plus a table: baseline (Jul) · target · current · variance · sparkline Jul–Oct · status. Decisions approved in this session show "baseline captured today".
- **Maturity** (L1 Visibility → L5 Continuous optimisation):
  - One row per source area: current vs target, level name, gap, the 2 most relevant improvement initiatives (ranked by how many of that area's problem records they carry), owner and target date.
  - Labelled "management visualisation — not a CMMI or any other formal assessment".
  - Current level = 1 + (capability score − 40) / 15, capped at 1–5. Target 4, or 4.5 for Datadog and Vanta.

### Demo state
`src/components/sim/decisionState.tsx` keeps verdicts and action statuses **in this browser only** (localStorage, guarded with try / catch). **"Reset demo"** on both pages clears it. A shared, persistent store comes with the Python API phase.

### Checks
- Build passes.
- `validate:sim` passes for 3 / 3 domains.
- Overflow check **60 / 60 clean**: Decision Center tabs, domain decision tabs, domain overviews, and the home page at 1366 / 820 / 390 px.

### Demo path (3–5 minutes)
1. Banking 360 overview → "Needs your decision".
2. Open **Digital Payments Modernization at Risk**: 7 sources, 6 red.
3. **Show evidence** → click `SVC-BNK-002` to see the incidents.
4. Go back and **Approve** → open the **Action tracker** (5 actions) and set one to In Progress.
5. Go to **Outcomes**: "Accelerate cloud adoption" approved in July, measured against target.
6. Go to the **CTO Decision Center** for the Top 10 across all business units.

---

## 29. Disclaimer and About page (7 Oct 2026); ✅ live (commit ed14e4d)

**Short version, in the footer of every page** (`src/components/Layout.tsx`, text constant `SHORT_DISCLAIMER` in `src/pages/About.tsx`):
> **Disclaimer:** Independent demonstration using synthetic data. Third-party product names are referenced solely for conceptual integration scenarios. CTO360 is not affiliated with or endorsed by the referenced vendors. *(link: Full disclaimer)*

**Full version, at `/about#disclaimer`** (`src/pages/About.tsx`):
> CTO360 is an independent demonstration platform developed for educational, research and professional portfolio purposes using synthetic and simulated data. References to third-party products, platforms and trademarks are included solely to demonstrate conceptual integration scenarios and potential enterprise workflows. CTO360 is not affiliated with, endorsed by, sponsored by or officially connected with any referenced vendor. No proprietary customer data, vendor data or production system data is used. All product names, trademarks and registered trademarks remain the property of their respective owners.

**The About page also covers:**
- What CTO360 is, and is not: it does not replace vendor platforms or CXO systems.
- The organisations are fictional; there are no live integrations.
- Maturity is not a CMMI assessment; control monitoring is not a certification.
- The 7 simulated source categories, and a note to raise trademark questions with the project team.

**Ways in:**
- Footer "Full disclaimer" link
- Sidebar bottom "About & disclaimer"
- Header help (?) icon

**Labels kept everywhere:**
- "Simulated · Planview / SAP LeanIX / Celonis + SAP Signavio / ServiceNow SPM / Jellyfish / Datadog / Vanta".
- The Celonis label keeps "+ SAP Signavio" because that layer simulates both.

**Small fixes made at the same time:**
- Decision Center tab row can now shrink (`min-w-0`), because it overflowed on tablet.
- The header help link no longer has padding: at 820 px it pushed the header 8 px wide.

**Status:** built, committed and pushed by the user on 7 Oct 2026 (commit `ed14e4d`). Still to do: a full overflow re-check across all routes at 1366 / 820 / 390. The tablet header fix was verified on its own page only.

**Note:** this wording is a sensible good-faith disclaimer for a capstone and portfolio, not legal advice. Have it reviewed if the site is used commercially.

---

## 30. M6 done: Enterprise Command Center, Data Sources, live impact (7 Oct 2026)

### Home page `/`: Enterprise Command Center (`src/pages/sim/CommandCenter.tsx`)
All three business units and their sub-levels on one screen. Every tile, cell and chip drills down, and the time range carries over.
1. **Enterprise health ring** (average of the 3 domains, live-adjusted), target 85, trend vs period, sparkline, "Live since 09:30: N events, N critical".
2. **3 domain cards** (Banking 78, Manufacturing 73, Retail 76): ring, organisation, sparkline, change, weakest function, live delta. Click a card to open that domain's Enterprise 360.
3. **KPI strip (6):** decisions awaiting · critical + high risks · programmes not on track · technology investment (₹377 Cr budget / ₹391 Cr forecast) · value realisation (70%) · services below SLO.
4. **Heatmap: 7 source systems × 3 domains.** Click a cell to open that source page in that domain.
5. **Heatmap: 16 functions × 3 domains**, grouped CTO-owned / Signals. Click a cell to open that function page.
6. **Health trend by business unit:** 3 domain lines in the validated domain colours, a bold enterprise line, and the target line.
7. **Top 3 decisions** across all domains, linking to the Decision Center.
8. **Enterprise risk heatmap** (5×5, all domains), **investment & value** bars per domain (budget / forecast / expected value), **operational health** (critical availability, services meeting SLO, P1s per domain), **business outcomes** (approved decisions: baseline → now, with status).
9. **Live source events** from all domains and sources, plus a link to Data Sources.

The previous home page (ExecSummary + TEDIF detail) is at **`/overview`**, listed in the sidebar as "Programme overview (TEDIF)".

### `/sources`: Enterprise data sources (`src/pages/sim/DataSources.tsx`)
- **Banner:** "Demonstration environment using simulated enterprise data. No live vendor integrations are active." plus a not-affiliated note.
- **7 cards**, one per simulated source. Each shows:
  - average capability score ring and "Simulation active / paused"
  - records, last sync, events in the last hour
  - per business unit: records, score and red count, each linking to that source page
  - the latest 3 events

### Live impact (`liveImpact()` in `src/data/sim/events.ts`)
Events released by the simulation clock **after 09:30** nudge each domain's health: critical −0.3, warning −0.1, good news +0.1, capped at ±4. The Command Center rings, domain cards and "live" deltas move while the clock runs. Pause / Reset in the header controls it. Record-level data is not changed, so `validate:sim` stays deterministic.

### Sidebar
Under "Executive Overview": **Command Center (all domains)** `/` · **Data sources** `/sources` · **Programme overview (TEDIF)** `/overview` · the 3 domain views · the existing items.

### Final checks (7 Oct 2026)
- `npm run build` passes.
- `npm run validate:sim` passes with no errors for all 3 domains (78 / 73 / 76).
- Full overflow sweep: **73 pages × 3 sizes (1366 / 820 / 390)**. Every static route; for each domain: overview, programme view, decisions (+ maturity tab), a record, 2 function pages and all 7 source pages. **Result: 219 / 219 views clean, no horizontal overflow.**

### Simulation build: complete
| Stage | Delivered |
|---|---|
| M1 | Canonical data model, 3 domains of linked simulated records, scoring rules, `validate:sim` |
| M2–M3 | Reusable components; Enterprise 360 per domain; 7 source pages; record drill-down |
| M4 | 16 function pages (impact, dependencies, initiatives, actions, issues) |
| M5 | Decision engine, Top 10 Decision Center, action tracker, outcomes, maturity |
| M6 | Command Center home, Data Sources, live impact, final checks |

**Demo order (5 minutes):**
1. Command Center: "where to intervene".
2. Click Banking's Enterprise Architecture cell (55, red) to open the function page.
3. Banking 360 → **Digital Payments decision** → Show evidence → Approve → Action tracker.
4. Outcomes tab.
5. Data Sources page: "simulated, not connected".
6. About & disclaimer.

---

## 31. The business problem CTO360 solves (pitch framing, 7 Oct 2026)

**In one line:** the CTO cannot see across the enterprise fast enough to decide where to intervene, or prove whether technology spend produced business outcomes. It is a **decision problem, not a data problem**.

### The problem
1. **Fragmented signals.** Strategy (Planview), architecture (LeanIX), process (Celonis / Signavio), delivery (ServiceNow, Jellyfish), operations (Datadog) and risk (Vanta) each answer their own question. None says what matters most right now.
2. **Cause and effect span tools.** Example: the payments programme slips (Planview) *because* of legacy dependencies (LeanIX), a team capacity gap (Jellyfish) and rising incidents (Datadog). No single tool shows that chain, so it is discovered late.
3. **Reporting is not deciding.** Dashboards and status decks are plentiful, but signal → decision → action → outcome is manual, slow and rarely closed.
4. **Technology spend is hard to defend.** Value realisation and risk are not tied to specific decisions.
5. **Each business unit reports differently,** so the CTO cannot compare them or move money and people between them with confidence.

### The solution: a CTO decision-intelligence layer, not another tool
**Signal → Correlation → Insight → Decision → Action → Outcome**
- One view: 3 business units × 7 source systems × 16 enterprise functions, scored the same way.
- Correlates records across tools, so every decision card shows *why*, with traceable evidence.
- A prioritised Top 10, each with impact, ₹ ask vs value protected, confidence, owner and deadline.
- Closes the loop: approve → actions → measured outcomes against baseline and target.
- Governed AI (TEDIF): **AI recommends, humans decide**, with an audit trail.

### Same problem, different reality per domain
| Domain | Business problem | What it costs |
|---|---|---|
| Banking | Legacy core and integration layer slowing digital payments; tech debt behind P1s | Q4 payments milestone at risk, ₹38.9 Cr value at stake, regulatory exposure |
| Manufacturing | MES / plant system instability causing line stops; smart factory delayed | Lost production, late deliveries, OEE target missed |
| Retail | Peak readiness and inventory sync; engineering capacity stretched | Lost festive sales, overselling and stockouts, POS security risk |

### Pitch line
*"Enterprise tools tell leaders what is happening inside each function. CTO360 connects those signals to show the CTO what matters, where to intervene, what decision to make, and whether it worked."*

### Target outcomes
- Faster, evidence-based decisions (days instead of weeks)
- Fewer late surprises on critical programmes
- Higher value realisation from technology investment
- Lower operational and cyber risk
- One comparable view across business units

### Where it shows on the site
- **Command Center** `/`: the problem, at a glance.
- **Decision Center** `/decision-center`: the decisions.
- **Domain → Decision Intelligence:** evidence, actions and outcomes.
- **About** `/about`: what CTO360 is and is not.

The original capstone business problems (BP1 / BP2) are in sections 4 and 13.

---

## 32. M7 plan: Team workspaces (agreed 7 Oct 2026, not started)

**Source:** `bp1.jpeg` (20 Sep 2026), which lists each member's business problems.

**Accountability:**
- **Ram:** multi-domain framework and decision intelligence. **Done.** The workspace reuses existing views.
- **Suman:** identify ROI; transform any organisation to AI.
- **Vaibhav:** automate regulatory compliance (Banking); DPDP / AI governance.
- **Santhosh:** governance system; apps / resources / decision making, CAPEX / OPEX.
- **Pankaj:** ERP RCA; infrastructure capacity planning; production-management automation.

**Decision:** one **TEAM** sidebar group (below Executive Overview) with `/team` (accountability page) and **5 workspaces named "Workspace · Name"**, each with 6 live KPIs and 4 tabs. Total: 6 pages, about 20 views.

**Full design** (visuals per tab, new data, live elements, effort): **`docs/TEAM_WORKSPACES_PLAN.md`**.

**Live demo moments planned:**
- Vaibhav: a new circular arrives → AI drafts obligations → his approval.
- Pankaj: live capacity telemetry and an ERP incident leading to a suggested root cause.
- Santhosh: spend postings move the month-to-date figures.
- Suman: use cases move through the pipeline.

**Added 7 Oct 2026: current state → target state.**
- Every workspace opens on a **Transformation** tab: From → To narrative, transformation bridge (baseline · current · target · progress % · glide path · ETA), glide-path chart and maturity ladder.
- Baseline = Nov 2025 (first history point); progress = (current − baseline) ÷ (target − baseline). Both are calculated, never typed.
- `/team` gets a **transformation scorecard** across all 5 owners.
- Details and the per-owner old / target states are in `docs/TEAM_WORKSPACES_PLAN.md`.

**v2 deep design (7 Oct 2026): this is now the MAIN CAPSTONE PROBLEM STATEMENT.** See `docs/TEAM_WORKSPACES_PLAN.md` sections A–F:
- **A.** Umbrella problem statement ("see, govern, fund and run AI-led transformation as one system").
- **B.** The **golden thread**, a live cross-team scenario: "Month-end close meets festive peak", Pankaj → Ram → Santhosh → Suman → Vaibhav → Ram.
- **C.** 17 real analytical techniques computed in the app (Monte Carlo, Holt-Winters, PSI drift, EWMA anomalies, NPV / IRR, Pareto, change correlation, queueing, error budgets, TBM allocation, …).
- **D.** Each page in 10 parts: problem, old → target, measures, practices / frameworks, simulated tools, techniques, tabs, live scenario, decisions, outcomes.
- **E.** Honesty and limits.
- **F.** Revised effort: **about 5.5 days** (supersedes the 3.5-day estimate below).

**Build order (original estimate; see section 33 for progress):** M7.1 Team + Ram (0.5 d) → M7.2 Suman (0.75 d) → M7.3 Vaibhav (0.75 d) → M7.4 Santhosh (0.5 d) → M7.5 Pankaj (0.75 d) → M7.6 checks (0.25 d). About 3.5 days in total.

---

## 33. M7.1 done: Team group, `/team`, workspace shell, Ram's workspace (7 Oct 2026)

**Defaults used (not changed by the user):**
- Golden thread = "Month-end close meets festive peak".
- Vaibhav is Banking-first.
- Old-state and target values are illustrative (replace them with team research figures when available).

### What's live
- **Sidebar group TEAM** (below Executive Overview):
  - Team & accountability
  - CTO Control Tower · Ram
  - AI Transformation · Suman
  - Regulatory & AI Governance · Vaibhav
  - Technology Spend & Investment · Santhosh
  - ERP RCA & Capacity · Pankaj
- **`/team`:**
  - capstone problem statement
  - **transformation scorecard:** team 62% transformed; per owner Ram 65, Suman 75, Vaibhav 59, Santhosh 58, Pankaj 52; 30 measures (10 ahead, 11 on track, 9 behind)
  - live team pulse
  - **golden thread (live)**
  - RACI matrix
  - BP1 problem coverage
- **`/team/:owner`** (all 5), with the common layout:
  - owner banner (name, role, BP1 problems, transformation ring)
  - **6 live measure cards**
  - tabs, starting with **Transformation**
  - right rail (owner's decisions + live feed from their sources)
  - "About this simulation" note
- **Transformation tab** (all 5 owners):
  - Old state / Target state cards
  - **transformation bridge** (baseline ── today ── target, progress %, time used, glide path, ETA)
  - **glide-path chart** (actual vs straight-line plan, target line)
  - transformation ladder L1–L4
- **Ram's tabs:**
  - Multi-domain (two heatmaps)
  - **Agents & correlation** (5 simulated agents → correlation engine → human decisions; approval rate)
  - **Golden thread**
  - Programmes (status by business unit, not-on-track list)
- **Suman, Vaibhav, Santhosh, Pankaj:** Transformation tab and KPIs work now; their 4 functional tabs show "being built in M7.x" with the planned content.

### Files
| File | Contents |
|---|---|
| `src/data/sim/analytics.ts` | Holt, Holt-Winters, EWMA anomalies, Monte Carlo + triangular, NPV, IRR, payback, S-curve, PSI drift, Pareto, M/M/1 latency, error budget, progress, elapsed, glide, ETA, glide path |
| `src/data/sim/team.ts` | `OWNERS` (accountability, BP1, from / to narratives, functions, sources, 6 measures each) + `measureState` / `ownerState` |
| `src/data/sim/scenario.ts` | Golden thread: 6 steps at +15 / 40 / 65 / 90 / 115 / 140 s of simulation time; `threadState`, `headroomAt`. Header Reset = replay. |
| `src/components/team/workspace.tsx` | `WorkspaceShell`, `MeasureCard`, `TransformationTab`, `OwnerRail`, `GoldenThread`, `GlidePill` |
| `src/pages/team/TeamPage.tsx`, `WorkspacePage.tsx`, `RamTabs.tsx` | Pages |

### Measure rules
- Baseline = Nov 2025 (`series[0]`); current = Oct 2026.
- Progress = (current − baseline) ÷ (target − baseline), clamped 0–100.
- Time used = since 1 Nov 2025 ÷ to target date.
- Glide path:
  - **Ahead** if progress ≥ time + 10
  - **Behind** if progress < time − 10
  - **On track** otherwise
- ETA = last-quarter slope; "Reached" at 100%; "Not on current trend" if the trend is flat or moving away.
- **Derived measures** reuse the simulated metric history: enterprise health, AI readiness, AI use cases, AI value, adoption, obligations mapped, consent, control effectiveness, licence use, change share.
- **New measures** use a seeded linear history. Examples: signal-to-decision days, days per circular, models approved, cloud waste, recurring ERP problems, headroom.
- Three measures were replaced during build because their metric history moved the wrong way for an old → target story:
  - cloud vs plan → cloud waste
  - value realised → investments value-tracked
  - ERP availability → availability in peak windows

### Checks
- Build passes.
- `validate:sim` passes for 3 / 3 domains.
- Overflow check of team routes (`/team`, all workspaces and Ram's tabs at 1366 / 820 / 390): all clean.

### Next: M7.2 Suman (AI Transformation)
- Readiness radar
- Portfolio and gates: about 12 AI use cases per domain, a funnel, value × feasibility, a gate review with approval
- ROI and benefits: NPV / payback, Monte Carlo P10–P90
- Onboard-any-organisation wizard: 6 industry templates

---

## 34. M7.2 done: Suman · AI Transformation (7 Oct 2026)

**Route:** `/team/suman`. Tabs: Transformation · **Readiness** · **Portfolio & gates** · **ROI & benefits** · **Onboard any organisation**. The Portfolio, ROI and Readiness tabs have an All / Banking / Manufacturing / Retail filter.

### Data: `src/data/sim/aiPortfolio.ts`
- **36 flagship AI use cases** (12 per business unit), IDs `AIUC-BNK-01` …
  - Each has: stage (Idea / PoC / Pilot / Production / Scaled), owner, investment, value range (min / likely / max, ₹ Cr a year), realised value, feasibility, value score, data readiness, risk tier, and links to a real simulated app and initiative.
  - Labelled as flagship, i.e. a subset of the 46 AI use cases counted in the KPIs.
- **Stage success probabilities:** Idea 15%, PoC 35%, Pilot 60%, Production 90%, Scaled 100%.
- **3 gate-ready pilots, each with success criteria:**
  - Banking AML alert triage
  - Manufacturing AI vision inspection
  - Retail AI demand forecasting (the golden thread's use case)
- **Readiness:** 6 dimensions per business unit, derived from existing metrics (Strategy, Data, Platform, Skills, Governance, Adoption) on a 1–5 scale. Targets: 4, or 4.5 for Governance.
- **ROI:**
  - quarterly cash flows over 3 years: build cost up front, then value ramping on an S-curve after go-live
  - **net of run cost** (30% of build cost a year)
  - NPV at 12% a year, payback, 3-year ROI
- **Monte Carlo:** 2,000 runs. Each run samples a triangular value for every use case and whether it succeeds at its stage, giving P10 / P50 / P90 of annual portfolio value.
- **6 industry templates:** Banking, Manufacturing, Retail, Insurance, Healthcare, Telecom. Each has starter use cases (value lever, data needed, value and feasibility scores), KPIs and risks.

### What the tabs show
| Tab | Content |
|---|---|
| **Readiness** | Radar chart (3 business units + target), gap table sorted by gap with the next move per dimension |
| **Portfolio & gates** | 4 tiles · stage-gate funnel (count, ₹ / yr, probability) · value × feasibility scatter (bubble = value, colour = stage) · **gate reviews** (criteria vs actual, NPV, payback, **Promote / Hold**; promotion moves the use case to Production in every view; demo state is saved in this browser, and Reset demo clears it) · portfolio board by stage |
| **ROI & benefits** | Monte Carlo P10–P90 bars per business unit and enterprise · cumulative payback curve with break-even quarter · use cases ranked by NPV |
| **Onboard any organisation** | Inputs: organisation, industry template, size, 6 readiness sliders → **rule-engine plan**: readiness score, weakest dimensions, starting point, time to first value, prioritised use cases (value × feasibility × data-readiness factor), **30-60-90 day plan**, KPIs, risks to govern with Vaibhav. Labelled "rule engine, no live AI call". |

### Consistency
- The golden thread step 4 now uses the calculated NPV and payback of AIUC-RTL-02.
- KPI cards use the all-AI totals (from the metric history); the portfolio shows the flagship subset and says so.

### Checks
- Build passes.
- `validate:sim` passes for 3 / 3 domains.
- Suman's tabs checked at 1366 / 820 / 390 with no overflow.

### Next: M7.3 Vaibhav · Regulatory & AI Governance (Banking first)
- Regulatory change flow, with a live circular arriving
- AI model register with PSI drift
- Data governance and DPDP: consent, lineage, breach clock
- Audit readiness

---

## 35. M7.3 done: Vaibhav · Regulatory & AI Governance (7 Oct 2026)

**Route:** `/team/vaibhav`. Tabs: Transformation · **Regulatory change** · **AI model register** · **Data governance & DPDP** · **Audit readiness**. Banking-first; the model register and audit view cover all 3 business units.

### Data: `src/data/sim/governance.ts`
- **8 simulated circulars** (RBI / CERT-In / DPDP, all labelled "simulated" with fictional reference numbers `SIM/...`).
  - Each circular has: stage (Received → AI-drafted → Under review → Mapped → Evidence → Closed), received and due dates, days taken, and **24 obligations**.
  - Every obligation maps to a **real simulated Banking control**, with an AI confidence score. Some are Gaps; some are Pending review.
- **Live circular** at simulation clock **+50 s**: "Cyber resilience for peak transaction windows". It arrives with 4 AI-drafted obligations (3 mapped to controls, 1 gap).
  - **Approve mapping / Send back** (decision key `REG-CIRC-LIVE`).
  - On approval, gaps are raised as actions.
- **AI model register:** **24 models**, i.e. every use case in Suman's portfolio at Pilot or beyond, so the two workspaces stay consistent.
  - Tier = impact × autonomy × sensitivity (1–3 each): ≥ 12 High, ≥ 4 Medium.
  - Each model has a bias test, explainability, approval, and a **PSI** computed from simulated 5-bin score distributions.
  - **Fraud scoring (UPI): PSI 0.37 → Restricted.** Markdown pricing: 0.10 → moderate drift.
  - Approved share of live models = **40%**. This feeds Vaibhav's "AI models registered & approved" measure (now calculated, not seeded).
- **Days per circular** measure = average days of the last 2 circulars that have a recorded duration (~10 days). Calculated.
- **10 Banking critical data elements:** owner, quality, personal / consent flags, **lineage** (source app → consumers → report).
- **Simulated personal-data incident** at clock **+80 s** starts 2 countdown clocks:
  - 6 h, a CERT-In-style cyber incident report
  - 72 h, a DPDP-style breach notice

  Both windows are illustrative and labelled as such.

### What the tabs show
| Tab | Content |
|---|---|
| Regulatory change | 6-stage pipeline with counts · live feed card (countdown → arrived → approve) · circulars table · obligation library with "gaps and pending only" filter. Recent-circular mapping (71%) is shown separately from the full-library KPI (94%). |
| AI model register | Tier × approval heatmap (rule: no High-tier model in production without approval) · drift alerts with expected vs actual distribution bars · full register |
| Data governance & DPDP | Consent coverage ring · incident clock with 5-step checklist · critical data elements with quality bars · lineage diagram |
| Audit readiness | Business-unit selector · readiness by framework (passing / exception / failing bars) · evidence status · open-findings ageing |

### Honesty labels
- Circulars and reporting windows are illustrative.
- Extraction is rule-based (live-LLM ready).
- Monitoring simulation, not certification.
- "Aligned in spirit with NIST AI RMF / ISO/IEC 42001", not a claim of compliance.

### Checks
- Build passes.
- Vaibhav's tabs checked at 1366 / 820 / 390 with no overflow.

---

## 36. M7.4 done: Santhosh · Technology Spend & Investment (7 Oct 2026)

**Route:** `/team/santhosh`. Tabs: Transformation · **CAPEX / OPEX & TBM** · **Budget, forecast & anomalies** · **FinOps & licences** · **Investment governance**.

### Data: `src/data/sim/spend.ts`, derived so it reconciles
- **Monthly ledger per business unit** (Nov 2025 – Oct 2026), 6 categories:
  - **Cloud** = cloud spend metric ÷ 3 per month
  - **Licences & SaaS**, **People**, **Vendors & services**, **Hardware & DC** = 30% / 35% / 20% / 15% of run cost. Run cost = app annual costs + service costs.
  - **Projects (change)** = each initiative's budget spread over its active months
- **CAPEX share:** Hardware 100%, Projects 60% (capitalisable build), everything else OPEX. Result for all units: **₹495 Cr over 12 months, 33% CAPEX, 43% change-the-business.**
- **Budget per month** = actual × 0.94–1.02 (seeded). **Forecast** for the next 3 months by Holt smoothing.
- **October to date (live)** = elapsed share of the month plus **Planview "₹x Cr actuals posted" events** released after 09:30. The amounts are parsed from the event text, so the feed and the figure match.
- **TBM Sankey:** 6 cost pools → 5 IT towers + **"Unallocated (pending tagging)"** → 3 business units. The allocated share = Santhosh's TBM coverage measure (72%).
- **Cloud daily cost**, 60 days, with **EWMA anomaly detection** (λ 0.3, 3σ). Only spikes count; weekend dips are expected.
  - Retail: festive burst (golden thread step 3)
  - Banking: a batch job left running
  - Manufacturing: data-lake export misconfigured
- **Licences:** 6 per business unit (seats, used, ₹ / yr → utilisation and waste).
- **Investment cases per initiative:**
  - The planned "expected value" is read as a **3-year benefit** (annual = ÷ 3), ramping 40% → 80% → 100% over 5 years after build, net of 10% run cost.
  - NPV at 12%, IRR, payback.
  - Result: IRR about −12% to 35%, payback 2.5–4.4 years. **7 of 30 have negative NPV**, mostly security and compliance programmes. The page explains these are judged on risk avoided.

### What the tabs show
| Tab | Content |
|---|---|
| CAPEX / OPEX & TBM | 4 tiles (12-month spend, CAPEX share, change share, **live October-to-date**) · stacked CAPEX / OPEX by month + 3-month forecast · spend by category · **TBM Sankey** |
| Budget, forecast & anomalies | Budget vs actual vs forecast · **variance waterfall** (top 8 initiatives + others) · **daily cloud cost with anomaly markers** and the cause of each spike |
| FinOps & licences | Cloud waste breakdown (idle, over-provisioned, unattached storage, non-prod 24×7) · licence utilisation · ranked savings opportunities (80% of cloud waste and 70% of licence waste assumed recoverable) |
| Investment governance | 4-stage funnel (business case → approved → in delivery → value tracking) · investment cases table (NPV, IRR, payback, value realised, gate status) · approval log (earlier approvals + this session) |

### Checks
- Build passes.
- Santhosh's tabs checked at 1366 / 820 / 390 with no overflow.

---

## 37. M7.5 done: Pankaj · ERP RCA & Capacity (7 Oct 2026)

**Route:** `/team/pankaj`. Tabs: Transformation · **ERP RCA** · **Capacity & forecasting** · **Peak scenarios** · **Production automation**.

### Data: `src/data/sim/ops.ts`
- **ERP / core services:** Banking core ledger posting; Manufacturing SAP order-to-cash and SAP month-end batch; Retail order management. Their incidents come straight from the simulated incident log.
- **Root-cause Pareto** (12-month problem-management history, 61 ERP incidents, 7 causes). Top 3 = 64%: batch overrun, DB lock contention, interface backlog.
- **10 ITIL problem records** (incident → problem → known error → change) with owner, age, permanent fix and change reference.
  - **Recurring open (≥ 3 incidents, not closed) = 8.** This feeds Pankaj's measure (calculated).
- **Change correlation = 36%** of all simulated incidents (40 of 110) started within 24 h of a change. Computed from the incident log; feeds the measure.
- **5-Whys** for PRB-MFG-01 (month-end batch overrun). Root cause: capacity is planned annually, not per change or peak.
- **Error budgets** (SRE) per ERP service from SLO and availability. Retail order management has burned its whole budget (burn rate 1.2×).
- **Capacity telemetry:** 18 critical services × CPU / memory / storage / network.
  - 12-month peak utilisation with a **Holt forecast 9 months ahead**, plus months to 80% and to 95%.
  - **Minimum headroom = 17%.** This feeds the measure (calculated).
- **Live gauges** oscillate just below the measured peak (simulation clock). The **shared ERP / order cluster gauge follows the golden thread** (falls to ~8%, recovers above 30% after step 6).
- **Peak scenarios** (M/M/1 queue: response = service time ÷ (1 − utilisation)), each with a scale-out slider, latency vs target, 6-week cost and minimum scale-out to meet the target:

| Scenario | Business unit | Demand |
|---|---|---|
| Month-end close | Manufacturing | × 1.62 |
| Salary day | Banking | × 1.7 |
| Festive peak | Retail | × 2.15 |

- **Production automation:** Manufacturing Plan to Produce / Maintenance / Quality processes plus 12 key automation steps (done or planned quarter). Measure: 52% → 70% target.

### Result
Pankaj is the furthest behind of the five (**44% transformed; 0 ahead, 2 on track, 4 behind**). This fits the story: capacity and change-induced incidents are the open problems, and they are what the golden thread fixes.

### Checks
- Build passes.
- Pankaj's tabs checked at 1366 / 820 / 390 with no overflow.

