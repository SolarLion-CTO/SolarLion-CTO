#!/usr/bin/env python3
"""Turn the downloaded real datasets (data/real/raw) into small JSON extracts the app reads (src/data/real)
and an Excel summary for the team (data/real/CTO360_Real_Data_Summary.xlsx).

Run from the project root:  python3 scripts/real-data/process_real_data.py
Fetch step (re-download sources) is documented in data/real/SOURCES.md.
"""
import html, json, math, re
from datetime import date, datetime
from pathlib import Path

import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parents[2]
RAW, OUT = ROOT / 'data/real/raw', ROOT / 'src/data/real'
OUT.mkdir(parents=True, exist_ok=True)
FETCHED = datetime.fromtimestamp((RAW / 'cisa_kev.json').stat().st_mtime).strftime('%Y-%m-%d')
TODAY = date.fromisoformat(FETCHED)

def save(name, obj):
    (OUT / f'{name}.json').write_text(json.dumps(obj, indent=1, ensure_ascii=False))
    print(f'  wrote src/data/real/{name}.json')

def psi(expected, actual, bins=10):
    """Population Stability Index with decile bins of the expected (baseline) sample."""
    qs = np.unique(np.quantile(expected, np.linspace(0, 1, bins + 1)))
    qs[0], qs[-1] = -np.inf, np.inf
    e = np.histogram(expected, qs)[0] / len(expected)
    a = np.histogram(actual, qs)[0] / len(actual)
    e, a = np.clip(e, 1e-4, None), np.clip(a, 1e-4, None)
    return float(np.sum((a - e) * np.log(a / e)))

# ── 1. endoflife.date: real lifecycle dates for technologies in the simulated estate ──
print('endoflife.date')
EOL_MAP = [  # simulated name, version → endoflife product, cycle
    ('Java', '8', 'oracle-jdk', '8'), ('Java', '21', 'oracle-jdk', '21'), ('MySQL', '5.7', 'mysql', '5.7'),
    ('Node.js', '16', 'nodejs', '16'), ('Node.js', '22', 'nodejs', '22'), ('Oracle Database', '12c', 'oracle-database', '12.2'),
    ('Oracle Database', '19c', 'oracle-database', '19'), ('PostgreSQL', '15', 'postgresql', '15'), ('PostgreSQL', '16', 'postgresql', '16'),
    ('Red Hat Enterprise Linux', '7', 'rhel', '7'), ('Red Hat Enterprise Linux', '9', 'rhel', '9'), ('Redis', '7.2', 'redis', '7.2'),
    ('Apache Kafka', '3.7', 'apache-kafka', '3.7'), ('Kubernetes (edge)', '1.30', 'kubernetes', '1.30'), ('Kubernetes (managed)', '1.31', 'amazon-eks', '1.31'),
    ('Kong API Gateway', '3.6', 'kong-gateway', '3.6'), ('Windows Server', '2012 R2', 'windows-server', '2012-r2'),
    ('Windows 10 (POS terminals)', '21H2', 'windows', '10-21h2-e'), ('Windows 10 IoT LTSC', '2021', 'windows', '10-21h2-iot-lts'),
    ('Windows 7 Embedded (HMI)', 'SP1', 'windows-embedded', 'standard-7-sp1'),
]
sim_eol = {}
for f in (ROOT / 'src/data/sim/domains').glob('*.ts'):
    for n, v, _vendor, e in re.findall(r"\['([^']+)', '([^']+)', '([^']+)', (null|'[^']+')\]", f.read_text()):
        sim_eol[(n, v)] = None if e == 'null' else e.strip("'")
