#!/usr/bin/env python3
"""Nine-slide capstone deck: title, introduction, problem, methodology (2), results, recommendations, conclusion, thank you.
Technology and process measures only: no money figures. Based on the slide (Introduction, Problem Statement, Methodology, Results,
Recommendations, Conclusion). Reuses the design system and helpers of build_capstone_pptx.py.

  python3 docs/presentation/build_capstone_6slides.py
Output: /Users/ram/Downloads/CTO CApstone/Capstone_9_Slides.pptx
"""
from pathlib import Path

SRC = Path(__file__).with_name('build_capstone_pptx.py').read_text()
exec(SRC.split('# ══════════════════════════ 1. COVER')[0])   # helpers, tokens, data, team, presentation object

OUT6 = Path('/Users/ram/Downloads/CTO CApstone/Capstone_9_Slides.pptx')
RELABEL = {'Spend & value': 'Value delivery'}
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

# ═══════════════════ SLIDE 2 · PHASE 1 INTRODUCTION ═══════════════════
s = new()
head(s, 1, 'Introduction: Why Enterprises Need A New Way To Steer AI', 'Technology change is accelerating faster than leaders can steer it, while regulation, ageing platforms and tool sprawl make control harder.', who='ramkumar')
why = [('1 of 6', 'Control is partial', 'technology control layers are on target today (score 76 vs 85)', WARN),
       ('22', 'Regulation is accelerating', 'real RBI notifications in two weeks, plus DPDP Act duties', BLUE),
       ('12 of 20', 'Technology is ageing', 'technology versions already past real vendor end of life', CRIT),
       ('7', 'Tools do not connect', 'specialist platforms; none answers "what matters most?"', NAVY)]
for k, (big_, h_, d_, col) in enumerate(why):
    x = Inches(0.6) + Inches(3.05) * k
    card(s, x, Inches(1.85), Inches(2.9), Inches(2.05), top=col)
    text(s, x + Inches(0.2), Inches(2.08), Inches(2.6), Inches(0.3), h_, size=12, bold=True, color=NAVY)
    text(s, x + Inches(0.2), Inches(2.4), Inches(2.6), Inches(0.65), big_, size=30, bold=True, color=col)
    text(s, x + Inches(0.2), Inches(3.1), Inches(2.6), Inches(0.75), d_, size=10.5, color=INK2)
ob = box(s, Inches(0.6), Inches(4.1), Inches(7.25), Inches(1.25), fill=NAVY, radius=0.08)
text(s, Inches(0.85), Inches(4.2), Inches(6.8), Inches(0.3), 'OUR OBJECTIVE', size=10, bold=True, color='86b6ef')
text(s, Inches(0.85), Inches(4.5), Inches(6.8), Inches(0.8), 'Build one governed, domain-agnostic way to see, govern, fund and run AI-led transformation, and move every area from old state to target state, measurably.', size=13, bold=True, color='ffffff')
text(s, Inches(0.6), Inches(5.55), Inches(7.25), Inches(0.3), 'SCOPE OF THE FRAMEWORK', size=10, bold=True, color=INK3)
for k, (n_, l_) in enumerate([('3', 'business units'), ('7', 'source systems'), ('16', 'enterprise functions'), ('6', 'control layers'), ('30', 'tracked measures')]):
    x = Inches(0.6) + Inches(1.47) * k
    b = box(s, x, Inches(5.85), Inches(1.37), Inches(1.0), fill=TINT, radius=0.12)
    text(s, x, Inches(5.9), Inches(1.37), Inches(0.5), n_, size=24, bold=True, color=BLUE, align=PP_ALIGN.CENTER)
    text(s, x, Inches(6.4), Inches(1.37), Inches(0.35), l_, size=9.5, color=INK2, align=PP_ALIGN.CENTER)
