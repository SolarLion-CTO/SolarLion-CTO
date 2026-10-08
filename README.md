# CTO360 · Enterprise Technology Control Tower

**One view. Connected decisions. Measurable technology outcomes.**

CTO360 is a CTO capstone project (2026): a decision-intelligence layer that connects signals from enterprise tools into prioritised, owned and measured decisions.

- **Governance:** TEDIF. **AI recommends, humans decide.**
- **Live:** https://cto360.vercel.app (Google sign-in)
- **Project history and resume point:** [`PROJECT_NOTES.md`](PROJECT_NOTES.md) (start with section 0)

## What is inside

| Area | What it shows |
|---|---|
| **Enterprise Command Center** (`/`) | Three simulated business units (Meridian Bank, Arvant Industries, Orbit Retail): 7 source systems × 16 enterprise functions, heatmaps, live events |
| **Domain 360** (`/domain/:id`) | The 7 simulated sources (Planview, SAP LeanIX, Celonis + Signavio, ServiceNow SPM, Jellyfish, Datadog, Vanta), the 16 function pages, record drill-down, and Decision Intelligence |
| **Decision Center** (`/decision-center`) | Top 10 decisions across business units → actions → measured outcomes |
| **Team workspaces** (`/team/:owner`) | Ram (CTO), Suman (AI transformation), Vaibhav (regulatory & AI governance), Santhosh (spend & investment), Pankaj (ERP RCA & capacity): old state → target state, glide paths, frameworks applied with metrics |
| **Frameworks & reference** (`/team/frameworks`, `/team/reference`) | A decision guide plus 69 frameworks, techniques and concepts explained with diagrams |
| **Real data** (labelled "REAL DATA") | Six public datasets as reality checks: endoflife.date, CISA KEV, RBI notifications, Kaggle fraud, the UCI ServiceNow incident log, FOCUS cloud billing. See [`data/real/SOURCES.md`](data/real/SOURCES.md) |
| **Sign-in log** (`/admin/sign-ins`) | Who signed in with Google, and when (Supabase) |

## Run locally

```bash
npm install
cp .env.example .env.local     # optional: add Supabase URL + publishable key to enable Google sign-in
npm run dev                    # http://localhost:5173
npm run validate:sim           # consistency checks for the simulation and team data
npm run build
```

Without the Supabase variables, the site runs open (demo mode).

## Data

- **Simulation:** `src/data/sim/` holds seeded, deterministic data in which every status and score is calculated. Spec: [`docs/SIMULATION_SPEC.md`](docs/SIMULATION_SPEC.md).
- **Real data:** `src/data/real/*.json`, produced by `scripts/real-data/process_real_data.py`. Sources, licences and refresh steps: [`data/real/SOURCES.md`](data/real/SOURCES.md).

## Documents

| File | Purpose |
|---|---|
| `PROJECT_NOTES.md` | Full build history, decisions, pending checklist |
| `docs/PPT_STORYLINE.md` | Presentation storyline, demo run-sheet, Q&A |
| `docs/presentation/CTO360_Capstone_Presentation.pdf` | The 16:9 presentation deck |
| `docs/SYLLABUS_AND_FRAMEWORKS.md` | Syllabus coverage and the framework library |
| `docs/TEAM_WORKSPACES_PLAN.md` | Design of the five team workspaces |
| `docs/SIMULATION_SPEC.md`, `docs/ENTERPRISE360_SPEC.md`, `docs/MOCKUPS.md` | Simulation and Enterprise 360 specifications |
| `supabase/login_events.sql` | One-time SQL for the sign-in log |

## Stack

React 19, Vite, TypeScript, Tailwind CSS v4, Recharts, lucide-react, and Supabase (Google OAuth). Deployed on Vercel.

## Disclaimer

This is an independent demonstration using synthetic data and credited public datasets. Third-party product names are referenced solely for conceptual integration scenarios. CTO360 is not affiliated with or endorsed by the referenced vendors.
