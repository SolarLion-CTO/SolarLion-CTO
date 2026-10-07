#!/usr/bin/env python3
# Builds the CTO360 capstone presentation as 16:9 HTML slides (printed to PDF by Chrome).
import html, os

NAVY, BLUE, LIGHT, GREY, INK2 = '#0f2747', '#2563eb', '#86b6ef', '#94a3b8', '#334155'
BANK, MFG, RET = '#2a78d6', '#1baf7a', '#eb6834'
OWN = {'Ram': '#0f2747', 'Suman': '#2563eb', 'Vaibhav': '#7c3aed', 'Santhosh': '#0e9f6e', 'Pankaj': '#d97706'}

CSS = """
@page { size: 1280px 720px; margin: 0 }
* { box-sizing: border-box; margin: 0; padding: 0 }
body { font-family: Inter, -apple-system, 'Helvetica Neue', Arial, sans-serif; color: #0f172a; -webkit-print-color-adjust: exact; print-color-adjust: exact }
.s { width: 1280px; height: 720px; position: relative; overflow: hidden; background: #fff; page-break-after: always; padding: 44px 56px 0 }
.s:last-child { page-break-after: auto }
.kick { font-size: 13px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: #2563eb }
h1 { font-size: 34px; line-height: 1.15; color: #0f2747; margin: 6px 0 4px; font-weight: 800 }
.lead { font-size: 17px; color: #334155; margin-bottom: 22px; max-width: 1100px }
.foot { position: absolute; left: 56px; right: 56px; bottom: 18px; display: flex; justify-content: space-between; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 8px }
.bar { position: absolute; left: 0; top: 0; bottom: 0; width: 10px; background: linear-gradient(#0f2747, #2563eb) }
.row { display: flex; gap: 28px }
.col { flex: 1; min-width: 0 }
ul.p { list-style: none }
ul.p li { position: relative; padding-left: 20px; font-size: 15.5px; line-height: 1.45; color: #1e293b; margin-bottom: 9px }
ul.p li:before { content: ''; position: absolute; left: 2px; top: 8px; width: 8px; height: 8px; border-radius: 2px; background: #2563eb }
ul.p li b { color: #0f2747 }
ul.p.sm li { font-size: 14px; margin-bottom: 6px }
.card { border: 1px solid #dbe3ee; border-radius: 14px; padding: 16px 18px; background: #fff }
.card h3 { font-size: 17px; color: #0f2747; margin-bottom: 8px }
.tint { background: #f3f7fd }
.chip { display: inline-block; font-size: 12px; font-weight: 600; border-radius: 999px; padding: 4px 10px; margin: 0 6px 6px 0; background: #eaf2fe; color: #1e3a8a; border: 1px solid #cfe0fb }
.chip.g { background: #ecfdf3; color: #166534; border-color: #bbf7d0 }
.tag { display: inline-block; font-size: 11px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: #fff; border-radius: 6px; padding: 3px 8px }
table.t { border-collapse: collapse; width: 100%; font-size: 14px }
table.t th { text-align: left; background: #0f2747; color: #fff; padding: 8px 10px; font-weight: 600 }
table.t td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; vertical-align: top }
table.t tr:nth-child(even) td { background: #f8fafc }
.big { font-size: 46px; font-weight: 800; color: #0f2747; line-height: 1 }
.muted { color: #64748b }
.note { font-size: 12px; color: #64748b; margin-top: 10px }
"""

slides = []
SMALL = {'a','an','the','and','or','for','to','of','in','on','not','with','before','vs','per'}
def tc(t):
    w = t.split(' ')
    return ' '.join(x if (i and x.lower() in SMALL) else x[:1].upper() + x[1:] for i, x in enumerate(w))
def S(kick, title, body, lead=''):
    slides.append((kick, title, lead, body))

def ul(items, cls='p'):
    out = []
    for it in items:
        if isinstance(it, tuple):
            out.append(f'<li><b>{it[0]}</b> {it[1]}</li>')
        else:
            out.append(f'<li>{it}</li>')
    return f'<ul class="{cls}">' + ''.join(out) + '</ul>'

def chev(items, colors=None, h=74, w=1168, fs=15):
    n = len(items); cw = w / n
    parts = []
    for i, t in enumerate(items):
        x = i * cw; c = (colors or [NAVY, '#173a6b', '#1f4f94', BLUE, '#4b86ee', LIGHT])[i % 6]
        pts = f'{x},0 {x+cw-14},0 {x+cw},{h/2} {x+cw-14},{h} {x},{h} {x+14 if i else x},{h/2}'
        tc = '#fff' if c != LIGHT else NAVY
        lines = t.split('|')
        ty = h/2 - (len(lines)-1)*9 + 5
        txt = ''.join(f'<text x="{x+cw/2+4}" y="{ty+k*18}" text-anchor="middle" font-size="{fs}" font-weight="700" fill="{tc}">{html.escape(l)}</text>' for k, l in enumerate(lines))
        parts.append(f'<polygon points="{pts}" fill="{c}"/>{txt}')
    return f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}">{"".join(parts)}</svg>'

def progress(rows, owner_color):
    # rows: (name, base, now, target, unit, better)
    out = []
    for name, b, n, t, u, better in rows:
        p = max(0, min(100, round((n - b) / (t - b) * 100)))
        out.append(f'''<div style="margin-bottom:14px">
<div style="display:flex;justify-content:space-between;font-size:14px;margin-bottom:5px"><b style="color:{NAVY}">{name}</b><span class="muted">{p}% of the gap closed</span></div>
<div style="position:relative;height:16px;background:#e8eef7;border-radius:8px"><div style="position:absolute;left:0;top:0;bottom:0;width:{p}%;background:{owner_color};border-radius:8px"></div></div>
<div style="display:flex;justify-content:space-between;font-size:12.5px;margin-top:4px;color:#475569"><span>Old state {b}{u}</span><span><b style="color:{NAVY}">Now {n}{u}</b></span><span>Target {t}{u}</span></div></div>''')
    return ''.join(out)

def foot(i, total):
    return f'<div class="foot"><span>CTO360 · Enterprise Technology Control Tower · Capstone 2026</span><span>Illustrative simulated data · AI Recommends, Humans Decide</span><span>{i} / {total}</span></div>'

