# CTO360: real data sources

The simulation stays synthetic. Six public datasets sit next to it as **"Reality check"** panels. Each panel is labelled **REAL DATA**, with its source, licence and fetch date.

- **Snapshot fetched:** 8 Oct 2026.
- **Effect on the simulation:** none. Real data does **not** change simulated scores, statuses or the golden thread.

## Folder layout

| Path | Contents | In git? |
|---|---|---|
| `data/real/raw/` | Original downloads (about 274 MB) | No (git-ignored; re-fetch below) |
| `src/data/real/*.json` | Small processed extracts the app imports (about 25 KB) | Yes |
| `data/real/CTO360_Real_Data_Summary.xlsx` | One summary sheet plus a detail sheet per dataset, for the team and the deck | Yes |
| `scripts/real-data/process_real_data.py` | Turns `raw/` into the JSON files and the Excel workbook | Yes |

## Sources

| # | Dataset | Link | Licence | Used in CTO360 | Headline (8 Oct 2026 snapshot) |
|---|---|---|---|---|---|
| 1 | **endoflife.date** API | https://endoflife.date | Free public API | LeanIX → Technology lifecycle (each business unit) | 20 simulated technology versions matched. 12 are past real end of life. The simulation is more optimistic than reality for 6 (Oracle DB 12c, Kafka 3.7, Kubernetes 1.30 / 1.31, Kong 3.6, Windows 10 21H2). |
| 2 | **CISA Known Exploited Vulnerabilities** | https://www.cisa.gov/known-exploited-vulnerabilities-catalog | US Government, public | Vanta → Cyber | 1,734 exploited CVEs; 103 added in 90 days; 361 used by ransomware. Microsoft 389, Oracle 46. |
| 3 | **Reserve Bank of India notifications** | https://rbi.org.in/Scripts/NotificationUser.aspx | Public website (titles, dates and links only) | Vaibhav → Regulatory change | 22 notifications, 23 Sep to 7 Oct 2026 (about 11 a week), grouped into 8 keyword themes |
| 4 | **Kaggle · ULB Credit Card Fraud Detection** | https://www.kaggle.com/datasets/mlg-ulb/creditcardfraud | ODbL 1.0 | Vaibhav → AI model register | 284,807 transactions, 0.173% fraud. PSI from day 1 to day 2 peaks at 0.19 (stable or watch). PSI in attack hours (feature V14) is 2.42, which is drift. |
| 5 | **UCI · Incident management process enriched event log** (Amaral et al., 2018) | https://archive.ics.uci.edu/dataset/498 | CC BY 4.0 | Pankaj → ERP RCA | 24,918 real ServiceNow incidents (2016–17). The top 20% of categories account for 79.2% of incidents. SLA met 63.4%. Only 1.5% are linked to a problem record. |
| 6 | **FinOps Foundation · FOCUS 1.0 sample** (anonymised real billing) | https://github.com/FinOps-Open-Cost-and-Usage-Spec/FOCUS-Sample-Data | CC BY 4.0 | Santhosh → FinOps & licences | 4,143 usage lines (AWS, Microsoft, Oracle). 62.7% of cost is fully tagged and allocatable. 1.3% is covered by commitment discounts. |

## Re-fetch and re-process (from the project root)

```bash
mkdir -p data/real/raw/endoflife && cd data/real/raw
curl -sLo cisa_kev.json https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json
curl -sLo rbi_notifications.html https://rbi.org.in/Scripts/NotificationUser.aspx
curl -sLo creditcardfraud.zip https://www.kaggle.com/api/v1/datasets/download/mlg-ulb/creditcardfraud && unzip -oq creditcardfraud.zip -d creditcard
curl -sLo uci_incident.zip "https://archive.ics.uci.edu/static/public/498/incident+management+process+enriched+event+log.zip" && unzip -oq uci_incident.zip -d uci_incident
curl -sLo focus_sample_100000.csv.gz https://raw.githubusercontent.com/FinOps-Open-Cost-and-Usage-Spec/FOCUS-Sample-Data/main/FOCUS-1.0/focus_sample_100000.csv.gz
for p in oracle-jdk mysql nodejs oracle-database postgresql rhel redis apache-kafka kubernetes amazon-eks kong-gateway windows windows-server windows-embedded; do curl -s -o endoflife/$p.json https://endoflife.date/api/$p.json; done
cd ../../.. && python3 scripts/real-data/process_real_data.py && npm run build
```

The script needs Python 3 with `pandas`, `numpy` and `openpyxl`.

## Method notes

- **End-of-life dates:** "Real EOL" is the vendor's standard-support end date. Where the simulated date equals the paid extended-support date (Java 8 and Java 21), the panel says so and does not count it as optimistic.
- **RBI themes:** assigned by a keyword classifier (see `THEMES` in the script). Only titles, dates and links are used; documents stay on rbi.org.in.
- **PSI:** decile bins taken from the baseline sample. Bands: below 0.10 stable, 0.10–0.25 watch, above 0.25 drift. "Attack hours" are the 3 hours with the highest fraud rate. Features V1–V28 are PCA-anonymised by the data provider.
- **Incident log:** the last state of each incident number is used. Resolution time is resolved minus opened, with negative values dropped. Categories are anonymised by the data provider.
- **FOCUS:** only usage charges with a positive effective cost are counted (credits and adjustments are excluded). "Allocatable" means tagged with both `business_unit` and `application`. The sample is anonymised, so amounts are small; read the shares, not the totals.
- **No personal data** is used anywhere. All datasets are public, aggregated, or anonymised by their publishers.
