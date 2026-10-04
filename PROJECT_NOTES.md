# Domain-Agnostic Enterprise AI Transformation Framework — Project Notes

> Complete record of the CTO capstone project, from the first idea to the current website.
> Use this file to pick the work up again, brief a teammate, or brief an AI assistant.
> Last updated: 5 October 2026.

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

Commits (oldest first): Phase 1 dashboard → detailed dashboard → TEDIF Tracker → domain pages → Programme Tracker → CTO Dimensions pages.

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

**Overall: 7.5 / 10** before the CTO-dimension pages; coverage is now complete on all 14 dimensions.

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
7. **Optional UX:** collapsible sidebar groups (sidebar now ~35 links); "illustrative data" banner.
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