# ───────────────────────── 1 Title ─────────────────────────
TITLE = f'''<div style="position:absolute;inset:0;background:linear-gradient(135deg,{NAVY} 0%,#173a6b 55%,{BLUE} 100%);color:#fff;padding:90px 90px">
<div style="font-size:15px;letter-spacing:.2em;font-weight:700;color:{LIGHT}">CTO CAPSTONE PROJECT · 2026</div>
<div style="font-size:84px;font-weight:800;margin-top:26px;letter-spacing:-.02em">CTO<span style="color:{LIGHT}">360</span></div>
<div style="font-size:32px;font-weight:600;margin-top:6px">Enterprise Technology Control Tower</div>
<div style="font-size:20px;margin-top:22px;color:#dbe7fb;max-width:760px;line-height:1.45">One View. Connected Decisions. Measurable Technology Outcomes.<br>Moving an enterprise from current state to target state, measurably, with governed AI.</div>
<div style="position:absolute;left:90px;bottom:70px;display:flex;gap:14px">{''.join(f'<div style="background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.25);border-radius:12px;padding:10px 16px"><div style="font-weight:700;font-size:16px">{n}</div><div style="font-size:12px;color:#c7d8f5">{r}</div></div>' for n, r in [('Ram','CTO'),('Suman','Strategy & ROI'),('Vaibhav','Regulatory & AI Governance'),('Santhosh','Finance & Investment'),('Pankaj','Operations')])}</div>
<svg style="position:absolute;right:70px;top:120px" width="330" height="330" viewBox="0 0 330 330">
<circle cx="165" cy="165" r="150" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="2"/>
<circle cx="165" cy="165" r="105" fill="none" stroke="rgba(255,255,255,.28)" stroke-width="2"/>
<circle cx="165" cy="165" r="58" fill="rgba(255,255,255,.12)" stroke="{LIGHT}" stroke-width="3"/>
<text x="165" y="160" text-anchor="middle" font-size="18" font-weight="800" fill="#fff">Decide</text><text x="165" y="182" text-anchor="middle" font-size="12" fill="#c7d8f5">human in charge</text>
{''.join(f'<circle cx="{165+150*__import__("math").cos(a)}" cy="{165+150*__import__("math").sin(a)}" r="7" fill="{LIGHT}"/>' for a in [i*0.8976 for i in range(7)])}
{''.join(f'<circle cx="{165+105*__import__("math").cos(a)}" cy="{165+105*__import__("math").sin(a)}" r="5" fill="#fff"/>' for a in [0.4+i*2.094 for i in range(3)])}
</svg>
<div style="position:absolute;right:92px;top:462px;font-size:12px;color:#c7d8f5;text-align:center;width:290px">7 source systems · 3 business units · 1 decision layer</div>
</div>'''
slides.append(('', '', '', TITLE))

# ───────────────────────── 2 Agenda ─────────────────────────
ag = [('01', 'The Problem', 'Why CTOs cannot steer AI-led transformation today'), ('02', 'The Solution', 'CTO360: a decision layer over existing tools'),
      ('03', 'How It Works', 'Architecture, simulation and how we measure change'), ('04', 'Live Demo', 'Five owner workspaces and one connected decision'),
      ('05', 'Frameworks & Value', 'Frameworks applied with metrics, value case, roadmap'), ('06', 'Q&A', 'Questions and discussion')]
S('Agenda', 'What We Will Cover', '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:18px">' + ''.join(
    f'<div class="card {"tint" if i % 2 else ""}" style="height:230px"><div style="font-size:44px;font-weight:800;color:{BLUE}">{n}</div><h3 style="font-size:21px;margin-top:6px">{t}</h3><div style="font-size:15px;color:{INK2}">{d}</div></div>' for i, (n, t, d) in enumerate(ag)) + '</div>',
  'About 25 minutes of story and live demo, followed by questions.')

# ───────────────────────── 3 Problem ─────────────────────────
tools = ['Planview', 'SAP LeanIX', 'Celonis + Signavio', 'ServiceNow SPM', 'Jellyfish', 'Datadog', 'Vanta']
asks = ['Strategy', 'Architecture', 'Process', 'Workflow', 'Engineering', 'Operations', 'Risk']
silo = '<svg width="520" height="380" viewBox="0 0 520 380">' + ''.join(
    f'<g><rect x="{(i%2)*265+10}" y="{(i//2)*88+10}" width="240" height="66" rx="12" fill="#f3f7fd" stroke="#cfdaea"/><text x="{(i%2)*265+130}" y="{(i//2)*88+40}" text-anchor="middle" font-size="16" font-weight="700" fill="{NAVY}">{t}</text><text x="{(i%2)*265+130}" y="{(i//2)*88+60}" text-anchor="middle" font-size="12.5" fill="#64748b">answers: {a}</text></g>'
    for i, (t, a) in enumerate(zip(tools, asks))) + f'<g><rect x="275" y="274" width="240" height="66" rx="12" fill="#fff1f2" stroke="#fecdd3" stroke-dasharray="5 4"/><text x="395" y="304" text-anchor="middle" font-size="16" font-weight="800" fill="#b91c1c">What matters most?</text><text x="395" y="324" text-anchor="middle" font-size="12.5" fill="#b91c1c">no tool answers this</text></g></svg>'
S('01 · The Problem', 'A Decision Problem, Not a Data Problem', '<div class="row"><div class="col">' + ul([
    ('Fragmented signals.', 'Strategy, architecture, process, delivery, operations and risk each live in a separate tool, and each answers only its own question.'),
    ('Cause and effect span tools.', 'A payments programme slips because of legacy dependencies (LeanIX), a team capacity gap (Jellyfish) and rising incidents (Datadog). No single tool shows that chain, so it is found late.'),
    ('Reporting is not deciding.', 'Dashboards and status decks are plentiful, but signal to decision to action to outcome is manual, slow and rarely closed.'),
    ('Technology spend is hard to defend.', 'Value realised and risk avoided are not tied to specific decisions.'),
    ('Every business unit reports differently,', 'so the CTO cannot compare them or move money and people with confidence.')]) + '</div><div style="width:530px">' + silo + '</div></div>',
  'The CTO cannot see across the enterprise fast enough to decide where to intervene, or prove that technology spend produced business outcomes.')

# ───────────────────────── 4 Three realities ─────────────────────────
dom = [('Banking', 'Meridian Bank', BANK, 'Legacy core and integration layer slowing digital payments; technology debt behind P1 incidents.', ['Q4 payments milestone at risk', '₹38.9 Cr value at stake', 'Regulatory exposure (RBI, DPDP)']),
       ('Manufacturing', 'Arvant Industries', MFG, 'MES and plant system instability causing line stops; smart factory programme delayed.', ['Lost production hours', 'Late deliveries to customers', 'OEE target missed']),
       ('Retail', 'Orbit Retail', RET, 'Festive peak readiness and inventory sync; engineering capacity stretched.', ['Lost festive sales', 'Overselling and stockouts', 'Point-of-sale security risk'])]