card(s, Inches(8.1), Inches(4.1), Inches(4.63), Inches(2.75), title='From Concept To Framework')
for k, (h_, b_) in enumerate([('Sep 2026', 'Concept: one CTO vision across industries'), ('Early Oct', 'Simulation: 3 units, 7 sources, 16 functions'), ('Mid Oct', 'Team workspaces: old state to target'), ('Late Oct', 'Control plane, live impact, real data')]):
    y = Inches(4.65) + Inches(0.52) * k
    d = s.shapes.add_shape(MSO_SHAPE.OVAL, Inches(8.3), y + Inches(0.04), Inches(0.3), Inches(0.3)); d.fill.solid(); d.fill.fore_color.rgb = rgb([NAVY, NAVY2, '1f4f94', BLUE][k]); d.line.fill.background(); fill_text(d, str(k + 1), size=9, bold=True)
    text(s, Inches(8.72), y, Inches(3.9), Inches(0.45), [[(h_ + '  ', True, NAVY), (b_, False, INK2)]], size=10.5)

# ═══════════════════ 2 · PROBLEM STATEMENT (banking + manufacturing) ═══════════════════
s = new()
head(s, 2, 'Problem Statement: Signals Exist, Decisions Do Not', 'Enterprises cannot see, govern, fund and run AI-led transformation as one system, so they cannot prove that technology change produced outcomes.', who='ramkumar')
probs = [('BANKING', 'Meridian Bank', '2a78d6', 'A legacy core and integration layer slow digital payments, and technology debt sits behind P1 incidents; the risk is found late because no tool connects the chain.',
          ['Payments programme slips: legacy dependencies + capacity gap + rising incidents', 'Regulatory change mapped by hand (21 days per circular)', 'AI fraud model drifts without a named decider'],
          [('66 / 100', 'application layer'), ('r = −0.73', 'debt vs incidents'), ('21 days', 'per regulatory circular')]),
         ('MANUFACTURING', 'Arvant Industries', '1baf7a', 'Plant system (MES) instability causes line stops and the smart factory programme is delayed; capacity is added after the peak hurts.',
          ['Recurring ERP and MES problems, rarely root-caused (1.5% linked to problems)', 'Month-end peaks exceed capacity headroom (below 10%)', 'Production steps still depend on manual hand-offs'],
          [('14', 'recurring ERP problems'), ('8%', 'capacity headroom'), ('OEE', 'target missed')])]
for k, (tag, name, col, stmt, causes, costs) in enumerate(probs):
    x = Inches(0.6) + Inches(6.13) * k
    card(s, x, Inches(1.85), Inches(5.97), Inches(4.0), top=col)
    t = box(s, x + Inches(0.22), Inches(2.12), Inches(1.75), Inches(0.34), fill=col, radius=0.4); fill_text(t, tag, size=10, bold=True)
    text(s, x + Inches(2.1), Inches(2.08), Inches(3.7), Inches(0.4), name, size=18, bold=True, color=NAVY)
    text(s, x + Inches(0.22), Inches(2.6), Inches(5.55), Inches(0.95), [[('Problem: ', True, NAVY), (stmt, False, INK2)]], size=12)
    text(s, x + Inches(0.22), Inches(3.55), Inches(5.5), Inches(0.25), 'ROOT CAUSES', size=9, bold=True, color=INK3)
    bullets(s, x + Inches(0.22), Inches(3.8), Inches(5.55), causes, size=11, gap=0.02, dot=col, h_each=Inches(0.3))
    for j, (v_, l_) in enumerate(costs):
        cx = x + Inches(0.22) + Inches(1.87) * j
        b = box(s, cx, Inches(4.9), Inches(1.75), Inches(0.78), fill=TINT, radius=0.12)
        text(s, cx + Inches(0.12), Inches(4.95), Inches(1.55), Inches(0.4), v_, size=17, bold=True, color=col)
        text(s, cx + Inches(0.12), Inches(5.33), Inches(1.6), Inches(0.3), l_, size=9, color=INK3)
