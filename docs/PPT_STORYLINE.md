# CTO360: presentation storyline and workflow (start to end)

> **Purpose:** one file to build the PPT and run the presentation, from the title slide to Q&A.
> **Source of truth:** the frozen site `v1.0-freeze` (https://cto360.vercel.app) and `PROJECT_NOTES.md` (sections 31, 38, 39 and 40).
> **All figures are illustrative (synthetic data).** Read live numbers from the site on the day; the site recalculates them.

---

## 1. The story in one breath

**Problem:** enterprises cannot see, govern, fund and run AI-led transformation as one system. Signals sit in seven tools, decisions are slow, spend is hard to defend, and every business unit reports differently.

**Solution:** **CTO360**, a CTO decision-intelligence layer on top of existing tools.
- It connects **3 business units × 7 source systems × 16 enterprise functions**.
- It turns signals into a **prioritised Top 10 of decisions**.
- It closes the loop: decision → actions → measured outcomes.
- It is governed by **TEDIF: AI recommends, humans decide.**

**Proof:** five owners each move their area from **old state → target state, measurably**. Progress is tracked live against a glide path, and one connected scenario (the "golden thread") plays out across all five owners on stage.

**Pitch line:** *"Enterprise tools tell leaders what is happening inside each function. CTO360 connects those signals to show the CTO what matters, where to intervene, what decision to make, and whether it worked."*

---

## 2. Running order and timing (about 25 min + Q&A)

| Part | Slides / demo | Who | Time |
|---|---|---|---|
| A. Opening & problem | Slides 1–4 | Ram | 3 min |
| B. Solution & architecture | Slides 5–8 | Ram | 3 min |
| C. Live demo: control tower | Demo step 0–1 | Ram | 3 min |
| D. Owner workspaces | Demo steps 2–5 (+ 1 slide each) | Suman, Vaibhav, Santhosh, Pankaj | 12 min (3 each) |
| E. Closing the loop | Demo step 6 + slides 14–18 | Ram | 4 min |
| F. Q&A | Section 7 of this file | All | 5–10 min |

**Rule:** slides set up the "why", and the live site shows the "how". Do not put on a slide what the demo shows better.

---

## 3. Slide-by-slide

Format per slide: **Message** (the one sentence the audience should remember) · **Content** · **Visual** (where to screenshot it) · **Speaker**.

### Part A: Opening & problem

**Slide 1: Title**
- **Message:** CTO360, Enterprise Technology Control Tower.
- **Content:**
  - tagline "One view. Connected decisions. Measurable technology outcomes."
  - team names and roles
  - capstone programme, 2026
- **Visual:** the Command Center header (`/`).
- **Speaker:** Ram.

**Slide 2: The CTO's real problem**
- **Message:** it is a **decision problem, not a data problem**.
- **Content (5 pains):**
  1. Fragmented signals across 7 tools.
  2. Cause and effect span tools; for example, the payments programme slips because of legacy dependencies + a capacity gap + rising incidents.
  3. Reporting is not deciding.
  4. Tech spend is hard to defend.
  5. Each business unit reports differently.
- **Visual:** 7 tool logos/names in separate boxes, with no arrows between them (illustrating "silos").
- **Speaker:** Ram.

**Slide 3: Same problem, three realities**
- **Message:** the same pattern repeats in every industry.
- **Content:**

| Domain | Business problem | Cost |
|---|---|---|
| Banking | Legacy core slowing digital payments; tech debt behind P1s | Q4 milestone at risk, ₹38.9 Cr value at stake, regulatory exposure |
| Manufacturing | MES / plant instability causing line stops | Lost production, OEE target missed |
| Retail | Peak readiness, inventory sync, stretched engineering | Lost festive sales, stockouts, POS risk |

- **Visual:** the three domain cards from the Command Center.
- **Speaker:** Ram.

**Slide 4: Our team and who owns what (BP1)**
- **Message:** five owners, one system; each owns a real business problem.
- **Content:**

| Owner | Role | BP1 problem |
|---|---|---|
| Ram | CTO | Multi-domain framework; decision intelligence / agents |
| Suman | Strategy & ROI | Identify ROI; transform any organisation to AI |
| Vaibhav | Regulatory & AI governance | Automate regulatory compliance (Banking); DPDP / AI governance |
| Santhosh | Finance & investment | Governance system; CAPEX / OPEX |
| Pankaj | Operations | ERP root-cause analysis; infrastructure capacity; production automation |

- Key splits:
  - Suman *identifies* ROI before spend; Santhosh *proves* value after spend.
  - Pankaj says *how much* capacity; Santhosh decides *how to fund* it.
- **Visual:** the RACI matrix on `/team`.
- **Speaker:** Ram.

### Part B: Solution & architecture

**Slide 5: What CTO360 is**
- **Message:** a decision layer, not another tool.
- **Content:** the flow **Signal → Correlation → Insight → Decision → Action → Outcome**, governed by TEDIF ("AI recommends, humans decide", audit trail).
- **Visual:** a horizontal 6-step chevron.
- **Speaker:** Ram.

**Slide 6: Architecture: 3 × 7 × 16**
- **Message:** build the control layer once; add each industry as configuration.
- **Content:**
  - **3 domains:** Meridian Bank, Arvant Industries, Orbit Retail.
  - **7 simulated sources:** Planview (strategy & portfolio), SAP LeanIX (architecture), Celonis + SAP Signavio (process), ServiceNow SPM (workflow), Jellyfish (engineering), Datadog (operations), Vanta (security, risk & governance).
  - **16 enterprise functions × 6 metrics**, all scored the same way.
  - Canonical data model with shared record IDs, which is what enables correlation.
- **Visual:** layered diagram (sources → canonical model → scoring & correlation → decisions → team workspaces); optionally screenshot `/sources`.
- **Speaker:** Ram.

**Slide 7: How it's simulated (honest framing)**
- **Message:** a realistic simulation of an enterprise, not real client data.
- **Content:**
  - seeded synthetic data
  - a live simulation clock
  - every status and score is **calculated, never typed**
  - automated consistency checks (`validate:sim`: 3 domains + team cross-checks)
  - analytics actually computed: Holt-Winters forecasting, Monte Carlo, NPV / IRR, PSI drift, EWMA anomalies, Pareto, queueing
- **Visual:** a "Simulated · <tool>" badge and the footer disclaimer.
- **Speaker:** Ram.

**Slide 8: How we measure transformation**
- **Message:** every owner moves from old state to target state, measurably.
- **Content:**
  - 6 measures per owner (30 total)
  - **baseline Nov 2025 → today → target**
  - progress % vs time used gives a glide path: **Ahead / On track / Behind**
  - plus ETA
- **Visual:** the Transformation tab of any workspace (bridge + glide-path chart).
- **Speaker:** Ram.

### Part C–E: Live demo (see section 4)

Each owner shows **one bridge slide** before their demo segment (slides 9–13):

| Slide | Owner | Message | Old state → target (headline measures) | Frameworks applied (with metric) |
|---|---|---|---|---|
| 9 | Ram · CTO Control Tower | "From signals to decisions in days, not weeks" | signal-to-decision 21 → 3 days; decisions with measured outcome 0 → 80% | Balanced Scorecard, Cynefin + RAPID, OODA |
| 10 | Suman · AI Transformation | "From pilots to measurable value, for any organisation" | pilot-to-production 18 → 60%; AI payback 30 → 18 months | Three Horizons, Diffusion + Crossing the Chasm, Business Model Canvas, Stage-Gate |
| 11 | Vaibhav · Regulatory & AI Governance | "Compliance at the speed of change" | days per circular 21 → 2; models approved 30 → 100% | Three Lines Model, risk process + heat map |
| 12 | Santhosh · Spend & Investment | "Every rupee traceable to a service and a value" | spend allocated (TBM) 40 → 95%; cloud waste 28 → 8% | Run-Grow-Transform, TCO, sensitivity tornado, NPV / IRR |
| 13 | Pankaj · ERP RCA & Capacity | "Fix causes, not symptoms; capacity before the peak" | recurring ERP problems 14 → 3; min headroom 8 → 30% | Theory of Constraints, Pareto + 5 Whys, ITIL, SRE, Lewin |

Layout for each bridge slide: owner name + role, BP1 problem, an old → target table of 2–3 measures, and the frameworks used. **Read the "current" values live from the workspace on the day.**

### Part E: Closing

**Slide 14: The golden thread: one connected decision**
- **Message:** five owners, one decision, measured outcome.
- **Content:** "Month-end close meets festive peak":
  1. Pankaj: month-end batch overrun, capacity headroom below 10%.
  2. Ram: the control tower correlates it with the festive and salary-day peaks.
  3. Santhosh: options costed (cloud burst vs hardware vs re-schedule).
  4. Suman: AI demand forecasting proposed to predict peaks.
  5. Vaibhav: governance check on data residency and model risk.
  6. Ram: decision approved, actions issued, headroom recovers.
- **Visual:** the Golden thread panel on `/team` (completed).
- **Speaker:** Ram.

**Slide 15: Frameworks, applied not just listed**
- **Message:** lean by design. A framework is applied only where it serves an owner's problem and produces a tracked metric.
- **Content:**
  - 16 frameworks applied with metrics + 15 already built into the screens + 10 analytics techniques
  - everything else is a reference library (69 explained cards)
  - team level: Kotter 8 steps + ADKAR (adoption score 1.8 → 3.2 / 5, target 4)
- **Visual:** `/team/frameworks` (decision guide) + one card from `/team/reference`.
- **Speaker:** Ram (or split).

**Slide 16: Value case (conservative first)**
- **Message:** commit to the conservative case; show base as the expectation.
- **Content (illustrative):** about ₹30.7 Cr build over 2 years + 10–20% / yr run; value ramps 15% → 45% → 75%.

| Scenario | 3-year net | ROI | Payback |
|---|---|---|---|
| Conservative | ≈ ₹1 Cr | ~2% | ~month 35 |
| Base | ≈ ₹48.7 Cr | ~104% | ~month 22 |
| Optimistic | ≈ ₹72.7 Cr | ~156% | ~month 18 |

- Plus **risk avoidance**: DPDP penalties up to ~₹250 Cr; one avoided incident can fund the programme.
- **Speaker:** Santhosh or Suman.

**Slide 17: Roadmap: from simulation to production**
- **Message:** the blueprint is ready; next is real data and live AI.
- **Content:**
  - **Next 6–12 months:**
    - a live AI call (RAG) on 3 decisions
    - real baselines from one business unit
    - persistent audit trail
    - pilot
  - **2–3 years:** platform in 2–3 business units (₹25–50 Cr / yr if adoption holds)
  - **Guardrail:** no production AI before day 90 (TEDIF gates)
- **Speaker:** Ram.

**Slide 18: Close**
- **Message:** "Five owners, one connected decision, measured outcomes. **AI recommends, humans decide.**"
- **Content:** live URL https://cto360.vercel.app · thank you · Q&A.
- **Speaker:** Ram.

**Appendix slides (backup, only if asked):**
- A1: the 16 enterprise functions list
- A2: the 7 source systems and what each answers
- A3: TEDIF phases and gates
- A4: analytics techniques with formulas (from `/team/reference`)
- A5: disclaimer (from `/about`)

---

## 4. Live demo run-sheet (from `PROJECT_NOTES.md` section 38)

**Before you start:**
1. Open https://cto360.vercel.app/team.
2. Press **Reset** in the header so the golden thread plays from the start (steps at +15, 40, 65, 90, 115 and 140 s; live circular at +50 s; breach clock at +80 s).
3. On the Decision Center, press **Reset demo** so approvals start empty.
4. Use a desktop browser at 100% zoom, with notifications off.

| # | Who | Where | What to show (about 3 min each) |
|---|---|---|---|
| 0 | Ram | `/team` | Problem statement → transformation scorecard (team ≈ 59%) → **golden thread starts live** |
| 1 | Ram | `/team/ram` → Agents & correlation → Golden thread | 5 agents → correlation → decisions; then `/` Command Center and approve **Digital Payments** in the Decision Center |
| 2 | Suman | `/team/suman` → Portfolio & gates → ROI → Onboard | Funnel, **Promote** the retail demand-forecasting pilot, Monte Carlo P10–P90, generate a plan for "Insurance" |
| 3 | Vaibhav | `/team/vaibhav` → Regulatory change → AI model register → Data governance | **Live circular arrives (+50 s)** → Approve mapping; fraud model PSI 0.37 → Restricted; **breach clock (+80 s)** |
| 4 | Santhosh | `/team/santhosh` → CAPEX / OPEX → Budget → Investment | TBM Sankey (72% allocated), retail festive cloud spike (golden thread step 3), NPV / IRR; security programmes judged on risk |
| 5 | Pankaj | `/team/pankaj` → ERP RCA → Capacity → Peak scenarios | Pareto + 5-Whys; shared cluster gauge recovering after golden-thread step 6; festive slider: 0% → 1,546 ms, 25% → within target |
| 6 | Ram | `/team` | Golden thread complete → Transformation tab: "from old state to target state, measurably" → About & disclaimer |

**Each presenter, in about 3 minutes:**
1. Transformation tab (old → target, glide pill).
2. Two functional tabs (one live action).
3. The "Frameworks applied" tab.

**If something goes wrong:**
- Timing is off: press Reset and carry on talking; the thread replays in about 2½ minutes.
- The site doesn't load: switch to the backup screenshots or screen recording (section 6).

---

## 5. Numbers cheat sheet (illustrative; read live values on the day)

| Item | Value |
|---|---|
| Domain health | Meridian Bank 78 · Arvant Industries 73 · Orbit Retail 76 |
| Team transformation | ≈ 59% (Ram 65 · Suman 75 · Vaibhav 53 · Santhosh 58 · Pankaj 44) |
| AI portfolio | 38 use cases across 3 domains |
| Regulatory | 8 circulars / 24 obligations; 24 models (1 restricted, fraud model PSI 0.37) |
| Operations | 10 problem records (8 recurring open); minimum headroom 17% |
| Spend | TBM 72% allocated; Run-Grow-Transform target 60 / 25 / 15 |
| Earlier demo figures | Regulatory mapping 21 → 4 days (target < 1); manufacturing RCA 38 h → 9 h (target 6 h); CAPEX approval 45 → 21 days (target 10); duplicated AI spend ≈ ₹4.6 Cr |
| Reference library | 69 frameworks, techniques and concepts |

---

## 6. Build checklist for the PPT

**Screenshots to capture** (desktop, 1366 wide, after golden thread completes):
1. `/` Command Center (hero + heatmaps)
2. `/sources` Data sources
3. `/domain/banking` Enterprise 360 overview
4. `/decision-center` Top 10
5. `/team` scorecard + golden thread + RACI
6. One Transformation tab (bridge + glide path)
7. One "Frameworks applied" tab per owner (5)
8. `/team/frameworks` decision guide
9. `/team/reference` (2–3 cards)
10. `/about` disclaimer

**Backup:** record a 6–8 minute screen video of the full run-sheet as a fallback.

**Deck style:**
- Navy `#0f2747` + blue `#2563eb` + grey `#94a3b8` (matches the site).
- Domain colours: banking `#2a78d6`, manufacturing `#1baf7a`, retail `#eb6834`.
- One message per slide, as the title.

**Consistency:**
- Use the name **CTO360** everywhere (TEDIF is the framework underneath).
- Use the owner map from slide 4 only.

---

## 7. Q&A preparation

| Likely question | Answer (short) |
|---|---|
| Is this real data? | No, it is a seeded, realistic simulation. Every score is calculated from records and cross-checked automatically. The design takes real exports (Planview, LeanIX, ServiceNow, …) as the next step. |
| Why not just buy Planview / ServiceNow? | We don't replace them; we connect them. Each answers its own question; none correlates across tools into a prioritised decision with an owner and a measured outcome. |
| Where is the AI? | Simulated agents, correlation and recommendations today (rule-based, labelled). Next step: a live LLM call with RAG on 3 decisions. Humans always decide (TEDIF gates, audit trail). |
| How do you stop AI from making bad decisions? | AI only recommends. A named decider (RAPID) approves at a gate, models are registered with drift monitoring (PSI), and the Three Lines Model provides oversight. |
| How does it work for a new industry? | Configuration, not rebuild. Retail was added by configuration only; Suman's "Onboard" generates a plan (and a Business Model Canvas) for any industry. |
| DPDP / regulation? | Vaibhav's workspace: circular → obligation → control → evidence, DPDP consent coverage and a breach clock. |
| What does it cost and pay back? | Slide 16. Commit to the conservative case; base payback is about month 22; risk avoidance is extra. |
| Which frameworks did you use, and why only some? | Lean by design: applied only where they serve an owner's problem with a tracked metric (`/team/frameworks`); the rest are explained in the Reference library. |
| What would you do next? | Real baselines from one business unit, live AI on 3 decisions, persistent audit, then a pilot. |

---

## 8. Day-of checklist

- [ ] Latest code pushed (`git push && git push origin v1.0-freeze`); Vercel shows the latest deploy.
- [ ] Site opens at https://cto360.vercel.app on the presentation laptop.
- [ ] Header **Reset** pressed just before starting; Decision Center **Reset demo** pressed.
- [ ] Backup video and screenshots are on the laptop (offline).
- [ ] Each presenter has rehearsed their 3 minutes with the run-sheet.
- [ ] GitHub token from earlier chat revoked.