S('01 · The Problem', 'Same Problem, Three Different Realities', '<div class="row">' + ''.join(
    f'<div class="col card" style="border-top:8px solid {c};height:400px"><span class="tag" style="background:{c}">{d}</span><h3 style="font-size:22px;margin-top:12px">{n}</h3><div style="font-size:15.5px;color:{INK2};line-height:1.5;margin-bottom:14px"><b>Business problem:</b> {p}</div><div style="font-size:13px;font-weight:700;color:#64748b;letter-spacing:.06em;margin-bottom:6px">WHAT IT COSTS</div>{ul(cost, "p sm")}</div>'
    for d, n, c, p, cost in dom) + '</div><div class="note">The pattern repeats across industries, so the answer must be built once and configured per industry. Retail was added by configuration only.</div>',
  'Three simulated enterprises with different industries, but the same root cause: signals that are never connected into a decision.')

# ───────────────────────── 5 Capstone problem statement ─────────────────────────
verbs = [('See', 'One comparable view across business units, sources and functions', 'Ram'), ('Govern', 'Regulation, AI models and data under control with evidence', 'Vaibhav'),
         ('Fund', 'Every rupee traceable to a service, with value proven after spend', 'Santhosh'), ('Run', 'Root causes fixed and capacity ready before the peak', 'Pankaj'),
         ('Transform', 'Any organisation moved from AI pilots to measurable value', 'Suman')]
S('01 · The Problem', 'Our Capstone Problem Statement', f'''<div class="card tint" style="font-size:22px;line-height:1.45;color:{NAVY};font-weight:600;padding:22px 26px;margin-bottom:22px;border-left:8px solid {BLUE}">Enterprises cannot <span style="color:{BLUE}">see, govern, fund and run</span> AI-led transformation as one system. CTO360 simulates a real enterprise and moves each area from its current state to a target state, <span style="color:{BLUE}">measurably</span>.</div>
<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:14px">''' + ''.join(
    f'<div class="card" style="height:210px;border-top:6px solid {OWN[o]}"><div style="font-size:26px;font-weight:800;color:{OWN[o]}">{v}</div><div style="font-size:14.5px;color:{INK2};margin:8px 0 12px;line-height:1.45;height:84px">{d}</div><span class="tag" style="background:{OWN[o]}">Owner · {o}</span></div>' for v, d, o in verbs) + '</div><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-top:18px">' + ''.join(f'<div class="card tint" style="padding:12px 16px"><div class="big" style="font-size:34px;color:{BLUE}">{n}</div><div style="font-size:13.5px;color:{INK2};margin-top:4px">{d}</div></div>' for n, d in [('3', 'simulated enterprises: banking, manufacturing, retail'), ('30', 'transformation measures, 6 per owner, baseline to target'), ('6', 'golden-thread steps connecting all five owners live'), ('1', 'decision layer: AI recommends, humans decide')]) + '</div>',
  'Five verbs, five owners, one system. Each owner takes one real business problem (BP1) from current state to target state.')

# ───────────────────────── 6 Team ─────────────────────────
team = [('Ram', 'CTO · CTO Control Tower', ['Multi-domain framework', 'Decision intelligence and agents']),
        ('Suman', 'Strategy & ROI · AI Transformation', ['Identify ROI before investment', 'Transform any organisation to AI']),
        ('Vaibhav', 'Regulatory & AI Governance', ['Automate regulatory compliance (Banking)', 'DPDP and AI governance']),
        ('Santhosh', 'Finance & Investment Governance', ['Governance system for investment', 'CAPEX and OPEX control']),
        ('Pankaj', 'Operations · ERP RCA & Capacity', ['ERP root-cause analysis', 'Infrastructure capacity planning', 'Production automation'])]
S('01 · The Problem', 'Team, Ownership and Business Problems', '<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:14px;margin-bottom:20px">' + ''.join(
    f'<div class="card" style="height:275px"><div style="width:52px;height:52px;border-radius:50%;background:{OWN[n]};color:#fff;font-weight:800;font-size:22px;display:flex;align-items:center;justify-content:center">{n[0]}</div><h3 style="margin-top:10px;font-size:20px">{n}</h3><div style="font-size:13px;color:#64748b;margin-bottom:10px;height:34px">{r}</div>{ul(p, "p sm")}</div>' for n, r, p in team) + '</div>' +
  '<div class="row"><div class="col card tint">' + ul([('Suman identifies ROI before spend;', 'Santhosh proves value after spend.'), ('Pankaj says how much capacity is needed and when;', 'Santhosh decides how to fund it.')], 'p sm') + '</div><div class="col card tint">' + ul([('Investment governance (Santhosh)', 'is different from regulatory and AI governance (Vaibhav).'), ('One RACI matrix', 'on the Team page is the single source for who is responsible, accountable, consulted and informed.')], 'p sm') + '</div></div>',
  'Each owner has a dedicated live workspace in CTO360. Clear splits remove overlap between roles.')

# ───────────────────────── 7 Solution ─────────────────────────
S('02 · The Solution', 'CTO360: A Decision Layer, Not Another Tool', chev(['Signal', 'Correlation', 'Insight', 'Decision', 'Action', 'Outcome'], h=92, fs=18) + '<div class="row" style="margin-top:26px"><div class="col">' + ul([
    ('One view:', '3 business units × 7 source systems × 16 enterprise functions, all scored the same way so they can be compared.'),
    ('Correlation:', 'records are linked across tools through shared IDs, so every decision card shows why it exists, with traceable evidence.'),
    ('Prioritised Top 10:', 'each decision shows impact, money asked versus value protected, confidence, owner and deadline.'),
    ('Closed loop:', 'approve a decision, issue actions, and track the outcome against baseline and target.')]) + f'</div><div style="width:440px"><div class="card" style="background:{NAVY};color:#fff;height:290px;border:0;padding:22px 24px"><div class="kick" style="color:{LIGHT}">Governance · TEDIF</div><div style="font-size:30px;font-weight:800;margin:10px 0">AI Recommends.<br>Humans Decide.</div>' +
  '<div style="font-size:14.5px;line-height:1.5;color:#dbe7fb">Trusted Enterprise Decision Intelligence Framework: AI gathers signals and recommends, a named person decides at a gate, and every step is recorded in an audit trail.</div></div></div></div>',
  'CTO360 sits on top of the tools an enterprise already owns and turns their signals into decisions that are owned, acted on and measured.')

