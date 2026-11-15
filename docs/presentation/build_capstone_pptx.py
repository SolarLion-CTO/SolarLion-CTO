#!/usr/bin/env python3
"""Builds the 6-phase capstone deck as an editable PowerPoint:
Domain-Agnostic Enterprise AI Transformation Framework (implemented as CTO360).

  python3 docs/presentation/build_capstone_pptx.py

Inputs : docs/presentation/capstone_assets/ (screenshots, concept image, data.json from extract.ts)
Photos : /Users/ram/Downloads/CTO CApstone/team_photos/{ramkumar,suman,santosh}.(jpg|jpeg|png)  (kept OUT of git)
Output : /Users/ram/Downloads/CTO CApstone/Capstone_6_Phase_Presentation.pptx
Rules  : Title Case headings, no em dashes, every number calculated by the simulation or taken from public data.
"""
import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageOps
from pptx import Presentation
from pptx.chart.data import CategoryChartData, XyChartData
from pptx.dml.color import RGBColor
from pptx.enum.chart import XL_CHART_TYPE, XL_LEGEND_POSITION, XL_MARKER_STYLE
from pptx.enum.dml import MSO_LINE_DASH_STYLE
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN
from pptx.util import Emu, Inches, Pt

HERE = Path(__file__).resolve().parent
ASSETS = HERE / 'capstone_assets'
PHOTOS = Path('/Users/ram/Downloads/CTO CApstone/team_photos')
OUT = Path('/Users/ram/Downloads/CTO CApstone/Capstone_6_Phase_Presentation.pptx')
D = json.loads((ASSETS / 'data.json').read_text())

# ── Design tokens ─────────────────────────────────────────────────────
def rgb(h): h = h.lstrip('#'); return RGBColor(int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16))
NAVY, NAVY2, BLUE, LIGHT, INK, INK2, INK3, LINE, BG, TINT = '0f2747', '173a6b', '2563eb', '86b6ef', '0f172a', '334155', '64748b', 'dbe3ee', 'ffffff', 'f3f7fd'
OK, WARN, CRIT, GREY = '15803d', 'd97706', 'dc2626', '94a3b8'
FONT = 'Calibri'
W, H = Inches(13.333), Inches(7.5)

TEAM = [
    ('ramkumar', 'Ramkumar P', 'CTO', 'Domain-agnostic framework and decision intelligence', NAVY),
    ('suman', 'Suman Kolekar', 'Strategy & ROI', 'ROI before investment; transform any organisation to AI', BLUE),
    ('santosh', 'Santosh Kumar', 'Finance & Investment Governance', 'Governance system; CAPEX and OPEX; value after spend', '0e9f6e'),
]
WHO = {t[0]: t for t in TEAM}
PHASES = ['Introduction', 'Problem Statement', 'Methodology', 'Results', 'Recommendations', 'Conclusion']

prs = Presentation()
prs.slide_width, prs.slide_height = W, H
BLANK = prs.slide_layouts[6]

# ── Primitives ────────────────────────────────────────────────────────
def box(s, x, y, w, h, fill=None, line=None, radius=None, shape=MSO_SHAPE.RECTANGLE, lw=0.75):
    shp = s.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE if radius is not None else shape, x, y, w, h)
    if radius is not None: shp.adjustments[0] = radius
    if fill: shp.fill.solid(); shp.fill.fore_color.rgb = rgb(fill)
    else: shp.fill.background()
    if line: shp.line.color.rgb = rgb(line); shp.line.width = Pt(lw)
    else: shp.line.fill.background()
    shp.shadow.inherit = False
    return shp

def text(s, x, y, w, h, t, size=14, bold=False, color=INK, align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP, italic=False, spacing=1.08):
    tb = s.shapes.add_textbox(x, y, w, h); tf = tb.text_frame; tf.word_wrap = True
    tf.margin_left = tf.margin_right = Inches(0.02); tf.margin_top = tf.margin_bottom = Inches(0.01); tf.vertical_anchor = anchor
    lines = t if isinstance(t, list) else [t]
    for i, ln in enumerate(lines):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = align; p.line_spacing = spacing
        runs = ln if isinstance(ln, list) else [(ln, bold, color)]
        for r in runs:
            rt, rb, rc = (r + (None,) * 3)[:3] if isinstance(r, tuple) else (r, bold, color)
            run = p.add_run(); run.text = rt
            run.font.size = Pt(size); run.font.bold = bool(rb); run.font.italic = italic; run.font.name = FONT
            run.font.color.rgb = rgb(rc or color)
    return tb

def fill_text(shp, t, size=12, bold=False, color='ffffff', align=PP_ALIGN.CENTER):
    tf = shp.text_frame; tf.clear(); tf.word_wrap = True; tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    tf.margin_left = tf.margin_right = Inches(0.06)
    lines = t if isinstance(t, list) else [t]
    for i, ln in enumerate(lines):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph(); p.alignment = align
        r = p.add_run(); r.text = ln; r.font.size = Pt(size); r.font.bold = bold; r.font.name = FONT; r.font.color.rgb = rgb(color)

def bullets(s, x, y, w, items, size=14, gap=0.1, color=INK2, dot=BLUE, h_each=None):
    cy = y
    for it in items:
        head, body = (it if isinstance(it, tuple) else ('', it))
        box(s, x, cy + Inches(0.09), Inches(0.09), Inches(0.09), fill=dot, radius=0.2)
        lines = max(1, int(len(head + ' ' + body) * size / (w / Inches(1) * 105)) + 1)
        hh = h_each or Inches(0.24 * lines * size / 14 + 0.06)
        text(s, x + Inches(0.22), cy, w - Inches(0.22), hh, [[(head + (' ' if head else ''), True, NAVY), (body, False, color)]], size=size)
        cy += hh + Inches(gap)
    return cy