text(s, Inches(0.6), Inches(6.0), Inches(2.2), Inches(0.3), 'ROOT CAUSE ACROSS BOTH', size=9, bold=True, color=INK3)
for k, t_ in enumerate(['Planview', 'LeanIX', 'Celonis', 'ServiceNow', 'Jellyfish', 'Datadog', 'Vanta']):
    b = box(s, Inches(0.6) + Inches(1.14) * k, Inches(6.28), Inches(1.04), Inches(0.42), fill=TINT, line='cfdaea', radius=0.3); fill_text(b, t_, size=9, color=NAVY)
q = box(s, Inches(8.65), Inches(6.28), Inches(1.75), Inches(0.42), fill='fff1f2', line='fca5a5', radius=0.3); fill_text(q, 'What matters most?', size=9, bold=True, color='b91c1c')
text(s, Inches(10.55), Inches(6.0), Inches(2.2), Inches(0.75), [[('Research question: ', True, NAVY), ('can one framework turn these signals into owned, measured decisions in any industry?', False, INK2)]], size=10)

# ═══════════════════ 4 · METHODOLOGY I: APPROACH AND DESIGN ═══════════════════
s = new()
head(s, 3, 'Methodology I: Research Approach And Solution Design', 'Design science research: build a working artefact for a real problem, then evaluate it with evidence.')
text(s, Inches(0.6), Inches(1.8), Inches(6), Inches(0.3), 'RESEARCH APPROACH · DESIGN SCIENCE', size=10, bold=True, color=INK3)
chevrons(s, ['Identify|problem', 'Define|objectives', 'Design &|build', 'Demonstrate', 'Evaluate', 'Communicate'], Inches(0.6), Inches(2.1), Inches(12.0), Inches(0.8), size=12)
caps = ['Business problems per owner across 3 industries', 'Move each area from old state to target state', 'Data model, 7 sources, decision engine, control plane', 'Live site, simulation clock, cross-team scenario', 'Statistics, automated checks, 6 real datasets', 'Executive summary, boardroom cockpit, this deck']
for k, c_ in enumerate(caps):
    text(s, Inches(0.65) + Inches(2.0) * k, Inches(2.98), Inches(1.9), Inches(0.55), c_, size=10, color=INK2, align=PP_ALIGN.CENTER)
text(s, Inches(0.6), Inches(3.75), Inches(6), Inches(0.3), 'SOLUTION DESIGN · TEDIF DECISION LOOP', size=10, bold=True, color=INK3)
chevrons(s, ['Signal', 'Correlate', 'Insight', 'Decide', 'Act', 'Outcome'], Inches(0.6), Inches(4.05), Inches(7.6), Inches(0.72), size=10.5)
bullets(s, Inches(0.6), Inches(5.0), Inches(7.6), [
    ('Signal and correlation:', 'live events from 7 source systems, linked through shared record IDs into one story.'),
    ('Insight and decision:', 'a prioritised Top 10 with impact, confidence, owner and deadline.'),
    ('Action and outcome:', 'approved decisions become actions, tracked against baseline and target.')], size=12, gap=0.08)
g = box(s, Inches(8.5), Inches(3.75), Inches(4.23), Inches(3.1), fill=NAVY, radius=0.06)
text(s, Inches(8.8), Inches(3.95), Inches(3.7), Inches(0.3), 'GOVERNANCE PRINCIPLE', size=10, bold=True, color='86b6ef')
text(s, Inches(8.8), Inches(4.3), Inches(3.7), Inches(1.0), ['AI Recommends.', 'Humans Decide.'], size=26, bold=True, color='ffffff', spacing=0.95)
text(s, Inches(8.8), Inches(5.4), Inches(3.7), Inches(1.3), 'A named person decides at every gate, every step is recorded in an audit trail, and AI models above the drift limit are restricted.', size=12, color='c7d8f5')