# ───────────────────────── 8 Architecture ─────────────────────────
layers = [('Team Workspaces', '5 owner workspaces · Transformation tabs · golden thread', NAVY), ('Decision Intelligence', 'Top 10 decisions · actions · outcomes · maturity · audit trail', '#173a6b'),
          ('Scoring & Correlation', '16 functions × 6 metrics · health scores · cross-tool correlation · analytics', '#1f4f94'), ('Canonical Data Model', 'shared entities and record IDs: initiatives, apps, processes, incidents, risks, spend', BLUE)]
arch = '<div>' + ''.join(f'<div style="background:{c};color:#fff;border-radius:12px;padding:12px 18px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center"><b style="font-size:17px">{t}</b><span style="font-size:13.5px;color:#dbe7fb">{d}</span></div>' for t, d, c in layers) + \
  '<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:6px;margin-top:4px">' + ''.join(f'<div style="border:1px solid #cfdaea;background:#f3f7fd;border-radius:10px;padding:8px 4px;text-align:center;height:66px"><div style="font-size:12.5px;font-weight:700;color:{NAVY}">{t}</div><div style="font-size:11px;color:#64748b">{a}</div></div>' for t, a in zip(tools, asks)) + \
  '</div><div style="text-align:center;font-size:12px;color:#64748b;margin-top:6px">7 simulated source systems (one per enterprise question)</div></div>'
S('03 · How It Works', 'Architecture: 3 Business Units × 7 Sources × 16 Functions', '<div class="row"><div style="width:720px">' + arch + '</div><div class="col">' + ul([
    ('Build once, configure per industry:', 'Meridian Bank, Arvant Industries and Orbit Retail run on the same engine.'),
    ('7 source systems:', 'each represents a real enterprise tool category and feeds the canonical model.'),
    ('16 enterprise functions:', 'from Technology and Data & AI to Finance, HR, Legal and Procurement, each with 6 scored metrics.'),
    ('Shared record IDs', 'are what make cross-tool correlation, evidence and drill-down possible.')], 'p sm') + '</div></div>',
  'A layered design: sources at the bottom, a common data model, scoring and correlation, then decisions and team workspaces on top.')

# ───────────────────────── 9 Simulation ─────────────────────────
S('03 · How It Works', 'A Realistic Simulation, Built to Be Trusted', chev(['Seeded|synthetic data', 'Live simulation|clock', 'Calculated|statuses & scores', 'Automated|consistency checks', 'Analytics|computed'], [NAVY, '#173a6b', '#1f4f94', BLUE, '#4b86ee']) + '<div class="row" style="margin-top:24px"><div class="col">' + ul([
    ('Seeded data:', 'the same realistic enterprise is generated every time, so the demo is repeatable.'),
    ('Live clock:', 'the simulation runs in real time; events such as a new regulatory circular or a breach clock arrive on stage.'),
    ('Nothing is typed by hand:', 'every status, score, risk level and decision priority is calculated from the records.'),
    ('Automated checks:', 'every build validates 3 domains plus team cross-checks, for example spend ledgers reconcile and every obligation maps to a real control.')]) +
  '</div><div class="col card tint"><h3>Analytics Actually Computed</h3>' + ''.join(f'<span class="chip">{c}</span>' for c in ['Holt-Winters forecasting', 'EWMA anomaly detection', 'Monte Carlo (P10 / P50 / P90)', 'NPV · IRR · payback', 'S-curve adoption', 'PSI model drift', 'Pareto 80/20', 'Queueing (M/M/1)', 'SRE error budget', 'Glide path & ETA']) +
  '<div class="note">Honest framing: this is synthetic data, not client data. The design takes real tool exports as the next step.</div></div></div>',
  'The simulation behaves like a real enterprise: data, events and calculations are consistent, repeatable and checked automatically.')

# ───────────────────────── 10 Measurement ─────────────────────────
glide = f'''<svg width="560" height="300" viewBox="0 0 560 300">
<line x1="50" y1="250" x2="540" y2="250" stroke="#cbd5e1"/><line x1="50" y1="20" x2="50" y2="250" stroke="#cbd5e1"/>
<line x1="50" y1="40" x2="540" y2="40" stroke="#16a34a" stroke-dasharray="6 5"/><text x="540" y="32" text-anchor="end" font-size="13" fill="#166534" font-weight="700">Target</text>
<polyline points="50,250 540,40" fill="none" stroke="{GREY}" stroke-width="2" stroke-dasharray="7 6"/><text x="112" y="196" font-size="13" fill="#64748b">Plan (glide path)</text>
<polyline points="50,250 90,238 130,222 170,214 210,190 250,176 290,170 330,150" fill="none" stroke="{BLUE}" stroke-width="4"/>
<circle cx="330" cy="150" r="8" fill="{NAVY}"/><text x="340" y="174" font-size="13" fill="{NAVY}" font-weight="700">Today</text>
<line x1="330" y1="150" x2="540" y2="40" stroke="{BLUE}" stroke-dasharray="3 5" stroke-width="2"/><text x="410" y="140" font-size="12" fill="{BLUE}">ETA on trend</text>
<text x="56" y="272" font-size="13" fill="#64748b">Baseline Nov 2025</text><text x="540" y="272" text-anchor="end" font-size="13" fill="#64748b">Target date</text></svg>'''
S('03 · How It Works', 'How We Measure Transformation', '<div class="row"><div style="width:580px">' + glide + '<div style="display:flex;gap:10px;margin-top:6px">' + ''.join(f'<div class="card" style="flex:1;padding:10px 12px;border-left:6px solid {c}"><b style="color:{c}">{t}</b><div style="font-size:12.5px;color:{INK2}">{d}</div></div>' for t, d, c in [('Ahead', 'progress ≥ time used + 10', '#16a34a'), ('On Track', 'within ±10 points', BLUE), ('Behind', 'progress < time used − 10', '#dc2626')]) + '</div></div><div class="col">' + ul([
    ('6 measures per owner, 30 in total,', 'each with an old state (baseline Nov 2025), today, and a target with a date.'),
    ('Progress', '= share of the gap from baseline to target already closed.'),
    ('Time used', '= share of the time from baseline to the target date already passed.'),
    ('Glide path:', 'comparing progress with time used gives Ahead, On Track or Behind, so a slow start is visible early.'),
    ('ETA:', 'projected from the last quarter\'s trend; flagged when the trend is flat or moving away.'),
    ('Same rule for everyone,', 'so a team score (about 59% today) can be compared across owners.')], 'p sm') + '</div></div>',
  'Every owner moves from old state to target state. Progress is compared with time used, so we know whether we are transforming fast enough.')