rows = []
for n, v, prod, cyc in EOL_MAP:
    p = RAW / 'endoflife' / f'{prod}.json'
    data = json.loads(p.read_text()) if p.exists() and p.read_text().startswith('[') else []
    c = next((x for x in data if str(x.get('cycle')) == cyc), None)
    if not c:
        print(f'  ! no cycle {prod} {cyc}'); continue
    pick = lambda k: c.get(k) if isinstance(c.get(k), str) else None
    real = pick('eol') or (None if c.get('eol') is False else None)
    ext = pick('extendedSupport')
    days = (date.fromisoformat(real) - TODAY).days if real else None
    status = 'End of life' if days is not None and days < 0 else 'Ends within 12 months' if days is not None and days <= 365 else 'Supported'
    simd = sim_eol.get((n, v))
    rows.append({'name': n, 'version': v, 'product': prod, 'cycle': cyc, 'realEol': real, 'extendedSupport': ext, 'daysToEol': days,
                 'status': status, 'simEol': simd, 'diffDays': (date.fromisoformat(real) - date.fromisoformat(simd)).days if real and simd else None,
                 'url': f'https://endoflife.date/{prod}'})
save('eol', {'source': 'endoflife.date', 'fetched': FETCHED, 'rows': rows})

# ── 2. CISA Known Exploited Vulnerabilities ──
print('CISA KEV')
kev = json.loads((RAW / 'cisa_kev.json').read_text())
v = pd.DataFrame(kev['vulnerabilities']); v['dateAdded'] = pd.to_datetime(v['dateAdded'])
last = v['dateAdded'].max()
our_vendors = ['Microsoft', 'Oracle', 'IBM', 'Red Hat', 'Apache', 'Kubernetes', 'SAP', 'Redis', 'Node.js', 'PostgreSQL', 'MySQL', 'Kong']
mask = lambda name: v['vendorProject'].str.contains(name, case=False, na=False)
save('kev', {
    'source': 'CISA Known Exploited Vulnerabilities catalog', 'catalogVersion': kev.get('catalogVersion'), 'released': kev.get('dateReleased', '')[:10], 'fetched': FETCHED,
    'total': int(len(v)), 'last30': int((v['dateAdded'] > last - pd.Timedelta(days=30)).sum()), 'last90': int((v['dateAdded'] > last - pd.Timedelta(days=90)).sum()),
    'ransomware': int((v['knownRansomwareCampaignUse'] == 'Known').sum()),
    'topVendors': [{'vendor': k, 'count': int(c)} for k, c in v['vendorProject'].value_counts().head(10).items()],
    'ourStack': [{'vendor': n, 'count': int(mask(n).sum()), 'last90': int((mask(n) & (v['dateAdded'] > last - pd.Timedelta(days=90))).sum())} for n in our_vendors if mask(n).sum()],
    'latest': [{'cve': r.cveID, 'vendor': r.vendorProject, 'product': r.product, 'name': r.vulnerabilityName, 'added': r.dateAdded.strftime('%Y-%m-%d'),
                'due': r.dueDate, 'ransomware': r.knownRansomwareCampaignUse == 'Known'} for r in v.sort_values('dateAdded', ascending=False).head(12).itertuples()],
})

# ── 3. RBI notifications (real circulars) ──
print('RBI notifications')
s = (RAW / 'rbi_notifications.html').read_text(encoding='utf-8', errors='ignore')
items, cur = [], None
for m in re.finditer(r"class=\"tableheader\"[^>]*><b>([A-Z][a-z]{2} \d{2}, \d{4})</b>|<a class='link2' href=(NotificationUser\.aspx\?Id=(\d+)&Mode=0) >(.*?)</a>(?:.*?href=\"(https://rbidocs[^\"]+\.PDF)\")?", s, re.S):
    if m.group(1): cur = datetime.strptime(m.group(1), '%b %d, %Y').strftime('%Y-%m-%d'); continue
    title = re.sub(r'\s+', ' ', html.unescape(m.group(4))).strip()
    items.append({'id': int(m.group(3)), 'date': cur, 'title': title, 'url': f'https://rbi.org.in/Scripts/{m.group(2).replace("&", "&")}', 'pdf': m.group(5)})