def photo(s, key, x, y, d):
    """Round photo if provided in PHOTOS, else an initials disc. Returns the shape."""
    for ext in ('jpg', 'jpeg', 'png', 'JPG', 'JPEG', 'PNG'):
        f = PHOTOS / f'{key}.{ext}'
        if f.exists():
            im = ImageOps.exif_transpose(Image.open(f)).convert('RGB')
            side = min(im.size); im = im.crop(((im.width - side) // 2, max(0, (im.height - side) // 3), (im.width + side) // 2, max(0, (im.height - side) // 3) + side)).resize((600, 600))
            mask = Image.new('L', (600, 600), 0); ImageDraw.Draw(mask).ellipse((0, 0, 599, 599), fill=255)
            out = Image.new('RGBA', (600, 600)); out.paste(im, (0, 0), mask)
            tmp = ASSETS / f'_photo_{key}.png'; out.save(tmp)
            pic = s.shapes.add_picture(str(tmp), x, y, d, d)
            ring = s.shapes.add_shape(MSO_SHAPE.OVAL, x, y, d, d); ring.fill.background(); ring.line.color.rgb = rgb('ffffff'); ring.line.width = Pt(2.5)
            return pic
    t = WHO[key]
    disc = s.shapes.add_shape(MSO_SHAPE.OVAL, x, y, d, d); disc.fill.solid(); disc.fill.fore_color.rgb = rgb(t[4]); disc.line.color.rgb = rgb('ffffff'); disc.line.width = Pt(2.5)
    initials = ''.join(p[0] for p in t[1].split()[:2])
    fill_text(disc, initials, size=max(10, int(d / Inches(1) * 26)), bold=True)
    return disc

def laptop(s, img, x, y, w):
    """Screenshot inside a laptop frame: dark bezel + screen + base."""
    im = Image.open(ASSETS / img); ratio = im.height / im.width
    bez = Inches(0.12); sw = w - 2 * bez; sh = int(sw * ratio); bh = sh + 2 * bez
    box(s, x, y, w, bh, fill='1e293b', radius=0.04)
    s.shapes.add_picture(str(ASSETS / img), x + bez, y + bez, sw, sh)
    base = box(s, x - Inches(0.35), y + bh, w + Inches(0.7), Inches(0.13), fill='cbd5e1', radius=0.5)
    box(s, x + w / 2 - Inches(0.6), y + bh, Inches(1.2), Inches(0.05), fill='94a3b8', radius=0.5)
    return y + bh + Inches(0.13)

def framed(s, img, x, y, w, h=None):
    """Screenshot with a soft card border (no device), cropped to fit h if given."""
    im = Image.open(ASSETS / img); ratio = im.height / im.width
    ph = int(w * ratio) if not h else h
    pic = s.shapes.add_picture(str(ASSETS / img), x, y, w, int(w * ratio))
    if h and int(w * ratio) > h:  # crop bottom
        pic.crop_bottom = 1 - h / int(w * ratio); pic.height = h
    border = box(s, x, y, w, ph, line=LINE, radius=0.02); border.fill.background()
    return y + ph

slide_no = [0]
def base(kicker, title, lead=None, phase=None, who=None, dark=False):
    s = prs.slides.add_slide(BLANK); slide_no[0] += 1
    if dark:
        bg = box(s, 0, 0, W, H, fill=NAVY)
        return s
    box(s, 0, 0, W, H, fill=BG)
    accent = box(s, 0, 0, Inches(0.12), H, fill=NAVY)
    accent.fill.gradient(); accent.fill.gradient_angle = 90
    accent.fill.gradient_stops[0].color.rgb = rgb(NAVY); accent.fill.gradient_stops[1].color.rgb = rgb(BLUE)
    text(s, Inches(0.6), Inches(0.35), Inches(9), Inches(0.3), kicker.upper(), size=11, bold=True, color=BLUE)
    text(s, Inches(0.6), Inches(0.62), Inches(8.9) if (phase or who) else Inches(11.6), Inches(0.7), title, size=28, bold=True, color=NAVY)
    if lead: text(s, Inches(0.6), Inches(1.28), Inches(11.6), Inches(0.5), lead, size=14, color=INK2)
    if phase:  # 6-phase tracker
        tx = Inches(9.6)
        for k in range(6):
            on = k + 1 == phase
            seg = box(s, tx + Inches(0.36) * k, Inches(0.42), Inches(0.3), Inches(0.09), fill=BLUE if on else ('86b6ef' if k + 1 < phase else 'e2e8f0'), radius=0.5)
        text(s, Inches(9.6), Inches(0.55), Inches(2.2), Inches(0.25), f'Phase {phase} of 6', size=9, color=INK3)
    if who:  # presenter chip
        t = WHO[who]; photo(s, who, Inches(12.0), Inches(0.3), Inches(0.62))
        text(s, Inches(10.6), Inches(0.92), Inches(2.4), Inches(0.25), t[1], size=9, bold=True, color=NAVY, align=PP_ALIGN.RIGHT)
    # footer
    line = box(s, Inches(0.6), Inches(7.02), Inches(12.13), Emu(9000), fill=LINE)
    text(s, Inches(0.6), Inches(7.08), Inches(8), Inches(0.25), 'Domain-Agnostic Enterprise AI Transformation Framework · CTO Capstone 2026', size=9, color=GREY)
    text(s, Inches(10.7), Inches(7.08), Inches(2.03), Inches(0.25), str(slide_no[0]), size=9, color=GREY, align=PP_ALIGN.RIGHT)
    return s

def divider(n, title, question, icon_words):
    s = base('', '', dark=True)
    glow = s.shapes.add_shape(MSO_SHAPE.OVAL, Inches(8.2), Inches(-1.5), Inches(7.5), Inches(7.5)); glow.fill.solid(); glow.fill.fore_color.rgb = rgb(NAVY2); glow.line.fill.background()
    ring = s.shapes.add_shape(MSO_SHAPE.OVAL, Inches(9.1), Inches(-0.6), Inches(5.7), Inches(5.7)); ring.fill.background(); ring.line.color.rgb = rgb('2b4f86'); ring.line.width = Pt(1.5)
    text(s, Inches(0.9), Inches(1.3), Inches(4), Inches(2.2), f'{n:02d}', size=150, bold=True, color='86b6ef')
    text(s, Inches(0.95), Inches(3.75), Inches(9), Inches(0.9), title, size=46, bold=True, color='ffffff')
    text(s, Inches(0.97), Inches(4.75), Inches(9.5), Inches(0.8), question, size=20, color='c7d8f5')
    for k, p in enumerate(PHASES):  # phase rail
        on = k + 1 == n
        b = box(s, Inches(0.97) + Inches(1.95) * k, Inches(6.25), Inches(1.8), Inches(0.42), fill=('2563eb' if on else NAVY2), line=('86b6ef' if on else '2b4f86'), radius=0.5)
        fill_text(b, f'{k + 1} · {p}', size=10, bold=on, color='ffffff' if on else '9fb6d8')
    text(s, Inches(9.6), Inches(2.1), Inches(3.2), Inches(1.6), icon_words, size=16, color='9fb6d8', align=PP_ALIGN.RIGHT)
    return s

def card(s, x, y, w, h, title=None, top=None, fill='ffffff', line=LINE):
    c = box(s, x, y, w, h, fill=fill, line=line, radius=0.06)
    if top: box(s, x, y, w, Inches(0.09), fill=top, radius=0.5)
    if title: text(s, x + Inches(0.18), y + Inches(0.16), w - Inches(0.36), Inches(0.4), title, size=15, bold=True, color=NAVY)
    return c

def chevrons(s, items, x, y, w, h, colors=None, size=13):
    n = len(items); cw = w / n
    pal = colors or [NAVY, NAVY2, '1f4f94', BLUE, '4b86ee', LIGHT]
    for i, t in enumerate(items):
        shp = s.shapes.add_shape(MSO_SHAPE.CHEVRON if i else MSO_SHAPE.PENTAGON, int(x + i * cw), y, int(cw + Inches(0.12)), h)
        shp.fill.solid(); shp.fill.fore_color.rgb = rgb(pal[i % len(pal)]); shp.line.fill.background()
        fill_text(shp, t.split('|'), size=size, bold=True, color=NAVY if pal[i % len(pal)] == LIGHT else 'ffffff')

def style_chart(ch, legend=True, size=11):
    ch.font.size = Pt(size); ch.font.name = FONT; ch.font.color.rgb = rgb(INK2)
    ch.has_legend = legend
    if legend: ch.legend.position = XL_LEGEND_POSITION.BOTTOM; ch.legend.include_in_layout = False; ch.legend.font.size = Pt(size)

def progress(s, x, y, w, name, b, n, t, unit, color):
    p = max(0, min(100, round((n - b) / (t - b) * 100)))
    text(s, x, y, w * 0.72, Inches(0.28), name, size=12, bold=True, color=NAVY)
    text(s, x + w * 0.6, y, w * 0.4, Inches(0.28), f'{p}% of gap closed', size=10, color=INK3, align=PP_ALIGN.RIGHT)
    box(s, x, y + Inches(0.32), w, Inches(0.16), fill='e8eef7', radius=0.5)
    if p: box(s, x, y + Inches(0.32), int(w * p / 100), Inches(0.16), fill=color, radius=0.5)
    text(s, x, y + Inches(0.52), w, Inches(0.25), [[(f'Old {b}{unit}', False, INK3), (f'     Now {n}{unit}     ', True, NAVY), (f'Target {t}{unit}', False, INK3)]], size=10)

L = {l['id']: l for l in D['layers']}
V = D['value']; atRisk = round(V['amber'] + V['red'], 1)
score = round(sum(l['current'] for l in D['layers']) / 6)
score3 = round(sum(l['series'][8] for l in D['layers']) / 6)

# ══════════════════════════ 1. COVER ══════════════════════════
s = base('', '', dark=True)
g = s.shapes.add_shape(MSO_SHAPE.OVAL, Inches(7.6), Inches(-2.2), Inches(8.5), Inches(8.5)); g.fill.solid(); g.fill.fore_color.rgb = rgb(NAVY2); g.line.fill.background()
for r_, c_ in ((5.9, '2b4f86'), (4.1, '3a64a5'), (2.3, '86b6ef')):
    o = s.shapes.add_shape(MSO_SHAPE.OVAL, Inches(11.0 - r_ / 2), Inches(2.0 - r_ / 2), Inches(r_), Inches(r_)); o.fill.background(); o.line.color.rgb = rgb(c_); o.line.width = Pt(1.25)
core = s.shapes.add_shape(MSO_SHAPE.OVAL, Inches(10.2), Inches(1.2), Inches(1.6), Inches(1.6)); core.fill.solid(); core.fill.fore_color.rgb = rgb(BLUE); core.line.fill.background()
fill_text(core, ['AI recommends', 'Humans decide'], size=10, bold=True)
text(s, Inches(0.8), Inches(0.75), Inches(8), Inches(0.35), 'CTO CAPSTONE PROJECT · 2026', size=13, bold=True, color='86b6ef')
text(s, Inches(0.8), Inches(1.35), Inches(8.6), Inches(2.4), ['Domain-Agnostic Enterprise', 'AI Transformation Framework'], size=46, bold=True, color='ffffff', spacing=0.95)
text(s, Inches(0.82), Inches(3.35), Inches(8.5), Inches(0.5), 'Implemented as CTO360 · Technology Control Plane', size=20, color='86b6ef')
text(s, Inches(0.82), Inches(3.9), Inches(8.2), Inches(0.8), 'One governed way to see, fund, run and transform technology across any industry. AI recommends, humans decide.', size=15, color='c7d8f5')
for k, (key, name, role, *_ ) in enumerate(TEAM):
    x = Inches(0.85) + Inches(2.85) * k
    photo(s, key, x, Inches(5.05), Inches(1.15))
    text(s, x + Inches(1.3), Inches(5.3), Inches(1.6), Inches(0.35), name, size=15, bold=True, color='ffffff')
    text(s, x + Inches(1.3), Inches(5.66), Inches(1.6), Inches(0.5), role, size=11, color='9fb6d8')
text(s, Inches(0.85), Inches(6.75), Inches(9), Inches(0.3), 'Live demonstration: cto360.vercel.app  ·  Simulated enterprise with credited public datasets', size=11, color='9fb6d8')

# ══════════════════════════ 2. AGENDA ══════════════════════════
s = base('Agenda', 'Six Phases, One Story', 'From the problem enterprises face today to what we recommend for business, society and individuals.')
qs = ['Why this matters now, and who we are', 'What exactly is broken, and why', 'How we designed, built and validated the framework', 'What we built and what the evidence shows', 'What business, society and individuals should do', 'Our answer, its limits, and next steps']
for k, (p, q) in enumerate(zip(PHASES, qs)):
    x = Inches(0.6) + Inches(2.03) * k
    c = card(s, x, Inches(2.05), Inches(1.88), Inches(3.9), top=[NAVY, NAVY2, '1f4f94', BLUE, '4b86ee', '60a5fa'][k])
    text(s, x + Inches(0.18), Inches(2.35), Inches(1.6), Inches(1.0), f'{k + 1:02d}', size=44, bold=True, color=[NAVY, NAVY2, '1f4f94', BLUE, '4b86ee', '60a5fa'][k])
    text(s, x + Inches(0.15), Inches(3.4), Inches(1.68), Inches(0.8), p, size=15, bold=True, color=NAVY)
    text(s, x + Inches(0.18), Inches(4.25), Inches(1.6), Inches(1.5), q, size=12, color=INK2)
text(s, Inches(0.6), Inches(6.25), Inches(12), Inches(0.4), [[('About 20 minutes', True, NAVY), (' · every presenter owns a business problem · live demonstration in phase 4 · questions at the end', False, INK2)]], size=13)

# ══════════════════════════ PHASE 1 · INTRODUCTION ══════════════════════════
divider(1, 'Introduction', 'Why does a CTO need a new way to steer AI-led transformation, and who are we?', 'Context\nTeam\nWhere we started')

s = base('Phase 1 · Introduction', 'Why Now: Pressure From Four Directions', 'AI spending is rising faster than anyone can prove its value, while regulation and tool sprawl make control harder.', phase=1, who='ramkumar')
tiles = [('AI value is unproven', f'₹{atRisk} Cr', f'of ₹{V["total"]} Cr expected initiative value is at risk ({round(atRisk / V["total"] * 100)}%) in our simulated enterprise', WARN),
         ('Regulation is accelerating', '22', 'real RBI notifications in just two weeks (23 Sep to 7 Oct 2026); plus DPDP Act duties', BLUE),
         ('Technology is ageing', '12 of 20', 'matched technology versions are already past real vendor end of life', CRIT),
         ('Tools do not connect', '7', 'specialist platforms (portfolio, architecture, process, workflow, engineering, operations, risk); none answers "what matters most?"', NAVY)]
for k, (h_, big, sub, col) in enumerate(tiles):
    x = Inches(0.6) + Inches(3.05) * k
    card(s, x, Inches(2.1), Inches(2.85), Inches(3.6), top=col)
    text(s, x + Inches(0.22), Inches(2.4), Inches(2.4), Inches(0.5), h_, size=14, bold=True, color=NAVY)
    text(s, x + Inches(0.22), Inches(2.95), Inches(2.5), Inches(1.0), big, size=40, bold=True, color=col)
    text(s, x + Inches(0.22), Inches(4.05), Inches(2.45), Inches(1.6), sub, size=12, color=INK2)
text(s, Inches(0.6), Inches(6.05), Inches(12.1), Inches(0.6), [[('So what: ', True, NAVY), ('the CTO is asked to prove outcomes and stay compliant, with signals scattered across tools and business units. That is a decision problem, not a data problem.', False, INK2)]], size=14)

s = base('Phase 1 · Introduction', 'From Concept To Working Framework', 'We started in September 2026 with a concept chart of a "Universal CTO Control Tower"; by October it was a working, measured framework.', phase=1, who='ramkumar')
im = Image.open(ASSETS / 'concept.jpg'); hh = Inches(5.15); ww = int(hh * im.width / im.height)
s.shapes.add_picture(str(ASSETS / 'concept.jpg'), Inches(0.75), Inches(1.85), ww, hh)
text(s, Inches(0.75), Inches(7.0) - Inches(0.02), ww, Inches(0.2), '', size=8)
x0 = Inches(0.75) + ww + Inches(0.5)
steps = [('Sep 2026 · Concept', 'One CTO vision across banking and manufacturing; owners for strategy, operations, finance, regulation and governance.'),
         ('Early Oct · Simulation', '3 business units, 7 source systems, 16 functions; every score calculated and cross-checked automatically.'),
         ('Mid Oct · Team workspaces', 'Each owner moves a real business problem from old state to target state, measurably.'),
         ('Late Oct · Control plane', 'One CTO home screen: six control layers, live impact chain, blast radius, executive summary.'),
         ('Validation', 'Six real public datasets used as reality checks beside the simulation.')]
yy = Inches(1.95)
for k, (h_, b_) in enumerate(steps):
    dot = s.shapes.add_shape(MSO_SHAPE.OVAL, x0, yy + Inches(0.05), Inches(0.36), Inches(0.36)); dot.fill.solid(); dot.fill.fore_color.rgb = rgb([NAVY, NAVY2, '1f4f94', BLUE, OK][k]); dot.line.fill.background()
    fill_text(dot, str(k + 1), size=11, bold=True)
    if k < 4: box(s, x0 + Inches(0.165), yy + Inches(0.43), Inches(0.03), Inches(0.62), fill=LINE)
    text(s, x0 + Inches(0.55), yy, Inches(6.2), Inches(0.3), h_, size=15, bold=True, color=NAVY)
    text(s, x0 + Inches(0.55), yy + Inches(0.32), Inches(6.2), Inches(0.7), b_, size=12, color=INK2)
    yy += Inches(1.0)

s = base('Phase 1 · Introduction', 'Meet The Team', 'Each of us owns a real business problem and a live workspace in the framework.', phase=1, who='ramkumar')
for k, (key, name, role, prob, col) in enumerate(TEAM):
    x = Inches(0.6) + Inches(4.1) * k
    card(s, x, Inches(2.0), Inches(3.9), Inches(3.75), top=col)
    photo(s, key, x + Inches(1.3), Inches(2.3), Inches(1.3))
    text(s, x + Inches(0.2), Inches(3.7), Inches(3.5), Inches(0.4), name, size=20, bold=True, color=NAVY, align=PP_ALIGN.CENTER)
    text(s, x + Inches(0.2), Inches(4.12), Inches(3.5), Inches(0.35), role, size=13, bold=True, color=col, align=PP_ALIGN.CENTER)
    text(s, x + Inches(0.3), Inches(4.55), Inches(3.3), Inches(1.0), prob, size=12, color=INK2, align=PP_ALIGN.CENTER)
c = card(s, Inches(0.6), Inches(5.95), Inches(12.1), Inches(0.85), fill=TINT, line=TINT)
text(s, Inches(0.85), Inches(6.08), Inches(11.7), Inches(0.6), [[('Clear splits remove overlap: ', True, NAVY), ('Suman identifies ROI before spend and Santosh proves value after spend. Regulatory and AI governance, and ERP and capacity, run as dedicated workstreams in the framework.', False, INK2)]], size=13)

# ══════════════════════════ PHASE 2 · PROBLEM ══════════════════════════
divider(2, 'Problem Statement', 'What exactly is broken in how enterprises steer AI-led transformation?', 'Statement\nRoot causes\nThree industries')

s = base('Phase 2 · Problem Statement', 'The Problem We Set Out To Solve', phase=2, who='ramkumar')
c = box(s, Inches(0.6), Inches(1.45), Inches(12.1), Inches(1.55), fill=TINT, radius=0.06)
box(s, Inches(0.6), Inches(1.45), Inches(0.12), Inches(1.55), fill=BLUE)
text(s, Inches(1.0), Inches(1.62), Inches(11.5), Inches(1.3), [[('Enterprises cannot ', True, NAVY), ('see, govern, fund and run', True, BLUE), (' AI-led transformation as one system, so they cannot prove that technology spend produced business outcomes.', True, NAVY)]], size=22)
verbs = [('See', 'One comparable view across units, tools and functions', NAVY), ('Govern', 'Regulation, AI models and data under control, with evidence', '7c3aed'), ('Fund', 'Every rupee traceable to a service and to value', '0e9f6e'), ('Run', 'Root causes fixed, capacity ready before the peak', WARN), ('Transform', 'Any organisation moved from AI pilots to measured value', BLUE)]
for k, (v_, d_, col) in enumerate(verbs):
    x = Inches(0.6) + Inches(2.45) * k
    card(s, x, Inches(3.3), Inches(2.3), Inches(2.35), top=col)
    text(s, x + Inches(0.2), Inches(3.55), Inches(2), Inches(0.5), v_, size=24, bold=True, color=col)
    text(s, x + Inches(0.2), Inches(4.15), Inches(1.95), Inches(1.4), d_, size=13, color=INK2)
text(s, Inches(0.6), Inches(5.95), Inches(12.1), Inches(0.8), [[('Research question: ', True, NAVY), ('can one domain-agnostic framework connect signals from existing tools into owned, measured decisions, and work across banking, manufacturing and retail without being rebuilt?', False, INK2)]], size=14)

s = base('Phase 2 · Problem Statement', 'Root Causes: Signals Live In Silos', 'Each tool answers its own question. None answers the CTO question: what matters most, and what should we decide?', phase=2, who='ramkumar')
tools = [('Planview', 'Strategy'), ('SAP LeanIX', 'Architecture'), ('Celonis + Signavio', 'Process'), ('ServiceNow SPM', 'Workflow'), ('Jellyfish', 'Engineering'), ('Datadog', 'Operations'), ('Vanta', 'Risk')]
for k, (t_, a_) in enumerate(tools):
    col_, row_ = k % 2, k // 2
    b = box(s, Inches(0.7) + Inches(2.85) * col_, Inches(2.05) + Inches(1.05) * row_, Inches(2.65), Inches(0.85), fill=TINT, line='cfdaea', radius=0.15)
    fill_text(b, [t_, f'answers: {a_}'], size=12, bold=False, color=NAVY)
q = box(s, Inches(3.55), Inches(5.2), Inches(2.65), Inches(0.85), fill='fff1f2', line='fca5a5', radius=0.15)
fill_text(q, ['What matters most?', 'no tool answers this'], size=13, bold=True, color='b91c1c')
bullets(s, Inches(6.75), Inches(2.05), Inches(5.9), [
    ('Fragmented signals.', 'Strategy, architecture, process, delivery, operations and risk each sit in a different tool.'),
    ('Cause and effect span tools.', 'A payments programme slips because of legacy dependencies, a capacity gap and rising incidents; no tool shows the chain.'),
    ('Reporting is not deciding.', 'Dashboards are plentiful, but signal to decision to outcome is manual and rarely closed.'),
    ('Spend is hard to defend.', 'Value realised and risk avoided are not tied to decisions.'),
    ('Every unit reports differently,', 'so money and people cannot be moved with confidence.')], size=13, gap=0.12)

s = base('Phase 2 · Problem Statement', 'Same Problem, Three Industries', 'The pattern repeats across industries, so the answer must be built once and configured per industry.', phase=2, who='suman')
dom = [('Banking', 'Meridian Bank', '2a78d6', 'Legacy core and integration layer slowing digital payments; technology debt behind P1 incidents.', ['Q4 payments milestone at risk', '₹38.9 Cr value at stake', 'Regulatory exposure (RBI, DPDP)']),
       ('Manufacturing', 'Arvant Industries', '1baf7a', 'MES and plant system instability causing line stops; smart factory programme delayed.', ['Lost production hours', 'Late deliveries', 'OEE target missed']),
       ('Retail', 'Orbit Retail', 'eb6834', 'Festive peak readiness and inventory sync; engineering capacity stretched.', ['Lost festive sales', 'Overselling and stockouts', 'Point-of-sale security risk'])]
for k, (d_, n_, col, p_, costs) in enumerate(dom):
    x = Inches(0.6) + Inches(4.1) * k
    card(s, x, Inches(2.0), Inches(3.9), Inches(4.75), top=col)
    tag = box(s, x + Inches(0.22), Inches(2.3), Inches(1.6), Inches(0.36), fill=col, radius=0.3); fill_text(tag, d_.upper(), size=10, bold=True)
    text(s, x + Inches(0.22), Inches(2.8), Inches(3.5), Inches(0.45), n_, size=20, bold=True, color=NAVY)
    text(s, x + Inches(0.22), Inches(3.3), Inches(3.45), Inches(1.3), [[('Business problem: ', True, NAVY), (p_, False, INK2)]], size=13)
    text(s, x + Inches(0.22), Inches(4.65), Inches(3.4), Inches(0.3), 'WHAT IT COSTS', size=10, bold=True, color=INK3)
    bullets(s, x + Inches(0.22), Inches(4.95), Inches(3.4), costs, size=12, gap=0.04, dot=col, h_each=Inches(0.3))

# ══════════════════════════ PHASE 3 · METHODOLOGY ══════════════════════════
divider(3, 'Methodology', 'How did we design, build and validate the framework?', 'Design science\nArchitecture\nFrameworks\nValidation')

s = base('Phase 3 · Methodology', 'Research Approach: Design Science', 'We followed the design science method: build a working artefact to solve a real problem, then evaluate it with evidence.', phase=3, who='ramkumar')
chevrons(s, ['Identify|problem', 'Define|objectives', 'Design &|build', 'Demonstrate', 'Evaluate', 'Communicate'], Inches(0.6), Inches(2.0), Inches(12.0), Inches(0.95), size=13)
what = [('Five business problems (BP1) from each owner; problem matrix across 3 industries', 'Phase 2'),
        ('Move each area from old state to target state, measurably; AI recommends, humans decide', 'TEDIF'),
        ('Canonical data model, 7 simulated sources, 16 functions, decision engine, control plane', 'CTO360'),
        ('Live site with a simulation clock and a 6-step golden-thread scenario across owners', 'Demo'),
        ('Calculated measures, statistics, automated consistency checks, 6 real datasets', 'Phase 4'),
        ('Executive summary, presentation mode, notes and this deck', 'Outputs')]
for k, (w_, tag_) in enumerate(what):
    x = Inches(0.6) + Inches(2.0) * k
    card(s, x, Inches(3.2), Inches(1.9), Inches(2.9))
    t = box(s, x + Inches(0.15), Inches(3.35), Inches(1.1), Inches(0.3), fill=TINT, radius=0.4); fill_text(t, tag_, size=9, bold=True, color=BLUE)
    text(s, x + Inches(0.15), Inches(3.8), Inches(1.65), Inches(2.2), w_, size=12, color=INK2)
text(s, Inches(0.6), Inches(6.35), Inches(12.1), Inches(0.5), [[('Why design science: ', True, NAVY), ('the deliverable is a working framework, so it must be built and shown to work, not only described.', False, INK2)]], size=13)

s = base('Phase 3 · Methodology', 'Solution Design: The TEDIF Decision Loop', 'Trusted Enterprise Decision Intelligence Framework: signals become owned, measured decisions under human control.', phase=3, who='ramkumar')
chevrons(s, ['Signal', 'Correlation', 'Insight', 'Decision', 'Action', 'Outcome'], Inches(0.6), Inches(2.0), Inches(12.0), Inches(1.0), size=14)
bullets(s, Inches(0.6), Inches(3.4), Inches(7.2), [
    ('Signal:', 'live events from the seven source systems, each tied to a record.'),
    ('Correlation:', 'records linked across tools through shared IDs, so one root issue is one story.'),
    ('Insight and decision:', 'a prioritised Top 10 with impact, money asked versus value protected, confidence, owner and deadline.'),
    ('Action and outcome:', 'approved decisions become actions, tracked against baseline and target.')], size=14, gap=0.14)
g = box(s, Inches(8.3), Inches(3.4), Inches(4.4), Inches(3.2), fill=NAVY, radius=0.06)
text(s, Inches(8.6), Inches(3.62), Inches(3.9), Inches(0.3), 'GOVERNANCE PRINCIPLE', size=11, bold=True, color='86b6ef')
text(s, Inches(8.6), Inches(3.95), Inches(3.9), Inches(1.2), ['AI Recommends.', 'Humans Decide.'], size=28, bold=True, color='ffffff', spacing=0.95)
text(s, Inches(8.6), Inches(5.2), Inches(3.9), Inches(1.3), 'A named person decides at every gate; every step is recorded in an audit trail; models above the drift limit are restricted.', size=13, color='c7d8f5')

s = base('Phase 3 · Methodology', 'Architecture: Build Once, Configure Per Industry', '3 business units × 7 source systems × 16 enterprise functions on one data model, rolled up into six control layers.', phase=3, who='ramkumar')
layers_ = [('Team workspaces & control plane', 'Executive summary · impact chain · blast radius · 5 owner workspaces', NAVY), ('Decision intelligence', 'Top 10 decisions · actions · outcomes · audit trail', NAVY2), ('Scoring & correlation', '16 functions × 6 metrics · health scores · statistics', '1f4f94'), ('Canonical data model', 'shared record IDs across initiatives, apps, processes, incidents, risks, spend', BLUE)]
for k, (t_, d_, col) in enumerate(layers_):
    y = Inches(1.95) + Inches(0.72) * k
    b = box(s, Inches(0.6) + Inches(0.25) * k, y, Inches(7.4) - Inches(0.5) * k, Inches(0.6), fill=col, radius=0.15)
    text(s, Inches(0.8) + Inches(0.25) * k, y + Inches(0.06), Inches(7.0) - Inches(0.5) * k, Inches(0.5), [[(t_ + '   ', True, 'ffffff'), (d_, False, 'dbe7fb')]], size=12, anchor=MSO_ANCHOR.MIDDLE)
for k, (t_, a_) in enumerate(tools):
    b = box(s, Inches(0.6) + Inches(1.07) * k, Inches(4.95), Inches(0.98), Inches(0.75), fill=TINT, line='cfdaea', radius=0.12)
    fill_text(b, [t_.split(' ')[0] if len(t_) > 11 else t_, a_], size=9, color=NAVY)
text(s, Inches(0.6), Inches(5.78), Inches(7.4), Inches(0.3), '7 simulated source systems, one per enterprise question', size=11, color=INK3, align=PP_ALIGN.CENTER)
card(s, Inches(8.4), Inches(1.95), Inches(4.3), Inches(4.6), title='Six Control Layers')
for k, (lab, own, col) in enumerate([('Business', 'capabilities & processes', NAVY), ('Data & AI', 'AI portfolio & models', NAVY2), ('Application', 'portfolio & lifecycle', '1f4f94'), ('Technology', 'platforms & operations', BLUE), ('Security & risk', 'cross-cutting', '7c3aed'), ('Spend & value', 'cross-cutting', '0e9f6e')]):
    y = Inches(2.55) + Inches(0.62) * k
    box(s, Inches(8.6), y, Inches(0.12), Inches(0.45), fill=col, radius=0.5)
    text(s, Inches(8.85), y - Inches(0.02), Inches(3.7), Inches(0.5), [[(lab, True, NAVY)], [(own, False, INK3)]], size=12, spacing=0.95)
text(s, Inches(0.6), Inches(6.25), Inches(7.6), Inches(0.5), [[('Domain-agnostic proof: ', True, NAVY), ('Retail was added by configuration only, with no new code.', False, INK2)]], size=13)

s = base('Phase 3 · Methodology', 'Frameworks Applied, Not Just Listed', 'Lean by design: a framework is used only where it serves an owner\'s problem and produces a tracked metric.', phase=3, who='suman')
tiers = [('16', 'Frameworks applied with tracked metrics', 'Balanced Scorecard · Cynefin · RAPID · OODA · Three Horizons · Diffusion · Crossing the Chasm · Business Model Canvas · Three Lines · Run-Grow-Transform · TCO · Sensitivity · Theory of Constraints · Lewin · Kotter · ADKAR', NAVY, 7.2),
         ('15', 'Built into the screens', 'Stage-Gate · Value vs Effort · NPV / IRR / ROI · maturity models · risk heat map · RACI · ITIL · 5 Whys · Pareto · SRE · TBM · FinOps · TOGAF ADM · TIME model · TEDIF', '1f4f94', 9.0),
         ('10', 'Analytics techniques computed live', 'Holt-Winters · EWMA anomalies · Monte Carlo · NPV / IRR · S-curve · PSI drift · Pareto · queueing · error budget · Pearson correlation', BLUE, 10.8),
         ('69', 'Reference library', 'Every framework, technique and concept explained with a diagram and the business question it answers', LIGHT, 12.1)]
for k, (n_, t_, d_, col, wdt) in enumerate(tiers):
    x = Inches(0.6) + (Inches(12.1) - Inches(wdt)) / 2; y = Inches(1.95) + Inches(1.12) * k
    b = box(s, x, y, Inches(wdt), Inches(1.0), fill=col, radius=0.12)
    fc = NAVY if col == LIGHT else 'ffffff'
    text(s, x + Inches(0.25), y + Inches(0.12), Inches(1.0), Inches(0.8), n_, size=34, bold=True, color=fc, anchor=MSO_ANCHOR.MIDDLE)
    text(s, x + Inches(1.3), y + Inches(0.1), Inches(wdt) - Inches(1.5), Inches(0.85), [[(t_, True, fc)], [(d_, False, NAVY if col == LIGHT else 'dbe7fb')]], size=11, spacing=1.0)
text(s, Inches(0.6), Inches(6.45), Inches(12.1), Inches(0.4), [[('"You do not need 100 frameworks." ', True, NAVY), ('Choose the right one when a CEO, CFO or COO brings a problem, and measure it.', False, INK2)]], size=13, align=PP_ALIGN.CENTER)

s = base('Phase 3 · Methodology', 'Measurement And Validation', 'Every area is measured from old state to target state, and every number is calculated and checked, never typed by hand.', phase=3, who='santosh')
cd = CategoryChartData(); months = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct']
trend = [round(sum(l['series'][k] for l in D['layers']) / 6) for k in range(12)]
cd.categories = months
cd.add_series('Actual control score', trend)
cd.add_series('Straight-line plan to target', [round(trend[0] + (85 - trend[0]) * k / 15) for k in range(12)])
cd.add_series('Target', [85] * 12)
gf = s.shapes.add_chart(XL_CHART_TYPE.LINE, Inches(0.6), Inches(1.9), Inches(7.0), Inches(4.4), cd); ch = gf.chart; style_chart(ch)
ch.value_axis.minimum_scale = 40; ch.value_axis.maximum_scale = 100; ch.value_axis.major_gridlines.format.line.color.rgb = rgb('e2e8f0')
for ser, col, dash in zip(ch.series, [BLUE, GREY, NAVY], [None, 'dash', 'sysDash']):
    ser.format.line.color.rgb = rgb(col); ser.format.line.width = Pt(2.75 if col == BLUE else 1.75); ser.smooth = False
    ser.marker.style = XL_MARKER_STYLE.CIRCLE if col == BLUE else XL_MARKER_STYLE.NONE
    if dash: ser.format.line.dash_style = MSO_LINE_DASH_STYLE.DASH if dash == 'dash' else MSO_LINE_DASH_STYLE.SQUARE_DOT
text(s, Inches(0.6), Inches(6.35), Inches(7.0), Inches(0.5), 'Glide path: progress against time used shows Ahead, On Track or Behind early.', size=11, color=INK3)
card(s, Inches(8.0), Inches(1.9), Inches(4.7), Inches(4.85), title='How We Validated')
checks = [('30 measures', 'baseline Nov 2025 → now → target, 6 per owner'), ('Calculated, never typed', 'every status, score and decision is derived from linked records'),
          ('Automated consistency checks', '3 domains + team cross-checks on every build'), ('Statistics', 'Pearson correlation, regression, Monte Carlo, PSI drift'),
          ('6 real public datasets', 'RBI, CISA, Kaggle, UCI, FinOps FOCUS, endoflife.date'), ('Quality checks', 'every page at desktop, tablet and phone; every link tested')]
y = Inches(2.5)
for h_, b_ in checks:
    tick = s.shapes.add_shape(MSO_SHAPE.OVAL, Inches(8.22), y + Inches(0.03), Inches(0.3), Inches(0.3)); tick.fill.solid(); tick.fill.fore_color.rgb = rgb(OK); tick.line.fill.background(); fill_text(tick, '✓', size=11, bold=True)
    text(s, Inches(8.65), y - Inches(0.02), Inches(3.9), Inches(0.68), [[(h_, True, NAVY)], [(b_, False, INK2)]], size=11, spacing=0.98)
    y += Inches(0.7)

# ══════════════════════════ PHASE 4 · RESULTS ══════════════════════════
divider(4, 'Results', 'What did we build, and what does the evidence show?', 'Live control plane\nMeasured outcomes\nStatistics\nReal data')

s = base('Phase 4 · Results', 'What We Built: The Technology Control Plane', 'A live CTO home screen: see what is at risk, why it is happening, and what to decide next, across every part of technology.', phase=4, who='ramkumar')
laptop(s, 'cp-top.png', Inches(0.75), Inches(1.95), Inches(7.3))
bullets(s, Inches(8.55), Inches(2.0), Inches(4.2), [
    ('Executive summary:', 'a CTO briefing written from the live numbers, a unit × layer heat matrix and four board charts.'),
    ('Real-time impact chain:', 'signal → application → capability → initiative → ₹ at risk → decision.'),
    ('Blast radius and TOGAF ADM:', 'everything one signal touches; where each initiative sits in architecture change.'),
    ('Five team workspaces', 'and a Decision Center with actions and measured outcomes.'),
    ('Present mode:', 'a zero-scroll cockpit for the boardroom.')], size=13, gap=0.12)
text(s, Inches(8.55), Inches(6.35), Inches(4.2), Inches(0.4), [[('Live: ', True, NAVY), ('cto360.vercel.app', True, BLUE)]], size=14)

s = base('Phase 4 · Results', 'Enterprise Results At A Glance', 'Calculated across all three business units, with every number traceable to the underlying records.', phase=4, who='ramkumar')
big = [(f'{score}/100', 'Technology control score', f'target 85 · up {score - score3} points in 3 months', WARN), (f'₹{atRisk} Cr', 'Value at risk', f'{round(atRisk / V["total"] * 100)}% of ₹{V["total"]} Cr expected', CRIT), ('86', 'Strongest layer: Technology', 'already above target 85', OK), ('70', 'Weakest layer: Security & risk', 'gap of 15 points', CRIT)]
for k, (n_, t_, sub, col) in enumerate(big):
    y = Inches(1.95) + Inches(1.18) * k
    card(s, Inches(0.6), y, Inches(3.5), Inches(1.05))
    box(s, Inches(0.6), y, Inches(0.1), Inches(1.05), fill=col)
    text(s, Inches(0.85), y + Inches(0.08), Inches(3.2), Inches(0.55), n_, size=26, bold=True, color=col)
    text(s, Inches(0.85), y + Inches(0.58), Inches(3.2), Inches(0.45), [[(t_ + ' · ', True, NAVY), (sub, False, INK3)]], size=10)
cd = CategoryChartData(); cd.categories = [l['label'] for l in D['layers']]
cd.add_series('Nov 2025', [l['baseline'] for l in D['layers']]); cd.add_series('Now', [l['current'] for l in D['layers']])
gf = s.shapes.add_chart(XL_CHART_TYPE.BAR_CLUSTERED, Inches(4.35), Inches(1.85), Inches(4.7), Inches(4.95), cd); ch = gf.chart; style_chart(ch, size=10)
ch.value_axis.minimum_scale = 0; ch.value_axis.maximum_scale = 100; ch.value_axis.major_gridlines.format.line.color.rgb = rgb('e2e8f0'); ch.category_axis.reverse_order = True
ch.plots[0].gap_width = 60; ch.plots[0].overlap = -10
ch.series[0].format.fill.solid(); ch.series[0].format.fill.fore_color.rgb = rgb(GREY)
ch.series[1].format.fill.solid(); ch.series[1].format.fill.fore_color.rgb = rgb(BLUE)
ch.has_title = True; ch.chart_title.text_frame.text = 'Layer Scores: Nov 2025 vs Now (Target 85)'; ch.chart_title.text_frame.paragraphs[0].runs[0].font.size = Pt(12); ch.chart_title.text_frame.paragraphs[0].runs[0].font.bold = True
cd = CategoryChartData(); cd.categories = [f'On track ₹{V["green"]} Cr', f'At risk ₹{V["amber"]} Cr', f'Off track ₹{V["red"]} Cr']; cd.add_series('Expected value ₹ Cr', [V['green'], V['amber'], V['red']])
gf = s.shapes.add_chart(XL_CHART_TYPE.DOUGHNUT, Inches(9.2), Inches(1.85), Inches(3.5), Inches(4.95), cd); ch = gf.chart; style_chart(ch, size=10)
for pt, col in zip(ch.plots[0].series[0].points, [OK, WARN, CRIT]): pt.format.fill.solid(); pt.format.fill.fore_color.rgb = rgb(col)
ch.plots[0].has_data_labels = True; dl = ch.plots[0].data_labels; dl.number_format = '0'; dl.number_format_is_linked = False; dl.font.size = Pt(10); dl.font.bold = True; dl.font.color.rgb = rgb('ffffff')
ch.has_title = True; ch.chart_title.text_frame.text = f'Expected Value ₹{V["total"]} Cr'; ch.chart_title.text_frame.paragraphs[0].runs[0].font.size = Pt(12); ch.chart_title.text_frame.paragraphs[0].runs[0].font.bold = True

s = base('Phase 4 · Results', 'Results By Business Unit And Workstream', 'Same scale everywhere, so leaders can compare units and see which workstream is closing its gap.', phase=4, who='suman')
mx = D['matrix']; units = ['Banking', 'Manufacturing', 'Retail', 'All']
tbl = s.shapes.add_table(len(mx) + 1, 5, Inches(0.6), Inches(1.95), Inches(5.7), Inches(4.4)).table
tbl.columns[0].width = Inches(1.5)
for j in range(1, 5): tbl.columns[j].width = Inches(1.05)
hdr = ['Layer'] + units
for j, h_ in enumerate(hdr):
    c = tbl.cell(0, j); c.fill.solid(); c.fill.fore_color.rgb = rgb(NAVY); c.text = h_
    p = c.text_frame.paragraphs[0]; p.alignment = PP_ALIGN.CENTER if j else PP_ALIGN.LEFT; r = p.runs[0]; r.font.size = Pt(9.5 if j else 11); r.font.bold = True; r.font.color.rgb = rgb('ffffff'); r.font.name = FONT
    c.margin_left = c.margin_right = Inches(0.03)
for i, row in enumerate(mx, start=1):
    vals = [row['label']] + row['cells'] + [row['all']]
    for j, v_ in enumerate(vals):
        c = tbl.cell(i, j); c.text = str(v_); p = c.text_frame.paragraphs[0]; r = p.runs[0]; r.font.name = FONT; r.font.size = Pt(13 if j else 12); r.font.bold = j > 0
        c.vertical_anchor = MSO_ANCHOR.MIDDLE
        if j == 0: c.fill.solid(); c.fill.fore_color.rgb = rgb('ffffff'); r.font.color.rgb = rgb(NAVY)
        else:
            col = OK if v_ >= 80 else WARN if v_ >= 60 else CRIT
            c.fill.solid(); c.fill.fore_color.rgb = rgb(col if j < 4 else 'ffffff'); r.font.color.rgb = rgb('ffffff' if j < 4 else col); p.alignment = PP_ALIGN.CENTER
text(s, Inches(0.6), Inches(6.4), Inches(5.6), Inches(0.4), 'Green 80 and above · Amber 60 to 79 · Red below 60 · Target 85', size=10, color=INK3)
ws = [('CTO Control Tower · Ramkumar', [('Signal-to-decision time', 21, 6, 3, ' d'), ('Decisions with measured outcome', 0, 22, 80, '%')], NAVY),
      ('AI Transformation · Suman', [('Pilot-to-production conversion', 18, 41, 60, '%'), ('Average AI payback (months)', 30, 24, 18, '')], BLUE),
      ('Spend & Investment · Santosh', [('Spend allocated to services (TBM)', 40, 72, 95, '%'), ('Cloud waste', 28, 17, 8, '%')], '0e9f6e'),
      ('Regulatory & AI governance · workstream', [('Breach reports on time', 50, 80, 100, '%')], '7c3aed'),
      ('ERP RCA & capacity · workstream', [('Recurring ERP problems', 14, 8, 3, '')], WARN)]
y = Inches(1.85)
for t_, rows, col in ws:
    text(s, Inches(6.6), y, Inches(6.1), Inches(0.28), t_, size=11, bold=True, color=col); y += Inches(0.27)
    for (n_, b_, now_, tg, u) in rows:
        p = max(0, min(100, round((now_ - b_) / (tg - b_) * 100)))
        text(s, Inches(6.6), y, Inches(3.3), Inches(0.26), n_, size=10, color=INK2)
        box(s, Inches(9.9), y + Inches(0.06), Inches(2.0), Inches(0.14), fill='e8eef7', radius=0.5)
        if p: box(s, Inches(9.9), y + Inches(0.06), int(Inches(2.0) * p / 100), Inches(0.14), fill=col, radius=0.5)
        text(s, Inches(11.95), y - Inches(0.02), Inches(0.8), Inches(0.26), f'{p}%', size=10, bold=True, color=NAVY, align=PP_ALIGN.RIGHT)
        text(s, Inches(6.6), y + Inches(0.22), Inches(6.1), Inches(0.24), f'{b_}{u} → now {now_}{u} → target {tg}{u}', size=9, color=INK3)
        y += Inches(0.46)
    y += Inches(0.02)

s = base('Phase 4 · Results', 'Statistical Evidence: Technical Debt Drives Incidents', f'Across {D["debt"]["n"]} applications, weaker technical health goes with more incidents. Correlation, not proof of cause.', phase=4, who='santosh')
xy = XyChartData(); ser = xy.add_series('Applications')
for x_, y_ in D['debt']['pts']: ser.add_data_point(x_, y_)
xs = [p[0] for p in D['debt']['pts']]; x0_, x1_ = min(xs), max(xs)
fit = xy.add_series('Regression line')
for x_ in (x0_, x1_): fit.add_data_point(x_, max(0, round(D['debt']['intercept'] + D['debt']['slope'] * x_, 2)))
gf = s.shapes.add_chart(XL_CHART_TYPE.XY_SCATTER, Inches(0.6), Inches(1.85), Inches(6.6), Inches(4.9), xy); ch = gf.chart; style_chart(ch, size=10)
ch.value_axis.major_gridlines.format.line.color.rgb = rgb('e2e8f0'); ch.category_axis.has_title = True; ch.category_axis.axis_title.text_frame.text = 'Technical health (0 to 100)'
ch.value_axis.has_title = True; ch.value_axis.axis_title.text_frame.text = 'Incidents, 30 days'
for at in (ch.category_axis.axis_title, ch.value_axis.axis_title): at.text_frame.paragraphs[0].runs[0].font.size = Pt(10)
p0 = ch.series[0]; p0.format.line.fill.background(); p0.marker.style = XL_MARKER_STYLE.CIRCLE; p0.marker.size = 8; p0.marker.format.fill.solid(); p0.marker.format.fill.fore_color.rgb = rgb(BLUE); p0.marker.format.line.color.rgb = rgb('ffffff')
p1 = ch.series[1]; p1.marker.style = XL_MARKER_STYLE.NONE; p1.format.line.color.rgb = rgb(CRIT); p1.format.line.width = Pt(2.5)
card(s, Inches(7.5), Inches(1.85), Inches(5.2), Inches(2.1))
text(s, Inches(7.75), Inches(2.0), Inches(4.8), Inches(0.8), f'r = {D["debt"]["r"]:.2f}', size=40, bold=True, color=CRIT)
text(s, Inches(7.75), Inches(2.85), Inches(4.8), Inches(1.0), f'Moderate negative correlation (Pearson). Every 10 points of lost technical health adds about {abs(D["debt"]["slope"] * 10):.1f} incidents a month per application.', size=12, color=INK2)
pu = D['debt']['perUnit']
card(s, Inches(7.5), Inches(4.1), Inches(2.5), Inches(2.65), title='By Business Unit')
for k, (u, lab) in enumerate([('banking', 'Banking'), ('manufacturing', 'Manufacturing'), ('retail', 'Retail')]):
    text(s, Inches(7.7), Inches(4.65) + Inches(0.62) * k, Inches(2.2), Inches(0.55), [[(lab, False, INK2)], [(f'r = {pu[u]:.2f}', True, CRIT if pu[u] <= -0.5 else NAVY)]], size=12, spacing=0.95)
card(s, Inches(10.2), Inches(4.1), Inches(2.5), Inches(2.65), title='TIME Portfolio')
for k, (q, n_) in enumerate(D['time']):
    col = {'Invest': OK, 'Tolerate': BLUE, 'Migrate': WARN, 'Eliminate': CRIT}[q]
    text(s, Inches(10.4), Inches(4.62) + Inches(0.5) * k, Inches(1.4), Inches(0.4), q, size=12, color=INK2)
    text(s, Inches(11.7), Inches(4.58) + Inches(0.5) * k, Inches(0.8), Inches(0.4), str(n_), size=17, bold=True, color=col, align=PP_ALIGN.RIGHT)

s = base('Phase 4 · Results', 'Validated On Real Public Data', 'Six credited public datasets sit beside the simulation as reality checks; they confirm the patterns are real.', phase=4, who='santosh')
real = [('endoflife.date', '12 of 20', 'matched technology versions are past real vendor end of life; the simulation was optimistic for 6', CRIT),
        ('RBI notifications', '22', 'real notifications in two weeks: the true regulatory intake to triage', BLUE),
        ('Kaggle card fraud', 'PSI 2.42', 'on 284,807 real transactions: stable day to day (0.19), sharp drift in fraud-wave hours', '7c3aed'),
        ('UCI ServiceNow log', '79.2%', 'of 24,918 real incidents come from 20% of categories; only 1.5% linked to a problem record', WARN),
        ('FinOps FOCUS billing', '62.7%', 'of real cloud cost is traceable to an application; 37% cannot be allocated', '0e9f6e'),
        ('CISA KEV catalogue', '1,734', 'vulnerabilities exploited in the wild; 103 added in 90 days; 361 used by ransomware', NAVY)]
for k, (src, big_, d_, col) in enumerate(real):
    x = Inches(0.6) + Inches(4.1) * (k % 3); y = Inches(1.95) + Inches(2.4) * (k // 3)
    card(s, x, y, Inches(3.9), Inches(2.2), top=col)
    text(s, x + Inches(0.22), y + Inches(0.25), Inches(3.5), Inches(0.3), f'REAL DATA · {src}', size=10, bold=True, color=OK)
    text(s, x + Inches(0.22), y + Inches(0.55), Inches(3.5), Inches(0.7), big_, size=32, bold=True, color=col)
    text(s, x + Inches(0.22), y + Inches(1.28), Inches(3.5), Inches(0.9), d_, size=11, color=INK2)
text(s, Inches(0.6), Inches(6.75) - Inches(0.05), Inches(12.1), Inches(0.3), 'Scores stay simulated: real data is a labelled reality check beside the simulation. No personal data is used.', size=11, color=INK3)

s = base('Phase 4 · Results', 'Live Demonstration: The Boardroom Cockpit', 'Present mode: one zero-scroll screen with the control score, six layers, the live impact chain and board statistics.', phase=4, who='ramkumar')
laptop(s, 'present.png', Inches(2.52), Inches(1.8), Inches(8.3))

# ══════════════════════════ PHASE 5 · RECOMMENDATIONS ══════════════════════════
divider(5, 'Recommendations', 'What should business, society and individuals do with these findings?', 'Business\nSociety\nIndividual')

def reco(title, who, lead, items, col, icon):
    s = base('Phase 5 · Recommendations', title, lead, phase=5, who=who)
    for k, (h_, b_, tag) in enumerate(items):
        y = Inches(1.95) + Inches(0.95) * k
        card(s, Inches(0.6), y, Inches(12.1), Inches(0.82))
        n = s.shapes.add_shape(MSO_SHAPE.OVAL, Inches(0.8), y + Inches(0.16), Inches(0.5), Inches(0.5)); n.fill.solid(); n.fill.fore_color.rgb = rgb(col); n.line.fill.background(); fill_text(n, str(k + 1), size=15, bold=True)
        text(s, Inches(1.5), y + Inches(0.1), Inches(7.6), Inches(0.68), [[(h_, True, NAVY)], [(b_, False, INK2)]], size=13, spacing=0.98)
        t = box(s, Inches(9.35), y + Inches(0.2), Inches(3.15), Inches(0.42), fill=TINT, radius=0.4); fill_text(t, tag, size=10, bold=True, color=col)
    return s

reco('For Business: Run Technology As A Control Plane', 'santosh', 'Five actions any enterprise can take, each tied to evidence from the framework.', [
    ('Steer by layer, not by dashboard', 'One score per layer, from baseline to target, with a named owner and a next decision.', 'Decisions in days: 21 → 6'),
    ('Fund the gap and the value at risk', 'Prioritise investment where layer gaps and value at risk are largest.', f'₹{atRisk} Cr visible at risk'),
    ('Retire end-of-life technology on a plan', 'Lifecycle debt is measurable and linked to incidents.', '12 of 20 past real EOL'),
    ('Govern AI with named deciders and drift limits', 'Register every model, monitor drift, restrict above the limit.', 'Restrict at PSI above 0.25'),
    ('Make every rupee traceable', 'Tag cloud and allocate spend to services and value.', 'Allocated 72% → 95%')], BLUE, 'business')
reco('For Society: Responsible And Sustainable Technology', 'suman', 'How the same discipline benefits citizens, customers and the planet.', [
    ('Responsible AI', 'Humans stay accountable: AI recommends, a named person decides, every step is audited.', 'Human in the loop'),
    ('Privacy by design', 'Consent, data lineage and breach clocks built in, aligned with the DPDP Act.', 'DPDP-ready'),
    ('Reliable digital services for inclusion', 'Stable payments and banking platforms protect access for every customer.', 'Fewer P1 outages'),
    ('Greener technology', 'Cut idle cloud and retire inefficient legacy to reduce energy and carbon.', 'Cloud waste 28% → 8%'),
    ('Open standards and transparency', 'Open billing standards and public datasets make claims verifiable.', 'FOCUS · public data')], '0e9f6e', 'society')
reco('For The Individual: Lead Like A Modern CTO', 'ramkumar', 'For CTOs, leaders and professionals building careers in AI-led transformation.', [
    ('Think in systems, not tools', 'Connect strategy, architecture, delivery, operations and risk into one story.', 'Systems thinking'),
    ('Measure outcomes, not activity', 'Baseline, target and glide path for every promise you make.', 'Outcome discipline'),
    ('Build T-shaped skills', 'Enterprise architecture, data, AI governance and finance basics.', 'EA · data · AI · finance'),
    ('Keep humans accountable for AI', 'Own the decision; let AI inform it, never make it alone.', 'Ethical leadership'),
    ('Speak the language of value', 'Translate technology into rupees, risk and time for the board.', '₹ · risk · time')], NAVY, 'individual')

# ══════════════════════════ PHASE 6 · CONCLUSION ══════════════════════════
divider(6, 'Conclusion', 'Did we answer the problem, what are the limits, and what comes next?', 'Answer\nLimitations\nNext steps')

s = base('Phase 6 · Conclusion', 'Our Answer: One Framework, Any Industry, Measured', phase=6, who='ramkumar')
cols = [('Problem', 'Enterprises cannot see, govern, fund and run AI-led transformation as one system.', NAVY),
        ('Solution', 'A domain-agnostic framework (TEDIF) implemented as CTO360: six control layers, decision intelligence, five owner workspaces. AI recommends, humans decide.', BLUE),
        ('Evidence', f'Control score {score}/100 with ₹{atRisk} Cr at risk made visible; r = {D["debt"]["r"]:.2f} between technical debt and incidents; patterns confirmed on 6 real datasets.', OK)]
for k, (h_, b_, col) in enumerate(cols):
    x = Inches(0.6) + Inches(4.1) * k
    card(s, x, Inches(1.5), Inches(3.9), Inches(2.4), top=col)
    text(s, x + Inches(0.22), Inches(1.78), Inches(3.5), Inches(0.4), h_, size=20, bold=True, color=col)
    text(s, x + Inches(0.22), Inches(2.3), Inches(3.5), Inches(1.55), b_, size=13, color=INK2)
card(s, Inches(0.6), Inches(4.1), Inches(4.6), Inches(2.7), title='Limitations', fill=TINT, line=TINT)
bullets(s, Inches(0.8), Inches(4.65), Inches(4.2), ['The enterprise is simulated; real data is used only as a reality check.', 'Decision rules are deterministic; no live AI model yet.', 'The value case is illustrative; we commit to the conservative case.'], size=12, gap=0.06)
text(s, Inches(5.5), Inches(4.15), Inches(7.2), Inches(0.35), 'Next Steps', size=15, bold=True, color=NAVY)
chevrons(s, ['Today|working framework', '6 to 12 months|live AI · real baselines · pilot', '2 to 3 years|scaled platform'], Inches(5.5), Inches(4.6), Inches(7.2), Inches(0.95), colors=[GREY, BLUE, NAVY], size=11)
vc = [('Conservative', '₹1 Cr', '~2% ROI · payback ~35 months', GREY), ('Base', '₹48.7 Cr', '~104% ROI · payback ~22 months', BLUE), ('Optimistic', '₹72.7 Cr', '~156% ROI · payback ~18 months', NAVY)]
for k, (n_, v_, d_, col) in enumerate(vc):
    x = Inches(5.5) + Inches(2.43) * k
    card(s, x, Inches(5.75), Inches(2.3), Inches(1.05))
    text(s, x + Inches(0.15), Inches(5.82), Inches(2.0), Inches(0.9), [[(f'{n_} · 3-yr net', False, INK3)], [(v_, True, col)], [(d_, False, INK3)]], size=10, spacing=0.95)

s = base('', '', dark=True)
g = s.shapes.add_shape(MSO_SHAPE.OVAL, Inches(7.8), Inches(-2.0), Inches(8.2), Inches(8.2)); g.fill.solid(); g.fill.fore_color.rgb = rgb(NAVY2); g.line.fill.background()
text(s, Inches(0.9), Inches(1.0), Inches(8), Inches(0.4), 'IN ONE LINE', size=14, bold=True, color='86b6ef')
text(s, Inches(0.9), Inches(1.55), Inches(10.5), Inches(1.8), ['One framework. Any industry.', 'Measured outcomes.'], size=44, bold=True, color='ffffff', spacing=0.95)
text(s, Inches(0.92), Inches(3.35), Inches(9), Inches(0.6), 'AI Recommends. Humans Decide.', size=28, bold=True, color='86b6ef')
for k, (key, name, role, *_ ) in enumerate(TEAM):
    x = Inches(0.95) + Inches(2.85) * k
    photo(s, key, x, Inches(4.55), Inches(0.95))
    text(s, x + Inches(1.1), Inches(4.7), Inches(1.75), Inches(0.35), name, size=14, bold=True, color='ffffff')
    text(s, x + Inches(1.1), Inches(5.05), Inches(1.75), Inches(0.5), role, size=10, color='9fb6d8')
text(s, Inches(0.92), Inches(6.2), Inches(6), Inches(0.5), 'Thank you · Questions?', size=24, bold=True, color='ffffff')
text(s, Inches(8.4), Inches(6.3), Inches(4.3), Inches(0.4), 'Live: cto360.vercel.app', size=16, color='c7d8f5', align=PP_ALIGN.RIGHT)

# ══════════════════════════ APPENDIX ══════════════════════════
s = base('Appendix A1', 'Anticipated Questions', 'Short, honest answers to the questions we expect from the panel.')
qa = [('Is this real data?', 'The enterprise is simulated and every score is calculated and checked. Beside it, six real public datasets act as labelled reality checks.'),
      ('Why not buy existing tools?', 'We connect them, not replace them. None correlates across tools into one prioritised decision with an owner and a measured outcome.'),
      ('Where is the AI?', 'Rule-based recommendations today, clearly labelled. Next step: a live AI model with retrieval on three decisions.'),
      ('How do you stop bad AI decisions?', 'AI only recommends; a named person decides at a gate, models are monitored for drift, and three lines of defence provide oversight.'),
      ('How does it work in a new industry?', 'By configuration, not rebuild. Retail was added by configuration only.'),
      ('What does it cost and pay back?', 'About ₹30.7 Cr to build; base payback around month 22. We commit to the conservative case; risk avoidance is upside.')]
for k, (q_, a_) in enumerate(qa):
    x = Inches(0.6) + Inches(6.1) * (k % 2); y = Inches(1.95) + Inches(1.58) * (k // 2)
    card(s, x, y, Inches(5.95), Inches(1.45))
    text(s, x + Inches(0.22), y + Inches(0.15), Inches(5.5), Inches(1.2), [[(q_, True, NAVY)], [(a_, False, INK2)]], size=12, spacing=1.0)

s = base('Appendix A2', 'Data Sources And Disclaimer', 'Every real dataset is credited; the enterprise and its organisations are fictional.')
srcs = [('endoflife.date', 'Free public API'), ('CISA Known Exploited Vulnerabilities', 'US Government, public'), ('Reserve Bank of India notifications', 'Public website'), ('Kaggle · ULB credit card fraud', 'ODbL 1.0'), ('UCI · incident management event log', 'CC BY 4.0'), ('FinOps Foundation · FOCUS sample', 'CC BY 4.0')]
tbl = s.shapes.add_table(len(srcs) + 1, 2, Inches(0.6), Inches(1.95), Inches(6.6), Inches(3.6)).table
tbl.columns[0].width = Inches(4.4); tbl.columns[1].width = Inches(2.2)
for j, h_ in enumerate(['Real dataset (snapshot 8 Oct 2026)', 'Licence']):
    c = tbl.cell(0, j); c.fill.solid(); c.fill.fore_color.rgb = rgb(NAVY); c.text = h_; r = c.text_frame.paragraphs[0].runs[0]; r.font.size = Pt(11); r.font.bold = True; r.font.color.rgb = rgb('ffffff'); r.font.name = FONT
for i, (a_, b_) in enumerate(srcs, start=1):
    for j, v_ in enumerate((a_, b_)):
        c = tbl.cell(i, j); c.fill.solid(); c.fill.fore_color.rgb = rgb('ffffff' if i % 2 else 'f8fafc'); c.text = v_; r = c.text_frame.paragraphs[0].runs[0]; r.font.size = Pt(11); r.font.name = FONT; r.font.color.rgb = rgb(INK2)
card(s, Inches(7.5), Inches(1.95), Inches(5.2), Inches(4.8), fill=TINT, line=TINT, title='Disclaimer')
bullets(s, Inches(7.7), Inches(2.55), Inches(4.8), ['An independent capstone demonstration built on synthetic, simulated data, with six credited public datasets as labelled reality checks.',
    'Meridian Bank, Arvant Industries and Orbit Retail, and all their figures, are illustrative.',
    'Third-party product names describe tool categories only; the project is not affiliated with or endorsed by those vendors.',
    'Financial figures are modelled estimates for discussion, not forecasts or advice.'], size=12, gap=0.1)

prs.save(OUT)
for f in ASSETS.glob('_photo_*.png'): f.unlink()
print(f'saved {OUT} · {len(prs.slides)} slides')