# ───────────────────────── 11 Demo divider ─────────────────────────
steps = [('0', 'Ram', '/team', 'Problem statement, team scorecard, golden thread starts live'), ('1', 'Ram', 'Control Tower', '5 agents, correlation, approve Digital Payments in the Decision Center'),
         ('2', 'Suman', 'AI Transformation', 'Funnel, promote a pilot, Monte Carlo, onboard "Insurance"'), ('3', 'Vaibhav', 'Regulatory & AI Gov.', 'Live circular (+50 s), model drift, breach clock (+80 s)'),
         ('4', 'Santhosh', 'Spend & Investment', 'TBM Sankey, festive cloud spike, NPV / IRR'), ('5', 'Pankaj', 'ERP RCA & Capacity', 'Pareto + 5 Whys, capacity gauge, festive slider'),
         ('6', 'Ram', '/team', 'Golden thread complete: old state to target state, measurably')]
S('04 · Live Demo', 'Live Demo: Five Owners, One Connected Decision', '<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:10px">' + ''.join(
    f'<div class="card" style="height:340px;padding:14px;border-top:6px solid {OWN[o]}"><div style="font-size:32px;font-weight:800;color:{OWN[o]}">{n}</div><div style="font-weight:800;color:{NAVY};font-size:16px">{o}</div><div style="font-size:12px;color:#64748b;margin-bottom:10px">{w}</div><div style="font-size:13.5px;color:{INK2};line-height:1.45">{d}</div></div>' for n, o, w, d in steps) +
  '</div><div class="row" style="margin-top:18px"><div class="col card tint" style="padding:12px 16px">' + ul([('Before starting:', 'open the Team page and press Reset in the header so the scenario replays from the beginning.'), ('Each presenter, about 3 minutes:', 'Transformation tab, two functional tabs with one live action, then the Frameworks Applied tab.')], 'p sm') + '</div></div>',
  'Live site: cto360.vercel.app. The scenario plays on a simulation clock while we present.')

# ───────────────────────── 12 to 16 Owners ─────────────────────────
owners = [
 ('Ram', 'CTO Control Tower', 'Integrate, decide, prove outcomes', 'Multi-domain framework; decision intelligence and agents',
  'Signals scattered across 7 tools and 3 business units; decisions take weeks and outcomes are rarely measured.',
  'One control tower: correlated signals become owned decisions within days, with outcomes tracked against targets.',
  [('Signal-to-decision time', 21, 6, 3, ' days'), ('Decisions with measured outcome', 0, 22, 80, '%'), ('Business units on one framework', 0, 3, 3, '')],
  [('Multi-domain view:', 'two heatmaps compare all business units and functions on one scale.'), ('Agents & correlation:', '5 simulated agents feed a correlation engine; humans approve decisions.'), ('Golden thread:', 'one cross-team scenario plays live on the simulation clock.'), ('Programmes:', 'status by business unit and the not-on-track list.')],
  ['Balanced Scorecard', 'Cynefin', 'RAPID', 'OODA loop'], 'Named decider on every decision 30% → 100% (RAPID); average open-decision age 19 → 6.4 days, target 3.'),
 ('Suman', 'AI Transformation', 'From pilots to measurable value, for any organisation', 'Identify ROI; transform any organisation to AI',
  'AI pilots everywhere, few in production; ROI guessed after the money is spent.',
  'A governed AI portfolio where every use case has ROI identified before investment and pilots are promoted through gates.',
  [('Pilot-to-production conversion', 18, 41, 60, '%'), ('Average AI payback', 30, 24, 18, ' mo'), ('Live use cases past the chasm', 18, 63, 75, '%')],
  [('Readiness:', 'AI maturity radar per business unit.'), ('Portfolio & gates:', '38 AI use cases, funnel, value versus feasibility, gate review with promote.'), ('ROI & benefits:', 'NPV, payback and Monte Carlo P10 to P90 range.'), ('Onboard any organisation:', '6 industry templates generate a plan and a Business Model Canvas.')],
  ['Three Horizons', 'Diffusion of Innovations', 'Crossing the Chasm', 'Business Model Canvas', 'Stage-Gate', 'Value vs Effort'], 'Three Horizons mix H1 38% / H2 40% / H3 22% versus a 70 / 20 / 10 guide shows "pilot purgatory": too little in live use cases.'),
 ('Vaibhav', 'Regulatory & AI Governance', 'Compliance at the speed of change; trustworthy AI and data', 'Automate regulatory compliance (Banking); DPDP and AI governance',
  'Regulatory circulars mapped by hand over weeks; AI models and personal data not consistently governed.',
  'Circular to obligation to control to evidence in days, every model registered and monitored, DPDP ready.',
  [('Breach reports on time', 50, 80, 100, '%'), ('Risks covered by all three lines', 20, 61, 100, '%')],
  [('Regulatory change:', 'a live circular arrives, obligations are mapped to controls and approved.'), ('AI model register:', 'PSI drift monitoring; the fraud model at PSI 0.37 is restricted.'), ('Data governance & DPDP:', 'consent coverage, lineage and a live breach clock.'), ('Audit readiness:', 'evidence per control for internal audit and the regulator.')],
  ['Three Lines Model', 'Risk process', 'Risk heat map', 'NIST AI RMF (spirit)'], 'Three Lines applied to 33 high and critical risks: first line owns, second oversees, third assures.'),
 ('Santhosh', 'Technology Spend & Investment', 'Every rupee traceable to a service and a value', 'Governance system for investment; CAPEX and OPEX',
  'Technology spend in cost pools nobody can trace; cloud waste; investments approved without benefit tracking.',
  'Spend allocated to services, cloud under FinOps control, and every investment value-tracked after go-live.',
  [('Spend allocated to services (TBM)', 40, 72, 95, '%'), ('Cloud waste (idle / unused)', 28, 17, 8, '%'), ('Investments value-tracked', 15, 58, 100, '%')],
  [('CAPEX / OPEX & TBM:', 'a Sankey from cost pools to towers to services.'), ('Budget & forecast:', 'Holt-Winters forecast and EWMA anomalies, for example the festive cloud spike.'), ('FinOps & licences:', 'rightsizing and licence utilisation.'), ('Investment governance:', 'NPV, IRR, payback; security programmes judged on risk reduced.')],
  ['Run-Grow-Transform', 'TCO', 'Sensitivity (tornado)', 'NPV / IRR', 'TBM', 'FinOps'], 'Run-Grow-Transform gap from the 60 / 25 / 15 target mix reduced from 30 to 14.2 points; "Grow" is under-funded.'),
 ('Pankaj', 'ERP RCA & Capacity', 'Fix causes, not symptoms; capacity before the peak', 'ERP root-cause analysis; infrastructure capacity; production automation',
  'The same ERP incidents recur; capacity is added after the peak hurts; production steps rely on manual hand-offs.',
  'Root causes fixed permanently, capacity headroom ready before month-end and festive peaks, production steps automated.',
  [('Recurring ERP problems', 14, 8, 3, ''), ('Time to permanent fix', 45, 24, 10, ' days'), ('Minimum capacity headroom', 8, 17, 30, '%')],
  [('ERP RCA:', 'Pareto of incident causes and a 5 Whys chain to the root cause.'), ('Capacity & forecasting:', 'Holt-Winters forecast of utilisation against the limit.'), ('Peak scenarios:', 'festive slider; 0% extra capacity gives 1,546 ms, 25% brings latency within target.'), ('Production automation:', 'automated steps tracked with a Lewin change strip.')],
  ['Theory of Constraints', 'Pareto 80/20', '5 Whys', 'ITIL problem mgmt', 'SRE error budget', 'Lewin'], 'Theory of Constraints names the constraint per peak (for example month-end: IIoT ingestion CPU) and the next one after it.'),
]
for name, ws, tag, bp1, old, tgt, meas, built, fws, fwm in owners:
    c = OWN[name]
    body = f'''<div class="row" style="gap:22px">
<div style="width:390px"><div class="card" style="border-left:6px solid #94a3b8;margin-bottom:10px;padding:12px 16px"><div class="kick" style="color:#64748b">Old State</div><div style="font-size:14.5px;color:{INK2};line-height:1.45;margin-top:4px">{old}</div></div>
<div style="text-align:center;color:{c};font-size:22px;line-height:1;margin:-2px 0 6px">▼</div>
<div class="card" style="border-left:6px solid {c};padding:12px 16px;margin-bottom:14px"><div class="kick" style="color:{c}">Target State</div><div style="font-size:14.5px;color:{INK2};line-height:1.45;margin-top:4px">{tgt}</div></div>
{progress([(m[0], m[1], m[2], m[3], m[4], None) for m in meas], c)}</div>
<div class="col"><div class="card tint" style="margin-bottom:12px;padding:14px 18px"><h3>What We Built</h3>{ul(built, "p sm")}</div>
<div class="card" style="padding:14px 18px"><h3>Frameworks Applied With Metrics</h3><div>{"".join(f'<span class="chip g">{f}</span>' for f in fws)}</div><div style="font-size:13.5px;color:{INK2};margin-top:4px;line-height:1.45">{fwm}</div></div></div></div>'''
    S(f'04 · Live Demo · {name}', f'{name}: {ws}', body, f'<span class="tag" style="background:{c}">{tc(tag)}</span> &nbsp;<b>BP1:</b> {bp1}')

