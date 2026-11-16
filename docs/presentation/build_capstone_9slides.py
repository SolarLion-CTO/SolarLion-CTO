#!/usr/bin/env python3
"""Nine-slide capstone deck: title, introduction, problem, methodology (2), results, recommendations, conclusion, thank you.
Board-led storyline (5 board questions, 10 priority problems, 16 departments, KPI-first methodology).
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
    text(s, Inches(0.6), Inches(0.72), Inches(12.1), Inches(0.6), title, size=26, bold=True, color=NAVY)
    text(s, Inches(0.6), Inches(1.24), Inches(12.1), Inches(0.45), lead, size=13, color=INK2)
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

def table(s, x, y, colw, rows, size=10, head_size=10.5, row_h=0.36, head_fill=NAVY, first_bold=True, zebra=True):
    """Native table: rows[0] is the header. Cells may be str or [(text, bold, color)] runs."""
    t = s.shapes.add_table(len(rows), len(colw), x, y, Inches(sum(colw)), Inches(row_h * len(rows))).table
    for j, w_ in enumerate(colw): t.columns[j].width = Inches(w_)
    for i, row in enumerate(rows):
        t.rows[i].height = Inches(row_h)
        for j, v in enumerate(row):
            c = t.cell(i, j); c.margin_left = c.margin_right = Inches(0.08); c.margin_top = c.margin_bottom = Inches(0.03)
            c.vertical_anchor = MSO_ANCHOR.MIDDLE; c.fill.solid()
            c.fill.fore_color.rgb = rgb(head_fill if i == 0 else (TINT if zebra and i % 2 == 0 else 'ffffff'))
            tf = c.text_frame; tf.word_wrap = True; p = tf.paragraphs[0]
            runs = v if isinstance(v, list) else [(v, i == 0 or (first_bold and j == 0), 'ffffff' if i == 0 else (NAVY if j == 0 else INK2))]
            for rt, rb, rc in runs:
                r = p.add_run(); r.text = rt; r.font.name = FONT; r.font.size = Pt(head_size if i == 0 else size); r.font.bold = rb; r.font.color.rgb = rgb(rc)
    return t

def dot(s, x, y, d, label, col, size=10):
    n = s.shapes.add_shape(MSO_SHAPE.OVAL, x, y, d, d); n.fill.solid(); n.fill.fore_color.rgb = rgb(col); n.line.fill.background(); fill_text(n, label, size=size, bold=True)

BOARD = [('Growth', 'How is technology driving growth and competitive advantage?', BLUE),
         ('Return', 'What measurable return do we get from technology and AI?', '0e9f6e'),
         ('Risk', 'How well protected are we against cyber, regulatory and AI risks, and how fast can we recover?', CRIT),
         ('AI Transformation', 'Which processes has AI transformed, and what has it delivered?', '7c3aed'),
         ('Readiness', 'Do we have the capabilities and people for the next disruption?', WARN)]

# ═══════════════════ SLIDE 2 · INTRODUCTION ═══════════════════
s = new()
head(s, 1, 'Introduction: Why Boards Need A New Way To Steer AI', 'Boards ask simple questions about technology. Today no CTO can answer them with evidence. That is the gap this framework closes.')
ctx = [('AI investment is rising fast', 'but boards cannot see what it delivers', BLUE),
       ('Regulation is tightening', 'RBI guidance, DPDP Act 2023 and AI governance standards', CRIT),
       ('Technology is ageing', 'while new AI demands modern, supported platforms', WARN),
       ('Departments work in silos', 'each with its own tools, reports and definitions', NAVY)]
for k, (h_, d_, col) in enumerate(ctx):
    x = Inches(0.6) + Inches(3.7) * (k % 2); y = Inches(1.85) + Inches(1.2) * (k // 2)
    card(s, x, y, Inches(3.55), Inches(1.08)); box(s, x, y, Inches(0.09), Inches(1.08), fill=col)
    text(s, x + Inches(0.25), y + Inches(0.14), Inches(3.2), Inches(0.35), h_, size=14, bold=True, color=NAVY)
    text(s, x + Inches(0.25), y + Inches(0.5), Inches(3.2), Inches(0.5), d_, size=11, color=INK2)
box(s, Inches(0.6), Inches(4.3), Inches(7.25), Inches(1.3), fill=NAVY, radius=0.08)
text(s, Inches(0.85), Inches(4.4), Inches(6.8), Inches(0.3), 'OUR OBJECTIVE', size=10, bold=True, color=LIGHT)
text(s, Inches(0.85), Inches(4.7), Inches(6.8), Inches(0.85), 'Build one domain-agnostic framework that turns every department\'s work into evidence-based answers to the board\'s five questions, in any industry.', size=14, bold=True, color='ffffff')
text(s, Inches(0.6), Inches(5.75), Inches(7.25), Inches(0.3), 'SCOPE OF THE FRAMEWORK', size=10, bold=True, color=INK3)
for k, (n_, l_) in enumerate([('5', 'board questions'), ('10', 'priority problems'), ('16', 'departments'), ('2 + Any', 'industries')]):
    x = Inches(0.6) + Inches(1.84) * k
    box(s, x, Inches(6.05), Inches(1.74), Inches(0.85), fill=TINT, radius=0.12)
    text(s, x, Inches(6.08), Inches(1.74), Inches(0.45), n_, size=22, bold=True, color=BLUE, align=PP_ALIGN.CENTER)
    text(s, x, Inches(6.52), Inches(1.74), Inches(0.3), l_, size=10, color=INK2, align=PP_ALIGN.CENTER)
card(s, Inches(8.1), Inches(1.85), Inches(4.63), Inches(5.05), title='The Five Questions Every Board Asks')
for k, (h_, q_, col) in enumerate(BOARD):
    y = Inches(2.45) + Inches(0.86) * k
    dot(s, Inches(8.3), y + Inches(0.04), Inches(0.42), str(k + 1), col, size=12)
    text(s, Inches(8.88), y, Inches(3.7), Inches(0.3), h_, size=13, bold=True, color=NAVY)
    text(s, Inches(8.88), y + Inches(0.3), Inches(3.7), Inches(0.5), q_, size=9.5, color=INK2)

# ═══════════════════ SLIDE 3 · PROBLEM STATEMENT ═══════════════════
s = new()
head(s, 2, 'Problem Statement: The Board Asks, The Enterprise Cannot Answer', 'The answers depend on ten priority problems, spread across sixteen departments with no common KPIs and no shared visibility.')
card(s, Inches(0.6), Inches(1.85), Inches(4.75), Inches(4.2), title='What The Board Asks')
for k, (h_, q_, col) in enumerate(BOARD):
    y = Inches(2.4) + Inches(0.72) * k
    dot(s, Inches(0.78), y + Inches(0.03), Inches(0.36), str(k + 1), col, size=11)
    text(s, Inches(1.27), y, Inches(3.95), Inches(0.7), [[(h_ + ': ', True, NAVY), (q_, False, INK2)]], size=10.5)
for k, (tag, col, items) in enumerate([('BANKING', '2a78d6', ['Fraud and money laundering', 'Legacy core banking', 'Credit risk and loan defaults', 'Customer experience and personalisation', 'Regulatory compliance and data governance']),
                                        ('MANUFACTURING', '1baf7a', ['Unplanned equipment downtime', 'Quality defects and rework', 'Supply chain disruptions', 'Engineering design inefficiency', 'Production planning and low OEE'])]):
    x = Inches(5.5) + Inches(3.65) * k
    card(s, x, Inches(1.85), Inches(3.53), Inches(2.75), top=col)
    t = box(s, x + Inches(0.18), Inches(2.08), Inches(1.75), Inches(0.32), fill=col, radius=0.4); fill_text(t, tag, size=10, bold=True)
    text(s, x + Inches(2.0), Inches(2.1), Inches(1.45), Inches(0.3), 'Top 5 Problems', size=10, bold=True, color=INK3)
    for j, it in enumerate(items):
        y = Inches(2.55) + Inches(0.4) * j
        dot(s, x + Inches(0.18), y + Inches(0.02), Inches(0.26), str(j + 1), col, size=8.5)
        text(s, x + Inches(0.54), y, Inches(2.9), Inches(0.36), it, size=10.5, color=INK, anchor=MSO_ANCHOR.MIDDLE)
text(s, Inches(5.5), Inches(4.72), Inches(7), Inches(0.3), 'ROOT CAUSE, THE SAME IN BOTH INDUSTRIES', size=9.5, bold=True, color=CRIT)
for k, (h_, d_) in enumerate([('Scattered work', 'across 16 departments and separate tools'), ('No common KPIs', 'linking department work to board questions'),
                              ('No transparency', 'across departments or up the hierarchy'), ('Opinion, not evidence', 'progress reported without proof')]):
    x = Inches(5.5) + Inches(3.65) * (k % 2); y = Inches(5.0) + Inches(0.53) * (k // 2)
    box(s, x, y, Inches(3.53), Inches(0.46), fill='fff1f2', line='fecaca', radius=0.2)
    text(s, x + Inches(0.15), y, Inches(3.3), Inches(0.46), [[(h_ + ': ', True, 'b91c1c'), (d_, False, INK2)]], size=9.5, anchor=MSO_ANCHOR.MIDDLE)
box(s, Inches(0.6), Inches(6.17), Inches(12.13), Inches(0.8), fill=NAVY, radius=0.1)
text(s, Inches(0.8), Inches(6.2), Inches(7.3), Inches(0.75), [[('Problem: ', True, LIGHT), ('enterprises are solving their top priority problems with AI, but with work spread across 16 departments, no common KPIs and no shared visibility, the board cannot get evidence-based answers.', False, 'ffffff')]], size=10.5, anchor=MSO_ANCHOR.MIDDLE)
box(s, Inches(8.25), Inches(6.3), Emu(12000), Inches(0.55), fill='3a64a5')
text(s, Inches(8.4), Inches(6.2), Inches(4.2), Inches(0.75), [[('Research question: ', True, LIGHT), ('can one domain-agnostic framework, built on proven tools, techniques and processes, answer the board with evidence in any industry?', False, 'ffffff')]], size=10.5, anchor=MSO_ANCHOR.MIDDLE)

# ═══════════════════ SLIDE 4 · METHODOLOGY I: THE KPI-FIRST PROCESS ═══════════════════
s = new()
head(s, 3, 'Methodology I: The KPI-First Process', 'Design Science Research: we start from the board question and work backwards to only the data and AI that move each KPI.')
text(s, Inches(0.6), Inches(1.78), Inches(6), Inches(0.28), 'THE GOLDEN THREAD', size=9.5, bold=True, color=INK3)
chevrons(s, ['Board|Question', 'Priority|Problem', 'Department|Owner', 'KPI Driver|Tree', 'Minimum|Data', 'Simplest|AI Model', 'Shadow|Run', 'Human|Decision', 'Board|Scorecard'],
         Inches(0.6), Inches(2.06), Inches(12.0), Inches(0.68), colors=[NAVY, NAVY2, '1f4f94', '1d5bbf', BLUE, '3b7bf0', '4b86ee', '6a9cf2', LIGHT], size=9.5)
table(s, Inches(0.6), Inches(2.95), [1.55, 4.75, 2.15], [
    ['Step', 'What Happens', 'Technique'],
    ['1. Prioritise', 'Rank the 5 problems by impact × feasibility; one pilot per industry', 'Value × feasibility matrix'],
    ['2. Driver tree', 'One outcome KPI and 3 to 4 driver KPIs, each with a department owner', 'Balanced Scorecard, OKRs'],
    ['3. Minimum data', 'Only the data that moves each driver: numbers, text, images, audio, video', 'Data audit, privacy by design'],
    ['4. Simplest model', 'Rules first, then machine learning, then deep learning only if needed', 'CRISP-DM'],
    ['5. Shadow run', 'AI recommends while people decide as before; live above 80% agreement', 'TEDIF shadow run'],
    ['6. Share', 'Team, department, cross-department and board views by role', 'RBAC, data classification'],
    ['7. Prove and scale', 'Compare with a unit without AI; scale to the next problem and industry', 'Before and after, comparison group'],
], size=9.5, head_size=10, row_h=0.47)
text(s, Inches(9.25), Inches(2.95), Inches(3.5), Inches(0.28), 'PILOT DRIVER TREES', size=9.5, bold=True, color=INK3)
for k, (tag, col, outcome, drivers) in enumerate([('Banking · Fraud', '2a78d6', 'Fraud losses', ['False-positive alerts', 'Detection speed', 'Model drift']),
                                                   ('Manufacturing · Downtime', '1baf7a', 'Unplanned downtime', ['Early failure warnings', 'Maintenance on time', 'Repeat faults'])]):
    y = Inches(3.25) + Inches(1.83) * k
    card(s, Inches(9.25), y, Inches(3.48), Inches(1.7), top=col)
    text(s, Inches(9.42), y + Inches(0.15), Inches(3.2), Inches(0.28), tag, size=11, bold=True, color=col)
    ob = box(s, Inches(9.42), y + Inches(0.48), Inches(3.14), Inches(0.36), fill=col, radius=0.3); fill_text(ob, 'Outcome: ' + outcome, size=10, bold=True)
    for j, d_ in enumerate(drivers):
        dx = Inches(9.42) + Inches(1.06) * j
        b = box(s, dx, y + Inches(0.98), Inches(1.0), Inches(0.58), fill=TINT, line='cfdaea', radius=0.15); fill_text(b, d_, size=8.5, color=NAVY)

# ═══════════════════ SLIDE 5 · METHODOLOGY II: TOOLS, TECHNIQUES, GOVERNANCE ═══════════════════
s = new()
head(s, 3, 'Methodology II: Tools, Techniques And Governance For The Board', 'Each board question is answered with proven enterprise tools and techniques, under one governance model.')
B = lambda h_, col: [(h_, True, col)]
table(s, Inches(0.6), Inches(1.85), [2.0, 2.35, 3.5], [
    ['Board Question', 'Tools', 'Techniques'],
    [B('1. Growth', BLUE), 'Planview, Power BI', 'Balanced Scorecard, OKRs, Three Horizons'],
    [B('2. Return', '0e9f6e'), 'Apptio, FinOps tools', 'TBM, payback, stage-gate funding, benefits realisation'],
    [B('3. Risk', CRIT), 'ServiceNow GRC, Vanta, Splunk', 'NIST AI RMF, ISO 42001, three lines of defence, PSI drift'],
    [B('4. AI Transformation', '7c3aed'), 'Celonis, Databricks, MLflow', 'Process mining, machine learning, NLP, computer vision'],
    [B('5. Readiness', WARN), 'LeanIX, skills platforms', 'TIME model, AI maturity model, ADKAR'],
], size=10, head_size=10.5, row_h=0.52)
text(s, Inches(0.6), Inches(5.12), Inches(7.85), Inches(0.28), 'AI TECHNIQUE FOR EACH DATA TYPE', size=9.5, bold=True, color=INK3)
for k, (d_, t_, e_) in enumerate([('Numbers', 'Anomaly detection, forecasting', 'Fraud patterns, machine failure'), ('Text And Transcripts', 'NLP: extraction, summarising', 'Regulatory circulars, meeting actions'),
                                  ('Images And Video', 'Computer vision', 'Defect inspection, KYC documents'), ('Audio', 'Speech models', 'Call centre themes, machine sounds')]):
    x = Inches(0.6) + Inches(1.98) * k
    card(s, x, Inches(5.42), Inches(1.88), Inches(1.48)); box(s, x, Inches(5.42), Inches(1.88), Inches(0.09), fill=BLUE, radius=0.5)
    text(s, x + Inches(0.12), Inches(5.56), Inches(1.68), Inches(0.3), d_, size=10.5, bold=True, color=NAVY)
    text(s, x + Inches(0.12), Inches(5.88), Inches(1.68), Inches(0.45), t_, size=9.5, bold=True, color=BLUE)
    text(s, x + Inches(0.12), Inches(6.33), Inches(1.68), Inches(0.5), e_, size=9, color=INK3)
box(s, Inches(8.65), Inches(1.85), Inches(4.08), Inches(5.05), fill=NAVY, radius=0.06)
text(s, Inches(8.92), Inches(2.05), Inches(3.6), Inches(0.3), 'GOVERNANCE · TEDIF', size=10, bold=True, color=LIGHT)
text(s, Inches(8.92), Inches(2.4), Inches(3.6), Inches(1.0), ['AI Recommends.', 'Humans Decide.'], size=26, bold=True, color='ffffff', spacing=0.95)
for k, g_ in enumerate(['A named owner approves at every gate', 'An audit trail records every step', 'Role-based access controls who sees what', 'Transparency within and across 16 departments', 'Consent and data masking for DPDP']):
    y = Inches(3.65) + Inches(0.6) * k
    tk = s.shapes.add_shape(MSO_SHAPE.OVAL, Inches(8.92), y + Inches(0.03), Inches(0.28), Inches(0.28)); tk.fill.solid(); tk.fill.fore_color.rgb = rgb(OK); tk.line.fill.background(); fill_text(tk, '✓', size=10, bold=True)
    text(s, Inches(9.32), y, Inches(3.25), Inches(0.5), g_, size=11.5, color='dbe7fb')

# ═══════════════════ SLIDE 6 · RESULTS ═══════════════════
s = new()
head(s, 4, 'Results: From Old State To Target State', 'What the framework changes for each board question, shown as the move from old state to target state.')
text(s, Inches(0.6), Inches(1.8), Inches(8), Inches(0.28), 'BOARD SCORECARD · OLD STATE → TARGET STATE', size=9.5, bold=True, color=INK3)
rows = [('1. Growth', 'AI initiatives linked to a strategic KPI', 20, 100, BLUE, None), ('2. Return', 'Investments with baseline and value tracking', 15, 100, '0e9f6e', None),
        ('3. Risk', 'AI models registered and approved before go-live', 30, 100, CRIT, None), ('4. AI Transformation', 'AI pilots reaching production', 20, 60, '7c3aed', None),
        ('4. AI Transformation', 'Decision cycle time (share of old time)', 100, 15, '7c3aed', '85% faster'), ('5. Readiness', 'Technology within vendor support', 40, 90, WARN, None),
        ('All', 'Departments with shared KPI visibility (of 16)', 0, 100, NAVY, None)]
TX, TW = Inches(4.0), Inches(3.3)
text(s, TX, Inches(2.1), TW, Inches(0.25), [[('■ Old state   ', True, GREY), ('■ Target state', True, BLUE)]], size=9)
for k, (q_, m_, o_, t_, col, note) in enumerate(rows):
    y = Inches(2.4) + Inches(0.6) * k
    if k % 2 == 0: box(s, Inches(0.6), y - Inches(0.04), Inches(7.95), Inches(0.58), fill=TINT, radius=0.08)
    text(s, Inches(0.72), y, Inches(3.2), Inches(0.25), q_, size=9.5, bold=True, color=col)
    text(s, Inches(0.72), y + Inches(0.23), Inches(3.25), Inches(0.28), m_, size=10, color=INK)
    box(s, TX, y + Inches(0.06), TW, Inches(0.16), fill='e8eef7', radius=0.5)
    if o_: box(s, TX, y + Inches(0.06), int(TW * o_ / 100), Inches(0.16), fill=GREY, radius=0.5)
    box(s, TX, y + Inches(0.29), TW, Inches(0.16), fill='e8eef7', radius=0.5)
    box(s, TX, y + Inches(0.29), int(TW * t_ / 100), Inches(0.16), fill=col, radius=0.5)
    text(s, Inches(7.4), y + Inches(0.02), Inches(1.1), Inches(0.5), [[(f'{o_}% → ', False, INK3), (f'{t_}%', True, col)]] + ([[(note, True, col)]] if note else []), size=11 if not note else 10, align=PP_ALIGN.RIGHT, spacing=0.9)
text(s, Inches(0.6), Inches(6.62), Inches(8), Inches(0.3), 'Target state, to be validated through the Fraud and Downtime pilots. Old-state values are illustrative industry baselines.', size=9, color=INK3)
card(s, Inches(8.8), Inches(1.85), Inches(3.93), Inches(5.05), title='What The Framework Delivers')
for k, (h_, d_, col) in enumerate([('One board scorecard', 'five questions answered with evidence', BLUE), ('16 departments', 'on common KPIs with role-based transparency', '0e9f6e'),
                                   ('10 priority problems', 'each with an owner and a driver tree', CRIT), ('Domain-agnostic', 'the same process for banking and manufacturing', '7c3aed'),
                                   ('Live demonstration', 'CTO360 shows the framework in action', WARN)]):
    y = Inches(2.45) + Inches(0.86) * k
    dot(s, Inches(9.0), y + Inches(0.04), Inches(0.38), str(k + 1), col, size=11)
    text(s, Inches(9.52), y, Inches(3.1), Inches(0.3), h_, size=12.5, bold=True, color=NAVY)
    text(s, Inches(9.52), y + Inches(0.3), Inches(3.1), Inches(0.5), d_, size=10, color=INK2)

# ═══════════════════ SLIDE 7 · RECOMMENDATIONS ═══════════════════
s = new()
head(s, 5, 'Recommendations: Board, Society And The Individual', 'What each audience should do, with a phased roadmap from pilot to scale.')
cols3 = [('For The Board', BLUE, [('Growth', 'Fund AI only when tied to a strategic KPI'), ('Return', 'No funding without a baseline and value tracking'), ('Risk', 'Register and approve every AI model; monitor drift'),
                                  ('AI Transformation', 'Two pilots, a shadow run, then scale'), ('Readiness', 'Retire unsupported technology; build AI skills')]),
         ('For Society', '0e9f6e', [('Humans decide', 'A named person at every AI gate'), ('Privacy by design', 'Minimum data under the DPDP Act'), ('Fair and explainable', 'Credit and service decisions people can trust'),
                                    ('Safer and reliable', 'Fewer breakdowns in plants and services'), ('Transparent', 'Role-based, verifiable reporting')]),
         ('For The Individual', NAVY, [('Think KPI-first', 'Start from the outcome, not the tool'), ('Data literacy', 'Read and build a driver tree'), ('T-shaped skills', 'Domain plus data plus AI'),
                                       ('Own every decision', 'AI supports, you decide'), ('Communicate outcomes', 'Not activity or effort')])]
for k, (t_, col, items) in enumerate(cols3):
    x = Inches(0.6) + Inches(4.1) * k
    card(s, x, Inches(1.85), Inches(3.92), Inches(4.1))
    hb = box(s, x, Inches(1.85), Inches(3.92), Inches(0.55), fill=col, radius=0.12); fill_text(hb, t_, size=15, bold=True)
    for j, (h_, d_) in enumerate(items):
        y = Inches(2.55) + Inches(0.67) * j
        dot(s, x + Inches(0.18), y + Inches(0.04), Inches(0.34), str(j + 1), col, size=10.5)
        text(s, x + Inches(0.65), y, Inches(3.15), Inches(0.28), h_, size=11.5, bold=True, color=NAVY)
        text(s, x + Inches(0.65), y + Inches(0.27), Inches(3.15), Inches(0.32), d_, size=9.5, color=INK2)
text(s, Inches(0.6), Inches(6.05), Inches(3), Inches(0.28), 'ROADMAP', size=9.5, bold=True, color=INK3)
chevrons(s, ['0 to 6 Months|2 pilots: Fraud and Downtime', '6 to 12 Months|Shadow run, then go-live', '12 to 24 Months|All 10 problems, 16 departments, new industries'],
         Inches(1.6), Inches(6.02), Inches(11.0), Inches(0.88), colors=[GREY, BLUE, NAVY], size=10.5)

# ═══════════════════ SLIDE 8 · CONCLUSION ═══════════════════
s = new()
head(s, 6, 'Conclusion: One Framework, Five Answers, Any Industry', 'Our answer to the problem, its limits, and what the board gets.')
for k, (h_, b_, col) in enumerate([('Problem', 'The board cannot get evidence-based answers to its five questions on growth, return, risk, AI transformation and readiness.', NAVY),
                                    ('Solution', 'A KPI-first, domain-agnostic framework with proven tools, techniques and TEDIF governance, across 16 departments.', BLUE),
                                    ('Outcome', '16 departments on shared KPIs, every AI model governed, and AI moving from pilot to production under human control.', OK)]):
    x = Inches(0.6) + Inches(4.1) * k
    card(s, x, Inches(1.85), Inches(3.92), Inches(1.75), top=col)
    text(s, x + Inches(0.2), Inches(2.05), Inches(3.5), Inches(0.35), h_, size=17, bold=True, color=col)
    text(s, x + Inches(0.2), Inches(2.45), Inches(3.55), Inches(1.1), b_, size=11.5, color=INK2)
card(s, Inches(0.6), Inches(3.8), Inches(3.92), Inches(1.75), fill=TINT, line=TINT, title='Limitations')
bullets(s, Inches(0.8), Inches(4.3), Inches(3.55), ['Targets still to be validated in pilots', 'Live multimodal AI is the next phase', 'Two industries designed so far'], size=10.5, gap=0.0, h_each=Inches(0.36))
text(s, Inches(4.7), Inches(3.8), Inches(8), Inches(0.3), 'What The Board Gets', size=14, bold=True, color=NAVY)
for k, ((h_, _, col), a_) in enumerate(zip(BOARD, ['KPI-linked AI portfolio', 'Value-tracked investments', 'Registered, governed AI', 'Pilots reaching production', 'Supported tech, skilled people'])):
    x = Inches(4.7) + Inches(1.62) * k
    card(s, x, Inches(4.2), Inches(1.52), Inches(1.35), top=col)
    text(s, x + Inches(0.1), Inches(4.38), Inches(1.34), Inches(0.5), h_, size=11, bold=True, color=col, align=PP_ALIGN.CENTER)
    text(s, x + Inches(0.1), Inches(4.88), Inches(1.34), Inches(0.6), a_, size=9.5, color=INK2, align=PP_ALIGN.CENTER)
band = box(s, Inches(0.6), Inches(5.75), Inches(12.13), Inches(1.15), fill=NAVY, radius=0.1)
text(s, Inches(0.9), Inches(5.85), Inches(11.5), Inches(0.5), 'One framework. Any industry. Measured outcomes.', size=21, bold=True, color='ffffff')
text(s, Inches(0.9), Inches(6.35), Inches(11.5), Inches(0.45), [[('AI Recommends. Humans Decide.', True, LIGHT)]], size=14)

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
