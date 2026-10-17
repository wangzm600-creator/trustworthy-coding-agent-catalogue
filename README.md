# Trustworthy Coding Agents

[Study catalogue](https://wangzm600-creator.github.io/trustworthy-coding-agent-catalogue/)

The catalogue accompanies a survey of coding-agent trustworthiness. Search, filters, record details, and CSV downloads operate on the published data.

## Collections

- Primary studies: 342.
- Benchmarks and evaluation resources: 117.
- Related surveys: 32.
- Screened and background records are retained separately and do not enter primary-study counts.

## Data

`data/catalogue.json` supplies the website. `data/trustworthy_coding_agent_catalogue.xlsx` contains the primary studies, resources, related surveys, and classification audit. Collection CSVs and `data/classification_audit.csv` are also available. Date-stamped older workbooks are historical snapshots, not the current catalogue.

The eligibility cutoff is 30 September 2026. Primary-stage and property totals are recorded in `data/validation_summary.json`. Source-specific classification reasons are available in the audit, including cases in which adjacent categories are reasonable alternatives.

## Local preview

Run `python -m http.server 8000` from the repository root and open `http://localhost:8000/`. GitHub Pages publishes the static files from `main`, `/(root)`; no build step is required.