# ═══════════════════ 5 · METHODOLOGY II: ARCHITECTURE, FRAMEWORKS, VALIDATION ═══════════════════
s = new()
head(s, 3, 'Methodology II: Architecture, Frameworks And Validation', 'How the framework is built once and reused, which management frameworks it applies, and how every number is validated.')
card(s, Inches(0.6), Inches(1.85), Inches(4.35), Inches(5.0), title='Architecture: Build Once, Reuse')
for k, (t_, col) in enumerate([('Control plane & team workspaces', NAVY), ('Decision intelligence (Top 10, actions)', NAVY2), ('Scoring & correlation (16 functions)', '1f4f94'), ('Canonical data model (shared IDs)', BLUE)]):
    b = box(s, Inches(0.8) + Inches(0.15) * k, Inches(2.5) + Inches(0.6) * k, Inches(3.95) - Inches(0.3) * k, Inches(0.5), fill=col, radius=0.2); fill_text(b, t_, size=11, bold=True)
for k, t_ in enumerate(['Plan', 'EA', 'Proc', 'Flow', 'Eng', 'Ops', 'Risk']):
    b = box(s, Inches(0.8) + Inches(0.565) * k, Inches(4.95), Inches(0.5), Inches(0.42), fill=TINT, line='cfdaea', radius=0.2); fill_text(b, t_, size=8.5, color=NAVY)
text(s, Inches(0.8), Inches(5.45), Inches(4.0), Inches(1.3), ['3 business units × 7 source systems × 16 enterprise functions', '→ 6 control layers: business, data & AI, application, technology, security, value delivery', 'Retail added by configuration only'], size=10.5, color=INK2)
card(s, Inches(5.1), Inches(1.85), Inches(3.75), Inches(5.0), title='Frameworks Applied, Not Listed')
for k, (n_, t_, col, wdt) in enumerate([('16', 'applied with tracked metrics', NAVY, 2.3), ('15', 'built into the screens', '1f4f94', 2.75), ('10', 'analytics techniques', BLUE, 3.15), ('69', 'reference library', LIGHT, 3.45)]):
    x = Inches(5.25) + (Inches(3.45) - Inches(wdt)) / 2
    b = box(s, x, Inches(2.5) + Inches(0.72) * k, Inches(wdt), Inches(0.62), fill=col, radius=0.2)
    text(s, x + Inches(0.12), Inches(2.52) + Inches(0.72) * k, Inches(wdt) - Inches(0.2), Inches(0.58), [[(n_ + '  ', True, NAVY if col == LIGHT else 'ffffff'), (t_, False, NAVY if col == LIGHT else 'dbe7fb')]], size=12.5, anchor=MSO_ANCHOR.MIDDLE)
text(s, Inches(5.28), Inches(5.5), Inches(3.45), Inches(1.2), 'Balanced Scorecard · Cynefin · RAPID · Three Horizons · Three Lines · TOGAF ADM · TIME model · Theory of Constraints · ITIL · SRE · Kotter · ADKAR', size=10, color=INK2, align=PP_ALIGN.CENTER)
card(s, Inches(9.0), Inches(1.85), Inches(3.73), Inches(5.0), title='Measured And Validated')
y = Inches(2.5)
for h_, d_ in [('30 measures', 'baseline Nov 2025 → now → target'), ('Calculated, never typed', 'every score derived from linked records'), ('Automated checks', '3 units + team cross-checks every build'), ('Statistics', 'Pearson, regression, Monte Carlo, PSI'), ('6 real public datasets', 'used as labelled reality checks'), ('Quality checks', 'every page and link tested')]:
    tk = s.shapes.add_shape(MSO_SHAPE.OVAL, Inches(9.2), y + Inches(0.04), Inches(0.28), Inches(0.28)); tk.fill.solid(); tk.fill.fore_color.rgb = rgb(OK); tk.line.fill.background(); fill_text(tk, '✓', size=10, bold=True)
    text(s, Inches(9.6), y - Inches(0.02), Inches(3.0), Inches(0.62), [[(h_, True, NAVY)], [(d_, False, INK2)]], size=10.5, spacing=0.95); y += Inches(0.7)