THEMES = [('Technology, cyber & data', r'cyber|information technology|\bIT\b|digital|outsourc|\bdata\b|cloud|fraud'),
          ('Regulatory returns & reporting', r'\breturn\b|CIMS|Sankalan|XBRL|reporting'),
          ('Capital & prudential', r'capital|prudential|liquidity|exposure|provision|Basel|leverage|CRR|SLR'),
          ('KYC, AML & sanctions', r'KYC|money laundering|AML|customer due|UAPA|terroris|sanction|UNSC'),
          ('Payments', r'payment system|UPI|card|PPI|NEFT|RTGS|settlement|payment and'),
          ('Ownership & governance', r'shares or voting|shareholding|board|governance'),
          ('Currency & cash operations', r'currency|ATM|note sorting|cassette|coin'),
          ('Lending & credit', r'lending|loan|credit|interest rate|priority sector'), ('Customer protection', r'customer|grievance|ombudsman|charges'),
          ('Foreign exchange', r'foreign|FEMA|ECB|export|import|remittance|Non-Resident')]
for it in items:
    it['theme'] = next((t for t, rx in THEMES if re.search(rx, it['title'], re.I)), 'Other regulation')
    it['ctoRelevant'] = it['theme'] in ('Technology, cyber & data', 'Payments', 'Regulatory returns & reporting', 'KYC, AML & sanctions') or bool(re.search(r'system|platform|report|return|XBRL|automat', it['title'], re.I))
themes = pd.Series([i['theme'] for i in items]).value_counts()
save('rbi', {'source': 'Reserve Bank of India · Notifications', 'url': 'https://rbi.org.in/Scripts/NotificationUser.aspx', 'fetched': FETCHED, 'count': len(items),
             'from': min(i['date'] for i in items), 'to': max(i['date'] for i in items), 'themes': [{'theme': k, 'count': int(c)} for k, c in themes.items()], 'items': items[:40]})

# ── 4. UCI incident management event log (real ServiceNow instance, anonymised) ──
print('UCI incident log')
inc = pd.read_csv(RAW / 'uci_incident/incident_event_log.csv', na_values=['?'], low_memory=False)
inc['opened'] = pd.to_datetime(inc['opened_at'], format='%d/%m/%Y %H:%M', errors='coerce')
inc['resolved'] = pd.to_datetime(inc['resolved_at'], format='%d/%m/%Y %H:%M', errors='coerce')
last_ev = inc.sort_values('sys_mod_count').groupby('number').tail(1)
res = last_ev.dropna(subset=['opened', 'resolved']).copy()
res['hours'] = (res['resolved'] - res['opened']).dt.total_seconds() / 3600
res = res[res['hours'] >= 0]
cat = last_ev['category'].value_counts(); top = cat.head(8); cum = (top.cumsum() / cat.sum() * 100).round(1)
prio = res.groupby('priority')['hours'].median().round(1)
save('incidents', {
    'source': 'UCI ML Repository · Incident management process enriched event log (Amaral et al., 2018)', 'url': 'https://archive.ics.uci.edu/dataset/498/incident+management+process+enriched+event+log',
    'fetched': FETCHED, 'events': int(len(inc)), 'incidents': int(len(last_ev)),
    'period': [last_ev['opened'].min().strftime('%Y-%m-%d'), last_ev['opened'].max().strftime('%Y-%m-%d')],
    'categories': int(cat.size), 'pareto': [{'category': k.replace('Category ', 'Cat '), 'count': int(c), 'cumPct': float(cum[k])} for k, c in top.items()],
    'top8SharePct': float(cum.iloc[-1]), 'top20pctCatsSharePct': round(float(cat.head(max(1, math.ceil(cat.size * 0.2))).sum() / cat.sum() * 100), 1),
    'medianResolveHoursByPriority': [{'priority': k, 'hours': float(h), 'count': int((res['priority'] == k).sum())} for k, h in prio.items()],
    'medianResolveHours': round(float(res['hours'].median()), 1), 'slaMetPct': round(float((last_ev['made_sla'] == True).mean() * 100), 1),
    'reopenedPct': round(float((last_ev['reopen_count'] > 0).mean() * 100), 1), 'avgReassignments': round(float(last_ev['reassignment_count'].mean()), 2),
    'linkedToProblemPct': round(float(last_ev['problem_id'].notna().mean() * 100), 1),
})

