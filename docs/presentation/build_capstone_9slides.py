#!/usr/bin/env python3
"""Nine-slide capstone deck: title, introduction, problem, methodology (2), results, recommendations, conclusion, thank you.
Priority-led storyline (5 high priorities, 10 priority problems, 16 departments, KPI-first methodology).
No simulation metrics and no money: results are old state -> target state percentages only. Based on the slide (Introduction, Problem Statement, Methodology, Results,
Recommendations, Conclusion). Reuses the design system and helpers of build_capstone_pptx.py.

  python3 docs/presentation/build_capstone_6slides.py
Output: /Users/ram/Downloads/CTO CApstone/Capstone_9_Slides.pptx
"""
from pathlib import Path

SRC = Path(__file__).with_name('build_capstone_pptx.py').read_text()
exec(SRC.split('# ══════════════════════════ 1. COVER')[0])   # helpers, tokens, data, team, presentation object

OUT6 = Path('/Users/ram/Downloads/CTO CApstone/Capstone_9_Slides.pptx')
RELABEL = {'Spend & value': 'Value Delivery', 'Security & risk': 'Security & Risk'}
for _l in D['layers']: _l['label'] = RELABEL.get(_l['label'], _l['label'])
for _m in D['matrix']: _m['label'] = RELABEL.get(_m['label'], _m['label'])

def rail(s, active, dark=False):
    """Six-phase tracker shown on every slide."""
    for k, p in enumerate(PHASES):
        on = k + 1 == active
        fill = BLUE if on else (NAVY2 if dark else 'eef3fa')
        b = box(s, Inches(0.6) + Inches(2.03) * k, Inches(0.22), Inches(1.93), Inches(0.34), fill=fill, line=None if on else ('2b4f86' if dark else 'dbe3ee'), radius=0.5)
        fill_text(b, f'{k + 1} · {p}', size=10, bold=on, color='ffffff' if on else ('9fb6d8' if dark else INK3))

def head(s, phase, title, lead, who=None):
    box(s, 0, 0, W, H, fill=BG)
    rail(s, phase)
    text(s, Inches(0.6), Inches(0.68), Inches(12.1), Inches(0.6), title, size=28, bold=True, color=NAVY)
    text(s, Inches(0.6), Inches(1.26), Inches(12.1), Inches(0.45), lead, size=14, color=INK2)
    box(s, Inches(0.6), Inches(7.05), Inches(12.13), Emu(9000), fill=LINE)
    text(s, Inches(0.6), Inches(7.1), Inches(9), Inches(0.25), 'Domain-Agnostic Enterprise AI Transformation Framework · CTO Capstone 2026 · live: cto360.vercel.app', size=9, color=GREY)
    text(s, Inches(11.7), Inches(7.1), Inches(1.03), Inches(0.25), f'{len(prs.slides)} / 9', size=9, color=GREY, align=PP_ALIGN.RIGHT)

def new():
    return prs.slides.add_slide(BLANK)

# ═══════════════════ SLIDE 1 · TITLE AND TEAM ═══════════════════
s = new()
box(s, 0, 0, W, H, fill=NAVY)
g = s.shapes.add_shape(MSO_SHAPE.OVAL, Inches(8.6), Inches(-2.8), Inches(8.2), Inches(8.2)); g.fill.solid(); g.fill.fore_color.rgb = rgb(NAVY2); g.line.fill.background()
for r_, c_ in ((5.6, '2b4f86'), (3.8, '3a64a5')):
    o = s.shapes.add_shape(MSO_SHAPE.OVAL, Inches(11.4 - r_ / 2), Inches(1.2 - r_ / 2), Inches(r_), Inches(r_)); o.fill.background(); o.line.color.rgb = rgb(c_); o.line.width = Pt(1.25)