# ───────────────────────── 17 Golden thread ─────────────────────────
gt = [('Pankaj', '+15 s', 'Month-end batch overrun; capacity headroom below 10%', 'Datadog · ServiceNow'), ('Ram', '+40 s', 'Control tower correlates it with festive and salary-day peaks', 'Correlation engine'),
      ('Santhosh', '+65 s', 'Options costed: cloud burst vs hardware vs re-schedule', 'Cloud billing · Planview'), ('Suman', '+90 s', 'AI demand forecasting proposed to predict peaks', 'AI portfolio · MLOps'),
      ('Vaibhav', '+115 s', 'Governance check: data residency and model risk', 'Vanta · model register'), ('Ram', '+140 s', 'Decision approved; actions issued; headroom recovers', 'Decision Center')]
tl = '<svg width="1168" height="70" viewBox="0 0 1168 70"><line x1="90" y1="35" x2="1078" y2="35" stroke="#cbd5e1" stroke-width="4"/>' + ''.join(
    f'<circle cx="{90+i*197.6}" cy="35" r="26" fill="{OWN[o]}"/><text x="{90+i*197.6}" y="42" text-anchor="middle" font-size="20" font-weight="800" fill="#fff">{i+1}</text>' for i, (o, *_r) in enumerate(gt)) + '</svg>'
S('04 · Live Demo', 'The Golden Thread: One Connected Decision', tl + '<div style="display:grid;grid-template-columns:repeat(6,1fr);gap:10px;margin-top:8px">' + ''.join(
    f'<div class="card" style="padding:14px;height:245px;border-top:5px solid {OWN[o]}"><div style="display:flex;justify-content:space-between"><b style="color:{OWN[o]}">{o}</b><span class="muted" style="font-size:12px">{t}</span></div><div style="font-size:15.5px;color:{NAVY};font-weight:600;margin:10px 0;line-height:1.4">{d}</div><div style="font-size:12px;color:#64748b">Source: {s}</div></div>' for o, t, d, s in gt) +
  '</div><div class="row" style="margin-top:16px"><div class="col card tint" style="padding:12px 16px">' + ul([('Scenario: "Month-End Close Meets Festive Peak".', 'Every step cites real simulated records, so the audience can click through to the evidence.'), ('The point:', 'no single owner or tool could solve this alone; CTO360 connects five owners into one decision with a measured outcome.')], 'p sm') + '</div></div>',
  'Six steps play live on the simulation clock, from first signal to approved decision and recovered capacity.')

# ───────────────────────── 18 Frameworks ─────────────────────────
tiers = [('16', 'Frameworks applied with tracked metrics', 'Balanced Scorecard, Cynefin, RAPID, OODA, Three Horizons, Diffusion, Chasm, BMC, Three Lines, Run-Grow-Transform, TCO, Sensitivity, Theory of Constraints, Lewin, Kotter, ADKAR', NAVY, 560),
         ('15', 'Frameworks built into the screens earlier', 'Stage-Gate, Value vs Effort, NPV / IRR / ROI, maturity models, risk process and heat map, RACI, ITIL, 5 Whys, Pareto, SRE, TBM, FinOps, TEDIF', '#1f4f94', 720),
         ('10', 'Analytics techniques computed live', 'Holt-Winters, EWMA, Monte Carlo, NPV / IRR, S-curve, PSI drift, Pareto, queueing, error budget, glide path', BLUE, 880),
         ('69', 'Reference library cards', 'Every framework, technique and concept explained with a small diagram and the business question it answers', LIGHT, 1040)]