# ── 5. Credit card fraud (real, PCA-anonymised) → real PSI drift ──
print('Credit card fraud')
cc = pd.read_csv(RAW / 'creditcard/creditcard.csv')
d1, d2 = cc[cc['Time'] < 86400], cc[cc['Time'] >= 86400]
feats = ['Amount', 'V14', 'V17', 'V12', 'V10', 'V4']
psis = [{'feature': f, 'psi': round(psi(d1[f].values, d2[f].values), 4)} for f in feats]
# Stress case: day-1 baseline vs the fraud-heavy hours (what the model sees during an attack wave)
hour = (cc['Time'] // 3600).astype(int); hr = cc.groupby(hour)['Class'].mean()
attack_hours = hr.sort_values(ascending=False).head(3).index.tolist()
attack = cc[hour.isin(attack_hours)]
save('fraud', {
    'source': 'Kaggle · Credit Card Fraud Detection (ULB Machine Learning Group)', 'url': 'https://www.kaggle.com/datasets/mlg-ulb/creditcardfraud', 'licence': 'ODbL 1.0',
    'fetched': FETCHED, 'transactions': int(len(cc)), 'frauds': int(cc['Class'].sum()), 'fraudRatePct': round(float(cc['Class'].mean() * 100), 3),
    'day1': {'n': int(len(d1)), 'fraudRatePct': round(float(d1['Class'].mean() * 100), 3)}, 'day2': {'n': int(len(d2)), 'fraudRatePct': round(float(d2['Class'].mean() * 100), 3)},
    'psiDay1vsDay2': psis, 'maxPsiDay2': max(p['psi'] for p in psis),
    'attackHours': attack_hours, 'attackFraudRatePct': round(float(attack['Class'].mean() * 100), 2),
    'psiAttackV14': round(psi(d1['V14'].values, attack['V14'].values), 3), 'psiAttackAmount': round(psi(d1['Amount'].values, attack['Amount'].values), 3),
    'hourlyFraudRatePct': [round(float(x * 100), 3) for x in hr.values],
})

# ── 6. FOCUS sample cloud billing (anonymised real AWS / Google / Microsoft / Oracle) ──
print('FOCUS cloud billing')
fo = pd.read_csv(RAW / 'focus_sample_100000.csv.gz', low_memory=False, na_values=['NULL'])
for c in ['BilledCost', 'EffectiveCost', 'ListCost']: fo[c] = pd.to_numeric(fo[c], errors='coerce').fillna(0)
fo = fo[(fo['ChargeCategory'] == 'Usage') & (fo['EffectiveCost'] > 0)]  # usage charges only (credits and adjustments excluded)
tags = fo['Tags'].fillna('').apply(lambda t: json.loads(t) if t.strip().startswith('{') else {})
fo['bu'] = tags.apply(lambda t: t.get('business_unit')); fo['env'] = tags.apply(lambda t: t.get('environment')); fo['app'] = tags.apply(lambda t: t.get('application'))
tot = fo['EffectiveCost'].sum()
alloc = fo.loc[fo['bu'].notna() & fo['app'].notna(), 'EffectiveCost'].sum()
commit = fo.loc[fo['CommitmentDiscountId'].notna(), 'EffectiveCost'].sum()
lst = fo['ListCost'].sum()
save('focus', {
    'source': 'FinOps Foundation · FOCUS 1.0 sample data (anonymised real billing, 100k-row sample, usage charges)', 'url': 'https://github.com/FinOps-Open-Cost-and-Usage-Spec/FOCUS-Sample-Data', 'licence': 'CC BY 4.0',
    'fetched': FETCHED, 'rows': int(len(fo)), 'currency': 'USD', 'effectiveCost': round(float(tot), 2), 'listCost': round(float(lst), 2),
    'savingsVsListPct': round(float((1 - tot / lst) * 100), 1) if lst else None,
    'allocatedPct': round(float(alloc / tot * 100), 1) if tot else None, 'commitmentCoveredPct': round(float(commit / tot * 100), 1) if tot else None,
    'byProvider': [{'name': k, 'cost': round(float(c), 2)} for k, c in fo.groupby('ProviderName')['EffectiveCost'].sum().sort_values(ascending=False).items()],
    'byCategory': [{'name': k, 'cost': round(float(c), 2)} for k, c in fo.groupby('ServiceCategory')['EffectiveCost'].sum().sort_values(ascending=False).head(8).items()],
    'byEnvironment': [{'name': k, 'cost': round(float(c), 2)} for k, c in fo.groupby(fo['env'].fillna('Untagged'))['EffectiveCost'].sum().sort_values(ascending=False).items()],
    'topServices': [{'name': k, 'cost': round(float(c), 2)} for k, c in fo.groupby('ServiceName')['EffectiveCost'].sum().sort_values(ascending=False).head(8).items()],
})

# ── Excel summary for the team ──
print('Excel summary')
J = {n: json.loads((OUT / f'{n}.json').read_text()) for n in ['eol', 'kev', 'rbi', 'incidents', 'fraud', 'focus']}
xlsx = ROOT / 'data/real/CTO360_Real_Data_Summary.xlsx'
with pd.ExcelWriter(xlsx, engine='openpyxl') as w:
    pd.DataFrame([
        ['Ram · Enterprise Architecture', 'endoflife.date', J['eol']['fetched'], f"{sum(r['status'] == 'End of life' for r in J['eol']['rows'])} of {len(J['eol']['rows'])} matched technologies are past real end of life", 'https://endoflife.date', 'Free API'],
        ['Vaibhav · Regulatory change', 'RBI Notifications', J['rbi']['fetched'], f"{J['rbi']['count']} real notifications {J['rbi']['from']} to {J['rbi']['to']}", J['rbi']['url'], 'Public RBI website'],
        ['Vaibhav · AI model register', 'Kaggle credit card fraud', J['fraud']['fetched'], f"Fraud rate {J['fraud']['fraudRatePct']}%; PSI day 1 vs day 2 max {J['fraud']['maxPsiDay2']}; attack-hours PSI (V14) {J['fraud']['psiAttackV14']}", J['fraud']['url'], 'ODbL 1.0'],
        ['Pankaj · ERP RCA', 'UCI incident event log', J['incidents']['fetched'], f"{J['incidents']['incidents']:,} incidents; top 8 categories = {J['incidents']['top8SharePct']}%; median resolve {J['incidents']['medianResolveHours']} h", J['incidents']['url'], 'CC BY 4.0'],
        ['Santhosh · FinOps / TBM', 'FOCUS sample billing', J['focus']['fetched'], f"{J['focus']['allocatedPct']}% of cost fully tagged (allocatable); {J['focus']['commitmentCoveredPct']}% under commitment discounts", J['focus']['url'], 'CC BY 4.0'],
        ['Vanta · Security risk', 'CISA KEV', J['kev']['fetched'], f"{J['kev']['total']:,} exploited CVEs; {J['kev']['last90']} added in 90 days; {J['kev']['ransomware']} used by ransomware", 'https://www.cisa.gov/known-exploited-vulnerabilities-catalog', 'Public domain (US Gov)'],
    ], columns=['Owner · area', 'Source', 'Fetched', 'Headline (real data)', 'Link', 'Licence']).to_excel(w, sheet_name='Summary', index=False)
    pd.DataFrame(J['eol']['rows']).to_excel(w, sheet_name='End of life', index=False)
    pd.DataFrame(J['rbi']['items']).to_excel(w, sheet_name='RBI circulars', index=False)
    pd.DataFrame(J['incidents']['pareto']).to_excel(w, sheet_name='Incident Pareto', index=False)
    pd.DataFrame(J['incidents']['medianResolveHoursByPriority']).to_excel(w, sheet_name='Resolve by priority', index=False)
    pd.DataFrame(J['fraud']['psiDay1vsDay2']).to_excel(w, sheet_name='Fraud PSI', index=False)
    pd.DataFrame(J['focus']['byCategory']).to_excel(w, sheet_name='Cloud by category', index=False)
    pd.DataFrame(J['kev']['latest']).to_excel(w, sheet_name='KEV latest', index=False)
    for ws in w.book.worksheets:
        for col in ws.columns:
            ws.column_dimensions[col[0].column_letter].width = min(70, max(10, max(len(str(c.value or '')) for c in col) + 2))
print(f'  wrote {xlsx.relative_to(ROOT)}')