core = s.shapes.add_shape(MSO_SHAPE.OVAL, Inches(10.7), Inches(0.5), Inches(1.45), Inches(1.45)); core.fill.solid(); core.fill.fore_color.rgb = rgb(BLUE); core.line.fill.background()
fill_text(core, ['AI recommends', 'Humans decide'], size=10, bold=True)
text(s, Inches(0.7), Inches(0.6), Inches(8), Inches(0.35), 'CTO CAPSTONE PROJECT · 2026', size=13, bold=True, color='86b6ef')
text(s, Inches(0.7), Inches(1.1), Inches(9.2), Inches(1.9), ['Domain-Agnostic Enterprise', 'AI Transformation Framework'], size=46, bold=True, color='ffffff', spacing=0.95)
text(s, Inches(0.72), Inches(2.95), Inches(9), Inches(0.45), 'Implemented as CTO360 · Technology Control Plane', size=20, color='86b6ef')
text(s, Inches(0.72), Inches(3.45), Inches(8.6), Inches(0.5), 'One framework. Any industry. Measured outcomes.', size=15, color='c7d8f5')
text(s, Inches(0.72), Inches(4.05), Inches(6), Inches(0.3), 'PRESENTED BY', size=11, bold=True, color='86b6ef')
for k, (key, name, *_ ) in enumerate(TEAM):
    x = Inches(0.72) + Inches(4.05) * k
    box(s, x, Inches(4.4), Inches(3.85), Inches(2.35), fill='15315c', line='2b4f86', radius=0.08)
    photo(s, key, x + (Inches(3.85) - Inches(1.45)) / 2, Inches(4.62), Inches(1.45))
    text(s, x, Inches(6.18), Inches(3.85), Inches(0.45), name, size=19, bold=True, color='ffffff', align=PP_ALIGN.CENTER)
text(s, Inches(0.72), Inches(6.95), Inches(9), Inches(0.3), 'Live demonstration: cto360.vercel.app', size=11, color='9fb6d8')

# ── Board style system: one palette, one font (Calibri), fixed type scale ──
ACC, PRI, SOFT, PANEL = BLUE, NAVY, LIGHT, TINT           # accent, primary, soft accent, panel fill
T_H2, T_H3, T_BODY, T_LABEL, T_TABLE_H, T_TABLE, T_NOTE = 15, 12, 11, 10, 11, 10.5, 9

def label(s, x, y, w, t):
    """Section label: one size, one colour, everywhere."""
    text(s, x, y, w, Inches(0.28), t, size=T_LABEL, bold=True, color=ACC)

def table(s, x, y, colw, rows, row_h=0.36):
    t = s.shapes.add_table(len(rows), len(colw), x, y, Inches(sum(colw)), Inches(row_h * len(rows))).table
    for j, w_ in enumerate(colw): t.columns[j].width = Inches(w_)
    for i, row in enumerate(rows):
        t.rows[i].height = Inches(row_h)
        for j, v in enumerate(row):
            c = t.cell(i, j); c.margin_left = c.margin_right = Inches(0.1); c.margin_top = c.margin_bottom = Inches(0.03)
            c.vertical_anchor = MSO_ANCHOR.MIDDLE; c.fill.solid()
            c.fill.fore_color.rgb = rgb(PRI if i == 0 else (PANEL if i % 2 == 0 else 'ffffff'))
            tf = c.text_frame; tf.word_wrap = True; r = tf.paragraphs[0].add_run(); r.text = v; r.font.name = FONT
            r.font.size = Pt(T_TABLE_H if i == 0 else T_TABLE); r.font.bold = i == 0 or j == 0
            r.font.color.rgb = rgb('ffffff' if i == 0 else (PRI if j == 0 else INK2))
    return t

def dot(s, x, y, d, t, fill=ACC, size=10):
    n = s.shapes.add_shape(MSO_SHAPE.OVAL, x, y, d, d); n.fill.solid(); n.fill.fore_color.rgb = rgb(fill); n.line.fill.background(); fill_text(n, t, size=size, bold=True)

def panel(s, x, y, w, h, title=None, accent=True):
    """White card with a thin accent rule on top and an optional H2 title."""
    card(s, x, y, w, h, top=ACC if accent else None)
    if title: text(s, x + Inches(0.2), y + Inches(0.2), w - Inches(0.4), Inches(0.35), title, size=T_H2, bold=True, color=PRI)

PRIOS = [('Growth', 'How is technology driving growth and competitive advantage?'),
         ('Return', 'What measurable return do we get from technology and AI?'),
         ('Risk', 'How well protected are we against cyber, regulatory and AI risks, and how fast can we recover?'),
         ('AI Transformation', 'Which processes has AI transformed, and what has it delivered?'),
         ('Readiness', 'Do we have the capabilities and people for the next disruption?')]

# ═══════════════════ SLIDE 2 · INTRODUCTION ═══════════════════
s = new()
head(s, 1, 'Introduction: Why Enterprises Need A New Way To Steer AI', 'Technology must show what it delivers on the highest priorities. Today that evidence is scattered across departments.')
ctx = [('AI investment is rising fast', 'but its impact on top priorities is not visible'), ('Regulation is tightening', 'RBI guidance, DPDP Act 2023 and AI governance standards'),
       ('Technology is ageing', 'while new AI demands modern, supported platforms'), ('Departments work in silos', 'each with its own tools, reports and definitions')]