pyr = ''.join(f'<div style="width:{w}px;margin:0 auto 8px;background:{c};color:{"#fff" if c != LIGHT else NAVY};border-radius:12px;padding:10px 18px;display:flex;gap:16px;align-items:center"><div style="font-size:32px;font-weight:800;width:56px">{n}</div><div style="text-align:left"><div style="font-weight:800;font-size:16px">{t}</div><div style="font-size:12.5px;opacity:.9;line-height:1.35">{d}</div></div></div>' for n, t, d, c, w in tiers)
S('05 · Frameworks & Value', 'Frameworks Applied, Not Just Listed', pyr + '<div class="row" style="margin-top:14px"><div class="col card tint" style="padding:12px 16px">' + ul([
    ('Lean by design:', 'a framework is applied only where it serves an owner\'s business problem and produces a tracked metric; the rest stays in a reference library.'),
    ('Team level change:', 'Kotter 8 steps turn green as decisions are approved in the app; ADKAR adoption score 1.8 → 3.2 out of 5 (target 4).')], 'p sm') + '</div></div>',
  '"You do not need 100 frameworks." Choose the right one when a CEO, CFO or COO brings a problem, and measure it.')

# ───────────────────────── 19 Value ─────────────────────────
sc = [('Conservative', 1, '~2%', 'month 35', '#94a3b8'), ('Base', 48.7, '~104%', 'month 22', BLUE), ('Optimistic', 72.7, '~156%', 'month 18', NAVY)]
vb = '<svg width="520" height="340" viewBox="0 0 520 340"><line x1="40" y1="270" x2="510" y2="270" stroke="#cbd5e1"/>' + ''.join(
    f'<rect x="{70+i*150}" y="{270-max(v,1.5)*3.2}" width="100" height="{max(v,1.5)*3.2}" rx="6" fill="{c}"/><text x="{120+i*150}" y="{262-max(v,1.5)*3.2}" text-anchor="middle" font-size="17" font-weight="800" fill="{NAVY}">₹{v} Cr</text><text x="{120+i*150}" y="292" text-anchor="middle" font-size="14" font-weight="700" fill="{NAVY}">{n}</text><text x="{120+i*150}" y="312" text-anchor="middle" font-size="12.5" fill="#64748b">ROI {r}</text><text x="{120+i*150}" y="330" text-anchor="middle" font-size="12.5" fill="#64748b">Payback {p}</text>'
    for i, (n, v, r, p, c) in enumerate(sc)) + '<text x="40" y="18" font-size="13" fill="#64748b">3-year net value (illustrative)</text></svg>'
S('05 · Frameworks & Value', 'Value Case: Commit to the Conservative Case', '<div class="row"><div style="width:540px">' + vb + '</div><div class="col">' + ul([
    ('Investment:', 'about ₹30.7 Cr to build over 2 years, plus 10 to 20% a year to run.'),
    ('Value ramp:', '15% of target value in year 1, 45% in year 2, 75% in year 3.'),
    ('We commit to the conservative case', 'and show the base case as the expectation; payback around month 22 in the base case.'),
    ('Risk avoidance is extra:', 'DPDP penalties for failed safeguards can reach about ₹250 Cr; one avoided incident can fund the programme.'),
    ('Operational gains already modelled:', 'regulatory mapping 21 → 4 days, manufacturing RCA 38 → 9 hours, CAPEX approval 45 → 21 days.')], 'p sm') + '</div></div>',
  'A realistic, defensible value case: modest commitment, credible upside, and risk avoidance on top.')

# ───────────────────────── 20 Differentiation ─────────────────────────
cmp_rows = [('Shows what is happening inside one function', 'Yes', 'Yes'), ('Connects signals across tools into one story', 'No', 'Yes'), ('Prioritised Top 10 decisions with owner and deadline', 'No', 'Yes'),
            ('Tracks decision to action to measured outcome', 'Partial', 'Yes'), ('One comparable view across business units', 'No', 'Yes'), ('Governed AI with named human decider and audit trail', 'Varies', 'Yes'), ('New industry added by configuration', 'No', 'Yes')]
mark = lambda v: f'<span style="font-weight:800;color:{"#16a34a" if v == "Yes" else "#d97706" if v in ("Partial", "Varies") else "#dc2626"}">{"✔ " if v == "Yes" else "◐ " if v in ("Partial", "Varies") else "✖ "}{v}</span>'
S('05 · Frameworks & Value', 'Why CTO360 Is Different', '<table class="t"><tr><th style="width:60%">Capability</th><th>Point tools (Planview, LeanIX, ServiceNow, Datadog, …)</th><th>CTO360</th></tr>' + ''.join(f'<tr><td><b>{a}</b></td><td>{mark(b)}</td><td>{mark(c)}</td></tr>' for a, b, c in cmp_rows) + '</table>' +
  '<div class="card tint" style="margin-top:16px;padding:12px 16px">' + ul([('We do not replace existing tools; we connect them.', 'CTO360 is the decision layer a CTO needs on top of the tools the enterprise already pays for.')], 'p sm') + '</div>',
  'Point tools are essential, but each answers its own question. CTO360 answers the CTO\'s question: what matters most, and what should we decide?')

# ───────────────────────── 21 Roadmap ─────────────────────────
rm = [('Today', 'Capstone build (v1.0, frozen)', ['Working simulation of 3 enterprises and 7 sources', '5 live owner workspaces with 30 measures', 'Decision Center, frameworks, reference library', 'Automated consistency checks on every build'], '#94a3b8'),
      ('6 to 12 Months', 'Phase 2 and pilot', ['Live AI call with RAG on 3 decisions', 'Real baselines from one business unit', 'Real tool exports replace simulated sources', 'Persistent audit trail and a governed pilot'], BLUE),
      ('2 to 3 Years', 'Scaled platform', ['Platform in 2 to 3 business units', '₹25 to 50 Cr a year if adoption holds', 'Compliance readiness (DPDP, EU AI Act)', 'New industries added by configuration'], NAVY)]
S('05 · Frameworks & Value', 'Roadmap: From Simulation to Production', chev([f'{a}|{b}' for a, b, *_ in rm], [r[3] for r in rm], h=80, fs=16) + '<div class="row" style="margin-top:18px">' + ''.join(
    f'<div class="col card" style="border-top:6px solid {c};height:270px"><h3>{a}</h3>{ul(p, "p sm")}</div>' for a, b, p, c in rm) + '</div><div class="note">Guardrail from TEDIF: no production AI before day 90; every phase passes a human-approved gate.</div>',
  'The blueprint is ready. The next step is real data and live AI, under the same governance.')