# ═══════════════════ 4 · RESULTS ═══════════════════
s = new()
head(s, 4, 'Results: A Live Control Plane With Measured Evidence', 'What we built, what it measures across three business units, and what the statistics and real data confirm.', who='suman')
text(s, Inches(0.6), Inches(1.8), Inches(6.5), Inches(0.3), 'CONTROL LAYERS BY BUSINESS UNIT · LIVE CONTROL PLANE', size=9, bold=True, color=INK3)
mx = D['matrix']
tbl = s.shapes.add_table(len(mx) + 1, 5, Inches(0.6), Inches(2.1), Inches(6.4), Inches(3.6)).table
tbl.columns[0].width = Inches(2.0)
for j in range(1, 5): tbl.columns[j].width = Inches(1.1)
for j, h_ in enumerate(['Layer', 'Banking', 'Manufacturing', 'Retail', 'All']):
    c = tbl.cell(0, j); c.fill.solid(); c.fill.fore_color.rgb = rgb(NAVY); c.text = h_; c.margin_left = c.margin_right = Inches(0.04)
    pp = c.text_frame.paragraphs[0]; pp.alignment = PP_ALIGN.CENTER if j else PP_ALIGN.LEFT; rr = pp.runs[0]; rr.font.size = Pt(10.5 if j else 11.5); rr.font.bold = True; rr.font.color.rgb = rgb('ffffff'); rr.font.name = FONT
for i_, row in enumerate(mx, start=1):
    for j, v_ in enumerate([row['label']] + row['cells'] + [row['all']]):
        c = tbl.cell(i_, j); c.text = str(v_); c.vertical_anchor = MSO_ANCHOR.MIDDLE
        pp = c.text_frame.paragraphs[0]; rr = pp.runs[0]; rr.font.name = FONT; rr.font.size = Pt(14 if j else 12); rr.font.bold = j > 0
        if j == 0: c.fill.solid(); c.fill.fore_color.rgb = rgb('ffffff'); rr.font.color.rgb = rgb(NAVY)
        else:
            col = OK if v_ >= 80 else WARN if v_ >= 60 else CRIT
            c.fill.solid(); c.fill.fore_color.rgb = rgb(col if j < 4 else 'ffffff'); rr.font.color.rgb = rgb('ffffff' if j < 4 else col); pp.alignment = PP_ALIGN.CENTER
text(s, Inches(0.6), Inches(5.75), Inches(6.4), Inches(0.25), 'Green 80 and above · Amber 60 to 79 · Red below 60 · Target 85 · live at cto360.vercel.app', size=9, color=INK3)
kp = [(f'{score}/100', 'control score', f'target 85 · +{score - score3} in 3 months', WARN), ('1 / 6', 'layers on target', 'weakest: Security & risk 70', CRIT),
      (f'r = {D["debt"]["r"]:.2f}', 'technical debt vs incidents', f'{D["debt"]["n"]} apps · Banking −0.73', CRIT), ('59%', 'team transformation', '30 measures, baseline → target', BLUE)]