for k, (h_, d_) in enumerate(ctx):
    x = Inches(0.6) + Inches(3.7) * (k % 2); y = Inches(1.9) + Inches(1.2) * (k // 2)
    card(s, x, y, Inches(3.55), Inches(1.08)); box(s, x, y, Inches(0.07), Inches(1.08), fill=ACC)
    text(s, x + Inches(0.25), y + Inches(0.16), Inches(3.2), Inches(0.32), h_, size=T_H3, bold=True, color=PRI)
    text(s, x + Inches(0.25), y + Inches(0.5), Inches(3.2), Inches(0.5), d_, size=T_BODY, color=INK2)
box(s, Inches(0.6), Inches(4.35), Inches(7.25), Inches(1.25), fill=PRI, radius=0.06)
text(s, Inches(0.85), Inches(4.47), Inches(6.8), Inches(0.28), 'OUR OBJECTIVE', size=T_LABEL, bold=True, color=SOFT)
text(s, Inches(0.85), Inches(4.77), Inches(6.8), Inches(0.8), 'Build one domain-agnostic framework that turns every department\'s work into evidence-based answers on five high priorities, in any industry.', size=14, bold=True, color='ffffff')
label(s, Inches(0.6), Inches(5.75), Inches(7.25), 'SCOPE OF THE FRAMEWORK')
for k, (n_, l_) in enumerate([('5', 'high priorities'), ('10', 'priority problems'), ('16', 'departments'), ('2 + Any', 'industries')]):
    x = Inches(0.6) + Inches(1.84) * k
    box(s, x, Inches(6.05), Inches(1.74), Inches(0.85), fill=PANEL, radius=0.08)
    text(s, x, Inches(6.08), Inches(1.74), Inches(0.45), n_, size=22, bold=True, color=PRI, align=PP_ALIGN.CENTER)
    text(s, x, Inches(6.52), Inches(1.74), Inches(0.3), l_, size=T_BODY, color=INK2, align=PP_ALIGN.CENTER)
panel(s, Inches(8.1), Inches(1.9), Inches(4.63), Inches(5.0), title='Five High Priorities')
for k, (h_, q_) in enumerate(PRIOS):
    y = Inches(2.5) + Inches(0.86) * k
    dot(s, Inches(8.3), y + Inches(0.03), Inches(0.38), str(k + 1))
    text(s, Inches(8.85), y, Inches(3.75), Inches(0.3), h_, size=T_H3, bold=True, color=PRI)
    text(s, Inches(8.85), y + Inches(0.28), Inches(3.75), Inches(0.52), q_, size=10, color=INK2)

# ═══════════════════ SLIDE 3 · PROBLEM STATEMENT ═══════════════════
s = new()
head(s, 2, 'Problem Statement: High Priorities, No Shared Evidence', 'The answers depend on ten priority problems, spread across sixteen departments with no common KPIs and no shared visibility.')
panel(s, Inches(0.6), Inches(1.9), Inches(4.75), Inches(4.15), title='Five High Priorities')
for k, (h_, q_) in enumerate(PRIOS):
    y = Inches(2.48) + Inches(0.71) * k
    dot(s, Inches(0.8), y + Inches(0.03), Inches(0.34), str(k + 1))
    text(s, Inches(1.28), y, Inches(3.95), Inches(0.68), [[(h_ + ': ', True, PRI), (q_, False, INK2)]], size=10.5)
for k, (tag, fill_, items) in enumerate([('Banking', PRI, ['Fraud and money laundering', 'Legacy core banking', 'Credit risk and loan defaults', 'Customer experience and personalisation', 'Regulatory compliance and data governance']),
                                          ('Manufacturing', ACC, ['Unplanned equipment downtime', 'Quality defects and rework', 'Supply chain disruptions', 'Engineering design inefficiency', 'Production planning and low OEE'])]):
    x = Inches(5.5) + Inches(3.65) * k
    card(s, x, Inches(1.9), Inches(3.53), Inches(2.7))
    hb = box(s, x, Inches(1.9), Inches(3.53), Inches(0.42), fill=fill_, radius=0.08); fill_text(hb, tag + ' · Top 5 Problems', size=T_H3, bold=True)
    for j, it in enumerate(items):
        y = Inches(2.45) + Inches(0.42) * j
        dot(s, x + Inches(0.18), y + Inches(0.05), Inches(0.26), str(j + 1), fill=fill_, size=9)
        text(s, x + Inches(0.55), y, Inches(2.9), Inches(0.36), it, size=T_BODY, color=INK, anchor=MSO_ANCHOR.MIDDLE)
label(s, Inches(5.5), Inches(4.72), Inches(7), 'ROOT CAUSE, THE SAME IN BOTH INDUSTRIES')
for k, (h_, d_) in enumerate([('Scattered work', 'across 16 departments and separate tools'), ('No common KPIs', 'linking department work to high priorities'),
                              ('No transparency', 'across departments or up the hierarchy'), ('Opinion, not evidence', 'progress reported without proof')]):
    x = Inches(5.5) + Inches(3.65) * (k % 2); y = Inches(5.02) + Inches(0.52) * (k // 2)
    box(s, x, y, Inches(3.53), Inches(0.45), fill=PANEL, line=LINE, radius=0.15)
    text(s, x + Inches(0.15), y, Inches(3.3), Inches(0.45), [[(h_ + ': ', True, PRI), (d_, False, INK2)]], size=10, anchor=MSO_ANCHOR.MIDDLE)
box(s, Inches(0.6), Inches(6.17), Inches(12.13), Inches(0.8), fill=PRI, radius=0.08)
text(s, Inches(0.8), Inches(6.2), Inches(7.3), Inches(0.75), [[('Problem: ', True, SOFT), ('enterprises are solving their top priority problems with AI, but with work spread across 16 departments, no common KPIs and no shared visibility, progress on high priorities cannot be shown with evidence.', False, 'ffffff')]], size=10.5, anchor=MSO_ANCHOR.MIDDLE)
box(s, Inches(8.25), Inches(6.3), Emu(12000), Inches(0.55), fill=NAVY2)
text(s, Inches(8.4), Inches(6.2), Inches(4.2), Inches(0.75), [[('Research question: ', True, SOFT), ('can one domain-agnostic framework, built on proven tools, techniques and processes, deliver evidence-based answers on high priorities in any industry?', False, 'ffffff')]], size=10.5, anchor=MSO_ANCHOR.MIDDLE)

# ═══════════════════ SLIDE 4 · METHODOLOGY I: THE KPI-FIRST PROCESS ═══════════════════
s = new()
head(s, 3, 'Methodology I: The KPI-First Process', 'Design Science Research: we start from the high priority and work backwards to only the data and AI that move each KPI.')
label(s, Inches(0.6), Inches(1.82), Inches(6), 'THE GOLDEN THREAD')
chevrons(s, ['High|Priority', 'Priority|Problem', 'Department|Owner', 'KPI Driver|Tree', 'Minimum|Data', 'Simplest|AI Model', 'Shadow|Run', 'Human|Decision', 'Priority|Scorecard'],
         Inches(0.6), Inches(2.1), Inches(12.0), Inches(0.66), colors=[PRI, NAVY2, '1d4ed8', ACC, ACC, ACC, '1d4ed8', NAVY2, PRI], size=9.5)
table(s, Inches(0.6), Inches(2.98), [1.6, 4.7, 2.15], [
    ['Step', 'What Happens', 'Technique'],
    ['1. Prioritise', 'Rank the 5 problems by impact × feasibility; one pilot per industry', 'Value × feasibility matrix'],
    ['2. Driver tree', 'One outcome KPI and 3 to 4 driver KPIs, each with a department owner', 'Balanced Scorecard, OKRs'],
    ['3. Minimum data', 'Only the data that moves each driver: numbers, text, images, audio, video', 'Data audit, privacy by design'],
    ['4. Simplest model', 'Rules first, then machine learning, then deep learning only if needed', 'CRISP-DM'],
    ['5. Shadow run', 'AI recommends while people decide as before; live above 80% agreement', 'TEDIF shadow run'],
    ['6. Share', 'Team, department, cross-department and leadership views by role', 'RBAC, data classification'],
    ['7. Prove and scale', 'Compare with a unit without AI; scale to the next problem and industry', 'Before and after, comparison group'],
], row_h=0.47)
label(s, Inches(9.25), Inches(2.98), Inches(3.5), 'PILOT DRIVER TREES')
for k, (tag, outcome, drivers) in enumerate([('Banking · Fraud', 'Fraud losses', ['False-positive alerts', 'Detection speed', 'Model drift']),
                                              ('Manufacturing · Downtime', 'Unplanned downtime', ['Early failure warnings', 'Maintenance on time', 'Repeat faults'])]):
    y = Inches(3.3) + Inches(1.82) * k
    card(s, Inches(9.25), y, Inches(3.48), Inches(1.68))
    text(s, Inches(9.42), y + Inches(0.12), Inches(3.2), Inches(0.3), tag, size=T_H3, bold=True, color=PRI)
    ob = box(s, Inches(9.42), y + Inches(0.46), Inches(3.14), Inches(0.36), fill=PRI, radius=0.2); fill_text(ob, 'Outcome: ' + outcome, size=10.5, bold=True)
    for j, d_ in enumerate(drivers):
        b = box(s, Inches(9.42) + Inches(1.06) * j, y + Inches(0.96), Inches(1.0), Inches(0.58), fill=PANEL, line=LINE, radius=0.12); fill_text(b, d_, size=9, color=PRI)

# ═══════════════════ SLIDE 5 · METHODOLOGY II: TOOLS, TECHNIQUES, GOVERNANCE ═══════════════════
s = new()
head(s, 3, 'Methodology II: Tools, Techniques And Governance For Each Priority', 'Each high priority is answered with proven enterprise tools and techniques, under one governance model.')
table(s, Inches(0.6), Inches(1.9), [2.0, 2.35, 3.5], [
    ['High Priority', 'Tools', 'Techniques'],
    ['1. Growth', 'Planview, Power BI', 'Balanced Scorecard, OKRs, Three Horizons'],
    ['2. Return', 'Apptio, FinOps tools', 'TBM, payback, stage-gate funding, benefits realisation'],
    ['3. Risk', 'ServiceNow GRC, Vanta, Splunk', 'NIST AI RMF, ISO 42001, three lines of defence, PSI drift'],
    ['4. AI Transformation', 'Celonis, Databricks, MLflow', 'Process mining, machine learning, NLP, computer vision'],
    ['5. Readiness', 'LeanIX, skills platforms', 'TIME model, AI maturity model, ADKAR'],
], row_h=0.52)
label(s, Inches(0.6), Inches(5.17), Inches(7.85), 'AI TECHNIQUE FOR EACH DATA TYPE')
for k, (d_, t_, e_) in enumerate([('Numbers', 'Anomaly detection, forecasting', 'Fraud patterns, machine failure'), ('Text And Transcripts', 'NLP: extraction, summarising', 'Regulatory circulars, meeting actions'),
                                  ('Images And Video', 'Computer vision', 'Defect inspection, KYC documents'), ('Audio', 'Speech models', 'Call centre themes, machine sounds')]):
    x = Inches(0.6) + Inches(1.98) * k
    card(s, x, Inches(5.45), Inches(1.88), Inches(1.45), top=ACC)
    text(s, x + Inches(0.14), Inches(5.6), Inches(1.65), Inches(0.3), d_, size=T_H3, bold=True, color=PRI)
    text(s, x + Inches(0.14), Inches(5.9), Inches(1.65), Inches(0.45), t_, size=10, bold=True, color=ACC)
    text(s, x + Inches(0.14), Inches(6.33), Inches(1.65), Inches(0.5), e_, size=10, color=INK2)
box(s, Inches(8.65), Inches(1.9), Inches(4.08), Inches(5.0), fill=PRI, radius=0.05)
text(s, Inches(8.92), Inches(2.1), Inches(3.6), Inches(0.28), 'GOVERNANCE · TEDIF', size=T_LABEL, bold=True, color=SOFT)
text(s, Inches(8.92), Inches(2.45), Inches(3.6), Inches(1.0), ['AI Recommends.', 'Humans Decide.'], size=26, bold=True, color='ffffff', spacing=0.95)
for k, g_ in enumerate(['A named owner approves at every gate', 'An audit trail records every step', 'Role-based access controls who sees what', 'Transparency within and across 16 departments', 'Consent and data masking for DPDP']):
    y = Inches(3.7) + Inches(0.6) * k
    dot(s, Inches(8.92), y + Inches(0.02), Inches(0.28), '✓', size=10)
    text(s, Inches(9.32), y, Inches(3.25), Inches(0.5), g_, size=T_BODY, color='dbe7fb')

# ═══════════════════ SLIDE 6 · RESULTS ═══════════════════
s = new()
head(s, 4, 'Results: From Old State To Target State', 'What the framework changes for each high priority, shown as the move from old state to target state.')
label(s, Inches(0.6), Inches(1.82), Inches(5), 'PRIORITY SCORECARD · OLD STATE → TARGET STATE')
rows = [('1. Growth', 'AI initiatives linked to a strategic KPI', 20, 100, None), ('2. Return', 'Investments with baseline and value tracking', 15, 100, None),
        ('3. Risk', 'AI models approved before go-live', 30, 100, None), ('4. AI Transformation', 'AI pilots reaching production', 20, 60, None),
        ('4. AI Transformation', 'Decision cycle time (share of old time)', 100, 15, '85% faster'), ('5. Readiness', 'Technology within vendor support', 40, 90, None),
        ('All priorities', 'Departments with shared KPI visibility (of 16)', 0, 100, None)]
TX, TW = Inches(4.0), Inches(3.3)
text(s, TX, Inches(1.84), TW, Inches(0.25), [[('■ ', True, GREY), ('Old state     ', False, INK2), ('■ ', True, ACC), ('Target state', False, INK2)]], size=10)
for k, (q_, m_, o_, t_, note) in enumerate(rows):
    y = Inches(2.22) + Inches(0.6) * k
    if k % 2 == 0: box(s, Inches(0.6), y - Inches(0.04), Inches(7.95), Inches(0.58), fill=PANEL, radius=0.06)
    text(s, Inches(0.72), y, Inches(3.2), Inches(0.25), q_, size=10, bold=True, color=ACC)
    text(s, Inches(0.72), y + Inches(0.23), Inches(3.25), Inches(0.28), m_, size=T_BODY, color=INK)
    box(s, TX, y + Inches(0.06), TW, Inches(0.16), fill='e8eef7', radius=0.5)
    if o_: box(s, TX, y + Inches(0.06), int(TW * o_ / 100), Inches(0.16), fill=GREY, radius=0.5)
    box(s, TX, y + Inches(0.29), TW, Inches(0.16), fill='e8eef7', radius=0.5)
    box(s, TX, y + Inches(0.29), int(TW * t_ / 100), Inches(0.16), fill=ACC, radius=0.5)
    text(s, Inches(7.4), y + Inches(0.02), Inches(1.1), Inches(0.5), [[(f'{o_}% → ', False, INK3), (f'{t_}%', True, PRI)]] + ([[(note, True, ACC)]] if note else []), size=11 if not note else 10, align=PP_ALIGN.RIGHT, spacing=0.9)
text(s, Inches(0.6), Inches(6.5), Inches(8), Inches(0.3), 'Target state, to be validated through the Fraud and Downtime pilots. Old-state values are illustrative industry baselines.', size=T_NOTE, color=INK3)
panel(s, Inches(8.8), Inches(1.9), Inches(3.93), Inches(5.0), title='What The Framework Delivers')
for k, (h_, d_) in enumerate([('One priority scorecard', 'five high priorities shown with evidence'), ('16 departments', 'on common KPIs with role-based transparency'),
                              ('10 priority problems', 'each with an owner and a driver tree'), ('Domain-agnostic', 'the same process for banking and manufacturing'),
                              ('Live demonstration', 'CTO360 shows the framework in action')]):
    y = Inches(2.5) + Inches(0.86) * k
    dot(s, Inches(9.0), y + Inches(0.03), Inches(0.36), str(k + 1))
    text(s, Inches(9.5), y, Inches(3.1), Inches(0.3), h_, size=T_H3, bold=True, color=PRI)
    text(s, Inches(9.5), y + Inches(0.29), Inches(3.1), Inches(0.5), d_, size=10.5, color=INK2)

# ═══════════════════ SLIDE 7 · RECOMMENDATIONS ═══════════════════
s = new()
head(s, 5, 'Recommendations: Enterprise, Society And The Individual', 'What each audience should do, with a phased roadmap from pilot to scale.')
cols3 = [('For The Enterprise', PRI, [('Growth', 'Fund AI only when tied to a strategic KPI'), ('Return', 'No funding without a baseline and value tracking'), ('Risk', 'Register and approve every AI model; monitor drift'),
                                       ('AI Transformation', 'Two pilots, a shadow run, then scale'), ('Readiness', 'Retire unsupported technology; build AI skills')]),
         ('For Society', NAVY2, [('Humans decide', 'A named person at every AI gate'), ('Privacy by design', 'Minimum data under the DPDP Act'), ('Fair and explainable', 'Credit and service decisions people can trust'),
                                 ('Safer and reliable', 'Fewer breakdowns in plants and services'), ('Transparent', 'Role-based, verifiable reporting')]),
         ('For The Individual', ACC, [('Think KPI-first', 'Start from the outcome, not the tool'), ('Data literacy', 'Read and build a driver tree'), ('T-shaped skills', 'Domain plus data plus AI'),
                                      ('Own every decision', 'AI supports, you decide'), ('Communicate outcomes', 'Not activity or effort')])]
for k, (t_, fill_, items) in enumerate(cols3):
    x = Inches(0.6) + Inches(4.1) * k
    card(s, x, Inches(1.9), Inches(3.92), Inches(4.05))
    hb = box(s, x, Inches(1.9), Inches(3.92), Inches(0.5), fill=fill_, radius=0.08); fill_text(hb, t_, size=T_H2, bold=True)
    for j, (h_, d_) in enumerate(items):
        y = Inches(2.55) + Inches(0.67) * j
        dot(s, x + Inches(0.2), y + Inches(0.04), Inches(0.32), str(j + 1), fill=fill_)
        text(s, x + Inches(0.65), y, Inches(3.15), Inches(0.28), h_, size=T_H3, bold=True, color=PRI)
        text(s, x + Inches(0.65), y + Inches(0.27), Inches(3.15), Inches(0.32), d_, size=10.5, color=INK2)
label(s, Inches(0.6), Inches(6.08), Inches(1.0), 'ROADMAP')
chevrons(s, ['0 to 6 Months|2 pilots: Fraud and Downtime', '6 to 12 Months|Shadow run, then go-live', '12 to 24 Months|All 10 problems, 16 departments, new industries'],
         Inches(1.6), Inches(6.05), Inches(11.0), Inches(0.85), colors=[ACC, NAVY2, PRI], size=10.5)

# ═══════════════════ SLIDE 8 · CONCLUSION ═══════════════════
s = new()
head(s, 6, 'Conclusion: One Framework, Five Answers, Any Industry', 'Our answer to the problem, its limits, and what it delivers on each priority.')
for k, (h_, b_) in enumerate([('Problem', 'Five high priorities (growth, return, risk, AI transformation, readiness) lack shared evidence of progress.'),
                              ('Solution', 'A KPI-first, domain-agnostic framework with proven tools, techniques and TEDIF governance, across 16 departments.'),
                              ('Outcome', '16 departments on shared KPIs, every AI model governed, and AI moving from pilot to production under human control.')]):
    x = Inches(0.6) + Inches(4.1) * k
    panel(s, x, Inches(1.9), Inches(3.92), Inches(1.7), title=h_)
    text(s, x + Inches(0.2), Inches(2.5), Inches(3.55), Inches(1.05), b_, size=T_BODY, color=INK2)
card(s, Inches(0.6), Inches(3.8), Inches(3.92), Inches(1.75), fill=PANEL, line=PANEL)
text(s, Inches(0.8), Inches(3.98), Inches(3.5), Inches(0.35), 'Limitations', size=T_H2, bold=True, color=PRI)
bullets(s, Inches(0.8), Inches(4.42), Inches(3.55), ['Targets still to be validated in pilots', 'Live multimodal AI is the next phase', 'Two industries designed so far'], size=T_BODY, gap=0.0, h_each=Inches(0.34), dot=ACC)
text(s, Inches(4.7), Inches(3.8), Inches(8), Inches(0.35), 'What Each Priority Gets', size=T_H2, bold=True, color=PRI)
for k, ((h_, _), a_) in enumerate(zip(PRIOS, ['KPI-linked AI portfolio', 'Value-tracked investments', 'Registered, governed AI', 'Pilots reaching production', 'Supported tech, skilled people'])):
    x = Inches(4.7) + Inches(1.62) * k
    card(s, x, Inches(4.22), Inches(1.52), Inches(1.33), top=ACC)
    text(s, x + Inches(0.08), Inches(4.4), Inches(1.36), Inches(0.5), h_, size=T_H3, bold=True, color=PRI, align=PP_ALIGN.CENTER)
    text(s, x + Inches(0.08), Inches(4.9), Inches(1.36), Inches(0.6), a_, size=10, color=INK2, align=PP_ALIGN.CENTER)
box(s, Inches(0.6), Inches(5.75), Inches(12.13), Inches(1.15), fill=PRI, radius=0.08)
text(s, Inches(0.9), Inches(5.87), Inches(11.5), Inches(0.5), 'One framework. Any industry. Measured outcomes.', size=22, bold=True, color='ffffff')
text(s, Inches(0.9), Inches(6.37), Inches(11.5), Inches(0.45), 'AI Recommends. Humans Decide.', size=14, bold=True, color=SOFT)

# ═══════════════════ 9 · THANK YOU AND Q&A ═══════════════════
s = new()
box(s, 0, 0, W, H, fill=NAVY)
g = s.shapes.add_shape(MSO_SHAPE.OVAL, Inches(7.4), Inches(-2.4), Inches(8.6), Inches(8.6)); g.fill.solid(); g.fill.fore_color.rgb = rgb(NAVY2); g.line.fill.background()
for r_, c_ in ((5.8, '2b4f86'), (3.9, '3a64a5')):
    o = s.shapes.add_shape(MSO_SHAPE.OVAL, Inches(10.9 - r_ / 2), Inches(1.9 - r_ / 2), Inches(r_), Inches(r_)); o.fill.background(); o.line.color.rgb = rgb(c_); o.line.width = Pt(1.25)
text(s, Inches(0.9), Inches(1.5), Inches(9), Inches(1.3), 'Thank You', size=66, bold=True, color='ffffff')
text(s, Inches(0.92), Inches(2.85), Inches(9), Inches(0.9), 'Questions & Answers', size=34, bold=True, color='86b6ef')
box(s, Inches(0.95), Inches(4.0), Inches(1.4), Emu(30000), fill='86b6ef')
text(s, Inches(0.92), Inches(4.25), Inches(10), Inches(0.5), 'One framework. Any industry. Measured outcomes.', size=20, color='ffffff')
text(s, Inches(0.92), Inches(4.8), Inches(10), Inches(0.5), 'AI Recommends. Humans Decide.', size=18, bold=True, color='86b6ef')
lk = box(s, Inches(0.92), Inches(5.75), Inches(4.6), Inches(0.62), fill='15315c', line='2b4f86', radius=0.4)
fill_text(lk, 'Live demonstration: cto360.vercel.app', size=14, bold=True)
text(s, Inches(0.92), Inches(6.75), Inches(11), Inches(0.3), 'Domain-Agnostic Enterprise AI Transformation Framework · CTO Capstone 2026', size=10, color='9fb6d8')

# ═══════════════════ TITLE CASE PASS (applied to every slide before saving) ═══════════════════
import re as _re
KEEP = {'II', 'AI', 'TEDIF', 'RBI', 'EOL', 'OEE', 'MES', 'ERP', 'CVEs', 'PSI', 'DPDP', 'BNK', 'MFG', 'RTL', 'EA', 'IDs', 'TOGAF', 'ADM', 'TIME', 'ITIL', 'SRE', 'ADKAR', 'RAPID', 'CTO', 'CTO360', 'P1', 'Q&A', 'OODA', 'DR', 'IT', 'KPI', 'KPIs', 'UK', 'US', 'OKRs', 'TBM', 'GRC', 'NIST', 'RMF', 'ISO', 'NLP', 'RBAC', 'KYC', 'BI', 'CRISP', 'DM', 'CTOs'}
LOWER = {'vs', 'r'}
BRANDS = {'leanix': 'LeanIX', 'servicenow': 'ServiceNow', 'cto360': 'CTO360'}
def _word(w):
    core = _re.sub(r'^[^\w]+|[^\w]+$', '', w)
    if not core or '.app' in w or '://' in w: return w
    if any(ch.isdigit() for ch in core) or core in KEEP or core.lower() in LOWER: return w
    if core.lower() in BRANDS: return w.replace(core, BRANDS[core.lower()])
    parts = core.split('-')
    new = '-'.join(x if (x in KEEP or any(ch.isdigit() for ch in x)) else ((x[:1].upper() + (x[1:].lower() if x.isupper() and len(x) > 1 else x[1:])) if x else x) for x in parts)
    return w.replace(core, new)
def _title(t):
    ws = t.split(' '); out = []
    for k, w in enumerate(ws):
        prev = ws[k - 1] if k else ''
        if w.lower() in ('of', 'in', 'to') and any(ch.isdigit() for ch in prev): out.append(w.lower())   # keep "1 of 6", "+4 in 3"
        else: out.append(_word(w))
    return ' '.join(out)
def _para_ok(text_): return True   # Title Case on every paragraph, for consistency
def _tf(tf):
    for para in tf.paragraphs:
        full = ''.join(r.text for r in para.runs)
        if not full.strip() or not _para_ok(full): continue
        for r in para.runs: r.text = _title(r.text)
for _sl in prs.slides:
    for _sh in _sl.shapes:
        if _sh.has_text_frame: _tf(_sh.text_frame)
        if _sh.has_table:
            for _row in _sh.table.rows:
                for _c in _row.cells: _tf(_c.text_frame)
        if _sh.has_chart:
            _ch = _sh.chart
            if _ch.has_title: _tf(_ch.chart_title.text_frame)

prs.save(OUT6)
for f in ASSETS.glob('_photo_*.png'): f.unlink()
print(f'saved {OUT6} · {len(prs.slides)} slides')