# ───────────────────────── 22 Close ─────────────────────────
CLOSE = f'''<div style="position:absolute;inset:0;background:linear-gradient(135deg,{NAVY} 0%,#173a6b 60%,{BLUE} 100%);color:#fff;padding:110px 90px">
<div style="font-size:15px;letter-spacing:.2em;font-weight:700;color:{LIGHT}">IN ONE LINE</div>
<div style="font-size:44px;font-weight:800;line-height:1.2;margin-top:18px;max-width:1000px">Five Owners. One Connected Decision. Measured Outcomes.</div>
<div style="font-size:30px;font-weight:700;color:{LIGHT};margin-top:18px">AI Recommends. Humans Decide.</div>
<div style="font-size:19px;color:#dbe7fb;margin-top:30px;max-width:980px;line-height:1.5">Enterprise tools tell leaders what is happening inside each function. CTO360 connects those signals to show the CTO what matters, where to intervene, what decision to make, and whether it worked.</div>
<div style="position:absolute;left:90px;bottom:80px;font-size:22px;font-weight:700">Thank you · Questions?</div>
<div style="position:absolute;right:90px;bottom:80px;font-size:18px;color:#dbe7fb">Live: cto360.vercel.app</div></div>'''
slides.append(('', '', '', CLOSE))

# ───────────────────────── Appendix ─────────────────────────
funcs = [('Technology', 'CTO / CIO'), ('Enterprise Architecture', 'CTO / CIO'), ('Engineering & R&D', 'CTO'), ('Data & AI', 'CDO / CAIO'), ('Cybersecurity', 'CISO'), ('Product & Innovation', 'CPO / CTO'),
         ('Corporate Strategy', 'CEO / CSO'), ('Finance', 'CFO'), ('Operations', 'COO'), ('Sales', 'CRO'), ('Marketing', 'CMO'), ('Customer Experience & Service', 'CXO / COO'),
         ('Human Resources', 'CHRO'), ('Risk & Compliance', 'CRO'), ('Legal', 'CLO'), ('Procurement & Vendor Management', 'CPO / COO')]
S('Appendix A1', 'The 16 Enterprise Functions', '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px">' + ''.join(
    f'<div class="card {"tint" if i < 6 else ""}" style="padding:12px 14px;height:78px"><b style="color:{NAVY};font-size:14.5px">{f}</b><div style="font-size:12.5px;color:#64748b">Owner: {o}</div></div>' for i, (f, o) in enumerate(funcs)) +
  '</div><div class="note">Shaded: 6 technology functions owned by the CTO organisation. Unshaded: 10 business functions where technology shows up as a signal. Each function has 6 metrics: strategy, performance, cost, technology, risk and transformation.</div>',
  'Every function is scored the same way in every business unit, which makes the heatmap comparable.')
src = [('Planview', 'Strategy & Portfolio', 'Are investments aligned to strategy and on track?'), ('SAP LeanIX', 'Enterprise Architecture', 'Is the application estate fit for the future?'),
       ('Celonis + SAP Signavio', 'Process Intelligence', 'Where does the process lose time or money?'), ('ServiceNow SPM', 'Portfolio & Workflow', 'Is demand flowing through to delivery?'),
       ('Jellyfish', 'Engineering Intelligence', 'Is engineering capacity on the right work?'), ('Datadog', 'Operations & Observability', 'Are critical services healthy and fast?'),
       ('Vanta', 'Security, Risk & Governance', 'Are controls effective and risks within appetite?')]
S('Appendix A2', 'The 7 Source Systems and the Question Each Answers', '<table class="t"><tr><th>Simulated source</th><th>Area</th><th>The question it answers</th></tr>' + ''.join(f'<tr><td><b>{a}</b></td><td>{b}</td><td>{c}</td></tr>' for a, b, c in src) + '</table><div class="note">Product names are used only to describe tool categories. CTO360 is an independent demonstration on synthetic data and is not affiliated with or endorsed by these vendors.</div>',
  'Each source is simulated with realistic records and linked to the others through shared record IDs.')
qa = [('Is this real data?', 'No. It is a seeded, realistic simulation; every score is calculated and cross-checked automatically. Real tool exports are the next step.'),
      ('Why not just buy Planview or ServiceNow?', 'We do not replace them, we connect them. None correlates across tools into a prioritised decision with an owner and a measured outcome.'),
      ('Where is the AI?', 'Simulated agents, correlation and recommendations today (rule-based and labelled). Next: a live LLM call with RAG on 3 decisions.'),
      ('How do you stop AI from making bad decisions?', 'AI only recommends. A named decider approves at a gate (RAPID), models are monitored for drift (PSI), and the Three Lines Model provides oversight.'),
      ('How does it work for a new industry?', 'Configuration, not rebuild. Retail was added by configuration only; the Onboard wizard creates a plan for any industry.'),
      ('What does it cost and when does it pay back?', 'About ₹30.7 Cr build; base payback around month 22; we commit to the conservative case and treat risk avoidance as upside.')]
S('Appendix A3', 'Anticipated Questions', '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px">' + ''.join(f'<div class="card" style="padding:14px 18px;height:148px"><b style="color:{NAVY};font-size:16.5px">{q}</b><div style="font-size:15px;color:{INK2};margin-top:5px;line-height:1.45">{a}</div></div>' for q, a in qa) + '</div>',
  'Short, honest answers to the questions we expect from the panel.')
S('Appendix A4', 'Disclaimer', '<div class="card tint" style="line-height:1.6;color:#1e293b;padding:28px 32px"><style>.dz li{font-size:18px!important;margin-bottom:14px!important}</style><div class="dz">' + ul([
    'CTO360 is an independent capstone demonstration built entirely on <b>synthetic, simulated data</b>.',
    'All organisations (Meridian Bank, Arvant Industries, Orbit Retail), people, figures and events are illustrative.',
    'Third-party product names are referenced solely to describe tool categories and conceptual integration scenarios. CTO360 is <b>not affiliated with or endorsed by</b> the referenced vendors.',
    'Financial figures, ROI and payback are modelled estimates for discussion, not forecasts or advice.',
    'Framework applications are simplified for teaching purposes; they are not certifications or audits.']) + '</div></div>',
  'Full disclaimer: cto360.vercel.app/about')

# ───────────────────────── Render ─────────────────────────
total = len(slides)
out = [f'<!doctype html><html><head><meta charset="utf-8"><title>CTO360 Capstone Presentation</title><style>{CSS}</style></head><body>']
for i, (kick, title, lead, body) in enumerate(slides, 1):
    if not title:
        out.append(f'<section class="s" style="padding:0">{body}</section>')
    else:
        out.append(f'<section class="s"><div class="bar"></div><div class="kick">{kick}</div><h1>{title}</h1>' + (f'<div class="lead">{lead}</div>' if lead else '') + body + foot(i, total) + '</section>')
out.append('</body></html>')
doc = '\n'.join(out)
assert '—' not in doc and '–' not in doc, 'dash found'
open(os.path.join(os.path.dirname(__file__), 'deck.html'), 'w').write(doc)
print(total, 'slides')