for k, (v_, l_, sub, col) in enumerate(kp):
    x = Inches(7.3) + Inches(2.75) * (k % 2); y = Inches(1.85) + Inches(1.0) * (k // 2)
    card(s, x, y, Inches(2.6), Inches(0.9)); box(s, x, y, Inches(0.08), Inches(0.9), fill=col)
    text(s, x + Inches(0.2), y + Inches(0.05), Inches(2.35), Inches(0.42), v_, size=19, bold=True, color=col)
    text(s, x + Inches(0.2), y + Inches(0.48), Inches(2.35), Inches(0.4), [[(l_ + ' · ', True, NAVY), (sub, False, INK3)]], size=8.5)
cd = CategoryChartData(); cd.categories = [l['label'] for l in D['layers']]
cd.add_series('Nov 2025', [l['baseline'] for l in D['layers']]); cd.add_series('Now', [l['current'] for l in D['layers']])
gf = s.shapes.add_chart(XL_CHART_TYPE.BAR_CLUSTERED, Inches(7.2), Inches(3.85), Inches(5.55), Inches(3.1), cd); ch = gf.chart; style_chart(ch, size=9)
ch.value_axis.minimum_scale = 0; ch.value_axis.maximum_scale = 100; ch.value_axis.major_gridlines.format.line.color.rgb = rgb('e2e8f0'); ch.category_axis.reverse_order = True
ch.plots[0].gap_width = 55; ch.plots[0].overlap = -10
ch.series[0].format.fill.solid(); ch.series[0].format.fill.fore_color.rgb = rgb(GREY); ch.series[1].format.fill.solid(); ch.series[1].format.fill.fore_color.rgb = rgb(BLUE)
ch.has_title = True; ch.chart_title.text_frame.text = 'Six Control Layers: Nov 2025 vs Now (Target 85)'; r_ = ch.chart_title.text_frame.paragraphs[0].runs[0]; r_.font.size = Pt(11); r_.font.bold = True
text(s, Inches(0.6), Inches(5.95), Inches(6.5), Inches(0.25), 'VALIDATED ON REAL PUBLIC DATA', size=9, bold=True, color=OK)
for k, (v_, l_) in enumerate([('12/20', 'tech past EOL'), ('22', 'RBI notices'), ('2.42', 'fraud PSI'), ('79.2%', 'Pareto'), ('1.5%', 'incidents root-caused'), ('1,734', 'exploited CVEs')]):
    b = box(s, Inches(0.6) + Inches(1.08) * k, Inches(6.22), Inches(1.0), Inches(0.72), fill='ecfdf3', line='bbf7d0', radius=0.12)
    text(s, Inches(0.65) + Inches(1.08) * k, Inches(6.25), Inches(0.92), Inches(0.35), v_, size=13, bold=True, color=OK, align=PP_ALIGN.CENTER)
    text(s, Inches(0.65) + Inches(1.08) * k, Inches(6.6), Inches(0.92), Inches(0.3), l_, size=8, color=INK3, align=PP_ALIGN.CENTER)

# ═══════════════════ 5 · RECOMMENDATIONS ═══════════════════
s = new()
head(s, 5, 'Recommendations: Business, Society And The Individual', 'What each audience should do with these findings, each tied to evidence from the framework.', who='santosh')
cols3 = [('For Business', BLUE, [('Steer by layer, not dashboard', 'Decisions in days: 21 → 6'), ('Close the biggest layer gaps first', 'Security & risk 70 → 85'), ('Retire end-of-life tech on a plan', '12 of 20 past EOL'), ('Govern AI with named deciders', 'Restrict at PSI > 0.25'), ('Automate root-cause analysis', 'Recurring problems 14 → 3')]),
         ('For Society', '0e9f6e', [('Responsible AI: humans decide', 'Audit trail at every gate'), ('Privacy by design', 'DPDP consent, breach clocks'), ('Reliable services for inclusion', 'Fewer P1 outages'), ('Greener technology', 'Cloud waste 28% → 8%'), ('Open standards, transparency', 'Public, verifiable data')]),
         ('For The Individual', NAVY, [('Think in systems, not tools', 'Connect the whole chain'), ('Measure outcomes, not activity', 'Baseline → target'), ('Build T-shaped skills', 'EA · data · AI · operations'), ('Keep humans accountable for AI', 'Own every decision'), ('Communicate in outcomes', 'Reliability · risk · speed')])]
for k, (t_, col, items) in enumerate(cols3):
    x = Inches(0.6) + Inches(4.1) * k
    card(s, x, Inches(1.85), Inches(3.92), Inches(5.0))
    hb = box(s, x, Inches(1.85), Inches(3.92), Inches(0.62), fill=col, radius=0.12); fill_text(hb, t_, size=16, bold=True)
    for j, (h_, tag) in enumerate(items):
        y = Inches(2.65) + Inches(0.83) * j
        n = s.shapes.add_shape(MSO_SHAPE.OVAL, x + Inches(0.2), y + Inches(0.05), Inches(0.36), Inches(0.36)); n.fill.solid(); n.fill.fore_color.rgb = rgb(col); n.line.fill.background(); fill_text(n, str(j + 1), size=11, bold=True)
        text(s, x + Inches(0.7), y, Inches(3.1), Inches(0.35), h_, size=12, bold=True, color=NAVY)
        tg = box(s, x + Inches(0.7), y + Inches(0.36), Inches(3.0), Inches(0.3), fill=TINT, radius=0.4); fill_text(tg, tag, size=9, bold=True, color=col, align=PP_ALIGN.LEFT)

# ═══════════════════ 6 · CONCLUSION ═══════════════════
s = new()
head(s, 6, 'Conclusion: One Framework, Any Industry, Measured', 'Our answer to the problem, its limits, and what comes next.', who='ramkumar')
for k, (h_, b_, col) in enumerate([('Problem', 'Enterprises cannot see, govern, fund and run AI-led transformation as one system.', NAVY),
                                    ('Solution', 'A domain-agnostic framework (TEDIF) implemented as CTO360: six control layers, decision intelligence, owner workspaces.', BLUE),
                                    ('Evidence', f'Control score {score}/100 across six layers · r = {D["debt"]["r"]:.2f} between technical debt and incidents · confirmed on 6 real datasets.', OK)]):
    x = Inches(0.6) + Inches(4.1) * k
    card(s, x, Inches(1.85), Inches(3.92), Inches(1.75), top=col)
    text(s, x + Inches(0.2), Inches(2.05), Inches(3.5), Inches(0.35), h_, size=17, bold=True, color=col)
    text(s, x + Inches(0.2), Inches(2.45), Inches(3.55), Inches(1.1), b_, size=11.5, color=INK2)
card(s, Inches(0.6), Inches(3.8), Inches(3.92), Inches(1.75), fill=TINT, line=TINT, title='Limitations')
bullets(s, Inches(0.8), Inches(4.3), Inches(3.55), ['Simulated enterprise; real data as reality checks', 'Rule-based decisions; no live AI model yet', 'Three industries tested; more to validate'], size=10.5, gap=0.0, h_each=Inches(0.36))
text(s, Inches(4.7), Inches(3.8), Inches(3), Inches(0.3), 'Next Steps', size=14, bold=True, color=NAVY)
chevrons(s, ['Today|working framework', '6 to 12 months|live AI · pilot', '2 to 3 years|scaled platform'], Inches(4.7), Inches(4.15), Inches(8.0), Inches(0.72), colors=[GREY, BLUE, NAVY], size=10)
for k, (n_, v_, d_, col) in enumerate([('Today', '1 of 6 layers', 'on target · decisions in 6 days', GREY), ('6 to 12 months', 'Live AI on 3 decisions', 'signal-to-decision 6 → 3 days', BLUE), ('2 to 3 years', 'All 6 layers', 'on target across units', NAVY)]):
    x = Inches(4.7) + Inches(2.7) * k
    card(s, x, Inches(4.98), Inches(2.55), Inches(0.57))
    text(s, x + Inches(0.12), Inches(5.0), Inches(2.35), Inches(0.52), [[(v_, True, col)], [(d_, False, INK3)]], size=9.5, spacing=0.95)
band = box(s, Inches(0.6), Inches(5.75), Inches(12.13), Inches(1.15), fill=NAVY, radius=0.1)
text(s, Inches(0.9), Inches(5.85), Inches(11.5), Inches(0.5), 'One framework. Any industry. Measured outcomes.', size=21, bold=True, color='ffffff')
text(s, Inches(0.9), Inches(6.35), Inches(11.5), Inches(0.45), [[('AI Recommends. Humans Decide.', True, '86b6ef')]], size=14)

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

prs.save(OUT6)
for f in ASSETS.glob('_photo_*.png'): f.unlink()
print(f'saved {OUT6} · {len(prs.slides)} slides')
